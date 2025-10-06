import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseNormalData } from "@/lib/parseNormalData";
import { usePayPeriod } from "./usePayPeriod";
import { useGlobalSalary } from "./useGlobalSalary";

export const useEmployees = () => {
  const queryClient = useQueryClient();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const { payPeriodData } = usePayPeriod();
  const { globalSalaryRules } = useGlobalSalary();

  const employeeQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["employees", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/employee/all/${mac.deviceMAC}`
        );
        return res.data.map((emp) => ({
          name: emp.name,
          employeeId: emp.employeeId,
          companyEmployeeId: emp.email?.split("|")[1],
          department: emp.department,
          email: emp.email?.split("|")[0],
          designation: emp.designation,
          deviceMAC: mac.deviceMAC,
          salaryRules: emp.salaryRules,
          salaryInfo: JSON.parse(emp.payPeriod),
        }));
      },
      staleTime: 0,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Only enable query if dependencies are loaded
      enabled: payPeriodData?.length >= 0 && globalSalaryRules?.length >= 0,
    })),
  });

  const employees = employeeQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // --- Helper: get pay info and salary rules by deviceMAC ---
  function getPayInfoByDevice(mac) {
    // Add safety checks
    if (!payPeriodData || !globalSalaryRules) {
      return { PayPeriod: {}, SalaryRules: {} };
    }

    const found = payPeriodData.find((d) => d.deviceMAC === mac);
    const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);

    return {
      PayPeriod: found?.payPeriod || {},
      SalaryRules: Rule?.salaryRules || {},
    };
  }

  // Helper function to check if salary info is invalid
  const isInvalidSalaryInfo = (salaryInfo) => {
    return (
      salaryInfo === 999 ||
      salaryInfo === null ||
      salaryInfo === undefined ||
      (typeof salaryInfo === "object" && Object.keys(salaryInfo).length === 0)
    );
  };

  // Helper function to check if salary rules are invalid
  const isInvalidSalaryRules = (salaryRules) => {
    return (
      !salaryRules ||
      (typeof salaryRules === "object" &&
        Object.keys(salaryRules).length === 0) ||
      (salaryRules.rules &&
        (!Array.isArray(salaryRules.rules) || salaryRules.rules.length === 0))
    );
  };

  const Employees = employees.map((emp) => {
    let payPeriod, salaryRules;

    const hasInvalidSalaryInfo = isInvalidSalaryInfo(emp.salaryInfo);
    const hasInvalidSalaryRules = isInvalidSalaryRules(emp.salaryRules);

    if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
      const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);

      // Use fallback data, but keep original if fallback is also invalid
      payPeriod = !isInvalidSalaryInfo(PayPeriod)
        ? PayPeriod
        : emp.salaryInfo || {};
      salaryRules = !isInvalidSalaryRules(SalaryRules)
        ? SalaryRules
        : emp.salaryRules || {};
    } else {
      payPeriod = emp.salaryInfo;
      salaryRules = emp.salaryRules;
    }

    let parsedSalaryRules;
    let parsedPayPeriod;
    try {
      parsedSalaryRules = parseNormalData(salaryRules);
      parsedPayPeriod = parseNormalData(payPeriod);
    } catch (error) {
      console.warn(
        `Error parsing salary rules for employee ${emp.employeeId}:`,
        error
      );
      parsedSalaryRules = {};
    }

    return {
      ...emp,
      salaryInfo: parsedPayPeriod,
      salaryRules: parsedSalaryRules,
    };
  });

  // ✅ Manual refresh: forces a new API call
  const refresh = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries(["employees", mac.deviceMAC])
    );
  };

  // Check if any dependency is still loading
  const isDependencyLoading = !payPeriodData || !globalSalaryRules;

  return {
    Employees,
    employeeCounts: deviceMACs.map((mac, idx) => ({
      deviceMAC: mac.deviceMAC,
      count: employeeQueries[idx].data?.length || 0,
    })),
    isLoading: employeeQueries.some((q) => q.isLoading) || isDependencyLoading,
    isFetching: employeeQueries.some((q) => q.isFetching),
    refetch: refresh,
  };
};
