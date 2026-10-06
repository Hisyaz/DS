import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { safeGetItem, safeSetItem } from './storageCleaner';
import { getProfileStorageKey } from './profileSystem';
import { detectDeviceHardware } from './hardwareTierDetector';

export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high_contrast';
export type GraphicQuality = 'performance' | 'balanced' | 'high' | 'high_quality';

export interface GraphicSettings {
  fontSize: FontSizeOption;
  colorblindMode: ColorblindMode;
  quality: GraphicQuality;
  hasChosenInitialQuality?: boolean;
  disableAnimations: boolean;
  disableParticles: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_GRAPHIC_SETTINGS: GraphicSettings = {
  fontSize: 'base', // Maps to 19px - comfortable standard
  colorblindMode: 'none',
  quality: 'balanced',
  hasChosenInitialQuality: false,
  disableAnimations: false,
  disableParticles: false,
  reducedMotion: false,
};

const STORAGE_KEY = 'bal_graphic_settings_v1';
const listeners = new Set<(settings: GraphicSettings) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('drawstar_profile_switched', () => {
    const fresh = getGraphicSettings();
    applyGraphicSettingsToDOM(fresh);
    listeners.forEach((l) => l(fresh));
  });
}

export function getGraphicSettings(): GraphicSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_GRAPHIC_SETTINGS };
  try {
    const key = getProfileStorageKey(STORAGE_KEY);
    const raw = safeGetItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      let quality: GraphicQuality = 'balanced';
      if (parsed.quality === 'performance') {
        quality = 'performance';
      } else if (parsed.quality === 'high' || parsed.quality === 'high_quality') {
        quality = 'high';
      } else if (parsed.quality === 'balanced') {
        quality = 'balanced';
      }

      const isPerf = quality === 'performance';
      const isHigh = quality === 'high';

      return {
        fontSize: ['sm', 'base', 'lg', 'xl'].includes(parsed.fontSize) ? parsed.fontSize : 'base',
        colorblindMode: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'high_contrast'].includes(
          parsed.colorblindMode
        )
          ? parsed.colorblindMode
          : 'none',
        quality,
        hasChosenInitialQuality: Boolean(parsed.hasChosenInitialQuality),
        disableAnimations: isPerf ? true : isHigh ? false : Boolean(parsed.disableAnimations),
        disableParticles: isPerf ? true : isHigh ? false : Boolean(parsed.disableParticles),
        reducedMotion: isPerf ? true : isHigh ? false : Boolean(parsed.reducedMotion),
      };
    } else {
      // Auto-detect if hardware suggests a specific preset
      const hw = detectDeviceHardware();
      const rec = hw.recommendedQuality;
      const quality: GraphicQuality =
        rec === 'performance' ? 'performance' : rec === 'high_quality' || rec === 'high' ? 'high' : 'balanced';
      const isPerf = quality === 'performance';
      const isHigh = quality === 'high';
      return {
        ...DEFAULT_GRAPHIC_SETTINGS,
        quality,
        hasChosenInitialQuality: false,
        disableAnimations: isPerf,
        disableParticles: isPerf,
        reducedMotion: isPerf,
      };
    }
  } catch (err) {
    console.warn('Error reading graphic settings:', err);
  }
  return { ...DEFAULT_GRAPHIC_SETTINGS };
}

export function hasConfiguredInitialQuality(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = getProfileStorageKey(STORAGE_KEY);
    const raw = safeGetItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Boolean(parsed.hasChosenInitialQuality);
    }
  } catch {}
  return false;
}

export function applyGraphicSettingsToDOM(settings: GraphicSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Font Size
  root.setAttribute('data-font-size', settings.fontSize);

  // 2. Colorblind Mode
  root.setAttribute('data-colorblind', settings.colorblindMode);

  // 3. Graphic Quality & Presets
  const isHigh = settings.quality === 'high' || settings.quality === 'high_quality';
  const isPerf = settings.quality === 'performance';
  const qualityValue = isHigh ? 'high' : isPerf ? 'performance' : 'balanced';

  root.setAttribute('data-quality', qualityValue);

  const disableAnimations = isPerf ? true : isHigh ? false : Boolean(settings.disableAnimations);
  const disableParticles = isPerf ? true : isHigh ? false : Boolean(settings.disableParticles);
  const reducedMotion = isPerf ? true : isHigh ? false : Boolean(settings.reducedMotion);

  root.setAttribute('data-disable-animations', String(disableAnimations));
  root.setAttribute('data-disable-particles', String(disableParticles));
  root.setAttribute('data-reduced-motion', String(reducedMotion));

  // Toggle classes for instant GPU styling
  if (isPerf) {
    root.classList.add('perf-mode-active');
    root.classList.add('mode-performance');
    root.classList.remove('quality-high');
    root.classList.remove('high-mode-active');
  } else if (isHigh) {
    root.classList.remove('perf-mode-active');
    root.classList.remove('mode-performance');
    root.classList.add('quality-high');
    root.classList.add('high-mode-active');
  } else {
    root.classList.remove('perf-mode-active');
    root.classList.remove('mode-performance');
    root.classList.remove('quality-high');
    root.classList.remove('high-mode-active');
  }

  // Inject standard Daltonization SVG filters if not present
  if (!document.getElementById('bal-colorblind-svg-filters')) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'bal-colorblind-svg-filters');
    svg.setAttribute('style', 'display: none;');
    svg.innerHTML = `
      <defs>
        <!-- Protanopia (Red-blind) -->
        <filter id="bal-protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
        </filter>
        <!-- Deuteranopia (Green-blind) -->
        <filter id="bal-deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
        </filter>
        <!-- Tritanopia (Blue-blind) -->
        <filter id="bal-tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }
}

export function isPerformanceModeActive(): boolean {
  if (typeof document !== 'undefined') {
    return (
      document.documentElement.getAttribute('data-quality') === 'performance' ||
      document.documentElement.classList.contains('perf-mode-active') ||
      document.documentElement.classList.contains('mode-performance')
    );
  }
  return getGraphicSettings().quality === 'performance';
}

export function isHighQualityModeActive(): boolean {
  if (typeof document !== 'undefined') {
    const q = document.documentElement.getAttribute('data-quality');
    return (
      q === 'high' ||
      q === 'high_quality' ||
      document.documentElement.classList.contains('quality-high') ||
      document.documentElement.classList.contains('high-mode-active')
    );
  }
  const q = getGraphicSettings().quality;
  return q === 'high' || q === 'high_quality';
}

export function isHighQuality(): boolean {
  return isHighQualityModeActive();
}

export function shouldDisableAnimations(): boolean {
  if (typeof document !== 'undefined') {
    return (
      document.documentElement.getAttribute('data-disable-animations') === 'true' ||
      isPerformanceModeActive()
    );
  }
  const s = getGraphicSettings();
  return Boolean(s.disableAnimations || s.quality === 'performance');
}

export function shouldDisableParticles(): boolean {
  if (typeof document !== 'undefined') {
    return (
      document.documentElement.getAttribute('data-disable-particles') === 'true' ||
      isPerformanceModeActive()
    );
  }
  const s = getGraphicSettings();
  return Boolean(s.disableParticles || s.quality === 'performance');
}

export function shouldReduceMotion(): boolean {
  if (typeof document !== 'undefined') {
    return (
      document.documentElement.getAttribute('data-reduced-motion') === 'true' ||
      isPerformanceModeActive()
    );
  }
  const s = getGraphicSettings();
  return Boolean(s.reducedMotion || s.quality === 'performance');
}

export function getConfettiMultiplier(): number {
  if (shouldDisableParticles()) return 0;
  if (isHighQualityModeActive()) return 2.2;
  return 1.0;
}

/**
 * Enhanced celebration particle burst system.
 * Respects performance mode (particles completely disabled),
 * provides standard arcade confetti in balanced mode,
 * and unleashes dense multi-stage metallic sparkles in high quality mode.
 */
export function triggerAppCelebration(opts?: any): void {
  if (shouldDisableParticles()) return;
  try {
    const isHigh = isHighQualityModeActive();
    const mult = isHigh ? 2.2 : 1.0;
    const baseCount = opts?.particleCount || 75;
    const particleCount = Math.round(baseCount * mult);

    const enhancedOpts = {
      ...opts,
      particleCount,
      spread: opts?.spread ? (isHigh ? Math.min(130, Math.round(opts.spread * 1.2)) : opts.spread) : isHigh ? 90 : 70,
      origin: opts?.origin || { y: 0.6 },
      colors:
        opts?.colors ||
        (isHigh
          ? ['#ffd700', '#fbbf24', '#fef08a', '#38bdf8', '#34d399', '#f43f5e', '#ffffff']
          : ['#ffd700', '#38bdf8', '#34d399', '#f43f5e']),
    };

    const runConfetti = (confettiFn: any) => {
      confettiFn(enhancedOpts);
      if (isHigh) {
        // High Quality Mode: secondary staggered metallic sparkle bursts
        setTimeout(() => {
          if (shouldDisableParticles()) return;
          try {
            confettiFn({
              particleCount: Math.round(particleCount * 0.4),
              angle: 55,
              spread: 60,
              origin: { x: 0.15, y: (opts?.origin?.y || 0.6) - 0.05 },
              colors: ['#ffd700', '#fbbf24', '#fef08a', '#ffffff'],
              ticks: 250,
            });
            confettiFn({
              particleCount: Math.round(particleCount * 0.4),
              angle: 125,
              spread: 60,
              origin: { x: 0.85, y: (opts?.origin?.y || 0.6) - 0.05 },
              colors: ['#38bdf8', '#67e8f9', '#a855f7', '#ffffff'],
              ticks: 250,
            });
          } catch {}
        }, 160);
      }
    };

    if (typeof confetti === 'function') {
      runConfetti(confetti);
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      runConfetti((confetti as any).default);
    }
  } catch (err) {
    console.warn('Celebration particles failed:', err);
  }
}

export function setGraphicSettings(newSettings: Partial<GraphicSettings>): GraphicSettings {
  const current = getGraphicSettings();
  const nextQuality = newSettings.quality || current.quality;
  const isPerf = nextQuality === 'performance';
  const isHigh = nextQuality === 'high' || nextQuality === 'high_quality';

  const updated: GraphicSettings = {
    fontSize: newSettings.fontSize || current.fontSize,
    colorblindMode: newSettings.colorblindMode || current.colorblindMode,
    quality: nextQuality,
    hasChosenInitialQuality:
      newSettings.hasChosenInitialQuality !== undefined
        ? newSettings.hasChosenInitialQuality
        : current.hasChosenInitialQuality,
    disableAnimations:
      newSettings.disableAnimations !== undefined
        ? newSettings.disableAnimations
        : isPerf
        ? true
        : isHigh
        ? false
        : current.disableAnimations && current.quality === 'performance'
        ? false
        : Boolean(current.disableAnimations),
    disableParticles:
      newSettings.disableParticles !== undefined
        ? newSettings.disableParticles
        : isPerf
        ? true
        : isHigh
        ? false
        : current.disableParticles && current.quality === 'performance'
        ? false
        : Boolean(current.disableParticles),
    reducedMotion:
      newSettings.reducedMotion !== undefined
        ? newSettings.reducedMotion
        : isPerf
        ? true
        : isHigh
        ? false
        : current.reducedMotion && current.quality === 'performance'
        ? false
        : Boolean(current.reducedMotion),
  };

  try {
    const key = getProfileStorageKey(STORAGE_KEY);
    safeSetItem(key, JSON.stringify(updated));
    applyGraphicSettingsToDOM(updated);
    listeners.forEach((l) => l(updated));
  } catch (err) {
    console.warn('Error saving graphic settings:', err);
  }
  return updated;
}

export function useGraphicSettings(): {
  graphicSettings: GraphicSettings;
  updateGraphicSettings: (partial: Partial<GraphicSettings>) => void;
} {
  const [settings, setSettings] = useState<GraphicSettings>(() => {
    const initial = getGraphicSettings();
    applyGraphicSettingsToDOM(initial);
    return initial;
  });

  useEffect(() => {
    const handleUpdate = (val: GraphicSettings) => {
      setSettings(val);
      applyGraphicSettingsToDOM(val);
    };
    listeners.add(handleUpdate);
    applyGraphicSettingsToDOM(settings);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const updateGraphicSettings = useCallback((partial: Partial<GraphicSettings>) => {
    setGraphicSettings(partial);
  }, []);

  return { graphicSettings: settings, updateGraphicSettings };
}
