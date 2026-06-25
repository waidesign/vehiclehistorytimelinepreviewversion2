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

  const photoRecords = records.filter((r) => r.photos && r.photos.length > 0);
  if (photoRecords.length === 0) return null;

  const [activeRecordIdx] = useState(0);
  const record = photoRecords[activeRecordIdx];
  const photos = record.photos;
  const totalPhotos = photoRecords.reduce((sum, r) => sum + r.photos.length, 0);

  const handleViewFullRecord = () => {
    if (!vehicle) return;
    const auctionEvent = vehicle.events.find(
      (e) => e.type === 'sale' && e.title.toLowerCase().includes('auction')
    );
    if (auctionEvent) {
      setActiveEventId(auctionEvent.id);
      setTimeout(() => {
        document.getElementById('event-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const recordDate = new Date(record.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <section className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">

      {/* Badge */}
      <div className="flex-shrink-0 flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-xl">
        <Flame className="w-3 h-3 fill-white animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">
          {record.kind === 'auction' ? 'Auction' : 'Sale'} · {totalPhotos} Photos
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {photos.slice(0, 6).map((photo, idx) => (
          <div
            key={photo.id}
            className={`flex-shrink-0 w-10 h-7 overflow-hidden rounded-lg border ${
              idx === 0 ? 'border-gray-300' : 'border-gray-200'
            }`}
          >
            <img
              src={photo.url} alt=""
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${idx !== 0 ? 'blur-sm' : ''}`}
            />
          </div>
        ))}
        {photos.length > 6 && (
          <div className="flex-shrink-0 w-10 h-7 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-gray-500">+{photos.length - 6}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Gavel className="w-3 h-3 text-rose-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-800 truncate">{vehicleLabel}</span>
        </div>
        {record.location && (
          <div className="hidden sm:flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{record.location}</span>
          </div>
        )}
        {record.primaryDamage && (
          <div className="hidden md:flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-xs text-gray-500 capitalize">{record.primaryDamage}</span>
          </div>
        )}
        <span className="text-xs text-gray-400 flex-shrink-0">{recordDate}</span>
      </div>

      {/* CTA */}
      <button
        onClick={handleViewFullRecord}
        className="flex-shrink-0 flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
      >
        View Record <ArrowRight className="w-3 h-3" />
      </button>
    </section>
  );
}
