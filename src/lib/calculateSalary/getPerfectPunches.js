function getPerfectPunches(currentDayPunches, nextDayPunches, workingShift) {
  // Convert time string to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Convert all arrays to minutes
  const currentDayMinutes = currentDayPunches.map(timeToMinutes);
  const nextDayMinutes = nextDayPunches.map(timeToMinutes);
  const workingShiftMinutes = workingShift.map(timeToMinutes);

  // Find EVENING/NIGHT shifts (typically 12:00 PM to midnight)
  // These are shifts that start in the evening and might overlap to next day
  const eveningShifts = workingShiftMinutes.filter((time) => time >= 12 * 60);

  // Arrays to store selected punches
  const selectedCurrentDayPunches = [];
  const punchesToRemoveFromNextDay = [];

  // Step 1: For each EVENING shift, find matching punches
  for (const shift of eveningShifts) {
    const shiftStart = shift - 60; // -1 hour
    const shiftEnd = shift + 60; // +1 hour

    // Find matching punches in current day
    const matchingCurrentDayPunches = currentDayMinutes.filter(
      (punch) => punch >= shiftStart && punch <= shiftEnd
    );

    // Add these to selected punches
    selectedCurrentDayPunches.push(...matchingCurrentDayPunches);

    // Find matching punches in next day that should be removed
    const matchingNextDayPunches = nextDayMinutes.filter(
      (punch) => punch >= shiftStart && punch <= shiftEnd
    );

    // Mark these for removal from next day
    punchesToRemoveFromNextDay.push(...matchingNextDayPunches);
  }

  // Step 2: Get next day punches EXCEPT those that match evening shifts
  const filteredNextDayMinutes = nextDayMinutes.filter(
    (punch) => !punchesToRemoveFromNextDay.includes(punch)
  );

  // Step 3: Combine ONLY selected current day punches + filtered next day punches
  const allPunchesMinutes = [
    ...selectedCurrentDayPunches,
    ...filteredNextDayMinutes,
  ];

  const nextDayValidation = filteredNextDayMinutes.map(minutesToTime);
  function isValidShift(timeArray) {
    return timeArray.some((time) => {
      const hours = parseInt(time.split(":")[0]);
      return hours >= 0 && hours < 12;
    });
  }
  if (!isValidShift(nextDayValidation)) {
    return { perfectPunches: [] };
  }

  // Sort chronologically
  allPunchesMinutes.sort((a, b) => a - b);

  // Convert back to time strings
  const perfectPunches = allPunchesMinutes.map(minutesToTime);

  return {
    perfectPunches: perfectPunches,
    selectedFromCurrentDay: selectedCurrentDayPunches.map(minutesToTime),
    removedFromNextDay: punchesToRemoveFromNextDay.map(minutesToTime),
    eveningShifts: eveningShifts.map(minutesToTime),
  };
}

export default getPerfectPunches;
