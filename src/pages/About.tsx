import React from 'react';
import { BRAND, TIMELINE_MILESTONES, BRAND_VALUES, CRAFTSMANSHIP_STATS } from '../data/siteData';
import { PillButton } from '../components/PillButton';
import { RotatingBadge } from '../components/RotatingBadge';
import { Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  onOpenStoreLocator: () => void;
}

export const About: React.FC<AboutSectionProps> = ({ onOpenStoreLocator }) => {
  return (
    <section id="about" className="relative bg-[#FAF2E1] py-28 sm:py-36 border-b border-[#3B0000]/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* 1. HERO STORY & PULL-QUOTE */}
        <div className="relative pb-20 border-b border-[#3B0000]/10">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                The House of Avelore · Est. 2019
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-[#3B0000] leading-[1.05] tracking-tight">
              Scent, composed with <span className="font-serif italic font-normal text-[#520909]">infinite intention.</span>
            </h2>
          </div>

          {/* Large Editorial Pull-Quote */}
          <div className="bg-[#FFFBF5] rounded-[32px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs relative overflow-hidden">
            <div className="absolute top-8 right-8 hidden sm:block">
              <RotatingBadge size={105} text="GRASSE · PARIS · LONDON · TOKYO · " />
            </div>

            <blockquote className="text-2xl sm:text-4xl font-serif italic text-[#3B0000] max-w-3xl leading-snug mb-8">
              &ldquo;{BRAND.manifesto}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4 text-xs font-display font-bold uppercase tracking-widest text-[#3B0000]">
              <span>Helena Vane & Marc d'Orsay</span>
              <span className="text-[#3B0000]/30">·</span>
              <span className="text-[#7E4A4A]">Founding Noses & Creative Directors</span>
            </div>
          </div>
        </div>

        {/* 2. STATS ROW */}
        <div className="py-20 border-b border-[#3B0000]/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {CRAFTSMANSHIP_STATS.map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#FFFBF5] border border-[#3B0000]/10 shadow-2xs">
                <span className="text-3xl sm:text-5xl font-display font-extrabold text-[#3B0000] tabular-nums block mb-1">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-wider font-display font-bold text-[#3B0000] block mb-2">
                  {stat.label}
                </span>
                <p className="text-xs text-[#7E4A4A] leading-relaxed font-sans">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CORE VALUES (3 CARDS) */}
        <div className="py-20 border-b border-[#3B0000]/10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-2">
              Guiding Charters
            </span>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
              Principles That Shape <span className="font-serif italic font-normal text-[#520909]">Every Flacon</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BRAND_VALUES.map((val, idx) => (
              <div
                key={idx}
                className="bg-[#FFFBF5] rounded-[28px] p-8 border border-[#3B0000]/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#3B0000] text-[#FFD482] text-xs font-mono font-bold flex items-center justify-center mb-6">
                    0{idx + 1}
                  </div>
                  <h4 className="text-2xl font-display font-bold text-[#3B0000] mb-1">
                    {val.title}
                  </h4>
                  <span className="text-xs uppercase tracking-wider text-[#7E4A4A] font-display font-bold block mb-4">
                    {val.subtitle}
                  </span>
                  <p className="text-xs sm:text-sm text-[#7E4A4A] leading-relaxed font-sans">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CRAFTSMANSHIP TIMELINE */}
        <div className="py-20 border-b border-[#3B0000]/10">
          <div className="max-w-2xl mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-2">
              Chronology
            </span>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
              The Evolution of the <span className="font-serif italic font-normal text-[#520909]">Atelier</span>
            </h3>
          </div>

          <div className="relative border-l-2 border-[#3B0000]/20 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-12">
            {TIMELINE_MILESTONES.map((milestone, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[41px] sm:-left-[57px] top-1.5 w-5 h-5 rounded-full bg-[#FAF2E1] border-4 border-[#3B0000] group-hover:scale-125 transition-transform" />

                <span className="text-xs font-mono font-bold text-[#3B0000] tracking-widest uppercase block mb-1">
                  {milestone.year}
                </span>
                <h4 className="text-xl sm:text-2xl font-display font-bold text-[#3B0000] mb-2">
                  {milestone.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#7E4A4A] max-w-xl leading-relaxed font-sans">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. INGREDIENT SOURCING ETHICS & FOUNDER'S NOTE */}
        <div className="pt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 bg-[#FFFBF5] rounded-[32px] p-8 sm:p-12 border border-[#3B0000]/10 shadow-xs">
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-3">
              Ethical Terroir Charter
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000] mb-4">
              Direct Grower Partnerships
            </h3>
            <p className="text-xs sm:text-sm text-[#7E4A4A] leading-relaxed mb-6 font-sans">
              Unlike the consolidated industrial perfume trade, Avelore transacts directly with the agricultural estates where raw flora is cultivated. We contract multi-year harvests at fixed living prices, ensuring families can preserve heirloom extraction traditions.
            </p>

            <div className="space-y-3 text-xs text-[#3B0000] font-medium font-sans">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B0000]" />
                <span>Zero synthetic petrochemical musk compounds</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B0000]" />
                <span>Certified cruelty-free; never tested on living creatures</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B0000]" />
                <span>Recyclable lead-free European glass flacons and biodegradable outer fiber</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#3B0000] text-[#FFD482] rounded-[32px] p-8 sm:p-10 flex flex-col justify-between border border-[#FFD482]/20 shadow-md">
            <div>
              <Sparkles className="w-6 h-6 text-[#FFD482] mb-4" />
              <h4 className="text-xl font-display font-bold text-[#FFD482] mb-3">
                Experience in Person
              </h4>
              <p className="text-xs text-[#FFF5E3]/75 leading-relaxed mb-8 font-sans">
                Our resident noses in Paris, London, and New York offer bespoke scent consultations tailored to your olfactory memory.
              </p>
            </div>

            <PillButton
              variant="apricot"
              size="md"
              arrow="up-right"
              onClick={onOpenStoreLocator}
            >
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Reserve Salon Visit
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
};
