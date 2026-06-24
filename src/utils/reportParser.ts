import { Vehicle, VehicleEvent } from '../types';

/**
 * Searches pasted or raw text for common vehicle and CARFAX identifiers
 */
export function parseRawReportText(text: string): { vin: string | null; year: number | null; make: string | null; model: string | null } {
  const vinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/i;
  const match = text.match(vinRegex);
  const vin = match ? match[1].toUpperCase() : null;

  // Simple heuristics for year/make/model parsing if in text
  let year: number | null = null;
  const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // Common manufacturing makes
  const makes = ['Hyundai', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Lexus', 'Nissan', 'Kia'];
  let make: string | null = null;
  for (const m of makes) {
    if (new RegExp('\\b' + m + '\\b', 'i').test(text)) {
      make = m;
      break;
    }
  }

  return { vin, year, make, model: make ? 'Model Spec' : null };
}

/**
 * Real-time Decodes VIN via federal NHTSA vPIC API
 */
export async function decodeVinViaNHTSA(vin: string): Promise<Partial<Vehicle>> {
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`);
    if (!res.ok) throw new Error("NHTSA Server offline");
    
    const data = await res.json();
    const result = data.Results?.[0];
    
    if (!result) return {};

    return {
      vin: vin.toUpperCase(),
      year: result.ModelYear ? parseInt(result.ModelYear, 10) : 2018,
      make: result.Make || "Unknown",
      model: result.Model || "Sedan",
      trim: result.Trim || "Base",
      interiorColor: "Premium Charcoal",
      exteriorColor: "Metallic Silver",
      bodyClass: result.BodyClass || "Sedan",
      originalMSRP: 32000,
      currentMileage: 85000,
    };
  } catch (err) {
    console.error("NHTSA decode failed, parsing local fallback", err);
    return {};
  }
}

/**
 * Generates a complete chronological journey based on parsed details
 */
export function generateSmartJourney(vehicleBasics: Partial<Vehicle>): Vehicle {
  const yearsOld = new Date().getFullYear() - (vehicleBasics.year || 2015);
  const totalEventsCount = Math.max(8, Math.min(20, yearsOld * 2));
  
  const vin = vehicleBasics.vin || "KMH12345XYZ678910";
  const year = vehicleBasics.year || 2018;
  const make = vehicleBasics.make || "Toyota";
  const model = vehicleBasics.model || "Camry";
  const trim = vehicleBasics.trim || "SE";

  // Generate synthetic standard service stops around California cities
  const locs = [
    { city: "Downey, CA", lat: 33.9401, lng: -118.1332 },
    { city: "Palmdale, CA", lat: 34.5794, lng: -118.1165 },
    { city: "Tehachapi, CA", lat: 35.1322, lng: -118.4490 },
    { city: "Ridgecrest, CA", lat: 35.6225, lng: -117.6709 }
  ];

  const events: VehicleEvent[] = [];
  
  // 1. Manufacture Event
  events.push({
    id: 1,
    date: `${year}-02-15`,
    owner: 1,
    type: 'manufacture',
    title: `Manufactured & Shipped`,
    mileage: null,
    source: `${make} Motors`,
    location: null,
    coords: { lat: 33.7542, lng: -118.2165 }, // import port
    details: ["Original MSRP: " + (vehicleBasics.originalMSRP ? "$" + vehicleBasics.originalMSRP.toLocaleString() : "$29,500"), "Pre-delivery safety checklist fully completed"],
    severity: 'info'
  });

  // 2. Pre-delivery sale
  events.push({
    id: 2,
    date: `${year}-04-01`,
    owner: 1,
    type: 'sale',
    title: `Pre-delivery dealer prep & First sale`,
    mileage: 15,
    source: `Golden State ${make}`,
    location: "Downey, CA",
    phone: "562-555-0199",
    details: ["Offered for sale", "Registered as Personal vehicle"],
    severity: 'highlight'
  });

  let currentMileage = 15;
  let currentOwner = 1;
  let eventIndex = 3;

  for (let i = 1; i <= totalEventsCount; i++) {
    const ageProgressYears = (i / totalEventsCount) * yearsOld;
    const eventYear = year + Math.floor(ageProgressYears);
    const eventMonth = Math.floor((ageProgressYears % 1) * 12) + 1;
    const dateStr = `${eventYear}-${String(eventMonth).padStart(2, '0')}-15`;
    
    currentMileage += Math.floor(8000 + Math.random() * 6000);
    const loc = locs[i % locs.length];

    if (i === Math.floor(totalEventsCount / 2)) {
      currentOwner = 2;
      events.push({
        id: eventIndex++,
        date: dateStr,
        owner: 2,
        type: 'ownerChange',
        title: `Registration issued to Owner 2`,
        mileage: currentMileage,
        source: `California Motor Vehicle Dept`,
        location: loc.city,
        details: ["Vehicle title transferred", "New owner personal use registration reported"],
        severity: 'highlight'
      });
    } else if (i === Math.floor(totalEventsCount * 0.75)) {
      // Recall alert
      events.push({
        id: eventIndex++,
        date: dateStr,
        owner: currentOwner,
        type: 'recall',
        title: `Manufacturer recall issued`,
        mileage: null,
        source: `${make} Motor Corporation`,
        location: null,
        details: ["ABS fuse and safety hardware rework reported", "Remedy available, pending client booking"],
        severity: 'warning'
      });
    } else if (i === Math.floor(totalEventsCount * 0.85)) {
      // Damage cosmetic scrap
      events.push({
        id: eventIndex++,
        date: dateStr,
        owner: currentOwner,
        type: 'damage',
        title: `Minor cosmetic damage reported`,
        mileage: null,
        source: `Insurance Database`,
        location: null,
        details: ["Minor scrap on right side bodywork report", "Dents and scratches cosmetic level"],
        damageLocations: ["right-side"],
        severity: 'alert'
      });
    } else {
      // Standard Service check
      events.push({
        id: eventIndex++,
        date: dateStr,
        owner: currentOwner,
        type: 'service',
        title: i % 2 === 0 ? `Maintenance & oil change` : `Tire safety check & alignment`,
        mileage: currentMileage,
        source: `${loc.city.split(',')[0]} Auto Service`,
        location: loc.city,
        phone: "661-555-0100",
        rating: 4.5,
        details: ["Safety inspection completed", "Oil and safety fluid checked", "Tires verified"],
        severity: 'good'
      });
    }
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Re-id sequentially to match timeline ascending rule
  const sequentialEvents = events.map((e, idx) => ({ ...e, id: idx + 1 }));

  return {
    id: vin,
    year,
    make,
    model,
    trim,
    vin,
    exteriorColor: vehicleBasics.exteriorColor || "Slate Gray Metallic",
    interiorColor: vehicleBasics.interiorColor || "Midnight Charcoal",
    originalMSRP: vehicleBasics.originalMSRP || 32000,
    currentMileage,
    bodyClass: vehicleBasics.bodyClass || "Sedan",
    summary: {
      damageSeverity: vehicleBasics.summary?.damageSeverity || "Minor",
      carfaxValue: Math.floor(12000 + Math.random() * 9000),
      carfaxValueType: "Retail",
      serviceRecordCount: events.filter(e => e.type === 'service').length,
      openRecalls: events.filter(e => e.type === 'recall').length,
      previousOwners: currentOwner,
      usage: "Personal Vehicle",
      lastOwnedState: "California",
      totalLoss: false,
      structuralDamage: false,
      airbagDeployment: false,
      titleBrandsClean: true
    },
    owners: [
      {
        ownerNumber: 1,
        yearPurchased: year,
        type: "Personal",
        lengthOfOwnership: `${Math.floor(yearsOld / 2)} years`,
        states: ["California"],
        avgMilesPerYear: Math.floor(currentMileage / yearsOld),
        lastOdometer: Math.floor(currentMileage / 2)
      },
      currentOwner > 1 ? {
        ownerNumber: 2,
        yearPurchased: year + Math.floor(yearsOld / 2),
        type: "Personal",
        lengthOfOwnership: `${Math.ceil(yearsOld / 2)} years`,
        states: ["California"],
        avgMilesPerYear: Math.floor(currentMileage / yearsOld),
        lastOdometer: currentMileage
      } : null
    ].filter((o): o is any => o !== null),
    locations: {
      "Downey, CA": { "lat": 33.9401, "lng": -118.1332 },
      "Palmdale, CA": { "lat": 34.5794, "lng": -118.1165 },
      "Tehachapi, CA": { "lat": 35.1322, "lng": -118.4490 },
      "Ridgecrest, CA": { "lat": 35.6225, "lng": -117.6709 }
    },
    events: sequentialEvents
  };
}
