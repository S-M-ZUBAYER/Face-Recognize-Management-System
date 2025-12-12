export function realAbsentCount(employeeData, inputDate) {
  const date = new Date(inputDate);
  if (isNaN(date)) return false;

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

  // ------------------------------
  // 1️⃣ Collect all Holiday Dates
  // ------------------------------
  const holidays = new Set(
    (employeeData.holidays || []).map((d) => d.split("T")[0])
  );

  // ------------------------------
  // 2️⃣ Collect all Leave Dates
  // ------------------------------
  const leaveKeys = [
    "m_leaves",
    "mar_leaves",
    "p_leaves",
    "s_leaves",
    "c_leaves",
    "e_leaves",
    "w_leaves",
    "r_leaves",
    "o_leaves",
  ];

  const leaveDates = new Set();

  leaveKeys.forEach((key) => {
    (employeeData[key] || []).forEach((leave) => {
      if (leave.date?.date) {
        leaveDates.add(leave.date.date.split("T")[0]);
      }
    });
  });

  // ------------------------------
  // 3️⃣ Collect Weekend Days
  // (from ruleId === 2)
  // ------------------------------
  const weekendRule = (employeeData.rules || []).find((r) => r.ruleId === 2);
  const weekendDays = new Set();

  if (weekendRule) {
    ["param1", "param2", "param3", "param4", "param5", "param6"].forEach(
      (key) => {
        const value = weekendRule[key];
        if (Array.isArray(value)) {
          value.forEach((v) => v && weekendDays.add(v));
        } else if (typeof value === "string" && value.trim() !== "") {
          weekendDays.add(value);
        }
      }
    );
  }

  // ------------------------------
  // 4️⃣ Now Check if date is blocked
  // ------------------------------
  const dateStr = inputDate;

  const isHoliday = holidays.has(dateStr);
  const isLeave = leaveDates.has(dateStr);
  const isWeekend = weekendDays.has(dayName);

  if (isHoliday || isLeave || isWeekend) {
    return false; // ❌ invalid
  }

  return true; // ✅ valid
}
