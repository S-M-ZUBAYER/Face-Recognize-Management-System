// QueryProvider.jsx
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import localforage from "localforage";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min fresh
      cacheTime: 1000 * 60 * 60, // 1 hour cache
      refetchOnWindowFocus: false,
    },
  },
});

// Persister using IndexedDB (via localforage)
const persister = {
  persistClient: (client) => localforage.setItem("reactQuery", client),
  restoreClient: () => localforage.getItem("reactQuery"),
  removeClient: () => localforage.removeItem("reactQuery"),
};

export function QueryProvider({ children }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
