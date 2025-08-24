// import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserData } from "./useUserData";
// import { useAdminStore } from "../zustand/useAdminStore";

export const useAdminData = () => {
  const { deviceMACs } = useUserData();
  // const { admins, setAdmins } = useAdminStore();

  const fetchAdmins = async () => {
    if (!deviceMACs || deviceMACs.length === 0) return [];
    const response = await Promise.all(
      deviceMACs.map((mac) =>
        axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance/admin/admins-device-map-by-device`,
          { params: { mac: mac.deviceMAC ?? mac } }
        )
      )
    );
    return response.flatMap((res) => res.data);
  };

  const {
    data: admins = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admins", deviceMACs],
    queryFn: fetchAdmins,
    enabled: !!deviceMACs && deviceMACs.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });

  // Sync React Query data into Zustand
  // useEffect(() => {
  //   if (queryAdmins.length > 0) {
  //     setAdmins(queryAdmins);
  //   }
  // }, [queryAdmins, setAdmins]);

  return {
    admins,
    isLoading,
    error,
    refetch,
  };
};
