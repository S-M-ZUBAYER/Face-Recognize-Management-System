import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAttendanceData = () => {
  const queryClient = useQueryClient();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/attendance/attendance-by-device?deviceId=${mac.deviceMAC}`
        );
        return res.data;
      },
      staleTime: Infinity, // never auto refetch
      cacheTime: Infinity, // keep data forever in memory
      refetchOnWindowFocus: false, // prevent auto refetch on tab focus
      refetchOnReconnect: false, // prevent auto refetch on reconnect
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = attendanceQueries.some((q) => q.isLoading);
  const isError = attendanceQueries.some((q) => q.isError);
  const isFetching = attendanceQueries.some((q) => q.isFetching);

  // ✅ Manual refresh only
  const refresh = async () => {
    const refreshPromises = deviceMACs.map((mac) =>
      queryClient.invalidateQueries(["attendance", mac.deviceMAC])
    );
    await Promise.all(refreshPromises);
  };

  return {
    Attendance,
    isLoading,
    isError,
    isFetching,
    refresh,
  };
};
