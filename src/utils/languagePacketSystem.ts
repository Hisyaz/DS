import { LanguagePacket, PacketValidationResult } from '../types/languagePacket';
import { DEFAULT_UK_ENGLISH_PACKET } from '../data/defaultLanguagePacket';
import { DEFAULT_ARGENTINEAN_SPANISH_PACKET } from '../data/argentineanSpanishLanguagePacket';
import { DEFAULT_CASTILIAN_SPANISH_PACKET } from '../data/castilianSpanishLanguagePacket';
import { safeGetItem, safeSetItem, safeRemoveItem } from './storageCleaner';

const PACKET_STORAGE_KEY = 'FOOTBALL_CAREER_ACTIVE_LANGUAGE_PACKET_V1';
const PACKET_UNLOADED_FLAG_KEY = 'FOOTBALL_CAREER_LANGUAGE_PACKET_UNLOADED_V1';
const LOCALE_STORAGE_KEY = 'FOOTBALLER_CAREER_UI_LANGUAGE_V1';

export const BUILTIN_LANGUAGE_PACKETS: Record<string, LanguagePacket> = {
  'en-GB': DEFAULT_UK_ENGLISH_PACKET,
  'es-ES': DEFAULT_CASTILIAN_SPANISH_PACKET,
  'es-AR': DEFAULT_ARGENTINEAN_SPANISH_PACKET,
};

type PacketChangeListener = (packet: LanguagePacket | null) => void;
const packetListeners: Set<PacketChangeListener> = new Set();

let activePacket: LanguagePacket | null = null;

// Initialize on module load
try {
  const isExplicitlyUnloaded = safeGetItem(PACKET_UNLOADED_FLAG_KEY) === 'true';
  if (isExplicitlyUnloaded) {
    activePacket = null;
  } else {
    const savedCustomPacket = safeGetItem(PACKET_STORAGE_KEY);
    if (savedCustomPacket) {
      const parsed = JSON.parse(savedCustomPacket);
      if (parsed && parsed.translations && typeof parsed.translations === 'object') {
        activePacket = parsed;
      } else {
        const storedLang = safeGetItem(LOCALE_STORAGE_KEY) || 'es-ES';
        activePacket = BUILTIN_LANGUAGE_PACKETS[storedLang] || DEFAULT_CASTILIAN_SPANISH_PACKET;
      }
    } else {
      const storedLang = safeGetItem(LOCALE_STORAGE_KEY) || 'es-ES';
      activePacket = BUILTIN_LANGUAGE_PACKETS[storedLang] || DEFAULT_CASTILIAN_SPANISH_PACKET;
    }
  }
} catch (e) {
  console.warn('Could not restore language packet, falling back to Castilian Spanish:', e);
  activePacket = DEFAULT_CASTILIAN_SPANISH_PACKET;
}

export function getActiveLanguagePacket(): LanguagePacket | null {
  return activePacket;
}

export function isLanguagePacketLoaded(): boolean {
  return activePacket !== null && activePacket.translations !== undefined;
}

/**
 * Checks whether a language code has an available language packet
 * (either built-in official packet, or a loaded custom packet matching the code).
 */
export function hasLanguagePacket(languageCode: string): boolean {
  if (BUILTIN_LANGUAGE_PACKETS[languageCode]) {
    return true;
  }
  if (activePacket && activePacket.meta?.languageCode === languageCode) {
    return true;
  }
  return false;
}

/**
 * Loads a built-in language packet (e.g. 'en-GB' or 'es-AR') into the active state.
 */
export function loadBuiltinLanguagePacket(languageCode: string): boolean {
  const builtin = BUILTIN_LANGUAGE_PACKETS[languageCode];
  if (!builtin) {
    return false;
  }
  activePacket = builtin;
  safeRemoveItem(PACKET_UNLOADED_FLAG_KEY);
  safeRemoveItem(PACKET_STORAGE_KEY);
  notifyPacketListeners();
  return true;
}

export function subscribeLanguagePacket(listener: PacketChangeListener): () => void {
  packetListeners.add(listener);
  return () => {
    packetListeners.delete(listener);
  };
}

function notifyPacketListeners() {
  packetListeners.forEach((listener) => listener(activePacket));
}

/**
 * Loads a custom or official language packet into the runtime
 */
export function loadLanguagePacket(packet: LanguagePacket): { success: boolean; message: string; keyCount: number } {
  const validation = validateLanguagePacket(packet);
  if (!validation.valid || !validation.packet) {
    return {
      success: false,
      message: validation.error || 'Invalid Language Packet format.',
      keyCount: 0,
    };
  }

  activePacket = validation.packet;
  safeRemoveItem(PACKET_UNLOADED_FLAG_KEY);
  try {
    safeSetItem(PACKET_STORAGE_KEY, JSON.stringify(validation.packet));
  } catch (e) {
    console.warn('Could not persist custom language packet to localStorage:', e);
  }

  notifyPacketListeners();

  return {
    success: true,
    message: `Successfully loaded "${validation.packet.meta.languageName}" with ${validation.keyCount} localized keys!`,
    keyCount: validation.keyCount || 0,
  };
}

/**
 * Unloads the active language packet completely.
 * When unloaded, the game has NO text showing (t() returns "") as requested.
 */
export function unloadLanguagePacket(): void {
  activePacket = null;
  safeSetItem(PACKET_UNLOADED_FLAG_KEY, 'true');
  safeRemoveItem(PACKET_STORAGE_KEY);
  notifyPacketListeners();
}

/**
 * Resets the game to the default official UK English Language Packet.
 */
export function resetToDefaultUkEnglishPacket(): void {
  activePacket = DEFAULT_UK_ENGLISH_PACKET;
  safeRemoveItem(PACKET_UNLOADED_FLAG_KEY);
  safeRemoveItem(PACKET_STORAGE_KEY);
  notifyPacketListeners();
}

/**
 * Resets the game to the official Castilian Spanish Language Packet.
 */
export function resetToDefaultCastilianSpanishPacket(): void {
  activePacket = DEFAULT_CASTILIAN_SPANISH_PACKET;
  safeRemoveItem(PACKET_UNLOADED_FLAG_KEY);
  safeRemoveItem(PACKET_STORAGE_KEY);
  notifyPacketListeners();
}

/**
 * Resets the game to the official Argentinean Spanish Language Packet.
 */
export function resetToDefaultArgentineanSpanishPacket(): void {
  activePacket = DEFAULT_ARGENTINEAN_SPANISH_PACKET;
  safeRemoveItem(PACKET_UNLOADED_FLAG_KEY);
  safeRemoveItem(PACKET_STORAGE_KEY);
  notifyPacketListeners();
}

/**
 * Validates a language packet structure.
 */
export function validateLanguagePacket(data: any): PacketValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Packet data must be a valid JSON object.' };
  }

  // Check translations object
  const translations = data.translations;
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return { valid: false, error: 'Packet missing required "translations" object.' };
  }

  const keys = Object.keys(translations);
  if (keys.length === 0) {
    return { valid: false, error: 'Packet "translations" dictionary is empty.' };
  }

  // Check or build meta
  const rawMeta = data.meta || {};
  const meta = {
    formatVersion: '1.0.0' as const,
    packetId: rawMeta.packetId || `custom-${rawMeta.languageCode || 'unknown'}-${Date.now()}`,
    languageCode: rawMeta.languageCode || 'en-GB',
    languageName: rawMeta.languageName || 'Custom Language',
    nativeName: rawMeta.nativeName || rawMeta.languageName || 'Custom Language',
    region: rawMeta.region || 'Global',
    flag: rawMeta.flag || '🌐',
    author: rawMeta.author || 'Custom Community Author',
    description: rawMeta.description || 'Custom Language Packet for Footballer Career Videogame',
    createdAt: rawMeta.createdAt || new Date().toISOString(),
    totalKeys: keys.length,
  };

  const cleanPacket: LanguagePacket = {
    meta,
    translations,
  };

  return {
    valid: true,
    packet: cleanPacket,
    keyCount: keys.length,
  };
}

/**
 * Returns formatted JSON string of a packet (or active packet if none provided).
 */
export function exportLanguagePacketJson(packet?: LanguagePacket): string {
  const target = packet || activePacket || DEFAULT_UK_ENGLISH_PACKET;
  return JSON.stringify(target, null, 2);
}

/**
 * Triggers a browser download of the Language Packet JSON file.
 */
export function downloadLanguagePacketFile(packet?: LanguagePacket): void {
  const target = packet || activePacket || DEFAULT_UK_ENGLISH_PACKET;
  const jsonStr = JSON.stringify(target, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const code = target.meta?.languageCode?.replace('-', '_') || 'en_GB';
  const filename = `language_packet_${code}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
