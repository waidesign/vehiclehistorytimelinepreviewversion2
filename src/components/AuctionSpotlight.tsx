import { useState } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { AuctionSalesRecord } from '../types';
import { Gavel, MapPin, AlertTriangle, ArrowRight, Flame } from 'lucide-react';

interface AuctionSpotlightProps {
  records: AuctionSalesRecord[];
  vehicleLabel: string;
}

export default function AuctionSpotlight({ records, vehicleLabel }: AuctionSpotlightProps) {
  const { vehicles, activeVehicleId, setActiveEventId } = useTimelineStore();
  const vehicle = vehicles.find((v) => v.id === activeVehicleId);

  // Only consider records that have photos
  const photoRecords = records.filter((r) => r.photos && r.photos.length > 0);
  if (photoRecords.length === 0) return null;

  const [activeRecordIdx] = useState(0);

  const record = photoRecords[activeRecordIdx];
  const photos = record.photos;

  const totalPhotos = photoRecords.reduce((sum, r) => sum + r.photos.length, 0);

  const handleViewFullRecord = () => {
    if (!vehicle) return;
    // Find the auction-type sale event and activate it so EventDetailPanel shows the gallery
    const auctionEvent = vehicle.events.find(
      (e) => e.type === 'sale' && e.title.toLowerCase().includes('auction')
    );
    if (auctionEvent) {
      setActiveEventId(auctionEvent.id);
      // Scroll to event detail panel
      setTimeout(() => {
        document.getElementById('event-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const recordDate = new Date(record.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className="flex items-center gap-3 bg-white border-2 border-black px-3 py-2 shadow-brutal-sm">

      {/* Badge */}
      <div className="flex-shrink-0 flex items-center gap-1 bg-rose-600 border border-black px-2 py-1">
        <Flame className="w-2.5 h-2.5 text-white fill-white animate-pulse" />
        <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">
          {record.kind === 'auction' ? 'Auction' : 'Sale'} · {totalPhotos} Photos
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
        {photos.slice(0, 6).map((photo, idx) => (
          <button
            key={photo.id}

            className={`flex-shrink-0 w-10 h-7 overflow-hidden border transition-all ${
              idx === 0 ? 'border-black' : 'border-black/20'
            }`}
          >
            <img src={photo.url} alt="" referrerPolicy="no-referrer" className={`w-full h-full object-cover ${idx !== 0 ? 'blur-sm' : ''}`} />
          </button>
        ))}
        {photos.length > 6 && (
          <div className="flex-shrink-0 w-10 h-7 bg-slate-100 border border-black/20 flex items-center justify-center">
            <span className="text-[8px] font-black text-slate-600">+{photos.length - 6}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Gavel className="w-3 h-3 text-rose-500 flex-shrink-0" />
          <span className="text-[10px] font-black text-slate-900 truncate">{vehicleLabel}</span>
        </div>
        {record.location && (
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-2.5 h-2.5 text-rose-500" />
            <span className="text-[9px] font-bold text-slate-600 truncate">{record.location}</span>
          </div>
        )}
        {record.primaryDamage && (
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-600 capitalize">{record.primaryDamage}</span>
          </div>
        )}
        <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">{recordDate}</span>
      </div>

      {/* CTA */}
      <button
        onClick={handleViewFullRecord}
        className="flex-shrink-0 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 border border-black text-white font-black text-[9px] uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer"
      >
        View Record <ArrowRight className="w-3 h-3" />
      </button>

    </section>
  );
}
