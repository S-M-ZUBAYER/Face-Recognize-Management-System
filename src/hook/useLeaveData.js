import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";

export const useLeaveData = () => {
  const { deviceMACs } = useUserData();

  const fetchLeaves = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];
    const response = await Promise.all(
      deviceMACs.map((mac) =>
        axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/leave/all/by-mac/${
            mac.deviceMAC ?? mac
          }`
        )
      )
    );
    return response.flatMap((res) => res.data);
  };

  const {
    data: leaves = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leaves", deviceMACs],
    queryFn: fetchLeaves,
    enabled: !!deviceMACs && deviceMACs.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });

  //  Count leave categories for today's date
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-25"

  const leaveCategoryCounts = leaves.reduce((acc, leave) => {
    if (leave.startDate && leave.endDate) {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(today);

      if (current >= start && current <= end) {
        const category = leave.leaveCategory || "Unknown";
        acc[category] = (acc[category] || 0) + 1;
      }
    }
    return acc;
  }, {});

  // Convert counts into array if you prefer
  const leaveCategoryArray = Object.entries(leaveCategoryCounts).map(
    ([category, count]) => ({
      category,
      count,
    })
  );

  return {
    leaves,
    isLoading,
    error,
    refetch,
    leaveCategoryCounts, // { "Sick Leave": 2, "Casual Leave": 1, ... }
    leaveCategoryArray, // [ { category: "Sick Leave", count: 2 }, ... ]
  };
};
