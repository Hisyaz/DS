// Game-Wide Console & Keyboard Navigation Engine
// Authentic 32-Bit Pixel-Art Navigation across Desktop, Mobile, and Gamepad
// Arrow Keys / Gamepad D-Pad & Stick for 2D spatial movement, Spacebar / Enter for selection

import { audioManager } from './audioSystem';
import { haptics } from './hapticsSystem';

let isNavSystemActive = true;
try {
  const saved = localStorage.getItem('drawstar_keyboard_nav_enabled');
  if (saved !== null) {
    isNavSystemActive = saved === 'true';
  }
} catch {}

export function isGameNavEnabled(): boolean {
  return isNavSystemActive;
}

export function setGameNavEnabled(enabled: boolean): void {
  isNavSystemActive = enabled;
  try {
    localStorage.setItem('drawstar_keyboard_nav_enabled', String(enabled));
  } catch {}
  if (!enabled) {
    document.querySelectorAll('[data-pixel-focused="true"]').forEach((el) => {
      el.removeAttribute('data-pixel-focused');
    });
  }
  window.dispatchEvent(new CustomEvent('drawstar:nav-toggle', { detail: { enabled } }));
}

export function toggleGameNav(): boolean {
  setGameNavEnabled(!isNavSystemActive);
  return isNavSystemActive;
}

export function setupGameNavigation(): () => void {
  const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
    '[role="checkbox"]:not([aria-disabled="true"])',
    '[role="radio"]:not([aria-disabled="true"])',
    '[role="option"]:not([aria-disabled="true"])',
    '[role="menuitem"]:not([aria-disabled="true"])',
    '[data-nav-item]',
    '[data-selectable="true"]',
  ].join(', ');

  let lastNavElement: HTMLElement | null = null;

  /**
   * Remove pixel focus from all elements
   */
  const clearAllPixelFocus = () => {
    const focused = document.querySelectorAll('[data-pixel-focused="true"]');
    for (let i = 0; i < focused.length; i++) {
      focused[i].removeAttribute('data-pixel-focused');
    }
  };

  /**
   * Rigorous check ensuring element is selectable and NOT disabled
   */
  const isSelectable = (el: HTMLElement | null): boolean => {
    if (!el) return false;

    // Disabled attributes
    if (el.hasAttribute('disabled') || (el as HTMLButtonElement).disabled === true) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    if (el.getAttribute('data-disabled') === 'true') return false;
    if (el.closest('fieldset[disabled]')) return false;

    // Disabled classes
    if (el.classList.contains('pointer-events-none')) return false;
    if (el.classList.contains('cursor-not-allowed')) return false;

    // Visibility checks
    if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (style.pointerEvents === 'none') return false;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    return true;
  };

  /**
   * Identify active modal/dialog scope or default to document
   */
  const getActiveScope = (): HTMLElement => {
    const dialogs = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[role="dialog"], [aria-modal="true"], .fixed.inset-0:not(.pointer-events-none)'
      )
    );

    const visibleDialogs = dialogs.filter((d) => {
      if (!isSelectable(d) && d.offsetWidth === 0 && d.offsetHeight === 0) return false;
      const selectables = d.querySelectorAll(FOCUSABLE_SELECTOR);
      return selectables.length > 0;
    });

    if (visibleDialogs.length > 0) {
      return visibleDialogs[visibleDialogs.length - 1];
    }

    return document.body;
  };

  /**
   * Retrieve all selectable interactive elements within the active scope,
   * pruning non-interactive parent wrappers if their children are buttons
   */
  const getFocusableElements = (): HTMLElement[] => {
    const scope = getActiveScope();
    const rawElements = Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const valid = rawElements.filter(isSelectable);

    // De-duplicate nested containers: if candidate A contains candidate B,
    // and candidate B is an interactive button/input/link, drop candidate A
    const filtered = valid.filter((cand) => {
      const hasInteractiveChild = valid.some(
        (other) => other !== cand && cand.contains(other)
      );
      if (hasInteractiveChild && (cand.tagName === 'DIV' || cand.tagName === 'SECTION')) {
        return false;
      }
      return true;
    });

    return filtered;
  };

  /**
   * Automatically find the primary/default action when entering a new screen or modal
   */
  const getLogicalPrimaryElement = (scope: HTMLElement, candidates: HTMLElement[]): HTMLElement | null => {
    if (candidates.length === 0) return null;

    // 1. Explicit primary action data attributes
    const autoFocusEl = scope.querySelector<HTMLElement>('[data-autofocus="true"]:not([disabled])');
    if (autoFocusEl && isSelectable(autoFocusEl)) return autoFocusEl;

    const primaryActionEl = scope.querySelector<HTMLElement>('[data-primary-action="true"]:not([disabled])');
    if (primaryActionEl && isSelectable(primaryActionEl)) return primaryActionEl;

    // 2. Notable primary action button IDs
    const priorityIds = [
      'career-hub-primary-simulation-button',
      'career-hub-main-sim-action',
      'unique-career-continue-btn',
      'main-menu-unique-career-pixel-btn',
      'main-menu-legend-button',
      'main-menu-collection-card-btn',
      'main-menu-store-card-btn',
      'character-create-proceed-btn',
      'youth-next-action-btn',
      'match-action-continue-btn',
    ];

    for (const id of priorityIds) {
      const el = document.getElementById(id);
      if (el && isSelectable(el) && candidates.includes(el)) {
        return el;
      }
    }

    // 3. Primary action button text matching (Continue, Confirm, Select, Start, Play, Next)
    const primaryKeywords = [
      'continue',
      'confirm',
      'select',
      'start',
      'resume',
      'play',
      'next',
      'proceed',
      'accept',
      'enter',
    ];

    const textMatch = candidates.find((el) => {
      const txt = (el.textContent || '').trim().toLowerCase();
      return primaryKeywords.some((kw) => txt.includes(kw));
    });
    if (textMatch) return textMatch;

    // 4. Prominent styling colors (emerald, amber, gold)
    const colorMatch = candidates.find((el) => {
      const cls = el.className || '';
      return (
        cls.includes('bg-emerald') ||
        cls.includes('bg-amber') ||
        cls.includes('pixel-bevel-raised') ||
        cls.includes('pixel-bevel-gold')
      );
    });
    if (colorMatch) return colorMatch;

    // 5. Default fallback to first selectable candidate
    return candidates[0];
  };

  /**
   * Apply 32-bit pixel focus to target element instantly
   */
  const applyFocus = (target: HTMLElement, playAudio = true) => {
    if (!isSelectable(target)) return;

    clearAllPixelFocus();
    target.setAttribute('data-pixel-focused', 'true');
    target.focus({ preventScroll: true });
    lastNavElement = target;

    // Only scroll into view if target is outside visible window bounds
    const rect = target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight || rect.left < 0 || rect.right > window.innerWidth) {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    }

    if (playAudio) {
      audioManager.playMenuNav();
    }

    // Broadcast event for custom overlays
    window.dispatchEvent(new CustomEvent('drawstar:focus-changed', { detail: { target } }));
  };

  /**
   * Ensure screen has active focus on entry
   */
  const ensureInitialFocus = (playAudio = false) => {
    const scope = getActiveScope();
    const candidates = getFocusableElements();
    if (candidates.length === 0) return;

    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl && isSelectable(activeEl) && candidates.includes(activeEl)) {
      clearAllPixelFocus();
      activeEl.setAttribute('data-pixel-focused', 'true');
      lastNavElement = activeEl;
      return;
    }

    const primary = getLogicalPrimaryElement(scope, candidates);
    if (primary) {
      applyFocus(primary, playAudio);
    }
  };

  /**
   * Spatial 2D Navigation Engine with Row/Column alignment & Natural Wrapping
   */
  const findSpatialTarget = (
    current: HTMLElement,
    candidates: HTMLElement[],
    direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  ): HTMLElement | null => {
    const curRect = current.getBoundingClientRect();
    const curCenter = {
      x: curRect.left + curRect.width / 2,
      y: curRect.top + curRect.height / 2,
    };

    const isHorizontal = direction === 'ArrowLeft' || direction === 'ArrowRight';

    // 1. HORIZONTAL ROW / CAROUSEL SIBLING CHECK
    if (isHorizontal) {
      const rowBandCandidates = candidates.filter((cand) => {
        if (cand === current) return false;
        const r = cand.getBoundingClientRect();
        const candCenterY = r.top + r.height / 2;
        const yDiff = Math.abs(candCenterY - curCenter.y);
        const yOverlap = Math.min(curRect.bottom, r.bottom) - Math.max(curRect.top, r.top);
        return yDiff < Math.max(26, curRect.height * 0.6) || yOverlap > 8;
      });

      if (rowBandCandidates.length > 0) {
        if (direction === 'ArrowRight') {
          const rights = rowBandCandidates
            .filter((c) => c.getBoundingClientRect().left >= curRect.left + 4)
            .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
          if (rights.length > 0) {
            return rights[0];
          }
          const leftmostInRow = rowBandCandidates.sort(
            (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left
          )[0];
          if (leftmostInRow && leftmostInRow !== current) {
            return leftmostInRow;
          }
        } else {
          // ArrowLeft
          const lefts = rowBandCandidates
            .filter((c) => c.getBoundingClientRect().right <= curRect.right - 4)
            .sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
          if (lefts.length > 0) {
            return lefts[0];
          }
          const rightmostInRow = rowBandCandidates.sort(
            (a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right
          )[0];
          if (rightmostInRow && rightmostInRow !== current) {
            return rightmostInRow;
          }
        }
      }
    }

    // 2. VERTICAL COLUMN SIBLING CHECK
    if (!isHorizontal) {
      const colBandCandidates = candidates.filter((cand) => {
        if (cand === current) return false;
        const r = cand.getBoundingClientRect();
        const candCenterX = r.left + r.width / 2;
        const xDiff = Math.abs(candCenterX - curCenter.x);
        const xOverlap = Math.min(curRect.right, r.right) - Math.max(curRect.left, r.left);
        return xDiff < Math.max(36, curRect.width * 0.6) || xOverlap > 8;
      });

      if (colBandCandidates.length > 0) {
        if (direction === 'ArrowDown') {
          const belows = colBandCandidates
            .filter((c) => c.getBoundingClientRect().top >= curRect.top + 4)
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
          if (belows.length > 0) {
            return belows[0];
          }
        } else {
          // ArrowUp
          const aboves = colBandCandidates
            .filter((c) => c.getBoundingClientRect().bottom <= curRect.bottom - 4)
            .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
          if (aboves.length > 0) {
            return aboves[0];
          }
        }
      }
    }

    // 3. GENERAL 2D EUCLIDEAN + CONE SCORING
    let bestElement: HTMLElement | null = null;
    let minScore = Infinity;

    for (const cand of candidates) {
      if (cand === current) continue;
      const r = cand.getBoundingClientRect();
      const candCenter = {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      };

      const dx = candCenter.x - curCenter.x;
      const dy = candCenter.y - curCenter.y;

      let isInDirection = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      switch (direction) {
        case 'ArrowUp':
          isInDirection = dy < -6;
          primaryDist = -dy;
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowDown':
          isInDirection = dy > 6;
          primaryDist = dy;
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowLeft':
          isInDirection = dx < -6;
          primaryDist = -dx;
          secondaryDist = Math.abs(dy);
          break;
        case 'ArrowRight':
          isInDirection = dx > 6;
          primaryDist = dx;
          secondaryDist = Math.abs(dy);
          break;
      }

      if (isInDirection) {
        const score = primaryDist + secondaryDist * 1.8;
        if (score < minScore) {
          minScore = score;
          bestElement = cand;
        }
      }
    }

    if (bestElement) return bestElement;

    // 4. GLOBAL MENU BOUNDARY WRAPPING FALLBACK
    if (direction === 'ArrowDown') {
      return candidates.slice().sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    } else if (direction === 'ArrowUp') {
      return candidates.slice().sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0];
    } else if (direction === 'ArrowRight') {
      return candidates.slice().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
    } else if (direction === 'ArrowLeft') {
      return candidates.slice().sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)[0];
    }

    return null;
  };

  /**
   * Execute directional step
   */
  const navigateInDirection = (direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    const candidates = getFocusableElements();
    if (candidates.length === 0) return;

    let activeEl = document.activeElement as HTMLElement | null;
    if (!activeEl || !candidates.includes(activeEl)) {
      if (lastNavElement && candidates.includes(lastNavElement) && isSelectable(lastNavElement)) {
        activeEl = lastNavElement;
      } else {
        ensureInitialFocus(true);
        return;
      }
    }

    const target = findSpatialTarget(activeEl, candidates, direction);
    if (target) {
      applyFocus(target, true);
    }
  };

  /**
   * Spacebar or Enter activation handler
   */
  const handleSelect = (e: KeyboardEvent) => {
    let targetEl = (document.activeElement as HTMLElement | null) || lastNavElement;
    const candidates = getFocusableElements();

    if (!targetEl || targetEl === document.body || !candidates.includes(targetEl)) {
      const primary = getLogicalPrimaryElement(getActiveScope(), candidates);
      if (primary) {
        applyFocus(primary, false);
        targetEl = primary;
      } else {
        return;
      }
    }

    if (!isSelectable(targetEl)) {
      return;
    }

    e.preventDefault();

    // Visual tactile press effect
    targetEl.setAttribute('data-pixel-pressed', 'true');
    setTimeout(() => {
      targetEl?.removeAttribute('data-pixel-pressed');
    }, 120);

    // Audio & Haptic feedback
    audioManager.playMenuConfirm();
    haptics.selection();

    // Trigger activation
    targetEl.click();

    // Support checkbox & radio toggles
    if (targetEl.tagName === 'INPUT') {
      const input = targetEl as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  /**
   * Check if user is actively interacting with an editable text field
   */
  const isTypingActive = (e: KeyboardEvent): boolean => {
    const active = document.activeElement as HTMLElement | null;
    const target = e.target as HTMLElement | null;

    const isTextInput = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') return true;
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return true;
      return false;
    };

    return isTextInput(active) || isTextInput(target);
  };

  /**
   * Global Keyboard Event Listener:
   * Only Arrow keys & Spacebar/Enter, completely passive when typing or when navigation disabled.
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isNavSystemActive) return;

    // Never intercept typing in forms or text fields
    if (isTypingActive(e)) return;

    // Never intercept browser/system shortcut keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const key = e.key;

    // Spacebar or Enter activation
    if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
      handleSelect(e);
      return;
    }

    // Directional Navigation (Strictly Arrows - no hijacking WASD for normal typing)
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      navigateInDirection(key);
    }
  };

  /**
   * Instant Mouse Hover Synchronization:
   * Moves the pixel highlight seamlessly to whichever button the user hovers,
   * so mouse and keyboard never fight or get stuck.
   */
  const handlePointerOver = (e: PointerEvent) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(FOCUSABLE_SELECTOR);
    if (target && isSelectable(target)) {
      clearAllPixelFocus();
      target.setAttribute('data-pixel-focused', 'true');
      lastNavElement = target;
    }
  };

  const handlePointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) {
      clearAllPixelFocus();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    // If clicking on an input or textarea, clear the yellow selector immediately
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('input, textarea'))) {
      clearAllPixelFocus();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('pointerover', handlePointerOver, { passive: true });
  document.addEventListener('pointerout', handlePointerOut, { passive: true });
  document.addEventListener('mousedown', handleMouseDown, { passive: true });

  // ==========================================
  // GAMEPAD / CONTROLLER NAVIGATION POLLING
  // ==========================================
  let isRunning = true;
  let rafId: number | null = null;
  let lastActionTime = 0;
  const ACTION_DEBOUNCE_MS = 180;

  const pollGamepad = (time: number) => {
    if (!isRunning || !isNavSystemActive) return;

    if (time - lastActionTime > ACTION_DEBOUNCE_MS) {
      try {
        const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (!gp || !gp.connected) continue;

          // D-Pad or Left Stick
          const dpadUp = gp.buttons[12]?.pressed;
          const dpadDown = gp.buttons[13]?.pressed;
          const dpadLeft = gp.buttons[14]?.pressed;
          const dpadRight = gp.buttons[15]?.pressed;

          const stickX = gp.axes[0] || 0;
          const stickY = gp.axes[1] || 0;

          if (dpadUp || stickY < -0.55) {
            navigateInDirection('ArrowUp');
            lastActionTime = time;
            break;
          } else if (dpadDown || stickY > 0.55) {
            navigateInDirection('ArrowDown');
            lastActionTime = time;
            break;
          } else if (dpadLeft || stickX < -0.55) {
            navigateInDirection('ArrowLeft');
            lastActionTime = time;
            break;
          } else if (dpadRight || stickX > 0.55) {
            navigateInDirection('ArrowRight');
            lastActionTime = time;
            break;
          }

          // A / Cross Button (Button 0) - Select / Confirm
          if (gp.buttons[0]?.pressed) {
            const simulatedEvent = new KeyboardEvent('keydown', { key: ' ' });
            handleSelect(simulatedEvent);
            lastActionTime = time;
            break;
          }

          // B / Circle Button (Button 1) - Back / Cancel
          if (gp.buttons[1]?.pressed) {
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
            window.dispatchEvent(escEvent);
            lastActionTime = time;
            break;
          }

          // L1 / R1 Bumpers (Buttons 4 & 5) - Cycle Tabs
          if (gp.buttons[4]?.pressed || gp.buttons[5]?.pressed) {
            const tabs = Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')).filter(
              isSelectable
            );
            if (tabs.length > 1) {
              const activeIndex = tabs.findIndex(
                (t) => t.getAttribute('aria-selected') === 'true' || t === document.activeElement
              );
              const step = gp.buttons[5]?.pressed ? 1 : -1;
              const nextIndex = (activeIndex + step + tabs.length) % tabs.length;
              applyFocus(tabs[nextIndex], true);
              tabs[nextIndex].click();
            }
            lastActionTime = time;
            break;
          }
        }
      } catch {}
    }

    rafId = requestAnimationFrame(pollGamepad);
  };

  rafId = requestAnimationFrame(pollGamepad);

  return () => {
    isRunning = false;
    clearAllPixelFocus();
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('pointerover', handlePointerOver);
    document.removeEventListener('pointerout', handlePointerOut);
    document.removeEventListener('mousedown', handleMouseDown);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}
