function getPerfectPunches(currentDayPunches, nextDayPunches, workingShift) {
  // Helper functions
  const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "00:00") return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if time1 > time2
  const isTimeGreater = (time1, time2) => {
    return timeToMinutes(time1) > timeToMinutes(time2);
  };

  // Find middle time - but adjusted for your logic
  const findMiddleTime = (time1, time2) => {
    const mins1 = timeToMinutes(time1);
    const mins2 = timeToMinutes(time2);

    if (mins2 < mins1) {
      // Overnight - add 24 hours to the second time
      const totalMins2 = mins2 + 24 * 60;
      const middle = Math.floor((mins1 + totalMins2) / 2);
      return minutesToTime(middle % (24 * 60));
    } else {
      const middle = Math.floor((mins1 + mins2) / 2);
      return minutesToTime(middle);
    }
  };

  // Check if a time is inclusive between two borders
  const inclusiveInorNot = (leftBorder, rightBorder, checkTime) => {
    const leftMins = timeToMinutes(leftBorder);
    const rightMins = timeToMinutes(rightBorder);
    const checkMins = timeToMinutes(checkTime);

    if (rightMins < leftMins) {
      // Overnight range
      return (
        (checkMins >= leftMins && checkMins < 24 * 60) ||
        (checkMins >= 0 && checkMins <= rightMins)
      );
    } else {
      // Normal range
      return checkMins >= leftMins && checkMins <= rightMins;
    }
  };

  // Get last non-zero time from array
  const getLastNonZeroTime = (times) => {
    for (let i = times.length - 1; i >= 0; i--) {
      if (times[i] !== "00:00") {
        return times[i];
      }
    }
    return null;
  };

  // Detect if each rule time belongs to previous day or today
  // Based on comparing with lastNonZeroTime
  const detectPreviousOrToday = (rules, lastNonZeroTime) => {
    const result = [];
    const lastNonZeroMins = timeToMinutes(lastNonZeroTime);

    for (const rule of rules) {
      const ruleMins = timeToMinutes(rule);
      // If rule time is greater than lastNonZeroTime, it's from previous day
      // This is the key logic from Dart code
      result.push(ruleMins > lastNonZeroMins);
    }

    return result;
  };

  // Main logic
  const takenPunches = [];

  // Sort punches
  currentDayPunches.sort();
  nextDayPunches.sort();

  // Make copies we can modify
  let punches = [...currentDayPunches];
  let nextDayPunchesCopy = [...nextDayPunches];

  // Filter out empty rules
  const normalAllRules = workingShift.filter(
    (rule) => rule && rule.trim() !== ""
  );

  if (normalAllRules.length === 0) {
    return {
      perfectPunches: [],
      takenPunches: [],
      selectedFromCurrentDay: [],
      selectedFromNextDay: [],
    };
  }

  // Get last non-zero time
  const lastNonZeroTime = getLastNonZeroTime(normalAllRules);

  if (lastNonZeroTime && isTimeGreater(normalAllRules[0], lastNonZeroTime)) {
    // Night shift detected - first time > last non-zero time
    const previousDayOrNot = detectPreviousOrToday(
      normalAllRules,
      lastNonZeroTime
    );

    // console.log("Night shift detected");
    // console.log("Previous day or not:", previousDayOrNot);

    for (let i = 0; i < normalAllRules.length; i++) {
      const previousTime =
        normalAllRules[(i - 1 + normalAllRules.length) % normalAllRules.length];
      const currentTime = normalAllRules[i];
      const nextTime = normalAllRules[(i + 1) % normalAllRules.length];

      const leftSideBorder = findMiddleTime(previousTime, currentTime);
      const rightSideBorder = findMiddleTime(currentTime, nextTime);

      // console.log(`\nProcessing rule ${i}: ${currentTime}`);
      // console.log(`Previous: ${previousTime}, Next: ${nextTime}`);
      // console.log(`Left border: ${leftSideBorder}, Right border: ${rightSideBorder}`);
      // console.log(`Is previous day? ${previousDayOrNot[i]}`);

      if (previousDayOrNot[i]) {
        // Look in current day punches
        let matchFound = false;

        // console.log("Looking in current day punches:", punches);

        for (let j = 0; j < punches.length; j++) {
          if (inclusiveInorNot(leftSideBorder, rightSideBorder, punches[j])) {
            // console.log(`Found match: ${punches[j]} in range [${leftSideBorder}, ${rightSideBorder}]`);
            takenPunches.push(punches[j]);
            punches.splice(j, 1);
            matchFound = true;
            break;
          }
        }

        // If no match found, add '00:00'
        if (!matchFound) {
          // console.log(`No match found, adding 00:00`);
          takenPunches.push("00:00");
        }
      } else {
        // Look in next day punches
        let matchFound = false;

        // console.log("Looking in next day punches:", nextDayPunchesCopy);

        for (let j = 0; j < nextDayPunchesCopy.length; j++) {
          if (
            inclusiveInorNot(
              leftSideBorder,
              rightSideBorder,
              nextDayPunchesCopy[j]
            )
          ) {
            // console.log(`Found match: ${nextDayPunchesCopy[j]} in range [${leftSideBorder}, ${rightSideBorder}]`);
            takenPunches.push(nextDayPunchesCopy[j]);
            nextDayPunchesCopy.splice(j, 1);
            matchFound = true;
            break;
          }
        }

        // If no match found, add '00:00'
        if (!matchFound) {
          // console.log(`No match found, adding 00:00`);
          takenPunches.push("00:00");
        }
      }
    }
  } else {
    // Normal day (no night shift)
    // console.log("Normal day detected");

    for (let i = 0; i < normalAllRules.length; i++) {
      const previousTime =
        normalAllRules[(i - 1 + normalAllRules.length) % normalAllRules.length];
      const currentTime = normalAllRules[i];
      const nextTime = normalAllRules[(i + 1) % normalAllRules.length];

      const leftSideBorder = findMiddleTime(previousTime, currentTime);
      const rightSideBorder = findMiddleTime(currentTime, nextTime);

      // console.log(`\nProcessing rule ${i}: ${currentTime}`);
      // console.log(`Previous: ${previousTime}, Next: ${nextTime}`);
      // console.log(`Left border: ${leftSideBorder}, Right border: ${rightSideBorder}`);

      let matchFound = false;

      // First try: Look for punches within borders
      // console.log("Looking in current day punches:", punches);

      for (let j = 0; j < punches.length; j++) {
        if (inclusiveInorNot(leftSideBorder, rightSideBorder, punches[j])) {
          // console.log(
          //   `Found match: ${punches[j]} in range [${leftSideBorder}, ${rightSideBorder}]`
          // );
          takenPunches.push(punches[j]);
          punches.splice(j, 1);
          matchFound = true;
          break;
        }
      }

      // Second try: Look for punches between previous and current time
      if (!matchFound) {
        // console.log("Second try: looking between previous and current time");
        for (let j = punches.length - 1; j >= 0; j--) {
          if (inclusiveInorNot(previousTime, currentTime, punches[j])) {
            // console.log(
            //   `Found match: ${punches[j]} in range [${previousTime}, ${currentTime}]`
            // );
            takenPunches.push(punches[j]);
            punches.splice(j, 1);
            matchFound = true;
            break;
          }
        }
      }

      // If no match found, add '00:00'
      if (!matchFound) {
        // console.log(`No match found, adding 00:00`);
        takenPunches.push("00:00");
      }
    }
  }

  // Filter out '00:00' entries for perfect punches
  const perfectPunches = takenPunches.filter((punch) => punch !== "00:00");

  // Separate by day
  const selectedFromCurrentDay = perfectPunches.filter((punch) =>
    currentDayPunches.includes(punch)
  );

  const selectedFromNextDay = perfectPunches.filter((punch) =>
    nextDayPunches.includes(punch)
  );

  return {
    perfectPunches: perfectPunches,
    takenPunches: takenPunches,
    selectedFromCurrentDay: selectedFromCurrentDay,
    selectedFromNextDay: selectedFromNextDay,
    remainingCurrentPunches: punches,
    remainingNextPunches: nextDayPunchesCopy,
  };
}

export default getPerfectPunches;
