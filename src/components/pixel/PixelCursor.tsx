import React from 'react';

export type PixelCursorVariant = 'pointer' | 'arrow' | 'brackets' | 'ball' | 'star';

interface PixelCursorProps {
  variant?: PixelCursorVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/**
 * 32-Bit Selection Cursor
 * Renders authentic arcade/console cursors for active, hovered, or focused interactive targets.
 */
export const PixelCursor: React.FC<PixelCursorProps> = ({
  variant = 'arrow',
  className = '',
  size = 'md',
  color = '#facc15',
}) => {
  const sizePx = size === 'sm' ? 12 : size === 'lg' ? 22 : 16;

  if (variant === 'arrow') {
    return (
      <span
        className={`inline-flex items-center justify-center select-none animate-pixel-bounce-h ${className}`}
        aria-hidden="true"
      >
        <svg
          width={sizePx}
          height={sizePx}
          viewBox="0 0 16 16"
          fill="none"
          className="pixel-crisp"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <rect x="2" y="7" width="6" height="2" fill={color} />
          <rect x="8" y="5" width="2" height="6" fill={color} />
          <rect x="10" y="6" width="2" height="4" fill={color} />
          <rect x="12" y="7" width="2" height="2" fill={color} />
          {/* Black shadow outline */}
          <rect x="1" y="6" width="1" height="4" fill="#000" />
          <rect x="2" y="9" width="6" height="1" fill="#000" />
          <rect x="8" y="11" width="2" height="1" fill="#000" />
          <rect x="10" y="10" width="2" height="1" fill="#000" />
          <rect x="12" y="9" width="2" height="1" fill="#000" />
          <rect x="14" y="7" width="1" height="2" fill="#000" />
        </svg>
      </span>
    );
  }

  if (variant === 'pointer') {
    // Classic Retro White Hand Pointer with Black Outline
    return (
      <span
        className={`inline-flex items-center justify-center select-none animate-pixel-bounce-h ${className}`}
        aria-hidden="true"
      >
        <svg
          width={sizePx * 1.25}
          height={sizePx}
          viewBox="0 0 20 16"
          fill="none"
          className="pixel-crisp"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {/* Black outline */}
          <rect x="2" y="5" width="10" height="7" fill="#000" />
          <rect x="12" y="7" width="6" height="3" fill="#000" />
          {/* White hand body */}
          <rect x="3" y="6" width="8" height="5" fill="#ffffff" />
          {/* Pointing index finger */}
          <rect x="11" y="8" width="6" height="1" fill="#ffffff" />
          {/* Cuff */}
          <rect x="1" y="7" width="2" height="3" fill="#ef4444" />
        </svg>
      </span>
    );
  }

  if (variant === 'brackets') {
    return (
      <span
        className={`inline-flex items-center justify-center font-pixel font-bold text-yellow-400 select-none animate-pixel-blink ${className}`}
        style={{ fontSize: sizePx }}
        aria-hidden="true"
      >
        [▶]
      </span>
    );
  }

  if (variant === 'ball') {
    return (
      <span
        className={`inline-flex items-center justify-center select-none animate-pixel-blink ${className}`}
        aria-hidden="true"
      >
        <svg
          width={sizePx}
          height={sizePx}
          viewBox="0 0 16 16"
          fill="none"
          className="pixel-crisp"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <rect x="5" y="1" width="6" height="14" fill="#f8fafc" />
          <rect x="1" y="5" width="14" height="6" fill="#f8fafc" />
          <rect x="7" y="7" width="2" height="2" fill="#0f172a" />
          <rect x="3" y="3" width="2" height="2" fill="#0f172a" />
          <rect x="11" y="3" width="2" height="2" fill="#0f172a" />
          <rect x="3" y="11" width="2" height="2" fill="#0f172a" />
          <rect x="11" y="11" width="2" height="2" fill="#0f172a" />
        </svg>
      </span>
    );
  }

  // Star cursor default
  return (
    <span
      className={`inline-flex items-center justify-center select-none animate-pixel-blink ${className}`}
      aria-hidden="true"
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 12 12"
        fill="none"
        className="pixel-crisp"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="5" y="1" width="2" height="10" fill={color} />
        <rect x="1" y="5" width="10" height="2" fill={color} />
        <rect x="3" y="3" width="6" height="6" fill="#fef08a" />
        <rect x="5" y="5" width="2" height="2" fill="#ffffff" />
      </svg>
    </span>
  );
};

/**
 * 32-Bit Corner Reticles
 * Can be wrapped around any card or button to display animated corner brackets when focused/selected.
 */
export const PixelCornerReticle: React.FC<{
  className?: string;
  color?: string;
  active?: boolean;
}> = ({ className = '', color = '#facc15', active = true }) => {
  if (!active) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Top Left */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
      {/* Top Right */}
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
      {/* Bottom Left */}
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
      {/* Bottom Right */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
    </div>
  );
};
