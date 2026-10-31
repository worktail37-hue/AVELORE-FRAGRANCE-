import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../data/siteData';

interface CategoryShowcaseProps {
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const handleCategoryClick = (id: string) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    }
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#FAF2E1] py-20 sm:py-28 overflow-hidden border-b border-[#3B0000]/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                Olfactory Disciplines
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight">
              Curated <span className="font-serif italic font-normal text-[#520909]">Mediums</span>
            </h2>
          </div>

          <button
            onClick={() => handleCategoryClick('all')}
            className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] hover:text-[#520909] flex items-center gap-2 group transition-colors cursor-pointer"
          >
            <span>View Complete Catalogue</span>
            <span className="w-5 h-[1.5px] bg-[#3B0000] group-hover:w-8 transition-all" />
          </button>
        </div>

        {/* 4 Large Animated Category Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const bgGradients = [
              'linear-gradient(135deg, #FFF5E3 0%, #FFECD1 100%)', // Fragrance
              'linear-gradient(135deg, #FAF0DF 0%, #F5E5CE 100%)', // Body & Bath
              'linear-gradient(135deg, #FFF8EC 0%, #FFE9CA 100%)', // Home
              'linear-gradient(135deg, #FBF1DE 0%, #F8E7C8 100%)', // Beauty
            ];

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group relative flex flex-col justify-between rounded-[32px] p-8 min-h-[380px] border border-[#3B0000]/10 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(59,0,0,0.12)] select-none cursor-pointer"
                style={{ background: bgGradients[idx] }}
              >
                {/* Top Row: Index & Arrow Pill */}
                <div className="flex items-center justify-between z-10">
                  <span className="font-mono text-xs font-bold tracking-widest text-[#3B0000]/50 uppercase">
                    0{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#3B0000] flex items-center justify-center text-[#FFD482] shadow-xs group-hover:scale-110 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Center Stylized Abstract Vessel Silhouette */}
                <div className="my-auto flex items-center justify-center py-6 opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                  {idx === 0 && (
                    <svg viewBox="0 0 100 120" className="w-24 h-28" fill="none">
                      <rect x="25" y="30" width="50" height="75" rx="8" fill="#3B0000" opacity="0.85" />
                      <rect x="38" y="10" width="24" height="20" rx="3" fill="#FFD482" />
                      <line x1="30" y1="40" x2="30" y2="95" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg viewBox="0 0 100 120" className="w-24 h-28" fill="none">
                      <rect x="32" y="30" width="36" height="80" rx="10" fill="#3B0000" opacity="0.8" />
                      <path d="M46 12 L54 12 L54 30 L46 30 Z" fill="#FFD482" />
                      <path d="M40 18 L60 18" stroke="#3B0000" strokeWidth="3" />
                      <line x1="36" y1="40" x2="36" y2="100" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg viewBox="0 0 100 120" className="w-24 h-28" fill="none">
                      <ellipse cx="50" cy="40" rx="28" ry="8" fill="#FFFBF5" stroke="#3B0000" strokeWidth="1" />
                      <path d="M22 40 L24 100 Q50 110 76 100 L78 40 Z" fill="#3B0000" opacity="0.85" />
                      <path d="M50 25 C52 30, 51 34, 50 36 C49 34, 48 30, 50 25 Z" fill="#FFD482" />
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg viewBox="0 0 100 120" className="w-24 h-28" fill="none">
                      <rect x="32" y="35" width="36" height="70" rx="8" fill="#3B0000" opacity="0.85" />
                      <rect x="40" y="20" width="20" height="15" rx="2" fill="#FFD482" />
                      <ellipse cx="50" cy="14" rx="8" ry="6" fill="#3B0000" />
                    </svg>
                  )}
                </div>

                {/* Bottom Details */}
                <div className="z-10 pt-4 border-t border-[#3B0000]/10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-display font-bold text-[#3B0000] group-hover:text-[#520909] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-display font-bold tracking-wider text-[#3B0000]/70 uppercase">
                      {cat.count} Items
                    </span>
                  </div>
                  <p className="text-xs text-[#7E4A4A] line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
