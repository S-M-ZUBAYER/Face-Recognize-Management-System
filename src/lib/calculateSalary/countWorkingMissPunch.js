function countWorkingMissPunch(workingShift, punchArray) {
  let missPunchCount = 0;

  const genuinePunchLength = workingShift.length * 2;

  for (let i = 0; i < genuinePunchLength; i++) {
    if (punchArray[i] === "00:00") {
      missPunchCount++;
    }
  }

  return {
    missPunchCount,
    hasMissPunch: missPunchCount > 0,
  };
}

export default countWorkingMissPunch;
