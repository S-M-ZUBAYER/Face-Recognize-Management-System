import { useQueries } from "@tanstack/react-query";
import extractSalaryAndRate from "@/lib/extractSalaryAndRate";
import axios from "axios";
import { useEmployeeData } from "./useEmployeeData";

export const useSalaryCalculationData = () => {
  const { employees } = useEmployeeData();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // PayPeriod per deviceMAC
  const payPeriodQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["payPeriod", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/payPeriod/check/${mac.deviceMAC}`
        );
        return {
          deviceMAC: mac.deviceMAC,
          payPeriod: extractSalaryAndRate(res.data.payPeriod),
        };
      },
    })),
  });

  const payPeriod = payPeriodQueries.map((q) => q.data).filter(Boolean);

  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Helpers
  function getMonthlyPresentCount(empId) {
    if (!Array.isArray(Attendance)) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const empRecords = Attendance.filter((record) => {
      if (record.empId !== empId) return false;

      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear &&
        record.checkIn &&
        record.checkIn !== "[]"
      );
    });

    const uniqueDays = new Set(empRecords.map((r) => r.date));
    return uniqueDays.size;
  }

  function getPayInfoByDevice(mac) {
    if (!Array.isArray(payPeriod)) return null;
    const found = payPeriod.find((d) => d.deviceMAC === mac);
    return found ? found.payPeriod : null;
  }

  // Enrich employees
  const enrichedEmployees = employees.map((emp) => {
    const presentCount = getMonthlyPresentCount(emp.employeeId);

    // Ensure salaryInfo is always an object
    const salaryInfo =
      emp.salaryInfo?.hourlyRate == null
        ? getPayInfoByDevice(emp.deviceMAC) || {}
        : emp.salaryInfo;

    const totalWorkingDays = Number(salaryInfo.hourlyRate) || 0;
    const absentCount =
      totalWorkingDays > 0 ? totalWorkingDays - presentCount : 0;

    return {
      ...emp,
      present: presentCount,
      absent: absentCount >= 0 ? absentCount : 0,
      workingDays: salaryInfo.hourlyRate || 0,
      salary: salaryInfo.salary || 0,
    };
  });

  //  Combined loading state
  const isLoading =
    payPeriodQueries.some((q) => q.isLoading) ||
    attendanceQueries.some((q) => q.isLoading);

  //  (Optional) combined error state
  const isError =
    payPeriodQueries.some((q) => q.isError) ||
    attendanceQueries.some((q) => q.isError);

  return {
    payPeriod,
    enrichedEmployees,
    isLoading,
    isError,
  };
};
