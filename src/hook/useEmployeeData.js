import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";
import { useAttendance } from "./useAttendance";
import { useMemo } from "react";
import { useGlobalSalary } from "./useGlobalSalary";

export const useEmployeeData = () => {
  const { selectedDate } = useAttendanceStore();
  const { globalSalaryRules } = useGlobalSalary();

  const { employees } = useEmployees();

  const { attendanceData } = useAttendance(selectedDate);

  // derive attended, absent, late as before...
  const attendedIds = attendanceData.map((att) => att.empId);

  const attendedEmployees = employees
    .filter((emp) => attendedIds.includes(emp.employeeId))
    .map((emp) => {
      const attendance = attendanceData.find(
        (att) => att.empId === emp.employeeId
      );
      return {
        ...emp,
        date: selectedDate,
        checkIn: attendance?.checkIn || null,
      };
    });

  const absentEmployees = employees.filter(
    (emp) => !attendedIds.includes(emp.employeeId)
  );

  const totalLate = useMemo(() => {
    return attendanceData.filter((att) => {
      const employee = attendedEmployees.find(
        (e) => e.employeeId === att.empId
      );
      if (!employee || !att.checkIn) return false;

      try {
        const checkInArray = JSON.parse(att.checkIn);
        const actualCheckIn = checkInArray?.[0];

        let expectedTime = employee.salaryRules?.rules?.[0]?.param1;
        if (!expectedTime) {
          const globalRule = globalSalaryRules.find(
            (rule) => rule.deviceMAC === employee.deviceMAC
          );
          expectedTime = globalRule?.salaryRules?.rules?.[0]?.param1;
        }

        return actualCheckIn && expectedTime && actualCheckIn > expectedTime;
      } catch {
        return false;
      }
    }).length;
  }, [attendanceData, attendedEmployees, globalSalaryRules]);

  return {
    totalEmployees: employees.length,
    totalPresent: attendedEmployees.length,
    totalAbsent: absentEmployees.length,
    totalLate,
  };
};
