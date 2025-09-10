import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import axios from "axios";
import { useEmployeeData } from "./useEmployeeData";
import { calculateSalary } from "@/lib/calculateSalary";
import { useDateStore } from "@/zustand/useDateStore";

export const useSalaryCalculationData = () => {
  const { employees, globalSalaryRules } = useEmployeeData();
  const { selectedMonth, selectedYear } = useDateStore();

  // Memoize deviceMACs to prevent re-parsing on every render
  const deviceMACs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("deviceMACs") || "[]");
    } catch (error) {
      console.warn("Failed to parse deviceMACs from localStorage:", error);
      return [];
    }
  }, []); // Only parse once unless localStorage changes

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
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    })),
  });

  // Memoize payPeriodData to prevent unnecessary recalculations
  const payPeriodData = useMemo(() => {
    return payPeriodQueries
      .map((q) => q.data)
      .filter(Boolean)
      .flat();
  }, [payPeriodQueries]);

  // Attendance per deviceMAC with proper caching
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC, selectedMonth, selectedYear],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes for attendance data
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: !!mac.deviceMAC, // Only fetch if deviceMAC exists
    })),
  });

  // Memoize attendance data
  const Attendance = useMemo(() => {
    return attendanceQueries
      .map((q) => q.data)
      .filter(Boolean)
      .flat();
  }, [attendanceQueries]);

  // Memoize helper function to prevent recreation on every render
  const getPayInfoByDevice = useMemo(() => {
    return (mac) => {
      const found = payPeriodData.find((d) => d.deviceMAC === mac);
      const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);
      return found
        ? {
            PayPeriod: found.payPeriod,
            SalaryRules: Rule?.salaryRules,
          }
        : { PayPeriod: {}, SalaryRules: {} };
    };
  }, [payPeriodData, globalSalaryRules]);

  // Memoize helper function for monthly attendance
  const getEmployeeMonthlyAttendance = useMemo(() => {
    return (empId) => {
      return Attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === selectedMonth &&
          recordDate.getFullYear() === selectedYear &&
          record.empId === empId
        );
      });
    };
  }, [Attendance, selectedMonth, selectedYear]);

  // Memoize enriched employees calculation
  const enrichedEmployees = useMemo(() => {
    if (!employees.length || !Attendance.length) return [];

    return employees.map((emp) => {
      let payPeriod, salaryRules;

      const hasInvalidSalaryInfo =
        emp.salaryInfo === 999 ||
        !emp.salaryInfo ||
        (typeof emp.salaryInfo === "object" &&
          Object.keys(emp.salaryInfo).length === 0);
      const hasInvalidSalaryRules =
        !emp.salaryRules?.rules?.length ||
        (typeof emp.salaryRules === "object" &&
          Object.keys(emp.salaryRules).length === 0);

      if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
        const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);
        payPeriod = PayPeriod;
        salaryRules = SalaryRules;
      } else {
        payPeriod = emp.salaryInfo;
        salaryRules = emp.salaryRules;
      }

      // Get employee's monthly attendance records
      const monthlyAttendance = getEmployeeMonthlyAttendance(emp.employeeId);

      // Debug specific employee
      if (emp.employeeId === "44141190") {
        console.log("Employee 44141190 Monthly Attendance:", monthlyAttendance);
      }

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
  }, [employees, Attendance, getPayInfoByDevice, getEmployeeMonthlyAttendance]);

  // Memoize loading and error states
  const { isLoading, isError } = useMemo(() => {
    return {
      isLoading:
        payPeriodQueries.some((q) => q.isLoading) ||
        attendanceQueries.some((q) => q.isLoading),
      isError:
        payPeriodQueries.some((q) => q.isError) ||
        attendanceQueries.some((q) => q.isError),
    };
  }, [payPeriodQueries, attendanceQueries]);

  // Memoize refetch function
  const refetchAttendance = useMemo(() => {
    return async () => {
      const results = await Promise.all(
        attendanceQueries.map((query) => query.refetch())
      );
      return results;
    };
  }, [attendanceQueries]);

  return {
    payPeriod: payPeriodData,
    enrichedEmployees,
    Attendance,
    refetchAttendance,
    isLoading,
    isError,
  };
};
