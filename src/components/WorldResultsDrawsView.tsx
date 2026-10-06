import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Globe,
  Shield,
  Sparkles,
  Play,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Users,
  RotateCcw,
  Calendar,
  Star,
  Swords,
  Layers,
  Award,
} from 'lucide-react';
import { PlayerCardData, PlayerConfig } from '../types';
import {
  getOrCreateAuthoritativeDraw,
  isNationQualifiedForTournament,
  InternationalDrawState,
  NationalTeamDrawGroup,
} from '../utils/internationalDrawEngine';
import {
  getContinentalTournamentState,
  generateContinentalTournamentDraw,
} from '../utils/continentalTournamentEngine';
import {
  determineContinentalQualifiers,
} from '../utils/continentalQualificationSystem';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';
import {
  ContinentalCompetitionId,
  ContinentalTournamentSeasonState,
  ContinentalGroup,
} from '../types/continentalCompetitions';
import { NationalTeamDrawModal } from './NationalTeamDrawModal';
import { ContinentalDrawModal } from './ContinentalDrawModal';

interface WorldResultsDrawsViewProps {
  player?: PlayerCardData | PlayerConfig;
  seasonYear?: string;
  onOpenExternalDrawModal?: (type: 'continental' | 'national', data: any) => void;
}

type DrawCategory = 'all' | 'continental' | 'international';

interface CompetitionDrawCatalogItem {
  id: string;
  name: string;
  shortName: string;
  category: 'continental' | 'international';
  federation: 'FIFA' | 'UEFA' | 'CONMEBOL';
  formatDescription: string;
  icon: string;
  accentColor: string;
  borderClass: string;
  bgClass: string;
  tier?: 'Senior' | 'U20' | 'U17';
  continentalCompId?: ContinentalCompetitionId;
  competitionType?: 'tournament' | 'qualifier';
}

const COMPETITION_DRAWS_CATALOG: CompetitionDrawCatalogItem[] = [
  // 1. National Team Tournaments
  {
    id: 'FIFA_WORLD_CUP',
    name: 'FIFA World Trophy',
    shortName: 'World Trophy',
    category: 'international',
    federation: 'FIFA',
    formatDescription: '32 Qualified Nations • 8 Groups of 4 • 4 Seeding Pots',
    icon: '🏆',
    accentColor: '#F59E0B',
    borderClass: 'border-amber-500/70',
    bgClass: 'from-amber-950/40 via-slate-900 to-slate-950',
    tier: 'Senior',
    competitionType: 'tournament',
  },
  {
    id: 'UEFA_EURO',
    name: 'UEFA European Championship',
    shortName: 'UEFA Euro',
    category: 'international',
    federation: 'UEFA',
    formatDescription: '24 Top European Nations • 6 Groups of 4 • Continental Prestige',
    icon: '⭐',
    accentColor: '#38BDF8',
    borderClass: 'border-sky-500/70',
    bgClass: 'from-sky-950/40 via-slate-900 to-slate-950',
    tier: 'Senior',
    competitionType: 'tournament',
  },
  {
    id: 'COPA_AMERICA',
    name: 'CONMEBOL Copa América',
    shortName: 'Copa América',
    category: 'international',
    federation: 'CONMEBOL',
    formatDescription: '16 Nations • 4 Groups of 4 • Authentic South American Showcase',
    icon: '👑',
    accentColor: '#10B981',
    borderClass: 'border-emerald-500/70',
    bgClass: 'from-emerald-950/40 via-slate-900 to-slate-950',
    tier: 'Senior',
    competitionType: 'tournament',
  },
  {
    id: 'FIFA_U20_WORLD_CUP',
    name: 'FIFA U-20 World Trophy',
    shortName: 'U20 World Trophy',
    category: 'international',
    federation: 'FIFA',
    formatDescription: '24 Global Youth Squads • 6 Groups of 4 • Elite Wonderkid Stage',
    icon: '⚡',
    accentColor: '#A855F7',
    borderClass: 'border-purple-500/70',
    bgClass: 'from-purple-950/40 via-slate-900 to-slate-950',
    tier: 'U20',
    competitionType: 'tournament',
  },
  {
    id: 'FIFA_U17_WORLD_CUP',
    name: 'FIFA U-17 World Trophy',
    shortName: 'U17 World Trophy',
    category: 'international',
    federation: 'FIFA',
    formatDescription: '24 Academy Prodigy Nations • 6 Groups of 4 • Foundation Showcase',
    icon: '🌟',
    accentColor: '#EC4899',
    borderClass: 'border-pink-500/70',
    bgClass: 'from-pink-950/40 via-slate-900 to-slate-950',
    tier: 'U17',
    competitionType: 'tournament',
  },
  {
    id: 'UEFA_QUALIFIERS',
    name: 'European Championship Qualifiers',
    shortName: 'Euro Qualifiers',
    category: 'international',
    federation: 'UEFA',
    formatDescription: 'European Nations Qualifying Groups • Top 2 Seed Direct Advance',
    icon: '🌐',
    accentColor: '#60A5FA',
    borderClass: 'border-blue-500/70',
    bgClass: 'from-blue-950/40 via-slate-900 to-slate-950',
    tier: 'Senior',
    competitionType: 'qualifier',
  },
  {
    id: 'CONMEBOL_ELIMINATORIAS',
    name: 'CONMEBOL Eliminatorias Sudamericanas',
    shortName: 'Eliminatorias',
    category: 'international',
    federation: 'CONMEBOL',
    formatDescription: 'All 10 South American Nations • 18 Round Double Round-Robin League',
    icon: '🔥',
    accentColor: '#F97316',
    borderClass: 'border-orange-500/70',
    bgClass: 'from-orange-950/40 via-slate-900 to-slate-950',
    tier: 'Senior',
    competitionType: 'qualifier',
  },

  // 2. Club Continental Competitions
  {
    id: 'UEFA_CL',
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    category: 'continental',
    federation: 'UEFA',
    formatDescription: '36 Elite Clubs • 4 Seeding Pots • 8 Drawn Rivals (4 Home, 4 Away)',
    icon: '🏆',
    accentColor: '#3B82F6',
    borderClass: 'border-blue-500/70',
    bgClass: 'from-blue-950/40 via-slate-900 to-slate-950',
    continentalCompId: 'UEFA_CL',
  },
  {
    id: 'UEFA_EL',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    category: 'continental',
    federation: 'UEFA',
    formatDescription: '36 Contender Clubs • 4 Pots • Single Swiss League Phase',
    icon: '🥈',
    accentColor: '#F59E0B',
    borderClass: 'border-amber-500/70',
    bgClass: 'from-amber-950/40 via-slate-900 to-slate-950',
    continentalCompId: 'UEFA_EL',
  },
  {
    id: 'UEFA_ECL',
    name: 'UEFA Conference League',
    shortName: 'Conference League',
    category: 'continental',
    federation: 'UEFA',
    formatDescription: '36 Rising Continental Clubs • 6 Matchday Swiss Phase',
    icon: '🥉',
    accentColor: '#10B981',
    borderClass: 'border-emerald-500/70',
    bgClass: 'from-emerald-950/40 via-slate-900 to-slate-950',
    continentalCompId: 'UEFA_ECL',
  },
  {
    id: 'CONMEBOL_LIB',
    name: 'CONMEBOL Copa Libertadores',
    shortName: 'Libertadores',
    category: 'continental',
    federation: 'CONMEBOL',
    formatDescription: '32 Premier South American Clubs • 8 Groups of 4 • Top 2 Advance',
    icon: '👑',
    accentColor: '#EAB308',
    borderClass: 'border-yellow-500/70',
    bgClass: 'from-yellow-950/40 via-slate-900 to-slate-950',
    continentalCompId: 'CONMEBOL_LIB',
  },
  {
    id: 'CONMEBOL_SUD',
    name: 'CONMEBOL Copa Sudamericana',
    shortName: 'Sudamericana',
    category: 'continental',
    federation: 'CONMEBOL',
    formatDescription: '32 South American Challenger Clubs • 8 Groups of 4',
    icon: '🌐',
    accentColor: '#06B6D4',
    borderClass: 'border-cyan-500/70',
    bgClass: 'from-cyan-950/40 via-slate-900 to-slate-950',
    continentalCompId: 'CONMEBOL_SUD',
  },
];

export const WorldResultsDrawsView: React.FC<WorldResultsDrawsViewProps> = ({
  player,
  seasonYear = '2026/27',
}) => {
  const [activeCategory, setActiveCategory] = useState<DrawCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompId, setSelectedCompId] = useState<string>('FIFA_WORLD_CUP');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Interactive draw modal overlay states
  const [activeNationalDraw, setActiveNationalDraw] = useState<InternationalDrawState | null>(null);
  const [activeContinentalDraw, setActiveContinentalDraw] = useState<ContinentalTournamentSeasonState | null>(null);

  const numericYear = useMemo(() => {
    const raw = seasonYear ? parseInt(seasonYear.slice(0, 4), 10) : 2026;
    return isNaN(raw) ? 2026 : raw;
  }, [seasonYear]);

  const playerNationCode = useMemo(() => {
    return (player?.nationality?.code || player?.countryCode || 'ENG').toUpperCase();
  }, [player]);

  const playerClubId = useMemo(() => {
    return player?.clubId || '';
  }, [player]);

  // Filter catalog items
  const filteredCompetitions = useMemo(() => {
    return COMPETITION_DRAWS_CATALOG.filter((comp) => {
      if (activeCategory !== 'all' && comp.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          comp.name.toLowerCase().includes(query) ||
          comp.shortName.toLowerCase().includes(query) ||
          comp.federation.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const activeCompetition = useMemo(() => {
    return (
      COMPETITION_DRAWS_CATALOG.find((c) => c.id === selectedCompId) ||
      COMPETITION_DRAWS_CATALOG[0]
    );
  }, [selectedCompId]);

  // Authoritative State Resolver for Selected Competition
  const nationalDrawState: InternationalDrawState | null = useMemo(() => {
    if (activeCompetition.category !== 'international') return null;
    return getOrCreateAuthoritativeDraw(
      playerNationCode,
      activeCompetition.name,
      numericYear,
      activeCompetition.tier || 'Senior',
      activeCompetition.competitionType || 'tournament'
    );
  }, [activeCompetition, playerNationCode, numericYear]);

  const continentalDrawState: ContinentalTournamentSeasonState | null = useMemo(() => {
    if (activeCompetition.category !== 'continental' || !activeCompetition.continentalCompId) {
      return null;
    }
    const compId = activeCompetition.continentalCompId;
    let state = getContinentalTournamentState(compId, numericYear);
    if (!state) {
      const db = getCareerLeagueDatabase();
      const qualifiers = determineContinentalQualifiers(
        compId,
        db,
        [],
        player,
        numericYear
      );
      state = generateContinentalTournamentDraw(compId, numericYear, qualifiers, playerClubId);
    }
    return state;
  }, [activeCompetition, numericYear, player, playerClubId]);

  // Auto-select user's group on competition switch
  useEffect(() => {
    if (activeCompetition.category === 'international' && nationalDrawState && nationalDrawState.groups?.length > 0) {
      const userGroup = nationalDrawState.groups.find((g) =>
        g.teams.some((t) => t.code.toUpperCase() === playerNationCode)
      );
      if (userGroup) {
        setSelectedGroupFilter(userGroup.groupLetter);
      } else {
        setSelectedGroupFilter(nationalDrawState.groups[0].groupLetter);
      }
    } else if (
      activeCompetition.category === 'continental' &&
      continentalDrawState &&
      !continentalDrawState.isLeaguePhaseFormat &&
      (continentalDrawState.groups || []).length > 0
    ) {
      const userGroup = continentalDrawState.groups.find((g) =>
        g.teams.some((t) => t.id === playerClubId)
      );
      if (userGroup) {
        setSelectedGroupFilter(userGroup.groupLetter);
      } else {
        setSelectedGroupFilter(continentalDrawState.groups[0].groupLetter);
      }
    }
  }, [selectedCompId, nationalDrawState, continentalDrawState, playerNationCode, playerClubId]);

  // Evaluation: Is player's squad or nation involved?
  const playerInvolvement = useMemo(() => {
    if (activeCompetition.category === 'continental') {
      if (!continentalDrawState) return { isInvolved: false, statusText: 'WORLD TOURNAMENT' };
      const inQualifiers = (continentalDrawState.qualifiers || []).some(
        (q) => q.teamId === playerClubId
      );
      const inGroups = (continentalDrawState.groups || []).some((g) =>
        g.teams.some((t) => t.id === playerClubId)
      );
      if (inQualifiers || inGroups) {
        return {
          isInvolved: true,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50 pixel-bevel-gold',
          statusText: 'YOUR CLUB INVOLVED',
          detailText: `Your club is drawn in this continental tournament.`,
        };
      }
      return {
        isInvolved: false,
        badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
        statusText: 'WORLD CLUB DRAW',
        detailText: `Your club is not participating this season.`,
      };
    } else {
      // International
      const tier = activeCompetition.tier || 'Senior';
      if (tier === 'Senior') {
        const isQualified = isNationQualifiedForTournament(
          playerNationCode,
          activeCompetition.name,
          'Senior'
        );
        if (isQualified) {
          return {
            isInvolved: true,
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 pixel-bevel-emerald',
            statusText: 'YOUR NATION QUALIFIED',
            detailText: `${playerNationCode} is qualified and actively drawn in this tournament.`,
          };
        } else {
          return {
            isInvolved: false,
            badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-600/50',
            statusText: 'NATION NOT QUALIFIED',
            detailText: `${playerNationCode} did not qualify for this cycle. Inspecting global tournament draw.`,
          };
        }
      } else {
        const isQualified = isNationQualifiedForTournament(
          playerNationCode,
          activeCompetition.name,
          tier
        );
        return {
          isInvolved: isQualified,
          badgeColor: isQualified
            ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 pixel-bevel-cyan'
            : 'bg-slate-800 text-slate-400 border-slate-700',
          statusText: isQualified ? 'YOUTH SQUAD INVOLVED' : 'GLOBAL YOUTH DRAW',
          detailText: isQualified
            ? `${playerNationCode} is represented in the youth showcase.`
            : `Neutral youth tournament draw.`,
        };
      }
    }
  }, [activeCompetition, playerNationCode, playerClubId, continentalDrawState]);

  const getFlagUrl = (iso?: string) => {
    if (!iso) return '';
    return `https://flagcdn.com/w80/${iso.toLowerCase()}.png`;
  };

  const handleCycleGroup = (groups: { groupLetter: string }[], direction: 'prev' | 'next') => {
    if (!groups || groups.length === 0) return;
    const letters = groups.map((g) => g.groupLetter);
    if (selectedGroupFilter === 'all') {
      setSelectedGroupFilter(letters[0]);
      return;
    }
    const idx = letters.indexOf(selectedGroupFilter);
    if (direction === 'prev') {
      const nextIdx = idx <= 0 ? letters.length - 1 : idx - 1;
      setSelectedGroupFilter(letters[nextIdx]);
    } else {
      const nextIdx = idx === -1 || idx >= letters.length - 1 ? 0 : idx + 1;
      setSelectedGroupFilter(letters[nextIdx]);
    }
  };

  return (
    <div className="space-y-5 text-left">
      {/* 32-Bit Arcade Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#071126] to-slate-900 border-2 border-amber-500/60 pixel-bevel-gold p-4 sm:p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/60 text-[10px] font-arcade uppercase tracking-wider pixel-bevel-gold">
              WORLD RESULTS → DRAWS
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Season {numericYear}/{numericYear + 1}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-arcade font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400 shrink-0" />
            GLOBAL COMPETITION DRAWS
          </h3>
          <p className="text-xs text-slate-300 font-sans max-w-2xl">
            Official federation ceremonies, groups, and tournament brackets across UEFA, CONMEBOL, and FIFA. Ordinary competition draws are kept here to keep your Career Hub clean.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="px-3 py-2 bg-slate-950/90 border-2 border-slate-700 pixel-corners text-xs font-mono text-slate-300 flex items-center gap-2 pixel-bevel-sunken">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Player Nation: <strong className="text-amber-300 font-arcade uppercase">{playerNationCode}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter & Category Controls Bar */}
      <div className="bg-slate-900/90 border-2 border-slate-700 p-3 pixel-corners pixel-bevel-raised flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300 shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            ALL DRAWS ({COMPETITION_DRAWS_CATALOG.length})
          </button>
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => setActiveCategory('continental')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'continental'
                ? 'bg-sky-500 text-slate-950 font-black pixel-bevel-cyan border border-sky-300 shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            CLUB CONTINENTAL
          </button>
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => setActiveCategory('international')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'international'
                ? 'bg-emerald-500 text-slate-950 font-black pixel-bevel-emerald border border-emerald-300 shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            NATIONAL TEAMS
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search draws..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border-2 border-slate-750 pixel-corners text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono pixel-bevel-sunken"
          />
        </div>
      </div>

      {/* Main Content Layout: Competitions Horizontal/Bento Selector + Selected Draw Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Competition Cards Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
          <div className="text-[11px] font-arcade uppercase text-slate-400 px-1 tracking-wider flex items-center justify-between">
            <span>SELECT TOURNAMENT</span>
            <span className="font-mono text-slate-500">{filteredCompetitions.length} Available</span>
          </div>

          {filteredCompetitions.map((comp) => {
            const isSelected = comp.id === selectedCompId;
            return (
              <button
                key={comp.id}
                type="button"
                data-nav-item
                tabIndex={0}
                onClick={() => {
                  setSelectedCompId(comp.id);
                  setSelectedGroupFilter('all');
                }}
                className={`w-full p-3 pixel-corners text-left transition-all border-2 cursor-pointer group flex flex-col gap-1.5 ${
                  isSelected
                    ? `bg-slate-950 border-amber-500 pixel-bevel-gold shadow-lg`
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700 pixel-bevel-raised'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{comp.icon}</span>
                    <span className={`text-xs font-arcade font-bold uppercase tracking-wider ${
                      isSelected ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                    }`}>
                      {comp.shortName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 pixel-corners bg-slate-950 text-slate-400 border border-slate-800">
                    {comp.federation}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono line-clamp-1">
                  {comp.name}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                  <span>{comp.category === 'continental' ? 'Club Format' : `${comp.tier || 'Senior'} Squad`}</span>
                  <span className={isSelected ? 'text-amber-400 font-arcade font-bold' : 'text-slate-500 font-arcade'}>
                    {isSelected ? 'ACTIVE VIEW ▶' : 'INSPECT'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: 32-Bit Draw Inspector & Groups Display (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/95 border-2 border-slate-700 pixel-corners p-4 sm:p-5 flex flex-col gap-4 text-white shadow-2xl overflow-hidden pixel-bevel-raised">
          {/* Active Competition Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeCompetition.icon}</span>
                <h4 className="text-base sm:text-lg font-arcade font-black text-amber-300 uppercase tracking-wide">
                  {activeCompetition.name}
                </h4>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {activeCompetition.formatDescription}
              </p>
            </div>

            {/* Squad Status & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-[10px] font-arcade uppercase tracking-wider pixel-corners border ${playerInvolvement.badgeColor}`}>
                {playerInvolvement.statusText}
              </span>

              {/* Ceremonial Replay / Live Ball Draw */}
              {activeCompetition.category === 'international' && nationalDrawState && (
                <button
                  type="button"
                  data-nav-item
                  tabIndex={0}
                  onClick={() => setActiveNationalDraw(nationalDrawState)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 pixel-corners pixel-bevel-gold font-arcade text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>WATCH DRAW CEREMONY</span>
                </button>
              )}

              {activeCompetition.category === 'continental' && continentalDrawState && (
                <button
                  type="button"
                  data-nav-item
                  tabIndex={0}
                  onClick={() => setActiveContinentalDraw(continentalDrawState)}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 border-2 border-sky-200 pixel-corners pixel-bevel-cyan font-arcade text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>VIEW FULL DRAW CEREMONY</span>
                </button>
              )}
            </div>
          </div>

          {/* Player Squad Context Message */}
          <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners p-3 text-xs flex items-center justify-between gap-3 pixel-bevel-sunken">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono">{playerInvolvement.detailText}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              Authoritative Draw Data
            </span>
          </div>

          {/* GROUPS / BRACKETS VIEW */}
          {activeCompetition.category === 'international' && nationalDrawState && (
            <div className="space-y-4">
              {nationalDrawState.isLeagueFormat ? (
                /* CONMEBOL Eliminatorias 10-Nation League Table */
                <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners overflow-hidden shadow-inner pixel-bevel-sunken">
                  <div className="bg-slate-900 px-4 py-2 border-b-2 border-slate-800 flex items-center justify-between text-xs font-arcade uppercase text-amber-300">
                    <span>CONMEBOL 10-NATION ELIMINATORIAS SEEDINGS</span>
                    <span className="text-[10px] text-slate-400 font-mono">18 Matchdays</span>
                  </div>
                  <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto">
                    {(nationalDrawState.groups[0]?.teams || []).map((team, idx) => {
                      const isUserNation = team.code.toUpperCase() === playerNationCode;
                      return (
                        <div
                          key={team.code}
                          className={`px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
                            isUserNation
                              ? 'bg-amber-500/15 border-l-4 border-amber-500 font-bold'
                              : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <img
                              src={getFlagUrl(team.iso)}
                              alt={team.name}
                              className="w-6 h-4 object-cover pixel-corners shadow border border-slate-700"
                            />
                            <span className={isUserNation ? 'text-amber-300 font-arcade uppercase font-bold' : 'text-slate-200'}>
                              {team.name}
                            </span>
                            {isUserNation && (
                              <span className="px-1.5 py-0.5 pixel-corners bg-amber-500 text-slate-950 border border-amber-300 text-[9px] font-arcade font-black uppercase pixel-bevel-gold">
                                YOUR NATION
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                            <span>FIFA #{team.rank}</span>
                            <span className="text-amber-300/90 font-bold">{team.ovr} OVR</span>
                            <span className={`px-2 py-0.5 pixel-corners text-[10px] font-arcade uppercase font-bold ${
                              idx < 6 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : idx === 6 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500'
                            }`}>
                              {idx < 6 ? 'Direct Qual' : idx === 6 ? 'Playoff' : 'Eliminated'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Group Stage Brackets (Groups A-H) */
                <div className="space-y-3">
                  {/* Group Carousel Navigation Bar */}
                  <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 pixel-corners border border-slate-800">
                    <button
                      type="button"
                      data-nav-item
                      tabIndex={0}
                      onClick={() => handleCycleGroup(nationalDrawState.groups, 'prev')}
                      className="px-2.5 py-1.5 min-h-[44px] text-xs font-arcade text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-700 pixel-corners flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Previous Group"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">PREV</span>
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      <button
                        type="button"
                        data-nav-item
                        tabIndex={0}
                        onClick={() => setSelectedGroupFilter('all')}
                        className={`px-3 py-1.5 min-h-[44px] text-xs font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap ${
                          selectedGroupFilter === 'all'
                            ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        ALL
                      </button>
                      {nationalDrawState.groups.map((g) => {
                        const isUserGrp = g.teams.some((t) => t.code.toUpperCase() === playerNationCode);
                        return (
                          <button
                            key={g.groupLetter}
                            type="button"
                            data-nav-item
                            tabIndex={0}
                            onClick={() => setSelectedGroupFilter(g.groupLetter)}
                            className={`px-3 py-1.5 min-h-[44px] text-xs font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                              selectedGroupFilter === g.groupLetter
                                ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300 shadow-md'
                                : isUserGrp
                                ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 pixel-bevel-gold'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            <span>GRP {g.groupLetter}</span>
                            {isUserGrp && <span className="text-[10px]">★</span>}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      data-nav-item
                      tabIndex={0}
                      onClick={() => handleCycleGroup(nationalDrawState.groups, 'next')}
                      className="px-2.5 py-1.5 min-h-[44px] text-xs font-arcade text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-700 pixel-corners flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Next Group"
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Groups Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                    {nationalDrawState.groups
                      .filter((g) => selectedGroupFilter === 'all' || selectedGroupFilter === g.groupLetter)
                      .map((group) => {
                        const containsUser = group.teams.some(
                          (t) => t.code.toUpperCase() === playerNationCode
                        );
                        return (
                          <div
                            key={group.groupLetter}
                            className={`pixel-corners border-2 p-3 flex flex-col gap-2.5 ${
                              containsUser
                                ? 'bg-slate-950 border-amber-500 pixel-bevel-gold shadow-md'
                                : 'bg-slate-950/90 border-slate-800 pixel-bevel-sunken'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="font-arcade text-xs font-bold text-amber-300 uppercase">
                                {group.groupName}
                              </span>
                              {containsUser && (
                                <span className="px-1.5 py-0.5 pixel-corners bg-amber-500 text-slate-950 border border-amber-300 text-[9px] font-arcade font-black uppercase pixel-bevel-gold">
                                  YOUR GROUP
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {group.teams.map((team, idx) => {
                                const isUserTeam = team.code.toUpperCase() === playerNationCode;
                                return (
                                  <div
                                    key={team.code}
                                    className={`px-2.5 py-1.5 pixel-corners flex items-center justify-between text-xs ${
                                      isUserTeam
                                        ? 'bg-amber-500/20 font-bold border border-amber-500/50 text-amber-200'
                                        : 'bg-slate-900/60 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-[10px] text-slate-500">
                                        P{team.pot || idx + 1}
                                      </span>
                                      <img
                                        src={getFlagUrl(team.iso)}
                                        alt={team.name}
                                        className="w-5 h-3.5 object-cover pixel-corners border border-slate-700 shrink-0"
                                      />
                                      <span className="truncate font-mono">{team.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 shrink-0">
                                      <span>#{team.rank}</span>
                                      <span className="text-amber-400/90 font-bold">{team.ovr}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTINENTAL DRAW VIEW */}
          {activeCompetition.category === 'continental' && continentalDrawState && (
            <div className="space-y-4">
              {continentalDrawState.isLeaguePhaseFormat ? (
                /* 36-Team Swiss League Phase */
                <div className="space-y-3">
                  <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners p-3 flex flex-wrap items-center justify-between gap-3 text-xs pixel-bevel-sunken">
                    <div>
                      <span className="font-arcade text-amber-300 uppercase text-xs font-bold">
                        36-TEAM SINGLE SWISS LEAGUE DRAW
                      </span>
                      <p className="text-slate-400 text-[11px] font-mono">
                        Each club plays 8 distinct rivals across 4 seeding pots (4 Home, 4 Away matches).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-500/40 text-[10px] font-mono pixel-corners">
                        {(continentalDrawState.qualifiers || []).length} Qualified Clubs
                      </span>
                    </div>
                  </div>

                  {/* Seeded Pots Showcase (Pots 1-4) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {[1, 2, 3, 4].map((potNum) => {
                      const potClubs = (continentalDrawState.qualifiers || []).filter(
                        (q) => q.seedingPot === potNum
                      );
                      return (
                        <div
                          key={potNum}
                          className="bg-slate-950/90 border-2 border-slate-800 pixel-corners p-3 flex flex-col gap-2 pixel-bevel-sunken"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-arcade text-xs text-sky-400 font-bold uppercase">
                              POT {potNum}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {potClubs.length} Teams
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {potClubs.slice(0, 9).map((club) => {
                              const isPlayerClub = club.teamId === playerClubId;
                              return (
                                <div
                                  key={club.teamId}
                                  className={`px-2 py-1 pixel-corners text-xs flex items-center justify-between ${
                                    isPlayerClub
                                      ? 'bg-amber-500/20 font-bold border border-amber-500/60 text-amber-200'
                                      : 'bg-slate-900/60 text-slate-300'
                                  }`}
                                >
                                  <span className="truncate font-mono">{club.teamName}</span>
                                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                                    {club.teamOvr}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Group Stage Continental (Libertadores / Sudamericana - 8 Groups of 4) */
                <div className="space-y-3">
                  {/* Continental Group Carousel Navigation Bar */}
                  <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 pixel-corners border border-slate-800">
                    <button
                      type="button"
                      data-nav-item
                      tabIndex={0}
                      onClick={() => handleCycleGroup(continentalDrawState.groups || [], 'prev')}
                      className="px-2.5 py-1.5 min-h-[44px] text-xs font-arcade text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-700 pixel-corners flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Previous Group"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">PREV</span>
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      <button
                        type="button"
                        data-nav-item
                        tabIndex={0}
                        onClick={() => setSelectedGroupFilter('all')}
                        className={`px-3 py-1.5 min-h-[44px] text-xs font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap ${
                          selectedGroupFilter === 'all'
                            ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        ALL
                      </button>
                      {(continentalDrawState.groups || []).map((g) => {
                        const isUserGrp = g.teams.some((t) => t.id === playerClubId);
                        return (
                          <button
                            key={g.groupLetter}
                            type="button"
                            data-nav-item
                            tabIndex={0}
                            onClick={() => setSelectedGroupFilter(g.groupLetter)}
                            className={`px-3 py-1.5 min-h-[44px] text-xs font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                              selectedGroupFilter === g.groupLetter
                                ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300 shadow-md'
                                : isUserGrp
                                ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 pixel-bevel-gold'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            <span>GRP {g.groupLetter}</span>
                            {isUserGrp && <span className="text-[10px]">★</span>}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      data-nav-item
                      tabIndex={0}
                      onClick={() => handleCycleGroup(continentalDrawState.groups || [], 'next')}
                      className="px-2.5 py-1.5 min-h-[44px] text-xs font-arcade text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-700 pixel-corners flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Next Group"
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {(continentalDrawState.groups || [])
                      .filter((g) => selectedGroupFilter === 'all' || selectedGroupFilter === g.groupLetter)
                      .map((group) => {
                        const containsPlayerClub = group.teams.some(
                          (t) => t.id === playerClubId
                        );
                        return (
                          <div
                            key={group.groupLetter}
                            className={`pixel-corners border-2 p-3 flex flex-col gap-2.5 ${
                              containsPlayerClub
                                ? 'bg-slate-950 border-amber-500 pixel-bevel-gold shadow-md'
                                : 'bg-slate-950/90 border-slate-800 pixel-bevel-sunken'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="font-arcade text-xs font-bold text-amber-300 uppercase">
                                GROUP {group.groupLetter}
                              </span>
                              {containsPlayerClub && (
                                <span className="px-1.5 py-0.5 pixel-corners bg-amber-500 text-slate-950 border border-amber-300 text-[9px] font-arcade font-black uppercase pixel-bevel-gold">
                                  YOUR CLUB
                                </span>
                              )}
                            </div>

                        <div className="space-y-1.5">
                          {group.teams.map((team, idx) => {
                            const isUserClub = team.id === playerClubId;
                            return (
                              <div
                                key={team.id}
                                className={`px-2.5 py-1.5 pixel-corners flex items-center justify-between text-xs ${
                                  isUserClub
                                    ? 'bg-amber-500/20 font-bold border border-amber-500/50 text-amber-200'
                                    : 'bg-slate-900/60 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[10px] text-slate-500">
                                    P{team.seedingPot || idx + 1}
                                  </span>
                                  <span className="truncate font-mono">{team.name}</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  {team.ovr} OVR
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL CEREMONIAL REPLAY MODAL OVERLAYS */}
      {activeNationalDraw && (
        <NationalTeamDrawModal
          isOpen={Boolean(activeNationalDraw)}
          drawState={activeNationalDraw}
          onClose={() => setActiveNationalDraw(null)}
          onComplete={() => setActiveNationalDraw(null)}
        />
      )}

      {activeContinentalDraw && (
        <ContinentalDrawModal
          isOpen={Boolean(activeContinentalDraw)}
          tournamentState={activeContinentalDraw}
          playerClubId={playerClubId}
          playerClubName={player?.club}
          onClose={() => setActiveContinentalDraw(null)}
        />
      )}
    </div>
  );
};
