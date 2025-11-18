import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { ALWAYS_FRESH_CONFIG } from "./queryConfig";

export const useAttendanceData = () => {
  const queryClient = useQueryClient();
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();

  // Attendance per deviceMAC
  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance-data", mac.deviceMAC], // Changed key to avoid conflicts
      queryFn: async () => {
        try {
          const res = await apiClient.get(
            getApiUrl("/attendance/attendance-by-device"),
            {
              params: { deviceId: mac.deviceMAC },
            }
          );
          return res.data;
        } catch (error) {
          console.error(
            `❌ Failed to fetch attendance data for device ${mac.deviceMAC}:`,
            error
          );
          // Return empty array instead of failing completely
          return [];
        }
      },
      ...ALWAYS_FRESH_CONFIG,
      enabled: deviceMACs.length > 0 && !macsLoading,
    })),
  });

  const Attendance = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = attendanceQueries.some((q) => q.isLoading) || macsLoading;
  const isError = attendanceQueries.some((q) => q.isError);
  const isFetching = attendanceQueries.some((q) => q.isFetching);

  // ✅ Manual refresh only
  const refresh = async () => {
    const refreshPromises = deviceMACs.map((mac) =>
      queryClient.refetchQueries({
        queryKey: ["attendance-data", mac.deviceMAC],
        exact: true,
      })
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
