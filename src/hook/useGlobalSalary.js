import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { parseSalaryRules } from "@/lib/parseSalaryRules";

export const useGlobalSalary = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const globalSalaryQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["salaryRules", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/salaryRules/check/${mac.deviceMAC}`
        );
        const parsedSalaryRules = parseSalaryRules(res.data.salaryRules);

        return {
          deviceMAC: mac.deviceMAC,
          salaryRules: parsedSalaryRules,
        };
      },
    })),
  });

  const globalSalaryRules = globalSalaryQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  return {
    globalSalaryRules,
    isLoading: globalSalaryQueries.some((q) => q.isLoading),
    refetch: () => globalSalaryQueries.forEach((q) => q.refetch?.()),
  };
};
