import { useEffect, useRef, useCallback } from 'react';

interface EditorControlsOptions {
  onPrevSection?: () => void;
  onNextSection?: () => void;
  onBack?: () => void;
  onConfirm?: () => void;
  onSave?: () => void;
  enabled?: boolean;
}

export function useEditorControls({
  onPrevSection,
  onNextSection,
  onBack,
  onConfirm,
  onSave,
  enabled = true,
}: EditorControlsOptions) {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastGamepadActionTimeRef = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if typing in an input, textarea, or select
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Save shortcut (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      if (isInput) return;

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onBack?.();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'q' || e.key === 'PageUp') {
        e.preventDefault();
        onPrevSection?.();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'e' || e.key === 'PageDown') {
        e.preventDefault();
        onNextSection?.();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Trigger confirm only if not directly on a button (which handles Enter naturally)
        if (target?.tagName !== 'BUTTON') {
          e.preventDefault();
          onConfirm?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onPrevSection, onNextSection, onBack, onConfirm, onSave]);

  // Touch Swipe navigation (Mobile & Tablet)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || touchStartXRef.current === null || touchStartYRef.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = touchEndY - touchStartYRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      // Ensure horizontal swipe is dominant and exceeds threshold
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          // Swiped left -> Go to next section
          onNextSection?.();
        } else {
          // Swiped right -> Go to prev section
          onPrevSection?.();
        }
      }
    },
    [enabled, onNextSection, onPrevSection]
  );

  // Gamepad API Polling (Console / Controller support)
  useEffect(() => {
    if (!enabled) return;
    let animFrameId: number;

    const pollGamepads = () => {
      const now = Date.now();
      // Throttle gamepad actions so one press doesn't fire 60 times/sec
      if (now - lastGamepadActionTimeRef.current > 250) {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of gamepads) {
          if (!gp) continue;

          // LB (Shoulder Left) or D-Pad Left
          const isLB = gp.buttons[4]?.pressed;
          const isDpadLeft = gp.buttons[14]?.pressed;
          // RB (Shoulder Right) or D-Pad Right
          const isRB = gp.buttons[5]?.pressed;
          const isDpadRight = gp.buttons[15]?.pressed;
          // B button (Button 1: Return/Back)
          const isB = gp.buttons[1]?.pressed;
          // A button (Button 0: Select/Confirm)
          const isA = gp.buttons[0]?.pressed;
          // Y button (Button 3) or X button (Button 2): Save
          const isY = gp.buttons[3]?.pressed || gp.buttons[2]?.pressed;

          if (isLB || isDpadLeft) {
            lastGamepadActionTimeRef.current = now;
            onPrevSection?.();
            break;
          } else if (isRB || isDpadRight) {
            lastGamepadActionTimeRef.current = now;
            onNextSection?.();
            break;
          } else if (isB) {
            lastGamepadActionTimeRef.current = now;
            onBack?.();
            break;
          } else if (isY) {
            lastGamepadActionTimeRef.current = now;
            onSave?.();
            break;
          } else if (isA) {
            lastGamepadActionTimeRef.current = now;
            onConfirm?.();
            break;
          }
        }
      }
      animFrameId = requestAnimationFrame(pollGamepads);
    };

    animFrameId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animFrameId);
  }, [enabled, onPrevSection, onNextSection, onBack, onConfirm, onSave]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}
