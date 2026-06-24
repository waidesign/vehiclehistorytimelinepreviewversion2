export type EventType =
  | 'manufacture'
  | 'sale'
  | 'listing'
  | 'service'
  | 'registration'
  | 'title'
  | 'recall'
  | 'damage'
  | 'inspection'
  | 'accident'
  | 'ownerChange'
  | 'odometer';

export type Severity = 'info' | 'good' | 'highlight' | 'warning' | 'alert';

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface VehicleEvent {
  id: number;
  date: string;            // ISO yyyy-mm-dd
  owner: number;           // owner index
  type: EventType;
  title: string;           // short, glanceable headline
  mileage: number | null;
  source: string;          // dealer / DMV / manufacturer
  location: string | null; // "City, ST"
  coords?: GeoPoint;       // resolved for the map
  phone?: string;
  rating?: number;
  details: string[];       // bullet specifics
  severity: Severity;
  damageLocations?: string[]; // e.g. ["right-rear","right-side"]
}

export interface OwnerInfo {
  ownerNumber: number;
  yearPurchased: number;
  type: string;
  lengthOfOwnership: string;
  states: string[];
  avgMilesPerYear: number | null;
  lastOdometer: number;
}

export type MediaCategory = 'exterior' | 'damage' | 'interior' | 'engine' | 'gauges' | 'docs' | 'other';

export interface VehiclePhoto {
  id: string;
  url: string;              // provider CDN URL
  thumbUrl?: string;        // smaller variant if provided
  category: MediaCategory;  // from API tags if available, else inferred
  caption?: string;
  isDamage?: boolean;       // emphasize on the map/incident link
  width?: number;
  height?: number;
}

export interface AuctionSalesRecord {
  id: string;
  kind: 'auction' | 'sale';
  status?: string;          // e.g. "Sold"
  date: string;             // ISO
  price?: number;
  currency?: string;
  sellerType?: string;
  location?: string;
  coords?: GeoPoint;
  odometer?: number;
  odometerNote?: string;
  condition?: { runsAndDrives?: boolean; engineStart?: boolean; hasKeys?: boolean };
  primaryDamage?: string;
  secondaryDamage?: string;
  exportedTo?: string | null;
  linkedIncident?: { accidentDate?: string; accidentLocation?: string; totalLossDate?: string };
  photoCount: number;
  photos: VehiclePhoto[];
}

export interface Vehicle {
  id: string; // VIN or custom ID
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  exteriorColor?: string;
  interiorColor?: string;
  originalMSRP?: number;
  currentMileage: number;
  bodyClass?: string;
  manufacturedOrigin?: { label: string; lat: number; lng: number };
  summary: {
    damageSeverity: 'None' | 'Minor' | 'Moderate' | 'Severe';
    carfaxValue?: number;
    carfaxValueType?: string;
    serviceRecordCount: number;
    openRecalls: number;
    previousOwners: number;
    usage: string;
    lastOwnedState: string;
    totalLoss?: boolean;
    structuralDamage?: boolean;
    airbagDeployment?: boolean;
    odometerRollback?: boolean;
    titleBrandsClean?: boolean;
  };
  owners: OwnerInfo[];
  locations?: Record<string, { lat: number; lng: number }>;
  events: VehicleEvent[];
  auctionHistory?: AuctionSalesRecord[];
  isPremiumUnlocked?: boolean;
}
