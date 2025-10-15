// zustand/useAttendanceStore.js - REVERTED TO ORIGINAL
import { create } from "zustand";

/** ---------- Utilities ---------- **/
const getDateRangeArray = (start, end) => {
  const result = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
};

const parseCheckInData = (checkIn, empId, date) => {
  if (!checkIn) return [];
  try {
    if (typeof checkIn === "string") {
      const cleaned = checkIn
        .replace(/,+/g, ",")
        .replace(/,\s*]/g, "]")
        .replace(/\[\s*,/g, "[")
        .replace(/,\s*,/g, ",");
      return JSON.parse(cleaned);
    }
    if (Array.isArray(checkIn)) return checkIn;
    return [];
  } catch {
    console.warn(`❌ Failed to parse checkIn for ${empId} on ${date}`, checkIn);
    return [];
  }
};

export const useAttendanceStore = create((set, get) => ({
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: (value) => set({ selectedDate: value }),

  activeFilter: "all",
  isFilterLoading: false,

  // FIXED: Simplified setActiveFilter function
  setActiveFilter: (value) => {
    const currentState = get();
    // Don't do anything if same filter
    if (currentState.activeFilter === value) {
      return;
    }
    console.log(
      `🔄 Switching filter from ${currentState.activeFilter} to ${value}`
    );
    // Show loading and update filter in one call
    set({
      isFilterLoading: true,
      activeFilter: value,
    });
    // Hide loading after a short delay
    setTimeout(() => {
      set({ isFilterLoading: false });
      console.log(`✅ Filter switched to ${value}`);
    }, 300);
  },

  // Employee data
  allEmployees: [],
  setAllEmployees: (value) => set({ allEmployees: value }),
  absentEmployees: [],
  setAbsentEmployees: (value) => set({ absentEmployees: value }),
  presentEmployees: [],
  setPresentEmployees: (value) => set({ presentEmployees: value }),
  overTimeEmployees: [],
  setOverTimeEmployees: (value) => set({ overTimeEmployees: value }),

  // Counts
  totalCount: 0,
  setTotalCount: (value) => set({ totalCount: value }),
  presentCount: 0,
  setPresentCount: (value) => set({ presentCount: value }),
  absentCount: 0,
  setAbsentCount: (value) => set({ absentCount: value }),

  // Processing state
  isProcessing: false,
  setIsProcessing: (value) => set({ isProcessing: value }),

  // Refresh state
  isRefreshing: false,
  setIsRefreshing: (value) => set({ isRefreshing: value }),

  // Last processed date range
  lastProcessedRange: null,
  setLastProcessedRange: (value) => set({ lastProcessedRange: value }),

  // Helper function to get filtered employees
  getFilteredEmployees: (filterType = null) => {
    const state = get();
    const filter = filterType || state.activeFilter;
    switch (filter) {
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

  // NEW: Refresh function
  refreshAttendanceData: async (refetchCallbacks = {}) => {
    // const state = get();
    console.log("🔄 Refreshing attendance data...");

    set({ isRefreshing: true });

    try {
      // Call refetch functions if provided
      const promises = [];

      if (refetchCallbacks.refetchEmployees) {
        promises.push(refetchCallbacks.refetchEmployees());
      }
      if (refetchCallbacks.refetchAttendance) {
        promises.push(refetchCallbacks.refetchAttendance());
      }
      if (refetchCallbacks.refetchOverTime) {
        promises.push(refetchCallbacks.refetchOverTime());
      }

      // Wait for all refetch operations to complete
      if (promises.length > 0) {
        await Promise.all(promises);
        console.log("✅ Data refetch completed");
      }

      // Clear last processed range to force reprocessing
      set({
        lastProcessedRange: null,
        isRefreshing: false,
      });

      console.log("✅ Attendance data refresh completed");
      return true;
    } catch (error) {
      console.error("❌ Error refreshing attendance data:", error);
      set({ isRefreshing: false });
      return false;
    }
  },

  // Main processing function
  processAttendanceData: async (
    employees,
    attendance,
    overTime,
    startDate,
    endDate
  ) => {
    console.log("Processing with data:", {
      employees: employees?.length,
      attendance: attendance?.length,
      overTime: overTime?.length,
    });

    const today = new Date().toISOString().split("T")[0];
    const currentRange =
      startDate && endDate ? `${startDate}-${endDate}` : today;
    const { lastProcessedRange } = get();

    if (lastProcessedRange === currentRange) {
      console.log("📋 Skipping attendance processing - same date range");
      return;
    }

    console.log("🔄 Processing attendance data for range:", currentRange);
    set({ isProcessing: true });

    try {
      if (!employees?.length) {
        console.warn("⚠️ No employees data available");
        set({ isProcessing: false });
        return;
      }

      // Handle case where attendance might be empty (everyone absent)
      const attendanceData = attendance || [];
      const overTimeData = overTime || [];

      const dateRange =
        startDate && endDate ? getDateRangeArray(startDate, endDate) : [today];

      // Build attendance lookup
      const attendanceByEmployee = new Map();
      attendanceData.forEach(({ empId, date, checkIn }) => {
        if (!attendanceByEmployee.has(empId))
          attendanceByEmployee.set(empId, new Map());
        attendanceByEmployee
          .get(empId)
          .set(date, parseCheckInData(checkIn, empId, date));
      });

      // Build records
      const allRecords = employees.flatMap((employee) => {
        const employeeId = employee.empId || employee.id || employee.employeeId;
        const attendanceMap = attendanceByEmployee.get(employeeId) || new Map();

        return dateRange.map((date) => {
          const checkIn = attendanceMap.get(date) || [];
          const dateStr =
            typeof date === "string" ? date : date.toISOString().split("T")[0];

          const isPresent = checkIn.length > 0;
          let leaveTypes = [];

          // Check leaves only if not present
          if (!isPresent && employee.salaryRules) {
            const leaveArrays = [
              "m_leaves", // Medical leaves
              "mar_leaves", // Marriage leaves
              "p_leaves", // Personal leaves
              "s_leaves", // Sick leaves
              "c_leaves", // Casual leaves
              "e_leaves", // Earned leaves
              "w_leaves", // Weekly leaves
              "r_leaves", // Regular leaves
              "o_leaves", // Other leaves
            ];

            leaveArrays.forEach((leaveType) => {
              if (employee.salaryRules[leaveType]) {
                const hasLeaveOnDate = employee.salaryRules[leaveType].some(
                  (leave) => {
                    const leaveDate = leave.date?.date || leave.date;
                    const leaveDateStr =
                      typeof leaveDate === "string"
                        ? leaveDate.split("T")[0]
                        : leaveDate.toISOString().split("T")[0];
                    return leaveDateStr === dateStr;
                  }
                );

                if (hasLeaveOnDate) {
                  leaveTypes.push(leaveType);
                }
              }
            });
          }

          return {
            ...employee,
            employeeId,
            punch: {
              date,
              checkIn: checkIn.length > 0 ? checkIn : leaveTypes,
            },
            isPresent,
          };
        });
      });

      const presentRecords = allRecords.filter((r) => r.isPresent);
      const absentRecords = allRecords.filter((r) => !r.isPresent);
      const overtimeEmployeeIds = new Set(
        overTimeData.map((r) => r.empId) || []
      );
      const overtimeRecords = allRecords.filter((r) =>
        overtimeEmployeeIds.has(r.employeeId)
      );

      // Update all state at once
      set({
        allEmployees: allRecords,
        presentEmployees: presentRecords,
        absentEmployees: absentRecords,
        overTimeEmployees: overtimeRecords,
        presentCount: presentRecords.length,
        absentCount: absentRecords.length,
        totalCount: allRecords.length,
        lastProcessedRange: currentRange,
        isProcessing: false,
      });

      console.log("✅ Attendance processing completed:", {
        total: allRecords.length,
        present: presentRecords.length,
        absent: absentRecords.length,
        overtime: overtimeRecords.length,
      });
    } catch (error) {
      console.error("❌ Error processing attendance data:", error);
      set({ isProcessing: false });
    }
  },

  // Reset function
  resetAttendanceData: () => {
    set({
      allEmployees: [],
      absentEmployees: [],
      presentEmployees: [],
      overTimeEmployees: [],
      totalCount: 0,
      presentCount: 0,
      absentCount: 0,
      lastProcessedRange: null,
      isProcessing: false,
      isFilterLoading: false,
      isRefreshing: false,
    });
    console.log("🔄 Attendance data reset");
  },
}));
