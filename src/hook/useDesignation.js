import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useDeviceMACs } from "./useDeviceMACs";
import apiClient from "@/config/apiClient";
import { getApiUrl } from "@/config/config";
import { INFINITE_QUERY_CONFIG } from "./queryConfig";
import convertDeviceArray from "@/lib/convertDeviceArray";
import extractDepartments from "@/lib/extractDepartments";

export const useDesignation = () => {
  const queryClient = useQueryClient();
  const { deviceMACs, isLoading: macsLoading } = useDeviceMACs();

  const convertMACs = convertDeviceArray(deviceMACs);

  const designationQueries = useQueries({
    queries: convertMACs.map((mac) => ({
      queryKey: ["designation", mac.macInt],
      queryFn: async () => {
        try {
          const res = await apiClient.get(
            getApiUrl(`/department/by-departmentId/${mac.macInt}`)
          );

          const resData = res.data;

          // Add safe JSON parsing with error handling
          try {
            return [
              {
                department: JSON.parse(resData.department || "{}"),
                designation: JSON.parse(resData.designation || "{}"),
              },
            ];
          } catch (parseError) {
            console.error(
              `❌ Failed to parse department data for ${mac.macInt}:`,
              parseError
            );
            return [
              {
                department: {},
                designation: {},
              },
            ];
          }
        } catch (error) {
          console.error(
            `❌ Failed to fetch designation data for ${mac.macInt}:`,
            error
          );
          // Return empty structure instead of failing
          return [
            {
              department: {},
              designation: {},
            },
          ];
        }
      },
      ...INFINITE_QUERY_CONFIG,
      enabled: convertMACs.length > 0 && !macsLoading,
    })),
  });

  const designationApiResponse = designationQueries
    .map((q) => q.data)
    .filter(Boolean)
    .flat();

  const designation = extractDepartments(designationApiResponse);

  // ✅ Manual refresh
  const refresh = () => {
    convertMACs.forEach((mac) =>
      queryClient.invalidateQueries({
        queryKey: ["designation", mac.macInt],
        exact: true,
      })
    );
  };

  const isLoading = designationQueries.some((q) => q.isLoading) || macsLoading;
  const isError = designationQueries.some((q) => q.isError);
  const isFetching = designationQueries.some((q) => q.isFetching);

  return {
    designation,
    isLoading,
    isError,
    isFetching,
    refetch: refresh,
    convertMACs,
  };
};
