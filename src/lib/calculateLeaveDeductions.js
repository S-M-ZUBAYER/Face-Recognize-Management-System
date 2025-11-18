function calculateLeaveDeductions(
  rule11,
  s_leaves,
  o_leaves,
  w_leaves,
  attendanceRecords
) {
  if (!Array.isArray(rule11.param1)) {
    rule11.param1 = [
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
      {
        dayCount: "",
        cost: "",
      },
    ];
  }
  // Helper function to calculate minutes between two times
  function calculateMinutes(startTime, endTime) {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    return Math.max(0, endTotalMinutes - startTotalMinutes);
  }

  // Helper function to get attendance time range for a date
  function getAttendanceTimeRange(attendanceDate) {
    const record = attendanceRecords.find(
      (record) => record.date === attendanceDate && record.empId === "21290499"
    );

    if (!record || !record.checkIn) return null;

    try {
      const checkIns = JSON.parse(record.checkIn);
      if (!checkIns || checkIns.length === 0) return null;

      // Sort the check-in times and get first and last
      const sortedTimes = checkIns.sort();
      return {
        firstCheckIn: sortedTimes[0],
        lastCheckIn: sortedTimes[sortedTimes.length - 1],
      };
    } catch {
      return null;
    }
  }

  // Helper function to calculate overlapping absence minutes
  function calculateAbsenceMinutes(leaveStart, leaveEnd, attendanceRange) {
    if (!attendanceRange) {
      // No attendance record, consider full leave period as absence
      return calculateMinutes(leaveStart, leaveEnd);
    }

    const leaveStartMin = leaveStart ? timeToMinutes(leaveStart) : 0;
    const leaveEndMin = leaveEnd ? timeToMinutes(leaveEnd) : 24 * 60; // End of day
    const attendStartMin = timeToMinutes(attendanceRange.firstCheckIn);
    const attendEndMin = timeToMinutes(attendanceRange.lastCheckIn);

    // If employee's attendance covers the entire leave period, no deduction
    if (attendStartMin <= leaveStartMin && attendEndMin >= leaveEndMin) {
      return 0;
    }

    // Calculate actual absence period (leave period not covered by attendance)
    let absenceStart = leaveStartMin;
    let absenceEnd = leaveEndMin;

    // Adjust absence period based on attendance
    if (attendStartMin > leaveStartMin && attendStartMin < leaveEndMin) {
      // Employee came late, absence is from leave start to attendance start
      absenceEnd = Math.min(absenceEnd, attendStartMin);
    }

    if (attendEndMin > leaveStartMin && attendEndMin < leaveEndMin) {
      // Employee left early, absence is from attendance end to leave end
      absenceStart = Math.max(absenceStart, attendEndMin);
    }

    // If attendance completely overlaps with part of leave period
    if (
      attendStartMin <= leaveStartMin &&
      attendEndMin < leaveEndMin &&
      attendEndMin > leaveStartMin
    ) {
      absenceStart = attendEndMin;
      absenceEnd = leaveEndMin;
    }

    if (
      attendStartMin > leaveStartMin &&
      attendEndMin >= leaveEndMin &&
      attendStartMin < leaveEndMin
    ) {
      absenceStart = leaveStartMin;
      absenceEnd = attendStartMin;
    }

    const absenceMinutes = Math.max(0, absenceEnd - absenceStart);
    // console.log(
    //   `Leave: ${leaveStart}-${leaveEnd}, Attendance: ${attendanceRange.firstCheckIn}-${attendanceRange.lastCheckIn}, Absence: ${absenceMinutes}min`
    // );

    return absenceMinutes;
  }

  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Helper function to check if date is in same month (November)
  function isNovemberDate(dateString) {
    const date = new Date(dateString);
    return date.getMonth() === 10; // November is month 10 (0-indexed)
  }

  // Helper function to calculate deduction for a specific leave type
  function calculateDeductionForLeaveType(leaves, ruleIndex, leaveType) {
    let totalDeduction = 0;
    // Get the rule for this leave type
    const rule = rule11.param1[ruleIndex];
    if (!rule.dayCount || !rule.cost) return 0;

    const dailyDeduction = rule.cost / rule.dayCount;
    const hourlyDeduction = dailyDeduction / 8; // 8 working hours per day
    const minuteDeduction = hourlyDeduction / 60;

    // console.log(`\n${leaveType} Leave Calculation:`);
    // console.log(
    //   `Daily Deduction: ${dailyDeduction}, Hourly: ${hourlyDeduction}, Per Minute: ${minuteDeduction}`
    // );

    leaves.forEach((leave) => {
      const leaveDate = leave.date.date.split("T")[0]; // Extract date part only

      // Check if leave is in November
      if (!isNovemberDate(leaveDate)) {
        // console.log(`Leave ${leaveDate} not in November, skipping`);
        return;
      }

      const dateInfo = leave.date;
      const attendanceRange = getAttendanceTimeRange(leaveDate);

      // If no start and end time, it's full day leave
      if (!dateInfo.start || !dateInfo.end) {
        if (!attendanceRange) {
          // No attendance, full day deduction
          //   console.log(
          //     `Full day ${leaveType} leave on ${leaveDate}: ${dailyDeduction}`
          //   );
          totalDeduction += dailyDeduction;
        } else {
          // Has attendance but it's full day leave, still deduct full day
          //   console.log(
          //     `Full day ${leaveType} leave on ${leaveDate} with attendance: ${dailyDeduction}`
          //   );
          totalDeduction += dailyDeduction;
        }
      } else {
        // Calculate partial day deduction based on actual absence
        const absenceMinutes = calculateAbsenceMinutes(
          dateInfo.start,
          dateInfo.end,
          attendanceRange
        );

        if (absenceMinutes > 0) {
          const partialDeduction = absenceMinutes * minuteDeduction;
          //   console.log(
          //     `Partial ${leaveType} leave on ${leaveDate}: ${absenceMinutes} minutes = ${partialDeduction}`
          //   );
          totalDeduction += partialDeduction;
        } else {
          console.log(
            `No absence for ${leaveType} leave on ${leaveDate} (attendance covers leave period)`
          );
        }
      }
    });

    return Math.round(totalDeduction * 100) / 100; // Round to 2 decimal places
  }

  // Calculate deductions for each leave type
  const s_deduction = calculateDeductionForLeaveType(s_leaves, 3, "S"); // Index 3 for S leaves
  const o_deduction = calculateDeductionForLeaveType(o_leaves, 8, "O"); // Index 8 for O leaves
  const w_deduction = calculateDeductionForLeaveType(w_leaves, 6, "W"); // Index 6 for W leaves

  return {
    s_deduction,
    o_deduction,
    w_deduction,
  };
}

export default calculateLeaveDeductions;
