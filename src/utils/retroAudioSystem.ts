/**
 * RETRO AUDIO & HAPTIC CONSOLE SYSTEM
 * Synchronizes procedural Web Audio 8-bit synthetic chiptune sound effects
 * with device vibration haptics (navigator.vibrate) for an authentic
 * handheld console tactile feel.
 */

import { audioManager } from './audioSystem';
import { hapticsManager, hapticLight, hapticMedium, hapticSuccess, hapticWarning, hapticGraduation } from './hapticsManager';

export const play8BitNav = () => {
  try {
    audioManager.playMenuNav();
    hapticLight();
  } catch {}
};

export const play8BitConfirm = () => {
  try {
    audioManager.playMenuConfirm();
    hapticMedium();
  } catch {}
};

export const play8BitSuccess = () => {
  try {
    audioManager.playSuccessChime();
    hapticSuccess();
  } catch {}
};

export const play8BitWarning = () => {
  try {
    audioManager.playFailBuzz();
    hapticWarning();
  } catch {}
};

export const play8BitCardFlip = () => {
  try {
    audioManager.playCardFlipSound();
    hapticMedium();
  } catch {}
};

export const play8BitGraduationFanfare = () => {
  try {
    audioManager.playGoalCelebrationChant();
    hapticGraduation();
  } catch {}
};

export const play8BitTacticalStinger = () => {
  try {
    audioManager.playTacticalChoiceStinger();
    hapticMedium();
  } catch {}
};

export {
  hapticsManager,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticWarning,
  hapticGraduation,
};
