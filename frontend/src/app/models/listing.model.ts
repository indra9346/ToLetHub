export interface LocationPoint {
  type: 'Point';
  coordinates: number[]; // [longitude, latitude]
}

export interface Listing {
  _id?: string;
  id?: string; // fallback
  owner?: string | { _id: string; name: string; email: string; phone: string };
  title: string;
  propertyType: 'PG' | 'Room' | 'House';
  description: string;
  rent: number;
  deposit: number;
  address: string;
  city: string;
  locality: string;
  location: LocationPoint;
  latitude?: number;  // UI helpers
  longitude?: number; // UI helpers
  contactName: string;
  contactPhone: string;
  availableFrom: string | Date;
  images: string[];
  videoUrl?: string;
  amenities: string[];
  foodAvailability: boolean;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  genderPreference: 'boys' | 'girls' | 'any';
  roomSharingType: 'private' | '2-sharing' | '3-sharing' | '4+-sharing' | 'none';
  status: 'available' | 'unavailable';
  distance?: number; // dynamic computed value relative to user location
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingSearchResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Listing[];
}
