import { Product } from '../data/siteData';
import { IMAGES } from '../data/images';

/**
 * Generates an ultra crisp, high-fidelity SVG flacon presentation data URI
 * for an Avelore fine fragrance composition.
 */
export function getProductFlaconDataUrl(product: Product): string {
  // If a real custom photograph or override exists in IMAGES, prefer it
  const customImg = IMAGES.products[product.id];
  if (customImg) return customImg;

  const p = product.colorPalette || {
    liquid: '#E5A967',
    liquidEnd: '#8B4513',
    glass: 'rgba(255, 255, 255, 0.4)',
    cap: '#1C1A18',
    accent: '#FFD482',
    bgTint: '#FAF2E1',
  };

  const bottleWidth = 140;
  const bottleHeight = 190;
  const capWidth = 56;
  const capHeight = 44;
  const collarWidth = 26;
  const collarHeight = 18;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="100%" height="100%">
    <defs>
      <!-- Liquid Gradient -->
      <linearGradient id="liq-${product.id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${p.liquid}" stop-opacity="0.88" />
        <stop offset="50%" stop-color="${p.liquid}" stop-opacity="0.94" />
        <stop offset="100%" stop-color="${p.liquidEnd || p.liquid}" stop-opacity="0.98" />
      </linearGradient>

      <!-- Glass High-Reflectance Boundary -->
      <linearGradient id="glass-${product.id}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75" />
        <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0.12" />
        <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.65" />
      </linearGradient>

      <!-- Architectural Cap Gradient -->
      <linearGradient id="cap-${product.id}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3D3A37" />
        <stop offset="35%" stop-color="#1A1816" />
        <stop offset="70%" stop-color="#2D2A28" />
        <stop offset="100%" stop-color="#11100F" />
      </linearGradient>

      <!-- Golden Brass Collar -->
      <linearGradient id="gold-${product.id}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D4AF37" />
        <stop offset="50%" stop-color="#FFF2B2" />
        <stop offset="100%" stop-color="#AA820A" />
      </linearGradient>

      <!-- Flacon Shadow Blur -->
      <radialGradient id="shadow-${product.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3B0000" stop-opacity="0.28" />
        <stop offset="60%" stop-color="#3B0000" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#3B0000" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Base Pedestal Shadow -->
    <ellipse cx="160" cy="358" rx="80" ry="16" fill="url(#shadow-${product.id})" />

    <!-- Group: Flacon Object -->
    <g transform="translate(0, 20)">
      <!-- Gold Spray Collar -->
      <rect x="${160 - collarWidth / 2}" y="88" width="${collarWidth}" height="${collarHeight}" rx="2" fill="url(#gold-${product.id})" />
      <rect x="${160 - collarWidth / 2 + 3}" y="84" width="${collarWidth - 6}" height="5" rx="1.5" fill="#E6CA65" />

      <!-- Architectural Ebony / Metallic Cap -->
      <rect x="${160 - capWidth / 2}" y="44" width="${capWidth}" height="${capHeight}" rx="7" fill="url(#cap-${product.id})" stroke="#4A4540" stroke-width="1.2" />
      <rect x="${160 - capWidth / 2 + 7}" y="46" width="5" height="${capHeight - 4}" rx="2.5" fill="#FFFFFF" opacity="0.22" />

      <!-- Crystal Shoulder & Heavy Base Bottle Body -->
      <!-- Glass Outer Contour -->
      <rect x="${160 - bottleWidth / 2}" y="104" width="${bottleWidth}" height="${bottleHeight}" rx="14" fill="#FFFFFF" fill-opacity="0.12" stroke="url(#glass-${product.id})" stroke-width="2.5" />

      <!-- Liquid Reservoir Cavity -->
      <rect x="${160 - bottleWidth / 2 + 10}" y="120" width="${bottleWidth - 20}" height="${bottleHeight - 34}" rx="8" fill="url(#liq-${product.id})" />

      <!-- Meniscus / Liquid Surface Wave -->
      <path d="M ${160 - bottleWidth / 2 + 10} 124 Q 160 121 ${160 + bottleWidth / 2 - 10} 124 L ${160 + bottleWidth / 2 - 10} 128 Q 160 125 ${160 - bottleWidth / 2 + 10} 128 Z" fill="#FFFFFF" opacity="0.35" />

      <!-- Internal Dip Tube -->
      <line x1="160" y1="104" x2="160" y2="280" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="2.2" stroke-linecap="round" />

      <!-- Heavy Crystal Glass Base (Sole de Verre) -->
      <path d="M ${160 - bottleWidth / 2 + 2} ${104 + bottleHeight - 20} L ${160 + bottleWidth / 2 - 2} ${104 + bottleHeight - 20} L ${160 + bottleWidth / 2 - 2} ${104 + bottleHeight - 3} Q 160 ${104 + bottleHeight} ${160 - bottleWidth / 2 + 2} ${104 + bottleHeight - 3} Z" fill="#FFFFFF" opacity="0.38" />

      <!-- Vertical Light Reflection Strips -->
      <rect x="${160 - bottleWidth / 2 + 6}" y="112" width="6" height="${bottleHeight - 24}" rx="3" fill="#FFFFFF" opacity="0.35" />
      <rect x="${160 + bottleWidth / 2 - 12}" y="112" width="4" height="${bottleHeight - 24}" rx="2" fill="#FFFFFF" opacity="0.2" />

      <!-- Center Avelore Label Plaque -->
      <g transform="translate(160, 204)">
        <rect x="-44" y="-30" width="88" height="60" rx="4" fill="#FFFBF5" stroke="#3B0000" stroke-width="0.8" stroke-opacity="0.3" filter="drop-shadow(0 2px 4px rgba(59,0,0,0.12))" />
        <rect x="-41" y="-27" width="82" height="54" rx="2" fill="none" stroke="#FFD482" stroke-width="0.75" />
        <!-- Monogram / Seal -->
        <text x="0" y="-12" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', serif" font-size="8" font-weight="700" fill="#7E4A4A" letter-spacing="2">AVELORE</text>
        <line x1="-24" y1="-7" x2="24" y2="-7" stroke="#3B0000" stroke-width="0.5" stroke-opacity="0.3" />
        <!-- Fragrance Name -->
        <text x="0" y="5" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', serif" font-size="7.5" font-weight="700" fill="#3B0000" letter-spacing="1.2">${escapeXml(product.name.toUpperCase().slice(0, 16))}</text>
        <!-- Concentration -->
        <text x="0" y="16" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="5" font-weight="600" fill="#7E4A4A" letter-spacing="1">EXTRAIT DE PARFUM</text>
      </g>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
