import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const updateEmployeeData = async ({ employeeId, companyId, data }) => {
  const url = `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/employee/update/${companyId}/${employeeId}`;

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

  return axios.patch(url, payload).then((res) => res.data);
};

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeeData,
    onSuccess: () => {
      queryClient.invalidateQueries(["employeeData"]);
    },
  });
}
