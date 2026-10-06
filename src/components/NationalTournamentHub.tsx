import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Play,
  Zap,
  FastForward,
  Shield,
  Star,
  Users,
  Award,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Flame,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Dumbbell,
  FileText,
  Home,
  Check,
  Flag,
  Sparkles,
  CreditCard,
  Briefcase,
  Menu,
  Coins,
  Globe2,
  Building2,
  Tv,
  Eye,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { PlayerCardData } from '../types';
import { KeyMatchFinalSummary } from '../types/keyMatch';
import {
  NationalTournamentState,
  TournamentMatchFixture,
  KnockoutBracketMatch,
  simulateNationalTournamentMatchday,
  simulateNationalTournamentKnockoutRound,
  simulateRemainingTournamentMatches,
  calculateTournamentAwards,
  finalizeNationalTournament,
} from '../utils/nationalTournamentManager';
import {
  evaluateTournamentPerformanceGrade,
  DrawStarPerformanceGrade,
  TournamentGradeEvaluation,
} from '../utils/tournamentGradingSystem';
import { KeyMatchModal } from './KeyMatchModal';
import { AgentModal32Bit } from './AgentModal32Bit';

interface NationalTournamentHubProps {
  tournamentState: NationalTournamentState;
  player: PlayerCardData;
  onUpdateState: (newState: NationalTournamentState) => void;
  onUpdatePlayer: (updatedPlayer: PlayerCardData) => void;
  onFinishTournament: (finalPlayer: PlayerCardData) => void;
  onOpenOutsideMenu?: (menu: 'profile' | 'training' | 'store' | 'agent' | 'trophies' | 'dashboard') => void;
}

export const NationalTournamentHub: React.FC<NationalTournamentHubProps> = ({
  tournamentState,
  player,
  onUpdateState,
  onUpdatePlayer,
  onFinishTournament,
  onOpenOutsideMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'matchday' | 'standings' | 'bracket' | 'squad' | 'awards'>('matchday');
  const [knockoutSubSection, setKnockoutSubSection] = useState<'r32' | 'r16' | 'progressive' | 'finals'>('progressive');
  const [showKeyMatch, setShowKeyMatch] = useState<boolean>(false);
  const [quickTrainingDone, setQuickTrainingDone] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTournamentAgentModal, setShowTournamentAgentModal] = useState<boolean>(false);

  // Special Senior World Cup Milestone Flavor Events
  const [activeFlavorEvent, setActiveFlavorEvent] = useState<{
    id: 'arrival' | 'hotel' | 'bonding';
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    moraleBonus: number;
  } | null>(null);
  const [seenFlavorEvents, setSeenFlavorEvents] = useState<string[]>([]);

  // Tournament Tier: Senior ("Pinnacle"), U20 ("Serious"), U17 ("Casually Competitive")
  const tier: 'senior' | 'u20' | 'u17' = useMemo(() => {
    const rawTier = (tournamentState.config.tier || 'Senior').toLowerCase();
    if (rawTier.includes('17')) return 'u17';
    if (rawTier.includes('20')) return 'u20';
    return 'senior';
  }, [tournamentState.config.tier]);

  const theme = tournamentState.config.theme;
  const config = tournamentState.config;
  const callingNation = tournamentState.callingNation;

  // Senior World Cup Trigger Milestone Events
  useEffect(() => {
    if (tier === 'senior' && !tournamentState.isFinished) {
      if (tournamentState.currentPhase === 'group_stage' && tournamentState.currentGroupMatchday === 1 && !seenFlavorEvents.includes('arrival')) {
        setActiveFlavorEvent({
          id: 'arrival',
          title: 'Touchdown in the Host Nation! 🛬',
          subtitle: `FIFA World Cup Delegation Arrival • ${callingNation.name}`,
          description: `Your plane has touched down on host soil! Flashbulbs erupt across the tarmac as international media scrums gather. Head Coach ${tournamentState.playerNation.managerName} hands you your official tournament accreditation pass. The dream is real.`,
          icon: '🌍',
          moraleBonus: 10,
        });
        setSeenFlavorEvents((prev) => [...prev, 'arrival']);
      } else if (tournamentState.currentPhase === 'group_stage' && tournamentState.currentGroupMatchday === 2 && !seenFlavorEvents.includes('hotel')) {
        setActiveFlavorEvent({
          id: 'hotel',
          title: 'Luxury 5-Star Basecamp Check-In 🏨',
          subtitle: 'National Delegation Headquarters',
          description: `The squad has established headquarters at the presidential retreat. The video analysis room is running 24/7, high-tech cryo-chambers line the recovery wing, and your bespoke matchday kit hangs ready.`,
          icon: '🏨',
          moraleBonus: 15,
        });
        setSeenFlavorEvents((prev) => [...prev, 'hotel']);
      } else if (tournamentState.currentPhase === 'knockout' && !seenFlavorEvents.includes('bonding')) {
        setActiveFlavorEvent({
          id: 'bonding',
          title: 'Squad Brotherhood & Tactical Summit ⚔️',
          subtitle: 'Single Elimination Pressure',
          description: `Ahead of the knockout fixture, the captain leads a passionate locker-room pledge. The nation back home has paused all work to watch you fight for the crest. You feel goosebumps across your arms.`,
          icon: '🔥',
          moraleBonus: 20,
        });
        setSeenFlavorEvents((prev) => [...prev, 'bonding']);
      }
    }
  }, [tier, tournamentState.currentPhase, tournamentState.currentGroupMatchday, seenFlavorEvents, callingNation.name, tournamentState.playerNation.managerName, tournamentState.isFinished]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find active player fixture
  let activePlayerFixture: TournamentMatchFixture | undefined;
  let activePlayerKnockout: KnockoutBracketMatch | undefined;

  if (tournamentState.currentPhase === 'group_stage') {
    activePlayerFixture = tournamentState.groupFixtures.find(
      (f) => f.matchday === tournamentState.currentGroupMatchday && f.isPlayerMatch && !f.isPlayed
    );
  } else if (tournamentState.currentPhase === 'knockout') {
    const currentRound = tournamentState.knockoutRounds[tournamentState.currentKnockoutRoundIndex];
    activePlayerKnockout = tournamentState.knockoutMatches.find(
      (m) => m.roundName === currentRound && m.isPlayerMatch && !m.isPlayed
    );
  }

  // Handle simulate active round
  const handleSimulateActiveRound = (keyMatchResult?: {
    playerTeamScore: number;
    opponentTeamScore: number;
    playerGoals: number;
    playerAssists: number;
    playerRating: number;
    isWin: boolean;
  }) => {
    if (tournamentState.currentPhase === 'group_stage') {
      const res = simulateNationalTournamentMatchday(tournamentState, player, keyMatchResult);
      onUpdateState(res.updatedState);
      onUpdatePlayer(res.updatedPlayer);
      showToast(res.summaryLog);
    } else if (tournamentState.currentPhase === 'knockout') {
      const res = simulateNationalTournamentKnockoutRound(tournamentState, player, keyMatchResult);
      onUpdateState(res.updatedState);
      onUpdatePlayer(res.updatedPlayer);
      showToast(res.summaryLog);
    }
  };

  // Fast-forward group stage
  const handleFastForwardGroupStage = () => {
    let currState = { ...tournamentState };
    let currPlayer = { ...player };

    while (currState.currentPhase === 'group_stage') {
      const res = simulateNationalTournamentMatchday(currState, currPlayer);
      currState = res.updatedState;
      currPlayer = res.updatedPlayer;
    }

    onUpdateState(currState);
    onUpdatePlayer(currPlayer);
    showToast('Group Stage completed! Knockout bracket seeded.');
  };

  // Skip Entire Tournament: simulate remaining group matches & knockout rounds directly to summary
  const handleSkipEntireTournament = () => {
    const res = simulateRemainingTournamentMatches(tournamentState, player);
    onUpdateState(res.updatedState);
    onUpdatePlayer(res.updatedPlayer);
    setActiveTab('matchday');
    showToast('⏩ [Skip Tournament] Tournament completed! Full bracket and final summary generated.');
  };

  // Handle Key Match Conclusion
  const handleKeyMatchComplete = (summary: KeyMatchFinalSummary) => {
    setShowKeyMatch(false);
    const isWin = summary.isWinner;

    handleSimulateActiveRound({
      playerTeamScore: summary.playerTeamScore,
      opponentTeamScore: summary.opponentTeamScore,
      playerGoals: summary.playerStats.goals,
      playerAssists: summary.playerStats.assists,
      playerRating: summary.playerStats.rating,
      isWin,
    });
  };

  // Light Tactical Recovery Training
  const handleQuickTraining = () => {
    if (quickTrainingDone) return;
    setQuickTrainingDone(true);
    const updated = {
      ...player,
      fitness: Math.min(100, (player.fitness || 85) + 10),
      currentFitness: Math.min(100, ((player as any).currentFitness || 85) + 10),
      fame: (player.fame || 0) + 10,
    };
    onUpdatePlayer(updated);
    showToast('National tactical session complete! Energy and fitness boosted (+10).');
  };

  // Tournament Conclusion with Draw Star Performance Grade & Champion Coins
  const performanceEvaluation: TournamentGradeEvaluation = useMemo(() => {
    return evaluateTournamentPerformanceGrade(tournamentState, player);
  }, [tournamentState, player]);

  const handleFinishTournament = () => {
    const finalized = finalizeNationalTournament(tournamentState, player);
    // Award Champion Coins from Draw Star Performance Grade!
    const coinsWon = performanceEvaluation.championCoinsAwarded || 1;
    const finalPlayerWithCoins = {
      ...finalized,
      championCoins: (finalized.championCoins || (player as any).championCoins || 10) + coinsWon,
    };
    onUpdatePlayer(finalPlayerWithCoins);
    onFinishTournament(finalPlayerWithCoins);
  };

  // Render Flag Helper
  const renderFlag = (iso: string, name: string, sizeClass = 'w-6 h-4') => {
    const cleanIso = (iso || 'un').toLowerCase().replace('gb-', '');
    return (
      <img
        src={`https://flagcdn.com/w80/${cleanIso}.png`}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizeClass} object-cover rounded shadow border border-slate-700/60 shrink-0`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  };

  // Dynamic Assists & Goalkeepers Leaderboards
  const topAssists = useMemo(() => {
    const pAssists = tournamentState.playerStats.assists || 0;
    const list = [
      { name: player.name, nationCode: callingNation.code, nationName: callingNation.name, iso: callingNation.iso || 'gb-eng', assists: pAssists, isPlayer: true },
      { name: 'K. De Bruyne', nationCode: 'BEL', nationName: 'Belgium', iso: 'be', assists: Math.max(1, pAssists + (pAssists > 3 ? -1 : 1)), isPlayer: false },
      { name: 'L. Messi', nationCode: 'ARG', nationName: 'Argentina', iso: 'ar', assists: Math.max(1, pAssists + (pAssists > 2 ? 0 : 2)), isPlayer: false },
      { name: 'B. Fernandes', nationCode: 'POR', nationName: 'Portugal', iso: 'pt', assists: Math.max(1, pAssists - 1), isPlayer: false },
      { name: 'F. Wirtz', nationCode: 'GER', nationName: 'Germany', iso: 'de', assists: Math.max(0, pAssists - 1), isPlayer: false },
    ];
    return list.sort((a, b) => b.assists - a.assists);
  }, [player.name, callingNation, tournamentState.playerStats.assists]);

  const topGoalkeepers = useMemo(() => {
    return [
      { name: 'E. Martínez', nationCode: 'ARG', nationName: 'Argentina', iso: 'ar', cleanSheets: 4, goalsConceded: 2 },
      { name: 'M. Maignan', nationCode: 'FRA', nationName: 'France', iso: 'fr', cleanSheets: 3, goalsConceded: 3 },
      { name: 'J. Pickford', nationCode: 'ENG', nationName: 'England', iso: 'gb-eng', cleanSheets: 3, goalsConceded: 3 },
      { name: 'U. Simón', nationCode: 'ESP', nationName: 'Spain', iso: 'es', cleanSheets: 3, goalsConceded: 4 },
      { name: 'Alisson', nationCode: 'BRA', nationName: 'Brazil', iso: 'br', cleanSheets: 2, goalsConceded: 4 },
    ].sort((a, b) => b.cleanSheets - a.cleanSheets || a.goalsConceded - b.goalsConceded);
  }, []);

  // Visual Atmosphere Themes for 3 Tiers
  const tierSkinStyles = useMemo(() => {
    if (tier === 'senior') {
      return {
        wrapper: 'border-2 border-amber-400/90 shadow-[0_0_35px_rgba(251,191,36,0.25)] bg-slate-950',
        dockBg: 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-400/80',
        badge: 'bg-amber-400 text-slate-950 font-black',
        accentText: 'text-amber-400',
        goldTrim: 'border-amber-400 shadow-lg shadow-amber-500/20',
        pinnacleTag: '🏆 THE PINNACLE OF GLOBAL FOOTBALL • SENIOR WORLD CUP',
      };
    }
    if (tier === 'u20') {
      return {
        wrapper: 'border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(34,211,238,0.2)] bg-slate-950',
        dockBg: 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-950 border-cyan-400/70',
        badge: 'bg-cyan-400 text-slate-950 font-black',
        accentText: 'text-cyan-300',
        goldTrim: 'border-cyan-400 shadow-lg shadow-cyan-500/20',
        pinnacleTag: '🔭 SERIOUS NEXT-GEN CHAMPIONSHIP • GLOBAL SCOUTING SPOTLIGHT',
      };
    }
    // U17 Casually Competitive
    return {
      wrapper: 'border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.2)] bg-slate-950',
      dockBg: 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-400/70',
      badge: 'bg-emerald-400 text-slate-950 font-black',
      accentText: 'text-emerald-300',
      goldTrim: 'border-emerald-400 shadow-lg shadow-emerald-500/20',
      pinnacleTag: '🌱 CASUALLY COMPETITIVE YOUTH FESTIVAL • DEVELOPMENTAL SHOWCASE',
    };
  }, [tier]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background Flags & Atmosphere Wallpaper */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-90 pointer-events-none`} />

      {tier === 'senior' && (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden flex flex-wrap gap-6 p-4 items-center justify-center">
          {['ar', 'fr', 'gb-eng', 'es', 'br', 'de', 'pt', 'nl', 'it', 'be', 'jp', 'us', 'ma', 'hr', 'uy', 'co'].map((iso) => (
            <img key={iso} src={`https://flagcdn.com/w160/${iso}.png`} alt="" className="w-20 h-12 object-cover blur-[2px] opacity-30" />
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP FLOATING LIVE SCOREBOARD DOCK (HUB TAKEOVER SKIN) */}
      {/* ========================================================================= */}
      <div className={`relative z-20 w-full border-b ${tierSkinStyles.dockBg} px-4 py-2.5 backdrop-blur-md shadow-xl`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${tierSkinStyles.badge}`}>
              {tier === 'senior' ? '★ SENIOR WORLD CUP' : tier === 'u20' ? 'U-20 WORLD CUP' : 'U-17 SHOWCASE'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-200">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="font-semibold text-white">Live Tournament Hub Takeover</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-medium">
                {tournamentState.currentPhase === 'group_stage'
                  ? `Group Matchday ${tournamentState.currentGroupMatchday}/${tournamentState.totalGroupMatchdays}`
                  : tournamentState.knockoutRounds[tournamentState.currentKnockoutRoundIndex] || 'Knockouts'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
              {renderFlag(callingNation.iso || 'gb-eng', callingNation.name, 'w-5 h-3.5')}
              <span className="font-bold text-white">{callingNation.name}</span>
              <span className="text-amber-400 font-bold">OVR {tournamentState.playerNation.ovr}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span>{player.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">{tournamentState.playerStats.goals} Goals</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-400 font-bold">{tournamentState.playerStats.assists} Assists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header / Banner */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-4 pb-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-slate-900 border-2 ${tierSkinStyles.goldTrim} flex items-center justify-center p-2.5 shadow-xl`}>
            <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-900/80 text-amber-300">
                {tierSkinStyles.pinnacleTag}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
              {tournamentState.config.competitionName}
              <span className={`${tierSkinStyles.accentText} text-sm md:text-lg font-bold`}>Live Takeover</span>
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto shadow-lg">
          {[
            { id: 'matchday', label: 'Matchday', icon: Zap },
            { id: 'standings', label: 'Watch Groups', icon: BarChart3 },
            { id: 'bracket', label: 'Watch Knockouts', icon: Trophy },
            { id: 'squad', label: 'Squad & Tactics', icon: Users },
            { id: 'awards', label: 'Stats & Awards', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Senior World Cup Milestone Modal Pop-up */}
      <AnimatePresence>
        {activeFlavorEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-950 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-white space-y-4 relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-400/20">
                {activeFlavorEvent.icon}
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  {activeFlavorEvent.subtitle}
                </span>
                <h3 className="text-xl font-black text-white">{activeFlavorEvent.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                {activeFlavorEvent.description}
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center text-xs text-amber-300 font-bold">
                ⚡ National Squad Morale Boosted (+{activeFlavorEvent.moraleBonus} Spirit)!
              </div>
              <button
                type="button"
                onClick={() => setActiveFlavorEvent(null)}
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-400/30 cursor-pointer"
              >
                Enter Match Preparation ⚽
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Arena */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col gap-5">
        {/* ========================================================================= */}
        {/* TAB 1: MATCHDAY */}
        {/* ========================================================================= */}
        {activeTab === 'matchday' && (
          <div className="space-y-6">
            {tournamentState.isFinished ? (
              <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                {/* DRAW STAR PERFORMANCE GRADING BANNER */}
                <div className="text-center flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-4xl font-black shadow-2xl shadow-amber-500/40 border-4 border-white">
                    {performanceEvaluation.grade}
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                      DRAW STAR TOURNAMENT PERFORMANCE VERDICT
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {performanceEvaluation.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
                      {performanceEvaluation.verdict}
                    </p>
                  </div>
                </div>

                {/* CHAMPION COINS AWARDED CARD */}
                <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border-2 border-amber-400/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">CHAMPION COINS EARNED</h4>
                      <p className="text-xs text-amber-200">
                        Base match participation × Grade modifier ({performanceEvaluation.gradeModifier}x)
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xl flex items-center gap-2 shadow-md">
                    <span>+{performanceEvaluation.championCoinsAwarded} Champion Coins 🪙</span>
                  </div>
                </div>

                {/* PODIUM & MEDALISTS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border-2 border-amber-400 rounded-2xl p-4 text-center flex flex-col items-center gap-2">
                    <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black">
                      🥇 CHAMPION (GOLD)
                    </span>
                    {renderFlag(tournamentState.champion?.iso || 'br', tournamentState.champion?.name || 'Champion', 'w-12 h-8')}
                    <span className="text-base font-black text-white">{tournamentState.champion?.name}</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 text-center flex flex-col items-center gap-2">
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black">
                      🥈 RUNNER-UP (SILVER)
                    </span>
                    {renderFlag(tournamentState.runnerUp?.iso || 'fr', tournamentState.runnerUp?.name || 'Runner-Up', 'w-12 h-8')}
                    <span className="text-base font-black text-white">{tournamentState.runnerUp?.name}</span>
                  </div>

                  <div className="bg-slate-950 border border-amber-800 rounded-2xl p-4 text-center flex flex-col items-center gap-2">
                    <span className="text-[10px] text-amber-600 uppercase tracking-widest font-black">
                      🥉 3RD PLACE (BRONZE)
                    </span>
                    {renderFlag(tournamentState.thirdPlace?.iso || 'es', tournamentState.thirdPlace?.name || '3rd Place', 'w-12 h-8')}
                    <span className="text-base font-black text-white">{tournamentState.thirdPlace?.name || 'Semi-Finalist'}</span>
                  </div>
                </div>

                {/* Procee Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleFinishTournament}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-95 transition cursor-pointer uppercase"
                  >
                    <CheckCircle2 className="w-5 h-5 fill-current" />
                    Claim Rewards & Complete Tournament 🏆
                  </button>
                </div>
              </div>
            ) : activePlayerFixture || activePlayerKnockout ? (
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
                {/* Active Match Banner */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {tournamentState.currentPhase === 'group_stage'
                        ? activePlayerFixture?.stageName
                        : activePlayerKnockout?.roundName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Matchday Selection</span>
                </div>

                {/* Fixture Matchup Card */}
                {(() => {
                  const fixture = activePlayerFixture || activePlayerKnockout!;
                  const home = fixture.homeNation!;
                  const away = fixture.awayNation!;
                  const isPlayerHome = home.code.toUpperCase() === callingNation.code.toUpperCase();

                  return (
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-16 h-11 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                          {renderFlag(home.iso, home.name, 'w-full h-full')}
                        </div>
                        <h3 className="font-black text-base sm:text-lg text-white mt-1">{home.name}</h3>
                        <span className="text-xs text-amber-400 font-bold">OVR {home.ovr}</span>
                        {isPlayerHome && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">YOUR NATION</span>
                        )}
                      </div>

                      {/* VS / Score Indicator */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-500">VS</span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          {tournamentState.config.competitionName}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-16 h-11 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                          {renderFlag(away.iso, away.name, 'w-full h-full')}
                        </div>
                        <h3 className="font-black text-base sm:text-lg text-white mt-1">{away.name}</h3>
                        <span className="text-xs text-amber-400 font-bold">OVR {away.ovr}</span>
                        {!isPlayerHome && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">YOUR NATION</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Match Action Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowKeyMatch(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition cursor-pointer uppercase"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Play Key Match ⚡
                  </button>

                  <button
                    onClick={() => handleSimulateActiveRound()}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer uppercase"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Simulate Matchday
                  </button>

                  {tournamentState.currentPhase === 'group_stage' && (
                    <button
                      onClick={handleFastForwardGroupStage}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer uppercase"
                    >
                      <FastForward className="w-4 h-4" />
                      Simulate Group Stage
                    </button>
                  )}

                  <button
                    onClick={handleSkipEntireTournament}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/50 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer uppercase shadow-lg shadow-purple-950/40"
                    title="Simulate all remaining matches and jump directly to tournament summary"
                  >
                    <FastForward className="w-4 h-4 text-purple-300" />
                    <span>Skip Tournament ⏩</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-bold text-base sm:text-lg text-white">Other Matches In Progress</h3>
                <p className="text-xs text-slate-400">Advance the tournament simulation to progress the bracket.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleSimulateActiveRound()}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer uppercase"
                  >
                    Advance Tournament Round →
                  </button>
                  <button
                    onClick={handleSkipEntireTournament}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/50 text-xs font-bold transition cursor-pointer uppercase flex items-center justify-center gap-1.5"
                  >
                    <FastForward className="w-4 h-4 text-purple-300" />
                    Skip Tournament ⏩
                  </button>
                </div>
              </div>
            )}

            {/* Recent Matchday Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Live Tournament Feed & Logs
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {tournamentState.tournamentLogs.map((log, idx) => (
                  <div key={idx} className="bg-slate-950 px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WATCH GROUPS (REAL-TIME UPDATES) */}
        {/* ========================================================================= */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  Watch All Tournament Groups
                </h2>
                <p className="text-xs text-slate-500">Live standings recalculate in real-time as matches are played.</p>
              </div>
              <span className="text-xs text-emerald-400 font-bold">Top 2 Qualify Directly</span>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {tournamentState.groups.map((group) => (
                <div key={group.letter} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 text-xs font-black flex items-center justify-center">
                        {group.letter}
                      </span>
                      {group.name}
                    </h3>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-800/60 pb-1">
                        <th className="pb-1">#</th>
                        <th className="pb-1">Team</th>
                        <th className="pb-1 text-center">P</th>
                        <th className="pb-1 text-center">W</th>
                        <th className="pb-1 text-center">GD</th>
                        <th className="pb-1 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {group.standings.map((row, idx) => {
                        const isPlayer = row.nationCode.toUpperCase() === callingNation.code.toUpperCase();
                        const isQualified = idx < config.advanceTopCount;

                        return (
                          <tr
                            key={row.nationCode}
                            className={`transition-colors ${
                              isPlayer ? 'bg-amber-500/15 text-amber-200 font-bold' : 'text-slate-300'
                            }`}
                          >
                            <td className="py-1.5 font-bold">
                              <span
                                className={`inline-block w-4 text-center rounded text-[10px] ${
                                  isQualified ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-1.5 flex items-center gap-1.5">
                              {renderFlag(row.iso, row.nationName)}
                              <span className="truncate max-w-[110px]">{row.nationName}</span>
                            </td>
                            <td className="py-1.5 text-center">{row.played}</td>
                            <td className="py-1.5 text-center">{row.wins}</td>
                            <td className="py-1.5 text-center text-slate-400">
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </td>
                            <td className="py-1.5 text-right font-black text-amber-400">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WATCH KNOCKOUTS (SECTIONS: R32, R16, PROGRESSIVE BRACKET, FINALS) */}
        {/* ========================================================================= */}
        {activeTab === 'bracket' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-slate-400" />
                  Knockout Stage Progression
                </h2>
                <p className="text-xs text-slate-500">Track fixtures round-by-round from Round of 32 to the Grand Final.</p>
              </div>

              {/* Sub-section Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setKnockoutSubSection('r32')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    knockoutSubSection === 'r32' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Round of 32
                </button>
                <button
                  onClick={() => setKnockoutSubSection('r16')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    knockoutSubSection === 'r16' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Round of 16
                </button>
                <button
                  onClick={() => setKnockoutSubSection('progressive')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    knockoutSubSection === 'progressive' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Final Fixtures (QF → Final)
                </button>
                <button
                  onClick={() => setKnockoutSubSection('finals')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    knockoutSubSection === 'finals' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Final & 3rd Place
                </button>
              </div>
            </div>

            {tournamentState.knockoutMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Knockout bracket unlocks upon completion of the Group Stage fixtures.
              </div>
            ) : (
              <div>
                {/* SUB-SECTION 1: ROUND OF 32 */}
                {knockoutSubSection === 'r32' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Round of 32 Fixtures</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {tournamentState.knockoutMatches
                        .filter((m) => m.roundName.toLowerCase().includes('32'))
                        .map((match) => (
                          <div
                            key={match.id}
                            className={`p-3 rounded-2xl border ${
                              match.isPlayerMatch ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  {match.homeNation && renderFlag(match.homeNation.iso, match.homeNation.name)}
                                  <span className={`truncate ${match.winner?.code === match.homeNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                    {match.homeNation?.name || 'TBD'}
                                  </span>
                                </div>
                                <span className="font-bold text-white">{match.isPlayed ? match.homeScore : '-'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  {match.awayNation && renderFlag(match.awayNation.iso, match.awayNation.name)}
                                  <span className={`truncate ${match.winner?.code === match.awayNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                    {match.awayNation?.name || 'TBD'}
                                  </span>
                                </div>
                                <span className="font-bold text-white">{match.isPlayed ? match.awayScore : '-'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 2: ROUND OF 16 */}
                {knockoutSubSection === 'r16' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Round of 16 Fixtures</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {tournamentState.knockoutMatches
                        .filter((m) => m.roundName.toLowerCase().includes('16'))
                        .map((match) => (
                          <div
                            key={match.id}
                            className={`p-3 rounded-2xl border ${
                              match.isPlayerMatch ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  {match.homeNation && renderFlag(match.homeNation.iso, match.homeNation.name)}
                                  <span className={`truncate ${match.winner?.code === match.homeNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                    {match.homeNation?.name || 'TBD'}
                                  </span>
                                </div>
                                <span className="font-bold text-white">{match.isPlayed ? match.homeScore : '-'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate">
                                  {match.awayNation && renderFlag(match.awayNation.iso, match.awayNation.name)}
                                  <span className={`truncate ${match.winner?.code === match.awayNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                    {match.awayNation?.name || 'TBD'}
                                  </span>
                                </div>
                                <span className="font-bold text-white">{match.isPlayed ? match.awayScore : '-'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 3: PROGRESSIVE BRACKET TABLE (QF → SF → FINAL) */}
                {knockoutSubSection === 'progressive' && (
                  <div className="space-y-6">
                    {['Quarter-Finals', 'Semi-Finals', 'Final'].map((roundName) => {
                      const matches = tournamentState.knockoutMatches.filter((m) => m.roundName === roundName);
                      if (matches.length === 0) return null;

                      return (
                        <div key={roundName} className="space-y-2">
                          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">{roundName}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {matches.map((match) => (
                              <div
                                key={match.id}
                                className={`p-3.5 rounded-2xl border ${
                                  match.isPlayerMatch ? 'bg-amber-500/10 border-amber-500/60 shadow-lg' : 'bg-slate-950 border-slate-800'
                                }`}
                              >
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                      {match.homeNation && renderFlag(match.homeNation.iso, match.homeNation.name)}
                                      <span className={`truncate ${match.winner?.code === match.homeNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                        {match.homeNation?.name || 'TBD'}
                                      </span>
                                    </div>
                                    <span className="font-black text-white">{match.isPlayed ? match.homeScore : '-'}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                      {match.awayNation && renderFlag(match.awayNation.iso, match.awayNation.name)}
                                      <span className={`truncate ${match.winner?.code === match.awayNation?.code ? 'font-black text-amber-300' : 'text-slate-300'}`}>
                                        {match.awayNation?.name || 'TBD'}
                                      </span>
                                    </div>
                                    <span className="font-black text-white">{match.isPlayed ? match.awayScore : '-'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUB-SECTION 4: GRAND FINAL & 3RD PLACE SHOWCASE */}
                {knockoutSubSection === 'finals' && (
                  <div className="space-y-6">
                    {/* Grand Final */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                          🏆 THE GRAND FINAL
                        </span>
                        <h3 className="text-xl font-black text-white">{tournamentState.config.competitionName} Final</h3>
                      </div>

                      {(() => {
                        const finalMatch = tournamentState.knockoutMatches.find(
                          (m) => m.roundName === 'Grand Final' || (m.roundName.toLowerCase().includes('final') && !m.roundName.toLowerCase().includes('semi') && !m.roundName.toLowerCase().includes('quarter'))
                        );
                        if (!finalMatch) {
                          return <div className="text-center text-xs text-slate-500 py-6">Finalists will be determined after Semi-Finals.</div>;
                        }

                        return (
                          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                            <div className="text-center">
                              {finalMatch.homeNation && renderFlag(finalMatch.homeNation.iso, finalMatch.homeNation.name, 'w-16 h-11 mx-auto')}
                              <h4 className="font-black text-lg text-white mt-2">{finalMatch.homeNation?.name || 'TBD'}</h4>
                            </div>
                            <div className="text-center">
                              <span className="text-3xl font-black text-white">
                                {finalMatch.isPlayed ? `${finalMatch.homeScore} - ${finalMatch.awayScore}` : 'VS'}
                              </span>
                            </div>
                            <div className="text-center">
                              {finalMatch.awayNation && renderFlag(finalMatch.awayNation.iso, finalMatch.awayNation.name, 'w-16 h-11 mx-auto')}
                              <h4 className="font-black text-lg text-white mt-2">{finalMatch.awayNation?.name || 'TBD'}</h4>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Third Place Match */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        🥉 Third Place Playoff Match
                      </span>
                      {(() => {
                        const thirdMatch = tournamentState.knockoutMatches.find((m) => m.roundName.toLowerCase().includes('third'));
                        if (!thirdMatch) {
                          return <div className="text-xs text-slate-500">Third place contestants to be determined.</div>;
                        }
                        return (
                          <div className="flex items-center justify-between text-xs py-2">
                            <span className="font-bold text-white">{thirdMatch.homeNation?.name || 'TBD'}</span>
                            <span className="font-black text-amber-400">{thirdMatch.isPlayed ? `${thirdMatch.homeScore} - ${thirdMatch.awayScore}` : 'VS'}</span>
                            <span className="font-bold text-white">{thirdMatch.awayNation?.name || 'TBD'}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SQUAD & TACTICS */}
        {/* ========================================================================= */}
        {activeTab === 'squad' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {renderFlag(callingNation.iso || 'gb-eng', callingNation.name)}
                <h2 className="font-bold text-base text-white">{callingNation.name} National Roster</h2>
              </div>
              <span className="text-xs text-amber-400">Head Coach: {tournamentState.playerNation.managerName}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Player Card Highlight */}
              <div className="bg-slate-950 border-2 border-amber-400 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                    10
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                      {player.name}
                      <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">YOU</span>
                    </h4>
                    <span className="text-xs text-amber-300 font-medium">{tournamentState.playerRole} • {player.position || 'ST'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-300">{player.ovr || 75}</span>
                  <div className="text-[10px] text-slate-400">{tournamentState.playerStats.goals}G {tournamentState.playerStats.assists}A</div>
                </div>
              </div>

              {/* Teammates */}
              {[
                { no: 1, name: 'Starting Goalkeeper', pos: 'GK', ovr: tournamentState.playerNation.ovr },
                { no: 4, name: 'Central Defender', pos: 'CB', ovr: tournamentState.playerNation.ovr - 1 },
                { no: 3, name: 'Wingback Leader', pos: 'LB', ovr: tournamentState.playerNation.ovr - 2 },
                { no: 8, name: 'Playmaker General', pos: 'CM', ovr: tournamentState.playerNation.ovr },
                { no: 7, name: 'Electric Winger', pos: 'RW', ovr: tournamentState.playerNation.ovr - 1 },
              ].map((t) => (
                <div key={t.no} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                      {t.no}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">{t.name}</h4>
                      <span className="text-[11px] text-slate-400">{t.pos}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{t.ovr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STATS, HONOURS & REAL-TIME TOP SCORERS / ASSISTS / GOALKEEPERS */}
        {/* ========================================================================= */}
        {activeTab === 'awards' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-6">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-slate-400" />
              Tournament Individual Honors & Real-Time Leaders
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Golden Boot (Top Goalscorers) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h3 className="font-black text-xs text-amber-400 flex items-center gap-1.5 uppercase">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Top Goalscorers
                </h3>
                <div className="space-y-1.5 pt-1">
                  {tournamentState.topScorers.slice(0, 5).map((sc, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        sc.isPlayer ? 'bg-amber-500/20 text-amber-200 font-black' : 'text-slate-300 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 font-bold">{idx + 1}.</span>
                        {renderFlag(sc.iso, sc.nationName)}
                        <span className="truncate">{sc.name}</span>
                      </div>
                      <span className="font-black text-amber-400 shrink-0">{sc.goals} G</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Top Playmakers (Assists) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h3 className="font-black text-xs text-sky-400 flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Top Assists Leaders
                </h3>
                <div className="space-y-1.5 pt-1">
                  {topAssists.slice(0, 5).map((as, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        as.isPlayer ? 'bg-sky-500/20 text-sky-200 font-black' : 'text-slate-300 bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 font-bold">{idx + 1}.</span>
                        {renderFlag(as.iso, as.nationName)}
                        <span className="truncate">{as.name}</span>
                      </div>
                      <span className="font-black text-sky-400 shrink-0">{as.assists} A</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Golden Glove (Goalkeepers with Fewest Conceded) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h3 className="font-black text-xs text-emerald-400 flex items-center gap-1.5 uppercase">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Goalkeepers (Least Conceded)
                </h3>
                <div className="space-y-1.5 pt-1">
                  {topGoalkeepers.slice(0, 5).map((gk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 bg-slate-900/60"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 font-bold">{idx + 1}.</span>
                        {renderFlag(gk.iso, gk.nationName)}
                        <span className="truncate">{gk.name}</span>
                      </div>
                      <span className="font-black text-emerald-400 shrink-0">{gk.cleanSheets} CS ({gk.goalsConceded} GA)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Key Match Interactive Modal */}
      {showKeyMatch && (activePlayerFixture || activePlayerKnockout) && (
        <KeyMatchModal
          isOpen={showKeyMatch}
          player={player}
          playerTeamName={callingNation.name}
          stageTitle={`${tournamentState.config.competitionName} - ${
            tournamentState.currentPhase === 'group_stage'
              ? activePlayerFixture?.stageName || 'Group Stage'
              : activePlayerKnockout?.roundName || 'Knockout Round'
          }`}
          opponentName={
            activePlayerFixture
              ? (activePlayerFixture.homeNation.code.toUpperCase() === callingNation.code.toUpperCase()
                  ? activePlayerFixture.awayNation.name
                  : activePlayerFixture.homeNation.name)
              : (activePlayerKnockout!.homeNation!.code.toUpperCase() === callingNation.code.toUpperCase()
                  ? activePlayerKnockout!.awayNation!.name
                  : activePlayerKnockout!.homeNation!.name)
          }
          opponentOvr={
            activePlayerFixture
              ? (activePlayerFixture.homeNation.code.toUpperCase() === callingNation.code.toUpperCase()
                  ? activePlayerFixture.awayNation.ovr
                  : activePlayerFixture.homeNation.ovr)
              : (activePlayerKnockout!.homeNation!.code.toUpperCase() === callingNation.code.toUpperCase()
                  ? activePlayerKnockout!.awayNation!.ovr
                  : activePlayerKnockout!.homeNation!.ovr)
          }
          playerMatchStatus="starter"
          onMatchComplete={handleKeyMatchComplete}
        />
      )}

      {/* Bottom Persistent Career Menu Navigation Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 border-t border-slate-800">
        <nav aria-label="Tournament Navigation Dock" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => onOpenOutsideMenu && onOpenOutsideMenu('store')}
            className="py-2.5 px-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Store</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenOutsideMenu && onOpenOutsideMenu('profile')}
            className="py-2.5 px-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>Player Card</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTournamentAgentModal(true)}
            className="py-2.5 px-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Agent</span>
          </button>

          <button
            type="button"
            onClick={handleQuickTraining}
            disabled={quickTrainingDone}
            className={`py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
              quickTrainingDone ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed' : 'border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
            }`}
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>{quickTrainingDone ? 'Trained' : 'Recovery'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenOutsideMenu && onOpenOutsideMenu('dashboard')}
            className="py-2.5 px-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <Menu className="w-4 h-4 text-violet-400" />
            <span>Menu</span>
          </button>
        </nav>
      </div>

      {/* Agent Modal */}
      {showTournamentAgentModal && (
        <AgentModal32Bit
          isOpen={showTournamentAgentModal}
          onClose={() => setShowTournamentAgentModal(false)}
          player={player}
          manager={(player as any).manager || (player as any).managerState}
          onSwitchAcademy={() => {
            setShowTournamentAgentModal(false);
            if (onOpenOutsideMenu) onOpenOutsideMenu('dashboard');
          }}
        />
      )}
    </div>
  );
};
