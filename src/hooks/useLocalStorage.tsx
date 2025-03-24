import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);

      // Return initialValue if item is null, undefined, or empty string
      if (!item) return initialValue;

      // Handle Set type specifically
      if (initialValue instanceof Set) {
        try {
          const parsed = JSON.parse(item);
          return new Set(Array.isArray(parsed) ? parsed : []) as T;
        } catch {
          return new Set() as T;
        }
      }

      // For other types, try to parse the JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // If parsing fails, return initialValue
        return initialValue;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Handle Set type specifically
      const valueToSave =
        valueToStore instanceof Set ? Array.from(valueToStore) : valueToStore;

      if (valueToSave === null || valueToSave === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToSave));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
