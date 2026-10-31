import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { PillButton } from './PillButton';

export interface BranchLocation {
  id: string;
  city: string;
  title: string;
  subtitle: string;
  address: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  hours: string;
  features: string[];
}

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: 'paris',
    city: 'Paris',
    title: 'Flagship Marais Atelier',
    subtitle: 'The Historic Botanical Organ & Private Extraction Vault',
    address: '24 Rue de Sévigné, 75004 Paris',
    country: 'France',
    coordinates: {
      lat: 48.8575,
      lng: 2.3622,
    },
    phone: '+33 1 42 78 30 12',
    hours: 'Tuesday – Saturday: 11:00 – 19:30 CET',
    features: ['Bespoke Formulation Salon', 'Archival Fragrance Library', 'Private Consultation Suites'],
  },
  {
    id: 'london',
    city: 'London',
    title: 'Mayfair Salon & Scent Gallery',
    subtitle: 'Mount Street Chamber of Rare Extraits',
    address: '18 Conduit Street, Mayfair, London W1S 2XN',
    country: 'United Kingdom',
    coordinates: {
      lat: 51.5123,
      lng: -0.1432,
    },
    phone: '+44 20 7946 0812',
    hours: 'Monday – Saturday: 10:30 – 19:00 GMT',
    features: ['High-Concentration Extraits Bar', 'Private VIP Parlour', 'Personal Flacon Engraving'],
  },
  {
    id: 'newyork',
    city: 'New York',
    title: 'SoHo Atelier & Olfactory Study',
    subtitle: 'Cast-Iron Architecture & Modern Artisanal Lab',
    address: '112 Wooster Street, New York, NY 10012',
    country: 'United States',
    coordinates: {
      lat: 40.7246,
      lng: -74.0004,
    },
    phone: '+1 (212) 555-0198',
    hours: 'Monday – Saturday: 11:00 – 19:00 EST, Sunday: 12:00 – 18:00 EST',
    features: ['Scent Layering Rituals', 'Limited Harvest Releases', 'Concierge Delivery'],
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    title: 'Ginza Sanctuary',
    subtitle: 'Minimalist Cedar & Hinoki Olfactory Retreat',
    address: '6-10-1 Ginza, Chuo City, Tokyo 104-0061',
    country: 'Japan',
    coordinates: {
      lat: 35.6696,
      lng: 139.7640,
    },
    phone: '+81 3 5555 0142',
    hours: 'Daily: 11:00 – 20:00 JST',
    features: ['Incense & Kōdō Ceremonies', 'Exclusive Kyoto Ensembles', 'Tea Pairing Lounge'],
  },
];

interface BranchesMapProps {
  onOpenStoreLocator?: () => void;
  className?: string;
}

export const BranchesMap: React.FC<BranchesMapProps> = ({ onOpenStoreLocator, className = '' }) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('paris');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(BRANCH_LOCATIONS[0].coordinates);
  const [mapZoom, setMapZoom] = useState<number>(14);

  const selectedBranch = BRANCH_LOCATIONS.find((b) => b.id === selectedBranchId) || BRANCH_LOCATIONS[0];
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleSelectBranch = (branch: BranchLocation) => {
    setSelectedBranchId(branch.id);
    setMapCenter(branch.coordinates);
    setMapZoom(15);
  };

  const getGoogleMapsDirectionsUrl = (branch: BranchLocation) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${branch.title}, ${branch.address}`)}`;
  };

  return (
    <div className={`mb-24 ${className}`} id="branches-map">
      <div className="bg-[#FFFBF5] rounded-[32px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                Global Ateliers &amp; Salons
              </span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight">
              Our Opened <span className="font-serif italic font-normal text-[#520909]">Branches</span>
            </h3>
            <p className="mt-2 text-sm text-[#7E4A4A] max-w-2xl font-sans">
              Discover Maison Avelore sanctums across the world's most distinguished capitals. Each salon houses our complete olfactory organ and private formulation suites.
            </p>
          </div>

          {onOpenStoreLocator && (
            <PillButton
              variant="merlot"
              size="sm"
              arrow="up-right"
              onClick={onOpenStoreLocator}
              className="shrink-0 self-start md:self-auto"
            >
              Full Directory &amp; Appointments
            </PillButton>
          )}
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {BRANCH_LOCATIONS.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={`px-5 py-2.5 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-sm scale-102 ring-2 ring-[#FFD482]/50'
                    : 'bg-[#FAF2E1] text-[#3B0000]/80 hover:bg-[#FFD482]/30 hover:text-[#3B0000] border border-[#3B0000]/10'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFD482]' : 'text-[#801B00]'}`} />
                <span>{branch.city}</span>
                <span className="text-[10px] opacity-70">({branch.country})</span>
              </button>
            );
          })}
        </div>

        {/* Map & Atelier Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Container */}
          <div className="lg:col-span-8 rounded-[24px] overflow-hidden border border-[#3B0000]/15 relative bg-[#FAF2E1] shadow-inner min-h-[420px] sm:min-h-[480px]">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <div style={{ width: '100%', height: '100%', minHeight: '420px' }}>
                  <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                  >
                    {BRANCH_LOCATIONS.map((loc) => (
                      <AdvancedMarker
                        key={loc.id}
                        position={loc.coordinates}
                        title={loc.title}
                        onClick={() => handleSelectBranch(loc)}
                      >
                        <Pin
                          background={loc.id === selectedBranchId ? '#3B0000' : '#801B00'}
                          glyphColor="#FFD482"
                          borderColor="#FFD482"
                          scale={loc.id === selectedBranchId ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    ))}
                  </Map>
                </div>
              </APIProvider>
            ) : (
              /* High-fidelity architectural preview when key is being configured */
              <div className="w-full h-full min-h-[420px] flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[#FAF2E1] via-[#F4E6CC] to-[#EBD7B8] relative">
                {/* Decorative Map Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(#3B0000 1px, transparent 1px), radial-gradient(#3B0000 1px, #FAF2E1 1px)`,
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px',
                  }}
                />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B0000] text-[#FFD482] text-xs font-mono">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Maison Avelore Geo-Atlas • {selectedBranch.city}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#3B0000]/60">
                    {selectedBranch.coordinates.lat.toFixed(4)}° N, {selectedBranch.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>

                {/* Center Visual Pin Graphic */}
                <div className="relative z-10 my-auto text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#3B0000] text-[#FFD482] flex items-center justify-center mx-auto shadow-lg border-2 border-[#FFD482] mb-3 animate-bounce">
                    <MapPin className="w-8 h-8 text-[#FFD482]" />
                  </div>
                  <h4 className="text-2xl font-display font-bold text-[#3B0000]">
                    {selectedBranch.title}
                  </h4>
                  <p className="text-xs text-[#7E4A4A] mt-1 font-mono">
                    {selectedBranch.address}
                  </p>
                </div>

                {/* Bottom Actions Bar */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#3B0000]/15">
                  <span className="text-xs text-[#3B0000]/70 font-sans text-center sm:text-left">
                    Live interactive coordinates active for navigation.
                  </span>
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#3B0000] text-[#FFD482] hover:bg-[#520909] text-xs font-display font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Active Branch Detail Card */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#FAF2E1] rounded-[24px] p-6 sm:p-8 border border-[#3B0000]/15 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#801B00] font-display font-bold">
                  {selectedBranch.city} • {selectedBranch.country}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FFD482]/60 text-[#3B0000] font-bold">
                  Open
                </span>
              </div>

              <h4 className="text-2xl font-display font-bold text-[#3B0000] leading-snug">
                {selectedBranch.title}
              </h4>
              <p className="text-xs text-[#7E4A4A] mt-1.5 font-sans leading-relaxed">
                {selectedBranch.subtitle}
              </p>

              {/* Atelier Details */}
              <div className="mt-6 space-y-3.5 text-xs text-[#3B0000] border-t border-[#3B0000]/10 pt-5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#801B00] shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{selectedBranch.address}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#801B00] shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{selectedBranch.hours}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#801B00] shrink-0" />
                  <span className="font-mono text-[11px] font-semibold">{selectedBranch.phone}</span>
                </div>
              </div>

              {/* Signature Features */}
              <div className="mt-6 border-t border-[#3B0000]/10 pt-4">
                <span className="text-[10px] uppercase tracking-wider font-display font-bold text-[#3B0000]/70 block mb-2.5">
                  Salon Amenities
                </span>
                <ul className="space-y-1.5 text-xs text-[#7E4A4A]">
                  {selectedBranch.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#FFD482] fill-[#FFD482] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Direct Directions Action */}
            <div className="pt-4 border-t border-[#3B0000]/10">
              <a
                href={getGoogleMapsDirectionsUrl(selectedBranch)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] text-xs font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Route &amp; Directions</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
