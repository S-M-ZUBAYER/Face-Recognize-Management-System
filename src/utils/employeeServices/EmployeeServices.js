import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const createEmployee = async (payload) => {
  try {
    const { data } = await apiClient.post(getApiUrl("/employee/add"), payload);

    return data;
  } catch (error) {
    console.error("❌ Failed to create employee:", error);
    throw error; // let caller handle UI feedback
  }
};

export const deleteEmployee = async ({ mac, id }) => {
  try {
    const { data } = await apiClient.delete(
      getApiUrl(`/employee/delete/${mac}/${id}`),
    );

    return data;
  } catch (error) {
    console.error("❌ Failed to delete employee:", error);
    throw error;
  }
};

export const fetchEmployeeDetails = async ({ employeeId, mac }) => {
  if (!employeeId || !mac) throw new Error("Missing employeeId or mac");

  const data = await apiClient.get(getApiUrl("/employee/by/mac-employeId"), {
    params: { employeeId, mac },
  });
  return data;
};
