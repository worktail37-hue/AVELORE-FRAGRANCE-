/**
 * CENTRAL IMAGES & ASSETS CONFIGURATION
 * 
 * Replace any image slot with your own high-resolution photography, video, or CDN URLs.
 * When left as null or default, the application seamlessly renders bespoke SVG & CSS
 * generative luxury visuals with glass refractions, floor shadows, and ambient lighting.
 */

export const HERO_VIDEO_SRC = "/assets/aistudio/Generated_Video_October_26__2026_-_2_09PM_3224928e.mp4";
export const HERO_VIDEO_FALLBACK_SRC = "/hero.mp4";
export const HERO_POSTER_SRC = "/hero-poster.jpg";

export const IMAGES = {
  // Hero section video & poster assets
  hero: {
    video: HERO_VIDEO_SRC,
    poster: HERO_POSTER_SRC,
    alt: "Avelore fine flacon surrounded by floating botanicals and morning sky",
  },

  // Category showcase images
  categories: {
    fragrance: {
      url: null as string | null,
      alt: "Avelore Fine Fragrances flacon collection",
    },
    bodyBath: {
      url: null as string | null,
      alt: "Avelore Body & Bath restorative elixirs",
    },
    home: {
      url: null as string | null,
      alt: "Avelore hand-poured mineral wax candle and reed diffuser",
    },
    beauty: {
      url: null as string | null,
      alt: "Avelore velvet lip colour and squalane drops",
    },
  },

  // Collections editorial chapters
  collections: {
    solar: {
      url: null as string | null,
      alt: "Solar Solstice collection illuminated in golden Mediterranean light",
    },
    meridian: {
      url: null as string | null,
      alt: "Meridian Drift oceanic botanicals against coastal limestone",
    },
    nocturne: {
      url: null as string | null,
      alt: "Nocturne and Hearth resinous warm laboratory distillation",
    },
    botanical: {
      url: null as string | null,
      alt: "The Botanical Garden dawn rose harvest in Grasse",
    },
  },

  // About page editorial visuals
  about: {
    atelier: {
      url: null as string | null,
      alt: "Historical stone distillation laboratory in Grasse, France",
    },
    botanicals: {
      url: null as string | null,
      alt: "Hand-harvested centifolia rose petals and raw resins",
    },
    perfumer: {
      url: null as string | null,
      alt: "Master perfumer formulating at the organ",
    },
  },

  // Product visual slot overrides (keyed by product ID)
  products: {} as Record<string, string>,
};
