import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
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
  console.log("📤 Payload being sent:", payload);

  try {
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
  } catch (error) {
    console.error("❌ Patch error:", error.response?.data || error.message);
    throw error;
  }
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
      // ❌ FIX 1: Wait for global data to be loaded before fetching
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

        // ✅ FIX 2: Find matching global configs by deviceMAC
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

        // ✅ FIX 3: Replace "999" with global data
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

        // ✅ FIX 4: Parse both rule and payPeriod with better error handling
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
          toast.error("Error parsing employee data");
          // Return emp anyway so app doesn't break
        }

        return emp;
      } catch (error) {
        console.error("❌ Error fetching employee details:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch employee details"
        );
        throw error;
      }
    },
    enabled: !!employeeId && !!mac && !payPeriodLoading && !rulesLoading, // ✅ FIX 5: Only run when ready
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 2, // ✅ FIX 6: Retry on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // --- Patch mutation for updating employee ---
  const updateEmployeeMutation = useMutation({
    mutationFn: patchEmployeeDetails,
    onSuccess: (data, variables) => {
      console.log("✅ Employee updated successfully:", data);

      // ✅ FIX 7: Invalidate query properly with queryKey array
      queryClient.invalidateQueries({
        queryKey: ["employee-details", variables.id, variables.mac],
      });

      // ✅ FIX 8: Show success toast
      toast.success("Employee details updated successfully!");
    },
    onError: (error) => {
      console.error("❌ Failed to update employee:", error);

      // ✅ FIX 9: Better error handling
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
    isLoadingGlobalData: payPeriodLoading || rulesLoading, // ✅ FIX 10: Expose global data loading state
  };
};
