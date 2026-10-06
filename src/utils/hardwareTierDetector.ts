/**
 * High-Performance Device & GPU Tier Detector
 * Automatically benchmarks device memory, CPU logical cores, mobile user-agent,
 * and display capabilities to suggest the recommended quality preset.
 */

import { GraphicQuality } from './graphicSettingsSystem';

export interface DeviceHardwareProfile {
  isLowEnd: boolean;
  isHighEnd: boolean;
  isMobile: boolean;
  logicalCores: number;
  deviceMemoryGb?: number;
  prefersReducedMotion: boolean;
  touchCapable: boolean;
  recommendedQuality: GraphicQuality;
  hardwareSummary: string;
}

export function detectDeviceHardware(): DeviceHardwareProfile {
  if (typeof window === 'undefined') {
    return {
      isLowEnd: false,
      isHighEnd: false,
      isMobile: false,
      logicalCores: 8,
      deviceMemoryGb: 8,
      prefersReducedMotion: false,
      touchCapable: false,
      recommendedQuality: 'balanced',
      hardwareSummary: 'Standard PC / Web Environment',
    };
  }

  const nav = navigator as any;
  const logicalCores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
  const deviceMemoryGb = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined;

  // Touch & Mobile detection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 820;

  const touchCapable =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    Boolean((nav as any).msMaxTouchPoints);

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Low-end conditions:
  // 1. Device memory reported under 4GB
  // 2. Budget CPU (<= 4 cores) on mobile device
  // 3. User explicitly requested reduced motion
  const isLowEnd = Boolean(
    prefersReducedMotion ||
      (typeof deviceMemoryGb === 'number' && deviceMemoryGb <= 3) ||
      (isMobile && logicalCores <= 4)
  );

  // High-end conditions:
  // 1. Desktop or flagship mobile with >= 8 cores
  // 2. >= 8 GB RAM if reported
  const isHighEnd = Boolean(
    !prefersReducedMotion &&
      logicalCores >= 8 &&
      (deviceMemoryGb === undefined || deviceMemoryGb >= 8)
  );

  let recommendedQuality: GraphicQuality = 'balanced';
  if (isLowEnd) {
    recommendedQuality = 'performance';
  } else if (isHighEnd) {
    recommendedQuality = 'high_quality';
  }

  // Friendly non-intrusive hardware summary
  let hardwareSummary = '';
  if (isMobile) {
    hardwareSummary = `${logicalCores}-Core Mobile Device${deviceMemoryGb ? ` • ~${deviceMemoryGb}GB RAM` : ''}`;
  } else {
    hardwareSummary = `${logicalCores}-Core Desktop/Laptop${deviceMemoryGb ? ` • ~${deviceMemoryGb}GB RAM` : ''}`;
  }

  return {
    isLowEnd,
    isHighEnd,
    isMobile,
    logicalCores,
    deviceMemoryGb,
    prefersReducedMotion,
    touchCapable,
    recommendedQuality,
    hardwareSummary,
  };
}
