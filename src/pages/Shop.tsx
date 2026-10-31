import React, { useState } from 'react';
import { PRODUCTS, Product } from '../data/siteData';
import { ProductCard } from '../components/ProductCard';
import { RotatingBadge } from '../components/RotatingBadge';
import { Sparkles, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { Carousel07 } from '@/components/ui/carousel-07';

interface ShopProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
  initialCategory?: string;
}

export const Shop: React.FC<ShopProps> = ({
  onQuickView,
  onFindInStore,
  initialCategory = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialCategory);

  // Group products by exact categories
  const fineFragrances = PRODUCTS.filter((p) => p.category === 'fragrance' || p.category === 'exclusive');
  const bodyBathProducts = PRODUCTS.filter((p) => p.category === 'body-bath');
  const homeFragrances = PRODUCTS.filter((p) => p.category === 'home');
  const beautyCosmetics = PRODUCTS.filter((p) => p.category === 'beauty');

  const scrollToSubSection = (id: string) => {
    setActiveTab(id);
    if (id !== 'all') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const navCategories = [
    { id: 'all', name: 'All Formulations', count: PRODUCTS.length },
    { id: 'sec-fine-fragrance', name: 'Fine Fragrance', count: fineFragrances.length },
    { id: 'sec-body-bath', name: 'Body & Bath', count: bodyBathProducts.length },
    { id: 'sec-home-fragrance', name: 'Home Fragrance', count: homeFragrances.length },
    { id: 'sec-beauty-cosmetics', name: 'Beauty & Cosmetics', count: beautyCosmetics.length },
  ];

  return (
    <section id="shop" className="relative bg-[#FAF2E1] py-28 sm:py-36 border-b border-[#3B0000]/10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Main Section Header */}
        <div className="relative pb-12 mb-12 border-b border-[#3B0000]/10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
                The Permanent Catalogue
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight">
              Catalogue &amp; <span className="font-serif italic font-normal text-[#520909]">Creations</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#7E4A4A] max-w-xl leading-relaxed font-sans">
              Comprehensive creations partitioned across fine extraits, lipid body balms, mineral wax tapers, and botanical complexion tints.
            </p>
          </div>

          <div className="shrink-0 hidden md:block">
            <RotatingBadge size={110} text="COMPOSED · WITH · INTENTION · " />
          </div>
        </div>

        {/* Quick Jump Category Switcher */}
        <div className="sticky top-20 z-30 py-3 bg-[#FAF2E1]/90 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0 mb-16 border-b border-[#3B0000]/10">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSubSection(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === cat.id
                    ? 'bg-[#3B0000] text-[#FFD482] shadow-sm scale-105 border border-[#FFD482]/20'
                    : 'bg-[#FFFBF5] text-[#3B0000]/75 hover:bg-[#FFD482]/30 border border-[#3B0000]/10'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-2 text-[10px] opacity-75 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: FINE FRAGRANCE                                */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'sec-fine-fragrance') && (
          <div id="sec-fine-fragrance" className="pt-8 pb-20 border-b border-[#3B0000]/10 scroll-mt-36">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#3B0000]">
                    Section 01 · Fine Fragrance
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
                  Fine Fragrance &amp; Reserve Extraits
                </h3>
                <p className="text-xs sm:text-sm text-[#7E4A4A] mt-1 font-sans">
                  Pure extraits &amp; eaux de parfum formulated with rare natural harvests and slow cold maceration.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#3B0000]/60 uppercase tracking-widest shrink-0">
                {fineFragrances.length} Items · Extraits &amp; Eaux
              </div>
            </div>

            {/* 3D Motion Stack Carousel for Fine Fragrance */}
            <div className="mb-10 bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[32px] p-4 sm:p-8 border border-[#3B0000]/10 shadow-xs">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#7E4A4A] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>3D Motion Carousel</span>
                </span>
                <span className="text-[11px] font-sans text-[#3B0000]/60">Drag flacon cards or tap for Quick View</span>
              </div>
              <Carousel07
                products={fineFragrances}
                onSelectProduct={onQuickView}
                className="py-1"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {fineFragrances.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: BODY & BATH                                   */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'sec-body-bath') && (
          <div id="sec-body-bath" className="pt-16 pb-20 border-b border-[#3B0000]/10 scroll-mt-36">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#3B0000]">
                    Section 02 · Body &amp; Bath
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
                  Body &amp; Bath Rituals
                </h3>
                <p className="text-xs sm:text-sm text-[#7E4A4A] mt-1 font-sans">
                  Restorative lipid oils, mineral bath infusions, and velvety whipped emulsion balms.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#3B0000]/60 uppercase tracking-widest shrink-0">
                {bodyBathProducts.length} Items · Botanical Body Care
              </div>
            </div>

            {/* 3D Motion Stack Carousel for Body & Bath */}
            <div className="mb-10 bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[32px] p-4 sm:p-8 border border-[#3B0000]/10 shadow-xs">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#7E4A4A] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>3D Motion Carousel</span>
                </span>
                <span className="text-[11px] font-sans text-[#3B0000]/60">Drag cards or tap for Quick View</span>
              </div>
              <Carousel07
                products={bodyBathProducts}
                onSelectProduct={onQuickView}
                className="py-1"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {bodyBathProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: HOME FRAGRANCE                                */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'sec-home-fragrance') && (
          <div id="sec-home-fragrance" className="pt-16 pb-20 border-b border-[#3B0000]/10 scroll-mt-36">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#3B0000]">
                    Section 03 · Home Fragrance
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
                  Home Fragrance &amp; Spatial Atmosphere
                </h3>
                <p className="text-xs sm:text-sm text-[#7E4A4A] mt-1 font-sans">
                  Mineral wax tapers in cast ceramic vessels, blown-glass reed diffusers, and ambient mists.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#3B0000]/60 uppercase tracking-widest shrink-0">
                {homeFragrances.length} Items · Ambient Living
              </div>
            </div>

            {/* 3D Motion Stack Carousel for Home */}
            <div className="mb-10 bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[32px] p-4 sm:p-8 border border-[#3B0000]/10 shadow-xs">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#7E4A4A] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>3D Motion Carousel</span>
                </span>
                <span className="text-[11px] font-sans text-[#3B0000]/60">Drag cards or tap for Quick View</span>
              </div>
              <Carousel07
                products={homeFragrances}
                onSelectProduct={onQuickView}
                className="py-1"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {homeFragrances.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: BEAUTY & COSMETICS                            */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'sec-beauty-cosmetics') && (
          <div id="sec-beauty-cosmetics" className="pt-16 pb-16 scroll-mt-36">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B0000]" />
                  <span className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#3B0000]">
                    Section 04 · Beauty &amp; Cosmetics
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000]">
                  Beauty &amp; Botanical Cosmetics
                </h3>
                <p className="text-xs sm:text-sm text-[#7E4A4A] mt-1 font-sans">
                  Squalane-enriched colour tints, light-catching liquid pearls, and biocompatible conditioning balms.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#3B0000]/60 uppercase tracking-widest shrink-0">
                {beautyCosmetics.length} Items · Botanical Complexion
              </div>
            </div>

            {/* 3D Motion Stack Carousel for Beauty */}
            <div className="mb-10 bg-gradient-to-b from-[#FFFDF9] via-[#FAF2E1] to-[#FFFBF5] rounded-[32px] p-4 sm:p-8 border border-[#3B0000]/10 shadow-xs">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#7E4A4A] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3B0000]" />
                  <span>3D Motion Carousel</span>
                </span>
                <span className="text-[11px] font-sans text-[#3B0000]/60">Drag cards or tap for Quick View</span>
              </div>
              <Carousel07
                products={beautyCosmetics}
                onSelectProduct={onQuickView}
                className="py-1"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
              {beautyCosmetics.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </div>
        )}

        {/* Global Catalog Footer Plaque */}
        <div className="mt-16 p-8 rounded-[28px] bg-[#FFFBF5] border border-[#3B0000]/10 text-center max-w-2xl mx-auto shadow-xs">
          <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#3B0000] block mb-2">
            Complimentary Blotter Discovery
          </span>
          <p className="text-xs text-[#7E4A4A] leading-relaxed mb-4 font-sans">
            Our compositions are designed to interact intimately with individual skin chemistry. Request a sealed blotter parcel or visit our Paris Marais or London Mayfair ateliers for private consultation.
          </p>
          <div className="text-[11px] font-mono text-[#3B0000]/70 uppercase tracking-wider font-bold">
            AVELORE HAUTE PARFUMERIE · 40 TOTAL FORMULATIONS
          </div>
        </div>
      </div>
    </section>
  );
};
