import { TrophyItem, PlayerCardData } from '../types';

/**
 * Creates a standardized TrophyItem with proper categories and icons.
 */
export function createTrophyItem(params: {
  name: string;
  category: 'national' | 'continental' | 'international' | 'youth' | 'individual' | 'friendly';
  year: number | string;
  prestige?: number;
  iconType: 'world-cup' | 'champions-league' | 'league' | 'cup' | 'ballon-dor' | 'golden-boot' | 'best-player' | 'youth-trophy' | 'super-cup' | 'olympic-gold' | 'europa-league' | 'libertadores' | 'club-world-cup' | 'continental' | 'friendly';
  count?: number;
}): TrophyItem {
  const yr = String(params.year);
  const defaultPrestige =
    params.category === 'international'
      ? 95
      : params.category === 'continental'
      ? 90
      : params.category === 'individual'
      ? 85
      : params.category === 'national'
      ? 75
      : params.category === 'youth'
      ? 60
      : 55;

  return {
    id: `trophy-${params.category}-${params.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${yr}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: params.name,
    category: params.category,
    year: yr,
    prestige: params.prestige ?? defaultPrestige,
    iconType: params.iconType,
    count: params.count || 1,
  };
}

export interface NewTrophyParam {
  id?: string;
  name: string;
  category: 'national' | 'continental' | 'international' | 'youth' | 'individual' | 'friendly';
  year: number | string;
  prestige?: number;
  iconType: 'world-cup' | 'champions-league' | 'league' | 'cup' | 'ballon-dor' | 'golden-boot' | 'best-player' | 'youth-trophy' | 'super-cup' | 'olympic-gold' | 'europa-league' | 'libertadores' | 'club-world-cup' | 'continental' | 'friendly';
  count?: number;
}

/**
 * Awards one or multiple trophies to the player's career trophy cabinet,
 * avoiding duplicate entries for the exact same competition in the same year.
 */
export function awardTrophiesToPlayer(
  player: PlayerCardData,
  newTrophies: NewTrophyParam[]
): PlayerCardData {
  if (!newTrophies || newTrophies.length === 0) return player;

  const existingTrophies = [...(player.trophies || [])];
  let gainedFame = 0;

  for (const rawTrophy of newTrophies) {
    const trophyNameLower = rawTrophy.name.trim().toLowerCase();
    const trophyYearStr = String(rawTrophy.year).trim();

    const alreadyAwarded = existingTrophies.some(
      (t) =>
        t.name.trim().toLowerCase() === trophyNameLower &&
        String(t.year).trim() === trophyYearStr
    );

    if (!alreadyAwarded) {
      const trophyItem: TrophyItem =
        'id' in rawTrophy && rawTrophy.id
          ? (rawTrophy as TrophyItem)
          : createTrophyItem({
              name: rawTrophy.name,
              category: rawTrophy.category,
              year: rawTrophy.year,
              prestige: rawTrophy.prestige,
              iconType: rawTrophy.iconType,
              count: rawTrophy.count,
            });

      existingTrophies.push(trophyItem);
      gainedFame += Math.round((trophyItem.prestige || 50) * 0.5);
    }
  }

  return {
    ...player,
    fame: (player.fame || 0) + gainedFame,
    trophies: existingTrophies,
  };
}
