import React, { useState, useMemo } from 'react';
import {
  Zap,
  Trophy,
  Shield,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Award,
  Crown,
  Swords,
  Layers,
} from 'lucide-react';
import {
  getPowerscaleState,
  getClubPowerscaleImpact,
  getNationalTeamPowerscaleImpact,
} from '../utils/powerscaleSystem';
import { ClubPowerscaleProfile, NationalTeamPowerscaleProfile } from '../types/powerscale';

interface PowerscaleFavoritesViewProps {
  seasonYear?: string;
  userClubId?: string;
}

export const PowerscaleFavoritesView: React.FC<PowerscaleFavoritesViewProps> = ({
  seasonYear = '2026/27',
  userClubId,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'ucl' | 'domestic' | 'south_america' | 'arabia' | 'promoted' | 'world_cup'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const state = useMemo(() => getPowerscaleState(seasonYear), [seasonYear]);

  const clubsList = useMemo(() => {
    return Object.values(state.clubProfiles);
  }, [state]);

  const nationalList = useMemo(() => {
    return Object.values(state.nationalProfiles);
  }, [state]);

  const filteredClubs = useMemo(() => {
    let list = [...clubsList];

    if (activeCategory === 'ucl') {
      list = list.filter(
        (c) => c.continentalTitlesCount > 0 || c.baseContinentalModifier >= 1.15 || c.tier === 'heavyweight_favorite'
      );
    } else if (activeCategory === 'domestic') {
      list = list.filter((c) => c.leagueTitlesCount >= 5 || c.baseLeagueModifier >= 1.12);
    } else if (activeCategory === 'south_america') {
      list = list.filter((c) => ['bra_d1', 'arg_d1'].includes(c.leagueId));
    } else if (activeCategory === 'arabia') {
      list = list.filter((c) => c.leagueId === 'sau_d1');
    } else if (activeCategory === 'promoted') {
      list = list.filter((c) => c.isFirstSeasonPromoted || c.tier === 'promoted_underdog');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.teamName.toLowerCase().includes(q) ||
          (c.favoriteTag && c.favoriteTag.toLowerCase().includes(q)) ||
          c.leagueId.toLowerCase().includes(q)
      );
    }

    // Sort by continental + league modifiers
    return list.sort(
      (a, b) =>
        b.currentContinentalModifier + b.currentLeagueModifier - (a.currentContinentalModifier + a.currentLeagueModifier)
    );
  }, [clubsList, activeCategory, searchQuery]);

  const filteredNations = useMemo(() => {
    if (activeCategory !== 'world_cup' && activeCategory !== 'all') return [];
    let list = [...nationalList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((n) => n.countryName.toLowerCase().includes(q) || n.countryCode.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.currentWorldCupModifier - a.currentWorldCupModifier);
  }, [nationalList, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner */}
      <div className="p-5 pixel-corners bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-2 border-purple-500/50 shadow-xl pixel-bevel-raised">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 pixel-corners bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-arcade font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              POWERSCALE REALISM SIMULATION ENGINE
            </div>
            <h3 className="text-xl font-arcade font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
              HERITAGE STACKS, FAVORITES & DECAY MODIFIERS
            </h3>
            <p className="text-xs text-slate-300 font-mono max-w-2xl leading-relaxed">
              Every continental title adds <span className="text-purple-300 font-bold font-mono">+2.5% win multiplier</span> in that tournament (e.g. Real Madrid has 15 stacks = <span className="text-amber-300 font-bold font-mono">+37.5%</span> in UCL). Modifiers decay dynamically by 1.5%/yr after 5 years without lifting silverware and fully refresh when won!
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="px-3 py-2 pixel-corners bg-slate-950/90 border-2 border-slate-800 text-center min-w-[90px] pixel-bevel-sunken">
              <span className="text-[10px] uppercase font-arcade font-bold text-slate-400 block">Season</span>
              <span className="text-sm font-arcade font-black text-amber-400">{seasonYear}</span>
            </div>
            <div className="px-3 py-2 pixel-corners bg-slate-950/90 border-2 border-slate-800 text-center min-w-[90px] pixel-bevel-sunken">
              <span className="text-[10px] uppercase font-arcade font-bold text-slate-400 block">Clubs Active</span>
              <span className="text-sm font-arcade font-black text-purple-400">{clubsList.length}</span>
            </div>
            <div className="px-3 py-2 pixel-corners bg-slate-950/90 border-2 border-slate-800 text-center min-w-[90px] pixel-bevel-sunken">
              <span className="text-[10px] uppercase font-arcade font-bold text-slate-400 block">World Cup Seed</span>
              <span className="text-sm font-arcade font-black text-sky-400">{nationalList.length}</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-slate-800/80 text-xs text-slate-300 font-mono">
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-arcade font-bold text-slate-100 uppercase block">UCL Heritage Stacks</span>
              <span className="text-slate-400 text-[11px]">+2.5% per title. Madrid 15x, Bayern 6x, Liverpool 6x.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-arcade font-bold text-slate-100 uppercase block">Shared Local Cups</span>
              <span className="text-slate-400 text-[11px]">League modifiers carry into domestic cups without refreshing them.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-arcade font-bold text-slate-100 uppercase block">Drought Decay</span>
              <span className="text-slate-400 text-[11px]">Decays after 5+ dry years. Restores 100% on title triumph.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Swords className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-arcade font-bold text-slate-100 uppercase block">South America & Arabia</span>
              <span className="text-slate-400 text-[11px]">Balanced modifiers with higher chaos variance in Libertadores.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            ALL GIANTS ({clubsList.length})
          </button>
          <button
            onClick={() => setActiveCategory('ucl')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'ucl'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            🏆 UCL POWERHOUSES
          </button>
          <button
            onClick={() => setActiveCategory('domestic')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'domestic'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            🛡️ LEAGUE CHAMPIONS
          </button>
          <button
            onClick={() => setActiveCategory('south_america')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'south_america'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            🌎 SOUTH AMERICA
          </button>
          <button
            onClick={() => setActiveCategory('arabia')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'arabia'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            🌴 SAUDI ARABIA
          </button>
          <button
            onClick={() => setActiveCategory('promoted')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'promoted'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            ⚠️ PROMOTED UNDERDOGS (-8%)
          </button>
          <button
            onClick={() => setActiveCategory('world_cup')}
            className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'world_cup'
                ? 'bg-purple-500 text-slate-950 font-black pixel-bevel-raised border border-purple-300 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            🌍 FIFA WORLD CUP
          </button>
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search team or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 pixel-corners bg-slate-950 border-2 border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-purple-400 placeholder-slate-500 font-mono pixel-bevel-sunken"
          />
        </div>
      </div>

      {/* Clubs Table */}
      {activeCategory !== 'world_cup' && (
        <div className="pixel-corners border-2 border-slate-750 bg-slate-950 overflow-hidden shadow-lg pixel-bevel-raised">
          <div className="px-4 py-3 bg-slate-900 border-b-2 border-slate-800 flex items-center justify-between">
            <div className="text-xs font-arcade font-bold text-slate-300 flex items-center gap-2 uppercase">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>CLUB POWERSCALE ROSTER</span>
              <span className="text-slate-500 font-mono">({filteredClubs.length} profiled)</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Win Multiplier = Tactical Base × Powerscale Modifier
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-arcade uppercase text-[11px]">
                  <th className="py-2.5 px-4">Club</th>
                  <th className="py-2.5 px-3">Status Tag</th>
                  <th className="py-2.5 px-3 text-center">UCL / Continental</th>
                  <th className="py-2.5 px-3 text-center">Domestic League</th>
                  <th className="py-2.5 px-3 text-center">Titles Won</th>
                  <th className="py-2.5 px-3 text-center">Drought Status</th>
                  <th className="py-2.5 px-3 text-center">Recent Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredClubs.map((club) => {
                  const isUser = userClubId === club.teamId;
                  const uclPercent = ((club.currentContinentalModifier - 1) * 100).toFixed(1);
                  const leaguePercent = ((club.currentLeagueModifier - 1) * 100).toFixed(1);
                  const isPositiveUcl = club.currentContinentalModifier >= 1.0;
                  const isPositiveLeague = club.currentLeagueModifier >= 1.0;

                  return (
                    <tr
                      key={club.teamId}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        isUser ? 'bg-amber-500/15 font-semibold text-amber-200' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 font-mono">{club.teamName}</span>
                          {isUser && (
                            <span className="px-1.5 py-0.5 pixel-corners text-[9px] font-arcade font-black bg-amber-400 text-slate-950 uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          League: {club.leagueId.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 pixel-corners text-[10px] font-arcade uppercase font-bold border inline-flex items-center gap-1 ${
                            club.tier === 'heavyweight_favorite'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 pixel-bevel-gold'
                              : club.tier === 'title_contender'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : club.tier === 'promoted_underdog'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {club.favoriteTag || (club.tier === 'promoted_underdog' ? 'Promoted Underdog' : 'Profiled Team')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 pixel-corners text-xs ${
                              isPositiveUcl
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {isPositiveUcl ? `+${uclPercent}%` : `${uclPercent}%`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {club.continentalTitlesCount} Titles ({club.currentContinentalModifier.toFixed(3)}x)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 pixel-corners text-xs ${
                              isPositiveLeague
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {isPositiveLeague ? `+${leaguePercent}%` : `${leaguePercent}%`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Shared with Cup ({club.currentLeagueModifier.toFixed(3)}x)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <div className="text-xs font-bold text-slate-200">
                          {club.continentalTitlesCount > 0 && (
                            <span className="text-amber-400 mr-1.5" title="Continental Cups">
                              🏆 {club.continentalTitlesCount}
                            </span>
                          )}
                          <span className="text-slate-300" title="Domestic League Titles">
                            🛡️ {club.leagueTitlesCount}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Last: {club.lastContinentalTitleYear || club.lastLeagueTitleYear || 'Historic'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px] font-mono">
                        {club.yearsWithoutContinentalTitle === 0 || club.yearsWithoutLeagueTitle === 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center justify-center gap-1 font-arcade uppercase text-[10px]">
                            <Sparkles className="w-3 h-3" /> Defending Champ
                          </span>
                        ) : club.yearsWithoutContinentalTitle >= 5 ? (
                          <span className="text-rose-400 font-semibold flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> {club.yearsWithoutContinentalTitle}y drought (decaying)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Fresh (&lt;5 yrs)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {club.performanceTrend > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs font-mono">
                            <TrendingUp className="w-3.5 h-3.5" /> +{club.performanceTrend}
                          </span>
                        ) : club.performanceTrend < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs font-mono">
                            <TrendingDown className="w-3.5 h-3.5" /> {club.performanceTrend}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">Stable (0)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* World Cup National Teams View */}
      {(activeCategory === 'world_cup' || activeCategory === 'all') && (
        <div className="pixel-corners border-2 border-sky-800/80 bg-slate-950 overflow-hidden shadow-lg mt-6 pixel-bevel-raised">
          <div className="px-4 py-3 bg-sky-950/60 border-b-2 border-sky-800/60 flex items-center justify-between">
            <div className="text-xs font-arcade font-bold text-sky-200 flex items-center gap-2 uppercase">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>FIFA WORLD CUP NATIONAL POWERSCALE STACKS</span>
              <span className="text-slate-400 font-mono">({filteredNations.length} Nations)</span>
            </div>
            <div className="text-[11px] text-sky-300 font-mono">
              World Cup Heritage Multiplier applied to Senior tournament & penalty composure
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-arcade uppercase text-[11px]">
                  <th className="py-2.5 px-4">Nation</th>
                  <th className="py-2.5 px-3">World Cup Tier</th>
                  <th className="py-2.5 px-3 text-center">World Cups Won</th>
                  <th className="py-2.5 px-3 text-center">Effective Win Multiplier</th>
                  <th className="py-2.5 px-3 text-center">Drought / Last Won</th>
                  <th className="py-2.5 px-3 text-center">Shootout Composure Edge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredNations.map((nation) => {
                  const percent = ((nation.currentWorldCupModifier - 1) * 100).toFixed(1);
                  const isHeavyweight = nation.worldCupTitlesCount >= 4;
                  const isContender = nation.worldCupTitlesCount >= 1;
                  return (
                    <tr key={nation.countryCode} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <span className="font-bold text-slate-100 font-mono">{nation.countryName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({nation.countryCode})</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 pixel-corners text-[10px] font-arcade uppercase font-bold border ${
                            isHeavyweight
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 pixel-bevel-gold'
                              : isContender
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {nation.favoriteTag || (isHeavyweight ? '5-Star Heritage 🏆' : isContender ? 'Contender ⚔️' : 'Challenger')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400 text-sm font-mono">
                        ⭐ {nation.worldCupTitlesCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold px-2 py-0.5 pixel-corners text-xs bg-sky-950 text-sky-300 border border-sky-800">
                          +{percent}% ({nation.currentWorldCupModifier.toFixed(3)}x)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px] text-slate-400 font-mono">
                        {nation.lastWorldCupTitleYear ? `Last Won: ${nation.lastWorldCupTitleYear}` : 'Seeking 1st Title'}
                      </td>
                      <td className="py-3 px-3 text-center text-[11px] font-mono font-bold text-emerald-400">
                        +{((nation.currentWorldCupModifier - 1) * 30).toFixed(1)}% Clutch Edge
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
