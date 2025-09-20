import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAdminData = () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");
  const queryClient = useQueryClient();

  const adminQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["adminData", mac.deviceMAC ?? mac],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/admin/admins-device-map-by-device`,
          { params: { mac: mac.deviceMAC ?? mac } }
        );

        return res.data;
      },
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    })),
  });

  const admins = adminQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const isLoading = adminQueries.some((q) => q.isLoading);
  const error = adminQueries.find((q) => q.error)?.error || null;

  // ✅ Manual refresh: now matches queryKey
  const refetch = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries(["adminData", mac.deviceMAC ?? mac])
    );
  };

  return {
    admins,
    isLoading,
    error,
    refetch,
  };
};
