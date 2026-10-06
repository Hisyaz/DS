import React, { useState, useMemo } from 'react';
import { PlayerCardData, AccountingState } from '../types';
import { CareerSeasonRecord, SeasonCompetitionRecord } from '../types/careerConclusion';
import { getChronologicalCareerSeasons } from '../utils/careerConclusionSystem';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  Calendar,
  Flame,
  Award,
  Trophy,
  Star,
  Activity,
  Clock,
  Search,
  Filter,
  Shield,
  Globe,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Medal,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface CareerStatisticsPanelProps {
  player: PlayerCardData;
  accounting?: AccountingState;
  onClose?: () => void;
}

export const CareerStatisticsPanel: React.FC<CareerStatisticsPanelProps> = ({
  player,
  accounting,
  onClose,
}) => {
  const { t } = useLanguage();
  const [filterStage, setFilterStage] = useState<'all' | 'pro' | 'youth'>('all');
  const [filterCompType, setFilterCompType] = useState<'all' | 'league' | 'cup' | 'continental' | 'national_team'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeasonYears, setExpandedSeasonYears] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'season_desc' | 'season_asc' | 'goals_desc' | 'rating_desc' | 'minutes_desc'>('season_desc');

  // Retrieve full chronological career seasons with enriched competitions
  const seasonsList: CareerSeasonRecord[] = useMemo(() => {
    const raw = getChronologicalCareerSeasons(player, accounting);
    return raw.map((s) => {
      // Ensure competitions array is populated if empty
      if (!s.competitions || s.competitions.length === 0) {
        const defaultMinutes = (s.matches || 18) * 80;
        const compList: SeasonCompetitionRecord[] = [
          {
            competitionName: s.competitionName || 'League Competition',
            competitionType: 'league',
            matches: s.matches || 0,
            minutes: s.minutesPlayed || defaultMinutes,
            goals: s.goals || 0,
            assists: s.assists || 0,
            mvps: s.mvps || Math.round((s.goals || 0) * 0.4),
            avgRating: s.avgRating || 7.2,
            standingRank: s.standingRank,
            stageReached: s.standingRank === 1 ? 'Champions 🏆' : `Rank #${s.standingRank || 1}`,
            wonTrophy: s.standingRank === 1,
            trophiesWon: s.standingRank === 1 ? [`${s.competitionName} Champion`] : [],
          },
        ];

        // If pro or has cup matches
        if (!s.isYouth && s.matches > 22) {
          const cupMatches = Math.round(s.matches * 0.2);
          const leagueMatches = s.matches - cupMatches;
          compList[0].matches = leagueMatches;
          compList[0].minutes = leagueMatches * 82;
          compList.push({
            competitionName: 'Domestic Cup',
            competitionType: 'cup',
            matches: cupMatches,
            minutes: cupMatches * 85,
            goals: Math.round((s.goals || 0) * 0.25),
            assists: Math.round((s.assists || 0) * 0.25),
            mvps: Math.round((s.mvps || 1) * 0.3),
            avgRating: parseFloat((s.avgRating + 0.1).toFixed(1)),
            stageReached: s.standingRank === 1 ? 'Winners 🏆' : 'Semi-Final',
            wonTrophy: s.standingRank === 1,
          });
        }

        return {
          ...s,
          minutesPlayed: s.minutesPlayed || defaultMinutes,
          mvps: s.mvps || Math.round((s.goals || 0) * 0.4),
          competitions: compList,
        };
      }
      return s;
    });
  }, [player, accounting]);

  // Aggregate All-Time Career Totals
  const careerTotals = useMemo(() => {
    let matches = 0;
    let minutes = 0;
    let goals = 0;
    let assists = 0;
    let mvps = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let trophiesCount = 0;
    let awardsCount = 0;

    seasonsList.forEach((s) => {
      matches += s.matches || 0;
      minutes += s.minutesPlayed || (s.matches * 80);
      goals += s.goals || 0;
      assists += s.assists || 0;
      mvps += s.mvps || 0;
      if (s.avgRating) {
        ratingSum += s.avgRating;
        ratingCount++;
      }
      trophiesCount += (s.trophiesWon || []).length;
      awardsCount += (s.awardsWon || []).length;
    });

    const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : '7.20';

    return {
      totalSeasons: seasonsList.length,
      matches,
      minutes,
      goals,
      assists,
      mvps,
      avgRating,
      trophiesCount,
      awardsCount,
    };
  }, [seasonsList]);

  // Find Career Best Milestones
  const careerRecords = useMemo(() => {
    let topScoringSeason = { goals: 0, year: '—', club: '—' };
    let topAssistSeason = { assists: 0, year: '—', club: '—' };
    let topRatedSeason = { rating: 0, year: '—', club: '—' };
    let mostMvpsSeason = { mvps: 0, year: '—', club: '—' };
    let mostMinutesSeason = { minutes: 0, year: '—', club: '—' };

    seasonsList.forEach((s) => {
      if ((s.goals || 0) > topScoringSeason.goals) {
        topScoringSeason = { goals: s.goals, year: s.seasonYear, club: s.teamName };
      }
      if ((s.assists || 0) > topAssistSeason.assists) {
        topAssistSeason = { assists: s.assists, year: s.seasonYear, club: s.teamName };
      }
      if ((s.avgRating || 0) > topRatedSeason.rating) {
        topRatedSeason = { rating: s.avgRating, year: s.seasonYear, club: s.teamName };
      }
      const sMvps = s.mvps || 0;
      if (sMvps > mostMvpsSeason.mvps) {
        mostMvpsSeason = { mvps: sMvps, year: s.seasonYear, club: s.teamName };
      }
      const sMin = s.minutesPlayed || (s.matches * 80);
      if (sMin > mostMinutesSeason.minutes) {
        mostMinutesSeason = { minutes: sMin, year: s.seasonYear, club: s.teamName };
      }
    });

    return {
      topScoringSeason,
      topAssistSeason,
      topRatedSeason,
      mostMvpsSeason,
      mostMinutesSeason,
    };
  }, [seasonsList]);

  // Filter and Sort Seasons
  const filteredSeasons = useMemo(() => {
    return seasonsList
      .filter((s) => {
        // Stage filter
        if (filterStage === 'pro' && s.isYouth) return false;
        if (filterStage === 'youth' && !s.isYouth) return false;

        // Competition type filter
        if (filterCompType !== 'all') {
          const hasComp = (s.competitions || []).some((c) => c.competitionType === filterCompType);
          if (!hasComp) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchClub = s.teamName.toLowerCase().includes(q);
          const matchYear = s.seasonYear.toLowerCase().includes(q);
          const matchLeague = s.competitionName.toLowerCase().includes(q);
          const matchComp = (s.competitions || []).some((c) => c.competitionName.toLowerCase().includes(q));
          if (!matchClub && !matchYear && !matchLeague && !matchComp) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'season_desc') return b.age - a.age;
        if (sortBy === 'season_asc') return a.age - b.age;
        if (sortBy === 'goals_desc') return (b.goals || 0) - (a.goals || 0);
        if (sortBy === 'rating_desc') return (b.avgRating || 0) - (a.avgRating || 0);
        if (sortBy === 'minutes_desc') return (b.minutesPlayed || 0) - (a.minutesPlayed || 0);
        return b.age - a.age;
      });
  }, [seasonsList, filterStage, filterCompType, searchQuery, sortBy]);

  const toggleSeasonExpand = (seasonYear: string) => {
    setExpandedSeasonYears((prev) => ({
      ...prev,
      [seasonYear]: prev[seasonYear] === undefined ? true : !prev[seasonYear],
    }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('CAREER STATISTICS & COMPETITIONS BREAKDOWN')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {t('Season-by-Season Performance Records')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('Track competitions played, appearances, minutes, goals, assists, MVPs, and average match ratings throughout your entire career.')}
          </p>
        </div>
      </div>

      {/* All-Time Career Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" /> {t('Seasons')}
          </div>
          <div className="text-lg font-black text-white">{careerTotals.totalSeasons}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Age {start} → {current}', { start: `${seasonsList[0]?.age || 10}`, current: `${player.age}` })}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-400" /> {t('Games')}
          </div>
          <div className="text-lg font-black text-sky-300">{careerTotals.matches}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Appearances')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> {t('Minutes')}
          </div>
          <div className="text-lg font-black text-emerald-300">{careerTotals.minutes.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('On Pitch')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> {t('Goals')}
          </div>
          <div className="text-lg font-black text-rose-400">{careerTotals.goals}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Total Goals')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> {t('Assists')}
          </div>
          <div className="text-lg font-black text-amber-300">{careerTotals.assists}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Total Assists')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> {t('MVPs')}
          </div>
          <div className="text-lg font-black text-purple-300">{careerTotals.mvps}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Match MVPs')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-teal-400" /> {t('Avg Rating')}
          </div>
          <div className="text-lg font-black text-teal-300">⭐ {careerTotals.avgRating}</div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Career Avg')}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" /> {t('Honors')}
          </div>
          <div className="text-lg font-black text-yellow-400">
            {careerTotals.trophiesCount + careerTotals.awardsCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">{t('Trophies & Awards')}</div>
        </div>
      </div>

      {/* Career Record Highlights Banner */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-400" /> {t('All-Time Career Highs & Records')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('Best Scoring Season')}</div>
            <div className="text-base font-black text-rose-400 mt-0.5">{careerRecords.topScoringSeason.goals} {t('Goals')}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{careerRecords.topScoringSeason.year} • {careerRecords.topScoringSeason.club}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('Best Playmaking Season')}</div>
            <div className="text-base font-black text-amber-300 mt-0.5">{careerRecords.topAssistSeason.assists} {t('Assists')}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{careerRecords.topAssistSeason.year} • {careerRecords.topAssistSeason.club}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('Highest Rated Campaign')}</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">⭐ {careerRecords.topRatedSeason.rating} {t('Rating')}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{careerRecords.topRatedSeason.year} • {careerRecords.topRatedSeason.club}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('Most Match MVPs')}</div>
            <div className="text-base font-black text-purple-300 mt-0.5">{careerRecords.mostMvpsSeason.mvps} {t('MVPs')}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{careerRecords.mostMvpsSeason.year} • {careerRecords.mostMvpsSeason.club}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('Most Minutes Logged')}</div>
            <div className="text-base font-black text-sky-300 mt-0.5">{careerRecords.mostMinutesSeason.minutes.toLocaleString()} {t('mins')}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{careerRecords.mostMinutesSeason.year} • {careerRecords.mostMinutesSeason.club}</div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStage === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('All Stages')}
            </button>
            <button
              onClick={() => setFilterStage('pro')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStage === 'pro' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('Pro Career')}
            </button>
            <button
              onClick={() => setFilterStage('youth')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStage === 'youth' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('Youth Academy')}
            </button>
          </div>

          {/* Competition Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setFilterCompType('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCompType === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('All Comps')}
            </button>
            <button
              onClick={() => setFilterCompType('league')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCompType === 'league' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('League')}
            </button>
            <button
              onClick={() => setFilterCompType('cup')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCompType === 'cup' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('Cups')}
            </button>
            <button
              onClick={() => setFilterCompType('continental')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCompType === 'continental' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('Continental')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 md:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search club or comp...')}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="season_desc">{t('Newest First')}</option>
            <option value="season_asc">{t('Oldest First')}</option>
            <option value="goals_desc">{t('Most Goals')}</option>
            <option value="rating_desc">{t('Highest Rating')}</option>
            <option value="minutes_desc">{t('Most Minutes')}</option>
          </select>
        </div>
      </div>

      {/* Season Cards List */}
      <div className="space-y-4">
        {filteredSeasons.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-white">{t('No season statistics found')}</div>
            <p className="text-xs text-slate-400">{t('Try adjusting your filters or search query.')}</p>
          </div>
        ) : (
          filteredSeasons.map((season) => {
            const isExpanded = expandedSeasonYears[season.seasonYear] ?? true;
            const competitions = season.competitions || [];
            const minutesTotal = season.minutesPlayed || (season.matches * 80);

            return (
              <div
                key={season.seasonYear}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all"
              >
                {/* Season Header Bar */}
                <div
                  onClick={() => toggleSeasonExpand(season.seasonYear)}
                  className="p-4 bg-slate-900/90 hover:bg-slate-850 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex flex-col items-center justify-center text-white font-black shrink-0 shadow">
                      <span className="text-[10px] leading-tight">{t('AGE')}</span>
                      <span className="text-sm leading-tight">{season.age}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{t('{year} Season', { year: season.seasonYear })}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            season.isYouth
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {season.isYouth ? t('Youth Academy') : t('Professional')}
                        </span>
                        {season.standingRank === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-500 text-slate-950 shadow">
                            🏆 {t('Champion')}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-bold flex items-center gap-2 mt-0.5">
                        <span>{season.teamName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-normal">{t(season.squadLevel || 'First Team')}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-400/90 font-mono text-[11px]">
                          {season.standingRank ? t('Finish: Rank #{rank}', { rank: `${season.standingRank}` }) : t(season.qualificationOutcome || '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Season Totals Banner */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{t('Season Summary')}</div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="text-sky-300">{season.matches} {t('Apps')}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-emerald-400">{minutesTotal.toLocaleString()} {t('Mins')}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-rose-400">{season.goals}{t('G')}</span>
                        <span className="text-amber-300">{season.assists}{t('A')}</span>
                        <span className="text-purple-300">({season.mvps || 0} {t('MVP')})</span>
                        <span className="text-teal-300 font-mono">⭐ {season.avgRating}</span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Season Body with Competitions Breakdown */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-slate-950/60">
                    {/* Competitions Table */}
                    <div>
                      <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t('COMPETITIONS BREAKDOWN ({count} PLAYED)', { count: `${competitions.length}` })}</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">{t('Competition')}</th>
                              <th className="py-2.5 px-2 text-center">{t('Type')}</th>
                              <th className="py-2.5 px-2 text-center">{t('Apps')}</th>
                              <th className="py-2.5 px-2 text-center">{t('Minutes')}</th>
                              <th className="py-2.5 px-2 text-center text-emerald-400 font-bold">{t('Goals')}</th>
                              <th className="py-2.5 px-2 text-center text-sky-400 font-bold">{t('Assists')}</th>
                              <th className="py-2.5 px-2 text-center text-purple-400 font-bold">{t('MVPs')}</th>
                              <th className="py-2.5 px-2 text-center text-amber-300 font-bold">{t('Avg Rating')}</th>
                              <th className="py-2.5 px-3 text-right">{t('Team Finish / Outcome')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {competitions.map((comp, idx) => (
                              <tr
                                key={comp.competitionName + idx}
                                className="hover:bg-slate-850/60 text-slate-200 transition-all"
                              >
                                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                                  <span>{t(comp.competitionName)}</span>
                                  {comp.wonTrophy && (
                                    <span className="text-yellow-400 text-xs">🏆</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                      comp.competitionType === 'league'
                                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                        : comp.competitionType === 'cup'
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                        : comp.competitionType === 'continental'
                                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    }`}
                                  >
                                    {t(comp.competitionType)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-sky-300">
                                  {comp.matches}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                                  {comp.minutes.toLocaleString()}′
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-400">
                                  {comp.goals}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-sky-400">
                                  {comp.assists}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-300">
                                  {comp.mvps}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-300">
                                  ⭐ {comp.avgRating.toFixed(1)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-xs">
                                  <span
                                    className={
                                      comp.wonTrophy || comp.stageReached?.includes('Champion')
                                        ? 'text-yellow-400 font-black'
                                        : comp.stageReached?.includes('Final')
                                        ? 'text-sky-300'
                                        : 'text-slate-300'
                                    }
                                  >
                                    {t(comp.stageReached || (comp.standingRank ? `Rank #${comp.standingRank}` : 'Completed'))}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Season Trophies & Awards Badges */}
                    {((season.trophiesWon && season.trophiesWon.length > 0) ||
                      (season.awardsWon && season.awardsWon.length > 0)) && (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                        <div className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1 mr-2">
                          <Trophy className="w-3.5 h-3.5" /> {t('Season Honors')}:
                        </div>
                        {(season.trophiesWon || []).map((trophy, tIdx) => (
                          <div
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 text-[11px] font-black"
                          >
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span>{t(trophy)}</span>
                          </div>
                        ))}
                        {(season.awardsWon || []).map((award, aIdx) => (
                          <div
                            key={aIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-black"
                          >
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>{t(award)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Highlight */}
                    {season.keyHighlight && (
                      <div className="text-xs text-slate-400 italic">
                        &ldquo;{t(season.keyHighlight)}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
