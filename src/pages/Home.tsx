import React, { useState, Suspense, lazy } from 'react';
import { HeroSection } from '../components/HeroSection';
import { StyleStatementSection } from '../components/StyleStatementSection';
import { LazySection } from '../components/LazySection';
import { Product } from '../data/siteData';
import { SEO } from '../components/SEO';

// Lazy-loaded sub-sections that load dynamically as the visitor scrolls down
const ExclusivePerfumesSection = lazy(() =>
  import('../components/ExclusivePerfumesSection').then((m) => ({ default: m.ExclusivePerfumesSection }))
);
const CategoryShowcase = lazy(() =>
  import('../components/CategoryShowcase').then((m) => ({ default: m.CategoryShowcase }))
);
const ScentNotesExplorer = lazy(() =>
  import('../components/ScentNotesExplorer').then((m) => ({ default: m.ScentNotesExplorer }))
);
const Shop = lazy(() =>
  import('./Shop').then((m) => ({ default: m.Shop }))
);
const Collections = lazy(() =>
  import('./Collections').then((m) => ({ default: m.Collections }))
);
const CraftsmanshipStrip = lazy(() =>
  import('../components/CraftsmanshipStrip').then((m) => ({ default: m.CraftsmanshipStrip }))
);
const About = lazy(() =>
  import('./About').then((m) => ({ default: m.About }))
);
const PressAndJournal = lazy(() =>
  import('../components/PressAndJournal').then((m) => ({ default: m.PressAndJournal }))
);
const FAQSection = lazy(() =>
  import('../components/FAQSection').then((m) => ({ default: m.FAQSection }))
);
const Contact = lazy(() =>
  import('./Contact').then((m) => ({ default: m.Contact }))
);
const FinalCtaBanner = lazy(() =>
  import('../components/FinalCtaBanner').then((m) => ({ default: m.FinalCtaBanner }))
);

interface HomeProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
  onOpenStoreLocator: () => void;
  onOpenScentVibeQuiz?: () => void;
}

const SectionSkeleton: React.FC<{ minHeight?: string }> = ({ minHeight = '350px' }) => (
  <div
    className="w-full flex flex-col items-center justify-center p-12 opacity-30 select-none pointer-events-none"
    style={{ minHeight }}
    aria-hidden="true"
  >
    <div className="w-5 h-5 rounded-full border-2 border-[#3B0000]/20 border-t-[#3B0000] animate-spin mb-3" />
    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B0000]">
      Avelore Haute Parfumerie
    </span>
  </div>
);

export const Home: React.FC<HomeProps> = ({
  onQuickView,
  onFindInStore,
  onOpenStoreLocator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="w-full bg-[#FAF2E1]">
      <SEO
        title="Avelore | Luxury Perfumes, Body, Home & Beauty"
        description="Avelore is an independent luxury fragrance house crafting artisanal perfumes, body and bath care, botanical beauty, and home scents with rare Grasse harvests."
        canonicalPath="/"
      />

      {/* 1. Hero 400vh Interactive Scroll-Scrubbed Video Stage (Loaded Immediately for Instant LCP/FCP) */}
      <HeroSection
        onQuickView={onQuickView}
        onSelectCategory={handleSelectCategory}
      />

      {/* 1.5. Crawlable Introduction Section */}
      <section className="relative py-16 sm:py-20 bg-[#FAF2E1] border-b border-[#3B0000]/10" aria-label="About Avelore Fragrance House">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#7E4A4A] font-display font-bold block mb-3">
            The Olfactory Manifesto
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#3B0000] tracking-tight mb-6">
            Fine fragrance, body rituals &amp; botanical beauty <span className="font-serif italic font-normal text-[#7E4A4A]">composed with intention.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#3B0000]/80 font-sans leading-relaxed text-pretty">
            Avelore is an independent luxury fragrance house founded at the intersection of French botanical heritage and contemporary artistic perfumery. We compose artisanal fine fragrance, nourishing body &amp; bath rituals, evocative scented candles, and clean botanical cosmetics from single-estate harvests. Every formulation pairs rare natural extracts—from Grasse centifolia roses to wild Peloponnese sage and aged amber resins—with meticulous maceration in French oak. Free from fleeting trends and synthetic fillers, our scents possess enduring presence and quiet intimacy designed to become your personal signature.
          </p>
        </div>
      </section>

      {/* 2. Style Statement & Philosophy */}
      <StyleStatementSection />

      {/* 3. EXCLUSIVE PERFUMES (Lazy Loaded when visitor approaches section) */}
      <LazySection sectionId="exclusive-perfumes" minHeight="550px">
        <Suspense fallback={<SectionSkeleton minHeight="550px" />}>
          <ExclusivePerfumesSection
            onQuickView={onQuickView}
            onFindInStore={onFindInStore}
          />
        </Suspense>
      </LazySection>

      {/* 4. Category Showcase Disciplines (Lazy Loaded) */}
      <LazySection minHeight="450px">
        <Suspense fallback={<SectionSkeleton minHeight="450px" />}>
          <CategoryShowcase onSelectCategory={handleSelectCategory} />
        </Suspense>
      </LazySection>

      {/* 5. Interactive Scent Notes Pyramid (Lazy Loaded) */}
      <LazySection minHeight="480px">
        <Suspense fallback={<SectionSkeleton minHeight="480px" />}>
          <ScentNotesExplorer onQuickView={onQuickView} />
        </Suspense>
      </LazySection>

      {/* 6. Catalogue & Formulations Sections (Lazy Loaded on Scroll Approach) */}
      <LazySection sectionId="shop" minHeight="800px">
        <Suspense fallback={<SectionSkeleton minHeight="800px" />}>
          <Shop
            onQuickView={onQuickView}
            onFindInStore={onFindInStore}
            initialCategory={selectedCategory}
          />
        </Suspense>
      </LazySection>

      {/* 7. Four Collection Chapters (Lazy Loaded) */}
      <LazySection sectionId="collections" minHeight="700px">
        <Suspense fallback={<SectionSkeleton minHeight="700px" />}>
          <Collections
            onQuickView={onQuickView}
            onFindInStore={onFindInStore}
          />
        </Suspense>
      </LazySection>

      {/* 8. Craftsmanship Marquee & Stats Strip (Lazy Loaded) */}
      <LazySection minHeight="160px">
        <Suspense fallback={<SectionSkeleton minHeight="160px" />}>
          <CraftsmanshipStrip />
        </Suspense>
      </LazySection>

      {/* 9. Atelier History, Chronology & Terroir Ethics (Lazy Loaded) */}
      <LazySection sectionId="about" minHeight="650px">
        <Suspense fallback={<SectionSkeleton minHeight="650px" />}>
          <About onOpenStoreLocator={onOpenStoreLocator} />
        </Suspense>
      </LazySection>

      {/* 10. Critical Reception & Journal Chronicles (Lazy Loaded) */}
      <LazySection minHeight="380px">
        <Suspense fallback={<SectionSkeleton minHeight="380px" />}>
          <PressAndJournal />
        </Suspense>
      </LazySection>

      {/* 10.5. Dedicated FAQs Section (Lazy Loaded) */}
      <LazySection sectionId="faqs" minHeight="500px">
        <Suspense fallback={<SectionSkeleton minHeight="500px" />}>
          <FAQSection />
        </Suspense>
      </LazySection>

      {/* 11. Concierge Form & Flagship Salons (Lazy Loaded) */}
      <LazySection sectionId="contact" minHeight="650px">
        <Suspense fallback={<SectionSkeleton minHeight="650px" />}>
          <Contact onOpenStoreLocator={onOpenStoreLocator} />
        </Suspense>
      </LazySection>

      {/* 12. Final Brand Invitation Banner (Lazy Loaded) */}
      <LazySection minHeight="260px">
        <Suspense fallback={<SectionSkeleton minHeight="260px" />}>
          <FinalCtaBanner onOpenStoreLocator={onOpenStoreLocator} />
        </Suspense>
      </LazySection>
    </div>
  );
};
