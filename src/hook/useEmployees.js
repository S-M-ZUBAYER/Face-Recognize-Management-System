// Updated: useEmployees.js
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { parseNormalData } from "@/lib/parseNormalData";
import { usePayPeriod } from "./usePayPeriod";
import { useGlobalSalary } from "./useGlobalSalary";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { DEFAULT_QUERY_CONFIG } from "./queryConfig";
import parseAddress from "@/lib/parseAddress";

export const useEmployees = () => {
  const queryClient = useQueryClient();
  const { deviceMACs } = useDeviceMACs();
  const { payPeriodData, isLoading: payPeriodLoading } = usePayPeriod();
  const { globalSalaryRules, isLoading: rulesLoading } = useGlobalSalary();

  const employeeQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["employees", mac.deviceMAC],
      queryFn: async () => {
        try {
          const res = await apiClient.get(
            getApiUrl(`/employee/all/${mac.deviceMAC}`)
          );

          return res.data.map((emp) => ({
            name: emp.name,
            employeeId: emp.employeeId,
            companyEmployeeId: emp.email?.split("|")[1],
            department: emp.department,
            email: emp.email?.split("|")[0],
            image: getApiUrl(`/media/${emp.imageFile}`),
            designation: emp.designation,
            deviceMAC: mac.deviceMAC,
            address: parseAddress(emp.address),
            salaryRules: emp.salaryRules,
            salaryInfo: JSON.parse(emp.payPeriod || "{}"),
          }));
        } catch (error) {
          console.error(
            `Failed to fetch employees for ${mac.deviceMAC}:`,
            error
          );
          return []; // Return empty array instead of failing
        }
      },
      ...DEFAULT_QUERY_CONFIG,
      enabled: deviceMACs.length > 0 && !payPeriodLoading && !rulesLoading,
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

  const EmployeesArray = employees.map((emp) => {
    let payPeriod, salaryRules;

    const hasInvalidSalaryInfo = isInvalidSalaryInfo(emp.salaryInfo);
    const hasInvalidSalaryRules = isInvalidSalaryRules(emp.salaryRules);

    if (hasInvalidSalaryInfo || hasInvalidSalaryRules) {
      const { SalaryRules, PayPeriod } = getPayInfoByDevice(emp.deviceMAC);

      payPeriod =
        hasInvalidSalaryInfo && !isInvalidSalaryInfo(PayPeriod)
          ? PayPeriod
          : emp.salaryInfo;
      salaryRules =
        hasInvalidSalaryRules && !isInvalidSalaryRules(SalaryRules)
          ? SalaryRules
          : emp.salaryRules;

      if (hasInvalidSalaryInfo && isInvalidSalaryInfo(payPeriod)) {
        payPeriod = {};
      }
      if (hasInvalidSalaryRules && isInvalidSalaryRules(salaryRules)) {
        salaryRules = {};
      }
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

  const Employees = EmployeesArray.filter(
    (e) => e.address?.type !== "resigned"
  );
  const resignedEmployees = EmployeesArray.filter(
    (e) => e.address?.type === "resigned"
  );

  const isDependencyLoading = payPeriodLoading || rulesLoading;
  const isLoading =
    employeeQueries.some((q) => q.isLoading) || isDependencyLoading;
  const isError = employeeQueries.some((q) => q.isError);

  return {
    Employees,
    resignedEmployees,
    employeeCounts: deviceMACs.map((mac, idx) => ({
      deviceMAC: mac.deviceMAC,
      count: employeeQueries[idx].data?.length || 0,
    })),
    isLoading,
    isError,
    isFetching: employeeQueries.some((q) => q.isFetching),
    refetch: refresh,
  };
};
