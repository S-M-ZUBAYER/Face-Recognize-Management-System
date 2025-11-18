// Create: hooks/queryConfig.js
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: false,
};

export const INFINITE_QUERY_CONFIG = {
  ...DEFAULT_QUERY_CONFIG,
  staleTime: Infinity,
  cacheTime: Infinity,
};

export const ALWAYS_FRESH_CONFIG = {
  ...DEFAULT_QUERY_CONFIG,
  staleTime: 0,
  cacheTime: 0,
  refetchOnMount: true,
};
