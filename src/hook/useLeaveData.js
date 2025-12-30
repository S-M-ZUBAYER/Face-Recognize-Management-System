import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { DEFAULT_QUERY_CONFIG, INFINITE_QUERY_CONFIG } from "./queryConfig";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";

export const useLeaveData = () => {
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();
  const { employees } = useEmployeeStore();
  const Employees = employees();
  const queryClient = useQueryClient();

  const fetchLeaves = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];

    try {
      const response = await Promise.all(
        deviceMACs.map((mac) =>
          apiClient
            .get(getApiUrl(`/leave/all/by-mac/${mac.deviceMAC}`))
            .catch((error) => {
              console.error(
                `❌ Failed to fetch leaves for device ${mac.deviceMAC}:`,
                error
              );
              return { data: [] }; // Return empty array for failed requests
            })
        )
      );

      const leavesData = response.flatMap((res) => res.data || []);

      // Process leaves with employee data
      return leavesData.map((leave) => {
        // Find matching employee by employeeId
        const matchingEmployee = Employees?.find(
          (emp) => emp.employeeId === leave.employeeId
        );

        // Safe JSON parsing with fallbacks
        let approverName = {};
        let description = {};

        try {
          approverName = JSON.parse(leave.approverName || "{}");
        } catch (parseError) {
          console.warn(
            `Failed to parse approverName for leave ${leave.id}:`,
            parseError
          );
        }

        try {
          description = JSON.parse(leave.description || "{}");
        } catch (parseError) {
          console.warn(
            `Failed to parse description for leave ${leave.id}:`,
            parseError
          );
        }

        return {
          ...leave,
          approverName,
          description,
          // Add employee image if found
          employeeImage: matchingEmployee?.image || null,
          employeeName: matchingEmployee?.name || leave.employeeName, // Fallback to leave data
        };
      });
    } catch (error) {
      console.error("❌ Failed to fetch leave data:", error);
      return [];
    }
  };

  const {
    data: leaves = [],
    isLoading: leavesLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "leaves",
      deviceMACs.map((mac) => mac.deviceMAC),
      Employees?.length,
    ],
    queryFn: fetchLeaves,
    enabled: !!deviceMACs && deviceMACs.length > 0 && !macsLoading,
    ...DEFAULT_QUERY_CONFIG,
    select: (data) =>
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  });

  // Update leave mutation
  const updateLeaveMutation = useMutation({
    mutationFn: async (updatedLeave) => {
      const response = await apiClient.put(
        getApiUrl("/leave/update"),
        updatedLeave
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch leaves data after successful update
      queryClient.invalidateQueries({
        queryKey: ["leaves", deviceMACs.map((mac) => mac.deviceMAC)],
      });
    },
    onError: (error) => {
      console.error("❌ Error updating leave:", error);
    },
  });

  // Helper function to update leave
  const updateLeave = async (leaveData) => {
    return updateLeaveMutation.mutateAsync(leaveData);
  };

  // Count leave categories for today's date
  const today = new Date().toISOString().split("T")[0];

  const leaveCategoryCounts = leaves.reduce((acc, leave) => {
    if (leave.startDate && leave.endDate) {
      try {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const current = new Date(today);

        if (current >= start && current <= end) {
          const category = leave.leaveCategory || "Unknown";
          acc[category] = (acc[category] || 0) + 1;
        }
      } catch (dateError) {
        console.warn(`Invalid date range for leave ${leave.id}:`, dateError);
      }
    }
    return acc;
  }, {});

  // Convert counts into array
  const leaveCategoryArray = Object.entries(leaveCategoryCounts).map(
    ([category, count]) => ({
      category,
      count,
    })
  );

  const isLoading = leavesLoading || macsLoading;
  const isRefetching = isFetching;

  return {
    leaves,
    isLoading,
    isError,
    error,
    isFetching: isRefetching,
    refetch,
    leaveCategoryCounts,
    leaveCategoryArray,

    // Update functionality
    updateLeave,
    updateLeaveDirect: updateLeaveMutation.mutate, // Fire-and-forget version
    isUpdating: updateLeaveMutation.isPending,
    updateError: updateLeaveMutation.error,
    isUpdateSuccess: updateLeaveMutation.isSuccess,
  };
};
