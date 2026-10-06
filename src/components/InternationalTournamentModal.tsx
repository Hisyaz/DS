import React, { useState, useEffect } from 'react';
import { QualifierSummary, WorldCupSummary } from '../utils/internationalCareerCycleEngine';
import { audioManager } from '../utils/audioSystem';
import { Globe, Trophy, Shield, CheckCircle2, XCircle, Award, ChevronRight, Play, Sparkles, Flag, Star } from 'lucide-react';

interface InternationalTournamentModalProps {
  isOpen: boolean;
  qualifierSummary: QualifierSummary | null;
  worldCupSummary: WorldCupSummary | null;
  onClose: () => void;
  onTriggerKeyMatch?: (stageTitle: string, opponentName: string, opponentOvr: number) => void;
}

export const InternationalTournamentModal: React.FC<InternationalTournamentModalProps> = ({
  isOpen,
  qualifierSummary,
  worldCupSummary,
  onClose,
  onTriggerKeyMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'knockout' | 'player_stats'>('standings');

  if (!isOpen || (!qualifierSummary && !worldCupSummary)) return null;

  const isWorldCup = !!worldCupSummary;
  const summary = qualifierSummary;
  const wcSummary = worldCupSummary;

  const tier = isWorldCup ? wcSummary!.tier : summary!.tier;
  const nation = isWorldCup ? wcSummary!.playerNation : summary!.playerNation;
  const matches = isWorldCup ? wcSummary!.matches : summary!.matches;
  const compName = isWorldCup
    ? wcSummary!.competitionName || (wcSummary!.isContinental ? 'Continental Championship' : 'FIFA World Cup')
    : summary?.competitionName || 'World Cup Qualifiers';

  useEffect(() => {
    if (isOpen) {
      const modeType = wcSummary?.isContinental ? 'continental' : 'world';
      audioManager.enterMatchMode(modeType, compName);
    }
    return () => {
      audioManager.exitMatchMode();
    };
  }, [isOpen, compName, wcSummary?.isContinental]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-left overflow-hidden font-pixel select-none">
      <div className="bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold p-4 sm:p-5 max-w-3xl w-full shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-4 sm:space-y-4 relative overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="absolute inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />

        {/* Top Banner Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b-2 border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-9 pixel-corners overflow-hidden shadow-lg border-2 border-white/20 shrink-0">
              <img
                src={`https://flagcdn.com/w80/${(nation.iso || 'gb-eng').toLowerCase()}.png`}
                alt={nation.code}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50" viewBox="0 0 80 50"><rect width="80" height="50" fill="%23334155"/></svg>';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-500/20 border border-amber-400/40 text-[9px] font-black uppercase text-amber-300 tracking-wider font-arcade">
                <Globe className="w-3 h-3 text-amber-400" />
                {nation.name.toUpperCase()} {tier.toUpperCase()} • {compName.toUpperCase()}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2 pixel-text-shadow">
                {compName} ⚽
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer pixel-bevel-raised"
          >
            ✕
          </button>
        </div>

        {/* Headline News Card */}
        <div className="relative z-10 bg-slate-950 border border-slate-800 pixel-corners pixel-bevel-sunken p-3.5 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 font-arcade">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL INTERNATIONAL NEWS REPORT
            </span>
            <span className="text-xs font-arcade font-bold text-sky-400">
              {matches.length} MATCHES RECORDED
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-black text-white font-pixel">
            {isWorldCup ? wcSummary!.newsHeadline : summary!.newsHeadline}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-retro">
            {isWorldCup ? wcSummary!.newsSummary : summary!.newsSummary}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10 flex border-b border-slate-800 gap-2 shrink-0">
          {(summary?.standings || wcSummary?.groupStandings) && (
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border-b-2 font-pixel ${
                activeTab === 'standings'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Group Standings
            </button>
          )}

          {isWorldCup && (wcSummary?.currentKnockoutOpponent || wcSummary?.knockoutStages) && (
            <button
              onClick={() => setActiveTab('knockout')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border-b-2 font-pixel ${
                activeTab === 'knockout'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Knockout Stage
            </button>
          )}

          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border-b-2 font-pixel ${
              activeTab === 'matches'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Match Results
          </button>

          {!isWorldCup && (
            <button
              onClick={() => setActiveTab('player_stats')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border-b-2 font-pixel ${
                activeTab === 'player_stats'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Player Stats
            </button>
          )}
        </div>

        {/* Tab Contents Scrollable */}
        <div className="relative z-10 overflow-y-auto custom-scrollbar space-y-3 pr-1 flex-1">
          {/* TAB 1: STANDINGS TABLE */}
          {activeTab === 'standings' && (summary?.standings || wcSummary?.groupStandings) && (
            <div className="bg-slate-950 border border-slate-800 pixel-corners overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 font-pixel">
                    <th className="p-2.5 text-center">#</th>
                    <th className="p-2.5">Nation</th>
                    <th className="p-2.5 text-center">P</th>
                    <th className="p-2.5 text-center">W</th>
                    <th className="p-2.5 text-center">D</th>
                    <th className="p-2.5 text-center">L</th>
                    <th className="p-2.5 text-center">GF</th>
                    <th className="p-2.5 text-center">GA</th>
                    <th className="p-2.5 text-center">GD</th>
                    <th className="p-2.5 text-center font-black text-amber-400">Pts</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {(summary?.standings || wcSummary?.groupStandings || []).map((row, idx) => (
                    <tr
                      key={row.nationCode}
                      className={`${
                        row.isPlayerNation
                          ? 'bg-amber-500/20 font-black text-white ring-1 ring-amber-400/50'
                          : row.qualified
                          ? 'bg-emerald-950/20 text-slate-200'
                          : 'text-slate-400 hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="p-2.5 text-center font-arcade font-bold">{idx + 1}</td>
                      <td className="p-2.5 flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                          alt={row.nationCode}
                          className="w-4 h-3 object-cover pixel-corners"
                        />
                        <span className="font-arcade">{row.nationName}</span>
                        {row.isPlayerNation && (
                          <span className="text-[9px] font-black uppercase text-amber-400 px-1.5 py-0.5 pixel-corners bg-amber-500/20 font-arcade">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-arcade">{row.played}</td>
                      <td className="p-2.5 text-center font-arcade">{row.wins}</td>
                      <td className="p-2.5 text-center font-arcade">{row.draws}</td>
                      <td className="p-2.5 text-center font-arcade">{row.losses}</td>
                      <td className="p-2.5 text-center font-arcade">{row.goalsFor}</td>
                      <td className="p-2.5 text-center font-arcade">{row.goalsAgainst}</td>
                      <td className="p-2.5 text-center font-arcade font-bold">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="p-2.5 text-center font-arcade font-black text-amber-400 text-sm">
                        {row.points}
                      </td>
                      <td className="p-2.5 text-right font-arcade">
                        {row.qualified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 pixel-corners border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> QUALIFIED
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 uppercase font-bold">
                            Eliminated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: KNOCKOUT STAGE & KEY MATCH */}
          {activeTab === 'knockout' && wcSummary && (
            <div className="space-y-3">
              {wcSummary.currentKnockoutOpponent && !wcSummary.isFinished ? (
                <div className="bg-slate-950 border-2 border-amber-400 pixel-corners pixel-bevel-gold p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 pixel-corners bg-amber-500/20 border border-amber-400/40 text-xs font-black uppercase text-amber-300 tracking-wider font-arcade">
                      KNOCKOUT MATCH AWAITING
                    </span>
                    <span className="text-xs font-arcade font-black text-amber-400">
                      STAGE: {wcSummary.playerFinishStage || 'Knockout Round'}
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    {/* Home Nation */}
                    <div className="text-center space-y-1.5">
                      <div className="w-16 h-11 mx-auto pixel-corners overflow-hidden shadow-md border-2 border-white/20">
                        <img
                          src={`https://flagcdn.com/w80/${(wcSummary.playerNation.iso || 'gb-eng').toLowerCase()}.png`}
                          alt={wcSummary.playerNation.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-black text-xs sm:text-sm text-white font-pixel">{wcSummary.playerNation.name}</div>
                      <div className="text-[9px] font-arcade text-amber-400 font-bold">YOU</div>
                    </div>

                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-arcade pixel-text-shadow">VS</div>

                    {/* Opponent Nation */}
                    <div className="text-center space-y-1.5">
                      <div className="w-16 h-11 mx-auto pixel-corners overflow-hidden shadow-md border-2 border-white/20">
                        <img
                          src={`https://flagcdn.com/w80/${(wcSummary.currentKnockoutOpponent.iso || 'gb-eng').toLowerCase()}.png`}
                          alt={wcSummary.currentKnockoutOpponent.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-black text-xs sm:text-sm text-white font-pixel">{wcSummary.currentKnockoutOpponent.name}</div>
                      <div className="text-[9px] font-arcade text-slate-400 font-bold">OVR {wcSummary.currentKnockoutOpponent.ovr}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onTriggerKeyMatch && wcSummary.currentKnockoutOpponent) {
                        onTriggerKeyMatch(
                          `${compName} - ${wcSummary.playerFinishStage}`,
                          wcSummary.currentKnockoutOpponent.name,
                          wcSummary.currentKnockoutOpponent.ovr
                        );
                      }
                    }}
                    className="w-full py-3.5 pixel-corners bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 pixel-bevel-raised text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer font-pixel uppercase"
                  >
                    <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                    <span>PLAY {wcSummary.playerFinishStage?.toUpperCase() || 'KNOCKOUT'} KEY MATCH</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 pixel-corners p-4 text-center space-y-2">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-sm sm:text-base font-black text-white font-pixel">TOURNAMENT FINISHED</h4>
                  <p className="text-xs text-slate-300 font-retro">
                    Final Finish Stage: <span className="font-bold text-amber-400 font-arcade">{wcSummary.playerFinishStage}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATCH RESULTS */}
          {(activeTab === 'matches' || (!summary?.standings && !wcSummary?.groupStandings)) && (
            <div className="space-y-2.5">
              {[...matches].reverse().map((m) => (
                <div
                  key={m.matchNumber}
                  className="bg-slate-950 border border-slate-800 pixel-corners p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5"
                >
                  <div className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 pixel-corners border border-amber-500/20 shrink-0 font-arcade">
                    {m.stageName || `Match #${m.matchNumber}`}
                  </div>

                  {/* Scoreline */}
                  <div className="flex items-center gap-3 font-black text-xs sm:text-sm">
                    {/* Home */}
                    <div className="flex items-center gap-2 text-right">
                       <span className="text-white font-pixel">{m.homeNation.name}</span>
                       <img
                        src={`https://flagcdn.com/w40/${(m.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={m.homeNation.code}
                        className="w-4 h-3 object-cover pixel-corners"
                      />
                    </div>

                    <div className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 pixel-corners text-amber-300 font-arcade text-sm sm:text-base tracking-wider">
                      {m.homeScore} - {m.awayScore}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-2 text-left">
                      <img
                        src={`https://flagcdn.com/w40/${(m.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={m.awayNation.code}
                        className="w-4 h-3 object-cover pixel-corners"
                      />
                      <span className="text-white font-pixel">{m.awayNation.name}</span>
                    </div>
                  </div>

                  {/* Player Stats pill */}
                  {m.playerStats && (
                    <div className="flex items-center gap-2 text-[10px] font-arcade font-bold bg-slate-900 px-2.5 py-0.5 pixel-corners border border-slate-800 text-sky-300 shrink-0">
                      <span>⚽ {m.playerStats.goals}g</span>
                      <span>👟 {m.playerStats.assists}a</span>
                      <span className="text-amber-400">⭐ {m.playerStats.matchRating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PLAYER STATS */}
          {(!isWorldCup && activeTab === 'player_stats' && summary) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-950 border border-slate-800 pixel-corners p-3.5 text-center space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 font-pixel">Qualifying Goals</span>
                <div className="text-2xl font-black text-amber-400 font-arcade">{summary.totalPlayerGoals}</div>
                <p className="text-[9px] text-slate-500 font-retro">Total goals in 5 matches</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 pixel-corners p-3.5 text-center space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 font-pixel">Qualifying Assists</span>
                <div className="text-2xl font-black text-sky-400 font-arcade">{summary.totalPlayerAssists}</div>
                <p className="text-[9px] text-slate-500 font-retro">Key goal assists</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 pixel-corners p-3.5 text-center space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 font-pixel">Average Match Rating</span>
                <div className="text-2xl font-black text-emerald-400 font-arcade">{summary.avgPlayerRating}</div>
                <p className="text-[9px] text-slate-500 font-retro">Out of 10.0 scale</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="relative z-10 pt-3 border-t-2 border-slate-800 shrink-0 pb-16 sm:pb-0">
          <button
            onClick={onClose}
            className="w-full py-3 pixel-corners bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 font-pixel uppercase"
          >
            <span>CONTINUE CAREER MODE</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
