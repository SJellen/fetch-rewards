import React, { useState } from 'react';
import { LocationSearchParams } from '../api/types';
import { states } from '../data/states';

interface LocationFilterProps {
  onLocationFilter: (params: LocationSearchParams) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationFilter }) => {
  const [city, setCity] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStates(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: LocationSearchParams = {
      city: city || undefined,
      states: selectedStates.length > 0 ? selectedStates : undefined,
    };
    onLocationFilter(params);
  };

  return (
    <div className="bg-black p-4 rounded-lg shadow-md text-white">
      <h3 className="text-lg font-semibold mb-4">Filter by Location</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-white">
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={handleCityChange}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#510359] focus:ring-[#510359]"
            placeholder="Enter city name"
          />
        </div>

        <div>
          <label htmlFor="states" className="block text-sm font-medium text-white">
            States
          </label>
          <select
            id="states"
            multiple
            value={selectedStates}
            onChange={handleStateChange}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#510359] focus:ring-[#510359]"
          >
            {states.map((state) => (
              <option key={state.abbreviation} value={state.abbreviation}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#510359] text-white py-2 px-4 rounded-md hover:bg-[#3a023f] focus:outline-none focus:ring-2 focus:ring-[#510359] focus:ring-offset-2"
        >
          Apply Location Filter
        </button>
      </form>
    </div>
  );
};

export default LocationFilter; 