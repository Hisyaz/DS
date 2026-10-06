/**
 * FOOTBALL CAREER SIMULATOR - HAPTIC FEEDBACK & DEVICE UTILITIES
 * Provides native vibration / tactile feedback on mobile devices (iOS / Android)
 * with graceful fallbacks and user setting support.
 */

import { safeGetItem, safeSetItem } from './storageCleaner';

const HAPTICS_ENABLED_KEY = 'bal_haptics_enabled';

class HapticsEngine {
  private isEnabled = true;
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
        const saved = safeGetItem(HAPTICS_ENABLED_KEY);
        if (saved !== null) {
          this.isEnabled = saved === 'true';
        }
      } catch (e) {
        console.warn('Haptics initialization suppressed:', e);
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled && this.isSupported;
  }

  public setIsEnabled(val: boolean): void {
    this.isEnabled = val;
    try {
      safeSetItem(HAPTICS_ENABLED_KEY, String(val));
    } catch {}
  }

  /**
   * Triggers a vibration pattern if supported and enabled.
   */
  private trigger(pattern: number | number[]): void {
    if (!this.isEnabled || !this.isSupported) return;
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Passive suppression for restricted browser contexts
    }
  }

  /**
   * Crisp micro-tap for standard UI buttons and tab switches.
   */
  public lightTap(): void {
    this.trigger(10);
  }

  public buttonPress(): void {
    this.lightTap();
  }

  /**
   * Micro-pulse for keyboard and controller menu selections.
   */
  public selection(): void {
    this.lightTap();
  }

  /**
   * Medium tactile click for card flips, deck adjustments, and decisions.
   */
  public mediumTap(): void {
    this.trigger(22);
  }

  /**
   * Firm impact for penalty meter locks, tackle challenges, and shot power release.
   */
  public firmImpact(): void {
    this.trigger(40);
  }

  /**
   * Success fanfare vibration for goals scored, match wins, and trophies.
   */
  public success(): void {
    this.trigger([18, 35, 30, 45, 75]);
  }

  /**
   * Dramatic heavy rumble for crossbar hits, career injuries, and transfer heartbreaks.
   */
  public heavyRumble(): void {
    this.trigger([60, 45, 80, 50, 110]);
  }

  /**
   * Sparkle buzz for legendary card draws and perk unlocks.
   */
  public perkUnlock(): void {
    this.trigger([15, 25, 15, 25, 20, 30, 70]);
  }

  /**
   * Double buzz for errors or missed chances.
   */
  public errorBuzz(): void {
    this.trigger([50, 40, 50]);
  }
}

export const haptics = new HapticsEngine();
