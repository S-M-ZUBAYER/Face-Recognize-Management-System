import { useQueries, useQueryClient, useMutation } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { ALWAYS_FRESH_CONFIG } from "./queryConfig";
import toast from "react-hot-toast";

export const useAdminData = () => {
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();
  const queryClient = useQueryClient();

  const adminQueries = useQueries({
    queries: deviceMACs.map((mac) => ({
      queryKey: ["adminData", mac.deviceMAC],
      queryFn: async () => {
        try {
          const res = await apiClient.get(
            getApiUrl("/admin/admins-device-map-by-device"),
            { params: { mac: mac.deviceMAC } }
          );
          return res.data;
        } catch (error) {
          console.error(
            `❌ Failed to fetch admin data for device ${mac.deviceMAC}:`,
            error
          );
          throw error;
        }
      },
      ...ALWAYS_FRESH_CONFIG,
      enabled: deviceMACs.length > 0 && !macsLoading,
    })),
  });

  // Flatten the array of arrays and filter out any null or undefined data
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

  const isLoading = adminQueries.some((q) => q.isLoading) || macsLoading;
  const isError = adminQueries.some((q) => q.isError);
  const isFetching = adminQueries.some((q) => q.isFetching);

  // Delete admin mutation with toast notifications
  const deleteAdminMutation = useMutation({
    mutationFn: async (deletePayload) => {
      const response = await apiClient.delete(getApiUrl("/admin/unassign"), {
        data: deletePayload,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("✅ Admin unassigned successfully:", data);

      // Invalidate and refetch admin data
      queryClient.invalidateQueries({
        queryKey: ["adminData"],
      });

      toast.success("Admin unassigned successfully!");
    },
    onError: (error) => {
      console.error("❌ Failed to unassign admin:", error);

      let errorMessage = "Failed to unassign admin";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });

  // Helper function to delete/unassign admin
  const deleteAdmin = async (adminData) => {
    const deletePayload = {
      adminName: adminData.adminName,
      phone: adminData.phone,
      adminEmail: adminData.adminEmail,
      deviceMAC: adminData.devices?.[0]?.deviceMAC || adminData.deviceMAC || "",
    };

    return deleteAdminMutation.mutateAsync(deletePayload);
  };

  const refetch = () => {
    deviceMACs.forEach((mac) =>
      queryClient.invalidateQueries({
        queryKey: ["adminData", mac.deviceMAC],
        exact: true,
      })
    );
  };

  return {
    admins,
    isLoading,
    isError,
    isFetching,
    refetch,

    // Delete functionality
    deleteAdmin,
    deleteAdminDirect: deleteAdminMutation.mutate, // Fire-and-forget version
    isDeleting: deleteAdminMutation.isPending,
    deleteError: deleteAdminMutation.error,
    isDeleteSuccess: deleteAdminMutation.isSuccess,
  };
};
