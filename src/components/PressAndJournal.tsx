import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRESS_QUOTES } from '../data/siteData';

export const PressAndJournal: React.FC = () => {
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  const prevQuote = () => {
    setActiveQuoteIdx((curr) => (curr === 0 ? PRESS_QUOTES.length - 1 : curr - 1));
  };

  const nextQuote = () => {
    setActiveQuoteIdx((curr) => (curr === PRESS_QUOTES.length - 1 ? 0 : curr + 1));
  };

  return (
    <section className="relative bg-[#FAF2E1] py-20 sm:py-24 overflow-hidden border-b border-[#3B0000]/10" aria-label="Critical olfactory press acclaim">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* PRESS & CRITICAL ACCLAIM SLIDER */}
        <div className="bg-[#FFFBF5] rounded-[32px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#3B0000]/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                Critical Olfactory Reception
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevQuote}
                className="p-2 rounded-full border border-[#3B0000]/15 hover:bg-[#3B0000] hover:text-[#FFD482] text-[#3B0000] transition-colors cursor-pointer"
                aria-label="Previous quote"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextQuote}
                className="p-2 rounded-full border border-[#3B0000]/15 hover:bg-[#3B0000] hover:text-[#FFD482] text-[#3B0000] transition-colors cursor-pointer"
                aria-label="Next quote"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="min-h-[140px] flex flex-col justify-between">
            <blockquote className="text-2xl sm:text-4xl font-serif italic text-[#3B0000] leading-snug max-w-4xl">
              &ldquo;{PRESS_QUOTES[activeQuoteIdx].quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm font-display font-bold text-[#3B0000]">
                {PRESS_QUOTES[activeQuoteIdx].publication}
              </span>
              <span className="text-[#3B0000]/30">·</span>
              <span className="text-xs text-[#7E4A4A] uppercase tracking-wider font-semibold">
                {PRESS_QUOTES[activeQuoteIdx].role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
