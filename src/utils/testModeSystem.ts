import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from './storageCleaner';

const STORAGE_KEY = 'FOOTBALL_CAREER_TEST_MODE_V1';
const MAGIC_TOOL_STORAGE_KEY = 'FOOTBALL_CAREER_MAGIC_TOOL_V1';

const listeners = new Set<(val: boolean) => void>();
const magicToolListeners = new Set<(val: boolean) => void>();

export function isTestModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = safeGetItem(STORAGE_KEY);
    return val === 'true'; // Default is false (OFF)
  } catch {
    return false;
  }
}

export function isMagicToolEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Magic tool requires test mode to be active, and is disabled by default
    if (!isTestModeEnabled()) return false;
    const val = safeGetItem(MAGIC_TOOL_STORAGE_KEY);
    return val === 'true'; // Default is false (OFF)
  } catch {
    return false;
  }
}

export function setMagicTool(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(MAGIC_TOOL_STORAGE_KEY, enabled ? 'true' : 'false');
    const effective = enabled && isTestModeEnabled();
    magicToolListeners.forEach((listener) => listener(effective));
  } catch (err) {
    console.warn('Could not persist magic tool state:', err);
  }
}

export function setTestMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      // Activating test mode sets Global Icon Points = 9,999 and Champion Points = 9,999
      try {
        localStorage.setItem('global_icon_points_total', '9999');
        localStorage.setItem('legend_champion_points_total', '9999');
      } catch {}
    }
    listeners.forEach((listener) => listener(enabled));
    // If test mode is turned off, magic tool is effectively inactive
    const effectiveMagic = enabled ? isMagicToolEnabled() : false;
    magicToolListeners.forEach((listener) => listener(effectiveMagic));
  } catch (err) {
    console.warn('Could not persist test mode:', err);
  }
}

export function useTestMode(): { isTestMode: boolean; setTestMode: (val: boolean) => void } {
  const [testMode, setLocalTestMode] = useState<boolean>(() => isTestModeEnabled());

  useEffect(() => {
    const handleUpdate = (val: boolean) => {
      setLocalTestMode(val);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const updateTestMode = useCallback((val: boolean) => {
    setTestMode(val);
  }, []);

  return { isTestMode: testMode, setTestMode: updateTestMode };
}

export function enableMagicToolWithTestMode(): void {
  setTestMode(true);
  setMagicTool(true);
}

export function useMagicTool(): {
  isMagicTool: boolean;
  setMagicTool: (val: boolean) => void;
  enableMagicToolWithTestMode: () => void;
  isTestMode: boolean;
} {
  const { isTestMode } = useTestMode();
  const [magicTool, setLocalMagicTool] = useState<boolean>(() => isMagicToolEnabled());

  useEffect(() => {
    const handleUpdate = (val: boolean) => {
      setLocalMagicTool(val);
    };
    magicToolListeners.add(handleUpdate);
    // sync initially
    setLocalMagicTool(isMagicToolEnabled());
    return () => {
      magicToolListeners.delete(handleUpdate);
    };
  }, [isTestMode]);

  const updateMagicTool = useCallback((val: boolean) => {
    setMagicTool(val);
  }, []);

  const enableWithTestMode = useCallback(() => {
    enableMagicToolWithTestMode();
  }, []);

  return {
    isMagicTool: magicTool && isTestMode,
    setMagicTool: updateMagicTool,
    enableMagicToolWithTestMode: enableWithTestMode,
    isTestMode,
  };
}
