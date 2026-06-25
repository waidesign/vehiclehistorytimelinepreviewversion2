import { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';

type TourPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string | null;
  position: TourPosition;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Vehicle History Timeline',
    description: "Let's take a quick tour of the key sections. You'll learn how to explore a vehicle's complete history in seconds.",
    target: null,
    position: 'center',
  },
  {
    id: 'vehicle-stats',
    title: 'Vehicle Summary Bar',
    description: 'Key facts at a glance — total mileage, number of previous owners, damage severity, and any open safety recalls.',
    target: 'vehicle-stats',
    position: 'bottom',
  },
  {
    id: 'map',
    title: 'Interactive Journey Map',
    description: 'Every city the vehicle visited is plotted here. Red markers flag accidents or damage events. The blue path traces its route through time.',
    target: 'map',
    position: 'bottom',
  },
  {
    id: 'event-detail',
    title: 'Event Detail Panel',
    description: 'Click any event in the timeline to see the full record — exact date, odometer reading, location, and a complete log of what happened.',
    target: 'event-detail',
    position: 'bottom',
  },
  {
    id: 'timeline-filters',
    title: 'Filter by Category',
    description: 'Focus on what matters. Filter to see only Service & Checks, Ownership & DMV records, or Accidents & Recalls — each showing an event count.',
    target: 'timeline-filters',
    position: 'bottom',
  },
  {
    id: 'timeline-track',
    title: 'Chronological Timeline',
    description: 'All events laid out in time order. The blue progress bar tracks your position. Click any icon to jump to that event instantly.',
    target: 'timeline-track',
    position: 'top',
  },
  {
    id: 'playback',
    title: 'Auto-Playback Controls',
    description: 'Press play to animate through the history automatically. Adjust speed with 0.5×, 1×, or 2×. Or use ← → arrow keys to step manually.',
    target: 'playback',
    position: 'top',
  },
];

export const TOUR_COMPLETED_KEY = 'vht_tour_completed';
const PADDING = 10;
const TOOLTIP_WIDTH = 304;
const TOOLTIP_EST_HEIGHT = 200;
const GAP = 14;

async function scrollAndGetRect(targetId: string | null): Promise<DOMRect | null> {
  if (!targetId) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${targetId}"]`);
  if (!el) return null;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await new Promise((res) => setTimeout(res, 380));
  return el.getBoundingClientRect();
}

function getRectSync(targetId: string | null): DOMRect | null {
  if (!targetId) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${targetId}"]`);
  return el?.getBoundingClientRect() ?? null;
}

function getTooltipStyle(rect: DOMRect | null, hint: TourPosition): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gutter = 12;

  if (!rect || hint === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TOOLTIP_WIDTH,
    };
  }

  const cx = Math.max(
    gutter,
    Math.min(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, vw - TOOLTIP_WIDTH - gutter),
  );
  const spaceBelow = vh - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;

  // For left/right hints on large viewports, try side placement
  if (hint === 'right' && rect.right + GAP + TOOLTIP_WIDTH < vw - gutter) {
    return {
      position: 'fixed',
      top: Math.max(gutter, Math.min(rect.top, vh - TOOLTIP_EST_HEIGHT - gutter)),
      left: rect.right + GAP,
      width: TOOLTIP_WIDTH,
    };
  }
  if (hint === 'left' && rect.left - GAP - TOOLTIP_WIDTH > gutter) {
    return {
      position: 'fixed',
      top: Math.max(gutter, Math.min(rect.top, vh - TOOLTIP_EST_HEIGHT - gutter)),
      right: vw - rect.left + GAP,
      width: TOOLTIP_WIDTH,
    };
  }

  // For top/bottom hints, respect hint but fall back based on available space
  const preferBelow = hint === 'bottom' || (hint !== 'top' && spaceBelow >= spaceAbove);

  if (preferBelow && spaceBelow >= TOOLTIP_EST_HEIGHT) {
    return { position: 'fixed', top: rect.bottom + GAP, left: cx, width: TOOLTIP_WIDTH };
  }
  if (!preferBelow && spaceAbove >= TOOLTIP_EST_HEIGHT) {
    return { position: 'fixed', bottom: vh - rect.top + GAP, left: cx, width: TOOLTIP_WIDTH };
  }
  // Fall back to whichever side has more room
  if (spaceBelow >= spaceAbove) {
    return { position: 'fixed', top: rect.bottom + GAP, left: cx, width: TOOLTIP_WIDTH };
  }
  return { position: 'fixed', bottom: vh - rect.top + GAP, left: cx, width: TOOLTIP_WIDTH };
}

interface TourOverlayProps {
  isSample: boolean;
}

export default function TourOverlay({ isSample }: TourOverlayProps) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[stepIndex];

  useEffect(() => {
    const done = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!done || isSample) {
      const t = setTimeout(() => setIsActive(true), 750);
      return () => clearTimeout(t);
    }
  }, [isSample]);

  const loadRect = useCallback(async () => {
    if (!step) return;
    const r = await scrollAndGetRect(step.target);
    setRect(r);
  }, [step]);

  useEffect(() => {
    if (!isActive) return;
    setRect(null);
    loadRect();
  }, [isActive, stepIndex, loadRect]);

  useEffect(() => {
    if (!isActive) return;
    const onResize = () => setRect(getRectSync(step.target));
    const onScroll = () => setRect(getRectSync(step.target));
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isActive, step?.target]);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, '1');
    setIsActive(false);
  };

  if (!isActive || !step) return null;

  const isCenter = step.position === 'center';
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const p = PADDING;
  const tooltipStyle = getTooltipStyle(rect, step.position);

  return (
    <div className="fixed inset-0 z-[9000]" style={{ pointerEvents: 'none' }}>
      {/* Spotlight SVG backdrop */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <mask id="vht-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {!isCenter && rect && (
              <rect
                x={rect.left - p}
                y={rect.top - p}
                width={rect.width + p * 2}
                height={rect.height + p * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.58)" mask="url(#vht-tour-mask)" />
        {!isCenter && rect && (
          <rect
            x={rect.left - p}
            y={rect.top - p}
            width={rect.width + p * 2}
            height={rect.height + p * 2}
            rx="12"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
          />
        )}
      </svg>

      {/* Pass-through zone so highlighted element stays interactive */}
      {!isCenter && rect && (
        <div
          className="absolute"
          style={{
            left: rect.left - p,
            top: rect.top - p,
            width: rect.width + p * 2,
            height: rect.height + p * 2,
            pointerEvents: 'auto',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{ ...tooltipStyle, pointerEvents: 'auto' }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{step.title}</h3>
            </div>
            <button
              onClick={handleDone}
              aria-label="Close tour"
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed mb-4">{step.description}</p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-4 h-1.5 bg-blue-600'
                    : i < stepIndex
                    ? 'w-1.5 h-1.5 bg-blue-300'
                    : 'w-1.5 h-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">
              {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDone}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLast ? 'Done!' : 'Next'}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
