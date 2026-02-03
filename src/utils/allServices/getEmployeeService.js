import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const fetchEmployeeUseIngMac = async ({ mac }) => {
  if (!mac) throw new Error("Missing  mac");
  try {
    const res = await apiClient.get(getApiUrl(`/employee/all/${mac}`));
    return res.data;
  } catch (error) {
    console.error(
      `❌ Failed to fetch attendance data for device ${mac}:`,
      error,
    );
    return [];
  }
};
