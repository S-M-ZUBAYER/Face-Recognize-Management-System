import { calculateSalary } from "@/lib/calculateSalary";
import { useDateStore } from "@/zustand/useDateStore";
import { useAttendanceData } from "./useAttendanceData";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const useSalaryCalculationData = () => {
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const { selectedMonth, selectedYear } = useDateStore();
  const { isLoading: attendanceLoading, Attendance = [] } = useAttendanceData();

  // ---------------------------------------------------------
  // 🔹 Function 1: Get selected month attendance
  // ---------------------------------------------------------
  function getEmployeeMonthlyAttendance(empId) {
    return Attendance.filter((record) => {
      const d = new Date(record.date);
      return (
        d.getMonth() === selectedMonth &&
        d.getFullYear() === selectedYear &&
        record.empId === empId
      );
    });
  }

  // ---------------------------------------------------------
  // 🔹 Function 2: Get selected month + previous last day
  // ---------------------------------------------------------
  function getEmployeeMonthlyAttendanceWithPreDay(empId) {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    const currentMonthData = getEmployeeMonthlyAttendance(empId);

    const prevMonthData = Attendance.filter((record) => {
      const d = new Date(record.date);
      return (
        d.getMonth() === prevMonth &&
        d.getFullYear() === prevYear &&
        record.empId === empId
      );
    });

    // Find last day of previous month
    const lastDayPrevMonth = [...prevMonthData] // avoid mutating original
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return lastDayPrevMonth
      ? [lastDayPrevMonth, ...currentMonthData]
      : currentMonthData;
  }

  // ---------------------------------------------------------
  // 🔹 Build final enriched employee salary data
  // ---------------------------------------------------------
  const enrichedEmployees = Employees.map((emp) => {
    const rules = emp.salaryRules?.rules || [];
    const ruleObj = rules.find((item) => item.ruleId === 0) || {};

    // Choose logic based on param3
    const monthlyAttendance =
      ruleObj?.param3 === "special"
        ? getEmployeeMonthlyAttendanceWithPreDay(emp.employeeId)
        : getEmployeeMonthlyAttendance(emp.employeeId);

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
    isLoading: attendanceLoading,
  };
};
