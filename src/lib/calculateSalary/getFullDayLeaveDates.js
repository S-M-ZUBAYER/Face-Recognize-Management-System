export function getFullDayLeaveDates(leaveArrays) {
  const fullDayLeaveDates = [];
  const halfDayLeaveDates = [];

  leaveArrays.forEach((leaveArray) => {
    if (!Array.isArray(leaveArray)) return;

    leaveArray.forEach((leave) => {
      if (
        leave &&
        leave.date &&
        leave.date.date &&
        leave.date.start === null &&
        leave.date.end === null
      ) {
        // Extract just the date part (YYYY-MM-DD) from the datetime string
        const dateOnly = leave.date.date.split("T")[0];
        fullDayLeaveDates.push(dateOnly);
      } else if (
        leave &&
        leave.date &&
        leave.date.date &&
        (leave.date.start !== null || leave.date.end !== null)
      ) {
        const dateOnly = leave.date.date.split("T")[0];
        halfDayLeaveDates.push(dateOnly);
      }
    });
  });

  return {
    fullDayLeaveDates,
    halfDayLeaveDates,
  };
}
