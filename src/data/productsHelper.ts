import { PRODUCTS, COLLECTIONS, Product, CollectionChapter } from './siteData';

export interface EnrichedProduct extends Product {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  howToWear: string;
  sku: string;
  relatedProducts: Product[];
  collection?: CollectionChapter;
}

export function getProductBySlug(slug: string): EnrichedProduct | null {
  const product = PRODUCTS.find((p) => p.id === slug || p.id.toLowerCase() === slug.toLowerCase());
  if (!product) return null;

  // Resolve related products from same category or collection
  const relatedProducts = PRODUCTS
    .filter((p) => p.id !== product.id && (p.category === product.category || p.collectionId === product.collectionId))
    .slice(0, 3);

  const collection = COLLECTIONS.find((c) => c.id === product.collectionId);

  // Generate customized how to wear ritual based on category
  let howToWear = "Apply 2-3 sprays directly to warm arterial pulse points—the base of the neck, inner wrists, and behind earlobes. Do not rub skin together; allow the bio-fermented alcohol carrier to evaporate naturally.";
  if (product.category === 'body-bath') {
    howToWear = "Warm a generous amount between palms after bathing while skin is still slightly damp. Smooth upward toward the heart in long, rhythmic strokes to seal in vital lipids and lock in fragrance.";
  } else if (product.category === 'home') {
    howToWear = "For candles, trim wick to 5mm before lighting. Allow wax to melt to the outer vessel edges during the initial burn (approx. 2-3 hours) to prevent tunneling. For diffusers, flip rattan reeds weekly.";
  } else if (product.category === 'beauty') {
    howToWear = "Apply with fingertips or applicator onto clean, hydrated skin. Blend outward with light patting motions. May be worn alone for bare radiance or layered over foundation for dewiness.";
  }

  const metaTitle = `${product.name}, ${product.subtitle} | Avelore`;
  const metaDescription = `${product.name} by Avelore. ${product.description.slice(0, 110)}... Formulated in Grasse with rare botanical harvests. Discover notes, ingredients & ritual.`;

  return {
    ...product,
    slug: product.id,
    metaTitle,
    metaDescription,
    howToWear,
    sku: `AV-${product.category.toUpperCase().slice(0, 3)}-${product.id.slice(0, 8).toUpperCase()}`,
    relatedProducts,
    collection,
  };
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.id);
}

export function getCollectionBySlug(slug: string): CollectionChapter | null {
  return COLLECTIONS.find((c) => c.id === slug || c.id.toLowerCase() === slug.toLowerCase()) || null;
}

export function getAllCollectionSlugs(): string[] {
  return COLLECTIONS.map((c) => c.id);
}
