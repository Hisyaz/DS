import React, { useEffect, useState, useRef } from 'react';

interface TutorialCalloutArrowProps {
  targetId: string;
  message: string;
  preferredSide?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
  className?: string;
  pulseOutline?: boolean;
}

export const TutorialCalloutArrow: React.FC<TutorialCalloutArrowProps> = ({
  targetId,
  message,
  preferredSide = 'auto',
  className = '',
  pulseOutline = true,
}) => {
  const [coords, setCoords] = useState<{
    x: number;
    y: number;
    side: 'left' | 'right' | 'top' | 'bottom';
    arrowX: number;
    arrowY: number;
    targetRect: DOMRect | null;
  } | null>(null);

  const bubbleRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const el = document.getElementById(targetId);
    if (!el) {
      setCoords(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Default bubble dimensions (approximate)
    const bubbleW = 200;
    const bubbleH = 130;

    let side = preferredSide;
    if (side === 'auto') {
      // Determine best side based on available screen space
      if (rect.right + bubbleW + 40 < vw) {
        side = 'right';
      } else if (rect.left - bubbleW - 40 > 0) {
        side = 'left';
      } else if (rect.bottom + bubbleH + 40 < vh) {
        side = 'bottom';
      } else {
        side = 'top';
      }
    }

    let x = 0;
    let y = 0;
    let arrowX = 0;
    let arrowY = 0;

    const gap = 24; // distance from target

    if (side === 'right') {
      x = rect.right + gap;
      y = rect.top + rect.height / 2 - bubbleH / 2;
      arrowX = rect.right;
      arrowY = rect.top + rect.height / 2;
    } else if (side === 'left') {
      x = rect.left - bubbleW - gap;
      y = rect.top + rect.height / 2 - bubbleH / 2;
      arrowX = rect.left;
      arrowY = rect.top + rect.height / 2;
    } else if (side === 'bottom') {
      x = rect.left + rect.width / 2 - bubbleW / 2;
      y = rect.bottom + gap;
      arrowX = rect.left + rect.width / 2;
      arrowY = rect.bottom;
    } else {
      x = rect.left + rect.width / 2 - bubbleW / 2;
      y = rect.top - bubbleH - gap;
      arrowX = rect.left + rect.width / 2;
      arrowY = rect.top;
    }

    // Keep bubble inside screen bounds
    x = Math.max(12, Math.min(x, vw - bubbleW - 12));
    y = Math.max(12, Math.min(y, vh - bubbleH - 12));

    setCoords({
      x,
      y,
      side: side as 'left' | 'right' | 'top' | 'bottom',
      arrowX,
      arrowY,
      targetRect: rect,
    });
  };

  useEffect(() => {
    updatePosition();
    let frameId: number;
    let pollCount = 0;

    const poll = () => {
      updatePosition();
      pollCount++;
      if (pollCount < 40) {
        frameId = requestAnimationFrame(poll);
      }
    };
    frameId = requestAnimationFrame(poll);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [targetId, preferredSide]);

  if (!coords) return null;

  // Compute SVG arrow path from bubble center to target element
  const bubbleCenterX = coords.x + 95;
  const bubbleCenterY = coords.y + 60;

  return (
    <>
      {/* Optional Highlight Spotlight Border over Target Element */}
      {pulseOutline && coords.targetRect && (
        <div
          className="fixed pointer-events-none z-[120] rounded-lg transition-all duration-200 ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.8)]"
          style={{
            top: coords.targetRect.top - 2,
            left: coords.targetRect.left - 2,
            width: coords.targetRect.width + 4,
            height: coords.targetRect.height + 4,
          }}
        />
      )}

      {/* SVG Connecting Arrow with arrowhead pointing directly at target */}
      <svg
        className="fixed inset-0 pointer-events-none z-[130] w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.6))' }}
      >
        <defs>
          <marker
            id="tutorial-arrow-head"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <path d="M0,1 L11,6 L0,11 L3,6 Z" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          </marker>
        </defs>

        <path
          d={`M ${bubbleCenterX} ${bubbleCenterY} Q ${(bubbleCenterX + coords.arrowX) / 2} ${(bubbleCenterY + coords.arrowY) / 2} ${coords.arrowX} ${coords.arrowY}`}
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${bubbleCenterX} ${bubbleCenterY} Q ${(bubbleCenterX + coords.arrowX) / 2} ${(bubbleCenterY + coords.arrowY) / 2} ${coords.arrowX} ${coords.arrowY}`}
          stroke="#0284c7"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          markerEnd="url(#tutorial-arrow-head)"
        />
      </svg>

      {/* Circular / Rounded Speech Bubble (Matches Reference Image) */}
      <div
        ref={bubbleRef}
        id={`tutorial-callout-${targetId}`}
        onClick={() => {
          // Forward click to target element for maximum responsiveness
          const el = document.getElementById(targetId);
          if (el) {
            el.click();
          }
        }}
        className={`fixed z-[135] w-48 sm:w-52 h-32 sm:h-36 rounded-full bg-[#0084c7] hover:bg-[#0275b1] border-4 border-white text-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-center p-5 text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-bounce ${className}`}
        style={{
          top: coords.y,
          left: coords.x,
          animationDuration: '2s',
        }}
      >
        <span className="font-arcade text-xs sm:text-sm font-black leading-snug tracking-wide select-none drop-shadow-md">
          {message}
        </span>
      </div>
    </>
  );
};
