import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const updateAttendanceUseIngMac = async ({ data }) => {
  if (!data) throw new Error("Missing  data");
  try {
    const res = await apiClient.post(getApiUrl("/attendance/punch"), data);
    return res.data;
  } catch (error) {
    console.error(
      `❌ Failed to fetch attendance data for device ${data}:`,
      error,
    );
    return [];
  }
};
