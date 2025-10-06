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
  if (minutes < unit) return 0;
  const rem = minutes % unit;
  return rem === 0 ? minutes : minutes + (unit - rem);
}

function parseOtherSalary(otherSalary) {
  if (!otherSalary) return 0;
  if (typeof otherSalary === "number") return otherSalary;
  if (typeof otherSalary === "string" && otherSalary.trim() === "") return 0;
  if (typeof otherSalary === "string") {
    const num = Number(otherSalary);
    if (!isNaN(num)) return num;
  }
  if (Array.isArray(otherSalary)) {
    return otherSalary.reduce((total, item) => {
      if (item && typeof item === "object" && item.amount) {
        return total + Number(item.amount || 0);
      }
      return total;
    }, 0);
  }
  return 0;
}

function parseRule11LeaveConfig(rule11) {
  if (!rule11 || !Array.isArray(rule11.param1)) return null;

  const config = {
    wLeavesConfig: null,
    oLeavesConfig: null,
  };

  if (rule11.param1[6] && rule11.param1[6].dayCount && rule11.param1[6].cost) {
    const dayCount = Number(rule11.param1[6].dayCount);
    const cost = Number(rule11.param1[6].cost);
    if (dayCount > 0 && cost > 0) {
      config.wLeavesConfig = {
        dayCount,
        cost,
        perDayDeduction: cost / dayCount,
      };
    }
  }

  if (rule11.param1[8] && rule11.param1[8].dayCount && rule11.param1[8].cost) {
    const dayCount = Number(rule11.param1[8].dayCount);
    const cost = Number(rule11.param1[8].cost);
    if (dayCount > 0 && cost > 0) {
      config.oLeavesConfig = {
        dayCount,
        cost,
        perDayDeduction: cost / dayCount,
      };
    }
  }

  return config;
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

function calculatePartialLeaveDeduction(
  leaveStart,
  leaveEnd,
  perDayDeduction,
  dailyWorkingHours
) {
  if (!leaveStart || !leaveEnd || !dailyWorkingHours) return 0;

  const leaveDurationMinutes = toMinutes(leaveEnd) - toMinutes(leaveStart);
  const perMinuteDeduction = perDayDeduction / (dailyWorkingHours * 60);

  return perMinuteDeduction * leaveDurationMinutes;
}

function getWorkingDaysInMonth(year, month, weekendDayNames) {
  const weekends = new Set(weekendDayNames);
  let workingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    if (!weekends.has(dayName)) {
      workingDays++;
    }
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
) {
  let workingDays = 0;
  const weekends = Array.from(weekendDayNames);

  for (let d = 1; d <= currentDay; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");

    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    if (holidaysSet.has(dateStr)) {
      continue;
    }

    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    if (weekends.includes(dayName)) {
      continue;
    }

    workingDays++;
  }
  return workingDays;
}

// NEW: Punch and Shift reconciliation functions
const timeToDate = (time) => {
  const [h, m] = time.split(":").map(Number);
  return new Date(2000, 0, 1, h, m);
};

const getMiddleTime = (startTime, endTime) => {
  let start = timeToDate(startTime);
  let end = timeToDate(endTime);

  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  const middle = new Date(start.getTime() + (end - start) / 2);

  return `${String(middle.getHours()).padStart(2, "0")}:${String(
    middle.getMinutes()
  ).padStart(2, "0")}`;
};

const isTimeInInterval = (startTime, endTime, punchTime) => {
  let start = timeToDate(startTime);
  let end = timeToDate(endTime);
  let punch = timeToDate(punchTime);

  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    if (punch < start) {
      punch = new Date(punch.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  return punch.getTime() >= start.getTime() && punch.getTime() <= end.getTime();
};

function getExpectedShiftTimes(rulesModel, date, specialEmployeeData) {
  let expectedTimes = [];

  if (rulesModel.param3 === "normal" || rulesModel.param3 === "special") {
    let workingShifts = rulesModel.param1 || [];
    let overtimeShifts = rulesModel.param2 || [];

    if (rulesModel.param3 === "special") {
      const found = specialEmployeeData.find((item) => item.date === date);
      if (found) {
        workingShifts = found.param1 || [];
        overtimeShifts = found.param2 || [];
      }
    }

    for (const shift of workingShifts) {
      expectedTimes.push(shift.start, shift.end);
    }
    for (const shift of overtimeShifts) {
      expectedTimes.push(shift.start, shift.end);
    }
  } else {
    expectedTimes.push(
      rulesModel.param1 || "00:00",
      rulesModel.param2 || "00:00",
      rulesModel.param3 || "00:00",
      rulesModel.param4 || "00:00",
      rulesModel.param5 || "00:00",
      rulesModel.param6 || "00:00"
    );
  }

  return expectedTimes;
}

function reconcilePunches(rawPunches, expectedShiftTimes, date) {
  let punches = [...rawPunches].sort();
  const matchedPunches = [];

  for (let i = 0; i < expectedShiftTimes.length; i++) {
    const currentTime = expectedShiftTimes[i];

    const totalTimes = expectedShiftTimes.length;
    const previousTime = expectedShiftTimes[(i - 1 + totalTimes) % totalTimes];
    const nextTime = expectedShiftTimes[(i + 1) % totalTimes];

    const leftBoundary = getMiddleTime(previousTime, currentTime);
    const rightBoundary = getMiddleTime(currentTime, nextTime);

    let bestMatchIndex = -1;
    let bestMatchPunchTime = null;
    let minDifference = Infinity;

    for (let j = 0; j < punches.length; j++) {
      const punch = punches[j];

      if (isTimeInInterval(leftBoundary, rightBoundary, punch)) {
        const expectedDate = timeToDate(currentTime);
        let punchDate = timeToDate(punch);

        if (punchDate < expectedDate && punchDate.getHours() < 6) {
          punchDate.setDate(punchDate.getDate() + 1);
        }

        const currentDifference = Math.abs(
          punchDate.getTime() - expectedDate.getTime()
        );

        if (currentDifference < minDifference) {
          minDifference = currentDifference;
          bestMatchIndex = j;
          bestMatchPunchTime = punch;
        }
      }
    }

    if (bestMatchIndex !== -1) {
      punches.splice(bestMatchIndex, 1);
      matchedPunches.push(bestMatchPunchTime);
    } else {
      matchedPunches.push("00:00");
    }
  }

  return {
    punches: matchedPunches,
    date,
    shift: expectedShiftTimes,
  };
}

function punchAndShiftDetails(monthlyAttendance, salaryRules) {
  const rulesModel = salaryRules?.rules?.[0] || {
    param1: [],
    param2: [],
    param3: "normal",
  };
  const table = salaryRules.timeTables || [];
  const punchesDetails = [];
  const specialEmployeeData = rulesModel.param3 === "special" ? table : [];

  for (const record of monthlyAttendance) {
    let rawPunches = [];
    try {
      rawPunches = JSON.parse(record.checkIn || "[]").map((p) => p.toString());
    } catch (e) {
      console.error("Error parsing checkIn data:", e, record.checkIn);
      continue;
    }

    const date = record.date;

    const expectedShiftTimes = getExpectedShiftTimes(
      rulesModel,
      date,
      specialEmployeeData
    );

    const reconciliation = reconcilePunches(
      rawPunches,
      expectedShiftTimes,
      date
    );

    if (reconciliation.shift.length > 0) {
      punchesDetails.push(reconciliation);
    }
  }

  return punchesDetails;
}

export function calculateSalary(attendanceRecords, payPeriod, salaryRules, id) {
  // if (id === "2109058927") {
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
  const rule11Config = parseRule11LeaveConfig(rule11);

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

  const monthlySalary = Number(payPeriod.salary || 0);
  const otherSalary = parseOtherSalary(payPeriod.otherSalary);

  const dailyWorkingHours = Number(payPeriod.name || 8);
  const isFixedHourlyRate = payPeriod.isSelectedFixedHourlyRate || false;
  const overtimeSalaryRate = isFixedHourlyRate
    ? Number(payPeriod.overtimeFixed || 0) * dailyWorkingHours
    : Number(payPeriod.overtimeSalary || 0);

  let year, month;

  if (attendanceRecords.length > 0) {
    const [y, m] = attendanceRecords[0].date.split("-");
    year = Number(y);
    month = Number(m);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const workingDaysConfigured = getWorkingDaysInMonth(
    year,
    month,
    weekendDayNames
  );

  const now = new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // console.log(currentMonth, currentYear, month, year);

  let workingDaysUpToCurrent = workingDaysConfigured;
  if (year === currentYear && month === currentMonth) {
    workingDaysUpToCurrent = getWorkingDaysUpToDate(
      year,
      month,
      currentDay,
      weekendDayNames,
      holidaysSet,
      generalDaysSet,
      replaceDaysSet
    );
  }

  const standardPay = monthlySalary + otherSalary;
  const dailyRate =
    workingDaysConfigured > 0 ? monthlySalary / workingDaysConfigured : 0;

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

  // NEW: Get reconciled punch and shift details
  const punchDetails = punchAndShiftDetails(attendanceRecords, salaryRules);

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
  let wLeaveDaysCount = 0;
  let oLeaveDaysCount = 0;
  const nonDeductibleLeaveDates = new Set();

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

    // Check for leaves on this date
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
      (rLeave && !rLeave.date.start && !rLeave.date.end);

    if (hasFullDayLeave) {
      nonDeductibleLeaveDates.add(date);
    }

    // Process deductible leaves
    if (rule11 && rule11Config) {
      if (
        wLeave &&
        wLeave.date.start &&
        wLeave.date.end &&
        rule11Config.wLeavesConfig
      ) {
        const deduction = calculatePartialLeaveDeduction(
          wLeave.date.start,
          wLeave.date.end,
          rule11Config.wLeavesConfig.perDayDeduction,
          dailyWorkingHours
        );
        wLeaveDeduction += deduction;
        wLeaveDaysCount += 1;
      } else if (
        wLeave &&
        !wLeave.date.start &&
        !wLeave.date.end &&
        rule11Config.wLeavesConfig
      ) {
        wLeaveDeduction += rule11Config.wLeavesConfig.perDayDeduction;
        wLeaveDaysCount += 1;
      }

      if (
        oLeave &&
        oLeave.date.start &&
        oLeave.date.end &&
        rule11Config.oLeavesConfig
      ) {
        const deduction = calculatePartialLeaveDeduction(
          oLeave.date.start,
          oLeave.date.end,
          rule11Config.oLeavesConfig.perDayDeduction,
          dailyWorkingHours
        );
        oLeaveDeduction += deduction;
        oLeaveDaysCount += 1;
      } else if (
        oLeave &&
        !oLeave.date.start &&
        !oLeave.date.end &&
        rule11Config.oLeavesConfig
      ) {
        oLeaveDeduction += rule11Config.oLeavesConfig.perDayDeduction;
        oLeaveDaysCount += 1;
      }
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

        // if (id === "2109058927") {
        //   console.log("Missed punch on", date, missedCount);
        // }
      }
      // Don't count late/early/lateness when there's a missed punch
      return;
    }

    // NEW: Late count logic (only index 0 and index 2)
    // Index 0: Shift start
    if (punches[0] && punches[0] !== "00:00" && shift[0]) {
      const punchMins = toMinutes(punches[0]);
      const shiftMins = toMinutes(shift[0]);
      const lateThresh = shiftMins + latenessGraceMin;

      if (punchMins > lateThresh) {
        const lateMins = punchMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        // if (id === "2109058927") {
        //   console.log("Late on", date, lateMins, lateCount);
        // }

        if (rule18) {
          const halfDayBoundary = toMinutes("12:00");
          if (punchMins < halfDayBoundary) halfDayLateCount += 1;
          else fullDayLateCount += 1;
        }
      }
    }

    // Index 2: Lunch in
    if (punches[2] && punches[2] !== "00:00" && shift[2]) {
      const punchMins = toMinutes(punches[2]);
      const shiftMins = toMinutes(shift[2]);

      if (punchMins > shiftMins) {
        const lateMins = punchMins - shiftMins;
        lateCount += 1;
        totalLatenessMinutes += lateMins;
        // if (id === "2109058927") {
        //   console.log("Late on", date, lateMins);
        // }
      }
    }

    // NEW: Early departure logic (only index 1 and index 3)
    // Index 1: Lunch out
    if (punches[1] && punches[1] !== "00:00" && shift[1]) {
      const punchMins = toMinutes(punches[1]);
      const shiftMins = toMinutes(shift[1]);

      if (punchMins < shiftMins) {
        earlyDepartureCount += 1;
      }
    }

    // Index 3: Shift end
    if (punches[3] && punches[3] !== "00:00" && shift[3]) {
      const punchMins = toMinutes(punches[3]);
      let shiftMins = toMinutes(shift[3]);

      // Apply flex rule if applicable
      if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
        const shiftStartMins = toMinutes(shift[0]);
        const lateThresh = shiftStartMins + latenessGraceMin;
        const dayLateMins = Math.max(0, toMinutes(punches[0]) - lateThresh);

        if (dayLateMins > 0) {
          const units = Math.ceil(dayLateMins / flexLateUnit);
          shiftMins = shiftMins + units * flexExtraUnit;
        }
      }

      if (punchMins < shiftMins) {
        earlyDepartureCount += 1;
      }
    }

    // if (id === "2109058927") {
    //   console.log("Early departure on", date, earlyDepartureCount);
    // }

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
      normalPresent > 0
        ? (monthlySalary / workingDaysConfigured) * normalPresent
        : 0;
    earnedSalary = presentDaysSalary + otherSalary;
  } else {
    presentDaysSalary = monthlySalary;
    earnedSalary = standardPay;
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

  if (rule8 && minOTUnit > 0) {
    overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
    overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
    overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
  }

  if (rule16 && latePenaltyPerOcc > 0)
    deductions += lateCount * latePenaltyPerOcc;

  if (rule17 && earlyPenaltyPerOcc > 0)
    deductions += earlyDepartureCount * earlyPenaltyPerOcc;

  if (rule18) {
    const dailySalary = dailyRate;
    deductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }

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
    (monthlySalary / workingDaysConfigured) *
    weekendNormalShiftMultiplier *
    weekendPresent;
  const holidayNormalShiftPay =
    (monthlySalary / workingDaysConfigured) *
    holidayNormalShiftMultiplier *
    holidayPresent;

  earnedSalary += weekendNormalShiftPay + holidayNormalShiftPay;
  presentDaysSalary += weekendNormalShiftPay + holidayNormalShiftPay;

  const totalLeaveDeductions = wLeaveDeduction + oLeaveDeduction;

  const totalPay =
    earnedSalary -
    deductions -
    otherLeaveDeduction -
    sickLeaveDeduction -
    totalLeaveDeductions +
    overtimePay;

  return {
    attendanceStats: {
      lateCount,
      earlyDepartureCount,
      missedPunch,
      totalLatenessHours: toHours(totalLatenessMinutes),
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
    workingDays: workingDaysConfigured,
    workingDaysUpToCurrent,
    replaceDaysArr,
    otherSalaryBreakdown: {
      original: payPeriod.otherSalary,
      parsed: otherSalary,
      type: typeof payPeriod.otherSalary,
    },
    rule11LeaveInfo: {
      hasRule11: !!rule11,
      nonDeductibleLeaveDays: nonDeductibleLeaveDates.size,
      wLeaveDays: wLeaveDaysCount,
      oLeaveDays: oLeaveDaysCount,
      wLeaveDeduction: wLeaveDeduction,
      oLeaveDeduction: oLeaveDeduction,
      totalLeaveDeductions: totalLeaveDeductions,
      rule11Config: rule11Config,
      dailyWorkingHours: dailyWorkingHours,
      isFixedHourlyRate: isFixedHourlyRate,
    },
    punchDetailsDebug: punchDetails,
  };
}
