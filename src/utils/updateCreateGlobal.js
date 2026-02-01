import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useGlobalStore } from "@/zustand/useGlobalStore";

export const updateGlobalSalaryRules = async ({ salaryRules }) => {
  if (!salaryRules) {
    throw new Error("salaryRules are required");
  }

  const deviceMac = useGlobalStore.getState().deviceMac;

  try {
    const response = await apiClient.put(
      getApiUrl(`/salaryRules/update/${deviceMac}`),
      {
        salaryRules,
        deviceMAC: deviceMac,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    throw error;
  }
};

export const createGlobalSalaryRules = async ({ salaryRules }) => {
  if (!salaryRules) {
    throw new Error("salaryRules are required");
  }

  const deviceMac = useGlobalStore.getState().deviceMac;

  try {
    const response = await apiClient.post(getApiUrl("/salaryRules/store"), {
      salaryRules,
      deviceMAC: deviceMac,
    });

    return response.data;
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateGlobalPayPeriod = async ({ payPeriod }) => {
  if (!payPeriod) {
    throw new Error("payPeriod are required");
  }

  const deviceMac = useGlobalStore.getState().deviceMac;

  try {
    const response = await apiClient.put(
      getApiUrl(`/payPeriod/update/${deviceMac}`),
      {
        payPeriod,
        deviceMAC: deviceMac,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    throw error;
  }
};

export const createGlobalPayPeriod = async ({ payPeriod }) => {
  if (!payPeriod) {
    throw new Error("payPeriod are required");
  }

  const deviceMac = useGlobalStore.getState().deviceMac;

  try {
    const response = await apiClient.post(getApiUrl("/payPeriod/store"), {
      payPeriod,
      deviceMAC: deviceMac,
    });

    return response.data;
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    throw error;
  }
};
