import { useEffect } from "react";
import { useAdminStore } from "../zustand/useAdminStore";
import { useUserData } from "./useUserData";
import axios from "axios";

export const useAdminData = () => {
  const { admins, setAdmins } = useAdminStore();
  const { deviceMACs } = useUserData();

  const fetchAdmins = async () => {
    try {
      const response = await Promise.all(
        deviceMACs.map((mac) =>
          axios.get(
            `https://grozziie.zjweiting.com:3091/grozziie-attendance/admin/admins-device-map-by-device?mac=${mac.deviceMAC}`
          )
        )
      );
      const data = response.flatMap((res) => res.data);
      setAdmins(data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return { admins, fetchAdmins };
};
