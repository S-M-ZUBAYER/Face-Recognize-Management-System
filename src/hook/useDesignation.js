import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import convertDeviceArray from "@/lib/convertDeviceArray";
import extractDepartments from "@/lib/extractDepartments";

export const useDesignation = () => {
  const queryClient = useQueryClient();
  const deviceMACs = JSON.parse(localStorage.getItem("deviceMACs") || "[]");

  const convertMACs = convertDeviceArray(deviceMACs);

  const designationQueries = useQueries({
    queries: convertMACs.map((mac) => ({
      queryKey: ["designation", mac.macInt],
      queryFn: async () => {
        const res = await axios.get(
          `https://grozziie.zjweiting.com:3091/grozziie-attendance-debug/department/by-departmentId/${mac.macInt}`
        );

        const resData = res.data;

        return [
          {
            department: JSON.parse(resData.department),
            designation: JSON.parse(resData.designation),
          },
        ];
      },
      //   staleTime: Infinity,
      //   cacheTime: Infinity,
      //   refetchOnWindowFocus: false,
      //   refetchOnReconnect: false,
    })),
  });

  const designationApiResponse = designationQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const designation = extractDepartments(designationApiResponse);

  // ✅ Manual refresh: now matches queryKey
  const refresh = () => {
    convertMACs.forEach((mac) =>
      queryClient.invalidateQueries(["designation", mac.macInt])
    );
  };

  return {
    designation,
    isLoading: designationQueries.some((q) => q.isLoading),
    refetch: refresh,
    convertMACs,
  };
};
