// import { Dog } from './dog';
// import { Location } from './location';

// interface SearchParams {
//   breeds?: string[];
//   zipCodes?: string[];
//   ageMin?: number;
//   ageMax?: number;
//   size?: number;
//   from?: number;
//   sort?: string;
// }

// interface LocationSearchParams {
//   city?: string;
//   states?: string[];
//   geoBoundingBox?: {
//     top?: Coordinates;
//     left?: Coordinates;
//     bottom?: Coordinates;
//     right?: Coordinates;
//     bottom_left?: Coordinates;
//     top_left?: Coordinates;
//   };
//   size?: number;
//   from?: number;
// }

// interface Coordinates {
//   lat: number;
//   lon: number;
// }

// const searchApi = {
//   searchDogs: async (params: SearchParams) => {
//     const response = await fetch(`${API_URL}/dogs/search`, {
//       method: 'GET',
//       params,
//     });

//     const data = await response.json();

//     return data;
//   },

//   searchLocations: async (params: LocationSearchParams) => {
//     const response = await fetch(`${API_URL}/locations/search`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(params),
//     });

//     const data = await response.json();

//     return data;
//   },
// };

// export default searchApi;