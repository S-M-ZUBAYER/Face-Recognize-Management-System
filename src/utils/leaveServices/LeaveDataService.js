import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useEmployeeStore } from "@/zustand/useEmployeeStore";
import useLeaveStore from "@/zustand/useLeaveStore";

export const fetchLeavesData = async () => {
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs"));
  const employees = useEmployeeStore.getState().employees();
  if (
    !deviceMACs ||
    deviceMACs.length === 0 ||
    !employees ||
    employees.length === 0
  ) {
    return [];
  }

  try {
    // Fetch all leaves in parallel using Promise.allSettled for better error handling
    const responses = await Promise.allSettled(
      deviceMACs.map((mac) =>
        apiClient.get(getApiUrl(`/leave/all/by-mac/${mac.deviceMAC || mac}`)),
      ),
    );

    // Extract successful responses only
    const leavesData = responses
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value?.data || []);

    // Process leaves with employee data
    const processedLeaves = leavesData.map((leave) => {
      const matchingEmployee = employees?.find(
        (emp) => emp.employeeId === leave.employeeId,
      );

      // Parse JSON fields safely
      const approverName = safeJsonParse(leave.approverName);
      const description = safeJsonParse(leave.description);

      return {
        ...leave,
        approverName,
        description,
        employeeImage: matchingEmployee?.image || null,
        employeeName: matchingEmployee?.name || leave.employeeName,
        companyEmployeeId: matchingEmployee?.companyEmployeeId || "",
      };
    });

    // Sort by createdAt descending
    const { setLeaves } = useLeaveStore.getState();

    setLeaves(
      processedLeaves.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    // return processedLeaves.sort(
    //   (a, b) =>
    //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    // );
  } catch (error) {
    console.error("❌ Failed to fetch leave data:", error);
    throw error;
  }
};

export const updateLeaveData = async (leaveData) => {
  try {
    const response = await apiClient.put(getApiUrl("/leave/update"), leaveData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating leave:", error);
    throw error;
  }
};

export const calculateLeaveCategoryCounts = (leaves, selectedDate) => {
  return leaves.reduce((acc, leave) => {
    if (leave.startDate && leave.endDate) {
      try {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const current = new Date(selectedDate);

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
};

export const convertCategoryCountsToArray = (categoryCounts) => {
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));
};

export const getLeaveCategoryArray = (leaves, selectedDate) => {
  const leaveCategoryCounts = calculateLeaveCategoryCounts(
    leaves,
    selectedDate,
  );
  return convertCategoryCountsToArray(leaveCategoryCounts);
};

// Helper function to safely parse JSON
function safeJsonParse(jsonString, fallback = {}) {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}
