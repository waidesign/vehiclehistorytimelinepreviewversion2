import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTimelineStore } from '../store/useTimelineStore';
import { VehicleEvent } from '../types';
import { Navigation, Maximize2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Reset leaflet default icons paths using CDN to ensure no loading issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper for deterministic coordinate jittering to prevent perfect overlays
export const getJitteredCoords = (lat: number, lng: number, index: number): [number, number] => {
  const angle = (index * 37) * (Math.PI / 180);
  const distance = 0.003 * (1 + Math.floor(index / 6) * 0.3);
  return [
    lat + Math.sin(angle) * distance,
    lng + Math.cos(angle) * distance
  ];
};

// Simplified coordinate boundaries for high-fidelity state-wide accident highlights
const STATE_BORDERS: Record<string, [number, number][]> = {
  IL: [
    [42.5083, -90.6405], // NW corner (Mississippi River & Wisconsin line)
    [42.5083, -87.8057], // NE corner at Lake Michigan line
    [41.7600, -87.5240], // near Chicago/Indiana line
    [41.5200, -87.5250], // southbound along IN border
    [40.5000, -87.5250],
    [39.7600, -87.5250], // meets Wabash River
    [39.5000, -87.5100], // along Wabash River
    [39.0000, -87.6200],
    [38.4500, -87.7500],
    [38.0000, -87.9500],
    [37.8500, -88.0200], // Wabash meets Ohio River (KY border)
    [37.7000, -88.1300], // along Ohio River
    [37.4500, -88.4000],
    [37.1500, -88.6000],
    [37.0600, -88.9000],
    [37.0000, -89.1400], // Cairo, IL (confluence with Mississippi River)
    [37.1500, -89.3000], // along Mississippi River (MO border)
    [37.4000, -89.5000],
    [37.8000, -90.1500],
    [38.2500, -90.4000],
    [38.6000, -90.2000], // St. Louis area
    [38.9000, -90.4500],
    [39.2000, -90.7000],
    [39.5000, -91.1000],
    [40.1000, -91.5000], // Quincy area (IA border)
    [40.3800, -91.4000],
    [40.9000, -91.0000],
    [41.4500, -91.0500],
    [41.9500, -90.1500],
    [42.5083, -90.6405]  // close the polygon
  ],
  CA: [
    [42.0000, -124.2139],
    [42.0000, -120.0011],
    [39.0000, -120.0011],
    [34.3500, -114.1300],
    [32.5343, -117.1231],
    [32.8000, -117.2000],
    [34.0000, -119.0000],
    [34.5000, -120.5000],
    [36.5000, -121.9000],
    [37.7749, -122.4194],
    [38.5000, -123.3000],
    [40.0000, -124.4000],
    [42.0000, -124.2139]
  ]
};

const getStateCode = (locationStr: string | null): string | null => {
  if (!locationStr) return null;
  const parts = locationStr.split(',');
  if (parts.length < 2) return null;
  return parts[1].trim().toUpperCase().substring(0, 2);
};

export default function MapComponent() {
  const { vehicles, activeVehicleId, activeEventId, setActiveEventId } = useTimelineStore();
  const [showLegend, setShowLegend] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const activePolylineRef = useRef<L.Polyline | null>(null);
  const futurePolylineRef = useRef<L.Polyline | null>(null);
  const statePolygonRef = useRef<L.Polygon | null>(null);
  const lastVehicleIdRef = useRef<string | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  const vehicle = vehicles.find((v) => v.id === activeVehicleId);

  // Derive geographical events
  const geoEvents = vehicle
    ? vehicle.events
        .map((evt, idx) => {
          if (evt.coords && typeof evt.coords.lat === 'number' && typeof evt.coords.lng === 'number') {
            const coords = evt.location
              ? getJitteredCoords(evt.coords.lat, evt.coords.lng, idx)
              : ([evt.coords.lat, evt.coords.lng] as [number, number]);
            return { ...evt, resolvedCoords: coords };
          }
          return null;
        })
        .filter((e): e is (VehicleEvent & { resolvedCoords: [number, number] }) => e !== null)
    : [];

  const activeGeoEvent = geoEvents.find((e) => e.id === activeEventId);
  const activeStateCode = activeGeoEvent ? getStateCode(activeGeoEvent.location) : null;

  const checkIsBadEvent = (evt: VehicleEvent) => {
    const type = evt.type?.toLowerCase() || '';
    const title = evt.title?.toLowerCase() || '';
    const detailsStr = (evt.details || []).join(' ').toLowerCase();
    const severity = evt.severity?.toLowerCase() || '';
    
    const hasBadKeyword = 
      title.includes('accident') ||
      title.includes('collision') ||
      title.includes('salvage') ||
      title.includes('damage') ||
      title.includes('junk') ||
      title.includes('total loss') ||
      title.includes('auction') ||
      title.includes('rebuilt') ||
      title.includes('recall') ||
      detailsStr.includes('accident') ||
      detailsStr.includes('collision') ||
      detailsStr.includes('salvage') ||
      detailsStr.includes('damage') ||
      detailsStr.includes('total loss') ||
      detailsStr.includes('auction') ||
      detailsStr.includes('scrapped') ||
      detailsStr.includes('lemon');

    const isBadType = 
      type === 'accident' || 
      type === 'damage' || 
      type === 'recall' || 
      type === 'sale';

    const isBadSeverity = 
      severity === 'alert' || 
      severity === 'warning';

    return isBadType || isBadSeverity || hasBadKeyword;
  };

  const badStates = vehicle
    ? Array.from(
        new Set([
          ...vehicle.events
            .filter(checkIsBadEvent)
            .map((e) => getStateCode(e.location)),
          ...(vehicle.auctionHistory || [])
            .map((rec) => {
              const primaryDamage = rec.primaryDamage?.toLowerCase() || '';
              const secondaryDamage = rec.secondaryDamage?.toLowerCase() || '';
              const hasBadKeyword =
                primaryDamage.includes('damage') ||
                primaryDamage.includes('collision') ||
                primaryDamage.includes('salvage') ||
                secondaryDamage.includes('damage') ||
                secondaryDamage.includes('collision') ||
                secondaryDamage.includes('salvage');
              if (hasBadKeyword || rec.kind === 'auction') {
                return getStateCode(rec.location || null);
              }
              return null;
            })
        ].filter((st): st is string => !!st && !!STATE_BORDERS[st]))
      )
    : [];

  const isAlertOverlayActive = badStates.length > 0;

  const activeGeoIndex = geoEvents.findIndex((e) => e.id === activeEventId);
  const sortedGeoCoords = geoEvents.map((e) => e.resolvedCoords);

  const activePathCoords = geoEvents
    .filter((e, idx) => {
      const activeIdx = geoEvents.findIndex((ge) => ge.id === activeEventId);
      return idx <= activeIdx;
    })
    .map((e) => e.resolvedCoords);

  const futurePathCoords = geoEvents
    .filter((e, idx) => {
      const activeIdx = geoEvents.findIndex((ge) => ge.id === activeEventId);
      return idx >= activeIdx;
    })
    .map((e) => e.resolvedCoords);

  // Custom DivIcon generator using fully managed HTML/CSS
  const getCustomIcon = (evt: VehicleEvent, isActive: boolean) => {
    const colors = {
      info: '#64748B',
      good: '#10B981',
      highlight: '#2563EB',
      warning: '#F59E0B',
      alert: '#F43F5E',
    };
    const color = colors[evt.severity] || colors.info;
    const border = isActive ? 'border-[3px] border-black scale-110' : 'border-2 border-black';
    const pulse = isActive ? 'animate-ping absolute inset-0 rounded-full opacity-55' : '';
    const shadow = isActive ? 'shadow-brutal-sm' : 'shadow-none';
    const letter = evt.type.substring(0, 1).toUpperCase();

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
          ${isActive ? `<div class="${pulse}" style="background-color: ${color}; position: absolute; inset: 0; border-radius: 9999px;"></div>` : ''}
          <div class="w-7 h-7 rounded-none flex items-center justify-center text-white text-[10px] font-black ${border} ${shadow} transition-all" 
               style="background-color: ${color}; position: relative; z-index: 10;">
            ${letter}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Instantiation Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [34.0522, -118.2437],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap/CARTO tile layer
    L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

        // Dynamic layers refs
    markersLayerRef.current = L.featureGroup().addTo(map);
    activePolylineRef.current = L.polyline([], { color: '#2563EB', weight: 4.5, opacity: 0.9, lineJoin: 'round' }).addTo(map);
    futurePolylineRef.current = L.polyline([], { color: '#9AA3B2', weight: 2, opacity: 0.4, dashArray: '6, 6', lineJoin: 'round' }).addTo(map);
    statePolygonRef.current = L.polygon([], {
      color: '#E11D48',
      fillColor: '#F43F5E',
      fillOpacity: 0.16,
      weight: 3,
      dashArray: '5, 8',
      lineJoin: 'round'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update effect to handle coordinates, markers, paths and zooms
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Add markers dynamically
    geoEvents.forEach((evt) => {
      const isActive = evt.id === activeEventId;
      const marker = L.marker(evt.resolvedCoords, {
        icon: getCustomIcon(evt, isActive),
      });

      marker.on('click', () => {
        setActiveEventId(evt.id);
      });

      // Bind custom popup structure matches
      const popupContent = `
        <div class="p-1">
          <p class="font-semibold text-slate-900 text-xs leading-none">${evt.title}</p>
          <p class="font-mono text-[9px] text-slate-400 mt-1">${evt.date}</p>
        </div>
      `;
      marker.bindPopup(popupContent, { closeButton: false });

      if (markersLayerRef.current) {
        marker.addTo(markersLayerRef.current);
      }
    });

    // Update path lines
    if (activePolylineRef.current) {
      activePolylineRef.current.setLatLngs(activePathCoords);
    }
    if (futurePolylineRef.current) {
      futurePolylineRef.current.setLatLngs(futurePathCoords);
    }

    // Update state-wide highlight polygon
    if (statePolygonRef.current) {
      if (isAlertOverlayActive && badStates.length > 0) {
        // MultiPolygon coordinates
        statePolygonRef.current.setLatLngs(badStates.map((st) => STATE_BORDERS[st]));
      } else {
        statePolygonRef.current.setLatLngs([]);
      }
    }

    // Auto fit/bounds logic when switching vehicles
    if (activeVehicleId !== lastVehicleIdRef.current) {
      lastVehicleIdRef.current = activeVehicleId;
      lastEventIdRef.current = activeEventId;
      if (sortedGeoCoords.length > 0) {
        map.fitBounds(sortedGeoCoords, { padding: [160, 160], maxZoom: 7 });
      }
    } else if (activeEventId !== lastEventIdRef.current) {
      lastEventIdRef.current = activeEventId;
      // Otherwise fly smoothly to currently active event
      if (activeGeoEvent) {
        // If the active event is itself a high-risk event, zoom to reveal wide-state impact, else focus on location detail
        const isActiveEventBad = checkIsBadEvent(activeGeoEvent);
        const targetZoom = isActiveEventBad ? 9 : Math.max(13, map.getZoom());
        map.flyTo(activeGeoEvent.resolvedCoords, targetZoom, { animate: true, duration: 1.2 });
      }
    }
  }, [geoEvents, activeEventId, activeVehicleId, isAlertOverlayActive, badStates.length]);

  const handleFitJourney = () => {
    const map = mapRef.current;
    if (map && sortedGeoCoords.length > 0) {
      map.flyToBounds(sortedGeoCoords, { padding: [160, 160], maxZoom: 7, animate: true, duration: 1.5 });
    }
  };

  if (!vehicle) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-black rounded-none shadow-brutal text-center p-4">
        <p className="text-gray-500 font-bold">Select a vehicle to view its journey</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-none overflow-hidden border-2 border-black bg-white shadow-brutal">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Map Control Badge */}
      <div className="absolute top-3 left-3 z-[999] bg-white px-3 py-2 rounded-none border-2 border-black shadow-brutal-sm flex items-center gap-2 pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <div>
          <h4 className="font-extrabold text-slate-900 text-[11px] leading-tight">Timeline Journey</h4>
          <p className="text-[9px] text-slate-500 font-semibold">
            {activeGeoIndex >= 0 ? `${activeGeoIndex + 1} of ${geoEvents.length} Stops` : 'Non-geographic location'}
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[999]">
        <button
          onClick={handleFitJourney}
          className="p-2 bg-white hover:bg-slate-100 text-slate-800 rounded-none border-2 border-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 text-[11px] font-bold"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
          <span>Fit Journey</span>
        </button>
      </div>

      {/* Collapsible/Interactive Map Legend */}
      <div className="absolute bottom-6 right-3 z-[999] bg-white border-2 border-black shadow-brutal font-sans w-[190px] select-none text-slate-800 map-legend-container">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between p-2 border-b-2 border-black bg-slate-100 hover:bg-slate-200 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Map Legend</span>
          </div>
          {showLegend ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronUp className="w-3 h-3 shrink-0" />}
        </button>

        {showLegend && (
          <div className="p-2 flex flex-col gap-2.5 bg-white transition-all max-h-[220px] overflow-y-auto">
            {/* Letters Explanation */}
            <div>
              <h5 className="font-extrabold uppercase text-[8px] text-slate-400 tracking-wider mb-1">
                Pin Symbols (Event Type)
              </h5>
              <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 text-[8px] font-semibold text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">A</span>
                  <span className="truncate">Accident</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">S</span>
                  <span className="truncate">Service/Sale</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">T</span>
                  <span className="truncate">Title Log</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">R</span>
                  <span className="truncate">Recall/Reg</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">D</span>
                  <span className="truncate">Damage</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">I</span>
                  <span className="truncate">Inspection</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">M</span>
                  <span className="truncate">Manufacture</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-slate-800 text-white font-mono flex items-center justify-center text-[7px] font-black border border-black leading-none shrink-0">O</span>
                  <span className="truncate">Owner/Odom</span>
                </div>
              </div>
            </div>

            {/* Colors Explanation */}
            <div className="border-t border-slate-200 pt-2">
              <h5 className="font-extrabold uppercase text-[8px] text-slate-400 tracking-wider mb-1">
                Pin Colors (Severity)
              </h5>
              <div className="flex flex-col gap-1 text-[8px] font-semibold text-slate-700 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-500 border border-black block rounded-none shrink-0" />
                  <span>High-Risk / Critical Alert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 border border-black block rounded-none shrink-0" />
                  <span>Warning / Recall Notice</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-600 border border-black block rounded-none shrink-0" />
                  <span>Important Highlight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-600 border border-black block rounded-none shrink-0" />
                  <span>Good Status / Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-500 border border-black block rounded-none shrink-0" />
                  <span>General Information</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-1 right-2 z-[999] bg-white border border-black/20 px-1.5 rounded-none text-[8px] font-mono text-slate-400 select-none pointer-events-none">
        © OpenStreetMap contributors
      </div>

      {isAlertOverlayActive && badStates.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[999] bg-rose-600 text-white p-2.5 border-2 border-black shadow-brutal flex flex-col gap-1 select-none font-sans max-w-[240px] map-alert-container">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white block animate-pulse" />
            <h5 className="font-extrabold text-[9px] uppercase tracking-wider leading-none text-white">
              State-Wide Hazard Alert
            </h5>
          </div>
          <p className="text-[8px] font-black text-rose-100 uppercase leading-snug">
            {badStates.map((st) => (st === 'IL' ? 'Illinois' : st === 'CA' ? 'California' : st)).join(' & ')} State overlay active. Severe records (Salvage, Damage, or Collision) detected in vehicle history.
          </p>
        </div>
      )}
    </div>
  );
}

