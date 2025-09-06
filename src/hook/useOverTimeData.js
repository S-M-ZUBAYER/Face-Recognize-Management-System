import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";

export const useOverTimeData = () => {
  const { deviceMACs } = useUserData();

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

  return {
    overTime,
    isLoading,
    error,
    refetch,
  };
};
