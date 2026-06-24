import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { AuctionSalesRecord, VehiclePhoto } from '../types';
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  Coins,
  Gauge,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface AuctionGalleryProps {
  vin: string;
  isUnlocked: boolean;
  auctionRecord: AuctionSalesRecord;
}

export default function AuctionGallery({ vin, isUnlocked, auctionRecord }: AuctionGalleryProps) {
  const { unlockPremiumForVin } = useTimelineStore();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'contact' | 'payment' | 'success'>('contact');
  const [txnCode] = useState(() => `TXN-${Math.floor(10000 + Math.random() * 90000)}`);

  // Checkout form fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardZip, setCardZip] = useState('');

  // Lightbox Zoom & Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const photos = auctionRecord.photos || [];
  const activePhoto = photos[activePhotoIndex] || photos[0];

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, activePhotoIndex]);

  const handleNext = () => {
    if (!isUnlocked) {
      triggerUpsell();
      return;
    }
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    resetZoom();
  };

  const handlePrev = () => {
    if (!isUnlocked) {
      triggerUpsell();
      return;
    }
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    resetZoom();
  };

  const selectThumbnail = (idx: number) => {
    if (!isUnlocked && idx !== 0) {
      triggerUpsell();
      return;
    }
    setActivePhotoIndex(idx);
    resetZoom();
  };

  const triggerUpsell = () => {
    setCheckoutOpen(true);
    setCheckoutStep('form');
  };

  const openLightbox = () => {
    if (!isUnlocked) {
      triggerUpsell();
      return;
    }
    setLightboxOpen(true);
    resetZoom();
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const nextZoom = Math.max(z - 0.5, 1);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const toggleZoomPercent = () => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2.5);
    }
  };

  // Click & Drag pan listeners for Lightbox window
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Bounds check to lock overflowing boundaries roughly
    const maxBoundX = (zoom - 1) * 200;
    const maxBoundY = (zoom - 1) * 150;
    setPan({
      x: Math.max(-maxBoundX, Math.min(maxBoundX, newX)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, newY))
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 0.2, 4));
    } else {
      setZoom((z) => {
        const nextZoom = Math.max(z - 0.2, 1);
        if (nextZoom === 1) setPan({ x: 0, y: 0 });
        return nextZoom;
      });
    }
  };

  // Checkout process simulation
  const handleProcessUnlock = () => {
    setIsProcessingCheckout(true);
    setTimeout(() => {
      setIsProcessingCheckout(false);
      setCheckoutStep('success');
      unlockPremiumForVin(vin);
    }, 2200);
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const resetCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutStep('contact');
    setContactName(''); setContactEmail('');
    setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardZip('');
  };

  return (
    <div id="auction-gallery-wrapper" className="flex flex-col gap-4 mt-1 border-t border-slate-100 pt-4">
      
      {/* Title & Stats Deck */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-rose-600">
            Copart/IAAI Salvage Auction Archive
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 font-semibold">
          Actual salvage pool record associated with historic insurance claim.
        </p>
      </div>

      {/* Main Image Viewport Wrapper */}
      <div className="relative group rounded-none overflow-hidden border-2 border-black bg-slate-900 aspect-video flex items-center justify-center shadow-brutal">
        
        {/* Waterfall or Main Photo */}
        <img
          src={activePhoto.url}
          alt={activePhoto.caption || "Salvage record"}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover select-none transition-all duration-300 ${
            !isUnlocked && activePhotoIndex !== 0 ? 'blur-xl select-none scale-90' : 'hover:scale-[1.02]'
          }`}
        />

        {/* Source Watermark indicator overlay */}
        <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-none flex items-center gap-1 border-2 border-black">
          <Lock className="w-2 h-2 text-rose-400" /> Insurer Salvage Feed
        </div>

        {/* Photo Category Overlay tag */}
        <div className="absolute bottom-2 left-2 bg-slate-900 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-none border-2 border-black">
          {activePhoto.category} {activePhoto.isDamage && <span className="text-red-400 ml-1">✦ collision</span>}
        </div>

        {/* Maximize Icon */}
        <button
          onClick={openLightbox}
          className="absolute top-2 right-2 p-1.5 rounded-none bg-black hover:bg-slate-800 text-white transition-all border-2 border-black"
          title="Open Lightbox Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Pagination Chevrons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-none bg-black hover:bg-slate-850 text-white border-2 border-black"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-none bg-black hover:bg-slate-850 text-white border-2 border-black"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Locked Image Block Modal overlay */}
        {!isUnlocked && activePhotoIndex !== 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer" onClick={triggerUpsell}>
            <div className="p-3 bg-red-500/20 text-red-500 rounded-none border-2 border-black mb-2 shadow-brutal-sm">
              <Lock className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-white text-xs font-black uppercase tracking-wider">Premium Image Locked</p>
            <p className="text-[10px] text-slate-350 max-w-[200px] mt-1 font-bold">Upgrade report now to view remaining 9 salvage photos showing rear-end frame collision results.</p>
          </div>
        )}
      </div>

      {/* Caption indicator bar */}
      <div className="bg-slate-50 border-2 border-black rounded-none p-2 flex items-center justify-between gap-2">
        <p className="text-slate-600 text-[10px] font-semibold italic truncate">
          "{activePhoto.caption || "No photo description provided"}"
        </p>
        <span className="text-slate-400 font-mono text-[9px] flex-shrink-0">
          {activePhotoIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Row of interactive thumbnails (exactly 10 photos) */}
      <div className="grid grid-cols-5 gap-1.5">
        {photos.map((photo, idx) => {
          const isThumbnailLocked = !isUnlocked && idx !== 0;
          const isActive = idx === activePhotoIndex;
          return (
            <div
              key={photo.id}
              onClick={() => selectThumbnail(idx)}
              className={`relative aspect-video rounded-none overflow-hidden bg-slate-100 border-2 transition-all cursor-pointer ${
                isActive ? 'border-black scale-[1.03] z-10' : 'border-slate-300'
              } hover:border-black hover:scale-[1.01]`}
            >
              <img
                src={photo.url}
                alt="thumbnail"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${isThumbnailLocked ? 'blur-[4px] opacity-60' : ''}`}
              />

              {isThumbnailLocked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-white/90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Technical Data Rail info box */}
      <div className="bg-slate-50 p-3 rounded-none border-2 border-black flex flex-col gap-2.5">
        
        {/* Core items list */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          
          {/* Location field with map connection */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-rose-500" /> Auction Location
            </span>
            <button
              onClick={() => {
                // Flash locator on Map (Already flies there)
                const scrollWrapper = document.getElementById('map-scroll-panel');
                if (scrollWrapper) {
                  scrollWrapper.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="font-bold text-slate-800 text-left hover:text-blue-600 underline decoration-dotted underline-offset-2 transition-colors"
            >
              {auctionRecord.location || "N/A"}
            </button>
          </div>

          {/* Odometer decl */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Gauge className="w-2.5 h-2.5 text-blue-500" /> Odometer Declared
            </span>
            <p className="font-mono font-bold text-slate-800">
              {auctionRecord.odometer ? (
                <>
                  {auctionRecord.odometer.toLocaleString()} mi
                  {auctionRecord.odometerNote && (
                    <span className="block text-[9px] font-sans text-amber-600 font-normal mt-0.5">
                      ⚠ {auctionRecord.odometerNote}
                    </span>
                  )}
                </>
              ) : "N/A"}
            </p>
          </div>

          {/* Winning Price sold */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Coins className="w-2.5 h-2.5 text-emerald-500" /> Winning Auction Bid
            </span>
            <p className="font-bold text-slate-850">
              {isUnlocked ? (
                <span className="text-emerald-700 font-extrabold text-xs">
                  ${auctionRecord.price?.toLocaleString()} USD
                </span>
              ) : (
                <span className="text-slate-400 inline-flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> [Locked]
                </span>
              )}
            </p>
          </div>

          {/* Runs / Drives state */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
              Vehicle Condition
            </span>
            <p className="font-bold text-slate-755 truncate">
              {isUnlocked ? (
                <span className="text-slate-800 text-[10px]">
                  Runs: {auctionRecord.condition?.runsAndDrives ? "Yes" : "No"} • Keys: {auctionRecord.condition?.hasKeys ? "Yes" : "No"}
                </span>
              ) : (
                <span className="text-slate-400 inline-flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> [Locked]
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Damage diagnosis block */}
        <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-1.5 text-[10px]">
          <div>
            <span className="text-slate-400 uppercase tracking-widest text-[7px] font-extrabold block">Primary Damage</span>
            <p className="text-slate-800 font-extrabold capitalize text-[10.5px]">
              {auctionRecord.primaryDamage || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-widest text-[7px] font-extrabold block">Secondary Damage</span>
            <p className="text-slate-700 font-semibold capitalize text-[10px]">
              {auctionRecord.secondaryDamage || "None"}
            </p>
          </div>
        </div>
      </div>

      {/* LOCKED UPSELL CTA SECTION (If locked) */}
      {!isUnlocked && (
        <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-4 rounded-xl border border-rose-100 flex flex-col gap-3.5 shadow-sm">
          <div className="flex gap-2.5">
            <div className="p-2.5 bg-rose-500 rounded-xl text-white self-start">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-xs font-black text-[#0D0101] uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> Unlock Copart Salvage Database Records
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-600 font-semibold">
                An active auction listing with 10 actual photograph records was logged for this VIN in <span className="font-bold text-rose-600">{auctionRecord.location}</span>. Access standard interior chassis details, engine-damage inspections, tire specs, and odometer proofs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 border-t border-rose-200/50 pt-3">
            <div className="flex items-center gap-1.5 flex-1 select-none">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] text-slate-500 font-semibold">Risk free 100% satisfaction guarantee. Secure transactions.</span>
            </div>
            <button
              onClick={triggerUpsell}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-lg hover:from-rose-700 hover:to-orange-700 text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              Get Premium Report ($14.99)
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX FULLSCREEN OVERLAY PORTAL CONTAINER */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between p-4 md:p-6 no-scrollbar touch-none select-none"
          onWheel={handleWheel}
        >
          {/* Lightbox Header Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Salvage High-Resolution Record
              </p>
              <h4 className="text-xs font-extrabold text-white truncate max-w-sm md:max-w-md">
                {activePhoto.caption || `${activePhoto.category} photo — index ${activePhotoIndex + 1}`}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded" title="Zoom Out">
                  <ZoomOut className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="text-[10px] font-mono font-bold w-12 text-center text-slate-200">
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded" title="Zoom In">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </button>
                {zoom > 1 && (
                  <button onClick={resetZoom} className="p-1 hover:bg-rose-500/20 text-rose-400 rounded ml-1" title="Reset Zoom">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={closeLightbox}
                className="px-3 py-1 bg-white/10 hover:bg-red-600 text-white font-extrabold rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Lightbox Center viewport */}
          <div
            className="flex-1 w-full flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {/* Prev picture */}
            <button
              onClick={handlePrev}
              className="absolute left-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo core image tag with dynamic transforms */}
            <div
              className="transition-transform duration-75 ease-out select-none pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] max-w-[85vw] md:max-w-[70vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                onClick={toggleZoomPercent}
              />
            </div>

            {/* Next picture */}
            <button
              onClick={handleNext}
              className="absolute right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Guide Tip Overlay */}
            <div className="absolute bottom-4 bg-white/10 backdrop-blur px-3 py-1 rounded text-[10px] text-slate-350 select-none">
              Use <kbd className="bg-white/20 px-1 rounded">←</kbd> and <kbd className="bg-white/20 px-1 rounded">→</kbd> to browse • Use <kbd className="bg-white/20 px-1 rounded">Scroll</kbd> or <kbd className="bg-white/20 px-1 rounded">Double-Click</kbd> to zoom • Drag to pan • <kbd className="bg-white/20 px-1 rounded">Esc</kbd> to leave
            </div>
          </div>

          {/* Lightbox bottom thumbnails row */}
          <div className="w-full max-w-4xl flex gap-1.5 overflow-x-auto justify-center pb-2 pt-2 border-t border-white/10">
            {photos.map((photo, idx) => (
              <div
                key={`light_${photo.id}`}
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-14 aspect-video rounded overflow-hidden cursor-pointer flex-shrink-0 transition-opacity ${
                  idx === activePhotoIndex ? 'border border-blue-500 scale-105 opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
              >
                <img src={photo.url} alt="light thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-none border-2 border-black shadow-brutal flex flex-col max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-black p-4 text-white border-b-2 border-black flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-white/70">Secure Checkout</span>
                </div>
                <h3 className="font-display font-extrabold text-sm text-white">
                  Premium Report — $14.99
                </h3>
              </div>
              <button
                onClick={resetCheckout}
                className="text-white/60 hover:text-white font-extrabold text-xs border border-white/20 hover:border-white px-2 py-1 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Step progress bar */}
            {checkoutStep !== 'success' && (
              <div className="flex border-b-2 border-black">
                {(['contact', 'payment'] as const).map((step, idx) => {
                  const isActive = checkoutStep === step;
                  const isDone = (step === 'contact' && checkoutStep === 'payment');
                  return (
                    <div key={step} className={`flex-1 flex items-center gap-2 px-4 py-2.5 border-r-2 border-black last:border-r-0 ${isActive ? 'bg-black text-white' : isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                      <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center text-[9px] font-black flex-shrink-0 ${isActive ? 'border-white bg-white text-black' : isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider">{step === 'contact' ? 'Contact' : 'Payment'}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order summary strip */}
            {checkoutStep !== 'success' && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#FAF9F6] border-b-2 border-black">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-800">Complete Salvage Media & Bids Unlock</p>
                  <p className="text-[9px] text-slate-500 font-mono">VIN: {vin}</p>
                </div>
                <span className="font-black text-slate-900 text-sm flex-shrink-0">$14.99</span>
              </div>
            )}

            {/* ── STEP 1: Contact ── */}
            {checkoutStep === 'contact' && (
              <form
                className="p-5 flex flex-col gap-4"
                onSubmit={(e) => { e.preventDefault(); setCheckoutStep('payment'); }}
              >
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-3">Your Details</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">Email Address</label>
                      <input
                        required
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Your receipt and access link will be sent here.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t-2 border-black pt-4">
                  <p className="text-[9px] tracking-wider uppercase font-black text-slate-400 mb-1">What you unlock:</p>
                  {['10 High-res salvage photographs', 'Actual winning auction bid price', 'Odometer tamper evaluation', 'Insurance title & salvage details'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-[10px] text-slate-700 font-semibold">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black hover:bg-slate-800 text-white rounded-none border-2 border-black text-xs font-black uppercase tracking-widest shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Payment <Sparkles className="w-3.5 h-3.5" />
                </button>
                <p className="text-[9px] text-center text-slate-400">256-bit SSL encrypted · No data stored on servers</p>
              </form>
            )}

            {/* ── STEP 2: Payment ── */}
            {checkoutStep === 'payment' && (
              <form
                className="p-5 flex flex-col gap-4"
                onSubmit={(e) => { e.preventDefault(); handleProcessUnlock(); }}
              >
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-3">Card Details</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">Card Number</label>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">Expiry</label>
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">CVV</label>
                        <input
                          required
                          type="password"
                          inputMode="numeric"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1">ZIP</label>
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          value={cardZip}
                          onChange={(e) => setCardZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          placeholder="90210"
                          maxLength={5}
                          className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accepted cards */}
                <div className="flex items-center gap-2">
                  {['VISA', 'MC', 'AMEX', 'DISC'].map((c) => (
                    <span key={c} className="text-[8px] font-black border-2 border-black px-1.5 py-0.5 text-slate-600 bg-slate-50">{c}</span>
                  ))}
                  <div className="flex items-center gap-1 ml-auto text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-bold">SSL Secured</span>
                  </div>
                </div>

                <div className="flex gap-2 border-t-2 border-black pt-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('contact')}
                    className="px-4 py-2.5 border-2 border-black text-xs font-black uppercase text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingCheckout}
                    className="flex-1 py-2.5 bg-black hover:bg-slate-800 disabled:opacity-50 text-white rounded-none border-2 border-black text-xs font-black uppercase tracking-widest shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingCheckout ? (
                      <><Clock className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                    ) : (
                      <>Pay $14.99 <Lock className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-center text-slate-400">Sandbox demo — no real charge will occur</p>
              </form>
            )}

            {/* ── STEP 3: Success ── */}
            {checkoutStep === 'success' && (
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 border-2 border-black flex items-center justify-center shadow-brutal-sm">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#0E1726]">Payment Approved!</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1 max-w-[280px] leading-relaxed">
                    All {auctionRecord.photoCount} salvage photos and premium records are now unlocked for this VIN.
                  </p>
                </div>

                <div className="w-full bg-emerald-50 border-2 border-black p-3 text-left flex flex-col gap-1">
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700">Transaction Confirmed</p>
                  <p className="text-[10px] font-mono font-black text-slate-800">{txnCode}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Receipt sent to {contactEmail || 'your email'}</p>
                </div>

                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={resetCheckout}
                    className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-black border-2 border-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all uppercase text-xs tracking-wider"
                  >
                    View Unlocked Gallery
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
