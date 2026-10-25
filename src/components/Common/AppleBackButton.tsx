import React from 'react';
import { ChevronRight } from 'lucide-react';

interface AppleBackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  title?: string;
}

export const AppleBackButton: React.FC<AppleBackButtonProps> = ({
  onClick,
  label = 'رجوع',
  variant = 'light',
  className = '',
  title = 'العودة للشاشة السابقة',
}) => {
  const variantStyles = {
    // For white/light backgrounds (cards, modals)
    light: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 shadow-xs',
    // For dark blue/colored header bars
    dark: 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/20 shadow-xs',
    // Frosted glass effect
    glass: 'bg-white/40 hover:bg-white/60 active:bg-white/70 backdrop-blur-md text-slate-800 border border-white/60 shadow-xs',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 apple-squircle-sm text-xs font-bold transition-all active:scale-95 cursor-pointer select-none shrink-0 ${variantStyles[variant]} ${className}`}
    >
      <ChevronRight className="w-4 h-4 sf-icon rtl:rotate-0" />
      <span>{label}</span>
    </button>
  );
};
