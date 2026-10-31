import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS, PRODUCTS, Product } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { Sparkles, ArrowRight, ChevronRight, Compass, Quote } from 'lucide-react';
import { SITE_URL } from '../seo/config';

interface CollectionsPageProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
  ];

  const collectionsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Fragrance Collections & Signature Scents | Avelore',
    description: 'Experience the four chapters of Avelore: The Solar Solstice, Meridian Drift, Nocturne & Earth, and The Botanical Garden.',
    url: `${SITE_URL}/collections`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: COLLECTIONS.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${c.title} — Chapter ${c.number}`,
        url: `${SITE_URL}/collections/${c.id}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36">
      <SEO
        title="Fragrance Collections & Signature Scents | Avelore"
        description="Experience the four chapters of Avelore: The Solar Solstice, Meridian Drift, Nocturne & Earth, and The Botanical Garden. Distinctive signature scents crafted in Grasse."
        canonicalPath="/collections"
        breadcrumbs={breadcrumbs}
        jsonLd={collectionsJsonLd}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#3B0000]/60">
            {breadcrumbs.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[#3B0000]/40 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-[#3B0000] font-extrabold" aria-current="page">
                    {b.name}
                  </span>
                ) : (
                  <Link to={b.url} className="hover:text-[#3B0000] hover:underline transition-colors">
                    {b.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Intro Editorial Header */}
        <header className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              Curatorial Series
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-6">
            Fragrance Collections & <span className="font-serif italic font-normal text-[#520909]">Signature Scents</span>
          </h1>

          {/* Crawlable Intro with Natural Target Keywords */}
          <p className="text-base sm:text-lg text-[#7E4A4A] leading-relaxed font-sans">
            Traverse Avelore’s four curatorial <strong>fragrance collections</strong>: The Solar Solstice, Meridian Drift, Nocturne & Earth, and The Botanical Garden. Each distinct olfactory chapter unifies <strong>signature scents</strong>, rare extrait perfumes, restorative body care, and mineral candles into an evocative atmospheric memory. Discover each chapter below.
          </p>
        </header>
      </div>

      {/* 4 Full-Width Collection Chapters */}
      <div className="space-y-0">
        {COLLECTIONS.map((chapter) => {
          const chapterProducts = PRODUCTS.filter((p) =>
            chapter.featuredProductIds.includes(p.id)
          );
          const isDarkMerlot = chapter.id === 'nocturne';

          return (
            <section
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className={`relative py-28 sm:py-36 border-t border-[#3B0000]/10 ${chapter.bgClass} overflow-hidden`}
              aria-labelledby={`heading-chapter-${chapter.id}`}
            >
              {/* Giant Chapter Number in Background */}
              <div
                className={`absolute right-4 sm:right-10 top-6 sm:top-10 select-none pointer-events-none font-display font-black text-[18vw] lg:text-[13rem] leading-none z-0 ${
                  isDarkMerlot ? 'text-[#FFD482]/[0.04]' : 'text-[#3B0000]/[0.03]'
                }`}
                aria-hidden="true"
              >
                {chapter.number}
              </div>

              <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                {/* 12-Column Grid Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-16 sm:mb-20">
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border mb-4 text-xs font-bold tracking-wider uppercase font-display shadow-2xs">
                        <span className={`font-mono text-xs font-extrabold ${isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'}`}>
                          CHAPTER {chapter.number}
                        </span>
                        <span className={`w-1 h-1 rounded-full ${isDarkMerlot ? 'bg-[#FFD482]' : 'bg-[#3B0000]'}`} />
                        <span className={`text-[11px] font-semibold tracking-widest ${isDarkMerlot ? 'text-[#FFD482]/80' : 'text-[#7E4A4A]'}`}>
                          {chapter.subtitle}
                        </span>
                      </div>

                      <h2
                        id={`heading-chapter-${chapter.id}`}
                        className={`text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-6 leading-[1.08] ${
                          isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'
                        }`}
                      >
                        <Link to={`/collections/${chapter.id}`} className="hover:underline">
                          {chapter.title}
                        </Link>
                      </h2>

                      <div className={`border-l-2 pl-5 sm:pl-6 my-6 ${
                        isDarkMerlot
                          ? 'border-[#FFD482]/40 bg-[#FFD482]/[0.03] py-2 rounded-r-xl'
                          : 'border-[#3B0000]/25 bg-[#3B0000]/[0.02] py-2 rounded-r-xl'
                      }`}>
                        <p className={`text-base sm:text-lg leading-relaxed font-sans font-normal ${
                          isDarkMerlot ? 'text-[#FFF5E3]/90' : 'text-[#521313]'
                        }`}>
                          {chapter.narrative}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest ${
                        isDarkMerlot ? 'text-[#FFD482]/70' : 'text-[#3B0000]/70'
                      }`}>
                        <Compass className="w-3.5 h-3.5 shrink-0" />
                        <span>Curatorial Atmosphere: {chapter.subtitle}</span>
                      </div>

                      <Link
                        to={`/collections/${chapter.id}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider hover:underline ${
                          isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'
                        }`}
                      >
                        <span>Explore Chapter Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className={`lg:col-span-5 rounded-[28px] p-8 sm:p-10 border shadow-md flex flex-col justify-between ${
                    isDarkMerlot
                      ? 'bg-[#3B0000] border-[#FFD482]/25 text-[#FFD482]'
                      : 'bg-[#FFFBF5] border-[#3B0000]/15 text-[#3B0000]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[11px] font-display font-bold uppercase tracking-[0.2em] ${
                          isDarkMerlot ? 'text-[#FFD482]/70' : 'text-[#7E4A4A]'
                        }`}>
                          Master Perfumer Quote
                        </span>
                        <Quote className={`w-5 h-5 opacity-40 ${isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'}`} />
                      </div>

                      <blockquote className="text-lg sm:text-xl font-serif italic mb-6 leading-relaxed">
                        &ldquo;{chapter.quote}&rdquo;
                      </blockquote>
                    </div>

                    <div className={`pt-5 border-t ${isDarkMerlot ? 'border-[#FFD482]/20' : 'border-[#3B0000]/10'}`}>
                      <div className={`text-[11px] font-display font-bold uppercase tracking-widest mb-3 ${
                        isDarkMerlot ? 'text-[#FFD482]/80' : 'text-[#7E4A4A]'
                      }`}>
                        Dominant Olfactory Chords
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {chapter.sensoryAtmosphere.map((note, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold font-display tracking-wide ${
                              isDarkMerlot
                                ? 'bg-[#FFD482]/15 text-[#FFD482] border border-[#FFD482]/25'
                                : 'bg-[#FAF2E1] text-[#3B0000] border border-[#3B0000]/15'
                            }`}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Products */}
                <div>
                  <div className={`text-xs font-display font-bold uppercase tracking-widest mb-6 flex items-center justify-between border-b pb-3 ${
                    isDarkMerlot ? 'text-[#FFD482] border-[#FFD482]/15' : 'text-[#3B0000] border-[#3B0000]/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
                      <span>Curated Creations for Chapter {chapter.number}</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-75">
                      {chapterProducts.length} Selections
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {chapterProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onQuickView={onQuickView}
                        onFindInStore={onFindInStore}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
