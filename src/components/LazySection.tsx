import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  sectionId?: string;
  className?: string;
  rootMargin?: string;
  minHeight?: string;
}

/**
 * High-performance LazySection that loads components only when the visitor
 * scrolls near to that section of the website (within rootMargin).
 * Automatically handles anchor links, hash navigation, and instant-mount events.
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  sectionId,
  className = '',
  rootMargin = '380px 0px',
  minHeight = '350px',
}) => {
  const [isNearViewport, setIsNearViewport] = useState<boolean>(() => {
    // If user loaded the page with a hash matching this section, mount immediately
    if (typeof window !== 'undefined' && sectionId && window.location.hash.replace('#', '') === sectionId) {
      return true;
    }
    return false;
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNearViewport) return;

    // Listen for direct navigation / scroll events targeting this section
    const handleForceLoad = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (!sectionId || customEvent.detail === sectionId || customEvent.detail === 'all') {
        setIsNearViewport(true);
      }
    };

    window.addEventListener('lazy-load-section', handleForceLoad);

    // Also check on hashchange
    const handleHash = () => {
      if (sectionId && window.location.hash.replace('#', '') === sectionId) {
        setIsNearViewport(true);
      }
    };
    window.addEventListener('hashchange', handleHash);

    // Fallback if IntersectionObserver is unsupported in browser
    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      {
        rootMargin, // Triggers mounting 380px before entering viewport
        threshold: 0.01,
      }
    );

    const currentEl = sentinelRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('lazy-load-section', handleForceLoad);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [isNearViewport, sectionId, rootMargin]);

  return (
    <div
      ref={sentinelRef}
      className={`relative w-full ${className}`}
      style={{ minHeight: isNearViewport ? undefined : minHeight }}
    >
      {isNearViewport ? (
        children
      ) : (
        /* Subtle luxury placeholder skeleton while approaching viewport */
        <div
          className="w-full flex flex-col items-center justify-center p-12 opacity-30 select-none pointer-events-none transition-opacity duration-300"
          style={{ minHeight }}
          aria-hidden="true"
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#3B0000]/20 border-t-[#3B0000] animate-spin mb-3" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B0000]">
            Avelore Haute Parfumerie
          </span>
        </div>
      )}
    </div>
  );
};
