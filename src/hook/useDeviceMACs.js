// Improved: hooks/useDeviceMACs.js
import { useState, useEffect, useCallback } from "react";

export const useDeviceMACs = () => {
  const [deviceMACs, setDeviceMACs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("deviceMACs");
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceMACs(Array.isArray(parsed) ? parsed : []);
      } else {
        setDeviceMACs([]);
      }
    } catch (err) {
      console.error("❌ Failed to read deviceMACs from localStorage:", err);
      setError(err);
      setDeviceMACs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Safe setter function
  const setDeviceMACsSafe = useCallback((newMACs) => {
    try {
      const safeMACs = Array.isArray(newMACs) ? newMACs : [];
      setDeviceMACs(safeMACs);
      localStorage.setItem("deviceMACs", JSON.stringify(safeMACs));
      setError(null);
    } catch (err) {
      console.error("❌ Failed to write deviceMACs to localStorage:", err);
      setError(err);
    }
  }, []);

  return {
    deviceMACs,
    setDeviceMACs: setDeviceMACsSafe,
    error,
    isLoading,
  };
};
