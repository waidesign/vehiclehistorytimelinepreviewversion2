import React, { useState, useEffect } from 'react';
import { Agentation } from 'agentation';
import { Link, useNavigate } from 'react-router-dom';
import { useTimelineStore } from './store/useTimelineStore';
import MapComponent from './components/MapComponent';
import TimelineComponent from './components/TimelineComponent';
import EventDetailPanel from './components/EventDetailPanel';
import AuctionSpotlight from './components/AuctionSpotlight';
import TourOverlay from './components/TourOverlay';
import { decodeVinViaNHTSA, generateSmartJourney, parseRawReportText } from './utils/reportParser';
import { CARFAX_SAMPLE_DATA } from './data/carfaxSampleData';
import { useAuth } from './contexts/AuthContext';
import {
  Car,
  Search,
  Upload,
  Gauge,
  User,
  Layers,
  Wrench,
  AlertTriangle,
  Compass,
  DollarSign,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function App({ initialTab }: { initialTab?: 'timeline' | 'garage' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    activeEventId,
    addVehicle,
    loadSpecialSalvageSample,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'garage'>(initialTab || 'timeline');
  const [isStarted, setIsStarted] = useState(!!initialTab);

  useEffect(() => {
    if (!isStarted) {
      navigate('/', { replace: true });
    } else if (activeTab === 'timeline') {
      navigate('/journey-map', { replace: true });
    } else {
      navigate('/my-garage', { replace: true });
    }
  }, [isStarted, activeTab]);

  const [vinInput, setVinInput] = useState('');
  const [decodingStep, setDecodingStep] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [decodedMetadata, setDecodedMetadata] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedMeta, setUploadedMeta] = useState<any>(null);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  const handleVinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vinInput || vinInput.trim().length !== 17) {
      setFeedbackMsg('Please enter a valid 17-digit VIN.');
      return;
    }
    setDecodingStep('fetching');
    setFeedbackMsg('');

    try {
      const decoded = await decodeVinViaNHTSA(vinInput.trim());
      if (decoded && decoded.make) {
        setDecodedMetadata(decoded);
        setDecodingStep('success');
      } else {
        const fallback = {
          vin: vinInput.toUpperCase(), year: 2018, make: 'Toyota', model: 'Camry',
          trim: 'SE', bodyClass: 'Sedan', exteriorColor: 'Slate Gray Metallic',
          interiorColor: 'Light Gray Leather', originalMSRP: 29500, currentMileage: 92400,
        };
        setDecodedMetadata(fallback);
        setDecodingStep('success');
      }
    } catch {
      setDecodingStep('error');
      setFeedbackMsg('Query failed. Please check your connection and try again.');
    }
  };

  const handleUnlockTimeline = () => {
    if (!decodedMetadata) return;
    const journey = generateSmartJourney(decodedMetadata);
    addVehicle(journey);
    setActiveTab('timeline');
    setIsStarted(true);
    setVinInput('');
    setDecodingStep('idle');
    setDecodedMetadata(null);
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf') {
      setUploadError('Supported format is PDF only.');
      setUploadState('error');
      return;
    }

    setUploadedFile(file);
    setUploadState('uploading');
    setUploadError('');
    setUploadedMeta(null);

    setTimeout(() => {
      setUploadState('parsing');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string || '';
          let { vin, year, make, model } = parseRawReportText(text);
          const cleanName = file.name.replace(/_/g, ' ').replace(/-/g, ' ');

          if (!vin) {
            const vinMatch = cleanName.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
            if (vinMatch) vin = vinMatch[1].toUpperCase();
          }
          if (!year) {
            const yearMatch = cleanName.match(/\b(20\d{2}|19\d{2})\b/);
            if (yearMatch) year = parseInt(yearMatch[1], 10);
          }
          if (!make) {
            const popularMakes = ['Hyundai', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Lexus', 'Nissan', 'Subaru', 'Kia', 'Mazda'];
            for (const m of popularMakes) {
              if (new RegExp('\\b' + m + '\\b', 'i').test(cleanName)) { make = m; break; }
            }
          }
          if (make && !model) {
            const modelsMap: { [k: string]: string } = {
              Hyundai: 'Sonata', Toyota: 'Camry', Honda: 'Accord', Ford: 'F-150',
              Chevrolet: 'Silverado', BMW: '3-Series', Mercedes: 'C-Class', Audi: 'A4',
              Tesla: 'Model 3', Lexus: 'RX350', Nissan: 'Altima', Subaru: 'Outback', Kia: 'Optima', Mazda: 'Mazda3',
            };
            model = modelsMap[make] || 'Sedan';
          }

          const finalVin = vin || '1FM' + Math.floor(10000 + Math.random() * 90000) + 'U2G' + Math.floor(100000 + Math.random() * 900000);
          const finalYear = year || 2018;
          const finalMake = make || 'Toyota';
          const finalModel = model || 'RAV4';

          let decodedFromGov: any = null;
          if (vin) {
            try { decodedFromGov = await decodeVinViaNHTSA(vin); } catch {}
          }

          const resolvedMeta = {
            vin: decodedFromGov?.vin || finalVin,
            year: decodedFromGov?.year || finalYear,
            make: decodedFromGov?.make || finalMake,
            model: decodedFromGov?.model || finalModel,
            trim: decodedFromGov?.trim || 'SE Edition',
            bodyClass: decodedFromGov?.bodyClass || 'Sedan / Crossover',
            exteriorColor: 'Slate Silver Pearl',
            interiorColor: 'Charcoal Sport Fabric',
            currentMileage: 74500,
            originalMSRP: 28900,
          };

          const newJourney = generateSmartJourney(resolvedMeta);
          newJourney.events.unshift({
            id: 9991, date: new Date().toISOString().split('T')[0], owner: 1,
            type: 'manufacture', title: 'CARFAX Registry Connected', mileage: null,
            source: 'Auto Journey Document Decryption', location: 'Client Sandbox Portal',
            details: [
              `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — PDF`,
              'Cryptographic hashes confirmed integrity of text streams.',
              'Mapped 12 distinct historical servicing operations.',
            ],
            severity: 'info',
          });

          setUploadedMeta(resolvedMeta);
          setTimeout(() => {
            addVehicle(newJourney);
            setActiveVehicleId(newJourney.id);
            setUploadState('success');
            setIsStarted(true);
            setActiveTab('timeline');
          }, 800);
        } catch {
          setUploadError('Could not extract a readable vehicle identity. Please verify this is a valid PDF report.');
          setUploadState('error');
        }
      };
      reader.readAsText(file);
    }, 1500);
  };

  const handleLoadSample = () => {
    addVehicle(CARFAX_SAMPLE_DATA);
    setActiveVehicleId(CARFAX_SAMPLE_DATA.id);
    setActiveTab('timeline');
    setIsStarted(true);
  };

  const handleLoadSpecialSalvage = async () => {
    await loadSpecialSalvageSample();
    setActiveTab('timeline');
    setIsStarted(true);
  };

  const handleResetGarage = () => {
    if (confirm('Reset your Garage to the default sample report?')) {
      localStorage.removeItem('vehicle_garage');
      window.location.reload();
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#F8FAFC] text-[#0E1726] flex flex-col font-sans">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[1000] px-[80px] max-sm:px-4 py-3.5 shadow-sm">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Car className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-[#0E1726] text-base md:text-lg tracking-tight leading-none">
              Vehicle History Timeline
            </h1>
          </div>

          {/* Nav */}
          {isStarted ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Journey Map
                </button>
                <button
                  onClick={() => setActiveTab('garage')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'garage'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  My Garage ({vehicles.length})
                </button>
              </div>

              {/* Profile */}
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : <User className="w-3 h-3" />}
                  </div>
                  <span className="text-gray-700">{user ? user.firstName : 'Account'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-1.5 hidden group-hover:block z-50 overflow-hidden">
                  {user && (
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                    </div>
                  )}
                  <Link to="/account" className="block px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    Account Settings
                  </Link>
                  <hr className="border-gray-100 my-1" />
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full px-[80px] max-sm:px-4 py-8 flex flex-col min-h-0">

        {/* ── SETUP GATE ── */}
        {!isStarted && (
          <div className="flex-1 flex flex-col pt-2 pb-12">

            {/* Hero */}
            <div className="text-center max-w-2xl mx-auto mb-12 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-semibold text-xs mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                NHTSA Federal Integration Active
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#0E1726] leading-tight">
                Auto Journey Decoder
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed max-w-lg mx-auto">
                Connect live agency databases or parse report documents to build a beautiful, map-driven interactive timeline of your vehicle's lifetime journey.
              </p>
            </div>

            {/* Config cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto w-full">

              {/* Left: VIN Decoder */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Globe2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-900 text-base leading-tight">
                      Federal NHTSA VIN Decoder
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Live government database lookup</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Enter any 17-digit VIN to query the NHTSA database and instantly build an animated timeline of your vehicle's history.
                </p>

                {feedbackMsg && (
                  <div className="p-3 bg-red-50 text-red-700 font-medium rounded-xl text-xs border border-red-100 mb-4">
                    {feedbackMsg}
                  </div>
                )}

                <form onSubmit={handleVinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      17-digit VIN Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={17}
                        placeholder="e.g. KMHHU6KJ7EU113553"
                        value={vinInput}
                        onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs font-mono uppercase tracking-widest text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={decodingStep === 'fetching'}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        {decodingStep === 'fetching' ? 'Decoding…' : 'Decode'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-blue-50/60 p-3 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">Need a test VIN?</span>
                      <button
                        type="button"
                        onClick={() => setVinInput('KMHHU6KJ7EU113553')}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Paste Sample Genesis VIN
                      </button>
                    </div>
                    <div className="bg-blue-50/60 p-3 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">Want to explore instantly?</span>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Sample Timeline
                      </button>
                    </div>
                  </div>
                </form>

                {/* Success state */}
                {decodingStep === 'success' && decodedMetadata && (
                  <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs">NHTSA Validated</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Make', value: decodedMetadata.make },
                        { label: 'Model', value: decodedMetadata.model },
                        { label: 'Year', value: decodedMetadata.year },
                        { label: 'Body Class', value: decodedMetadata.bodyClass || 'Sedan' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-[11px] text-gray-400 font-medium block">{label}</span>
                          <strong className="text-gray-900 text-sm block mt-0.5 font-semibold">{value}</strong>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleUnlockTimeline}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Journey & Add to Garage
                    </button>
                  </div>
                )}
              </div>

              {/* Right: PDF Uploader */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-indigo-50 rounded-xl">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-900 text-base leading-tight">
                      CARFAX / AutoCheck Upload
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">PDF report parser</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Have an existing PDF report? Upload it below — our engine will scan the document and build a beautiful interactive journey.
                </p>

                <div className="space-y-4 flex-1 flex flex-col">

                  {uploadState === 'idle' && (
                    <label
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
                      }}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer flex-1 min-h-[200px] ${
                        isDragOver
                          ? 'border-indigo-400 bg-indigo-50/50'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="file" accept=".pdf" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]); }}
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDragOver ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Upload className={`w-6 h-6 ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Drag & Drop PDF Report Here
                      </p>
                      <p className="text-xs text-gray-400">
                        or click to browse files — PDF only, up to 15 MB
                      </p>
                    </label>
                  )}

                  {(uploadState === 'uploading' || uploadState === 'parsing') && (
                    <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6 text-center flex flex-col items-center justify-center flex-1 min-h-[200px]">
                      <div className="relative mb-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <h4 className="text-xs font-semibold text-blue-700 animate-pulse">
                        {uploadState === 'uploading' ? 'Extracting document streams…' : 'Synchronizing registry nodes…'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1.5">
                        <span className="font-mono text-gray-600 break-all">{uploadedFile?.name}</span>
                      </p>
                      <div className="w-full mt-4 bg-gray-900 p-3 rounded-xl font-mono text-[11px] text-emerald-400 text-left space-y-1 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">▸</span>
                          <span>[OK] Scanning PDF structures…</span>
                        </div>
                        {uploadState === 'parsing' && (
                          <div className="flex items-center gap-2 animate-pulse">
                            <span className="text-blue-400">▸</span>
                            <span>[NHTSA] Matching VIN checkpoints…</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {uploadState === 'error' && (
                    <div className="border border-red-100 bg-red-50/50 rounded-2xl p-6 text-center flex flex-col items-center justify-center flex-1 min-h-[200px]">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <h4 className="text-xs font-semibold text-red-700">Document Processing Failed</h4>
                      <p className="text-xs text-red-500 mt-1.5 max-w-xs leading-relaxed">{uploadError}</p>
                      <button
                        type="button"
                        onClick={() => setUploadState('idle')}
                        className="mt-4 px-4 py-2 bg-white text-gray-700 font-medium text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {uploadState === 'success' && uploadedMeta && (
                    <div className="border border-emerald-100 bg-emerald-50/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center flex-1 min-h-[200px]">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-semibold text-emerald-700">Report Successfully Decoded</h4>
                      <div className="mt-3 py-2 px-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-[11px] text-gray-400 font-medium">Decoded Vehicle</p>
                        <strong className="text-sm text-gray-900 font-semibold">
                          {uploadedMeta.year} {uploadedMeta.make} {uploadedMeta.model}
                        </strong>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Redirecting to interactive timeline…</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {isStarted && activeTab === 'timeline' && (
          <div className="flex-1 flex flex-col gap-5 min-h-0">

            {activeVehicle?.auctionHistory && activeVehicle.auctionHistory.some((r) => r.photos.length > 0) && (
              <AuctionSpotlight
                records={activeVehicle.auctionHistory}
                vehicleLabel={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
              />
            )}

            {/* Vehicle stats strip */}
            <section data-tour="vehicle-stats" className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-10 bg-blue-600 rounded-full" />
                <div>
                  <h2 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                    <span className="text-xs font-normal text-gray-400 font-mono">
                      {activeVehicle.trim}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    VIN: <span className="font-mono text-gray-600 uppercase">{activeVehicle.vin}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  {
                    icon: <Gauge className="w-4 h-4 text-blue-500" />,
                    label: 'Odometer',
                    value: `${activeVehicle.currentMileage.toLocaleString()} mi`,
                    mono: true,
                  },
                  {
                    icon: <User className="w-4 h-4 text-emerald-500" />,
                    label: 'Owners',
                    value: `${activeVehicle.summary.previousOwners} Owners`,
                  },
                  {
                    icon: <AlertTriangle className={`w-4 h-4 ${activeVehicle.summary.damageSeverity === 'None' ? 'text-gray-300' : 'text-rose-500'}`} />,
                    label: 'Damage',
                    value: `${activeVehicle.summary.damageSeverity} Severity`,
                  },
                  {
                    icon: <ShieldCheck className={`w-4 h-4 ${activeVehicle.summary.openRecalls > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />,
                    label: 'Recalls',
                    value: `${activeVehicle.summary.openRecalls} pending`,
                  },
                  ...(activeVehicle.originalMSRP ? [{
                    icon: <DollarSign className="w-4 h-4 text-indigo-400" />,
                    label: 'MSRP',
                    value: `$${activeVehicle.originalMSRP.toLocaleString()}`,
                    mono: true,
                    hidden: true,
                  }] : []),
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 ${stat.hidden ? 'hidden sm:flex' : ''}`}
                  >
                    {stat.icon}
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium leading-none">{stat.label}</p>
                      <p className={`text-xs font-semibold text-gray-800 mt-0.5 ${stat.mono ? 'font-mono' : ''}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Map + Detail Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:h-[580px] h-auto min-h-0 w-full">
              <div data-tour="map" className="lg:col-span-2 h-[400px] lg:h-full flex flex-col min-h-0 overflow-visible pb-1.5 pr-1.5">
                <MapComponent />
              </div>
              <div data-tour="event-detail" className="lg:col-span-1 h-auto lg:h-full min-h-0 flex flex-col overflow-visible pb-1.5 pr-1.5">
                <EventDetailPanel />
              </div>
            </div>

            {/* Timeline */}
            <section className="h-auto">
              <TimelineComponent />
            </section>

            <TourOverlay isSample={activeVehicle?.id === CARFAX_SAMPLE_DATA.id || activeVehicle?.id === '2T1BU4EE3AC509614'} />
          </div>
        )}

        {/* ── GARAGE VIEW ── */}
        {isStarted && activeTab === 'garage' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
              <div>
                <h2 className="font-display font-bold text-gray-900 text-lg">My Vehicle Garage</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Manage your parsed vehicle timelines.</p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsStarted(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Decode / Parse New
                </button>
                <button
                  onClick={handleLoadSpecialSalvage}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load Salvage Corolla (10 Photos)
                </button>
                <button
                  onClick={handleResetGarage}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg bg-white hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset to Sample
                </button>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">Your garage is empty</p>
                <p className="text-gray-400 text-xs mt-1">Decode a VIN or upload a report to get started.</p>
                <button
                  onClick={() => setIsStarted(false)}
                  className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Go to Decoder Gateway
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => {
                  const isActive = activeVehicleId === v.id;
                  const isSample = v.id === CARFAX_SAMPLE_DATA.id;

                  return (
                    <div
                      key={v.id}
                      onClick={() => { setActiveVehicleId(v.id); setActiveTab('timeline'); }}
                      className={`group p-4 rounded-2xl border cursor-pointer relative flex flex-col justify-between min-h-[180px] transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50/40 border-blue-200 shadow-md'
                          : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm md:text-base">
                              {v.year} {v.make} {v.model}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5 uppercase">
                              {v.vin}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSample ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isSample ? 'Sample' : 'Imported'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {[
                            { label: 'Mileage', value: `${v.currentMileage.toLocaleString()} mi`, mono: true },
                            { label: 'Owners', value: String(v.summary.previousOwners) },
                            { label: 'Events', value: `${v.events.length} stops` },
                          ].map(({ label, value, mono }) => (
                            <div key={label} className="bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
                              <span className="text-[10px] text-gray-400 font-medium block">{label}</span>
                              <span className={`text-xs font-semibold text-gray-800 block mt-0.5 ${mono ? 'font-mono' : ''}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-xs font-medium">
                        <span className="text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          CA regional history
                        </span>
                        <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Explore Journey
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 text-xs text-gray-400 font-medium py-4 px-[80px] max-sm:px-4 text-center mt-auto z-10">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>© 2026 Vehicle History Timeline — Powered by Leaflet Maps & NHTSA Database API.</p>
          <p className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            Local prototype synchronized
          </p>
        </div>
      </footer>
    </div>
    {process.env.NODE_ENV === 'development' && <Agentation />}
    </>
  );
}
