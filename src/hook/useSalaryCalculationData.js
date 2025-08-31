import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { useEmployeeData } from "./useEmployeeData";
import { calculateSalary } from "@/lib/calculateSalary";

export const useSalaryCalculationData = () => {
  const { employees, globalSalaryRules } = useEmployeeData();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // --- Fetch PayPeriod per deviceMAC ---
  const payPeriodQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["payPeriod", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/payPeriod/check/${mac.deviceMAC}`
        );
        return {
          deviceMAC: mac.deviceMAC,
          payPeriod: JSON.parse(res.data.payPeriod),
        };
      },
    })),
  });
  const payPeriodData = payPeriodQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // console.log("Attendance Data:", Attendance);

  // --- Helper: get pay info and salary rules by deviceMAC ---
  function getPayInfoByDevice(mac) {
    const found = payPeriodData.find((d) => d.deviceMAC === mac);
    const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);
    return found
      ? {
          PayPeriod: found.payPeriod,
          SalaryRules: Rule?.salaryRules,
        }
      : { PayPeriod: {}, SalaryRules: {} };
  }

  // --- Helper: get employee monthly attendance ---
  function getEmployeeMonthlyAttendance(empId) {
    // console.log(
    //   `Fetching attendance for EmpID: ${empId}, DeviceMAC: ${deviceMAC}`
    // );
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter by current month, year, and employee ID
    return Attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear &&
        record.empId === empId
      );
    });
  }

  // --- Enrich employees with monthly attendance ---
  const enrichedEmployees = employees.map((emp) => {
    let payPeriod, salaryRules;

    // Fallback if employee does not have salaryInfo or salaryRules
    if (emp.salaryInfo === 999 || emp.salaryRules?.rules?.length === 0) {
      const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);
      payPeriod = PayPeriod;
      salaryRules = SalaryRules;
    } else {
      payPeriod = emp.salaryInfo;
      salaryRules = emp.salaryRules;
    }

    // Get employee's monthly attendance records
    const monthlyAttendance = getEmployeeMonthlyAttendance(emp.employeeId);

    // console.log(`${emp.name} Monthly Attendance:`, monthlyAttendance);

    // Calculate salary using monthly attendance
    const salaryDetails = calculateSalary(
      monthlyAttendance,
      payPeriod,
      salaryRules,
      emp.employeeId
    );

    return {
      ...emp,
      salary: payPeriod?.salary || 0,
      salaryDetails,
      payPeriod,
      salaryRules,
    };
  });

  // --- Combined loading and error states ---
  const isLoading =
    payPeriodQueries.some((q) => q.isLoading) ||
    attendanceQueries.some((q) => q.isLoading);
  const isError =
    payPeriodQueries.some((q) => q.isError) ||
    attendanceQueries.some((q) => q.isError);

  return {
    payPeriod: payPeriodData,
    enrichedEmployees,
    Attendance, // Raw attendance data if needed
    isLoading,
    isError,
  };
};
