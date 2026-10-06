import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  Star,
  Flame,
  Shield,
  Globe,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { PlayerCardData, PlayerConfig } from '../types';
import {
  WorldAwardsSeasonResults,
  EuropeanGoldenShoeEntry,
  WorldXICandidate,
} from '../types/individualAwards';
import { NationalTournamentState } from '../utils/nationalTournamentManager';
import { BackgroundTournamentResult, getScheduledInternationalCompetition } from '../utils/nationalCallUpEngine';
import { calculateWorldIndividualAwards } from '../utils/individualAwardsEngine';
import { calculateEuropeanGoldenShoe, getEuropeanGoldenShoeCoefficient } from '../utils/uefaAssociationRankingSystem';
import { getOrInitContinentalStateForSeason } from '../utils/continentalScheduleIntegration';
import { getContinentalTournamentState } from '../utils/continentalTournamentEngine';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';
import { getWorldSimulationState, WorldLeagueStandingRow } from '../utils/worldSimulationEngine';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import { FlagVector } from './FlagVectors';

export interface SeasonSummaryModalProps {
  isOpen: boolean;
  player: PlayerCardData | PlayerConfig;
  seasonYear: string;
  onProceedToPreseason: () => void;
  onClose?: () => void;
  worldAwardsData?: WorldAwardsSeasonResults | null;
  playerStanding?: WorldLeagueStandingRow | null;
  nationalTournamentState?: NationalTournamentState | null;
  latestIntTournamentResult?: BackgroundTournamentResult | null;
  block1Stats?: any;
  block2Stats?: any;
}

type SummarySectionTab = 'summary' | 'league' | 'best_xi' | 'golden_boot' | 'continental';

export const SeasonSummaryModal: React.FC<SeasonSummaryModalProps> = ({
  isOpen,
  player,
  seasonYear,
  onProceedToPreseason,
  onClose,
  worldAwardsData: propWorldAwards,
  playerStanding,
  nationalTournamentState,
  latestIntTournamentResult,
  block1Stats,
  block2Stats,
}) => {
  const [activeTab, setActiveTab] = useState<SummarySectionTab>('summary');

  // Trigger celebratory confetti on screen appearance
  useEffect(() => {
    if (!isOpen || shouldDisableParticles()) return;
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.35 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399', '#ffffff', '#eab308'],
      });
    } catch {
      // Safe fallback
    }
  }, [isOpen]);

  // Combined seasonal stats
  const seasonalStats = useMemo(() => {
    const m = (block1Stats?.matches || 0) + (block2Stats?.matches || 0);
    const g = (block1Stats?.goals || 0) + (block2Stats?.goals || 0);
    const a = (block1Stats?.assists || 0) + (block2Stats?.assists || 0);
    const avg = block1Stats && block2Stats
      ? parseFloat((((block1Stats.avgRating || 7.2) + (block2Stats.avgRating || 7.2)) / 2).toFixed(2))
      : (block1Stats?.avgRating || block2Stats?.avgRating || 7.2);
    const cs = (block1Stats?.cleanSheets || 0) + (block2Stats?.cleanSheets || 0);
    return { matches: m, goals: g, assists: a, avgRating: avg, cleanSheets: cs };
  }, [block1Stats, block2Stats]);

  // Season Grade Calculation (S / A / B / C)
  const seasonGrade = useMemo(() => {
    let score = 0;
    const g = seasonalStats.goals;
    const a = seasonalStats.assists;
    const rating = seasonalStats.avgRating;

    if (rating >= 8.2) score += 4;
    else if (rating >= 7.8) score += 3;
    else if (rating >= 7.4) score += 2;
    else score += 1;

    if (g + a >= 25) score += 4;
    else if (g + a >= 15) score += 3;
    else if (g + a >= 8) score += 2;
    else score += 1;

    if (playerStanding?.rank === 1) score += 3;
    else if (playerStanding?.rank && playerStanding.rank <= 4) score += 2;

    if (score >= 9) {
      return {
        grade: 'S',
        label: 'LEGENDARY MASTERPIECE',
        sublabel: 'Ballon d\'Or Caliber Season',
        color: 'text-amber-300 border-amber-400 bg-amber-500/20 shadow-amber-500/20',
      };
    }
    if (score >= 7) {
      return {
        grade: 'A',
        label: 'OUTSTANDING CAMPAIGN',
        sublabel: 'Elite Continental Standard',
        color: 'text-emerald-300 border-emerald-400 bg-emerald-500/20 shadow-emerald-500/20',
      };
    }
    if (score >= 4) {
      return {
        grade: 'B',
        label: 'SOLID STARTER',
        sublabel: 'Reliable First-Team Contributor',
        color: 'text-sky-300 border-sky-400 bg-sky-500/20 shadow-sky-500/20',
      };
    }
    return {
      grade: 'C',
      label: 'DEVELOPMENT PHASE',
      sublabel: 'Form & Adaptability Focus',
      color: 'text-slate-300 border-slate-500 bg-slate-800 shadow-slate-900',
    };
  }, [seasonalStats, playerStanding]);

  // Financial Summary Calculation
  const financialSummary = useMemo(() => {
    const weeklyWage = (player as any).weeklyWage || (player as any).wage || 25000;
    const annualWages = weeklyWage * 52;
    const goalBonus = seasonalStats.goals * 5000;
    const leagueBonus = playerStanding?.rank === 1 ? 250000 : playerStanding?.rank && playerStanding.rank <= 4 ? 75000 : 25000;
    const totalBonuses = goalBonus + leagueBonus;
    const netEarnings = annualWages + totalBonuses;
    const totalSavings = (player as any).savings || Math.round(netEarnings * 0.7);

    return {
      weeklyWage,
      annualWages,
      totalBonuses,
      netEarnings,
      totalSavings,
    };
  }, [player, seasonalStats, playerStanding]);

  // Compute or reuse authoritative World Awards
  const awardsData: WorldAwardsSeasonResults = useMemo(() => {
    if (propWorldAwards && propWorldAwards.domesticAwards) {
      return propWorldAwards;
    }
    return calculateWorldIndividualAwards(
      player as PlayerCardData,
      seasonalStats,
      seasonYear,
      false
    );
  }, [propWorldAwards, player, seasonalStats, seasonYear]);

  const domesticAwards = awardsData.domesticAwards;
  const leagueName = domesticAwards?.leagueName || player.league || 'Premier League';
  const numericYear = useMemo(() => {
    const split = seasonYear.split('/');
    return parseInt(split[0]) || 2026;
  }, [seasonYear]);

  // Trophies and Honours won this campaign
  const campaignHonors = useMemo(() => {
    const honors: { id: string; name: string; type: string; icon: string }[] = [];

    if (playerStanding?.rank === 1) {
      honors.push({
        id: 'league_title',
        name: `${leagueName} Champion`,
        type: 'Team Trophy',
        icon: '🏆',
      });
    }

    if (domesticAwards?.topScorerWinner?.isPlayer || domesticAwards?.topScorerWinner?.playerName === player.name) {
      honors.push({
        id: 'golden_boot',
        name: `${leagueName} Golden Boot`,
        type: 'Individual Honor',
        icon: '👟',
      });
    }

    if (domesticAwards?.bestPlayerWinner?.isPlayer || domesticAwards?.bestPlayerWinner?.playerName === player.name) {
      honors.push({
        id: 'player_of_season',
        name: `${leagueName} Player of the Season`,
        type: 'Individual Honor',
        icon: '👑',
      });
    }

    const isUserInBestXI = domesticAwards?.leagueBestXI?.allEleven.some((c) => c.isUserPlayer || c.name === player.name);
    if (isUserInBestXI) {
      honors.push({
        id: 'best_xi',
        name: `${leagueName} Best XI Selection`,
        type: 'Individual Honor',
        icon: '⭐',
      });
    }

    if (honors.length === 0) {
      honors.push({
        id: 'first_team_medal',
        name: `${playerStanding?.rank ? `#${playerStanding.rank} Finish` : 'Season Finisher'}`,
        type: 'Campaign Medal',
        icon: '🎖️',
      });
    }

    return honors;
  }, [playerStanding, domesticAwards, leagueName, player.name]);

  // League Awards List
  const leagueAwardsList = useMemo(() => {
    if (!domesticAwards) return [];
    const topScorer = domesticAwards.topScorerWinner;
    const topAssists = domesticAwards.topAssistsWinner;
    const mvp = domesticAwards.bestPlayerWinner;
    const topGk = domesticAwards.bestGoalkeeperWinner;

    return [
      {
        id: 'top_scorer',
        category: 'GOALSCORING',
        title: domesticAwards.domesticTopScorerTrophyName || `${leagueName} Top Goalscorer`,
        winnerName: topScorer?.playerName || player.name || 'Player',
        winnerClub: topScorer?.clubName || player.club || 'Club',
        statDisplay: `${topScorer?.value ?? seasonalStats.goals} Goals`,
        isUserWinner: Boolean(topScorer?.isPlayer || topScorer?.playerName === player.name),
        icon: <Trophy className="w-5 h-5 text-amber-400" />,
      },
      {
        id: 'top_assists',
        category: 'CREATIVITY',
        title: `${leagueName} Playmaker of the Season`,
        winnerName: topAssists?.playerName || player.name || 'Player',
        winnerClub: topAssists?.clubName || player.club || 'Club',
        statDisplay: `${topAssists?.value ?? seasonalStats.assists} Assists`,
        isUserWinner: Boolean(topAssists?.isPlayer || topAssists?.playerName === player.name),
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
      },
      {
        id: 'mvp',
        category: 'EXCELLENCE',
        title: `${leagueName} Player of the Season`,
        winnerName: mvp?.playerName || player.name || 'Player',
        winnerClub: mvp?.clubName || player.club || 'Club',
        statDisplay: `${(mvp?.value ?? seasonalStats.avgRating).toFixed(2)} Avg Rating`,
        isUserWinner: Boolean(mvp?.isPlayer || mvp?.playerName === player.name),
        icon: <Crown className="w-5 h-5 text-yellow-300" />,
      },
      {
        id: 'best_gk',
        category: 'GOALKEEPING',
        title: `${leagueName} Golden Glove`,
        winnerName: topGk?.playerName || 'Clean Sheet Leader',
        winnerClub: topGk?.clubName || player.club || 'Club',
        statDisplay: `${topGk?.cleanSheets || 16} Clean Sheets`,
        isUserWinner: Boolean(topGk?.isPlayer || topGk?.playerName === player.name),
        icon: <Shield className="w-5 h-5 text-emerald-400" />,
      },
    ];
  }, [domesticAwards, leagueName, player, seasonalStats]);

  // Golden Boot Data
  const goldenBootData = useMemo(() => {
    const db = getCareerLeagueDatabase();
    const worldState = getWorldSimulationState(seasonYear, db, player as any);
    const coeffInfo = getEuropeanGoldenShoeCoefficient(
      (player as any).leagueId || player.league || 'england_d1',
      seasonYear,
      worldState
    );

    if (!coeffInfo.isEligible) {
      return { isEligible: false, top5: [], userEntry: null };
    }

    const list: EuropeanGoldenShoeEntry[] =
      awardsData.europeanGoldenShoe && awardsData.europeanGoldenShoe.length > 0
        ? awardsData.europeanGoldenShoe
        : calculateEuropeanGoldenShoe(seasonYear, db, player as any, seasonalStats.goals);

    const top5 = list.slice(0, 5);
    const userIdx = list.findIndex((e) => e.isUserPlayer || e.id === player.id || e.name === player.name);
    const userEntry = userIdx >= 0 ? { ...list[userIdx], rank: userIdx + 1 } : null;

    return {
      isEligible: true,
      top5,
      userEntry,
    };
  }, [player, seasonYear, awardsData, seasonalStats]);

  const bestXI = domesticAwards?.leagueBestXI;
  const isGk = (player.position || '').toUpperCase().includes('GK');

  if (!isOpen) return null;

  return (
    <div
      id="drawstar-season-summary-screen"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col font-pixel select-none animate-in fade-in"
    >
      {/* 32-Bit Scanline Backdrop */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.7)_0%,rgba(2,6,23,0.98)_100%)] pointer-events-none" />
      <div className="fixed inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* TOP BAR: BACK BUTTON + TITLE + SUB-TABS */}
        {/* ========================================================================= */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-arcade font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span>RETURN</span>
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-arcade text-amber-400 font-bold uppercase bg-amber-950/80 px-2 py-0.5 border border-amber-500/50">
                  OFFICIAL WRAP-UP
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SEASON {seasonYear}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-arcade font-black text-white uppercase tracking-tight mt-0.5">
                {player.name} • {player.club}
              </h1>
            </div>
          </div>

          {/* Drill-down Toggle Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 border border-slate-700 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-arcade font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 WRAP-UP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('league')}
              className={`px-3 py-1.5 rounded-lg text-xs font-arcade font-bold transition-all cursor-pointer ${
                activeTab === 'league'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 HONORS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('best_xi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-arcade font-bold transition-all cursor-pointer ${
                activeTab === 'best_xi'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ BEST XI
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN BODY: CINEMATIC WRAP-UP CARD (HERO PRESENTATION) */}
        {/* ========================================================================= */}
        <main className="my-4 space-y-4 flex-1">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Cinematic Wrap-up Hero Card */}
              <div className="p-4 sm:p-6 bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-800 pb-4">
                  {/* Season Grade Badge */}
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 pixel-corners border-4 flex flex-col items-center justify-center font-arcade font-black text-4xl sm:text-5xl shadow-2xl shrink-0 ${seasonGrade.color}`}
                    >
                      <span>{seasonGrade.grade}</span>
                      <span className="text-[9px] font-retro tracking-widest mt-0.5">GRADE</span>
                    </div>

                    <div>
                      <div className="text-[10px] font-arcade font-bold text-amber-400 uppercase tracking-widest">
                        SEASON PERFORMANCE EVALUATION
                      </div>
                      <h2 className="text-lg sm:text-2xl font-arcade font-black text-white uppercase tracking-tight mt-0.5">
                        {seasonGrade.label}
                      </h2>
                      <p className="text-xs text-slate-300 font-retro mt-0.5">
                        {seasonGrade.sublabel} • Finished in {leagueName}
                      </p>
                    </div>
                  </div>

                  {/* Standing Placement Pip */}
                  {playerStanding && (
                    <div className="bg-slate-950 px-4 py-2 border border-slate-800 pixel-corners text-right shrink-0">
                      <span className="text-[9px] font-arcade uppercase text-slate-400 block">LEAGUE PLACEMENT</span>
                      <span className="text-base sm:text-lg font-arcade font-black text-amber-300">
                        Rank #{playerStanding.rank} ({playerStanding.points} PTS)
                      </span>
                    </div>
                  )}
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners text-left">
                    <span className="text-[9px] font-arcade uppercase text-slate-400 block">MATCHES PLAYED</span>
                    <span className="text-base sm:text-xl font-arcade font-black text-white mt-0.5 block">
                      {seasonalStats.matches}
                    </span>
                    <span className="text-[10px] text-slate-500 font-retro">Full Season Caps</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners text-left">
                    <span className="text-[9px] font-arcade uppercase text-slate-400 block">
                      {isGk ? 'CLEAN SHEETS' : 'GOALS SCORED'}
                    </span>
                    <span className="text-base sm:text-xl font-arcade font-black text-emerald-400 mt-0.5 block">
                      {isGk ? seasonalStats.cleanSheets : seasonalStats.goals}
                    </span>
                    <span className="text-[10px] text-slate-500 font-retro">
                      {isGk ? 'Shutouts Kept' : 'Competitive Goals'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners text-left">
                    <span className="text-[9px] font-arcade uppercase text-slate-400 block">
                      {isGk ? 'SAVES & RATING' : 'ASSISTS PROVIDED'}
                    </span>
                    <span className="text-base sm:text-xl font-arcade font-black text-sky-400 mt-0.5 block">
                      {isGk ? `${seasonalStats.avgRating} ★` : seasonalStats.assists}
                    </span>
                    <span className="text-[10px] text-slate-500 font-retro">
                      {isGk ? 'Shot Stopping Pts' : 'Goal Assists'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners text-left">
                    <span className="text-[9px] font-arcade uppercase text-slate-400 block">AVERAGE RATING</span>
                    <span className="text-base sm:text-xl font-arcade font-black text-amber-300 mt-0.5 block">
                      {seasonalStats.avgRating}
                    </span>
                    <span className="text-[10px] text-slate-500 font-retro">Match Performance</span>
                  </div>
                </div>

                {/* Trophies & Honors Ribbon */}
                <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners my-3 text-left">
                  <span className="text-[10px] font-arcade font-bold text-amber-400 uppercase tracking-wider block mb-2">
                    TROPHIES & HONORS EARNED THIS CAMPAIGN
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {campaignHonors.map((honor) => (
                      <div
                        key={honor.id}
                        className="px-3 py-1.5 bg-slate-900 border border-amber-500/50 pixel-corners flex items-center gap-2 text-xs font-arcade font-bold text-white shadow-sm"
                      >
                        <span className="text-sm">{honor.icon}</span>
                        <span>{honor.name}</span>
                        <span className="text-[9px] text-amber-400 font-normal font-retro">({honor.type})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary Dashboard */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 pixel-corners text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-arcade font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      FINANCIAL SUMMARY & BANKING
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      €{financialSummary.weeklyWage.toLocaleString()} / week
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] font-arcade text-slate-400 block">BASE SALARY EARNED</span>
                      <span className="text-sm font-arcade font-black text-white mt-0.5 block">
                        €{financialSummary.annualWages.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] font-arcade text-slate-400 block">BONUSES & MERITS</span>
                      <span className="text-sm font-arcade font-black text-amber-400 mt-0.5 block">
                        +€{financialSummary.totalBonuses.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] font-arcade text-slate-400 block">TOTAL NET SAVINGS</span>
                      <span className="text-sm font-arcade font-black text-emerald-400 mt-0.5 block">
                        €{financialSummary.totalSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drill-down: League Honors */}
          {activeTab === 'league' && (
            <div className="space-y-3">
              <div className="text-xs font-arcade font-bold text-amber-300 uppercase">
                {leagueName} Individual Honors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leagueAwardsList.map((award) => (
                  <div
                    key={award.id}
                    className={`p-4 pixel-corners border-2 text-left flex items-center justify-between ${
                      award.isUserWinner
                        ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-[9px] font-arcade text-amber-400 uppercase">{award.category}</div>
                      <div className="text-sm font-arcade font-black text-white">{award.title}</div>
                      <div className="text-xs font-retro text-slate-400">
                        Winner: <strong className="text-white">{award.winnerName}</strong> ({award.winnerClub})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-arcade font-black text-emerald-400">{award.statDisplay}</span>
                      {award.isUserWinner && (
                        <span className="text-[9px] font-arcade text-amber-300 block font-bold mt-1">★ YOU</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drill-down: Best XI */}
          {activeTab === 'best_xi' && (
            <div className="space-y-3">
              <div className="text-xs font-arcade font-bold text-amber-300 uppercase flex items-center justify-between">
                <span>{leagueName} Team of the Season</span>
                <span className="text-slate-400 font-mono">Formation {bestXI?.formation || '4-3-3'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(bestXI?.allEleven || []).map((star, idx) => {
                  const isUser = star.isUserPlayer || star.name === player.name;
                  return (
                    <div
                      key={idx}
                      className={`p-3 pixel-corners border text-left flex items-center justify-between ${
                        isUser
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 truncate">
                        <div className="text-xs font-arcade font-bold text-white truncate flex items-center gap-1.5">
                          <span className="text-[9px] px-1 bg-slate-800 text-slate-300 rounded font-mono">
                            {star.subPosition || star.mainPosition}
                          </span>
                          <span>{star.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{star.club}</div>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400">
                        {star.ovr ? `${star.ovr} OVR` : `${star.points?.toFixed(1)} Pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION STRIP: PROCEED TO OFF-SEASON BUTTON */}
        {/* ========================================================================= */}
        <footer className="pt-4 border-t-2 border-slate-800 flex items-center justify-center sm:justify-end">
          <button
            id="btn-season-summary-continue"
            type="button"
            onClick={onProceedToPreseason}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl text-xs sm:text-sm font-arcade font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/25 pixel-bevel-gold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 shrink-0"
          >
            <span>PROCEED TO OFF-SEASON</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </footer>
      </div>
    </div>
  );
};
