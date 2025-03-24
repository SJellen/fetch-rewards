import React from "react";

export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  breed: string;
  zip_code: string;
  location: string;
  isFavorite?: boolean;
}

export interface SearchResult {
  resultIds: string[];
  total: number;
}

export interface SearchParams {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: number;
  sort?: string;
}

export interface SearchFormProps {
  breeds: string[];
  breedFilter: string | null;
  setBreedFilter: React.Dispatch<React.SetStateAction<string | null>>;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: string;
  onSearch: (params: SearchParams) => Promise<void>;
}

export interface SearchResultsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalResults: number;
}

export interface CardsProps {
  cards: Dog[];
  favorites: Set<string>;
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface HeaderProps {
  isLoggedIn: boolean;
  favorites: Set<string>;
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResult | null>>;
  handleFavoritesClick: () => void;
  userName: string | null;
  handleLogout: () => void;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

export interface LocationSearchParams {
  city?: string;
  states?: string[];
  zipCodes?: string[];
  geoBoundingBox?: {
    top?: Coordinates;
    left?: Coordinates;
    bottom?: Coordinates;
    right?: Coordinates;
    bottom_left?: Coordinates;
    top_right?: Coordinates;
    bottom_right?: Coordinates;
    top_left?: Coordinates;
  };
  size?: number;
  from?: number;
}

export interface LocationSearchResult {
  results: Location[];
  total: number;
}

export interface State {
  abbreviation: string;
  name: string;
}
