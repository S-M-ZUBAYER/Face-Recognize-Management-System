import { create } from "zustand";
import { getAttendanceRows } from "@/utils/attendance/processAttendanceData";

export const useAttendanceStore = create((set, get) => ({
  selectedDate: new Date().toISOString().split("T")[0],
  setSelectedDate: (value) => set({ selectedDate: value }),

  totalCount: 0,
  presentCount: 0,
  absentCount: 0,
  lateCount: 0,

  activeFilter: "punchData",
  isProcessing: false,
  isFilterLoading: false,
  isRefreshing: false,
  lastProcessedRange: null,

  setActiveFilter: (value) => {
    const state = get();
    if (state.activeFilter === value) return;

    set({
      activeFilter: value,
      isFilterLoading: true,
    });

    setTimeout(() => {
      set({ isFilterLoading: false });
    }, 200);
  },

  setAttendanceSummary: ({
    totalCount = 0,
    presentCount = 0,
    absentCount = 0,
    lateCount = 0,
    isProcessing = false,
    lastProcessedRange,
  }) => {
    set({
      totalCount,
      presentCount,
      absentCount,
      lateCount,
      isProcessing,
      ...(lastProcessedRange ? { lastProcessedRange } : {}),
    });
  },

  processAttendanceData: (employees, attendance, overTime, startDate, endDate) => {
    set({ isProcessing: true });

    try {
      const result = getAttendanceRows({
        employees,
        attendance,
        overTime,
        startDate,
        endDate,
      });

      set({
        totalCount: result.allEmployees.length,
        presentCount: result.presentEmployees.length,
        absentCount: result.absentEmployees.length,
        lateCount: result.lateEmployees.length,
        isProcessing: false,
        lastProcessedRange:
          startDate && endDate
            ? `${startDate}-${endDate}`
            : new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to process attendance summary:", error);
      set({ isProcessing: false });
    }
  },

  getFilteredEmployees: () => [],

  resetAttendanceData: () => {
    set({
      totalCount: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      isProcessing: false,
      isFilterLoading: false,
      lastProcessedRange: null,
    });
  },

  refreshAttendanceData: async ({
    refetchEmployees,
    refetchAttendance,
    refetchOverTime,
  } = {}) => {
    set({ isRefreshing: true });

    try {
      await Promise.all([
        refetchEmployees?.(),
        refetchAttendance?.(),
        refetchOverTime?.(),
      ]);
      return true;
    } catch (error) {
      console.error("Failed to refresh attendance data:", error);
      return false;
    } finally {
      set({ isRefreshing: false });
    }
  },
}));
