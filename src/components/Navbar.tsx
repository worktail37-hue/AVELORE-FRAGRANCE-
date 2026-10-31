import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scrollToSection } from '../utils/scrollHelper';

interface NavbarProps {
  onOpenStoreLocator: () => void;
  onOpenSearch: () => void;
  onOpenConcierge?: () => void;
  onOpenProfile: () => void;
  onOpenScentMatch?: () => void;
  onOpenScentVibe?: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStoreLocator,
  onOpenSearch,
  onOpenProfile,
  onOpenScentMatch,
  onOpenScentVibe,
  activeSection = 'home',
}) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(activeSection);

  useEffect(() => {
    const handleScroll = () => {
      // ScrollSpy for single-page sections without layout shifts
      const sections = ['home', 'hero', 'exclusive-perfumes', 'shop', 'collections', 'about', 'faqs', 'contact'];
      for (const sectionId of sections.slice().reverse()) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setCurrentSection(sectionId === 'hero' ? 'home' : sectionId);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();

    if (location.pathname === '/') {
      scrollToSection(targetId);
      window.history.pushState(null, '', `/#${targetId}`);
    } else {
      navigate(`/#${targetId}`);
      setTimeout(() => {
        scrollToSection(targetId);
      }, 120);
    }
  };

  const handleTriggerScentVibe = () => {
    if (onOpenScentVibe) {
      onOpenScentVibe();
    } else if (onOpenScentMatch) {
      onOpenScentMatch();
    }
  };

  // Primary central navigation items (Scent Vibe is now placed in the action bar after SEARCH)
  const navLinks = [
    { name: 'Home', targetId: 'home', path: '/#home' },
    { name: 'Shop', targetId: 'shop', path: '/#shop' },
    { name: 'Collections', targetId: 'collections', path: '/#collections' },
    { name: 'About', targetId: 'about', path: '/#about' },
    { name: 'FAQs', targetId: 'faqs', path: '/#faqs' },
    { name: 'Contact', targetId: 'contact', path: '/#contact' },
  ];

  return (
    <>
      {/* Centralized, uniform, fixed navbar with flex-grow, justify-center, and items-center container */}
      <header className="fixed top-0 left-0 right-0 z-40 h-20 w-full bg-[#FAF2E1] border-b border-[#3B0000]/10 shadow-[0_4px_20px_rgba(59,0,0,0.03)] text-[#3B0000]">
        <div className="max-w-7xl mx-auto h-full px-6 sm:px-8 flex items-center justify-between">
          
          {/* Zone 1: Brand Wordmark (Left Anchor) */}
          <div className="flex items-center shrink-0 z-10">
            <Link
              to="/"
              onClick={(e) => handleNavClick(e, 'home')}
              className="flex items-center gap-2 text-xl md:text-2xl font-display tracking-widest whitespace-nowrap transition-colors group cursor-pointer text-[#3B0000] hover:text-[#520909]"
              aria-label="Avelore Haute Parfumerie - Home"
            >
              <span className="font-extrabold tracking-[0.22em]">AVELORE</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B0000] transition-transform duration-300 group-hover:scale-125" />
            </Link>
          </div>

          {/* Zone 2: Navigation Links Container with explicit flex-grow, justify-center, and items-center */}
          <div className="hidden lg:flex flex-grow justify-center items-center px-4">
            <nav
              aria-label="Primary navigation"
              className="flex items-center justify-center gap-4 xl:gap-7 text-xs font-bold uppercase tracking-[0.14em] font-display"
            >
              {navLinks.map((link) => {
                const isCurrent =
                  (location.pathname === '/' && currentSection === link.targetId) ||
                  (location.pathname === link.path);

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.targetId)}
                    className={`relative py-1.5 px-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                      isCurrent
                        ? 'text-[#3B0000]'
                        : 'text-[#3B0000]/65 hover:text-[#3B0000]'
                    }`}
                  >
                    <span className="whitespace-nowrap">{link.name}</span>
                    {/* Non-shifting bottom active indicator */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#3B0000] transition-all duration-200 ${
                        isCurrent ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Zone 3: Actions (Right Anchor - SCENT VIBE placed right after SEARCH) */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0 z-10">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:p-2.5 rounded-full text-[#3B0000] hover:bg-[#3B0000]/10 transition-colors cursor-pointer shrink-0"
              aria-label="Search catalog"
              title="Search fragrances & formulations"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* SCENT VIBE Interface Trigger - Positioned distinctly after SEARCH */}
            <button
              onClick={handleTriggerScentVibe}
              className="group flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#3B0000] text-[#FFD482] hover:bg-[#520909] border border-[#FFD482]/30 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer text-xs font-display font-bold uppercase tracking-wider shrink-0"
              title="Open Scent Vibe Harmonizer Interface"
              aria-label="Open Scent Vibe Harmonizer Interface"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD482] animate-pulse" />
              <span>Scent Vibe</span>
            </button>

            {/* Boutiques Locator */}
            <button
              onClick={onOpenStoreLocator}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3B0000]/20 text-[#3B0000] hover:bg-[#3B0000] hover:text-[#FFD482] hover:border-[#3B0000] transition-all cursor-pointer text-xs font-semibold whitespace-nowrap"
              title="Locate Avelore flagship boutiques"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Boutiques</span>
            </button>

            {/* Patron Profile / Sign In */}
            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer text-xs font-semibold whitespace-nowrap ${
                user
                  ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000]'
                  : 'text-[#3B0000] border-[#3B0000]/20 hover:bg-[#3B0000]/5'
              }`}
              title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in to Patron Salon'}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Patron'}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {user ? user.displayName?.split(' ')[0] || 'Patron' : 'Patron'}
              </span>
              {profile && profile.favoriteProductIds && profile.favoriteProductIds.length > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-bold bg-[#FFD482] text-[#3B0000] flex items-center justify-center">
                  {profile.favoriteProductIds.length}
                </span>
              )}
            </button>

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#3B0000] hover:bg-[#3B0000]/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer in Signature Burnt Merlot */}
      <div
        className={`fixed inset-0 z-50 bg-[#3B0000] text-[#FFD482] transition-all duration-300 ease-in-out lg:hidden flex flex-col justify-between p-7 sm:p-10 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#FFD482]/20 pb-5">
          <Link
            to="/"
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleNavClick(e, 'home');
            }}
            className="text-2xl font-display font-extrabold tracking-widest text-[#FFD482]"
          >
            AVELORE
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full text-[#FFD482]/80 hover:text-[#FFD482] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav aria-label="Mobile navigation" className="flex flex-col gap-4 py-4">
          {navLinks.map((link, idx) => (
            <button
              key={link.name}
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, link.targetId);
              }}
              className="group flex items-baseline justify-between text-xl font-display font-bold text-[#FFD482]/90 hover:text-white transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-200">
                <span>{link.name}</span>
              </span>
              <span className="text-xs font-mono tracking-widest text-[#FFD482]/40">
                0{idx + 1}
              </span>
            </button>
          ))}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="border-t border-[#FFD482]/20 pt-5 flex flex-col gap-3">
          {/* Scent Vibe Interface Button in Mobile Drawer */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleTriggerScentVibe();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD482] rounded-full text-xs font-bold text-[#3B0000] uppercase tracking-wider cursor-pointer shadow-md hover:bg-white transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#3B0000]" />
            <span>Open Scent Vibe Atelier</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenProfile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FAF2E1] rounded-full text-xs font-bold text-[#3B0000] uppercase tracking-wider cursor-pointer shadow-sm hover:bg-white transition-colors"
          >
            <User className="w-4 h-4 text-[#3B0000]" />
            <span>{user ? `Patron: ${user.displayName || user.email}` : 'Sign In to Patron Salon'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenStoreLocator();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD482]/15 border border-[#FFD482]/30 rounded-full text-xs font-bold text-[#FFD482] uppercase tracking-wider cursor-pointer hover:bg-[#FFD482]/25 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Boutique Locator</span>
          </button>

          <p className="text-center text-[10px] text-[#FFD482]/50 tracking-widest font-mono uppercase pt-1">
            Grasse · Paris · Mayfair · New York · Tokyo
          </p>
        </div>
      </div>
    </>
  );
};
