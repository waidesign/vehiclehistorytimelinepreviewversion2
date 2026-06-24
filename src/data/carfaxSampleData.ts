import { Vehicle } from '../types';

export const CARFAX_SAMPLE_DATA: Vehicle = {
  "id": "KMHHU6KJ7EU113553",
  "year": 2014,
  "make": "Hyundai",
  "model": "Genesis",
  "trim": "3.8 Ultimate",
  "vin": "KMHHU6KJ7EU113553",
  "exteriorColor": "Casablanca White",
  "interiorColor": "Black",
  "originalMSRP": 35620,
  "currentMileage": 117750,
  "bodyClass": "Sedan",
  "manufacturedOrigin": { "label": "Ulsan, South Korea (Hyundai assembly)", "lat": 35.5384, "lng": 129.3114 },
  "summary": {
    "damageSeverity": "Minor",
    "carfaxValue": 11030,
    "carfaxValueType": "Retail",
    "serviceRecordCount": 18,
    "openRecalls": 1,
    "previousOwners": 2,
    "usage": "Personal Vehicle",
    "lastOwnedState": "California",
    "totalLoss": false,
    "structuralDamage": false,
    "airbagDeployment": false,
    "odometerRollback": false,
    "titleBrandsClean": true
  },
  "owners": [
    {
      "ownerNumber": 1,
      "yearPurchased": 2014,
      "type": "Personal",
      "lengthOfOwnership": "11 yrs 5 mo",
      "states": ["California"],
      "avgMilesPerYear": 10222,
      "lastOdometer": 117733
    },
    {
      "ownerNumber": 2,
      "yearPurchased": 2025,
      "type": "Personal",
      "lengthOfOwnership": "7 months",
      "states": ["California"],
      "avgMilesPerYear": null,
      "lastOdometer": 117750
    }
  ],
  "locations": {
    "Downey, CA": { "lat": 33.9401, "lng": -118.1332 },
    "Palmdale, CA": { "lat": 34.5794, "lng": -118.1165 },
    "Tehachapi, CA": { "lat": 35.1322, "lng": -118.4490 },
    "Ridgecrest, CA": { "lat": 35.6225, "lng": -117.6709 }
  },
  "events": ([
    { "id": 1,  "date": "2013-11-13", "owner": 1, "type": "manufacture", "title": "Manufactured & shipped to California", "mileage": null, "source": "Hyundai Motor America", "location": null, "coords": { "lat": 33.7542, "lng": -118.2165, "label": "Port of Long Beach, CA (import)" }, "details": ["Original MSRP: $35,620", "Casablanca White exterior", "Black interior"], "severity": "info" },
    { "id": 2,  "date": "2014-02-20", "owner": 1, "type": "service", "title": "Pre-delivery service", "mileage": 7, "source": "Downey Hyundai", "location": "Downey, CA", "phone": "562-231-0100", "rating": 4.1, "details": ["Pre-delivery inspection completed", "Fabric protection applied", "Paint protection applied"], "severity": "good" },
    { "id": 3,  "date": "2014-02-21", "owner": 1, "type": "listing", "title": "Offered for sale", "mileage": null, "source": "Downey Hyundai", "location": "Downey, CA", "phone": "562-231-0100", "rating": 4.1, "details": [], "severity": "info" },
    { "id": 4,  "date": "2014-03-03", "owner": 1, "type": "listing", "title": "Offered for sale", "mileage": null, "source": "Rally Cadillac GMC Hyundai", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.6, "details": [], "severity": "info" },
    { "id": 5,  "date": "2014-03-06", "owner": 1, "type": "service", "title": "Accessories installed", "mileage": 24, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Accessories installed", "Tire condition and pressure checked", "Vehicle washed/detailed"], "severity": "good" },
    { "id": 6,  "date": "2014-03-22", "owner": 1, "type": "service", "title": "Tire check", "mileage": 75, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Tire condition and pressure checked"], "severity": "good" },
    { "id": 7,  "date": "2014-04-17", "owner": 1, "type": "sale", "title": "Vehicle sold", "mileage": null, "source": "Rally Cadillac GMC Hyundai", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.6, "details": [], "severity": "highlight" },
    { "id": 8,  "date": "2014-04-17", "owner": 1, "type": "registration", "title": "Registered as personal vehicle", "mileage": 106, "source": "California Motor Vehicle Dept", "location": "Tehachapi, CA", "details": ["Odometer reading reported", "Titled or registered as personal vehicle"], "severity": "info" },
    { "id": 9,  "date": "2014-05-02", "owner": 1, "type": "title", "title": "Title issued", "mileage": null, "source": "California Motor Vehicle Dept", "location": "Tehachapi, CA", "details": ["First owner reported", "Loan or lien reported"], "severity": "info" },
    { "id": 10, "date": "2014-05-12", "owner": 1, "type": "service", "title": "Tire check", "mileage": 839, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Tire condition and pressure checked"], "severity": "good" },
    { "id": 11, "date": "2014-08-08", "owner": 1, "type": "service", "title": "Maintenance & oil change", "mileage": 7755, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Maintenance inspection completed", "Drivability/performance checked", "Oil and filter changed", "Tire condition and pressure checked"], "severity": "good" },
    { "id": 12, "date": "2014-12-19", "owner": 1, "type": "service", "title": "Maintenance & oil change", "mileage": 15326, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Maintenance inspection completed", "Cabin air filter replaced/cleaned", "Oil and filter changed", "Tire condition and pressure checked"], "severity": "good" },
    { "id": 13, "date": "2015-04-17", "owner": 1, "type": "service", "title": "Maintenance & oil change", "mileage": 22798, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Maintenance inspection completed", "Oil and filter changed", "Steering/suspension lubricated", "Tire condition and pressure checked"], "severity": "good" },
    { "id": 14, "date": "2015-05-08", "owner": 1, "type": "service", "title": "Tire check", "mileage": 23953, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Tire condition and pressure checked"], "severity": "good" },
    { "id": 15, "date": "2015-05-22", "owner": 1, "type": "service", "title": "Tire check", "mileage": 24629, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Tire condition and pressure checked"], "severity": "good" },
    { "id": 16, "date": "2015-06-05", "owner": 1, "type": "service", "title": "Fog light replaced", "mileage": 25465, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Fog light assembly replaced", "Tire condition and pressure checked"], "severity": "good" },
    { "id": 17, "date": "2016-10-19", "owner": 1, "type": "recall", "title": "Recall issued (PODS sensor)", "mileage": null, "source": "Hyundai Motor America", "location": null, "details": ["NHTSA #16V722000", "Recall #151 Passenger Occupant Detecting Sensor (PODS) Unit Rework", "Status: Remedy Available"], "severity": "warning" },
    { "id": 18, "date": "2017-06-29", "owner": 1, "type": "service", "title": "Front brake pads replaced", "mileage": 55557, "source": "P&N Garage", "location": "Tehachapi, CA", "phone": "661-822-5311", "rating": 4.9, "details": ["Brakes checked", "Front brake pads replaced"], "severity": "good" },
    { "id": 19, "date": "2018-07-10", "owner": 1, "type": "service", "title": "Vehicle reconditioned", "mileage": null, "source": "Service Facility", "location": null, "details": ["Vehicle reconditioned"], "severity": "good" },
    { "id": 20, "date": "2018-11-05", "owner": 1, "type": "service", "title": "Major service", "mileage": 81422, "source": "Diamond Cadillac Buick GMC", "location": "Palmdale, CA", "phone": "661-947-6000", "rating": 4.1, "details": ["Maintenance inspection completed", "Recommended maintenance performed", "A/C compressor replaced", "Brakes checked", "Differential fluid flushed/changed", "Drivability/performance checked", "Drive belt idler pulley replaced", "Front brake rotor(s) resurfaced", "Tire condition and pressure checked", "Transmission fluid changed", "Transmission fluid flushed"], "severity": "highlight" },
    { "id": 21, "date": "2020-04-21", "owner": 1, "type": "title", "title": "Lien released", "mileage": null, "source": "California Motor Vehicle Dept", "location": "Tehachapi, CA", "details": ["Loan or lien released"], "severity": "info" },
    { "id": 22, "date": "2021-04-20", "owner": 1, "type": "damage", "title": "Minor damage reported", "mileage": null, "source": "Damage Report", "location": null, "details": ["Damage to right rear", "Damage to right side", "Severity: Minor (cosmetic — dents or scratches)"], "damageLocations": ["right-rear", "right-side"], "severity": "alert" },
    { "id": 99, "date": "2021-04-30", "owner": 1, "type": "sale", "title": "Salvage auction record logged", "mileage": 104200, "source": "Copart Los Angeles", "location": "San Diego, CA", "coords": { "lat": 32.7157, "lng": -117.1611, "label": "San Diego Auction Lot — approx." }, "details": ["Offered at insurance auction lot", "Primary damage: Right side", "Secondary damage: Rear end cosmetic scraper", "Airbags deployed: No", "Sold to automotive rebuilder"], "severity": "alert" },
    { "id": 23, "date": "2021-05-14", "owner": 1, "type": "service", "title": "Maintenance & oil change", "mileage": 109262, "source": "Jiffy Lube", "location": "Tehachapi, CA", "phone": "661-822-5300", "rating": 5.0, "details": ["Maintenance inspection completed", "Antifreeze/coolant flushed/changed", "Oil and filter changed"], "severity": "good" },
    { "id": 24, "date": "2022-04-26", "owner": 1, "type": "service", "title": "Emissions inspection", "mileage": 111870, "source": "Don's Pro Technology", "location": "Tehachapi, CA", "phone": "661-822-1600", "rating": 4.8, "details": ["Emissions inspection performed"], "severity": "good" },
    { "id": 25, "date": "2022-04-26", "owner": 1, "type": "inspection", "title": "Passed emissions", "mileage": null, "source": "California Inspection Station", "location": "Tehachapi, CA", "details": ["Passed emissions inspection"], "severity": "good" },
    { "id": 26, "date": "2024-04-03", "owner": 1, "type": "recall", "title": "Recall issued (ABS fuse)", "mileage": null, "source": "Hyundai Motor America", "location": null, "details": ["NHTSA #23V651000", "Recall #251 ABS Fuse Replacement (various models)", "Status: Remedy Available"], "severity": "warning" },
    { "id": 27, "date": "2024-04-16", "owner": 1, "type": "service", "title": "Emissions inspection", "mileage": null, "source": "Don's Pro Technology", "location": "Tehachapi, CA", "phone": "661-822-1600", "rating": 4.8, "details": ["Emissions inspection performed"], "severity": "good" },
    { "id": 28, "date": "2024-04-16", "owner": 1, "type": "inspection", "title": "Passed emissions", "mileage": 115769, "source": "California Inspection Station", "location": "Tehachapi, CA", "details": ["Passed emissions inspection"], "severity": "good" },
    { "id": 29, "date": "2025-10-16", "owner": 1, "type": "listing", "title": "Offered for sale", "mileage": 117730, "source": "Trust Palmdale Kia", "location": "Palmdale, CA", "phone": "661-214-3615", "rating": 4.7, "details": [], "severity": "info" },
    { "id": 30, "date": "2025-10-17", "owner": 1, "type": "service", "title": "Emissions inspection", "mileage": 117733, "source": "Trust Palmdale Honda", "location": "Palmdale, CA", "phone": "661-265-6000", "rating": 4.7, "details": ["Emissions inspection performed"], "severity": "good" },
    { "id": 31, "date": "2025-10-17", "owner": 1, "type": "inspection", "title": "Passed emissions", "mileage": null, "source": "California Inspection Station", "location": "Palmdale, CA", "details": ["Passed emissions inspection"], "severity": "good" },
    { "id": 32, "date": "2025-10-20", "owner": 1, "type": "service", "title": "Reconditioned for sale", "mileage": null, "source": "Trust Palmdale Kia", "location": "Palmdale, CA", "phone": "661-214-3615", "rating": 4.7, "details": ["Pre-delivery inspection completed", "Air filter replaced", "Cabin air filter replaced/cleaned", "Door edge guards installed", "Four tires replaced", "Front wiper blades/refills replaced", "GPS/navigation system installed", "GPS/navigation system serviced", "Oil and filter changed", "Wiper(s) replaced"], "severity": "highlight" },
    { "id": 33, "date": "2025-11-03", "owner": 2, "type": "title", "title": "New owner — title issued", "mileage": 117750, "source": "California Motor Vehicle Dept", "location": "Ridgecrest, CA", "details": ["New owner reported"], "severity": "highlight" }
  ] as any[]).map((evt) => {
    // If event has manual coords or doesn't have location, keep it
    if (evt.coords) return evt;
    if (!evt.location) return evt;
    
    // Resolve CA locations
    const locationsLookup: Record<string, { lat: number; lng: number }> = {
      "Downey, CA": { "lat": 33.9401, "lng": -118.1332 },
      "Palmdale, CA": { "lat": 34.5794, "lng": -118.1165 },
      "Tehachapi, CA": { "lat": 35.1322, "lng": -118.4490 },
      "Ridgecrest, CA": { "lat": 35.6225, "lng": -117.6709 }
    };
    
    const matchedCoords = locationsLookup[evt.location];
    if (matchedCoords) {
      return {
        ...evt,
        coords: {
          lat: matchedCoords.lat,
          lng: matchedCoords.lng,
          label: evt.location
        }
      };
    }
    return evt;
  }),
  auctionHistory: [
    {
      id: "auc_genesis",
      kind: "auction",
      status: "Sold",
      date: "2021-04-30",
      price: 15400,
      currency: "USD",
      sellerType: "Insurance Auction (IAAI)",
      location: "San Diego, CA",
      coords: { lat: 32.7157, lng: -117.1611, label: "San Diego Auction Lot — approx." },
      odometer: 104200,
      odometerNote: "Verified odometer",
      condition: {
        runsAndDrives: true,
        engineStart: true,
        hasKeys: true
      },
      primaryDamage: "Rear end",
      secondaryDamage: "Right side scraping",
      photoCount: 10,
      photos: [
        { id: "gp1", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800", category: "exterior", caption: "Rear right corner — visible bumper indentation", isDamage: true },
        { id: "gp2", url: "https://images.unsplash.com/photo-1617469767053-d3b508a0d825?auto=format&fit=crop&q=80&w=800", category: "damage",   caption: "Trunk deck lid and tail light surround panel", isDamage: true },
        { id: "gp3", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800", category: "exterior", caption: "Front left 3/4 — clean body lines", isDamage: false },
        { id: "gp4", url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", category: "exterior", caption: "Front overview — no impact recorded", isDamage: false },
        { id: "gp5", url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", category: "interior", caption: "Black leather front seats & central dash stack", isDamage: false },
        { id: "gp6", url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800", category: "interior", caption: "Rear passenger cabin and seats", isDamage: false },
        { id: "gp7", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800", category: "engine",   caption: "Hyundai V6 Lambda II engine bay", isDamage: false },
        { id: "gp8", url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800", category: "gauges",   caption: "Ignition key in 'ON' position — odometer 104,200", isDamage: false },
        { id: "gp9", url: "https://images.unsplash.com/photo-1562620644-65ba45aaa8e1?auto=format&fit=crop&q=80&w=800", category: "interior", caption: "Steering wheel and active dashboard display", isDamage: false },
        { id: "gp10", url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800", category: "docs",     "caption": "VIN chassis plate decal inside front door jamb", isDamage: false }
      ]
    }
  ]
};
