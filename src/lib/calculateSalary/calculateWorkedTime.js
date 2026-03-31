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
      totalMinutes += Math.max(0, workEndMin - workStartMin);
      // missPunch = true;
      continue;
    }
    // Case 2: one punch missing → count FULL working shift
    // if (punchInRaw === "00:00" || punchOutRaw === "00:00") {
    //   let start = workStartMin;
    //   let end = workEndMin;

    //   // ✅ Fix: handle overnight shift
    //   if (end < start) {
    //     end += 24 * 60; // add 24 hours
    //   }

    //   totalMinutes += end - start;

    //   continue;
    // }

    // // Case 3: normal punches → calculate overlap
    const punchInMin = toMinutes(punchInRaw);
    const punchOutMin = toMinutes(punchOutRaw);

    const overlapStart = Math.max(punchInMin, workStartMin);
    const overlapEnd = Math.min(punchOutMin, workEndMin);

    if (overlapStart < overlapEnd) {
      totalMinutes += Math.max(0, workEndMin - workStartMin);
    }

    // const punchInMin = toMinutes(punchInRaw);
    // const punchOutMin = toMinutes(punchOutRaw);

    // let start = workStartMin;
    // let end = workEndMin;
    // let inTime = punchInMin;
    // let outTime = punchOutMin;

    // // ✅ Fix shift crossing midnight
    // if (end < start) {
    //   end += 1440;

    //   if (inTime < start) inTime += 1440;
    //   if (outTime < start) outTime += 1440;
    // }

    // // ✅ Fix punch crossing midnight
    // if (outTime < inTime) {
    //   outTime += 1440;
    // }

    // // Now safe overlap calculation
    // const overlapStart = Math.max(inTime, start);
    // const overlapEnd = Math.min(outTime, end);

    // if (overlapStart < overlapEnd) {
    //   totalMinutes += overlapEnd - overlapStart;
    // }
  }

  // return {
  //   totalMinutes,
  //   formatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
  //   missPunch,
  // };

  return totalMinutes;
}

export default calculateWorkedTime;
