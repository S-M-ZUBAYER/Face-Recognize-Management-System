import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const updatePayPeriod = async ({ mac, payload }) => {
  if (!mac) throw new Error("Missing  mac");
  try {
    const res = await apiClient.put(
      getApiUrl(`/salaryRules/update/${mac}`),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error(
      `❌ Failed to fetch attendance data for device ${mac}:`,
      error,
    );
    // Return empty array instead of failing completely
    return [];
  }
};
