import { AlertTriangle } from 'lucide-react';

interface CarDamageProps {
  damageLocations?: string[];
}

export default function CarDamageDiagram({ damageLocations = [] }: CarDamageProps) {
  // Normalize checking helper
  const hasDamage = (zone: string) => damageLocations.includes(zone);

  return (
    <div className="w-full flex flex-col items-center p-3 bg-rose-50/30 rounded-none border-2 border-black my-2">
      <div className="flex items-center gap-1.5 self-start text-rose-800 mb-2">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Impact Zones Visualizer</span>
      </div>

      <div className="relative w-full max-w-[200px] h-[220px] flex items-center justify-center">
        {/* Render a beautiful architectural top-down car vector */}
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINES FOR GLOW AND GLASS PATTERNS */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND ROAD TRACK LINES */}
          <line x1="20" y1="10" x2="20" y2="190" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="80" y1="10" x2="80" y2="190" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />

          {/* MAIN CAR SHADOW OUTLINE */}
          <rect x="23" y="18" width="54" height="164" rx="16" fill="none" stroke="#E2E8F0" strokeWidth="3" />

          {/* CAR TIRES */}
          {/* Front Left Tire */}
          <rect x="18" y="42" width="10" height="24" rx="4" fill="#334155" />
          {/* Front Right Tire */}
          <rect x="72" y="42" width="10" height="24" rx="4" fill="#334155" />
          {/* Rear Left Tire */}
          <rect x="18" y="142" width="10" height="24" rx="4" fill="#334155" />
          {/* Rear Right Tire */}
          <rect x="72" y="142" width="10" height="24" rx="4" fill="#334155" />

          {/* CAR SHELL CHASSIS */}
          <rect x="24" y="20" width="52" height="160" rx="14" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.5" />

          {/* WINDSHIELDS & GLASSROOF */}
          {/* Front Windshield */}
          <path d="M 30,70 L 70,70 Q 64,54 50,54 Q 36,54 30,70" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Rear Windshield */}
          <path d="M 32,150 L 68,150 Q 62,160 50,160 Q 38,160 32,150" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Glass Side Roof Windows */}
          <rect x="29" y="78" width="4" height="64" rx="1" fill="#E2E8F0" />
          <rect x="67" y="78" width="4" height="64" rx="1" fill="#E2E8F0" />

          {/* SIDE MIRRORS */}
          <rect x="17" y="65" width="8" height="5" rx="1" fill="#94A3B8" />
          <rect x="75" y="65" width="8" height="5" rx="1" fill="#94A3B8" />

          {/* INTERIOR FRONT DASH SEATS */}
          <circle cx="40" cy="90" r="3" fill="#cbd5e1" />
          <circle cx="60" cy="90" r="3" fill="#cbd5e1" />

          {/* ===================== DAMAGE OVERLAYS ===================== */}
          
          {/* 1. FRONT ZONE */}
          <path
            d="M 30,21 L 50,16 L 70,21 Q 50,30 30,21 Z"
            fill={hasDamage('front') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('front') ? '0.75' : '0'}
            stroke={hasDamage('front') ? '#F43F5E' : 'transparent'}
            strokeWidth="2"
            className={hasDamage('front') ? 'animate-pulse' : ''}
          />

          {/* 2. LEFT SIDE */}
          <path
            d="M 23,45 L 23,135 Q 28,90 28,45 Z"
            fill={hasDamage('left-side') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('left-side') ? '0.75' : '0'}
            stroke={hasDamage('left-side') ? '#E11D48' : 'transparent'}
            strokeWidth="2"
          />

          {/* 3. RIGHT SIDE */}
          <path
            d="M 77,45 L 77,135 Q 72,90 72,45 Z"
            fill={hasDamage('right-side') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('right-side') ? '0.8' : '0'}
            stroke={hasDamage('right-side') ? '#E11D48' : '#cbd5e1'}
            strokeWidth={hasDamage('right-side') ? '2.5' : '1'}
            style={hasDamage('right-side') ? { filter: 'url(#glow)' } : {}}
          />

          {/* 4. REAR IMPACT ZONE */}
          <path
            d="M 30,179 L 50,184 L 70,179 Q 50,170 30,179 Z"
            fill={hasDamage('rear') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('rear') ? '0.75' : '0'}
            stroke={hasDamage('rear') ? '#F43F5E' : 'transparent'}
            strokeWidth="2"
          />

          {/* 5. RIGHT REAR Impact */}
          <path
            d="M 64,152 Q 77,156 77,174 L 64,178 Z"
            fill={hasDamage('right-rear') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('right-rear') ? '0.9' : '0'}
            stroke={hasDamage('right-rear') ? '#E11D48' : '#cbd5e1'}
            strokeWidth={hasDamage('right-rear') ? '2.5' : '1'}
            style={hasDamage('right-rear') ? { filter: 'url(#glow)' } : {}}
            className={hasDamage('right-rear') ? 'animate-pulse' : ''}
          />

          {/* 6. LEFT REAR Impact */}
          <path
            d="M 36,152 Q 23,156 23,174 L 36,178 Z"
            fill={hasDamage('left-rear') ? '#F43F5E' : 'transparent'}
            fillOpacity={hasDamage('left-rear') ? '0.75' : '0'}
            stroke={hasDamage('left-rear') ? '#F43F5E' : 'transparent'}
            strokeWidth="2"
          />
        </svg>

        {/* Floating Indicator Lines mapping actual damage description */}
        <div className="absolute top-26 right-0 bg-rose-600 text-white rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase animate-pulse">
          {damageLocations.join(' & ')}
        </div>
      </div>

      <div className="text-center mt-1">
        <p className="text-[10px] text-slate-500">
          Cosmetic scrapes and scuffs on <strong className="text-rose-700">Right Rear Quarter Corner</strong> and <strong className="text-rose-700">Right Passenger Doors</strong>.
        </p>
      </div>
    </div>
  );
}
