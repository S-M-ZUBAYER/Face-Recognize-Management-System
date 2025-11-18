// hooks/useEmployeeAttendanceData.js - UPDATED VERSION
import { useEffect, useRef, useCallback } from "react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";

export const useEmployeeAttendanceData = () => {
  const { startDate, endDate } = useDateRangeStore();

  // USE OPTIMIZED HOOK
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

  // Get store functions
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

  const refreshAttendanceData = useAttendanceStore(
    (state) => state.refreshAttendanceData
  );
  const isRefreshing = useAttendanceStore((state) => state.isRefreshing);

  // Track previous values
  const prevDateRangeRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const today = new Date().toISOString().split("T")[0];
  const currentRange = startDate && endDate ? `${startDate}-${endDate}` : today;

  // OPTIMIZATION: Debounce date range changes
  useEffect(() => {
    const dateRangeChanged = prevDateRangeRef.current !== currentRange;

    if (dateRangeChanged && !isFirstRenderRef.current) {
      console.log("📅 Date range changed, resetting data");
      resetAttendanceData();
    }

    prevDateRangeRef.current = currentRange;
    isFirstRenderRef.current = false;
  }, [currentRange, resetAttendanceData]);

  // OPTIMIZED: Process data only when ALL data is ready
  useEffect(() => {
    const shouldProcess =
      Employees?.length > 0 &&
      Attendance !== undefined &&
      overTime !== undefined &&
      !isEmployeesFetching &&
      !isAttendanceFetching &&
      !isOverTimeFetching &&
      currentRange !== lastProcessedRange;

    if (shouldProcess) {
      console.log("🔄 Processing optimized attendance data", {
        employeesCount: Employees.length,
        attendanceCount: Attendance?.length || 0,
        overtimeCount: overTime?.length || 0,
      });

      // Use setTimeout to avoid blocking UI
      setTimeout(() => {
        processAttendanceData(
          Employees,
          Attendance || [],
          overTime || [],
          startDate,
          endDate
        );
      }, 100);
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
    isEmployeesFetching,
    isAttendanceFetching,
    isOverTimeFetching,
  ]);

  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    const success = await refreshAttendanceData({
      refetchEmployees,
      refetchAttendance,
      refetchOverTime,
    });
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
