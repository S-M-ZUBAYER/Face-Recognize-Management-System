import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";
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
      staleTime: Infinity, //  never becomes stale
      cacheTime: Infinity, //  never garbage-collected in memory
      refetchOnWindowFocus: false, // stop auto refetch on focus
      refetchOnReconnect: false,
    })),
  });

  const employees = employeeQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

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

  const Employees = employees.map((emp) => {
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

    return {
      ...emp,
      payPeriod,
      salaryRules: parseSalaryRules(salaryRules),
    };
  });

  // ✅ Manual refresh: forces a new API call
  const refresh = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries(["employees", mac.deviceMAC])
    );
  };

  return {
    Employees,
    employeeCounts: deviceMACs.map((mac, idx) => ({
      deviceMAC: mac.deviceMAC,
      count: employeeQueries[idx].data?.length || 0,
    })),
    isLoading: employeeQueries.some((q) => q.isLoading),
    isFetching: employeeQueries.some((q) => q.isFetching),
    refetch: refresh,
  };
};
