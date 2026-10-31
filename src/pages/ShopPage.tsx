import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { ChevronRight, ChevronDown, Sparkles, Layers, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { SITE_URL } from '../seo/config';
import { Carousel07 } from '@/components/ui/carousel-07';

interface ShopPageProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const SHOP_FAQS = [
  {
    question: "What makes Avelore luxury perfumes distinct from commercial designer fragrances?",
    answer: "Avelore formulates exclusively in Extrait de Parfum and rich Eau de Parfum concentrations, utilizing multi-year cured floral absolutes, rare resin harvests, and zero synthetic fixatives. We employ slow cold maceration in Grasse stills, preserving the living nuance of each botanical harvest.",
  },
  {
    question: "How long can I expect an Avelore Eau de Parfum to linger on the skin?",
    answer: "Because our formulations contain high concentrations of natural botanical oils (20% to 35% in our Reserve Extraits), our scents linger intimately on skin for 10 to 18 hours, and for several days on natural fiber textiles like wool, silk, and linen.",
  },
  {
    question: "How should I store my luxury perfume flacons to preserve freshness?",
    answer: "Store your flacons in a cool, stable temperature away from direct sunlight, UV exposure, and excessive humidity. Keeping the flacon inside its presentation coffret or in a shaded dressing cabinet preserves the volatile top chords indefinitely.",
  },
  {
    question: "Are Avelore body oils and bath salts safe for sensitive skin?",
    answer: "Yes. Our Body & Bath rituals are formulated on 100% bio-compatible cold-pressed botanical lipids including squalane, marula, and rosehip seed oils. They are free from silicones, parabens, synthetic dyes, and artificial preservatives.",
  },
  {
    question: "How do I get the cleanest burn from Avelore luxury scented candles?",
    answer: "Always trim the cotton wick to 5mm before lighting. On the initial burn, allow the liquid wax pool to reach the outer ceramic or glass rim (approximately 2–3 hours). This prevents tunneling and ensures an even, smoke-free burn.",
  },
  {
    question: "Can I layer multiple Avelore fragrances to create a personalized accord?",
    answer: "Yes. Our fragrances are intentionally composed with natural harmonic bases. We recommend pairing a resinous amber base (such as Ambre Impérial Reserve or Nocturne Renewal Oil) with a radiant floral or citrus top veil like Solène or Rose Sépale.",
  },
  {
    question: "Does Avelore offer bespoke gifting and private consultation?",
    answer: "Every order is packaged by hand in archival unbleached boxes with custom wax seals. You may also schedule a private consultation at our Marais atelier or through our online Olfactory Concierge.",
  },
];

interface DepartmentConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  filterCategories: ('exclusive' | 'fragrance' | 'body-bath' | 'home' | 'beauty')[];
  description: string;
}

const DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'fine-fragrance',
    title: 'Fine Fragrance & Exclusive Extraits',
    subtitle: 'Macerated botanicals & rare resins cured at 25–35% pure perfume oil concentration.',
    badge: 'Fine Fragrance',
    filterCategories: ['exclusive', 'fragrance'],
    description: 'Swipe through our signature cold-extracted flacons. Tap any card for full olfactory pyramid and craftsmanship notes.',
  },
  {
    id: 'body-bath',
    title: 'Body & Bath Rituals',
    subtitle: 'Nourishing lipid elixirs, organic marula infusions, and mineral bath soaks.',
    badge: 'Body & Bath',
    filterCategories: ['body-bath'],
    description: 'Swipe through restorative body oils and bath soaks formulated to nourish cutaneous barrier health.',
  },
  {
    id: 'home',
    title: 'Home Fragrance & Spatial Atmosphere',
    subtitle: 'Hand-cast vegetal wax candles and cold-macerated diffusers for the sanctuary.',
    badge: 'Home Fragrance',
    filterCategories: ['home'],
    description: 'Transform your interior architecture with hand-poured mineral candles and rattan reed diffusion vessels.',
  },
  {
    id: 'beauty',
    title: 'Beauty & Botanical Cosmetics',
    subtitle: 'Finely milled mineral compacts, lip colours, and bio-compatible elixirs.',
    badge: 'Beauty & Cosmetics',
    filterCategories: ['beauty'],
    description: 'Pure mineral pigments suspended in plant squalane for breathable, luminous couture beauty.',
  },
];

export const ShopPage: React.FC<ShopPageProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [displayMode, setDisplayMode] = useState<'both' | 'carousel' | 'grid'>('both');

  const categories = [
    { id: 'all', name: 'All Formulations', count: PRODUCTS.length },
    { id: 'exclusive', name: 'Exclusive Perfumes', count: PRODUCTS.filter((p) => p.category === 'exclusive').length },
    { id: 'fragrance', name: 'Fine Fragrance', count: PRODUCTS.filter((p) => p.category === 'fragrance').length },
    { id: 'body-bath', name: 'Body & Bath', count: PRODUCTS.filter((p) => p.category === 'body-bath').length },
    { id: 'home', name: 'Home Fragrance', count: PRODUCTS.filter((p) => p.category === 'home').length },
    { id: 'beauty', name: 'Beauty & Cosmetics', count: PRODUCTS.filter((p) => p.category === 'beauty').length },
  ];

  const filteredProducts = activeTab === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeTab);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ];

  // CollectionPage + ItemList and FAQPage Schema.org JSON-LD
  const shopJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Shop Luxury Perfumes, Body & Bath, Candles | Avelore',
      description: 'Explore the complete catalogue of Avelore luxury perfumes, artisanal extraits, lipid body oils, mineral wax candles, and botanical cosmetics.',
      url: `${SITE_URL}/shop`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: filteredProducts.slice(0, 30).map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: p.name,
          url: `${SITE_URL}/shop/${p.id}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SHOP_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36 pb-28">
      <SEO
        title="Shop Luxury Perfumes, Body & Bath, Candles | Avelore"
        description="Discover Avelore's complete collection of luxury perfumes, artisanal body care, hand-poured botanical candles, and velvety lip colours composed with intention."
        canonicalPath="/shop"
        breadcrumbs={breadcrumbs}
        jsonLd={shopJsonLd}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
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

        {/* Section Header */}
        <header className="mb-12 border-b border-[#3B0000]/10 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              The Permanent Catalogue
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-4">
                Shop Luxury <span className="font-serif italic font-normal text-[#520909]">Perfumes</span>, Body & Candles
              </h1>

              <p className="text-base sm:text-lg text-[#7E4A4A] max-w-3xl leading-relaxed font-sans">
                Explore Avelore’s complete atelier collection of <strong>luxury perfumes</strong>, artisanal <strong>eau de parfum</strong> formulations, restorative <strong>luxury body oil</strong> elixirs, soothing <strong>bath salts</strong>, hand-cast <strong>luxury scented candles</strong>, and mineral-pigmented <strong>luxury lip colour</strong>. Each flacon is patiently macerated in Grasse, France using unyielding cold extraction standards.
              </p>
            </div>

            {/* Display Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFBF5] rounded-full border border-[#3B0000]/15 shrink-0 self-start lg:self-end">
              <button
                type="button"
                onClick={() => setDisplayMode('both')}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'both'
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="Show both 3D stack motion carousel & catalogue grid"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Showcase & Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('carousel')}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'carousel'
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="Interactive 3D Motion Carousel view only"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D Carousel</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('grid')}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'grid'
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                    : 'text-[#3B0000]/70 hover:text-[#3B0000]'
                }`}
                title="Catalogue grid view only"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid Only</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-8 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-display font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeTab === cat.id
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                    : 'bg-[#FFFBF5] text-[#3B0000] hover:bg-[#FFD482]/20 border border-[#3B0000]/10'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 opacity-60 font-mono text-[11px]">({cat.count})</span>
              </button>
            ))}
          </div>
        </header>

        {/* 3D Motion Stack Carousel Sub-Sections */}
        {displayMode !== 'grid' && (
          <div className="space-y-16 mb-20">
            {activeTab === 'all' ? (
              // All sub-sections displayed with distinct carousels across categories
              DEPARTMENTS.map((dept) => {
                const deptProducts = PRODUCTS.filter((p) =>
                  dept.filterCategories.includes(p.category)
                );

                if (deptProducts.length === 0) return null;

                return (
                  <section
                    key={dept.id}
                    className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[36px] p-6 sm:p-10 border border-[#3B0000]/10 shadow-xs overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 pb-6 border-b border-[#3B0000]/10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                          <span className="text-[11px] uppercase tracking-[0.22em] text-[#7E4A4A] font-display font-bold">
                            {dept.badge} Sub-Section
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000]">
                          {dept.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#7E4A4A] font-sans mt-1">
                          {dept.subtitle}
                        </p>
                      </div>

                      <div className="text-xs font-display uppercase tracking-wider text-[#3B0000]/70 font-semibold flex items-center gap-2">
                        <span>Swipe or drag card to turn</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD482]" />
                        <span>Tap to open Quick View</span>
                      </div>
                    </div>

                    {/* Interactive 3D Stack Carousel for this Department */}
                    <Carousel07
                      products={deptProducts}
                      onSelectProduct={onQuickView}
                      className="py-2"
                    />
                  </section>
                );
              })
            ) : (
              // Specific Category active - show dedicated carousel for this category
              <section className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[36px] p-6 sm:p-10 border border-[#3B0000]/10 shadow-xs overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 pb-6 border-b border-[#3B0000]/10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[#7E4A4A] font-display font-bold">
                        Interactive 3D Carousel
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000]">
                      {categories.find((c) => c.id === activeTab)?.name} Showcase
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7E4A4A] font-sans mt-1">
                      Drag cards horizontally to rotate through formulations. Tap the active flacon to inspect complete olfactory notes.
                    </p>
                  </div>

                  <div className="text-xs font-display uppercase tracking-wider text-[#3B0000]/70 font-semibold flex items-center gap-2">
                    <span>{filteredProducts.length} Formulations</span>
                  </div>
                </div>

                <Carousel07
                  products={filteredProducts}
                  onSelectProduct={onQuickView}
                  className="py-2"
                />
              </section>
            )}
          </div>
        )}

        {/* Products Grid Section */}
        {displayMode !== 'carousel' && (
          <section aria-label="Products Catalogue Grid" className="mb-24">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#3B0000]/10">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-[#3B0000]" />
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#3B0000]">
                  {activeTab === 'all' ? 'Complete Atelier Inventory' : `${categories.find((c) => c.id === activeTab)?.name} Grid`}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFFBF5] border border-[#3B0000]/10 text-[#3B0000]">
                  {filteredProducts.length} items
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </section>
        )}

        {/* Visible FAQ Section matching FAQPage Schema */}
        <section className="bg-[#FFFBF5] rounded-[32px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs mb-16" aria-labelledby="shop-faq-heading">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-2">
              Frequently Asked Questions
            </span>
            <h2 id="shop-faq-heading" className="text-3xl font-display font-bold text-[#3B0000]">
              Inquiries on Scent Longevity, Formulations & Rituals
            </h2>
          </div>

          <div className="divide-y divide-[#3B0000]/10">
            {SHOP_FAQS.map((faq, idx) => (
              <div key={idx} className="py-6">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                  aria-expanded={openFaqIdx === idx}
                >
                  <span className="text-base sm:text-lg font-display font-bold text-[#3B0000] group-hover:text-[#520909] transition-colors pr-6">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#3B0000] transition-transform duration-300 shrink-0 ${
                      openFaqIdx === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openFaqIdx === idx && (
                  <div className="mt-4 text-xs sm:text-sm text-[#7E4A4A] leading-relaxed pr-8 font-sans animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
