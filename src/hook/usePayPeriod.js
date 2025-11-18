// Updated: usePayPeriod.js
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { INFINITE_QUERY_CONFIG } from "./queryConfig";

export const usePayPeriod = () => {
  const { deviceMACs } = useDeviceMACs();

  const queries = useMemo(
    () =>
      deviceMACs.map((mac) => ({
        queryKey: ["payPeriod", mac.deviceMAC],
        queryFn: async () => {
          const res = await apiClient.get(
            getApiUrl(`/payPeriod/check/${mac.deviceMAC}`)
          );
          return {
            deviceMAC: mac.deviceMAC,
            payPeriod: JSON.parse(res.data.payPeriod),
          };
        },
        ...INFINITE_QUERY_CONFIG,
        enabled: deviceMACs.length > 0,
      })),
    [deviceMACs]
  );

  const results = useQueries({ queries });

  return {
    payPeriodData: results.map((r) => r.data).filter(Boolean),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetch: () => results.forEach((q) => q.refetch()),
  };
};
