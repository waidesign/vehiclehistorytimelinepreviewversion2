import { useEffect, useRef } from 'react';
import { useTimelineStore, TimelineFilter, isEventMatchingFilter } from '../store/useTimelineStore';
import { VehicleEvent } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  Factory,
  Tag,
  Store,
  Wrench,
  FileText,
  ScrollText,
  ShieldAlert,
  AlertTriangle,
  BadgeCheck,
  Users,
  Gauge,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export const EVENT_TYPE_META: Record<string, { icon: any; label: string; bg: string; text: string }> = {
  manufacture:   { icon: Factory,      label: 'Factory',         bg: 'bg-gray-100',    text: 'text-gray-500' },
  sale:          { icon: Tag,           label: 'Sale',            bg: 'bg-indigo-50',   text: 'text-indigo-600' },
  listing:       { icon: Store,         label: 'Listing',         bg: 'bg-blue-50',     text: 'text-blue-600' },
  service:       { icon: Wrench,        label: 'Service',         bg: 'bg-emerald-50',  text: 'text-emerald-600' },
  registration:  { icon: FileText,      label: 'Registration',    bg: 'bg-gray-50',     text: 'text-gray-500' },
  title:         { icon: ScrollText,    label: 'Title issued',    bg: 'bg-teal-50',     text: 'text-teal-600' },
  recall:        { icon: ShieldAlert,   label: 'Recall',          bg: 'bg-amber-50',    text: 'text-amber-600' },
  damage:        { icon: AlertTriangle, label: 'Damage incident', bg: 'bg-rose-50',     text: 'text-rose-500' },
  accident:      { icon: AlertTriangle, label: 'Accident',        bg: 'bg-rose-50',     text: 'text-rose-500' },
  inspection:    { icon: BadgeCheck,    label: 'Inspection',      bg: 'bg-emerald-50',  text: 'text-emerald-600' },
  ownerChange:   { icon: Users,         label: 'Ownership swap',  bg: 'bg-blue-50',     text: 'text-blue-600' },
  odometer:      { icon: Gauge,         label: 'Odometer logged', bg: 'bg-gray-100',    text: 'text-gray-500' },
};

export default function TimelineComponent() {
  const {
    vehicles, activeVehicleId, activeEventId, orientation, isPlaying, playbackSpeed,
    filter, setActiveEventId, setOrientation, setIsPlaying, setPlaybackSpeed, setFilter,
    nextEvent, prevEvent,
  } = useTimelineStore();

  const activeRailRef = useRef<HTMLDivElement>(null);
  const vehicle = vehicles.find((v) => v.id === activeVehicleId);
  if (!vehicle) return null;

  const events = vehicle.events;
  const activeIndex = events.findIndex((e) => e.id === activeEventId);
  const activeEvent = events[activeIndex] || events[0];

  useEffect(() => {
    if (orientation === 'horizontal' && activeRailRef.current) {
      const el = activeRailRef.current.querySelector(`[data-event-id="${activeEventId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeEventId, orientation]);

  useEffect(() => {
    if (!isPlaying) return;
    const delay = playbackSpeed === 0.5 ? 4000 : playbackSpeed === 1 ? 2500 : 1250;
    const interval = setInterval(() => nextEvent(), delay);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, nextEvent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextEvent();
      else if (e.key === 'ArrowLeft') prevEvent();
      else if (e.key === ' ') { e.preventDefault(); setIsPlaying(!isPlaying); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEvent, prevEvent, isPlaying, setIsPlaying]);

  const filterTabs: { id: TimelineFilter; label: string; count: number }[] = [
    { id: 'all',          label: 'All Events',         count: events.length },
    { id: 'service',      label: 'Service & Checks',   count: events.filter((e) => e.type === 'service' || e.type === 'inspection').length },
    { id: 'ownership',    label: 'Ownership & DMV',    count: events.filter((e) => ['manufacture','sale','listing','registration','title','ownerChange','odometer'].includes(e.type)).length },
    { id: 'damage_recall',label: 'Accidents & Recalls', count: events.filter((e) => ['damage','accident','recall'].includes(e.type)).length },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm relative overflow-hidden">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4 z-10">

        {/* Filter tabs */}
        <div data-tour="timeline-filters" className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const isTabActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isTabActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Playback + orientation */}
        <div className="flex items-center flex-wrap gap-2">

          {/* Orientation toggle */}
          <div data-tour="playback" className="flex bg-gray-100 rounded-xl p-1">
            {(['horizontal', 'vertical'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOrientation(o)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                  orientation === o ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {/* Play/speed */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 transition-all flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                : <Play className="w-3.5 h-3.5 text-gray-500" />
              }
            </button>
            <div className="w-px h-4 bg-gray-200" />
            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                  playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline track */}
      <div data-tour="timeline-track" className={`flex-1 relative flex flex-col justify-center transition-all duration-200 ${
        orientation === 'horizontal' ? 'min-h-[230px]' : 'min-h-[195px]'
      }`}>

        {/* HORIZONTAL */}
        {orientation === 'horizontal' ? (
          <div
            ref={activeRailRef}
            className="w-full overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth pt-8 pb-24 relative"
          >
            <div className="flex items-center min-w-max gap-6 px-12 relative">
              {/* Track line */}
              <div className="absolute left-[83px] right-[83px] h-0.5 top-[calc(50%-1px)] z-0">
                <div className="w-full h-full bg-gray-200" />
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300 origin-left"
                  style={{ width: events.length > 1 ? `${(activeIndex / (events.length - 1)) * 100}%` : '0%' }}
                />
              </div>

              {events.map((evt, idx) => {
                const matchesFilter = isEventMatchingFilter(evt, filter);
                const isActive = evt.id === activeEventId;
                const Meta = EVENT_TYPE_META[evt.type] || EVENT_TYPE_META.manufacture;
                const IconComponent = Meta.icon;
                const dateObj = new Date(evt.date);
                const formattedMonthYear = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                return (
                  <div
                    key={evt.id}
                    data-event-id={evt.id}
                    onClick={() => setActiveEventId(evt.id)}
                    className={`flex flex-col items-center justify-center flex-shrink-0 cursor-pointer min-w-[70px] relative transition-all duration-300 ${
                      matchesFilter ? 'opacity-100 scale-100' : 'opacity-20 scale-90'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold mb-2 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {formattedMonthYear}
                    </span>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10 ${Meta.bg} ${Meta.text} ${
                      isActive
                        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md scale-110'
                        : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <IconComponent className="w-4 h-4" />

                      {(evt.severity === 'warning' || evt.severity === 'alert') && (
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          evt.severity === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                        }`} />
                      )}
                    </div>

                    <div className="absolute top-[80px] w-36 text-center pointer-events-none">
                      {isActive && (
                        <p className="text-[10px] font-semibold text-gray-800 line-clamp-2 leading-tight bg-white px-2 py-1.5 rounded-xl shadow-md border border-gray-100 z-20">
                          {evt.title}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VERTICAL */
          <div className="max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth border border-gray-200 bg-gray-50/50 rounded-2xl">
            <div className="relative px-4 py-4 min-h-full">
              <div className="absolute z-0 left-[42px] top-[42px] bottom-[42px] w-0.5 bg-gray-200" />
              <div className="space-y-3 relative z-10">
                {events.map((evt) => {
                  const matchesFilter = isEventMatchingFilter(evt, filter);
                  const isActive = evt.id === activeEventId;
                  const Meta = EVENT_TYPE_META[evt.type] || EVENT_TYPE_META.manufacture;
                  const IconComponent = Meta.icon;
                  const d = new Date(evt.date);
                  const readableDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setActiveEventId(evt.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        matchesFilter ? 'opacity-100' : 'opacity-20'
                      } ${isActive
                        ? 'bg-white border border-blue-200 shadow-sm'
                        : 'border border-transparent hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all border relative z-10 ${
                        isActive
                          ? `${Meta.bg} ${Meta.text} border-blue-200 shadow-sm`
                          : 'border-gray-200 text-gray-400 bg-white'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-blue-600' : 'text-gray-800'}`}>
                            {evt.title}
                          </h4>
                          <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{readableDate}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {evt.location && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                              {evt.location}
                            </span>
                          )}
                          {evt.mileage !== null && (
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                              <Gauge className="w-2.5 h-2.5" />
                              {evt.mileage.toLocaleString()} mi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between gap-4 z-10 bg-white">
        <button
          onClick={prevEvent}
          className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:shadow-sm text-gray-600 transition-all disabled:opacity-30 disabled:pointer-events-none"
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            Active Record
          </p>
          <h3 className="font-display font-semibold text-gray-900 text-sm md:text-base mt-0.5">
            {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        <button
          onClick={nextEvent}
          className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:shadow-sm text-gray-600 transition-all disabled:opacity-30 disabled:pointer-events-none"
          disabled={activeIndex === events.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
