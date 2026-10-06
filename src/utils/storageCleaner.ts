/**
 * Storage cleaner and resilient storage manager to prevent LocalStorage QuotaExceeded and Security errors.
 */

export function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null) {
      // Test read to ensure no SecurityError in restricted iframe
      const test = window.localStorage.getItem('__storage_test__');
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

const OBSOLETE_KEYS = [
  'FOOTBALL_CAREER_LEAGUE_DB_V1',
  'FOOTBALL_CAREER_LEAGUE_DB_V2',
  'FOOTBALL_CAREER_LEAGUE_DB_V3',
  'FOOTBALL_CAREER_LEAGUE_DB_V4',
  'FOOTBALL_CAREER_LEAGUE_DB_V5',
  'FOOTBALL_CAREER_LEAGUE_DB_V6',
  'FOOTBALL_CAREER_LEAGUE_DB',
  'FOOTBALL_CAREER_NATIONAL_TEAMS_DB_V1',
  'FOOTBALL_CAREER_NATIONAL_TEAMS_DB',
  'footballer_career_global_competitions_v1',
  'footballer_career_global_competitions_v2',
  'footballer_career_global_competitions_v3',
  'footballer_career_global_competitions',
  'football_career_continue_save_v1',
  'football_career_autosave_v1',
  'footballer_crash_reports_v1',
  'footballer_custom_cards',
  'FOOTBALL_CAREER_CRASH_REPORTS_V1',
];

/**
 * Cleans up legacy, outdated, and unneeded keys from LocalStorage to reclaim space.
 */
export function cleanupLegacyStorageKeys(): void {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return;

    OBSOLETE_KEYS.forEach((k) => {
      try {
        storage.removeItem(k);
      } catch {
        // ignore
      }
    });

    // Scan for any legacy prefixed keys that are no longer used
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      if (
        (key.startsWith('FOOTBALL_CAREER_LEAGUE_DB_V') && key !== 'FOOTBALL_CAREER_LEAGUE_DB_V7') ||
        (key.startsWith('FOOTBALL_CAREER_NATIONAL_TEAMS_DB_V') && key !== 'FOOTBALL_CAREER_NATIONAL_TEAMS_DB_V2') ||
        (key.startsWith('footballer_career_global_competitions_v') && key !== 'footballer_career_global_competitions_v3_5')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => {
      try {
        storage.removeItem(k);
      } catch {
        // ignore
      }
    });
  } catch (err) {
    console.warn('Storage cleanup encountered an error:', err);
  }
}

/**
 * Aggressively purges non-essential volatile simulation caches and old tournament data
 * when storage quota pressure occurs, protecting critical player save slots from eviction.
 */
export function evictStaleSimulationCaches(): void {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return;

    // 1. Run basic legacy removal
    cleanupLegacyStorageKeys();

    // 2. Clear crash reports and non-essential logs
    storage.removeItem('FOOTBALL_CAREER_CRASH_REPORTS_V1');
    storage.removeItem('footballer_crash_reports_v1');

    // 3. Find simulation state keys and prune all but the single most recent one
    const simKeys: string[] = [];
    const continentalKeys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.startsWith('WORLD_SIMULATION_STATE_ACTIVE_V3_')) {
        simKeys.push(key);
      } else if (
        key.startsWith('CONTINENTAL_TOURNAMENT_STATE_') ||
        key.startsWith('CONTINENTAL_SUPERCUP_STATE_')
      ) {
        continentalKeys.push(key);
      }
    }

    // Sort simulation keys to keep only the newest one, prune older completed seasons
    if (simKeys.length > 1) {
      simKeys.sort(); // Lexicographical sort on season year
      const toRemove = simKeys.slice(0, simKeys.length - 1);
      toRemove.forEach((k) => {
        try {
          storage.removeItem(k);
        } catch {
          // ignore
        }
      });
    }

    // Prune continental tournament states from past years
    if (continentalKeys.length > 2) {
      continentalKeys.slice(0, continentalKeys.length - 2).forEach((k) => {
        try {
          storage.removeItem(k);
        } catch {
          // ignore
        }
      });
    }
  } catch (err) {
    console.warn('Error during stale cache eviction:', err);
  }
}

/**
 * Safely reads from LocalStorage.
 */
export function safeGetItem(key: string): string | null {
  try {
    const storage = getSafeLocalStorage();
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

/**
 * Safely removes from LocalStorage.
 */
export function safeRemoveItem(key: string): void {
  try {
    const storage = getSafeLocalStorage();
    if (storage) storage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Safely writes to LocalStorage with automatic legacy cleanup and quota retry.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014 ||
        err.message?.includes('quota') ||
        err.message?.includes('exceeded'));

    if (isQuotaError) {
      console.warn(`LocalStorage quota exceeded while saving key "${key}". Running aggressive cache eviction and retrying...`);
      // Run deep cache eviction
      evictStaleSimulationCaches();

      try {
        const storage = getSafeLocalStorage();
        if (storage) {
          storage.setItem(key, value);
          return true;
        }
      } catch (retryErr) {
        console.warn(`Retry failed for "${key}". Data will remain safely in memory and IndexedDB tier for this session.`, retryErr);
        return false;
      }
    }

    console.warn(`Failed to save key "${key}" to LocalStorage:`, err);
    return false;
  }
}

/**
 * Unified, crash-resistant file download/export utility.
 * - On Mobile (iOS / Android): Prefers the native Web Share API (navigator.share)
 *   so users can directly tap "Save to Files", "Google Drive", or AirDrop without
 *   crashing WebKit or failing inside sandboxed iframes.
 * - On Desktop / Fallback: Creates a Blob URL and triggers anchor download,
 *   with a 60-second delayed revokeObjectURL to completely avoid the mobile
 *   WebKitBlobResource crash caused by premature synchronous revocation.
 */
export async function safeDownloadBlob(
  blob: Blob,
  fileName: string,
  options?: {
    shareTitle?: string;
    shareText?: string;
  }
): Promise<{ success: boolean; method: 'share' | 'download' | 'cancelled' | 'error' }> {
  try {
    // 1. Mobile Native Web Share API: Native saving to iOS Files / Android Downloads / Drive
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: options?.shareTitle || fileName,
            text: options?.shareText || `Save file: ${fileName}`,
          });
          return { success: true, method: 'share' };
        }
      } catch (shareErr: any) {
        // User dismissed the native share dialog (e.g. tapped cancel) - handle gracefully
        if (
          shareErr &&
          (shareErr.name === 'AbortError' ||
            shareErr.message?.includes('abort') ||
            shareErr.message?.includes('cancel'))
        ) {
          return { success: true, method: 'cancelled' };
        }
        console.warn('Native Web Share failed or declined, falling back to anchor download:', shareErr);
      }
    }

    // 2. Safe Anchor Download with Delayed Revocation
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.target = '_self';
    anchor.style.display = 'none';
    anchor.setAttribute('aria-hidden', 'true');

    document.body.appendChild(anchor);
    anchor.click();

    // Delay revocation by 60 seconds: Crucial for mobile WebKit to finish streaming the blob!
    setTimeout(() => {
      try {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 60000);

    return { success: true, method: 'download' };
  } catch (err) {
    console.error('Safe download encountered an error:', err);
    return { success: false, method: 'error' };
  }
}

// Safely schedule cleanup without throwing on module load
try {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      try {
        cleanupLegacyStorageKeys();
      } catch {}
    }, 100);
  }
} catch {}

