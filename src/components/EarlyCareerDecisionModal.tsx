import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerConfig } from '../types';
import { calculateTryoutSuccessRate } from '../utils/earlyCareerSystem';
import { EarlyCareerChoiceType } from '../types/earlyCareer';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Building2,
  Home,
  Flame,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  BatteryCharging,
  Shield,
  Info,
  Check,
  Gamepad2,
  Briefcase,
  Globe,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';

interface EarlyCareerDecisionModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  onSelectChoice: (choice: EarlyCareerChoiceType) => void;
}

export const EarlyCareerDecisionModal: React.FC<EarlyCareerDecisionModalProps> = ({
  isOpen,
  player,
  onSelectChoice,
}) => {
  const { t } = useLanguage();
  
  // AGE 17 RULE:
  // - BEFORE AGE 17 (< 17): Keep the same 4 options as always:
  //   1. Join Big Club, 2. Join Local Club, 3. Play on the streets, 4. Pro Tryouts
  //   Even if you are currently playing on the streets!
  // - AFTER YOU TURN 17 (age >= 17): Switch to the new senior version with ONLY:
  //   1. Play on the streets, 2. Look for agent (or speak with agent), 3. Do tryouts on different leagues
  const isAge17Plus = (player.age || 10) >= 17;
  const isAge16Plus = (player.age || 10) >= 16;
  const hasAgent = Boolean(
    (player as any).manager?.name ||
    (player as any).managerState?.name ||
    (player as any).managerName
  );
  const agentName =
    (player as any).manager?.name ||
    (player as any).managerState?.name ||
    (player as any).managerName ||
    'Agent';

  const [phase, setPhase] = useState<'intro' | 'selection'>('intro');
  const [selectedChoice, setSelectedChoice] = useState<EarlyCareerChoiceType>(
    isAge17Plus ? 'play_streets' : 'travel_big_club'
  );
  const [hasGamepad, setHasGamepad] = useState(false);
  const lastGamepadActionTimeRef = useRef<number>(0);

  useEffect(() => {
    setSelectedChoice((prev) => {
      if (isAge17Plus) {
        if (prev === 'travel_big_club' || prev === 'join_local') {
          return 'play_streets';
        }
        return prev;
      } else {
        if (prev === 'speak_agent' || prev === 'look_agent') {
          return 'play_streets';
        }
        return prev;
      }
    });
  }, [isAge17Plus, hasAgent]);

  // Controller / Gamepad and Keyboard Navigation
  const availableChoices: EarlyCareerChoiceType[] = isAge17Plus
    ? ['play_streets', hasAgent ? 'speak_agent' : 'look_agent', 'tryout_pro']
    : ['travel_big_club', 'join_local', 'play_streets', 'tryout_pro'];

  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      const curIdx = availableChoices.indexOf(selectedChoice);
      const nextIdx = (curIdx + direction + availableChoices.length) % availableChoices.length;
      haptics.lightTap();
      setSelectedChoice(availableChoices[nextIdx]);
    },
    [availableChoices, selectedChoice]
  );

  const handleConfirm = useCallback(() => {
    haptics.success();
    onSelectChoice(selectedChoice);
  }, [onSelectChoice, selectedChoice]);

  // Gamepad Poller
  useEffect(() => {
    if (!isOpen || phase !== 'selection') return;

    const handleConn = () => setHasGamepad(true);
    const handleDisconn = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      setHasGamepad(Array.from(pads).some((p) => p !== null && p.connected));
    };

    window.addEventListener('gamepadconnected', handleConn);
    window.addEventListener('gamepaddisconnected', handleDisconn);

    let animId: number;
    const poll = (time: number) => {
      if (time - lastGamepadActionTimeRef.current > 220) {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const p of pads) {
          if (!p || !p.connected) continue;
          const leftOrUp =
            p.buttons[14]?.pressed ||
            p.buttons[12]?.pressed ||
            p.axes[0] < -0.5 ||
            p.axes[1] < -0.5 ||
            p.buttons[4]?.pressed;
          const rightOrDown =
            p.buttons[15]?.pressed ||
            p.buttons[13]?.pressed ||
            p.axes[0] > 0.5 ||
            p.axes[1] > 0.5 ||
            p.buttons[5]?.pressed;
          const confirmBtn = p.buttons[0]?.pressed;

          if (leftOrUp) {
            handleNavigate(-1);
            lastGamepadActionTimeRef.current = time;
            break;
          } else if (rightOrDown) {
            handleNavigate(1);
            lastGamepadActionTimeRef.current = time;
            break;
          } else if (confirmBtn) {
            handleConfirm();
            lastGamepadActionTimeRef.current = time;
            break;
          }
        }
      }
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => {
      window.removeEventListener('gamepadconnected', handleConn);
      window.removeEventListener('gamepaddisconnected', handleDisconn);
      cancelAnimationFrame(animId);
    };
  }, [isOpen, phase, handleNavigate, handleConfirm]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || phase !== 'selection') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a' || e.key === 'w') {
        e.preventDefault();
        handleNavigate(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === 's') {
        e.preventDefault();
        handleNavigate(1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, handleNavigate, handleConfirm]);

  if (!isOpen) return null;

  const ovr = player.ovr || 65;
  const fame = player.fame || 0;
  const city = player.city || player.startingCity || 'Home City';
  const tryoutInfo = calculateTryoutSuccessRate(ovr, fame);

  const getChoiceLabel = (choice: EarlyCareerChoiceType) => {
    switch (choice) {
      case 'play_streets':
        return t('PLAY ON THE STREETS');
      case 'speak_agent':
        return t('SPEAK WITH AGENT');
      case 'look_agent':
        return t('LOOK FOR AN AGENT');
      case 'tryout_pro':
        return isAge17Plus ? t('DO TRYOUTS ON DIFFERENT LEAGUES') : t('PRO TEAM TRYOUTS');
      case 'travel_big_club':
        return t('TRAVEL TO BIG YOUTH CLUB');
      case 'join_local':
        return t('JOIN LOCAL CLUB');
      default:
        return t('CONFIRM CHOICE');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 select-none font-mono"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO INTRO BRIEFING */}
      {/* ========================================================================= */}
      {phase === 'intro' && (
        <div
          className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-5 sm:p-7 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex flex-col items-center text-center space-y-4 text-white relative overflow-hidden my-auto animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-400 pixel-bevel-gold text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isAge17Plus ? t('SENIOR CAREER PATHWAY • AGE 17+') : t('STEP 4 OF 4 • YOUTH PATHWAY')}
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
              {isAge17Plus
                ? t('Senior Career Pathways (Age {age})', { age: player.age || 17 })
                : t('Choose Your Youth Path (Age {age})', { age: player.age || 10 })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              {isAge17Plus
                ? t('You have reached age 17 and aged out of the youth academy setup in {city}. Choose your path to secure a professional contract.', { city })
                : t('Define your developmental journey between childhood roots, academies, and street football in {city}.', { city })}
            </p>
          </div>

          {/* Pathway Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
            {isAge17Plus ? (
              <>
                {/* POST-17: 1. PLAY ON THE STREETS */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-orange-400 uppercase">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>1. PLAY ON THE STREETS</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Draw 3 Street Cards & choose 1 bonus card. Advance 1 year (stat gains reduced after age 16).
                  </p>
                </div>

                {/* POST-17: 2. LOOK FOR AN AGENT / SPEAK WITH AGENT */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                    <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. {hasAgent ? `SPEAK WITH AGENT (${agentName})` : 'LOOK FOR AN AGENT'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {hasAgent
                      ? `Instruct ${agentName} to scout official club contract proposals matching your directive.`
                      : 'Interview and hire certified football agents to unlock professional club offers.'}
                  </p>
                </div>

                {/* POST-17: 3. DO TRYOUTS ON DIFFERENT LEAGUES */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase">
                    <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>3. DO TRYOUTS ON DIFFERENT LEAGUES</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Travel for open trials across domestic & international leagues ({tryoutInfo.formattedRate} chance based on OVR & Fame).
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* PRE-17: 1. BIG YOUTH CLUB */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>BIG YOUTH CLUB (20 PTS)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    20 Dev Pts/yr. 2-Season Adaptation: S1 (-20 STA, 80% Chem), S2 (-10 STA, 90% Chem).
                  </p>
                </div>

                {/* PRE-17: 2. LOCAL CLUB */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase">
                    <Home className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>LOCAL CLUB (15 PTS)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    15 Dev Pts/yr, Zero Stamina penalty. Starts as Starter in local league.
                  </p>
                </div>

                {/* PRE-17: 3. PLAY ON STREETS */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-orange-400 uppercase">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>PLAY ON STREETS</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Draw 3 Street Cards & choose 1 bonus card. Advance 1 year immediately.
                  </p>
                </div>

                {/* PRE-17: 4. PRO TEAM TRYOUTS */}
                <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase">
                    <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>PRO TEAM TRYOUTS</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Direct pro contract shortcut ({tryoutInfo.formattedRate} chance based on OVR & Fame).
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Player Stat Bar */}
          <div className="w-full bg-slate-950 border border-amber-600/50 pixel-bevel-gold p-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-900 border border-amber-500 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
                ★
              </div>
              <div className="text-left">
                <div className="font-black text-white text-xs">{ovr} OVR • {player.potentialOvr || 78} POT</div>
                <div className="text-[10px] text-slate-400">
                  Fame: {fame}/1000 • City: {city}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-black text-[10px]">
              {isAge17Plus ? '3 PATHS' : '4 PATHS'}
            </span>
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={() => setPhase('selection')}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>{t('EXPLORE PATHWAYS & DECIDE')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: 32-BIT SELECTION STAGE WITH RETRO CARDS */}
      {/* ========================================================================= */}
      {phase === 'selection' && (
        <div
          className="w-full max-w-4xl bg-slate-950 border-2 border-slate-700 pixel-bevel-raised shadow-2xl flex flex-col text-left relative overflow-hidden my-auto max-h-[96vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 32-Bit Header */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-slate-700 px-3 py-2 sm:px-5 sm:py-2.5 bg-slate-900 pixel-bevel-raised shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold text-[10px] font-black uppercase">
                {isAge17Plus ? `AGE ${player.age || 17} • SENIOR` : `AGE ${player.age || 10} • YOUTH`}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate pixel-text-shadow-sm">
                {isAge17Plus ? 'SENIOR CAREER PATHWAYS (AGE 17+)' : 'CHOOSE YOUTH PATHWAY'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {hasGamepad && (
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-950 border border-cyan-600 text-cyan-400 text-[9px]">
                  <Gamepad2 className="w-3 h-3" />
                  <span>PAD</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setPhase('intro')}
                className="text-[10px] text-slate-300 hover:text-white font-bold px-2 py-1 bg-slate-950 border border-slate-700 pixel-bevel-raised shrink-0 cursor-pointer active:scale-95"
              >
                Info
              </button>
            </div>
          </div>

          {/* Scrollable Body - 32-Bit Selection Grid */}
          <div className="p-3 sm:p-5 flex-1 overflow-y-auto overscroll-contain custom-scrollbar space-y-2.5">
            {/* Age 17+ Notice */}
            {isAge17Plus && (
              <div className="p-2.5 bg-amber-950/60 border border-amber-500 pixel-bevel-gold text-amber-200 text-xs flex items-start gap-2 shadow-sm">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Youth Limit Reached (Age {player.age || 17}):</strong> Youth academies only host players up to 16 years old. You have entered senior free agency: play on the streets, consult/look for an agent, or travel for league tryouts.
                </p>
              </div>
            )}

            <div className={`grid grid-cols-1 ${isAge17Plus ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
              {isAge17Plus ? (
                <>
                  {/* ========================================================================= */}
                  {/* POST-17 VERSION: OPTION 1: PLAY ON THE STREETS */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('play_streets');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === 'play_streets'
                        ? 'border-orange-400 bg-orange-950/30 pixel-bevel-gold shadow-[0_0_15px_rgba(249,115,22,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-orange-950 text-orange-300 border border-orange-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>STREET CONCRETE</span>
                      </div>
                      {selectedChoice === 'play_streets' && (
                        <span className="px-2 py-0.5 bg-orange-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        1. PLAY ON THE STREETS
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Train on urban concrete courts and independent cages to sharpen raw skills."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-orange-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-orange-400 mt-0.5" />
                        <span>Draw 3 Street Cards & choose 1 unique bonus card!</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sky-300">
                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Advances 1 year immediately (Age {player.age || 17} → {(player.age || 17) + 1}).</span>
                      </div>
                      <div className="p-1.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px]">
                        <div className="flex items-center gap-1 font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Reduced Gains After Age 16</span>
                        </div>
                        <p className="text-rose-200/90 leading-tight mt-0.5">
                          Stat points from playing on the streets are heavily reduced after age 16.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* POST-17 VERSION: OPTION 2: LOOK FOR AN AGENT (OR SPEAK WITH AGENT) */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice(hasAgent ? 'speak_agent' : 'look_agent');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === (hasAgent ? 'speak_agent' : 'look_agent')
                        ? 'border-amber-400 bg-amber-950/30 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{hasAgent ? 'REPRESENTATIVE ACTIVE' : 'FREE AGENT • NO AGENT'}</span>
                      </div>
                      {selectedChoice === (hasAgent ? 'speak_agent' : 'look_agent') && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        {hasAgent ? `2. SPEAK WITH AGENT (${agentName})` : '2. LOOK FOR AN AGENT'}
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        {hasAgent
                          ? `"Instruct ${agentName} to leverage professional networks and negotiate club contracts."`
                          : '"Interview certified football agents to secure professional representation."'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-amber-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                          {hasAgent
                            ? 'Direct agent to scout official contract proposals matching your directive.'
                            : 'Unlocks professional contract negotiations, transfer bids, and market clout.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Access curated club offers & agency representation network.</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* POST-17 VERSION: OPTION 3: DO TRYOUTS ON DIFFERENT LEAGUES */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('tryout_pro');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === 'tryout_pro'
                        ? 'border-purple-400 bg-purple-950/30 pixel-bevel-raised shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>OPEN TRIALS TOUR</span>
                      </div>
                      {selectedChoice === 'tryout_pro' && (
                        <span className="px-2 py-0.5 bg-purple-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        3. DO TRYOUTS ON DIFFERENT LEAGUES
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Travel for open tryouts across domestic, South American, and European leagues."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-purple-300 font-bold">
                        <Trophy className="w-3.5 h-3.5 shrink-0 text-purple-400 mt-0.5" />
                        <span>Evaluated based on OVR ({ovr}) & Fame ({fame}). Chance: {tryoutInfo.formattedRate}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sky-300">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                        <span>Success directly earns an official professional contract offer!</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ========================================================================= */}
                  {/* STANDARD YOUTH (AGE < 17): OPTION 1: BIG YOUTH CLUB */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('travel_big_club');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === 'travel_big_club'
                        ? 'border-amber-400 bg-amber-950/30 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>TOP TIER (20 PTS)</span>
                      </div>
                      {selectedChoice === 'travel_big_club' && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        1. TRAVEL TO A BIGGER CLUB
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Travel several hours daily to join a prestigious academy. High exposure, high sacrifice."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-amber-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>20 Development Points per year.</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sky-300">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                        <span>Starts as Substitute until 100 Chemistry & OVR &gt; Starting XI.</span>
                      </div>
                      <div className="p-2 bg-rose-950/60 border border-rose-800 text-rose-300 pixel-bevel-crimson text-[10px]">
                        <div className="flex items-center gap-1 font-bold text-rose-400">
                          <BatteryCharging className="w-3.5 h-3.5 shrink-0" />
                          <span>2-Season Adaptation System</span>
                        </div>
                        <p className="text-rose-200/90 leading-tight mt-0.5">
                          Yr 1: -20 Stamina, 80% Chem cap. Yr 2: -10 Stamina, 90% Chem cap. Yr 3: All penalties lifted.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* STANDARD YOUTH (AGE < 17): OPTION 2: LOCAL CLUB */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('join_local');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === 'join_local'
                        ? 'border-blue-400 bg-blue-950/30 pixel-bevel-cyan shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        <span>AVERAGE TIER (15 PTS)</span>
                      </div>
                      {selectedChoice === 'join_local' && (
                        <span className="px-2 py-0.5 bg-blue-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        2. JOIN THE LOCAL CLUB
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Stay close to home and develop steadily without extreme travel fatigue."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-blue-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
                        <span>15 Development Points per year.</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Starts as Starter in {city}.</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sky-400">
                        <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Zero Stamina fatigue penalty; steady foundation.</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* STANDARD YOUTH (AGE < 17): OPTION 3: PLAY ON THE STREETS */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('play_streets');
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      selectedChoice === 'play_streets'
                        ? 'border-orange-400 bg-orange-950/30 pixel-bevel-gold shadow-[0_0_15px_rgba(249,115,22,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-orange-950 text-orange-300 border border-orange-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>STREET CARDS</span>
                      </div>
                      {selectedChoice === 'play_streets' && (
                        <span className="px-2 py-0.5 bg-orange-400 text-slate-950 font-black text-[10px]">
                          ★ SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        3. PLAY ON THE STREETS
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Choose raw freedom over rigid academy rules. Every concrete game builds instincts."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-orange-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-orange-400 mt-0.5" />
                        <span>Draw 3 Street Cards & choose 1 unique bonus card!</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sky-300">
                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Advances 1 year immediately (Age {player.age || 10} → {(player.age || 10) + 1}).</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* STANDARD YOUTH (AGE < 17): OPTION 4: PRO TEAM TRYOUTS */}
                  {/* ========================================================================= */}
                  <div
                    onClick={() => {
                      haptics.lightTap();
                      setSelectedChoice('tryout_pro');
                    }}
                    className={`p-3.5 border-2 transition-all flex flex-col justify-between space-y-2 select-none cursor-pointer ${
                      selectedChoice === 'tryout_pro'
                        ? 'border-purple-400 bg-purple-950/30 pixel-bevel-raised shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 pixel-bevel-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500 text-[10px] font-black uppercase flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>PRO SHORTCUT</span>
                      </div>

                      <div
                        className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${
                          tryoutInfo.successRate >= 50
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                            : 'bg-amber-950 text-amber-300 border-amber-500'
                        }`}
                      >
                        CHANCE: {tryoutInfo.formattedRate}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        4. PRO TEAM TRYOUTS
                      </h3>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "Challenge pro clubs directly to win an immediate professional contract offer."
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5 text-purple-300 font-bold">
                        <Trophy className="w-3.5 h-3.5 shrink-0 text-purple-400 mt-0.5" />
                        <span>On success: Triggers First Professional Contract Event!</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-rose-400 font-semibold bg-rose-950/60 p-1.5 border border-rose-800 text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                        <span>If you fail, 1 year is spent with no special cards.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 32-Bit Action Dock */}
          <div className="bg-slate-900 border-t-2 border-slate-700 pixel-bevel-raised p-2.5 sm:p-3 shrink-0 flex items-center justify-between gap-3">
            <div className="hidden sm:flex flex-col min-w-0 font-mono">
              <span className="text-[9px] font-bold text-slate-400 uppercase">SELECTED PATHWAY</span>
              <span className="text-xs font-black text-amber-300 truncate">
                {getChoiceLabel(selectedChoice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto min-h-[46px] px-8 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
              <span>CONFIRM: {getChoiceLabel(selectedChoice)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
