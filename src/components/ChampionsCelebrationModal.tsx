import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { PlayerConfig, TrophyItem } from '../types';
import { ContinentalFinalVenue } from '../types/continentalCompetitions';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Globe,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  CheckCircle2,
  Newspaper,
  UserCheck,
  Zap,
  X,
  Crown,
  Shield,
  Star,
  Activity,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export interface ChampionTitleData {
  titleName: string; // e.g. "Youth League U16", "International Youth Cup", "Premier League", "UEFA Champions League", "FIFA World Cup", "Copa del Rey", "FA Cup"
  trophyType?: 'league' | 'cup' | 'ucl' | 'world_cup' | 'youth' | 'super_cup';
  seasonYear?: string | number;
  clubName?: string;
  isYouth?: boolean;
  legendaryTitle?: string;
  finalVenue?: ContinentalFinalVenue;

  // Combination Special Badges
  isDouble?: boolean; // 2 titles in same season
  isTriple?: boolean; // 3 titles in same season
  isTreble?: boolean; // UCL + League + Cup in same season
  isWorldCup?: boolean; // FIFA World Cup
  isUcl?: boolean; // UEFA Champions League

  // Match or Tournament score
  finalScore?: string; // e.g. "3 - 1" or "18 Matches / 48 Points"
  opponentName?: string;

  // Statistical Breakdown
  goalscorers?: { name: string; goals: number; isPlayer?: boolean }[];
  mvp?: { name: string; club: string; rating?: string | number; isPlayer?: boolean };
  manOfTournament?: { name: string; club: string; isPlayer?: boolean };
  topGoalscorer?: { name: string; club: string; goals: number; isPlayer?: boolean };
  topAssistProvider?: { name: string; club: string; assists: number; isPlayer?: boolean };

  // Dedicated Player Section
  playerPerformance?: {
    name: string;
    position?: string;
    ovr?: number;
    matchesPlayed: number;
    goals: number;
    assists: number;
    avgRating: number | string;
    keyContributionText?: string;
  };

  // Press / News Article
  newsArticle?: {
    headline: string;
    content: string;
  };

  // Social Media Comments
  socialComments?: {
    username: string;
    handle: string;
    avatar: string;
    comment: string;
    likes: string;
    verified?: boolean;
  }[];

  // List of other trophies won this season (used for Double/Triple/Treble display)
  seasonTrophiesList?: string[];
}

interface ChampionsCelebrationModalProps {
  isOpen: boolean;
  data: ChampionTitleData;
  player: PlayerConfig;
  onClose: () => void;
  onClaimTrophy?: (trophy: TrophyItem) => void;
}

export const ChampionsCelebrationModal: React.FC<ChampionsCelebrationModalProps> = ({
  isOpen,
  data,
  player,
  onClose,
  onClaimTrophy,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    // Trigger explosive confetti on open
    const fireConfetti = () => {
      if (shouldDisableParticles()) return;
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.6 },
        };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    };

    fireConfetti();
    const timer = setTimeout(fireConfetti, 400);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const clubName = data.clubName || player.club || (player as any).nationalTeam || 'Kensington United';
  const playerName = player.name || 'Your Player';
  const seasonYear = data.seasonYear || new Date().getFullYear();
  const lowerTitle = (data.titleName || '').toLowerCase();

  // Mode detection
  const isWorldCup = Boolean(
    data.isWorldCup ||
      data.trophyType === 'world_cup' ||
      lowerTitle.includes('world cup') ||
      lowerTitle.includes('mundial')
  );

  const isUcl = Boolean(
    data.isUcl ||
      data.trophyType === 'ucl' ||
      lowerTitle.includes('champions league') ||
      lowerTitle.includes('ucl') ||
      lowerTitle.includes('libertadores')
  );

  const isTreble = Boolean(
    data.isTreble ||
      (data.seasonTrophiesList &&
        data.seasonTrophiesList.length >= 3 &&
        data.seasonTrophiesList.some((tName) => tName.toLowerCase().includes('champions league') || tName.toLowerCase().includes('ucl')))
  );

  const isTriple = Boolean(data.isTriple || (data.seasonTrophiesList && data.seasonTrophiesList.length >= 3));
  const isDouble = Boolean(data.isDouble || (data.seasonTrophiesList && data.seasonTrophiesList.length === 2));
  const isYouth = Boolean(data.isYouth || data.trophyType === 'youth' || lowerTitle.includes('youth') || lowerTitle.includes('u16') || lowerTitle.includes('academy'));

  // Theme styling based on trophy category
  let headerBadgeText = t('CHAMPIONS OF {title}', { title: data.titleName.toUpperCase() });
  let headerThemeBg = 'from-amber-600 via-yellow-500 to-amber-700';
  let badgeBorderColor = 'border-amber-400/80';
  let auraGlow = 'from-amber-500/20 via-yellow-500/10 to-amber-600/20';

  if (isTreble) {
    headerBadgeText = t('👑 THE TREBLE KINGS • HISTORIC TRIPLE CROWN!');
    headerThemeBg = 'from-amber-500 via-purple-600 to-yellow-400';
    badgeBorderColor = 'border-yellow-300 ring-4 ring-yellow-400/30';
    auraGlow = 'from-amber-500/30 via-purple-600/20 to-yellow-500/30';
  } else if (isWorldCup) {
    headerBadgeText = t('🌍 WORLD CHAMPIONS • FIFA WORLD CUP WINNERS!');
    headerThemeBg = 'from-sky-500 via-amber-400 to-blue-600';
    badgeBorderColor = 'border-amber-300 ring-2 ring-sky-400/40';
    auraGlow = 'from-sky-500/20 via-amber-400/20 to-blue-600/20';
  } else if (isUcl) {
    headerBadgeText = t('⭐ CHAMPIONS OF EUROPE • UEFA CHAMPIONS LEAGUE');
    headerThemeBg = 'from-indigo-600 via-blue-500 to-indigo-900';
    badgeBorderColor = 'border-blue-400 ring-2 ring-indigo-400/30';
    auraGlow = 'from-indigo-500/30 via-blue-600/20 to-indigo-950/40';
  } else if (isTriple) {
    headerBadgeText = t('⚡ TRIPLE CHAMPIONS • 3 MAJOR TITLES IN ONE SEASON!');
    headerThemeBg = 'from-rose-600 via-amber-500 to-yellow-500';
    badgeBorderColor = 'border-rose-400';
    auraGlow = 'from-rose-500/20 via-amber-500/20 to-yellow-500/20';
  } else if (isDouble) {
    headerBadgeText = t('✨ DOUBLE CHAMPIONS • DUAL TROPHY DOMINANCE!');
    headerThemeBg = 'from-emerald-600 via-teal-500 to-amber-500';
    badgeBorderColor = 'border-emerald-400';
    auraGlow = 'from-emerald-500/20 via-teal-500/20 to-amber-500/20';
  } else if (isYouth) {
    headerBadgeText = t('🥇 YOUTH ACADEMY CHAMPIONS!');
    headerThemeBg = 'from-blue-600 via-amber-400 to-indigo-600';
    badgeBorderColor = 'border-blue-400';
    auraGlow = 'from-blue-500/20 via-amber-400/20 to-indigo-500/20';
  }

  // Article fallback generator if not provided
  const articleHeadline =
    data.newsArticle?.headline ||
    (isTreble
      ? t('{club} REWRITE HISTORY WITH IMMORTAL TREBLE GLORY!', { club: clubName.toUpperCase() })
      : isWorldCup
      ? t('{club} CROWNED WORLD CHAMPIONS IN UNFORGETTABLE FINAL!', { club: clubName.toUpperCase() })
      : isUcl
      ? t('KINGS OF EUROPE! {club} WIN THE CHAMPIONS LEAGUE!', { club: clubName.toUpperCase() })
      : isTriple
      ? t('TRIPLE CROWN! {club} SWEEP THREE TITLES THIS SEASON!', { club: clubName.toUpperCase() })
      : isDouble
      ? t('DOUBLE CELEBRATION! {club} SECURE DUAL TROPHY SWEEP!', { club: clubName.toUpperCase() })
      : isYouth
      ? t('ACADEMY TRIUMPH! {club} FINISH #1 TO WIN {title}!', { club: clubName.toUpperCase(), title: data.titleName.toUpperCase() })
      : t('CHAMPIONS! {club} LIFT THE {title} TROPHY!', { club: clubName.toUpperCase(), title: data.titleName.toUpperCase() }));

  const articleContent =
    data.newsArticle?.content ||
    (isTreble
      ? t('In an unprecedented campaign that will echo through football history forever, {club} completed the ultimate Treble. Guided by an extraordinary series of performances from {player}, the squad conquered their Domestic League, Domestic Cup, and the UEFA Champions League in a single majestic sweep. Supporters spilled onto the streets in celebration of a feat reserved only for the absolute gods of the sport.', { club: clubName, player: playerName })
      : isWorldCup
      ? t("Before a global audience of billions, {club} reached the absolute pinnacle of international football by lifting the FIFA World Cup. Spearheaded by {player}'s composure and game-changing brilliance under maximum pressure, the team battled through a dramatic tournament run to secure global immortality.", { club: clubName, player: playerName })
      : isUcl
      ? t("Under the iconic European floodlights, {club} put on a masterclass of tactical discipline and lethal attack to lift the UEFA Champions League trophy. {player} proved to be the decisive factor in the knockout stages and grand final, cementing their reputation among Europe's elite.", { club: clubName, player: playerName })
      : isTriple
      ? t('An astounding season has ended in total supremacy for {club}, who successfully claimed three distinct trophies this year. With {player} delivering relentless goal contributions and match-winning displays week after week, the team proved untouchable on all fronts.', { club: clubName, player: playerName })
      : isDouble
      ? t('Sensational scenes erupted at the final whistle as {club} officially wrapped up a brilliant Double trophy haul. Demonstrating deep squad rotation and high tactical consistency, {player} played an indispensable role in securing both major honors.', { club: clubName, player: playerName })
      : isYouth
      ? t("The hard work at the youth academy has paid off in gold! {club} finished at the top of the standings to claim the {title} title. {player}'s leadership, scoring output, and tactical maturity stood out as the defining catalyst behind this championship run.", { club: clubName, title: data.titleName, player: playerName })
      : t('An incredible season came to a triumphant conclusion as {club} officially lifted the {title}. Through tactical grit and magic moments from {player}, the squad overcame every challenge to stand victorious as undisputed champions.', { club: clubName, title: data.titleName, player: playerName }));

  // Default Stats Breakdown
  const playerGoals = data.playerPerformance?.goals ?? 12;
  const playerAssists = data.playerPerformance?.assists ?? 7;
  const playerRating = data.playerPerformance?.avgRating ?? 8.4;
  const playerMatches = data.playerPerformance?.matchesPlayed ?? 18;

  const goalscorersList = data.goalscorers || [
    { name: playerName, goals: Math.max(1, Math.min(3, playerGoals)), isPlayer: true },
    { name: 'Lucas Silva', goals: 1 },
    { name: 'Mateo Rossi', goals: 1 },
  ];

  const mvpInfo = data.mvp || {
    name: playerName,
    club: clubName,
    rating: playerRating,
    isPlayer: true,
  };

  const manOfTournament = data.manOfTournament || {
    name: playerName,
    club: clubName,
    isPlayer: true,
  };

  const topScorer = data.topGoalscorer || {
    name: playerName,
    club: clubName,
    goals: playerGoals,
    isPlayer: true,
  };

  const topAssister = data.topAssistProvider || {
    name: playerName,
    club: clubName,
    assists: playerAssists,
    isPlayer: true,
  };

  // Social Media Comments
  const commentsList = data.socialComments || [
    {
      username: 'FutbolFanatic_99',
      handle: '@futbol_fanatic99',
      avatar: '⚽',
      comment: isTreble
        ? t('TREBLE WINNERS IS CRAZY!! 😭😭🏆🏆🏆 {player} IS LITERALLY THE GOAT OF THIS GENERATION!! BUILD THE STATUE TODAY!!', { player: playerName })
        : isWorldCup
        ? t("WORLD CHAMPIONS!! 🌍🏆 I'm crying real tears, {player} just played the match of his life on the biggest stage imaginable! 🔥", { player: playerName })
        : isUcl
        ? t('CHAMPIONS LEAGUE WINNERS BABY!! ⭐️⭐️ {player} cooked in the final like it was a casual park kickabout! Unbelievable scenes!', { player: playerName })
        : t('NO WAY WE ACTUALLY WON THE {title}!! {player} MVP ALL DAY EVERY DAY 🔥🔥🔥🏆', { title: data.titleName.toUpperCase(), player: playerName }),
      likes: '48.2K',
      verified: true,
    },
    {
      username: 'TacticsInsider',
      handle: '@tactics_daily',
      avatar: '📊',
      comment: t("Absolute masterclass performance from {club}. {player}'s positioning and decision making under press was 10/10. Pure football art.", { club: clubName, player: playerName }),
      likes: '22.5K',
      verified: true,
    },
    {
      username: 'UltraSupporter',
      handle: '@club_ultras',
      avatar: '🔥',
      comment: t('WE ARE THE CHAMPIONS!! Nobody can touch us this season! Unstoppable energy from start to finish! 👑👑'),
      likes: '14.8K',
      verified: false,
    },
  ];

  const handleClaim = () => {
    if (onClaimTrophy) {
      let iconType: TrophyItem['iconType'] = 'league';
      let category: TrophyItem['category'] = 'national';

      if (isWorldCup) {
        iconType = 'world-cup';
        category = 'international';
      } else if (isUcl) {
        iconType = 'champions-league';
        category = 'continental';
      } else if (isYouth) {
        iconType = 'youth-trophy';
        category = 'youth';
      } else if (lowerTitle.includes('cup')) {
        iconType = 'cup';
        category = 'national';
      } else if (lowerTitle.includes('super')) {
        iconType = 'super-cup';
        category = 'national';
      }

      const trophyItem: TrophyItem = {
        id: `trophy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.titleName,
        category,
        year: String(seasonYear),
        count: 1,
        prestige: isTreble ? 100 : isWorldCup ? 100 : isUcl ? 95 : isTriple ? 90 : isDouble ? 85 : 75,
        iconType,
      };

      onClaimTrophy(trophyItem);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background Animated Glows */}
      <div className={`fixed inset-0 bg-gradient-to-b ${auraGlow} pointer-events-none blur-3xl opacity-60`} />

      {/* Main Modal Card */}
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900/90 border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl text-slate-100 ring-1 ring-amber-400/30 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner (Fixed Header) */}
        <div className={`relative bg-gradient-to-r ${headerThemeBg} p-4 sm:p-5 text-center border-b-2 ${badgeBorderColor} shadow-xl overflow-hidden shrink-0`}>
          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950 transition-all cursor-pointer z-20 border border-slate-700/50"
            title={t('Close')}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Watermark Giant Trophy Icon */}
          <Trophy className="absolute right-4 -bottom-6 w-36 h-36 sm:w-48 sm:h-48 text-white/10 pointer-events-none transform rotate-12" />

          {/* Special Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-slate-950/80 border border-amber-300/60 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{headerBadgeText}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>

          {/* BIG CHAMPIONS TITLE */}
          <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-md flex items-center justify-center gap-2 flex-wrap">
            <span>{t('CHAMPIONS OF')}</span>
            <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy decoration-2">
              {data.titleName}
            </span>
          </h1>

          {/* Legendary Final Name Layer Banner */}
          {data.legendaryTitle && (
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 border border-amber-300/80 shadow-lg animate-pulse">
              <Crown className="w-4 h-4 text-amber-200" />
              <span className="text-xs sm:text-sm font-black text-amber-100 uppercase tracking-widest drop-shadow">
                {data.legendaryTitle}
              </span>
              <Crown className="w-4 h-4 text-amber-200" />
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-slate-100 font-bold tracking-wide mt-1.5 opacity-95">
            {clubName} • {t('Season {season}', { season: seasonYear })} {data.finalScore ? `• ${t('Final Score: {score}', { score: data.finalScore })}` : ''}
            {data.finalVenue ? ` • 📍 ${data.finalVenue.stadium} (${data.finalVenue.city}, ${data.finalVenue.country})` : ''}
          </p>

          {/* Multi-Title Extra Badges List */}
          {data.seasonTrophiesList && data.seasonTrophiesList.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/20">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-200">
                {t('Season Trophies ({count}):', { count: data.seasonTrophiesList.length })}
              </span>
              {data.seasonTrophiesList.map((tName, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-slate-950/80 text-amber-300 border border-amber-400/40 text-[9px] sm:text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-sm"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  {tName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Body (Scrollable Body) */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: News Article & Tournament Awards */}
            <div className="lg:col-span-7 space-y-6">
              {/* Short News Article Box */}
              <div className="bg-slate-950/80 border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1.5 tracking-wider">
                    <Newspaper className="w-4 h-4 text-amber-400" />
                    {t('Official Sports Press Release')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{t('Published Live')}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {articleHeadline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {articleContent}
                </p>
              </div>

              {/* Tournament Honors & Breakdown */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  {t('Tournament Honors & Statistical Leaders')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Goalscorers */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      {t('⚽ Match Goalscorers')}
                    </div>
                    <div className="space-y-1 font-bold text-slate-200">
                      {goalscorersList.map((g, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className={g.isPlayer ? 'text-amber-300 font-extrabold' : ''}>
                            {g.name} {g.isPlayer ? t('(YOU)') : ''}
                          </span>
                          <span className="font-mono text-amber-400">
                            {g.goals} {g.goals > 1 ? t('Goals') : t('Goal')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MVP */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      {t('⭐ Man of the Match (MVP)')}
                    </div>
                    <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                      <span>{mvpInfo.name} {mvpInfo.isPlayer ? t('(YOU)') : ''}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                        {t('Rating: {rating}', { rating: mvpInfo.rating || playerRating })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {t('Dominant individual impact in key championship moments.')}
                    </p>
                  </div>

                  {/* Player of Tournament */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      {t('🏆 Player of the Tournament')}
                    </div>
                    <div className="text-xs font-black text-emerald-400">
                      {manOfTournament.name} {manOfTournament.isPlayer ? t('(YOU)') : ''}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {t('Awarded for highest overall match ratings throughout the competition.')}
                    </p>
                  </div>

                  {/* Top Goalscorer & Top Assister */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      {t('👟 Golden Boot & Playmaker')}
                    </div>
                    <div className="text-[11px] font-bold space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-300">{t('Top Scorer:')}</span>
                        <span className="text-amber-300">{topScorer.name} ({topScorer.goals} G)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">{t('Top Assister:')}</span>
                        <span className="text-sky-300">{topAssister.name} ({topAssister.assists} A)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEDICATED SECTION TO OUR PLAYER */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border-2 border-amber-400/50 p-5 rounded-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    {t('Spotlight: Player Spotlight')}
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                    {player.position || 'ST'} • OVR {player.ovr || 70}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Avatar / Number badge */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white/20">
                    {player.shirtNumber || player.number || (player as any).kitNumber || '10'}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <h4 className="text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
                      <span>{playerName}</span>
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </h4>

                    <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Matches')}</div>
                        <div className="font-black text-white">{playerMatches}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Goals')}</div>
                        <div className="font-black text-emerald-400">{playerGoals}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Assists')}</div>
                        <div className="font-black text-sky-400">{playerAssists}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Rating')}</div>
                        <div className="font-black text-amber-300">{playerRating}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic font-medium leading-snug pt-1">
                      "{data.playerPerformance?.keyContributionText ||
                        t('An extraordinary season by {player}. Serving as the main engine of the squad, delivering clutch moments when the pressure was highest to capture the {title}.', { player: playerName, title: data.titleName })}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Social Media Colloquial Reactions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-sky-400" />
                    {t('Social Media Buzz & Fan Reaction')}
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {t('#1 Trending')}
                  </span>
                </div>

                {/* Social Posts List */}
                <div className="space-y-3">
                  {commentsList.map((comment, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
                            {comment.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1">
                              <span>{comment.username}</span>
                              {comment.verified && (
                                <CheckCircle2 className="w-3 h-3 text-sky-400 fill-sky-400/20" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{comment.handle}</div>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono">{t('1m ago')}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-snug font-medium">
                        {comment.comment}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-mono border-t border-slate-800/60">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500/20" /> {comment.likes}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Repeat2 className="w-3 h-3" /> {t('Retweet')}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Share2 className="w-3 h-3" /> {t('Share')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Celebration Note Box */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {t('Career Prestige Unlocked')}
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {t('Winning {title} adds an official trophy to your personal Trophy Cabinet, raises your player Fame, and boosts your market valuation globally!', { title: data.titleName })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Footer Action */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/95 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pb-16 sm:pb-5 relative z-10">
          <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
            {t('Click below to officially claim your trophy and save your glory to your career record.')}
          </div>

          <button
            onClick={handleClaim}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-2xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2.5 uppercase tracking-wider scale-[1.01] hover:scale-[1.03]"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
            <span>{t('CLAIM TROPHY & CELEBRATE 🏆')}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
