import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { INFINITE_QUERY_CONFIG } from "./queryConfig";

export const useOverTimeData = () => {
  const queryClient = useQueryClient();
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();

  // Fetch overtime data
  const fetchOverTime = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];

    try {
      const response = await Promise.all(
        deviceMACs.map((mac) =>
          apiClient
            .get(getApiUrl(`/overtime/${mac.deviceMAC}`))
            .catch((error) => {
              console.error(
                `❌ Failed to fetch overtime for device ${mac.deviceMAC}:`,
                error
              );
              return { data: [] }; // Return empty array for failed requests
            })
        )
      );
      return response.flatMap((res) => res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch overtime data:", error);
      return [];
    }
  };

  const {
    data: overTime = [],
    isLoading,
    isError,
    isFetching,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["overtime", deviceMACs.map((mac) => mac.deviceMAC)],
    queryFn: fetchOverTime,
    enabled: !!deviceMACs && deviceMACs.length > 0 && !macsLoading,
    ...INFINITE_QUERY_CONFIG,
  });

  // ✅ Manual refresh: forces a new API call
  const refresh = async () => {
    await queryRefetch();
  };

  // Create overtime
  const createOverTime = async (newOverTime) => {
    const response = await apiClient.post(getApiUrl("/overtime"), newOverTime);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: createOverTime,
    onSuccess: () => {
      // ✅ Force refetch after creation
      queryClient.invalidateQueries({
        queryKey: ["overtime", deviceMACs.map((mac) => mac.deviceMAC)],
      });
    },
    onError: (error) => {
      console.error("❌ Failed to create overtime:", error);
    },
  });

  return {
    overTime,
    isLoading: isLoading || macsLoading, // Combined loading state
    isError,
    isFetching,
    refresh,
    createOverTime: mutation.mutate,
    createOverTimeAsync: mutation.mutateAsync, // For async/await usage
    createLoading: mutation.isLoading,
    createError: mutation.error,
    isCreateSuccess: mutation.isSuccess,
  };
};
