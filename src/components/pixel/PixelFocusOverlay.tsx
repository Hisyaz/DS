import React, { useEffect, useState, useRef } from 'react';
import { PixelCursor, PixelCornerReticle } from './PixelCursor';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * 32-Bit Arcade Keyboard & Console Selection Overlay
 * Displays retro stepped corner reticles and an animated pixel arrow pointer
 * on the currently focused element. Completely pointer-events-none to preserve
 * mouse cursor, touchpad, and touch interactions.
 */
export const PixelFocusOverlay: React.FC = () => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const activeElRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFramesLeft = 0;

    const updatePosition = () => {
      const activeEl = document.activeElement as HTMLElement | null;

      if (
        !activeEl ||
        activeEl === document.body ||
        activeEl === document.documentElement ||
        activeEl.hasAttribute('disabled') ||
        activeEl.getAttribute('aria-disabled') === 'true'
      ) {
        setTargetRect(null);
        activeElRef.current = null;
        return;
      }

      // Check visibility
      const rect = activeEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        setTargetRect(null);
        activeElRef.current = null;
        return;
      }

      activeElRef.current = activeEl;

      const isInput =
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl.tagName === 'INPUT' &&
          ['text', 'search', 'password', 'email', 'number'].includes(
            (activeEl as HTMLInputElement).type || 'text'
          ));
      setIsTextInput(Boolean(isInput));
      setIsPressed(activeEl.getAttribute('data-pixel-pressed') === 'true');

      setTargetRect((prev) => {
        if (
          !prev ||
          Math.abs(prev.top - rect.top) > 0.5 ||
          Math.abs(prev.left - rect.left) > 0.5 ||
          Math.abs(prev.width - rect.width) > 0.5 ||
          Math.abs(prev.height - rect.height) > 0.5
        ) {
          return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        }
        return prev;
      });
    };

    // Run motion tracking during CSS transitions (up to 24 frames ~400ms) without infinite idle polling
    const tick = () => {
      if (activeElRef.current && animationFramesLeft > 0) {
        animationFramesLeft--;
        updatePosition();
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const startMotionTracking = (frames = 24) => {
      animationFramesLeft = Math.max(animationFramesLeft, frames);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleFocusInOut = () => {
      updatePosition();
      startMotionTracking(20);
    };

    const handleCustomFocus = () => {
      updatePosition();
      startMotionTracking(20);
    };

    let scrollRaf: number | null = null;
    const handleScrollOrResize = () => {
      if (!activeElRef.current) return;
      if (scrollRaf === null) {
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = null;
          updatePosition();
        });
      }
    };

    const handleKeyDownKeyUp = () => {
      if (activeElRef.current) {
        setIsPressed(activeElRef.current.getAttribute('data-pixel-pressed') === 'true');
      }
    };

    window.addEventListener('focusin', handleFocusInOut);
    window.addEventListener('focusout', handleFocusInOut);
    window.addEventListener('drawstar:focus-changed', handleCustomFocus);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('keydown', handleKeyDownKeyUp, { passive: true });
    window.addEventListener('keyup', handleKeyDownKeyUp, { passive: true });

    // Initial positioning + brief transition follow
    updatePosition();
    startMotionTracking(10);

    return () => {
      window.removeEventListener('focusin', handleFocusInOut);
      window.removeEventListener('focusout', handleFocusInOut);
      window.removeEventListener('drawstar:focus-changed', handleCustomFocus);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDownKeyUp);
      window.removeEventListener('keyup', handleKeyDownKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  if (!targetRect) return null;

  // Arrow positioning: to the left of the item
  const showLeftArrow = !isTextInput && targetRect.left > 28;
  const arrowX = targetRect.left - 20;
  const arrowY = targetRect.top + targetRect.height / 2 - 8;

  return (
    <div
      id="drawstar-global-pixel-focus-overlay"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Stepped Arcade Corner Reticles */}
      <div
        className="absolute transition-all duration-75 ease-out"
        style={{
          top: targetRect.top - 2,
          left: targetRect.left - 2,
          width: targetRect.width + 4,
          height: targetRect.height + 4,
          transform: isPressed ? 'scale(0.97) translateY(2px)' : 'none',
        }}
      >
        <PixelCornerReticle active={true} color="#facc15" />
      </div>

      {/* 2. Floating 32-Bit Animated Selection Arrow (bobs toward target) */}
      {showLeftArrow && (
        <div
          className="absolute transition-all duration-75 ease-out hidden sm:block"
          style={{
            top: arrowY,
            left: arrowX,
            transform: isPressed ? 'scale(0.9) translateX(4px)' : 'none',
          }}
        >
          <PixelCursor variant="arrow" size="md" color="#facc15" />
        </div>
      )}
    </div>
  );
};
