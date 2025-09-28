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
    return dateStr.split("T")[0]; // safely strip time
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

  return null; // if no second numeric found
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
  const id = String(ruleNumber - 1); // ruleId == ruleNumber - 1
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

// Enhanced function to parse otherSalary
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

// Enhanced function to parse Rule 1 (shifts and overtime) - now supports Rule 0
function parseRule1(rule1) {
  if (!rule1) return null;

  const params = getParamsArray(rule1);

  // Check if param1 is an array (new complex format)
  if (Array.isArray(rule1.param1)) {
    return {
      format: "complex",
      normalShifts: rule1.param1 || [],
      overtimeShifts: rule1.param2 || [],
      shiftType: rule1.param3 || "normal",
      crossMidnightTime: rule1.param7 || "00:00",
    };
  }

  // Old format - simple parameters
  return {
    format: "simple",
    shiftStart: params[0] || "08:00",
    halfDayBoundary: params[1] || "12:00",
    lunchEnd: params[2] || "13:00",
    shiftEnd: params[3] || "17:00",
    otStart: params[4] || "18:00",
    otEnd: params[5] || "20:00",
    crossMidnightTime: params[6] || "00:00",
  };
}

// NEW: Function to get Rule 0 configuration for an employee
function getRule0Config(empId, filteredRules) {
  const rule0 = filteredRules.find(
    (r) =>
      String(r.ruleId) === "0" &&
      Number(r.ruleStatus) === 1 &&
      String(r.empId) === String(empId)
  );
  return rule0;
}

// NEW: Function to get time table entry for specific date and employee
function getTimeTableForDate(empId, date, timeTables) {
  if (!Array.isArray(timeTables)) return null;

  const normalizedDate = normalizeDate(date);
  return timeTables.find(
    (entry) =>
      String(entry.empId) === String(empId) &&
      normalizeDate(entry.date) === normalizedDate &&
      String(entry.ruleId) === "0"
  );
}

// Enhanced function to get shift information for a given time
function getShiftForTime(
  checkInTime,
  shiftRules,
  crossMidnightTime,
  empId,
  date,
  rule0Config,
  timeTables
) {
  // NEW: Handle Rule 0 logic first
  if (rule0Config) {
    if (rule0Config.param3 === "special") {
      // Get from time table
      const timeTableEntry = getTimeTableForDate(empId, date, timeTables);
      if (timeTableEntry) {
        return {
          format: "complex",
          normalShifts: timeTableEntry.param1 || [],
          overtimeShifts: timeTableEntry.param2 || [],
          shiftType: "special",
          crossMidnight: toMinutes(crossMidnightTime || "00:00"),
          shiftStart:
            timeTableEntry.param1 && timeTableEntry.param1[0]
              ? toMinutes(timeTableEntry.param1[0].start)
              : toMinutes("08:00"),
          shiftEnd:
            timeTableEntry.param1 &&
            timeTableEntry.param1[timeTableEntry.param1.length - 1]
              ? toMinutes(
                  timeTableEntry.param1[timeTableEntry.param1.length - 1].end
                )
              : toMinutes("17:00"),
          halfDayBoundary: toMinutes("12:00"),
          otStart:
            timeTableEntry.param2 && timeTableEntry.param2[0]
              ? toMinutes(timeTableEntry.param2[0].start)
              : null,
          otEnd:
            timeTableEntry.param2 && timeTableEntry.param2[0]
              ? toMinutes(timeTableEntry.param2[0].end)
              : null,
        };
      }
    } else {
      // Regular Rule 0 (complex or simple format)
      const config = parseRule1(rule0Config);
      if (config) {
        if (config.format === "complex") {
          return {
            format: "complex",
            normalShifts: config.normalShifts,
            overtimeShifts: config.overtimeShifts,
            shiftType: config.shiftType,
            crossMidnight: toMinutes(config.crossMidnightTime || "00:00"),
            shiftStart:
              config.normalShifts && config.normalShifts[0]
                ? toMinutes(config.normalShifts[0].start)
                : toMinutes("08:00"),
            shiftEnd:
              config.normalShifts &&
              config.normalShifts[config.normalShifts.length - 1]
                ? toMinutes(
                    config.normalShifts[config.normalShifts.length - 1].end
                  )
                : toMinutes("17:00"),
            halfDayBoundary: toMinutes("12:00"),
            otStart:
              config.overtimeShifts && config.overtimeShifts[0]
                ? toMinutes(config.overtimeShifts[0].start)
                : null,
            otEnd:
              config.overtimeShifts && config.overtimeShifts[0]
                ? toMinutes(config.overtimeShifts[0].end)
                : null,
          };
        } else {
          return {
            format: "simple",
            shiftStart: toMinutes(config.shiftStart),
            shiftEnd: toMinutes(config.shiftEnd),
            halfDayBoundary: toMinutes(config.halfDayBoundary),
            otStart: toMinutes(config.otStart),
            otEnd: toMinutes(config.otEnd),
            crossMidnight: toMinutes(config.crossMidnightTime),
          };
        }
      }
    }
  }

  // Original logic for Rule 1 shifts
  if (!shiftRules || shiftRules.length === 0) return null;

  const checkInMinutes = toMinutes(checkInTime);
  const crossMidnightMinutes = toMinutes(crossMidnightTime || "00:00");

  // Adjust time if crossing midnight
  let adjustedMinutes = checkInMinutes;
  if (crossMidnightMinutes > 0 && checkInMinutes < crossMidnightMinutes) {
    adjustedMinutes += 1440; // Add 24 hours
  }

  // Try to find a matching shift
  for (const shift of shiftRules) {
    const shiftConfig = parseRule1(shift);
    if (!shiftConfig) continue;

    if (shiftConfig.format === "complex") {
      const normalShifts = shiftConfig.normalShifts;
      for (const normalShift of normalShifts) {
        const start = toMinutes(normalShift.start || "00:00");
        const end = toMinutes(normalShift.end || "23:59");

        // Allow early check-in (e.g., 07:59 for 08:00 shift)
        if (adjustedMinutes >= start - 10 && adjustedMinutes <= end) {
          const otStart = shiftConfig.overtimeShifts?.[0]?.start
            ? toMinutes(shiftConfig.overtimeShifts[0].start)
            : null;
          const otEnd = shiftConfig.overtimeShifts?.[0]?.end
            ? toMinutes(shiftConfig.overtimeShifts[0].end)
            : null;

          return {
            format: "complex",
            shiftStart: start,
            shiftEnd: end,
            halfDayBoundary: toMinutes("12:00"),
            otStart,
            otEnd,
            crossMidnight: crossMidnightMinutes,
            normalShifts,
            overtimeShifts: shiftConfig.overtimeShifts,
          };
        }
      }
    } else {
      const shiftStart = toMinutes(shiftConfig.shiftStart);
      const shiftEnd = toMinutes(shiftConfig.shiftEnd);

      // Allow early check-in (within 10 minutes)
      if (adjustedMinutes >= shiftStart - 10 && adjustedMinutes <= shiftEnd) {
        return {
          format: "simple",
          shiftStart,
          shiftEnd,
          halfDayBoundary: toMinutes(shiftConfig.halfDayBoundary),
          otStart: toMinutes(shiftConfig.otStart),
          otEnd: toMinutes(shiftConfig.otEnd),
          crossMidnight: crossMidnightMinutes,
        };
      }
    }
  }

  // Fallback to first valid rule
  const firstValid = shiftRules.find(
    (r) => r.ruleStatus === 1 && r.ruleId !== "24"
  );
  if (firstValid) {
    const config = parseRule1(firstValid);
    if (config) {
      return config.format === "simple"
        ? {
            format: "simple",
            shiftStart: toMinutes(config.shiftStart),
            shiftEnd: toMinutes(config.shiftEnd),
            halfDayBoundary: toMinutes(config.halfDayBoundary),
            otStart: toMinutes(config.otStart),
            otEnd: toMinutes(config.otEnd),
            crossMidnight: toMinutes(config.crossMidnightTime),
          }
        : {
            format: "complex",
            shiftStart: toMinutes(config.normalShifts[0]?.start || "00:00"),
            shiftEnd: toMinutes(config.normalShifts[0]?.end || "23:59"),
            halfDayBoundary: toMinutes("12:00"),
            otStart: toMinutes(config.overtimeShifts?.[0]?.start || "18:00"),
            otEnd: toMinutes(config.overtimeShifts?.[0]?.end || "20:00"),
            crossMidnight: toMinutes(config.crossMidnightTime),
          };
    }
  }

  return null;
}

// Enhanced overtime calculation for complex shifts
function calculateOvertimeForComplexShift(
  checkInTime,
  checkOutTime,
  shiftInfo
) {
  if (!shiftInfo || shiftInfo.format !== "complex") return 0;

  const inMins = toMinutes(checkInTime);
  const outMins = toMinutes(checkOutTime);
  let totalOvertime = 0;

  if (shiftInfo.overtimeShifts && shiftInfo.overtimeShifts.length > 0) {
    for (const otPeriod of shiftInfo.overtimeShifts) {
      const otStart = toMinutes(otPeriod.start || "18:00");
      const otEnd = toMinutes(otPeriod.end || "20:00");

      if (outMins > otStart) {
        const actualOTStart = Math.max(otStart, inMins);
        const actualOTEnd = Math.min(otEnd, outMins);
        const otMinutes = Math.max(0, actualOTEnd - actualOTStart);
        totalOvertime += otMinutes;
      }
    }
  }

  return totalOvertime;
}

// --- Helper for working days calculation ---
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

// --- Helper for working days calculation up to current date ---
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

    // Combine into YYYY-MM-DD
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const date = new Date(dateStr);

    // Get weekday name
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // ✅ Apply rules in correct priority
    if (replaceDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    if (holidaysSet.has(dateStr)) {
      continue; // holiday → skip
    }

    if (generalDaysSet.has(dateStr)) {
      workingDays++;
      continue;
    }

    if (weekends.includes(dayName)) {
      continue; // weekend → skip
    }

    // Otherwise → working
    workingDays++;
  }
  return workingDays;
}

export function calculateSalary(attendanceRecords, payPeriod, salaryRules, id) {
  if (id === "2109058927") {
    console.log(attendanceRecords);
  }

  // ============================================================================
  // RULE PARSING SECTION - Extract all rules from salaryRules.rules array
  // ============================================================================
  const rulesArr = Array.isArray(salaryRules.rules)
    ? salaryRules.rules
    : tryParseMaybeString(salaryRules.rules);

  // Filter out ruleId: 24 (future Rule 25), skip it
  const filteredRules = rulesArr.filter((r) => r.ruleId !== "24");

  // NEW: Extract time tables for Rule 0 special handling
  const timeTables = Array.isArray(salaryRules.timeTables)
    ? salaryRules.timeTables
    : tryParseMaybeString(salaryRules.timeTables) || [];

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

  // ============================================================================
  // RULE 3: WEEKEND SELECTION - Extract weekend day names from rules
  // ============================================================================
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

  // ============================================================================
  // RULE 0 & RULE 1: SHIFTS & OVERTIME PERIODS
  // ============================================================================
  // NEW: Get Rule 0 configuration for this employee
  const rule0Config = getRule0Config(id, filteredRules);

  const shiftRules = filteredRules.filter(
    (r) => String(r.ruleId) === String(1 - 1) && Number(r.ruleStatus) === 1
  );

  const rule1 = getRule(1);
  const shiftConfig = parseRule1(rule1);
  const crossMidnightTime = shiftConfig?.crossMidnightTime || "00:00";

  // Get other rules (Rule 5-23, skipping Rule 24)
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
  const sickLeaveDays = Number(rule11?.param3 || 0);
  const sickLeaveType = rule11?.param4 || "proportional";
  const sickLeaveAmount = Number(rule11?.param5 || 0);

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

  // Ignore Rule 24 (future use)
  const overtimeAllowed = true; // Assume enabled unless explicitly disabled later
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  // ============================================================================
  // ENHANCED PAY PERIOD CONFIGURATION
  // ============================================================================
  const monthlySalary = Number(payPeriod.salary || 0);
  const otherSalary = parseOtherSalary(payPeriod.otherSalary);

  // ============================================================================
  // WORKING DAYS CALCULATION
  // ============================================================================
  let year, month;

  if (attendanceRecords.length > 0) {
    const [y, m] = attendanceRecords[0].date.split("-"); // "2025-09-01"
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

  // ============================================================================
  // SALARY RATE CALCULATIONS
  // ============================================================================
  const overtimeSalaryRate = Number(payPeriod.overtimeSalary || 0);
  const standardPay = monthlySalary + otherSalary;
  const dailyRate =
    workingDaysConfigured > 0 ? monthlySalary / workingDaysConfigured : 0;

  // ============================================================================
  // RULE 12: MISSED PUNCH DOCUMENT VERIFICATION
  // ============================================================================
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

  // ============================================================================
  // ATTENDANCE PROCESSING
  // ============================================================================
  let lateCount = 0;
  let earlyDepartureCount = 0;
  let missedPunch = 0;
  let missedFullPunch = 0;
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

  attendanceRecords.forEach((rec) => {
    const dateRaw = rec?.date;
    const date = normalizeDate(dateRaw);
    if (!date) return;

    const isHoliday = holidaysSet.has(date);
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekendByName = weekendDayNames.has(dayName);

    const isGeneralDay = generalDaysSet.has(date);
    const isWeekend =
      weekendByName && !isGeneralDay && !replaceDaysSet.has(date);
    const isReplacedWorkday = replaceDaysSet.has(date);

    const isWorkingDay =
      isGeneralDay || (!isHoliday && !isWeekend) || isReplacedWorkday;

    let checkIns = [];
    if (Array.isArray(rec?.checkIn)) checkIns = rec.checkIn;
    else if (typeof rec?.checkIn === "string") {
      try {
        checkIns = JSON.parse(rec.checkIn);
      } catch {
        checkIns = tryParseMaybeString(rec.checkIn);
      }
    } else {
      checkIns = [];
    }

    // NEW: Handle Rule 0 special case - check if employee is present in time table
    if (rule0Config && rule0Config.param3 === "special") {
      const timeTableEntry = getTimeTableForDate(id, date, timeTables);
      if (timeTableEntry) {
        // Employee has a schedule for this date
        if (!checkIns || checkIns.length === 0) {
          // Absent from scheduled day
          if (isWorkingDay) {
            absent += 1;
            missedFullPunch += 1;
          }
          return;
        }
        // Continue with attendance processing using time table data
      } else {
        // No schedule for this date - skip processing
        return;
      }
    } else {
      // Regular processing for non-special Rule 0 or Rule 1
      if (!checkIns || checkIns.length === 0) {
        if (isWorkingDay) {
          absent += 1;
          missedFullPunch += 1;
        }
        return;
      }
    }

    if (isHoliday) {
      holidayPresent += 1;
    } else if (isWeekend) {
      weekendPresent += 1;
    } else if (isWorkingDay) {
      normalPresent += 1;
    }

    const unmatched = checkIns.length % 2;
    if (unmatched) {
      if (isMissedPunchSalaryCut(date, id)) {
        missedPunch += unmatched;
      }
    }

    const firstIn = String(checkIns[0] || "");
    const lastOut = String(checkIns[checkIns.length - 1] || "");

    // MODIFIED: Pass additional parameters for Rule 0 handling
    const shiftInfo = getShiftForTime(
      firstIn,
      shiftRules,
      crossMidnightTime,
      id,
      date,
      rule0Config,
      timeTables
    );
    if (!shiftInfo) return;

    const inMins = toMinutes(firstIn);
    const outMins = toMinutes(lastOut);

    let shiftStart, shiftEnd, halfDayBoundary;

    if (shiftInfo.format === "complex") {
      shiftStart = shiftInfo.shiftStart;
      shiftEnd = shiftInfo.shiftEnd;
      halfDayBoundary = toMinutes("12:00");
    } else {
      shiftStart = shiftInfo.shiftStart;
      shiftEnd = shiftInfo.shiftEnd;
      halfDayBoundary = shiftInfo.halfDayBoundary;
    }

    const gracePeriod = rule5 && latenessGraceMin > 0 ? latenessGraceMin : 0;
    const lateThresh = shiftStart + gracePeriod;

    if (inMins > lateThresh) {
      const lateMins = inMins - lateThresh;
      lateCount += 1;
      totalLatenessMinutes += lateMins;

      if (rule18) {
        if (inMins < halfDayBoundary) halfDayLateCount += 1;
        else fullDayLateCount += 1;
      }
    }

    let requiredEnd = shiftEnd;
    if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
      const dayLateMins = Math.max(0, inMins - (shiftStart + gracePeriod));
      if (dayLateMins > 0) {
        const units = Math.ceil(dayLateMins / flexLateUnit);
        requiredEnd = shiftEnd + units * flexExtraUnit;
      }
    }

    if (outMins < requiredEnd) {
      earlyDepartureCount += 1;
    }

    // === OVERTIME LOGIC ===
    if (shiftInfo.format === "complex") {
      const complexOvertime = calculateOvertimeForComplexShift(
        firstIn,
        lastOut,
        shiftInfo
      );

      if (isHoliday && rule10) {
        overtimeHoliday += complexOvertime;
      } else if (isWeekend && rule9) {
        overtimeWeekend += complexOvertime;
      } else if (!isHoliday && !isWeekend) {
        overtimeNormal += complexOvertime;
      }
    } else {
      const otStart = shiftInfo.otStart;
      const otEnd = shiftInfo.otEnd;

      if (isHoliday && rule10 && otStart !== null && otEnd !== null) {
        overtimeHoliday += Math.max(0, outMins - otStart);
      } else if (isWeekend && rule9 && otStart !== null && otEnd !== null) {
        overtimeWeekend += Math.max(0, outMins - otStart);
      } else if (
        !isHoliday &&
        !isWeekend &&
        otStart !== null &&
        otEnd !== null
      ) {
        const extra = Math.max(0, Math.min(outMins, otEnd) - otStart);
        overtimeNormal += extra;
      }
    }
  });

  absent = Math.max(0, workingDaysUpToCurrent - normalPresent);

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

  // Deductions
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

    // NEW: Check Rule 0 first for night shift detection
    if (rule0Config) {
      if (rule0Config.param3 === "special") {
        // Check time tables for night shift patterns
        const hasNightShift = timeTables.some((entry) => {
          if (
            String(entry.empId) === String(id) &&
            entry.param1 &&
            Array.isArray(entry.param1)
          ) {
            return entry.param1.some(
              (shift) => toMinutes(shift.start) >= toMinutes("18:00")
            );
          }
          return false;
        });
        isNightShift = hasNightShift;
      } else if (Array.isArray(rule0Config.param1)) {
        // Complex Rule 0 format
        isNightShift = rule0Config.param1.some(
          (shift) => toMinutes(shift.start) >= toMinutes("18:00")
        );
      } else {
        // Simple Rule 0 format
        const startMin = toMinutes(rule0Config.param1);
        if (startMin >= toMinutes("18:00")) isNightShift = true;
      }
    } else if (shiftRules && shiftRules.length > 0) {
      // Original Rule 1 logic
      const firstShift = parseRule1(shiftRules[0]);
      if (firstShift && firstShift.format === "simple") {
        const startMin = toMinutes(firstShift.shiftStart);
        if (startMin >= toMinutes("18:00")) isNightShift = true;
      } else if (firstShift && firstShift.format === "complex") {
        const normalShifts = firstShift.normalShifts || [];
        for (const shift of normalShifts) {
          if (toMinutes(shift.start) >= toMinutes("18:00")) {
            isNightShift = true;
            break;
          }
        }
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

  if (rule14 && daysPenaltyPerAbsence > 0 && absent > 0) {
    const extraPenaltyDaysPerAbsence = Math.max(0, daysPenaltyPerAbsence - 1);
    if (extraPenaltyDaysPerAbsence > 0) {
      const additionalPenaltyDays = extraPenaltyDaysPerAbsence * absent;
      deductions += additionalPenaltyDays * dailyRate;
    }
  }

  // Overtime Pay
  let overtimePay = 0;
  if (overtimeAllowed) {
    overtimePay +=
      toHours(overtimeNormal) *
      (overtimeSalaryRate || 0) *
      (normalOTMultiplier || 1);

    if (rule9 && weekendMultiplier > 1) {
      overtimePay +=
        toHours(overtimeWeekend) *
        (overtimeSalaryRate || 0) *
        weekendMultiplier;
    } else {
      overtimePay += toHours(overtimeWeekend) * (overtimeSalaryRate || 0) * 1;
    }

    if (rule10 && holidayMultiplier > 1) {
      overtimePay +=
        toHours(overtimeHoliday) *
        (overtimeSalaryRate || 0) *
        holidayMultiplier;
    } else {
      overtimePay += toHours(overtimeHoliday) * (overtimeSalaryRate || 0) * 1;
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

  const totalPay =
    earnedSalary -
    deductions -
    otherLeaveDeduction -
    sickLeaveDeduction +
    overtimePay;

  return {
    attendanceStats: {
      lateCount,
      earlyDepartureCount,
      missedPunch,
      missedFullPunch,
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
    crossMidnightTime,
    otherSalaryBreakdown: {
      original: payPeriod.otherSalary,
      parsed: otherSalary,
      type: typeof payPeriod.otherSalary,
    },
    shiftConfiguration: {
      format: shiftConfig?.format || "none",
      details: shiftConfig,
    },
    // NEW: Rule 0 debugging information
    rule0Info: {
      hasRule0: !!rule0Config,
      isSpecial: rule0Config?.param3 === "special",
      timeTablesFound: timeTables.length,
      rule0Config: rule0Config,
    },
  };
}
