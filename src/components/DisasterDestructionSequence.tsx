import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ShieldAlert, Sparkles, Sword, AlertTriangle, FastForward } from 'lucide-react';
import { CustomCard } from '../types';
import {
  isDisasterCard,
  isIconicCard,
  isMuramasaBladeCard,
} from '../utils/storeCollectionSystem';
import { triggerHaptic } from '../utils/haptics';

interface DisasterDestructionSequenceProps {
  cards: any[];
  onComplete: (survivingCards: any[]) => void;
}

// 32-Bit Web Audio sound synthesizer for crunchy retro sfx
function playRetroAudioEffect(type: 'rumble' | 'burn' | 'clash' | 'slash' | 'victory') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'rumble') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'burn') {
      // White noise for crumbling ash
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'clash') {
      // High-energy rebound chime & blast
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'slash') {
      // Sharp katana slash sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'victory') {
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    }
  } catch {}
}

export const DisasterDestructionSequence: React.FC<DisasterDestructionSequenceProps> = ({
  cards,
  onComplete,
}) => {
  const [step, setStep] = useState<
    'intro' | 'emerge' | 'destroying' | 'immune_confront' | 'slash_moment' | 'rebound_moment' | 'verdict'
  >('intro');
  const [activeDestroyTargetIdx, setActiveDestroyTargetIdx] = useState<number>(-1);
  const [destroyedCardIndices, setDestroyedCardIndices] = useState<Set<number>>(new Set());
  const [disasterSlashedInHalf, setDisasterSlashedInHalf] = useState<boolean>(false);
  const [disasterExploded, setDisasterExploded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('WARNING: A DISASTER HAS OCCURRED');

  // Categorize cards
  const disasterCards = cards.filter(isDisasterCard);
  const iconicCards = cards.filter(isIconicCard);
  const muramasaCards = cards.filter(isMuramasaBladeCard);
  const immuneCards = [...iconicCards, ...muramasaCards];
  const normalCards = cards.filter(
    (c) => !isDisasterCard(c) && !isIconicCard(c) && !isMuramasaBladeCard(c)
  );

  // Compute final surviving cards according to canonical rules:
  // - Disaster destroys positive, normal, and non-Disaster negatives.
  // - Disaster does NOT destroy Disaster, Iconic, or Muramasa Blade cards.
  // - If Iconic or Muramasa Blade is present, Disaster is destroyed instead.
  // - If another Disaster card is present without immune cards, both Disasters survive.
  const survivingCards = React.useMemo(() => {
    if (immuneCards.length > 0) {
      // Protected cards repel & destroy Disaster! Protected cards survive.
      return immuneCards;
    }
    // No immune cards: Disaster destroys everything else! Disaster card(s) survive.
    return disasterCards.length > 0 ? disasterCards : cards;
  }, [cards, disasterCards, immuneCards]);

  const mainDisaster = disasterCards[0] || cards[0];
  const hasMuramasa = muramasaCards.length > 0;
  const hasIconic = iconicCards.length > 0;

  // Step sequencer
  useEffect(() => {
    triggerHaptic(60);
    playRetroAudioEffect('rumble');

    // 1. Intro sequence
    const t1 = setTimeout(() => {
      setStep('emerge');
      setStatusMessage(`DISASTER UNLEASHED: ${mainDisaster.name || 'Calamity'}`);
      playRetroAudioEffect('rumble');
    }, 1200);

    // 2. Destroy normal cards sequentially
    let destroyTimeout: NodeJS.Timeout;
    const t2 = setTimeout(() => {
      if (normalCards.length > 0) {
        setStep('destroying');
        let currentIdx = 0;

        const processNextDestroy = () => {
          if (currentIdx < normalCards.length) {
            setActiveDestroyTargetIdx(currentIdx);
            setStatusMessage(`Disaster consumes: ${normalCards[currentIdx].name || 'Card'}`);
            triggerHaptic(40);
            playRetroAudioEffect('burn');

            setTimeout(() => {
              setDestroyedCardIndices((prev) => new Set([...prev, currentIdx]));
              currentIdx++;
              destroyTimeout = setTimeout(processNextDestroy, 650);
            }, 550);
          } else {
            // Done destroying normal cards -> confront immune cards or verdict
            handlePostNormalDestruction();
          }
        };

        processNextDestroy();
      } else {
        handlePostNormalDestruction();
      }
    }, 2400);

    const handlePostNormalDestruction = () => {
      if (hasMuramasa && hasIconic) {
        setStep('immune_confront');
        setStatusMessage('DISASTER CONFRONTS ICONIC & MURAMASA GUARDS!');
        setTimeout(() => {
          setStep('rebound_moment');
          setStatusMessage('ICONIC LIGHT REBOUNDS DISASTER!');
          playRetroAudioEffect('clash');
          triggerHaptic(70);

          setTimeout(() => {
            setStep('slash_moment');
            setStatusMessage('MURAMASA BLADE EXECUTES DEMONIC CUT!');
            playRetroAudioEffect('slash');
            setDisasterSlashedInHalf(true);
            triggerHaptic(80);

            setTimeout(() => {
              setDisasterExploded(true);
              setStep('verdict');
              setStatusMessage('DISASTER OBLITERATED! PROTECTED CARDS PREVAIL.');
              playRetroAudioEffect('victory');
            }, 1000);
          }, 900);
        }, 900);
      } else if (hasMuramasa) {
        setStep('immune_confront');
        setStatusMessage('MURAMASA BLADE STANDS DEFIANT!');
        setTimeout(() => {
          setStep('slash_moment');
          setStatusMessage('MURAMASA BLADE SLICES DISASTER IN HALF!');
          playRetroAudioEffect('slash');
          setDisasterSlashedInHalf(true);
          triggerHaptic(80);

          setTimeout(() => {
            setDisasterExploded(true);
            setStep('verdict');
            setStatusMessage('DISASTER CLEANLY DESTROYED BY MURAMASA BLADE!');
            playRetroAudioEffect('victory');
          }, 1100);
        }, 900);
      } else if (hasIconic) {
        setStep('immune_confront');
        setStatusMessage('DISASTER ATTEMPTS TO CONSUME ICONIC ESSENCE...');
        setTimeout(() => {
          setStep('rebound_moment');
          setStatusMessage('ICONIC SHOCKWAVE REBELS & SHATTERS DISASTER!');
          playRetroAudioEffect('clash');
          triggerHaptic(80);

          setTimeout(() => {
            setDisasterExploded(true);
            setStep('verdict');
            setStatusMessage('ICONIC PURITY DESTROYED THE DISASTER!');
            playRetroAudioEffect('victory');
          }, 1100);
        }, 900);
      } else {
        // No immune cards
        setStep('verdict');
        setStatusMessage('ALL SURROUNDING OPTIONS CONSUMED IN ASH.');
        playRetroAudioEffect('rumble');
      }
    };

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(destroyTimeout);
    };
  }, []);

  const handleSkip = () => {
    triggerHaptic(30);
    onComplete(survivingCards);
  };

  return (
    <div
      id="disaster-destruction-overlay"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 select-none overflow-hidden font-pixel"
    >
      {/* 32-Bit Retro Scanlines & Screen Shake */}
      <div className="absolute inset-0 pixel-scanlines opacity-40 pointer-events-none z-10" />

      {/* Menacing Red & Violet Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-red-950/40 to-black pointer-events-none z-0" />

      {/* Floating 32-Bit Ash and Ember Sprites */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: (i * 37) % 360,
              y: 500,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              y: -80,
              opacity: [0, 0.9, 0],
              x: `calc(${(i * 37) % 360}px + ${Math.sin(i) * 40}px)`,
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2 + (i % 4) * 0.4,
              delay: (i * 0.15),
              ease: 'easeOut',
            }}
            className={`absolute w-2 h-2 ${
              i % 2 === 0 ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-red-600 shadow-[0_0_8px_#dc2626]'
            }`}
            style={{ imageRendering: 'pixelated' }}
          />
        ))}
      </div>

      {/* Top Header & Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between relative z-20 pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950 border-2 border-red-600 pixel-bevel-raised text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider font-arcade">
            CALAMITY EVENT
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-arcade uppercase transition-all cursor-pointer pixel-bevel-raised active:scale-95"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip Animation</span>
        </button>
      </div>

      {/* Main Center Stage */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative z-20 py-4">
        {/* Step Banner / Status ticker */}
        <div className="mb-6 px-4 py-2 bg-slate-950/90 border-2 border-red-500/80 pixel-bevel-raised text-center max-w-lg shadow-2xl">
          <p className="text-xs sm:text-sm font-arcade font-black text-red-400 tracking-wide uppercase animate-pulse">
            {statusMessage}
          </p>
        </div>

        {/* ================= STAGE 1: INTRO / EMERGE ================= */}
        {(step === 'intro' || step === 'emerge') && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="flex flex-col items-center"
          >
            {/* Pulsing Disaster Card */}
            <div className="w-48 sm:w-56 h-72 sm:h-84 bg-slate-950 border-4 border-red-600 pixel-bevel-raised shadow-[0_0_35px_rgba(220,38,38,0.7)] flex flex-col justify-between p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-red-950/30 animate-pulse" />
              <div className="relative z-10 flex items-center justify-between border-b border-red-600 pb-2">
                <span className="text-[10px] font-black text-red-400 uppercase font-mono">DISASTER</span>
                <Flame className="w-4 h-4 text-red-500 animate-bounce" />
              </div>
              <div className="relative z-10 my-auto text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-900 border-2 border-red-500 flex items-center justify-center text-red-300">
                  <ShieldAlert className="w-10 h-10 animate-pulse" />
                </div>
                <h4 className="text-sm sm:text-base font-black font-arcade text-white uppercase">
                  {mainDisaster.name || 'Total Calamity'}
                </h4>
                <p className="text-[9px] text-red-300 font-retro mt-1">
                  Destroys all normal cards drawn in this hand!
                </p>
              </div>
              <div className="relative z-10 pt-2 border-t border-red-800 text-center text-[9px] font-mono text-red-400 font-bold uppercase">
                Hostile Force
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE 2: DESTROYING NORMAL CARDS ================= */}
        {step === 'destroying' && (
          <div className="flex flex-col items-center w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full px-2">
              {normalCards.map((c, idx) => {
                const isTarget = activeDestroyTargetIdx === idx;
                const isDestroyed = destroyedCardIndices.has(idx);

                return (
                  <motion.div
                    key={c.id || idx}
                    animate={
                      isTarget
                        ? { x: [-4, 4, -4, 4, 0], scale: [1, 1.05, 0.95] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    className={`relative h-44 sm:h-52 border-2 pixel-bevel-raised p-2.5 flex flex-col justify-between transition-all duration-300 ${
                      isDestroyed
                        ? 'bg-stone-950 border-stone-800 opacity-20 grayscale pointer-events-none'
                        : isTarget
                        ? 'bg-red-950 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {/* Ash Crumble Animation Overlay */}
                    {isTarget && !isDestroyed && (
                      <div className="absolute inset-0 bg-red-600/40 z-20 flex flex-col items-center justify-center p-2 text-center animate-pulse">
                        <Flame className="w-8 h-8 text-orange-400 animate-bounce" />
                        <span className="text-[9px] font-black text-white font-arcade uppercase mt-1">
                          BURNING...
                        </span>
                      </div>
                    )}

                    {isDestroyed && (
                      <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-[10px] font-black text-stone-400 font-arcade uppercase">
                          CRUMBLED TO ASH
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="text-[8px] font-mono text-slate-400 uppercase">{c.tier || 'Card'}</span>
                    </div>

                    <div className="my-auto text-center">
                      <p className="text-xs font-black font-arcade text-white line-clamp-2">
                        {c.name}
                      </p>
                    </div>

                    <div className="text-[8px] font-mono text-slate-500 text-center">
                      {isDestroyed ? 'DESTROYED' : 'Target'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STAGE 3: CLASH WITH IMMUNE CARDS ================= */}
        {(step === 'immune_confront' || step === 'rebound_moment' || step === 'slash_moment') && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 w-full max-w-3xl relative">
            {/* The Attacking Disaster Card */}
            <motion.div
              animate={
                step === 'rebound_moment'
                  ? { x: [-10, -50, -30], rotate: -15 }
                  : step === 'slash_moment'
                  ? { x: -40, rotate: -20, opacity: 0.8 }
                  : { x: [0, 15, 0] }
              }
              transition={{ duration: 0.4 }}
              className="relative w-44 h-64 bg-slate-950 border-4 border-red-600 pixel-bevel-raised p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(220,38,38,0.7)]"
            >
              {/* Slashed in half visual */}
              {disasterSlashedInHalf && (
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  <div className="w-full h-1 bg-white shadow-[0_0_15px_#ffffff] rotate-45 transform scale-125" />
                  <div className="absolute top-2 right-2 text-yellow-300 font-arcade text-xs font-black">
                    SLICED!
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-red-700 pb-1">
                <span className="text-[9px] font-mono text-red-400 font-black">DISASTER</span>
                <Flame className="w-3.5 h-3.5 text-red-400" />
              </div>

              <div className="my-auto text-center">
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-1" />
                <h5 className="text-xs font-arcade font-black text-white">{mainDisaster.name}</h5>
              </div>

              <div className="text-[8px] font-mono text-red-500 text-center uppercase font-bold">
                {disasterSlashedInHalf ? 'DEFEATED' : 'ATTACKING'}
              </div>
            </motion.div>

            {/* Middle Slash or Shockwave FX */}
            {step === 'slash_moment' && (
              <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 1 }}
                animate={{ scale: 1.8, rotate: 45, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute z-40 w-48 h-2 bg-gradient-to-r from-red-500 via-white to-purple-600 shadow-[0_0_25px_#ffffff]"
              />
            )}

            {step === 'rebound_moment' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute z-40 w-32 h-32 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_#22d3ee]"
              />
            )}

            {/* Defending Immune Cards */}
            <div className="flex gap-3">
              {immuneCards.map((card, i) => {
                const isMuramasa = isMuramasaBladeCard(card);
                const isIconic = isIconicCard(card);

                return (
                  <motion.div
                    key={card.id || i}
                    animate={
                      step === 'rebound_moment' && isIconic
                        ? { scale: [1, 1.15, 1], rotate: [0, 5, 0] }
                        : step === 'slash_moment' && isMuramasa
                        ? { scale: [1, 1.2, 1], rotate: [0, -8, 0] }
                        : {}
                    }
                    className={`w-44 h-64 border-4 pixel-bevel-raised p-3 flex flex-col justify-between ${
                      isIconic
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)] text-cyan-200'
                        : 'bg-purple-950/80 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.7)] text-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-current pb-1">
                      <span className="text-[9px] font-mono font-black uppercase">
                        {isIconic ? 'ICONIC IMMUNITY' : 'MURAMASA BLADE'}
                      </span>
                      {isIconic ? <Sparkles className="w-3.5 h-3.5" /> : <Sword className="w-3.5 h-3.5" />}
                    </div>

                    <div className="my-auto text-center">
                      <div className="w-10 h-10 mx-auto mb-2 border-2 border-current flex items-center justify-center">
                        {isIconic ? <Sparkles className="w-6 h-6" /> : <Sword className="w-6 h-6" />}
                      </div>
                      <h5 className="text-xs font-arcade font-black text-white">{card.name}</h5>
                      <p className="text-[8px] mt-1 font-retro">
                        {isIconic ? 'Repels & Destroys Disaster' : 'Slices Disaster Cleanly'}
                      </p>
                    </div>

                    <div className="text-[8px] font-mono text-center font-bold uppercase">
                      Protected & Immune
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STAGE 4: VERDICT & SURVIVORS ================= */}
        {step === 'verdict' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center w-full max-w-2xl px-3"
          >
            <div className="w-full bg-slate-900 border-2 border-amber-400 pixel-bevel-gold p-4 text-center shadow-2xl mb-4">
              <h3 className="text-sm sm:text-base font-black font-arcade text-amber-300 uppercase tracking-wide">
                {immuneCards.length > 0 ? '✨ CALAMITY REPELLED & DEFEATED!' : '⚠️ ONLY DISASTER SURVIVES'}
              </h3>
              <p className="text-[11px] text-slate-300 font-retro mt-1">
                {immuneCards.length > 0
                  ? 'Your protected cards destroyed the Disaster. Only immune cards remain available for selection.'
                  : 'The Disaster consumed all normal options. You must confront the consequences.'}
              </p>
            </div>

            {/* Remaining selectable cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {survivingCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className={`w-40 sm:w-48 h-56 sm:h-64 border-2 pixel-bevel-raised p-3 flex flex-col justify-between ${
                    isDisasterCard(card)
                      ? 'bg-red-950 border-red-500 text-red-200'
                      : isIconicCard(card)
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                      : 'bg-purple-950 border-purple-400 text-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-current pb-1">
                    <span className="text-[9px] font-mono uppercase font-black">{card.tier || 'Card'}</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="my-auto text-center">
                    <h5 className="text-xs sm:text-sm font-arcade font-black text-white">{card.name}</h5>
                    <p className="text-[9px] font-retro mt-1.5 opacity-90 line-clamp-3">
                      {card.description || 'Surviving option'}
                    </p>
                  </div>
                  <div className="text-[8px] font-mono text-center font-bold uppercase bg-black/40 py-1">
                    SURVIVOR
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onComplete(survivingCards)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider pixel-bevel-gold cursor-pointer transition-transform active:scale-95 shadow-xl flex items-center gap-2"
            >
              <span>PROCEED TO CARD SELECTION</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
