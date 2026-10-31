import React, { useEffect, useState } from 'react';
import { X, MapPin, Sparkles, Heart } from 'lucide-react';
import { Product } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { PillButton } from './PillButton';
import { useAuth } from '../context/AuthContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onFindInStore: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onFindInStore,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = product ? isFavorite(product.id) : false;

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[product.sizes.length - 1]);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop in Burnt Merlot tint */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#220000]/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        className="relative w-full max-w-4xl bg-[#FFFBF5] rounded-[32px] shadow-[0_24px_80px_rgba(59,0,0,0.3)] border border-[#3B0000]/15 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-[#FAF2E1] hover:bg-[#3B0000] hover:text-[#FFD482] text-[#3B0000] border border-[#3B0000]/10 shadow-sm transition-all duration-200 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Left Column: Bottle Visual & Warm Apricot Chamber */}
          <div
            className="md:col-span-5 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF2E1] border-r border-[#3B0000]/10"
          >
            <div className="absolute top-6 left-6 z-10 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#3B0000] font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#3B0000]" />
              <span>{product.categoryLabel}</span>
            </div>

            <div className="w-full max-w-[260px] py-4">
              <ProductVisual product={product} size="lg" />
            </div>

            <div className="text-center text-[11px] tracking-widest uppercase font-mono text-[#3B0000]/60 mt-4">
              Formulated in Grasse · Bottled in Paris
            </div>
          </div>

          {/* Right Column: Narrative, Notes, and Store Action */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                  {product.subtitle}
                </span>
                <span className="text-base sm:text-lg font-display font-bold text-[#3B0000] tabular-nums">
                  From ${product.priceFrom}
                </span>
              </div>

              <h2 id="quickview-title" className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000] mb-3 leading-tight">
                {product.name}
              </h2>

              <p className="text-sm text-[#7E4A4A] leading-relaxed mb-6 font-sans">
                {product.longDescription || product.description}
              </p>

              {/* Scent Notes or Ingredients */}
              {product.notes ? (
                <div className="mb-6 border-y border-[#3B0000]/10 py-4">
                  <div className="text-xs uppercase tracking-widest font-display font-bold text-[#3B0000] mb-3">
                    Olfactory Architecture
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-baseline gap-3">
                      <span className="w-16 font-bold uppercase tracking-wider text-[#7E4A4A] shrink-0 font-display">
                        Top
                      </span>
                      <span className="text-[#3B0000] font-medium">
                        {product.notes.top.join(' · ')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-16 font-bold uppercase tracking-wider text-[#7E4A4A] shrink-0 font-display">
                        Heart
                      </span>
                      <span className="text-[#3B0000] font-medium">
                        {product.notes.heart.join(' · ')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="w-16 font-bold uppercase tracking-wider text-[#7E4A4A] shrink-0 font-display">
                        Base
                      </span>
                      <span className="text-[#3B0000] font-medium">
                        {product.notes.base.join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : product.ingredients ? (
                <div className="mb-6 border-y border-[#3B0000]/10 py-4">
                  <div className="text-xs uppercase tracking-widest font-display font-bold text-[#3B0000] mb-2">
                    Key Botanical Ingredients
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[#7E4A4A]">
                    {product.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-[#FAF2E1] border border-[#3B0000]/10 px-2.5 py-1 rounded-md text-[#3B0000] font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Sizes (Visual Only) */}
              {product.sizes.length > 0 && (
                <div className="mb-8">
                  <span className="text-xs font-display font-bold uppercase tracking-widest text-[#3B0000] block mb-2.5">
                    Available Measures
                  </span>
                  <div className="flex items-center gap-2.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs font-bold font-display rounded-full transition-all duration-200 cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#3B0000] text-[#FFD482] shadow-sm'
                            : 'bg-[#FAF2E1] text-[#3B0000] hover:bg-[#FFD482]/40 border border-[#3B0000]/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#3B0000]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#7E4A4A] leading-tight text-center sm:text-left">
                Available exclusively in our Parisian and international boutiques and authorized private ateliers.
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    favorited
                      ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000]'
                      : 'bg-[#FAF2E1] text-[#3B0000] border-[#3B0000]/15 hover:border-[#3B0000]/30'
                  }`}
                  title={favorited ? 'In My Favorites (Click to remove)' : 'Add to Wishlist (Save to Profile)'}
                  aria-label={favorited ? 'In My Favorites' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-current text-[#FFD482]' : ''}`} />
                </button>

                <PillButton
                  variant="merlot"
                  size="md"
                  arrow="right"
                  onClick={() => {
                    onClose();
                    onFindInStore(product);
                  }}
                  className="flex-1 sm:flex-initial"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  Find in Store
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
