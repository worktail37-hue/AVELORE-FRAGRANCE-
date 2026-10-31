import React, { useMemo, useState } from 'react';
import { Product } from '../data/siteData';
import { WorksWheel, WorksWheelItem } from '../../components/ui/works-wheel';
import { getProductFlaconDataUrl } from '../utils/fragranceVisualHelper';
import { Sparkles, Compass, Eye, Volume2 } from 'lucide-react';

interface FragranceWorksWheelProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onFindInStore?: (product: Product) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const FragranceWorksWheel: React.FC<FragranceWorksWheelProps> = ({
  products,
  onQuickView,
  className = '',
  title = "Fine Fragrances Orbit",
  subtitle = "Turn the 3D flacon wheel or select any fragrance to examine formulation chords & rare harvests.",
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products[0] || null
  );

  // Convert products into WorksWheelItem array
  const wheelItems: WorksWheelItem[] = useMemo(() => {
    return products.map((product) => {
      const topNotes = product.notes?.top?.slice(0, 2).join(', ') || '';
      const heartNotes = product.notes?.heart?.slice(0, 2).join(', ') || '';
      const notesSummary = topNotes ? `${topNotes} · ${heartNotes}` : product.volume;

      return {
        title: product.name,
        image: getProductFlaconDataUrl(product),
        subtitle: `${product.subtitle} · ${product.volume}`,
        badge: product.badge || (product.category === 'exclusive' ? 'Rare Reserve' : 'Extrait'),
        price: `$${product.priceFrom}`,
        notesSummary: notesSummary ? `Notes: ${notesSummary}` : undefined,
        product,
        onClick: () => {
          onQuickView(product);
        },
      };
    });
  }, [products, onQuickView]);

  return (
    <div className={`relative w-full rounded-[32px] overflow-hidden border border-[#3B0000]/15 bg-[#FAF2E1] shadow-[0_24px_60px_rgba(59,0,0,0.08)] ${className}`}>
      {/* Top Section Header */}
      <div className="relative px-6 sm:px-10 pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3B0000]/10 bg-[#FAF2E1]/70 backdrop-blur-sm z-20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-[0.25em] text-[#7E4A4A]">
              Haute Parfumerie · Interactive Flacon Wheel
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#3B0000] tracking-tight">
            {title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[#7E4A4A] max-w-2xl font-sans">
            {subtitle}
          </p>
        </div>

        {/* Interaction hint */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#3B0000]/70 bg-[#FFFBF5] px-3.5 py-1.5 rounded-full border border-[#3B0000]/10 shrink-0">
          <Compass className="w-3.5 h-3.5 text-[#3B0000]" />
          <span>Scroll wheel or drag vertically to rotate</span>
        </div>
      </div>

      {/* 3D Works Wheel Stage */}
      <div className="relative h-[560px] sm:h-[620px] w-full">
        <WorksWheel
          items={wheelItems}
          label="AVELORE '26"
          action="Quick View"
          onItemSelect={(item) => {
            if (item.product) {
              onQuickView(item.product);
            }
          }}
          className="h-full bg-transparent"
        />
      </div>

      {/* Bottom Bar: Quick summary of all flacons with instant click-to-view */}
      <div className="relative px-6 sm:px-10 py-4 bg-[#FFFBF5] border-t border-[#3B0000]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7E4A4A] z-20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B0000]" />
          <span className="font-display font-bold uppercase tracking-wider text-[#3B0000]">
            {products.length} Compositions in Orbit
          </span>
          <span className="text-[#3B0000]/30 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Click any flacon or name to view formulation notes</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#3B0000]/60">
            Hand-filled in Grasse, France
          </span>
        </div>
      </div>
    </div>
  );
};
