function calculateWorkedTime(workingArray, punchArray) {
  // Convert HH:mm → minutes
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  let totalMinutes = 0;
  // let missPunch = false;

  // Loop per working shift
  for (let i = 0; i < workingArray.length; i++) {
    const work = workingArray[i];

    const punchInRaw = punchArray[i * 2];
    const punchOutRaw = punchArray[i * 2 + 1];

    const workStartMin = toMinutes(work.start);
    const workEndMin = toMinutes(work.end);

    // Case 1: both punches missing → DON'T count
    if (punchInRaw === "00:00" && punchOutRaw === "00:00") {
      continue;
    }

    // Case 2: one punch missing → count FULL working shift
    if (punchInRaw === "00:00" || punchOutRaw === "00:00") {
      totalMinutes += workEndMin - workStartMin;
      // missPunch = true;
      continue;
    }

    // Case 3: normal punches → calculate overlap
    const punchInMin = toMinutes(punchInRaw);
    const punchOutMin = toMinutes(punchOutRaw);

    const overlapStart = Math.max(punchInMin, workStartMin);
    const overlapEnd = Math.min(punchOutMin, workEndMin);

    if (overlapStart < overlapEnd) {
      totalMinutes += overlapEnd - overlapStart;
    }
  }

  // return {
  //   totalMinutes,
  //   formatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
  //   missPunch,
  // };

  return totalMinutes;
}

export default calculateWorkedTime;
