import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Star, Trophy, ArrowRight, Zap, Play, RotateCcw } from 'lucide-react';
import drawstarLogoImg from '../assets/images/DrawStar.png';
import { shouldDisableAnimations } from '../utils/graphicSettingsSystem';

interface AnimatedDrawStarLogoProps {
  onAdvance?: () => void;
}

type LogoPhase = 'writing' | 'swoop' | 'impact_shine' | 'ready';

// Retro 32-bit sound synthesizer for authentic arcade chime effects
function playArcadeFx(type: 'letter' | 'star_launch' | 'star_impact' | 'star_shine') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.07, now);
    masterGain.connect(ctx.destination);

    if (type === 'letter') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540 + Math.random() * 120, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'star_launch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.5);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.56);
    } else if (type === 'star_impact') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.3);

      gain1.gain.setValueAtTime(0.09, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'star_shine') {
      const freqs = [523.25, 659.25, 783.99, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.05);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.setValueAtTime(0.07, now + idx * 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.38);

        noteOsc.connect(noteGain);
        noteGain.connect(masterGain);
        noteOsc.start(now + idx * 0.05);
        noteOsc.stop(now + idx * 0.05 + 0.42);
      });
    }
  } catch {
    // Audio context may be restricted by browser policy; silent fallback
  }
}

export const AnimatedDrawStarLogo: React.FC<AnimatedDrawStarLogoProps> = ({ onAdvance }) => {
  const [phase, setPhase] = useState<LogoPhase>('writing');
  const [wipePercent, setWipePercent] = useState<number>(0); // 0 to 100% revealed
  const [animationKey, setAnimationKey] = useState<number>(0);

  // References to avoid ANY effect re-triggering
  const phaseRef = useRef<LogoPhase>('writing');
  phaseRef.current = phase;
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const runSequence = useCallback(() => {
    clearAllTimers();

    if (shouldDisableAnimations()) {
      setPhase('ready');
      phaseRef.current = 'ready';
      setWipePercent(100);
      return;
    }

    setPhase('writing');
    phaseRef.current = 'writing';
    setWipePercent(0);

    const startTime = performance.now();
    const writeDuration = 1500; // 1.5 seconds to draw across the canvas

    // 1. Smoothly advance wipe percentage using requestAnimationFrame
    const stepWipe = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / writeDuration) * 100);
      setWipePercent(pct);

      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(stepWipe);
      } else {
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(stepWipe);

    // Audio typewriter chirps during writing
    [150, 450, 750, 1050, 1350].forEach((ms) => {
      const t = setTimeout(() => {
        playArcadeFx('letter');
      }, ms);
      timersRef.current.push(t);
    });

    // 2. Star Orbit Swoop phase at 1.6s
    const tSwoop = setTimeout(() => {
      setPhase('swoop');
      phaseRef.current = 'swoop';
      setWipePercent(100);
      playArcadeFx('star_launch');
    }, 1600);
    timersRef.current.push(tSwoop);

    // 3. Star Impact & Super Shine phase at 2.8s
    const tImpact = setTimeout(() => {
      setPhase('impact_shine');
      phaseRef.current = 'impact_shine';
      playArcadeFx('star_impact');
      playArcadeFx('star_shine');
    }, 2800);
    timersRef.current.push(tImpact);

    // 4. Ready phase at 4.2s
    const tReady = setTimeout(() => {
      setPhase('ready');
      phaseRef.current = 'ready';
    }, 4200);
    timersRef.current.push(tReady);

    // 5. Smooth auto-advance at 6.8s
    const tAdvance = setTimeout(() => {
      if (onAdvanceRef.current) {
        onAdvanceRef.current();
      }
    }, 6800);
    timersRef.current.push(tAdvance);
  }, [clearAllTimers]);

  // Main lifecycle: RUNS ONCE ON MOUNT AND UPON MANUAL REPLAY (via animationKey)
  useEffect(() => {
    runSequence();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        if (phaseRef.current === 'ready') {
          if (onAdvanceRef.current) onAdvanceRef.current();
        } else {
          // Fast forward to ready phase
          clearAllTimers();
          setPhase('ready');
          phaseRef.current = 'ready';
          setWipePercent(100);
          playArcadeFx('star_shine');
        }
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearAllTimers();
      window.removeEventListener('keydown', handleKey);
    };
  }, [runSequence, clearAllTimers, animationKey]);

  const handleClickContainer = () => {
    if (phaseRef.current === 'ready') {
      if (onAdvanceRef.current) onAdvanceRef.current();
    } else {
      // Fast forward directly to ready phase
      clearAllTimers();
      setPhase('ready');
      phaseRef.current = 'ready';
      setWipePercent(100);
      playArcadeFx('star_shine');
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      onClick={handleClickContainer}
      className="relative z-20 w-full max-w-xl mx-auto flex flex-col items-center justify-center p-3 select-none cursor-pointer group"
      title="Click or press Space to proceed / skip"
    >
      {/* 32-BIT RETRO CRT AMBIENT LIGHT */}
      <div className="absolute -inset-6 bg-gradient-to-b from-blue-600/30 via-amber-500/25 to-emerald-500/20 rounded-3xl blur-2xl pointer-events-none opacity-80" />

      {/* TOP ARCADE STATUS BANNER */}
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/95 border-2 border-amber-400 text-amber-300 text-[11px] sm:text-xs font-mono font-black tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400" />
          <span>
            {phase === 'writing'
              ? 'WRITING DRAWSTAR...'
              : phase === 'swoop'
              ? '★ STAR ORBIT SWOOP ★'
              : phase === 'impact_shine'
              ? '★ 32-BIT STAR SHINE ★'
              : '★ DRAWSTAR READY ★'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* REPLAY BUTTON */}
        {phase === 'ready' && (
          <button
            type="button"
            onClick={handleReplay}
            className="px-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 text-[10px] font-mono uppercase flex items-center gap-1 transition-all cursor-pointer shadow-md"
            title="Replay animation"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">REPLAY</span>
          </button>
        )}
      </div>

      {/* MAIN 32-BIT LOGO SHOWCASE FRAME */}
      <div className="relative w-full flex flex-col items-center">
        <div
          className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-square rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.45),0_15px_30px_rgba(0,0,0,0.95)] bg-slate-950"
          style={{
            boxShadow:
              '0 0 0 3px #0f172a, 0 0 0 5px #f59e0b, 0 10px 40px rgba(0,0,0,0.95), inset 0 0 30px rgba(245,158,11,0.25)',
          }}
        >
          {/* RETRO 32-BIT ARCADE BACKGROUND GRID */}
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* THE OFFICIAL 32-BIT LOGO ARTWORK */}
          {/* During 'writing' phase: smoothly reveals behind the traveling laser stylus via clipPath! */}
          <img
            src={drawstarLogoImg}
            alt="DrawStar Unique Career - 32 Bit Pixel Logo"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{
              imageRendering: 'pixelated',
              clipPath:
                phase === 'writing'
                  ? `inset(0 calc(100% - ${wipePercent}%) 0 0)`
                  : 'inset(0 0% 0 0)',
              filter:
                phase === 'impact_shine'
                  ? 'brightness(1.15) contrast(1.1)'
                  : phase === 'ready'
                  ? 'brightness(1.05) contrast(1.05)'
                  : 'brightness(1.0)',
              transition: 'filter 0.5s ease-out',
            }}
          />

          {/* LASER STYLUS SPARK (TRAVELS ACROSS AS LOGO IS WRITTEN) */}
          {phase === 'writing' && (
            <div
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${wipePercent}%`,
                top: `${40 + Math.sin((wipePercent / 100) * Math.PI * 4) * 12}%`,
              }}
            >
              {/* Outer glowing spark ring */}
              <div className="w-8 h-8 rounded-full bg-amber-400/40 animate-ping absolute -inset-1" />
              {/* Inner bright laser core */}
              <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-yellow-100 to-amber-400 shadow-[0_0_20px_#f59e0b,0_0_30px_#fff]" />
              {/* Sparkles orbiting stylus tip */}
              <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-200 fill-white animate-spin" style={{ animationDuration: '0.5s' }} />
            </div>
          )}

          {/* SWOOPING GOLDEN STAR (PHASE: 'swoop') */}
          {phase === 'swoop' && (
            <div
              className="absolute z-35 pointer-events-none"
              style={{
                left: '81%',
                top: '27%',
                animation: 'drawstar-arc-swoop 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
              }}
            >
              {/* Spinning 32-bit Golden Star with radiant glow */}
              <div className="relative animate-spin" style={{ animationDuration: '0.45s' }}>
                <Star className="w-14 h-14 fill-amber-300 text-yellow-100 stroke-[2] drop-shadow-[0_0_25px_#facc15]" />
                <Sparkles className="absolute -inset-2 w-16 h-16 text-yellow-100 fill-white animate-pulse" />
              </div>
            </div>
          )}

          {/* IMPACT & SHINE EFFECTS (PHASES: 'impact_shine' & 'ready') */}
          {(phase === 'impact_shine' || phase === 'ready') && (
            <>
              {/* 32-BIT ROTATING 8-RAY SUNBURST BEHIND THE STAR */}
              <div
                className="absolute z-25 pointer-events-none opacity-90"
                style={{
                  left: '81%',
                  top: '27%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="w-40 h-40 pointer-events-none"
                  style={{
                    animation: 'drawstar-rays-spin 7s steps(16, end) infinite',
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                      <polygon
                        key={deg}
                        points="50,50 45,0 55,0"
                        fill="#fef08a"
                        transform={`rotate(${deg} 50 50)`}
                        className="opacity-75 filter drop-shadow-[0_0_8px_#f59e0b]"
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* IMPACT EXPANDING FLASH RING (ONLY IN IMPACT PHASE) */}
              {phase === 'impact_shine' && (
                <div
                  className="absolute z-26 pointer-events-none rounded-full border-4 border-amber-300"
                  style={{
                    left: '81%',
                    top: '27%',
                    width: '80px',
                    height: '80px',
                    transform: 'translate(-50%, -50%)',
                    animation: 'drawstar-shockwave-expand 0.9s ease-out forwards',
                  }}
                />
              )}

              {/* THE RADIANT 32-BIT STAR ON ITS HERO LOCATION */}
              <div
                className="absolute z-30 pointer-events-none text-amber-300"
                style={{
                  left: '81%',
                  top: '27%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 0 20px #facc15) drop-shadow(0 0 35px #f59e0b)',
                }}
              >
                <div style={{ animation: 'drawstar-star-pulse 2s steps(4, start) infinite' }}>
                  <Star className="w-14 h-14 fill-amber-300 text-yellow-100 stroke-[2] drop-shadow-xl" />
                </div>

                {/* 4 CROSSHAIR DIAMOND GLINTS (✦) ON STAR TIPS */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-black text-sm font-mono"
                  style={{ animation: 'drawstar-sparkle-cross 1s steps(2, start) infinite' }}
                >
                  ✦
                </div>
                <div
                  className="absolute top-1/3 -right-3 text-yellow-200 font-black text-sm font-mono"
                  style={{ animation: 'drawstar-sparkle-cross 1.2s steps(2, start) infinite', animationDelay: '0.2s' }}
                >
                  ✦
                </div>
                <div
                  className="absolute top-1/3 -left-3 text-yellow-100 font-black text-sm font-mono"
                  style={{ animation: 'drawstar-sparkle-cross 1.4s steps(2, start) infinite', animationDelay: '0.4s' }}
                >
                  ✦
                </div>
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white font-black text-xs font-mono"
                  style={{ animation: 'drawstar-sparkle-cross 1.1s steps(2, start) infinite', animationDelay: '0.6s' }}
                >
                  ✦
                </div>
              </div>

              {/* HOLOGRAPHIC FOIL SHIMMER SWEEP ACROSS LOGO */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden z-28"
                style={{
                  background:
                    'linear-gradient(115deg, transparent 20%, rgba(254, 240, 138, 0.4) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(254, 240, 138, 0.4) 55%, transparent 80%)',
                  backgroundSize: '250% 100%',
                  animation: 'drawstar-retro-shimmer 2.2s ease-in-out infinite',
                }}
              />
            </>
          )}

          {/* 32-BIT SCANLINE OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay z-40"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px)',
              backgroundSize: '100% 4px',
            }}
          />

          {/* RETRO PIXEL BRACKETS IN CORNERS */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none z-50" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none z-50" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none z-50" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none z-50" />
        </div>
      </div>

      {/* DEVELOPER CREDIT & ACTION CONTROLS */}
      <div className="mt-4 w-full flex flex-col items-center space-y-2">
        {/* DEVELOPED BY HISYAZ BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-lg">
          <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span className="text-xs text-slate-300 font-mono font-medium uppercase tracking-wider">
            Developed by <strong className="text-amber-300 font-black tracking-widest text-sm">HISYAZ</strong>
          </span>
        </div>

        {/* CLICK TO ADVANCE / SKIP PROMPT */}
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400/90 tracking-widest uppercase animate-pulse pt-1">
          <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>
            {phase === 'ready'
              ? 'PRESS SPACEBAR OR CLICK TO START'
              : 'CLICK OR PRESS SPACEBAR TO SKIP [★]'}
          </span>
          <ArrowRight className="w-3 h-3" />
        </div>

        {/* CSS-POWERED PROGRESS BAR (SMOOTH 6.8s TIMELINE WITHOUT REACT RE-RENDERS) */}
        <div className="w-48 sm:w-60 h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-amber-500/40 p-[1px] shadow-inner mt-1">
          <div
            key={animationKey}
            className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-yellow-300 rounded-full"
            style={{
              animation: 'drawstar-wipe-reveal 6.8s linear forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
};
