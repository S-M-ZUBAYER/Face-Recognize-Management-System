import { useQuery } from "@tanstack/react-query";

export const useUserData = () => {
  const fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedDeviceMACs = localStorage.getItem("deviceMACs");

      let parsedUser = null;
      let parsedDeviceMACs = [];

      if (storedUser) {
        parsedUser = JSON.parse(storedUser);
      }
      if (storedDeviceMACs) {
        parsedDeviceMACs = JSON.parse(storedDeviceMACs);
      }

      return { user: parsedUser, deviceMACs: parsedDeviceMACs };
    } catch (err) {
      console.error("Failed to parse from localStorage:", err);
      throw err;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  return {
    user: data?.user ?? null,
    deviceMACs: data?.deviceMACs ?? [],
    loading: isLoading,
    error: isError,
  };
};
