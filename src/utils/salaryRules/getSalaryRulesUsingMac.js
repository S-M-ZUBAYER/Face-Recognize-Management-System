import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const fetchSalaryRulesUseIngMac = async ({ mac }) => {
  if (!mac) throw new Error("Missing  mac");
  try {
    const res = await apiClient.get(getApiUrl(`/salaryRules/check/${mac}`));
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
