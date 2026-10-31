import React from 'react';

interface RotatingBadgeProps {
  text?: string;
  className?: string;
  size?: number;
}

export const RotatingBadge: React.FC<RotatingBadgeProps> = ({
  text = "CRAFTED · COMPOSED · REMEMBERED · ",
  className = "",
  size = 110,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Golden Apricot Circular Background */}
      <div className="absolute inset-0 rounded-full bg-[#FFD482] shadow-[0_8px_24px_rgba(255,212,130,0.35)] transition-transform duration-300 hover:scale-105 border border-[#3B0000]/15" />

      {/* Rotating SVG with curved Burnt Merlot text */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-spin-slow pointer-events-none"
        style={{ animationDuration: '22s' }}
      >
        <defs>
          <path
            id="textCircle"
            d="M 50, 50 m -40, 0 a 40,40 0 1,1 80, 0 a 40,40 0 1,1 -80, 0"
            fill="none"
          />
        </defs>
        <text
          fontSize="8.5"
          fontWeight="700"
          fill="#3B0000"
          letterSpacing="1.8"
          className="font-display uppercase"
        >
          <textPath href="#textCircle" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Center 4-point sparkle icon in Burnt Merlot */}
      <div className="relative z-10 w-6 h-6 flex items-center justify-center text-[#3B0000]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
        </svg>
      </div>
    </div>
  );
};
