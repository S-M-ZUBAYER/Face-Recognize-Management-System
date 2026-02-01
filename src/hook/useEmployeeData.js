import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendance } from "./useAttendance";
import { useMemo } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { realAbsentCount } from "@/lib/realAbsentCount";
import { useGlobalStore } from "@/zustand/useGlobalStore";
import getExpectedCheckInTime from "@/lib/getExpectedCheckInTime";

export const useEmployeeData = () => {
  const { selectedDate } = useAttendanceStore();
  const rules = useGlobalStore.getState().globalRules;

  const { employees } = useEmployeeStore();
  const Employees = employees();
  const employeesLoading = false; // Assuming employees are already loaded in useEmployeeStore
  const { attendanceData = [], isLoading: attendanceLoading } =
    useAttendance(selectedDate);

  const attendedIds = attendanceData.map((att) => att.empId);

  const attendedEmployees = Employees.filter((emp) =>
    attendedIds.includes(emp.employeeId)
  ).map((emp) => {
    const attendance = attendanceData.find(
      (att) => att.empId === emp.employeeId
    );
    return {
      ...emp,
      date: selectedDate,
      checkIn: attendance?.checkIn || null,
    };
  });

  const absentEmployees = Employees.filter(
    (emp) => !attendedIds.includes(emp.employeeId)
  );

  let absentCount = 0;

  absentEmployees.forEach((abEmp) => {
    const res = realAbsentCount(abEmp.salaryRules, selectedDate);
    if (res) {
      absentCount++;
    }
  });

  const totalLate = useMemo(() => {
    return attendanceData.reduce((count, att) => {
      const employee = attendedEmployees.find(
        (e) => e.employeeId === att.empId
      );
      if (!employee || !att.checkIn) return count;

      let actualCheckIn;
      try {
        actualCheckIn = JSON.parse(att.checkIn)?.[0];
      } catch {
        return count;
      }

      const { expectedTime, latenessGraceMin } = getExpectedCheckInTime({
        employee,
        selectedDate,
        rules,
      });

      if (!actualCheckIn || !expectedTime) return count;

      const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      // if (latenessGraceMin > 0) {
      //   console.log(employee);
      // }
      const actualMin = toMinutes(actualCheckIn);
      const expectedMin = toMinutes(expectedTime) + latenessGraceMin;

      if (actualMin > expectedMin) {
        return count + 1;
      }

      return count;
    }, 0);
  }, [attendanceData, attendedEmployees, selectedDate, rules]);

  return {
    totalEmployees: Employees.length,
    totalPresent: attendedEmployees.length,
    totalAbsent: absentCount,
    totalLate,
    isLoading: employeesLoading || attendanceLoading,
  };
};
