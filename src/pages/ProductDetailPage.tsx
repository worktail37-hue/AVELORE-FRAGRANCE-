import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../data/productsHelper';
import { SEO } from '../components/SEO';
import { ProductVisual } from '../components/ProductVisual';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowLeft, ShieldCheck, MapPin, Feather, Droplets, Clock, ChevronRight, Heart } from 'lucide-react';
import { PillButton } from '../components/PillButton';
import { Product } from '../data/siteData';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  onFindInStore: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenConsultation?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  onFindInStore,
  onQuickView,
  onOpenConsultation,
}) => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const product = productSlug ? getProductBySlug(productSlug) : null;
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = product ? isFavorite(product.id) : false;

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-[#FAF2E1]">
        <SEO
          title="Flacon Dossier Not Found | Avelore"
          description="The requested fragrance or creation could not be found in the Avelore permanent archive."
          noindex={true}
        />
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000] mb-4">
          Flacon Dossier Not Found
        </h1>
        <p className="text-sm text-[#7E4A4A] max-w-md mb-8 font-sans">
          The requested creation may have retired from the seasonal catalogue or is catalogued under another atelier index.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B0000] text-[#FFD482] rounded-full text-xs font-bold uppercase tracking-wider font-display hover:bg-[#520909] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Permanent Catalogue</span>
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.categoryLabel, url: `/shop#sec-${product.category}` },
    { name: product.name, url: `/shop/${product.slug}` },
  ];

  // Schema.org Product (NO fake reviews or offers!)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.longDescription,
    image: `https://YOUR-DOMAIN.com/products/${product.slug}.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Avelore',
    },
    category: product.categoryLabel,
    sku: product.sku,
    url: `https://YOUR-DOMAIN.com/shop/${product.slug}`,
  };

  return (
    <article className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36 pb-28">
      <SEO
        title={product.metaTitle}
        description={product.metaDescription}
        canonicalPath={`/shop/${product.slug}`}
        ogType="product"
        breadcrumbs={breadcrumbs}
        jsonLd={productJsonLd}
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

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Visual Presentation (Left: 6 cols) */}
          <div className="lg:col-span-6 bg-[#FFFBF5] rounded-[36px] p-8 sm:p-14 border border-[#3B0000]/10 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-[340px] aspect-square flex items-center justify-center">
              <ProductVisual
                product={product}
                size="lg"
                className="w-full h-full drop-shadow-2xl"
              />
            </div>

            {product.badge && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-[#FFD482] text-[#3B0000] font-bold border border-[#3B0000]/10">
                {product.badge}
              </span>
            )}

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#7E4A4A] font-mono border-t border-[#3B0000]/10 pt-4 w-full">
              <span>Origin: Grasse, France</span>
              <span>•</span>
              <span>SKU: {product.sku}</span>
            </div>
          </div>

          {/* Product Dossier Details (Right: 6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                  {product.categoryLabel}
                </span>
                {product.collection && (
                  <>
                    <span className="text-xs text-[#3B0000]/40">•</span>
                    <Link
                      to={`/collections/${product.collection.id}`}
                      className="text-xs uppercase tracking-wider text-[#7E4A4A] hover:text-[#3B0000] font-display font-semibold transition-colors"
                    >
                      {product.collection.title}
                    </Link>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.1] mb-2">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base font-serif italic text-[#7E4A4A]">
                {product.subtitle}
              </p>
            </div>

            {/* Price & Size Selector */}
            <div className="p-6 bg-[#FFFBF5] rounded-2xl border border-[#3B0000]/10 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#7E4A4A] block">Archival Flacon</span>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000]">
                    €{product.priceFrom}
                  </span>
                </div>
                <span className="text-xs text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  In Stock · Atelier Dispatch
                </span>
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] mb-2">
                  Volume & Vessel Specification
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedSizeIndex === idx
                          ? 'bg-[#3B0000] text-[#FFD482] shadow-xs'
                          : 'bg-[#FAF2E1] text-[#3B0000] hover:bg-[#FFD482]/20 border border-[#3B0000]/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comprehensive 100-150 word Description */}
            <div className="space-y-4 font-sans text-sm sm:text-base text-[#521313] leading-relaxed">
              <h2 className="text-xs font-display font-bold uppercase tracking-widest text-[#3B0000]">
                Olfactory Composition & Profile
              </h2>
              <p>{product.longDescription}</p>
              <p className="text-xs text-[#7E4A4A] leading-relaxed font-sans">
                {product.description} Macerated in stainless steel stills in Grasse over an extended 48-hour cold percolation cycle. Bottled in architectural heavyweight glass with a magnetic closure engineered to protect fragile top chords from photolytic oxidation.
              </p>
            </div>

            {/* Scent Notes Pyramid (if applicable) */}
            {product.notes && (
              <div className="space-y-4 p-6 bg-[#FFFBF5] rounded-2xl border border-[#3B0000]/10">
                <h3 className="text-xs font-display font-bold uppercase tracking-widest text-[#3B0000] flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>The Tripartite Scent Architecture</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="border-l-2 border-[#FFD482] pl-3">
                    <span className="font-display font-bold uppercase text-[#3B0000] block text-[11px]">
                      Top Notes
                    </span>
                    <span className="text-[#7E4A4A] mt-1 block">
                      {product.notes.top.join(' · ')}
                    </span>
                  </div>
                  <div className="border-l-2 border-[#3B0000]/30 pl-3">
                    <span className="font-display font-bold uppercase text-[#3B0000] block text-[11px]">
                      Heart Notes
                    </span>
                    <span className="text-[#7E4A4A] mt-1 block">
                      {product.notes.heart.join(' · ')}
                    </span>
                  </div>
                  <div className="border-l-2 border-[#3B0000] pl-3">
                    <span className="font-display font-bold uppercase text-[#3B0000] block text-[11px]">
                      Base Notes
                    </span>
                    <span className="text-[#7E4A4A] mt-1 block">
                      {product.notes.base.join(' · ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Botanical Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-display font-bold uppercase tracking-wider text-[#3B0000] block">
                  Active Botanical Ingredients
                </span>
                <p className="text-[#7E4A4A] font-mono leading-relaxed bg-[#FAF2E1] p-3 rounded-xl border border-[#3B0000]/10">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}

            {/* How to Wear It */}
            <div className="space-y-2 p-5 rounded-2xl bg-[#FFF5E3] border border-[#FFD482]/40 text-xs">
              <span className="font-display font-bold uppercase tracking-wider text-[#3B0000] flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-[#3B0000]" />
                <span>Application & Olfactory Ritual</span>
              </span>
              <p className="text-[#521313] leading-relaxed">
                {product.howToWear}
              </p>
            </div>

            {/* Actions: Find in Boutique, Reserve Consultation & Add to Wishlist */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <PillButton
                variant="merlot"
                size="md"
                arrow="right"
                onClick={() => onFindInStore(product)}
                className="w-full sm:w-auto justify-center"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                <span>Find in Flagship Boutique</span>
              </PillButton>

              <PillButton
                variant="apricot"
                size="md"
                arrow="none"
                onClick={onOpenConsultation}
                className="w-full sm:w-auto justify-center"
              >
                <span>Book Private Consultation</span>
              </PillButton>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`px-5 py-3 rounded-full border text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  favorited
                    ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000] shadow-sm'
                    : 'bg-[#FFFBF5] text-[#3B0000] border-[#3B0000]/20 hover:border-[#3B0000] hover:bg-[#FAF2E1]'
                }`}
                title={favorited ? 'In Your Wishlist' : 'Add to Wishlist'}
                aria-label={favorited ? 'In Your Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current text-[#FFD482]' : 'text-[#3B0000]'}`} />
                <span>{favorited ? 'In My Favorites' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#3B0000]/10" aria-labelledby="related-heading">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-1">
                  Olfactory Kinship
                </span>
                <h2 id="related-heading" className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000]">
                  Harmonizing Formulations
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] hover:text-[#520909] underline"
              >
                View Full Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {product.relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
