import { useGlobalStore } from "@/zustand/useGlobalStore";
import isNightShiftSimple from "./isNightShiftSimple";
import getPerfectPunches from "./calculateSalary/getPerfectPunches";
import fastKeepLowMonth from "./fastKeepLowMonth";

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
  nextDayPunchesAsStrings = [] // Changed from previousDayPunchesAsStrings
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
  function isNight(timeArray) {
    if (!timeArray || timeArray.length === 0) return false;

    const firstTime = timeArray[0];
    const lastTime = timeArray[timeArray.length - 1];

    const firstHours = parseInt(firstTime.split(":")[0]);
    const lastHours = parseInt(lastTime.split(":")[0]);

    // If last time hour is smaller than first time hour, it crossed midnight
    return lastHours < firstHours;
  }
  const isNightShift = isNight(normalAllRules);
  // if (id === "70709908") {
  //   console.log(isNightShift, date, normalAllRules);
  // }
  if (isNightShift) {
    const { perfectPunches } = getPerfectPunches(
      punchesAsStrings,
      nextDayPunchesAsStrings,
      normalAllRules
    );

    // if (id === "70709908") {
    //   console.log(
    //     date,
    //     punchesAsStrings,
    //     nextDayPunchesAsStrings,
    //     normalAllRules,
    //     perfectPunches
    //   );
    // }
    punches = perfectPunches;
  }

  let takenPunches;

  if (isNightShift) {
    takenPunches = normalAllRules.map((currentTime, i, arr) => {
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
      // for (let j = punches.length - 1; j >= 0; j--) {
      //   if (inclusiveInorNot(previousTime, currentTime, punches[j])) {
      //     const punch = punches.splice(j, 1)[0];
      //     return punch;
      //   }
      // }

      return "00:00";
    });
  } else {
    takenPunches = normalAllRules.map((currentTime, i, arr) => {
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
  }

  return {
    punches: takenPunches,
    date,
    shift: normalAllRules,
    workingDecoded,
    overtimeDecoded,
  };
}

function convertPunchesWithNormalRules(
  punchesAsStrings,
  rulesModel,
  date,
  nextDayPunchesAsStrings = [], // Changed from previousDayPunchesAsStrings
  isNightShift
  // id
) {
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

  // NEW LOGIC: Handle overnight shifts ONLY when isNightShiftSimple is true

  if (isNightShift) {
    const { perfectPunches } = getPerfectPunches(
      punchesAsStrings,
      nextDayPunchesAsStrings,
      normalAllRules
    );

    // if (id === "7070969796") {
    //   console.log(
    //     punchesAsStrings,
    //     nextDayPunchesAsStrings,
    //     normalAllRules,
    //     perfectPunches
    //   );
    // }
    punches = perfectPunches;
  }

  let takenPunches;

  if (isNightShift) {
    takenPunches = normalAllRules.map((currentTime, i, arr) => {
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
      // for (let j = punches.length - 1; j >= 0; j--) {
      //   if (inclusiveInorNot(previousTime, currentTime, punches[j])) {
      //     const punch = punches.splice(j, 1)[0];
      //     return punch;
      //   }
      // }

      return "00:00";
    });
  } else {
    takenPunches = normalAllRules.map((currentTime, i, arr) => {
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
  }

  // Return all matched punches including overtime
  return {
    punches: takenPunches,
    date,
    shift: normalAllRules,
    workingDecoded,
    overtimeDecoded,
  };
}

function punchAndShiftDetails(monthlyAttendance, salaryRules, run = false) {
  const rulesModel = salaryRules.rules.find((item) => item.ruleId === 0) || {
    param1: [],
    param2: [],
    param3: "normal",
  };
  const table = salaryRules.timeTables || [];
  const punchesDetails = [];
  const specialEmployeeData = rulesModel.param3 === "special" ? table : [];
  const isNightShift = isNightShiftSimple(rulesModel);

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
    let punches;

    try {
      punches = JSON.parse(record.checkIn);
    } catch (error) {
      console.error("Invalid punch data - skipping:", {
        empId: record.empId,
        macId: record.macId,
        date: record.date,
        error: error.message,
      });
      continue; // Skip this iteration and move to next record
    }

    const date = record.date;
    const mac = record.macId;
    const id = record.empId;

    const nextDayPunches =
      i < sortedAttendance.length - 1
        ? JSON.parse(sortedAttendance[i + 1].checkIn)
        : [];

    const overtime =
      rulesModel.param3 === "special"
        ? convertPunchesWithSpecialRules(
            punches,
            mac,
            date,
            specialEmployeeData,
            nextDayPunches,
            id
          )
        : convertPunchesWithNormalRules(
            punches,
            rulesModel,
            date,
            nextDayPunches,
            isNightShift,
            id
          );

    if (overtime.punches.length > 0) {
      punchesDetails.push(overtime);
    }
  }
  // console.log(run);
  return !run && (rulesModel.param3 === "special" || isNightShift)
    ? fastKeepLowMonth(punchesDetails)
    : punchesDetails;
}

export default punchAndShiftDetails;
