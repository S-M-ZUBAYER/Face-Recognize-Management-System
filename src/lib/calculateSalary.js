import calculateHourlySalary from "./calculateSalary/calculateHourlySalary";
import calculateLeaveDeductions from "./calculateSalary/calculateLeaveDeductions";
import { calculateRangeSalary } from "./calculateRangeSalary";
import calculateWorkedTime from "./calculateSalary/calculateWorkedTime";
import countWorkingMissPunch from "./calculateSalary/countWorkingMissPunch";
import { getFullDayLeaveDates } from "./calculateSalary/getFullDayLeaveDates";
import punchAndShiftDetails from "./punchAndShiftDetails";

function toMinutes(time) {
  if (!time && time !== 0) return 0;
  if (typeof time === "number") return Math.round(time);
  const [h = 0, m = 0] = String(time)
    .split(":")
    .map((v) => Number(v || 0));
  return (h || 0) * 60 + (m || 0);
}

function toHours(mins) {
  return mins / 60;
}

function normalizeDate(dateStr) {
  if (!dateStr) return "";
  if (typeof dateStr === "string" && dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  return String(dateStr).slice(0, 10);
}

function tryParseMaybeString(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return [];
    try {
      const p = JSON.parse(trimmed);
      return p;
    } catch {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return val || [];
}

function getParamKeys(rule) {
  return Object.keys(rule)
    .filter((k) => /^param\d+$/.test(k))
    .sort((a, b) => {
      const ai = Number(a.replace("param", ""));
      const bi = Number(b.replace("param", ""));
      return ai - bi;
    });
}

function getParamsArray(rule) {
  if (!rule) return [];
  const keys = getParamKeys(rule);
  return keys.map((k) => (k in rule ? rule[k] : null));
}

function firstNumericParam(rule) {
  const params = getParamsArray(rule);
  for (const v of params) {
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
      return v;
    }
  }
  return null;
}

function secondNumericParam(rule) {
  const params = getParamsArray(rule);
  let count = 0;

  for (const v of params) {
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        count++;
        if (count === 2) return n;
      }
    }
  }

  return null;
}

function firstNonEmptyParam(rule) {
  const params = getParamsArray(rule);
  for (const v of params) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return null;
}

function getRuleByNumber(rules, ruleNumber) {
  if (!Array.isArray(rules)) return null;
  const id = String(ruleNumber - 1);
  return (
    rules.find((r) => String(r.ruleId) === id && Number(r.ruleStatus) === 1) ||
    null
  );
}

function roundOvertime(minutes, minUnit) {
  const unit = Number(minUnit || 0);
  if (!unit) return minutes;
  if (minutes <= 0) return 0;

  const rem = minutes % unit;
  return minutes - rem; // round down
}

// function getLeaveForDate(leavesArray, targetDate) {
//   if (!Array.isArray(leavesArray)) return null;

//   const normalizedTarget = normalizeDate(targetDate);
//   return leavesArray.find((leave) => {
//     if (leave && leave.date && leave.date.date) {
//       return normalizeDate(leave.date.date) === normalizedTarget;
//     }
//     return false;
//   });
// }

function parseOtherSalary(otherSalary) {
  let checkedTotal = 0;
  let uncheckedTotal = 0;

  if (!otherSalary) {
    return { checkedTotal: 0, uncheckedTotal: 0 };
  }

  // Handle number type - consider it as checked
  if (typeof otherSalary === "number") {
    return { checkedTotal: otherSalary, uncheckedTotal: 0 };
  }

  // Handle string type - consider it as checked
  if (typeof otherSalary === "string") {
    if (otherSalary.trim() === "") {
      return { checkedTotal: 0, uncheckedTotal: 0 };
    }
    const num = Number(otherSalary.replace(/[^0-9.-]/g, ""));
    const value = isNaN(num) ? 0 : num;
    return { checkedTotal: value, uncheckedTotal: 0 };
  }

  // Handle array of objects
  if (Array.isArray(otherSalary)) {
    otherSalary.forEach((item) => {
      if (item && typeof item === "object" && item.amount !== undefined) {
        const amount = item.amount;
        let amountValue = 0;

        if (typeof amount === "number") {
          amountValue = amount;
        } else if (typeof amount === "string") {
          const num = Number(amount.replace(/[^0-9.-]/g, ""));
          amountValue = isNaN(num) ? 0 : num;
        }

        if (item.isChecked === true) {
          checkedTotal += amountValue;
        } else {
          uncheckedTotal += amountValue;
        }
      }
    });

    return { checkedTotal, uncheckedTotal };
  }

  // Handle single object
  if (typeof otherSalary === "object" && otherSalary.amount !== undefined) {
    const amount = otherSalary.amount;
    let amountValue = 0;

    if (typeof amount === "number") {
      amountValue = amount;
    } else if (typeof amount === "string") {
      const num = Number(amount.replace(/[^0-9.-]/g, ""));
      amountValue = isNaN(num) ? 0 : num;
    }

    if (otherSalary.isChecked === true) {
      checkedTotal = amountValue;
    } else {
      uncheckedTotal = amountValue;
    }

    return { checkedTotal, uncheckedTotal };
  }

  return { checkedTotal: 0, uncheckedTotal: 0 };
}

function getWorkingDaysInMonth(
  year,
  month,
  weekendDayNames,
  holidaysSet,
  generalDaysSet,
  replaceDaysSet,
  fullDayLeaveDates
) {
  let workingDays = 0;
  let thisMonthLeave = 0;
  let thisMonthHolidays = 0;
  let thisMonthWeekends = 0;
  const weekends = Array.from(weekendDayNames);
  // Fixed month indexing - months are 0-based in JavaScript Date
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Check if it's a full day leave - skip this day
    if (fullDayLeaveDates.includes(dateStr)) {
      thisMonthLeave++;
      continue;
    }

    // Check replacement days first (these override everything)
    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check holidays
    if (holidaysSet.has(dateStr)) {
      thisMonthHolidays++;
      continue;
    }

    // Check general working days
    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check weekends
    if (weekends.includes(dayName)) {
      thisMonthWeekends++;
      continue;
    }

    // Normal working day
    workingDays++;
  }

  return { workingDays, thisMonthLeave, thisMonthHolidays, thisMonthWeekends };
}

function getWorkingDaysUpToDate(
  year,
  month,
  currentDay,
  weekendDayNames,
  holidaysSet,
  generalDaysSet,
  replaceDaysSet,
  fullDayLeaveDates // Add this parameter
  // id
) {
  let workingDays = 0;
  let thisMonthLeave = 0;
  let thisMonthHolidays = 0;
  let thisMonthWeekends = 0;
  let futureAbsent = 0;
  const weekends = Array.from(weekendDayNames);

  const monthDays = new Date(year, month, 0).getDate();

  for (let d = currentDay + 1; d <= monthDays; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    if (weekends.includes(dayName)) {
      continue;
    }

    // Check holidays
    if (holidaysSet.has(dateStr)) {
      continue;
    }
    futureAbsent++;
  }

  for (let d = 1; d <= currentDay; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Check if it's a full day leave - skip this day
    if (fullDayLeaveDates.includes(dateStr)) {
      thisMonthLeave++;
      continue;
    }
    // if (id === "70709903") {
    //   console.log(
    //     fullDayLeaveDates,
    //     fullDayLeaveDates.includes(dateStr),
    //     dateStr
    //   );
    // }

    // Check replacement days first (these override everything)
    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check holidays
    if (holidaysSet.has(dateStr)) {
      thisMonthHolidays++;
      continue;
    }

    // Check general working days
    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check weekends
    if (weekends.includes(dayName)) {
      thisMonthWeekends++;
      continue;
    }

    // if (id === "2109058927") {
    //   console.log(dateStr, workingDays);
    // }
    // Normal working day
    workingDays++;
  }

  return {
    workingDays,
    thisMonthLeave,
    thisMonthHolidays,
    thisMonthWeekends,
    futureAbsent,
  };
}

function identifyShiftType(shifts) {
  // If not array or empty array
  if (!Array.isArray(shifts) || shifts.length === 0) {
    return "No Shift";
  }

  const firstShift = shifts[0];

  if (!firstShift.start || !firstShift.end) {
    return "No Shift";
  }

  const [startHour, startMin] = firstShift.start.split(":").map(Number);
  const [endHour, endMin] = firstShift.end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes <= startMinutes ? "Night Shift" : "Day Shift";
}
// Helper function to check if date exists in latePunchDocuments
function isDateInLatePunchDocuments(latePunchDocuments, date) {
  if (!latePunchDocuments || latePunchDocuments.length === 0) return false;

  const targetDateStr = new Date(date).toISOString().split("T")[0];

  return latePunchDocuments.some((doc) => {
    const docDateStr = doc.date.split("T")[0];
    return docDateStr === targetDateStr;
  });
}

// Helper function to get startTime from latePunchDocuments for a specific date
function getStartTimeFromLateDoc(latePunchDocuments, date) {
  if (!latePunchDocuments || latePunchDocuments.length === 0) return null;

  return (
    latePunchDocuments.find((doc) => doc.date.split("T")[0] === date)
      ?.startTime || null
  );
}

// Helper function to check if punch time is near approved start time
function isPunchNearApprovedTime(
  punchTime,
  approvedStartTime,
  toleranceMinutes = 60
) {
  if (!punchTime || !approvedStartTime) return false;

  const punchMins = toMinutes(punchTime);
  const approvedMins = toMinutes(approvedStartTime);

  return Math.abs(punchMins - approvedMins) <= toleranceMinutes;
}

export function calculateSalary(attendanceRecords, payPeriod, salaryRules, id) {
  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    // attendanceRecords.push(
    //   {
    //     empId: "21290499",
    //     macId: "71_b2_d5_b8_0f_e1",
    //     date: "2025-11-09",
    //     checkIn: '["08:08","14:30"]',
    //     lunchTimeCheckIn: null,
    //     lunchTimeCheckOut: null,
    //     checkOut: null,
    //     status: "synced",
    //   },
    //   {
    //     empId: "21290499",
    //     macId: "71_b2_d5_b8_0f_e1",
    //     date: "2025-11-02",
    //     checkIn: '["07:56","18:54"]',
    //     lunchTimeCheckIn: null,
    //     lunchTimeCheckOut: null,
    //     checkOut: null,
    //     status: "synced",
    //   }
    // );
    return;
  }

  if (payPeriod.payPeriod === "hourly") {
    return calculateHourlySalary(attendanceRecords, salaryRules, payPeriod);
  }
  if (
    payPeriod.payPeriod === "weekly" ||
    payPeriod.payPeriod === "biWeekly" ||
    payPeriod.payPeriod === "semiMonthly" ||
    payPeriod.payPeriod === "monthly"
  ) {
    let startDate = undefined;
    let endDate = undefined;
    return calculateRangeSalary(payPeriod, salaryRules, startDate, endDate, id);
  }
  // if (id === "7070969796") {
  //   console.log(attendanceRecords);
  // }

  const rulesArr = Array.isArray(salaryRules.rules)
    ? salaryRules.rules
    : tryParseMaybeString(salaryRules.rules);

  const filteredRules = rulesArr.filter((r) => r.ruleId !== "24");

  const holidaysArr = Array.isArray(salaryRules.holidays)
    ? salaryRules.holidays
    : tryParseMaybeString(salaryRules.holidays);
  const generalDaysArr = Array.isArray(salaryRules.generalDays)
    ? salaryRules.generalDays
    : tryParseMaybeString(salaryRules.generalDays);
  const replaceDaysArr = Array.isArray(salaryRules.replaceDays)
    ? salaryRules.replaceDays
    : tryParseMaybeString(salaryRules.replaceDays);

  const holidaysSet = new Set(
    (holidaysArr || []).map(normalizeDate).filter(Boolean)
  );
  const replaceDaysSet = new Set(
    (replaceDaysArr || []).map(normalizeDate).filter(Boolean)
  );
  const generalDaysSet = new Set(
    (generalDaysArr || []).map(normalizeDate).filter(Boolean)
  );

  const weekendDayNames = new Set();
  const allRule3s = filteredRules.filter(
    (r) => String(r.ruleId) === String(3 - 1) && Number(r.ruleStatus) === 1
  );
  allRule3s.forEach((r) => {
    const params = getParamsArray(r);
    params.forEach((p) => {
      if (p && String(p).trim()) {
        weekendDayNames.add(String(p).trim());
      }
    });
  });

  const getRule = (n) => getRuleByNumber(filteredRules, n);

  const rule5 = getRule(5);
  let latenessGraceMin = 0;

  if (rule5 && rule5.param1 != null) {
    const value = String(rule5.param1).trim();

    // Accept only pure numbers (integer)
    const isPureNumber = /^[0-9]+$/.test(value);

    if (isPureNumber) {
      latenessGraceMin = Number(value);
    }
  }

  const rule6 = getRule(6);
  const flexLateUnit = Number(rule6?.param1 || 0);
  const flexExtraUnit = Number(rule6?.param2 || 0);
  const perMinExtraUnite = flexExtraUnit / flexLateUnit || 0;

  const rule7 = getRule(7);
  const rule7Enabled = !!rule7;

  const rule8 = getRule(8);
  const minOTUnit = Number(firstNumericParam(rule8) || 0);

  const rule9 = getRule(9);
  // const weekendMultiplier = Number(rule9?.param1 || 0);
  const weekendNormalShiftMultiplier = Number(rule9?.param2 || 1);

  const rule10 = getRule(10);
  // const holidayMultiplier = Number(firstNumericParam(rule10) || 0);
  const holidayNormalShiftMultiplier = Number(secondNumericParam(rule10) || 1);

  const rule11 = getRule(11);

  const latePunchDocuments = salaryRules.latePunchDocuments || [];

  // const mLeaves = salaryRules.m_leaves || [];
  // const marLeaves = salaryRules.mar_leaves || [];
  // const pLeaves = salaryRules.p_leaves || [];
  const sLeaves = salaryRules.s_leaves || [];
  // const cLeaves = salaryRules.c_leaves || [];
  // const eLeaves = salaryRules.e_leaves || [];
  // const rLeaves = salaryRules.r_leaves || [];
  const wLeaves = salaryRules.w_leaves || [];
  const oLeaves = salaryRules.o_leaves || [];

  const rule14 = getRule(14);
  const daysPenaltyPerAbsence = Number(firstNumericParam(rule14) || 0);

  const rule16 = getRule(16);
  const latePenaltyPerOcc = Number(firstNumericParam(rule16) || 0);

  const rule17 = getRule(17);
  const earlyPenaltyPerOcc = Number(firstNumericParam(rule17) || 0);

  const rule18 = getRule(18);

  const rule19 = getRule(19);
  const perHourLatePenalty = Number(secondNumericParam(rule19) || 0);

  const rule20 = getRule(20);
  const rule20Threshold = Number((rule20 && firstNumericParam(rule20)) || 0);
  const rule20Fixed = Number(
    (rule20 && firstNonEmptyParam(rule20) && rule20.param2) || 0
  );

  const rule21 = getRule(21);
  const incrementalLateValue = Number(firstNumericParam(rule21) || 0);

  const rule22 = getRule(22);
  const dayShiftPenalty = Number(rule22?.param1 || 0);
  const nightShiftPenalty = Number(rule22?.param2 || 0);

  const rule23 = getRule(23);
  const missedPunchCost = Number(rule23?.param1 || 0);
  const missedPunchAccept = Number(rule23?.param2 || 0);

  const rule24 = getRule(24);

  const overtimeAllowed = rule24?.param1;
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  const { checkedTotal, uncheckedTotal } = parseOtherSalary(
    payPeriod.otherSalary
  );

  const monthlySalary = Number(payPeriod.salary || 0) + checkedTotal;

  const dailyWorkingHours = Number(payPeriod.name || 8);
  const isFixedHourlyRate = payPeriod.selectedOvertimeOption === 1 || false;
  const overtimeSalaryRate = isFixedHourlyRate
    ? Number(payPeriod.overtimeFixed || 0)
    : Number(payPeriod.overtimeSalary || 0) / dailyWorkingHours;

  let year, month;

  // NEW: Get reconciled punch and shift details

  const punchDetails = punchAndShiftDetails(attendanceRecords, salaryRules);
  // let punchDetails = [];
  // try {
  //    punchDetails = punchAndShiftDetails(attendanceRecords, salaryRules);
  // } catch  {
  //   console.log(id,salaryRules)
  // }

  if (punchDetails.length > 0) {
    const [y, m] = punchDetails[0].date.split("-");
    year = Number(y);
    month = Number(m);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  // const workingDaysConfigured = getWorkingDaysInMonth(
  //   year,
  //   month,
  //   weekendDayNames,
  //   holidaysSet,
  //   generalDaysSet,
  //   replaceDaysSet,
  //   id
  // );
  // if (id === "70709904") {
  //   console.log(holidaysArr);
  // }

  const now = new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { fullDayLeaveDates, halfDayLeaveDates } = getFullDayLeaveDates([
    salaryRules.m_leaves,
    salaryRules.mar_leaves,
    salaryRules.p_leaves,
    salaryRules.s_leaves,
    salaryRules.c_leaves,
    salaryRules.e_leaves,
    salaryRules.r_leaves,
    salaryRules.w_leaves,
    salaryRules.o_leaves,
  ]);

  // console.log(currentMonth, currentYear, month, year);

  let workingDaysUpToCurrent;
  let thisMonthLeave = 0;
  let thisMonthHolidays = 0;
  let thisMonthWeekends = 0;
  let futureAbsent = 0;
  if (year === currentYear && month === currentMonth) {
    const details = getWorkingDaysUpToDate(
      year,
      month,
      currentDay,
      weekendDayNames,
      holidaysSet,
      generalDaysSet,
      replaceDaysSet,
      fullDayLeaveDates,
      id
    );
    workingDaysUpToCurrent = details.workingDays;
    thisMonthLeave = details.thisMonthLeave;
    thisMonthHolidays = details.thisMonthHolidays;
    thisMonthWeekends = details.thisMonthWeekends;
    futureAbsent = details.futureAbsent;
  } else {
    const details = getWorkingDaysInMonth(
      year,
      month,
      weekendDayNames,
      holidaysSet, // Fixed parameter order
      generalDaysSet,
      replaceDaysSet,
      fullDayLeaveDates,
      id
    );
    workingDaysUpToCurrent = details.workingDays;
    thisMonthLeave = details.thisMonthLeave;
    thisMonthHolidays = details.thisMonthHolidays;
    thisMonthWeekends = details.thisMonthWeekends;
  }

  const standardPay = monthlySalary + uncheckedTotal;
  const dailyRate = monthlySalary / payPeriod.hourlyRate || 0;
  if (id === "70709903") {
    console.log(monthlySalary, checkedTotal, payPeriod.hourlyRate);
  }

  const punchDocs = Array.isArray(salaryRules.punchDocuments)
    ? salaryRules.punchDocuments
    : [];

  function isMissedPunchSalaryCut(date, empId) {
    const doc = punchDocs.find(
      (d) =>
        normalizeDate(d.date) === normalizeDate(date) &&
        String(d.empId) === String(empId)
    );
    if (doc) {
      if (doc.CutSalary === "No") return false;
      if (doc.CutSalary === "Yes") return true;
      if (doc.signature && doc.signature !== "No Signature") return false;
    }
    return true;
  }

  let lateCount = 0;
  let earlyDepartureCount = 0;
  let missedPunch = 0;
  let totalLatenessMinutes = 0;
  let overtimeNormal = 0;
  let overtimeWeekend = 0;
  let overtimeHoliday = 0;
  let normalPresent = 0;
  let holidayPresent = 0;
  let weekendPresent = 0;
  let absent = 0;
  let deductions = 0;
  let otherLeaveDeduction = 0;
  // let sickLeaveDeduction = 0;
  let extraAbsentDeductions = 0;
  let lateDeductions = 0;
  let earlyDeductions = 0;
  let missedPunchDeductions = 0;
  let halfDayLateCount = 0;
  let fullDayLateCount = 0;
  let dayLateCount = 0;
  let nightLateCount = 0;
  let wLeaveDeduction = 0;
  let oLeaveDeduction = 0;
  let sLeaveDeduction = 0;
  let holidayNormalShiftPay = 0;
  // const nonDeductibleLeaveDates = new Set();
  let weekendNormalShiftPay = 0;

  if (rule11) {
    const { s_deduction, o_deduction, w_deduction } = calculateLeaveDeductions(
      rule11,
      sLeaves,
      oLeaves,
      wLeaves,
      attendanceRecords
    );
    sLeaveDeduction = s_deduction;
    oLeaveDeduction = o_deduction;
    wLeaveDeduction = w_deduction;
    // if (id==="21290499") {
    //   console.log(sLeaveDeduction,oLeaveDeduction,w)
    // }
  }
  // NEW: Process attendance using reconciled punch data
  punchDetails.forEach((dayData) => {
    const { punches, shift, date, workingDecoded, overtimeDecoded } = dayData;

    if (fullDayLeaveDates.includes(date)) {
      return;
    }

    const isHoliday = holidaysSet.has(date);
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekendByName = weekendDayNames.has(dayName);

    const isGeneralDay = generalDaysSet.has(date);
    const isWeekend = weekendByName && !isGeneralDay;
    // const isReplacedWorkday = replaceDaysSet.has(date);
    // const isLeaveDay = fullDayLeaveDates.includes(date);
    const isWorkingDay = isGeneralDay || (!isHoliday && !isWeekend);

    // const mLeave = getLeaveForDate(mLeaves, date);
    // const marLeave = getLeaveForDate(marLeaves, date);
    // const pLeave = getLeaveForDate(pLeaves, date);
    // const sLeave = getLeaveForDate(sLeaves, date);
    // const cLeave = getLeaveForDate(cLeaves, date);
    // const eLeave = getLeaveForDate(eLeaves, date);
    // const rLeave = getLeaveForDate(rLeaves, date);
    // const wLeave = getLeaveForDate(wLeaves, date);
    // const oLeave = getLeaveForDate(oLeaves, date);

    // const hasFullDayLeave =
    //   (mLeave && !mLeave.date.start && !mLeave.date.end) ||
    //   (marLeave && !marLeave.date.start && !marLeave.date.end) ||
    //   (pLeave && !pLeave.date.start && !pLeave.date.end) ||
    //   (sLeave && !sLeave.date.start && !sLeave.date.end) ||
    //   (cLeave && !cLeave.date.start && !cLeave.date.end) ||
    //   (eLeave && !eLeave.date.start && !eLeave.date.end) ||
    //   (rLeave && !rLeave.date.start && !rLeave.date.end) ||
    //   (wLeave && !wLeave.date.start && !wLeave.date.end) ||
    //   (oLeave && !oLeave.date.start && !oLeave.date.end);

    // if (hasFullDayLeave) {
    //   nonDeductibleLeaveDates.add(date);
    // }

    if (isHoliday) {
      holidayPresent += 1;
    } else if (isWeekend) {
      weekendPresent += 1;
    } else if (isWorkingDay) {
      normalPresent += 1;
      // if (id === "2109058927") {
      //   console.log(date, normalPresent);
      // }
    }
    // if (id === "2109058927") {
    //   console.log(
    //     date,
    //     isHoliday,
    //     isGeneralDay,
    //     isWeekend,
    //     isReplacedWorkday,
    //     isWorkingDay,
    //     normalPresent
    //   );
    // }

    // NEW: Check for missed punches in first 4 positions
    const missedCount = countWorkingMissPunch(workingDecoded, punches);

    const hasMissedPunch =
      missedCount.hasMissPunch && !halfDayLeaveDates.includes(date);

    if (hasMissedPunch) {
      if (isMissedPunchSalaryCut(date, id)) {
        missedPunch += missedCount.missPunchCount;
      }

      // if (id === "70709908") {
      //   console.log("Missed punch on", date, missedCount, punches);
      // }
    }

    // NEW: Late count logic (only index 0 and index 2)
    // Index 0: Shift start
    if (
      !rule6 &&
      punches[0] &&
      punches[0] !== "00:00" &&
      shift[0] &&
      workingDecoded.length > 1
    ) {
      const punchMins = toMinutes(punches[0]);
      const shiftMins = toMinutes(shift[0]);
      const lateThresh = shiftMins + latenessGraceMin;
      const hasLateDoc = isDateInLatePunchDocuments(latePunchDocuments, date);
      const approvedStartTime = getStartTimeFromLateDoc(
        latePunchDocuments,
        date
      );

      // Skip late count if punch is near approved start time from late document
      const shouldSkipLate =
        hasLateDoc &&
        (approvedStartTime !== null
          ? isPunchNearApprovedTime(punches[0], approvedStartTime)
          : true);

      // if (id === "2109058927") {
      //   console.log(
      //     hasLateDoc,
      //     shouldSkipLate,
      //     date,
      //     approvedStartTime,
      //     isPunchNearApprovedTime(punches[0], approvedStartTime)
      //   );
      // }

      if (punchMins > lateThresh && !shouldSkipLate) {
        const lateMins = punchMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        if (identifyShiftType(workingDecoded) === "Day Shift") {
          dayLateCount += 1;
        } else if (identifyShiftType(workingDecoded) === "Night Shift") {
          nightLateCount += 1;
        }
        // if (id === "2109058927") {
        //   console.log("Late on", date, lateMins, latenessGraceMin);
        // }

        if (rule18) {
          halfDayLateCount += 1;
        }
      }
    }

    // Index 2: Lunch in
    if (
      !rule6 &&
      punches[2] &&
      punches[2] !== "00:00" &&
      shift[2] &&
      workingDecoded.length > 1
    ) {
      const punchMins = toMinutes(punches[2]);
      const shiftMins = toMinutes(shift[2]);
      const lateThresh = shiftMins + latenessGraceMin;
      const hasLateDoc = isDateInLatePunchDocuments(latePunchDocuments, date);
      const approvedStartTime = getStartTimeFromLateDoc(
        latePunchDocuments,
        date
      );

      // Skip late count if punch is near approved start time from late document
      const shouldSkipLate =
        hasLateDoc &&
        (approvedStartTime !== null
          ? isPunchNearApprovedTime(punches[0], approvedStartTime)
          : true);

      if (punchMins > lateThresh && !shouldSkipLate) {
        const lateMins = punchMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        if (identifyShiftType(workingDecoded) === "Day Shift") {
          dayLateCount += 1;
        } else if (identifyShiftType(workingDecoded) === "Night Shift") {
          nightLateCount += 1;
        }
        if (id === "2109058927") {
          console.log(
            "Late on",
            date,
            lateMins,
            latenessGraceMin
            // workingDecoded,
            // identifyShiftType(workingDecoded)
          );
        }

        if (rule18 && punches[0] === "00:00" && punches[1] === "00:00") {
          fullDayLateCount += 1;
        } else if (rule18) {
          halfDayLateCount += 1;
        }
      }
    }
    // Dynamically handle additional shifts (3rd, 4th, 5th, etc.)
    if (workingDecoded && workingDecoded.length > 2) {
      // Start from 3rd shift (index 4, since indices: 0=1st, 2=2nd, 4=3rd)
      for (let shiftNum = 3; shiftNum <= workingDecoded.length; shiftNum++) {
        const punchIndex = (shiftNum - 1) * 2; // 4 for 3rd shift, 6 for 4th, etc.

        if (
          !rule6 &&
          shift[punchIndex] &&
          punches[punchIndex] &&
          punches[punchIndex] !== "00:00"
        ) {
          const punchMins = toMinutes(punches[punchIndex]);
          const shiftMins = toMinutes(shift[punchIndex]);
          const lateThresh = shiftMins + latenessGraceMin;

          // Check if date has late punch document
          const hasLateDoc = isDateInLatePunchDocuments(
            latePunchDocuments,
            date
          );
          const approvedStartTime = getStartTimeFromLateDoc(
            latePunchDocuments,
            date
          );

          // Skip late count if punch is near approved start time from late document
          const shouldSkipLate =
            hasLateDoc &&
            (approvedStartTime !== null
              ? isPunchNearApprovedTime(punches[0], approvedStartTime)
              : true);
          if (punchMins > lateThresh && !shouldSkipLate) {
            const lateMins = punchMins - lateThresh;
            lateCount += 1;
            totalLatenessMinutes += lateMins;

            if (identifyShiftType(workingDecoded) === "Day Shift") {
              dayLateCount += 1;
            } else if (identifyShiftType(workingDecoded) === "Night Shift") {
              nightLateCount += 1;
            }

            if (rule18) {
              halfDayLateCount += 1;
            }

            // Optional: Debug log
            // if (id === "44141318") {
            //   console.log(`Late on shift ${shiftNum}`, date, lateMins);
            // }
          }
        }
      }
    }

    // NEW: Early departure logic (only index 1 and index 3)
    // Calculate number of shifts based on workingDecoded array length
    const numShifts = workingDecoded ? workingDecoded.length : 0;

    // Loop through each shift
    for (let shiftIndex = 0; shiftIndex < numShifts; shiftIndex++) {
      // Each shift has: start punch (0, 2, 4...) and end punch (1, 3, 5...)
      const startPunchIndex = shiftIndex * 2; // 0, 2, 4
      const endPunchIndex = startPunchIndex + 1; // 1, 3, 5

      // Check shift end (early departure)
      if (
        punches[endPunchIndex] &&
        punches[endPunchIndex] !== "00:00" &&
        shift[endPunchIndex]
      ) {
        const punchMins = toMinutes(punches[endPunchIndex]);
        let shiftEndMins = toMinutes(shift[endPunchIndex]);

        // Apply flex rule if applicable (only for shift end, not start)
        if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
          // Find the corresponding start punch for this shift (the start of this shift block)
          const shiftStartPunchIndex = startPunchIndex; // This shift's start
          const shiftStartMins = toMinutes(shift[shiftStartPunchIndex]);
          const lateThresh = shiftStartMins + latenessGraceMin;

          // Check if there was lateness at the start of this shift
          if (
            punches[shiftStartPunchIndex] &&
            punches[shiftStartPunchIndex] !== "00:00"
          ) {
            const dayLateMins = Math.max(
              0,
              toMinutes(punches[shiftStartPunchIndex]) - lateThresh
            );

            if (dayLateMins > 0) {
              const units = Math.ceil(dayLateMins * perMinExtraUnite);
              shiftEndMins = shiftEndMins + units;
            }
          }
        }

        if (punchMins < shiftEndMins) {
          earlyDepartureCount += 1;

          // Debug for specific employee
          // if (id === "2109058928") {
          //   console.log(
          //     `Early departure on shift ${shiftIndex + 1}`,
          //     date,
          //     punches[endPunchIndex],
          //     shift[endPunchIndex],
          //     "Difference:", shiftEndMins - punchMins, "minutes"
          //   );
          // }
        }
      }
    }

    // NEW: Overtime calculation
    if (workingDecoded && overtimeDecoded && punches.length >= 2) {
      // Calculate working time (if needed)
      // ... your working time calculation logic ...

      // Calculate overtime based on overtimeDecoded periods
      let otMinutes = 0;

      if (overtimeDecoded.length > 0) {
        // We need to determine which punches correspond to overtime
        // Assuming punches are in order: work punches first, then OT punches

        // Count total working periods to skip those punches
        const totalWorkPeriods = workingDecoded.length;
        const workPunchCount = totalWorkPeriods * 2; // Each work period has in/out

        // Process each overtime period
        for (let i = 0; i < overtimeDecoded.length; i++) {
          const otPeriod = overtimeDecoded[i];
          const otStart = toMinutes(otPeriod.start);

          // Calculate indices for this OT period's punches
          // Assuming 2 punches per OT period (in/out)
          const otInIndex = workPunchCount + i * 2;
          const otOutIndex = workPunchCount + i * 2 + 1;

          // Your exact logic from original code, adapted for dynamic indices
          if (
            punches[otInIndex] !== "00:00" &&
            punches[otOutIndex] !== "00:00"
          ) {
            const pIn = toMinutes(punches[otInIndex]);
            const pOut = toMinutes(punches[otOutIndex]);
            otMinutes += Math.max(0, pOut - pIn); // prevent negative OT
          } else if (punches[otOutIndex] !== "00:00") {
            // Use shift OT start time when only out punch exists
            const punchOut = toMinutes(punches[otOutIndex]);
            otMinutes += Math.max(0, punchOut - otStart);
          }
          // Note: If only in punch exists (punches[otInIndex] !== "00:00" && punches[otOutIndex] === "00:00")
          // Your original logic doesn't handle this case
        }
      }

      // Apply OT rules based on day type (same as before)
      if (isHoliday) {
        overtimeHoliday += calculateWorkedTime(workingDecoded, punches);
      } else if (isWeekend) {
        overtimeWeekend += calculateWorkedTime(workingDecoded, punches);
      } else {
        overtimeNormal += otMinutes;
        // if (id === "8938086979") {
        //   console.log(date, overtimeNormal);
        // }
      }

      // Apply rounding if needed (same as before)
      if (rule8 && minOTUnit > 0) {
        overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
        overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
        overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
      }
    }

    if (
      workingDecoded.length === 0 &&
      overtimeDecoded.length === 0 &&
      punches.length >= 2
    ) {
      // Has overtime shift (index 4-5)
      const otStart = toMinutes(shift[4]);
      // const otEnd = toMinutes(shift[5]);
      // const punchOut =
      //   punches[5] !== "00:00" ? toMinutes(punches[5]) : toMinutes(punches[3]);
      let otMinutes = 0;
      if (punches[4] !== "00:00" && punches[5] !== "00:00") {
        const p4 = toMinutes(punches[4]);
        const p5 = toMinutes(punches[5]);
        otMinutes = Math.max(0, p5 - p4); // prevent negative OT
      } else if (punches[5] !== "00:00") {
        // Your previous logic: use shift OT start time
        const punchOut = toMinutes(punches[5]);
        otMinutes = Math.max(0, punchOut - otStart);
      }
      if (isHoliday) {
        overtimeHoliday += otMinutes;
      } else if (isWeekend) {
        overtimeWeekend += otMinutes;
      } else {
        overtimeNormal += otMinutes;
        if (id === "8938086979") {
          console.log(date, overtimeNormal);
        }
      }
      if (rule8 && minOTUnit > 0) {
        overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
        overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
        overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
        // if (id === "70709908") {
        //   console.log(
        //     otMinutes,
        //     overtimeNormal,
        //     toMinutes(punches[5]),
        //     toMinutes(punches[4]),
        //     toMinutes(punches[5]) - toMinutes(punches[4]),
        //     date
        //   );
        // }
      }
    }

    if (
      workingDecoded.length === 0 &&
      overtimeDecoded.length === 0 &&
      punches.length >= 2
    ) {
      // Has overtime shift (index 4-5)
      const otStart = toMinutes(shift[4]);
      // const otEnd = toMinutes(shift[5]);
      // const punchOut =
      //   punches[5] !== "00:00" ? toMinutes(punches[5]) : toMinutes(punches[3]);
      let otMinutes = 0;
      if (punches[4] !== "00:00" && punches[5] !== "00:00") {
        const p4 = toMinutes(punches[4]);
        const p5 = toMinutes(punches[5]);
        otMinutes = Math.max(0, p5 - p4); // prevent negative OT
      } else if (punches[5] !== "00:00") {
        // Your previous logic: use shift OT start time
        const punchOut = toMinutes(punches[5]);
        otMinutes = Math.max(0, punchOut - otStart);
      }
      if (isHoliday) {
        overtimeHoliday += otMinutes;
      } else if (isWeekend) {
        overtimeWeekend += otMinutes;
      } else {
        overtimeNormal += otMinutes;
        // if (id === "8938086979") {
        //   console.log(date, overtimeNormal);
        // }
      }
      if (rule8 && minOTUnit > 0) {
        overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
        overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
        overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
        // if (id === "70709908") {
        //   console.log(
        //     otMinutes,
        //     overtimeNormal,
        //     toMinutes(punches[5]),
        //     toMinutes(punches[4]),
        //     toMinutes(punches[5]) - toMinutes(punches[4]),
        //     date
        //   );
        // }
      }
    }
  });

  // Calculate absent days
  absent = Math.max(0, workingDaysUpToCurrent - normalPresent);

  // if (id === "70709913") {
  //   console.log(workingDaysUpToCurrent, normalPresent);
  // }

  let presentDaysSalary = 0;
  let earnedSalary = 0;

  if (year === currentYear && month === currentMonth) {
    if (rule14 && daysPenaltyPerAbsence > 0) {
      presentDaysSalary =
        normalPresent > 0
          ? standardPay - dailyRate * (absent + futureAbsent)
          : 0;
      earnedSalary = presentDaysSalary;
      // if (id === "2109058927") {
      //   console.log(
      //     standardPay - dailyRate * (absent + futureAbsent),
      //     standardPay,
      //     absent,
      //     futureAbsent,
      //     dailyRate
      //   );
      // }
    } else {
      presentDaysSalary = monthlySalary + uncheckedTotal;
      earnedSalary = standardPay;
      // if (id === "2109058926") {
      //   console.log(earnedSalary);
      // }
    }
  } else {
    if (rule14 && daysPenaltyPerAbsence > 0) {
      presentDaysSalary =
        normalPresent > 0 ? standardPay - dailyRate * absent : 0;
      earnedSalary = presentDaysSalary;
      // if (id === "70709917") {
      //   console.log(
      //     standardPay,
      //     dailyRate,
      //     absent,
      //     standardPay - dailyRate * absent
      //   );
      // }
    } else {
      presentDaysSalary = monthlySalary + uncheckedTotal;
      earnedSalary = standardPay;
      // if (id === "70709903") {
      //   console.log(earnedSalary);
      // }
    }
  }

  // const sickLeaveDays = Number(rule11?.param3 || 0);
  // const sickLeaveType = rule11?.param4 || "proportional";
  // const sickLeaveAmount = Number(rule11?.param5 || 0);

  // if (rule11 && sickLeaveDays > 0 && sickLeaveDaysUsed > 0) {
  //   if (sickLeaveType === "fixed") {
  //     sickLeaveDeduction = sickLeaveAmount * sickLeaveDaysUsed;
  //   } else {
  //     const proportion = sickLeaveAmount || 1;
  //     const dailySalary = dailyRate;
  //     sickLeaveDeduction = dailySalary * proportion * sickLeaveDaysUsed;
  //   }
  // }

  if (rule7Enabled && totalLatenessMinutes > 0) {
    let remaining = totalLatenessMinutes;
    const useFromHoliday = Math.min(remaining, overtimeHoliday);
    overtimeHoliday -= useFromHoliday;
    remaining -= useFromHoliday;
    if (remaining > 0) {
      const useFromWeekend = Math.min(remaining, overtimeWeekend);
      overtimeWeekend -= useFromWeekend;
      remaining -= useFromWeekend;
    }
    if (remaining > 0) {
      const useFromNormal = Math.min(remaining, overtimeNormal);
      overtimeNormal -= useFromNormal;
      remaining -= useFromNormal;
    }
  }

  // if (id === "70709903") {
  //   console.log(overtimeNormal);
  // }

  if (rule16 && latePenaltyPerOcc > 0) {
    lateDeductions += lateCount * latePenaltyPerOcc;
    // if (id === "70709904") {
    //   console.log(deductions, latePenaltyPerOcc, lateCount);
    // }
  }

  if (rule17 && earlyPenaltyPerOcc > 0)
    earlyDeductions += earlyDepartureCount * earlyPenaltyPerOcc;
  // if (id === "70709904") {
  //   console.log(deductions);
  // }

  if (rule18) {
    const dailySalary = dailyRate;
    lateDeductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }
  // if (id === "7070968036") {
  //   console.log(
  //     halfDayLateCount,
  //     fullDayLateCount,
  //     lateDeductions,
  //     lateCount,
  //     dailyRate
  //   );
  // }

  if (rule19 && perHourLatePenalty > 0)
    lateDeductions += toHours(totalLatenessMinutes) * perHourLatePenalty;

  if (rule20 && rule20Threshold > 0 && totalLatenessMinutes > rule20Threshold)
    lateDeductions += rule20Fixed;

  if (rule21 && incrementalLateValue > 0) {
    lateDeductions +=
      (incrementalLateValue * (lateCount * (lateCount + 1))) / 2;
  }

  if (rule22 && (dayShiftPenalty || nightShiftPenalty)) {
    lateDeductions +=
      nightLateCount * nightShiftPenalty + dayLateCount * dayShiftPenalty;
  }

  if (rule23 && missedPunchCost && missedPunch > missedPunchAccept) {
    missedPunchDeductions +=
      (missedPunch - missedPunchAccept) * missedPunchCost;
  }

  if (rule11) {
    const p1 = rule11.param1;
    const p2 = rule11.param2;

    if (!Array.isArray(p1)) {
      if (p1 && String(p1).toLowerCase().includes("day")) {
        const frac = Number(p2 || 0);
        const dailySalary = dailyRate;
        otherLeaveDeduction = dailySalary * frac;
      } else if (p1 && String(p1).toLowerCase().includes("fixed")) {
        otherLeaveDeduction = Number(p2 || 0);
      } else if (!p1 && p2) {
        const numeric = Number(p2);
        if (!Number.isNaN(numeric)) otherLeaveDeduction = numeric;
      }
    }
  }

  if (rule14 && daysPenaltyPerAbsence > 0 && absent > 0) {
    const extraPenaltyDaysPerAbsence = Math.max(0, daysPenaltyPerAbsence - 1);

    if (extraPenaltyDaysPerAbsence > 0) {
      extraAbsentDeductions +=
        extraPenaltyDaysPerAbsence * (dailyRate * absent);
    }
    // if (id === "70709903") {
    //   console.log(
    //     extraAbsentDeductions,
    //     absent,
    //     dailyRate,
    //     daysPenaltyPerAbsence,
    //     extraPenaltyDaysPerAbsence,
    //     absent
    //   );
    // }
  }

  let overtimePay = 0;
  if (overtimeAllowed) {
    overtimePay +=
      toHours(overtimeNormal) * overtimeSalaryRate * (normalOTMultiplier || 1);

    if (rule9 && weekendNormalShiftMultiplier && rule8) {
      overtimePay +=
        toHours(overtimeWeekend) *
        overtimeSalaryRate *
        weekendNormalShiftMultiplier;

      // if (id === "2109058927") {
      //   console.log(
      //     rule8,
      //     overtimeWeekend,
      //     weekendNormalShiftMultiplier,
      //     overtimeSalaryRate
      //   );
      // }
    }

    if (rule10 && holidayNormalShiftMultiplier && rule8) {
      overtimePay +=
        toHours(overtimeHoliday) *
        overtimeSalaryRate *
        holidayNormalShiftMultiplier;
    }
  }

  // if (id === "2109058927") {
  //   console.log(
  //     monthlySalary,
  //     dailyRate,
  //     weekendNormalShiftPay,
  //     weekendNormalShiftMultiplier,
  //     weekendPresent
  //   );
  // }

  earnedSalary += weekendNormalShiftPay + holidayNormalShiftPay;
  presentDaysSalary += weekendNormalShiftPay + holidayNormalShiftPay;

  deductions =
    missedPunchDeductions +
    lateDeductions +
    earlyDeductions +
    extraAbsentDeductions;

  const totalLeaveDeductions =
    wLeaveDeduction + oLeaveDeduction + sLeaveDeduction;

  const totalPay = (
    earnedSalary -
    deductions -
    otherLeaveDeduction -
    totalLeaveDeductions +
    overtimePay
  ).toFixed(2);

  // if (id === "70709917") {
  //   console.log(
  //     earnedSalary,
  //     deductions,
  //     otherLeaveDeduction,
  //     totalLeaveDeductions,
  //     overtimePay,
  //     dailyRate,
  //     weekendNormalShiftPay,
  //     holidayNormalShiftPay
  //   );
  // }

  return {
    attendanceStats: {
      lateCount,
      earlyDepartureCount,
      missedPunch,
      totalLatenessMinutes,
    },
    monthlyDetails: { thisMonthHolidays, thisMonthLeave, thisMonthWeekends },
    deductions: {
      absentDeductions:
        rule14 && daysPenaltyPerAbsence > 0 ? absent * dailyRate : 0,
      extraAbsentDeductions,
      missedPunchDeductions,
      lateDeductions,
      earlyDeductions,
    },
    LeaveDeduction: {
      wLeaveDeduction,
      oLeaveDeduction,
      sLeaveDeduction,
    },
    overtimeDetails: {
      normal: toHours(overtimeNormal),
      weekend: toHours(overtimeWeekend),
      holiday: toHours(overtimeHoliday),
    },
    extraPay: {
      weekendNormalShiftPay,
      holidayNormalShiftPay,
    },
    lateCountDetails: {
      halfDayLateCount,
      fullDayLateCount,
    },
    overtimePay,
    overtimeSalary: overtimeSalaryRate,
    standardPay,
    earnedSalary,
    presentDaysSalary,
    totalPay,
    Present: { normalPresent, holidayPresent, weekendPresent },
    absent,
    workingDays: workingDaysUpToCurrent,
    workingDaysUpToCurrent,
    replaceDaysArr,
    otherSalaryBreakdown: {
      original: payPeriod.otherSalary,
      parsed: checkedTotal + uncheckedTotal,
      type: typeof payPeriod.otherSalary,
    },
    rule11LeaveInfo: {
      hasRule11: !!rule11,
      // nonDeductibleLeaveDays: nonDeductibleLeaveDates.size,
      wLeaveDeduction: wLeaveDeduction,
      oLeaveDeduction: oLeaveDeduction,
      sLeaveDeduction,
      totalLeaveDeductions: totalLeaveDeductions,
      dailyWorkingHours: dailyWorkingHours,
      isFixedHourlyRate: isFixedHourlyRate,
    },
    punchDetailsDebug: punchDetails,
  };
}
