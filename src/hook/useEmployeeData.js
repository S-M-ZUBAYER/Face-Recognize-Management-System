import { useAttendanceStore } from "@/zustand/useAttendanceStore";
import { useAttendance } from "./useAttendance";
import { useMemo } from "react";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import { realAbsentCount } from "@/lib/realAbsentCount";

export const useEmployeeData = () => {
  const { selectedDate } = useAttendanceStore();

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
    return attendanceData.filter((att) => {
      const employee = attendedEmployees.find(
        (e) => e.employeeId === att.empId
      );
      if (!employee || !att.checkIn) return false;

      try {
        const checkInArray = JSON.parse(att.checkIn);
        const actualCheckIn = checkInArray?.[0];

        const ruleObj = employee.salaryRules.rules.find(
          (item) => item.ruleId === 0
        );

        // if (employee.employeeId === "70709913") {
        //   console.log(employee);
        //   console.log(ruleObj);
        // }

        let expectedTime = ruleObj.param1?.[0]?.start || ruleObj.param1;

        if (ruleObj.param3 === "special") {
          const thatDateExpectedTime = employee.salaryRules?.timeTables?.find(
            (item) => item.date === selectedDate
          );
          expectedTime = thatDateExpectedTime?.param1?.[0]?.start;

          // if (employee.employeeId === "70709913") {
          //   console.log(thatDateExpectedTime, expectedTime);
          // }
        }
        // if (actualCheckIn > expectedTime) {
        //   console.log(employee, actualCheckIn, expectedTime);
        // }

        return actualCheckIn && expectedTime && actualCheckIn > expectedTime;
      } catch {
        return false;
      }
    }).length;
  }, [attendanceData, attendedEmployees, selectedDate]);

  return {
    totalEmployees: Employees.length,
    totalPresent: attendedEmployees.length,
    totalAbsent: absentCount,
    totalLate,
    isLoading: employeesLoading || attendanceLoading,
  };
};
