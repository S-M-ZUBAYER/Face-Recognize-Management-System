function getWeekendAndHolidayDates(salaryRules, attendanceArray, employeeId) {
  try {
    // Convert employeeId to string for comparison
    const empIdStr = String(employeeId);

    // Filter attendance for the specific employee
    const employeeAttendance = attendanceArray.filter(
      (record) => String(record.empId) === empIdStr
    );

    if (employeeAttendance.length === 0) {
      // console.log(`No attendance found for employee: ${employeeId}`);
      return [];
    }

    const resultDates = [];

    // Step 1: Get weekend dates based on ruleId 2
    const weekendRule = salaryRules.rules?.find((rule) => rule.ruleId === 2);

    if (weekendRule && weekendRule.param1) {
      // param1 can be a single day or comma-separated days
      const weekendDays = weekendRule.param1
        .split(",")
        .map((day) => day.trim());

      // console.log('Weekend days from rule:', weekendDays);

      // Check each attendance date if it matches weekend days
      employeeAttendance.forEach((record) => {
        const date = new Date(record.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

        if (weekendDays.includes(dayName)) {
          resultDates.push(record.date);
        }
      });
    }

    // Step 2: Get holiday dates that exist in attendance
    if (salaryRules.holidays && Array.isArray(salaryRules.holidays)) {
      salaryRules.holidays.forEach((holidayDate) => {
        // holidayDate is a string like "2025-12-16T00:00:00.000"

        // Check if this holiday date exists in attendance
        const matchingRecord = employeeAttendance.find((record) => {
          // Normalize dates for comparison (YYYY-MM-DD format)
          const attendanceDate = record.date.split("T")[0];
          const holidayDateNormalized = holidayDate.split("T")[0];

          return attendanceDate === holidayDateNormalized;
        });

        if (matchingRecord && !resultDates.includes(matchingRecord.date)) {
          resultDates.push(matchingRecord.date);
        }
      });
    }

    // Remove duplicates and sort
    const uniqueDates = [...new Set(resultDates)].sort();
    return uniqueDates.map((date) => `${date}T00:00:00.000`);
  } catch (error) {
    console.error("Error in getWeekendAndHolidayDates:", error.message);
    return [];
  }
}

export default getWeekendAndHolidayDates;
