/**
 * HAPTICS MANAGER
 * Native device tactile feedback engine using navigator.vibrate with safe fallbacks,
 * persistence, and custom vibration envelopes for mobile console gameplay.
 */

import { safeGetItem, safeSetItem } from './storageCleaner';

const HAPTICS_KEY = 'bal_haptics_enabled';

class HapticsManager {
  private isEnabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
        const saved = safeGetItem(HAPTICS_KEY);
        if (saved !== null) {
          this.isEnabled = saved === 'true';
        }
      } catch {
        this.isSupported = false;
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled && this.isSupported;
  }

  public setIsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      safeSetItem(HAPTICS_KEY, String(enabled));
    } catch {}
  }

  public vibrate(pattern: number | number[]): void {
    if (!this.isEnabled || !this.isSupported) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Passive suppression for restricted browser contexts / iframe constraints
    }
  }

  /**
   * 10ms subtle tick for menu navigation, tab switches, and cursor movement.
   */
  public hapticLight(): void {
    this.vibrate(10);
  }

  /**
   * 22ms distinct tactile click for card selection, decision button presses.
   */
  public hapticMedium(): void {
    this.vibrate(22);
  }

  /**
   * Multi-burst vibration for trophy unlocks, goals, pro contract signing.
   */
  public hapticSuccess(): void {
    this.vibrate([18, 35, 30, 45, 75]);
  }

  /**
   * Double buzz for disciplinary alerts, card rejections, or warnings.
   */
  public hapticWarning(): void {
    this.vibrate([50, 40, 50]);
  }

  /**
   * Fanfare pulse for Youth-to-Pro Academy Graduation.
   */
  public hapticGraduation(): void {
    this.vibrate([15, 25, 15, 25, 20, 30, 70]);
  }
}

export const hapticsManager = new HapticsManager();

export const hapticLight = () => hapticsManager.hapticLight();
export const hapticMedium = () => hapticsManager.hapticMedium();
export const hapticSuccess = () => hapticsManager.hapticSuccess();
export const hapticWarning = () => hapticsManager.hapticWarning();
export const hapticGraduation = () => hapticsManager.hapticGraduation();
