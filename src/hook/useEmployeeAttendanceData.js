import { useMemo } from "react";
import { useEmployeeData } from "./useEmployeeData";
import { useSalaryCalculationData } from "./useSalaryCalculationData";
import { useDateRangeStore } from "@/zustand/useDateRangeStore";

export const useEmployeeAttendanceData = () => {
  const { employees } = useEmployeeData();
  const { Attendance } = useSalaryCalculationData();
  const { startDate, endDate } = useDateRangeStore();

  // console.log("employees", employees);
  // console.log("attendanceData", Attendance);
  // console.log("startDate", startDate);
  // console.log("endDate", endDate);

  const employeeAttendanceData = useMemo(() => {
    if (!employees || !Attendance) {
      return [];
    }

    // Filter attendance by date range
    const filteredAttendance = Attendance.filter((record) => {
      if (!startDate || !endDate) return true;
      return record.date >= startDate && record.date <= endDate;
    });

    console.log("filteredAttendance", filteredAttendance);

    // Group attendance by employee ID
    const attendanceByEmployee = filteredAttendance.reduce((acc, record) => {
      const { empId, date, checkIn } = record;

      if (!acc[empId]) {
        acc[empId] = [];
      }

      // Parse checkIn JSON string to array
      let checkInArray = [];
      try {
        if (typeof checkIn === "string" && checkIn) {
          // Clean malformed JSON
          const cleanedCheckIn = checkIn
            .replace(/,+/g, ",")
            .replace(/,\s*]/g, "]")
            .replace(/\[\s*,/g, "[")
            .replace(/,\s*,/g, ",");

          checkInArray = JSON.parse(cleanedCheckIn);
        } else if (Array.isArray(checkIn)) {
          checkInArray = checkIn;
        }
      } catch {
        console.warn(
          `Failed to parse checkIn for employee ${empId} on ${date}:`,
          checkIn
        );
        checkInArray = [];
      }

      acc[empId].push({
        date,
        checkIn: checkInArray,
      });

      return acc;
    }, {});

    // Combine employee data with punch data
    return employees.map((employee) => {
      const employeeId = employee.empId || employee.id || employee.employeeId;
      const punchData = attendanceByEmployee[employeeId] || [];

      // Sort punch data by date
      const sortedPunchData = punchData.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      return {
        ...employee,
        punch: sortedPunchData,
      };
    });
  }, [employees, Attendance, startDate, endDate]);

  return employeeAttendanceData;
};
