import React from 'react';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { Trophy, Clock, Zap, AlertTriangle, ArrowRight, ArrowLeft, Flame, Swords, Globe } from 'lucide-react';
import { getContinentalVisualTheme } from '../utils/continentalVisualThemeSystem';
import { useLanguage } from '../context/LanguageContext';

interface YouthMatchCardProps {
  match: SimulatedMatchResult;
  animateIn?: boolean;
}

export const YouthMatchCard: React.FC<YouthMatchCardProps> = ({ match, animateIn = true }) => {
  const { t } = useLanguage();
  const isPlayed =
    match.playerStatus === 'starter' ||
    match.playerStatus === 'sub_out' ||
    match.playerStatus === 'sub_in' ||
    match.playerStatus === 'sub' ||
    (match.minutesPlayed !== undefined && match.minutesPlayed > 0);

  const isPlayerWon = match.isPlayerHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
  const isDraw = match.homeScore === match.awayScore;
  const isNational = match.competitionType === 'national' || Boolean(match.isNationalTeamMatch);
  const isContinental = match.competitionType === 'continental' || Boolean(match.continentalCompId);
  const contTheme = isContinental ? getContinentalVisualTheme(match.continentalCompId || match.stageName || match.competitionName) : null;

  const getFlagUrl = (iso?: string) => {
    if (!iso) return null;
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  };

  return (
    <div
      className={`bg-slate-900 border-2 pixel-corners select-none font-pixel ${
        isNational
          ? 'border-amber-500/80 bg-slate-900 pixel-bevel-gold shadow-[0_0_18px_rgba(245,158,11,0.22)]'
          : contTheme
          ? `${contTheme.borderColor} ${contTheme.cardBg} ${contTheme.glowEffect}`
          : match.importanceCategory === 'DEFINITIVE'
          ? 'border-rose-500/80 pixel-bevel-raised shadow-[0_0_15px_rgba(244,63,94,0.15)]'
          : isContinental
          ? 'border-indigo-500/80 pixel-bevel-raised shadow-[0_0_15px_rgba(99,102,241,0.15)]'
          : match.importanceCategory === 'IMPORTANT' || match.isDerby
          ? 'border-amber-500/70 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          : isPlayed
          ? isPlayerWon
            ? 'border-emerald-500/60 pixel-bevel-emerald shadow-emerald-950/20'
            : isDraw
            ? 'border-amber-500/50 pixel-bevel-gold'
            : 'border-slate-700 pixel-bevel-sunken'
          : 'border-slate-800 bg-slate-950/70 pixel-bevel-sunken opacity-85'
      } p-3 transition-all duration-300 hover:border-slate-500 ${
        animateIn ? 'animate-in fade-in slide-in-from-bottom-2' : ''
      }`}
    >
      {/* MATCH HEADER & SCORE */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
          {match.stageName && (
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 pixel-corners shrink-0 ${
                isNational
                  ? 'text-amber-200 bg-amber-950 border border-amber-500/60 flex items-center gap-1 shadow-sm'
                  : contTheme
                  ? `${contTheme.badgeBg} ${contTheme.badgeText} border ${contTheme.badgeBorder} flex items-center gap-1`
                  : isContinental
                  ? 'text-indigo-200 bg-indigo-950 border border-indigo-500/40 flex items-center gap-1'
                  : 'text-slate-400 bg-slate-800'
              }`}
            >
              {isNational && <Globe className="w-2.5 h-2.5 text-amber-400" />}
              {isContinental && <Globe className="w-2.5 h-2.5 text-current" />}
              {t(match.stageName) || match.stageName}
            </span>
          )}

          {/* DYNAMIC MATCH IMPORTANCE BADGE */}
          {isNational ? (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 pixel-corners bg-amber-500/25 text-amber-300 border border-amber-400/50 flex items-center gap-1 shrink-0 shadow-sm">
              <Trophy className="w-2.5 h-2.5 text-amber-400" />
              {match.nationalTier ? `${match.nationalTier.toUpperCase()} INT` : (t('NATIONAL') || 'NATIONAL')}
            </span>
          ) : contTheme ? (
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 pixel-corners ${contTheme.pillBg} ${contTheme.pillText} border ${contTheme.pillBorder} flex items-center gap-1 shrink-0`}>
              <Globe className="w-2.5 h-2.5 text-current" />
              {contTheme.shortName}
            </span>
          ) : match.importanceCategory === 'DEFINITIVE' ? (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 pixel-corners bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center gap-1 shrink-0">
              <Trophy className="w-2.5 h-2.5 text-rose-400" />
              {t('DEFINITIVE') || 'DEFINITIVE'}
            </span>
          ) : match.derbyName ? (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 shrink-0">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              {t(match.derbyName) || match.derbyName}
            </span>
          ) : isContinental ? (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 pixel-corners bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1 shrink-0">
              <Globe className="w-2.5 h-2.5 text-blue-400" />
              {t('CONTINENTAL') || 'CONTINENTAL'}
            </span>
          ) : match.importanceCategory === 'IMPORTANT' ? (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 shrink-0">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              {t('IMPORTANT') || 'IMPORTANT'}
            </span>
          ) : null}

          <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
            {getFlagUrl(match.homeNationIso) && (
              <img
                src={getFlagUrl(match.homeNationIso)!}
                alt={match.homeTeamName}
                className="w-4 h-2.5 object-cover pixel-corners shadow border border-slate-700 inline-block"
              />
            )}
            <span className={match.isPlayerHome ? 'font-black text-amber-300' : 'text-slate-300'}>
              {match.homeTeamName}
            </span>
            <span className="text-slate-500 font-normal">{t('VS_SHORT') || 'vs'}</span>
            {getFlagUrl(match.awayNationIso) && (
              <img
                src={getFlagUrl(match.awayNationIso)!}
                alt={match.awayTeamName}
                className="w-4 h-2.5 object-cover pixel-corners shadow border border-slate-700 inline-block"
              />
            )}
            <span className={!match.isPlayerHome ? 'font-black text-amber-300' : 'text-slate-300'}>
              {match.awayTeamName}
            </span>
          </div>
        </div>

        {/* SCORE PILL */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-950 px-2.5 py-1 pixel-corners border border-slate-700 pixel-bevel-sunken font-arcade">
          <span className={`text-xs font-black ${match.homeScore > match.awayScore ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.homeScore}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">:</span>
          <span className={`text-xs font-black ${match.awayScore > match.homeScore ? 'text-emerald-400' : 'text-slate-200'}`}>
            {match.awayScore}
          </span>
        </div>
      </div>

      {/* PLAYER STATS & BADGES ROW */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* PARTICIPATION STATUS */}
          {match.isSuspended || match.playerStatus === 'suspended' ? (
            <span className="px-2 py-0.5 pixel-corners bg-rose-950 border border-rose-500/80 text-rose-300 text-[10px] font-black flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 pixel-corners bg-rose-500 animate-pulse"></span>
              🟥 {t('SUSPENDED') || 'SUSPENDED'} {match.suspensionReason ? `• ${t(match.suspensionReason) || match.suspensionReason}` : ''}
            </span>
          ) : match.isInjured && !isPlayed ? (
            <span className="px-2 py-0.5 pixel-corners bg-rose-950 border border-rose-500/70 text-rose-300 text-[10px] font-black flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 pixel-corners bg-rose-500 animate-pulse"></span>
              🚨 {t('NOT_SELECTED_INJURED') || 'NOT SELECTED / INJURED'}
            </span>
          ) : match.playerStatus === 'starter' ? (
            <span className="px-2 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 pixel-corners bg-emerald-400 animate-pulse"></span>
              {t('STARTER') || 'STARTER'}
            </span>
          ) : match.playerStatus === 'sub_out' ? (
            <span className="px-2 py-0.5 pixel-corners bg-amber-950 border border-amber-500/60 text-amber-300 text-[10px] font-black flex items-center gap-1 shadow-sm">
              <span className="text-amber-400 text-[10px]">↘</span> {t('SUB_OUT') || 'SUB OUT'}
            </span>
          ) : match.playerStatus === 'sub_in' || match.playerStatus === 'sub' ? (
            <span className="px-2 py-0.5 pixel-corners bg-cyan-950 border border-cyan-500/60 text-cyan-300 text-[10px] font-black flex items-center gap-1 shadow-sm">
              <span className="text-cyan-400 text-[10px]">↗</span> {t('SUB_IN') || 'SUB IN'}
            </span>
          ) : match.playerStatus === 'benched' || match.playerStatus === 'bench' ? (
            <span className="px-2 py-0.5 pixel-corners bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">⚪</span> {t('BENCHED') || 'BENCHED'}
            </span>
          ) : (
            <span className="px-2 py-0.5 pixel-corners bg-slate-800/80 border border-slate-700 text-slate-400 text-[10px] font-bold flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">⚪</span> {t('NOT_CALLED') || 'NOT CALLED'}
            </span>
          )}

          {/* MINUTES PLAYED */}
          {match.minutesPlayed !== undefined && (
            <span
              className={`px-2 py-0.5 pixel-corners text-[10px] font-black font-arcade flex items-center gap-1 shadow-sm border ${
                match.minutesPlayed >= 70
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                  : match.minutesPlayed > 0
                  ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              {match.minutesPlayed}&apos;
            </span>
          )}

          {/* GOALS */}
          {match.playerGoals > 0 && (
            <span className="px-2 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-black font-arcade flex items-center gap-1 shadow-sm">
              ⚽ {match.playerGoals}
            </span>
          )}

          {/* ASSISTS */}
          {match.playerAssists > 0 && (
            <span className="px-2 py-0.5 pixel-corners bg-sky-950 border border-sky-500/50 text-sky-300 text-[10px] font-black font-arcade flex items-center gap-1 shadow-sm">
              👢 {match.playerAssists}
            </span>
          )}

          {/* FITNESS AFTER MATCH */}
          {match.playerFitness !== undefined && (
            <span
              className={`px-2 py-0.5 pixel-corners text-[10px] font-black font-arcade flex items-center gap-1 shadow-sm border ${
                match.playerFitness >= 70
                  ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                  : match.playerFitness >= 50
                  ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                  : 'bg-rose-950 border-rose-500/50 text-rose-300'
              }`}
            >
              ⚡ {t('FIT') || 'FIT'} {match.playerFitness}%
            </span>
          )}

          {/* MVP BADGE */}
          {match.isMvp && (
            <span className="px-2 py-0.5 pixel-corners bg-amber-500/30 border border-amber-400/80 text-amber-200 text-[10px] font-black flex items-center gap-1 shadow-md shadow-amber-500/20 animate-pixel-blink">
              <Trophy className="w-3 h-3 text-amber-300 fill-amber-300" />
              MVP
            </span>
          )}

          {/* CARDS / INJURY */}
          {match.yellowCard && (
            <span className="px-1.5 py-0.5 pixel-corners bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-[9px] font-bold">
              🟨
            </span>
          )}
          {match.redCard && (
            <span className="px-1.5 py-0.5 pixel-corners bg-rose-500/20 border border-rose-400 text-rose-300 text-[9px] font-bold">
              🟥
            </span>
          )}
          {match.isInjured && (
            <span className="px-2 py-0.5 pixel-corners bg-rose-950 border border-rose-600 text-rose-300 text-[9px] font-bold flex items-center gap-1">
              🚑 {t('INJ') || 'INJ'}
            </span>
          )}
        </div>

        {/* MATCH RATING - ONLY DISPLAYED IF PLAYER PLAYED */}
        {isPlayed && typeof match.playerRating === 'number' && !isNaN(match.playerRating) && (
          <div className="flex items-center gap-1 px-2 py-0.5 pixel-corners bg-slate-950 border border-slate-700 pixel-bevel-sunken">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('RTG') || 'RTG'}:</span>
            <span
              className={`text-xs font-black font-arcade ${
                match.playerRating >= 8.5
                  ? 'text-amber-300'
                  : match.playerRating >= 7.5
                  ? 'text-emerald-400'
                  : match.playerRating >= 6.5
                  ? 'text-sky-300'
                  : 'text-slate-300'
              }`}
            >
              {match.playerRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
