import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(`Retrieving value from local storage: ${item}`);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      // Handle Set type specifically
      if (initialValue instanceof Set) {
        console.log('Reconstructing Set from:', parsed);
        return new Set(parsed) as T;
      }
      return parsed as T;
    } catch (error) {
      console.error("Error reading from localStorage", error);
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
      
      console.log('Saving to localStorage:', valueToSave);
      window.localStorage.setItem(key, JSON.stringify(valueToSave));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;


