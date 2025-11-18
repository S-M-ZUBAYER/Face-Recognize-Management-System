// Create: hooks/useSafeQuery.js
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_QUERY_CONFIG } from "./queryConfig";

export const useSafeQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(`Query failed for key ${queryKey}:`, error);
        throw error;
      }
    },
    ...DEFAULT_QUERY_CONFIG,
    ...options,
  });
};
