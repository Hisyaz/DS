import React, { useState } from 'react';
import { PlayerCardData, AccountingState } from '../types';
import { CareerSeasonRecord } from '../types/careerConclusion';
import { getChronologicalCareerSeasons, formatEuroCurrency } from '../utils/careerConclusionSystem';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Sparkles,
  Shield,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Filter,
  CheckCircle2,
  Medal,
  Flame,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CareerSeasonHistoryViewProps {
  player: PlayerCardData;
  accounting?: AccountingState;
  onBackToDashboard: () => void;
}

export const CareerSeasonHistoryView: React.FC<CareerSeasonHistoryViewProps> = ({
  player,
  accounting,
  onBackToDashboard,
}) => {
  const { t } = useLanguage();
  const [filterMode, setFilterMode] = useState<'all' | 'pro' | 'youth'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedSeasonIndex, setExpandedSeasonIndex] = useState<number | null>(null);

  const rawSeasons: CareerSeasonRecord[] = getChronologicalCareerSeasons(player, accounting);

  // Filter based on stage
  const filteredSeasons = rawSeasons.filter((s) => {
    if (filterMode === 'pro') return !s.isYouth;
    if (filterMode === 'youth') return s.isYouth;
    return true;
  });

  // Sort
  const displaySeasons = [...filteredSeasons].sort((a, b) => {
    return sortOrder === 'desc' ? b.age - a.age : a.age - b.age;
  });

  // Calculate Cumulative Career Totals
  const totalMatches = rawSeasons.reduce((sum, s) => sum + (s.matches || 0), 0);
  const totalGoals = rawSeasons.reduce((sum, s) => sum + (s.goals || 0), 0);
  const totalAssists = rawSeasons.reduce((sum, s) => sum + (s.assists || 0), 0);
  const totalSalaryEarned = rawSeasons.reduce((sum, s) => sum + (s.salaryAnnual || 0), 0);
  const totalSponsorsEarned = rawSeasons.reduce((sum, s) => sum + (s.sponsorsIncome || 0), 0);
  const totalEarnings = totalSalaryEarned + totalSponsorsEarned;

  const allTrophiesList: string[] = [];
  const allAwardsList: string[] = [];
  rawSeasons.forEach((s) => {
    (s.trophiesWon || []).forEach((tItem) => allTrophiesList.push(tItem));
    (s.awardsWon || []).forEach((aItem) => allAwardsList.push(aItem));
  });

  const avgCareerRating = rawSeasons.length > 0
    ? (rawSeasons.reduce((sum, s) => sum + (s.avgRating || 7.0), 0) / rawSeasons.length).toFixed(2)
    : '7.20';

  const initialOvr = rawSeasons.length > 0 ? (rawSeasons[0].ovrStart || 50) : 50;
  const currentOvr = player.ovr || 70;
  const ovrGrowth = currentOvr - initialOvr;

  const isPro = isProfessionalPlayer(player);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-pixel select-none">
      {/* View Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase tracking-wider font-arcade">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{t('CHRONOLOGICAL CAREER PROGRESSION')}</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white mt-1 pixel-text-shadow">
            {t('Career Season History')}
          </h3>
          <p className="text-xs text-slate-400 font-retro">
            {t('Complete historical breakdown of past seasons, competitive stats, achievements, and earnings.')}
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 pixel-corners pixel-bevel-raised text-slate-200 hover:text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 self-start sm:self-auto font-pixel uppercase"
        >
          <span>{t('Return to Dashboard')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* High-Level Career Totals Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <Calendar className="w-3.5 h-3.5 text-amber-400" /> {t('Seasons')}
          </div>
          <div className="text-base font-black text-white font-arcade">
            {rawSeasons.length} <span className="text-xs text-slate-400 font-normal">{t('Played')}</span>
          </div>
          <div className="text-[9px] text-amber-300/90 font-retro">
            {t('Age {start} → Age {current}', { start: `${rawSeasons[0]?.age || 10}`, current: `${player.age}` })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> {t('Matches & Rating')}
          </div>
          <div className="text-base font-black text-sky-300 font-arcade">
            {totalMatches} <span className="text-xs text-slate-400 font-normal">{t('Apps')}</span>
          </div>
          <div className="text-[9px] text-emerald-300 font-bold font-retro">
            ⭐ {avgCareerRating} {t('Avg Rating')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> {t('Goals & Assists')}
          </div>
          <div className="text-base font-black text-rose-300 font-arcade">
            {totalGoals} <span className="text-xs text-slate-400 font-normal">{t('G')}</span> / {totalAssists} <span className="text-xs text-slate-400 font-normal">{t('A')}</span>
          </div>
          <div className="text-[9px] text-slate-400 font-retro">
            {totalMatches > 0 ? ((totalGoals + totalAssists) / totalMatches).toFixed(2) : 0} {t('G+A/Match')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {t('OVR Growth')}
          </div>
          <div className="text-base font-black text-emerald-300 font-arcade">
            {currentOvr} <span className="text-xs text-slate-400 font-normal">{t('OVR')}</span>
          </div>
          <div className="text-[9px] text-emerald-400 font-bold font-retro">
            +{ovrGrowth} {t('from {ovr} OVR', { ovr: `${initialOvr}` })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {t('Career Earnings')}
          </div>
          <div className="text-sm font-black text-emerald-400 font-arcade">
            {formatEuroCurrency(totalEarnings)}
          </div>
          <div className="text-[9px] text-slate-400 font-retro">
            {formatEuroCurrency(totalSalaryEarned)} {t('Club Wages')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 pixel-corners pixel-bevel-sunken space-y-1">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 font-pixel">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> {t('Honours')}
          </div>
          <div className="text-base font-black text-amber-300 font-arcade">
            {allTrophiesList.length} <span className="text-xs text-slate-400 font-normal">{t('Trophies')}</span>
          </div>
          <div className="text-[9px] text-purple-300 font-retro">
            {t('{count} Individual Awards', { count: `${allAwardsList.length}` })}
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 pixel-corners border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase font-pixel">{t('Filter')}:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 pixel-corners text-xs font-black transition-all cursor-pointer font-pixel ${
                filterMode === 'all'
                  ? 'bg-amber-400 text-slate-950 pixel-bevel-gold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t('All ({count})', { count: `${rawSeasons.length}` })}
            </button>
            {isPro && (
              <button
                onClick={() => setFilterMode('pro')}
                className={`px-3 py-1 pixel-corners text-xs font-black transition-all cursor-pointer font-pixel ${
                  filterMode === 'pro'
                    ? 'bg-amber-400 text-slate-950 pixel-bevel-gold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t('Pro Seasons ({count})', { count: `${rawSeasons.filter((s) => !s.isYouth).length}` })}
              </button>
            )}
            <button
              onClick={() => setFilterMode('youth')}
              className={`px-3 py-1 pixel-corners text-xs font-black transition-all cursor-pointer font-pixel ${
                filterMode === 'youth'
                  ? 'bg-amber-400 text-slate-950 pixel-bevel-gold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t('Youth ({count})', { count: `${rawSeasons.filter((s) => s.isYouth).length}` })}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase font-pixel">{t('Order')}:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1 pixel-corners text-xs font-black bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 pixel-bevel-raised flex items-center gap-1 cursor-pointer transition-all font-pixel"
          >
            {sortOrder === 'desc' ? (
              <>
                <ArrowDown className="w-3 h-3 text-amber-400" />
                <span>{t('Newest First')}</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-3 h-3 text-amber-400" />
                <span>{t('Oldest First')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chronological Seasons Timeline List */}
      <div className="space-y-3">
        {displaySeasons.map((season, idx) => {
          const isExpanded = expandedSeasonIndex === idx;
          const ratingNum = season.avgRating || 7.0;
          const ratingColor =
            ratingNum >= 7.8
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30'
              : ratingNum >= 7.2
              ? 'text-amber-300 bg-amber-500/10 border-amber-400/30'
              : 'text-slate-300 bg-slate-800 border-slate-700';

          return (
            <div
              key={`${season.seasonYear}-${season.age}`}
              className="bg-slate-900 border-2 border-slate-800 hover:border-amber-400 pixel-corners pixel-bevel-raised p-3.5 sm:p-4 transition-all shadow-md space-y-3 relative overflow-hidden"
            >
              {/* Season Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 pixel-corners bg-amber-400 text-slate-950 text-xs font-black font-arcade">
                    {season.seasonYear}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold font-arcade">
                    {t('Age {age}', { age: `${season.age}` })}
                  </span>
                  <span
                    className={`px-2 py-0.5 pixel-corners text-xs font-bold border font-arcade ${
                      season.isYouth
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                    }`}
                  >
                    {t(season.squadLevel || (season.isYouth ? 'Youth' : 'First Team'))}
                  </span>

                  {season.standingRank === 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black font-arcade">
                      <Trophy className="w-3 h-3 text-amber-400" /> {t('#1 Champion')}
                    </span>
                  )}
                  {season.promoted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black font-arcade">
                      <ArrowUp className="w-3 h-3 text-emerald-400" /> {t('Promoted')}
                    </span>
                  )}
                  {season.relegated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-black font-arcade">
                      <ArrowDown className="w-3 h-3 text-rose-400" /> {t('Relegated')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-black text-white font-pixel">
                      {season.teamName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-retro">
                      {t(season.competitionName)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Performance & Financials Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-center">
                <div className="bg-slate-950 p-2 pixel-corners border border-slate-800">
                  <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('Matches')}</div>
                  <div className="text-sm font-black text-white mt-0.5 font-arcade">
                    {season.matches}
                  </div>
                </div>

                <div className="bg-slate-950 p-2 pixel-corners border border-slate-800">
                  <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('Goals / Assists')}</div>
                  <div className="text-sm font-black text-amber-300 mt-0.5 font-arcade">
                    {season.goals} <span className="text-xs text-slate-400">{t('G')}</span> / {season.assists} <span className="text-xs text-slate-400">{t('A')}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 pixel-corners border border-slate-800">
                  <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('Avg Rating')}</div>
                  <div className={`inline-block px-2 py-0.5 pixel-corners text-xs font-black border mt-0.5 font-arcade ${ratingColor}`}>
                    ⭐ {season.avgRating.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-950 p-2 pixel-corners border border-slate-800">
                  <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('Annual Salary')}</div>
                  <div className="text-xs font-black text-emerald-400 mt-0.5 font-arcade">
                    {season.salaryAnnual ? `${formatEuroCurrency(season.salaryAnnual)}/${t('yr')}` : t('Youth Stipend')}
                  </div>
                  {Boolean(season.sponsorsIncome && season.sponsorsIncome > 0) && (
                    <div className="text-[9px] text-emerald-300/80 font-retro">
                      +{formatEuroCurrency(season.sponsorsIncome)} {t('sponsors')}
                    </div>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-950 p-2 pixel-corners border border-slate-800 flex flex-col justify-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('OVR Progression')}</div>
                  <div className="text-xs font-black text-sky-300 mt-0.5 font-arcade">
                    {season.ovrStart || (player.ovr ? player.ovr - 2 : 68)} → {season.ovrEnd || player.ovr || 70} {t('OVR')}
                  </div>
                </div>
              </div>

              {/* Trophies, Awards & Stats Growth Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {season.trophiesWon && season.trophiesWon.length > 0 && (
                    season.trophiesWon.map((trophy, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black shadow-sm font-arcade"
                      >
                        <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{t(trophy)}</span>
                      </span>
                    ))
                  )}

                  {season.awardsWon && season.awardsWon.length > 0 && (
                    season.awardsWon.map((award, aIdx) => (
                      <span
                        key={aIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-black shadow-sm font-arcade"
                      >
                        <Award className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{t(award)}</span>
                      </span>
                    ))
                  )}

                  {season.statsGained && (
                    <div className="flex flex-wrap items-center gap-1">
                      {Array.isArray(season.statsGained) ? (
                        season.statsGained.map((st, stIdx) => (
                          <span
                            key={stIdx}
                            className="px-2 py-0.5 pixel-corners bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold font-retro"
                          >
                            {t(st)}
                          </span>
                        ))
                      ) : (
                        Object.entries(season.statsGained).map(([key, val]) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 pixel-corners bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold font-retro"
                          >
                            +{val} {t(key.toUpperCase())}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {season.keyHighlight && (
                  <div className="text-xs text-slate-300 italic font-retro">
                    &ldquo;{t(season.keyHighlight)}&rdquo;
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
