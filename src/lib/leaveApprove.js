function leaveApprove({ salaryRules, leave }) {
  // console.log(salaryRules,leaveType,startDate,endDate)

  const { leaveCategory, startDate, endDate, leaveType, description } = leave;

  // const isFullDay = leaveType === "Full Day Leave";
  const isHourly = leaveType === "Hourly Leave";
  const isExtended = leaveType === "Extended Leave";

  let startTime = null;
  let endTime = null;
  let firstDayTime = { start: null, end: null };
  let lastDayTime = { start: null, end: null };

  if (isHourly) {
    startTime = description.fromTime;
    endTime = description.toTime;
  }

  if (isExtended) {
    firstDayTime = {
      start: description.fStartHour,
      end: description.fEndHour,
    };

    lastDayTime = {
      start: description.lStartHour,
      end: description.lEndHour,
    };
  }
  /* ---------------- Leave mapping ---------------- */
  const leaveMappings = {
    m_leaves: "Maternity leave",
    mar_leaves: "Marriage Leave",
    p_leaves: "Personal Leave",
    s_leaves: "Sick Leave",
    c_leaves: "Casual Leave",
    e_leaves: "Earned Leave",
    w_leaves: "Without Pay Leave",
    r_leaves: "Rest Leave",
    o_leaves: "Others",
  };

  /* ---------------- Find leave key ---------------- */
  const leaveKey = Object.keys(leaveMappings).find(
    (key) => leaveMappings[key] === leaveCategory
  );

  if (!leaveKey) {
    throw new Error("Invalid leave type provided");
  }

  const existingLeaves = Array.isArray(salaryRules[leaveKey])
    ? salaryRules[leaveKey]
    : [];

  const empId = salaryRules.empId;

  /* ---------------- Helpers ---------------- */
  const toDate = (d) => new Date(d + "T00:00:00.000");
  const formatDateForStorage = (date) => {
    if (!date) return "";

    // Create date without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000`;
  };

  /* ---------------- Existing date set ---------------- */
  const existingDateSet = new Set(existingLeaves.map((l) => l.date?.date));

  /* ---------------- ID handling ---------------- */
  let nextId =
    existingLeaves.length > 0
      ? Math.max(...existingLeaves.map((l) => l.id)) + 1
      : 1;

  /* ---------------- Date range generation ---------------- */

  const newLeaves = [];

  if (isExtended) {
    const start = toDate(startDate);
    const end = toDate(endDate);

    for (
      let current = new Date(start);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      const isoDate = formatDateForStorage(current);

      if (existingDateSet.has(isoDate)) continue;

      const isFirstDay = current.getTime() === start.getTime();
      const isLastDay = current.getTime() === end.getTime();

      newLeaves.push({
        id: nextId++,
        empId,
        date: {
          date: isoDate,
          start: isFirstDay
            ? firstDayTime.start
            : isLastDay
            ? lastDayTime.start
            : null,
          end: isFirstDay
            ? firstDayTime.end
            : isLastDay
            ? lastDayTime.end
            : null,
        },
        deductDay: 0,
        deductMoney: 0,
      });
    }
  } else {
    // Hourly Leave OR Full Day Leave (single date)
    const singleDate = toDate(startDate);
    const isoDate = formatDateForStorage(singleDate);

    if (!existingDateSet.has(isoDate)) {
      newLeaves.push({
        id: nextId++,
        empId,
        date: {
          date: isoDate,
          start: startTime,
          end: endTime,
        },
        deductDay: 0,
        deductMoney: 0,
      });
    }
  }

  /* ---------------- Return updated object ---------------- */
  return {
    [leaveKey]: [...existingLeaves, ...newLeaves],
  };
}

export default leaveApprove;
