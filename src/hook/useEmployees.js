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
          image: `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/media/${emp.imageFile}`,
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
      enabled: payPeriodData?.length >= 0 && globalSalaryRules?.length >= 0,
    })),
  });

  const employees = employeeQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  function getPayInfoByDevice(mac) {
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

  // FIXED: Handle both number 999 and string "999"
  const isInvalidSalaryInfo = (salaryInfo) => {
    return (
      salaryInfo === 999 ||
      salaryInfo === "999" ||
      salaryInfo === null ||
      salaryInfo === undefined ||
      (typeof salaryInfo === "object" && Object.keys(salaryInfo).length === 0)
    );
  };

  // FIXED: Handle both number 999 and string "999"
  const isInvalidSalaryRules = (salaryRules) => {
    return (
      salaryRules === 999 ||
      salaryRules === "999" ||
      salaryRules === null ||
      salaryRules === undefined ||
      (salaryRules?.rules &&
        (!Array.isArray(salaryRules.rules) || salaryRules.rules.length === 0))
    );
  };

  const Employees = employees.map((emp) => {
    let payPeriod, salaryRules;

    const hasInvalidSalaryInfo = isInvalidSalaryInfo(emp.salaryInfo);
    const hasInvalidSalaryRules = isInvalidSalaryRules(emp.salaryRules);

    // if (emp.employeeId === "44141318") {
    //   console.log("Employee 44141318 salary check:", {
    //     hasInvalidSalaryInfo,
    //     hasInvalidSalaryRules,
    //     salaryInfo: emp.salaryInfo,
    //     salaryRules: emp.salaryRules,
    //     salaryRulesType: typeof emp.salaryRules,
    //     isInvalidSalaryRulesResult: isInvalidSalaryRules(emp.salaryRules),
    //   });
    // }

    // If either is 999 (number or string) or invalid, use fallback data
    if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
      const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);

      // Use fallback data for invalid fields
      payPeriod =
        hasInvalidSalaryInfo && !isInvalidSalaryInfo(PayPeriod)
          ? PayPeriod
          : emp.salaryInfo;
      salaryRules =
        hasInvalidSalaryRules && !isInvalidSalaryRules(SalaryRules)
          ? SalaryRules
          : emp.salaryRules;

      // If fallback is also invalid, use empty object as last resort
      if (hasInvalidSalaryInfo && isInvalidSalaryInfo(payPeriod)) {
        payPeriod = {};
      }
      if (hasInvalidSalaryRules && isInvalidSalaryRules(salaryRules)) {
        salaryRules = {};
      }
    } else {
      // Both are valid
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
      parsedPayPeriod = {};
    }

    return {
      ...emp,
      salaryInfo: parsedPayPeriod,
      salaryRules: parsedSalaryRules,
    };
  });

  const refresh = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries(["employees", mac.deviceMAC])
    );
  };

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
