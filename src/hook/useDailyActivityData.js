import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";

export const useDailyActivityData = () => {
  const { deviceMACs } = useUserData();

  const fetchDailyActivities = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];
    const response = await Promise.all(
      deviceMACs.map((mac) =>
        axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/tasks/getTask/${
            mac.deviceMAC ?? mac
          }`
        )
      )
    );
    return response.flatMap((res) => res.data);
  };

  const {
    data: dailyActivities = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dailyActivities", deviceMACs],
    queryFn: fetchDailyActivities,
    enabled: !!deviceMACs && deviceMACs.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    dailyActivities,
    isLoading,
    error,
    refetch,
  };
};
