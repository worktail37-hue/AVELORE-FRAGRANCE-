import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF2E1] flex flex-col items-center justify-center px-6 py-32 text-center">
      <SEO
        title="404 — Chapter Not Found | Avelore"
        description="The requested page could not be located in the Avelore archives. Return to the home salon or browse the permanent catalogue."
        noindex={true}
      />

      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#3B0000] text-[#FFD482] mx-auto flex items-center justify-center shadow-lg border border-[#FFD482]/20">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#801B00] font-bold block">
          Error 404 • Lost Meridian
        </span>

        <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight">
          Chapter <span className="font-serif italic font-normal text-[#520909]">Not Found</span>
        </h1>

        <p className="text-sm sm:text-base text-[#7E4A4A] leading-relaxed font-sans">
          The flacon dossier, curatorial chapter, or chronicle you are seeking has evaporated or never existed in the Avelore archives.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3B0000] text-[#FFD482] rounded-full text-xs font-bold uppercase tracking-wider font-display hover:bg-[#520909] transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFFBF5] text-[#3B0000] border border-[#3B0000]/20 rounded-full text-xs font-bold uppercase tracking-wider font-display hover:bg-[#FFD482]/30 transition-all"
          >
            <span>Browse Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
