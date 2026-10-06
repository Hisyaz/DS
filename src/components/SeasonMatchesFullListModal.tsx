import React, { useState, useMemo } from 'react';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  X,
  Trophy,
  Filter,
  ArrowUpDown,
  Star,
  Activity,
  Flame,
  Award,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';

interface SeasonMatchesFullListModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: SimulatedMatchResult[];
  seasonYear?: string;
  clubName?: string;
  playerName?: string;
}

export const SeasonMatchesFullListModal: React.FC<SeasonMatchesFullListModalProps> = ({
  isOpen,
  onClose,
  matches = [],
  seasonYear = '2026/27',
  clubName = 'Youth Academy',
  playerName = 'Player',
}) => {
  const { t } = useLanguage();
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'draw' | 'loss'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Calculate Season Totals
  const stats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goals = 0;
    let assists = 0;
    let cleanSheets = 0;
    let mvps = 0;
    let ratedMatches = 0;
    let totalRating = 0;
    let minutesPlayed = 0;

    matches.forEach((m) => {
      const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
      const isDraw = m.homeScore === m.awayScore;
      if (isWin) wins++;
      else if (isDraw) draws++;
      else losses++;

      goals += m.playerGoals || 0;
      assists += m.playerAssists || 0;
      if (m.cleanSheet) cleanSheets++;
      if (m.isMvp) mvps++;
      if (typeof m.playerRating === 'number' && m.playerRating > 0) {
        ratedMatches++;
        totalRating += m.playerRating;
      }
      minutesPlayed += m.minutesPlayed || 0;
    });

    const avgRating = ratedMatches > 0 ? (totalRating / ratedMatches).toFixed(1) : '—';

    return {
      total: matches.length,
      wins,
      draws,
      losses,
      goals,
      assists,
      cleanSheets,
      mvps,
      avgRating,
      minutesPlayed,
    };
  }, [matches]);

  // Filtered & Sorted Matches
  const displayedMatches = useMemo(() => {
    let list = [...matches];

    // Filter by result
    if (resultFilter !== 'all') {
      list = list.filter((m) => {
        const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
        const isDraw = m.homeScore === m.awayScore;
        if (resultFilter === 'win') return isWin;
        if (resultFilter === 'draw') return isDraw;
        if (resultFilter === 'loss') return !isWin && !isDraw;
        return true;
      });
    }

    // Sort order (default: newest first)
    if (sortOrder === 'newest') {
      list.reverse();
    }

    return list;
  }, [matches, resultFilter, sortOrder]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-matches-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-25" />

      <div
        className="bg-slate-950 border-4 border-amber-500 pixel-corners pixel-bevel-gold max-w-4xl w-full max-h-[92vh] shadow-[0_0_50px_rgba(245,158,11,0.35)] relative overflow-hidden flex flex-col my-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro 32-Bit Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b-2 border-amber-500/80 p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-none pixel-corners bg-amber-500 text-slate-950 flex items-center justify-center font-black pixel-bevel-gold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-pixel px-2 py-0.5 bg-amber-950/90 text-amber-300 border border-amber-500/60 pixel-corners">
                  SEASON FIXTURES & RESULTS
                </span>
                <span className="text-[9px] font-pixel text-slate-400">
                  {seasonYear}
                </span>
              </div>
              <h2
                id="season-matches-modal-title"
                className="text-sm sm:text-base font-black font-arcade text-white uppercase tracking-wider truncate pixel-text-shadow"
              >
                {t('CURRENT_SEASON_FIXTURES_TITLE') || 'CURRENT SEASON MATCH FIXTURES & RESULTS'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              haptics.buttonPress();
              onClose();
            }}
            className="w-8 h-8 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-600 hover:border-rose-500 pixel-corners flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 32-Bit Performance Summary Strip */}
        <div className="bg-slate-900/95 border-b border-slate-800 p-3 sm:p-3.5 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center font-arcade">
            {/* 1. Record */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">{t('SEASON_RECORD') || 'RECORD'}</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                <span className="text-emerald-400">{stats.wins}W</span> -{' '}
                <span className="text-amber-400">{stats.draws}D</span> -{' '}
                <span className="text-rose-400">{stats.losses}L</span>
              </span>
            </div>

            {/* 2. Matches Played */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">{t('MATCHES_PLAYED') || 'MATCHES'}</span>
              <span className="text-xs sm:text-sm font-black text-white">{stats.total}</span>
            </div>

            {/* 3. Goals & Assists */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">GOALS / ASSISTS</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">
                ⚽ {stats.goals} <span className="text-slate-500">|</span> 🎯 {stats.assists}
              </span>
            </div>

            {/* 4. Average Rating */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">AVG RATING</span>
              <span className="text-xs sm:text-sm font-black text-yellow-300">
                ⭐ {stats.avgRating}
              </span>
            </div>

            {/* 5. Clean Sheets / MVPs */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">MVPs / SHEETS</span>
              <span className="text-xs sm:text-sm font-black text-sky-300">
                🏆 {stats.mvps} <span className="text-slate-500">|</span> 🧤 {stats.cleanSheets}
              </span>
            </div>

            {/* 6. Minutes Played */}
            <div className="bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
              <span className="text-[9px] text-slate-400 uppercase">MINUTES</span>
              <span className="text-xs sm:text-sm font-black text-slate-200">
                ⏱️ {stats.minutesPlayed}'
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 sm:px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs font-arcade shrink-0">
          {/* Result Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 uppercase hidden sm:inline flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              {t('FILTER') || 'FILTER'}:
            </span>
            {(
              [
                { id: 'all', label: `${t('FILTER_ALL') || 'ALL'} (${matches.length})` },
                { id: 'win', label: `${t('FILTER_WINS') || 'WINS'} (${stats.wins})` },
                { id: 'draw', label: `${t('FILTER_DRAWS') || 'DRAWS'} (${stats.draws})` },
                { id: 'loss', label: `${t('FILTER_LOSSES') || 'LOSSES'} (${stats.losses})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  haptics.buttonPress();
                  setResultFilter(tab.id);
                }}
                className={`px-2.5 py-1 text-[10px] font-pixel uppercase pixel-corners border transition-all cursor-pointer ${
                  resultFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => {
              haptics.buttonPress();
              setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
            }}
            className="px-2.5 py-1 text-[10px] font-pixel uppercase bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 pixel-corners flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-amber-400" />
            <span>
              {sortOrder === 'newest'
                ? t('SORT_NEWEST') || 'NEWEST FIRST'
                : t('SORT_OLDEST') || 'OLDEST FIRST'}
            </span>
          </button>
        </div>

        {/* Scrollable Match List */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto overscroll-contain space-y-2.5 custom-scrollbar relative z-10 bg-slate-950/80">
          {displayedMatches.length > 0 ? (
            displayedMatches.map((m, idx) => {
              const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
              const isDraw = m.homeScore === m.awayScore;
              const opponentName = m.isPlayerHome ? m.awayTeamName : m.homeTeamName;
              const scoreDisplay = `${m.homeScore} - ${m.awayScore}`;
              const resultBadge = isWin
                ? { label: 'WIN', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/80 pixel-bevel-emerald' }
                : isDraw
                ? { label: 'DRAW', bg: 'bg-amber-950 text-amber-300 border-amber-500/80 pixel-bevel-gold' }
                : { label: 'LOSS', bg: 'bg-rose-950 text-rose-300 border-rose-500/80 pixel-bevel-crimson' };

              // Determine chronological fixture index
              const fixtureNumber =
                m.matchIndex !== undefined
                  ? m.matchIndex + 1
                  : sortOrder === 'newest'
                  ? matches.length - idx
                  : idx + 1;

              return (
                <div
                  key={m.matchId || `full-match-${idx}`}
                  className="bg-slate-900/90 border-2 border-slate-800 hover:border-slate-700 pixel-corners pixel-bevel-raised p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  {/* Left: Fixture Number, Date & Venue */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-12 text-center py-1 px-1.5 bg-slate-950 border border-slate-800 pixel-corners">
                      <span className="text-[8px] font-pixel text-slate-400 block uppercase">MD</span>
                      <span className="text-xs font-black font-arcade text-amber-300 block">
                        #{fixtureNumber}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-arcade text-slate-400">
                          {m.calendarDate || `Fixture ${fixtureNumber}`}
                        </span>
                        <span className="text-[9px] font-pixel px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 pixel-corners">
                          {m.isPlayerHome ? `🏠 ${t('VENUE_HOME') || 'HOME'}` : `✈️ ${t('VENUE_AWAY') || 'AWAY'}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-retro">
                        {m.competitionName || 'Domestic Championship'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Teams, Score, Result Badge */}
                  <div className="flex items-center gap-3 flex-1 justify-center sm:justify-start">
                    <div className="text-center sm:text-left space-y-0.5">
                      <p className="text-xs sm:text-sm font-black text-white truncate font-arcade">
                        vs {opponentName || 'Opponent Club'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 pixel-corners border ${resultBadge.bg}`}>
                          {resultBadge.label} {scoreDisplay}
                        </span>
                        <span className="text-[10px] font-arcade text-slate-400">
                          ({m.homeTeamName} vs {m.awayTeamName})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Player Performance Details */}
                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-[10px] font-arcade">
                    {/* Status & Minutes */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {m.playerStatus === 'suspended' || m.isSuspended ? (
                        <span className="font-black text-[9px] px-1.5 py-0.5 pixel-corners bg-rose-950 border border-rose-500/80 text-rose-300">
                          🟥 {m.suspensionReason || t('ROLE_SUSPENDED') || 'SUSPENDED'}
                        </span>
                      ) : m.playerStatus === 'starter' ? (
                        <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-sky-950 border border-sky-500/60 text-sky-300">
                          {t('ROLE_STARTER') || 'STARTER'} • ⏱️ {m.minutesPlayed ?? 90}'
                        </span>
                      ) : m.playerStatus === 'sub_in' ? (
                        <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                          {t('ROLE_SUB_IN') || 'SUB IN'} • ⏱️ {m.minutesPlayed ?? 25}'
                        </span>
                      ) : m.playerStatus === 'sub_out' ? (
                        <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-amber-950 border border-amber-500/60 text-amber-300">
                          {t('ROLE_SUB_OUT') || 'SUB OUT'} • ⏱️ {m.minutesPlayed ?? 60}'
                        </span>
                      ) : (
                        <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-slate-800 border border-slate-600 text-slate-400">
                          {t('ROLE_BENCHED') || 'BENCHED'} • ⏱️ 0'
                        </span>
                      )}

                      {m.playerRating !== undefined && m.playerRating > 0 && !m.isSuspended && (
                        <span className="font-black text-amber-300 flex items-center gap-0.5 bg-amber-950/60 px-1.5 py-0.5 border border-amber-500/40 pixel-corners">
                          ⭐ {m.playerRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Stats: Goals, Assists, Cards, MVP */}
                    {!m.isSuspended && (m.playerGoals > 0 || m.playerAssists > 0 || m.yellowCard || m.redCard || m.isMvp) && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
                        {m.playerGoals > 0 && (
                          <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 border border-emerald-500/40 pixel-corners">
                            ⚽ {m.playerGoals} {m.playerGoals === 1 ? (t('GOAL_SINGULAR') || 'Goal') : (t('GOALS_PLURAL') || 'Goals')}
                          </span>
                        )}
                        {m.playerAssists > 0 && (
                          <span className="font-bold text-sky-400 bg-sky-950/60 px-1 py-0.5 border border-sky-500/40 pixel-corners">
                            🎯 {m.playerAssists} {m.playerAssists === 1 ? (t('ASSIST_SINGULAR') || 'Assist') : (t('ASSISTS_PLURAL') || 'Assists')}
                          </span>
                        )}
                        {m.redCard && (
                          <span className="font-black text-rose-300 bg-rose-950 px-1 py-0.5 border border-rose-500 pixel-corners">
                            🟥 {t('MATCH_RED_CARDS') || 'RED'}
                          </span>
                        )}
                        {m.yellowCard && (
                          <span className="font-black text-yellow-300 bg-amber-950 px-1 py-0.5 border border-yellow-500 pixel-corners">
                            🟨 {t('MATCH_YELLOW_CARDS') || 'YELLOW'}
                          </span>
                        )}
                        {m.isMvp && (
                          <span className="font-black text-amber-300 bg-amber-950/80 px-1 py-0.5 border border-amber-400 pixel-corners">
                            🏆 {t('MATCH_MAN_OF_MATCH') || 'MVP'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-arcade bg-slate-900/40 pixel-corners border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-600 mb-1" />
              <p className="font-bold uppercase tracking-wider text-slate-300">
                {t('NO_MATCHES_SIMULATED_THIS_SEASON') || 'NO MATCHES RECORDED THIS SEASON'}
              </p>
              <p className="text-[10px] font-retro text-slate-400 max-w-sm">
                {t('SIMULATE_MATCHDAY_1_DESC') || 'Simulate Matchday 1 to record match results here.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Close Button */}
        <div className="bg-slate-900 border-t-2 border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[10px] font-retro text-slate-400 hidden sm:inline">
            {matches.length > 0
              ? `${matches.length} fixture(s) completed this season`
              : 'Season schedule ready for kickoff'}
          </span>

          <button
            type="button"
            onClick={() => {
              haptics.buttonPress();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black font-arcade text-xs uppercase tracking-wider pixel-corners border border-slate-600 pixel-bevel-raised transition-all cursor-pointer"
          >
            {t('CLOSE_FIXTURES_LIST') || 'CLOSE FIXTURES LIST'}
          </button>
        </div>
      </div>
    </div>
  );
};
