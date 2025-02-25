// interface Location {
//     zip_code: string;
//     latitude: number;
//     longitude: number;
//     city: string;
//     state: string;
//     county: string;
//   }
  
//   interface LocationSearchParams {
//     city?: string;
//     states?: string[];
//     geoBoundingBox?: {
//       top?: Coordinates;
//       left?: Coordinates;
//       bottom?: Coordinates;
//       right?: Coordinates;
//       bottom_left?: Coordinates;
//       top_left?: Coordinates;
//     };
//     size?: number;
//     from?: number;
//   }
  
//   interface Coordinates {
//     lat: number;
//     lon: number;
//   }
  
//   const locationApi = {
//     search: async (params: LocationSearchParams) => {
//       const response = await fetch(`${API_URL}/locations/search`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(params),
//       });
  
//       const data = await response.json();
  
//       return data;
//     },
  
//     get: async (zipCode: string) => {
//       const response = await fetch(`${API_URL}/locations`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify([zipCode]),
//       });
  
//       const data = await response.json();
  
//       return data[0];
//     },
  
//     getMultiple: async (zipCodes: string[]) => {
//       const response = await fetch(`${API_URL}/locations`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(zipCodes),
//       });
  
//       const data = await response.json();
  
//       return data;
//     },
//   };
  
//   export default locationApi;