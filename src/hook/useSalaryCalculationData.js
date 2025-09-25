import { useEmployees } from "./useEmployees";
import { calculateSalary } from "@/lib/calculateSalary";
import { useDateStore } from "@/zustand/useDateStore";
import { useAttendanceData } from "./useAttendanceData";

export const useSalaryCalculationData = () => {
  const { isLoading: employeesLoading, Employees } = useEmployees();
  const { selectedMonth, selectedYear } = useDateStore();
  const { isLoading: attendanceLoading, Attendance } = useAttendanceData();

  function getEmployeeMonthlyAttendance(empId) {
    return Attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === selectedMonth &&
        recordDate.getFullYear() === selectedYear &&
        record.empId === empId
      );
    });
  }

  const enrichedEmployees = Employees.map((emp) => {
    const monthlyAttendance = getEmployeeMonthlyAttendance(emp.employeeId);

    const salaryDetails = calculateSalary(
      monthlyAttendance,
      emp.salaryInfo,
      emp.salaryRules,
      emp.employeeId
    );

    return {
      ...emp,
      salary: emp.salaryInfo?.salary || 0,
      salaryDetails,
    };
  });

  return {
    enrichedEmployees,
    isLoading: employeesLoading || attendanceLoading, // combine both
  };
};
