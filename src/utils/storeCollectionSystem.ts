import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import {
  getAllDefaultCustomCards,
  matchesCategory,
} from './cardDatabaseSystem';
import { safeGetItem, safeSetItem } from './storageCleaner';
import { getProfileStorageKey } from './profileSystem';

// ============================================================================
// CONSTANTS & STORAGE KEYS
// ============================================================================

export const DEFAULT_CHAMPION_CREDITS = 9999;
export const BASIC_PACK_PRICE_CREDITS = 10;
export const UNIQUE_CAREER_START_COST_CREDITS = 1;
export const CARDS_PER_PACK = 5;

export const CHAMPION_CREDITS_STORAGE_KEY = 'drawstar_champion_credits_v1';
export const STORE_COLLECTION_STORAGE_KEY = 'drawstar_store_collection_v1';
export const ONE_TIME_PACKS_STORAGE_KEY = 'drawstar_purchased_one_time_packs_v1';
export const STORE_TUTORIAL_COMPLETED_KEY = 'drawstar_store_tutorial_completed_v1';

function getScopedKey(base: string): string {
  return getProfileStorageKey(base);
}

// Supported Store Categories
export type StoreCategory =
  | 'parents'
  | 'youth'
  | 'career'
  | 'sponsor'
  | 'life'
  | 'agent'
  | 'street';

export type StoreCategoryFilter = StoreCategory | 'all';

export type StorePackSection = 'starter' | 'standard' | 'epic';

export interface StorePackDefinition {
  id: string;
  category: StoreCategory | 'all';
  name: string;
  categoryLabel: string;
  priceCredits: number;
  cardCount: number;
  description: string;
  gradient: string;
  accentBorder: string;
  iconName: string;
  badgeColor: string;
  section?: StorePackSection;
  isOneTime?: boolean;
  isBigPack?: boolean;
}

// ============================================================================
// CARD DETECTION HELPERS (DISASTER, ICONIC, MURAMASA)
// ============================================================================

export function isDisasterCard(card: any): boolean {
  if (!card) return false;
  const tier = (card.tier || '').toString().toLowerCase();
  const name = (card.name || '').toString().toLowerCase();
  const id = (card.id || '').toString().toLowerCase();
  const rarity = (card.rarity || '').toString().toLowerCase();
  return (
    tier === 'disaster' ||
    rarity === 'disaster' ||
    name.includes('disaster') ||
    id.includes('disaster')
  );
}

export function isIconicCard(card: any): boolean {
  if (!card) return false;
  const tier = (card.tier || '').toString().toLowerCase();
  const name = (card.name || '').toString().toLowerCase();
  const id = (card.id || '').toString().toLowerCase();
  const rarity = (card.rarity || '').toString().toLowerCase();
  const type = (card.type || '').toString().toLowerCase();
  const cat = (card.category || '').toString().toLowerCase();
  return (
    tier === 'iconic' ||
    rarity === 'iconic' ||
    type === 'iconic' ||
    cat === 'iconic_youth' ||
    Boolean(card.isIconic)
  );
}

export function isMuramasaBladeCard(card: any): boolean {
  if (!card) return false;
  const tier = (card.tier || '').toString().toLowerCase();
  const name = (card.name || '').toString().toLowerCase();
  const id = (card.id || '').toString().toLowerCase();
  return (
    tier === 'muramasa_blade' ||
    name.includes('muramasa') ||
    id.includes('muramasa')
  );
}

export function isNegativeCard(card: any): boolean {
  if (!card) return false;
  if (card.effectCategory === 'negative') return true;
  const tier = (card.tier || '').toString().toLowerCase();
  const rarity = (card.rarity || '').toString().toLowerCase();
  if (['disaster', 'ash', 'rust', 'scrap'].includes(tier)) return true;
  if (['disaster', 'ash', 'rust', 'scrap'].includes(rarity)) return true;
  if (card.isNegative) return true;
  return false;
}

// ============================================================================
// STARTER PACKS & EPIC UPGRADE PACK DEFINITIONS
// ============================================================================

export const STARTER_PACKS: StorePackDefinition[] = [
  {
    id: 'pack-starter-bronze',
    category: 'all',
    section: 'starter',
    name: 'Bronze Starting Pack',
    categoryLabel: 'Bronze Starter',
    priceCredits: 5,
    cardCount: 50,
    isOneTime: true,
    isBigPack: true,
    description: 'Contains 50 Bronze cards. Fixed 1-time purchase foundation.',
    gradient: 'from-amber-700 via-yellow-800 to-slate-950',
    accentBorder: 'border-amber-600',
    iconName: 'Package',
    badgeColor: 'bg-amber-600/30 text-amber-300 border-amber-500/60',
  },
  {
    id: 'pack-starter-silver',
    category: 'all',
    section: 'starter',
    name: 'Silver Starting Pack',
    categoryLabel: 'Silver Starter',
    priceCredits: 10,
    cardCount: 25,
    isOneTime: true,
    isBigPack: true,
    description: 'Contains 25 Silver cards across tactical and physical disciplines.',
    gradient: 'from-slate-400 via-zinc-600 to-slate-950',
    accentBorder: 'border-slate-400',
    iconName: 'Package',
    badgeColor: 'bg-slate-500/30 text-slate-200 border-slate-400/60',
  },
  {
    id: 'pack-starter-gold',
    category: 'all',
    section: 'starter',
    name: 'Gold Starting Pack',
    categoryLabel: 'Gold Starter',
    priceCredits: 15,
    cardCount: 15,
    isOneTime: true,
    isBigPack: true,
    description: 'Contains 15 Gold cards featuring premier talents and milestone feats.',
    gradient: 'from-yellow-400 via-amber-600 to-slate-950',
    accentBorder: 'border-yellow-400',
    iconName: 'Package',
    badgeColor: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/60',
  },
  {
    id: 'pack-starter-double-edged',
    category: 'all',
    section: 'starter',
    name: 'Double-Edged Starter Pack',
    categoryLabel: 'Risk & Reward',
    priceCredits: 30,
    cardCount: 50,
    isOneTime: true,
    isBigPack: true,
    description: 'Contains 50 Double-Edged cards (Obsidian Knife, Copper Dagger, Steel Blade & Muramasa Blade).',
    gradient: 'from-rose-600 via-red-800 to-slate-950',
    accentBorder: 'border-red-500',
    iconName: 'Flame',
    badgeColor: 'bg-red-500/30 text-red-300 border-red-500/60',
  },
];

export const EPIC_UPGRADE_PACK: StorePackDefinition = {
  id: 'pack-epic-upgrade',
  category: 'all',
  section: 'epic',
  name: 'Epic Upgrade Pack',
  categoryLabel: 'High-Rarity Special',
  priceCredits: 25,
  cardCount: 5,
  isOneTime: true,
  isBigPack: false,
  description: 'Contains 5 random high-rarity cards from all eligible Legendary & Iconic pools. 20% Iconic chance per slot!',
  gradient: 'from-purple-600 via-indigo-700 to-cyan-500',
  accentBorder: 'border-purple-400',
  iconName: 'Crown',
  badgeColor: 'bg-purple-500/30 text-purple-200 border-purple-400/60',
};

export const STORE_PACKS: StorePackDefinition[] = [
  {
    id: 'pack-parents',
    category: 'parents',
    section: 'standard',
    name: 'Basic Parent Pack',
    categoryLabel: 'Parent Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Heritage roots, family traits, genetic advantages and parental management guidance.',
    gradient: 'from-rose-600 via-pink-700 to-slate-950',
    accentBorder: 'border-rose-500/50',
    iconName: 'HeartHandshake',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  {
    id: 'pack-youth',
    category: 'youth',
    section: 'standard',
    name: 'Basic Youth Pack',
    categoryLabel: 'Youth Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Academy growth milestones, youth development protocols and tactical fundamentals.',
    gradient: 'from-emerald-600 via-teal-700 to-slate-950',
    accentBorder: 'border-emerald-500/50',
    iconName: 'Award',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'pack-career',
    category: 'career',
    section: 'standard',
    name: 'Basic Career Pack',
    categoryLabel: 'Career Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Matchday clutch moments, squad status feats, contract negotiations and trophies.',
    gradient: 'from-blue-600 via-indigo-700 to-slate-950',
    accentBorder: 'border-blue-500/50',
    iconName: 'Shield',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    id: 'pack-sponsor',
    category: 'sponsor',
    section: 'standard',
    name: 'Basic Sponsor Pack',
    categoryLabel: 'Sponsor Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Commercial endorsement contracts, boot deals, global partnerships and venture investments.',
    gradient: 'from-amber-500 via-yellow-600 to-slate-950',
    accentBorder: 'border-amber-500/50',
    iconName: 'Briefcase',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'pack-life',
    category: 'life',
    section: 'standard',
    name: 'Basic Lifestyle Pack',
    categoryLabel: 'Lifestyle Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Off-pitch lifestyle, media publicity, high-fashion culture and luxury assets.',
    gradient: 'from-purple-600 via-fuchsia-700 to-slate-950',
    accentBorder: 'border-purple-500/50',
    iconName: 'Sparkles',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'pack-agent',
    category: 'agent',
    section: 'standard',
    name: 'Basic Agent Pack',
    categoryLabel: 'Agent Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Super-agent influence, tactical advisors, boardroom leverage and media management.',
    gradient: 'from-cyan-600 via-blue-700 to-slate-950',
    accentBorder: 'border-cyan-500/50',
    iconName: 'UserCheck',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'pack-street',
    category: 'street',
    section: 'standard',
    name: 'Basic Street Pack',
    categoryLabel: 'Street Cards',
    priceCredits: BASIC_PACK_PRICE_CREDITS,
    cardCount: CARDS_PER_PACK,
    description: 'Cage football flair, asphalt instinct, underground rivalries and street mastery.',
    gradient: 'from-orange-600 via-red-700 to-slate-950',
    accentBorder: 'border-orange-500/50',
    iconName: 'Flame',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
];

export const ALL_STORE_PACKS: StorePackDefinition[] = [
  ...STARTER_PACKS,
  EPIC_UPGRADE_PACK,
  ...STORE_PACKS,
];

// ============================================================================
// PERSISTENT STORAGE MANAGEMENT (CHAMPION CREDITS & STORE COLLECTION)
// ============================================================================

export type StoreCollection = Record<string, number>; // cardId -> quantity

const creditListeners = new Set<(credits: number) => void>();
const collectionListeners = new Set<(collection: StoreCollection) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('drawstar_profile_switched', () => {
    const credits = getChampionCredits();
    creditListeners.forEach((fn) => {
      try {
        fn(credits);
      } catch {}
    });

    const col = getStoreCollection();
    collectionListeners.forEach((fn) => {
      try {
        fn(col);
      } catch {}
    });

    const q = getNewCardQueues();
    newCardQueueListeners.forEach((fn) => {
      try {
        fn(q);
      } catch {}
    });
  });
}

/**
 * Returns the current Champion Credit balance (default 9,999).
 */
export function getChampionCredits(): number {
  const key = getScopedKey(CHAMPION_CREDITS_STORAGE_KEY);
  try {
    const raw = safeGetItem(key);
    if (raw !== null && raw !== undefined) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading Champion Credits:', err);
  }
  // Initialize with 9,999 if not set
  safeSetItem(key, String(DEFAULT_CHAMPION_CREDITS));
  return DEFAULT_CHAMPION_CREDITS;
}

/**
 * Sets the current Champion Credit balance and notifies all listeners.
 */
export function setChampionCredits(credits: number): number {
  const safeCredits = Math.max(0, Math.floor(credits));
  const key = getScopedKey(CHAMPION_CREDITS_STORAGE_KEY);
  try {
    safeSetItem(key, String(safeCredits));
  } catch (err) {
    console.warn('Error saving Champion Credits:', err);
  }
  creditListeners.forEach((fn) => {
    try {
      fn(safeCredits);
    } catch {}
  });
  return safeCredits;
}

/**
 * Deducts Champion Credits if sufficient balance exists.
 * Returns true if deduction was successful, false if insufficient credits.
 */
export function deductChampionCredits(amount: number): boolean {
  if (amount <= 0) return true;
  const current = getChampionCredits();
  if (current < amount) {
    return false;
  }
  setChampionCredits(current - amount);
  return true;
}

/**
 * Adds Champion Credits to the current balance.
 */
export function addChampionCredits(amount: number): number {
  if (amount <= 0) return getChampionCredits();
  const current = getChampionCredits();
  return setChampionCredits(current + amount);
}

/**
 * Subscribes a listener to Champion Credits balance changes.
 */
export function subscribeToChampionCredits(listener: (credits: number) => void): () => void {
  creditListeners.add(listener);
  return () => creditListeners.delete(listener);
}

/**
 * Returns the player's persistent Store Collection (cardId -> count of owned copies).
 */
export function getStoreCollection(): StoreCollection {
  try {
    const raw = safeGetItem(getScopedKey(STORE_COLLECTION_STORAGE_KEY));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading Store Collection:', err);
  }
  return {};
}

/**
 * Saves the player's Store Collection and notifies listeners.
 */
export function saveStoreCollection(collection: StoreCollection): void {
  try {
    safeSetItem(getScopedKey(STORE_COLLECTION_STORAGE_KEY), JSON.stringify(collection));
  } catch (err) {
    console.warn('Error saving Store Collection:', err);
  }
  collectionListeners.forEach((fn) => {
    try {
      fn(collection);
    } catch {}
  });
}

/**
 * Subscribes a listener to Store Collection changes.
 */
export function subscribeToStoreCollection(listener: (collection: StoreCollection) => void): () => void {
  collectionListeners.add(listener);
  return () => collectionListeners.delete(listener);
}

/**
 * Returns the quantity of owned copies for a specific canonical card ID.
 */
export function getCardOwnedCount(cardId: string, collection?: StoreCollection): number {
  const col = collection ?? getStoreCollection();
  return col[cardId] || 0;
}

/**
 * Adds copies of specified cards to the player's persistent Store Collection.
 * Duplicates increase the quantity counter. Does NOT clone or modify definitions.
 */
export function addCardsToStoreCollection(cardIds: string[]): StoreCollection {
  const current = { ...getStoreCollection() };
  cardIds.forEach((id) => {
    current[id] = (current[id] || 0) + 1;
  });
  saveStoreCollection(current);
  return current;
}

// ============================================================================
// ONE-TIME PURCHASE & STORE TUTORIAL TRACKING
// ============================================================================

export function getPurchasedOneTimePacks(): string[] {
  try {
    const raw = safeGetItem(getScopedKey(ONE_TIME_PACKS_STORAGE_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isOneTimePackPurchased(packId: string): boolean {
  return getPurchasedOneTimePacks().includes(packId);
}

export function markOneTimePackPurchased(packId: string): void {
  const list = getPurchasedOneTimePacks();
  if (!list.includes(packId)) {
    list.push(packId);
    safeSetItem(getScopedKey(ONE_TIME_PACKS_STORAGE_KEY), JSON.stringify(list));
  }
}

export function isStoreTutorialCompleted(): boolean {
  return safeGetItem(getScopedKey(STORE_TUTORIAL_COMPLETED_KEY)) === 'true';
}

export function markStoreTutorialCompleted(): void {
  safeSetItem(getScopedKey(STORE_TUTORIAL_COMPLETED_KEY), 'true');
}

// ============================================================================
// NEW CARD PRIORITY & GUARANTEE QUEUES SYSTEM
// ============================================================================

export const NEW_CARD_QUEUES_STORAGE_KEY = 'drawstar_new_card_queues_v1';

export interface NewCardQueueItem {
  id: string; // Unique instance id for this specific obtained copy
  cardId: string; // Canonical card definition ID
  category: StoreCategory;
  obtainedAt: number; // Millisecond timestamp
  sourcePackId?: string;
}

export type NewCardQueues = Record<StoreCategory, NewCardQueueItem[]>;

const newCardQueueListeners: Set<(queues: NewCardQueues) => void> = new Set();

/**
 * Loads persistent New Card Queues from local storage.
 * Queues are isolated per category and survive restarts, career resets, and season switches.
 */
export function getNewCardQueues(): NewCardQueues {
  const defaultQueues: NewCardQueues = {
    parents: [],
    youth: [],
    career: [],
    sponsor: [],
    life: [],
    agent: [],
    street: [],
  };

  try {
    const raw = safeGetItem(getScopedKey(NEW_CARD_QUEUES_STORAGE_KEY));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          parents: Array.isArray(parsed.parents) ? parsed.parents : [],
          youth: Array.isArray(parsed.youth) ? parsed.youth : [],
          career: Array.isArray(parsed.career) ? parsed.career : [],
          sponsor: Array.isArray(parsed.sponsor) ? parsed.sponsor : [],
          life: Array.isArray(parsed.life) ? parsed.life : [],
          agent: Array.isArray(parsed.agent) ? parsed.agent : [],
          street: Array.isArray(parsed.street) ? parsed.street : [],
        };
      }
    }
  } catch (err) {
    console.warn('Error reading New Card Queues:', err);
  }
  return defaultQueues;
}

/**
 * Saves New Card Queues to persistent storage and notifies subscribers.
 */
export function saveNewCardQueues(queues: NewCardQueues): void {
  try {
    safeSetItem(getScopedKey(NEW_CARD_QUEUES_STORAGE_KEY), JSON.stringify(queues));
  } catch (err) {
    console.warn('Error saving New Card Queues:', err);
  }
  newCardQueueListeners.forEach((fn) => {
    try {
      fn(queues);
    } catch {}
  });
}

/**
 * Subscribes a listener to New Card Queue updates.
 */
export function subscribeToNewCardQueues(listener: (queues: NewCardQueues) => void): () => void {
  newCardQueueListeners.add(listener);
  return () => newCardQueueListeners.delete(listener);
}

/**
 * Adds newly obtained card copies to the persistent category queue.
 * Each copy gets its own individual New Card status (Section 1, 9, 16).
 * Acquisition order is strictly preserved so the last revealed card is the newest.
 */
export function addNewCardCopiesToQueue(
  cards: { cardId: string; category: StoreCategory }[],
  sourcePackId?: string
): NewCardQueues {
  const queues = getNewCardQueues();
  const baseTime = Date.now();

  cards.forEach((item, index) => {
    const queueItem: NewCardQueueItem = {
      id: `new-card-${item.cardId}-${baseTime}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      cardId: item.cardId,
      category: item.category,
      obtainedAt: baseTime + index,
      sourcePackId,
    };
    if (!queues[item.category]) {
      queues[item.category] = [];
    }
    queues[item.category].push(queueItem);
  });

  saveNewCardQueues(queues);
  return queues;
}

/**
 * Returns pending new card items for a category in newest-first order (LIFO) (Section 5).
 */
export function getPendingNewCardsForCategory(
  category: StoreCategory,
  queues?: NewCardQueues
): NewCardQueueItem[] {
  const currentQueues = queues ?? getNewCardQueues();
  const list = [...(currentQueues[category] || [])];
  return list.sort((a, b) => b.obtainedAt - a.obtainedAt);
}

/**
 * Returns the count of pending NEW copies for a specific card ID (Section 11).
 */
export function getNewCardCount(
  cardId: string,
  category?: StoreCategory,
  queues?: NewCardQueues
): number {
  const currentQueues = queues ?? getNewCardQueues();
  if (category) {
    const list = currentQueues[category] || [];
    return list.filter((item) => item.cardId === cardId).length;
  }
  let total = 0;
  for (const cat of Object.keys(currentQueues) as StoreCategory[]) {
    total += (currentQueues[cat] || []).filter((item) => item.cardId === cardId).length;
  }
  return total;
}

/**
 * Returns the total count of pending NEW cards across all or a specific category.
 */
export function getPendingNewCardsCountForCategory(
  category: StoreCategory,
  queues?: NewCardQueues
): number {
  const currentQueues = queues ?? getNewCardQueues();
  return (currentQueues[category] || []).length;
}

/**
 * Consumes the newest pending New Card from a category queue (Section 5, 6, 7).
 */
export function consumeNewestPendingCard(
  category: StoreCategory
): NewCardQueueItem | null {
  const queues = getNewCardQueues();
  const items = queues[category] || [];
  if (items.length === 0) return null;

  let newestIndex = 0;
  let maxTime = items[0].obtainedAt;
  for (let i = 1; i < items.length; i++) {
    if (items[i].obtainedAt > maxTime) {
      maxTime = items[i].obtainedAt;
      newestIndex = i;
    }
  }

  const [consumed] = items.splice(newestIndex, 1);
  queues[category] = items;
  saveNewCardQueues(queues);
  return consumed;
}

// ============================================================================
// UNIQUE CAREER START COST MANAGEMENT
// ============================================================================

export interface UniqueCareerCostCheck {
  canStart: boolean;
  currentCredits: number;
  cost: number;
  message?: string;
}

/**
 * Checks if the player has enough Champion Credits to start a Unique Career run (1 credit).
 */
export function checkUniqueCareerStartEligibility(): UniqueCareerCostCheck {
  const credits = getChampionCredits();
  if (credits < UNIQUE_CAREER_START_COST_CREDITS) {
    return {
      canStart: false,
      currentCredits: credits,
      cost: UNIQUE_CAREER_START_COST_CREDITS,
      message: `Insufficient Champion Credits! Starting a Unique Career requires 1 Champion Credit. You currently have ${credits} credits.`,
    };
  }
  return {
    canStart: true,
    currentCredits: credits,
    cost: UNIQUE_CAREER_START_COST_CREDITS,
  };
}

/**
 * Deducts the 1 Champion Credit cost to start a new Unique Career run.
 * Returns true if successful, false if insufficient credits.
 */
export function chargeUniqueCareerStartCost(): boolean {
  return deductChampionCredits(UNIQUE_CAREER_START_COST_CREDITS);
}

// ============================================================================
// CANONICAL CARD POOL & PACK GENERATION ENGINE
// ============================================================================

/**
 * Retrieves all canonical cards eligible for a specific Store Category.
 * References existing cards from the single source of truth database.
 */
export function getStoreEligibleCardsForCategory(category: StoreCategory | 'all'): CustomCard[] {
  const allCards = getAllDefaultCustomCards();
  if (category === 'all') return allCards;
  return allCards.filter((card) => matchesCategory(card.category, category));
}

/**
 * Rolls a tier for a card drawn from a pack based on realistic drop probabilities.
 * Higher tiers (Silver, Gold, Legendary, Iconic, Copper Dagger, Steel Blade, Muramasa Blade)
 * are all obtainable!
 */
function rollPackCardTier(): {
  isDoubleEdged: boolean;
  tier: CustomCardTier;
} {
  // ~20% chance to roll a Double-Edged card
  const isDouble = Math.random() < 0.20;

  if (isDouble) {
    const roll = Math.random();
    if (roll < 0.05) return { isDoubleEdged: true, tier: 'muramasa_blade' };
    if (roll < 0.25) return { isDoubleEdged: true, tier: 'steel_blade' };
    if (roll < 0.65) return { isDoubleEdged: true, tier: 'copper_dagger' };
    return { isDoubleEdged: true, tier: 'obsidian_knife' };
  }

  // Positive cards tier roll
  const roll = Math.random();
  if (roll < 0.02) return { isDoubleEdged: false, tier: 'iconic' };
  if (roll < 0.10) return { isDoubleEdged: false, tier: 'legendary' };
  if (roll < 0.35) return { isDoubleEdged: false, tier: 'gold' };
  if (roll < 0.70) return { isDoubleEdged: false, tier: 'silver' };
  return { isDoubleEdged: false, tier: 'bronze' };
}

export interface PackOpenResult {
  success: boolean;
  cards: CustomCard[];
  deductedCredits: number;
  remainingCredits: number;
  pack: StorePackDefinition;
  errorMessage?: string;
}

/**
 * Executes a pack purchase and card reveal:
 * 1. Verifies sufficient Champion Credits (10 credits).
 * 2. Deducts 10 Champion Credits.
 * 3. Draws exactly 5 cards from the canonical database for that category.
 * 4. Adds 1 copy of each drawn card to the player's persistent Store Collection.
 * 5. Returns the 5 revealed cards.
 */
export function purchaseAndOpenPack(packId: string): PackOpenResult {
  const pack = ALL_STORE_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return {
      success: false,
      cards: [],
      deductedCredits: 0,
      remainingCredits: getChampionCredits(),
      pack: STORE_PACKS[0],
      errorMessage: 'Unknown pack type selected.',
    };
  }

  // Check one-time purchase limit
  if (pack.isOneTime && isOneTimePackPurchased(pack.id)) {
    return {
      success: false,
      cards: [],
      deductedCredits: 0,
      remainingCredits: getChampionCredits(),
      pack,
      errorMessage: `This special pack has already been purchased (Limit: 1 per career/collection).`,
    };
  }

  const currentCredits = getChampionCredits();
  if (currentCredits < pack.priceCredits) {
    return {
      success: false,
      cards: [],
      deductedCredits: 0,
      remainingCredits: currentCredits,
      pack,
      errorMessage: `Insufficient Champion Credits! Opening a ${pack.name} requires ${pack.priceCredits} Champion Credits. You have ${currentCredits}.`,
    };
  }

  const allAvailableCards = getAllDefaultCustomCards();
  const drawnCards: CustomCard[] = [];

  // ================= 1. BRONZE STARTING PACK (50 Bronze cards) =================
  if (pack.id === 'pack-starter-bronze') {
    const bronzePool = allAvailableCards.filter((c) => c.tier === 'bronze');
    if (bronzePool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: 'No Bronze cards found in canonical pool.',
      };
    }
    deductChampionCredits(pack.priceCredits);
    for (let i = 0; i < pack.cardCount; i++) {
      const card = bronzePool[Math.floor(Math.random() * bronzePool.length)];
      drawnCards.push(card);
    }
    markStoreTutorialCompleted();
  }
  // ================= 2. SILVER STARTING PACK (25 Silver cards) =================
  else if (pack.id === 'pack-starter-silver') {
    const silverPool = allAvailableCards.filter((c) => c.tier === 'silver');
    if (silverPool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: 'No Silver cards found in canonical pool.',
      };
    }
    deductChampionCredits(pack.priceCredits);
    for (let i = 0; i < pack.cardCount; i++) {
      const card = silverPool[Math.floor(Math.random() * silverPool.length)];
      drawnCards.push(card);
    }
  }
  // ================= 3. GOLD STARTING PACK (15 Gold cards) =================
  else if (pack.id === 'pack-starter-gold') {
    const goldPool = allAvailableCards.filter((c) => c.tier === 'gold');
    if (goldPool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: 'No Gold cards found in canonical pool.',
      };
    }
    deductChampionCredits(pack.priceCredits);
    for (let i = 0; i < pack.cardCount; i++) {
      const card = goldPool[Math.floor(Math.random() * goldPool.length)];
      drawnCards.push(card);
    }
  }
  // ================= 4. DOUBLE-EDGED STARTER PACK (50 Double-Edged cards) =================
  else if (pack.id === 'pack-starter-double-edged') {
    const doublePool = allAvailableCards.filter(
      (c) =>
        c.effectCategory === 'double_edged' ||
        ['obsidian_knife', 'copper_dagger', 'copper_knife', 'stone_dagger', 'steel_blade', 'muramasa_blade'].includes(
          c.tier as string
        ) ||
        c.name.toLowerCase().includes('dagger') ||
        c.name.toLowerCase().includes('blade') ||
        c.name.toLowerCase().includes('knife')
    );
    if (doublePool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: 'No Double-Edged cards found in canonical pool.',
      };
    }
    deductChampionCredits(pack.priceCredits);
    for (let i = 0; i < pack.cardCount; i++) {
      const card = doublePool[Math.floor(Math.random() * doublePool.length)];
      drawnCards.push(card);
    }
  }
  // ================= 5. EPIC UPGRADE PACK (5 high-rarity cards: 20% Iconic, 80% Legendary) =================
  else if (pack.id === 'pack-epic-upgrade') {
    const legendaryPool = allAvailableCards.filter((c) => c.tier === 'legendary');
    const iconicPool = allAvailableCards.filter((c) => isIconicCard(c));
    if (legendaryPool.length === 0 && iconicPool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: 'No Legendary or Iconic cards found in canonical pool.',
      };
    }
    deductChampionCredits(pack.priceCredits);
    for (let i = 0; i < pack.cardCount; i++) {
      const rollIconic = Math.random() < 0.20;
      if (rollIconic && iconicPool.length > 0) {
        drawnCards.push(iconicPool[Math.floor(Math.random() * iconicPool.length)]);
      } else if (legendaryPool.length > 0) {
        drawnCards.push(legendaryPool[Math.floor(Math.random() * legendaryPool.length)]);
      } else {
        drawnCards.push(iconicPool[Math.floor(Math.random() * iconicPool.length)]);
      }
    }
  }
  // ================= 6. STANDARD CATEGORY PACKS =================
  else {
    const categoryPool = getStoreEligibleCardsForCategory(pack.category);
    if (categoryPool.length === 0) {
      return {
        success: false,
        cards: [],
        deductedCredits: 0,
        remainingCredits: currentCredits,
        pack,
        errorMessage: `No cards currently available for ${pack.categoryLabel}.`,
      };
    }

    deductChampionCredits(pack.priceCredits);

    for (let i = 0; i < pack.cardCount; i++) {
      const rolled = rollPackCardTier();
      const matchingTierCards = categoryPool.filter((c) => c.tier === rolled.tier);

      let chosenCard: CustomCard;
      if (matchingTierCards.length > 0) {
        chosenCard = matchingTierCards[Math.floor(Math.random() * matchingTierCards.length)];
      } else {
        chosenCard = categoryPool[Math.floor(Math.random() * categoryPool.length)];
      }
      drawnCards.push(chosenCard);
    }
  }

  // Mark one-time pack as purchased
  if (pack.isOneTime) {
    markOneTimePackPurchased(pack.id);
  }

  // Add all drawn card copies to persistent Store Collection
  addCardsToStoreCollection(drawnCards.map((c) => c.id));

  // Add each obtained copy to pending New Card queue in acquisition order
  addNewCardCopiesToQueue(
    drawnCards.map((c) => ({
      cardId: c.id,
      category: (c.category as StoreCategory) || (pack.category === 'all' ? 'career' : pack.category),
    })),
    pack.id
  );

  return {
    success: true,
    cards: drawnCards,
    deductedCredits: pack.priceCredits,
    remainingCredits: getChampionCredits(),
    pack,
  };
}

// ============================================================================
// DATA SEPARATION & UNIQUE CAREER ACTIVE DECK
// ============================================================================

/**
 * Checks whether a specific card is accessible by default or unlocked in the Unique Career Active Deck.
 * 
 * Rules (Requirement 11):
 * - Default accessible:
 *   - All Bronze positive cards.
 *   - The most basic Double-Edged tier ('obsidian_knife').
 *   - All negative cards according to their existing tier system ('scrap', 'rust', 'ash', 'disaster').
 * - Higher positive tiers (Silver, Gold, Legendary, Iconic) and higher Double-Edged tiers
 *   (Copper Dagger, Steel Blade, Muramasa Blade) are unlocked through Store ownership.
 */
export function isCardEligibleForUniqueCareerActiveDeck(
  card: CustomCard,
  storeCollection?: StoreCollection
): boolean {
  // 1. All negative cards are accessible by default according to existing tier system
  if (
    card.effectCategory === 'negative' ||
    card.tier === 'scrap' ||
    card.tier === 'rust' ||
    card.tier === 'ash' ||
    card.tier === 'disaster'
  ) {
    return true;
  }

  // 2. Most basic Double-Edged tier or 'Obsidian Knife' is accessible by default regardless of tier rules
  if (card.tier === 'obsidian_knife' || card.name.toLowerCase().includes('obsidian knife')) {
    return true;
  }

  // 3. All Bronze positive cards are accessible by default
  if (card.tier === 'bronze') {
    return true;
  }

  // 4. Higher positive tiers (Silver, Gold, Legendary, Iconic)
  // and higher Double-Edged tiers (Copper Dagger, Steel Blade, Muramasa Blade):
  // UNLOCKED ONLY through Store ownership!
  const collection = storeCollection ?? getStoreCollection();
  return (collection[card.id] || 0) > 0;
}

/**
 * Returns all cards from the canonical database that are currently in the player's
 * Unique Career Active Deck (either default accessible or unlocked via owned store copies).
 */
export function getUniqueCareerActiveDeck(collection?: StoreCollection): CustomCard[] {
  const allCards = getAllDefaultCustomCards();
  const currentCollection = collection ?? getStoreCollection();
  return allCards.filter((card) => isCardEligibleForUniqueCareerActiveDeck(card, currentCollection));
}

/**
 * Returns the effective draw copies for a card in the Unique Career Active Deck:
 * - Default accessible cards start with 1 baseline copy.
 * - Store ownership adds additional copies (e.g. Bronze card + 2 store copies = 3 total copies).
 * - Higher tier cards have 0 copies unless owned in the Store Collection.
 */
export function getCardActiveDeckCopies(
  card: CustomCard,
  collection?: StoreCollection
): number {
  const currentCollection = collection ?? getStoreCollection();
  const ownedCount = currentCollection[card.id] || 0;

  const isDefault =
    card.tier === 'bronze' ||
    card.tier === 'obsidian_knife' ||
    card.effectCategory === 'negative' ||
    card.tier === 'scrap' ||
    card.tier === 'rust' ||
    card.tier === 'ash' ||
    card.tier === 'disaster';

  if (isDefault) {
    return 1 + ownedCount;
  }

  return ownedCount;
}

/**
 * Constructs the active draw pool for a specific category:
 * - Every eligible card is added as many times as its active deck copy count (card copies).
 * - Every individual copy has equal probability (1 / total copies) — no rarity or tier weighting.
 * - Duplicates matter: a card with 4 copies appears 4 times in the pool.
 * - Strict category isolation: only cards matching the requested category are included.
 */
export function getUniqueCareerCategoryDrawPool(
  category: StoreCategory,
  collection?: StoreCollection
): CustomCard[] {
  const currentCollection = collection ?? getStoreCollection();
  const categoryCards = getStoreEligibleCardsForCategory(category);
  const pool: CustomCard[] = [];

  for (const card of categoryCards) {
    if (isCardEligibleForUniqueCareerActiveDeck(card, currentCollection)) {
      const copies = getCardActiveDeckCopies(card, currentCollection);
      for (let i = 0; i < copies; i++) {
        pool.push(card);
      }
    }
  }

  // Safety fallback if pool is empty
  if (pool.length === 0) {
    for (const card of categoryCards) {
      if (
        card.tier === 'bronze' ||
        card.effectCategory === 'negative' ||
        card.tier === 'obsidian_knife'
      ) {
        pool.push(card);
      }
    }
  }

  return pool;
}

/**
 * Draws `count` cards from a specific category's Unique Career active deck.
 * - NEW CARD GUARANTEE: If the player has pending New Cards in this category,
 *   the newest obtained New Card is guaranteed to appear in the first slot (Requirement 2, 5).
 * - Consumption: Drawing the New Card consumes its New Card status immediately (Requirement 6, 7).
 * - Single Draw Guarantee Limit: Only ONE New Card guarantee is consumed per choice draw event (Requirement 8).
 * - Remaining slots are filled using the normal draw pool, where each owned copy in the active deck
 *   has equal probability (no rarity weighting, no tier weighting).
 */
export function drawUniqueCareerCategoryCards(
  category: StoreCategory,
  count: number = 4,
  collection?: StoreCollection,
  options?: { filter?: (c: CustomCard) => boolean; skipNewCardGuarantee?: boolean }
): (CustomCard & { isNewCardGuaranteed?: boolean })[] {
  const rawPool = getUniqueCareerCategoryDrawPool(category, collection);
  const pool = options?.filter ? rawPool.filter(options.filter) : rawPool;

  const chosen: (CustomCard & { isNewCardGuaranteed?: boolean })[] = [];
  const chosenIds = new Set<string>();

  // 1. CHECK AND APPLY NEW CARD GUARANTEE (Requirement 2, 5, 6, 7, 8)
  // Only ONE New Card guarantee may be consumed per draw event (Section 8).
  // Uses newest-first priority (LIFO queue).
  if (!options?.skipNewCardGuarantee) {
    const pendingItems = getPendingNewCardsForCategory(category);
    if (pendingItems.length > 0) {
      const allCards = getAllDefaultCustomCards();

      // Find newest pending card that satisfies optional filter
      let targetItemIndex = -1;
      let matchedCardDef: CustomCard | undefined;

      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        const def = allCards.find((c) => c.id === item.cardId);
        if (def && (!options?.filter || options.filter(def))) {
          targetItemIndex = i;
          matchedCardDef = def;
          break;
        }
      }

      if (matchedCardDef && targetItemIndex !== -1) {
        // Consume this individual copy from the persistent category queue
        const queues = getNewCardQueues();
        const catQueue = queues[category] || [];
        const itemToConsume = pendingItems[targetItemIndex];
        const queueIdx = catQueue.findIndex((q) => q.id === itemToConsume.id);
        if (queueIdx !== -1) {
          catQueue.splice(queueIdx, 1);
          queues[category] = catQueue;
          saveNewCardQueues(queues);
        }

        const guaranteedCard = {
          ...matchedCardDef,
          isNewCardGuaranteed: true,
        };
        chosen.push(guaranteedCard);
        chosenIds.add(guaranteedCard.id);
      }
    }
  }

  if (pool.length === 0 && chosen.length === 0) {
    return [];
  }

  // 2. FILL REMAINING SLOTS
  // PARENT CARDS: Parent Card probabilities remain EXACTLY UNCHANGED (Requirement 1)
  if (category === 'parents') {
    const distinctCardIds = Array.from(new Set(pool.map((c) => c.id)));
    const maxDistinctPicks = Math.min(
      count,
      distinctCardIds.length + (chosen.length > 0 && !distinctCardIds.includes(chosen[0].id) ? 1 : 0)
    );

    let remainingPool = pool.filter((c) => !chosenIds.has(c.id));
    if (remainingPool.length === 0 && pool.length > 0) {
      remainingPool = [...pool];
    }

    while (chosen.length < count && remainingPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingPool.length);
      const candidate = remainingPool[randomIndex];

      if (!chosenIds.has(candidate.id) || chosen.length >= maxDistinctPicks) {
        chosen.push(candidate);
        chosenIds.add(candidate.id);
        if (chosen.length < maxDistinctPicks) {
          remainingPool = remainingPool.filter((c) => c.id !== candidate.id);
        }
      } else {
        remainingPool = remainingPool.filter((c) => c.id !== candidate.id);
      }
    }

    return chosen;
  }

  // ALL OTHER UNIQUE CAREER CARD DRAWS (Requirement 1):
  // For each card category independently:
  // - 30% base chance: draw a Negative Card.
  // - 70% chance: draw from the player's eligible positive/normal card collection for that category.
  // The 70% portion is evenly distributed among the eligible cards in the player's collection for that category.
  // Each individual card copy remains an independent entry.

  const negativePool = pool.filter((c) => isNegativeCard(c));
  const positivePool = pool.filter((c) => !isNegativeCard(c));

  // Fallback if category has no negative cards in player collection: retrieve from canonical pool for this category
  const fallbackNegativePool =
    negativePool.length > 0
      ? negativePool
      : getStoreEligibleCardsForCategory(category).filter((c) => isNegativeCard(c));

  const distinctCardIds = Array.from(new Set(pool.map((c) => c.id)));
  const maxDistinctPicks = Math.min(
    count,
    distinctCardIds.length + (chosen.length > 0 && !distinctCardIds.includes(chosen[0].id) ? 1 : 0)
  );

  let curPositivePool = positivePool.filter((c) => !chosenIds.has(c.id));
  let curNegativePool = fallbackNegativePool.filter((c) => !chosenIds.has(c.id));

  while (chosen.length < count) {
    const rollNegative = Math.random() < 0.30;
    let candidate: CustomCard | undefined;

    if (rollNegative) {
      // 30% Chance: Draw a Negative Card
      const negSource =
        curNegativePool.length > 0
          ? curNegativePool
          : fallbackNegativePool.length > 0
          ? fallbackNegativePool
          : curPositivePool.length > 0
          ? curPositivePool
          : positivePool;

      if (negSource.length > 0) {
        const idx = Math.floor(Math.random() * negSource.length);
        candidate = negSource[idx];
      }
    } else {
      // 70% Chance: Draw from player's eligible positive/normal card collection (evenly distributed)
      const posSource =
        curPositivePool.length > 0
          ? curPositivePool
          : positivePool.length > 0
          ? positivePool
          : curNegativePool.length > 0
          ? curNegativePool
          : fallbackNegativePool;

      if (posSource.length > 0) {
        const idx = Math.floor(Math.random() * posSource.length);
        candidate = posSource[idx];
      }
    }

    if (!candidate) {
      // Fallback if somehow no cards found
      if (pool.length > 0) {
        candidate = pool[Math.floor(Math.random() * pool.length)];
      } else {
        break;
      }
    }

    if (!chosenIds.has(candidate.id) || chosen.length >= maxDistinctPicks) {
      chosen.push(candidate);
      chosenIds.add(candidate.id);

      if (chosen.length < maxDistinctPicks) {
        curPositivePool = curPositivePool.filter((c) => c.id !== candidate!.id);
        curNegativePool = curNegativePool.filter((c) => c.id !== candidate!.id);
      }
    } else {
      // If duplicate and we can still find distinct, remove candidate and retry
      curPositivePool = curPositivePool.filter((c) => c.id !== candidate.id);
      curNegativePool = curNegativePool.filter((c) => c.id !== candidate.id);
      if (curPositivePool.length === 0 && curNegativePool.length === 0) {
        // Allow duplicate if exhausted
        chosen.push(candidate);
        chosenIds.add(candidate.id);
      }
    }
  }

  return chosen;
}

/**
 * Returns statistics for the active deck across all 7 categories
 */
export function getUniqueCareerActiveDeckStats(collection?: StoreCollection) {
  const currentCollection = collection ?? getStoreCollection();
  const allCards = getAllDefaultCustomCards();

  const categories: StoreCategory[] = ['parents', 'youth', 'career', 'sponsor', 'life', 'agent', 'street'];
  const breakdown: Record<StoreCategory, { totalEligibleDefinitions: number; totalCopies: number }> = {
    parents: { totalEligibleDefinitions: 0, totalCopies: 0 },
    youth: { totalEligibleDefinitions: 0, totalCopies: 0 },
    career: { totalEligibleDefinitions: 0, totalCopies: 0 },
    sponsor: { totalEligibleDefinitions: 0, totalCopies: 0 },
    life: { totalEligibleDefinitions: 0, totalCopies: 0 },
    agent: { totalEligibleDefinitions: 0, totalCopies: 0 },
    street: { totalEligibleDefinitions: 0, totalCopies: 0 },
  };

  let grandTotalDefinitions = 0;
  let grandTotalCopies = 0;

  for (const cat of categories) {
    const catPool = getStoreEligibleCardsForCategory(cat);
    for (const card of catPool) {
      if (isCardEligibleForUniqueCareerActiveDeck(card, currentCollection)) {
        const copies = getCardActiveDeckCopies(card, currentCollection);
        breakdown[cat].totalEligibleDefinitions++;
        breakdown[cat].totalCopies += copies;
        grandTotalDefinitions++;
        grandTotalCopies += copies;
      }
    }
  }

  return {
    grandTotalDefinitions,
    grandTotalCopies,
    breakdown,
  };
}
