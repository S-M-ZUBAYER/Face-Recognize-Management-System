import { useQuery } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";

export const useUserData = (values) => {
  const { deviceMACs: storedMACs, setDeviceMACs } = useDeviceMACs();

  const fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      let parsedUser = storedUser ? JSON.parse(storedUser) : null;
      let parsedDeviceMACs = storedMACs || [];

      if (values?.userEmail) {
        const response = await apiClient.get(getApiUrl("/admin/admin-info"), {
          params: { email: values.userEmail },
        });
        const userInfo = response.data;

        if (userInfo?.id) {
          const deviceMACs =
            userInfo.devices?.map((device) => ({
              deviceMAC: device.deviceMAC,
              deviceName: device.deviceName,
            })) ?? [];

          localStorage.setItem("user", JSON.stringify(userInfo));
          setDeviceMACs(deviceMACs);

          parsedUser = userInfo;
          parsedDeviceMACs = deviceMACs;
        }
      }

      return { user: parsedUser, deviceMACs: parsedDeviceMACs };
    } catch (err) {
      console.error("Failed to load user data:", err);
      throw err;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["userData", values?.userEmail],
    queryFn: fetchUserData,
    staleTime: 0,
    cacheTime: 0,
  });

  return {
    user: data?.user ?? null,
    deviceMACs: data?.deviceMACs ?? [],
    loading: isLoading,
    error: isError,
    refreshUserData: refetch,
  };
};
