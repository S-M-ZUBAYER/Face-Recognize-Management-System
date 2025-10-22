import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalSalary } from "./useGlobalSalary";
import { usePayPeriod } from "./usePayPeriod";
import { parseNormalData } from "@/lib/parseNormalData";

const BASE_URL =
  "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug";

// === Fetch employee details ===
const fetchEmployeeDetails = async ({ employeeId, mac }) => {
  if (!employeeId || !mac) throw new Error("Missing employeeId or mac");
  const { data } = await axios.get(`${BASE_URL}/employee/by/mac-employeId`, {
    params: { employeeId, mac },
  });
  return data;
};

// === Update employee details ===
const patchEmployeeDetails = async ({ mac, id, payload }) => {
  if (!mac || !id) throw new Error("Missing mac or employee id");
  console.log(payload);
  const { data } = await axios.patch(
    `${BASE_URL}/employee/update/${mac}/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};

// === Main hook ===
export const useSingleEmployeeDetails = (employeeId, mac) => {
  const queryClient = useQueryClient();
  const { payPeriodData } = usePayPeriod();
  const { globalSalaryRules } = useGlobalSalary();

  // --- Fetch employee details ---
  const employeeQuery = useQuery({
    queryKey: ["employee-details", employeeId, mac],
    queryFn: async () => {
      const emp = await fetchEmployeeDetails({ employeeId, mac });

      // 1️⃣ Find matching global configs by deviceMAC
      const matchedPayPeriod = payPeriodData?.find((d) => d.deviceMAC === mac);
      const matchedRule = globalSalaryRules?.find(
        (rule) => rule.deviceMAC === mac
      );

      console.log("xx");

      console.log(matchedPayPeriod, matchedRule);

      // 2️⃣ Replace "999" with global data
      if (emp.salaryRules === "999" && matchedRule) {
        emp.salaryRules = matchedRule.salaryRules || {};
      }
      if (emp.payPeriod === "999" && matchedPayPeriod) {
        emp.payPeriod = matchedPayPeriod.payPeriod || {};
      }

      // 3️⃣ Parse both rule and payPeriod
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
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // --- Patch mutation for updating employee ---
  const updateEmployeeMutation = useMutation({
    mutationFn: patchEmployeeDetails,
    onSuccess: (data, variables) => {
      // Optimistically update cache for smoother UX
      queryClient.invalidateQueries([
        "employee-details",
        variables.id,
        variables.mac,
      ]);
    },
    onError: (err) => {
      console.error("Failed to update employee:", err);
    },
  });

  return {
    ...employeeQuery,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    updating: updateEmployeeMutation.isPending,
  };
};
