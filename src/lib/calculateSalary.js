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
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    return "Failed to parse date";
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
// --- Helper for working days calculation ---
function getWorkingDaysInMonth(
  year,
  month,
  weekendDayNames,
  holidaysSet = new Set(),
  generalDaysSet = new Set(),
  replaceDaysSet = new Set()
) {
  let workingDays = 0;
  const weekends = Array.from(weekendDayNames);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toISOString().slice(0, 10);

    const isHoliday = holidaysSet.has(dateStr);
    const isGeneralDay = generalDaysSet.has(dateStr); // forced workday (even if weekend)
    const isReplaceDay = replaceDaysSet.has(dateStr); // replacement workday
    const weekendByName = weekends.includes(dayName);

    // If a date is a generalDay it must be counted as a working day.
    // A date is a weekend only if its weekday is in weekend list and it is not a generalDay and not a replacement-day override.
    const isWeekend = weekendByName && !isGeneralDay && !isReplaceDay;

    // Working day if:
    //  - it's specified as generalDay OR
    //  - not holiday and not weekend OR
    //  - explicitly a replacement workday
    const isWorkingDay =
      isGeneralDay || (!isHoliday && !isWeekend) || isReplaceDay;

    if (isWorkingDay) workingDays++;
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
    const date = new Date(year, month, d);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toISOString().slice(0, 10);

    const isHoliday = holidaysSet.has(dateStr);
    const weekendByName = weekends.includes(dayName);

    //  FIXED RULE 4 & 13
    const isGeneralDay = generalDaysSet.has(dateStr);
    const isWeekend =
      weekendByName && !isGeneralDay && !replaceDaysSet.has(dateStr);
    const isReplacedWorkday = replaceDaysSet.has(dateStr);

    const isWorkingDay =
      isGeneralDay || (!isHoliday && !isWeekend) || isReplacedWorkday;

    if (isWorkingDay) {
      workingDays++;
    }
  }
  return workingDays;
}
// --- Helper for cross-midnight time handling (Rule 1) ---
function getShiftForTime(checkInTime, shiftRules, crossMidnightTime) {
  if (!shiftRules || shiftRules.length === 0) return null;

  const checkInMinutes = toMinutes(checkInTime);
  const crossMidnightMinutes = toMinutes(crossMidnightTime || "00:00");

  // If cross-midnight is set, determine which day the check-in belongs to
  let adjustedMinutes = checkInMinutes;
  if (crossMidnightMinutes > 0 && checkInMinutes < crossMidnightMinutes) {
    // This check-in belongs to the previous day
    adjustedMinutes = checkInMinutes + 1440; // Add 24 hours
  }

  // Find the appropriate shift based on time
  for (const shift of shiftRules) {
    const params = getParamsArray(shift);
    if (params.length >= 4) {
      const shiftStart = toMinutes(params[0] || "00:00");
      const shiftEnd = toMinutes(params[3] || "23:59");

      if (adjustedMinutes >= shiftStart && adjustedMinutes <= shiftEnd) {
        return {
          shiftStart,
          shiftEnd,
          halfDayBoundary: params[1] ? toMinutes(params[1]) : null,
          otStart: params[4] ? toMinutes(params[4]) : null,
          otEnd: params[5] ? toMinutes(params[5]) : null,
          crossMidnight: crossMidnightMinutes,
        };
      }
    }
  }

  // Return default shift if no match found
  const defaultShift = shiftRules[0];
  if (defaultShift) {
    const params = getParamsArray(defaultShift);
    return {
      shiftStart: params[0] ? toMinutes(params[0]) : null,
      shiftEnd: params[3] ? toMinutes(params[3]) : null,
      halfDayBoundary: params[1] ? toMinutes(params[1]) : null,
      otStart: params[4] ? toMinutes(params[4]) : null,
      otEnd: params[5] ? toMinutes(params[5]) : null,
      crossMidnight: crossMidnightMinutes,
    };
  }

  return null;
}

export function calculateSalary(attendanceRecords, payPeriod, salaryRules, id) {
  // Validate input parameters
  // if (attendanceRecords.length === 0) {
  //   return "No attendance records";
  // }

  if (id === "70709903") {
    console.log(attendanceRecords);
  }

  // ============================================================================
  // RULE PARSING SECTION - Extract all rules from salaryRules.rules array
  // ============================================================================

  // Parse rules array and various configuration arrays
  // ============================================================================
  // RULE PARSING SECTION - Extract all rules from salaryRules.rules array
  // ============================================================================

  // Parse rules array and various configuration arrays
  const rulesArr = Array.isArray(salaryRules.rules)
    ? salaryRules.rules
    : tryParseMaybeString(salaryRules.rules);
  const holidaysArr = Array.isArray(salaryRules.holidays)
    ? salaryRules.holidays
    : tryParseMaybeString(salaryRules.holidays);
  const generalDaysArr = Array.isArray(salaryRules.generalDays)
    ? salaryRules.generalDays
    : tryParseMaybeString(salaryRules.generalDays);
  const replaceDaysArr = Array.isArray(salaryRules.replaceDays)
    ? salaryRules.replaceDays
    : tryParseMaybeString(salaryRules.replaceDays);

  // Create sets for efficient lookup of holidays, weekends, and replacement days
  const holidaysSet = new Set(
    (holidaysArr || []).map(normalizeDate).filter(Boolean)
  );

  //  FIXED RULE 13 (Replacement Days)
  const replaceDaysSet = new Set(
    (replaceDaysArr || []).map(normalizeDate).filter(Boolean)
  );

  //  FIXED RULE 4 (General Days = Required Workdays)
  const generalDaysSet = new Set(
    (generalDaysArr || []).map(normalizeDate).filter(Boolean)
  );

  // ============================================================================
  // RULE 3: WEEKEND SELECTION - Extract weekend day names from rules
  // ============================================================================
  const weekendDayNames = new Set();
  const allRule3s = (rulesArr || []).filter(
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

  // Helper function to get rules by number
  const getRule = (n) => getRuleByNumber(rulesArr, n);

  // ============================================================================
  // RULE 1: SHIFTS & OVERTIME PERIODS - Extract shift configurations
  // ============================================================================
  const shiftRules = (rulesArr || []).filter(
    (r) => String(r.ruleId) === String(1 - 1) && Number(r.ruleStatus) === 1
  );

  // Rule 1: Enhanced shift handling with cross-midnight support
  const rule1 = getRule(1);
  const crossMidnightTime = rule1?.param7 || "00:00"; // Cross-midnight time setting

  // ============================================================================
  // RULE 5: LATENESS GRACE PERIOD - Minutes of grace before lateness starts
  // ============================================================================
  const rule5 = getRule(5);
  const latenessGraceMin = Number(firstNumericParam(rule5) || 0);

  // ============================================================================
  // RULE 6: FLEXIBLE WORKING HOURS - Late arrival = late departure
  // ============================================================================
  const rule6 = getRule(6);
  const flexLateUnit = Number(rule6?.param1 || 0); // Minutes of late arrival
  const flexExtraUnit = Number(rule6?.param2 || 0); // Minutes of extra work required

  // ============================================================================
  // RULE 7: REPLACE LATENESS WITH OVERTIME - Use overtime to offset lateness
  // ============================================================================
  const rule7 = getRule(7);
  const rule7Enabled = !!rule7;

  // ============================================================================
  // RULE 8: MINIMUM OVERTIME UNIT - Round overtime to nearest unit
  // ============================================================================
  const rule8 = getRule(8);
  const minOTUnit = Number(firstNumericParam(rule8) || 0);

  // ============================================================================
  // RULE 9: WEEKEND OVERTIME MULTIPLIER - Pay rate multiplier for weekend work
  // ============================================================================
  const rule9 = getRule(9);
  const weekendMultiplier = Number(firstNumericParam(rule9) || 1);

  // ============================================================================
  // RULE 10: HOLIDAY OVERTIME MULTIPLIER - Pay rate multiplier for holiday work
  // ============================================================================
  const rule10 = getRule(10);
  const holidayMultiplier = Number(firstNumericParam(rule10) || 1);

  // ============================================================================
  // RULE 11: SICK LEAVE & OTHER LEAVE DEDUCTIONS
  // ============================================================================
  const rule11 = getRule(11);
  // Enhanced Rule 11: Sick leave and other leave deduction
  const sickLeaveDays = Number(rule11?.param3 || 0); // Number of sick leave days
  const sickLeaveType = rule11?.param4 || "proportional"; // "fixed" or "proportional"
  const sickLeaveAmount = Number(rule11?.param5 || 0); // Fixed amount or proportion

  // ============================================================================
  // RULE 14: MULTIPLE DAYS PENALTY PER ABSENCE - Deduct multiple days for each absence
  // ============================================================================
  const rule14 = getRule(14);
  const daysPenaltyPerAbsence = Number(firstNumericParam(rule14) || 0);

  // ============================================================================
  // RULE 16: LATE ARRIVAL PENALTY PER OCCURRENCE - Fixed amount per late arrival
  // ============================================================================
  const rule16 = getRule(16);
  const latePenaltyPerOcc = Number(firstNumericParam(rule16) || 0);

  // ============================================================================
  // RULE 17: EARLY DEPARTURE PENALTY PER OCCURRENCE - Fixed amount per early departure
  // ============================================================================
  const rule17 = getRule(17);
  const earlyPenaltyPerOcc = Number(firstNumericParam(rule17) || 0);

  // ============================================================================
  // RULE 18: LATE ARRIVAL PENALTY (HALF/FULL DAY) - Deduct half or full day salary
  // ============================================================================
  const rule18 = getRule(18);

  // ============================================================================
  // RULE 19: HOURLY LATE PENALTY - Deduct per hour of lateness
  // ============================================================================
  const rule19 = getRule(19);
  const perHourLatePenalty = Number(firstNumericParam(rule19) || 0);

  // ============================================================================
  // RULE 20: FIXED PENALTY FOR EXCEEDING LATENESS THRESHOLD
  // ============================================================================
  const rule20 = getRule(20);
  const rule20Threshold = Number((rule20 && firstNumericParam(rule20)) || 0);
  const rule20Fixed = Number(
    (rule20 && firstNonEmptyParam(rule20) && rule20.param2) || 0
  );

  // ============================================================================
  // RULE 21: INCREMENTAL LATE PENALTY - Increasing penalty for frequent lateness
  // ============================================================================
  const rule21 = getRule(21);
  const incrementalLateValue = Number(firstNumericParam(rule21) || 0);

  // ============================================================================
  // RULE 22: SHIFT-BASED PENALTIES - Different penalties for day vs night shifts
  // ============================================================================
  const rule22 = getRule(22);
  const dayShiftPenalty = Number(rule22?.param1 || 0);
  const nightShiftPenalty = Number(rule22?.param2 || 0);

  // ============================================================================
  // RULE 23: MISSED PUNCH PENALTIES - With acceptable number of missed punches
  // ============================================================================
  const rule23 = getRule(23);
  const missedPunchCost = Number(rule23?.param1 || 0);
  const missedPunchAccept = Number(rule23?.param2 || 0);

  // ============================================================================
  // RULE 24: OVERTIME SELECTION & MULTIPLIER - Enable/disable overtime calculation
  // ============================================================================
  const rule24 = getRule(24);
  const overtimeAllowed = rule24 ? JSON.parse(rule24.param1) : false;
  const normalOTMultiplier = Number(rule24?.param2 || 1);

  // ============================================================================
  // PAY PERIOD CONFIGURATION - Extract salary and overtime rates
  // ============================================================================
  const monthlySalary = Number(payPeriod.salary || 0);
  const otherSalary = Number(payPeriod.otherSalary || 0);

  // ============================================================================
  // WORKING DAYS CALCULATION - For current month and up to current date
  // ============================================================================
  let year, month;
  if (attendanceRecords.length > 0) {
    const firstDate = new Date(attendanceRecords[0].date);
    year = firstDate.getFullYear();
    month = firstDate.getMonth();
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  // Calculate total working days for the month (excluding weekends and holidays)
  const workingDaysConfigured = getWorkingDaysInMonth(
    year,
    month,
    weekendDayNames,
    holidaysSet,
    generalDaysSet,
    replaceDaysSet
  );

  // Get current date to calculate working days up to today
  const now = new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Only calculate working days up to current date if we're in the same month
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

  /**
   * Determines if salary should be cut for missed punch based on document verification
   * @param {string} date - The date of the missed punch
   * @param {string|number} empId - Employee ID
   * @returns {boolean} - true if salary should be cut, false if not
   */
  function isMissedPunchSalaryCut(date, empId) {
    const doc = punchDocs.find(
      (d) =>
        normalizeDate(d.date) === normalizeDate(date) &&
        String(d.empId) === String(empId)
    );
    // Enhanced logic: check if document exists and has proper authorization
    if (doc) {
      if (doc.CutSalary === "No") return false; // Don't cut salary - valid document
      if (doc.CutSalary === "Yes") return true; // Cut salary - document rejected
      // Check if document has proper signature/authorization
      if (doc.signature && doc.signature !== "No Signature") return false;
    }
    return true; // Default to cutting salary if no proper document
  }

  // ============================================================================
  // ATTENDANCE PROCESSING - Main loop through all attendance records
  // ============================================================================

  // Initialize all counters and accumulators
  // ============================================================================
  // ATTENDANCE PROCESSING - Main loop through all attendance records
  // ============================================================================

  // Initialize all counters and accumulators
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

  // Process each attendance record
  attendanceRecords.forEach((rec) => {
    const dateRaw = rec?.date;
    const date = normalizeDate(dateRaw);
    if (!date) return;

    // ============================================================================
    // RULE 2-4: HOLIDAYS, WEEKENDS, AND REPLACEMENT DAYS DETERMINATION
    // ============================================================================
    const isHoliday = holidaysSet.has(date);
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekendByName = weekendDayNames.has(dayName);

    //  FIXED RULE 4 & 13
    const isGeneralDay = generalDaysSet.has(date); // must attend
    const isWeekend =
      weekendByName && !isGeneralDay && !replaceDaysSet.has(date);
    const isReplacedWorkday = replaceDaysSet.has(date);

    // Attendance requirement
    const isWorkingDay =
      isGeneralDay || (!isHoliday && !isWeekend) || isReplacedWorkday;

    // Parse check-in/check-out times
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

    // Handle complete absence (no check-ins)
    if (!checkIns || checkIns.length === 0) {
      if (isWorkingDay) {
        absent += 1;
        missedFullPunch += 1;
      }
      return;
    }

    // Count attendance based on day type
    if (isHoliday) {
      holidayPresent += 1; // worked on holiday
    } else if (isWeekend) {
      weekendPresent += 1; // worked on weekend
    } else if (isWorkingDay) {
      normalPresent += 1; // normal working day present
    }

    // ============================================================================
    // RULE 23: MISSED PUNCH COUNTING - Count unmatched punch pairs
    // ============================================================================
    const unmatched = checkIns.length % 2;
    if (unmatched) {
      if (isMissedPunchSalaryCut(date, id)) {
        missedPunch += unmatched;
      }
    }

    const firstIn = String(checkIns[0] || "");
    const lastOut = String(checkIns[checkIns.length - 1] || "");

    // ============================================================================
    // RULE 1: SHIFT DETERMINATION - Get appropriate shift for this check-in time
    // ============================================================================
    const shiftInfo = getShiftForTime(firstIn, shiftRules, crossMidnightTime);

    if (!shiftInfo) {
      // No shift configured, skip time-based calculations
      return;
    }

    const inMins = toMinutes(firstIn);
    const outMins = toMinutes(lastOut);
    const shiftStart = shiftInfo.shiftStart;
    const shiftEnd = shiftInfo.shiftEnd;
    const halfDayBoundary = shiftInfo.halfDayBoundary;
    const otStart = shiftInfo.otStart;
    const otEnd = shiftInfo.otEnd;

    // ============================================================================
    // RULE 5-6: LATENESS AND FLEXIBLE WORKING HOURS CALCULATION
    // ============================================================================
    if (shiftStart !== null && shiftEnd !== null) {
      // Rule 5: Lateness grace period - Only apply if employee has this rule configured
      const gracePeriod = rule5 && latenessGraceMin > 0 ? latenessGraceMin : 0;
      const lateThresh = shiftStart + gracePeriod;
      if (inMins > lateThresh) {
        const lateMins = inMins - lateThresh;
        lateCount += 1;
        totalLatenessMinutes += lateMins;

        // ============================================================================
        // RULE 18: HALF/DAY LATE PENALTY DETERMINATION
        // ============================================================================
        if (rule18) {
          const boundary =
            halfDayBoundary !== null ? halfDayBoundary : toMinutes("12:00");
          if (inMins < boundary) halfDayLateCount += 1;
          else fullDayLateCount += 1;
        }
      }

      // ============================================================================
      // RULE 6: FLEXIBLE WORKING HOURS - Adjust required end time based on late arrival
      // ============================================================================
      let requiredEnd = shiftEnd;
      if (rule6 && flexLateUnit > 0 && flexExtraUnit > 0) {
        const dayLateMins = Math.max(0, inMins - (shiftStart + gracePeriod));
        if (dayLateMins > 0) {
          const units = Math.ceil(dayLateMins / flexLateUnit);
          requiredEnd = shiftEnd + units * flexExtraUnit;
        }
      }

      // ============================================================================
      // RULE 17: EARLY DEPARTURE DETECTION
      // ============================================================================
      if (outMins < requiredEnd) {
        earlyDepartureCount += 1;
      }
    }

    // ============================================================================
    // RULE 8-10: OVERTIME CALCULATION (NORMAL, WEEKEND, HOLIDAY)
    // ============================================================================
    // RULE 8-10: OVERTIME CALCULATION (NORMAL, WEEKEND, HOLIDAY)
    // Only calculate holiday overtime if rule10 exists
    if (isHoliday && rule10 && otStart !== null && otEnd !== null) {
      overtimeHoliday += Math.max(0, outMins - otStart);
    }
    // Only calculate weekend overtime if rule9 exists
    else if (isWeekend && rule9 && otStart !== null && otEnd !== null) {
      overtimeWeekend += Math.max(0, outMins - otStart);
    }
    // Normal overtime for working day
    else if (!isHoliday && !isWeekend && otStart !== null && otEnd !== null) {
      const extra = Math.max(0, Math.min(outMins, otEnd) - otStart);
      overtimeNormal += extra;
    }
  });

  // ============================================================================
  // ABSENT CALCULATION - Only count absences for working days up to current date
  // ============================================================================
  absent = Math.max(0, workingDaysUpToCurrent - normalPresent);

  // ============================================================================
  // SALARY CALCULATION LOGIC - Based on whether Rule 14 exists or not
  // ============================================================================

  // If Rule 14 exists: Calculate salary based on normalPresent days only
  // If Rule 14 doesn't exist: Employee gets full standard pay regardless of attendance
  let presentDaysSalary = 0;
  let earnedSalary = 0;

  if (rule14 && daysPenaltyPerAbsence > 0) {
    // Rule 14 exists: Calculate salary based on normalPresent days only
    presentDaysSalary =
      normalPresent > 0
        ? (monthlySalary / workingDaysConfigured) * normalPresent
        : 0;
    earnedSalary = presentDaysSalary + otherSalary;
  } else {
    // Rule 14 doesn't exist: Employee gets full standard pay
    presentDaysSalary = monthlySalary;
    earnedSalary = standardPay; // Full monthly salary + other salary
  }

  // ============================================================================
  // RULE 11: SICK LEAVE DEDUCTION CALCULATION - Based on salary calculation method
  // ============================================================================
  if (rule11 && sickLeaveDays > 0 && sickLeaveDaysUsed > 0) {
    if (sickLeaveType === "fixed") {
      sickLeaveDeduction = sickLeaveAmount * sickLeaveDaysUsed;
    } else {
      // proportional - Based on current salary calculation method
      const proportion = sickLeaveAmount || 1; // Default to full day
      const dailySalary = dailyRate;
      sickLeaveDeduction = dailySalary * proportion * sickLeaveDaysUsed;
    }
  }

  // ============================================================================
  // RULE 7: REPLACE LATENESS WITH OVERTIME - Use overtime to offset lateness
  // ============================================================================
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

  // ============================================================================
  // RULE 8: MINIMUM OVERTIME UNIT ROUNDING - Only apply if employee has this rule configured
  // ============================================================================
  if (rule8 && minOTUnit > 0) {
    overtimeNormal = roundOvertime(overtimeNormal, minOTUnit);
    overtimeWeekend = roundOvertime(overtimeWeekend, minOTUnit);
    overtimeHoliday = roundOvertime(overtimeHoliday, minOTUnit);
  }

  // ============================================================================
  // DEDUCTION CALCULATIONS - Apply all penalty rules
  // ============================================================================

  // Rule 16: Late arrival penalty per occurrence - Only apply if employee has this rule configured
  if (rule16 && latePenaltyPerOcc > 0)
    deductions += lateCount * latePenaltyPerOcc;

  // Rule 17: Early departure penalty per occurrence - Only apply if employee has this rule configured
  if (rule17 && earlyPenaltyPerOcc > 0)
    deductions += earlyDepartureCount * earlyPenaltyPerOcc;

  // Rule 18: Late arrival penalty (half/full day salary) - Based on current salary calculation method
  if (rule18) {
    const dailySalary = dailyRate;
    deductions +=
      halfDayLateCount * (0.5 * dailySalary) + fullDayLateCount * dailySalary;
  }

  // Rule 19: Hourly late penalty - Only apply if employee has this rule configured
  if (rule19 && perHourLatePenalty > 0)
    deductions += toHours(totalLatenessMinutes) * perHourLatePenalty;

  // Rule 20: Fixed penalty for exceeding lateness threshold - Only apply if employee has this rule configured
  if (rule20 && rule20Threshold > 0 && totalLatenessMinutes > rule20Threshold)
    deductions += rule20Fixed;

  // Rule 21: Incremental late penalty - Only apply if employee has this rule configured
  if (rule21 && incrementalLateValue > 0) {
    deductions += (incrementalLateValue * (lateCount * (lateCount + 1))) / 2;
  }

  // Rule 22: Shift-based penalties (day vs night)
  if (rule22 && (dayShiftPenalty || nightShiftPenalty)) {
    let isNightShift = false;
    if (shiftRules && shiftRules.length > 0 && shiftRules[0].param1) {
      const startMin = toMinutes(shiftRules[0].param1);
      if (startMin >= toMinutes("18:00")) isNightShift = true;
    }
    const perOccPenalty = isNightShift ? nightShiftPenalty : dayShiftPenalty;
    if (perOccPenalty) deductions += lateCount * perOccPenalty;
  }

  // Rule 23: Missed punch penalties (only after exceeding acceptable times)
  if (rule23 && missedPunchCost && missedPunch > missedPunchAccept) {
    deductions += (missedPunch - missedPunchAccept) * missedPunchCost;
  }

  // Rule 11: Other leave deductions (marriage leave, etc.) - Based on current salary calculation method
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

  // Rule 14: Multiple days penalty per absence - Only apply if employee has this rule configured
  if (rule14 && daysPenaltyPerAbsence > 0 && absent > 0) {
    // Avoid double-deduction: base pay already excludes 1 day per absence via presentDaysSalary.
    // Apply only the extra penalty days beyond the first day per absence.
    const extraPenaltyDaysPerAbsence = Math.max(0, daysPenaltyPerAbsence - 1);
    if (extraPenaltyDaysPerAbsence > 0) {
      const additionalPenaltyDays = extraPenaltyDaysPerAbsence * absent;
      deductions += additionalPenaltyDays * dailyRate;
    }
  }

  // ============================================================================
  // RULE 9-10, 24: OVERTIME PAY CALCULATION
  // ============================================================================
  let overtimePay = 0;
  if (overtimeAllowed) {
    // Normal overtime
    overtimePay +=
      toHours(overtimeNormal) *
      (overtimeSalaryRate || 0) *
      (normalOTMultiplier || 1);
    // Weekend overtime with multiplier - Only apply if employee has Rule 9 configured
    if (rule9 && weekendMultiplier > 1) {
      overtimePay +=
        toHours(overtimeWeekend) *
        (overtimeSalaryRate || 0) *
        weekendMultiplier;
    } else {
      overtimePay += toHours(overtimeWeekend) * (overtimeSalaryRate || 0) * 1; // Default multiplier
    }
    // Holiday overtime with multiplier - Only apply if employee has Rule 10 configured
    if (rule10 && holidayMultiplier > 1) {
      overtimePay +=
        toHours(overtimeHoliday) *
        (overtimeSalaryRate || 0) *
        holidayMultiplier;
    } else {
      overtimePay += toHours(overtimeHoliday) * (overtimeSalaryRate || 0) * 1; // Default multiplier
    }
  } else {
    overtimePay = 0;
  }

  // ============================================================================
  // FINAL SALARY CALCULATION - Based on Rule 14 Configuration
  // ============================================================================

  // earnedSalary is already calculated above based on Rule 14 existence

  // Calculate total pay based on earned salary (normalPresent days only)
  const totalPay =
    earnedSalary -
    deductions -
    otherLeaveDeduction -
    sickLeaveDeduction +
    overtimePay;

  const punchData = attendanceRecords.map((item, index) => {
    try {
      return {
        date: item.date,
        checkIn: Array.isArray(item.checkIn)
          ? item.checkIn
          : JSON.parse(item.checkIn || "[]"),
      };
    } catch (error) {
      console.error(`Error parsing checkIn for record at index ${index}:`, {
        index,
        date: item.date,
        employeeId: item.empId, // if available
        employeeName: item.employeeName, // if available
        rawCheckIn: item.checkIn,
        error: error.message,
      });

      // Return a safe default or skip this record
      return {
        date: item.date,
        checkIn: [], // or handle as needed
      };
    }
  });

  // ============================================================================
  // RETURN COMPREHENSIVE SALARY REPORT
  // ============================================================================
  return {
    // Attendance statistics
    attendanceStats: {
      lateCount,
      earlyDepartureCount,
      missedPunch,
      missedFullPunch,
      totalLatenessHours: toHours(totalLatenessMinutes),
    },
    // Deductions and penalties
    deductions,
    otherLeaveDeduction,
    sickLeaveDeduction,
    sickLeaveDaysUsed,
    // Overtime details
    overtimeDetails: {
      normal: toHours(overtimeNormal),
      weekend: toHours(overtimeWeekend),
      holiday: toHours(overtimeHoliday),
    },
    overtimePay,
    overtimeSalary: overtimeSalaryRate,
    // Final salary calculations
    standardPay,
    earnedSalary, // Salary based on normalPresent days only
    presentDaysSalary, // Monthly salary portion based on normalPresent days
    totalPay,
    Present: { normalPresent, holidayPresent, weekendPresent },
    absent,
    workingDays: workingDaysConfigured,
    workingDaysUpToCurrent,
    // Additional information
    replaceDaysArr,
    crossMidnightTime,
    punchData,
  };
}
