"use client";

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
import * as React from "react";
import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Project or fragrance name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art or flacon visual. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses or uses onClick. */
  href?: string;
  /** Optional subtitle or olfactory family (e.g., "Extrait de Parfum · Amber Woody") */
  subtitle?: string;
  /** Optional badge (e.g., "Maison Signature", "Rare Reserve", "New") */
  badge?: string;
  /** Optional price (e.g., "$285") */
  price?: string;
  /** Optional top/heart/base notes summary */
  notesSummary?: string;
  /** Optional custom click handler to open quick-view modal or product details */
  onClick?: () => void;
  /** Optional raw product payload */
  product?: any;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default "Flacons '26" */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default "Quick View" */
  action?: string;
  /** Callback fired when an item is clicked or selected */
  onItemSelect?: (item: WorksWheelItem, index: number) => void;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.42; // front card height, of the stage
const CARD_MAX_W = 0.36; // ... but never wider than this much of the stage
const CARD_RATIO = 1.38; // card width / height
const STEP = 38; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.11; // ring label and front-card title
const INDEX = 0.038; // the index down the right-hand side
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6;

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 850;
const DRAG_UNITS = 380;
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Avelore '26",
  action = "Quick View",
  onItemSelect,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp(((2 * Math.PI * ringR) / count) * 0.82 / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m
          );
          // Culled by distance, not by angle
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last]
  );

  // Native listener, cancellable while in range
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      to(next);
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  const drag = React.useRef<number | null>(null);
  const dragDist = React.useRef(0);
  const settling = React.useRef(0);

  const handleCardClick = (item: WorksWheelItem, i: number, e: React.MouseEvent) => {
    if (dragDist.current > 8) {
      // User was dragging the wheel, do not trigger click
      return;
    }
    // If user clicked an off-center item, turn to it first, or open if already focused
    if (i !== active) {
      to(i + 1);
    }
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onItemSelect) {
      e.preventDefault();
      onItemSelect(item, i);
    }
  };

  const activeItem = items[active];

  return (
    <section
      aria-label={label}
      className={cn(
        "relative h-full min-h-[30rem] w-full overflow-hidden select-none bg-[#FAF2E1] text-[#3B0000]",
        className
      )}
      {...props}
    >
      {/* Background ambient lighting for luxury atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#FFD482]/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#3B0000]/5 blur-3xl" />
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-[#3B0000] absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          drag.current = event.clientY;
          dragDist.current = 0;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current === null) return;
          const delta = drag.current - event.clientY;
          dragDist.current += Math.abs(delta);
          to(target.current + delta / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={() => {
          drag.current = null;
          if (target.current > 1) to(Math.round(target.current));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const isFront = i === active;
            return (
              <div
                key={item.title}
                id={`works-wheel-${i}`}
                role="option"
                aria-selected={isFront}
                ref={(node: HTMLElement | null) => {
                  cardRefs.current[i] = node;
                }}
                onClick={(e) => handleCardClick(item, i, e)}
                className="group absolute [backface-visibility:hidden] cursor-pointer"
                style={{
                  width: metrics.cardW,
                  height: metrics.cardH,
                  marginLeft: -metrics.cardW / 2,
                  marginTop: -metrics.cardH / 2,
                }}
              >
                <div className="relative size-full overflow-hidden rounded-[24px] bg-[#FFFBF5] border border-[#3B0000]/12 shadow-[0_20px_50px_-15px_rgba(59,0,0,0.18)] transition-all duration-300 group-hover:border-[#3B0000]/30 group-hover:shadow-[0_25px_60px_-15px_rgba(59,0,0,0.28)] flex flex-col">
                  {/* Top card pill: Badge / Flacon tag */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] uppercase font-bold tracking-[0.16em] px-2.5 py-1 rounded-full bg-[#FAF2E1]/90 text-[#3B0000] backdrop-blur-sm border border-[#3B0000]/10 font-display">
                      {item.badge || "Extrait de Parfum"}
                    </span>
                    {item.price && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3B0000] text-[#FFD482]">
                        {item.price}
                      </span>
                    )}
                  </div>

                  {/* Card Visual / Bottle Presentation */}
                  <div className="relative flex-1 w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#FAF2E1]/40 to-[#FFFBF5]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="size-full max-h-[82%] object-contain drop-shadow-[0_12px_24px_rgba(59,0,0,0.14)] transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Card Footer: Title & Quick Details */}
                  <div className="p-3.5 sm:p-4 bg-[#FFFBF5] border-t border-[#3B0000]/8">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <h4 className="text-sm sm:text-base font-display font-bold text-[#3B0000] tracking-tight truncate">
                          {item.title}
                        </h4>
                        {item.subtitle && (
                          <p className="text-[11px] font-sans text-[#7E4A4A] truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Action Affordance */}
                      {action && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(item, i, e);
                          }}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-display font-bold uppercase tracking-wider bg-[#3B0000] text-[#FFD482] transition-transform duration-300 hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <span>{action}</span>
                          <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
                            <path
                              d="M3 9 9 3M4 3h5v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {item.notesSummary && (
                      <div className="mt-2 pt-2 border-t border-[#3B0000]/6 text-[10px] text-[#3B0000]/70 truncate font-mono">
                        {item.notesSummary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ring title and front-card title trade places across transition */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center font-display font-bold text-[#3B0000] tracking-tight uppercase"
        style={{ fontSize: metrics.title }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] tracking-[0.3em] font-sans text-[#7E4A4A] uppercase font-bold">
            Haute Parfumerie Orbit
          </span>
          <span className="drop-shadow-sm font-serif italic font-normal text-[#520909]">
            {label}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[#3B0000]/60 normal-case">
            Scroll or drag to unfold flacons
          </span>
        </div>
      </div>

      {/* Left-side active title display */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-1/2 left-[5%] -translate-y-1/2 tracking-tight opacity-0 max-w-[28%] hidden sm:block"
      >
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#7E4A4A] font-bold block mb-1">
          Flacon {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <h3
          className="font-display font-bold text-[#3B0000] leading-none"
          style={{ fontSize: Math.max(metrics.title * 0.75, 24) }}
        >
          {activeItem?.title}
        </h3>
        {activeItem?.subtitle && (
          <p className="text-xs sm:text-sm text-[#7E4A4A] mt-2 font-sans">
            {activeItem.subtitle}
          </p>
        )}
        {activeItem?.notesSummary && (
          <p className="text-[11px] font-mono text-[#3B0000]/75 mt-2 bg-[#FFFBF5]/90 p-2 rounded-lg border border-[#3B0000]/10">
            {activeItem.notesSummary}
          </p>
        )}
      </div>

      {/* Side Index */}
      <ol
        className="text-[#7E4A4A] absolute top-[6%] right-[3%] text-right leading-[1.8] max-h-[88%] overflow-y-auto scrollbar-none pr-2 hidden md:block"
        style={{ fontSize: Math.max(metrics.index, 11) }}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B0000]/50 mb-1 border-b border-[#3B0000]/10 pb-1">
          Catalogue Index
        </div>
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => to(i + 1)}
              className={cn(
                "focus-visible:outline-[#3B0000] cursor-pointer transition-all duration-200 outline-none hover:text-[#3B0000] flex items-center justify-end gap-1.5 ml-auto",
                i === active && "text-[#3B0000] font-bold scale-105"
              )}
            >
              {i === active && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B0000]" />
              )}
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* Scroll indicator for mobile/small viewports */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFBF5]/80 border border-[#3B0000]/10 text-[10px] font-mono text-[#3B0000]/70 backdrop-blur-sm sm:hidden">
        <span>Turn wheel to browse flacons</span>
      </div>
    </section>
  );
}
