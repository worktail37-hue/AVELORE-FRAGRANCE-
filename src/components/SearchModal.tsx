import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductVisual } from './ProductVisual';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSubtitle = p.subtitle.toLowerCase().includes(q);
      const matchCategory = p.categoryLabel.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchNotes = p.notes
        ? [...p.notes.top, ...p.notes.heart, ...p.notes.base].some((n) =>
            n.toLowerCase().includes(q)
          )
        : false;
      const matchIng = p.ingredients
        ? p.ingredients.some((i) => i.toLowerCase().includes(q))
        : false;
      return matchName || matchSubtitle || matchCategory || matchDesc || matchNotes || matchIng;
    });
  }, [query]);

  const quickTags = ['Amber', 'Bergamot', 'Rose', 'Neroli', 'Candle', 'Diffuser', 'Sandalwood'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#220000]/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="relative w-full max-w-3xl bg-[#FFFBF5] rounded-[32px] shadow-[0_24px_80px_rgba(59,0,0,0.3)] border border-[#3B0000]/15 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="p-6 sm:p-8 border-b border-[#3B0000]/10 flex items-center gap-4">
          <Search className="w-6 h-6 text-[#3B0000]/50 shrink-0" />
          <input
            id="search-modal-title"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by scent note (e.g. amber, rose), name, or object..."
            className="w-full text-lg sm:text-xl font-display font-bold text-[#3B0000] placeholder-[#3B0000]/30 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs uppercase tracking-wider text-[#7E4A4A] hover:text-[#3B0000] font-display font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#3B0000]/10 text-[#3B0000] cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 sm:px-8 py-3 bg-[#FAF2E1] border-b border-[#3B0000]/10 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#7E4A4A] font-bold font-display shrink-0">Popular:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3.5 py-1 rounded-full bg-[#FFFBF5] hover:bg-[#3B0000] hover:text-[#FFD482] transition-colors text-[#3B0000] font-display font-bold border border-[#3B0000]/10 shadow-2xs shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-[#7E4A4A]">
              <Sparkles className="w-6 h-6 mx-auto mb-3 text-[#3B0000]" />
              <p className="text-sm font-serif italic">
                Type an ingredient, scent note, or product name to explore our olfactory catalogue.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-[#7E4A4A]">
              <p className="text-base font-display font-bold text-[#3B0000] mb-1">
                No formulations found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs">
                Try searching for raw materials such as <span className="underline">neroli</span>, <span className="underline">saffron</span>, or <span className="underline">sage</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-[#7E4A4A] mb-2 font-display font-bold">
                Found {results.length} formulation{results.length > 1 ? 's' : ''}
              </div>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-[#FAF2E1] border border-[#3B0000]/10 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#FAF2E1] flex items-center justify-center p-1 shrink-0 overflow-hidden border border-[#3B0000]/10">
                      <ProductVisual product={product} size="sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#3B0000] font-display">
                          {product.categoryLabel}
                        </span>
                        <span className="text-[#3B0000]/20">·</span>
                        <span className="text-[10px] text-[#7E4A4A] font-mono">{product.volume}</span>
                      </div>
                      <h4 className="text-base font-display font-bold text-[#3B0000] group-hover:text-[#520909] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#7E4A4A] line-clamp-1">{product.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    <span className="text-xs font-bold font-display tabular-nums text-[#3B0000]">
                      From ${product.priceFrom}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#3B0000]/40 group-hover:text-[#3B0000] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
