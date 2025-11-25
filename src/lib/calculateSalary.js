import calculateLeaveDeductions from "./calculateLeaveDeductions";
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

function getLeaveForDate(leavesArray, targetDate) {
  if (!Array.isArray(leavesArray)) return null;

  const normalizedTarget = normalizeDate(targetDate);
  return leavesArray.find((leave) => {
    if (leave && leave.date && leave.date.date) {
      return normalizeDate(leave.date.date) === normalizedTarget;
    }
    return false;
  });
}

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
  holidaysSet, // Fixed parameter order
  generalDaysSet,
  replaceDaysSet
  // id
) {
  let workingDays = 0;
  const weekends = Array.from(weekendDayNames);
  // Fixed month indexing - months are 0-based in JavaScript Date
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Check replacement days first (these override everything)
    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check holidays
    if (holidaysSet.has(dateStr)) {
      continue;
    }

    // Check general working days
    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check weekends
    if (weekends.includes(dayName)) {
      continue;
    }

    // Normal working day
    workingDays++;
  }

  return workingDays;
}

function getWorkingDaysUpToDate(
  year,
  month,
  currentDay,
  weekendDayNames,
  holidaysSet,
  generalDaysSet,
  replaceDaysSet
  // id
) {
  let workingDays = 0;
  const weekends = Array.from(weekendDayNames);

  for (let d = 1; d <= currentDay; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Check replacement days first (these override everything)
    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check holidays
    if (holidaysSet.has(dateStr)) {
      continue;
    }

    // Check general working days
    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    // Check weekends
    if (weekends.includes(dayName)) {
      continue;
    }

    // Normal working day
    workingDays++;
  }

  return workingDays;
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
  // if (id === "70709904") {
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
  const latenessGraceMin = Number(firstNumericParam(rule5) || 0);

  const rule6 = getRule(6);
  const flexLateUnit = Number(rule6?.param1 || 0);
  const flexExtraUnit = Number(rule6?.param2 || 0);
  const perMinExtraUnite = flexExtraUnit / flexLateUnit || 0;

  const rule7 = getRule(7);
  const rule7Enabled = !!rule7;

  const rule8 = getRule(8);
  const minOTUnit = Number(firstNumericParam(rule8) || 0);

  const rule9 = getRule(9);
  const weekendMultiplier = Number(firstNumericParam(rule9) || 1);
  const weekendNormalShiftMultiplier = Number(secondNumericParam(rule9) || 1);

  const rule10 = getRule(10);
  const holidayMultiplier = Number(firstNumericParam(rule10) || 1);
  const holidayNormalShiftMultiplier = Number(secondNumericParam(rule10) || 1);

  const rule11 = getRule(11);

  const mLeaves = salaryRules.m_leaves || [];
  const marLeaves = salaryRules.mar_leaves || [];
  const pLeaves = salaryRules.p_leaves || [];
  const sLeaves = salaryRules.s_leaves || [];
  const cLeaves = salaryRules.c_leaves || [];
  const eLeaves = salaryRules.e_leaves || [];
  const rLeaves = salaryRules.r_leaves || [];
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
  const perHourLatePenalty = Number(firstNumericParam(rule19) || 0);

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

  const overtimeAllowed = true;
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  const { checkedTotal, uncheckedTotal } = parseOtherSalary(
    payPeriod.otherSalary
  );

  const monthlySalary = Number(payPeriod.salary || 0) + checkedTotal;

  const dailyWorkingHours = Number(payPeriod.name || 8);
  const isFixedHourlyRate = payPeriod.isSelectedFixedHourlyRate || false;
  const overtimeSalaryRate = isFixedHourlyRate
    ? Number(payPeriod.overtimeFixed || 0)
    : Number(payPeriod.overtimeSalary || 0);

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

  // console.log(currentMonth, currentYear, month, year);

  let workingDaysUpToCurrent;
  if (year === currentYear && month === currentMonth) {
    workingDaysUpToCurrent = getWorkingDaysUpToDate(
      year,
      month,
      currentDay,
      weekendDayNames,
      holidaysSet,
      generalDaysSet,
      replaceDaysSet,
      id
    );
  } else {
    workingDaysUpToCurrent = getWorkingDaysInMonth(
      year,
      month,
      weekendDayNames,
      holidaysSet, // Fixed parameter order
      generalDaysSet,
      replaceDaysSet,
      id
    );
  }

  const standardPay = monthlySalary + uncheckedTotal;
  const dailyRate = monthlySalary / payPeriod.hourlyRate || 0;
  // if (id === "70709903") {
  //   console.log(monthlySalary, checkedTotal, payPeriod.hourlyRate);
  // }

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
  let sickLeaveDeduction = 0;
  let halfDayLateCount = 0;
  let fullDayLateCount = 0;
  let sickLeaveDaysUsed = 0;

  let wLeaveDeduction = 0;
  let oLeaveDeduction = 0;
  let sLeaveDeduction = 0;
  const nonDeductibleLeaveDates = new Set();

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
    const { punches, shift, date } = dayData;

    const isHoliday = holidaysSet.has(date);
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekendByName = weekendDayNames.has(dayName);

    const isGeneralDay = generalDaysSet.has(date);
    const isWeekend = weekendByName && !isGeneralDay;
    // const isReplacedWorkday = replaceDaysSet.has(date);

    const isWorkingDay = isGeneralDay || (!isHoliday && !isWeekend);

    const mLeave = getLeaveForDate(mLeaves, date);
    const marLeave = getLeaveForDate(marLeaves, date);
    const pLeave = getLeaveForDate(pLeaves, date);
    const sLeave = getLeaveForDate(sLeaves, date);
    const cLeave = getLeaveForDate(cLeaves, date);
    const eLeave = getLeaveForDate(eLeaves, date);
    const rLeave = getLeaveForDate(rLeaves, date);
    const wLeave = getLeaveForDate(wLeaves, date);
    const oLeave = getLeaveForDate(oLeaves, date);

    const hasFullDayLeave =
      (mLeave && !mLeave.date.start && !mLeave.date.end) ||
      (marLeave && !marLeave.date.start && !marLeave.date.end) ||
      (pLeave && !pLeave.date.start && !pLeave.date.end) ||
      (sLeave && !sLeave.date.start && !sLeave.date.end) ||
      (cLeave && !cLeave.date.start && !cLeave.date.end) ||
      (eLeave && !eLeave.date.start && !eLeave.date.end) ||
      (rLeave && !rLeave.date.start && !rLeave.date.end) ||
      (wLeave && !wLeave.date.start && !wLeave.date.end) ||
      (oLeave && !oLeave.date.start && !oLeave.date.end);

    if (hasFullDayLeave) {
      nonDeductibleLeaveDates.add(date);
    }

    if (isHoliday) {
      holidayPresent += 1;
    } else if (isWeekend) {
      weekendPresent += 1;
    } else if (isWorkingDay) {
      normalPresent += 1;
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
    const hasMissedPunch = punches.slice(0, 4).some((p) => p === "00:00");

    if (hasMissedPunch) {
      if (isMissedPunchSalaryCut(date, id)) {
        const missedCount = punches
          .slice(0, 4)
          .filter((p) => p === "00:00").length;
        missedPunch += missedCount;

        // if (id === "70709903") {
        //   console.log("Missed punch on", date, missedCount, punches);
        // }
      }
    }

    // NEW: Late count logic (only index 0 and index 2)
    // Index 0: Shift start
    if (!rule6 && punches[0] && punches[0] !== "00:00" && shift[0]) {
      const punchMins = toMinutes(punches[0]);
      const shiftMins = toMinutes(shift[0]);
      const lateThresh = shiftMins + latenessGraceMin;

      if (punchMins > lateThresh) {
        const lateMins = punchMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        // if (id === "70709909") {
        //   console.log("Late on", date, lateMins, lateCount);
        // }

        if (rule18) {
          const halfDayBoundary = toMinutes(
            punches[2] === "00:00" ? "12:30" : punches[2]
          );
          if (punchMins < halfDayBoundary) halfDayLateCount += 1;
          else fullDayLateCount += 1;
        }
      }
    }

    //     if (id === "70709909") {
    //   console.log("Late on", date, punches[0],shift[0],punches[2],shift[2] );
    // }

    // Index 2: Lunch in
    if (!rule6 && punches[2] && punches[2] !== "00:00" && shift[2]) {
      const punchMins = toMinutes(punches[2]);
      const shiftMins = toMinutes(shift[2]);
      const lateThresh = shiftMins + latenessGraceMin;

      if (punchMins > lateThresh) {
        const lateMins = punchMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;
        // if (id === "70709909") {
        //   console.log("Late on", date, lateMins);
        // }
      }
    }

    // NEW: Early departure logic (only index 1 and index 3)
    // Index 1: Lunch out
    if (punches[1] && punches[1] !== "00:00" && shift[1]) {
      const punchMins = toMinutes(punches[1]);
      let shiftMins = toMinutes(shift[1]);
      if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
        const shiftStartMins = toMinutes(shift[0]);
        const lateThresh = shiftStartMins + latenessGraceMin;
        const dayLateMins = Math.max(0, toMinutes(punches[0]) - lateThresh);

        if (dayLateMins > 0) {
          const units = Math.ceil(dayLateMins * perMinExtraUnite);
          shiftMins = shiftMins + units;
        }
      }

      if (punchMins < shiftMins) {
        earlyDepartureCount += 1;

        // if (id === "2109058928") {
        //   console.log(
        //     "Early departure on",
        //     date,
        //     punchMins,
        //     shiftMins,
        //     punches[1],
        //     shift[1],
        //     "RAW SHIFT MINS:",
        //     toMinutes(shift[1])
        //   );
        // }
      }
    }

    // Index 3: Shift end
    if (punches[3] && punches[3] !== "00:00" && shift[3]) {
      const punchMins = toMinutes(punches[3]);
      let shiftEndMins = toMinutes(shift[3]);

      // Apply flex rule if applicable
      if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
        const LunchEndMins = toMinutes(shift[2]);
        const lateThresh = LunchEndMins + latenessGraceMin;
        const dayLateMins = Math.max(0, toMinutes(punches[2]) - lateThresh);

        if (dayLateMins > 0) {
          const units = Math.ceil(dayLateMins * perMinExtraUnite);
          shiftEndMins = shiftEndMins + units;
        }
      }

      if (punchMins < shiftEndMins) {
        earlyDepartureCount += 1;

        // if (id === "2109058928") {
        //   console.log(
        //     "Early departure on",
        //     date,
        //     punchMins,
        //     shiftEndMins,
        //     punches[3],
        //     shift[3],
        //     "RAW SHIFT MINS:",
        //     toMinutes(shift[3])
        //   );
        // }
      }
    }

    // NEW: Overtime calculation
    if (shift.length >= 6 && punches.length >= 6) {
      // Has overtime shift (index 4-5)
      const otStart = toMinutes(shift[4]);
      const otEnd = toMinutes(shift[5]);
      const punchOut =
        punches[5] !== "00:00" ? toMinutes(punches[5]) : toMinutes(punches[3]);

      if (punchOut > otStart) {
        const otMinutes = Math.max(0, Math.min(punchOut, otEnd) - otStart);

        if (isHoliday) {
          overtimeHoliday += otMinutes;
        } else if (isWeekend) {
          overtimeWeekend += otMinutes;
        } else {
          overtimeNormal += otMinutes;
          // if (id === "70709903") {
          //   console.log(otMinutes, date);
          // }
        }
      }
    }
  });

  // Calculate absent days
  absent = Math.max(
    0,
    workingDaysUpToCurrent - normalPresent - nonDeductibleLeaveDates.size
  );

  let presentDaysSalary = 0;
  let earnedSalary = 0;

  if (rule14 && daysPenaltyPerAbsence > 0) {
    presentDaysSalary =
      normalPresent > 0 ? standardPay - dailyRate * absent : 0;
    earnedSalary = presentDaysSalary;
    // if (id === "70709904") {
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

  const sickLeaveDays = Number(rule11?.param3 || 0);
  const sickLeaveType = rule11?.param4 || "proportional";
  const sickLeaveAmount = Number(rule11?.param5 || 0);

  if (rule11 && sickLeaveDays > 0 && sickLeaveDaysUsed > 0) {
    if (sickLeaveType === "fixed") {
      sickLeaveDeduction = sickLeaveAmount * sickLeaveDaysUsed;
    } else {
      const proportion = sickLeaveAmount || 1;
      const dailySalary = dailyRate;
      sickLeaveDeduction = dailySalary * proportion * sickLeaveDaysUsed;
    }
  }

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

  if (rule8 && minOTUnit > 0) {
    overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
    overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
    overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
  }

  if (rule16 && latePenaltyPerOcc > 0) {
    deductions += lateCount * latePenaltyPerOcc;
    // if (id === "70709904") {
    //   console.log(deductions, latePenaltyPerOcc, lateCount);
    // }
  }

  if (rule17 && earlyPenaltyPerOcc > 0)
    deductions += earlyDepartureCount * earlyPenaltyPerOcc;
  // if (id === "70709904") {
  //   console.log(deductions);
  // }

  if (rule18) {
    const dailySalary = dailyRate;
    deductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }
  // if (id === "70709904") {
  //   console.log(deductions);
  // }

  if (rule19 && perHourLatePenalty > 0)
    deductions += toHours(totalLatenessMinutes) * perHourLatePenalty;

  if (rule20 && rule20Threshold > 0 && totalLatenessMinutes > rule20Threshold)
    deductions += rule20Fixed;

  if (rule21 && incrementalLateValue > 0) {
    deductions += (incrementalLateValue * (lateCount * (lateCount + 1))) / 2;
  }

  if (rule22 && (dayShiftPenalty || nightShiftPenalty)) {
    let isNightShift = false;

    if (punchDetails.length > 0) {
      const firstDay = punchDetails[0];
      if (firstDay.shift && firstDay.shift[0]) {
        const startMin = toMinutes(firstDay.shift[0]);
        if (startMin >= toMinutes("18:00")) isNightShift = true;
      }
    }

    const perOccPenalty = isNightShift ? nightShiftPenalty : dayShiftPenalty;
    if (perOccPenalty) deductions += lateCount * perOccPenalty;
  }

  if (rule23 && missedPunchCost && missedPunch > missedPunchAccept) {
    deductions += (missedPunch - missedPunchAccept) * missedPunchCost;
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
      const additionalPenaltyDays = extraPenaltyDaysPerAbsence * absent;
      deductions += additionalPenaltyDays * dailyRate;
    }
  }

  let overtimePay = 0;
  if (overtimeAllowed) {
    overtimePay +=
      toHours(overtimeNormal) * overtimeSalaryRate * (normalOTMultiplier || 1);

    if (rule9 && weekendMultiplier > 1) {
      overtimePay +=
        toHours(overtimeWeekend) * overtimeSalaryRate * weekendMultiplier;
    } else {
      overtimePay += toHours(overtimeWeekend) * overtimeSalaryRate * 1;
    }

    if (rule10 && holidayMultiplier > 1) {
      overtimePay +=
        toHours(overtimeHoliday) * overtimeSalaryRate * holidayMultiplier;
    } else {
      overtimePay += toHours(overtimeHoliday) * overtimeSalaryRate * 1;
    }
  }

  const weekendNormalShiftPay =
    dailyRate * weekendNormalShiftMultiplier * weekendPresent;
  // if (id === "2109058929") {
  //   console.log(
  //     monthlySalary,
  //     workingDaysUpToCurrent,
  //     weekendNormalShiftMultiplier,
  //     weekendPresent
  //   );
  // }
  const holidayNormalShiftPay =
    dailyRate * holidayNormalShiftMultiplier * holidayPresent;

  earnedSalary += weekendNormalShiftPay + holidayNormalShiftPay;
  presentDaysSalary += weekendNormalShiftPay + holidayNormalShiftPay;

  const totalLeaveDeductions =
    wLeaveDeduction + oLeaveDeduction + sLeaveDeduction;

  const totalPay = (
    earnedSalary -
    deductions -
    otherLeaveDeduction -
    sickLeaveDeduction -
    totalLeaveDeductions +
    overtimePay
  ).toFixed(2);

  // if (id === "70709904") {
  //   console.log(
  //     earnedSalary,
  //     deductions,
  //     otherLeaveDeduction,
  //     sickLeaveDeduction,
  //     totalLeaveDeductions,
  //     overtimePay,
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
    deductions,
    otherLeaveDeduction,
    sickLeaveDeduction,
    sickLeaveDaysUsed,
    overtimeDetails: {
      normal: toHours(overtimeNormal),
      weekend: toHours(overtimeWeekend),
      holiday: toHours(overtimeHoliday),
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
      nonDeductibleLeaveDays: nonDeductibleLeaveDates.size,
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
