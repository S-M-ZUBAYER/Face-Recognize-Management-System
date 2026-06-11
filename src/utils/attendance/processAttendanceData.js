import getExpectedCheckInTime from "@/lib/getExpectedCheckInTime";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const getAttendanceRows = ({
  employees,
  attendance,
  overTime,
  startDate,
  endDate,
}) => {
  const dateRange = getDateRange(startDate, endDate);
  return processEmployeeData(
    employees || [],
    attendance || [],
    overTime || [],
    dateRange,
  );
};

export const getFilteredEmployees = (attendanceRows, activeFilter) => {
  switch (activeFilter) {
    case "punchData":
      return attendanceRows.punchData;
    case "present":
      return attendanceRows.presentEmployees;
    case "absent":
      return attendanceRows.absentEmployees;
    case "late":
      return attendanceRows.lateEmployees;
    case "overtime":
      return attendanceRows.overTimeEmployees;
    default:
      return attendanceRows.allEmployees;
  }
};

const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return [new Date().toISOString().split("T")[0]];
  }

  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return result;
};

const parseCheckInData = (checkIn) => {
  if (!checkIn) return [];

  try {
    if (typeof checkIn === "string") {
      return JSON.parse(checkIn);
    }

    if (Array.isArray(checkIn)) return checkIn;
    return [];
  } catch {
    return [];
  }
};

const processEmployeeData = (employees, attendance, overTime, dateRange) => {
  const allEmployees = [];
  const punchData = [];
  const presentEmployees = [];
  const absentEmployees = [];
  const overTimeEmployees = [];
  const lateEmployees = [];
  const rules = useGlobalStore.getState().globalRules;
  const attendanceMap = createAttendanceMap(attendance);
  const overtimeSet = createOvertimeSet(overTime);

  for (const employee of employees) {
    const employeeId = employee.empId || employee.id || employee.employeeId;
    if (!employeeId) continue;

    for (const date of dateRange) {
      const checkIn = attendanceMap.get(employeeId)?.get(date) || [];
      const isPresent = checkIn.length > 0;
      const leaveTypes = !isPresent ? getLeaveTypes(employee, date) : [];
      const dayType = !isPresent
        ? getDayType(employee.salaryRules || { rules: [], holidays: [] }, date)
        : [];
      const hasOvertime = overtimeSet.has(employeeId);

      punchData.push({
        ...employee,
        employeeId,
        date,
        punch: {
          date,
          checkIn: checkIn || [],
        },
        isPresent,
        hasOvertime,
      });

      const record = {
        ...employee,
        employeeId,
        date,
        punch: {
          date,
          checkIn: isPresent
            ? checkIn
            : leaveTypes.length > 0
              ? leaveTypes
              : dayType,
        },
        isPresent,
        hasOvertime,
      };

      allEmployees.push(record);

      if (isPresent) {
        presentEmployees.push(record);

        const { expectedTime, latenessGraceMin } = getExpectedCheckInTime({
          employee,
          selectedDate: date,
          rules,
        });
        const actualCheckIn = checkIn?.[0];

        if (!actualCheckIn || !expectedTime) continue;

        const actualMin = toMinutes(actualCheckIn);
        const expectedMin = toMinutes(expectedTime) + latenessGraceMin;

        if (actualMin !== null && actualMin > expectedMin) {
          lateEmployees.push(record);
        }

        continue;
      }

      if (leaveTypes.length === 0 && dayType.length === 0) {
        absentEmployees.push(record);
      }

      if (hasOvertime) {
        overTimeEmployees.push(record);
      }
    }
  }

  return {
    allEmployees,
    punchData,
    presentEmployees,
    absentEmployees,
    lateEmployees,
    overTimeEmployees,
  };
};

const createAttendanceMap = (attendance) => {
  const map = new Map();

  for (const { empId, date, checkIn } of attendance || []) {
    if (!empId) continue;

    if (!map.has(empId)) {
      map.set(empId, new Map());
    }

    map.get(empId).set(date, parseCheckInData(checkIn));
  }

  return map;
};

const createOvertimeSet = (overTime) => {
  const set = new Set();

  for (const record of overTime || []) {
    if (record.employeeId) {
      set.add(record.employeeId);
    }
  }

  return set;
};

const getLeaveTypes = (employee, date) => {
  const leaveTypes = [];
  const leaveMappings = {
    m_leaves: "Maternity leave",
    mar_leaves: "Marriage Leave",
    p_leaves: "Personal Leave",
    s_leaves: "Sick Leave",
    c_leaves: "Casual Leave",
    e_leaves: "Earned Leave",
    w_leaves: "Without Pay Leave",
    r_leaves: "Rest Leave",
    o_leaves: "Other Leave",
  };

  if (!employee.salaryRules) return leaveTypes;

  const dateOnly = date.split("T")[0];
  const generalDays = [];

  for (const h of employee.salaryRules.generalDays || []) {
    generalDays.push(h.split("T")[0]);
  }

  if (generalDays.includes(dateOnly)) {
    return [];
  }

  for (const leaveKey of Object.keys(leaveMappings)) {
    const leaves = employee.salaryRules[leaveKey];

    if (Array.isArray(leaves)) {
      const hasLeave = leaves.some((leave) => {
        const leaveDate = leave.date?.date || leave.date;
        return leaveDate?.toString().includes(date);
      });

      if (hasLeave) {
        leaveTypes.push(leaveMappings[leaveKey]);
      }
    }
  }

  return leaveTypes;
};

const getDayType = (salaryRules, date) => {
  const day = new Date(date);
  const dayName = day.toLocaleString("en-US", { weekday: "long" });
  const dateOnly = date.split("T")[0];
  const generalDays = [];

  for (const h of salaryRules.generalDays || []) {
    generalDays.push(h.split("T")[0]);
  }

  if (generalDays.includes(dateOnly)) {
    return [];
  }

  const weekendRule = salaryRules.rules.find((r) => r.ruleId === 2);
  const weekendNames = [];

  if (weekendRule) {
    for (const key of [
      "param1",
      "param2",
      "param3",
      "param4",
      "param5",
      "param6",
    ]) {
      if (
        weekendRule[key] &&
        typeof weekendRule[key] === "string" &&
        weekendRule[key].trim() !== ""
      ) {
        weekendNames.push(weekendRule[key].trim());
      }
    }
  }

  const holidayDates = [];

  for (const h of salaryRules.holidays || []) {
    holidayDates.push(h.split("T")[0]);
  }

  const replaceDaysSet = new Set();

  for (const item of salaryRules.replaceDays ?? []) {
    if (item?.rdate) {
      replaceDaysSet.add(item.rdate.split("T")[0]);
    }
  }

  if (replaceDaysSet.has(dateOnly)) return ["Replace Day"];
  if (holidayDates.includes(dateOnly)) return ["Holiday"];
  if (weekendNames.includes(dayName)) return ["Weekend"];

  return [];
};

const toMinutes = (time) => {
  try {
    if (!time || typeof time !== "string") return null;

    const [h, m] = time.split(":").map(Number);

    if (isNaN(h) || isNaN(m)) return null;

    return h * 60 + m;
  } catch {
    return null;
  }
};
