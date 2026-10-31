"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Sparkles, ArrowUpRight } from "lucide-react";
import { Product } from "@/src/data/siteData";
import { ProductVisual } from "@/src/components/ProductVisual";

export interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
  id?: string;
  subtitle?: string;
  price?: string | number;
  product?: Product;
}

export const defaultSlides: Slide[] = [
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Mountain Trek",
    description: "Scale new heights and embrace the hiker's journey.",
    badge: "Adventure",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/fa/fac14e3cb2b67d40c5f3a2a0e212d0c60c1fd0aff588e59bc80883e4aceb4eee.webp",
    title: "River Rafting",
    description: "Feel the adrenaline rush as you navigate the wild rapids.",
    badge: "Extreme",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Forest Walk",
    description: "Deep dive into the silence of the ancient woods.",
    badge: "Nature",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/b4/b49b413f935303df7e05362b3530028b05c913cc039b44e25e491f12f9ba0015.webp",
    title: "Azure Beach",
    description: "Unwind on the crystal clear shores of a tropical paradise.",
    badge: "Paradise",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/84/84c0ff283758085418b1cd942706a764ffa0bf5a06312b415fc441fec23d22d6.webp",
    title: "Spiritual Path",
    description: "Discover inner peace through ancient wisdom.",
    badge: "Serenity",
  },
];

export interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

export const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 600,
      sensitivity: 240,
      xMultiplier: 120,
      yMultiplier: 25,
      rotationMultiplier: 10,
      scaleReduction: 0.05,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 300,
    xMultiplier: 150,
    yMultiplier: 30,
    rotationMultiplier: 12,
    scaleReduction: 0.04,
  };
};

export interface Carousel07Props {
  slides?: Slide[];
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onCardClick?: (slide: Slide, index: number) => void;
  className?: string;
  badgeLabel?: string;
  title?: string;
  description?: string;
}

export function Carousel07({
  slides,
  products,
  onSelectProduct,
  onCardClick,
  className,
  badgeLabel,
  title,
  description,
}: Carousel07Props) {
  // Convert products to slides if products are provided
  const items: Slide[] = React.useMemo(() => {
    if (products && products.length > 0) {
      return products.map((prod) => ({
        id: prod.id,
        title: prod.name,
        subtitle: prod.subtitle,
        description: prod.description,
        badge: prod.badge || prod.categoryLabel,
        image: "",
        price: prod.priceFrom,
        product: prod,
      }));
    }
    return slides && slides.length > 0 ? slides : defaultSlides;
  }, [products, slides]);

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const isDraggingRef = React.useRef<boolean>(false);
  const dragX = useMotionValue(0);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure current index is within bounds if items change
  React.useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, currentIndex]);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth]
  );

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipePower =
      offset / config.distanceDivisor + velocity / config.velocityDivisor;

    if (swipePower < -0.35) {
      nextSlide();
    } else if (swipePower > 0.35) {
      prevSlide();
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleCardClick = (slide: Slide, index: number) => {
    if (isDraggingRef.current) return;

    if (index !== currentIndex) {
      setCurrentIndex(index);
      return;
    }

    if (slide.product && onSelectProduct) {
      onSelectProduct(slide.product);
    } else if (onCardClick) {
      onCardClick(slide, index);
    }
  };

  const activeItem = items[currentIndex];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-8 sm:py-12 select-none",
        className
      )}
    >
      {/* Optional Header Area */}
      {(title || description || badgeLabel) && (
        <div className="max-w-4xl mx-auto px-4 text-center mb-8 sm:mb-12">
          {badgeLabel && (
            <Badge
              variant="default"
              className="mb-3 uppercase tracking-widest text-[11px] font-bold px-3 py-1 bg-[#3B0000] text-[#FFD482] border border-[#FFD482]/30"
            >
              {badgeLabel}
            </Badge>
          )}
          {title && (
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#3B0000] tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-sm sm:text-base text-[#7E4A4A] max-w-2xl mx-auto font-sans leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Stacked Cards Motion Stage */}
      <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center perspective-[1200px]">
        <div className="relative w-full max-w-[340px] sm:max-w-[420px] h-[420px] sm:h-[480px] flex items-center justify-center">
          {items.map((slide, index) => {
            const diff = index - currentIndex;
            const absDiff = Math.abs(diff);

            // Compute physics-driven transforms based on distance from center
            const xOffset = diff * config.xMultiplier;
            const yOffset = absDiff * config.yMultiplier;
            const rotation = diff * config.rotationMultiplier;
            const scale = Math.max(0.65, 1 - absDiff * config.scaleReduction);
            const zIndex = items.length - absDiff + (diff === 0 ? 10 : 0);
            const opacity =
              absDiff > 3 ? 0 : Math.max(0.2, 1 - absDiff * 0.25);
            const isCenter = diff === 0;

            return (
              <motion.div
                key={slide.id || index}
                style={{
                  zIndex,
                  x: isCenter ? dragX : xOffset,
                }}
                animate={{
                  x: xOffset,
                  y: yOffset,
                  rotateZ: rotation,
                  scale,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  mass: 0.8,
                }}
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={() => {
                  isDraggingRef.current = true;
                }}
                onDragEnd={handleDragEnd}
                onClick={() => handleCardClick(slide, index)}
                className={cn(
                  "absolute inset-0 w-full h-full rounded-[28px] overflow-hidden cursor-pointer",
                  "border border-[#3B0000]/15 shadow-[0_16px_40px_rgba(59,0,0,0.14)]",
                  "bg-gradient-to-b from-[#FFFBF5] via-[#FAF2E1] to-[#F5ECE0]",
                  "transition-shadow duration-300",
                  isCenter
                    ? "ring-2 ring-[#FFD482]/50 shadow-[0_24px_50px_rgba(59,0,0,0.22)]"
                    : "hover:border-[#3B0000]/30"
                )}
              >
                {/* Visual Media Header */}
                <div className="relative w-full h-[62%] sm:h-[65%] p-4 flex items-center justify-center overflow-hidden bg-gradient-to-b from-white/60 to-transparent">
                  {/* Subtle luxury ambient radiance */}
                  <div className="absolute inset-0 bg-radial from-[#FFD482]/20 via-transparent to-transparent pointer-events-none" />

                  {slide.product ? (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <ProductVisual
                        product={slide.product}
                        size="md"
                        isHovered={isCenter}
                        className="transition-transform duration-500 scale-105"
                      />
                    </div>
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-2xl shadow-inner pointer-events-none"
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <Badge
                      variant="default"
                      className="bg-[#3B0000] text-[#FFD482] border border-[#FFD482]/40 font-display text-[10px] uppercase font-bold tracking-widest shadow-xs"
                    >
                      {slide.badge}
                    </Badge>

                    {slide.price && (
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF2E1]/90 border border-[#3B0000]/15 text-[#3B0000] shadow-xs">
                        ${slide.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content & Interactive CTAs */}
                <div className="relative w-full h-[38%] sm:h-[35%] px-6 py-4 flex flex-col justify-between border-t border-[#3B0000]/10 bg-white/40 backdrop-blur-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-display font-bold text-[#3B0000] tracking-tight truncate">
                        {slide.title}
                      </h3>
                      {isCenter && (
                        <span className="text-[11px] font-mono text-[#3B0000]/50 shrink-0">
                          {String(index + 1).padStart(2, "0")}/
                          {String(items.length).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    {slide.subtitle && (
                      <p className="text-[11px] uppercase tracking-wider text-[#7E4A4A] font-semibold mt-0.5 truncate font-display">
                        {slide.subtitle}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[#7E4A4A] line-clamp-2 leading-relaxed font-sans">
                      {slide.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#3B0000]/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(slide, index);
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#3B0000] hover:text-[#520909] flex items-center gap-1.5 transition-colors cursor-pointer group font-display"
                    >
                      <span>{slide.product ? "Quick View" : "Explore"}</span>
                      <Eye className="w-3.5 h-3.5 text-[#3B0000] transition-transform group-hover:scale-110" />
                    </button>

                    {slide.product?.notes?.top && (
                      <span className="text-[10px] text-[#7E4A4A] font-sans truncate max-w-[140px] italic">
                        {slide.product.notes.top.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls & Indicators */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="w-10 h-10 rounded-full bg-[#FAF2E1] border border-[#3B0000]/20 text-[#3B0000] flex items-center justify-center hover:bg-[#3B0000] hover:text-[#FFD482] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots / Indicators */}
        <div className="flex items-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                idx === currentIndex
                  ? "w-8 bg-[#3B0000]"
                  : "w-2 bg-[#3B0000]/25 hover:bg-[#3B0000]/50"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="w-10 h-10 rounded-full bg-[#FAF2E1] border border-[#3B0000]/20 text-[#3B0000] flex items-center justify-center hover:bg-[#3B0000] hover:text-[#FFD482] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Active Card Olfactory Accord Preview */}
      {activeItem?.product?.notes && (
        <div className="mt-6 max-w-md mx-auto text-center px-4 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFBF5] border border-[#3B0000]/10 text-[11px] text-[#3B0000] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD482]" />
            <span className="font-bold font-display uppercase tracking-wider">
              Dominant Chords:
            </span>
            <span className="text-[#7E4A4A] truncate">
              {[
                ...(activeItem.product.notes.top || []).slice(0, 1),
                ...(activeItem.product.notes.heart || []).slice(0, 1),
                ...(activeItem.product.notes.base || []).slice(0, 1),
              ].join(" · ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carousel07;
