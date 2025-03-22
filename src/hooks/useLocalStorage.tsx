import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      // Handle Set type specifically
      if (initialValue instanceof Set) {
        return new Set(parsed) as T;
      }
      return parsed as T;
    } catch (error) {
      // Only log if it's not a JSON parse error for an empty value
      if (error instanceof SyntaxError && window.localStorage.getItem(key) === '') {
        return initialValue;
      }
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Handle Set type specifically
      const valueToSave = valueToStore instanceof Set 
        ? Array.from(valueToStore)
        : valueToStore;
      window.localStorage.setItem(key, JSON.stringify(valueToSave));
    } catch (error) {
      // Only log if it's a meaningful error (not just a storage quota exceeded)
      if (error instanceof Error && error.name !== 'QuotaExceededError') {
        console.error("Error writing to localStorage:", error);
      }
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;


