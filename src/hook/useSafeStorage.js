// Create: hooks/useSafeStorage.js
import { useState, useEffect } from "react";

export const useSafeStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      } else {
        setValue(defaultValue);
      }
    } catch (err) {
      console.error(`❌ Failed to read from localStorage key "${key}":`, err);
      setError(err);
      setValue(defaultValue);
    }
  }, [key, defaultValue]);

  const setStorageValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setError(null);
    } catch (err) {
      console.error(`❌ Failed to write to localStorage key "${key}":`, err);
      setError(err);
    }
  };

  return [value, setStorageValue, error];
};
