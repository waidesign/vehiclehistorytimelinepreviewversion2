import { create } from 'zustand';
import { CARFAX_SAMPLE_DATA } from '../data/carfaxSampleData';
import { Vehicle, VehicleEvent } from '../types';

export type TimelineFilter = 'all' | 'service' | 'ownership' | 'damage_recall';

interface TimelineState {
  vehicles: Vehicle[];
  activeVehicleId: string;
  activeEventId: number;
  unlockedVins: string[];
  orientation: 'horizontal' | 'vertical';
  isPlaying: boolean;
  playbackSpeed: 0.5 | 1 | 2;
  filter: TimelineFilter;
  
  // Actions
  setActiveVehicleId: (id: string) => void;
  setActiveEventId: (id: number) => void;
  setOrientation: (orientation: 'horizontal' | 'vertical') => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: 0.5 | 1 | 2) => void;
  setFilter: (filter: TimelineFilter) => void;
  nextEvent: () => void;
  prevEvent: () => void;
  
  // Helper to load uploaded vehicles
  addVehicle: (vehicle: Vehicle) => void;
  unlockPremiumForVin: (vin: string) => void;
  loadSpecialSalvageSample: () => Promise<void>;
}

// Helpers for checking if an event matches a filter category
export function isEventMatchingFilter(evt: VehicleEvent, filter: TimelineFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'service') {
    return evt.type === 'service' || evt.type === 'inspection';
  }
  if (filter === 'ownership') {
    return (
      evt.type === 'manufacture' ||
      evt.type === 'sale' ||
      evt.type === 'listing' ||
      evt.type === 'registration' ||
      evt.type === 'title' ||
      evt.type === 'ownerChange' ||
      evt.type === 'odometer'
    );
  }
  if (filter === 'damage_recall') {
    return evt.type === 'damage' || evt.type === 'accident' || evt.type === 'recall';
  }
  return true;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
  // Load initial unlocked state
  const getInitialUnlockedVins = (): string[] => {
    try {
      const stored = localStorage.getItem('unlocked_premium_vins');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  };

  const unlocked = getInitialUnlockedVins();

  // Load initial vehicles from localStorage if present, or fallback to sample
  const getInitialVehicles = (): Vehicle[] => {
    try {
      const stored = localStorage.getItem('vehicle_garage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((v: Vehicle) => ({
            ...v,
            isPremiumUnlocked: unlocked.includes(v.vin)
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load local garage, using sample", e);
    }
    // Deep clone the sample and attach unlocked state
    const genesis = JSON.parse(JSON.stringify(CARFAX_SAMPLE_DATA));
    genesis.isPremiumUnlocked = unlocked.includes(genesis.vin);
    return [genesis];
  };

  const initialVehicles = getInitialVehicles();

  return {
    vehicles: initialVehicles,
    activeVehicleId: initialVehicles[0].id,
    activeEventId: initialVehicles[0].events[0]?.id || 1,
    unlockedVins: unlocked,
    orientation: 'horizontal',
    isPlaying: false,
    playbackSpeed: 1,
    filter: 'all',

    setActiveVehicleId: (id) => {
      const vehicle = get().vehicles.find(v => v.id === id);
      if (vehicle) {
        set({
          activeVehicleId: id,
          activeEventId: vehicle.events[0]?.id || 1,
          isPlaying: false
        });
      }
    },

    setActiveEventId: (id) => set({ activeEventId: id }),
    
    setOrientation: (orientation) => set({ orientation }),
    
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    
    setFilter: (filter) => set({ filter }),

    nextEvent: () => {
      const { vehicles, activeVehicleId, activeEventId, filter } = get();
      const vehicle = vehicles.find(v => v.id === activeVehicleId);
      if (!vehicle) return;

      const events = vehicle.events;
      const currentIndex = events.findIndex(e => e.id === activeEventId);
      
      // Look for next matching event in chronological order
      let nextIndex = currentIndex + 1;
      while (nextIndex < events.length) {
        if (isEventMatchingFilter(events[nextIndex], filter)) {
          set({ activeEventId: events[nextIndex].id });
          return;
        }
        nextIndex++;
      }
      
      // If we reached the end but there are more matching events, we stay or stop playing
      if (get().isPlaying) {
        set({ isPlaying: false });
      }
    },

    prevEvent: () => {
      const { vehicles, activeVehicleId, activeEventId, filter } = get();
      const vehicle = vehicles.find(v => v.id === activeVehicleId);
      if (!vehicle) return;

      const events = vehicle.events;
      const currentIndex = events.findIndex(e => e.id === activeEventId);
      
      // Look for previous matching event
      let prevIndex = currentIndex - 1;
      while (prevIndex >= 0) {
        if (isEventMatchingFilter(events[prevIndex], filter)) {
          set({ activeEventId: events[prevIndex].id });
          return;
        }
        prevIndex--;
      }
    },

    addVehicle: (vehicle) => {
      set((state) => {
        // Prevent duplicates by checking VIN
        const isUnlocked = state.unlockedVins.includes(vehicle.vin);
        const enriched = { ...vehicle, isPremiumUnlocked: isUnlocked };
        
        const exists = state.vehicles.some(v => v.id === enriched.id);
        const updatedVehicles = exists 
          ? state.vehicles.map(v => v.id === enriched.id ? enriched : v)
          : [...state.vehicles, enriched];
        
        try {
          localStorage.setItem('vehicle_garage', JSON.stringify(updatedVehicles));
        } catch (e) {
          console.error("Local storage error saving vehicle", e);
        }

        return {
          vehicles: updatedVehicles,
          activeVehicleId: enriched.id,
          activeEventId: enriched.events[0]?.id || 1
        };
      });
    },

    unlockPremiumForVin: (vin) => {
      set((state) => {
        const nextUnlocked = [...state.unlockedVins, vin];
        localStorage.setItem('unlocked_premium_vins', JSON.stringify(nextUnlocked));
        
        const updatedVehicles = state.vehicles.map(v => {
          if (v.vin === vin) {
            return { ...v, isPremiumUnlocked: true };
          }
          return v;
        });

        // Also update local storage garage copy
        try {
          localStorage.setItem('vehicle_garage', JSON.stringify(updatedVehicles));
        } catch {}

        return {
          unlockedVins: nextUnlocked,
          vehicles: updatedVehicles
        };
      });
    },

    loadSpecialSalvageSample: async () => {
      try {
        let rawData: any;
        try {
          const res = await fetch('/data/auction-history-sample.json');
          if (res.ok) {
            rawData = await res.json();
          }
        } catch (fetchErr) {
          console.warn("Could not fetch json from server, using local fallback", fetchErr);
        }

        if (!rawData) {
          // Robust static inline fallback so it works instantly regardless of web server router rules
          rawData = {
            "vehicle": {
              "id": "2T1BU4EE3AC509614",
              "year": 2010,
              "make": "Toyota",
              "model": "Corolla",
              "trim": "LE Automatic",
              "vin": "2T1BU4EE3AC509614",
              "currentMileage": 135400,
              "titleBrand": "branded",
              "titleType": "SC (Salvage Certificate)",
              "totalLoss": true,
              "salvage": true
            },
            "auctionRecords": [
              {
                "id": "auc_1",
                "kind": "auction",
                "status": "Sold",
                "date": "2019-12-31",
                "price": 1100,
                "currency": "USD",
                "sellerType": "Insurance Company",
                "location": "Chicago North, IL",
                "coords": { "lat": 42.0354, "lng": -88.2826, "label": "Chicago North auction (IL) — approx." },
                "odometer": 999999,
                "odometerNote": "Broken / unreliable odometer (999,999)",
                "condition": { "runsAndDrives": false, "engineStart": false, "hasKeys": true },
                "primaryDamage": "Front end",
                "secondaryDamage": "Side paint scrape",
                "linkedIncident": { "accidentDate": "2019-12-06", "accidentLocation": "Addison, IL", "totalLossDate": "2019-12-03" },
                "photoCount": 10,
                "photos": [
                  { "id": "p1", "url": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", "category": "exterior", "caption": "Front left 3/4 — visible front damage", "isDamage": true },
                  { "id": "p2", "url": "https://images.unsplash.com/photo-1617469767053-d3b508a0d825?auto=format&fit=crop&q=80&w=800", "category": "damage", "caption": "Front-end close-up — hood, bumper, headlight", "isDamage": true },
                  { "id": "p3", "url": "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&q=80&w=800", "category": "exterior", "caption": "Rear right 3/4 side overview", "isDamage": false },
                  { "id": "p4", "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", "category": "exterior", "caption": "Rear left 3/4 side profile", "isDamage": false },
                  { "id": "p5", "url": "https://images.unsplash.com/photo-1562620644-65ba45aaa8e1?auto=format&fit=crop&q=80&w=800", "category": "interior", "caption": "Front seats / cab compartment", "isDamage": false },
                  { "id": "p6", "url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800", "category": "interior", "caption": "Rear bench seats and roof liner", "isDamage": false },
                  { "id": "p7", "url": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800", "category": "engine", "caption": "Engine bay and front core structure", "isDamage": false },
                  { "id": "p8", "url": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800", "category": "gauges", "caption": "Instrument cluster and clock odometer readings", "isDamage": false },
                  { "id": "p9", "url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800", "category": "interior", "caption": "Center console / transmission selector", "isDamage": false },
                  { "id": "p10", "url": "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800", "category": "docs", "caption": "VIN plate / passenger door b-pillar decal", "isDamage": false }
                ]
              }
            ],
            "salesRecords": []
          };
        }

        const rawVeh = rawData.vehicle;
        const rawAuctions = rawData.auctionRecords || [];

        // Map events representing accident, salvage, and Copart auction listing
        const generatedEvents: VehicleEvent[] = [
          {
            id: 1001,
            date: "2010-06-15",
            owner: 1,
            type: "manufacture",
            title: "Manufactured & shipped to Illinois",
            mileage: null,
            source: "Toyota Motor North America",
            location: null,
            coords: { lat: 38.2527, lng: -85.7585, label: "Toyota plant Kentucky / import routing" },
            details: ["2010 Toyota Corolla LE standard", "Built for US market distribution", "Paint specs: Charcoal Metallic exterior"],
            severity: "info"
          },
          {
            id: 1002,
            date: "2010-08-10",
            owner: 1,
            type: "listing",
            title: "Offered for sale by dealership",
            mileage: 12,
            source: "Chicago Toyota Dealership",
            location: "Chicago, IL",
            phone: "312-555-0199",
            rating: 4.5,
            details: ["Pre-dealership checklist completed", "Tire pressures calibrated"],
            severity: "good"
          },
          {
            id: 1003,
            date: "2010-09-02",
            owner: 1,
            type: "sale",
            title: "Vehicle sold — first owner reported",
            mileage: 23,
            source: "Toyota Dealership Finance",
            location: "Chicago, IL",
            details: ["Registered as personal vehicle", "First title issued in Illinois"],
            severity: "highlight"
          },
          {
            id: 1004,
            date: "2015-10-15",
            owner: 1,
            type: "service",
            title: "Regular service & brake fluid",
            mileage: 62400,
            source: "Addisons Auto Services",
            location: "Addison, IL",
            details: ["Engine coolant flushed", "Brakes inspected and serviced", "Oil and filter changed"],
            severity: "good"
          },
          {
            id: 1005,
            date: "2019-12-06",
            owner: 1,
            type: "accident",
            title: "Severe accident reported — frontend collision",
            mileage: 122400,
            source: "Illinois State Highway Patrol",
            location: "Addison, IL",
            coords: { lat: 41.9317, lng: -87.9887, label: "Addison accident zone (IL)" },
            details: [
              "Collision with another motor vehicle",
              "Front-end impact of severe scale",
              "Airbags reported deployed",
              "Vehicle towed from scene"
            ],
            damageLocations: ["front-end"],
            severity: "alert"
          },
          {
            id: 1006,
            date: "2019-12-15",
            owner: 1,
            type: "title",
            title: "Salvage certificate issued (Total Loss)",
            mileage: null,
            source: "Illinois DMV Office",
            location: "Springfield, IL",
            details: ["Insurance declared structural vehicle total loss", "Salvage certificate brand issued", "Titled or registered in Illinois"],
            severity: "alert"
          },
          {
            id: 1007,
            date: "2019-12-31",
            owner: 1,
            type: "sale",
            title: "Salvage auction sold at Copart Chicago North",
            mileage: 999999,
            source: "Copart Chicago North, IL",
            location: "Chicago North, IL",
            coords: { lat: 42.0354, lng: -88.2826, label: "Copart Chicago North (IL)" },
            details: [
              "Insurance salvage listing sold for rebuild",
              "Winning bid price: $1,100 USD",
              "Condition: Runs & Drives: No, Keys: Yes, Engine Start: No",
              "Odometer flagged: BROKEN / unreliable (999,999)"
            ],
            severity: "alert"
          }
        ];

        const specialCorolla: Vehicle = {
          id: rawVeh.id,
          year: rawVeh.year,
          make: rawVeh.make,
          model: rawVeh.model,
          trim: rawVeh.trim,
          vin: rawVeh.vin,
          currentMileage: rawVeh.currentMileage,
          owners: [
            {
              ownerNumber: 1,
              yearPurchased: 2010,
              type: "Personal",
              lengthOfOwnership: "9 yrs 10 mo",
              states: ["Illinois"],
              avgMilesPerYear: 12500,
              lastOdometer: 122400
            }
          ],
          summary: {
            damageSeverity: "Severe",
            carfaxValue: 3450,
            carfaxValueType: "Retail",
            serviceRecordCount: 4,
            openRecalls: 0,
            previousOwners: 1,
            usage: "Personal Vehicle",
            lastOwnedState: "Illinois",
            totalLoss: true,
            structuralDamage: true,
            airbagDeployment: true,
            odometerRollback: false,
            titleBrandsClean: false
          },
          locations: {
            "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
            "Addison, IL": { lat: 41.9317, lng: -87.9887 },
            "Chicago North, IL": { lat: 42.0354, lng: -88.2826 }
          },
          events: generatedEvents,
          auctionHistory: rawAuctions,
          isPremiumUnlocked: get().unlockedVins.includes(rawVeh.vin)
        };

        // Add to garage & set active
        get().addVehicle(specialCorolla);
        get().setActiveVehicleId(specialCorolla.id);
        
      } catch (err) {
        console.error("Failed to load special salvage Corolla", err);
      }
    }
  };
});
