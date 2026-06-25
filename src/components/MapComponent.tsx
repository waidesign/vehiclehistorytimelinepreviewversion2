import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTimelineStore } from '../store/useTimelineStore';
import { VehicleEvent } from '../types';
import { Navigation, Maximize2, HelpCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const getJitteredCoords = (lat: number, lng: number, index: number): [number, number] => {
  const angle = (index * 37) * (Math.PI / 180);
  const distance = 0.003 * (1 + Math.floor(index / 6) * 0.3);
  return [lat + Math.sin(angle) * distance, lng + Math.cos(angle) * distance];
};

const STATE_BORDERS: Record<string, [number, number][]> = {
  IL: [
    [42.5083, -90.6405], [42.5083, -87.8057], [41.7600, -87.5240], [41.5200, -87.5250],
    [40.5000, -87.5250], [39.7600, -87.5250], [39.5000, -87.5100], [39.0000, -87.6200],
    [38.4500, -87.7500], [38.0000, -87.9500], [37.8500, -88.0200], [37.7000, -88.1300],
    [37.4500, -88.4000], [37.1500, -88.6000], [37.0600, -88.9000], [37.0000, -89.1400],
    [37.1500, -89.3000], [37.4000, -89.5000], [37.8000, -90.1500], [38.2500, -90.4000],
    [38.6000, -90.2000], [38.9000, -90.4500], [39.2000, -90.7000], [39.5000, -91.1000],
    [40.1000, -91.5000], [40.3800, -91.4000], [40.9000, -91.0000], [41.4500, -91.0500],
    [41.9500, -90.1500], [42.5083, -90.6405],
  ],
  CA: [
    [42.0000, -124.2139], [42.0000, -120.0011], [39.0000, -120.0011], [34.3500, -114.1300],
    [32.5343, -117.1231], [32.8000, -117.2000], [34.0000, -119.0000], [34.5000, -120.5000],
    [36.5000, -121.9000], [37.7749, -122.4194], [38.5000, -123.3000], [40.0000, -124.4000],
    [42.0000, -124.2139],
  ],
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
  const activeGeoIndex = geoEvents.findIndex((e) => e.id === activeEventId);
  const sortedGeoCoords = geoEvents.map((e) => e.resolvedCoords);

  const activePathCoords = geoEvents
    .filter((_e, idx) => idx <= geoEvents.findIndex((ge) => ge.id === activeEventId))
    .map((e) => e.resolvedCoords);

  const futurePathCoords = geoEvents
    .filter((_e, idx) => idx >= geoEvents.findIndex((ge) => ge.id === activeEventId))
    .map((e) => e.resolvedCoords);

  const checkIsBadEvent = (evt: VehicleEvent) => {
    const type = evt.type?.toLowerCase() || '';
    const title = evt.title?.toLowerCase() || '';
    const detailsStr = (evt.details || []).join(' ').toLowerCase();
    const severity = evt.severity?.toLowerCase() || '';
    const hasBadKeyword =
      title.includes('accident') || title.includes('collision') || title.includes('salvage') ||
      title.includes('damage') || title.includes('junk') || title.includes('total loss') ||
      title.includes('auction') || title.includes('rebuilt') || title.includes('recall') ||
      detailsStr.includes('accident') || detailsStr.includes('collision') || detailsStr.includes('salvage') ||
      detailsStr.includes('damage') || detailsStr.includes('total loss') ||
      detailsStr.includes('auction') || detailsStr.includes('scrapped') || detailsStr.includes('lemon');
    const isBadType = type === 'accident' || type === 'damage' || type === 'recall' || type === 'sale';
    const isBadSeverity = severity === 'alert' || severity === 'warning';
    return isBadType || isBadSeverity || hasBadKeyword;
  };

  const badStates = vehicle
    ? Array.from(new Set([
        ...vehicle.events.filter(checkIsBadEvent).map((e) => getStateCode(e.location)),
        ...(vehicle.auctionHistory || []).map((rec) => {
          const pd = rec.primaryDamage?.toLowerCase() || '';
          const sd = rec.secondaryDamage?.toLowerCase() || '';
          if (pd.includes('damage') || pd.includes('collision') || pd.includes('salvage') ||
              sd.includes('damage') || sd.includes('collision') || sd.includes('salvage') ||
              rec.kind === 'auction') {
            return getStateCode(rec.location || null);
          }
          return null;
        }),
      ].filter((st): st is string => !!st && !!STATE_BORDERS[st])))
    : [];

  const isAlertOverlayActive = badStates.length > 0;

  // Custom circle pin icon
  const getCustomIcon = (evt: VehicleEvent, isActive: boolean) => {
    const colors: Record<string, string> = {
      info: '#64748B', good: '#10B981', highlight: '#2563EB', warning: '#F59E0B', alert: '#F43F5E',
    };
    const color = colors[evt.severity] || colors.info;
    const letter = evt.type.substring(0, 1).toUpperCase();
    const size = isActive ? 32 : 26;
    const ringStyle = isActive
      ? `box-shadow: 0 0 0 3px ${color}40, 0 4px 12px ${color}50;`
      : `box-shadow: 0 2px 6px rgba(0,0,0,0.18);`;

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
          ${isActive ? `<div style="position:absolute; inset:-4px; border-radius:9999px; background:${color}; opacity:0.2; animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
          <div style="
            width:${size}px; height:${size}px; border-radius:9999px;
            background:${color};
            color:white; display:flex; align-items:center; justify-content:center;
            font-family:ui-sans-serif,system-ui,sans-serif;
            font-size:${isActive ? 12 : 10}px; font-weight:700;
            position:relative; z-index:10;
            ${ringStyle}
            transition:all 0.2s;
          ">
            ${letter}
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Map init
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [34.0522, -118.2437],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);

    markersLayerRef.current = L.featureGroup().addTo(map);
    activePolylineRef.current = L.polyline([], { color: '#2563EB', weight: 3.5, opacity: 0.85, lineJoin: 'round' }).addTo(map);
    futurePolylineRef.current = L.polyline([], { color: '#CBD5E1', weight: 2, opacity: 0.6, dashArray: '6, 7', lineJoin: 'round' }).addTo(map);
    statePolygonRef.current = L.polygon([], {
      color: '#F43F5E', fillColor: '#F43F5E', fillOpacity: 0.1, weight: 2, dashArray: '6, 8', lineJoin: 'round',
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Marker / path updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersLayerRef.current?.clearLayers();

    geoEvents.forEach((evt) => {
      const isActive = evt.id === activeEventId;
      const marker = L.marker(evt.resolvedCoords, { icon: getCustomIcon(evt, isActive) });
      marker.on('click', () => setActiveEventId(evt.id));
      marker.bindPopup(`
        <div style="padding:4px 2px; min-width:120px;">
          <p style="font-weight:600; font-size:12px; color:#111827; margin:0 0 4px;">${evt.title}</p>
          <p style="font-family:monospace; font-size:10px; color:#9CA3AF; margin:0;">${evt.date}</p>
        </div>
      `, { closeButton: false });
      if (markersLayerRef.current) marker.addTo(markersLayerRef.current);
    });

    activePolylineRef.current?.setLatLngs(activePathCoords);
    futurePolylineRef.current?.setLatLngs(futurePathCoords);

    if (statePolygonRef.current) {
      statePolygonRef.current.setLatLngs(
        isAlertOverlayActive && badStates.length > 0
          ? badStates.map((st) => STATE_BORDERS[st])
          : []
      );
    }

    if (activeVehicleId !== lastVehicleIdRef.current) {
      lastVehicleIdRef.current = activeVehicleId;
      lastEventIdRef.current = activeEventId;
      if (sortedGeoCoords.length > 0) map.fitBounds(sortedGeoCoords, { padding: [160, 160], maxZoom: 7 });
    } else if (activeEventId !== lastEventIdRef.current) {
      lastEventIdRef.current = activeEventId;
      if (activeGeoEvent) {
        const zoom = checkIsBadEvent(activeGeoEvent) ? 9 : Math.max(13, map.getZoom());
        map.flyTo(activeGeoEvent.resolvedCoords, zoom, { animate: true, duration: 1.2 });
      }
    }
  }, [geoEvents, activeEventId, activeVehicleId, isAlertOverlayActive, badStates.length]);

  const handleFitJourney = () => {
    if (mapRef.current && sortedGeoCoords.length > 0) {
      mapRef.current.flyToBounds(sortedGeoCoords, { padding: [160, 160], maxZoom: 7, animate: true, duration: 1.5 });
    }
  };

  if (!vehicle) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl shadow-sm text-center p-4">
        <p className="text-gray-400 text-sm font-medium">Select a vehicle to view its journey</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Map canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top-left: Journey badge */}
      <div className="absolute top-3 left-3 z-[999] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800 text-xs leading-tight">Timeline Journey</h4>
          <p className="text-[10px] text-gray-400 font-medium">
            {activeGeoIndex >= 0 ? `${activeGeoIndex + 1} of ${geoEvents.length} Stops` : 'Non-geographic location'}
          </p>
        </div>
      </div>

      {/* Top-right: Fit Journey */}
      <div className="absolute top-3 right-3 z-[999]">
        <button
          onClick={handleFitJourney}
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
          Fit Journey
        </button>
      </div>

      {/* Bottom-right: Map Legend */}
      <div className="absolute bottom-6 right-3 z-[999] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl w-[195px] select-none overflow-hidden map-legend-container">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-1.5 text-gray-600">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Map Legend</span>
          </div>
          {showLegend
            ? <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
            : <ChevronUp className="w-3 h-3 text-gray-400 shrink-0" />
          }
        </button>

        {showLegend && (
          <div className="px-3 py-2.5 flex flex-col gap-2.5 bg-white max-h-[220px] overflow-y-auto">
            {/* Pin letters */}
            <div>
              <h5 className="font-semibold uppercase text-[9px] text-gray-400 tracking-wider mb-1.5">
                Pin Symbols (Event Type)
              </h5>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  ['A', 'Accident'], ['S', 'Service/Sale'],
                  ['T', 'Title Log'],  ['R', 'Recall/Reg'],
                  ['D', 'Damage'],     ['I', 'Inspection'],
                  ['M', 'Manufacture'],['O', 'Owner/Odom'],
                ].map(([letter, label]) => (
                  <div key={letter} className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 leading-none">
                      {letter}
                    </span>
                    <span className="text-[9px] text-gray-600 truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pin colors */}
            <div className="border-t border-gray-100 pt-2">
              <h5 className="font-semibold uppercase text-[9px] text-gray-400 tracking-wider mb-1.5">
                Pin Colors (Severity)
              </h5>
              <div className="flex flex-col gap-1.5">
                {[
                  { color: 'bg-rose-500',   label: 'High-Risk / Critical Alert' },
                  { color: 'bg-amber-400',  label: 'Warning / Recall Notice' },
                  { color: 'bg-blue-600',   label: 'Important Highlight' },
                  { color: 'bg-emerald-500',label: 'Good Status / Normal' },
                  { color: 'bg-gray-400',   label: 'General Information' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                    <span className="text-[9px] text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[999] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[8px] font-mono text-gray-400 select-none pointer-events-none">
        © OpenStreetMap contributors
      </div>

      {/* Bottom-left: Hazard alert */}
      {isAlertOverlayActive && badStates.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[999] bg-white/95 backdrop-blur-sm border border-rose-200 shadow-lg rounded-xl p-3 max-w-[220px] map-alert-container">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 block animate-pulse shrink-0" />
            <h5 className="font-semibold text-[10px] text-rose-600 uppercase tracking-wide leading-none">
              State-Wide Hazard Alert
            </h5>
          </div>
          <p className="text-[9px] text-gray-500 leading-snug">
            <span className="font-semibold text-rose-500">
              {badStates.map((st) => st === 'IL' ? 'Illinois' : st === 'CA' ? 'California' : st).join(' & ')}
            </span>
            {' '}overlay active. Severe records (salvage, damage, or collision) detected in vehicle history.
          </p>
        </div>
      )}
    </div>
  );
}
