function isNightShiftSimple(ruleData) {
  if (
    ruleData.param3 !== "normal" ||
    !ruleData.param1 ||
    !Array.isArray(ruleData.param1)
  ) {
    return false;
  }

  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  for (const shift of ruleData.param1) {
    if (!shift.start || !shift.end) continue;

    const startMinutes = parseTimeToMinutes(shift.start);
    const endMinutes = parseTimeToMinutes(shift.end);

    // Simple check: shift crosses midnight
    if (endMinutes < startMinutes) {
      return true;
    }
  }

  return false;
}

export default isNightShiftSimple;
