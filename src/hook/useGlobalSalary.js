import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { parseNormalData } from "@/lib/parseNormalData";

export const useGlobalSalary = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const globalSalaryQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["salaryRules", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/salaryRules/check/${mac.deviceMAC}`
        );
        const parsedSalaryRules = parseNormalData(res.data.salaryRules);

        return {
          deviceMAC: mac.deviceMAC,
          salaryRules: parsedSalaryRules,
        };
      },
      staleTime: 5 * 60 * 1000, // ⭐ data is fresh for 5 min
      cacheTime: 30 * 60 * 1000, // optional (keep 30 min in cache)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
