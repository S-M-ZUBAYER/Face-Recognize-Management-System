import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useEmployees } from "./useEmployees";
import { useAttendance } from "./useAttendance";
import { useMemo } from "react";
import { useGlobalSalary } from "./useGlobalSalary";

export const useEmployeeData = () => {
  const { selectedDate } = useAttendanceStore();
  const { globalSalaryRules = [], isLoading: globalSalaryLoading } =
    useGlobalSalary();
  const { Employees = [], isLoading: employeesLoading } = useEmployees();
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

  const totalLate = useMemo(() => {
    return attendanceData.filter((att) => {
      const employee = attendedEmployees.find(
        (e) => e.employeeId === att.empId
      );
      if (!employee || !att.checkIn) return false;

      try {
        const checkInArray = JSON.parse(att.checkIn);
        const actualCheckIn = checkInArray?.[0];

        let expectedTime =
          employee.salaryRules?.rules?.[0]?.param1 ||
          employee.salaryRules?.rules?.[0]?.param1?.[0]?.start;
        if (!expectedTime) {
          const globalRule = globalSalaryRules.find(
            (rule) => rule.deviceMAC === employee.deviceMAC
          );
          expectedTime =
            globalRule?.salaryRules?.rules?.[0]?.param1 ||
            employee.salaryRules?.rules?.[0]?.param1?.[0].start;
        }

        return actualCheckIn && expectedTime && actualCheckIn > expectedTime;
      } catch {
        return false;
      }
    }).length;
  }, [attendanceData, attendedEmployees, globalSalaryRules]);

  return {
    totalEmployees: Employees.length,
    totalPresent: attendedEmployees.length,
    totalAbsent: absentEmployees.length,
    totalLate,
    isLoading: employeesLoading || attendanceLoading || globalSalaryLoading,
  };
};
