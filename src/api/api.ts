import {  LocationSearchParams, LocationSearchResult } from "./types";

export const API_URL = "https://frontend-take-home-service.fetch.com";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1s delay

const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        console.warn(`🚨 Rate limited. Retrying in ${delay}ms... (Attempt ${attempt + 1})`);
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1))); // Exponential backoff
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.message || "Request failed"}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(`🚨 Request failed after ${retries} retries:`, error);
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch data"); // Should never reach here
};


const api = {
  login: async (name: string, email: string) => {
    return fetchWithRetry(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      credentials: "include",
      body: JSON.stringify({ name, email }),
    });
  },

  logout: async () => {
    return fetchWithRetry(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  getBreeds: async () => {
    return fetchWithRetry<string[]>(`${API_URL}/dogs/breeds`, {
      method: "GET",
      credentials: "include",
    });
  },

  searchDogs: async (params: {
    breeds?: string[];
    zipCodes?: string[];
    ageMin?: number;
    ageMax?: number;
    size?: number;
    from?: number;
    sort?: string;
  }) => {
    const queryString = new URLSearchParams();

    if (params.breeds?.length === 1) {
      queryString.set("breeds", params.breeds[0]);
    }

    if (params.zipCodes?.length) {
      params.zipCodes.forEach((zip) => queryString.append("zipCodes", zip));
    }

    if (params.ageMin !== undefined) queryString.append("ageMin", String(params.ageMin));
    if (params.ageMax !== undefined) queryString.append("ageMax", String(params.ageMax));
    if (params.size !== undefined) queryString.append("size", String(params.size));
    if (params.from !== undefined) queryString.append("from", String(params.from));

    if (params.sort && (params.sort === "asc" || params.sort === "desc")) {
      queryString.append("sort", `name:${params.sort}`);
    }

    const url = `${API_URL}/dogs/search?${queryString.toString()}`;

    return fetchWithRetry(url, {
      method: "GET",
      credentials: "include",
    });
  },

  getDogs: async (ids: string[]) => {
    return fetchWithRetry(`${API_URL}/dogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(ids),
    });
  },

  searchLocations: async (params: LocationSearchParams) => {
    return fetchWithRetry<LocationSearchResult>(`${API_URL}/locations/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });
  },

  getLocations: async (zipCodes: string[]) => {
    return fetchWithRetry<Location[]>(`${API_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(zipCodes),
    });
  },

  matchDogs: async (dogIds: string[]) => {
    return fetchWithRetry<{ match: string }>(`${API_URL}/dogs/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(dogIds),
    });
  },
};

export default api;
