// hooks/useOptimizedEmployees.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseNormalData } from "@/lib/parseNormalData";
import { usePayPeriod } from "./usePayPeriod";
import { useGlobalSalary } from "./useGlobalSalary";

export const useOptimizedEmployees = () => {
  const queryClient = useQueryClient();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const { payPeriodData } = usePayPeriod();
  const { globalSalaryRules } = useGlobalSalary();

  // Single query for all employees instead of multiple queries
  const employeesQuery = useQuery({
    queryKey: ["all-employees", deviceMACs.map((mac) => mac.deviceMAC)],
    queryFn: async () => {
      console.log("🔄 Fetching all employees data...");

      // Batch all device requests
      const promises = deviceMACs.map((mac) =>
        axios
          .get(
            `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/employee/all/${mac.deviceMAC}`,
            { timeout: 10000 } // 10 second timeout
          )
          .catch((error) => {
            console.warn(
              `Failed to fetch employees for device ${mac.deviceMAC}:`,
              error
            );
            return { data: [] }; // Return empty array on failure
          })
      );

      const results = await Promise.all(promises);

      // Transform all data at once
      const allEmployees = results
        .map((response, index) => {
          const deviceMAC = deviceMACs[index].deviceMAC;
          return response.data.map((emp) => ({
            name: emp.name,
            employeeId: emp.employeeId,
            companyEmployeeId: emp.email?.split("|")[1],
            department: emp.department,
            email: emp.email?.split("|")[0],
            image: `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/media/${emp.imageFile}`,
            designation: emp.designation,
            deviceMAC: deviceMAC,
            salaryRules: emp.salaryRules,
            salaryInfo: JSON.parse(emp.payPeriod),
          }));
        })
        .flat();

      console.log(
        `✅ Fetched ${allEmployees.length} employees from ${deviceMACs.length} devices`
      );
      return allEmployees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!payPeriodData && !!globalSalaryRules,
  });

  // Helper function to get pay info
  const getPayInfoByDevice = (mac) => {
    if (!payPeriodData || !globalSalaryRules) {
      return { PayPeriod: {}, SalaryRules: {} };
    }

    const found = payPeriodData.find((d) => d.deviceMAC === mac);
    const Rule = globalSalaryRules.find((rule) => rule.deviceMAC === mac);

    return {
      PayPeriod: found?.payPeriod || {},
      SalaryRules: Rule?.salaryRules || {},
    };
  };

  // Process employees with salary data
  const processedEmployees =
    employeesQuery.data?.map((emp) => {
      let payPeriod, salaryRules;

      const hasInvalidSalaryInfo =
        emp.salaryInfo === 999 ||
        emp.salaryInfo === "999" ||
        !emp.salaryInfo ||
        (typeof emp.salaryInfo === "object" &&
          Object.keys(emp.salaryInfo).length === 0);

      const hasInvalidSalaryRules =
        emp.salaryRules === 999 ||
        emp.salaryRules === "999" ||
        !emp.salaryRules ||
        (emp.salaryRules?.rules &&
          (!Array.isArray(emp.salaryRules.rules) ||
            emp.salaryRules.rules.length === 0));

      // Use fallback data if needed
      if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
        const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);

        payPeriod = hasInvalidSalaryInfo ? PayPeriod || {} : emp.salaryInfo;
        salaryRules = hasInvalidSalaryRules
          ? SalaryRules || {}
          : emp.salaryRules;
      } else {
        payPeriod = emp.salaryInfo;
        salaryRules = emp.salaryRules;
      }

      // Parse the data
      let parsedSalaryRules, parsedPayPeriod;
      try {
        parsedSalaryRules = parseNormalData(salaryRules);
        parsedPayPeriod = parseNormalData(payPeriod);
      } catch (error) {
        console.warn(
          `Error parsing salary data for employee ${emp.employeeId}:`,
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
    }) || [];

  const refresh = () => {
    queryClient.invalidateQueries(["all-employees"]);
  };

  return {
    Employees: processedEmployees,
    isLoading: employeesQuery.isLoading,
    isFetching: employeesQuery.isFetching,
    refetch: refresh,
    error: employeesQuery.error,
  };
};
