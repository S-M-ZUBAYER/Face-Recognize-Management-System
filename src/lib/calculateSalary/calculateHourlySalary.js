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

    // if any punch missing → use working time
    if (punchIn === "00:00" || punchOut === "00:00") {
      totalMinutes += workEnd - workStart;
      continue;
    }

    let punchInMin = toMinutes(punchIn);
    let punchOutMin = toMinutes(punchOut);

    // handle night punch
    if (punchOutMin <= punchInMin) {
      punchOutMin += 24 * 60;
    }

    const overlapStart = Math.max(punchInMin, workStart);
    const overlapEnd = Math.min(punchOutMin, workEnd);

    if (overlapStart < overlapEnd) {
      totalMinutes += overlapEnd - overlapStart;
    }
  }

  return totalMinutes;
}

function calculateHourlySalary(attendanceRecords, salaryRules, payPeriod) {
  const punchDetails = punchAndShiftDetails(attendanceRecords, salaryRules);

  let totalWorkedMinutes = 0;

  punchDetails.forEach((dayData) => {
    const { punches, workingDecoded } = dayData;
    const workedMinutes = calculateWorkedMinutes(workingDecoded, punches);
    if (payPeriod.hourlyRate < workedMinutes) {
      totalWorkedMinutes += workedMinutes;
    }
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
