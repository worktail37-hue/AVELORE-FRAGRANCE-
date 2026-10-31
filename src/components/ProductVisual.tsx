import React from 'react';
import { Product } from '../data/siteData';
import { IMAGES } from '../data/images';

interface ProductVisualProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  isHovered?: boolean;
  priority?: boolean;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  size = 'md',
  className = '',
  isHovered = false,
}) => {
  // Check if a real image override is supplied in IMAGES
  const externalImage = IMAGES.products[product.id];
  if (externalImage) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={externalImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Dimension scaling
  const dimensions = {
    sm: { width: 140, height: 180, viewBox: "0 0 200 260" },
    md: { width: 220, height: 280, viewBox: "0 0 240 320" },
    lg: { width: 320, height: 420, viewBox: "0 0 300 400" },
    hero: { width: 380, height: 500, viewBox: "0 0 340 460" },
  }[size];

  const p = product.colorPalette;
  const uniqueId = `prod-${product.id}-${size}`;

  // Render bespoke vector visuals based on product visualType
  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isHovered ? '-translate-y-2 rotate-1' : ''
      } ${className}`}
      style={{ width: '100%', height: '100%', minHeight: size === 'sm' ? '160px' : size === 'md' ? '220px' : '320px' }}
    >
      <svg
        viewBox={dimensions.viewBox}
        className="w-full h-full max-h-[92%] select-none drop-shadow-sm filter"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${product.name} luxury flacon`}
        role="img"
      >
        <defs>
          {/* Liquid gradient */}
          <linearGradient id={`${uniqueId}-liquid`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.liquid} stopOpacity="0.82" />
            <stop offset="65%" stopColor={p.liquid} stopOpacity="0.94" />
            <stop offset="100%" stopColor={p.liquidEnd} stopOpacity="0.98" />
          </linearGradient>

          {/* Liquid highlight */}
          <linearGradient id={`${uniqueId}-liquid-light`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="75%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>

          {/* Glass refraction edge */}
          <linearGradient id={`${uniqueId}-glass-edge`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
          </linearGradient>

          {/* Cap metallic/ebony gradient */}
          <linearGradient id={`${uniqueId}-cap-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3A3734" />
            <stop offset="40%" stopColor="#1C1A18" />
            <stop offset="70%" stopColor="#2D2A27" />
            <stop offset="100%" stopColor="#121110" />
          </linearGradient>

          {/* Gold collar */}
          <linearGradient id={`${uniqueId}-gold-collar`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E6C894" />
            <stop offset="50%" stopColor="#F9E8B8" />
            <stop offset="100%" stopColor="#C49B55" />
          </linearGradient>

          {/* Floor shadow filter */}
          <filter id={`${uniqueId}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* 1. FLOOR SHADOW */}
        <ellipse
          cx="120"
          cy={size === 'hero' ? '410' : '285'}
          rx={size === 'hero' ? '85' : '65'}
          ry={size === 'hero' ? '16' : '12'}
          fill="#111418"
          opacity="0.14"
          filter={`url(#${uniqueId}-blur)`}
          className="transition-opacity duration-500"
        />

        {/* 2. RENDER BY PRODUCT CATEGORY / VISUAL TYPE */}
        {product.visualType === 'perfume-flacon' && (
          <g transform={size === 'hero' ? 'translate(45, 40) scale(1.05)' : 'translate(0, 0)'}>
            {/* Spray collar */}
            <rect x="110" y="74" width="20" height="18" rx="2" fill={`url(#${uniqueId}-gold-collar)`} />
            <rect x="112" y="70" width="16" height="5" rx="1" fill="#D9B98A" />

            {/* Architectural Cap */}
            <rect
              x="96"
              y="32"
              width="48"
              height="40"
              rx="6"
              fill={`url(#${uniqueId}-cap-grad)`}
              stroke="#403C38"
              strokeWidth="1"
            />
            {/* Subtle cap highlight */}
            <rect x="102" y="34" width="4" height="36" fill="#FFFFFF" opacity="0.18" rx="2" />

            {/* Heavy Base Crystal Flacon Body */}
            {/* Outer glass boundary */}
            <rect
              x="62"
              y="90"
              width="116"
              height="172"
              rx="18"
              fill="#FAFAF8"
              stroke="rgba(17, 20, 24, 0.12)"
              strokeWidth="1.5"
            />

            {/* Inner Liquid Container Chamber */}
            <rect
              x="72"
              y="108"
              width="96"
              height="136"
              rx="10"
              fill={`url(#${uniqueId}-liquid)`}
            />

            {/* Meniscus surface curve */}
            <path
              d="M72 114 Q120 106 168 114 L168 108 L72 108 Z"
              fill={p.liquid}
              opacity="0.8"
            />

            {/* Liquid highlight overlay */}
            <rect
              x="72"
              y="108"
              width="96"
              height="136"
              rx="10"
              fill={`url(#${uniqueId}-liquid-light)`}
            />

            {/* Dip tube running down the bottle */}
            <line x1="120" y1="90" x2="120" y2="238" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.45" strokeDasharray="3 1" />

            {/* Thick crystal bottom glass base (luxury perfume signature) */}
            <path
              d="M63 234 L177 234 L177 250 A 12 12 0 0 1 165 262 L75 262 A 12 12 0 0 1 63 250 Z"
              fill="#FFFFFF"
              opacity="0.4"
            />

            {/* Front Paper Label */}
            <g transform="translate(78, 142)">
              <rect
                x="0"
                y="0"
                width="84"
                height="64"
                rx="3"
                fill="#FAF9F6"
                stroke="rgba(0, 0, 0, 0.08)"
                strokeWidth="0.8"
              />
              <rect x="3" y="3" width="78" height="58" rx="2" fill="none" stroke="rgba(181, 112, 63, 0.25)" strokeWidth="0.5" />
              
              <text x="42" y="18" textAnchor="middle" fill="#111418" fontSize="6" fontFamily="sans-serif" letterSpacing="2.5" fontWeight="600">
                AVELORE
              </text>
              <text x="42" y="33" textAnchor="middle" fill="#111418" fontSize="8" fontFamily="serif" fontStyle="italic" fontWeight="600">
                {product.name}
              </text>
              <text x="42" y="45" textAnchor="middle" fill="#6B7078" fontSize="4.5" fontFamily="sans-serif" letterSpacing="1.2">
                {product.subtitle.toUpperCase()}
              </text>
              <text x="42" y="54" textAnchor="middle" fill="#B5703F" fontSize="4" fontFamily="sans-serif" letterSpacing="0.8">
                {product.volume} · PARIS
              </text>
            </g>

            {/* Crystalline Specular Highlights */}
            <path
              d="M66 102 L66 250"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M174 102 L174 250"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>
        )}

        {/* 2. BODY OIL / BALM FLACON */}
        {product.visualType === 'body-oil' && (
          <g transform="translate(10, 0)">
            {/* Pump dispenser */}
            <path d="M110 52 L110 68 L116 68 L116 52 Q116 44 104 44 L92 46 L92 49 L104 48 Q110 48 110 52 Z" fill="#23211F" />
            <rect x="100" y="68" width="22" height="16" rx="2" fill={`url(#${uniqueId}-cap-grad)`} />

            {/* Sleek tall cylinder bottle */}
            <rect
              x="76"
              y="84"
              width="70"
              height="180"
              rx="16"
              fill={`url(#${uniqueId}-liquid)`}
              stroke="rgba(17, 20, 24, 0.1)"
              strokeWidth="1.2"
            />
            {/* Liquid light overlay */}
            <rect x="76" y="84" width="70" height="180" rx="16" fill={`url(#${uniqueId}-liquid-light)`} />

            {/* Slender vertical label */}
            <rect x="88" y="118" width="46" height="110" rx="2" fill="#FAF9F6" opacity="0.95" />
            <text x="111" y="138" textAnchor="middle" fill="#111418" fontSize="5.5" fontFamily="sans-serif" letterSpacing="2">
              AVELORE
            </text>
            <text x="111" y="156" textAnchor="middle" fill="#111418" fontSize="7" fontFamily="serif" fontStyle="italic" fontWeight="600">
              {product.name}
            </text>
            <text x="111" y="172" textAnchor="middle" fill="#6B7078" fontSize="4.5" fontFamily="sans-serif">
              {product.volume}
            </text>

            {/* Specular glass line */}
            <line x1="80" y1="92" x2="80" y2="256" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
          </g>
        )}

        {/* 3. CANDLE IN MATTE CERAMIC */}
        {product.visualType === 'candle' && (
          <g transform="translate(5, 10)">
            {/* Wick and gentle flame glow */}
            <ellipse cx="115" cy="85" rx="16" ry="16" fill="#F04E23" opacity="0.15" />
            <path d="M115 76 C119 82, 117 89, 115 92 C113 89, 111 82, 115 76 Z" fill="#F9DE7E" opacity="0.9" />
            <line x1="115" y1="92" x2="115" y2="98" stroke="#1C1A18" strokeWidth="2" strokeLinecap="round" />

            {/* Wax surface pool */}
            <ellipse cx="115" cy="102" rx="55" ry="14" fill="#FAF4E8" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />

            {/* Ceramic Vessel */}
            <path
              d="M60 102 C60 102 56 220 62 245 C64 253 72 258 84 258 L146 258 C158 258 166 253 168 245 C174 220 170 102 170 102 Z"
              fill={`url(#${uniqueId}-cap-grad)`}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1.2"
            />

            {/* Ceramic rim */}
            <ellipse cx="115" cy="102" rx="57" ry="12" fill="none" stroke="#5E5852" strokeWidth="2.5" />

            {/* Embossed ceramic label plaque */}
            <rect x="85" y="145" width="60" height="48" rx="2" fill="#FAF8F5" />
            <text x="115" y="162" textAnchor="middle" fill="#111418" fontSize="5.5" fontFamily="sans-serif" letterSpacing="1.8" fontWeight="600">
              AVELORE
            </text>
            <text x="115" y="174" textAnchor="middle" fill="#111418" fontSize="6.5" fontFamily="serif" fontStyle="italic" fontWeight="600">
              {product.name}
            </text>
            <text x="115" y="184" textAnchor="middle" fill="#B5703F" fontSize="4" fontFamily="sans-serif" letterSpacing="0.5">
              PROVENCE WAX
            </text>
          </g>
        )}

        {/* 4. REED DIFFUSER */}
        {product.visualType === 'diffuser' && (
          <g transform="translate(5, 5)">
            {/* Natural Rattan Reeds protruding */}
            <line x1="115" y1="130" x2="60" y2="25" stroke="#2B2825" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="115" y1="130" x2="85" y2="20" stroke="#2B2825" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="115" y1="130" x2="115" y2="15" stroke="#2B2825" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="115" y1="130" x2="145" y2="22" stroke="#2B2825" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="115" y1="130" x2="170" y2="28" stroke="#2B2825" strokeWidth="2.5" strokeLinecap="round" />

            {/* Heavy collar */}
            <rect x="102" y="118" width="26" height="16" rx="2" fill="#1F1D1A" />

            {/* Rounded apothecary vessel */}
            <rect
              x="68"
              y="134"
              width="94"
              height="124"
              rx="24"
              fill={`url(#${uniqueId}-liquid)`}
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="1.2"
            />
            <rect x="68" y="134" width="94" height="124" rx="24" fill={`url(#${uniqueId}-liquid-light)`} />

            {/* Diffuser label */}
            <rect x="83" y="166" width="64" height="54" rx="2" fill="#FAF9F6" />
            <text x="115" y="184" textAnchor="middle" fill="#111418" fontSize="5.5" fontFamily="sans-serif" letterSpacing="2">
              AVELORE
            </text>
            <text x="115" y="197" textAnchor="middle" fill="#111418" fontSize="6.5" fontFamily="serif" fontStyle="italic" fontWeight="600">
              {product.name}
            </text>
            <text x="115" y="209" textAnchor="middle" fill="#6B7078" fontSize="4.5" fontFamily="sans-serif">
              DIFFUSEUR D'AMBIANCE
            </text>

            {/* Specular line */}
            <line x1="74" y1="146" x2="74" y2="242" stroke="#FFFFFF" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
          </g>
        )}

        {/* 5. CREAM JAR / BATH SALTS */}
        {(product.visualType === 'cream-jar' || product.visualType === 'bath-salts') && (
          <g transform="translate(10, 30)">
            {/* Heavy black screw lid */}
            <rect x="65" y="90" width="110" height="28" rx="6" fill={`url(#${uniqueId}-cap-grad)`} stroke="#3D3833" strokeWidth="1" />
            <rect x="70" y="93" width="6" height="22" rx="2" fill="#FFFFFF" opacity="0.15" />

            {/* Heavy Frosted Glass Jar */}
            <rect
              x="62"
              y="118"
              width="116"
              height="100"
              rx="16"
              fill={product.visualType === 'bath-salts' ? `url(#${uniqueId}-liquid)` : '#FDFBF7'}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1.5"
            />

            {/* Heavy glass base */}
            <rect x="63" y="202" width="114" height="15" rx="4" fill="#FFFFFF" opacity="0.4" />

            {/* Label */}
            <rect x="77" y="136" width="86" height="52" rx="2" fill="#FAF9F7" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
            <text x="120" y="153" textAnchor="middle" fill="#111418" fontSize="5.5" fontFamily="sans-serif" letterSpacing="2">
              AVELORE
            </text>
            <text x="120" y="167" textAnchor="middle" fill="#111418" fontSize="7" fontFamily="serif" fontStyle="italic" fontWeight="600">
              {product.name}
            </text>
            <text x="120" y="179" textAnchor="middle" fill="#B5703F" fontSize="4.5" fontFamily="sans-serif">
              {product.volume}
            </text>
          </g>
        )}

        {/* 6. MIST / COSMETIC VIAL / COMPACT */}
        {(product.visualType === 'mist' || product.visualType === 'cosmetic-vial' || product.visualType === 'compact') && (
          <g transform="translate(15, 10)">
            {/* Dropper bulb or mist cap */}
            <ellipse cx="105" cy="50" rx="14" ry="12" fill="#24211E" />
            <rect x="94" y="62" width="22" height="18" rx="2" fill={`url(#${uniqueId}-cap-grad)`} />

            {/* Dropper pipette glass cylinder */}
            <rect
              x="74"
              y="80"
              width="62"
              height="145"
              rx="16"
              fill={`url(#${uniqueId}-liquid)`}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1.2"
            />
            <rect x="74" y="80" width="62" height="145" rx="16" fill={`url(#${uniqueId}-liquid-light)`} />

            {/* Label */}
            <rect x="82" y="112" width="46" height="74" rx="2" fill="#FAF8F5" />
            <text x="105" y="130" textAnchor="middle" fill="#111418" fontSize="5" fontFamily="sans-serif" letterSpacing="1.8">
              AVELORE
            </text>
            <text x="105" y="145" textAnchor="middle" fill="#111418" fontSize="6.5" fontFamily="serif" fontStyle="italic" fontWeight="600">
              {product.name}
            </text>
            <text x="105" y="160" textAnchor="middle" fill="#6B7078" fontSize="4" fontFamily="sans-serif">
              {product.volume}
            </text>

            <line x1="78" y1="88" x2="78" y2="215" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
