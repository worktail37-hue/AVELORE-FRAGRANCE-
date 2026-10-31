import React from 'react';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductCard } from './ProductCard';
import { Sparkles, Award } from 'lucide-react';
import { RotatingBadge } from './RotatingBadge';

interface ExclusivePerfumesSectionProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const ExclusivePerfumesSection: React.FC<ExclusivePerfumesSectionProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  // Filter the 6 exclusive fragrances
  const exclusiveProducts = PRODUCTS.filter((p) => p.category === 'exclusive');

  return (
    <section
      id="exclusive-perfumes"
      className="relative bg-[#250000] text-[#FFD482] py-28 sm:py-36 overflow-hidden border-b border-[#FFD482]/20"
    >
      {/* Background ambient radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#3B0000] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid watermark */}
      <div className="absolute right-6 top-12 font-display font-black text-[16vw] text-[#FFD482]/[0.03] select-none pointer-events-none leading-none">
        EXCLUSIVE
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-12 border-b border-[#FFD482]/15">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FFD482] shadow-[0_0_10px_#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                Private Reserve & Limited Extraits
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-[#FFD482] tracking-tight leading-[1.08]">
              Exclusive <span className="font-serif italic font-normal text-white">Perfumes</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#FFF5E3]/80 leading-relaxed font-sans max-w-2xl">
              Six rare, numbered formulations produced in limited annual volumes. Sourced from multi-year cured absolutes, precious vintage resins, and single-harvest botanicals aged in French oak barrels.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5 text-xs font-display font-bold text-[#FFD482] mb-1">
                <Award className="w-4 h-4" />
                <span>Numbered Editions</span>
              </div>
              <div className="text-xs text-[#FFD482]/60 font-mono">
                Strictly 300 Flacons / Harvest
              </div>
            </div>

            <RotatingBadge size={105} text="PRIVATE · RESERVE · EXTRAIT · " />
          </div>
        </div>

        {/* Grid of the 6 Exclusive Perfumes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {exclusiveProducts.map((product) => (
            <div key={product.id} className="relative">
              {product.edition && (
                <div className="absolute top-4 left-6 z-20 pointer-events-none">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#3B0000] text-[#FFD482] px-2.5 py-1 rounded-full border border-[#FFD482]/30 shadow-xs">
                    {product.edition}
                  </span>
                </div>
              )}
              <ProductCard
                product={product}
                onQuickView={onQuickView}
                onFindInStore={onFindInStore}
                className="bg-[#FFFBF5] text-[#3B0000] border-[#FFD482]/30 hover:border-[#FFD482]"
              />
            </div>
          ))}
        </div>

        {/* Private Reserve Guarantee Strip */}
        <div className="mt-16 p-8 rounded-[28px] bg-[#3B0000] border border-[#FFD482]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#250000] border border-[#FFD482]/30 flex items-center justify-center shrink-0 text-[#FFD482]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#FFD482] mb-0.5">
                Bespoke Serialized Decanting
              </h3>
              <p className="text-xs text-[#FFF5E3]/70 font-sans">
                Each Exclusive Perfume flacon is hand-filled, waxed, and cataloged with a personal certificate of harvest authenticity.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-[#FFD482]/80 uppercase tracking-widest shrink-0">
            Grasse Atelier Reserve
          </div>
        </div>
      </div>
    </section>
  );
};
