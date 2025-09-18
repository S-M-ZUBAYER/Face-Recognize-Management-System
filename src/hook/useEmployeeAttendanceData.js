// hooks/useEmployeeAttendanceData.js - WITH REFRESH FUNCTION
import { useEffect, useRef, useCallback } from "react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";

export const useEmployeeAttendanceData = () => {
  const { startDate, endDate } = useDateRangeStore();
  const { employees, refetch: refetchEmployees } = useEmployees();
  const { Attendance, refetch: refetchAttendance } = useAttendanceData();
  const { overTime, refetch: refetchOverTime } = useOverTimeData();

  console.log("attendance records:", Attendance);

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
  const currentRange = startDate && endDate ? `${startDate}-${endDate}` : null;

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

  // Process data when dependencies change
  useEffect(() => {
    if (
      employees?.length &&
      Attendance?.length &&
      currentRange !== lastProcessedRange
    ) {
      console.log("🔄 Processing attendance for range:", currentRange);
      processAttendanceData(
        employees,
        Attendance,
        overTime,
        startDate,
        endDate
      );
    }
  }, [
    employees,
    Attendance,
    overTime,
    startDate,
    endDate,
    currentRange,
    lastProcessedRange,
    processAttendanceData,
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
