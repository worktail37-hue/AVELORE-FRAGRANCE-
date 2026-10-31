import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import { Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { StoreLocatorModal } from './components/StoreLocatorModal';
import { SearchModal } from './components/SearchModal';
import { CustomCursor } from './components/CustomCursor';
import { OlfactoryChatbot } from './components/OlfactoryChatbot';
import { PatronProfileModal } from './components/PatronProfileModal';
import { PrivateConsultationModal } from './components/PrivateConsultationModal';
import { Home } from './pages/Home';
import { Product } from './data/siteData';
import { AuthProvider } from './context/AuthContext';

import { ScentFinderModal } from './components/ScentFinderModal';
import { scrollToSection } from './utils/scrollHelper';

// Lazy-loaded standalone sub-routes for code-splitting and performance
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage').then((m) => ({ default: m.CollectionDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

/**
 * Scroll to top on route change while supporting hash anchors for in-page sections
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(targetId);
      }, 120);
      return;
    }
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
}

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF2E1]" role="status" aria-label="Loading page">
    <div className="flex flex-col items-center gap-4">
      <span className="w-8 h-8 rounded-full border-2 border-[#3B0000]/20 border-t-[#3B0000] animate-spin" />
      <span className="text-xs uppercase tracking-[0.25em] text-[#7E4A4A] font-display font-semibold">
        Composing...
      </span>
    </div>
  </div>
);

export default function App() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [storeLocatorOpen, setStoreLocatorOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedProductForStore, setSelectedProductForStore] = useState<Product | null>(null);

  // States for Gemini Concierge, Patron Auth, Consultation, and Scent Vibe
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [patronProfileOpen, setPatronProfileOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [scentFinderOpen, setScentFinderOpen] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  // Pointer device check
  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    setHasFinePointer(media.matches);
    const listener = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Initialize Lenis smooth scrolling (only on fine-pointer devices and when motion is allowed)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarse) return;

    let lenis: Lenis | null = null;
    let animationFrameId: number;

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      (window as any).__lenis = lenis;

      function raf(time: number) {
        lenis?.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }
      animationFrameId = requestAnimationFrame(raf);
    } catch {
      // Fallback to native smooth scroll
    }

    return () => {
      (window as any).__lenis = null;
      if (lenis) lenis.destroy();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    // Update browser URL to /shop/:productSlug for shareability and crawlability
    if (window.location.pathname !== `/shop/${product.id}`) {
      window.history.pushState({ modalOpen: true }, '', `/shop/${product.id}`);
    }
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    if (window.history.state?.modalOpen) {
      window.history.back();
    }
  };

  const handleFindInStore = (product: Product) => {
    setSelectedProductForStore(product);
    setStoreLocatorOpen(true);
  };

  const handleOpenStoreLocatorGlobal = () => {
    setSelectedProductForStore(null);
    setStoreLocatorOpen(true);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {hasFinePointer && <CustomCursor />}

        {/* Accessibility: Skip to Content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#3B0000] focus:text-[#FFD482] focus:border focus:border-[#FFD482] focus:rounded-full focus:shadow-2xl font-display text-xs tracking-wider uppercase font-bold"
        >
          Skip to content
        </a>

        <div className="flex flex-col min-h-screen bg-[#FAF2E1] text-[#3B0000] relative selection:bg-[#3B0000] selection:text-[#FFD482]">
          {/* Navigation Bar */}
          <Navbar
            onOpenStoreLocator={handleOpenStoreLocatorGlobal}
            onOpenSearch={() => setSearchModalOpen(true)}
            onOpenProfile={() => setPatronProfileOpen(true)}
            onOpenScentVibe={() => setScentFinderOpen(true)}
          />

          {/* Master Landmark Main */}
          <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      onQuickView={handleOpenQuickView}
                      onFindInStore={handleFindInStore}
                      onOpenStoreLocator={handleOpenStoreLocatorGlobal}
                      onOpenScentVibeQuiz={() => setScentFinderOpen(true)}
                    />
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ShopPage
                      onQuickView={handleOpenQuickView}
                      onFindInStore={handleFindInStore}
                    />
                  }
                />
                <Route
                  path="/shop/:productSlug"
                  element={
                    <ProductDetailPage
                      onQuickView={handleOpenQuickView}
                      onFindInStore={handleFindInStore}
                      onOpenConsultation={() => setConsultationModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/collections"
                  element={
                    <CollectionDetailPage
                      onQuickView={handleOpenQuickView}
                      onFindInStore={handleFindInStore}
                    />
                  }
                />
                <Route
                  path="/collections/:collectionSlug"
                  element={
                    <CollectionDetailPage
                      onQuickView={handleOpenQuickView}
                      onFindInStore={handleFindInStore}
                    />
                  }
                />
                <Route
                  path="/about"
                  element={<AboutPage onOpenStoreLocator={handleOpenStoreLocatorGlobal} />}
                />
                <Route
                  path="/contact"
                  element={<ContactPage onOpenStoreLocator={handleOpenStoreLocatorGlobal} />}
                />
                {/* Public Shared Moodboard Route Redirect */}
                <Route path="/moodboard/*" element={<Navigate to="/" replace />} />
                {/* Journal completely removed from site */}
                <Route path="/journal" element={<Navigate to="/shop" replace />} />
                <Route path="/journal/*" element={<Navigate to="/shop" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          {/* Global Footer */}
          <Footer onOpenStoreLocator={handleOpenStoreLocatorGlobal} />

          {/* Floating Luxury Concierge Button */}
          <aside aria-label="Olfactory concierge trigger" className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setConciergeOpen(true)}
              className="group flex items-center gap-2.5 px-4 py-3 bg-[#3B0000] text-[#FFD482] rounded-full shadow-[0_12px_36px_rgba(59,0,0,0.35)] hover:shadow-[0_16px_48px_rgba(59,0,0,0.45)] border border-[#FFD482]/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              aria-label="Open Olfactory Concierge"
              title="Consult The Nose of Avelore"
            >
              <div className="relative">
                <Sparkles className="w-4 h-4 text-[#FFD482] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFD482]" />
              </div>
              <span className="font-display font-bold text-xs tracking-wider uppercase">
                The Nose
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#FFD482]/20 text-[#FFD482] border border-[#FFD482]/30 font-semibold">
                Concierge
              </span>
            </button>
          </aside>

          {/* Global Interactive Modals */}
          <QuickViewModal
            product={quickViewProduct}
            onClose={handleCloseQuickView}
            onFindInStore={handleFindInStore}
          />

          <StoreLocatorModal
            isOpen={storeLocatorOpen}
            onClose={() => setStoreLocatorOpen(false)}
            selectedProduct={selectedProductForStore}
          />

          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onSelectProduct={handleOpenQuickView}
          />

          {/* Olfactory Concierge */}
          <OlfactoryChatbot
            isOpen={conciergeOpen}
            onClose={() => setConciergeOpen(false)}
            onOpenStoreLocator={handleOpenStoreLocatorGlobal}
            onOpenConsultation={() => {
              setConciergeOpen(false);
              setConsultationModalOpen(true);
            }}
            onQuickView={handleOpenQuickView}
          />

          {/* Patron Salon (Firebase Auth & Saved Wardrobe) */}
          <PatronProfileModal
            isOpen={patronProfileOpen}
            onClose={() => setPatronProfileOpen(false)}
            onQuickView={handleOpenQuickView}
            onOpenConsultation={() => {
              setPatronProfileOpen(false);
              setConsultationModalOpen(true);
            }}
          />

          {/* Private Atelier Consultation Booking (Firestore) */}
          <PrivateConsultationModal
            isOpen={consultationModalOpen}
            onClose={() => setConsultationModalOpen(false)}
          />

          {/* Scent Vibe Modal (Vibe & Likings Fragrance Finder) */}
          <ScentFinderModal
            isOpen={scentFinderOpen}
            onClose={() => setScentFinderOpen(false)}
            onQuickView={handleOpenQuickView}
            onOpenConsultation={() => setConsultationModalOpen(true)}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
