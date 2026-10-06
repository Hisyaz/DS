/**
 * Origin Last Name System
 * 
 * Manages player last name options based on starter city origins and parent card family heritage.
 * Allows switching between the original last name assigned by the parent card and the origin last name
 * based on the starter city, with future extensibility for additional last names.
 * 
 * Starter City Mappings:
 * - Madrid: "De Madrid"
 * - São Paulo: "Paulista"
 * - London: "Londoner"
 * - Buenos Aires: "El Porteño"
 * - Paris: "Parisien" (fallback for other starting cities)
 * - Roma: "Romano" (fallback for other starting cities)
 * 
 * Name Formatting:
 * All first and last names are formatted so that the first letter of each word is Upper caps
 * and the rest lower caps (Title Case) consistently.
 */

import { PlayerCardData } from '../types';

/**
 * Formats a person's name (first name, last name, or full name)
 * so that the first letter of each word is capitalized and the rest is lowercase.
 * Handles hyphens (e.g. Jean-Luc), apostrophes (e.g. O'Connor), accents (e.g. São Paulo, Fernández, Porteño),
 * and particles (e.g. De Madrid, El Porteño, Van Dijk).
 */
export function formatPersonName(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  // Preserve double-quotes if wrapped in nickname quotes
  const hasQuotes = (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"));
  const clean = hasQuotes ? trimmed.slice(1, -1).trim() : trimmed;

  // Convert to title case (first letter of each word uppercase, rest lowercase)
  const formatted = clean
    .toLowerCase()
    .replace(/(^|[\s\-'/])(\p{L})/gu, (_, sep, char) => `${sep}${char.toUpperCase()}`);

  return hasQuotes ? `"${formatted}"` : formatted;
}

/**
 * Returns the designated Origin Last Name based on the player's starter city.
 */
export function getOriginLastNameForCity(cityOrHometown?: string): string {
  if (!cityOrHometown) return 'De Madrid';
  const norm = cityOrHometown.toLowerCase();

  if (norm.includes('madrid')) {
    return 'De Madrid';
  }
  if (norm.includes('são paulo') || norm.includes('sao paulo')) {
    return 'Paulista';
  }
  if (norm.includes('london')) {
    return 'Londoner';
  }
  if (norm.includes('buenos aires')) {
    return 'El Porteño';
  }
  if (norm.includes('paris')) {
    return 'Parisien';
  }
  if (norm.includes('roma') || norm.includes('rome')) {
    return 'Romano';
  }
  if (norm.includes('berlin')) {
    return 'Berliner';
  }
  if (norm.includes('lisboa') || norm.includes('lisbon')) {
    return 'Alfacinha';
  }

  // Fallback default
  return 'De Madrid';
}

/**
 * Returns a clean readable name for the city (without country)
 */
export function getOriginCityDisplayName(cityOrHometown?: string): string {
  if (!cityOrHometown) return 'Madrid';
  const norm = cityOrHometown.toLowerCase();

  if (norm.includes('madrid')) return 'Madrid';
  if (norm.includes('são paulo') || norm.includes('sao paulo')) return 'São Paulo';
  if (norm.includes('london')) return 'London';
  if (norm.includes('buenos aires')) return 'Buenos Aires';
  if (norm.includes('paris')) return 'Paris';
  if (norm.includes('roma') || norm.includes('rome')) return 'Roma';
  if (norm.includes('berlin')) return 'Berlin';
  if (norm.includes('lisboa') || norm.includes('lisbon')) return 'Lisboa';

  return cityOrHometown.split(',')[0].trim();
}

export interface AvailableLastNameOption {
  id: 'original' | 'origin';
  type: 'original' | 'origin';
  title: string;
  label: string;
  lastName: string;
  name: string;
  subtitle: string;
  description: string;
  cityName?: string;
  isEquipped: boolean;
  previewFullName: string;
}

/**
 * Retrieves the available last name options for a player:
 * 1. Original family last name assigned by the parent card
 * 2. Origin last name based on the starter city
 * (Extensible for future last names)
 */
export function getAvailableLastNames(player: PlayerCardData): AvailableLastNameOption[] {
  const city = player.startingCity || player.city;
  const originLastName = getOriginLastNameForCity(city);
  const cityName = getOriginCityDisplayName(city);

  // Determine original parent card / birth last name
  const rawOriginal =
    player.originalLastName ||
    player.birthLastName ||
    player.familyName ||
    player.equippedParentCard?.familyName ||
    'Fernández';
  const originalLastName = formatPersonName(rawOriginal);

  // Determine which is currently equipped
  const currentLastName = formatPersonName(player.lastName || originalLastName);
  const selectedType = player.selectedLastNameType || (currentLastName === originLastName ? 'origin' : 'original');

  const firstName = formatPersonName(
    player.firstName ||
    player.originalFirstName ||
    player.birthFirstName ||
    'Mateo'
  );
  const hasActiveNickname = Boolean(player.nickname && player.nicknameAccepted && player.nickname.trim());
  const activeNick = hasActiveNickname ? player.nickname!.trim() : '';

  const buildPreview = (lName: string) => {
    if (activeNick) {
      return `${activeNick} ${lName}`;
    }
    const suffix = player.nameSuffix?.trim() ? ` ${player.nameSuffix.trim()}` : '';
    return `${firstName} ${lName}${suffix}`.trim();
  };

  return [
    {
      id: 'original',
      type: 'original',
      title: 'Original Family Name',
      label: 'Original Family Name',
      lastName: originalLastName,
      name: originalLastName,
      subtitle: 'Assigned by Parent Card & Family Heritage',
      description: 'Assigned by Parent Card & Family Heritage',
      isEquipped: selectedType === 'original',
      previewFullName: buildPreview(originalLastName),
    },
    {
      id: 'origin',
      type: 'origin',
      title: 'Origin Last Name',
      label: 'Origin Last Name',
      lastName: originLastName,
      name: originLastName,
      subtitle: `Starter City Heritage: ${cityName}`,
      description: `Starter City Heritage: ${cityName}`,
      cityName,
      isEquipped: selectedType === 'origin',
      previewFullName: buildPreview(originLastName),
    },
  ];
}

/**
 * Switches the player's active last name between their original family name and their starter city origin last name.
 * Updates player.lastName, player.selectedLastNameType, and rebuilds the player's full matchday name.
 */
export function switchPlayerLastName(
  player: PlayerCardData,
  targetType: 'original' | 'origin'
): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));

  const city = player.startingCity || player.city;
  const originLastName = getOriginLastNameForCity(city);
  
  const rawOriginal =
    player.originalLastName ||
    player.birthLastName ||
    player.familyName ||
    player.equippedParentCard?.familyName ||
    'Fernández';
  const originalLastName = formatPersonName(rawOriginal);

  // Preserve original last name and origin last name permanently
  updated.originalLastName = originalLastName;
  updated.originLastName = originLastName;
  updated.selectedLastNameType = targetType;

  const targetLastName = targetType === 'origin' ? originLastName : originalLastName;
  updated.lastName = targetLastName;

  const firstName = formatPersonName(
    player.firstName ||
    player.originalFirstName ||
    player.birthFirstName ||
    'Mateo'
  );
  updated.firstName = firstName;
  if (!updated.birthFirstName) {
    updated.birthFirstName = firstName;
  }
  if (!updated.originalFirstName) {
    updated.originalFirstName = firstName;
  }

  // Update full matchday name
  const hasActiveNickname = Boolean(player.nickname && player.nicknameAccepted && player.nickname.trim());
  if (hasActiveNickname) {
    const nick = player.nickname!.trim();
    const suffix = player.nameSuffix?.trim() ? ` ${player.nameSuffix.trim()}` : '';
    updated.name = `${nick} ${targetLastName}${suffix}`.trim();
  } else {
    const suffix = player.nameSuffix?.trim() ? ` ${player.nameSuffix.trim()}` : '';
    updated.name = `${firstName} ${targetLastName}${suffix}`.trim();
    updated.birthFullName = updated.name;
    updated.birthLastName = targetLastName;
  }

  return updated;
}
