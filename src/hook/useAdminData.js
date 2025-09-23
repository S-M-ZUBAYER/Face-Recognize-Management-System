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

  // Flatten the array of arrays and filter out any null or undefined data.
  const allAdmins = adminQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  // Use a Map to filter for unique adminEmail, keeping the first occurrence
  const uniqueAdminsMap = new Map();
  allAdmins.forEach((admin) => {
    if (admin?.adminEmail && !uniqueAdminsMap.has(admin.adminEmail)) {
      uniqueAdminsMap.set(admin.adminEmail, admin);
    }
  });

  const admins = Array.from(uniqueAdminsMap.values());

  const isLoading = adminQueries.some((q) => q.isLoading);
  const error = adminQueries.find((q) => q.error)?.error || null;

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
