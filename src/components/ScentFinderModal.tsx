import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Eye,
  Check,
  Calendar,
  RotateCcw,
  Compass,
  ArrowRight,
  Sliders,
  Award,
} from 'lucide-react';
import { Product, PRODUCTS } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { useAuth } from '../context/AuthContext';

interface ScentFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickView: (product: Product) => void;
  onOpenConsultation?: () => void;
}

interface ScentMatchResponse {
  matchedProductId: string;
  matchAffinity: number;
  vibeTitle: string;
  poeticAnalysis: string;
  wearingRitual: string;
  alternativeProductId?: string;
  alternativeReason?: string;
  product?: Product;
  alternativeProduct?: Product;
}

const VIBE_OPTIONS = [
  {
    id: 'nocturne',
    title: 'Nocturne & Smoked Velvet',
    subtitle: 'Intoxicating, mysterious, candlelit salons & leather armchairs',
    icon: '🌙',
    bestMatchId: 'ambre-imperial-reserve',
    altMatchId: 'santal-solennel',
  },
  {
    id: 'solar',
    title: 'Solar & Luminous Grace',
    subtitle: 'Radiant Mediterranean citrus, golden skin, linen & effortless optimism',
    icon: '☀️',
    bestMatchId: 'solene-eau-de-parfum',
    altMatchId: 'fleur-d-oranger-brut',
  },
  {
    id: 'botanical',
    title: 'Botanical & Earthy Solitude',
    subtitle: 'Wet forest floor, rain on cedar, wild herbs & quiet introspection',
    icon: '🌿',
    bestMatchId: 'sauge-peloponnese',
    altMatchId: 'vert-d-iris-extrait',
  },
  {
    id: 'sacred',
    title: 'Sacred & Meditative Sanctuary',
    subtitle: 'Rare temple woods, burning frankincense tears & ancient parchment',
    icon: '🏛️',
    bestMatchId: 'oud-cendree-reserve',
    altMatchId: 'santal-solennel',
  },
  {
    id: 'opulent',
    title: 'Opulent & Royal Extraits',
    subtitle: 'Grasse Centifolia roses, aged vintage amber, silk brocade & grand entrances',
    icon: '👑',
    bestMatchId: 'rose-sepale-extrait',
    altMatchId: 'cuir-velours-nocturne',
  },
  {
    id: 'second-skin',
    title: 'Intimate & Second-Skin Cashmere',
    subtitle: 'Velvety Florentine iris, warm clean musk & quiet private luxury',
    icon: '🕊️',
    bestMatchId: 'iris-atlantique',
    altMatchId: 'ambre-imperial-reserve',
  },
];

const ACCORD_OPTIONS = [
  { id: 'amber-resins', label: 'Amber & Resins', desc: 'Labdanum, Benzoin, Frankincense' },
  { id: 'smoky-leather', label: 'Smoky Leather', desc: 'Antique calfskin, Birch pitch, Cade' },
  { id: 'rare-woods', label: 'Sacred Woods', desc: 'Mysore Sandalwood, Blue Cypress, Cedar' },
  { id: 'vintage-rose', label: 'Royal Rose de Mai', desc: 'Centifolia petals, Dew, Pink Pepper' },
  { id: 'night-tuberose', label: 'Sensual Florals', desc: 'Night Tuberose, Jasmine Sambac, Neroli' },
  { id: 'orris-powder', label: 'Iris & Orris Butter', desc: 'Florentine Iris, White Musk, Cashmere' },
  { id: 'sparkling-citrus', label: 'Crisp Citrus', desc: 'Bitter Orange, Petitgrain, Bergamot' },
  { id: 'aged-oud', label: 'Wild Agarwood / Oud', desc: 'Trat Oud, Smoked Plum, Ambergris' },
];

const SILHOUETTES = [
  {
    id: 'whisper',
    name: 'Intimate Veil',
    desc: 'Personal radius for those invited close',
  },
  {
    id: 'aura',
    name: 'Magnetic Aura',
    desc: 'Graceful, refined trail that lingers in your wake',
  },
  {
    id: 'commanding',
    name: 'Opulent Sillage',
    desc: 'An unforgettable signature that precedes your presence',
  },
];

export const ScentFinderModal: React.FC<ScentFinderModalProps> = ({
  isOpen,
  onClose,
  onQuickView,
  onOpenConsultation,
}) => {
  const { user, isFavorite, toggleFavorite } = useAuth();

  // Mode Tabs
  const [activeTab, setActiveTab] = useState<'harmonizer' | 'deep-ai' | 'saved'>('harmonizer');

  // Questionnaire State
  const [selectedVibe, setSelectedVibe] = useState<string>('nocturne');
  const [selectedAccords, setSelectedAccords] = useState<string[]>(['amber-resins', 'smoky-leather']);
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>('aura');
  const [freeformVibe, setFreeformVibe] = useState<string>('');

  // AI Generation State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('Distilling your sensory affinities...');
  const [matchResult, setMatchResult] = useState<ScentMatchResponse | null>(null);

  // Background Scroll Lock & Lenis Lifecycle (Zero scroll disruption & zero lag)
  useEffect(() => {
    if (isOpen) {
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
      }
      document.body.style.overflow = 'hidden';
    } else {
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
      document.body.style.overflow = '';
    }

    return () => {
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAccord = (id: string) => {
    setSelectedAccords((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((a) => a !== id)
          : prev
        : [...prev, id]
    );
  };

  // Live Harmonizer Calculation
  const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibe) || VIBE_OPTIONS[0];
  const matchedProduct: Product =
    matchResult?.product ||
    PRODUCTS.find((p) => p.id === activeVibe.bestMatchId) ||
    PRODUCTS[0];

  const altProduct: Product | undefined =
    matchResult?.alternativeProduct ||
    PRODUCTS.find((p) => p.id === activeVibe.altMatchId);

  const favorited = isFavorite(matchedProduct.id);

  // Deep AI Synthesis
  const handleRunDeepAnalysis = async () => {
    setIsLoading(true);

    const steps = [
      'Distilling emotional daydream & olfactory likings...',
      'Evaluating Grasse absolute cold-maceration ratios...',
      'Calibrating projection silhouette & skin evaporation...',
      'Master Perfumer harmonizing signature formulation...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStepText(steps[stepIdx]);
    }, 1000);

    try {
      const response = await fetch('/api/scent-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: activeVibe.title,
          accords: selectedAccords.map((a) => ACCORD_OPTIONS.find((opt) => opt.id === a)?.label || a),
          silhouette: SILHOUETTES.find((s) => s.id === selectedSilhouette)?.name || selectedSilhouette,
          customVibe: freeformVibe.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const found = PRODUCTS.find((p) => p.id === data.matchedProductId) || matchedProduct;
        const alt = data.alternativeProductId ? PRODUCTS.find((p) => p.id === data.alternativeProductId) : altProduct;
        setMatchResult({
          matchedProductId: found.id,
          matchAffinity: data.matchAffinity || 98,
          vibeTitle: data.vibeTitle || activeVibe.title,
          poeticAnalysis: data.poeticAnalysis || `Tailored to your preference for ${activeVibe.title.toLowerCase()}.`,
          wearingRitual: data.wearingRitual || 'Mist delicately on pulse points.',
          product: found,
          alternativeProduct: alt,
        });
        setActiveTab('harmonizer');
      } else {
        throw new Error('Fallback to local calculation');
      }
    } catch {
      // Instant intelligent fallback
      setMatchResult({
        matchedProductId: matchedProduct.id,
        matchAffinity: 98,
        vibeTitle: activeVibe.title,
        poeticAnalysis: `Composed to mirror your affinity for ${activeVibe.subtitle.toLowerCase()}, ${matchedProduct.name} marries pure botanical maceration with intimate cutaneous warmth.`,
        wearingRitual: 'Mist twice across bare collarbones and wrist pulse points. Allow body heat to naturally diffuse the botanical absolutes.',
        product: matchedProduct,
        alternativeProduct: altProduct,
      });
      setActiveTab('harmonizer');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMatchResult(null);
    setSelectedVibe('nocturne');
    setSelectedAccords(['amber-resins', 'smoky-leather']);
    setSelectedSilhouette('aura');
    setFreeformVibe('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A0000]/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scent-vibe-modal-title"
    >
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Patron-Style Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#FAF2E1] border border-[#3B0000]/20 rounded-3xl shadow-[0_24px_80px_rgba(30,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Luxury Header in Burnt Merlot */}
        <div className="px-6 sm:px-8 py-5 bg-[#3B0000] text-[#FFD482] flex items-center justify-between border-b border-[#FFD482]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD482]/20 border border-[#FFD482]/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#FFD482] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="scent-vibe-modal-title"
                  className="font-display font-bold text-lg sm:text-xl tracking-wider text-[#FFD482]"
                >
                  Avelore Scent Vibe Atelier
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD482] text-[#3B0000] uppercase tracking-wider font-mono">
                  98% Affinity
                </span>
              </div>
              <p className="text-xs text-[#FFD482]/70 font-mono tracking-widest uppercase mt-0.5">
                Harmonizer &amp; Bespoke Fragrance Finder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#FFD482]/80 hover:text-[#FFD482] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close Scent Vibe interface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="px-6 py-2.5 bg-[#FAF2E1] border-b border-[#3B0000]/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('harmonizer')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'harmonizer'
                  ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                  : 'text-[#3B0000]/70 hover:bg-[#3B0000]/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Harmonizer Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('deep-ai')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deep-ai'
                  ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                  : 'text-[#3B0000]/70 hover:bg-[#3B0000]/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
              <span>Deep AI Analysis</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-[#7E4A4A] hover:text-[#3B0000] flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset selections"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Enhanced Smooth Scrollable Body with Inertia & Thin Scrollbar */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-8 [scrollbar-width:thin] [scrollbar-color:#3B0000_#FAF2E1]">
          {activeTab === 'harmonizer' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: 3-Step Vibe & Likings Selectors (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Step 1: Vibe & Atmosphere Archetype */}
                <div className="bg-[#FFFBF5] rounded-2xl p-5 border border-[#3B0000]/10 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                      Vibe &amp; Atmosphere Daydream
                    </span>
                    <span className="text-[10px] font-mono text-[#7E4A4A] uppercase">Select One</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VIBE_OPTIONS.map((vibe) => {
                      const isSelected = selectedVibe === vibe.id;
                      return (
                        <button
                          key={vibe.id}
                          type="button"
                          onClick={() => {
                            setSelectedVibe(vibe.id);
                            setMatchResult(null);
                          }}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                              : 'bg-[#FAF2E1]/50 text-[#3B0000] border-[#3B0000]/10 hover:border-[#3B0000]/30 hover:bg-[#FAF2E1]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-base">{vibe.icon}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD482]" />}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-xs tracking-tight mb-0.5">
                              {vibe.title}
                            </h4>
                            <p className={`text-[10px] line-clamp-2 leading-relaxed ${isSelected ? 'text-[#FAF2E1]/80' : 'text-[#7E4A4A]'}`}>
                              {vibe.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Olfactory Accords & Likings */}
                <div className="bg-[#FFFBF5] rounded-2xl p-5 border border-[#3B0000]/10 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                      Olfactory Accords &amp; Likings
                    </span>
                    <span className="text-[10px] font-mono text-[#7E4A4A] uppercase">Multi-select</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ACCORD_OPTIONS.map((accord) => {
                      const isSelected = selectedAccords.includes(accord.id);
                      return (
                        <button
                          key={accord.id}
                          type="button"
                          onClick={() => toggleAccord(accord.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                              : 'bg-[#FAF2E1] text-[#3B0000] border border-[#3B0000]/15 hover:border-[#3B0000]/30'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#FFD482]" />}
                          <span>{accord.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Desired Sillage Silhouette */}
                <div className="bg-[#FFFBF5] rounded-2xl p-5 border border-[#3B0000]/10 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                      Projection Silhouette
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SILHOUETTES.map((sil) => {
                      const isSelected = selectedSilhouette === sil.id;
                      return (
                        <button
                          key={sil.id}
                          type="button"
                          onClick={() => setSelectedSilhouette(sil.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                              : 'bg-[#FAF2E1]/60 text-[#3B0000] border-[#3B0000]/15 hover:border-[#3B0000]/30'
                          }`}
                        >
                          <div className="font-display font-bold text-xs mb-0.5">{sil.name}</div>
                          <div className={`text-[10px] leading-tight ${isSelected ? 'text-[#FAF2E1]/80' : 'text-[#7E4A4A]'}`}>{sil.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Matched Suited Fragrance Reveal (5 Cols) */}
              <div className="lg:col-span-5 bg-[#3B0000] text-[#FAF2E1] rounded-3xl p-6 sm:p-7 border border-[#FFD482]/20 shadow-md flex flex-col justify-between">
                <div>
                  {/* Match Header */}
                  <div className="flex items-center justify-between gap-2 mb-5 border-b border-[#FFD482]/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFD482]" />
                      <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#FFD482]">
                        Suited Flacon
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFD482] text-[#3B0000] font-mono font-bold text-[11px]">
                      {matchResult?.matchAffinity || 98}% Affinity
                    </span>
                  </div>

                  {/* Product Visual & Name */}
                  <div className="text-center mb-5">
                    <div className="w-32 h-44 mx-auto mb-3 rounded-2xl overflow-hidden bg-[#FAF2E1]/5 border border-[#FFD482]/20 shadow-inner flex items-center justify-center p-2">
                      <ProductVisual product={matchedProduct} size="md" />
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFD482]/70 block mb-0.5">
                      {matchedProduct.category === 'exclusive' ? 'Reserve Extrait' : 'Haute Parfumerie'} · {matchedProduct.volume}
                    </span>

                    <h3 className="text-2xl font-display font-bold text-[#FFD482] tracking-tight">
                      {matchedProduct.name}
                    </h3>

                    <p className="text-xs text-[#FAF2E1]/75 font-serif italic mt-0.5">
                      "{matchedProduct.subtitle}"
                    </p>
                  </div>

                  {/* Harmonic Notes */}
                  <div className="bg-[#FAF2E1]/5 rounded-2xl p-3.5 border border-[#FFD482]/10 mb-5">
                    <div className="text-[10px] uppercase tracking-widest font-mono text-[#FFD482] mb-1.5 font-bold">
                      Dominant Chords
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {(matchedProduct.notes
                        ? [...matchedProduct.notes.top, ...matchedProduct.notes.heart, ...matchedProduct.notes.base].slice(0, 5)
                        : matchedProduct.ingredients?.slice(0, 5) || ['Grasse Centifolia', 'Aged Amber']
                      ).map((note, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-[#FFD482]/10 text-[#FFD482] text-[10px] font-mono border border-[#FFD482]/20"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#FAF2E1]/80 leading-relaxed font-sans line-clamp-3">
                      {matchResult?.poeticAnalysis || matchedProduct.description}
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-[#FFD482]/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#FFD482]/60 block">Price</span>
                      <span className="text-lg font-display font-bold text-[#FFD482]">${matchedProduct.priceFrom}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await toggleFavorite(matchedProduct.id);
                          } catch (err) {
                            console.warn(err);
                          }
                        }}
                        className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                          favorited
                            ? 'bg-[#FFD482] text-[#3B0000] border-[#FFD482]'
                            : 'text-[#FFD482] border-[#FFD482]/30 hover:bg-[#FFD482]/10'
                        }`}
                        title={favorited ? 'In Patron Wardrobe' : 'Save to Patron Wardrobe'}
                      >
                        <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onQuickView(matchedProduct);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFD482] text-[#3B0000] font-display font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  {altProduct && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onQuickView(altProduct);
                        }}
                        className="text-[11px] font-mono text-[#FFD482]/80 hover:text-white underline tracking-wider cursor-pointer"
                      >
                        Counterpoint Harmonization: {altProduct.name} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Deep AI Consultation Tab */
            <div className="max-w-2xl mx-auto space-y-6 py-2">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-[#3B0000] inline-block mb-2" />
                <h3 className="text-2xl font-display font-bold text-[#3B0000]">
                  Deep Olfactory Synthesis
                </h3>
                <p className="text-xs sm:text-sm text-[#7E4A4A] mt-1 font-sans">
                  Provide your personal sensory memories, emotional daydream, or ideal seasons to receive a synthesized formulation profile.
                </p>
              </div>

              <div className="bg-[#FFFBF5] rounded-2xl p-6 border border-[#3B0000]/10 shadow-xs space-y-4">
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000]">
                  Describe Your Sensory Vibe in Your Own Words (Optional)
                </label>
                <textarea
                  value={freeformVibe}
                  onChange={(e) => setFreeformVibe(e.target.value)}
                  placeholder="e.g. A rainy autumn twilight walking along Parisian cobblestones, wearing a cashmere scarf, smelling vintage bookbindings and espresso..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF2E1]/60 border border-[#3B0000]/15 text-xs text-[#3B0000] focus:outline-none focus:ring-1 focus:ring-[#3B0000] font-sans"
                />

                <div className="flex items-center justify-between text-xs text-[#7E4A4A]">
                  <span>Synthesizes with chosen archetype: <strong>{activeVibe.title}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleRunDeepAnalysis}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#3B0000] text-[#FFD482] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#520909] active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD482]" />
                  <span>{isLoading ? loadingStepText : 'Synthesize My Scent Vibe with AI'}</span>
                </button>
              </div>

              {matchResult && (
                <div className="bg-[#3B0000] text-[#FAF2E1] rounded-2xl p-6 border border-[#FFD482]/20 shadow-md">
                  <div className="flex items-center justify-between mb-3 border-b border-[#FFD482]/15 pb-2">
                    <span className="text-xs font-display font-bold text-[#FFD482] uppercase tracking-wider">
                      Master Perfumer Synthesis
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FFD482]">
                      {matchResult.matchAffinity}% Match
                    </span>
                  </div>
                  <h4 className="text-xl font-display font-bold text-[#FFD482] mb-1">
                    {matchResult.product?.name}
                  </h4>
                  <p className="text-xs text-[#FAF2E1]/90 leading-relaxed font-sans mb-3">
                    {matchResult.poeticAnalysis}
                  </p>
                  <div className="text-[11px] font-mono text-[#FFD482]/80 bg-[#FAF2E1]/5 rounded-xl p-3 border border-[#FFD482]/10 mb-4">
                    <strong>Wearing Ritual:</strong> {matchResult.wearingRitual}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (matchResult.product) onQuickView(matchResult.product);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#FFD482] text-[#3B0000] font-display font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                  >
                    View Flacon Dossier &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Strip */}
        <div className="px-6 py-3.5 bg-[#FAF2E1] border-t border-[#3B0000]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#7E4A4A]">
            <Award className="w-4 h-4 text-[#3B0000]" />
            <span>Formulated in Grasse with cold extraction and zero synthetic fixatives.</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenConsultation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConsultation();
                }}
                className="font-display font-bold text-[#3B0000] hover:text-[#520909] underline uppercase tracking-wider cursor-pointer"
              >
                Schedule Private Atelier Consultation &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
