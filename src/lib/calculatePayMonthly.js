/**
 * Calculate monthly salary with attendance, overtime, and deductions
 * @param {Array<Object>} activeRules - Active payroll rules
 * @param {number} overtimeRateOfUser - User's overtime rate
 * @param {number} monthlySalary - Base monthly salary
 * @param {Object} context - Calculation context containing all necessary data
 */
function calculatePayMonthly(
  activeRules,
  overtimeRateOfUser,
  monthlySalary,
  context
) {
  // Initialize calculation variables
  let sickReduceSalary = 0;
  let othersReduceSalary = 0;

  // Overtime duration trackers (in minutes)
  let weekGroup1 = 0;
  let weekGroup2 = 0;
  let holidayGroup1 = 0;
  let holidayGroup2 = 0;

  // Early return if no data
  if (!context.valuesList || context.valuesList.length === 0) {
    return {
      standardPay: monthlySalary,
      overtimePay: 0,
      deductions: 0,
      error: "No attendance data available",
    };
  }

  // Get date range for processing
  const startDate = new Date(
    context.currentMonth.year,
    context.currentMonth.month - 1, // JavaScript months are 0-indexed
    parseInt(context.valuesList[0][0])
  );
  const endDate = new Date(
    context.currentMonth.year,
    context.currentMonth.month - 1,
    parseInt(context.valuesList[context.valuesList.length - 1][0])
  );

  // Clean up previous replace day records
  context.dbHelper.deleteReplaceDayByTime(
    context.empID,
    startDate.toISOString(),
    endDate.toISOString()
  );

  // Process each day's attendance data
  for (const dayData of context.valuesList) {
    const date = new Date(
      context.currentMonth.year,
      context.currentMonth.month - 1,
      parseInt(dayData[0])
    );

    // Check punch document status
    const hasPunchDocument = context.selectedPunchDocument.includes(
      date.toDateString()
    );
    const hasCutSalary = checkCutSalaryStatus(
      date,
      context.selectMissPunchDocuments
    );

    // Handle weekend/holiday overtime calculations
    if (
      (isWeekend(date, context.weekendDayIndices) ||
        isHoliday(date, context.selectedHolidays)) &&
      !isGeneralDay(date, context.selectedGeneralDays)
    ) {
      const overtimeResults = processWeekendHolidayTimes(
        dayData,
        date,
        hasPunchDocument,
        hasCutSalary,
        context
      );
      weekGroup1 += overtimeResults.weekGroup1;
      weekGroup2 += overtimeResults.weekGroup2;
      holidayGroup1 += overtimeResults.holidayGroup1;
      holidayGroup2 += overtimeResults.holidayGroup2;
    } else {
      // Handle regular working day calculations
      processRegularWorkingDay(
        dayData,
        date,
        hasPunchDocument,
        hasCutSalary,
        context
      );
    }

    // Process overtime (in3/out3 - positions 5,6 in dayData)
    if (
      context.overtimePayOrNot &&
      dayData[5] !== "00:00" &&
      dayData[6] !== "00:00"
    ) {
      processOvertimeHours(dayData, date, context);
    }

    // Handle sick and other leave reductions
    if (isFullDayAbsent(dayData)) {
      if (isSickDay(date, context.selectedSickLeave)) {
        if (context.missedFullPunch > 0) context.missedFullPunch--;
        sickReduceSalary++;
      }
      if (isOtherDay(date, context.selectedOtherLeave)) {
        if (context.missedFullPunch > 0) context.missedFullPunch--;
        othersReduceSalary++;
      }
    }

    // Handle replacement days for non-overtime scenarios
    handleReplacementDays(dayData, date, context);
  }

  // Aggregate total overtime durations
  const overtimeTotals = aggregateOvertimeTotals(
    weekGroup1,
    weekGroup2,
    holidayGroup1,
    holidayGroup2,
    context
  );

  // Apply active rules to calculate deductions and adjustments
  applyActiveRules(activeRules, overtimeRateOfUser, monthlySalary, context);

  // Calculate final pay amounts
  return calculateFinalPayAmounts(
    monthlySalary,
    overtimeRateOfUser,
    sickReduceSalary,
    othersReduceSalary,
    overtimeTotals,
    context
  );
}

/**
 * Check if a specific date has cut salary status
 * @param {Date} date - Date to check
 * @param {Array<Object>} missPunchDocuments - Miss punch documents
 * @returns {boolean} Whether salary should be cut
 */
function checkCutSalaryStatus(date, missPunchDocuments) {
  const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  return missPunchDocuments.some(
    (document) => document.date === dateString && document.CutSalary === "Yes"
  );
}

/**
 * Process weekend/holiday attendance times
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {boolean} hasPunchDocument - Has punch document
 * @param {boolean} hasCutSalary - Should cut salary
 * @param {Object} context - Calculation context
 * @returns {Object} Overtime results for weekend/holiday
 */
function processWeekendHolidayTimes(
  dayData,
  date,
  hasPunchDocument,
  hasCutSalary,
  context
) {
  adjustTimesToStandardHours(dayData, context);

  let weekGroup1 = 0,
    weekGroup2 = 0,
    holidayGroup1 = 0,
    holidayGroup2 = 0;

  if (!context.overtimePayOrNot) {
    return { weekGroup1, weekGroup2, holidayGroup1, holidayGroup2 };
  }

  const hasAnyPunch = dayData.slice(1, 5).some((time) => time !== "00:00");
  if (!hasAnyPunch) {
    return { weekGroup1, weekGroup2, holidayGroup1, holidayGroup2 };
  }

  if (isWeekend(date, context.weekendDayIndices)) {
    const weekendResults = calculateWeekendOvertime(
      dayData,
      hasPunchDocument,
      hasCutSalary,
      context
    );
    weekGroup1 = weekendResults.group1;
    weekGroup2 = weekendResults.group2;
  }

  if (isHoliday(date, context.selectedHolidays)) {
    const holidayResults = calculateHolidayOvertime(
      dayData,
      hasPunchDocument,
      hasCutSalary,
      context
    );
    holidayGroup1 = holidayResults.group1;
    holidayGroup2 = holidayResults.group2;
  }

  return { weekGroup1, weekGroup2, holidayGroup1, holidayGroup2 };
}

/**
 * Process regular working day attendance
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {boolean} hasPunchDocument - Has punch document
 * @param {boolean} hasCutSalary - Should cut salary
 * @param {Object} context - Calculation context
 */
function processRegularWorkingDay(
  dayData,
  date,
  hasPunchDocument,
  hasCutSalary,
  context
) {
  checkLateArrivals(dayData, date, context);
  checkEarlyDepartures(dayData, date, context);
  calculateMissedPunches(
    dayData,
    date,
    hasPunchDocument,
    hasCutSalary,
    context
  );
}

/**
 * Check and record late arrivals
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {Object} context - Calculation context
 */
function checkLateArrivals(dayData, date, context) {
  if (dayData[1] !== "00:00" && isLate(dayData[1], context.lastLateTime)) {
    context.lateCount++;
    const lateMinutes = timeDifferenceInMinutes(
      context.lastLateTime,
      dayData[1]
    );
    context.dailyLateMinutes.push(lateMinutes);
    context.totalLatenessHours += lateMinutes;
  }

  if (dayData[3] !== "00:00" && isLate(dayData[3], context.lastLatePMTime)) {
    context.lateCount++;
    const lateMinutes = timeDifferenceInMinutes(
      context.lastLatePMTime,
      dayData[3]
    );
    context.dailyLateMinutes.push(lateMinutes);
    context.totalLatenessHours += lateMinutes;
  }
}

/**
 * Check and record early departures
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {Object} context - Calculation context
 */
function checkEarlyDepartures(dayData, date, context) {
  if (
    dayData[2] !== "00:00" &&
    isEarlyDeparture(dayData[2], context.endAMTime)
  ) {
    context.earlyDepartureCount++;
  }

  if (
    dayData[4] !== "00:00" &&
    isEarlyDeparture(dayData[4], context.endPMTime)
  ) {
    context.earlyDepartureCount++;
  }
}

/**
 * Calculate missed punches for the day
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {boolean} hasPunchDocument - Has punch document
 * @param {boolean} hasCutSalary - Should cut salary
 * @param {Object} context - Calculation context
 */
function calculateMissedPunches(
  dayData,
  date,
  hasPunchDocument,
  hasCutSalary,
  context
) {
  const presentPunchCount = dayData
    .slice(1, 5)
    .filter((time) => time !== "00:00").length;

  const isLeaveDay =
    isPaternalDay(date, context.selectedPaternalLeave) ||
    isMaternalDay(date, context.selectedMaternalLeave) ||
    isMarriageDay(date, context.selectedMarriageLeave) ||
    isCompanyDay(date, context.selectedCompanyLeave);

  if (!isLeaveDay && hasPunchDocument && hasCutSalary) {
    const missedPunchesInDay = 4 - presentPunchCount;
    context.missedPunch += missedPunchesInDay;
  }

  if (presentPunchCount > 0 && !isLeaveDay && !hasPunchDocument) {
    if (dayData[1] === "00:00" || dayData[2] === "00:00")
      context.noReasonHalf++;
    if (dayData[3] === "00:00" || dayData[4] === "00:00")
      context.noReasonHalf++;
  }

  if (presentPunchCount === 0 && !isLeaveDay) {
    if (hasPunchDocument && hasCutSalary) {
      context.missedFullPunch++;
    } else if (!hasPunchDocument) {
      context.noReasonFull++;
    }
  }
}

/**
 * Process overtime hours calculation
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {Object} context - Calculation context
 */
function processOvertimeHours(dayData, date, context) {
  if (dayData[5] !== "00:00") {
    const overtimeStart = parseTime(dayData[5]);
    const standardOvertimeStart = parseTime(context.startOvertime);

    if (overtimeStart < standardOvertimeStart) {
      dayData[5] = context.startOvertime;
    } else if (overtimeStart > standardOvertimeStart) {
      dayData[5] = roundTimeToNearestInterval(
        dayData[5],
        context.overTimeCountPer
      );
    }
  }

  const overtimeMinutes = timeDifferenceInMinutes(dayData[5], dayData[6]);

  const fullThresholds =
    context.overTimeCountPer > 0
      ? Math.floor(overtimeMinutes / context.overTimeCountPer)
      : 0;
  const countedOvertimeMinutes = fullThresholds * context.overTimeCountPer;

  if (countedOvertimeMinutes > 0) {
    context.totalOvertime += countedOvertimeMinutes;

    if (!isGeneralDay(date, context.selectedGeneralDays)) {
      if (isHoliday(date, context.selectedHolidays)) {
        context.holyDayOverTime += countedOvertimeMinutes;
      } else if (isWeekend(date, context.weekendDayIndices)) {
        context.weekendOverTime += countedOvertimeMinutes;
      } else {
        context.normalOverTime += countedOvertimeMinutes;
      }
    } else {
      context.normalOverTime += countedOvertimeMinutes;
    }
  }
}

/**
 * Apply active rules for calculations
 * @param {Array<Object>} activeRules - Active payroll rules
 * @param {number} overtimeRateOfUser - User's overtime rate
 * @param {number} monthlySalary - Base monthly salary
 * @param {Object} context - Calculation context
 */
function applyActiveRules(
  activeRules,
  overtimeRateOfUser,
  monthlySalary,
  context
) {
  for (const rule of activeRules) {
    const ruleId = rule.ruleId.toString();

    switch (ruleId) {
      case "5":
        applyLateComeGoLaterRule(context);
        break;
      case "6":
        applyOvertimeLateness(context);
        break;
      case "13":
        applyLeaveDeductions(monthlySalary, context);
        break;
      case "14":
        applyPieceRatePay(context);
        break;
      case "15":
        applyLateAttendancePenalty(context);
        break;
      case "16":
        applyEarlyDepartureDeduction(context);
        break;
      case "17":
        applyHalfFullDayDeductions(monthlySalary, context);
        break;
      case "18":
        applyLatenessDeduction(context);
        break;
      case "19":
        applyNoTolerancePolicy(context);
        break;
      case "20":
        applyIncrementalLateness(context);
        break;
      case "21":
        applyShiftLateness(context);
        break;
      case "22":
        applyMissPunchDeduction(context);
        break;
    }
  }
}

/**
 * Calculate final pay amounts
 * @param {number} monthlySalary - Base monthly salary
 * @param {number} overtimeRateOfUser - User's overtime rate
 * @param {number} sickReduceSalary - Sick leave reduction days
 * @param {number} othersReduceSalary - Other leave reduction days
 * @param {Object} overtimeTotals - Overtime totals by type
 * @param {Object} context - Calculation context
 * @returns {Object} Final calculation results
 */
function calculateFinalPayAmounts(
  monthlySalary,
  overtimeRateOfUser,
  sickReduceSalary,
  othersReduceSalary,
  overtimeTotals,
  context
) {
  const holidayRate =
    context.normalOvertimeRate > 0 && context.holidayOvertimeRate === 0.0
      ? context.normalOvertimeRate
      : context.holidayOvertimeRate;
  const weekendRate =
    context.normalOvertimeRate > 0 && context.weekendOvertimeRate === 0.0
      ? context.normalOvertimeRate
      : context.weekendOvertimeRate;

  const sickLeaveDeduction =
    sickReduceSalary *
      context.sickLeaveCostDay *
      (monthlySalary / context.workingDaysInMonth) +
    sickReduceSalary * context.sickLeaveCost;

  const otherLeaveDeduction =
    othersReduceSalary *
      context.otherLeaveCostDay *
      (monthlySalary / context.workingDaysInMonth) +
    othersReduceSalary * context.otherLeaveCost;

  const standardPay =
    monthlySalary -
    context.deduction -
    sickLeaveDeduction -
    otherLeaveDeduction;

  let overtimePay =
    (overtimeTotals.normal / 60) *
      overtimeRateOfUser *
      context.normalOvertimeRate +
    (overtimeTotals.holiday / 60) * overtimeRateOfUser * holidayRate +
    (overtimeTotals.weekend / 60) * overtimeRateOfUser * weekendRate;

  if (!context.overtimePayOrNot) {
    overtimePay = 0;
  }

  return {
    standardPay: Math.max(0, standardPay),
    overtimePay: Math.max(0, overtimePay),
    totalPay: Math.max(0, standardPay + overtimePay),
    deductions: context.deduction,
    sickLeaveDeduction,
    otherLeaveDeduction,
    overtimeDetails: overtimeTotals,
    attendanceStats: {
      lateCount: context.lateCount,
      earlyDepartureCount: context.earlyDepartureCount,
      missedPunch: context.missedPunch,
      missedFullPunch: context.missedFullPunch,
      totalLatenessHours: context.totalLatenessHours / 60,
    },
  };
}

/**
 * Adjust times to standard working hours
 * @param {Array<string>} dayData - Day attendance data
 * @param {Object} context - Calculation context
 */
function adjustTimesToStandardHours(dayData, context) {
  // Example implementation: Adjust times to fit within standard hours
  const standardStart = parseTime(context.startAMTime);
  const standardEnd = parseTime(context.endPMTime);
  for (let i = 1; i <= 4; i++) {
    if (dayData[i] !== "00:00") {
      const time = parseTime(dayData[i]);
      if (time < standardStart) dayData[i] = context.startAMTime;
      else if (time > standardEnd) dayData[i] = context.endPMTime;
    }
  }
}

/**
 * Round time to nearest interval
 * @param {string} time - Time string in HH:mm format
 * @param {number} interval - Interval in minutes
 * @returns {string} Rounded time
 */
function roundTimeToNearestInterval(time, interval) {
  const totalMinutes = parseTime(time);
  const roundedMinutes = Math.round(totalMinutes / interval) * interval;
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

/**
 * Calculate weekend overtime
 * @param {Array<string>} dayData - Day attendance data
 * @param {boolean} hasPunchDocument - Has punch document
 * @param {boolean} hasCutSalary - Should cut salary
 * @param {Object} context - Calculation context
 * @returns {Object} Overtime results
 */
function calculateWeekendOvertime(dayData, hasPunchDocument, hasCutSalary) {
  let group1 = 0,
    group2 = 0;
  if (hasPunchDocument && !hasCutSalary) {
    const totalMinutes = dayData.slice(1, 5).reduce((sum, time, index) => {
      if (time !== "00:00" && index % 2 === 1) {
        const nextTime = dayData[index + 1] || "00:00";
        if (nextTime !== "00:00") {
          return sum + timeDifferenceInMinutes(time, nextTime);
        }
      }
      return sum;
    }, 0);
    group1 = totalMinutes; // Example: All minutes in group1
  }
  return { group1, group2 };
}

/**
 * Calculate holiday overtime
 * @param {Array<string>} dayData - Day attendance data
 * @param {boolean} hasPunchDocument - Has punch document
 * @param {boolean} hasCutSalary - Should cut salary
 * @param {Object} context - Calculation context
 * @returns {Object} Overtime results
 */
function calculateHolidayOvertime(dayData, hasPunchDocument, hasCutSalary) {
  let group1 = 0,
    group2 = 0;
  if (hasPunchDocument && !hasCutSalary) {
    const totalMinutes = dayData.slice(1, 5).reduce((sum, time, index) => {
      if (time !== "00:00" && index % 2 === 1) {
        const nextTime = dayData[index + 1] || "00:00";
        if (nextTime !== "00:00") {
          return sum + timeDifferenceInMinutes(time, nextTime);
        }
      }
      return sum;
    }, 0);
    group1 = totalMinutes; // Example: All minutes in group1
  }
  return { group1, group2 };
}

/**
 * Aggregate overtime totals
 * @param {number} weekGroup1 - Week group 1 minutes
 * @param {number} weekGroup2 - Week group 2 minutes
 * @param {number} holidayGroup1 - Holiday group 1 minutes
 * @param {number} holidayGroup2 - Holiday group 2 minutes
 * @param {Object} context - Calculation context
 * @returns {Object} Aggregated overtime totals
 */
function aggregateOvertimeTotals(
  weekGroup1,
  weekGroup2,
  holidayGroup1,
  holidayGroup2,
  context
) {
  return {
    normal: context.normalOverTime || 0,
    holiday: holidayGroup1 + holidayGroup2,
    weekend: weekGroup1 + weekGroup2,
  };
}

/**
 * Handle replacement days
 * @param {Array<string>} dayData - Day attendance data
 * @param {Date} date - Current date
 * @param {Object} context - Calculation context
 */
function handleReplacementDays(dayData, date, context) {
  // Example implementation: Record replacement day if applicable
  if (!isFullDayAbsent(dayData) && context.replaceDays) {
    context.dbHelper.insertReplaceDay(context.empID, date.toISOString());
  }
}

/**
 * Apply late come go later rule
 * @param {Object} context - Calculation context
 */
function applyLateComeGoLaterRule(context) {
  // Example: Reduce overtime by lateness
  if (context.totalLatenessHours > 0) {
    context.totalOvertime = Math.max(
      0,
      context.totalOvertime - context.totalLatenessHours
    );
  }
}

/**
 * Apply overtime lateness rule
 * @param {Object} context - Calculation context
 */
function applyOvertimeLateness(context) {
  // Example: Deduct overtime if late
  if (context.lateCount > 0) {
    context.totalOvertime = Math.max(
      0,
      context.totalOvertime - context.lateCount * 30
    );
  }
}

/**
 * Apply leave deductions
 * @param {number} monthlySalary - Base monthly salary
 * @param {Object} context - Calculation context
 */
function applyLeaveDeductions(monthlySalary, context) {
  // Example: Deduct for sick and other leaves
  context.deduction +=
    (context.sickLeaveCost + context.otherLeaveCost) *
    (monthlySalary / context.workingDaysInMonth);
}

/**
 * Apply piece rate pay
 * @param {Object} context - Calculation context
 */
function applyPieceRatePay(context) {
  // Example: Add piece rate pay if applicable
  context.standardPay += context.pieceRateUnits * context.pieceRate;
}

/**
 * Apply late attendance penalty
 * @param {Object} context - Calculation context
 */
function applyLateAttendancePenalty(context) {
  // Example: Deduct for late arrivals
  context.deduction += context.lateCount * 10;
}

/**
 * Apply early departure deduction
 * @param {Object} context - Calculation context
 */
function applyEarlyDepartureDeduction(context) {
  // Example: Deduct for early departures
  context.deduction += context.earlyDepartureCount * 10;
}

/**
 * Apply half/full day deductions
 * @param {number} monthlySalary - Base monthly salary
 * @param {Object} context - Calculation context
 */
function applyHalfFullDayDeductions(monthlySalary, context) {
  // Example: Deduct for missed punches
  context.deduction +=
    (context.missedFullPunch + context.noReasonFull) *
    (monthlySalary / context.workingDaysInMonth);
  context.deduction +=
    context.noReasonHalf * (monthlySalary / context.workingDaysInMonth / 2);
}

/**
 * Apply lateness deduction
 * @param {Object} context - Calculation context
 */
function applyLatenessDeduction(context) {
  // Example: Deduct based on total lateness hours
  context.deduction += (context.totalLatenessHours / 60) * 5;
}

/**
 * Apply no tolerance policy
 * @param {Object} context - Calculation context
 */
function applyNoTolerancePolicy(context) {
  // Example: Strict deductions for any infractions
  if (context.lateCount > 0 || context.earlyDepartureCount > 0) {
    context.deduction += 50;
  }
}

/**
 * Apply incremental lateness penalty
 * @param {Object} context - Calculation context
 */
function applyIncrementalLateness(context) {
  // Example: Increasing penalty for repeated lateness
  context.deduction += context.lateCount * context.lateCount * 5;
}

/**
 * Apply shift lateness rule
 * @param {Object} context - Calculation context
 */
function applyShiftLateness(context) {
  // Example: Deduct based on shift-specific rules
  if (context.shift === "Morning" && context.lateCount > 0) {
    context.deduction += context.lateCount * 15;
  }
}

/**
 * Apply miss punch deduction
 * @param {Object} context - Calculation context
 */
function applyMissPunchDeduction(context) {
  // Example: Deduct for missed punches
  context.deduction += context.missedPunch * 5;
}

// Utility functions
function isWeekend(date, weekendIndices) {
  return weekendIndices.includes(date.getDay());
}

function isHoliday(date, holidays) {
  return holidays.some((holiday) => isSameDay(date, new Date(holiday)));
}

function isGeneralDay(date, generalDays) {
  return generalDays.some((generalDay) =>
    isSameDay(date, new Date(generalDay))
  );
}

function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isFullDayAbsent(dayData) {
  return dayData.slice(1, 5).every((time) => time === "00:00");
}

function parseTime(timeString) {
  if (!timeString || timeString === "00:00") return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function timeDifferenceInMinutes(startTime, endTime) {
  if (!startTime || !endTime || startTime === "00:00" || endTime === "00:00")
    return 0;
  return parseTime(endTime) - parseTime(startTime);
}

function isLate(actualTime, expectedTime) {
  if (
    !actualTime ||
    !expectedTime ||
    actualTime === "00:00" ||
    expectedTime === "00:00"
  )
    return false;
  return parseTime(actualTime) > parseTime(expectedTime);
}

function isEarlyDeparture(actualTime, expectedTime) {
  if (
    !actualTime ||
    !expectedTime ||
    actualTime === "00:00" ||
    expectedTime === "00:00"
  )
    return false;
  return parseTime(actualTime) < parseTime(expectedTime);
}

function isSickDay(date, sickLeaves) {
  return sickLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

function isOtherDay(date, otherLeaves) {
  return otherLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

function isPaternalDay(date, paternalLeaves) {
  return paternalLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

function isMaternalDay(date, maternalLeaves) {
  return maternalLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

function isMarriageDay(date, marriageLeaves) {
  return marriageLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

function isCompanyDay(date, companyLeaves) {
  return companyLeaves.some((leave) => isSameDay(date, new Date(leave)));
}

// Export the main function
export { calculatePayMonthly };
