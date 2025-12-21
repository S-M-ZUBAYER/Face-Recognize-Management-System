import { useGlobalStore } from "@/zustand/useGlobalStore";
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

function convertPunchesWithSpecialRules(
  punchesAsStrings,
  mac,
  date,
  oneEmployeeData,
  previousDayPunchesAsStrings = [],
  nextDaySchedule = null
  // id
) {
  const rules = useGlobalStore.getState().globalRules;
  let punches = [...punchesAsStrings].sort();
  let normalAllRules = [];

  // ONLY SPECIAL LOGIC - no normal condition
  let workingDecoded = [];
  let overtimeDecoded = [];

  const found = oneEmployeeData.find((item) => item.date === date);
  if (found) {
    workingDecoded = found.param1 || [];
    overtimeDecoded = found.param2 || [];
  } else {
    const generalRule = rules.find((rule) => rule.deviceMAC === mac);
    if (generalRule) {
      const generalFound = generalRule.salaryRules.rules.find(
        (item) => item.ruleId === 0
      );
      if (generalFound) {
        workingDecoded = generalFound.param1 || [];
        overtimeDecoded = generalFound.param2 || [];
      }
    }
  }

  for (const shift of workingDecoded) {
    normalAllRules.push(shift.start, shift.end);
  }
  for (const shift of overtimeDecoded) {
    normalAllRules.push(shift.start, shift.end);
  }

  // NEW LOGIC: Handle evening punches based on next day's schedule
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

    // Check if current day IS overnight shift
    const isCurrentDayOvernight = isTimeGreater(
      normalAllRules[0],
      normalAllRules[lastRuleIndex] !== "00:00"
        ? normalAllRules[lastRuleIndex]
        : normalAllRules[3]
    );

    // if (id === "3531774215") {
    //   console.log(
    //     isCurrentDayOvernight,
    //     normalAllRules[0],
    //     normalAllRules[lastRuleIndex],
    //     normalAllRules[3]
    //   );
    // }

    // Check if next day HAS overnight shift
    const isNextDayOvernight =
      nextDaySchedule && nextDaySchedule.length > 0
        ? isTimeGreater(
            nextDaySchedule[0],
            nextDaySchedule[nextDaySchedule.length - 1]
          )
        : false;

    // LOGIC 1: Handle evening punches (remove if not needed by next day)
    const eveningStart = 19 * 60; // 19:00 in minutes
    const eveningEnd = 21 * 60; // 21:00 in minutes

    let eveningPunchIndex = -1;

    // Find evening punch in current day
    for (let i = 0; i < punches.length; i++) {
      const punchMinutes = parseTimeToMinutes(punches[i]);
      if (punchMinutes >= eveningStart && punchMinutes <= eveningEnd) {
        eveningPunchIndex = i;
        break;
      }
    }

    // If found evening punch
    if (eveningPunchIndex !== -1) {
      // const eveningPunch = punches[eveningPunchIndex];

      if (isCurrentDayOvernight && !isNextDayOvernight) {
        // Case: Current day is overnight but next day is NOT overnight
        // Remove the evening punch (like "19:44" from Nov 27)
        punches.splice(eveningPunchIndex, 1);
      }
      // Other cases keep the punch
    }

    // LOGIC 2: EXISTING OVERNIGHT SHIFT LOGIC (take from previous day)
    // Only process for actual overnight shifts (first time > last time)
    if (isCurrentDayOvernight) {
      const targetMinutes = parseTimeToMinutes(normalAllRules[0]);
      const oneHourBefore = targetMinutes - 60;
      const oneHourAfter = targetMinutes + 60;

      // CASE 1: Current day HAS multiple punches (active overnight shift)
      if (punches.length > 1) {
        // Handle duplicate punches around shift start time
        let eveningPunches = [];
        let otherPunches = [];

        // Separate evening punches (near shift start) from other punches
        for (let i = 0; i < punches.length; i++) {
          const punchMinutes = parseTimeToMinutes(punches[i]);
          if (punchMinutes >= oneHourBefore && punchMinutes <= oneHourAfter) {
            eveningPunches.push(punches[i]);
          } else {
            otherPunches.push(punches[i]);
          }
        }

        // If multiple evening punches, take the closest one to shift start   && it's will come current day's evening punches  bugs .
        // if (eveningPunches.length > 0) {
        //   let closestEveningPunch = eveningPunches[0];
        //   let minDiff = Infinity;

        //   for (const punch of eveningPunches) {
        //     const punchMinutes = parseTimeToMinutes(punch);
        //     const diff = Math.abs(targetMinutes - punchMinutes);
        //     if (diff < minDiff) {
        //       minDiff = diff;
        //       closestEveningPunch = punch;
        //     }
        //   }

        //   // Keep only the closest evening punch
        //   punches = [closestEveningPunch, ...otherPunches];
        // }

        // STRICT RULE: Remove ALL current day's evening punches
        // Don't keep any, always take from previous day
        if (eveningPunches.length > 0) {
          // Remove all evening punches from current day
          // Keep only otherPunches (non-evening punches)
          punches = [...otherPunches];
        }

        // Find closest EVENING punch from previous day
        let closestPreviousPunch = null;
        let minDiffPrevious = Infinity;

        for (let i = 0; i < previousDayPunchesAsStrings.length; i++) {
          const punchMinutes = parseTimeToMinutes(
            previousDayPunchesAsStrings[i]
          );

          const startHour = Number(normalAllRules[0].split(":")[0]);

          // Evening window = startHour - 1 to startHour + 1
          const windowStart = (startHour - 1) * 60;
          const windowEnd = (startHour + 1) * 60;

          const isEveningPunch =
            punchMinutes >= windowStart && punchMinutes <= windowEnd;

          // if (id === "70709919") {
          //   console.log(
          //     date,
          //     isEveningPunch,
          //     punchMinutes,
          //     windowStart,
          //     windowEnd
          //   );
          // }

          if (
            isEveningPunch &&
            punchMinutes >= oneHourBefore &&
            punchMinutes <= oneHourAfter
          ) {
            const diff = Math.abs(targetMinutes - punchMinutes);
            if (diff < minDiffPrevious) {
              minDiffPrevious = diff;
              closestPreviousPunch = previousDayPunchesAsStrings[i];
            }
          }
        }

        // Prepend the found EVENING punch from previous day
        if (closestPreviousPunch) {
          punches.unshift(closestPreviousPunch);
        }
      }
      // CASE 2: Current day has NO punches or only ONE punch - RETURN EMPTY
      else if (punches.length <= 1) {
        // For overnight shift days with 0 or 1 punch, return all "00:00"
        return {
          punches: normalAllRules.map(() => "00:00"),
          date,
          shift: normalAllRules,
        };
      }
    }
  }

  // FIXED: Use the same improved matching logic as normal rules
  // const takenPunches = normalAllRules.map((currentTime, i, arr) => {
  //   const previousTime = arr[(i - 1 + arr.length) % arr.length];
  //   const nextTime = arr[(i + 1) % arr.length];

  //   const leftBorder = findMiddleTime(previousTime, currentTime);
  //   const rightBorder = findMiddleTime(currentTime, nextTime);

  //   // First: Try exact border match
  //   for (let j = 0; j < punches.length; j++) {
  //     if (inclusiveInorNot(leftBorder, rightBorder, punches[j])) {
  //       const punch = punches.splice(j, 1)[0];
  //       return punch;
  //     }
  //   }

  //   // Second: Try expanded range (previousTime to nextTime) - MORE LENIENT
  //   for (let j = 0; j < punches.length; j++) {
  //     if (inclusiveInorNot(previousTime, nextTime, punches[j])) {
  //       const punch = punches.splice(j, 1)[0];
  //       return punch;
  //     }
  //   }

  //   // Third: If still no match, find closest punch within reasonable time
  //   let closestPunch = null;
  //   let minDiff = Infinity;

  //   const [currentH, currentM] = currentTime.split(":").map(Number);
  //   const currentMinutes = currentH * 60 + currentM;

  //   for (let j = 0; j < punches.length; j++) {
  //     const [punchH, punchM] = punches[j].split(":").map(Number);
  //     const punchMinutes = punchH * 60 + punchM;
  //     const diff = Math.abs(punchMinutes - currentMinutes);

  //     // Consider punches within 2 hours as potential matches
  //     if (diff <= 120 && diff < minDiff) {
  //       minDiff = diff;
  //       closestPunch = punches[j];
  //     }
  //   }

  //   if (closestPunch) {
  //     const index = punches.indexOf(closestPunch);
  //     if (index > -1) {
  //       return punches.splice(index, 1)[0];
  //     }
  //   }

  //   return "00:00";
  // });
  const takenPunches = normalAllRules.map((currentTime, i, arr) => {
    const previousTime = arr[(i - 1 + arr.length) % arr.length];
    const nextTime = arr[(i + 1) % arr.length];

    const leftBorder = findMiddleTime(previousTime, currentTime);
    const rightBorder = findMiddleTime(currentTime, nextTime);

    // Check punches within the interval
    for (let j = 0; j < punches.length; j++) {
      if (inclusiveInorNot(leftBorder, rightBorder, punches[j])) {
        const punch = punches.splice(j, 1)[0];
        return punch;
      }
    }

    // Second chance: between previousTime and currentTime
    for (let j = punches.length - 1; j >= 0; j--) {
      if (inclusiveInorNot(previousTime, currentTime, punches[j])) {
        const punch = punches.splice(j, 1)[0];
        return punch;
      }
    }

    return "00:00";
  });

  return {
    punches: takenPunches,
    date,
    shift: normalAllRules,
    workingDecoded,
    overtimeDecoded,
  };
}

function convertPunchesWithNormalRules(punchesAsStrings, rulesModel, date) {
  let punches = [...punchesAsStrings].sort();
  let normalAllRules = [];

  let workingDecoded = [];
  let overtimeDecoded = [];

  if (Array.isArray(rulesModel.param1) && Array.isArray(rulesModel.param2)) {
    // ONLY NORMAL LOGIC - no special condition
    workingDecoded = rulesModel.param1 || [];
    overtimeDecoded = rulesModel.param2 || [];

    for (const shift of workingDecoded) {
      normalAllRules.push(shift.start, shift.end);
    }
    for (const shift of overtimeDecoded) {
      normalAllRules.push(shift.start, shift.end);
    }
  } else {
    normalAllRules.push(
      rulesModel.param1 || "00:00",
      rulesModel.param2 || "00:00",
      rulesModel.param3 || "00:00",
      rulesModel.param4 || "00:00",
      rulesModel.param5 || "00:00",
      rulesModel.param6 || "00:00"
    );
  }

  // Match punches against the time points
  const takenPunches = normalAllRules.map((currentTime, i, arr) => {
    const previousTime = arr[(i - 1 + arr.length) % arr.length];
    const nextTime = arr[(i + 1) % arr.length];

    const leftBorder = findMiddleTime(previousTime, currentTime);
    const rightBorder = findMiddleTime(currentTime, nextTime);

    // Check punches within the interval
    for (let j = 0; j < punches.length; j++) {
      if (inclusiveInorNot(leftBorder, rightBorder, punches[j])) {
        const punch = punches.splice(j, 1)[0];
        return punch;
      }
    }

    // Second chance: between previousTime and currentTime
    for (let j = punches.length - 1; j >= 0; j--) {
      if (inclusiveInorNot(previousTime, currentTime, punches[j])) {
        const punch = punches.splice(j, 1)[0];
        return punch;
      }
    }

    return "00:00";
  });

  // Return all matched punches including overtime
  return {
    punches: takenPunches,
    date,
    shift: normalAllRules,
    workingDecoded,
    overtimeDecoded,
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

  // ADD THIS LOGIC for special rules with empty table
  if (rulesModel.param3 === "special" && table.length === 0) {
    return [];
  }
  // console.log(rulesModel);
  // if (rulesModel.empId === 70709906) {
  //   console.log(rulesModel);
  // }

  if ([rulesModel.param1, rulesModel.param2].every((v) => v === null)) {
    return [];
  }

  // Sort by date once
  const sortedAttendance = [...monthlyAttendance].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sortedAttendance.length; i++) {
    const record = sortedAttendance[i];
    const punches = JSON.parse(record.checkIn);
    const date = record.date;
    const mac = record.macId;
    const id = record.empId;

    const previousDayPunches =
      i > 0 ? JSON.parse(sortedAttendance[i - 1].checkIn) : [];
    // NEW: Get next day's schedule if available
    let nextDaySchedule = null;
    if (i < sortedAttendance.length - 1) {
      const nextRecord = sortedAttendance[i + 1];
      const nextDate = nextRecord.date;

      // Find next day's schedule from oneEmployeeData
      if (rulesModel.param3 === "special") {
        const nextDayFound = specialEmployeeData.find(
          (item) => item.date === nextDate
        );
        if (nextDayFound) {
          let nextDayRules = [];
          for (const shift of nextDayFound.param1 || []) {
            nextDayRules.push(shift.start, shift.end);
          }
          for (const shift of nextDayFound.param2 || []) {
            nextDayRules.push(shift.start, shift.end);
          }
          nextDaySchedule = nextDayRules;
        }
      }
    }

    const overtime =
      rulesModel.param3 === "special"
        ? convertPunchesWithSpecialRules(
            punches,
            mac,
            date,
            specialEmployeeData,
            previousDayPunches,
            nextDaySchedule,
            id
          )
        : convertPunchesWithNormalRules(punches, rulesModel, date);

    if (overtime.punches.length > 0) {
      punchesDetails.push(overtime);
    }
  }

  return rulesModel.param3 === "special"
    ? fastKeepHighMonth(punchesDetails)
    : punchesDetails;
}

export default punchAndShiftDetails;
