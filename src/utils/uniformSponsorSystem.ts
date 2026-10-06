import { KitConfig, SponsorDesignConfig, SponsorWritingStyle, SponsorBorderStyle } from '../types';
import { EditorTeamData } from '../types/leagueEditor';

// Authentic premier club main shirt sponsors fallback dictionary
const FAMOUS_CLUB_MAIN_SPONSORS: Record<string, string> = {
  // England
  eng_mancity: 'ETIHAD AIRWAYS',
  eng_arsenal: 'FLY EMIRATES',
  eng_liverpool: 'STANDARD CHARTERED',
  eng_chelsea: 'INFINITE ATHLETE',
  eng_manutd: 'SNAPDRAGON',
  eng_tottenham: 'AIA',
  eng_newcastle: 'SELA',
  eng_astonvilla: 'BETANO',
  eng_westham: 'BETWAY',
  eng_brighton: 'AMERICAN EXPRESS',
  eng_everton: 'STAKE.COM',
  eng_wolves: 'DEBET',
  eng_fulham: 'SBOTOP',
  eng_brentford: 'HOLLYWOODBETS',
  eng_palace: 'NET88',
  eng_bournemouth: 'BJ88',
  eng_nottingham: 'KAIYUN',
  eng_leicester: 'BC.GAME',
  eng_southampton: 'ROLLBIT',
  eng_ipswich: '+ - = ÷ ×',
  // Spain
  esp_realmadrid: 'EMIRATES',
  esp_barcelona: 'SPOTIFY',
  esp_atletico: 'RIYADH AIR',
  esp_athletic: 'KUTXABANK',
  esp_realsociedad: 'YASUDA GROUP',
  esp_betis: 'FIATC',
  esp_sevilla: 'GREE',
  esp_villarreal: 'PAMESA CERÁMICA',
  esp_valencia: 'TM REAL ESTATE',
  esp_rayo: 'DIGI',
  // Italy
  ita_inter: 'BETSSON.SPORT',
  ita_juventus: 'JEEP',
  ita_milan: 'EMIRATES',
  ita_napoli: 'MSC CROCIERE',
  ita_roma: 'RIYADH SEASON',
  ita_lazio: 'BINANCE',
  ita_atalanta: 'LET EAT BI',
  ita_fiorentina: 'MEDIAWORLD',
  ita_bologna: 'SAPIO',
  // Germany
  ger_bayern: '· T ···',
  ger_dortmund: '1&1',
  ger_leverkusen: 'BARMENIA',
  ger_leipzig: 'RED BULL',
  ger_frankfurt: 'INDEED',
  ger_stuttgart: 'WINAMAX',
  // France
  fr_psg: 'QATAR AIRWAYS',
  fr_marseille: 'CMA CGM',
  fr_monaco: 'APM MONACO',
  fr_lyon: 'EMIRATES',
  fr_lille: 'BOULANGER',
  // South America
  arg_boca: 'BETSSON',
  arg_river: 'DIRECTV',
  bra_flamengo: 'PIXBET',
  bra_palmeiras: 'CREFISA',
  bra_saopaulo: 'SUPERBET',
  bra_corinthians: 'VAI DE BET',
  bra_santos: 'BLAZE',
  bra_gremio: 'BANRISUL',
  bra_internacional: 'BANRISUL',
  bra_atletico_mg: 'BETANO',
  bra_botafogo: 'PARIMATCH',
  bra_vasco: 'ESTRELA BET',
  bra_cruzeiro: 'BETFAIR',
  bra_fluminense: 'SUPERBET',
  // Saudi Arabia
  ksa_alhilal: 'SAVVY GAMES',
  ksa_alnassr: 'KAFD',
  ksa_alittihad: 'ROSHN',
  ksa_alahli: 'RED SEA GLOBAL',
};

/**
 * Normalizes hex colors and converts them to RGB components.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [128, 128, 128];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Calculates WCAG relative luminance from an RGB tuple.
 */
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates WCAG contrast ratio between two hex colors (1.0 to 21.0).
 */
export function calculateContrastRatio(colorA: string, colorB: string): number {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/**
 * Identifies the dominant background color right behind the chest sponsor area.
 */
export function getJerseyBackgroundAtChest(kit: KitConfig): string {
  if (kit.pattern === 'horizontal-middle-strip') {
    // The sponsor is placed directly on the middle band!
    return kit.color2;
  }
  if (kit.pattern === 'solid-line') {
    // Central vertical stripe runs right behind the sponsor text center
    return kit.color2;
  }
  return kit.color1;
}

/**
 * Suggests a high contrast text color (either crisp white or rich black/navy) against a background.
 */
export function getContrastingLetterColor(backgroundHex: string): string {
  const [r, g, b] = hexToRgb(backgroundHex);
  const lum = getLuminance(r, g, b);
  return lum > 0.4 ? '#090d16' : '#ffffff';
}

/**
 * Retrieves the team's main shirt sponsor from their Finances / Economy data.
 * Adheres to rule:
 * 1. Checks sponsor labeled category === 'main_shirt'.
 * 2. If not labeled or ties, takes the one that pays the most (highest annualPayment).
 * 3. Falls back to famous club sponsors if available.
 */
export function getClubMainShirtSponsor(
  team?: EditorTeamData | null
): { name: string; payment: number } | null {
  if (!team) return null;

  // 1. Check if team has real sponsors configured in their finances
  if (team.finances?.sponsors && team.finances.sponsors.length > 0) {
    const sponsors = team.finances.sponsors;
    const mainShirt = sponsors.find(
      (s) => s.category === 'main_shirt' && s.name?.trim()
    );
    if (mainShirt) {
      return { name: mainShirt.name.trim(), payment: mainShirt.annualPayment || 0 };
    }

    // Sort by payment descending (the one that pays the most)
    const sorted = [...sponsors]
      .filter((s) => s.name && s.name.trim().length > 0)
      .sort((a, b) => (b.annualPayment || 0) - (a.annualPayment || 0));

    if (sorted.length > 0 && sorted[0].name) {
      return { name: sorted[0].name.trim(), payment: sorted[0].annualPayment || 0 };
    }
  }

  // 2. Check famous preset sponsors for authentic feel
  if (team.id && FAMOUS_CLUB_MAIN_SPONSORS[team.id]) {
    return { name: FAMOUS_CLUB_MAIN_SPONSORS[team.id], payment: 35000000 };
  }

  return null;
}

/**
 * Readability evaluation results.
 */
export interface SponsorReadabilityResult {
  isLowContrast: boolean;
  contrastRatio: number;
  effectiveBackground: string;
  warningMessage?: string;
  suggestedLetterColor: string;
  suggestedBorderColor: string;
}

/**
 * Checks readability of the sponsor configuration against the jersey pattern.
 */
export function checkSponsorReadability(
  kit: KitConfig,
  sponsor?: SponsorDesignConfig
): SponsorReadabilityResult {
  const bg = getJerseyBackgroundAtChest(kit);
  const letterColor = sponsor?.letterColor || getContrastingLetterColor(bg);
  const borderStyle = sponsor?.borderStyle || 'none';
  const borderColor = sponsor?.borderColor || (letterColor === '#ffffff' ? '#000000' : '#ffffff');

  let ratio = calculateContrastRatio(letterColor, bg);

  // If a medium/thick border is present, contrast is significantly bolstered
  if (borderStyle !== 'none') {
    const borderRatio = calculateContrastRatio(borderColor, bg);
    if (borderRatio > ratio) {
      ratio = Math.max(ratio, Math.min(borderRatio * 0.85, 8.0));
    }
  }

  const isLow = ratio < 2.8;
  const suggestedLetter = getContrastingLetterColor(bg);
  const suggestedBorder = suggestedLetter === '#ffffff' ? '#0f172a' : '#ffffff';

  return {
    isLowContrast: isLow,
    contrastRatio: ratio,
    effectiveBackground: bg,
    warningMessage: isLow
      ? `Sponsor letter color (${letterColor}) has low contrast (${ratio}:1) against the jersey backdrop. Consider using ${suggestedLetter} or adding a contrasting border.`
      : undefined,
    suggestedLetterColor: suggestedLetter,
    suggestedBorderColor: suggestedBorder,
  };
}

/**
 * Resolves the final effective sponsor configuration to render on a shirt.
 * Automatically populates the sponsor from the team's economy/finances without requiring manual typing.
 */
export function resolveEffectiveSponsor(
  kit?: KitConfig | null,
  team?: EditorTeamData | null,
  fallbackSponsorName?: string
): SponsorDesignConfig | null {
  // If kit explicitly has sponsor with enabled === false, return null
  if (kit?.sponsor && kit.sponsor.enabled === false) {
    return null;
  }

  // 1. Explicit sponsor name in kit
  let sponsorName = kit?.sponsor?.name?.trim();

  // 2. Auto-populate from team finances / economy
  if (!sponsorName && team) {
    const clubMain = getClubMainShirtSponsor(team);
    if (clubMain?.name) {
      sponsorName = clubMain.name;
    }
  }

  // 3. Optional fallback
  if (!sponsorName && fallbackSponsorName) {
    const cleaned = fallbackSponsorName.trim();
    if (
      cleaned &&
      cleaned !== 'Youth Prospect' &&
      cleaned !== 'Free Agent' &&
      cleaned !== 'Unassigned'
    ) {
      sponsorName = cleaned;
    }
  }

  if (!sponsorName) {
    return null;
  }

  const bg = kit ? getJerseyBackgroundAtChest(kit) : '#1e3a8a';
  const defaultLetter = getContrastingLetterColor(bg);
  const defaultBorderColor = defaultLetter === '#ffffff' ? '#0f172a' : '#ffffff';

  return {
    name: sponsorName,
    writingStyle: kit?.sponsor?.writingStyle || 'bold',
    letterColor: kit?.sponsor?.letterColor || defaultLetter,
    borderStyle: kit?.sponsor?.borderStyle || 'thin',
    borderColor: kit?.sponsor?.borderColor || defaultBorderColor,
    enabled: kit?.sponsor?.enabled ?? true,
  };
}

/**
 * Returns typographic CSS / inline style attributes for HTML preview components.
 */
export function getSponsorCssStyles(
  writingStyle: SponsorWritingStyle = 'bold',
  letterColor: string = '#ffffff',
  borderStyle: SponsorBorderStyle = 'none',
  borderColor: string = '#000000'
): React.CSSProperties {
  let fontFamily = 'system-ui, -apple-system, sans-serif';
  let fontWeight: React.CSSProperties['fontWeight'] = 800;
  let letterSpacing = '0.04em';
  let textTransform: React.CSSProperties['textTransform'] = 'uppercase';
  let fontStyle: React.CSSProperties['fontStyle'] = 'normal';
  let transform: string | undefined = undefined;

  switch (writingStyle) {
    case 'classic':
      fontFamily = 'Times New Roman, Georgia, serif';
      fontWeight = 700;
      letterSpacing = '0.09em';
      break;
    case 'modern':
      fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      fontWeight = 700;
      letterSpacing = '0.06em';
      break;
    case 'bold':
      fontFamily = 'Impact, Arial Black, Montserrat, sans-serif';
      fontWeight = 900;
      letterSpacing = '0.03em';
      break;
    case 'condensed':
      fontFamily = '"Arial Narrow", "Helvetica Neue Condensed", Oswald, sans-serif';
      fontWeight = 800;
      letterSpacing = '-0.01em';
      transform = 'scaleX(0.88)';
      break;
    case 'elegant':
      fontFamily = 'Didot, "Playfair Display", Georgia, serif';
      fontWeight = 600;
      letterSpacing = '0.22em';
      break;
    case 'athletic':
      fontFamily = 'ui-monospace, SFMono-Regular, "Courier New", monospace';
      fontWeight = 900;
      letterSpacing = '0.07em';
      break;
  }

  // Border formatting using -webkit-text-stroke & textShadow
  let strokeWidth = '0px';
  if (borderStyle === 'thin') strokeWidth = '1px';
  if (borderStyle === 'medium') strokeWidth = '2px';
  if (borderStyle === 'thick') strokeWidth = '3px';

  const isOutline = borderStyle === 'outline';

  return {
    fontFamily,
    fontWeight,
    letterSpacing,
    textTransform,
    fontStyle,
    transform,
    display: 'inline-block',
    color: isOutline ? 'transparent' : letterColor,
    WebkitTextStroke: isOutline
      ? `1.5px ${borderColor || letterColor}`
      : strokeWidth !== '0px'
      ? `${strokeWidth} ${borderColor}`
      : undefined,
    textShadow:
      borderStyle !== 'none' && !isOutline
        ? `0 1px 2px rgba(0,0,0,0.6)`
        : '0 1px 3px rgba(0,0,0,0.3)',
    paintOrder: 'stroke fill',
  };
}

/**
 * Convenience alias for TeamEditor.
 */
export function getMainSponsorFromEconomy(
  team?: EditorTeamData | null
): { name: string; amount: number } | null {
  const res = getClubMainShirtSponsor(team);
  if (!res) return null;
  return { name: res.name, amount: res.payment };
}

/**
 * Convenience contrast ratio check for TeamEditor.
 */
export function checkSponsorContrast(
  letterColor: string,
  backgroundColor: string
): { ratio: number; isReadable: boolean } {
  const ratio = calculateContrastRatio(letterColor, backgroundColor);
  return {
    ratio,
    isReadable: ratio >= 3.0,
  };
}

/**
 * Convenience optimal text color helper for TeamEditor.
 */
export function getOptimalTextColor(backgroundColor: string): string {
  return getContrastingLetterColor(backgroundColor);
}

/**
 * Smart sponsor line wrapping and word-clumping algorithm for jersey chest readability.
 * Clumps words one word per line, unless there are two small words (e.g. combined <= 9-10 chars),
 * ensuring maximum readability on the shirt without squishing or tiny font sizes.
 */
export function formatSponsorLines(rawText: string, maxLineLength: number = 10): string[] {
  const text = (rawText || '').trim();
  if (!text) return [];

  // Split into words
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    const single = words[0] || text;
    // If single word is longer than 13 chars, split into two balanced lines for readability
    if (single.length > 13) {
      const mid = Math.ceil(single.length / 2);
      return [single.slice(0, mid), single.slice(mid)];
    }
    return [single];
  }

  // Clump words: one word per line, unless two small words can fit comfortably together
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!currentLine) {
      currentLine = word;
    } else {
      const combined = `${currentLine} ${word}`;
      // Two small words rule: e.g. "RED" (3) + "BULL" (4) -> 8 <= maxLineLength
      // Or "FLY" (3) + "AIR" (3) -> 7 <= maxLineLength
      const isTwoSmallWords =
        currentLine.length <= 4 &&
        word.length <= 5 &&
        combined.length <= maxLineLength;

      if (isTwoSmallWords && lines.length < 2) {
        currentLine = combined;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Cap at 3 lines maximum to ensure it fits cleanly between chest and jersey hem
  if (lines.length > 3) {
    return [lines[0], lines[1], lines.slice(2).join(' ')];
  }
  return lines;
}

