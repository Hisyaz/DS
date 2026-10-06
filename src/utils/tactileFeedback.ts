/**
 * DRAWSTAR CONSOLE TACTILE FEEDBACK ENGINE
 * Synchronizes procedural Web Audio 8-bit synthetic sound effects
 * with device vibration haptics (navigator.vibrate) for authentic
 * console-grade mobile tactile feel.
 */

import { audioManager } from './audioSystem';
import { haptics } from './hapticsSystem';

export const triggerTactileNav = () => {
  try {
    audioManager.playMenuNav();
    haptics.lightTap();
  } catch {}
};

export const triggerTactileConfirm = () => {
  try {
    audioManager.playMenuConfirm();
    haptics.mediumTap();
  } catch {}
};

export const triggerTactileSuccess = () => {
  try {
    audioManager.playSuccessChime();
    haptics.success();
  } catch {}
};

export const triggerTactileWarning = () => {
  try {
    audioManager.playWhistle();
    haptics.errorBuzz();
  } catch {}
};

export const triggerTactileGraduation = () => {
  try {
    audioManager.playGoalCelebrationChant();
    haptics.perkUnlock();
  } catch {}
};

export const triggerTactileCardFlip = () => {
  try {
    audioManager.playKickSound();
    haptics.mediumTap();
  } catch {}
};
