import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollectionBySlug } from '../data/productsHelper';
import { PRODUCTS, COLLECTIONS, Product } from '../data/siteData';
import { SEO } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowLeft, ChevronRight, Compass, Quote } from 'lucide-react';

interface CollectionDetailPageProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  const { collectionSlug } = useParams<{ collectionSlug: string }>();
  const chapter = collectionSlug ? getCollectionBySlug(collectionSlug) : COLLECTIONS[0];

  if (!chapter) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-[#FAF2E1]">
        <SEO
          title="Collection Chapter Not Found | Avelore"
          description="The requested fragrance collection chapter could not be located."
          noindex={true}
        />
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000] mb-4">
          Chapter Not Found
        </h1>
        <p className="text-sm text-[#7E4A4A] max-w-md mb-8 font-sans">
          The requested curatorial chapter may have shifted or is catalogued under another archival index.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B0000] text-[#FFD482] rounded-full text-xs font-bold uppercase tracking-wider font-display hover:bg-[#520909] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Chapters</span>
        </Link>
      </div>
    );
  }

  const chapterProducts = PRODUCTS.filter((p) =>
    chapter.featuredProductIds.includes(p.id)
  );

  const isDarkMerlot = chapter.id === 'nocturne';

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: chapter.title, url: `/collections/${chapter.id}` },
  ];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${chapter.title} — Chapter ${chapter.number} | Avelore`,
    description: chapter.narrative,
    url: `https://YOUR-DOMAIN.com/collections/${chapter.id}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: chapterProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: p.name,
        url: `https://YOUR-DOMAIN.com/shop/${p.id}`,
      })),
    },
  };

  return (
    <article className={`min-h-screen pt-28 sm:pt-36 pb-28 ${chapter.bgClass} relative overflow-hidden`}>
      <SEO
        title={`${chapter.title} — Chapter ${chapter.number} | Avelore Fragrance Collections`}
        description={`${chapter.title} (${chapter.subtitle}): ${chapter.narrative.slice(0, 140)}... Discover curated perfumes, body balms, and home scents.`}
        canonicalPath={`/collections/${chapter.id}`}
        breadcrumbs={breadcrumbs}
        jsonLd={collectionJsonLd}
      />

      {/* Subtle Background Watermark */}
      <div
        className={`absolute right-4 sm:right-10 top-8 sm:top-12 select-none pointer-events-none font-display font-black text-[18vw] lg:text-[14rem] leading-none z-0 ${
          isDarkMerlot ? 'text-[#FFD482]/[0.04]' : 'text-[#3B0000]/[0.03]'
        }`}
        aria-hidden="true"
      >
        {chapter.number}
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-8">
          <ol className={`flex items-center flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider ${
            isDarkMerlot ? 'text-[#FFD482]/60' : 'text-[#3B0000]/60'
          }`}>
            {breadcrumbs.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className={isDarkMerlot ? 'text-[#FFD482] font-extrabold' : 'text-[#3B0000] font-extrabold'} aria-current="page">
                    {b.name}
                  </span>
                ) : (
                  <Link to={b.url} className="hover:underline transition-colors">
                    {b.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Chapter Header */}
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

              <h1 className={`text-4xl sm:text-6xl font-display font-extrabold tracking-tight mb-6 leading-[1.08] ${
                isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'
              }`}>
                {chapter.title}
              </h1>

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

            <div className={`pt-4 flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest ${
              isDarkMerlot ? 'text-[#FFD482]/70' : 'text-[#3B0000]/70'
            }`}>
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Curatorial Atmosphere: {chapter.subtitle}</span>
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

        {/* Featured Products in this Chapter */}
        <section aria-labelledby="chapter-creations-heading">
          <div className={`text-xs font-display font-bold uppercase tracking-widest mb-6 flex items-center justify-between border-b pb-3 ${
            isDarkMerlot ? 'text-[#FFD482] border-[#FFD482]/15' : 'text-[#3B0000] border-[#3B0000]/10'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
              <h2 id="chapter-creations-heading" className="inline text-xs font-display font-bold uppercase tracking-widest">
                Creations in Chapter {chapter.number}
              </h2>
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
        </section>

        {/* Back link */}
        <div className="mt-16 text-center">
          <Link
            to="/collections"
            className={`inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest hover:underline ${
              isDarkMerlot ? 'text-[#FFD482]' : 'text-[#3B0000]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Traverse All Four Chapters</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
