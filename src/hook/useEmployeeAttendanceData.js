import { useMemo } from "react";
import { useEmployeeData } from "./useEmployeeData";
import { useSalaryCalculationData } from "./useSalaryCalculationData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

// Utility: get all dates between two dates (inclusive)
const getDateRangeArray = (start, end) => {
  const result = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    result.push(current.toISOString().split("T")[0]); // yyyy-mm-dd
    current.setDate(current.getDate() + 1);
  }

  return result;
};

// Expand: flatten punch array into multiple employee objects
const expandEmployeePunches = (employee) => {
  return employee.punch.map((p) => ({
    ...employee,
    punch: p, // single punch object
  }));
};

export const useEmployeeAttendanceData = () => {
  const { employees } = useEmployeeData();
  const { Attendance } = useSalaryCalculationData();
  const { startDate, endDate } = useDateRangeStore();
  const today = new Date().toISOString().split("T")[0];

  const result = useMemo(() => {
    if (!employees?.length || !Attendance?.length) {
      return {
        present: [],
        absent: [],
        total: [],
        presentCount: 0,
        absentCount: 0,
        totalCount: 0,
      };
    }

    // if (startDate && endDate ===null) {
    //   getDateRangeArray(startDate, endDate)
    // }else{
    //   getDateRangeArray(startDate, endDate)
    // }

    const dateRange =
      startDate && endDate !== null
        ? getDateRangeArray(startDate, endDate)
        : getDateRangeArray(today, today);

    // Build lookup { empId: { date: checkInArray } }
    const attendanceByEmployee = Attendance.reduce((acc, record) => {
      const { empId, date, checkIn } = record;
      if (!acc[empId]) acc[empId] = {};

      let checkInArray = [];
      try {
        if (typeof checkIn === "string" && checkIn) {
          const cleaned = checkIn
            .replace(/,+/g, ",")
            .replace(/,\s*]/g, "]")
            .replace(/\[\s*,/g, "[")
            .replace(/,\s*,/g, ",");
          checkInArray = JSON.parse(cleaned);
        } else if (Array.isArray(checkIn)) {
          checkInArray = checkIn;
        }
      } catch {
        console.warn(
          `Failed to parse checkIn for ${empId} on ${date}`,
          checkIn
        );
      }

      acc[empId][date] = checkInArray;
      return acc;
    }, {});

    // Build expanded employee/day dataset
    const expandedEmployees = employees.flatMap((employee) => {
      const employeeId = employee.empId || employee.id || employee.employeeId;
      const attendanceMap = attendanceByEmployee[employeeId] || {};

      let punch = [];

      if (dateRange) {
        punch = dateRange.map((date) => ({
          date,
          checkIn: attendanceMap[date] || [],
        }));
      } else {
        punch = Object.entries(attendanceMap)
          .map(([date, checkIn]) => ({ date, checkIn }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      return expandEmployeePunches({
        ...employee,
        punch,
      });
    });

    // Split into present & absent
    const present = expandedEmployees.filter(
      (e) => e.punch.checkIn && e.punch.checkIn.length > 0
    );
    const absent = expandedEmployees.filter(
      (e) => !e.punch.checkIn || e.punch.checkIn.length === 0
    );

    return {
      present,
      absent,
      total: expandedEmployees,
      presentCount: present.length,
      absentCount: absent.length,
      totalCount: expandedEmployees.length,
    };
  }, [employees, Attendance, startDate, endDate, today]);

  return result;
};
