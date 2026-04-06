import getExpectedCheckInTime from "@/lib/getExpectedCheckInTime";
import { create } from "zustand";
import { useGlobalStore } from "./useGlobalStore";

export const useAttendanceStore = create((set, get) => ({
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: (value) => set({ selectedDate: value }),
  // Employee arrays - these will be properly populated
  allEmployees: [],
  punchData: [],
  presentEmployees: [],
  absentEmployees: [],
  lateEmployees: [],
  overTimeEmployees: [],

  // Counts
  totalCount: 0,
  presentCount: 0,
  absentCount: 0,
  lateCount: 0,

  // UI states
  activeFilter: "punchData",
  isProcessing: false,
  isFilterLoading: false,

  // Simple setter for filter
  setActiveFilter: (value) => {
    const state = get();
    if (state.activeFilter === value) return; // Prevent unnecessary updates

    set({
      activeFilter: value,
      isFilterLoading: true,
    });

    setTimeout(() => {
      set({ isFilterLoading: false });
    }, 200);
  },

  // Main processing function - FIXED to prevent state updates during processing
  processAttendanceData: (
    employees,
    attendance,
    overTime,
    startDate,
    endDate,
  ) => {
    const state = get();

    // Don't process if already processing
    if (state.isProcessing) {
      console.log("⏳ Already processing, skipping...");
      return;
    }

    console.log("🔄 Processing attendance data...");
    set({ isProcessing: true });

    // Use setTimeout to ensure we're not in render phase
    setTimeout(() => {
      try {
        if (!employees?.length) {
          console.warn("⚠️ No employees data");
          set({ isProcessing: false });
          return;
        }

        // Get date range
        const dateRange = getDateRange(startDate, endDate);
        console.log(
          `📊 Processing ${employees.length} employees for ${dateRange.length} days`,
        );

        // Process data
        const result = processEmployeeData(
          employees,
          attendance,
          overTime,
          dateRange,
        );

        // Update state with processed data
        set({
          allEmployees: result.allEmployees,
          punchData: result.punchData,
          presentEmployees: result.presentEmployees,
          absentEmployees: result.absentEmployees,
          lateEmployees: result.lateEmployees,
          overTimeEmployees: result.overTimeEmployees,
          totalCount: result.allEmployees.length,
          presentCount: result.presentEmployees.length,
          absentCount: result.absentEmployees.length,
          lateCount: result.lateEmployees.length,
          isProcessing: false,
        });

        console.log("✅ Processing completed:", {
          total: result.allEmployees.length,
          present: result.presentEmployees.length,
          absent: result.absentEmployees.length,
          overtime: result.overTimeEmployees.length,
        });
      } catch (error) {
        console.error("❌ Processing error:", error);
        set({ isProcessing: false });
      }
    }, 0);
  },

  // Get currently filtered employees based on activeFilter
  getFilteredEmployees: () => {
    const state = get();
    switch (state.activeFilter) {
      case "punchData":
        return state.punchData;
      case "present":
        return state.presentEmployees;
      case "absent":
        return state.absentEmployees;
      case "late":
        return state.lateEmployees;
      case "overtime":
        return state.overTimeEmployees;
      default:
        return state.allEmployees;
    }
  },

  // Reset everything
  resetAttendanceData: () => {
    set({
      allEmployees: [],
      punchData: [],
      presentEmployees: [],
      absentEmployees: [],
      lateEmployees: [],
      overTimeEmployees: [],
      totalCount: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      isProcessing: false,
      isFilterLoading: false,
    });
  },
}));

// Helper functions (keep the same as before)
const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return [new Date().toISOString().split("T")[0]];
  }

  const result = [];
  let current = new Date(startDate);
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

  // Create quick lookup maps
  const attendanceMap = createAttendanceMap(attendance);
  const overtimeSet = createOvertimeSet(overTime);

  // Process each employee for each date
  employees.forEach((employee) => {
    const employeeId = employee.empId || employee.id || employee.employeeId;
    if (!employeeId) return;

    dateRange.forEach((date) => {
      // Check attendance
      const checkIn = attendanceMap.get(employeeId)?.get(date) || [];
      const isPresent = checkIn.length > 0;

      // Check leaves if absent
      const leaveTypes = !isPresent ? getLeaveTypes(employee, date) : [];
      const dayType = !isPresent
        ? getDayType(employee.salaryRules || { rules: [], holidays: [] }, date)
        : [];

      //add punch data
      punchData.push({
        ...employee,
        employeeId,
        date,
        punch: {
          date,
          checkIn: checkIn || [],
        },
        isPresent,
        hasOvertime: overtimeSet.has(employeeId),
      });

      // Create record
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
        hasOvertime: overtimeSet.has(employeeId),
      };
      // if (employeeId === "2109058927") {
      //   console.log(record, dayType, leaveTypes);
      // }
      // Add to appropriate arrays
      allEmployees.push(record);

      if (isPresent) {
        presentEmployees.push(record);

        // Check for lateness
        const { expectedTime, latenessGraceMin } = getExpectedCheckInTime({
          employee,
          selectedDate: date,
          rules,
        });

        let actualCheckIn;

        try {
          actualCheckIn = checkIn?.[0];
        } catch {
          return;
        }

        if (!actualCheckIn || !expectedTime) return;

        const toMinutes = (time) => {
          try {
            if (!time || typeof time !== "string") return null;

            const [h, m] = time.split(":").map(Number);

            if (isNaN(h) || isNaN(m)) return null;

            return h * 60 + m;
          } catch {
            return null; // stop everything here
          }
        };

        const actualMin = toMinutes(actualCheckIn);
        const expectedMin = toMinutes(expectedTime) + latenessGraceMin;

        if (actualMin > expectedMin) {
          return lateEmployees.push(record);
        }

        return;
      } else if (leaveTypes.length === 0 && dayType.length === 0) {
        // No leave, no holiday → true absent
        absentEmployees.push(record);
      }

      if (overtimeSet.has(employeeId)) {
        overTimeEmployees.push(record);
      }
    });
  });

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

  (attendance || []).forEach(({ empId, date, checkIn }) => {
    if (!empId) return;

    if (!map.has(empId)) {
      map.set(empId, new Map());
    }

    map.get(empId).set(date, parseCheckInData(checkIn));
  });

  return map;
};

const createOvertimeSet = (overTime) => {
  const set = new Set();

  (overTime || []).forEach((record) => {
    if (record.employeeId) {
      set.add(record.employeeId);
    }
  });

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
  const generalDays = (employee.salaryRules.generalDays || []).map(
    (h) => h.split("T")[0],
  );

  if (generalDays.includes(dateOnly)) {
    return [];
  }

  Object.keys(leaveMappings).forEach((leaveKey) => {
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
  });

  return leaveTypes;
};

function getDayType(salaryRules, date) {
  const day = new Date(date);
  const dayName = day.toLocaleString("en-US", { weekday: "long" });

  const dateOnly = date.split("T")[0];

  // 2. Get all general dates (YYYY-MM-DD)
  const generalDays = (salaryRules.generalDays || []).map(
    (h) => h.split("T")[0],
  );

  if (generalDays.includes(dateOnly)) {
    return [];
  }

  // 1. Find ruleId === 2 (weekend rules)
  const weekendRule = salaryRules.rules.find((r) => r.ruleId === 2);

  // Extract all weekend names (param1..param6)
  const weekendNames = [];
  if (weekendRule) {
    ["param1", "param2", "param3", "param4", "param5", "param6"].forEach(
      (key) => {
        if (
          weekendRule[key] &&
          typeof weekendRule[key] === "string" &&
          weekendRule[key].trim() !== ""
        ) {
          weekendNames.push(weekendRule[key].trim());
        }
      },
    );
  }

  // 2. Get all holiday dates (YYYY-MM-DD)
  const holidayDates = (salaryRules.holidays || []).map((h) => h.split("T")[0]);

  const replaceDaysSet = new Set(
    (salaryRules.replaceDays ?? [])
      .filter((item) => item?.rdate)
      .map((item) => item.rdate.split("T")[0]),
  );

  // ---- LOGIC ----

  //ReplaceDays
  if (replaceDaysSet.has(dateOnly)) {
    return ["Replace Day"];
  }

  // Weekend check
  if (weekendNames.includes(dayName)) {
    return ["Weekend"];
  }

  // Holiday check
  if (holidayDates.includes(dateOnly)) {
    return ["Holiday"];
  }

  return [];
}
