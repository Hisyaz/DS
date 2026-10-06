import React from 'react';
import drawstarLogoImg from '../assets/images/DrawStar.png';

interface DrawStarMarkIconProps {
  className?: string;
  size?: number | string;
}

/**
 * 32-Bit DrawStar Icon Mark
 * Features the signature pixelated "D" with the golden star inside and orbit swoosh,
 * perfectly optimized to fit top bars, badges, and headers without blurry downscaling.
 */
export const DrawStarMarkIcon: React.FC<DrawStarMarkIconProps> = ({
  className = '',
  size = 40,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none drawstar-mark-glow ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
      title="DrawStar Unique Career"
    >
      {/* 32-Bit Pixel Logo Artwork displaying the complete DrawStar crest without text cutoff */}
      <img
        src={drawstarLogoImg}
        alt="DrawStar Logo Mark"
        className="w-full h-full object-contain pointer-events-none"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default DrawStarMarkIcon;
