import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Sparkles, Compass } from 'lucide-react';
import { PillButton } from './PillButton';

export interface BranchLocation {
  id: string;
  name: string;
  city: string;
  subtitle: string;
  address: string;
  country: string;
  position: {
    lat: number;
    lng: number;
  };
  phone: string;
  hours: string;
  amenities: string[];
}

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: 'paris',
    name: 'Paris Flagship Marais',
    city: 'Paris',
    subtitle: 'Botanical Organ & Private Extraction Vault',
    address: '24 Rue de Sévigné, 75004 Paris, France',
    country: 'France',
    position: {
      lat: 48.8575,
      lng: 2.3622,
    },
    phone: '+33 1 42 78 30 12',
    hours: 'Tuesday – Saturday: 11:00 – 19:30 CET',
    amenities: ['Bespoke Formulation Salon', 'Archival Fragrance Organ', 'Private Testing Suite'],
  },
  {
    id: 'london',
    name: 'London Mayfair Salon',
    city: 'London',
    subtitle: 'Mount Street Chamber of Rare Extraits',
    address: '18 Conduit Street, Mayfair, London W1S 2XN, United Kingdom',
    country: 'United Kingdom',
    position: {
      lat: 51.5123,
      lng: -0.1432,
    },
    phone: '+44 20 7946 0812',
    hours: 'Monday – Saturday: 10:30 – 19:00 GMT',
    amenities: ['High-Concentration Extraits Bar', 'VIP Consultation Parlour', 'Flacon Engraving'],
  },
  {
    id: 'newyork',
    name: 'New York SoHo Atelier',
    city: 'New York',
    subtitle: 'Cast-Iron Architecture & Modern Artisanal Lab',
    address: '112 Wooster Street, New York, NY 10012, USA',
    country: 'United States',
    position: {
      lat: 40.7246,
      lng: -74.0004,
    },
    phone: '+1 (212) 555-0198',
    hours: 'Monday – Saturday: 11:00 – 19:00 EST',
    amenities: ['Scent Layering Rituals', 'Exclusive Harvest Releases', 'Private Courier Service'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo Ginza Sanctuary',
    city: 'Tokyo',
    subtitle: 'Minimalist Hinoki & Sacred Scent Retreat',
    address: '6-10-1 Ginza, Chuo City, Tokyo 104-0061, Japan',
    country: 'Japan',
    position: {
      lat: 35.6696,
      lng: 139.7640,
    },
    phone: '+81 3 5555 0142',
    hours: 'Daily: 11:00 – 20:00 JST',
    amenities: ['Kōdō Incense Rituals', 'Kyoto Artisan Flacons', 'Tea & Scent Pairing Lounge'],
  },
];

interface BranchLocatorProps {
  onOpenStoreLocator?: () => void;
  className?: string;
}

export const BranchLocator: React.FC<BranchLocatorProps> = ({ onOpenStoreLocator, className = '' }) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('paris');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(BRANCH_LOCATIONS[0].position);
  const [mapZoom, setMapZoom] = useState<number>(14);

  const selectedBranch = BRANCH_LOCATIONS.find((b) => b.id === selectedBranchId) || BRANCH_LOCATIONS[0];
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleSelectBranch = (branch: BranchLocation) => {
    setSelectedBranchId(branch.id);
    setMapCenter(branch.position);
    setMapZoom(15);
  };

  const getGoogleMapsDirectionsUrl = (branch: BranchLocation) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${branch.name}, ${branch.address}`)}`;
  };

  return (
    <section id="branch-locator" className={`mb-24 ${className}`} aria-label="Branch Locations Map">
      <div className="bg-[#FFFBF5] rounded-[32px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                Maison Avelore Boutiques
              </span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight">
              Physical Branch <span className="font-serif italic font-normal text-[#520909]">Locations</span>
            </h3>
            <p className="mt-2 text-sm text-[#7E4A4A] max-w-2xl font-sans">
              Explore our physical salons and ateliers worldwide. Select an atelier below to view its location, address, hours, and private concierge contact.
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
              Full Boutique Directory
            </PillButton>
          )}
        </div>

        {/* Branch Selection Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {BRANCH_LOCATIONS.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={`px-5 py-2.5 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-sm ring-2 ring-[#FFD482]/50 scale-102'
                    : 'bg-[#FAF2E1] text-[#3B0000]/80 hover:bg-[#FFD482]/30 hover:text-[#3B0000] border border-[#3B0000]/10'
                }`}
                aria-pressed={isSelected}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFD482]' : 'text-[#801B00]'}`} />
                <span>{branch.city}</span>
                <span className="text-[10px] opacity-70">({branch.country})</span>
              </button>
            );
          })}
        </div>

        {/* Map & Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Viewer */}
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
                    {/* Markers for all physical branches */}
                    {BRANCH_LOCATIONS.map((loc) => (
                      <AdvancedMarker
                        key={loc.id}
                        position={loc.position}
                        title={loc.name}
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
              /* Architectural interactive canvas */
              <div className="w-full h-full min-h-[420px] flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[#FAF2E1] via-[#F4E6CC] to-[#EBD7B8] relative">
                {/* Architectural Grid pattern */}
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
                    <Compass className="w-3.5 h-3.5" />
                    <span>Maison Avelore Geo-Register • {selectedBranch.city}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#3B0000]/60">
                    {selectedBranch.position.lat.toFixed(4)}° N, {selectedBranch.position.lng.toFixed(4)}° E
                  </span>
                </div>

                {/* Visual Pin & Location Summary */}
                <div className="relative z-10 my-auto text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[#3B0000] text-[#FFD482] flex items-center justify-center mx-auto shadow-lg border-2 border-[#FFD482] mb-3 animate-bounce">
                    <MapPin className="w-8 h-8 text-[#FFD482]" />
                  </div>
                  <h4 className="text-2xl font-display font-bold text-[#3B0000]">
                    {selectedBranch.name}
                  </h4>
                  <p className="text-xs text-[#7E4A4A] mt-1 font-mono">
                    {selectedBranch.address}
                  </p>
                </div>

                {/* Bottom Bar with Directions */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#3B0000]/15">
                  <span className="text-xs text-[#3B0000]/70 font-sans text-center sm:text-left">
                    Official coordinates mapped to Google Maps Platform.
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

          {/* Active Branch Sidebar Card */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#FAF2E1] rounded-[24px] p-6 sm:p-8 border border-[#3B0000]/15 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#801B00] font-display font-bold">
                  {selectedBranch.city} • {selectedBranch.country}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FFD482]/60 text-[#3B0000] font-bold">
                  Active Atelier
                </span>
              </div>

              <h4 className="text-2xl font-display font-bold text-[#3B0000] leading-snug">
                {selectedBranch.name}
              </h4>
              <p className="text-xs text-[#7E4A4A] mt-1.5 font-sans leading-relaxed">
                {selectedBranch.subtitle}
              </p>

              {/* Contact & Hours */}
              <div className="mt-6 space-y-3.5 text-xs text-[#3B0000] border-t border-[#3B0000]/10 pt-5 font-mono">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#801B00] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{selectedBranch.address}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#801B00] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{selectedBranch.hours}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#801B00] shrink-0" />
                  <span className="text-[11px] font-semibold">{selectedBranch.phone}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6 border-t border-[#3B0000]/10 pt-4">
                <span className="text-[10px] uppercase tracking-wider font-display font-bold text-[#3B0000]/70 block mb-2.5">
                  Atelier Highlights
                </span>
                <ul className="space-y-1.5 text-xs text-[#7E4A4A]">
                  {selectedBranch.amenities.map((amenity, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#FFD482] fill-[#FFD482] shrink-0" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Directions Action */}
            <div className="pt-4 border-t border-[#3B0000]/10">
              <a
                href={getGoogleMapsDirectionsUrl(selectedBranch)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3B0000] hover:bg-[#520909] text-[#FFD482] text-xs font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate to Salon</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
