import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../data/siteData';
import { ProductVisual } from './ProductVisual';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(product.id);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.025,
        y: -4,
        transition: {
          type: 'spring',
          stiffness: 350,
          damping: 24,
          mass: 0.8,
        },
      }}
      whileTap={{
        scale: 0.985,
        transition: { duration: 0.1 },
      }}
      className={`group relative flex flex-col bg-[#FFFBF5] rounded-[28px] p-6 sm:p-7 border border-[#3B0000]/10 hover:shadow-[0_20px_48px_rgba(59,0,0,0.14)] hover:border-[#3B0000]/30 transition-shadow duration-300 will-change-transform ${className}`}
    >
      {/* Top Header Row: Category & Signature Apricot/Merlot Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#7E4A4A] font-display">
            {product.categoryLabel}
          </span>
          {product.badge && (
            <>
              <span className="text-[#3B0000]/20">·</span>
              <span className="text-[10px] font-bold tracking-wider text-[#3B0000] bg-[#FFD482]/60 px-2 py-0.5 rounded-full border border-[#3B0000]/10">
                {product.badge}
              </span>
            </>
          )}
        </div>

        {/* Favorite Button & Discover Arrow */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
              favorited
                ? 'bg-[#3B0000] text-[#FFD482] border-[#3B0000]'
                : 'bg-[#FAF2E1] text-[#3B0000]/60 border-[#3B0000]/10 hover:text-[#3B0000] hover:border-[#3B0000]/30'
            }`}
            title={favorited ? 'In My Favorites (Click to remove)' : 'Add to Wishlist (Save to Profile)'}
            aria-label={favorited ? 'In My Favorites' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current text-[#FFD482]' : ''}`} />
          </button>

          <Link
            to={`/shop/${product.id}`}
            className="w-8 h-8 rounded-full bg-[#FAF2E1] border border-[#3B0000]/10 flex items-center justify-center text-[#3B0000] transition-all duration-300 group-hover:bg-[#3B0000] group-hover:text-[#FFD482] cursor-pointer"
            title={`View full details for ${product.name}`}
            aria-label={`View full details for ${product.name}`}
          >
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* Visual Container: Centered Bottle / Object with soft gradient reflection */}
      <Link
        to={`/shop/${product.id}`}
        className="relative my-2 flex items-center justify-center min-h-[220px] sm:min-h-[250px] overflow-hidden block"
        aria-label={`${product.name} - ${product.categoryLabel}`}
      >
        <ProductVisual
          product={product}
          size="md"
          isHovered={isHovered}
        />
      </Link>

      {/* Product Details */}
      <div className="mt-auto pt-3 border-t border-[#3B0000]/10">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-display font-bold text-[#3B0000] leading-snug">
            <Link
              to={`/shop/${product.id}`}
              className="hover:text-[#520909] transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-[#3B0000] tabular-nums shrink-0 font-display">
            From ${product.priceFrom}
          </span>
        </div>

        <p className="text-xs text-[#7E4A4A] line-clamp-2 mt-1.5 leading-relaxed font-sans">
          {product.description}
        </p>

        {/* Hover Action Bar: Slide-in Discover CTA & Quick View modal trigger */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-2">
          <Link
            to={`/shop/${product.id}`}
            className="text-xs font-bold uppercase tracking-wider text-[#3B0000] hover:text-[#520909] transition-colors flex items-center gap-1.5 font-display group-hover:translate-x-0.5"
          >
            <span>Discover</span>
            <span className="w-4 h-[1.5px] bg-[#3B0000] transition-all group-hover:w-7" />
          </Link>

          <button
            onClick={() => onQuickView(product)}
            className="text-[11px] text-[#7E4A4A] hover:text-[#3B0000] tracking-wider uppercase font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title={`Quick preview ${product.name}`}
          >
            <Eye className="w-3 h-3" />
            <span>Quick View</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
