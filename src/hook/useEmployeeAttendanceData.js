// hooks/useEmployeeAttendanceData.js - FIXED VERSION
import { useEffect, useRef } from "react";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";

export const useEmployeeAttendanceData = () => {
  const { startDate, endDate } = useDateRangeStore();
  const { employees } = useEmployees();
  const { Attendance } = useAttendanceData();
  const { overTime } = useOverTimeData();

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

  return {
    isProcessing,
  };
};
