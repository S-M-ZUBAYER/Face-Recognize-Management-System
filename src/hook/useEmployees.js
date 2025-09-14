import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";

export const useEmployees = () => {
  const queryClient = useQueryClient();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

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
          salaryRules: parseSalaryRules(emp.salaryRules),
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

  // ✅ Manual refresh: forces a new API call
  const refresh = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries(["employees", mac.deviceMAC])
    );
  };

  return {
    employees,
    employeeCounts: deviceMACs.map((mac, idx) => ({
      deviceMAC: mac.deviceMAC,
      count: employeeQueries[idx].data?.length || 0,
    })),
    isLoading: employeeQueries.some((q) => q.isLoading),
    refetch: refresh,
  };
};
