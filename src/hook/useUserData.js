import { useUserStore } from "@/zustand/useUserStore";
import { useEffect, useState } from "react";

export const useUserData = () => {
  const { user, setUser, deviceMACs, setDeviceMACs } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedDeviceMACs = localStorage.getItem("deviceMACs");
      if (storedDeviceMACs) {
        const parsedDeviceMACs = JSON.parse(storedDeviceMACs);
        setDeviceMACs(parsedDeviceMACs);
      }
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, [setUser, setDeviceMACs]);

  return {
    user,
    deviceMACs,
    loading,
  };
};
