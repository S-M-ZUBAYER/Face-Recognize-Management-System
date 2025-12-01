import { create } from "zustand";

export const useAttendanceStore = create((set, get) => ({
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: (value) => set({ selectedDate: value }),
  // Employee arrays - these will be properly populated
  allEmployees: [],
  presentEmployees: [],
  absentEmployees: [],
  overTimeEmployees: [],

  // Counts
  totalCount: 0,
  presentCount: 0,
  absentCount: 0,

  // UI states
  activeFilter: "all",
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
    endDate
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
          `📊 Processing ${employees.length} employees for ${dateRange.length} days`
        );

        // Process data
        const result = processEmployeeData(
          employees,
          attendance,
          overTime,
          dateRange
        );

        // Update state with processed data
        set({
          allEmployees: result.allEmployees,
          presentEmployees: result.presentEmployees,
          absentEmployees: result.absentEmployees,
          overTimeEmployees: result.overTimeEmployees,
          totalCount: result.allEmployees.length,
          presentCount: result.presentEmployees.length,
          absentCount: result.absentEmployees.length,
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
      case "present":
        return state.presentEmployees;
      case "absent":
        return state.absentEmployees;
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
      presentEmployees: [],
      absentEmployees: [],
      overTimeEmployees: [],
      totalCount: 0,
      presentCount: 0,
      absentCount: 0,
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
  const presentEmployees = [];
  const absentEmployees = [];
  const overTimeEmployees = [];

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

      // Create record
      const record = {
        ...employee,
        employeeId,
        date,
        punch: {
          date,
          checkIn: isPresent ? checkIn : leaveTypes,
        },
        isPresent,
        hasOvertime: overtimeSet.has(employeeId),
      };

      // Add to appropriate arrays
      allEmployees.push(record);

      if (isPresent) {
        presentEmployees.push(record);
      } else {
        absentEmployees.push(record);
      }

      if (overtimeSet.has(employeeId)) {
        overTimeEmployees.push(record);
      }
    });
  });

  return {
    allEmployees,
    presentEmployees,
    absentEmployees,
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
    m_leaves: "Medical Leave",
    mar_leaves: "Marriage Leave",
    p_leaves: "Personal Leave",
    s_leaves: "Sick Leave",
    c_leaves: "Casual Leave",
    e_leaves: "Earned Leave",
    w_leaves: "Without Pay Leave",
    r_leaves: "Regular Leave",
    o_leaves: "Other Leave",
  };

  if (!employee.salaryRules) return leaveTypes;

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
