import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalSalary } from "./useGlobalSalary";
import { usePayPeriod } from "./usePayPeriod";
import { parseNormalData } from "@/lib/parseNormalData";

const BASE_URL =
  "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug";

const fetchEmployeeDetails = async ({ employeeId, mac }) => {
  if (!employeeId || !mac) throw new Error("Missing employeeId or mac");
  const { data } = await axios.get(`${BASE_URL}/employee/by/mac-employeId`, {
    params: { employeeId, mac },
  });
  return data;
};

export const useSingleEmployeeDetails = (employeeId, mac) => {
  const { payPeriodData } = usePayPeriod();
  const { globalSalaryRules } = useGlobalSalary();

  return useQuery({
    queryKey: ["employee-details", employeeId, mac],
    queryFn: async () => {
      const emp = await fetchEmployeeDetails({ employeeId, mac });

      // === 1️⃣ Find matching global configs by deviceMAC ===
      const matchedPayPeriod = payPeriodData?.find((d) => d.deviceMAC === mac);
      const matchedRule = globalSalaryRules?.find(
        (rule) => rule.deviceMAC === mac
      );

      // === 2️⃣ Replace "999" with global data ===
      if (emp.salaryRules === "999" && matchedRule) {
        emp.salaryRules = matchedRule;
      }
      if (emp.payPeriod === "999" && matchedPayPeriod) {
        emp.payPeriod = matchedPayPeriod;
      }

      // === 3️⃣ Parse both rule and payPeriod if needed ===
      try {
        if (typeof emp.salaryRules === "string") {
          emp.salaryRules = parseNormalData(JSON.parse(emp.salaryRules));
        } else {
          emp.salaryRules = parseNormalData(emp.salaryRules);
        }

        if (typeof emp.payPeriod === "string") {
          emp.payPeriod = parseNormalData(emp.payPeriod);
        }
      } catch (err) {
        console.error("Error parsing employee data:", err);
      }

      return emp;
    },
    enabled: !!employeeId && !!mac,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};
