/**
 * Luxury smooth scrolling helper that harmonizes Lenis smooth scroll,
 * lazy-loaded sections, and navbar height offset compensation.
 */
export function scrollToSection(sectionId: string, customOffset = -84) {
  const cleanId = sectionId.replace('#', '');

  // Dispatch event so any lazy-loaded section mounts immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lazy-load-section', { detail: cleanId }));
  }

  // Handle Home / Top of page explicitly
  if (cleanId === 'home' || cleanId === 'hero') {
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { duration: 1.0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  const performScroll = () => {
    const el = document.getElementById(cleanId);
    if (!el) {
      if (window.location.pathname !== '/') {
        window.location.href = `/#${cleanId}`;
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    const targetY = rect.top + window.pageYOffset + customOffset;

    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      try {
        lenis.scrollTo(el, { offset: customOffset, duration: 1.1 });
      } catch {
        lenis.scrollTo(targetY, { duration: 1.1 });
      }
    } else {
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }

    // Fallback verification: ensure element is in viewport start position
    setTimeout(() => {
      const freshRect = el.getBoundingClientRect();
      if (freshRect.top > 160 || freshRect.top < -100) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  };

  // Immediate attempt, plus quick retry if lazy-loading needed 40ms to mount
  const el = document.getElementById(cleanId);
  if (el) {
    performScroll();
  } else {
    setTimeout(performScroll, 50);
  }
}
