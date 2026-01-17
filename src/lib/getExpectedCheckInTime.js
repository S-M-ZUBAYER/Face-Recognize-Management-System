const getExpectedCheckInTime = ({ employee, selectedDate, rules }) => {
  const empRules = employee.salaryRules?.rules || [];

  /* ---------------- Rule 0: Expected check-in time ---------------- */
  const rule0 = empRules.find((r) => r.ruleId === 0);
  if (!rule0) {
    return { expectedTime: null, latenessGraceMin: 0 };
  }

  let expectedTime = rule0.param1?.[0]?.start ?? rule0.param1 ?? null;

  // Special day handling
  if (rule0.param3 === "special") {
    const table = employee.salaryRules?.timeTables?.find(
      (t) => t.date === selectedDate
    );

    if (table?.param1?.[0]?.start) {
      expectedTime = table.param1[0].start;
    } else {
      const generalRule = rules.find((r) => r.deviceMAC === employee.deviceMAC);

      const generalExpected = generalRule?.salaryRules?.rules?.find(
        (r) => r.ruleId === 0
      )?.param1?.[0]?.start;

      if (generalExpected) {
        expectedTime = generalExpected;
      }
    }
  }

  /* ---------------- Rule 4: Lateness grace minutes ---------------- */
  const rule4 = empRules.find((r) => r.ruleId === 4);
  let latenessGraceMin = 0;

  if (rule4?.param1 != null) {
    const value = String(rule4.param1).trim();
    if (/^[0-9]+$/.test(value)) {
      latenessGraceMin = Number(value);
    }
  }

  return {
    expectedTime,
    latenessGraceMin,
  };
};

export default getExpectedCheckInTime;
