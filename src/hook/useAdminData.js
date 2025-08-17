import { useEffect, useState } from "react";
import { useAdminStore } from "../zustand/useAdminStore";
import { useUserData } from "./useUserData";
import axios from "axios";

export const useAdminData = () => {
  const [isLoading, setLoading] = useState(false);
  const { admins, setAdmins } = useAdminStore();
  const { deviceMACs } = useUserData();

  const fetchAdmins = async () => {
    if (!deviceMACs || deviceMACs.length === 0) {
      console.warn("No device MACs available, skipping fetch");
      return;
    }

    setLoading(true);
    try {
      const response = await Promise.all(
        deviceMACs.map((mac) =>
          axios.get(
            `https://grozziie.zjweiting.com:3091/grozziie-attendance/admin/admins-device-map-by-device?mac=${
              mac.deviceMAC ?? mac
            }`
          )
        )
      );
      const data = response.flatMap((res) => res.data);
      setAdmins(data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceMACs && deviceMACs.length > 0) {
      fetchAdmins();
    }
  }, [deviceMACs]);

  return { admins, isLoading, fetchAdmins };
};
