import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import {
  checkLegendBenchmarksProgress,
  getStoredChampionPoints,
  modifyStoredChampionPoints,
  setStoredChampionPoints,
  LegendCareerBenchmarkStatus,
  LEGEND_HISTORIC_RECORDS,
} from '../utils/legendCareerSystem';
import { useTestMode } from '../utils/testModeSystem';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  X,
  Target,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
  Star,
  Activity,
} from 'lucide-react';

interface LegendObjectiveTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  showToast: (msg: string) => void;
}

export const LegendObjectiveTrackerModal: React.FC<LegendObjectiveTrackerModalProps> = ({
  isOpen,
  onClose,
  player,
  showToast,
}) => {
  const { isTestMode } = useTestMode();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'records' | 'career_stats'>('records');
  const [benchmarkStatus, setBenchmarkStatus] = useState<LegendCareerBenchmarkStatus>(() =>
    checkLegendBenchmarksProgress(player)
  );

  useEffect(() => {
    if (isOpen) {
      setBenchmarkStatus(checkLegendBenchmarksProgress(player));
    }
  }, [isOpen, player]);

  if (!isOpen) return null;

  const handleModifyChampionPoints = (delta: number) => {
    const next = modifyStoredChampionPoints(delta);
    setBenchmarkStatus(checkLegendBenchmarksProgress(player));
    showToast(`${delta >= 0 ? '+' : ''}${delta} Champion Point (${next} Total)`);
  };

  const handleResetChampionPoints = () => {
    setStoredChampionPoints(0);
    setBenchmarkStatus(checkLegendBenchmarksProgress(player));
    showToast('Reset Champion Points to default');
  };

  // Test Mode quick record boosters for playtime testing
  const handleBoostRecord = (recordId: string, delta: number) => {
    if (!player.careerHistory) {
      player.careerHistory = {} as any;
    }
    const ch = player.careerHistory as any;
    if (recordId === 'calendar_year_goals_2012') {
      ch.calendarYearGoalsRecord = (ch.calendarYearGoalsRecord || 0) + delta;
    } else if (recordId === 'single_club_goals') {
      ch.singleClubGoalsRecord = (ch.singleClubGoalsRecord || 0) + delta;
      ch.totalGoals = (ch.totalGoals || 0) + delta;
    } else if (recordId === 'la_liga_goals') {
      ch.laLigaGoals = (ch.laLigaGoals || 0) + delta;
      ch.totalGoals = (ch.totalGoals || 0) + delta;
    } else if (recordId === 'la_liga_assists') {
      ch.laLigaAssists = (ch.laLigaAssists || 0) + delta;
      ch.totalAssists = (ch.totalAssists || 0) + delta;
    } else if (recordId === 'la_liga_hat_tricks') {
      ch.laLigaHatTricks = (ch.laLigaHatTricks || 0) + delta;
    }
    setBenchmarkStatus(checkLegendBenchmarksProgress(player));
    showToast(`Test Boost: +${delta} to ${recordId}`);
  };

  const totalBeaten = benchmarkStatus.totalSurpassed + benchmarkStatus.totalHistoricRecordsSurpassed;
  const totalAvailable = benchmarkStatus.totalRequired + benchmarkStatus.totalHistoricRecords;
  const runCompletionPercentage = Math.min(100, Math.round((totalBeaten / totalAvailable) * 100));

  return (
    <div
      id="legend-objective-tracker-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border-2 border-cyan-500/70 rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-3.5 text-left relative overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase font-mono">
                  PLAY AS A LEGEND
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                  ⭐ {benchmarkStatus.championPointsEarned} Champion Points
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Legend Objective & Record Tracker
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Banner: Surpassed Count & Champion Points Explanation */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-cyan-950/40 to-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Surpass Immortals • Complete the Legend Run</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Overcome all legendary world records & silverware benchmarks during your career to claim the throne.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/90 border border-amber-400/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Records & Benchmarks</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-300">
                {totalBeaten} / {totalAvailable} ({runCompletionPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Records / Benchmarks / Career Overview) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-100'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Records ({benchmarkStatus.totalHistoricRecordsSurpassed}/{benchmarkStatus.totalHistoricRecords})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'benchmarks'
                ? 'bg-cyan-500 text-slate-950 shadow-md scale-100'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Benchmarks ({benchmarkStatus.totalSurpassed}/{benchmarkStatus.totalRequired})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('career_stats')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'career_stats'
                ? 'bg-blue-600 text-white shadow-md scale-100'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Supporting Silverware ({benchmarkStatus.supportingObjectives.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto pr-1 custom-scrollbar flex-1 space-y-4">
          
          {/* ================= 1. RECORDS TAB ================= */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Historical Records to Overcome During Career</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {benchmarkStatus.totalHistoricRecordsSurpassed} of {benchmarkStatus.totalHistoricRecords} Broken
                </span>
              </div>

              <div className="space-y-2.5">
                {benchmarkStatus.historicRecords.map((rec) => {
                  const pct = Math.min(100, Math.round((rec.current / rec.target) * 100));
                  const remaining = Math.max(0, rec.target - rec.current);

                  return (
                    <div
                      key={rec.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        rec.surpassed
                          ? 'bg-amber-950/30 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Record Header Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{rec.surpassed ? '👑' : '⚡'}</span>
                            <h5 className="text-xs sm:text-sm font-black text-white">{rec.label}</h5>
                            {rec.year && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-400/50 text-amber-300 font-bold">
                                {rec.year}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {rec.description}
                          </p>
                          {rec.context && (
                            <span className="text-[10px] font-mono text-cyan-400/80 block">
                              Reference: {rec.context}
                            </span>
                          )}
                        </div>

                        {/* Record Status & Numbers */}
                        <div className="flex items-center gap-4 shrink-0 text-right self-end sm:self-center">
                          <div className="space-y-0.5">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">
                              Legend Record
                            </div>
                            <div className="text-xs font-black font-mono text-amber-300">
                              {rec.target}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Your Career
                            </div>
                            <div
                              className={`text-sm sm:text-base font-black font-mono ${
                                rec.surpassed ? 'text-amber-300 drop-shadow' : 'text-white'
                              }`}
                            >
                              {rec.current}
                            </div>
                          </div>

                          <div className="w-28 flex justify-end">
                            {rec.surpassed ? (
                              <div className="px-2.5 py-1 rounded-xl bg-amber-950 border border-amber-400 text-amber-300 text-[10px] font-black uppercase font-mono flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                <span>RECORD BROKEN</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-black uppercase font-mono flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-500" />
                                <span>{remaining} TO BEAT</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar & Test Controls */}
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60">
                        <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rec.surpassed
                                ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                          {pct}%
                        </span>

                        {isTestMode && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleBoostRecord(rec.id, 5)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold font-mono border border-slate-700 cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBoostRecord(rec.id, 50)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold font-mono border border-slate-700 cursor-pointer"
                            >
                              +50
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBoostRecord(rec.id, rec.target)}
                              className="px-2 py-0.5 rounded bg-amber-900 hover:bg-amber-800 text-amber-100 text-[10px] font-bold font-mono border border-amber-500 cursor-pointer"
                            >
                              Break Record
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. BENCHMARKS TAB ================= */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Required Legend Benchmarks (7 Official Records)</span>
              </h4>

              <div className="space-y-2">
                {benchmarkStatus.requiredObjectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      obj.surpassed
                        ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          {obj.label}
                        </span>
                        {obj.isOfficialTop5Requirement && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                            Top 5 Leagues
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {obj.description}
                      </p>
                    </div>

                    {/* Benchmark vs Career Comparison */}
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          Legend Target
                        </div>
                        <div className="text-xs font-black font-mono text-slate-300">
                          {obj.target}+
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Your Career
                        </div>
                        <div
                          className={`text-sm sm:text-base font-black font-mono ${
                            obj.surpassed ? 'text-emerald-300 drop-shadow' : 'text-white'
                          }`}
                        >
                          {obj.current}
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="w-24 flex justify-end">
                        {obj.surpassed ? (
                          <div className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-black uppercase font-mono flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>+1 PT BEATEN</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-black uppercase font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>IN PROGRESS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 3. SUPPORTING SILVERWARE TAB ================= */}
          {activeTab === 'career_stats' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Supporting Career Statistics & Silverware</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benchmarkStatus.supportingObjectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                      obj.surpassed
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{obj.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">Target: {obj.target}+ {obj.unit}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{obj.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-base font-black font-mono ${
                          obj.surpassed ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        {obj.current}
                      </span>
                      <span className="text-[10px] block font-mono text-slate-500">
                        {obj.surpassed ? 'COMPLETED' : 'TRACKING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Test Mode Interactive Bar for Champion Points */}
        {isTestMode && (
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <span className="font-mono font-black text-amber-300 flex items-center gap-1">
              ⚙️ TEST MODE: Champion Points & Overrides
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleModifyChampionPoints(1)}
                className="px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 border border-amber-400 text-amber-200 font-bold cursor-pointer"
              >
                +1 Champion Pt
              </button>
              <button
                type="button"
                onClick={() => handleModifyChampionPoints(-1)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
              >
                -1 Champion Pt
              </button>
              <button
                type="button"
                onClick={handleResetChampionPoints}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
