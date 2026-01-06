import punchAndShiftDetails from "../punchAndShiftDetails";

function calculateWorkedMinutes(workingDecoded, punches) {
  // convert HH:mm → minutes
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  let totalMinutes = 0;

  for (let i = 0; i < workingDecoded.length; i++) {
    const shift = workingDecoded[i];
    if (!shift?.start || !shift?.end) continue;

    const workStart = toMinutes(shift.start);
    let workEnd = toMinutes(shift.end);

    // handle night shift
    if (workEnd <= workStart) {
      workEnd += 24 * 60;
    }

    let punchIn = punches[i * 2];
    let punchOut = punches[i * 2 + 1];

    // if both punches missing → skip shift
    if (punchIn === "00:00" && punchOut === "00:00") {
      continue;
    }

    // if punch in is missing → use working start time
    if (punchIn === "00:00") {
      punchIn = shift.start;
    }

    // if punch out is missing → use working end time
    if (punchOut === "00:00") {
      punchOut = shift.end;
    }

    let punchInMin = toMinutes(punchIn);
    let punchOutMin = toMinutes(punchOut);

    // handle night punch
    if (punchOutMin <= punchInMin) {
      punchOutMin += 24 * 60;
    }

    // Apply the rules:
    // 1. If punch in time < working start time → use working start time
    // 2. If punch in time > working start time → use punch in time
    const actualStart = Math.max(punchInMin, workStart);

    // 3. If punch out time < working end time → use punch out time
    // 4. If punch out time > working end time → use working end time
    const actualEnd = Math.min(punchOutMin, workEnd);

    // Calculate worked minutes for this shift
    if (actualStart < actualEnd) {
      totalMinutes += actualEnd - actualStart;
    }
  }

  return totalMinutes;
}

function calculateHourlySalary(
  attendanceRecords,
  salaryRules,
  payPeriod,
  range
) {
  let punchDetails = punchAndShiftDetails(attendanceRecords, salaryRules, true);

  // Apply date range filter if start or end date exists
  if (range) {
    punchDetails = punchDetails.filter((item) => {
      const current = new Date(item.date).getTime();
      const start = range.startDateStr
        ? new Date(range.startDateStr).getTime()
        : -Infinity;
      const end = range.endDateStr
        ? new Date(range.endDateStr).getTime()
        : Infinity;
      return current >= start && current <= end;
    });
  }

  // console.log(range);

  let totalWorkedMinutes = 0;

  punchDetails.forEach((dayData) => {
    const { punches, workingDecoded, overtimeDecoded } = dayData;
    const workedMinutes = calculateWorkedMinutes(
      [...workingDecoded, ...overtimeDecoded],
      punches
    );
    if (payPeriod.hourlyRate < workedMinutes) {
      totalWorkedMinutes += workedMinutes;
    }
    // console.log(date, workedMinutes / 60);
  });
  const hourlySalaryRate = payPeriod.salary;

  const totalHoursWorked = totalWorkedMinutes / 60;
  const totalSalary = totalHoursWorked * hourlySalaryRate;
  return {
    totalWorkedMinutes,
    totalHoursWorked,
    hourlySalaryRate,
    totalPay: totalSalary,
    punchDetails,
  };
}

export default calculateHourlySalary;
