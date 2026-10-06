/**
 * Powerscale System Engine
 * Implements historical heritage stacks, dynamic favorite modifiers,
 * tournament prestige, drought decay, and title refresh mechanics.
 */

import {
  ClubPowerscaleProfile,
  NationalTeamPowerscaleProfile,
  PowerscaleSystemState,
  MatchPowerscaleImpact,
  PowerscaleTier,
} from '../types/powerscale';

const POWERSCALE_STORAGE_KEY = 'FOOTBALL_WORLD_POWERSCALE_SYSTEM_STATE_V1';

// ---------------------------------------------------------------------------
// DEFAULT HISTORICAL SEEDS
// ---------------------------------------------------------------------------

interface TeamSeedConfig {
  teamId: string;
  teamName: string;
  leagueId: string;
  tier: PowerscaleTier;
  baseLeagueMod: number;
  leagueTitles: number;
  lastLeagueYear: number;
  continentalTitles: number;
  baseContinentalMod?: number;
  lastContinentalYear?: number;
  isFirstSeasonPromoted?: boolean;
  favoriteTag?: string;
}

const INITIAL_CLUB_SEEDS: TeamSeedConfig[] = [
  // SPAIN (La Liga)
  // Barcelona & Real Madrid: very strong modifier (stronger for Barcelona as specified)
  {
    teamId: 'esp_barcelona',
    teamName: 'FC Barcelona',
    leagueId: 'spain_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.38,
    leagueTitles: 27,
    lastLeagueYear: 2023,
    continentalTitles: 5,
    baseContinentalMod: 1.20, // 3rd tier UCL favorite
    lastContinentalYear: 2015,
    favoriteTag: 'Catalan Heavyweight 👑',
  },
  {
    teamId: 'esp_realmadrid',
    teamName: 'Real Madrid',
    leagueId: 'spain_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.35,
    leagueTitles: 36,
    lastLeagueYear: 2024,
    continentalTitles: 15,
    baseContinentalMod: 1.375, // 15 stacks of 2.5% = +37.5% King of UCL
    lastContinentalYear: 2024,
    favoriteTag: 'Kings of Europe 👑',
  },
  {
    teamId: 'esp_atletico',
    teamName: 'Atlético de Madrid',
    leagueId: 'spain_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.15,
    leagueTitles: 11,
    lastLeagueYear: 2021,
    continentalTitles: 0,
    baseContinentalMod: 1.08,
    favoriteTag: 'Title Contender ⚔️',
  },
  {
    teamId: 'esp_girona',
    teamName: 'Girona FC',
    leagueId: 'spain_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.07,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    baseContinentalMod: 1.04,
  },
  {
    teamId: 'esp_athletic',
    teamName: 'Athletic Club',
    leagueId: 'spain_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 8,
    lastLeagueYear: 1984,
    continentalTitles: 0,
    baseContinentalMod: 1.03,
  },
  {
    teamId: 'esp_realsociedad',
    teamName: 'Real Sociedad',
    leagueId: 'spain_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 2,
    lastLeagueYear: 1982,
    continentalTitles: 0,
    baseContinentalMod: 1.03,
  },
  {
    teamId: 'esp_villarreal',
    teamName: 'Villarreal CF',
    leagueId: 'spain_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    baseContinentalMod: 1.05,
  },
  {
    teamId: 'esp_sevilla',
    teamName: 'Sevilla FC',
    leagueId: 'spain_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.04,
    leagueTitles: 1,
    lastLeagueYear: 1946,
    continentalTitles: 0,
    baseContinentalMod: 1.10, // Europa League royalty
  },
  {
    teamId: 'esp_valencia',
    teamName: 'Valencia CF',
    leagueId: 'spain_d1',
    tier: 'mid_table',
    baseLeagueMod: 1.00,
    leagueTitles: 6,
    lastLeagueYear: 2004,
    continentalTitles: 0,
    baseContinentalMod: 1.00,
  },
  {
    teamId: 'esp_valladolid',
    teamName: 'Real Valladolid',
    leagueId: 'spain_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'esp_leganes',
    teamName: 'CD Leganés',
    leagueId: 'spain_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'esp_espanyol',
    teamName: 'RCD Espanyol',
    leagueId: 'spain_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },

  // ENGLAND (Premier League)
  // Big 6 modifier + bonus to recent champions/contenders (Arsenal, Liverpool, City)
  {
    teamId: 'eng_mancity',
    teamName: 'Manchester City',
    leagueId: 'england_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.25, // Recent 4-in-a-row champion bonus
    leagueTitles: 10,
    lastLeagueYear: 2024,
    continentalTitles: 1,
    baseContinentalMod: 1.22,
    lastContinentalYear: 2023,
    favoriteTag: 'Premier Powerhouse ⚡',
  },
  {
    teamId: 'eng_arsenal',
    teamName: 'Arsenal',
    leagueId: 'england_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.22, // Recent contender bonus
    leagueTitles: 13,
    lastLeagueYear: 2004,
    continentalTitles: 0,
    baseContinentalMod: 1.14,
    favoriteTag: 'Title Contender ⚔️',
  },
  {
    teamId: 'eng_liverpool',
    teamName: 'Liverpool',
    leagueId: 'england_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.22, // Recent contender bonus
    leagueTitles: 19,
    lastLeagueYear: 2020,
    continentalTitles: 6,
    baseContinentalMod: 1.20, // 3rd tier UCL favorite (6 UCLs)
    lastContinentalYear: 2019,
    favoriteTag: 'European Royalty 🏆',
  },
  {
    teamId: 'eng_chelsea',
    teamName: 'Chelsea',
    leagueId: 'england_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.12, // Big 6 modifier
    leagueTitles: 6,
    lastLeagueYear: 2017,
    continentalTitles: 2,
    baseContinentalMod: 1.12,
    lastContinentalYear: 2021,
    favoriteTag: 'Big 6 Regular 🛡️',
  },
  {
    teamId: 'eng_manutd',
    teamName: 'Manchester United',
    leagueId: 'england_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.12, // Big 6 modifier
    leagueTitles: 20,
    lastLeagueYear: 2013,
    continentalTitles: 3,
    baseContinentalMod: 1.12,
    lastContinentalYear: 2008,
    favoriteTag: 'Historic Giant 🏛️',
  },
  {
    teamId: 'eng_tottenham',
    teamName: 'Tottenham Hotspur',
    leagueId: 'england_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.10, // Big 6 modifier
    leagueTitles: 2,
    lastLeagueYear: 1961,
    continentalTitles: 0,
    baseContinentalMod: 1.08,
    favoriteTag: 'Big 6 Regular 🛡️',
  },
  {
    teamId: 'eng_astonvilla',
    teamName: 'Aston Villa',
    leagueId: 'england_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.07,
    leagueTitles: 7,
    lastLeagueYear: 1981,
    continentalTitles: 1,
    baseContinentalMod: 1.07,
    lastContinentalYear: 1982,
  },
  {
    teamId: 'eng_newcastle',
    teamName: 'Newcastle United',
    leagueId: 'england_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 4,
    lastLeagueYear: 1927,
    continentalTitles: 0,
    baseContinentalMod: 1.04,
  },
  {
    teamId: 'eng_leicester',
    teamName: 'Leicester City',
    leagueId: 'england_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 1,
    lastLeagueYear: 2016,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'eng_ipswich',
    teamName: 'Ipswich Town',
    leagueId: 'england_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 1,
    lastLeagueYear: 1962,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'eng_southampton',
    teamName: 'Southampton',
    leagueId: 'england_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },

  // FRANCE (Ligue 1)
  // PSG gets a huge modifier, Lille/Marseille/Monaco/Lyon small one
  {
    teamId: 'fr_psg',
    teamName: 'Paris Saint-Germain',
    leagueId: 'france_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.45, // Huge modifier
    leagueTitles: 12,
    lastLeagueYear: 2024,
    continentalTitles: 0,
    baseContinentalMod: 1.28, // 2nd tier UCL favorite
    favoriteTag: 'Ligue 1 Hegemon 👑',
  },
  {
    teamId: 'fr_marseille',
    teamName: 'Olympique de Marseille',
    leagueId: 'france_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.10, // Small modifier
    leagueTitles: 9,
    lastLeagueYear: 2010,
    continentalTitles: 1,
    baseContinentalMod: 1.08,
    lastContinentalYear: 1993,
    favoriteTag: 'Challenger ⚔️',
  },
  {
    teamId: 'fr_monaco',
    teamName: 'AS Monaco',
    leagueId: 'france_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.10, // Small modifier
    leagueTitles: 8,
    lastLeagueYear: 2017,
    continentalTitles: 0,
    baseContinentalMod: 1.07,
    favoriteTag: 'Challenger ⚔️',
  },
  {
    teamId: 'fr_lyon',
    teamName: 'Olympique Lyonnais',
    leagueId: 'france_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.10, // Small modifier
    leagueTitles: 7,
    lastLeagueYear: 2008,
    continentalTitles: 0,
    baseContinentalMod: 1.06,
    favoriteTag: 'Challenger ⚔️',
  },
  {
    teamId: 'fr_lille',
    teamName: 'LOSC Lille',
    leagueId: 'france_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.10, // Small modifier
    leagueTitles: 4,
    lastLeagueYear: 2021,
    continentalTitles: 0,
    baseContinentalMod: 1.06,
    favoriteTag: 'Challenger ⚔️',
  },
  {
    teamId: 'fr_auxerre',
    teamName: 'AJ Auxerre',
    leagueId: 'france_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 1,
    lastLeagueYear: 1996,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'fr_angers',
    teamName: 'Angers SCO',
    leagueId: 'france_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'fr_stetienne',
    teamName: 'AS Saint-Étienne',
    leagueId: 'france_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 10,
    lastLeagueYear: 1981,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },

  // GERMANY (Bundesliga)
  // Bayern big modifier (not as big as PSG), Dortmund small one
  {
    teamId: 'ger_bayern',
    teamName: 'FC Bayern München',
    leagueId: 'germany_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.32, // Big modifier
    leagueTitles: 33,
    lastLeagueYear: 2023,
    continentalTitles: 6,
    baseContinentalMod: 1.25, // 2nd tier UCL favorite (6 UCLs)
    lastContinentalYear: 2020,
    favoriteTag: 'Bavarian Giant 👑',
  },
  {
    teamId: 'ger_leverkusen',
    teamName: 'Bayer 04 Leverkusen',
    leagueId: 'germany_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.16, // Recent unbeaten champion bonus
    leagueTitles: 1,
    lastLeagueYear: 2024,
    continentalTitles: 0,
    baseContinentalMod: 1.12,
    favoriteTag: 'Defending Champions 🏆',
  },
  {
    teamId: 'ger_dortmund',
    teamName: 'Borussia Dortmund',
    leagueId: 'germany_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.12, // Small modifier
    leagueTitles: 8,
    lastLeagueYear: 2012,
    continentalTitles: 1,
    baseContinentalMod: 1.09,
    lastContinentalYear: 1997,
    favoriteTag: 'Contender ⚔️',
  },
  {
    teamId: 'ger_leipzig',
    teamName: 'RB Leipzig',
    leagueId: 'germany_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.08,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    baseContinentalMod: 1.07,
  },
  {
    teamId: 'ger_stuttgart',
    teamName: 'VfB Stuttgart',
    leagueId: 'germany_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 5,
    lastLeagueYear: 2007,
    continentalTitles: 0,
    baseContinentalMod: 1.04,
  },
  {
    teamId: 'ger_stpauli',
    teamName: 'FC St. Pauli',
    leagueId: 'germany_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'ger_kiel',
    teamName: 'Holstein Kiel',
    leagueId: 'germany_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },

  // ITALY (Serie A)
  // Inter moderate modifier, Milan/Napoli/Juventus small modifier
  {
    teamId: 'ita_inter',
    teamName: 'Inter Milan',
    leagueId: 'italy_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.22, // Moderate modifier
    leagueTitles: 20,
    lastLeagueYear: 2024,
    continentalTitles: 3,
    baseContinentalMod: 1.18, // 3rd tier UCL favorite (3 UCLs)
    lastContinentalYear: 2010,
    favoriteTag: 'Scudetto Favorite ⭐',
  },
  {
    teamId: 'ita_juventus',
    teamName: 'Juventus',
    leagueId: 'italy_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.13, // Small modifier
    leagueTitles: 36,
    lastLeagueYear: 2020,
    continentalTitles: 2,
    baseContinentalMod: 1.10,
    lastContinentalYear: 1996,
    favoriteTag: 'Historic Giant 🏛️',
  },
  {
    teamId: 'ita_milan',
    teamName: 'AC Milan',
    leagueId: 'italy_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.12, // Small modifier
    leagueTitles: 19,
    lastLeagueYear: 2022,
    continentalTitles: 7,
    baseContinentalMod: 1.18, // 7 UCLs with legacy
    lastContinentalYear: 2007,
    favoriteTag: 'European Royalty 🏆',
  },
  {
    teamId: 'ita_napoli',
    teamName: 'SSC Napoli',
    leagueId: 'italy_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.12, // Small modifier
    leagueTitles: 3,
    lastLeagueYear: 2023,
    continentalTitles: 0,
    baseContinentalMod: 1.06,
    favoriteTag: 'Contender ⚔️',
  },
  {
    teamId: 'ita_atalanta',
    teamName: 'Atalanta BC',
    leagueId: 'italy_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.07,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    baseContinentalMod: 1.08,
  },
  {
    teamId: 'ita_parma',
    teamName: 'Parma Calcio',
    leagueId: 'italy_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'ita_como',
    teamName: 'Como 1907',
    leagueId: 'italy_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },
  {
    teamId: 'ita_venezia',
    teamName: 'Venezia FC',
    leagueId: 'italy_d1',
    tier: 'promoted_underdog',
    baseLeagueMod: 0.92,
    leagueTitles: 0,
    lastLeagueYear: 0,
    continentalTitles: 0,
    isFirstSeasonPromoted: true,
  },

  // SAUDI ARABIA (Saudi Pro League)
  // "in arabia do even smaller modifiers"
  {
    teamId: 'sau_alhilal',
    teamName: 'Al-Hilal',
    leagueId: 'saudi_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.15, // Smaller modifier
    leagueTitles: 19,
    lastLeagueYear: 2024,
    continentalTitles: 4,
    baseContinentalMod: 1.10,
    lastContinentalYear: 2021,
    favoriteTag: 'Saudi Leader ⭐',
  },
  {
    teamId: 'sau_alnassr',
    teamName: 'Al-Nassr',
    leagueId: 'saudi_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.10,
    leagueTitles: 9,
    lastLeagueYear: 2019,
    continentalTitles: 0,
    baseContinentalMod: 1.06,
    favoriteTag: 'Title Contender ⚔️',
  },
  {
    teamId: 'sau_alittihad',
    teamName: 'Al-Ittihad',
    leagueId: 'saudi_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.08,
    leagueTitles: 9,
    lastLeagueYear: 2023,
    continentalTitles: 2,
    baseContinentalMod: 1.06,
    lastContinentalYear: 2005,
  },
  {
    teamId: 'sau_alahli',
    teamName: 'Al-Ahli',
    leagueId: 'saudi_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 3,
    lastLeagueYear: 2016,
    continentalTitles: 0,
    baseContinentalMod: 1.04,
  },

  // SOUTH AMERICA (Libertadores & Leagues)
  // "for South America do these modifiers also for libertadores and the leagues, but make them smaller as Sudamérica is more random"
  {
    teamId: 'bra_flamengo',
    teamName: 'CR Flamengo',
    leagueId: 'brazil_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.12, // Smaller South American modifier
    leagueTitles: 8,
    lastLeagueYear: 2020,
    continentalTitles: 3,
    baseContinentalMod: 1.12, // 3 Libertadores
    lastContinentalYear: 2022,
    favoriteTag: 'Mengão Potência ⭐',
  },
  {
    teamId: 'bra_palmeiras',
    teamName: 'SE Palmeiras',
    leagueId: 'brazil_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.12,
    leagueTitles: 12,
    lastLeagueYear: 2023,
    continentalTitles: 3,
    baseContinentalMod: 1.12,
    lastContinentalYear: 2021,
    favoriteTag: 'Verdão Campeão ⭐',
  },
  {
    teamId: 'bra_botafogo',
    teamName: 'Botafogo FR',
    leagueId: 'brazil_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.08,
    leagueTitles: 2,
    lastLeagueYear: 1995,
    continentalTitles: 1,
    baseContinentalMod: 1.08,
    lastContinentalYear: 2024,
  },
  {
    teamId: 'bra_atletico_mg',
    teamName: 'Atlético Mineiro',
    leagueId: 'brazil_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.07,
    leagueTitles: 3,
    lastLeagueYear: 2021,
    continentalTitles: 1,
    baseContinentalMod: 1.07,
    lastContinentalYear: 2013,
  },
  {
    teamId: 'bra_saopaulo',
    teamName: 'São Paulo FC',
    leagueId: 'brazil_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 6,
    lastLeagueYear: 2008,
    continentalTitles: 3,
    baseContinentalMod: 1.10,
    lastContinentalYear: 2005,
  },
  {
    teamId: 'bra_fluminense',
    teamName: 'Fluminense FC',
    leagueId: 'brazil_d1',
    tier: 'european_regular',
    baseLeagueMod: 1.06,
    leagueTitles: 4,
    lastLeagueYear: 2012,
    continentalTitles: 1,
    baseContinentalMod: 1.08,
    lastContinentalYear: 2023,
  },
  {
    teamId: 'arg_river',
    teamName: 'River Plate',
    leagueId: 'argentina_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.12,
    leagueTitles: 38,
    lastLeagueYear: 2023,
    continentalTitles: 4,
    baseContinentalMod: 1.12,
    lastContinentalYear: 2018,
    favoriteTag: 'Millonario Gigante ⭐',
  },
  {
    teamId: 'arg_boca',
    teamName: 'Boca Juniors',
    leagueId: 'argentina_d1',
    tier: 'heavyweight_favorite',
    baseLeagueMod: 1.12,
    leagueTitles: 35,
    lastLeagueYear: 2022,
    continentalTitles: 6,
    baseContinentalMod: 1.13, // 6 Libertadores
    lastContinentalYear: 2007,
    favoriteTag: 'Xeneize Mística ⭐',
  },
  {
    teamId: 'arg_racing',
    teamName: 'Racing Club',
    leagueId: 'argentina_d1',
    tier: 'title_contender',
    baseLeagueMod: 1.06,
    leagueTitles: 18,
    lastLeagueYear: 2019,
    continentalTitles: 1,
    baseContinentalMod: 1.06,
  },
];

// NATIONAL TEAMS (World Cup Heritage)
// Brazil 5, Germany 4, Italy 4, Argentina 3, France 2, Uruguay 2, England 1, Spain 1
const INITIAL_NATIONAL_SEEDS: NationalTeamPowerscaleProfile[] = [
  {
    countryCode: 'BRA',
    countryName: 'Brazil',
    worldCupTitlesCount: 5,
    baseWorldCupModifier: 1.25,
    currentWorldCupModifier: 1.25,
    yearsWithoutWorldCup: 24, // 2002
    lastWorldCupTitleYear: 2002,
    favoriteTag: 'Pentacampeão ⭐️⭐️⭐️⭐️⭐️',
  },
  {
    countryCode: 'GER',
    countryName: 'Germany',
    worldCupTitlesCount: 4,
    baseWorldCupModifier: 1.20,
    currentWorldCupModifier: 1.20,
    yearsWithoutWorldCup: 12, // 2014
    lastWorldCupTitleYear: 2014,
    favoriteTag: 'Vier Sterne ⭐️⭐️⭐️⭐️',
  },
  {
    countryCode: 'ITA',
    countryName: 'Italy',
    worldCupTitlesCount: 4,
    baseWorldCupModifier: 1.20,
    currentWorldCupModifier: 1.16, // Drought decay applied
    yearsWithoutWorldCup: 20, // 2006
    lastWorldCupTitleYear: 2006,
    favoriteTag: 'Quattro Stelle ⭐️⭐️⭐️⭐️',
  },
  {
    countryCode: 'ARG',
    countryName: 'Argentina',
    worldCupTitlesCount: 3,
    baseWorldCupModifier: 1.18,
    currentWorldCupModifier: 1.18, // Recent 2022 champions, no decay
    yearsWithoutWorldCup: 4, // 2022
    lastWorldCupTitleYear: 2022,
    favoriteTag: 'Defending World Champions 🏆',
  },
  {
    countryCode: 'FRA',
    countryName: 'France',
    worldCupTitlesCount: 2,
    baseWorldCupModifier: 1.15,
    currentWorldCupModifier: 1.15,
    yearsWithoutWorldCup: 8, // 2018
    lastWorldCupTitleYear: 2018,
    favoriteTag: 'Deux Étoiles ⭐️⭐️',
  },
  {
    countryCode: 'URU',
    countryName: 'Uruguay',
    worldCupTitlesCount: 2,
    baseWorldCupModifier: 1.12,
    currentWorldCupModifier: 1.08, // Long drought decay
    yearsWithoutWorldCup: 76,
    lastWorldCupTitleYear: 1950,
    favoriteTag: 'Garra Charrúa ⭐️⭐️',
  },
  {
    countryCode: 'ENG',
    countryName: 'England',
    worldCupTitlesCount: 1,
    baseWorldCupModifier: 1.08,
    currentWorldCupModifier: 1.06,
    yearsWithoutWorldCup: 60,
    lastWorldCupTitleYear: 1966,
    favoriteTag: 'World Cup Heritage ⭐️',
  },
  {
    countryCode: 'ESP',
    countryName: 'Spain',
    worldCupTitlesCount: 1,
    baseWorldCupModifier: 1.08,
    currentWorldCupModifier: 1.08,
    yearsWithoutWorldCup: 16,
    lastWorldCupTitleYear: 2010,
    favoriteTag: 'Estrella Mundial ⭐️',
  },
];

// ---------------------------------------------------------------------------
// DECAY & REFRESH LOGIC
// ---------------------------------------------------------------------------

/**
 * Calculates decay for a modifier when a team hasn't won in 5+ years.
 * If drought < 5, decay is 0 (full base strength).
 * If drought >= 5, decays smoothly by 2% per drought year above 4, with a safeguard floor.
 */
export function calculateDroughtDecay(yearsWithoutTitle: number, baseModifier: number): number {
  if (yearsWithoutTitle < 5) return 0;
  const yearsPastGrace = yearsWithoutTitle - 4;
  // 2% decay per year, capped at 60% of the surplus above 1.0
  const surplus = Math.max(0, baseModifier - 1.0);
  const maxDecay = surplus * 0.65;
  const decayAmount = Math.min(maxDecay, yearsPastGrace * 0.02);
  return Number(decayAmount.toFixed(4));
}

/**
 * Derives effective modifier given base, drought decay, performance drift, and promoted status.
 */
export function calculateEffectiveModifier(
  baseModifier: number,
  yearsWithoutTitle: number,
  performanceTrend: number = 0,
  isPromotedSeason: boolean = false
): number {
  if (isPromotedSeason) {
    // Promoted teams receive a small negative modifier (-8%) in their first season
    return 0.92;
  }
  const decay = calculateDroughtDecay(yearsWithoutTitle, baseModifier);
  // Performance trend adds slight micro-drift (+- 0.015 per point)
  const trendOffset = performanceTrend * 0.015;
  const effective = baseModifier - decay + trendOffset;
  return Number(Math.max(0.85, effective).toFixed(3));
}

// ---------------------------------------------------------------------------
// STATE INITIALIZATION & PERSISTENCE
// ---------------------------------------------------------------------------

let cachedPowerscaleState: PowerscaleSystemState | null = null;

function buildInitialPowerscaleState(currentSeasonYear: string = '2026/27'): PowerscaleSystemState {
  const parsedYear = parseInt(currentSeasonYear.split('/')[0], 10) || 2026;
  const clubs: Record<string, ClubPowerscaleProfile> = {};

  INITIAL_CLUB_SEEDS.forEach((seed) => {
    const yearsWithoutLeague = seed.lastLeagueYear > 0 ? Math.max(0, parsedYear - seed.lastLeagueYear) : 10;
    const yearsWithoutContinental = seed.lastContinentalYear ? Math.max(0, parsedYear - seed.lastContinentalYear) : 10;
    
    // Auto-calculate base continental modifier from UCL titles count if not explicitly set
    // (+2.5% per title as requested by user)
    const derivedBaseContinental = seed.baseContinentalMod !== undefined
      ? seed.baseContinentalMod
      : (seed.continentalTitles > 0 ? Number((1.0 + seed.continentalTitles * 0.025).toFixed(3)) : 1.00);

    const currentLeague = calculateEffectiveModifier(
      seed.baseLeagueMod,
      yearsWithoutLeague,
      0,
      !!seed.isFirstSeasonPromoted
    );

    const currentContinental = calculateEffectiveModifier(
      derivedBaseContinental,
      yearsWithoutContinental,
      0,
      false
    );

    clubs[seed.teamId] = {
      teamId: seed.teamId,
      teamName: seed.teamName,
      leagueId: seed.leagueId,
      tier: seed.tier,
      baseLeagueModifier: seed.baseLeagueMod,
      currentLeagueModifier: currentLeague,
      yearsWithoutLeagueTitle: yearsWithoutLeague,
      leagueTitlesCount: seed.leagueTitles,
      lastLeagueTitleYear: seed.lastLeagueYear > 0 ? seed.lastLeagueYear : undefined,
      continentalTitlesCount: seed.continentalTitles,
      baseContinentalModifier: derivedBaseContinental,
      currentContinentalModifier: currentContinental,
      yearsWithoutContinentalTitle: yearsWithoutContinental,
      lastContinentalTitleYear: seed.lastContinentalYear,
      performanceTrend: 0,
      isFirstSeasonPromoted: !!seed.isFirstSeasonPromoted,
      favoriteTag: seed.favoriteTag,
    };
  });

  const nationals: Record<string, NationalTeamPowerscaleProfile> = {};
  INITIAL_NATIONAL_SEEDS.forEach((nat) => {
    const yearsDrought = nat.lastWorldCupTitleYear ? Math.max(0, parsedYear - nat.lastWorldCupTitleYear) : 20;
    const effective = calculateEffectiveModifier(nat.baseWorldCupModifier, yearsDrought);
    nationals[nat.countryCode] = {
      ...nat,
      yearsWithoutWorldCup: yearsDrought,
      currentWorldCupModifier: effective,
    };
  });

  return {
    version: 1,
    seasonYear: currentSeasonYear,
    clubProfiles: clubs,
    nationalProfiles: nationals,
    lastUpdated: new Date().toISOString(),
  };
}

export function getPowerscaleState(seasonYear: string = '2026/27'): PowerscaleSystemState {
  if (cachedPowerscaleState && cachedPowerscaleState.seasonYear === seasonYear) {
    return cachedPowerscaleState;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(POWERSCALE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PowerscaleSystemState;
        if (parsed && parsed.clubProfiles && parsed.version === 1) {
          cachedPowerscaleState = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read powerscale state from localStorage:', e);
    }
  }

  const initial = buildInitialPowerscaleState(seasonYear);
  savePowerscaleState(initial);
  return initial;
}

export function savePowerscaleState(state: PowerscaleSystemState): void {
  cachedPowerscaleState = state;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(POWERSCALE_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save powerscale state to localStorage:', e);
    }
  }
}

// ---------------------------------------------------------------------------
// MATCH MULTIPLIER RESOLUTION
// ---------------------------------------------------------------------------

/**
 * Checks if a competition is a local cup (FA Cup, Copa del Rey, etc.).
 * Local cups share the league modifier as specified by the user!
 */
export function isLocalCupCompetition(competitionId: string): boolean {
  const lower = (competitionId || '').toLowerCase();
  return (
    lower.includes('cup') ||
    lower.includes('copa') ||
    lower.includes('pokal') ||
    lower.includes('coupe') ||
    lower.includes('coppa') ||
    lower.includes('shield') ||
    lower.includes('supercup') ||
    lower.includes('supercopa')
  );
}

/**
 * Checks if a competition is continental (UEFA Champions League, Libertadores, etc.)
 */
export function isContinentalCompetition(competitionId: string): boolean {
  const upper = (competitionId || '').toUpperCase();
  return (
    upper.includes('UEFA') ||
    upper.includes('CONMEBOL') ||
    upper.includes('CONCACAF') ||
    upper.includes('AFC') ||
    upper.includes('CAF') ||
    upper.includes('LIB') ||
    upper.includes('SUD') ||
    upper.includes('CL') ||
    upper.includes('EL') ||
    upper.includes('ECL')
  );
}

/**
 * Retrieves the exact Powerscale match impact for a club in a given competition.
 */
export function getClubPowerscaleImpact(
  teamId: string,
  teamName: string,
  competitionId?: string,
  seasonYear: string = '2026/27'
): MatchPowerscaleImpact {
  const state = getPowerscaleState(seasonYear);
  const profile = state.clubProfiles[teamId];

  if (!profile) {
    // Default baseline for unprofiled mid-table / generic teams
    return {
      teamId,
      teamName,
      effectiveModifier: 1.00,
      baseModifier: 1.00,
      decayApplied: 0,
      tier: 'mid_table',
      heritageStacks: 0,
      isFavorite: false,
      label: 'Standard Contender',
    };
  }

  const compId = (competitionId || '').trim();
  const isContinental = isContinentalCompetition(compId);

  if (isContinental) {
    // UCL / Libertadores / Continental match
    const decay = calculateDroughtDecay(profile.yearsWithoutContinentalTitle, profile.baseContinentalModifier);
    const effective = profile.currentContinentalModifier;
    const isFavorite = effective >= 1.15;
    
    return {
      teamId,
      teamName: profile.teamName,
      effectiveModifier: effective,
      baseModifier: profile.baseContinentalModifier,
      decayApplied: decay,
      tier: profile.tier,
      heritageStacks: profile.continentalTitlesCount,
      isFavorite,
      label: profile.favoriteTag || (isFavorite ? 'Continental Favorite 👑' : 'Tournament Challenger'),
    };
  }

  // Domestic League or Local Cup
  // As requested: "the league modifiers are shared with the local cup, however the local cup does not refresh a league modifier"
  const decay = calculateDroughtDecay(profile.yearsWithoutLeagueTitle, profile.baseLeagueModifier);
  const effective = profile.currentLeagueModifier;
  const isFavorite = effective >= 1.15;

  return {
    teamId,
    teamName: profile.teamName,
    effectiveModifier: effective,
    baseModifier: profile.baseLeagueModifier,
    decayApplied: decay,
    tier: profile.tier,
    heritageStacks: profile.leagueTitlesCount,
    isFavorite,
    label: profile.favoriteTag || (profile.isFirstSeasonPromoted ? 'Promoted Underdog ⚠️' : isFavorite ? 'Title Favorite ⭐' : 'League Competitor'),
  };
}

/**
 * Retrieves the World Cup Powerscale multiplier for a national team.
 */
export function getNationalTeamPowerscaleImpact(
  countryCode: string,
  countryName: string,
  seasonYear: string = '2026/27'
): MatchPowerscaleImpact {
  const state = getPowerscaleState(seasonYear);
  const profile = state.nationalProfiles[countryCode];

  if (!profile) {
    // Team with no World Cups: authentic challenge (1.00x)
    return {
      teamId: countryCode,
      teamName: countryName,
      effectiveModifier: 1.00,
      baseModifier: 1.00,
      decayApplied: 0,
      tier: 'mid_table',
      heritageStacks: 0,
      isFavorite: false,
      label: 'World Cup Hopeful 🌍',
    };
  }

  const decay = calculateDroughtDecay(profile.yearsWithoutWorldCup, profile.baseWorldCupModifier);
  return {
    teamId: countryCode,
    teamName: profile.countryName,
    effectiveModifier: profile.currentWorldCupModifier,
    baseModifier: profile.baseWorldCupModifier,
    decayApplied: decay,
    tier: 'heavyweight_favorite',
    heritageStacks: profile.worldCupTitlesCount,
    isFavorite: true,
    label: profile.favoriteTag || `${profile.worldCupTitlesCount}x World Champions 🏆`,
  };
}

// ---------------------------------------------------------------------------
// TITLE REFRESH & DROUGHT TRANSITIONS
// ---------------------------------------------------------------------------

/**
 * Called when a team wins a Continental tournament (e.g. Real Madrid wins UCL).
 * Refreshes all drought decay back to full strength and increments titles stack!
 */
export function recordContinentalWinnerTitle(
  competitionId: string,
  winnerTeamId: string,
  seasonYear: string = '2026/27'
): void {
  const state = getPowerscaleState(seasonYear);
  const parsedYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const profile = state.clubProfiles[winnerTeamId];

  if (profile) {
    // Full refresh of continental heritage
    profile.continentalTitlesCount += 1;
    profile.yearsWithoutContinentalTitle = 0;
    profile.lastContinentalTitleYear = parsedYear;
    
    // If it's UCL (+2.5% per title as requested)
    if (competitionId.toUpperCase().includes('CL')) {
      profile.baseContinentalModifier = Number((profile.baseContinentalModifier + 0.025).toFixed(3));
    }
    
    // Fully restore current modifier without any decay!
    profile.currentContinentalModifier = profile.baseContinentalModifier;
    savePowerscaleState(state);
  }
}

/**
 * Called at the conclusion of a domestic league season.
 * Refreshes the champion's decay, advances drought for others, and updates expectation drift.
 */
export function recordLeagueSeasonFinish(
  leagueId: string,
  championTeamId: string,
  standingsTeamIds: string[] = [],
  seasonYear: string = '2026/27'
): void {
  const state = getPowerscaleState(seasonYear);
  const parsedYear = parseInt(seasonYear.split('/')[0], 10) || 2026;

  // 1. Process Champion: Full Refresh!
  const champ = state.clubProfiles[championTeamId];
  if (champ) {
    champ.leagueTitlesCount += 1;
    champ.yearsWithoutLeagueTitle = 0;
    champ.lastLeagueTitleYear = parsedYear;
    champ.currentLeagueModifier = champ.baseLeagueModifier; // Fully restored!
    champ.performanceTrend = Math.min(3, champ.performanceTrend + 1);
    champ.isFirstSeasonPromoted = false; // Established!
  }

  // 2. Process Other Teams in the League
  standingsTeamIds.forEach((tId, rankIndex) => {
    if (tId === championTeamId) return;
    const team = state.clubProfiles[tId];
    if (!team) return;

    // Advance drought
    team.yearsWithoutLeagueTitle += 1;
    if (team.isFirstSeasonPromoted) {
      // Promoted team survived first season! Negative modifier is removed
      team.isFirstSeasonPromoted = false;
      team.baseLeagueModifier = 1.00;
      team.tier = 'mid_table';
    }

    // Expectation evaluation (mean-reversion):
    // If a mid-table / relegation team finished in top 4 (European spot), boost trend
    if (rankIndex < 4 && (team.tier === 'mid_table' || team.tier === 'relegation_threat')) {
      team.performanceTrend = Math.min(3, team.performanceTrend + 1);
    } else if (rankIndex > 14 && team.tier === 'heavyweight_favorite') {
      // Slump
      team.performanceTrend = Math.max(-3, team.performanceTrend - 1);
    } else {
      // Mean-reversion back to base 0
      team.performanceTrend = Number((team.performanceTrend * 0.7).toFixed(2));
    }

    // Recalculate effective modifier with new drought & performance trend
    team.currentLeagueModifier = calculateEffectiveModifier(
      team.baseLeagueModifier,
      team.yearsWithoutLeagueTitle,
      team.performanceTrend,
      team.isFirstSeasonPromoted
    );
  });

  state.lastUpdated = new Date().toISOString();
  savePowerscaleState(state);
}

/**
 * Called when a World Cup completes.
 */
export function recordWorldCupWinner(
  winnerCountryCode: string,
  seasonYear: string = '2026/27'
): void {
  const state = getPowerscaleState(seasonYear);
  const parsedYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const profile = state.nationalProfiles[winnerCountryCode];

  if (profile) {
    profile.worldCupTitlesCount += 1;
    profile.yearsWithoutWorldCup = 0;
    profile.lastWorldCupTitleYear = parsedYear;
    profile.baseWorldCupModifier = Number((profile.baseWorldCupModifier + 0.05).toFixed(3));
    profile.currentWorldCupModifier = profile.baseWorldCupModifier;
  } else {
    // A nation wins their very first World Cup!
    state.nationalProfiles[winnerCountryCode] = {
      countryCode: winnerCountryCode,
      countryName: winnerCountryCode,
      worldCupTitlesCount: 1,
      baseWorldCupModifier: 1.08,
      currentWorldCupModifier: 1.08,
      yearsWithoutWorldCup: 0,
      lastWorldCupTitleYear: parsedYear,
      favoriteTag: 'Historic World Champions ⭐️',
    };
  }

  // Advance drought for other nations
  Object.values(state.nationalProfiles).forEach((nat) => {
    if (nat.countryCode !== winnerCountryCode) {
      nat.yearsWithoutWorldCup += 4;
      nat.currentWorldCupModifier = calculateEffectiveModifier(
        nat.baseWorldCupModifier,
        nat.yearsWithoutWorldCup
      );
    }
  });

  savePowerscaleState(state);
}

/**
 * Returns all club profiles in a specific league, sorted by effective modifier.
 */
export function getLeaguePowerscaleProfiles(
  leagueId: string,
  seasonYear: string = '2026/27'
): ClubPowerscaleProfile[] {
  const state = getPowerscaleState(seasonYear);
  return Object.values(state.clubProfiles)
    .filter((p) => p.leagueId === leagueId)
    .sort((a, b) => b.currentLeagueModifier - a.currentLeagueModifier);
}

/**
 * Returns all continental heavyweight profiles sorted by current continental modifier.
 */
export function getContinentalPowerscaleFavorites(
  seasonYear: string = '2026/27'
): ClubPowerscaleProfile[] {
  const state = getPowerscaleState(seasonYear);
  return Object.values(state.clubProfiles)
    .filter((p) => p.continentalTitlesCount > 0 || p.currentContinentalModifier >= 1.08)
    .sort((a, b) => b.currentContinentalModifier - a.currentContinentalModifier);
}
