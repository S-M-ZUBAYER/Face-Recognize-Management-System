import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";

export const usePayPeriod = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  const queries = useMemo(
    () =>
      deviceMACs.map((mac) => ({
        queryKey: ["payPeriod", mac.deviceMAC],
        queryFn: async () => {
          const res = await axios.get(
            `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/payPeriod/check/${mac.deviceMAC}`
          );
          return {
            deviceMAC: mac.deviceMAC,
            payPeriod: JSON.parse(res.data.payPeriod),
          };
        },
        staleTime: 5 * 60 * 1000, // ⭐ data is fresh for 5 min
        cacheTime: 30 * 60 * 1000, // optional (keep 30 min in cache)
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      })),
    [deviceMACs]
  );

  const results = useQueries({ queries });

  return {
    payPeriodData: results.map((r) => r.data).filter(Boolean),
    isLoading: results.some((r) => r.isLoading),
    refetch: () => results.forEach((q) => q.refetch()),
  };
};
