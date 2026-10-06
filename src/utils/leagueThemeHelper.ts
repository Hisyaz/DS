import {
  LeagueDesignConfig,
  LeagueColorOption,
  LeagueShapeStyle,
  EditorTeamData,
  LeagueData,
  LeagueDatabase,
  TextOutlineStyleOption,
  BackgroundStyleOption,
  PanelStyleOption,
  ButtonStyleOption,
  IconStyleOption,
  CompetitionTrophyConfig,
} from '../types/leagueEditor';
import { PlayerCardData, EmblemConfig } from '../types';
import { getYouthLeagueByCity } from './leagueDatabaseSystem';
import { calculateTeamLineRatings } from './teamStrengthSystem';
import { getGlobalCompetitionsDatabase } from './competitionDatabaseManager';
import { CompetitionData } from '../types/competitionEditor';

export interface ThemeColorStyles {
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
}

export const LEAGUE_COLOR_MAP: Record<LeagueColorOption, { hex: string; bg: string; text: string; border: string; contrastText: string }> = {
  Red: {
    hex: '#dc2626',
    bg: 'bg-red-600',
    text: 'text-red-500',
    border: 'border-red-500',
    contrastText: '#ffffff',
  },
  Blue: {
    hex: '#2563eb',
    bg: 'bg-blue-600',
    text: 'text-blue-500',
    border: 'border-blue-500',
    contrastText: '#ffffff',
  },
  Yellow: {
    hex: '#eab308',
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-400',
    contrastText: '#000000',
  },
  Green: {
    hex: '#16a34a',
    bg: 'bg-emerald-600',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    contrastText: '#ffffff',
  },
  Black: {
    hex: '#020617',
    bg: 'bg-slate-950',
    text: 'text-slate-200',
    border: 'border-slate-800',
    contrastText: '#ffffff',
  },
  White: {
    hex: '#ffffff',
    bg: 'bg-white',
    text: 'text-slate-900',
    border: 'border-slate-200',
    contrastText: '#0f172a',
  },
  Grey: {
    hex: '#64748b',
    bg: 'bg-slate-600',
    text: 'text-slate-300',
    border: 'border-slate-500',
    contrastText: '#ffffff',
  },
};

/**
 * Calculates relative luminance of a HEX color.
 */
export function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates WCAG AA contrast ratio between two HEX colors.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Calculates responsive safe text outline thickness based on text font size in pixels.
 * Enforces strict proportional maximums so letter interiors NEVER fill in, overlap, or blur.
 *
 * Strength Ranges (0–100):
 * 0: No outline (0px)
 * 1–25: Thin outline (~0.35px - 0.6px)
 * 26–50: Moderate outline (~0.6px - 1.0px)
 * 51–75: Strong outline (~1.0px - 1.4px)
 * 76–100: Maximum safe outline (~1.4px - maxSafePx)
 */
export function getSafeOutlineWidth(fontSizePx: number, userStrength: number): number {
  const strengthClamped = Math.max(0, Math.min(100, userStrength));
  if (strengthClamped === 0) return 0;

  // Maximum safe stroke width (in px) relative to font size to prevent stroke from choking letter counters
  let maxSafePx = 1.25;
  if (fontSizePx <= 10) {
    maxSafePx = 0.6;
  } else if (fontSizePx <= 12) {
    maxSafePx = 0.8;
  } else if (fontSizePx <= 15) {
    maxSafePx = 1.1;
  } else if (fontSizePx <= 20) {
    maxSafePx = 1.4;
  } else if (fontSizePx <= 28) {
    maxSafePx = 1.85;
  } else {
    maxSafePx = 2.8;
  }

  const minPx = 0.35;
  const strokeWidth = minPx + (strengthClamped / 100) * (maxSafePx - minPx);

  return Number(strokeWidth.toFixed(2));
}

/**
 * Calculates auto contrast text color if not manually specified.
 */
export function getAutoContrastTextColor(primaryColor: LeagueColorOption): LeagueColorOption {
  if (primaryColor === 'Yellow' || primaryColor === 'White') {
    return 'Black';
  }
  return 'White';
}

/**
 * Get contrast text color and text outline style for maximum visibility.
 * Enforces hard-edged, crisp border outlines that NEVER blur or overlap letter fills.
 */
export function getLeagueTextStyles(design: LeagueDesignConfig, fontSizePx: number = 16) {
  const textColorOpt = design.textColor || getAutoContrastTextColor(design.primaryColor);
  const textOutlineOpt = design.textOutlineColor || (textColorOpt === 'White' || textColorOpt === 'Yellow' ? 'Black' : 'White');

  const textColorHex = design.textColorHex || LEAGUE_COLOR_MAP[textColorOpt]?.hex || '#ffffff';
  const textOutlineHex = design.textOutlineHex || LEAGUE_COLOR_MAP[textOutlineOpt]?.hex || '#000000';

  const style: TextOutlineStyleOption = design.textOutlineStyle || 'solid';
  const userStrength: number = design.textOutlineStrength !== undefined ? Math.max(0, Math.min(100, design.textOutlineStrength)) : 50;

  // Font-size-aware proportional outline stroke (0 if style === 'none' or strength === 0)
  const px = style === 'none' || userStrength === 0 ? 0 : getSafeOutlineWidth(fontSizePx, userStrength);

  let textShadow = 'none';
  let webkitTextStroke = 'none';

  if (px > 0 && style !== 'none') {
    const p = px.toFixed(2);
    webkitTextStroke = `${p}px ${textOutlineHex}`;

    if (style === 'solid' || style === 'sharp') {
      const p1 = px.toFixed(1);
      // Hard-edged 4-point pixel shadow with 0 blur
      textShadow = `${p1}px ${p1}px 0 ${textOutlineHex}, -${p1}px -${p1}px 0 ${textOutlineHex}, ${p1}px -${p1}px 0 ${textOutlineHex}, -${p1}px ${p1}px 0 ${textOutlineHex}`;
    } else if (style === 'soft') {
      const p1 = Math.max(0.4, px * 0.7).toFixed(1);
      webkitTextStroke = `${p1}px ${textOutlineHex}`;
      // Clean 0-blur drop separation
      textShadow = `0 1px 1px ${textOutlineHex}`;
    } else if (style === 'double') {
      const p1 = px.toFixed(1);
      const p2 = (px * 1.8).toFixed(1);
      textShadow = `${p1}px ${p1}px 0 ${textOutlineHex}, -${p1}px -${p1}px 0 ${textOutlineHex}, ${p2}px ${p2}px 0 ${textColorHex}, -${p2}px -${p2}px 0 ${textColorHex}`;
    } else if (style === 'glow') {
      const glowBlur = Math.min(2.5, Math.max(1, px * 1.5)).toFixed(1);
      textShadow = `0 0 ${glowBlur}px ${textOutlineHex}`;
    }
  }

  // Check WCAG contrast ratio with primary/secondary background
  const bgHex = design.secondaryHex || LEAGUE_COLOR_MAP[design.secondaryColor]?.hex || '#020617';
  const contrastRatio = getContrastRatio(textColorHex, bgHex);
  const needsProtection = contrastRatio < 4.5;

  return {
    color: textColorHex,
    textShadow,
    webkitTextStroke,
    WebkitTextStroke: webkitTextStroke,
    paintOrder: 'stroke fill',
    WebkitPaintOrder: 'stroke fill',
    textColorOpt,
    textOutlineOpt,
    textColorHex,
    textOutlineHex,
    style,
    strength: userStrength,
    fontSizePx,
    contrastRatio,
    needsProtection,
    protectionPlateStyle: needsProtection
      ? {
          backgroundColor: getLuminance(bgHex) < 0.5 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          padding: '2px 6px',
        }
      : {},
  };
}

/**
 * Guarantees that critical game information (Player Name, OVR, Score, Clock, League Position, Goals, Money, Stamina, QTEs, Notifications)
 * is ALWAYS 100% legible across all screens and device sizes, overriding unreadable user customizations.
 */
export function getCriticalInformationTextStyle(
  type: 'player_name' | 'ovr' | 'score' | 'clock' | 'rank' | 'stats' | 'money' | 'stamina' | 'qte' | 'notification' | 'button',
  design: LeagueDesignConfig,
  fontSizePx: number = 14
) {
  const baseStyles = getLeagueTextStyles(design, fontSizePx);
  const secondaryHex = design.secondaryHex || LEAGUE_COLOR_MAP[design.secondaryColor]?.hex || '#020617';
  const isDarkBg = getLuminance(secondaryHex) < 0.3;

  // High contrast fallback colors
  const safeTextColor = isDarkBg ? '#ffffff' : '#000000';
  const safeOutlineColor = isDarkBg ? '#000000' : '#ffffff';

  // Base font weights for critical info
  let fontWeight = '700';
  if (type === 'ovr' || type === 'score' || type === 'clock') fontWeight = '900';
  if (type === 'player_name') fontWeight = '800';

  const outlinePx = getSafeOutlineWidth(fontSizePx, 50);

  return {
    color: baseStyles.needsProtection ? safeTextColor : baseStyles.textColorHex,
    fontWeight,
    paintOrder: 'stroke fill',
    WebkitPaintOrder: 'stroke fill',
    webkitTextStroke: outlinePx > 0 ? `${outlinePx.toFixed(2)}px ${safeOutlineColor}` : 'none',
    WebkitTextStroke: outlinePx > 0 ? `${outlinePx.toFixed(2)}px ${safeOutlineColor}` : 'none',
    textShadow: outlinePx > 0
      ? `${outlinePx.toFixed(1)}px ${outlinePx.toFixed(1)}px 0 ${safeOutlineColor}, -${outlinePx.toFixed(1)}px -${outlinePx.toFixed(1)}px 0 ${safeOutlineColor}, ${outlinePx.toFixed(1)}px -${outlinePx.toFixed(1)}px 0 ${safeOutlineColor}, -${outlinePx.toFixed(1)}px ${outlinePx.toFixed(1)}px 0 ${safeOutlineColor}`
      : 'none',
    letterSpacing: type === 'clock' || type === 'score' ? '0.05em' : 'normal',
    backgroundColor: baseStyles.needsProtection
      ? isDarkBg
        ? 'rgba(2, 6, 23, 0.85)'
        : 'rgba(255, 255, 255, 0.90)'
      : 'transparent',
    backdropFilter: baseStyles.needsProtection ? 'blur(6px)' : 'none',
    padding: baseStyles.needsProtection ? '2px 6px' : '0',
    borderRadius: '4px',
  };
}

/**
 * Get theme shape classes and custom inline styles for panels, scoreboards, and screens.
 */
export function getLeagueThemeStyles(design: LeagueDesignConfig) {
  const primaryHex = design.primaryHex || (LEAGUE_COLOR_MAP[design.primaryColor] || LEAGUE_COLOR_MAP.Blue).hex;
  const secondaryHex = design.secondaryHex || (LEAGUE_COLOR_MAP[design.secondaryColor] || LEAGUE_COLOR_MAP.Black).hex;
  const accentHex = design.accentHex || (LEAGUE_COLOR_MAP[design.accentColor] || LEAGUE_COLOR_MAP.Yellow).hex;

  const primary = LEAGUE_COLOR_MAP[design.primaryColor] || LEAGUE_COLOR_MAP.Blue;
  const secondary = LEAGUE_COLOR_MAP[design.secondaryColor] || LEAGUE_COLOR_MAP.Black;
  const accent = LEAGUE_COLOR_MAP[design.accentColor] || LEAGUE_COLOR_MAP.Yellow;

  const textStyles = getLeagueTextStyles(design);

  let shapeRadiusClass = 'rounded-xl';
  let panelStyleClass = 'border border-slate-700/50 shadow-xl';
  let fontStyleClass = 'font-sans';
  let headerShapeClass = 'rounded-t-xl';

  switch (design.shape) {
    case 'rhomboid_chamfer':
      shapeRadiusClass = 'rounded-sm';
      panelStyleClass = 'border-2 border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.3)]';
      fontStyleClass = 'font-mono uppercase tracking-wider';
      headerShapeClass = 'rounded-t-sm';
      break;
    case 'architectural_double':
      shapeRadiusClass = 'rounded-md';
      panelStyleClass = 'border-4 border-double border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.25)]';
      fontStyleClass = 'font-serif tracking-normal';
      headerShapeClass = 'rounded-t-md';
      break;
    case 'tactical_chalkboard':
      shapeRadiusClass = 'rounded-lg';
      panelStyleClass = 'border-2 border-dashed border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-[#032318]/95';
      fontStyleClass = 'font-sans tracking-normal';
      headerShapeClass = 'rounded-t-lg';
      break;
    case 'modern_square':
      shapeRadiusClass = 'rounded-none';
      panelStyleClass = 'border-2 border-slate-800 shadow-2xl backdrop-blur-md';
      fontStyleClass = 'font-mono uppercase tracking-wider';
      headerShapeClass = 'rounded-none';
      break;
    case 'modern_rounded':
      shapeRadiusClass = 'rounded-3xl';
      panelStyleClass = 'border border-slate-700/40 shadow-2xl backdrop-blur-xl';
      fontStyleClass = 'font-sans tracking-tight';
      headerShapeClass = 'rounded-t-3xl';
      break;
    case 'classic':
      shapeRadiusClass = 'rounded-md';
      panelStyleClass = 'border-2 border-slate-600 shadow-lg';
      fontStyleClass = 'font-serif tracking-normal';
      headerShapeClass = 'rounded-t-md';
      break;
    case 'futuristic':
      shapeRadiusClass = 'rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none';
      panelStyleClass = 'border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-slate-950/90';
      fontStyleClass = 'font-mono tracking-widest uppercase';
      headerShapeClass = 'rounded-tl-2xl';
      break;
    case 'simple':
    default:
      shapeRadiusClass = 'rounded-lg';
      panelStyleClass = 'border border-slate-800 shadow-md';
      fontStyleClass = 'font-sans tracking-normal';
      headerShapeClass = 'rounded-t-lg';
      break;
  }

  // Background Customization
  const backgroundStyle: BackgroundStyleOption = design.backgroundStyle || 'radial_glow';
  const customBgColor = design.backgroundCustomColor || secondaryHex;
  const overlayOpacity = design.backgroundOverlayOpacity !== undefined ? design.backgroundOverlayOpacity : 80;

  let backgroundCss = '';
  if (backgroundStyle === 'solid') {
    backgroundCss = customBgColor;
  } else if (backgroundStyle === 'gradient') {
    backgroundCss = `linear-gradient(135deg, ${primaryHex}40 0%, ${secondaryHex} 60%, #000000 100%)`;
  } else if (backgroundStyle === 'radial_glow') {
    backgroundCss = `radial-gradient(circle at 50% 10%, ${primaryHex}35 0%, ${secondaryHex} 70%, #020617 100%)`;
  } else if (backgroundStyle === 'stadium_bokeh') {
    backgroundCss = `radial-gradient(ellipse at top, ${primaryHex}40 0%, ${secondaryHex} 50%, #000000 100%)`;
  } else if (backgroundStyle === 'sleek_glass') {
    backgroundCss = `linear-gradient(180deg, ${primaryHex}20 0%, #0f172a 100%)`;
  } else if (backgroundStyle === 'mesh_dark') {
    backgroundCss = `radial-gradient(at 0% 0%, ${primaryHex}30 0px, transparent 50%), radial-gradient(at 100% 100%, ${accentHex}20 0px, transparent 50%), #020617`;
  }

  // Panel Customization
  const panelStyle: PanelStyleOption = design.panelStyle || 'glassmorphic';
  const panelBgTint = design.panelBgTint || '#0f172a';
  const panelOpacity = design.panelOpacity !== undefined ? design.panelOpacity : 85;
  const panelRadius = design.panelBorderRadius || (design.shape === 'modern_square' ? 'none' : 'xl');

  let panelRadiusClass = 'rounded-xl';
  if (panelRadius === 'none') panelRadiusClass = 'rounded-none';
  if (panelRadius === 'sm') panelRadiusClass = 'rounded-sm';
  if (panelRadius === 'md') panelRadiusClass = 'rounded-md';
  if (panelRadius === 'lg') panelRadiusClass = 'rounded-lg';
  if (panelRadius === '2xl') panelRadiusClass = 'rounded-2xl';

  let panelBorderColor = `${primaryHex}40`;
  let panelShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';

  if (panelStyle === 'sharp_solid') {
    panelShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
    panelBorderColor = primaryHex;
  } else if (panelStyle === 'soft_glow') {
    panelShadow = `0 0 25px ${primaryHex}30`;
    panelBorderColor = `${primaryHex}60`;
  } else if (panelStyle === 'metallic') {
    panelShadow = 'inset 0 1px 1px rgba(255,255,255,0.2), 0 10px 20px rgba(0,0,0,0.6)';
    panelBorderColor = '#64748b';
  } else if (panelStyle === 'neon_border') {
    panelShadow = `0 0 15px ${accentHex}50, inset 0 0 10px ${accentHex}20`;
    panelBorderColor = accentHex;
  }

  // Button Customization
  const buttonStyle: ButtonStyleOption = design.buttonStyle || 'pill';
  const buttonHoverGlow = design.buttonHoverGlow !== false;

  let buttonRadiusClass = 'rounded-full';
  if (buttonStyle === 'sharp') buttonRadiusClass = 'rounded-none';
  if (buttonStyle === 'rounded') buttonRadiusClass = 'rounded-xl';
  if (buttonStyle === 'outlined') buttonRadiusClass = 'rounded-xl';

  let buttonGlowStyle = buttonHoverGlow ? `0 0 15px ${primaryHex}60` : 'none';

  // Icon Customization
  const iconStyle: IconStyleOption = design.iconStyle || 'accent_glow';

  return {
    shape: design.shape,
    shapeRadiusClass,
    panelStyleClass,
    fontStyleClass,
    headerShapeClass,
    primaryHex,
    secondaryHex,
    accentHex,
    textStyles,
    primary,
    secondary,
    accent,
    // Background
    backgroundStyle,
    backgroundCss,
    overlayOpacity,
    // Panel
    panelStyle,
    panelBgTint,
    panelOpacity,
    panelRadiusClass,
    panelBorderColor,
    panelShadow,
    // Button
    buttonStyle,
    buttonRadiusClass,
    buttonGlowStyle,
    buttonHoverGlow,
    // Icon
    iconStyle,
  };
}

/**
 * Resolves the active league for the player based on the strict rule:
 * PLAYER CURRENT TEAM → CURRENT LEAGUE → ACTIVE LEAGUE DATA
 */
export function getLeagueForPlayer(player: PlayerCardData, db: LeagueDatabase): LeagueData {
  if (!db || !db.leagues || !db.teams) {
    // Return first league or default
    return Object.values(db?.leagues || {})[0] || {
      id: 'england_d1',
      countryCode: 'ENG',
      countryName: 'England',
      divisionTier: '1st',
      name: 'Premier League',
      structure: { numTeams: 20, format: 'double_round_robin', directRelegationSpots: 3, playoffRelegationSpots: 0 },
      competitions: {},
      teamIds: [] as string[],
      emblem: { shape: 'crown-shield', color1: '#3b82f6', color2: '#1d4ed8', mode: '2' },
      design: { shape: 'modern_rounded', primaryColor: 'Blue', secondaryColor: 'Black', accentColor: 'Yellow' },
    };
  }

  const clubNorm = (player.club || '').toLowerCase().trim();
  const leagueNorm = (player.league || '').toLowerCase().trim();

  // 1. Check if player's club matches a team in db.teams
  const matchedTeam = Object.values(db.teams).find(
    (t) =>
      t.name.toLowerCase() === clubNorm ||
      t.id.toLowerCase() === clubNorm ||
      (t.shortName && t.shortName.toLowerCase() === clubNorm)
  );

  if (matchedTeam && db.leagues[matchedTeam.leagueId]) {
    return db.leagues[matchedTeam.leagueId];
  }

  // 2. Check if player's league matches a league in db.leagues
  const matchedLeague = Object.values(db.leagues).find(
    (l) => l.name.toLowerCase() === leagueNorm || l.id.toLowerCase() === leagueNorm
  );

  if (matchedLeague) {
    return matchedLeague;
  }

  // 3. Check youth league for starting city or club name
  if (player.startingCity || player.club) {
    const youthLeague = getYouthLeagueByCity(db, player.startingCity || player.club);
    if (youthLeague) {
      return youthLeague;
    }
  }

  // 4. Default fallback: England First Division (Premier League)
  if (db.leagues['england_d1']) {
    return db.leagues['england_d1'];
  }

  // 5. Ultimate fallback: First available league in database
  return Object.values(db.leagues)[0];
}

/**
 * Returns the active league UI design & theme for a player in Career / Legend mode.
 */
export interface ActiveCompetitionTheme {
  competitionName: string;
  category?: 'national' | 'continental' | 'international' | 'youth' | 'club';
  emblem?: EmblemConfig;
  trophy?: CompetitionTrophyConfig;
  design: LeagueDesignConfig;
  theme: ReturnType<typeof getLeagueThemeStyles>;
  textStyles: ReturnType<typeof getLeagueTextStyles>;
  branding: {
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
  };
}

/**
 * Generates iconic preset design configuration based on competition name keywords
 * when no custom database design has been specified yet in editor mode.
 */
export function getPresetDesignForCompetitionName(competitionName: string | any): LeagueDesignConfig {
  const norm = String(competitionName || '').toLowerCase();

  if (
    norm.includes('bundesliga') ||
    norm.includes('germany') ||
    norm.includes('deutschland') ||
    norm.includes('ger_') ||
    norm.includes('berlin') ||
    norm.includes('munich') ||
    norm.includes('münchen') ||
    norm.includes('dortmund')
  ) {
    return {
      shape: 'modern_square',
      primaryColor: 'Red',
      secondaryColor: 'Black',
      accentColor: 'White',
      primaryHex: '#d20515',
      secondaryHex: '#0f172a',
      accentHex: '#ffffff',
      backgroundStyle: 'mesh_dark',
      panelStyle: 'glassmorphic',
      buttonStyle: 'sharp',
      buttonHoverGlow: true,
      textOutlineStyle: 'sharp',
      textOutlineStrength: 60,
    };
  } else if (norm.includes('dfb') || norm.includes('pokal')) {
    return {
      shape: 'modern_square',
      primaryColor: 'Green',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#008559',
      secondaryHex: '#020617',
      accentHex: '#f59e0b',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'sharp',
      buttonHoverGlow: true,
      textOutlineStyle: 'sharp',
      textOutlineStrength: 60,
    };
  } else if (norm.includes('premier') || norm.includes('epl') || norm.includes('england') || norm.includes('eng_')) {
    return {
      shape: 'rhomboid_chamfer',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Green',
      primaryHex: '#38003C',
      secondaryHex: '#0f172a',
      accentHex: '#00FF87',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'sharp',
      buttonHoverGlow: true,
      textOutlineStyle: 'solid',
      textOutlineStrength: 60,
    };
  } else if (
    norm.includes('laliga') ||
    norm.includes('la liga') ||
    norm.includes('spain') ||
    norm.includes('españa') ||
    norm.includes('esp_') ||
    norm.includes('madrid') ||
    norm.includes('barcelona')
  ) {
    return {
      shape: 'modern_rounded',
      primaryColor: 'Red',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#EE1E46',
      secondaryHex: '#0F172A',
      accentHex: '#FFBE00',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'solid',
      textOutlineStrength: 60,
    };
  } else if (
    norm.includes('serie a') ||
    norm.includes('serie_a') ||
    norm.includes('italy') ||
    norm.includes('italia') ||
    norm.includes('ita_') ||
    norm.includes('calcio') ||
    norm.includes('milan') ||
    norm.includes('juventus') ||
    norm.includes('roma')
  ) {
    return {
      shape: 'architectural_double',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#0047AB',
      secondaryHex: '#020617',
      accentHex: '#FFD700',
      backgroundStyle: 'sleek_glass',
      panelStyle: 'metallic',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'sharp',
      textOutlineStrength: 65,
    };
  } else if (norm.includes('champions') || norm.includes('ucl') || norm.includes('champions league')) {
    return {
      shape: 'futuristic',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#0984E3',
      secondaryHex: '#020617',
      accentHex: '#00CEC9',
      backgroundStyle: 'stadium_bokeh',
      panelStyle: 'neon_border',
      buttonStyle: 'pill',
      buttonHoverGlow: true,
      textOutlineStyle: 'glow',
      textOutlineStrength: 70,
    };
  } else if (norm.includes('libertadores') || norm.includes('conmebol')) {
    return {
      shape: 'classic',
      primaryColor: 'Red',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#B71C1C',
      secondaryHex: '#111111',
      accentHex: '#FFD700',
      backgroundStyle: 'mesh_dark',
      panelStyle: 'metallic',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'sharp',
      textOutlineStrength: 65,
    };
  } else if (norm.includes('world cup') || norm.includes('fifa')) {
    return {
      shape: 'modern_square',
      primaryColor: 'Red',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#880E4F',
      secondaryHex: '#0D47A1',
      accentHex: '#FFD700',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'pill',
      buttonHoverGlow: true,
      textOutlineStyle: 'solid',
      textOutlineStrength: 70,
    };
  } else if (norm.includes('euro') || norm.includes('eurocopa') || norm.includes('uefa')) {
    return {
      shape: 'modern_rounded',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#0D47A1',
      secondaryHex: '#020617',
      accentHex: '#42A5F5',
      backgroundStyle: 'sleek_glass',
      panelStyle: 'soft_glow',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'solid',
      textOutlineStrength: 50,
    };
  } else if (norm.includes('copa américa') || norm.includes('copa america')) {
    return {
      shape: 'classic',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#0284C7',
      secondaryHex: '#0F172A',
      accentHex: '#F59E0B',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'sharp',
      textOutlineStrength: 55,
    };
  } else if (norm.includes('youth') || norm.includes('u17') || norm.includes('u20') || norm.includes('academy')) {
    return {
      shape: 'tactical_chalkboard',
      primaryColor: 'Green',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: '#10B981',
      secondaryHex: '#042116',
      accentHex: '#FDE047',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'rounded',
      buttonHoverGlow: true,
      textOutlineStyle: 'solid',
      textOutlineStrength: 50,
    };
  }

  // Generic Domestic League Default
  return {
    shape: 'modern_rounded',
    primaryColor: 'Blue',
    secondaryColor: 'Black',
    accentColor: 'Yellow',
    primaryHex: '#0284C7',
    secondaryHex: '#0F172A',
    accentHex: '#F59E0B',
    backgroundStyle: 'radial_glow',
    panelStyle: 'glassmorphic',
    buttonStyle: 'rounded',
    buttonHoverGlow: true,
    textOutlineStyle: 'solid',
    textOutlineStrength: 50,
  };
}

/**
 * Returns the active competition UI design & theme for a player in Career Mode,
 * fully reading from Competitions Editor & League Editor databases.
 */
export function getActiveCompetitionThemeForPlayer(
  player: PlayerCardData,
  db: LeagueDatabase,
  currentOverrideCompName?: string | any
): ActiveCompetitionTheme {
  const globalCompsDb = getGlobalCompetitionsDatabase();
  const comps = globalCompsDb?.competitions || {};
  const leagues = db?.leagues || {};

  const safeOverride = typeof currentOverrideCompName === 'string' ? currentOverrideCompName : '';
  let matchedComp: CompetitionData | null = null;
  let matchedLeague: LeagueData | null = null;
  let competitionName = safeOverride || player?.league || 'Youth League';

  const normOverride = safeOverride.toLowerCase().trim();
  const normPlayerLeague = String(player?.league || '').toLowerCase().trim();
  const normPlayerClub = String(player?.club || '').toLowerCase().trim();

  // 1. Check if currentOverrideCompName matches a competition in Global Competitions DB
  if (normOverride) {
    const compMatch = Object.values(comps).find(
      (c) =>
        c.name.toLowerCase() === normOverride ||
        c.id.toLowerCase() === normOverride ||
        (c.shortName && c.shortName.toLowerCase() === normOverride)
    );
    if (compMatch) {
      matchedComp = compMatch;
      competitionName = compMatch.name;
    } else {
      // Check in League Database
      const leagueMatch = Object.values(leagues).find(
        (l) => l.name.toLowerCase() === normOverride || l.id.toLowerCase() === normOverride
      );
      if (leagueMatch) {
        matchedLeague = leagueMatch;
        competitionName = leagueMatch.name;
      }
    }
  }

  // 2. If no match yet, check player.league or player.club
  if (!matchedComp && !matchedLeague) {
    // Check competition database for player league or player club
    const compMatch = Object.values(comps).find((c) => {
      if (normPlayerLeague && (c.name.toLowerCase() === normPlayerLeague || c.id.toLowerCase() === normPlayerLeague)) return true;
      if (normPlayerClub && c.participatingTeamIds && c.participatingTeamIds.some((tId) => tId.toLowerCase() === normPlayerClub)) return true;
      return false;
    });

    if (compMatch) {
      matchedComp = compMatch;
      competitionName = compMatch.name;
    } else {
      // Check league database
      matchedLeague = getLeagueForPlayer(player, db);
      if (matchedLeague) {
        competitionName = matchedLeague.name;
      }
    }
  }

  // Extract design or construct design from branding
  let design: LeagueDesignConfig;
  const emblem: EmblemConfig | undefined = matchedComp?.emblem || matchedLeague?.emblem;
  const trophy: CompetitionTrophyConfig | undefined = matchedComp?.trophy || matchedLeague?.championshipTrophy;

  if (matchedComp?.design) {
    design = { ...matchedComp.design };
  } else if (matchedLeague?.design) {
    design = { ...matchedLeague.design };
  } else if (matchedComp?.branding) {
    design = {
      shape: 'modern_rounded',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      accentColor: 'Yellow',
      primaryHex: matchedComp.branding.primaryHex || '#0284C7',
      secondaryHex: matchedComp.branding.secondaryHex || '#0F172A',
      accentHex: matchedComp.branding.accentHex || '#F59E0B',
      backgroundStyle: 'radial_glow',
      panelStyle: 'glassmorphic',
      buttonStyle: 'rounded',
    };
  } else {
    // Dynamic preset fallback matching competition name keywords (e.g. EPL, UCL, World Cup, Libertadores, La Liga)
    design = getPresetDesignForCompetitionName(competitionName);
  }

  // Ensure Hex fields are set
  if (!design.primaryHex) {
    design.primaryHex = LEAGUE_COLOR_MAP[design.primaryColor]?.hex || '#0284C7';
  }
  if (!design.secondaryHex) {
    design.secondaryHex = LEAGUE_COLOR_MAP[design.secondaryColor]?.hex || '#0F172A';
  }
  if (!design.accentHex) {
    design.accentHex = LEAGUE_COLOR_MAP[design.accentColor]?.hex || '#F59E0B';
  }

  const theme = getLeagueThemeStyles(design);
  const textStyles = getLeagueTextStyles(design);

  return {
    competitionName,
    category: matchedComp?.category || (competitionName.toLowerCase().includes('youth') ? 'youth' : 'national'),
    emblem,
    trophy,
    design,
    theme,
    textStyles,
    branding: {
      primaryHex: theme.primaryHex,
      secondaryHex: theme.secondaryHex,
      accentHex: theme.accentHex,
    },
  };
}

/**
 * Helper to calculate simulation ratings for teams
 */
export function getTeamSimulationRatings(team: EditorTeamData, league?: LeagueData) {
  const isYouth = league ? league.divisionTier === 'youth' : team.leagueId?.includes('youth');
  const lineRatings = calculateTeamLineRatings(team);

  return {
    isYouth: !!isYouth,
    overall: lineRatings.overall,
    attack: lineRatings.attack,
    midfield: lineRatings.midfield,
    defense: lineRatings.defense,
  };
}

/**
 * Helper to determine the country of the player's current club or youth league
 */
export function getPlayerClubCountry(player: PlayerCardData, db?: LeagueDatabase): string {
  if (player?.clubCountry) return player.clubCountry;
  if (db) {
    const currentLeague = getLeagueForPlayer(player, db);
    if (currentLeague?.countryName) return currentLeague.countryName;
    if (currentLeague?.countryCode) return currentLeague.countryCode;
  }
  if (player?.startingCity) {
    const normCity = player.startingCity.toLowerCase();
    if (
      normCity.includes('berlin') ||
      normCity.includes('munich') ||
      normCity.includes('münchen') ||
      normCity.includes('dortmund') ||
      normCity.includes('frankfurt') ||
      normCity.includes('hamburg') ||
      normCity.includes('cologne') ||
      normCity.includes('köln') ||
      normCity.includes('leipzig') ||
      normCity.includes('stuttgart')
    ) {
      return 'Germany';
    }
    if (
      normCity.includes('madrid') ||
      normCity.includes('barcelona') ||
      normCity.includes('valencia') ||
      normCity.includes('sevilla')
    ) {
      return 'Spain';
    }
    if (
      normCity.includes('paris') ||
      normCity.includes('marseille') ||
      normCity.includes('lyon')
    ) {
      return 'France';
    }
    if (
      normCity.includes('milan') ||
      normCity.includes('rome') ||
      normCity.includes('roma') ||
      normCity.includes('turin') ||
      normCity.includes('naples') ||
      normCity.includes('napoli')
    ) {
      return 'Italy';
    }
    if (
      normCity.includes('london') ||
      normCity.includes('manchester') ||
      normCity.includes('liverpool')
    ) {
      return 'England';
    }
    if (
      normCity.includes('sao paulo') ||
      normCity.includes('são paulo') ||
      normCity.includes('rio')
    ) {
      return 'Brazil';
    }
    if (
      normCity.includes('buenos aires') ||
      normCity.includes('rosario')
    ) {
      return 'Argentina';
    }
  }
  if (typeof player?.country === 'string') return player.country;
  if (typeof player?.nationality === 'string') return player.nationality;
  return 'Germany';
}


