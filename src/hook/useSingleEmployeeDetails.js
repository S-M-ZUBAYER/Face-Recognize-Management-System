// Updated: useSingleEmployeeDetails.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useGlobalSalary } from "./useGlobalSalary";
import { usePayPeriod } from "./usePayPeriod";
import { parseNormalData } from "@/lib/parseNormalData";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { DEFAULT_QUERY_CONFIG } from "./queryConfig";

// === Fetch employee details ===
const fetchEmployeeDetails = async ({ employeeId, mac }) => {
  if (!employeeId || !mac) throw new Error("Missing employeeId or mac");

  const { data } = await apiClient.get(
    getApiUrl("/employee/by/mac-employeId"),
    {
      params: { employeeId, mac },
    }
  );
  return data;
};

// === Update employee details ===
const patchEmployeeDetails = async ({ mac, id, payload }) => {
  if (!mac || !id) throw new Error("Missing mac or employee id");
  console.log("📤 Payload being sent:", payload);

  const { data } = await apiClient.patch(
    getApiUrl(`/employee/update/${mac}/${id}`),
    payload
  );
  return data;
};

// === Main hook ===
export const useSingleEmployeeDetails = (employeeId, mac) => {
  const queryClient = useQueryClient();
  const { payPeriodData, isLoading: payPeriodLoading } = usePayPeriod();
  const { globalSalaryRules, isLoading: rulesLoading } = useGlobalSalary();

  // --- Fetch employee details ---
  const employeeQuery = useQuery({
    queryKey: ["employee-details", employeeId, mac],
    queryFn: async () => {
      if (payPeriodLoading || rulesLoading) {
        console.warn("⏳ Waiting for global data to load...");
        return null;
      }

      if (!payPeriodData || !globalSalaryRules) {
        console.warn("⚠️ Global data not available yet");
        return null;
      }

      try {
        const emp = await fetchEmployeeDetails({ employeeId, mac });

        const matchedPayPeriod = payPeriodData?.find(
          (d) => d.deviceMAC === mac
        );
        const matchedRule = globalSalaryRules?.find(
          (rule) => rule.deviceMAC === mac
        );

        console.log("✅ Matched Data:", {
          matchedPayPeriod,
          matchedRule,
          employeeId,
          mac,
        });

        if (
          (emp.salaryRules === 999 || emp.salaryRules === "999") &&
          matchedRule
        ) {
          console.log("🔄 Replacing salaryRules from global config");
          emp.salaryRules = matchedRule.salaryRules || {};
        }

        if (
          (emp.payPeriod === 999 || emp.payPeriod === "999") &&
          matchedPayPeriod
        ) {
          console.log("🔄 Replacing payPeriod from global config");
          emp.payPeriod = matchedPayPeriod.payPeriod || {};
        }

        try {
          if (typeof emp.salaryRules === "string") {
            emp.salaryRules = parseNormalData(JSON.parse(emp.salaryRules));
          } else if (emp.salaryRules) {
            emp.salaryRules = parseNormalData(emp.salaryRules);
          }

          if (typeof emp.payPeriod === "string") {
            emp.payPeriod = parseNormalData(JSON.parse(emp.payPeriod));
          } else if (emp.payPeriod) {
            emp.payPeriod = parseNormalData(emp.payPeriod);
          }
        } catch (parseErr) {
          console.error("❌ Error parsing employee data:", parseErr);
          // toast.error("Error parsing employee data");
        }

        return emp;
      } catch (error) {
        console.error("❌ Error fetching employee details:", error);
        // toast.error(
        //   error.response?.data?.message || "Failed to fetch employee details"
        // );
        throw error;
      }
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!employeeId && !!mac && !payPeriodLoading && !rulesLoading,
  });

  // --- Patch mutation for updating employee ---
  const updateEmployeeMutation = useMutation({
    mutationFn: patchEmployeeDetails,
    onSuccess: (data, variables) => {
      console.log("✅ Employee updated successfully:", data);

      queryClient.invalidateQueries({
        queryKey: ["employee-details", variables.id, variables.mac],
      });

      // toast.success("Employee details updated successfully!");
    },
    onError: (error) => {
      console.error("❌ Failed to update employee:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update employee";

      toast.error(errorMessage);
    },
  });

  return {
    ...employeeQuery,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    updating: updateEmployeeMutation.isPending,
    isLoadingGlobalData: payPeriodLoading || rulesLoading,
  };
};
