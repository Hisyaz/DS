import React, { useState } from 'react';
import { PlayerConfig, ManagerState, AccountingState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  getAvailableTryoutLeagues,
  TryoutLeagueOption,
  runLeagueTryoutEvaluation,
  generateCuratedClubOffers,
  AgentSearchDirective,
  UnifiedClubOffer,
} from '../utils/clubOfferSystem';
import {
  Flame,
  Globe,
  Briefcase,
  UserPlus,
  Clock,
  Sparkles,
  Trophy,
  DollarSign,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  X,
  Target,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface FreeAgentHubModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  manager?: ManagerState;
  accounting?: AccountingState;
  currentPeriod?: 'pre_season' | 'mid_season'; // July vs January
  period?: 'pre_season' | 'mid_season';
  onPlayStreets: () => void;
  onRunTryoutSuccess: (offers: UnifiedClubOffer[]) => void;
  onRunTryoutFail: (message: string) => void;
  onGetAgentSuccess: () => void;
  onGetAgentFail: (message: string) => void;
  onAgentFindClubs: (offers: UnifiedClubOffer[]) => void;
  onAdvanceSixMonths?: (reason: string) => void;
  onClose?: () => void;
}

export const FreeAgentHubModal: React.FC<FreeAgentHubModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  currentPeriod: propCurrentPeriod,
  period: altPeriod,
  onPlayStreets,
  onRunTryoutSuccess,
  onRunTryoutFail,
  onGetAgentSuccess,
  onGetAgentFail,
  onAgentFindClubs,
  onAdvanceSixMonths,
  onClose,
}) => {
  const currentPeriod = propCurrentPeriod || altPeriod || 'pre_season';
  const { t } = useLanguage();
  const [showLeaguePicker, setShowLeaguePicker] = useState<boolean>(false);
  const [showDirectivePicker, setShowDirectivePicker] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // 6-Month Advancement Transition State
  const [sixMonthsAnnouncement, setSixMonthsAnnouncement] = useState<{
    activityTitle: string;
    description: string;
    badgeText: string;
    onProceed: () => void;
  } | null>(null);

  const hasAgent = Boolean(manager?.name || (player as any).managerState?.name || (player as any).managerName);
  const availableLeagues = getAvailableTryoutLeagues();

  if (!isOpen) return null;

  // 1. STREETS ACTION
  const handleStreetsClick = () => {
    if (onAdvanceSixMonths) {
      onAdvanceSixMonths('6 Months Street Football & Independent Training');
    }
    setSixMonthsAnnouncement({
      activityTitle: t('Street Football & Concrete Pitches'),
      description: t('You spent 6 grueling months training on urban concrete courts, building stamina, agility, and street technique while maintaining peak physical condition.'),
      badgeText: t('6 Months Training Elapsed'),
      onProceed: () => {
        setSixMonthsAnnouncement(null);
        onPlayStreets();
      },
    });
  };

  // 2. TRYOUT LEAGUE ACTION
  const handleSelectTryoutLeague = (league: TryoutLeagueOption) => {
    setIsEvaluating(true);
    setShowLeaguePicker(false);

    if (onAdvanceSixMonths) {
      onAdvanceSixMonths(`6 Months Free Agency: ${league.leagueName} Tryout Tour`);
    }

    setTimeout(() => {
      setIsEvaluating(false);
      const result = runLeagueTryoutEvaluation(player, league.leagueName, manager);

      setSixMonthsAnnouncement({
        activityTitle: `${league.flagEmoji} ${league.leagueName} ${t('Tryout Assessment')}`,
        description: t('6 months of travel, physical evaluations, and open squad trials across {leagueName} clubs have concluded.', {
          leagueName: league.leagueName,
        }),
        badgeText: t('6 Months Tryout Tour Concluded'),
        onProceed: () => {
          setSixMonthsAnnouncement(null);
          if (result.isSuccess && result.offers.length > 0) {
            onRunTryoutSuccess(result.offers);
          } else {
            onRunTryoutFail(result.message);
          }
        },
      });
    }, 400);
  };

  // 3. AGENT DIRECTIVE ACTION
  const handleSelectAgentDirective = (directive: AgentSearchDirective) => {
    setIsEvaluating(true);
    setShowDirectivePicker(false);

    const directiveNames: Record<string, string> = {
      glory: t('Trophy & Glory Pursuit'),
      potential: t('Player Development & Training'),
      money: t('High Wage & Signing Bonus Market'),
      any: t('Comprehensive Market Search'),
    };

    if (onAdvanceSixMonths) {
      onAdvanceSixMonths(`6 Months Free Agency: Agent Market Scouting (${directiveNames[directive] || directive})`);
    }

    setTimeout(() => {
      setIsEvaluating(false);
      const offers = generateCuratedClubOffers(player, directive, manager, accounting, 5);

      setSixMonthsAnnouncement({
        activityTitle: `💼 ${manager?.name || t('Agent')} — ${directiveNames[directive] || t('Club Search')}`,
        description: t('Over the past 6 months, your representative leveraged market networks and direct club contacts to negotiate official contract proposals matching your directive.'),
        badgeText: t('6 Months Negotiations Completed'),
        onProceed: () => {
          setSixMonthsAnnouncement(null);
          onAgentFindClubs(offers);
        },
      });
    }, 400);
  };

  // 4. FIND AN AGENT ACTION (IF NO AGENT)
  const handleFindAgentClick = () => {
    if (onAdvanceSixMonths) {
      onAdvanceSixMonths('6 Months Scouting Agent Representation');
    }
    setSixMonthsAnnouncement({
      activityTitle: t('Agent Interviews & Representation Scouting'),
      description: t('You spent 6 months meeting licensed football agents, evaluating representation contracts, and examining agency career networks.'),
      badgeText: t('6 Months Representation Search'),
      onProceed: () => {
        setSixMonthsAnnouncement(null);
        onGetAgentSuccess();
      },
    });
  };

  const handleAgentRouteClick = () => {
    if (hasAgent) {
      setShowDirectivePicker(true);
    } else {
      handleFindAgentClick();
    }
  };

  const periodLabel = currentPeriod === 'mid_season' ? t('January • Mid-Season Window') : t('July • Pre-Season Window');

  return (
    <div
      id="free-agent-hub-overlay"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none animate-in fade-in duration-200"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold p-4 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col text-white relative overflow-hidden my-auto font-pixel select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 shrink-0 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider font-arcade">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{periodLabel}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight pixel-text-shadow">
              {t('Free Agent Career Hub')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl font-retro">
              {t('You are currently an unattached Free Agent. Official matches are paused. Choose your 6-month pathway to earn contracts or sharpen skills.')}
            </p>
          </div>
        </div>

        {/* MANDATORY 6-MONTH ADVANCEMENT DISCLAIMER NOTICE */}
        <div className="mt-5 p-4 pixel-corners bg-amber-950/40 border-2 border-amber-400 pixel-bevel-sunken shadow-lg shadow-amber-500/10 flex items-center gap-3.5 text-left relative z-10">
          <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide block font-arcade">
              ⚠️ {t('6 MONTHS WILL PASS AFTER YOU CHOOSE ANY OF THESE OPTIONS.')}
            </span>
            <p className="text-xs text-slate-200 mt-0.5 font-medium font-retro">
              {t('Your career calendar and season schedule will advance by 6 months while you pursue your selected opportunity.')}
            </p>
          </div>
        </div>

        {/* 3 PRIMARY FREE AGENT CHOICES */}
        <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-left relative z-10">
          {/* CHOICE 1: PLAY ON THE STREETS */}
          <div
            id="free-agent-choice-streets"
            onClick={handleStreetsClick}
            className="p-5 pixel-corners border-2 border-orange-500/60 bg-gradient-to-b from-orange-950/40 to-slate-950 pixel-bevel-raised hover:border-orange-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg active:translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 pixel-corners pixel-bevel-raised bg-orange-500/20 border border-orange-400/50 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-orange-400 tracking-wider block font-arcade">
                  {t('Choice 1 • Progress 6 Months')}
                </span>
                <h3 className="text-base font-black text-white mt-0.5 pixel-text-shadow font-arcade">
                  {t('Play on the Streets')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-retro">
                {t('Play underground street games, train on concrete pitches, and draw Street Cards to develop unique perks, physical condition, and discovery chances.')}
              </p>
            </div>

            <div className="pt-3 border-t border-orange-500/30 flex items-center justify-between text-xs font-black text-orange-300 font-arcade">
              <span>{t('DRAW STREET CARDS')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CHOICE 2: DO TRYOUTS AT A LEAGUE YOU CHOOSE */}
          <div
            id="free-agent-choice-tryouts"
            onClick={() => setShowLeaguePicker(true)}
            className="p-5 pixel-corners border-2 border-sky-500/60 bg-gradient-to-b from-sky-950/40 to-slate-950 pixel-bevel-cyan hover:border-sky-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg active:translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 pixel-corners pixel-bevel-raised bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block font-arcade">
                  {t('Choice 2 • Progress 6 Months')}
                </span>
                <h3 className="text-base font-black text-white mt-0.5 pixel-text-shadow font-arcade">
                  {t('League Tryouts')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-retro">
                {t('Travel to a country or league of your choice for open club tryouts. Impress scouts with your OVR and earn immediate professional contract offers.')}
              </p>
            </div>

            <div className="pt-3 border-t border-sky-500/30 flex items-center justify-between text-xs font-black text-sky-300 font-arcade">
              <span>{t('SELECT LEAGUE')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CHOICE 3: AGENT ROUTE (GET AGENT OR ASK AGENT TO FIND CLUBS) */}
          <div
            id="free-agent-choice-agent"
            onClick={handleAgentRouteClick}
            className="p-5 pixel-corners border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-slate-950 pixel-bevel-gold hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg active:translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 pixel-corners pixel-bevel-raised bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                {hasAgent ? <Briefcase className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block font-arcade">
                  {t('Choice 3 • Progress 6 Months')}
                </span>
                <h3 className="text-base font-black text-white mt-0.5 pixel-text-shadow font-arcade">
                  {hasAgent ? t('Ask Agent to Find Club') : t('Find an Agent')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-retro">
                {hasAgent
                  ? t('Direct your agent with specific career priorities (Glory, Develop, Money) to return up to 5 curated contract proposals from top clubs.')
                  : t('Meet licensed football agents across different tiers. Draw candidate agent cards and hire an agent to represent you on the transfer market.')}
              </p>
            </div>

            <div className="pt-3 border-t border-amber-500/30 flex items-center justify-between text-xs font-black text-amber-300 font-arcade">
              <span>{hasAgent ? t('DIRECT AGENT') : t('FIND AN AGENT & DRAW CARDS')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 pixel-corners pixel-bevel-sunken flex items-center justify-between text-xs text-slate-400 relative z-10 font-retro">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {t('Joining a club mid-season (January) unlocks immediate participation in the remaining season fixtures & league standings!')}
            </span>
          </div>
        </div>
      </div>

      {/* 6-MONTH ADVANCEMENT PROMINENT TRANSITION SCREEN */}
      {sixMonthsAnnouncement && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 pixel-corners pixel-bevel-gold p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.3)] text-center space-y-6 relative overflow-hidden font-pixel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 pixel-corners pixel-bevel-raised bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 mx-auto shadow-2xl shadow-amber-500/30 relative z-10 border-2 border-amber-300">
              <Clock className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="inline-block px-3 py-1 pixel-corners bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-wider font-arcade">
                {sixMonthsAnnouncement.badgeText}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pixel-text-shadow">
                {t('6 MONTHS HAVE PASSED')}
              </h2>
              <p className="text-sm font-bold text-amber-300 font-arcade">
                {sixMonthsAnnouncement.activityTitle}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-retro max-w-md mx-auto pt-1">
                {sixMonthsAnnouncement.description}
              </p>
            </div>

            <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2 relative z-10 font-retro">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>{t('Season Calendar & Training Log successfully updated (+6 Months)')}</span>
            </div>

            <button
              type="button"
              onClick={sixMonthsAnnouncement.onProceed}
              className="w-full py-4 px-6 pixel-corners pixel-bevel-gold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 relative z-10 font-arcade"
            >
              <span>{t('Proceed to Results & Proposals')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: TRYOUT LEAGUE SELECTION MODAL */}
      {showLeaguePicker && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowLeaguePicker(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border-2 border-sky-500/70 pixel-corners pixel-bevel-cyan p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] text-left space-y-4 font-pixel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg sm:text-xl font-black text-white pixel-text-shadow font-arcade">
                  {t('Choose Tryout Destination League')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaguePicker(false)}
                className="p-1.5 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer pixel-bevel-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-retro">
              {t('Select which domestic league you want to travel to for professional tryouts. 6 months will pass as you travel and trial with clubs.')}
            </p>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {availableLeagues.map((league) => (
                <div
                  key={league.leagueId}
                  onClick={() => handleSelectTryoutLeague(league)}
                  className="p-3.5 pixel-corners border border-slate-800 bg-slate-950 hover:border-sky-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group pixel-bevel-sunken"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{league.flagEmoji}</span>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2 font-arcade">
                        <span>{league.leagueName}</span>
                        <span className="text-[10px] px-2 py-0.5 pixel-corners bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          {league.countryName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-retro">
                        {league.prestigeLevel} • ~{league.averageStarterOvr} OVR Level • {league.clubCount} Clubs
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 pixel-corners bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase transition-all shadow-md group-hover:scale-105 font-arcade pixel-bevel-raised"
                  >
                    {t('TRY OUT')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AGENT DIRECTIVE PICKER MODAL */}
      {showDirectivePicker && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowDirectivePicker(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/70 pixel-corners pixel-bevel-gold p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] text-left space-y-4 font-pixel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg sm:text-xl font-black text-white pixel-text-shadow font-arcade">
                  {t('Direct Your Agent')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectivePicker(false)}
                className="p-1.5 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer pixel-bevel-raised"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 pixel-corners bg-amber-950/40 border border-amber-500/50 text-xs text-amber-300 flex items-center gap-2 font-retro pixel-bevel-sunken">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{t('6 MONTHS WILL PASS as your agent negotiates with prospective clubs.')}</span>
            </div>

            <p className="text-xs text-slate-300 font-retro">
              {t('Choose what kind of project you want your agent to target. He will curate up to 5 best offers for you.')}
            </p>

            <div className="space-y-3 font-pixel">
              {/* DIRECTIVE 1: I WANT GLORY */}
              <div
                onClick={() => handleSelectAgentDirective('glory')}
                className="p-4 pixel-corners border border-amber-500/40 bg-slate-950 hover:border-amber-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group pixel-bevel-sunken hover:pixel-bevel-raised"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-arcade">{t('I Want Glory')}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-retro">
                      {t('Rank clubs by competitive strength, continental titles, and prestige hierarchy (Real Madrid, Barcelona, Bayern, PSG, Premier League giants).')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* DIRECTIVE 2: I WANT TO DEVELOP */}
              <div
                onClick={() => handleSelectAgentDirective('potential')}
                className="p-4 pixel-corners border border-emerald-500/40 bg-slate-950 hover:border-emerald-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group pixel-bevel-sunken hover:pixel-bevel-raised"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-arcade">{t('I Want to Develop')}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-retro">
                      {t('Rank clubs by Development Tier (5 to 1), development points/year, projected squad role, and tactical compatibility.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* DIRECTIVE 3: I WANT MONEY */}
              <div
                onClick={() => handleSelectAgentDirective('money')}
                className="p-4 pixel-corners border border-yellow-500/40 bg-slate-950 hover:border-yellow-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group pixel-bevel-sunken hover:pixel-bevel-raised"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0 border border-yellow-400/40">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-arcade">{t('I Want Money')}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-retro">
                      {t('Rank clubs by salary package, signing bonus, and overall financial contract value (Saudi Pro League, Premier League).')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-400 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* DIRECTIVE 4: JUST FIND ME A TEAM */}
              <div
                onClick={() => handleSelectAgentDirective('any')}
                className="p-4 pixel-corners border border-slate-700 bg-slate-950 hover:border-slate-500 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group pixel-bevel-sunken hover:pixel-bevel-raised"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-arcade">{t('Just Find Me a Team')}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-retro">
                      {t('A balanced search across all available clubs that genuinely want and need a player at your position.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

