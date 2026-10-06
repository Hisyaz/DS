import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Shield,
  Star,
  Globe,
  Play,
  RotateCcw,
  Target,
  Flame,
  ChevronRight,
  Medal,
  CheckCircle2,
  Users,
  History,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  WorldAwardsSeasonResults,
  EuropeanGoldenBootEntry,
  BestStrikerNominee,
  EuropeanGoldenShoeEntry,
  GoldenCreatorEntry,
  DomesticLeagueAwards,
  BallonDorNominee,
  GoldenBoyNominee,
  YashinNominee,
  WorldXISelection,
} from '../types/individualAwards';
import { FlagVector } from './FlagVectors';
import { getBallonDorHistoricalRecords } from '../utils/yearlyStatisticsDatabase';
import { Top30Entry, YearlyHistoricalRecord } from '../types/yearlyAwards';
import { useLanguage } from '../context/LanguageContext';

interface WorldAwardsSummaryPanelProps {
  awardsData: WorldAwardsSeasonResults;
  isRevealed: boolean;
  mode?: 'all' | 'world_only' | 'domestic_only';
  onWatchCeremony: () => void;
  onSkipCeremony: () => void;
}

export const WorldAwardsSummaryPanel: React.FC<WorldAwardsSummaryPanelProps> = ({
  awardsData,
  isRevealed,
  mode = 'all',
  onWatchCeremony,
  onSkipCeremony,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'ballon_dor' | 'top_30' | 'world_xi' | 'golden_boot_creator' | 'european_golden_shoe' | 'golden_boy_yashin' | 'history'
  >('ballon_dor');
  const [top30Category, setTop30Category] = useState<'goals' | 'assists' | 'rating' | 'ballon_dor'>('goals');
  const [showAllBallonDorNominees, setShowAllBallonDorNominees] = useState(false);
  const [selectedHistorySeason, setSelectedHistorySeason] = useState<string | null>(null);
  const [showDecemberWorldHonorsInDomestic, setShowDecemberWorldHonorsInDomestic] = useState(false);

  const historicalRecords = React.useMemo(() => getBallonDorHistoricalRecords(), [awardsData]);

  const shouldRenderDomestic = mode === 'all' || mode === 'domestic_only';
  const shouldRenderWorld = mode === 'all' || mode === 'world_only' || (mode === 'domestic_only' && showDecemberWorldHonorsInDomestic);

  return (
    <div className="space-y-4">
      {/* 1. DOMESTIC LEAGUE AWARDS SECTION */}
      {shouldRenderDomestic && (
        <div className="bg-neutral-900/90 rounded-2xl border border-amber-500/30 p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-sm">
                🏆
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Official Domestic Honors
                </div>
                <h3 className="text-sm sm:text-base font-black text-amber-100">
                  {awardsData.domesticAwards.leagueName} Season Awards
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-[11px] font-black">
                {awardsData.domesticAwards.domesticTopScorerTrophyName}
              </span>
              {mode === 'domestic_only' && (
                <button
                  type="button"
                  onClick={() => setShowDecemberWorldHonorsInDomestic(!showDecemberWorldHonorsInDomestic)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase transition cursor-pointer flex items-center gap-1"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span>{showDecemberWorldHonorsInDomestic ? 'Hide World Gala' : 'View World Gala & Archive'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Domestic Major Honors Cards (MVP, Golden Boot, Best Young Player) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Best Player of League */}
            <div className="bg-gradient-to-r from-amber-950/70 via-neutral-950 to-neutral-950 border border-amber-400/40 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center text-black text-xl shrink-0 shadow-md">
                ⭐
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wide block">
                  Best Player of the League (MVP)
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-white truncate">
                    {awardsData.domesticAwards.bestPlayerWinner.playerName}
                  </span>
                  {awardsData.domesticAwards.bestPlayerWinner.isPlayer && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-xs text-amber-200/70">
                  {awardsData.domesticAwards.bestPlayerWinner.clubName} • Avg Rating {awardsData.domesticAwards.bestPlayerWinner.value}
                </span>
              </div>
            </div>

            {/* Domestic Top Scorer Trophy Winner */}
            <div className="bg-gradient-to-r from-amber-950/70 via-neutral-950 to-neutral-950 border border-amber-400/40 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center text-black text-xl shrink-0 shadow-md">
                ⚽
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wide block">
                  {awardsData.domesticAwards.domesticTopScorerTrophyName} Winner
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-white truncate">
                    {awardsData.domesticAwards.topScorerWinner.playerName}
                  </span>
                  {awardsData.domesticAwards.topScorerWinner.isPlayer && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-xs text-amber-200/70">
                  {awardsData.domesticAwards.topScorerWinner.clubName} • {awardsData.domesticAwards.topScorerWinner.value} Goals
                </span>
              </div>
            </div>

            {/* Best Young Player (U21) Winner */}
            {awardsData.domesticAwards.bestYoungPlayerWinner && (
              <div className="bg-gradient-to-r from-blue-950/70 via-neutral-950 to-neutral-950 border border-blue-400/40 rounded-xl p-3.5 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl shrink-0 shadow-md">
                  🌟
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-wide block">
                    Best Young Player (U21)
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-white truncate">
                      {awardsData.domesticAwards.bestYoungPlayerWinner.playerName}
                    </span>
                    {awardsData.domesticAwards.bestYoungPlayerWinner.isPlayer && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-blue-200/70">
                    {awardsData.domesticAwards.bestYoungPlayerWinner.clubName} • Age {awardsData.domesticAwards.bestYoungPlayerWinner.age || 'U21'} • Avg {awardsData.domesticAwards.bestYoungPlayerWinner.value}★
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Top 5 Domestic Leaderboards (Scorers, Assists, Ratings, Young Players) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Top 5 Scorers */}
            <div className="bg-neutral-950/80 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top 5 Goalscorers</span>
              </div>
              <div className="space-y-1.5">
                {awardsData.domesticAwards.topScorers.map((s) => (
                  <div
                    key={s.rank}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg ${
                      s.isPlayer ? 'bg-amber-500/20 font-black text-white' : 'text-neutral-300 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-bold text-amber-400/80">#{s.rank}</span>
                      <span className="truncate">{s.playerName}</span>
                      {s.isPlayer && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-emerald-400 shrink-0">{s.value}G</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Assists */}
            <div className="bg-neutral-950/80 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Top 5 Playmakers</span>
              </div>
              <div className="space-y-1.5">
                {awardsData.domesticAwards.topAssists.map((a) => (
                  <div
                    key={a.rank}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg ${
                      a.isPlayer ? 'bg-amber-500/20 font-black text-white' : 'text-neutral-300 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-bold text-amber-400/80">#{a.rank}</span>
                      <span className="truncate">{a.playerName}</span>
                      {a.isPlayer && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-sky-400 shrink-0">{a.value}A</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Average Ratings */}
            <div className="bg-neutral-950/80 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                <span>Top 5 Ratings</span>
              </div>
              <div className="space-y-1.5">
                {awardsData.domesticAwards.topRatings.map((r) => (
                  <div
                    key={r.rank}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg ${
                      r.isPlayer ? 'bg-amber-500/20 font-black text-white' : 'text-neutral-300 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-bold text-amber-400/80">#{r.rank}</span>
                      <span className="truncate">{r.playerName}</span>
                      {r.isPlayer && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-amber-300 shrink-0">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Young Players (U21) */}
            <div className="bg-neutral-950/80 border border-blue-500/20 rounded-xl p-3 space-y-2">
              <div className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-blue-400" />
                <span>Top 5 U21 Talents</span>
              </div>
              <div className="space-y-1.5">
                {(awardsData.domesticAwards.topYoungPlayers && awardsData.domesticAwards.topYoungPlayers.length > 0
                  ? awardsData.domesticAwards.topYoungPlayers
                  : []
                ).map((y) => (
                  <div
                    key={y.rank}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg ${
                      y.isPlayer ? 'bg-blue-500/25 font-black text-white' : 'text-neutral-300 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-bold text-blue-400/80">#{y.rank}</span>
                      <span className="truncate">{y.playerName}</span>
                      {y.isPlayer && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono shrink-0">
                      <span className="text-[10px] text-blue-300/70">Age {y.age || 20}</span>
                      <span className="font-black text-blue-300">{y.value}★</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Domestic League Best XI Pitch Display */}
          {awardsData.domesticAwards.leagueBestXI && (
            <div className="bg-neutral-950/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 mt-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase text-amber-300">
                    {awardsData.domesticAwards.leagueName} Best XI • Formation: {awardsData.domesticAwards.leagueBestXI.formation || '4-3-3'}
                  </span>
                </div>
                <span className="text-[11px] text-amber-400/80 font-mono">
                  {awardsData.domesticAwards.leagueBestXI.defCount} DEF • {awardsData.domesticAwards.leagueBestXI.midCount} MID • {awardsData.domesticAwards.leagueBestXI.attCount} ATT
                </span>
              </div>

              {/* Pitch Visual Board */}
              <div className="relative rounded-2xl bg-neutral-950 border border-emerald-500/30 p-4 overflow-hidden min-h-[340px]">
                <div className="absolute inset-2 border border-emerald-500/20 rounded-xl pointer-events-none" />
                <div className="absolute top-1/2 left-2 right-2 h-px bg-emerald-500/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-500/20 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                  {/* Attackers */}
                  <div className="flex justify-around items-center">
                    {awardsData.domesticAwards.leagueBestXI.attackers.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl p-0.5 shadow-md ${p.isUserPlayer ? 'bg-gradient-to-br from-emerald-400 via-amber-300 to-emerald-500 ring-2 ring-emerald-400' : 'bg-gradient-to-br from-amber-400 to-amber-700'}`}>
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-rose-400">ATT</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[11px] font-black text-amber-100 max-w-[90px] truncate">{p.name}</span>
                          {p.isUserPlayer && (
                            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Midfielders */}
                  <div className="flex justify-around items-center">
                    {awardsData.domesticAwards.leagueBestXI.midfielders.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl p-0.5 shadow-md ${p.isUserPlayer ? 'bg-gradient-to-br from-emerald-400 via-amber-300 to-emerald-500 ring-2 ring-emerald-400' : 'bg-gradient-to-br from-amber-400 to-amber-700'}`}>
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-amber-400">MID</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[11px] font-black text-amber-100 max-w-[90px] truncate">{p.name}</span>
                          {p.isUserPlayer && (
                            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Defenders */}
                  <div className="flex justify-around items-center">
                    {awardsData.domesticAwards.leagueBestXI.defenders.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl p-0.5 shadow-md ${p.isUserPlayer ? 'bg-gradient-to-br from-emerald-400 via-amber-300 to-emerald-500 ring-2 ring-emerald-400' : 'bg-gradient-to-br from-amber-400 to-amber-700'}`}>
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-blue-400">DEF</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[11px] font-black text-amber-100 max-w-[90px] truncate">{p.name}</span>
                          {p.isUserPlayer && (
                            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Goalkeeper */}
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-xl p-0.5 shadow-lg ${awardsData.domesticAwards.leagueBestXI.goalkeeper.isUserPlayer ? 'bg-gradient-to-br from-emerald-400 via-amber-300 to-emerald-500 ring-2 ring-emerald-400' : 'bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700 shadow-yellow-500/30'}`}>
                        <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-emerald-400">GK</span>
                          <span className="text-xs font-black text-amber-200">{awardsData.domesticAwards.leagueBestXI.goalkeeper.ovr}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px] font-black text-amber-100 max-w-[100px] truncate">
                          {awardsData.domesticAwards.leagueBestXI.goalkeeper.name}
                        </span>
                        {awardsData.domesticAwards.leagueBestXI.goalkeeper.isUserPlayer && (
                          <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-amber-300/70 truncate max-w-[90px]">
                        {awardsData.domesticAwards.leagueBestXI.goalkeeper.club}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. WORLD INDIVIDUAL AWARDS BANNER / SHOWCASE (GOLD & BLACK DESIGN) */}
      {shouldRenderWorld && (
        <>
      {!isRevealed ? (
        /* Hidden Ceremony Banner */
        <div className="relative rounded-3xl bg-gradient-to-r from-neutral-950 via-amber-950/60 to-neutral-950 border-2 border-amber-400/80 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/40 text-black font-black shrink-0">
              🏆
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> OFFICIAL WORLD GALA
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-50">
                WORLD INDIVIDUAL AWARDS
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 max-w-lg mt-0.5">
                European Golden Boot, Golden Creator, Golden Boy, Yashin Trophy, FIFPRO World XI, and the prestigious Ballon d'Or ceremony.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              id="watch-ceremony-btn"
              type="button"
              onClick={onWatchCeremony}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH CEREMONY</span>
            </button>
            <button
              id="skip-ceremony-banner-btn"
              type="button"
              onClick={onSkipCeremony}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-neutral-900/90 text-amber-300/80 hover:text-amber-200 text-xs font-bold border border-amber-500/30 transition flex items-center justify-center gap-1.5"
            >
              <span>SKIP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Revealed World Awards Showcase */
        <div className="rounded-3xl bg-neutral-950 border-2 border-amber-400/60 p-4 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.2)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-md shadow-amber-500/30">
                👑
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span>World Football Honors</span>
                  <span>•</span>
                  <span>{awardsData.seasonYear}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-amber-50">
                  WORLD INDIVIDUAL AWARDS ARCHIVE
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onWatchCeremony}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-amber-400/40 text-amber-300 hover:text-amber-100 text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rewatch Ceremony</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {[
              { id: 'ballon_dor', label: "Ballon d'Or", icon: '🏆' },
              { id: 'top_30', label: 'Top 30 Lists', icon: '📊' },
              { id: 'world_xi', label: `World XI (${awardsData.worldXI.formation})`, icon: '🌐' },
              { id: 'golden_boot_creator', label: 'Best Striker & Creator', icon: '⚡' },
              { id: 'european_golden_shoe', label: 'Golden Shoe', icon: '👟' },
              { id: 'golden_boy_yashin', label: 'Honors & Positions', icon: '🌟' },
              { id: 'history', label: 'History Archive', icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border truncate ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black border-amber-300 shadow-md'
                    : 'bg-neutral-900 text-amber-200/80 border-amber-500/20 hover:bg-neutral-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT: 1. BALLON D'OR */}
          {activeTab === 'ballon_dor' && (
            <div className="space-y-3 pt-2">
              <div className="bg-gradient-to-r from-amber-950 via-neutral-950 to-neutral-950 border border-amber-400/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-700 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/40 text-black font-black">
                    🏆
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      Ballon d'Or Winner • {awardsData.seasonYear}
                    </span>
                    <h4 className="text-lg font-black text-amber-50 flex items-center gap-2">
                      <span>{awardsData.ballonDor[0]?.name}</span>
                      {awardsData.ballonDor[0]?.isUserPlayer && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-amber-200/70">
                      {awardsData.ballonDor[0]?.club} • {awardsData.ballonDor[0]?.ovr} OVR • {awardsData.ballonDor[0]?.points} Voting Points
                    </span>
                    {awardsData.ballonDor[0]?.pointsBreakdown && awardsData.ballonDor[0].pointsBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {awardsData.ballonDor[0].pointsBreakdown.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllBallonDorNominees(!showAllBallonDorNominees)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-amber-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  {showAllBallonDorNominees ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Top 10 Only</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>View All 30 Nominees</span>
                    </>
                  )}
                </button>
              </div>

              {/* Nominees Table */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-amber-400/80 text-[10px] font-bold uppercase border-b border-amber-500/20">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Nominee</th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-2 text-center">OVR</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 font-medium">
                    {(showAllBallonDorNominees ? awardsData.ballonDor : awardsData.ballonDor.slice(0, 10)).map((b) => (
                      <tr
                        key={b.rank}
                        className={b.isWinner ? 'bg-amber-500/20 font-black text-amber-100' : 'text-neutral-300 hover:bg-neutral-900/50'}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {b.rank === 1 ? '🥇' : b.rank === 2 ? '🥈' : b.rank === 3 ? '🥉' : `#${b.rank}`}
                        </td>
                        <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                          <FlagVector countryCode={b.countryCode} className="w-4 h-3 rounded-sm shrink-0" />
                          <span>{b.name}</span>
                          {b.isUserPlayer && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400">{b.club}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-amber-300">{b.ovr}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400">{b.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: TOP 30 LISTS */}
          {activeTab === 'top_30' && (
            <div className="space-y-3 pt-2">
              {/* Sub-Tabs Selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'goals', label: '⚽ Top 30 Goalscorers', count: awardsData.top30Goalscorers?.length || 0 },
                  { id: 'assists', label: '🎯 Top 30 Playmakers', count: awardsData.top30AssistProviders?.length || 0 },
                  { id: 'rating', label: '⭐ Top 30 Match Ratings', count: awardsData.top30RatedPlayers?.length || 0 },
                  { id: 'ballon_dor', label: "🏆 Top 30 Ballon d'Or", count: awardsData.top30BallonDor?.length || 0 },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setTop30Category(sub.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      top30Category === sub.id
                        ? 'bg-amber-400 text-black border-amber-300 shadow'
                        : 'bg-neutral-900/80 text-amber-200/80 border-amber-500/20 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className="ml-1 text-[10px] opacity-75 font-mono">({sub.count})</span>
                  </button>
                ))}
              </div>

              {/* Top 30 Active List */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-amber-400/80 text-[10px] font-bold uppercase border-b border-amber-500/20">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-2 text-center">Pos</th>
                      <th className="py-2.5 px-3 text-right">
                        {top30Category === 'goals' ? 'Goals' : top30Category === 'assists' ? 'Assists' : top30Category === 'rating' ? 'Avg Rating' : 'Voting Pts'}
                      </th>
                      <th className="py-2.5 px-3 text-right">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 font-medium">
                    {(() => {
                      const list = (top30Category === 'goals'
                        ? awardsData.top30Goalscorers
                        : top30Category === 'assists'
                        ? awardsData.top30AssistProviders
                        : top30Category === 'rating'
                        ? awardsData.top30RatedPlayers
                        : awardsData.top30BallonDor) || [];

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-400 text-xs">
                              No statistics recorded for this category yet.
                            </td>
                          </tr>
                        );
                      }

                      return list.map((entry: Top30Entry) => (
                        <tr
                          key={entry.rank}
                          className={entry.isUserPlayer ? 'bg-amber-500/20 font-black text-amber-100' : 'text-neutral-300 hover:bg-neutral-900/50'}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <FlagVector countryCode={entry.countryCode} className="w-4 h-3 rounded-sm shrink-0" />
                              <span className="font-bold">{entry.name}</span>
                              {entry.isUserPlayer && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </div>
                            {entry.relevantTrophiesAndMerits && entry.relevantTrophiesAndMerits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {entry.relevantTrophiesAndMerits.slice(0, 2).map((m, idx) => (
                                  <span key={idx} className="text-[9px] text-amber-300/80 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-500/20">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400 truncate max-w-[140px]">{entry.teamName}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-neutral-300">{entry.mainPosition}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400">
                            {top30Category === 'goals'
                              ? `${entry.value} G`
                              : top30Category === 'assists'
                              ? `${entry.value} A`
                              : top30Category === 'rating'
                              ? entry.value.toFixed(2)
                              : `${entry.value} pts`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-neutral-400">
                            {entry.secondaryStats?.matches ?? 0}M • {entry.secondaryStats?.goals ?? 0}G • {entry.secondaryStats?.assists ?? 0}A • {(entry.secondaryStats?.avgRating ?? 0).toFixed(1)}★
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: HISTORICAL ARCHIVE */}
          {activeTab === 'history' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Historical Ballon d'Or Honor Roll</span>
                </span>
                <span className="text-xs text-amber-300/70 font-mono">
                  {historicalRecords.length} Recorded Year{historicalRecords.length === 1 ? '' : 's'}
                </span>
              </div>

              {historicalRecords.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-amber-500/20 text-neutral-400 text-xs">
                  No historical records saved yet. Complete this season to archive the first Ballon d'Or and Top 30 records into the permanent registry.
                </div>
              ) : (
                <div className="space-y-3">
                  {historicalRecords.map((rec: YearlyHistoricalRecord) => {
                    const isExpanded = selectedHistorySeason === rec.seasonYear;
                    return (
                      <div
                        key={rec.seasonYear}
                        className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl text-black font-black shadow">
                              🏆
                            </div>
                            <div>
                              <div className="text-[10px] font-black uppercase text-amber-400">
                                Year {rec.calendarYear} ({rec.seasonYear})
                              </div>
                              <h4 className="text-sm font-black text-amber-50">
                                {rec.winnerName}
                              </h4>
                              <div className="text-xs text-neutral-400">
                                {rec.winnerTeamName} • {rec.winnerOvr} OVR • {rec.winnerPoints} pts
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rec.majorTrophies && rec.majorTrophies.length > 0 && (
                              <div className="hidden md:flex items-center gap-1">
                                {rec.majorTrophies.map((t, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedHistorySeason(isExpanded ? null : rec.seasonYear)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-amber-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide Details' : 'View Full Top 30'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Top 30 Rankings for this Year */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-amber-500/20 space-y-3">
                            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                              Ballon d'Or Top 30 Rankings ({rec.seasonYear})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {rec.ballonDorRankings.slice(0, 30).map((p) => (
                                <div
                                  key={p.rank}
                                  className="p-2 rounded-lg bg-neutral-900/80 border border-amber-500/10 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[11px] font-bold text-amber-400">#{p.rank}</span>
                                    <div className="truncate">
                                      <div className="font-bold text-neutral-200 truncate">{p.name}</div>
                                      <div className="text-[10px] text-neutral-400 truncate">{p.teamName}</div>
                                    </div>
                                  </div>
                                  <span className="font-mono text-xs font-black text-amber-400 shrink-0">{p.value} pts</span>
                                </div>
                              ))}
                            </div>

                            {rec.yearlyXI && (
                              <div className="pt-2 border-t border-amber-500/10">
                                <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider mb-2">
                                  XI of the Year ({rec.yearlyXI.formation})
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {rec.yearlyXI.allEleven.map((eleven) => (
                                    <span key={eleven.id} className="px-2 py-1 rounded bg-neutral-900 border border-amber-400/20 text-xs text-amber-100">
                                      <span className="font-mono text-amber-400 font-bold mr-1">{eleven.mainPosition}</span>
                                      <span>{eleven.name}</span>
                                      <span className="text-[10px] text-neutral-400 ml-1">({eleven.club})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 2. WORLD XI */}
          {activeTab === 'world_xi' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Official Formation: {awardsData.worldXI.formation}</span>
                </span>
                <span className="text-xs text-amber-300/70 font-mono">
                  {awardsData.worldXI.defCount} DEF • {awardsData.worldXI.midCount} MID • {awardsData.worldXI.attCount} ATT
                </span>
              </div>

              {/* Pitch Visual Board */}
              <div className="relative rounded-2xl bg-neutral-950 border border-amber-500/40 p-4 overflow-hidden min-h-[340px]">
                <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />
                <div className="absolute top-1/2 left-2 right-2 h-px bg-amber-500/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-amber-500/20 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                  {/* Attackers */}
                  <div className="flex justify-around items-center">
                    {awardsData.worldXI.attackers.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md">
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-rose-400">ATT</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Midfielders */}
                  <div className="flex justify-around items-center">
                    {awardsData.worldXI.midfielders.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md">
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-amber-400">MID</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Defenders */}
                  <div className="flex justify-around items-center">
                    {awardsData.worldXI.defenders.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md">
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-blue-400">DEF</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                      </div>
                    ))}
                  </div>

                  {/* Goalkeeper */}
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700 p-0.5 shadow-lg shadow-yellow-500/30">
                        <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-emerald-400">GK</span>
                          <span className="text-xs font-black text-amber-200">{awardsData.worldXI.goalkeeper.ovr}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px] font-black text-amber-100 max-w-[100px] truncate">
                          {awardsData.worldXI.goalkeeper.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-amber-300/70 truncate max-w-[90px]">
                        {awardsData.worldXI.goalkeeper.club}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. BEST STRIKER & GOLDEN CREATOR */}
          {activeTab === 'golden_boot_creator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Best Striker of the Year */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Best Striker of the Year</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70 font-mono">Attacking Score</span>
                </div>
                <div className="space-y-2">
                  {(awardsData.bestStriker || awardsData.europeanGoldenBoot).map((entry: any) => (
                    <div
                      key={entry.rank}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        entry.isWinner
                          ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                          : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{entry.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {entry.club} • {entry.leagueName || entry.subPosition || 'ST'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-amber-300">
                          {entry.attackingScore ?? entry.weightedPoints} pts
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {entry.goals}G {entry.assists ? `• ${entry.assists}A` : ''} {entry.avgRating ? `• ${entry.avgRating.toFixed(1)}★` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Creator */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Golden Creator</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70 font-mono">Weighted Assists</span>
                </div>
                <div className="space-y-2">
                  {awardsData.goldenCreator.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        entry.isWinner
                          ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                          : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{entry.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{entry.club} • {entry.leagueName}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-amber-300">{entry.weightedPoints} pts</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{entry.assists} × {entry.leagueFactor.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. EUROPEAN GOLDEN SHOE */}
          {activeTab === 'european_golden_shoe' && (
            <div className="space-y-3 pt-2">
              <div className="bg-gradient-to-r from-neutral-950 via-amber-950/40 to-neutral-950 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                    👟
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-50">European Golden Shoe (Soulier d'Or)</h4>
                    <p className="text-xs text-amber-200/70">
                      Awarded at European Season Conclusion • Domestic League Goals × Dynamic UEFA Association Coefficient (2.0 / 1.5 / 1.0)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/90 text-amber-400/80 text-[10px] font-bold uppercase border-b border-amber-500/20">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-3">Club & League</th>
                      <th className="py-2.5 px-2 text-center">League Goals</th>
                      <th className="py-2.5 px-2 text-center">UEFA Coeff</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 font-medium">
                    {awardsData.europeanGoldenShoe && awardsData.europeanGoldenShoe.length > 0 ? (
                      awardsData.europeanGoldenShoe.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={entry.isWinner ? 'bg-amber-500/20 font-black text-amber-100' : 'text-neutral-300 hover:bg-neutral-900/50'}
                        >
                          <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                            {entry.rank === 1 ? '🥇' : `#${entry.rank}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{entry.name}</span>
                              {entry.isUserPlayer && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400">
                            {entry.club} • <span className="text-amber-300/80">{entry.leagueName}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-200">{entry.goals}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-amber-400/80">×{entry.coefficient.toFixed(1)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-300 text-sm">
                            {entry.points.toFixed(1)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-neutral-500 text-xs">
                          European Golden Shoe data will finalize upon conclusion of the European domestic leagues.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. GOLDEN BOY & YASHIN TROPHY */}
          {activeTab === 'golden_boy_yashin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Golden Boy */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <span>🌟</span>
                    <span>Golden Boy (U21)</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70 font-mono">Podium</span>
                </div>
                <div className="space-y-2">
                  {awardsData.goldenBoy.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        entry.isWinner
                          ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                          : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{entry.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{entry.club} • Age {entry.age}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-amber-300">{entry.ovr} OVR</div>
                        <div className="text-[10px] text-amber-400/80 font-bold">{entry.tier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yashin Trophy */}
              <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <span>🧤</span>
                    <span>Yashin Trophy (Goalkeepers)</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70 font-mono">World XI Starter</span>
                </div>
                <div className="space-y-2">
                  {awardsData.yashinTrophy.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        entry.isWinner
                          ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                          : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black truncate">{entry.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{entry.club} • {entry.ovr} OVR</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-amber-300">{entry.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Defender */}
              {awardsData.bestDefender && awardsData.bestDefender.length > 0 && (
                <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Best Defender of the Year</span>
                    </div>
                    <span className="text-[10px] text-amber-300/70 font-mono">Top 5</span>
                  </div>
                  <div className="space-y-2">
                    {awardsData.bestDefender.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          entry.isWinner
                            ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                            : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{entry.name}</div>
                            <div className="text-[10px] text-neutral-400 truncate">{entry.club} • {entry.ovr} OVR</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-amber-300">{entry.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Midfielder */}
              {awardsData.bestMidfielder && awardsData.bestMidfielder.length > 0 && (
                <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>Best Midfielder of the Year</span>
                    </div>
                    <span className="text-[10px] text-amber-300/70 font-mono">Top 5</span>
                  </div>
                  <div className="space-y-2">
                    {awardsData.bestMidfielder.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          entry.isWinner
                            ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                            : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{entry.name}</div>
                            <div className="text-[10px] text-neutral-400 truncate">{entry.club} • {entry.ovr} OVR</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-amber-300">{entry.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Attacker */}
              {awardsData.bestAttacker && awardsData.bestAttacker.length > 0 && (
                <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Best Forward of the Year</span>
                    </div>
                    <span className="text-[10px] text-amber-300/70 font-mono">Top 5</span>
                  </div>
                  <div className="space-y-2">
                    {awardsData.bestAttacker.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          entry.isWinner
                            ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                            : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{entry.name}</div>
                            <div className="text-[10px] text-neutral-400 truncate">{entry.club} • {entry.ovr} OVR</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-amber-300">{entry.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Manager */}
              {awardsData.bestManager && awardsData.bestManager.length > 0 && (
                <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <span>👔</span>
                      <span>World Best Coach of the Year</span>
                    </div>
                    <span className="text-[10px] text-amber-300/70 font-mono">Top 5</span>
                  </div>
                  <div className="space-y-2">
                    {awardsData.bestManager.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          entry.isWinner
                            ? 'bg-amber-950/60 border-amber-400 text-amber-100 font-bold'
                            : 'bg-neutral-900/60 border-amber-500/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-amber-400">#{entry.rank}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{entry.name}</div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {entry.club} • {entry.trophiesWon.join(', ') || 'Finalist'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-amber-300">{entry.points.toFixed(1)} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
