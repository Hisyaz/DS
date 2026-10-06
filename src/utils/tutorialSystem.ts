import { safeGetItem, safeSetItem } from './storageCleaner';
import { t } from './localizationSystem';
import { getProfileStorageKey } from './profileSystem';

export const TUTORIAL_ENABLED_KEY = 'drawstar_tutorial_enabled_v1';
export const TUTORIAL_SEEN_LIST_KEY = 'drawstar_seen_tutorials_v1';
export const STORE_TUTORIAL_SEEN_KEY = 'drawstar_store_tutorial_completed_v1';

function getScopedKey(base: string): string {
  return getProfileStorageKey(base);
}

type TutorialListener = (enabled: boolean) => void;
const tutorialListeners: Set<TutorialListener> = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('drawstar_profile_switched', () => {
    const isEn = isTutorialEnabled();
    tutorialListeners.forEach((listener) => {
      try {
        listener(isEn);
      } catch (e) {
        console.warn('Error in tutorial listener:', e);
      }
    });
  });
}

/**
 * Checks if the user has ever explicitly set a tutorial preference (ON or OFF).
 */
export function hasTutorialPreference(): boolean {
  try {
    const val = safeGetItem(getScopedKey(TUTORIAL_ENABLED_KEY));
    return val !== null && val !== undefined && (val === 'true' || val === 'false');
  } catch {
    return false;
  }
}

/**
 * Checks whether guided in-game tutorials/explanations are enabled.
 * Defaults to true for new players who haven't turned it off.
 */
export function isTutorialEnabled(): boolean {
  try {
    const val = safeGetItem(getScopedKey(TUTORIAL_ENABLED_KEY));
    if (val === null || val === undefined) {
      return true; // Default to true if not set
    }
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Sets the tutorial preference (ON/OFF) and notifies reactive listeners.
 */
export function setTutorialEnabled(enabled: boolean): void {
  try {
    safeSetItem(getScopedKey(TUTORIAL_ENABLED_KEY), enabled ? 'true' : 'false');
    tutorialListeners.forEach((listener) => {
      try {
        listener(enabled);
      } catch (e) {
        console.warn('Error in tutorial listener:', e);
      }
    });
  } catch (e) {
    console.warn('Could not persist tutorial preference:', e);
  }
}

/**
 * Subscribes to tutorial preference changes.
 */
export function subscribeTutorialChange(listener: TutorialListener): () => void {
  tutorialListeners.add(listener);
  return () => {
    tutorialListeners.delete(listener);
  };
}

/**
 * Checks whether a specific in-game tutorial prompt has already been seen.
 */
export function hasSeenTutorial(tutorialId: string): boolean {
  try {
    const raw = safeGetItem(getScopedKey(TUTORIAL_SEEN_LIST_KEY));
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(tutorialId);
  } catch {
    return false;
  }
}

/**
 * Marks a specific in-game tutorial prompt as seen.
 */
export function markTutorialSeen(tutorialId: string): void {
  try {
    const key = getScopedKey(TUTORIAL_SEEN_LIST_KEY);
    const raw = safeGetItem(key);
    let list: string[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
      }
    }
    if (!list.includes(tutorialId)) {
      list.push(tutorialId);
      safeSetItem(key, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Could not record seen tutorial:', e);
  }
}

/**
 * Resets all seen tutorial records so player can view explanations again.
 */
export function resetSeenTutorials(): void {
  try {
    safeSetItem(getScopedKey(TUTORIAL_SEEN_LIST_KEY), JSON.stringify([]));
    safeSetItem(getScopedKey(STORE_TUTORIAL_SEEN_KEY), 'false');
  } catch (e) {
    console.warn('Could not reset tutorials:', e);
  }
}

// ============================================================================
// WIKI TOPICS ENCYCLOPEDIA DEFINITIONS
// ============================================================================

export interface WikiTopic {
  id: string;
  category: 'core' | 'development' | 'matches' | 'career' | 'economy';
  iconName: string;
  titleKey: string;
  tagKey: string;
  descriptionKey: string;
  bulletPointsKeys: string[];
}

export const WIKI_TOPICS: WikiTopic[] = [
  {
    id: 'wiki_card_store',
    category: 'core',
    iconName: 'ShoppingBag',
    titleKey: 'WIKI_CARD_STORE_TITLE',
    tagKey: 'WIKI_CARD_STORE_TAG',
    descriptionKey: 'WIKI_CARD_STORE_DESC',
    bulletPointsKeys: [
      'WIKI_CARD_STORE_PT_1',
      'WIKI_CARD_STORE_PT_2',
      'WIKI_CARD_STORE_PT_3',
      'WIKI_CARD_STORE_PT_4',
    ],
  },
  {
    id: 'wiki_player_card',
    category: 'core',
    iconName: 'Award',
    titleKey: 'WIKI_PLAYER_CARD_TITLE',
    tagKey: 'WIKI_PLAYER_CARD_TAG',
    descriptionKey: 'WIKI_PLAYER_CARD_DESC',
    bulletPointsKeys: [
      'WIKI_PLAYER_CARD_PT_1',
      'WIKI_PLAYER_CARD_PT_2',
      'WIKI_PLAYER_CARD_PT_3',
      'WIKI_PLAYER_CARD_PT_4',
    ],
  },
  {
    id: 'wiki_development',
    category: 'development',
    iconName: 'TrendingUp',
    titleKey: 'WIKI_DEV_TITLE',
    tagKey: 'WIKI_DEV_TAG',
    descriptionKey: 'WIKI_DEV_DESC',
    bulletPointsKeys: [
      'WIKI_DEV_PT_1',
      'WIKI_DEV_PT_2',
      'WIKI_DEV_PT_3',
      'WIKI_DEV_PT_4',
    ],
  },
  {
    id: 'wiki_match_moments',
    category: 'matches',
    iconName: 'Activity',
    titleKey: 'WIKI_MATCH_TITLE',
    tagKey: 'WIKI_MATCH_TAG',
    descriptionKey: 'WIKI_MATCH_DESC',
    bulletPointsKeys: [
      'WIKI_MATCH_PT_1',
      'WIKI_MATCH_PT_2',
      'WIKI_MATCH_PT_3',
      'WIKI_MATCH_PT_4',
    ],
  },
  {
    id: 'wiki_youth_academy',
    category: 'career',
    iconName: 'GraduationCap',
    titleKey: 'WIKI_YOUTH_TITLE',
    tagKey: 'WIKI_YOUTH_TAG',
    descriptionKey: 'WIKI_YOUTH_DESC',
    bulletPointsKeys: [
      'WIKI_YOUTH_PT_1',
      'WIKI_YOUTH_PT_2',
      'WIKI_YOUTH_PT_3',
      'WIKI_YOUTH_PT_4',
    ],
  },
  {
    id: 'wiki_contracts',
    category: 'career',
    iconName: 'FileText',
    titleKey: 'WIKI_CONTRACTS_TITLE',
    tagKey: 'WIKI_CONTRACTS_TAG',
    descriptionKey: 'WIKI_CONTRACTS_DESC',
    bulletPointsKeys: [
      'WIKI_CONTRACTS_PT_1',
      'WIKI_CONTRACTS_PT_2',
      'WIKI_CONTRACTS_PT_3',
      'WIKI_CONTRACTS_PT_4',
    ],
  },
  {
    id: 'wiki_national_team',
    category: 'career',
    iconName: 'Globe',
    titleKey: 'WIKI_NATIONAL_TITLE',
    tagKey: 'WIKI_NATIONAL_TAG',
    descriptionKey: 'WIKI_NATIONAL_DESC',
    bulletPointsKeys: [
      'WIKI_NATIONAL_PT_1',
      'WIKI_NATIONAL_PT_2',
      'WIKI_NATIONAL_PT_3',
      'WIKI_NATIONAL_PT_4',
    ],
  },
  {
    id: 'wiki_economy_lifestyle',
    category: 'economy',
    iconName: 'DollarSign',
    titleKey: 'WIKI_ECONOMY_TITLE',
    tagKey: 'WIKI_ECONOMY_TAG',
    descriptionKey: 'WIKI_ECONOMY_DESC',
    bulletPointsKeys: [
      'WIKI_ECONOMY_PT_1',
      'WIKI_ECONOMY_PT_2',
      'WIKI_ECONOMY_PT_3',
      'WIKI_ECONOMY_PT_4',
    ],
  },
  {
    id: 'wiki_genetic_activation',
    category: 'development',
    iconName: 'Sparkles',
    titleKey: 'WIKI_GENETICS_TITLE',
    tagKey: 'WIKI_GENETICS_TAG',
    descriptionKey: 'WIKI_GENETICS_DESC',
    bulletPointsKeys: [
      'WIKI_GENETICS_PT_1',
      'WIKI_GENETICS_PT_2',
      'WIKI_GENETICS_PT_3',
      'WIKI_GENETICS_PT_4',
    ],
  },
  {
    id: 'wiki_chemistry_morale',
    category: 'matches',
    iconName: 'Heart',
    titleKey: 'WIKI_CHEMISTRY_TITLE',
    tagKey: 'WIKI_CHEMISTRY_TAG',
    descriptionKey: 'WIKI_CHEMISTRY_DESC',
    bulletPointsKeys: [
      'WIKI_CHEMISTRY_PT_1',
      'WIKI_CHEMISTRY_PT_2',
      'WIKI_CHEMISTRY_PT_3',
      'WIKI_CHEMISTRY_PT_4',
    ],
  },
  {
    id: 'wiki_street_football',
    category: 'career',
    iconName: 'Flame',
    titleKey: 'WIKI_STREET_TITLE',
    tagKey: 'WIKI_STREET_TAG',
    descriptionKey: 'WIKI_STREET_DESC',
    bulletPointsKeys: [
      'WIKI_STREET_PT_1',
      'WIKI_STREET_PT_2',
      'WIKI_STREET_PT_3',
      'WIKI_STREET_PT_4',
    ],
  },
];
