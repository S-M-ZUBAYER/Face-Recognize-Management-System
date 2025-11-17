import fastKeepHighMonth from "./fastKeepHighMonth";

function findMiddleTime(startTime, endTime) {
  const toDate = (t) => {
    const [h, m] = t.split(":").map(Number);
    return new Date(2000, 0, 1, h, m);
  };

  let start = toDate(startTime);
  let end = toDate(endTime);
  if (end < start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);

  const middle = new Date(start.getTime() + (end - start) / 2);
  return `${middle.getHours().toString().padStart(2, "0")}:${middle
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function inclusiveInorNot(startTime, endTime, punchTime) {
  const toDate = (t) => {
    const [h, m] = t.split(":").map(Number);
    return new Date(2000, 0, 1, h, m);
  };

  let start = toDate(startTime);
  let end = toDate(endTime);
  let punch = toDate(punchTime);

  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    if (punch < start) punch = new Date(punch.getTime() + 24 * 60 * 60 * 1000);
  }

  return punch >= start && punch <= end;
}

function convertPunchesWithStrictRules(
  punchesAsStrings,
  rulesModel,
  date,
  oneEmployeeData,
  previousDayPunchesAsStrings = []
) {
  let punches = [...punchesAsStrings].sort();
  let normalAllRules = [];

  // Build normalAllRules depending on rulesModel type
  if (rulesModel.param3 === "normal" || rulesModel.param3 === "special") {
    let workingDecoded =
      rulesModel.param3 === "normal" ? rulesModel.param1 : [];
    let overtimeDecoded =
      rulesModel.param3 === "normal" ? rulesModel.param2 : [];

    if (rulesModel.param3 === "special") {
      const found = oneEmployeeData.find((item) => item.date === date);
      if (found) {
        workingDecoded = found.param1 || [];
        overtimeDecoded = found.param2 || [];
      }
    }

    for (const shift of workingDecoded) {
      normalAllRules.push(shift.start, shift.end);
    }
    for (const shift of overtimeDecoded) {
      normalAllRules.push(shift.start, shift.end);
    }
  } else {
    // Fixed string case
    normalAllRules.push(
      rulesModel.param1 || "00:00",
      rulesModel.param2 || "00:00",
      rulesModel.param3 || "00:00",
      rulesModel.param4 || "00:00",
      rulesModel.param5 || "00:00",
      rulesModel.param6 || "00:00"
    );
  }

  // PROPERLY IMPLEMENTED OVERNIGHT SHIFT LOGIC
  if (normalAllRules.length > 0) {
    const isTimeGreater = (time1, time2) => {
      const [h1, m1] = time1.split(":").map(Number);
      const [h2, m2] = time2.split(":").map(Number);
      return h1 * 60 + m1 > h2 * 60 + m2;
    };

    const parseTimeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const lastRuleIndex = normalAllRules.length - 1;

    // Only process for actual overnight shifts (first time > last time)
    if (isTimeGreater(normalAllRules[0], normalAllRules[lastRuleIndex])) {
      const targetMinutes = parseTimeToMinutes(normalAllRules[0]);
      const oneHourBefore = targetMinutes - 60;
      const oneHourAfter = targetMinutes + 60;

      //   console.log(
      //     `Overnight shift detected: ${normalAllRules[0]} > ${normalAllRules[lastRuleIndex]}`
      //   );
      //   console.log(
      //     `Target: ${normalAllRules[0]}, Window: ${oneHourBefore / 60}:${
      //       oneHourBefore % 60
      //     } to ${oneHourAfter / 60}:${oneHourAfter % 60}`
      //   );

      // Remove closest punch from current day within the window
      let closestPunchToRemove = null;
      let minDiffRemove = Infinity;

      for (let i = 0; i < punches.length; i++) {
        const punchMinutes = parseTimeToMinutes(punches[i]);
        if (punchMinutes >= oneHourBefore && punchMinutes <= oneHourAfter) {
          const diff = Math.abs(targetMinutes - punchMinutes);
          if (diff < minDiffRemove) {
            minDiffRemove = diff;
            closestPunchToRemove = punches[i];
          }
        }
      }

      if (closestPunchToRemove) {
        // console.log("Closest Punch Remove: " + closestPunchToRemove);
        const index = punches.indexOf(closestPunchToRemove);
        if (index > -1) {
          punches.splice(index, 1);
        }
      }

      // Find closest punch from previous day within the window
      let closestPreviousPunch = null;
      let minDiffPrevious = Infinity;

      for (let i = 0; i < previousDayPunchesAsStrings.length; i++) {
        const punchMinutes = parseTimeToMinutes(previousDayPunchesAsStrings[i]);
        if (punchMinutes >= oneHourBefore && punchMinutes <= oneHourAfter) {
          const diff = Math.abs(targetMinutes - punchMinutes);
          if (diff < minDiffPrevious) {
            minDiffPrevious = diff;
            closestPreviousPunch = previousDayPunchesAsStrings[i];
          }
        }
      }

      // Prepend the Found Punch
      if (closestPreviousPunch) {
        punches.unshift(closestPreviousPunch);
        // console.log("Closest previous punch: " + closestPreviousPunch);
      }
      // Optional: uncomment if you want to insert '00:00' when no previous punch found
      // else {
      //   punches.unshift('00:00');
      // }
    }
  }

  // CORRECTED matching logic (without the problematic "second chance")
  const takenPunches = normalAllRules.map((currentTime, i, arr) => {
    const previousTime = arr[(i - 1 + arr.length) % arr.length];
    const nextTime = arr[(i + 1) % arr.length];

    const leftBorder = findMiddleTime(previousTime, currentTime);
    const rightBorder = findMiddleTime(currentTime, nextTime);

    // console.log(
    //   `Shift ${i} (${currentTime}): leftBorder=${leftBorder}, rightBorder=${rightBorder}`
    // );
    // console.log(`Available punches: ${punches.join(", ")}`);

    // Only use the precise border logic
    for (let j = 0; j < punches.length; j++) {
      if (inclusiveInorNot(leftBorder, rightBorder, punches[j])) {
        const punch = punches.splice(j, 1)[0];
        // console.log(`✓ Assigned ${punch} to shift ${currentTime}`);
        return punch;
      }
    }

    // console.log(`✗ No punch found for shift ${currentTime}, using 00:00`);
    return "00:00";
  });

  return {
    punches: takenPunches,
    date,
    shift: normalAllRules,
  };
}

function punchAndShiftDetails(monthlyAttendance, salaryRules) {
  const rulesModel = salaryRules.rules.find((item) => item.ruleId === 0) || {
    param1: [],
    param2: [],
    param3: "normal",
  };
  const table = salaryRules.timeTables || [];
  const punchesDetails = [];
  const specialEmployeeData = rulesModel.param3 === "special" ? table : [];

  // Sort by date once
  const sortedAttendance = [...monthlyAttendance].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sortedAttendance.length; i++) {
    const record = sortedAttendance[i];
    const punches = JSON.parse(record.checkIn);
    const date = record.date;

    const previousDayPunches =
      i > 0 ? JSON.parse(sortedAttendance[i - 1].checkIn) : [];

    const overtime = convertPunchesWithStrictRules(
      punches,
      rulesModel,
      date,
      specialEmployeeData,
      previousDayPunches
    );

    if (overtime.punches.length > 0) {
      punchesDetails.push(overtime);
    }
  }

  return rulesModel.param3 === "special"
    ? fastKeepHighMonth(punchesDetails)
    : punchesDetails;
}

export default punchAndShiftDetails;
