import React, { useRef, useEffect, useState } from 'react';
import { PillButton } from './PillButton';
import { RotatingBadge } from './RotatingBadge';
import { HERO_VIDEO_SRC, HERO_VIDEO_FALLBACK_SRC, HERO_POSTER_SRC } from '../data/images';
import { ProductVisual } from './ProductVisual';
import { PRODUCTS, Product } from '../data/siteData';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onQuickView: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onQuickView, onSelectCategory }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoDuration, setVideoDuration] = useState(10);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const heroProduct = PRODUCTS.find((p) => p.id === 'solene') || PRODUCTS[0];

  useEffect(() => {
    // Check if network is slow or user requested data saving
    const navConn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const isSaveData = navConn?.saveData === true;
    const isSlowConnection = navConn?.effectiveType === 'slow-2g' || navConn?.effectiveType === '2g';

    if (isSaveData || isSlowConnection) {
      return;
    }

    const attachVideo = () => {
      setVideoSrc(HERO_VIDEO_SRC);
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
        attachVideo,
        { timeout: 1500 }
      );
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(attachVideo, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Scroll Progress Calculation and Video Scrubbing with Damping
  useEffect(() => {
    let animationFrameId: number;
    let targetProgress = 0;
    let currentVideoTime = 0;

    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const totalDist = rect.height - window.innerHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / totalDist, 0), 1);
      targetProgress = p;
      setScrollProgress(p);
    };

    const updateVideo = () => {
      const video = videoRef.current;
      if (video && !videoError && !isReducedMotion && video.duration) {
        const targetTime = targetProgress * video.duration;
        currentVideoTime += (targetTime - currentVideoTime) * 0.1;

        if (Math.abs(video.currentTime - currentVideoTime) > 0.02) {
          try {
            video.currentTime = currentVideoTime;
          } catch {
            // Ignore scrubbing if browser restricts fast seeks
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateVideo);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    animationFrameId = requestAnimationFrame(updateVideo);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoError, isReducedMotion]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoDuration(videoRef.current.duration);
      videoRef.current.currentTime = 0;
    }
  };

  const getBeatStyle = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (isReducedMotion) {
      return {
        opacity: start === 0 ? 1 : 0,
        transform: 'none',
        pointerEvents: start === 0 ? ('auto' as const) : ('none' as const),
        filter: 'none',
      };
    }

    const p = scrollProgress;
    let opacity = 0;
    let translateY = 40;
    let scale = 0.98;
    let blur = 4;

    if (p < start) {
      opacity = 0;
      translateY = 40;
      scale = 0.96;
      blur = 6;
    } else if (p >= start && p < peakStart) {
      const progressIn = (p - start) / (peakStart - start);
      opacity = progressIn;
      translateY = 40 * (1 - progressIn);
      scale = 0.96 + 0.04 * progressIn;
      blur = 6 * (1 - progressIn);
    } else if (p >= peakStart && p <= peakEnd) {
      opacity = 1;
      translateY = 0;
      scale = 1;
      blur = 0;
    } else if (p > peakEnd && p <= end) {
      const progressOut = (p - peakEnd) / (end - peakEnd);
      opacity = 1 - progressOut;
      translateY = -40 * progressOut;
      scale = 1 + 0.02 * progressOut;
      blur = 4 * progressOut;
    } else {
      opacity = 0;
      translateY = -40;
      scale = 1.02;
      blur = 6;
    }

    const isInteractive = opacity > 0.4;

    return {
      opacity,
      transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
      filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
      pointerEvents: isInteractive ? ('auto' as const) : ('none' as const),
      transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
    };
  };

  const activeStep =
    scrollProgress < 0.25
      ? '01'
      : scrollProgress < 0.5
      ? '02'
      : scrollProgress < 0.78
      ? '03'
      : '04';

  const scrollToShopCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={wrapperRef}
      id="home"
      data-section="home"
      className="relative w-full h-[400vh] select-none scroll-mt-20"
    >
      <div id="hero" className="absolute top-0 left-0 w-0 h-0 pointer-events-none" />
      {/* STICKY FULL-VIEWPORT STAGE */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* 1. BACKGROUND VIDEO OR BURNT MERLOT SKY SCENE */}
        <div className="absolute inset-0 z-0 bg-[#3B0000]">
          {/* LCP element: high priority hero poster image with explicit dimensions */}
          <img
            src={HERO_POSTER_SRC}
            alt="Avelore signature fine fragrance flacon resting in warm golden botanical light"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 ${
              isVideoReady ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {!videoError && videoSrc && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              poster={HERO_POSTER_SRC}
              onCanPlay={() => setIsVideoReady(true)}
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setVideoError(true)}
              className={`w-full h-full object-cover select-none pointer-events-none will-change-transform transition-opacity duration-700 ${
                isVideoReady ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src={videoSrc} type="video/mp4" />
              <source src={HERO_VIDEO_FALLBACK_SRC} type="video/mp4" />
            </video>
          )}

          {videoError && (
            <div
              className="w-full h-full relative"
              style={{
                background: 'linear-gradient(180deg, #3B0000 0%, #520909 50%, #FAF2E1 100%)',
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[480px]">
                <ProductVisual product={heroProduct} size="hero" />
              </div>
            </div>
          )}

          {/* 2. OVERLAYS: BURNT MERLOT GRADIENT SCRIM & GRAIN */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#3B0000]/85 via-[#3B0000]/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-[75vh] bg-gradient-to-t from-[#3B0000] via-[#3B0000]/65 to-transparent pointer-events-none" />

          {/* Film grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* 3. GIANT WATERMARK TEXT (Golden Apricot Parallax Drift) */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-1 pointer-events-none flex items-center justify-center overflow-hidden whitespace-nowrap will-change-transform"
          style={{
            transform: `translate3d(calc(-50% + ${scrollProgress * -160}px), -50%, 0)`,
            left: '50%',
          }}
        >
          <span className="text-[15vw] font-display font-extrabold italic tracking-tight text-[#FFD482]/[0.12] leading-none select-none uppercase">
            SCENT THAT STAYS
          </span>
        </div>

        {/* 4. SCROLL-CHOREOGRAPHED EDITORIAL TEXT BEATS */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full h-full flex flex-col justify-end pb-16 sm:pb-24">
          <div className="relative w-full max-w-3xl min-h-[260px] sm:min-h-[300px]">
            {/* BEAT 1 (0 to 25%): AVELORE Wordmark + Intention */}
            <div
              style={getBeatStyle(0.0, 0.05, 0.20, 0.25)}
              className="absolute inset-0 flex flex-col justify-end"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FFD482] shadow-[0_0_12px_#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                  Fine Fragrance House
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold text-[#FFD482] tracking-tight leading-[1.02] mb-4">
                ENTER AVELORE
                <span className="sr-only"> - luxury fragrance house: perfumes, body &amp; bath, home fragrance and beauty</span>
              </h1>
              <p className="text-lg sm:text-2xl font-serif italic text-[#FFF5E3]/95 max-w-xl font-normal leading-relaxed">
                Scent, composed with intention.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#FFD482]/60 uppercase tracking-widest">
                <span>Grasse · Paris · Est. 2019</span>
              </div>
            </div>

            {/* BEAT 2 (25 to 50%): Rare Ingredients & Presence */}
            <div
              style={getBeatStyle(0.25, 0.30, 0.45, 0.50)}
              className="absolute inset-0 flex flex-col justify-end"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                  Artisanal Extraction
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#FFD482] tracking-tight leading-[1.1] mb-4 max-w-2xl text-balance">
                Composed from rare ingredients, <span className="font-serif italic font-normal text-white">worn with presence.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#FFF5E3]/85 max-w-lg leading-relaxed font-sans">
                Single-estate Grasse centifolia roses, wild Peloponnese sage, and aged amber resins macerated in French oak.
              </p>
            </div>

            {/* BEAT 3 (50 to 78%): 4 Categories Showcase */}
            <div
              style={getBeatStyle(0.50, 0.55, 0.72, 0.78)}
              className="absolute inset-0 flex flex-col justify-end"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                  Four Disciplines
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#FFD482] tracking-tight leading-[1.1] mb-6">
                Fragrance. Body & Bath. Home. <span className="font-serif italic font-normal text-white">Beauty.</span>
              </h2>
              {/* Four interactive category chips smoothly scrolling to #shop */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <button
                  onClick={() => scrollToShopCategory('fragrance')}
                  className="px-4 py-2.5 rounded-full bg-[#3B0000]/60 hover:bg-[#FFD482] text-[#FFD482] hover:text-[#3B0000] backdrop-blur-md border border-[#FFD482]/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-display"
                >
                  <span>Fine Fragrance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => scrollToShopCategory('body-bath')}
                  className="px-4 py-2.5 rounded-full bg-[#3B0000]/60 hover:bg-[#FFD482] text-[#FFD482] hover:text-[#3B0000] backdrop-blur-md border border-[#FFD482]/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-display"
                >
                  <span>Body & Bath</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => scrollToShopCategory('home')}
                  className="px-4 py-2.5 rounded-full bg-[#3B0000]/60 hover:bg-[#FFD482] text-[#FFD482] hover:text-[#3B0000] backdrop-blur-md border border-[#FFD482]/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-display"
                >
                  <span>Home Fragrance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => scrollToShopCategory('beauty')}
                  className="px-4 py-2.5 rounded-full bg-[#3B0000]/60 hover:bg-[#FFD482] text-[#FFD482] hover:text-[#3B0000] backdrop-blur-md border border-[#FFD482]/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-display"
                >
                  <span>Beauty</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* BEAT 4 (78 to 100%): Final Hero Climax */}
            <div
              style={getBeatStyle(0.78, 0.83, 1.0, 1.0)}
              className="absolute inset-0 flex flex-col justify-end"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#FFD482] font-display font-bold">
                  The Olfactory Library
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-[#FFD482] tracking-tight leading-[1.05] mb-4">
                The Art of Being <span className="font-serif italic font-normal text-white">Remembered.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#FFF5E3]/85 max-w-lg mb-6 leading-relaxed font-sans">
                Explore eighteen intentional formulations across fine extraits, restorative body oils, and hand-poured wax tapers.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <PillButton to="#shop" variant="apricot" size="lg" arrow="right">
                  Explore the Collection
                </PillButton>
                <button
                  onClick={() => onQuickView(heroProduct)}
                  className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FFD482] hover:text-white transition-colors py-3 px-3 flex items-center gap-2 cursor-pointer font-display"
                >
                  <span>Featured: Solène Extrait</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. MINIMAL RIGHT-EDGE PROGRESS UI IN GOLDEN APRICOT */}
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col items-center gap-3 select-none pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#FFD482]/60 -rotate-90 origin-center mb-2">
            SCROLL
          </span>
          <div className="w-[1.5px] h-28 bg-[#FFD482]/20 rounded-full relative overflow-hidden">
            <div
              className="w-full bg-[#FFD482] rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_#FFD482]"
              style={{
                height: `${Math.round(scrollProgress * 100)}%`,
              }}
            />
          </div>
          <div className="text-[11px] font-mono font-bold text-[#FFD482] tracking-wider mt-2">
            <span>{activeStep}</span>
            <span className="text-[#FFD482]/40"> / 04</span>
          </div>
        </div>

        {/* 6. ROTATING GOLDEN APRICOT BADGE */}
        <div
          className="absolute top-28 right-6 sm:right-12 z-20 pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `scale(${scrollProgress >= 0.75 ? 1 : 0.85})`,
            opacity: scrollProgress >= 0.7 ? 1 : 0.35,
          }}
        >
          <RotatingBadge size={105} text="CRAFTED · COMPOSED · REMEMBERED · " />
        </div>

        {/* 7. BOTTOM STAGE INDICATOR */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full flex items-center justify-between text-xs text-[#FFD482]/60 pb-6 pointer-events-none">
          <span className="font-mono tracking-widest text-[10px] uppercase">
            Avelore Haute Parfumerie · Burnt Merlot & Golden Apricot
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD482]" />
            <span className="uppercase tracking-widest text-[10px] font-bold text-[#FFD482]">
              {scrollProgress < 0.95 ? 'Continue Scrolling' : 'Release Stage'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
