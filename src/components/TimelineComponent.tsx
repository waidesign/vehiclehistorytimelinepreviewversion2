import { useEffect, useRef, useState } from 'react';
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
  Filter,
  RefreshCw,
  Clock,
  Eye,
  Calendar
} from 'lucide-react';

// Meta mapping for event types to icons and primary colors
export const EVENT_TYPE_META: Record<string, { icon: any; label: string; bg: string; text: string }> = {
  manufacture: { icon: Factory, label: 'Factory', bg: 'bg-slate-100', text: 'text-slate-600' },
  sale: { icon: Tag, label: 'Sale', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  listing: { icon: Store, label: 'Listing', bg: 'bg-blue-50', text: 'text-blue-600' },
  service: { icon: Wrench, label: 'Service', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  registration: { icon: FileText, label: 'Registration', bg: 'bg-slate-50', text: 'text-slate-600' },
  title: { icon: ScrollText, label: 'Title issued', bg: 'bg-teal-50', text: 'text-teal-600' },
  recall: { icon: ShieldAlert, label: 'Recall', bg: 'bg-amber-50', text: 'text-amber-600 font-bold' },
  damage: { icon: AlertTriangle, label: 'Damage incident', bg: 'bg-rose-50', text: 'text-rose-600 font-bold' },
  accident: { icon: AlertTriangle, label: 'Accident', bg: 'bg-rose-50', text: 'text-rose-600 font-bold' },
  inspection: { icon: BadgeCheck, label: 'Inspection', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ownerChange: { icon: Users, label: 'Ownership swap', bg: 'bg-blue-50', text: 'text-blue-600' },
  odometer: { icon: Gauge, label: 'Odometer logged', bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function TimelineComponent() {
  const {
    vehicles,
    activeVehicleId,
    activeEventId,
    orientation,
    isPlaying,
    playbackSpeed,
    filter,
    setActiveEventId,
    setOrientation,
    setIsPlaying,
    setPlaybackSpeed,
    setFilter,
    nextEvent,
    prevEvent,
  } = useTimelineStore();

  const activeRailRef = useRef<HTMLDivElement>(null);

  const vehicle = vehicles.find((v) => v.id === activeVehicleId);
  if (!vehicle) return null;

  const events = vehicle.events;

  // Find active event index
  const activeIndex = events.findIndex((e) => e.id === activeEventId);
  const activeEvent = events[activeIndex] || events[0];

  // Auto Scroll horizontal slider to keep active item in view
  useEffect(() => {
    if (orientation === 'horizontal' && activeRailRef.current) {
      const activeElement = activeRailRef.current.querySelector(`[data-event-id="${activeEventId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeEventId, orientation]);

  // Autoplay functionality loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      const delay = playbackSpeed === 0.5 ? 4000 : playbackSpeed === 1 ? 2500 : 1250;
      interval = setInterval(() => {
        nextEvent();
      }, delay);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, nextEvent]);

  // Keyboard navigation listeners support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid yanking window on workspace editing
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight') {
        nextEvent();
      } else if (e.key === 'ArrowLeft') {
        prevEvent();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextEvent, prevEvent, isPlaying, setIsPlaying]);

  // Recharts mileage Sparkline preparations
  const sparklineData = events
    .filter((e) => e.mileage !== null)
    .map((e) => ({
      name: e.date,
      mileage: e.mileage as number,
      eventId: e.id,
    }));

  // Cluster events by year for timeline grouping
  const eventsByYear = events.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, VehicleEvent[]>);

  const years = Object.keys(eventsByYear).map(Number).sort((a, b) => a - b);

  // Group filter selections helpers
  const filterTabs: { id: TimelineFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Events', count: events.length },
    {
      id: 'service',
      label: 'Service & Checks',
      count: events.filter((e) => e.type === 'service' || e.type === 'inspection').length,
    },
    {
      id: 'ownership',
      label: 'Ownership & DMV',
      count: events.filter((e) =>
        ['manufacture', 'sale', 'listing', 'registration', 'title', 'ownerChange', 'odometer'].includes(e.type)
      ).length,
    },
    {
      id: 'damage_recall',
      label: 'Accidents & Recalls',
      count: events.filter((e) => ['damage', 'accident', 'recall'].includes(e.type)).length,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-none p-4 md:p-5 border-2 border-black shadow-brutal relative overflow-hidden">
      
      {/* Top filter controls, navigation togglers and playback speeds */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-4 z-10">
        
        {/* State Filters */}
        <div className="flex flex-wrap items-center gap-1.5" id="timeline-filters">
          {filterTabs.map((tab) => {
            const isTabActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-none text-xs font-black transition-all duration-200 flex items-center gap-1.5 border-2 border-black ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-brutal-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950 hover:translate-x-[1px] hover:translate-y-[1px]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-none font-black border border-black/30 ${
                    isTabActive ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Playback + axis switches */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Timeline Axis Toggles */}
          <div className="flex bg-slate-50 rounded-none p-0.5 border-2 border-black">
            <button
              onClick={() => setOrientation('horizontal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-none flex items-center gap-1 border-2 transition-all ${
                orientation === 'horizontal'
                  ? 'bg-white border-black text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Horizontal
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-none flex items-center gap-1 border-2 transition-all ${
                orientation === 'vertical'
                  ? 'bg-white border-black text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Vertical
            </button>
          </div>

          {/* Autoplay controllers */}
          <div className="flex items-center bg-slate-50 rounded-none p-0.5 border-2 border-black">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-none hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center`}
              title={isPlaying ? 'Pause Autoplay' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-blue-600 fill-blue-600" /> : <Play className="w-3.5 h-3.5 text-slate-600" />}
            </button>
            
            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-1 text-[9px] font-extrabold rounded-none border-2 transition-all ${
                  playbackSpeed === spd
                    ? 'bg-blue-600 text-white border-black shadow-brutal-xs'
                    : 'border-transparent text-slate-400 hover:text-slate-705'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main timeline track container */}
      <div className={`flex-1 relative flex flex-col justify-center transition-all duration-200 ${
        orientation === 'horizontal' ? 'min-h-[230px]' : 'min-h-[195px]'
      }`}>
        

        {/* 1. HORIZONTAL TIMELINE ORIENTATION FLOW */}
        {orientation === 'horizontal' ? (
          <div
            ref={activeRailRef}
            className="w-full overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth pt-8 pb-24 z-1 relative"
          >
            <div className="flex items-center min-w-max gap-6 px-12 relative">
              {/* Horizontal Line background spanning */}
              <div className="absolute left-[83px] right-[83px] h-0.5 top-[calc(50%-1px)] z-0">
                <div className="w-full h-full bg-black"></div>
                <div
                  className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-300 origin-left"
                  style={{
                    width: events.length > 1 ? `${(activeIndex / (events.length - 1)) * 100}%` : '0%',
                  }}
                ></div>
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
                    {/* Date indicator above */}
                    <span
                      className={`text-[9px] font-black mb-2 transition-colors ${
                        isActive ? 'text-blue-650 font-black scale-110' : 'text-slate-500'
                      }`}
                    >
                      {formattedMonthYear}
                    </span>

                    {/* Dot trigger point */}
                    <div
                      className={`w-10 h-10 rounded-none flex items-center justify-center transition-all duration-300 relative z-10 ${Meta.bg} ${Meta.text} ${
                        isActive 
                          ? 'border-2 border-black shadow-brutal-sm scale-110 bg-[#FAF9F6] text-black' 
                          : 'border-2 border-black/30 hover:border-black'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      
                      {/* Tiny notification bead for warnings/alerts */}
                      {(evt.severity === 'warning' || evt.severity === 'alert') && (
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-none border border-black ${
                          evt.severity === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                        }`}></span>
                      )}
                    </div>

                    {/* Tiny title summary beneath on active */}
                    <div className="absolute top-[80px] w-32 text-center pointer-events-none">
                      {isActive && (
                        <p className="text-[10px] font-extrabold text-slate-900 line-clamp-2 leading-tight bg-white px-1.5 py-1 rounded-none shadow-brutal-sm border-2 border-black z-20">
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
          
          /* 2. VERTICAL ORIENTATION FLOW - Beautiful scrollable vertical threadline */
          <div className="max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth border-2 border-black bg-slate-50 rounded-none">
            <div className="relative px-4 py-4 min-h-full">
              {/* Vertical line that spans perfectly along the scrollable content from center of first to center of last item */}
              <div className="absolute z-0 left-[42px] top-[42px] bottom-[42px] w-0.5 bg-black"></div>

              <div className="space-y-4 relative z-10">
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
                      className={`flex items-start gap-4 p-2 rounded-none cursor-pointer transition-all duration-200 border-2 ${
                        matchesFilter ? 'opacity-100' : 'opacity-20'
                      } ${isActive ? 'bg-white border-black shadow-brutal-sm scale-[1.01]' : 'border-transparent hover:bg-slate-200/50'}`}
                    >
                      {/* Icon Column aligned to vertical spline */}
                      <div
                        className={`w-9 h-9 rounded-none flex-shrink-0 flex items-center justify-center transition-all border-2 relative z-10 ${
                          isActive
                            ? 'bg-[#FAF9F6] text-black border-black shadow-brutal-xs scale-105'
                            : 'border-black/30 text-slate-600 bg-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-black truncate ${isActive ? 'text-blue-650' : 'text-slate-900'}`}>
                            {evt.title}
                          </h4>
                          <span className="text-[9px] font-black text-slate-500 whitespace-nowrap">{readableDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {evt.location && (
                            <span className="text-[9px] bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded-none border border-black/30 font-bold">
                              {evt.location}
                            </span>
                          )}
                          {evt.mileage !== null && (
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5 font-bold">
                              <Gauge className="w-2.5 h-2.5 text-black" />
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

      {/* Stepper bar docked at lower edge of the spine */}
      <div className="border-t-2 border-black pt-3.5 mt-auto flex items-center justify-between gap-4 z-10 bg-white">
        
        {/* Left Arrow Controls */}
        <button
          onClick={prevEvent}
          className="p-2 border-2 border-black rounded-none bg-white hover:bg-slate-100 active:translate-x-[1px] active:translate-y-[1px] text-slate-900 hover:text-black transition-colors disabled:opacity-30 shadow-brutal-xs disabled:pointer-events-none"
          disabled={activeIndex === 0}
          title="Go to previous event"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Date Display */}
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            Active Record Date
          </p>
          <h3 className="font-display font-black text-slate-950 text-sm md:text-base mt-0.5 flex items-center justify-center gap-1.5">
            {new Date(activeEvent.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
        </div>

        {/* Right Arrow Controls */}
        <button
          onClick={nextEvent}
          className="p-2 border-2 border-black rounded-none bg-white hover:bg-slate-100 active:translate-x-[1px] active:translate-y-[1px] text-slate-900 hover:text-black transition-colors disabled:opacity-30 shadow-brutal-xs disabled:pointer-events-none"
          disabled={activeIndex === events.length - 1}
          title="Go to next event"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
