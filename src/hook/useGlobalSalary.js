// Updated: useGlobalSalary.js
import { useQueries } from "@tanstack/react-query";
import { parseNormalData } from "@/lib/parseNormalData";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { INFINITE_QUERY_CONFIG } from "./queryConfig";
import { useGlobalStore } from "@/zustand/useGlobalStore";
import { useEffect, useRef } from "react";
import isEqual from "lodash.isequal";

export const useGlobalSalary = () => {
  const { deviceMACs } = useDeviceMACs();
  const { setGlobalRules } = useGlobalStore();
  const prevRef = useRef([]);

  const globalSalaryQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["salaryRules", mac.deviceMAC],
      queryFn: async () => {
        const res = await apiClient.get(
          getApiUrl(`/salaryRules/check/${mac.deviceMAC}`)
        );
        const parsedSalaryRules = parseNormalData(res.data.salaryRules);

        return {
          deviceMAC: mac.deviceMAC,
          salaryRules: parsedSalaryRules,
        };
      },
      ...INFINITE_QUERY_CONFIG,
      enabled: deviceMACs.length > 0,
    })),
  });

  const globalSalaryRules = globalSalaryQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = globalSalaryQueries.some((q) => q.isLoading);
  const isError = globalSalaryQueries.some((q) => q.isError);

  // ✅ FIX: update Zustand AFTER render
  useEffect(() => {
    // avoid unnecessary updates
    if (!isEqual(prevRef.current, globalSalaryRules)) {
      prevRef.current = globalSalaryRules;
      setGlobalRules(globalSalaryRules);
    }
  }, [globalSalaryRules, setGlobalRules]);

  return {
    globalSalaryRules,
    isLoading,
    isError,
    refetch: () => globalSalaryQueries.forEach((q) => q.refetch?.()),
  };
};
