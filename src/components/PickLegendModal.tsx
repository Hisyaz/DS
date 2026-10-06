import React, { useState, useEffect } from 'react';
import {
  FIRST_LEGEND_DATA,
  LEGEND_HISTORIC_RECORDS,
  getStoredGlobalIconPoints,
  setStoredGlobalIconPoints,
  modifyStoredGlobalIconPoints,
  getStoredChampionPoints,
  modifyStoredChampionPoints,
  createFirstLegendPlayer,
} from '../utils/legendCareerSystem';
import { LegendPixelArtCharacter } from './LegendPixelArtCharacter';
import { PlayerCardData } from '../types';
import { useTestMode } from '../utils/testModeSystem';
import {
  Trophy,
  Crown,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Zap,
  DollarSign,
  Shield,
  Play,
} from 'lucide-react';

interface PickLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLegendCareer: (player: PlayerCardData) => void;
  showToast: (msg: string) => void;
}

export const PickLegendModal: React.FC<PickLegendModalProps> = ({
  isOpen,
  onClose,
  onStartLegendCareer,
  showToast,
}) => {
  const { isTestMode, setTestMode } = useTestMode();
  const [globalIconPoints, setGlobalIconPointsState] = useState<number>(() => getStoredGlobalIconPoints());
  const [championPoints, setChampionPointsState] = useState<number>(() => getStoredChampionPoints());
  const [selectedCabinetTab, setSelectedCabinetTab] = useState<'records' | 'overview' | 'club' | 'international' | 'youth' | 'individual' | 'economics' | 'supporting_stats'>('records');
  const [showFullCabinetModal, setShowFullCabinetModal] = useState<boolean>(false);
  const [mainLeftTab, setMainLeftTab] = useState<'trophies' | 'records'>('trophies');

  const REQUIRED_POINTS = 1000;
  const isUnlocked = globalIconPoints >= REQUIRED_POINTS;

  // Sync points when opened or test mode toggles
  useEffect(() => {
    if (isOpen) {
      setGlobalIconPointsState(getStoredGlobalIconPoints());
      setChampionPointsState(getStoredChampionPoints());
    }
  }, [isOpen, isTestMode]);

  if (!isOpen) return null;

  const legend = FIRST_LEGEND_DATA;

  const handleStartCareer = () => {
    if (!isUnlocked) {
      showToast(`🔒 Locked: 1,000 Global Icon Points required! (Current: ${globalIconPoints})`);
      return;
    }
    const startingPlayer = createFirstLegendPlayer();
    showToast(`🌟 Starting Legend Career: ${legend.title}!`);
    onStartLegendCareer(startingPlayer);
  };

  const handleSetPoints = (pts: number) => {
    const updated = setStoredGlobalIconPoints(pts);
    setGlobalIconPointsState(updated);
    showToast(`Updated Global Icon Points to ${updated}`);
  };

  const handleModifyPoints = (delta: number) => {
    const updated = modifyStoredGlobalIconPoints(delta);
    setGlobalIconPointsState(updated);
    showToast(`${delta >= 0 ? '+' : ''}${delta} Global Icon Points (${updated} Total)`);
  };

  const handleModifyChampionPoints = (delta: number) => {
    const updated = modifyStoredChampionPoints(delta);
    setChampionPointsState(updated);
    showToast(`${delta >= 0 ? '+' : ''}${delta} Champion Point (${updated} Total)`);
  };

  return (
    <div
      id="pick-legend-modal-root"
      className="fixed inset-0 z-50 bg-[#020617] text-white flex flex-col overflow-y-auto overscroll-y-auto font-sans select-none"
    >
      {/* Background Atmospheric Lighting & Starfield Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-radial from-blue-950/40 via-[#030712]/95 to-[#020617]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[260px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div
        className={`relative z-10 w-full max-w-6xl mx-auto flex flex-col min-h-screen px-3 sm:px-6 py-3 sm:py-5 transition-all duration-500 justify-between ${
          !isUnlocked ? 'filter grayscale-[90%] contrast-[110%]' : ''
        }`}
      >
        {/* ================= TOP CONTROLS TOOLBAR ================= */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFullCabinetModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Trophy Cabinet</span>
            </button>
          </div>

          {/* Unlock State Badge & Test Mode Trigger */}
          <div className="flex items-center gap-2">
            {isTestMode ? (
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-400/70 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold text-amber-300">
                <span>TEST MODE ACTIVE</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTestMode(true)}
                className="text-[10px] text-slate-400 hover:text-slate-200 uppercase font-mono tracking-widest px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                Test Controls
              </button>
            )}

            <div
              className={`px-3 py-1 rounded-xl text-xs font-black font-mono uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
                isUnlocked
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/90 border-rose-500/60 text-rose-300'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>UNLOCKED ({globalIconPoints} PTS)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>LOCKED ({globalIconPoints}/{REQUIRED_POINTS} PTS)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= HERO HEADER: PLAYER TITLE & ATTRIBUTES ================= */}
        <div className="text-center space-y-2 py-3">
          {/* Subtitle Accent */}
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono font-black text-xs sm:text-sm tracking-[0.25em] uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            <Crown className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>LEGEND PROFILE • ICONIC MASTERCLASS</span>
            <Crown className="w-3.5 h-3.5 fill-current text-amber-400" />
          </div>

          {/* Main Hero Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] leading-tight px-2">
            {legend.subtitle}
          </h1>

          {/* Compact Responsive Meta Chips Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-4xl mx-auto">
            {/* Core Ratings: Age 16, OVR 80, POT 99 */}
            <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/80 text-xs font-mono font-black text-cyan-300 shadow-sm">
              AGE <span className="text-white font-extrabold ml-1">{legend.startingAge}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/80 text-xs font-mono font-black text-cyan-300 shadow-sm">
              START OVR <span className="text-white font-extrabold ml-1">{legend.startingOvr}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-amber-400/80 text-xs font-mono font-black text-amber-300 shadow-sm">
              POTENTIAL <span className="text-white font-extrabold ml-1">{legend.fixedPotential}</span>
            </div>

            {/* Starting Club: FC Barcelona */}
            <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/60 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-slate-400">Team:</span>
              <span className="text-cyan-300 font-extrabold">{legend.startingClub}</span>
              <span className="text-[10px] text-slate-400">({legend.clubCountry})</span>
            </div>

            {/* Dual Nationality: Argentinean (ARG) & Spanish (ESP) */}
            <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/60 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <span className="text-sm">🇦🇷</span>
              <span className="text-white font-extrabold">ARG</span>
              <span className="text-slate-500">•</span>
              <span className="text-sm">🇪🇸</span>
              <span className="text-white font-extrabold">ESP</span>
              <span className="text-[10px] text-cyan-400 font-mono font-black uppercase">(Dual)</span>
            </div>

            {/* Position, Sub-Position, Playstyle, Preferred Foot */}
            <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-200">
              <span className="text-slate-400">Position:</span> <span className="text-white font-extrabold">ATT (RW)</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-200">
              <span className="text-slate-400">Playstyle:</span> <span className="text-cyan-300 font-extrabold">Inverted</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-200">
              <span className="text-slate-400">Foot:</span> <span className="text-white font-extrabold">Left (4★ WF)</span>
            </div>
          </div>
        </div>

        {/* ================= CENTER GRID: 3 BALANCED COLUMNS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 my-2 items-stretch">
          
          {/* ================= LEFT 4/12 COLS: TROPHIES & HONORS OR HISTORIC RECORDS ================= */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 justify-between">
            
            {/* Top Sub-Tab Switcher (Trophies vs Records) */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setMainLeftTab('trophies')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mainLeftTab === 'trophies'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Honors</span>
              </button>
              <button
                type="button"
                onClick={() => setMainLeftTab('records')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mainLeftTab === 'records'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Records (5)</span>
              </button>
            </div>

            {mainLeftTab === 'records' ? (
              /* HISTORIC RECORDS TO OVERCOME */
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-amber-500/50 p-3 sm:p-3.5 shadow-lg flex-1 space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>HISTORIC RECORDS</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold">
                      To Overcome
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {LEGEND_HISTORIC_RECORDS.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2 rounded-xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/60 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-white text-[11px] truncate">
                            {rec.label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-400/60 text-amber-300 font-mono font-black text-[11px] shrink-0">
                            {rec.target} {rec.unit.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {rec.context}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. INTERNATIONAL (ARGENTINA) */}
                <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-cyan-500/40 p-3 sm:p-3.5 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-black text-xs uppercase tracking-wider">
                      <span>🇦🇷</span>
                      <span>INTERNATIONAL</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                      Argentina Senior
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🏆</span>
                        <span className="font-bold text-slate-100 truncate">FIFA World Cup</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        1×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🥈</span>
                        <span className="font-bold text-slate-100 truncate">Finalissima Intercontinental</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        1×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🏆</span>
                        <span className="font-bold text-slate-100 truncate">Copa América</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        2×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🥇</span>
                        <span className="font-bold text-slate-100 truncate">Olympic Gold Medal</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        1×
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. CLUB TROPHIES */}
                <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-cyan-500/40 p-3 sm:p-3.5 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-black text-xs uppercase tracking-wider">
                      <span>🛡️</span>
                      <span>CLUB TROPHIES</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                      Official Records
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🏆</span>
                        <span className="font-bold text-slate-100 truncate">UEFA Champions League</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        4×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🛡️</span>
                        <span className="font-bold text-slate-100 truncate">Top-5 European League Titles</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        12×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🏆</span>
                        <span className="font-bold text-slate-100 truncate">Domestic Cups</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        7×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🛡️</span>
                        <span className="font-bold text-slate-100 truncate">Domestic Super Cups</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        8×
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. INDIVIDUAL HONORS */}
                <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-amber-500/40 p-3 sm:p-3.5 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono font-black text-xs uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>INDIVIDUAL AWARDS</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold">
                      All-Time Bests
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">⚽</span>
                        <span className="font-bold text-amber-200 truncate">Ballon d'Or</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-400/60 text-amber-300 font-mono font-black text-xs shrink-0">
                        8×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">👟</span>
                        <span className="font-bold text-amber-200 truncate">European Golden Shoe</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-400/60 text-amber-300 font-mono font-black text-xs shrink-0">
                        6×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🌟</span>
                        <span className="font-bold text-slate-100 truncate">FIFPRO World 11</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs shrink-0">
                        17×
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">⭐</span>
                        <span className="font-bold text-amber-200 truncate">World Cup Golden Ball</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-400/60 text-amber-300 font-mono font-black text-xs shrink-0">
                        2×
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ================= CENTER 4/12 COLS: 2D PIXEL ART CARD PRESENTATION ================= */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[360px]">
            {/* Cinematic Glowing Outer Frame */}
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-slate-950 via-[#050c1e] to-slate-950 border-2 border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.3)] p-4 flex flex-col items-center justify-between relative overflow-hidden">
              {/* Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Top Badge on Card */}
              <div className="w-full flex items-center justify-between z-10 px-1">
                <span className="text-[10px] font-mono font-black text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40">
                  CARD #01
                </span>
                <span className="text-[10px] font-mono font-black text-amber-300 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  DRIBBLE 99
                </span>
              </div>

              {/* Pixel Art Footballer Artwork */}
              <div className="my-auto py-2 flex items-center justify-center">
                <LegendPixelArtCharacter isLocked={!isUnlocked} />
              </div>

              {/* Bottom Card Footer */}
              <div className="w-full text-center z-10 pt-1 border-t border-cyan-500/20">
                <span className="text-xs font-mono font-black text-cyan-300 tracking-wider uppercase">
                  {legend.title}
                </span>
              </div>

              {/* Locked Overlay Badge */}
              {!isUnlocked && (
                <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-rose-500/80 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] mb-3">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    LOCKED LEGEND
                  </h3>
                  <p className="text-xs sm:text-sm font-extrabold text-cyan-300 font-mono mt-1">
                    1,000 GLOBAL ICON POINTS REQUIRED
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 max-w-[220px]">
                    Current Progress: <strong className="text-white">{globalIconPoints}</strong> / 1,000 Points
                  </p>
                  {/* Progress Bar */}
                  <div className="w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (globalIconPoints / REQUIRED_POINTS) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT 4/12 COLS: CAREER BENCHMARK STATS ================= */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-cyan-500/40 p-3.5 sm:p-4 shadow-lg flex-1 flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 font-mono">
                  CAREER RECORD STATS
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  OFFICIAL BENCHMARK
                </span>
              </div>

              {/* 4 Stat Modules */}
              <div className="space-y-2.5 my-auto">
                
                {/* 1. MATCHES */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 text-base">
                      🏟️
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Matches
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        948 Club • 191 Argentina
                      </span>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight shrink-0">
                    {legend.careerStats.matches.toLocaleString()}
                  </span>
                </div>

                {/* 2. GOALS */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 text-base">
                      ⚽
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Goals
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        765 Club • 112 Argentina
                      </span>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-tight shrink-0">
                    {legend.careerStats.goals}
                  </span>
                </div>

                {/* 3. ASSISTS */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 text-base">
                      👟
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assists
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        362 Club • 58 Argentina
                      </span>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-blue-300 tracking-tight shrink-0">
                    {legend.careerStats.assists}
                  </span>
                </div>

                {/* 4. MVP AWARDS */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 text-base">
                      🏅
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        MVP Awards
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        All-Time Career Best
                      </span>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 tracking-tight shrink-0">
                    {legend.careerStats.mvpAwards}
                  </span>
                </div>

              </div>

              {/* Tournament Summary */}
              <div className="pt-2.5 mt-2 border-t border-cyan-500/20 text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Major Finals: 65 Matches</span>
                <span>•</span>
                <span>27 Tournament Goals</span>
              </div>

            </div>
          </div>

        </div>

        {/* ================= BOTTOM ROW: 2 CARDS (ECONOMICS ESTIMATED & UNIQUE PERK) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-2">
          
          {/* 1. ECONOMICS (ESTIMATED) */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-cyan-500/40 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-300 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>ECONOMICS (ESTIMATED)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Career Financial Record</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Net Worth */}
              <div className="bg-slate-950/90 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2">
                <div className="text-base sm:text-lg shrink-0">💰</div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block truncate">Net Worth</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-400 block truncate">
                    {legend.economics.netWorth}
                  </span>
                </div>
              </div>

              {/* Career Salary */}
              <div className="bg-slate-950/90 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2">
                <div className="text-base sm:text-lg shrink-0">💵</div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block truncate">Career Salary</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-white block truncate">
                    {legend.economics.careerSalary}
                  </span>
                </div>
              </div>

              {/* Highest Salary */}
              <div className="bg-slate-950/90 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2">
                <div className="text-base sm:text-lg shrink-0">📈</div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block truncate">Peak Salary</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-cyan-300 block truncate">
                    {legend.economics.highestAnnualSalary}/yr
                  </span>
                </div>
              </div>

              {/* Sponsors */}
              <div className="bg-slate-950/90 border border-slate-800 p-2 sm:p-2.5 rounded-xl flex items-center gap-2">
                <div className="text-base sm:text-lg shrink-0">🤝</div>
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block truncate">Sponsors</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-cyan-200 block truncate">
                    {legend.economics.sponsors}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. UNIQUE PERK: MAGNETIC FEET */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-cyan-500/40 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5 mb-2.5 relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-300 font-mono">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                <span>UNIQUE LEGEND PERK</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                STARTING DRIBBLE: 99
              </span>
            </div>

            <div className="flex items-center gap-3 relative z-10 my-auto">
              {/* Glowing Cleat Icon */}
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 border border-cyan-300 flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_15px_rgba(6,182,212,0.6)] shrink-0">
                👟
              </div>

              <div className="space-y-1 text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 uppercase">
                    PERK
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate">
                    {legend.perk.name}
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug line-clamp-2">
                  {legend.perk.tagline}
                </p>
                <div className="text-[11px] sm:text-xs font-black text-cyan-300 flex items-center gap-1 pt-0.5">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">2× Success Rate on all Dribbles & Take-Ons</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= FOOTER ACTIONS BAR ================= */}
        <div className="w-full flex flex-col items-center justify-center gap-2 pt-3 pb-1 border-t border-slate-800/80">
          <div className="w-full flex items-center justify-between gap-3 max-w-2xl">
            {/* Previous Legend */}
            <button
              type="button"
              disabled={true}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-500 text-xs font-black uppercase tracking-wider flex items-center gap-1 opacity-50 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">PREVIOUS</span>
            </button>

            {/* START CAREER (MAIN CTA) */}
            <button
              id="start-legend-career-btn"
              type="button"
              onClick={handleStartCareer}
              disabled={!isUnlocked}
              className={`flex-1 max-w-md py-3 sm:py-3.5 px-6 rounded-full font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg ${
                isUnlocked
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:scale-[1.02] active:scale-95 border-2 border-cyan-200'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START LEGEND CAREER</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>1,000 ICON POINTS REQUIRED</span>
                </>
              )}
            </button>

            {/* Next Legend */}
            <button
              type="button"
              disabled={true}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-500 text-xs font-black uppercase tracking-wider flex items-center gap-1 opacity-50 cursor-not-allowed"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-[10px] sm:text-xs font-mono font-bold text-cyan-400/80 uppercase tracking-wider mt-0.5">
            CHALLENGE: SURPASS THE IMMORTAL RECORDS OF FOOTBALL HISTORY
          </p>
        </div>

        {/* ================= TEST MODE CONTROLS BAR ================= */}
        {isTestMode && (
          <div className="w-full bg-slate-900/95 border border-amber-500/50 rounded-2xl p-2.5 mt-2 shadow-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-amber-400">
                ⚙️ TEST CONTROLS:
              </span>
              <span className="text-slate-300">
                Icon Pts: <strong className="text-cyan-300 font-mono">{globalIconPoints}</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Champion Pts: <strong className="text-amber-300 font-mono">{championPoints}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetPoints(1000)}
                className="px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 border border-emerald-500 text-emerald-200 font-bold cursor-pointer"
              >
                Unlock (1,000 Pts)
              </button>
              <button
                type="button"
                onClick={() => handleSetPoints(0)}
                className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-200 font-bold cursor-pointer"
              >
                Lock (0 Pts)
              </button>
              <button
                type="button"
                onClick={() => handleModifyPoints(250)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
              >
                +250 Pts
              </button>
              <button
                type="button"
                onClick={() => handleModifyPoints(-250)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
              >
                -250 Pts
              </button>
              <button
                type="button"
                onClick={() => handleModifyChampionPoints(1)}
                className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-200 font-bold cursor-pointer"
              >
                +1 Champion Pt
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ================= FULL CABINET & VERIFIED AWARDS DETAIL MODAL ================= */}
      {showFullCabinetModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setShowFullCabinetModal(false)}
        >
          <div
            className="bg-slate-950 border-2 border-cyan-500/70 rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl space-y-4 text-left relative overflow-hidden my-auto max-h-[90vh] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                    Historical Trophy & Award Cabinet
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    All-Time Verified Record through August 2026
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullCabinetModal(false)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cabinet Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {(
                [
                  { id: 'records', label: 'World Records', count: LEGEND_HISTORIC_RECORDS.length },
                  { id: 'club', label: 'Club Trophies', count: legend.trophies.club.length },
                  { id: 'international', label: 'Senior Argentina', count: legend.trophies.international.length },
                  { id: 'youth', label: 'Youth International', count: legend.trophies.youth.length },
                  { id: 'individual', label: 'Individual Awards', count: legend.trophies.individual.length },
                  { id: 'supporting_stats', label: 'Detailed Match Records' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCabinetTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                    selectedCabinetTab === tab.id
                      ? tab.id === 'records' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label} {'count' in tab && typeof (tab as any).count === 'number' && `(${(tab as any).count})`}
                </button>
              ))}
            </div>

            {/* Cabinet Content Body */}
            <div className="overflow-y-auto pr-1 custom-scrollbar flex-1 space-y-3">
              {/* 0. WORLD RECORDS */}
              {selectedCabinetTab === 'records' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Historic World & League Records To Overcome</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {LEGEND_HISTORIC_RECORDS.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👑</span>
                            <h5 className="text-xs sm:text-sm font-black text-white">{rec.label}</h5>
                          </div>
                          <p className="text-[11px] text-slate-300">{rec.description}</p>
                          <span className="text-[10px] font-mono text-amber-300/80 block">{rec.context}</span>
                        </div>
                        <div className="text-right shrink-0 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-400/60 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400">Target Benchmark</span>
                          <span className="text-sm sm:text-base font-black font-mono text-amber-200">
                            {rec.target} {rec.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. CLUB TROPHIES */}
              {selectedCabinetTab === 'club' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    Major Club / Professional Trophies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {legend.trophies.club.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-extrabold text-white truncate">{t.name}</h5>
                          <span className="text-[10px] text-slate-400 block truncate">{t.subtitle}</span>
                        </div>
                        <span className="text-sm sm:text-base font-black font-mono text-cyan-300 px-2.5 py-0.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 shrink-0">
                          ×{t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SENIOR ARGENTINA TROPHIES */}
              {selectedCabinetTab === 'international' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    Senior Argentina International Silverware
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {legend.trophies.international.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-extrabold text-white truncate">{t.name}</h5>
                          <span className="text-[10px] text-slate-400 block truncate">{t.subtitle}</span>
                        </div>
                        <span className="text-sm sm:text-base font-black font-mono text-cyan-300 px-2.5 py-0.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 shrink-0">
                          ×{t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. YOUTH TROPHIES */}
              {selectedCabinetTab === 'youth' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    Youth International Achievements & Trophies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {legend.trophies.youth.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-extrabold text-white truncate">{t.name}</h5>
                          <span className="text-[10px] text-slate-400 block truncate">{t.subtitle}</span>
                        </div>
                        <span className="text-sm sm:text-base font-black font-mono text-cyan-300 px-2.5 py-0.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 shrink-0">
                          ×{t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. INDIVIDUAL HONORS */}
              {selectedCabinetTab === 'individual' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                    All-Time Individual Awards & Historical Trophies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {legend.trophies.individual.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-extrabold text-white truncate">{t.name}</h5>
                          <span className="text-[10px] text-slate-400 block truncate">{t.subtitle}</span>
                        </div>
                        <span className="text-sm sm:text-base font-black font-mono text-amber-300 px-2.5 py-0.5 rounded-xl bg-amber-950/80 border border-amber-500/40 shrink-0">
                          ×{t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. SUPPORTING STATS */}
              {selectedCabinetTab === 'supporting_stats' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    Official Historical Career Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Club Career</span>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">948 Matches</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">765 Goals • 362 Assists</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Argentina Senior</span>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">191 Matches</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">112 Goals • 58 Assists</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Major Tournaments</span>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">65 Matches</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">27 Goals (13 WC / 14 Copa)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFullCabinetModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close Cabinet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

