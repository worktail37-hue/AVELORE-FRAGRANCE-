import React, { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/siteData';

export const COMPREHENSIVE_FAQS = [
  ...FAQS,
  {
    question: "What makes Avelore luxury perfumes distinct from commercial designer fragrances?",
    answer: "Avelore formulates exclusively in Extrait de Parfum and rich Eau de Parfum concentrations, utilizing multi-year cured floral absolutes, rare resin harvests, and zero synthetic fixatives. We employ slow cold maceration in French oak and copper stills, preserving the living nuance of each botanical harvest.",
  },
  {
    question: "How long can I expect an Avelore Eau de Parfum to linger on the skin?",
    answer: "Because our formulations contain high concentrations of natural botanical oils (20% to 35% in our Reserve Extraits), our scents linger intimately on skin for 10 to 18 hours, and for several days on natural fiber textiles like wool, silk, and linen.",
  },
  {
    question: "How does the SCENT VIBE AI consultation match my signature fragrance?",
    answer: "Our Scent Vibe engine analyzes your emotional daydream, desired atmosphere (such as St. Germain autumns or Mediterranean twilight), dominant accords, and projection silhouette. It cross-references your sensory preferences with our master formulation pyramid to recommend the exact flacon best suited to your natural skin chemistry.",
  },
  {
    question: "Can I layer multiple Avelore fragrances to create a personalized accord?",
    answer: "Yes. Our fragrances are intentionally composed with harmonic natural bases. We recommend pairing a resinous amber base (such as Ambre Impérial Reserve or Nocturne Renewal Oil) with a radiant floral or citrus top veil like Solène or Rose Sépale.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faqs"
      className="relative bg-[#FAF2E1] py-24 sm:py-32 border-b border-[#3B0000]/10 scroll-mt-24"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3B0000]/5 border border-[#3B0000]/15 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B0000]" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-display font-bold text-[#3B0000]">
              Inquiries &amp; Knowledge
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight mb-4">
            Frequently Asked <span className="font-serif italic font-normal text-[#520909]">Questions</span>
          </h2>

          <p className="text-sm sm:text-base text-[#7E4A4A] leading-relaxed font-sans">
            Everything you need to know about our Grasse maceration traditions, scent longevity, bespoke gifting, and the Scent Vibe formulation matching.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="bg-[#FFFBF5] rounded-[32px] p-6 sm:p-12 border border-[#3B0000]/10 shadow-xs divide-y divide-[#3B0000]/10">
          {COMPREHENSIVE_FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6 first:pt-2 last:pb-2">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-display font-bold text-[#3B0000] group-hover:text-[#520909] transition-colors">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-[#3B0000]/15 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#3B0000] text-[#FFD482]' : 'bg-[#FAF2E1] text-[#3B0000]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 text-xs sm:text-sm text-[#7E4A4A] leading-relaxed pr-6 font-sans animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
