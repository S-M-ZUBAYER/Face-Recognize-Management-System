import { useQuery } from "@tanstack/react-query";

export const useUserData = (values) => {
  const fetchUserData = async () => {
    try {
      //  Read from localStorage
      const storedUser = localStorage.getItem("user");
      const storedDeviceMACs = localStorage.getItem("deviceMACs");

      let parsedUser = storedUser ? JSON.parse(storedUser) : null;
      let parsedDeviceMACs = storedDeviceMACs
        ? JSON.parse(storedDeviceMACs)
        : [];

      //  If we have an email, fetch latest from API
      if (values?.userEmail) {
        const response = await fetch(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/admin/admin-info?email=${values.userEmail}`
        );
        const userInfo = await response.json();

        if (userInfo?.id) {
          // Format deviceMACs
          const deviceMACs =
            userInfo.devices?.map((device) => ({
              deviceMAC: device.deviceMAC,
              deviceName: device.deviceName,
            })) ?? [];

          // Update localStorage with fresh values
          localStorage.setItem("user", JSON.stringify(userInfo));
          localStorage.setItem("deviceMACs", JSON.stringify(deviceMACs));

          // Overwrite parsed values with latest
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
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 0, // 👈 always check for fresh data on mount
    cacheTime: 0,
  });

  return {
    user: data?.user ?? null,
    deviceMACs: data?.deviceMACs ?? [],
    loading: isLoading,
    error: isError,
    refreshUserData: refetch, // 👈 expose refetch for manual refresh if needed
  };
};
