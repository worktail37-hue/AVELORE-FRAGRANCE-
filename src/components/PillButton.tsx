import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

interface PillButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'apricot' | 'merlot' | 'vermilion' | 'dark' | 'outline' | 'ghost' | 'mint';
  arrow?: 'up-right' | 'right' | 'none';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  to,
  onClick,
  variant = 'apricot',
  arrow = 'right',
  className = '',
  size = 'md',
  type = 'button',
  disabled = false,
}) => {
  const sizeStyles = {
    sm: 'text-xs py-2 px-4 gap-2',
    md: 'text-xs md:text-sm py-3 px-6 gap-2.5',
    lg: 'text-sm md:text-base py-3.5 px-8 gap-3',
  }[size];

  // Normalized variants for Burnt Merlot & Golden Apricot theme
  const variantStyles = {
    apricot:
      'bg-[#FFD482] text-[#3B0000] hover:bg-[#ffe6b3] shadow-[0_4px_20px_rgba(255,212,130,0.32)] hover:shadow-[0_6px_28px_rgba(255,212,130,0.45)] border border-[#3B0000]/10',
    vermilion:
      'bg-[#FFD482] text-[#3B0000] hover:bg-[#ffe6b3] shadow-[0_4px_20px_rgba(255,212,130,0.32)] hover:shadow-[0_6px_28px_rgba(255,212,130,0.45)] border border-[#3B0000]/10',
    mint:
      'bg-[#FFD482] text-[#3B0000] hover:bg-[#ffe6b3] shadow-[0_4px_20px_rgba(255,212,130,0.32)] border border-[#3B0000]/10',
    merlot:
      'bg-[#3B0000] text-[#FFD482] hover:bg-[#520909] shadow-[0_4px_20px_rgba(59,0,0,0.35)] border border-[#FFD482]/20',
    dark:
      'bg-[#3B0000] text-[#FFD482] hover:bg-[#520909] shadow-[0_4px_20px_rgba(59,0,0,0.35)] border border-[#FFD482]/20',
    outline:
      'bg-transparent border border-[#3B0000]/25 text-[#3B0000] hover:border-[#3B0000] hover:bg-[#3B0000] hover:text-[#FFD482]',
    ghost:
      'bg-transparent text-[#3B0000] hover:bg-[#3B0000]/5',
  }[variant];

  const baseStyles =
    'group inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] select-none whitespace-nowrap shrink-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const content = (
    <>
      <span className="tracking-wider uppercase text-[11px] md:text-xs font-bold font-display">{children}</span>
      {arrow === 'up-right' && (
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
      {arrow === 'right' && (
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (to && to.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(to);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (onClick) onClick();
  };

  if (to) {
    return (
      <a
        href={to}
        onClick={handleClick}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      {content}
    </button>
  );
};
