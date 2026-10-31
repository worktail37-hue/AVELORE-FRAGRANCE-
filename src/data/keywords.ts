/**
 * AVELORE SEO KEYWORD MAP
 * White-hat target keywords mapped by page and intent.
 * Used to guide titles, H1/H2 hierarchy, natural editorial copy, and image alt text.
 */

export interface PageKeywordGroup {
  primary: string;
  secondary: string[];
  intent: 'commercial' | 'informational' | 'transactional' | 'navigational';
  recommendedTitle: string;
  metaDescription: string;
}

export const KEYWORD_MAP: Record<string, PageKeywordGroup> = {
  home: {
    primary: "Avelore",
    secondary: ["luxury fragrance house", "premium perfume brand", "fine fragrance", "haute parfumerie"],
    intent: "navigational",
    recommendedTitle: "Avelore | Luxury Perfumes, Body, Home & Beauty",
    metaDescription: "Step into Avelore, a modern luxury fragrance house. Explore rare extrait perfumes, restorative lipid body oils, mineral wax candles, and botanical cosmetics.",
  },
  shop: {
    primary: "luxury perfumes",
    secondary: ["eau de parfum", "luxury body oil", "bath salts", "luxury scented candles", "reed diffusers", "luxury lip colour"],
    intent: "commercial",
    recommendedTitle: "Shop Luxury Perfumes, Body & Bath, Candles | Avelore",
    metaDescription: "Discover Avelore's complete collection of luxury perfumes, artisanal body care, hand-poured botanical candles, and velvety lip colours composed with intention.",
  },
  collections: {
    primary: "fragrance collections",
    secondary: ["signature scents", "perfume collections", "olfactory chapters", "botanical extraits"],
    intent: "commercial",
    recommendedTitle: "Fragrance Collections & Signature Scents | Avelore",
    metaDescription: "Experience the four chapters of Avelore: The Solar Solstice, Meridian Drift, Nocturne & Earth, and The Botanical Garden. Distinctive signature scents crafted in Grasse.",
  },
  about: {
    primary: "about Avelore",
    secondary: ["fragrance craftsmanship", "perfumer", "ingredient sourcing", "Grasse atelier", "slow maceration"],
    intent: "informational",
    recommendedTitle: "About Avelore | A Modern Luxury Fragrance House",
    metaDescription: "Learn the philosophy of Avelore. Founded on ancestral Grasse maceration traditions, ethical raw botanical sourcing, and an uncompromising dedication to olfactory art.",
  },
  contact: {
    primary: "Avelore stockists",
    secondary: ["contact Avelore", "private fragrance consultation", "flagship ateliers Paris London New York Tokyo"],
    intent: "transactional",
    recommendedTitle: "Contact & Stockists | Avelore Fine Fragrance",
    metaDescription: "Connect with the Avelore concierge or reserve a private olfactory consultation at our Paris, London, New York, or Tokyo flagship ateliers.",
  },
  journal: {
    primary: "how to choose a perfume",
    secondary: ["fragrance notes explained", "eau de parfum vs eau de toilette", "how to make perfume last longer", "perfume layering guide"],
    intent: "informational",
    recommendedTitle: "The Avelore Journal | Fragrance Guides & Scent Notes",
    metaDescription: "Read the Avelore Journal for master perfumer guides on selecting signature scents, decoding fragrance pyramids (top, heart, base), and scent care rituals.",
  },
};
