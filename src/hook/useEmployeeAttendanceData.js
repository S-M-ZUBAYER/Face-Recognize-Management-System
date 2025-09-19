// hooks/useEmployeeAttendanceData.js - FIXED VERSION
import { useEffect, useRef, useCallback } from "react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";

export const useEmployeeAttendanceData = () => {
  const { startDate, endDate } = useDateRangeStore();
  const { Employees, refetch: refetchEmployees } = useEmployees();
  const { Attendance, refetch: refetchAttendance } = useAttendanceData();
  const { overTime, refetch: refetchOverTime } = useOverTimeData();

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

  // FIXED: Process data when dependencies change - removed Attendance?.length requirement
  useEffect(() => {
    // FIXED: Only require Employees and that attendance data has been fetched (even if empty)
    // Attendance can be an empty array if no one was present
    if (
      Employees?.length &&
      Attendance !== undefined && // Check if attendance data has been fetched (can be empty array)
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
        currentRange,
        lastProcessedRange,
      });
    }
  }, [
    Employees,
    Attendance, // Keep this dependency to trigger when attendance data is fetched
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
