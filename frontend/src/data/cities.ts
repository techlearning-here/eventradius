export interface City {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  { name: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164 },
  { name: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  { name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
  { name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
  { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  { name: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
  { name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
  { name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
  { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
  { name: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
  { name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
  { name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
  { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 },
  { name: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
  { name: 'Honolulu', state: 'HI', lat: 21.3069, lng: -157.8583 },
  { name: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959 },
  { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910 },
  { name: 'St. Louis', state: 'MO', lat: 38.6270, lng: -90.1994 },
  { name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  { name: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
];

export const CATEGORIES = [
  { id: 'kids-family', label: 'Kids & Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'arts-culture', label: 'Arts & Culture', emoji: '🎨' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'social', label: 'Social', emoji: '🎉' },
  { id: 'classes', label: 'Classes', emoji: '📚' },
  { id: 'community', label: 'Community', emoji: '🏘️' },
];

export const AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
];

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];
