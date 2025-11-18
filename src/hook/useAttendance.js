import { useQueries } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { ALWAYS_FRESH_CONFIG } from "./queryConfig";

export const useAttendance = (selectedDate) => {
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();

  const attendanceQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["attendance", mac.deviceMAC, selectedDate],
      queryFn: async () => {
        try {
          const res = await apiClient.get(
            getApiUrl("/attendance/attendance-by-date-device"),
            {
              params: {
                macId: mac.deviceMAC,
                date: selectedDate,
              },
            }
          );
          return res.data;
        } catch (error) {
          console.error(
            `❌ Failed to fetch attendance for device ${mac.deviceMAC} on ${selectedDate}:`,
            error
          );
          // Return empty array instead of failing the entire query
          return [];
        }
      },
      ...ALWAYS_FRESH_CONFIG,
      enabled: !!selectedDate && deviceMACs.length > 0 && !macsLoading,
    })),
  });

  const attendanceData = attendanceQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = attendanceQueries.some((q) => q.isLoading) || macsLoading;
  const isError = attendanceQueries.some((q) => q.isError);
  const isFetching = attendanceQueries.some((q) => q.isFetching);

  const refetch = () => {
    attendanceQueries.forEach((q) => q.refetch?.());
  };

  return {
    attendanceData,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};
