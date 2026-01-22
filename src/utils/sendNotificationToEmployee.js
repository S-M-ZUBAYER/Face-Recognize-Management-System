import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const sendNotificationToEmployee = async ({
  employeeId,
  deviceMAC,
  title,
  messageBody,
}) => {
  if (!employeeId || !deviceMAC) {
    throw new Error("employeeId and deviceMAC are required");
  }

  try {
    const response = await apiClient.post(
      getApiUrl("/attendance/notify-late"),
      {
        employeeIds: [employeeId],
        deviceMAC,
        title,
        messageBody,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    throw error;
  }
};
