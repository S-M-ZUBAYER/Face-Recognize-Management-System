import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";
import { useEmployees } from "./useEmployees";

export const useLeaveData = () => {
  const { deviceMACs } = useUserData();
  const { Employees, isLoading: employeesLoading } = useEmployees();
  const queryClient = useQueryClient();

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

    return response
      .flatMap((res) => res.data)
      .map((leave) => {
        // Find matching employee by employeeId
        const matchingEmployee = Employees?.find(
          (emp) => emp.employeeId === leave.employeeId
        );

        return {
          ...leave,
          approverName: JSON.parse(leave.approverName || "{}"),
          description: JSON.parse(leave.description || "{}"),
          // Add employee image if found
          employeeImage: matchingEmployee?.image || null,
        };
      });
  };

  const {
    data: leaves = [],
    isLoading: leavesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leaves", deviceMACs],
    queryFn: fetchLeaves,
    enabled: !!deviceMACs && deviceMACs.length > 0,
    staleTime: 0,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data.sort((a, b) => b.id - a.id),
  });

  // Update leave mutation
  const updateLeaveMutation = useMutation({
    mutationFn: async (updatedLeave) => {
      const response = await axios.put(
        "https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/leave/update",
        updatedLeave,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch leaves data after successful update
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error) => {
      console.error("Error updating leave:", error);
    },
  });

  // Helper function to update leave
  const updateLeave = async (leaveData) => {
    return updateLeaveMutation.mutateAsync(leaveData);
  };

  //  Count leave categories for today's date
  const today = new Date().toISOString().split("T")[0];

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

  const isLoading = leavesLoading || employeesLoading;

  return {
    leaves,
    isLoading,
    error,
    refetch,
    leaveCategoryCounts, // { "Sick Leave": 2, "Casual Leave": 1, ... }
    leaveCategoryArray, // [ { category: "Sick Leave", count: 2 }, ... ]

    // Update functionality
    updateLeave,
    isUpdating: updateLeaveMutation.isPending,
    updateError: updateLeaveMutation.error,
  };
};
