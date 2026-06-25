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
  ShieldAlert,
} from 'lucide-react';

export default function EventDetailPanel() {
  const { vehicles, activeVehicleId, activeEventId } = useTimelineStore();

  const vehicle = vehicles.find((v) => v.id === activeVehicleId);
  if (!vehicle) return null;

  const event = vehicle.events.find((e) => e.id === activeEventId);
  if (!event) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-400 text-sm font-medium">Select an event to view details</p>
      </div>
    );
  }

  const Meta = EVENT_TYPE_META[event.type] || EVENT_TYPE_META.manufacture;
  const IconComponent = Meta.icon;

  const severityConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    info:      { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'General Record' },
    good:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Positive Record' },
    highlight: { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Key Milestone' },
    warning:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Action Required' },
    alert:     { bg: 'bg-rose-50',     text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'Alert Flag' },
  };

  const sev = severityConfig[event.severity] || severityConfig.info;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-5 border border-gray-200 shadow-sm overflow-y-auto no-scrollbar">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${Meta.bg} ${Meta.text}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Category</p>
            <p className="text-xs font-semibold text-gray-700 capitalize leading-tight">{event.type}</p>
          </div>
        </div>

        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${sev.bg} ${sev.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
          {sev.label}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display font-bold text-gray-900 text-base md:text-lg tracking-tight leading-snug">
        {event.title}
      </h2>

      {/* Date + Mileage */}
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mb-1">
            <Calendar className="w-2.5 h-2.5 text-blue-500" /> Date
          </span>
          <p className="text-xs font-semibold text-gray-800">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mb-1">
            <Gauge className="w-2.5 h-2.5 text-emerald-500" /> Odometer
          </span>
          <p className="text-xs font-semibold text-gray-800">
            {event.mileage !== null
              ? <span className="font-mono">{event.mileage.toLocaleString()} mi</span>
              : <span className="text-gray-400 font-normal italic text-[11px]">Not reported</span>
            }
          </p>
        </div>
      </div>

      {/* Location */}
      {event.location ? (
        <div className="flex items-center gap-2 mt-3 bg-blue-50/50 px-3 py-2.5 rounded-xl border border-blue-100">
          <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700">{event.location}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
          <ShieldAlert className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 italic">Non-geographic online event</span>
        </div>
      )}

      {/* Bulletins */}
      {event.details && event.details.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2.5">Details</p>
          <ul className="space-y-2">
            {event.details.map((detail, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Damage diagram */}
      {event.damageLocations && event.damageLocations.length > 0 && (
        <div className="mt-3">
          <CarDamageDiagram damageLocations={event.damageLocations} />
        </div>
      )}

      {/* Auction gallery */}
      {event.type === 'sale' && event.title.toLowerCase().includes('auction') && vehicle.auctionHistory?.length > 0 && (
        <AuctionGallery
          vin={vehicle.vin}
          isUnlocked={!!vehicle.isPremiumUnlocked}
          auctionRecord={vehicle.auctionHistory[0]}
        />
      )}

      {/* Source */}
      {event.source && (
        <div className="mt-auto pt-4 border-t border-gray-100 mt-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Source</p>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-gray-700 truncate">{event.source}</p>
              </div>
              {event.rating && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 text-[10px] font-semibold flex-shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  {event.rating}
                </div>
              )}
            </div>
            {event.phone && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-medium">
                <Phone className="w-3 h-3" />
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
