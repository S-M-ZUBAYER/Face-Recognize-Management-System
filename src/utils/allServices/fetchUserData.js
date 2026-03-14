import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { useUserStore } from "@/zustand/useUserStore";

export const fetchUserData = async () => {
  const { setDeviceMACs } = useUserStore.getState();

  try {
    // 1️⃣ Load cached data first
    const storedUser = localStorage.getItem("user");

    let parsedUser = storedUser ? JSON.parse(storedUser) : null;
    // let parsedDeviceMACs = [];

    // If Zustand already has MACs, prefer them
    if (typeof setDeviceMACs !== "function") {
      console.warn("setDeviceMACs is not provided");
    }

    // 2️⃣ Fetch fresh user data if email exists
    if (parsedUser.userEmail) {
      const response = await apiClient.get(getApiUrl("/admin/admin-info"), {
        params: { email: parsedUser.userEmail },
      });

      const userInfo = response.data;
      //   console.log("Fetched user info:", userInfo);

      if (userInfo?.id) {
        const deviceMACs =
          userInfo.devices?.map((device) => ({
            deviceMAC: device.deviceMAC,
            deviceName: device.deviceName,
            deviceDescription: device.deviceDescription,
          })) ?? [];

        // Persist
        // localStorage.setItem("user", JSON.stringify(userInfo));

        // Sync to Zustand
        if (typeof setDeviceMACs === "function") {
          //   console.log(deviceMACs);
          setDeviceMACs(deviceMACs);
        }

        parsedUser = userInfo;
        // parsedDeviceMACs = deviceMACs;
      }
    }

    // return {
    //   user: parsedUser,
    //   deviceMACs: parsedDeviceMACs,
    // };
  } catch (error) {
    console.error("❌ Failed to load user data:", error);
    throw error;
  }
};
