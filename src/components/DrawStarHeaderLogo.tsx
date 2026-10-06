import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import drawstarLogoImg from '../assets/images/DrawStar.png';

interface DrawStarHeaderLogoProps {
  className?: string;
  onClick?: () => void;
}

/**
 * 32-Bit DrawStar Arcade Master Header Logo
 * Fully occupies top-left space without redundant subtitle text.
 * Displays the complete, uncut "DRAWSTAR" arcade wordmark with golden star crest,
 * authentic pixel bevels, scanlines, and radiant retro chiptune aesthetics.
 */
export const DrawStarHeaderLogo: React.FC<DrawStarHeaderLogoProps> = ({
  className = '',
  onClick,
}) => {
  return (
    <div
      id="main-menu-drawstar-logo-header"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title="DRAWSTAR • 32-Bit Football Career"
      className={`group relative h-12 sm:h-13 px-3 sm:px-4 bg-gradient-to-r from-slate-950 via-[#181204] to-slate-950 border-2 border-amber-400/90 pixel-bevel-gold shadow-[0_0_22px_rgba(245,158,11,0.4)] hover:border-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.65)] flex items-center gap-2.5 sm:gap-3 select-none transition-all duration-200 cursor-default ${className}`}
    >
      {/* 32-Bit Gold Pixel Corner Brackets */}
      <span className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
      <span className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
      <span className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

      {/* Retro 32-bit Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.25) 1px, transparent 1px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* Left: 32-Bit Star Emblem Crest Mark */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-950 border-2 border-amber-300 pixel-bevel-gold flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform overflow-hidden">
        {/* Inner Star Artwork */}
        <div className="relative flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-100 fill-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span className="absolute -top-1 -right-1 text-white font-mono text-[9px] font-black animate-pulse">
            ✦
          </span>
        </div>
      </div>

      {/* Right / Center: Bold, Crisp, Complete "DRAWSTAR" 32-Bit Arcade Typography */}
      <div className="relative flex flex-col justify-center min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span
            className="font-arcade font-black text-xl sm:text-2xl tracking-[0.16em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            style={{
              textShadow: '0 0 14px rgba(245,158,11,0.6), 2px 2px 0 #000',
              imageRendering: 'pixelated',
            }}
          >
            DRAWSTAR
          </span>
          <span className="text-amber-300 text-xs font-mono font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse">
            ★
          </span>
        </div>

        {/* 32-Bit Golden Powerline Underneath (Subtle, sleek, no redundant subtitle text) */}
        <div className="mt-0.5 flex items-center gap-1 w-full">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-transparent shadow-[0_0_6px_#f59e0b]" />
          <span className="text-[7px] font-pixel text-amber-400/90 tracking-widest uppercase font-bold shrink-0">
            32-BIT
          </span>
          <div className="h-[2px] w-3 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
      </div>
    </div>
  );
};

export default DrawStarHeaderLogo;
