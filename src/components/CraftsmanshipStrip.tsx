import React from 'react';
import { INGREDIENT_MARQUEE, CRAFTSMANSHIP_STATS } from '../data/siteData';

export const CraftsmanshipStrip: React.FC = () => {
  return (
    <section className="relative bg-[#250000] text-[#FFD482] py-20 overflow-hidden select-none border-b border-[#FFD482]/15">
      {/* 1. CONTINUOUS INGREDIENT MARQUEE */}
      <div className="border-y border-[#FFD482]/15 py-5 overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 whitespace-nowrap text-sm sm:text-base font-serif italic text-[#FFD482]/90">
          {[...INGREDIENT_MARQUEE, ...INGREDIENT_MARQUEE].map((ing, idx) => (
            <div key={idx} className="flex items-center gap-10 shrink-0">
              <span className="hover:text-white transition-colors">{ing}</span>
              <span className="text-[#FFD482] text-xs font-sans not-italic">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CRAFTSMANSHIP STATS ROW */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-16 sm:mt-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {CRAFTSMANSHIP_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#3B0000] border border-[#FFD482]/20 shadow-sm"
            >
              <div>
                <span className="text-3xl sm:text-5xl font-display font-extrabold text-[#FFD482] tracking-tight tabular-nums block mb-2">
                  {stat.value}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFF5E3] block mb-2 font-display">
                  {stat.label}
                </span>
              </div>
              <p className="text-xs text-[#FFD482]/70 leading-relaxed font-sans">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
