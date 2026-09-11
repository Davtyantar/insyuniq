export type CategorySlug = "real-estate" | "cars" | "rentals" | "hotels";

export type SellerType = "owner" | "agency" | "dealer" | "private";

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  type: SellerType;
  registeredAt: string;
  rating: number;
  reviews: number;
  listingsCount: number;
  phone: string;
  responseTime: string;
  online: boolean;
}

export interface BaseListing {
  id: string;
  category: CategorySlug;
  subcategory: string;
  title: string;
  price: number;
  city: string;
  district?: string;
  address: string;
  images: string[];
  description: string;
  publishedAt: string;
  sellerId: string;
  verified: boolean;
  urgent: boolean;
  views: number;
  status: "active" | "archived";
  coords: { lat: number; lng: number };
}

export type RealEstateSubcategory =
  | "apartments"
  | "houses"
  | "garages"
  | "new-buildings"
  | "commercial"
  | "land";

export type DealType = "sale" | "rent";
export type RealEstateCondition = "euro" | "good" | "renovated" | "needs-repair" | "shell";
export type BuildingType = "new" | "secondary";

export interface RealEstateListing extends BaseListing {
  category: "real-estate";
  subcategory: RealEstateSubcategory;
  deal: DealType;
  rooms: number;
  area: number;
  landArea?: number;
  floor?: number;
  totalFloors?: number;
  condition: RealEstateCondition;
  buildingType: BuildingType;
  buildYear?: number;
  ceilingHeight?: number;
  bathrooms: number;
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
}

export type CarSubcategory =
  | "passenger"
  | "suv"
  | "electric"
  | "trucks"
  | "moto"
  | "parts";

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "gas";
export type Transmission = "automatic" | "manual" | "robot" | "variator";
export type DriveType = "fwd" | "rwd" | "awd";
export type BodyType =
  | "sedan"
  | "hatchback"
  | "suv"
  | "crossover"
  | "wagon"
  | "coupe"
  | "minivan"
  | "pickup"
  | "van";
export type CarCondition = "new" | "used";
export type Steering = "left" | "right";

export interface CarListing extends BaseListing {
  category: "cars";
  subcategory: CarSubcategory;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  bodyType: BodyType;
  fuel: FuelType;
  engineVolume: number;
  transmission: Transmission;
  drive: DriveType;
  color: string;
  condition: CarCondition;
  steering: Steering;
  owners: number;
  accidentFree: boolean;
  customsCleared: boolean;
  power: number;
}

export type RentalSubcategory = "apartments" | "houses" | "commercial" | "garages";
export type RentalTerm = "daily" | "long";

export interface RentalListing extends BaseListing {
  category: "rentals";
  subcategory: RentalSubcategory;
  term: RentalTerm;
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  bathrooms: number;
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
}

export type HotelSubcategory = "hotels" | "guesthouses" | "houses" | "cottages" | "daily-houses";

export interface HotelListing extends BaseListing {
  category: "hotels";
  subcategory: HotelSubcategory;
  term: RentalTerm;
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  bathrooms: number;
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
  pool: boolean;
}

export type Listing = RealEstateListing | CarListing | RentalListing | HotelListing;

export function isRealEstate(listing: Listing): listing is RealEstateListing {
  return listing.category === "real-estate";
}

export function isCar(listing: Listing): listing is CarListing {
  return listing.category === "cars";
}

export function isRental(listing: Listing): listing is RentalListing {
  return listing.category === "rentals";
}

export function isHotelStay(listing: Listing): listing is HotelListing {
  return listing.category === "hotels";
}

export type SortKey =
  | "relevant"
  | "date-desc"
  | "price-asc"
  | "price-desc"
  | "area-desc"
  | "mileage-asc"
  | "year-desc";

export interface CommonFilters {
  q: string;
  city: string;
  priceMin: string;
  priceMax: string;
  withPhoto: boolean;
  verifiedOnly: boolean;
}

export interface RealEstateFilters extends CommonFilters {
  subcategory: string;
  deal: DealType | "";
  district: string;
  rooms: string[];
  areaMin: string;
  areaMax: string;
  floorMin: string;
  floorMax: string;
  totalFloorsMin: string;
  condition: string[];
  buildingType: BuildingType | "";
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
}

export interface CarFilters extends CommonFilters {
  subcategory: string;
  brand: string;
  model: string;
  yearMin: string;
  yearMax: string;
  mileageMin: string;
  mileageMax: string;
  bodyType: string[];
  fuel: string[];
  engineMin: string;
  engineMax: string;
  transmission: string[];
  drive: string[];
  color: string;
  condition: CarCondition | "";
  steering: Steering | "";
  ownersMax: string;
  accidentFree: boolean;
}

export interface RentalFilters extends CommonFilters {
  subcategory: string;
  term: RentalTerm | "";
  rooms: string[];
  areaMin: string;
  areaMax: string;
}

export interface HotelFilters extends CommonFilters {
  subcategory: string;
  term: RentalTerm | "";
  rooms: string[];
  areaMin: string;
  areaMax: string;
  pool: "" | "yes" | "no";
}

export type AnyFilters = RealEstateFilters | CarFilters | RentalFilters | HotelFilters;

export type ViewMode = "grid" | "list";
