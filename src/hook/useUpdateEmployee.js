import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

const updateEmployeeData = async ({ employeeId, companyId, data }) => {
  const url = getApiUrl(`/employee/update/${companyId}/${employeeId}`);

  // Only include non-empty fields
  const payload = {};
  if (data.allowedAttendanceModes) {
    payload.allowedAttendanceModes = data.allowedAttendanceModes;
  }
  if (data.allowedAttendanceActions) {
    payload.allowedAttendanceActions = data.allowedAttendanceActions;
  }
  if (data.visibleDataTypes) {
    payload.visibleDataTypes = data.visibleDataTypes;
  }

  // Validate that we have at least one field to update
  if (Object.keys(payload).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const response = await apiClient.patch(url, payload);
  return response.data;
};

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeeData,
    onMutate: (variables) => {
      // Optional: Optimistic update
      console.log("🔄 Starting employee update:", variables);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Employee updated successfully:", data);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["employeeData"] });
      queryClient.invalidateQueries({
        queryKey: [
          "employee-details",
          variables.employeeId,
          variables.companyId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      toast.success("Employee updated successfully!");
    },
    onError: (error) => {
      console.error("❌ Failed to update employee:", error);

      let errorMessage = "Failed to update employee";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
    onSettled: () => {
      // Any cleanup after mutation completes
      console.log("Update employee mutation settled");
    },
  });
}
