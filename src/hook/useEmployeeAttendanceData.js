// hooks/useEmployeeAttendanceData.js - FIXED VERSION
import { useEffect, useRef, useCallback } from "react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";

export const useEmployeeAttendanceData = () => {
  const { startDate, endDate } = useDateRangeStore();
  const {
    Employees,
    refetch: refetchEmployees,
    isFetching: isEmployeesFetching,
  } = useEmployees();
  const {
    Attendance,
    refetch: refetchAttendance,
    isFetching: isAttendanceFetching,
  } = useAttendanceData();
  const {
    overTime,
    refetch: refetchOverTime,
    isFetching: isOverTimeFetching,
  } = useOverTimeData();

  // Get functions from store without subscribing to state changes
  const processAttendanceData = useAttendanceStore(
    (state) => state.processAttendanceData
  );
  const resetAttendanceData = useAttendanceStore(
    (state) => state.resetAttendanceData
  );
  const isProcessing = useAttendanceStore((state) => state.isProcessing);
  const lastProcessedRange = useAttendanceStore(
    (state) => state.lastProcessedRange
  );

  // Get refresh functions from store
  const refreshAttendanceData = useAttendanceStore(
    (state) => state.refreshAttendanceData
  );
  const isRefreshing = useAttendanceStore((state) => state.isRefreshing);

  // Track previous values to detect changes
  const prevDateRangeRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const today = new Date().toISOString().split("T")[0]; // ADD: For fallback
  const currentRange = startDate && endDate ? `${startDate}-${endDate}` : today; // CHANGE: Use today instead of null

  // Handle date range changes
  useEffect(() => {
    const dateRangeChanged = prevDateRangeRef.current !== currentRange;
    if (dateRangeChanged && !isFirstRenderRef.current) {
      console.log(
        "📅 Date range changed:",
        prevDateRangeRef.current,
        "->",
        currentRange
      );
      resetAttendanceData();
    }
    prevDateRangeRef.current = currentRange;
    isFirstRenderRef.current = false;
  }, [currentRange, resetAttendanceData]);

  // FIXED: Process data when dependencies change and ALL data is ready (no fetching in progress)
  useEffect(() => {
    // FIXED: Add !isFetching checks to prevent race conditions
    if (
      Employees?.length &&
      Attendance !== undefined &&
      overTime !== undefined && // ADD: Symmetry with Attendance
      !isEmployeesFetching &&
      !isAttendanceFetching &&
      !isOverTimeFetching &&
      currentRange !== lastProcessedRange
    ) {
      console.log("🔄 Processing attendance for range:", currentRange, {
        employeesCount: Employees?.length,
        attendanceCount: Attendance?.length || 0,
        overtimeCount: overTime?.length || 0,
      });

      processAttendanceData(
        Employees || [],
        Attendance || [], // Ensure it's always an array
        overTime || [], // Ensure it's always an array
        startDate,
        endDate
      );
    } else {
      console.log("⏳ Waiting for data or same range:", {
        Employees: Employees?.length || 0,
        attendance:
          Attendance !== undefined ? Attendance?.length || 0 : "undefined",
        overtime: overTime !== undefined ? overTime?.length || 0 : "undefined",
        isEmployeesFetching,
        isAttendanceFetching,
        isOverTimeFetching,
        currentRange,
        lastProcessedRange,
      });
    }
  }, [
    Employees,
    Attendance,
    overTime,
    startDate,
    endDate,
    currentRange,
    lastProcessedRange,
    processAttendanceData,
    isEmployeesFetching, // ADD
    isAttendanceFetching, // ADD
    isOverTimeFetching, // ADD
  ]);

  // NEW: Refresh function
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");

    const success = await refreshAttendanceData({
      refetchEmployees,
      refetchAttendance,
      refetchOverTime,
    });

    if (success) {
      console.log("✅ Manual refresh completed successfully");
    } else {
      console.error("❌ Manual refresh failed");
    }

    return success;
  }, [
    refreshAttendanceData,
    refetchEmployees,
    refetchAttendance,
    refetchOverTime,
  ]);

  return {
    isProcessing,
    isRefreshing,
    refresh: handleRefresh,
  };
};
