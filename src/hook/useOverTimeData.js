import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";

export const useOverTimeData = () => {
  const { deviceMACs } = useUserData();
  const queryClient = useQueryClient();

  // Fetch overtime data
  const fetchOverTime = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];
    const response = await Promise.all(
      deviceMACs.map((mac) =>
        axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/overtime/${
            mac.deviceMAC ?? mac
          }`
        )
      )
    );
    return response.flatMap((res) => res.data);
  };

  const {
    data: overTime = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["overtime", deviceMACs],
    queryFn: fetchOverTime,
    enabled: !!deviceMACs && deviceMACs.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create overtime
  const createOverTime = async (newOverTime) => {
    const response = await axios.post(
      "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/overtime",
      newOverTime
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: createOverTime,
    onSuccess: () => {
      // Refetch overtime data after a successful creation
      queryClient.invalidateQueries(["overtime", deviceMACs]);
    },
  });

  return {
    overTime,
    isLoading,
    error,
    refetch,
    createOverTime: mutation.mutate,
    createLoading: mutation.isLoading,
    createError: mutation.error,
  };
};
