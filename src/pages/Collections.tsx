import React from 'react';
import { COLLECTIONS, PRODUCTS, Product } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowDown, Compass, Quote } from 'lucide-react';

interface CollectionsSectionProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const Collections: React.FC<CollectionsSectionProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  return (
    <section id="collections" className="relative bg-[#FAF2E1] pt-28 sm:pt-36">
      {/* Intro Editorial Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
            Curatorial Series
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-[#3B0000] tracking-tight max-w-4xl mx-auto">
          Four Chapters in <span className="font-serif italic font-normal text-[#520909]">Atmospheric Memory</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#7E4A4A] max-w-2xl mx-auto leading-relaxed font-sans">
          Each chapter represents a cohesive sensory landscape, weaving together Exclusive Perfumes, Fine Fragrances, Body & Bath rituals, Home scents, and Beauty formulations.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#3B0000]/70">
          <span>Scroll to traverse the chapters</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#3B0000]" />
        </div>
      </div>

      {/* 4 Full-Width Collection Chapters */}
      <div className="space-y-0">
        {COLLECTIONS.map((chapter) => {
          // Resolve all featured products for this chapter
          const chapterProducts = PRODUCTS.filter((p) =>
            chapter.featuredProductIds.includes(p.id)
          );

          const isDarkMerlot = chapter.id === 'nocturne';

          return (
            <div
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className={`relative py-28 sm:py-36 border-t border-[#3B0000]/10 ${chapter.bgClass} overflow-hidden`}
            >
              {/* Giant Chapter Number in Background - Contained & Non-Obtrusive */}
              <div
                className={`absolute right-4 sm:right-10 top-6 sm:top-10 select-none pointer-events-none font-display font-black text-[18vw] lg:text-[13rem] leading-none z-0 ${
                  isDarkMerlot ? 'text-[#FFD482]/[0.04]' : 'text-[#3B0000]/[0.03]'
                }`}
                aria-hidden="true"
              >
                {chapter.number}
              </div>

              <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                {/* Chapter Narrative Header with Proper Full-Screen 12-Column Grid Alignment */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-16 sm:mb-20">
                  {/* Left Column (7 cols): Kicker, Main Heading & Oriented Narrative Description */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      {/* Chapter Badge */}
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border mb-4 text-xs font-bold tracking-wider uppercase font-display shadow-2xs backdrop-blur-xs">
                        <span className={`font-mono text-xs font-extrabold ${isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'}`}>
                          CHAPTER {chapter.number}
                        </span>
                        <span className={`w-1 h-1 rounded-full ${isDarkMerlot ? 'bg-[#FFD482]' : 'bg-[#3B0000]'}`} />
                        <span className={`text-[11px] font-semibold tracking-widest ${isDarkMerlot ? 'text-[#FFD482]/80' : 'text-[#7E4A4A]'}`}>
                          {chapter.subtitle}
                        </span>
                      </div>

                      {/* Main Heading */}
                      <h3 className={`text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-6 leading-[1.08] ${
                        isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'
                      }`}>
                        {chapter.title}
                      </h3>

                      {/* Properly Oriented Narrative Section below the Heading */}
                      <div className={`border-l-2 pl-5 sm:pl-6 my-6 transition-all ${
                        isDarkMerlot
                          ? 'border-[#FFD482]/40 bg-[#FFD482]/[0.03] py-2 rounded-r-xl'
                          : 'border-[#3B0000]/25 bg-[#3B0000]/[0.02] py-2 rounded-r-xl'
                      }`}>
                        <p className={`text-base sm:text-lg leading-relaxed font-sans font-normal ${
                          isDarkMerlot ? 'text-[#FFF5E3]/90' : 'text-[#521313]'
                        }`}>
                          {chapter.narrative}
                        </p>
                      </div>
                    </div>

                    {/* Terroir & Olfactory Compass Indicator */}
                    <div className={`pt-4 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest ${
                      isDarkMerlot ? 'text-[#FFD482]/70' : 'text-[#3B0000]/70'
                    }`}>
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      <span>Curatorial Territory: {chapter.subtitle}</span>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Master Perfumer Pull-Quote & Olfactory Chords */}
                  <div className={`lg:col-span-5 rounded-[28px] p-8 sm:p-10 border shadow-md flex flex-col justify-between ${
                    isDarkMerlot
                      ? 'bg-[#3B0000] border-[#FFD482]/25 text-[#FFD482]'
                      : 'bg-[#FFFBF5] border-[#3B0000]/15 text-[#3B0000]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[11px] font-display font-bold uppercase tracking-[0.2em] ${
                          isDarkMerlot ? 'text-[#FFD482]/70' : 'text-[#7E4A4A]'
                        }`}>
                          Olfactory Observation
                        </span>
                        <Quote className={`w-5 h-5 opacity-40 ${isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'}`} />
                      </div>

                      <blockquote className="text-lg sm:text-xl font-serif italic mb-6 leading-relaxed">
                        &ldquo;{chapter.quote}&rdquo;
                      </blockquote>
                    </div>

                    <div className={`pt-5 border-t ${isDarkMerlot ? 'border-[#FFD482]/20' : 'border-[#3B0000]/10'}`}>
                      <div className={`text-[11px] font-display font-bold uppercase tracking-widest mb-3 ${
                        isDarkMerlot ? 'text-[#FFD482]/80' : 'text-[#7E4A4A]'
                      }`}>
                        Dominant Olfactory Chords
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {chapter.sensoryAtmosphere.map((note, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold font-display tracking-wide ${
                              isDarkMerlot
                                ? 'bg-[#FFD482]/15 text-[#FFD482] border border-[#FFD482]/25 hover:bg-[#FFD482]/25'
                                : 'bg-[#FAF2E1] text-[#3B0000] border border-[#3B0000]/15 hover:bg-[#FFD482]/20'
                            } transition-colors`}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Products in this Chapter across Categories */}
                <div>
                  <div className={`text-xs font-display font-bold uppercase tracking-widest mb-6 flex items-center justify-between border-b pb-3 ${
                    isDarkMerlot ? 'text-[#FFD482] border-[#FFD482]/15' : 'text-[#3B0000] border-[#3B0000]/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
                      <span>Curated Creations for Chapter {chapter.number}</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-75">
                      {chapterProducts.length} Selections
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {chapterProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onQuickView={onQuickView}
                        onFindInStore={onFindInStore}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
