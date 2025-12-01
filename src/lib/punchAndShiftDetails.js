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
  previousDayPunchesAsStrings = []
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

  // FIXED OVERNIGHT SHIFT LOGIC
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

      // FIX: Remove evening punches that should go to next day
      let eveningPunchesToRemove = [];
      let remainingPunches = [];

      for (let i = 0; i < punches.length; i++) {
        const punchMinutes = parseTimeToMinutes(punches[i]);
        // If punch is in evening (18:00-23:59) and near shift start, mark it for removal
        if (punchMinutes >= 1080 && punchMinutes <= 1439) {
          // 18:00 = 1080 minutes, 23:59 = 1439 minutes
          if (punchMinutes >= oneHourBefore && punchMinutes <= oneHourAfter) {
            eveningPunchesToRemove.push(punches[i]);
            continue;
          }
        }
        remainingPunches.push(punches[i]);
      }

      // Keep only the remaining punches
      punches = remainingPunches;

      // CASE 1: Current day HAS multiple punches (active overnight shift)
      if (punches.length > 1) {
        // Find closest early morning punch from previous day
        let closestPreviousPunch = null;
        let minDiffPrevious = Infinity;

        for (let i = 0; i < previousDayPunchesAsStrings.length; i++) {
          const punchMinutes = parseTimeToMinutes(
            previousDayPunchesAsStrings[i]
          );

          // Only consider punches from previous day that are in early morning (00:00 - 06:00)
          const isEarlyMorningPunch = punchMinutes >= 0 && punchMinutes <= 360;

          if (
            isEarlyMorningPunch &&
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

        // Add the previous day punch if found
        if (closestPreviousPunch) {
          punches.push(closestPreviousPunch);
          punches.sort();
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
  };
}

function convertPunchesWithNormalRules(punchesAsStrings, rulesModel, date) {
  let punches = [...punchesAsStrings].sort();
  let normalAllRules = [];

  if (Array.isArray(rulesModel.param1) && Array.isArray(rulesModel.param2)) {
    // ONLY NORMAL LOGIC - no special condition
    let workingDecoded = rulesModel.param1 || [];
    let overtimeDecoded = rulesModel.param2 || [];

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

    const previousDayPunches =
      i > 0 ? JSON.parse(sortedAttendance[i - 1].checkIn) : [];

    const overtime =
      rulesModel.param3 === "special"
        ? convertPunchesWithSpecialRules(
            punches,
            mac,
            date,
            specialEmployeeData,
            previousDayPunches
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
