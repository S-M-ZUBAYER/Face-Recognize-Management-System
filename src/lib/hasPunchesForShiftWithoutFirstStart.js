function hasPunchesForShiftWithoutFirstStart(workingDecoded, punches) {
  // Helper function to convert time to minutes
  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Helper function to check if punch is within ±1 hour of a time
  const isWithinOneHour = (punchMinutes, targetMinutes) => {
    const diff = Math.abs(punchMinutes - targetMinutes);
    return diff <= 60; // Within 1 hour (60 minutes)
  };

  if (!workingDecoded.length || !punches.length) {
    return false;
  }

  // Extract all shift boundaries except first start time
  const shiftBoundaries = [];

  workingDecoded.forEach((shift, index) => {
    // For first shift, only add END time (skip start)
    if (index === 0) {
      shiftBoundaries.push(parseTimeToMinutes(shift.end));
    } else {
      // For other shifts, add BOTH start and end
      shiftBoundaries.push(parseTimeToMinutes(shift.start));
      shiftBoundaries.push(parseTimeToMinutes(shift.end));
    }
  });

  // Check each punch against all shift boundaries
  for (const punch of punches) {
    const punchMinutes = parseTimeToMinutes(punch);

    // Check if punch is within ±1 hour of any shift boundary
    for (const boundaryMinutes of shiftBoundaries) {
      if (isWithinOneHour(punchMinutes, boundaryMinutes)) {
        return true;
      }
    }
  }

  return false;
}

export default hasPunchesForShiftWithoutFirstStart;
