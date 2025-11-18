export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PREFIX: import.meta.env.VITE_API_PREFIX,
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT),
};

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}/${cleanEndpoint}`;
};
