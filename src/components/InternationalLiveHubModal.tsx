import React, { useState } from 'react';
import {
  InternationalTournamentHubState,
  InternationalFixture,
  InternationalStandingRow,
} from '../types/internationalFootball';
import { PlayerCardData } from '../types';
import { audioManager } from '../utils/audioSystem';
import {
  Globe,
  Trophy,
  Shield,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  User,
  Activity,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react';

interface InternationalLiveHubModalProps {
  isOpen: boolean;
  hubState: InternationalTournamentHubState | null;
  player: PlayerCardData;
  onClose: () => void;
  onPlayKeyMatch: (fixture: InternationalFixture) => void;
  onSimulateMatch: () => void;
  onAdvanceToNextMatch: () => void;
  onConcludeInternationalDuty: () => void;
}

export const InternationalLiveHubModal: React.FC<InternationalLiveHubModalProps> = ({
  isOpen,
  hubState,
  player,
  onClose,
  onPlayKeyMatch,
  onSimulateMatch,
  onAdvanceToNextMatch,
  onConcludeInternationalDuty,
}) => {
  const [activeTab, setActiveTab] = useState<'matchday' | 'standings' | 'fixtures' | 'knockout' | 'squad'>('matchday');
  const [isSimulatingAnimation, setIsSimulatingAnimation] = useState(false);
  const [selectedGroupLetter, setSelectedGroupLetter] = useState<string>(hubState?.drawGroupLetter || 'A');

  // Keep selected group in sync with drawGroupLetter if hubState changes
  React.useEffect(() => {
    if (hubState?.drawGroupLetter) {
      setSelectedGroupLetter(hubState.drawGroupLetter);
    }
  }, [hubState?.drawGroupLetter]);

  // Immediately switch to World Playlist when participating in World/International tournaments
  React.useEffect(() => {
    if (isOpen && hubState) {
      audioManager.enterMatchMode('world', hubState.competitionName || 'FIFA World Tournament');
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, hubState?.competitionName, player]);

  if (!isOpen || !hubState) return null;

  const curIdx = hubState.currentFixtureIndex;
  const currentFixture = curIdx < hubState.fixtures.length ? hubState.fixtures[curIdx] : null;
  const lastCompletedFixture = curIdx > 0 ? hubState.fixtures[curIdx - 1] : null;
  const isDutyFinished = hubState.isFinished;

  const handleSimulateWithAnimation = () => {
    setIsSimulatingAnimation(true);
    setTimeout(() => {
      setIsSimulatingAnimation(false);
      onSimulateMatch();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in text-left overflow-y-auto font-pixel">
      <div className="bg-slate-900/95 border-4 border-amber-500 pixel-corners pixel-bevel-gold p-4 sm:p-6 max-w-6xl w-full shadow-[0_0_80px_rgba(245,158,11,0.3)] space-y-4 sm:space-y-5 relative overflow-hidden max-h-[96vh] flex flex-col my-auto text-slate-100">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header - National Team & Competition Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b-2 border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-10 pixel-corners overflow-hidden shadow-lg border-2 border-slate-700 shrink-0 bg-slate-800">
              <img
                src={`https://flagcdn.com/w80/${(hubState.callingNation.iso || 'gb-eng').toLowerCase()}.png`}
                alt={hubState.callingNation.code}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50" viewBox="0 0 80 50"><rect width="80" height="50" fill="%23334155"/></svg>';
                }}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 font-arcade">
                <span className="px-2 py-0.5 pixel-corners bg-amber-500/20 border border-amber-400/40 text-[9px] font-black uppercase text-amber-300 tracking-wider inline-flex items-center gap-1">
                  <Globe className="w-3 h-3 text-amber-400" />
                  {hubState.callingNation.name.toUpperCase()} {hubState.tier.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 pixel-corners bg-sky-500/20 border border-sky-400/40 text-[9px] font-mono font-bold text-sky-300">
                  {hubState.windowLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2 uppercase tracking-wide">
                {hubState.competitionName}
              </h2>
            </div>
          </div>

          {/* Quick Player Camp Stats */}
          <div className="flex items-center gap-3 bg-slate-950 border-2 border-slate-800 px-3.5 py-1.5 pixel-corners pixel-bevel-sunken shrink-0 self-start sm:self-auto font-arcade">
            <div className="text-center pr-2 border-r border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Role</span>
              <span className="text-xs font-black text-amber-400 uppercase">{hubState.playerRole}</span>
            </div>
            <div className="text-center pr-2 border-r border-slate-800">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Goals</span>
              <span className="text-xs font-black text-white font-mono">{hubState.totalGoals}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-black uppercase text-slate-400 block">Assists</span>
              <span className="text-xs font-black text-white font-mono">{hubState.totalAssists}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-slate-800 gap-1 sm:gap-2 shrink-0 overflow-x-auto custom-scrollbar pb-1 font-arcade">
          <button
            onClick={() => setActiveTab('matchday')}
            className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matchday'
                ? 'bg-amber-500/20 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Matchday Live</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'standings'
                ? 'bg-amber-500/20 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Standings & Table</span>
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'bg-amber-500/20 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule ({hubState.fixtures.length})</span>
          </button>

          {hubState.isKnockoutStageActive && (
            <button
              onClick={() => setActiveTab('knockout')}
              className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'knockout'
                  ? 'bg-amber-500/20 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Knockout Bracket</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('squad')}
            className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'squad'
                ? 'bg-amber-500/20 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Camp & Tactics</span>
          </button>
        </div>

        {/* Tab Body Scrollable Container */}
        <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1 font-pixel">
          {/* ======================================================== */}
          {/* TAB 1: MATCHDAY LIVE & INTERACTIVE MATCH CONTROLS */}
          {/* ======================================================== */}
          {activeTab === 'matchday' && (
            <div className="space-y-4">
              {/* If duty finished, show final tournament outcome */}
              {isDutyFinished ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500 pixel-corners pixel-bevel-gold p-5 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 pixel-corners pixel-bevel-raised bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 font-arcade">
                      INTERNATIONAL DUTY CONCLUDED
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase">{hubState.newsHeadline}</h3>
                    <p className="text-xs text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed font-retro">
                      {hubState.newsSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2 font-arcade">
                    <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400">Caps Earned</span>
                      <div className="text-lg font-black text-sky-400 font-mono">{hubState.capsGained}</div>
                    </div>
                    <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400">Goals Scored</span>
                      <div className="text-lg font-black text-amber-400 font-mono">{hubState.totalGoals}</div>
                    </div>
                    <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-400">Finish Stage</span>
                      <div className="text-xs font-black text-emerald-400 mt-1 uppercase">
                        {hubState.playerFinishStage || (hubState.playerQualified ? 'QUALIFIED ✅' : 'Completed')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onConcludeInternationalDuty}
                    className="w-full max-w-md py-3.5 pixel-corners pixel-bevel-gold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 mx-auto font-arcade uppercase"
                  >
                    <span>RETURN TO CLUB CAREER</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : currentFixture ? (
                /* UPCOMING FIXTURE CARD */
                <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners pixel-bevel-raised p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 pixel-corners bg-amber-500/20 border border-amber-400/40 text-[9px] font-black uppercase text-amber-300 tracking-wider font-arcade">
                      {currentFixture.stageName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 font-arcade">
                      Match {currentFixture.matchNumber} of {hubState.fixtures.length}
                    </span>
                  </div>

                  {/* Matchup Teams Banner */}
                  <div className="flex items-center justify-around py-3 bg-slate-900/60 pixel-corners pixel-bevel-sunken border-2 border-slate-800/80">
                    {/* Home Nation */}
                    <div className="text-center space-y-2 flex-1">
                      <div className="w-16 h-11 mx-auto pixel-corners overflow-hidden shadow-md border-2 border-white/20">
                        <img
                          src={`https://flagcdn.com/w80/${(currentFixture.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                          alt={currentFixture.homeNation.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-black text-xs sm:text-sm text-white uppercase">{currentFixture.homeNation.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-arcade">
                        OVR <span className="font-bold text-amber-300">{currentFixture.homeNation.ovr}</span>
                        {currentFixture.homeNation.code === hubState.callingNation.code && (
                          <span className="ml-1 text-[8px] px-1 pixel-corners bg-amber-500/30 text-amber-300 font-bold">YOU</span>
                        )}
                      </div>
                    </div>

                    <div className="px-4 text-center">
                      <div className="text-xl sm:text-2xl font-black text-amber-400 font-arcade tracking-wider">VS</div>
                      <span className="text-[8px] font-arcade text-slate-500 uppercase">International Venue</span>
                    </div>

                    {/* Away Nation */}
                    <div className="text-center space-y-2 flex-1">
                      <div className="w-16 h-11 mx-auto pixel-corners overflow-hidden shadow-md border-2 border-white/20">
                        <img
                          src={`https://flagcdn.com/w80/${(currentFixture.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                          alt={currentFixture.awayNation.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-black text-xs sm:text-sm text-white uppercase">{currentFixture.awayNation.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-arcade">
                        OVR <span className="font-bold text-amber-300">{currentFixture.awayNation.ovr}</span>
                        {currentFixture.awayNation.code === hubState.callingNation.code && (
                          <span className="ml-1 text-[8px] px-1 pixel-corners bg-amber-500/30 text-amber-300 font-bold">YOU</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Play Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-arcade">
                    {/* Interactive Key Match Button */}
                    <button
                      onClick={() => onPlayKeyMatch(currentFixture)}
                      className="py-3.5 px-4 pixel-corners pixel-bevel-raised bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer uppercase"
                    >
                      <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                      <span>PLAY INTERACTIVE KEY MATCH (QTE)</span>
                    </button>

                    {/* Fast Match Simulation Button */}
                    <button
                      onClick={handleSimulateWithAnimation}
                      disabled={isSimulatingAnimation}
                      className="py-3.5 px-4 pixel-corners pixel-bevel-raised bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border-2 border-slate-700 shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase"
                    >
                      <Activity className={`w-4 h-4 text-amber-400 ${isSimulatingAnimation ? 'animate-spin' : ''}`} />
                      <span>{isSimulatingAnimation ? 'SIMULATING FIXTURE...' : 'SIMULATE MATCH INSTANTLY'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* LAST COMPLETED FIXTURE & PLAYER PERFORMANCE BREAKDOWN */}
              {lastCompletedFixture && lastCompletedFixture.isPlayed && (
                <div className="bg-slate-950/80 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-arcade">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> RECENT MATCH RESULT & STATS
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 font-arcade">
                      {lastCompletedFixture.homeScore} - {lastCompletedFixture.awayScore}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xs sm:text-sm font-black text-white uppercase">
                        {lastCompletedFixture.homeNation.name}{' '}
                        <span className="font-mono text-amber-400">{lastCompletedFixture.homeScore}</span> -{' '}
                        <span className="font-mono text-amber-400">{lastCompletedFixture.awayScore}</span>{' '}
                        {lastCompletedFixture.awayNation.name}
                      </div>
                    </div>

                    {lastCompletedFixture.playerStats && (
                      <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 pixel-corners border border-slate-800">
                        <span className="text-emerald-300 font-bold">⚽ {lastCompletedFixture.playerStats.goals} Goals</span>
                        <span className="text-sky-300 font-bold">👟 {lastCompletedFixture.playerStats.assists} Ast</span>
                        <span className="text-amber-400 font-bold">⭐ {lastCompletedFixture.playerStats.matchRating} Rating</span>
                      </div>
                    )}
                  </div>

                  {/* Commentary Excerpts */}
                  {lastCompletedFixture.commentaryLogs && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[9px] font-black uppercase text-slate-500 font-arcade">Match Timeline</span>
                      <div className="bg-slate-900/60 pixel-corners p-2.5 max-h-28 overflow-y-auto custom-scrollbar space-y-1 text-xs text-slate-300 font-retro">
                        {lastCompletedFixture.commentaryLogs.map((log, lIdx) => (
                          <div key={lIdx} className="flex items-start gap-2">
                            <span className="font-mono text-[10px] font-bold text-amber-400 shrink-0 font-arcade">{log.minute}'</span>
                            <span className="leading-tight">{log.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: STANDINGS TABLE */}
          {/* ======================================================== */}
          {activeTab === 'standings' && (() => {
            const hasMultipleGroups = hubState.allGroups && hubState.allGroups.length > 1;
            const activeGroupObj = hubState.allGroups?.find((g) => g.groupLetter === selectedGroupLetter);
            const isViewingPlayerGroup = !hasMultipleGroups || (selectedGroupLetter === (hubState.drawGroupLetter || 'A'));
            const displayRows = isViewingPlayerGroup ? hubState.standings : (activeGroupObj?.standings || hubState.standings);

            return (
              <div className="space-y-3">
                {/* Group Selector Pills */}
                {hasMultipleGroups && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar font-arcade">
                    {hubState.allGroups!.map((g) => {
                      const isSelected = selectedGroupLetter === g.groupLetter;
                      const isPlayerGrp = g.groupLetter === hubState.drawGroupLetter;
                      return (
                        <button
                          key={g.groupLetter}
                          id={`btn-hub-group-${g.groupLetter}`}
                          onClick={() => setSelectedGroupLetter(g.groupLetter)}
                          className={`px-3 py-1.5 pixel-corners text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 uppercase ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 pixel-bevel-gold shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <span>{g.groupName}</span>
                          {isPlayerGrp && (
                            <span
                              className={`text-[8px] px-1 py-0.2 pixel-corners font-mono font-bold ${
                                isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              YOU
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners pixel-bevel-sunken overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse text-xs font-pixel">
                    <thead>
                      <tr className="bg-slate-900 border-b-2 border-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 font-arcade">
                        <th className="p-3 text-center">#</th>
                        <th className="p-3">Nation</th>
                        <th className="p-3 text-center">P</th>
                        <th className="p-3 text-center">W</th>
                        <th className="p-3 text-center">D</th>
                        <th className="p-3 text-center">L</th>
                        <th className="p-3 text-center">GF</th>
                        <th className="p-3 text-center">GA</th>
                        <th className="p-3 text-center">GD</th>
                        <th className="p-3 text-center font-black text-amber-400">Pts</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {displayRows.map((row, idx) => (
                        <tr
                          key={row.nationCode}
                          className={`${
                            row.isPlayerNation
                              ? 'bg-amber-500/15 font-black text-white border-l-4 border-l-amber-400'
                              : row.qualified
                              ? 'bg-emerald-950/20 text-slate-200'
                              : 'text-slate-400 hover:bg-slate-900/50'
                          }`}
                        >
                          <td className="p-3 text-center font-mono font-bold">{idx + 1}</td>
                          <td className="p-3 flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                              alt={row.nationCode}
                              className="w-4 h-3 object-cover pixel-corners"
                            />
                            <span className="uppercase">{row.nationName}</span>
                            {row.isPlayerNation && (
                              <span className="text-[8px] font-black uppercase text-amber-400 px-1.5 py-0.5 pixel-corners bg-amber-500/20 font-arcade">
                                YOU
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">{row.played}</td>
                          <td className="p-3 text-center font-mono">{row.wins}</td>
                          <td className="p-3 text-center font-mono">{row.draws}</td>
                          <td className="p-3 text-center font-mono">{row.losses}</td>
                          <td className="p-3 text-center font-mono">{row.goalsFor}</td>
                          <td className="p-3 text-center font-mono">{row.goalsAgainst}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-amber-400 text-sm">
                            {row.points}
                          </td>
                          <td className="p-3 text-right font-arcade">
                            {row.qualified ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 pixel-corners border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> QUALIFIED
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500 uppercase font-bold">
                                Contending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* TAB 3: FIXTURES & RESULTS SCHEDULE */}
          {/* ======================================================== */}
          {activeTab === 'fixtures' && (
            <div className="space-y-3 font-pixel">
              {hubState.fixtures.map((m) => (
                <div
                  key={m.id}
                  className={`border-2 pixel-corners pixel-bevel-raised p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    m.isPlayed
                      ? 'bg-slate-950/90 border-slate-800'
                      : 'bg-slate-900/90 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 font-arcade">
                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 pixel-corners border border-amber-500/20 shrink-0">
                      {m.stageName}
                    </span>
                    {m.windowLabel && (
                      <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                        {m.windowLabel}
                      </span>
                    )}
                  </div>

                  {/* Score or VS */}
                  <div className="flex items-center gap-3 font-black text-sm">
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-white uppercase">{m.homeNation.name}</span>
                      <img
                        src={`https://flagcdn.com/w40/${(m.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={m.homeNation.code}
                        className="w-5 h-3.5 object-cover pixel-corners"
                      />
                    </div>

                    <div className="px-3 py-1 bg-slate-900 border-2 border-slate-700 pixel-corners text-amber-300 font-arcade text-xs tracking-wider">
                      {m.isPlayed ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                    </div>

                    <div className="flex items-center gap-2 text-left">
                      <img
                        src={`https://flagcdn.com/w40/${(m.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={m.awayNation.code}
                        className="w-5 h-3.5 object-cover pixel-corners"
                      />
                      <span className="text-white uppercase">{m.awayNation.name}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 font-arcade">
                    {m.isPlayed && m.playerStats ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-slate-900 px-2.5 py-1 pixel-corners border border-slate-800 text-sky-300">
                        <span>⚽ {m.playerStats.goals}g</span>
                        <span>👟 {m.playerStats.assists}a</span>
                        <span className="text-amber-400">⭐ {m.playerStats.matchRating}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-1 pixel-corners border border-amber-400/40">
                        UPCOMING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: KNOCKOUT STAGE / BRACKET */}
          {/* ======================================================== */}
          {activeTab === 'knockout' && hubState.isKnockoutStageActive && (
            <div className="space-y-4 font-pixel">
              <div className="bg-slate-950/90 border-2 border-slate-800 pixel-corners pixel-bevel-raised p-4 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider font-arcade">
                  Tournament Knockout Bracket
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-arcade">
                  {hubState.knockoutStages.map((stg, sIdx) => {
                    const isPassed = sIdx < hubState.currentKnockoutStageIndex;
                    const isCurrent = sIdx === hubState.currentKnockoutStageIndex;
                    return (
                      <div
                        key={stg}
                        className={`p-3.5 pixel-corners pixel-bevel-raised border-2 text-center space-y-1.5 ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-400/60 shadow-lg'
                            : isPassed
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase text-slate-400">{stg}</span>
                        <div className="text-xs font-black text-white uppercase">
                          {isPassed ? 'CLEARED ✅' : isCurrent ? 'ACTIVE 🔥' : 'TBD'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SQUAD & TACTICS */}
          {/* ======================================================== */}
          {activeTab === 'squad' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-pixel">
              <div className="bg-slate-950/80 border-2 border-slate-800 pixel-corners pixel-bevel-raised p-4 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 font-arcade">
                  Tactical Structure
                </span>
                <div className="space-y-2 font-arcade text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Head Coach:</span>
                    <span className="font-bold text-white uppercase">{hubState.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Primary Formation & Style:</span>
                    <span className="font-bold text-amber-400 uppercase">{hubState.managerTactic}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Your Assigned Squad Role:</span>
                    <span className="font-bold text-emerald-400 uppercase">{hubState.playerRole}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border-2 border-slate-800 pixel-corners pixel-bevel-raised p-4 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-400 font-arcade">
                  National Honors Record
                </span>
                <div className="space-y-2 font-arcade text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Senior National Team Lock:</span>
                    <span className="font-bold text-white uppercase">
                      {player.isSeniorLocked ? `Locked to ${player.seniorNation || hubState.callingNation.name}` : 'Open Eligibility'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Total International Caps:</span>
                    <span className="font-mono font-bold text-white">{(player.internationalCaps || 0) + hubState.capsGained}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase">Total International Goals:</span>
                    <span className="font-mono font-bold text-amber-400">{(player.internationalGoals || 0) + hubState.totalGoals}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t-2 border-slate-800 shrink-0 flex items-center justify-between font-arcade">
          <button
            onClick={onClose}
            className="px-4 py-2.5 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer pixel-bevel-raised uppercase"
          >
            Minimize Camp View
          </button>

          {isDutyFinished && (
            <button
              onClick={onConcludeInternationalDuty}
              className="px-6 py-2.5 pixel-corners pixel-bevel-gold bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2 uppercase"
            >
              <span>Return to Club</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
