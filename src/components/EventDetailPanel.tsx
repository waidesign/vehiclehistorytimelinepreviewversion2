import { useTimelineStore } from '../store/useTimelineStore';
import { EVENT_TYPE_META } from './TimelineComponent';
import CarDamageDiagram from './CarDamageDiagram';
import AuctionGallery from './AuctionGallery';
import {
  Calendar,
  Gauge,
  Phone,
  Star,
  MapPin,
  Building,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function EventDetailPanel() {
  const { vehicles, activeVehicleId, activeEventId } = useTimelineStore();

  const vehicle = vehicles.find((v) => v.id === activeVehicleId);
  if (!vehicle) return null;

  const event = vehicle.events.find((e) => e.id === activeEventId);
  if (!event) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-55 border-2 border-black rounded-none p-6 shadow-brutal text-center">
        <p className="text-slate-500 text-xs font-extrabold">Select an event to view full details</p>
      </div>
    );
  }

  const Meta = EVENT_TYPE_META[event.type] || EVENT_TYPE_META.manufacture;
  const IconComponent = Meta.icon;

  // Severity labels & styling
  const severityColors: Record<string, { bg: string; text: string; label: string }> = {
    info: { bg: 'bg-slate-100 border-2 border-black', text: 'text-slate-800', label: 'General Record' },
    good: { bg: 'bg-emerald-50 text-emerald-950 border-2 border-black', text: 'text-emerald-950', label: 'Positive Record' },
    highlight: { bg: 'bg-blue-50 text-blue-950 border-2 border-black', text: 'text-blue-950', label: 'Key Milestone' },
    warning: { bg: 'bg-amber-50 text-amber-950 border-2 border-black', text: 'text-amber-950', label: 'Action Required' },
    alert: { bg: 'bg-rose-50 text-rose-950 border-2 border-black', text: 'text-rose-950', label: 'Alert Flag' },
  };

  const sevStyle = severityColors[event.severity] || severityColors.info;

  return (
    <div className="flex flex-col h-full bg-white rounded-none p-5 border-2 border-black shadow-brutal overflow-y-auto no-scrollbar">
      
      {/* Top event tag header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-none border-2 border-black ${Meta.bg} ${Meta.text}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Event Category</p>
            <p className="text-[11px] font-black text-slate-850 capitalize leading-tight">{event.type}</p>
          </div>
        </div>

        <span className={`text-[10px] font-black px-2.5 py-1 rounded-none ${sevStyle.bg} ${sevStyle.text}`}>
          {sevStyle.label}
        </span>
      </div>

      {/* Primary event title display */}
      <h2 className="font-display font-extrabold text-[#0E1726] text-base md:text-lg tracking-tight leading-snug">
        {event.title}
      </h2>

      {/* Date & Mileage large display stats cards */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {/* Date Card */}
        <div className="bg-slate-50 p-2.5 rounded-none border-2 border-black">
          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-blue-600" /> Date Reported
          </span>
          <p className="text-xs font-black text-slate-800 mt-1">
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Mileage Card */}
        <div className="bg-slate-50 p-2.5 rounded-none border-2 border-black">
          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
            <Gauge className="w-2.5 h-2.5 text-emerald-600" /> Odometer
          </span>
          <p className="text-xs font-black text-slate-800 mt-1">
            {event.mileage !== null ? (
              <span className="font-mono">{event.mileage.toLocaleString()} mi</span>
            ) : (
              <span className="text-slate-400 font-sans italic text-[11px]">Not reported</span>
            )}
          </p>
        </div>
      </div>

      {/* Geo Location or non-geographic warning */}
      {event.location ? (
        <div className="flex items-center gap-2 mt-3 text-slate-850 bg-blue-50/25 px-3 py-2 rounded-none border-2 border-black">
          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-xs font-extrabold text-slate-800">{event.location}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3 text-slate-700 bg-slate-50 px-3 py-2 rounded-none border-2 border-black">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span className="text-[10px] font-bold italic">Non-geographic online event</span>
        </div>
      )}

      {/* Specific Bulletin Details / list of lines */}
      {event.details && event.details.length > 0 && (
        <div className="mt-4">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Itemized Bulletins</p>
          <ul className="space-y-1.5">
            {event.details.map((detail, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="w-1 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Embedded damage visual feedback diagram */}
      {event.damageLocations && event.damageLocations.length > 0 && (
        <div className="mt-2.5">
          <CarDamageDiagram damageLocations={event.damageLocations} />
        </div>
      )}

      {/* Salvage Auction Premium Gallery */}
      {event.type === 'sale' && event.title.toLowerCase().includes('auction') && vehicle.auctionHistory && vehicle.auctionHistory.length > 0 && (
        <AuctionGallery
          vin={vehicle.vin}
          isUnlocked={!!vehicle.isPremiumUnlocked}
          auctionRecord={vehicle.auctionHistory[0]}
        />
      )}

      {/* Service vendor source coordinates & ratings cards */}
      {event.source && (
        <div className="mt-auto pt-4 border-t-2 border-black mt-4">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">Information Source</p>
          <div className="bg-[#FAF9F6] p-3 rounded-none border-2 border-black">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-xs font-extrabold text-slate-800 truncate">{event.source}</p>
              </div>
              
              {/* Star ratings if present */}
              {event.rating && (
                <div className="flex items-center gap-0.5 bg-amber-400/20 text-amber-950 px-1.5 py-0.5 rounded-none border border-black text-[10px] font-black flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{event.rating}</span>
                </div>
              )}
            </div>

            {/* Vendor Phone call contacts */}
            {event.phone && (
              <div className="flex items-center gap-1.2 mt-2 text-slate-700 text-[11px] font-bold">
                <Phone className="w-3 h-3 text-slate-500" />
                <a href={`tel:${event.phone}`} className="hover:text-blue-600 transition-colors">
                  {event.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
