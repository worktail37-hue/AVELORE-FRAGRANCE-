import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, Heart, Eye, Check, MapPin, Compass } from 'lucide-react';
import { Product, PRODUCTS } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { useAuth } from '../context/AuthContext';
import { scrollToSection } from '../utils/scrollHelper';

interface ScentVibeSectionProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
  onOpenFullQuiz?: () => void;
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
  { id: 'amber-resins', label: 'Amber & Resins' },
  { id: 'smoky-leather', label: 'Smoky Leather' },
  { id: 'rare-woods', label: 'Sacred Woods' },
  { id: 'vintage-rose', label: 'Royal Rose de Mai' },
  { id: 'night-tuberose', label: 'Sensual Florals' },
  { id: 'orris-powder', label: 'Iris & Orris' },
  { id: 'sparkling-citrus', label: 'Crisp Citrus' },
];

const SILHOUETTE_OPTIONS = [
  { id: 'intimate', label: 'Intimate Veil', desc: 'Personal radius for those invited close' },
  { id: 'classical', label: 'Classical Sillage', desc: 'Graceful scent trail lingering in your wake' },
  { id: 'enveloping', label: 'Enveloping Aura', desc: 'Unforgettable, statement-making presence' },
];

export const ScentVibeSection: React.FC<ScentVibeSectionProps> = ({
  onQuickView,
  onFindInStore,
  onOpenFullQuiz,
}) => {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [selectedVibe, setSelectedVibe] = useState<string>('nocturne');
  const [selectedAccords, setSelectedAccords] = useState<string[]>(['amber-resins', 'rare-woods']);
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>('classical');
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  // Toggle accord
  const toggleAccord = (accordId: string) => {
    setSelectedAccords((prev) =>
      prev.includes(accordId)
        ? prev.length > 1
          ? prev.filter((id) => id !== accordId)
          : prev
        : [...prev, accordId]
    );
  };

  // Derive suited product
  const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibe) || VIBE_OPTIONS[0];
  const matchedProduct: Product =
    PRODUCTS.find((p) => p.id === activeVibe.bestMatchId) || PRODUCTS[0];
  const altProduct: Product | undefined =
    PRODUCTS.find((p) => p.id === activeVibe.altMatchId);

  const isSaved = isFavorite(matchedProduct.id);

  const handleSaveFavorite = async () => {
    try {
      await toggleFavorite(matchedProduct.id);
    } catch (err) {
      console.warn('Could not save favorite', err);
    }
  };

  const handleOpenFullQuiz = () => {
    scrollToSection('scent-vibe');
    if (onOpenFullQuiz) {
      setTimeout(() => {
        onOpenFullQuiz();
      }, 150);
    }
  };

  return (
    <section
      id="scent-vibe"
      className="relative py-20 sm:py-28 bg-[#FAF2E1] border-b border-[#3B0000]/10 scroll-mt-24"
      aria-label="Scent Vibe - Find Your Suited Fragrance"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B0000]/5 border border-[#3B0000]/15 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B0000]" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-display font-bold text-[#3B0000]">
              Atelier des Affinités · Scent Vibe
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight mb-4">
            Find Your Suited Fragrance by <span className="font-serif italic font-normal text-[#520909]">Vibe & Likings</span>
          </h2>

          <p className="text-sm sm:text-base text-[#7E4A4A] leading-relaxed font-sans mb-6">
            Select your atmospheric daydream, olfactory likings, and desired presence. Our master formulation harmonizer reveals your authentic signature flacon.
          </p>

          {onOpenFullQuiz && (
            <div className="inline-flex items-center justify-center">
              <button
                type="button"
                onClick={handleOpenFullQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B0000] text-[#FFD482] border border-[#FFD482]/30 text-xs font-display font-bold uppercase tracking-wider shadow-sm hover:bg-[#520909] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
                <span>Launch Interactive AI Questionnaire</span>
              </button>
            </div>
          )}
        </div>

        {/* Two-Column Harmonizer Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Vibe & Likings Selectors (7 Cols) */}
          <div className="lg:col-span-7 bg-[#FFFBF5] rounded-3xl p-6 sm:p-8 border border-[#3B0000]/10 shadow-[0_4px_24px_rgba(59,0,0,0.04)] space-y-8">
            {/* Step 1: Vibe Archetype */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                  Choose Your Vibe & Atmosphere
                </span>
                <span className="text-[11px] font-mono text-[#7E4A4A] uppercase">Select One</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VIBE_OPTIONS.map((vibe) => {
                  const isSelected = selectedVibe === vibe.id;
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      onClick={() => {
                        setSelectedVibe(vibe.id);
                        setHasCalculated(true);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-sm scale-[1.01]'
                          : 'bg-[#FAF2E1]/60 text-[#3B0000] border-[#3B0000]/10 hover:border-[#3B0000]/30 hover:bg-[#FAF2E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-lg">{vibe.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#FFD482]" />}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm tracking-tight mb-0.5">
                          {vibe.title}
                        </h4>
                        <p className={`text-[11px] leading-snug ${isSelected ? 'text-[#FFD482]/80' : 'text-[#7E4A4A]'}`}>
                          {vibe.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Note Likings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                  Select Accords & Notes You Cherish
                </span>
                <span className="text-[11px] font-mono text-[#7E4A4A] uppercase">Multi-Select</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ACCORD_OPTIONS.map((accord) => {
                  const isSelected = selectedAccords.includes(accord.id);
                  return (
                    <button
                      key={accord.id}
                      type="button"
                      onClick={() => {
                        toggleAccord(accord.id);
                        setHasCalculated(true);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                          : 'bg-[#FAF2E1] text-[#3B0000]/80 border-[#3B0000]/15 hover:bg-[#FAF2E1]/80 hover:text-[#3B0000]'
                      }`}
                    >
                      {accord.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Desired Silhouette (Sillage) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3B0000] text-[#FFD482] text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                  Desired Scent Silhouette & Sillage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SILHOUETTE_OPTIONS.map((sil) => {
                  const isSelected = selectedSilhouette === sil.id;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() => {
                        setSelectedSilhouette(sil.id);
                        setHasCalculated(true);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-xs'
                          : 'bg-[#FAF2E1]/60 text-[#3B0000] border-[#3B0000]/10 hover:border-[#3B0000]/30'
                      }`}
                    >
                      <div className="font-display font-bold text-xs mb-0.5">{sil.label}</div>
                      <div className={`text-[10px] leading-tight ${isSelected ? 'text-[#FFD482]/75' : 'text-[#7E4A4A]'}`}>
                        {sil.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer with Quiz Option */}
            {onOpenFullQuiz && (
              <div className="pt-2 border-t border-[#3B0000]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#7E4A4A]">Want deeper bespoke analysis?</span>
                <button
                  type="button"
                  onClick={handleOpenFullQuiz}
                  className="font-display font-bold text-[#3B0000] hover:text-[#520909] underline uppercase tracking-wider cursor-pointer"
                >
                  Open Full Scent Vibe Questionnaire &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Recommended Suited Fragrance Reveal (5 Cols) */}
          <div className="lg:col-span-5 bg-[#3B0000] text-[#FAF2E1] rounded-3xl p-6 sm:p-8 border border-[#FFD482]/20 shadow-[0_12px_40px_rgba(59,0,0,0.18)] flex flex-col justify-between">
            <div>
              {/* Match Badge */}
              <div className="flex items-center justify-between gap-2 mb-6 border-b border-[#FFD482]/15 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD482]" />
                  <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#FFD482]">
                    Suited Fragrance Match
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFD482] text-[#3B0000] font-mono font-black text-xs">
                  98% Affinity
                </span>
              </div>

              {/* Product Visual & Name */}
              <div className="text-center mb-6">
                <div className="w-36 h-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-[#FAF2E1]/5 border border-[#FFD482]/20 shadow-inner flex items-center justify-center p-2">
                  <ProductVisual product={matchedProduct} size="md" />
                </div>

                <span className="text-xs font-mono uppercase tracking-widest text-[#FFD482]/70 block mb-1">
                  {matchedProduct.category === 'exclusive' ? 'Reserve Extrait' : 'Haute Parfumerie'} · {matchedProduct.volume}
                </span>

                <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#FFD482] tracking-tight">
                  {matchedProduct.name}
                </h3>

                <p className="text-xs text-[#FAF2E1]/70 font-serif italic mt-1">
                  "{matchedProduct.subtitle}"
                </p>
              </div>

              {/* Olfactory Notes Preview */}
              <div className="bg-[#FAF2E1]/5 rounded-2xl p-4 border border-[#FFD482]/10 mb-6">
                <div className="text-[11px] uppercase tracking-widest font-mono text-[#FFD482] mb-2 font-bold">
                  Key Harmonic Notes
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(matchedProduct.notes
                    ? [...matchedProduct.notes.top, ...matchedProduct.notes.heart, ...matchedProduct.notes.base].slice(0, 6)
                    : matchedProduct.ingredients?.slice(0, 5) || ['Rare Absolutes', 'Natural Extracts']
                  ).map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#FFD482]/10 text-[#FFD482] text-[11px] font-mono border border-[#FFD482]/20"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#FAF2E1]/80 leading-relaxed font-sans">
                  {matchedProduct.longDescription || matchedProduct.description}
                </p>
              </div>
            </div>

            {/* Actions for Matched Product */}
            <div className="space-y-3 pt-2 border-t border-[#FFD482]/15">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#FFD482]/60 block">Price</span>
                  <span className="text-xl font-display font-bold text-[#FFD482]">${matchedProduct.priceFrom}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveFavorite}
                    className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-[#FFD482] text-[#3B0000] border-[#FFD482]'
                        : 'text-[#FFD482] border-[#FFD482]/30 hover:bg-[#FFD482]/10'
                    }`}
                    title={isSaved ? 'Saved to Patron Wardrobe' : 'Save to Patron Wardrobe'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickView(matchedProduct)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFD482] text-[#3B0000] font-display font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>

              {altProduct && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => onQuickView(altProduct)}
                    className="text-[11px] font-mono text-[#FFD482]/80 hover:text-white underline tracking-wider cursor-pointer"
                  >
                    Alternative Harmonization: {altProduct.name} &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
