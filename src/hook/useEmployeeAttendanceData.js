import { useMemo } from "react";
import { useEmployeeData } from "./useEmployeeData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";
import { useOverTimeData } from "./useOverTimeData";
import { useAttendanceData } from "./useAttendanceData";
import { useAttendanceStore } from "@/zustand/useAttendanceStore";

// Utility: get all dates between two dates (inclusive)
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

// Parse checkIn data safely
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

    if (Array.isArray(checkIn)) {
      return checkIn;
    }

    return [];
  } catch {
    console.warn(`Failed to parse checkIn for ${empId} on ${date}:`, checkIn);
    return [];
  }
};

export const useEmployeeAttendanceData = () => {
  const { employees } = useEmployeeData();
  const { Attendance } = useAttendanceData();
  const { startDate, endDate } = useDateRangeStore();
  const { overTime } = useOverTimeData();
  const { activeFilter, setActiveFilter } = useAttendanceStore();

  const today = new Date().toISOString().split("T")[0];

  const processedData = useMemo(() => {
    // Early return if no data
    try {
      if (!employees?.length || !Attendance?.length) {
        return {
          allRecords: [],
          presentRecords: [],
          absentRecords: [],
          overtimeRecords: [],
          presentCount: 0,
          absentCount: 0,
          totalCount: 0,
        };
      }

      // Get date range
      const dateRange =
        startDate && endDate ? getDateRangeArray(startDate, endDate) : [today];

      // Build attendance lookup: { empId: { date: checkInArray } }
      const attendanceByEmployee = Attendance.reduce((acc, record) => {
        const { empId, date, checkIn } = record;
        if (!acc[empId]) acc[empId] = {};

        acc[empId][date] = parseCheckInData(checkIn, empId, date);
        return acc;
      }, {});

      // Create employee-date records
      const allRecords = employees.flatMap((employee) => {
        const employeeId = employee.empId || employee.id || employee.employeeId;
        const attendanceMap = attendanceByEmployee[employeeId] || {};

        return dateRange.map((date) => {
          const checkIn = attendanceMap[date] || [];
          const isPresent = checkIn.length > 0;

          return {
            ...employee,
            employeeId,
            punch: { date, checkIn },
            isPresent,
          };
        });
      });

      // Filter records by presence
      const presentRecords = allRecords.filter((record) => record.isPresent);
      const absentRecords = allRecords.filter((record) => !record.isPresent);

      // Get overtime employee IDs for today
      const overtimeEmployeeIds = new Set(
        overTime
          .filter((record) => record.date.split("T")[0] === today)
          .map((record) => record.employeeId)
      );

      const overtimeRecords = allRecords.filter((record) =>
        overtimeEmployeeIds.has(record.employeeId)
      );

      // Calculate unique employee counts
      const presentCount = presentRecords.length;
      const absentCount = absentRecords.length;
      const totalCount = allRecords.length;

      return {
        allRecords,
        presentRecords,
        absentRecords,
        overtimeRecords,
        presentCount,
        absentCount,
        totalCount,
      };
    } catch {
      console.warn("problem with Attendance");
    }
  }, [employees, Attendance, startDate, endDate, today, overTime]);

  // Apply active filter
  const filterEmployees = useMemo(() => {
    const { allRecords, presentRecords, absentRecords, overtimeRecords } =
      processedData;

    switch (activeFilter) {
      case "present":
        return presentRecords;
      case "absent":
        return absentRecords;
      case "overtime":
        return overtimeRecords;
      case "all":
      default:
        return allRecords;
    }
  }, [processedData, activeFilter]);

  return {
    filterEmployees,
    presentCount: processedData.presentCount,
    absentCount: processedData.absentCount,
    totalCount: processedData.totalCount,
    activeFilter,
    setActiveFilter,
  };
};
