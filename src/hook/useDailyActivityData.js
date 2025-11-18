import { useQuery } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { DEFAULT_QUERY_CONFIG } from "./queryConfig";

export const useDailyActivityData = () => {
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();

  const fetchDailyActivities = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];

    try {
      const response = await Promise.all(
        deviceMACs.map((mac) =>
          apiClient
            .get(getApiUrl(`/tasks/getTask/${mac.deviceMAC}`))
            .catch((error) => {
              console.error(
                `❌ Failed to fetch daily activities for device ${mac.deviceMAC}:`,
                error
              );
              return { data: [] }; // Return empty array for failed requests
            })
        )
      );

      return response.flatMap((res) => res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch daily activities:", error);
      return [];
    }
  };

  const {
    data: dailyActivities = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dailyActivities", deviceMACs.map((mac) => mac.deviceMAC)],
    queryFn: fetchDailyActivities,
    enabled: !!deviceMACs && deviceMACs.length > 0 && !macsLoading,
    staleTime: 60 * 1000, // 1 minute
    ...DEFAULT_QUERY_CONFIG,
  });

  return {
    dailyActivities,
    isLoading: isLoading || macsLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
};
