import { UserProfile, ProfileAvatarColor, ProfileExportData } from '../types/profile';
import { safeGetItem, safeSetItem, safeRemoveItem, safeDownloadBlob } from './storageCleaner';
import { setStoredLanguage, getStoredLanguage, LanguageCode } from './localizationSystem';
import { loadBuiltinLanguagePacket } from './languagePacketSystem';
import { useState, useEffect, useCallback } from 'react';

export const PROFILES_REGISTRY_KEY = 'drawstar_user_profiles_v1';
export const ACTIVE_PROFILE_ID_KEY = 'drawstar_active_profile_id_v1';

// In-memory cache - hoisted with var to prevent TDZ during circular localizationSystem imports
var cachedProfiles: UserProfile[] | null = null;
var cachedActiveProfileId: string | null = null;

// Subscribers
type ProfileListener = (activeProfile: UserProfile | null, allProfiles: UserProfile[]) => void;
const profileListeners = new Set<ProfileListener>();

function notifyListeners(): void {
  const active = getActiveProfile();
  const all = getAllProfiles();
  profileListeners.forEach((listener) => {
    try {
      listener(active, all);
    } catch (e) {
      console.warn('Profile listener error:', e);
    }
  });
}

/**
 * Returns the active profile ID, or null if no profile has been selected.
 */
export function getActiveProfileId(): string | null {
  if (cachedActiveProfileId !== null) {
    return cachedActiveProfileId;
  }
  try {
    const raw = safeGetItem(ACTIVE_PROFILE_ID_KEY);
    if (raw && raw.trim().length > 0) {
      cachedActiveProfileId = raw.trim();
      return cachedActiveProfileId;
    }
  } catch (err) {
    console.warn('Error reading active profile ID:', err);
  }
  return null;
}

/**
 * Returns a storage key prefixed with active profile ID if one is active.
 */
export function getProfileStorageKey(baseKey: string, specificProfileId?: string): string {
  const profileId = specificProfileId || getActiveProfileId();
  if (!profileId) return baseKey;
  return `prof_${profileId}_${baseKey}`;
}

/**
 * Retrieves all registered user profiles from persistent storage.
 */
export function getAllProfiles(): UserProfile[] {
  if (cachedProfiles !== null) {
    return [...cachedProfiles];
  }
  try {
    const raw = safeGetItem(PROFILES_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedProfiles = parsed;
        return [...cachedProfiles];
      }
    }
  } catch (err) {
    console.warn('Error reading profiles registry:', err);
  }
  cachedProfiles = [];
  return [];
}

/**
 * Saves all profiles to persistent storage.
 */
function saveAllProfiles(profiles: UserProfile[]): void {
  cachedProfiles = [...profiles];
  try {
    safeSetItem(PROFILES_REGISTRY_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Error saving profiles registry:', err);
  }
}

/**
 * Returns the currently active profile object, or null.
 */
export function getActiveProfile(): UserProfile | null {
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  const profiles = getAllProfiles();
  const found = profiles.find((p) => p.id === activeId);
  return found ? { ...found } : null;
}

/**
 * Performs a "profile read" check as requested by the boot flow.
 */
export function runProfileRead(): {
  hasProfiles: boolean;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
} {
  const profiles = getAllProfiles();
  const activeProfile = getActiveProfile();
  return {
    hasProfiles: profiles.length > 0,
    activeProfile,
    profiles,
  };
}

/**
 * Migrates existing legacy global data into a new profile so existing users retain their progress.
 */
export function migrateGlobalDataToProfile(targetProfileId: string): void {
  const legacyKeys = [
    'drawstar_champion_credits_v1',
    'drawstar_store_collection_v1',
    'drawstar_new_cards_queue_v1',
    'drawstar_one_time_packs_v1',
    'drawstar_tutorial_seen_v1',
    'drawstar_tutorial_enabled_v1',
    'unique_career_slot_1_v2',
    'unique_career_slot_2_v2',
    'unique_career_slot_3_v2',
    'unique_career_slot_4_v2',
    'unique_career_slot_5_v2',
    'unique_career_active_slot_v2',
    'bal_graphic_settings_v1',
    'bal_audio_muted',
    'bal_audio_volume',
    'bal_soundtrack_mode',
    'FOOTBALL_CAREER_OPTION_FILE_V1',
    'footballer_custom_cards_v2',
    'FOOTBALL_CAREER_LEAGUE_DB_V7',
    'footballer_career_global_competitions_v3_5',
    'FOOTBALL_CAREER_LANGUAGE_V1',
  ];

  legacyKeys.forEach((key) => {
    try {
      const targetKey = getProfileStorageKey(key, targetProfileId);
      if (!safeGetItem(targetKey)) {
        const val = safeGetItem(key);
        if (val !== null && val !== undefined) {
          safeSetItem(targetKey, val);
        }
      }
    } catch {}
  });
}

/**
 * Creates and registers a new User Profile.
 */
export function createProfile(
  name: string,
  avatarColor: ProfileAvatarColor,
  initialLanguage?: string
): UserProfile {
  const trimmedName = (name || 'Player').trim().slice(0, 24);
  const profiles = getAllProfiles();
  const now = new Date().toISOString();
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const currentLang = initialLanguage || getStoredLanguage() || 'en-GB';

  const newProfile: UserProfile = {
    id,
    name: trimmedName || 'Player',
    avatarColor,
    createdAt: now,
    updatedAt: now,
    selectedLanguage: currentLang,
    settings: {
      fontSize: 'base',
      colorblindMode: 'none',
      quality: 'balanced',
    },
    tutorials: {
      tutorialEnabled: true,
      seenTutorials: [],
      storeTutorialCompleted: false,
    },
    credits: 9999,
    cardCollection: {},
    newCardQueues: {},
    purchasedOneTimePacks: [],
    saveFiles: {},
  };

  const isFirstProfile = profiles.length === 0;
  profiles.push(newProfile);
  saveAllProfiles(profiles);

  // If this is the user's first profile, automatically migrate any existing global data
  if (isFirstProfile) {
    migrateGlobalDataToProfile(newProfile.id);
  }

  // Set as active profile
  setActiveProfile(newProfile.id);

  return newProfile;
}

/**
 * Updates an existing profile's basic details (e.g. name, avatarColor, settings, language).
 */
export function updateProfile(
  profileId: string,
  updates: Partial<UserProfile>
): UserProfile | null {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;

  const current = profiles[idx];
  const updated: UserProfile = {
    ...current,
    ...updates,
    name: updates.name ? updates.name.trim().slice(0, 24) : current.name,
    avatarColor: updates.avatarColor || current.avatarColor,
    updatedAt: new Date().toISOString(),
  };

  profiles[idx] = updated;
  saveAllProfiles(profiles);

  // If updating the active profile, notify
  if (getActiveProfileId() === profileId) {
    notifyListeners();
  }

  return updated;
}

/**
 * Sets the active profile ID, flushes state if needed, and applies profile preferences.
 */
export function setActiveProfile(profileId: string): boolean {
  const profiles = getAllProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return false;

  cachedActiveProfileId = profileId;
  safeSetItem(ACTIVE_PROFILE_ID_KEY, profileId);

  // Hydrate profile language & packet
  if (target.selectedLanguage) {
    try {
      setStoredLanguage(target.selectedLanguage as LanguageCode);
      loadBuiltinLanguagePacket(target.selectedLanguage);
    } catch (e) {
      console.warn('Error restoring profile language:', e);
    }
  }

  // Hydrate DOM settings
  if (target.settings && typeof document !== 'undefined') {
    if (target.settings.fontSize) {
      document.documentElement.setAttribute('data-font-size', target.settings.fontSize);
    }
    if (target.settings.colorblindMode) {
      document.documentElement.setAttribute('data-colorblind', target.settings.colorblindMode);
    }
  }

  // Broadcast to subsystems
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('drawstar_profile_switched', { detail: { profileId } }));
  }

  notifyListeners();
  return true;
}

/**
 * Flushes active session data (credits, card collection, tutorials, saves) into active profile.
 */
export function flushActiveProfileSession(partialData?: Partial<UserProfile>): void {
  const activeId = getActiveProfileId();
  if (!activeId) return;

  const profiles = getAllProfiles();
  const idx = profiles.findIndex((p) => p.id === activeId);
  if (idx === -1) return;

  const current = profiles[idx];
  const updated: UserProfile = {
    ...current,
    ...partialData,
    updatedAt: new Date().toISOString(),
  };

  profiles[idx] = updated;
  saveAllProfiles(profiles);
}

/**
 * Deletes a profile by ID. If active, switches to another profile or clears active.
 */
export function deleteProfile(profileId: string): boolean {
  const profiles = getAllProfiles();
  const filtered = profiles.filter((p) => p.id !== profileId);
  if (filtered.length === profiles.length) return false;

  saveAllProfiles(filtered);

  if (getActiveProfileId() === profileId) {
    if (filtered.length > 0) {
      setActiveProfile(filtered[0].id);
    } else {
      cachedActiveProfileId = null;
      safeRemoveItem(ACTIVE_PROFILE_ID_KEY);
      notifyListeners();
    }
  } else {
    notifyListeners();
  }

  return true;
}

/**
 * Downloads full profile information as a JSON file.
 */
export function downloadProfileJson(profileId?: string): boolean {
  const targetId = profileId || getActiveProfileId();
  if (!targetId) return false;

  const profiles = getAllProfiles();
  const target = profiles.find((p) => p.id === targetId);
  if (!target) return false;

  // Gather complete snapshot of profile including current storage items
  const profileStorageData: Record<string, string> = {};
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`prof_${targetId}_`)) {
        const v = localStorage.getItem(k);
        if (v !== null) {
          const shortKey = k.replace(`prof_${targetId}_`, '');
          profileStorageData[shortKey] = v;
        }
      }
    }
  }

  const exportPayload: ProfileExportData & { storageData?: Record<string, string> } = {
    formatVersion: '1.0',
    app: 'DrawStar Career Simulation',
    exportedAt: new Date().toISOString(),
    profile: {
      ...target,
    },
    storageData: profileStorageData,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const sanitizedName = (target.name || 'player').toLowerCase().replace(/[^a-z0-9]/gi, '_');
  const filename = `drawstar_profile_${sanitizedName}_${Date.now()}.json`;

  safeDownloadBlob(blob, filename);
  return true;
}

/**
 * Loads and imports profile information from a JSON string.
 */
export function loadProfileFromJson(jsonText: string): {
  success: boolean;
  profile?: UserProfile;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    const profileData: UserProfile = parsed.profile || parsed;

    if (!profileData || typeof profileData.name !== 'string') {
      return { success: false, error: 'Invalid profile data: Name is missing.' };
    }

    const profiles = getAllProfiles();
    // Generate new unique ID to avoid collision
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const importedProfile: UserProfile = {
      ...profileData,
      id: newId,
      name: profileData.name.trim().slice(0, 24),
      avatarColor: ['red', 'blue', 'yellow', 'white', 'black'].includes(profileData.avatarColor)
        ? profileData.avatarColor
        : 'blue',
      selectedLanguage: profileData.selectedLanguage || 'en-GB',
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      credits: typeof profileData.credits === 'number' ? profileData.credits : 9999,
      cardCollection: profileData.cardCollection || {},
      tutorials: profileData.tutorials || { tutorialEnabled: true, seenTutorials: [] },
      settings: profileData.settings || { fontSize: 'base', colorblindMode: 'none' },
      saveFiles: profileData.saveFiles || {},
    };

    // Restore all namespaced storage entries under the new profile's ID
    if (parsed.storageData && typeof parsed.storageData === 'object') {
      Object.entries(parsed.storageData).forEach(([shortKey, val]) => {
        if (typeof val === 'string') {
          safeSetItem(getProfileStorageKey(shortKey, newId), val);
        }
      });
    }

    profiles.push(importedProfile);
    saveAllProfiles(profiles);

    // Switch to imported profile
    setActiveProfile(importedProfile.id);

    return { success: true, profile: importedProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON profile.' };
  }
}

/**
 * Subscribes to profile changes (active profile or profiles registry updates).
 */
export function subscribeProfileChange(listener: ProfileListener): () => void {
  profileListeners.add(listener);
  return () => {
    profileListeners.delete(listener);
  };
}

/**
 * Custom React hook for accessing and managing profiles in UI components.
 */
export function useProfile() {
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(() => getActiveProfile());
  const [profiles, setProfilesState] = useState<UserProfile[]>(() => getAllProfiles());

  useEffect(() => {
    const unsub = subscribeProfileChange((active, all) => {
      setActiveProfileState(active);
      setProfilesState(all);
    });
    return () => unsub();
  }, []);

  const handleCreate = useCallback((name: string, color: ProfileAvatarColor, lang?: string) => {
    return createProfile(name, color, lang);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<UserProfile>) => {
    return updateProfile(id, updates);
  }, []);

  const handleSwitch = useCallback((id: string) => {
    return setActiveProfile(id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    return deleteProfile(id);
  }, []);

  const handleDownload = useCallback((id?: string) => {
    return downloadProfileJson(id);
  }, []);

  const handleLoad = useCallback((json: string) => {
    return loadProfileFromJson(json);
  }, []);

  return {
    activeProfile,
    profiles,
    createProfile: handleCreate,
    updateProfile: handleUpdate,
    switchProfile: handleSwitch,
    deleteProfile: handleDelete,
    downloadProfile: handleDownload,
    loadProfile: handleLoad,
  };
}
