// 32-Bit Web Haptic Feedback Utility
export const triggerHaptic = (duration: number = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
};
