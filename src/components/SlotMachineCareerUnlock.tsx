import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Sparkles, Trophy, Star, Footprints, Coins, Zap } from 'lucide-react';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface SlotMachineCareerUnlockProps {
  isActive: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

type Stage = 'idle' | 'inserting_coin' | 'spinning_reels' | 'unlocked';

export const SlotMachineCareerUnlock: React.FC<SlotMachineCareerUnlockProps> = ({
  isActive,
  onComplete,
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [reel1Symbol, setReel1Symbol] = useState<string>('⚽');
  const [reel2Symbol, setReel2Symbol] = useState<string>('⭐');
  const [reel3Symbol, setReel3Symbol] = useState<string>('👑');
  const [isReel1Stopped, setIsReel1Stopped] = useState(false);
  const [isReel2Stopped, setIsReel2Stopped] = useState(false);
  const [isReel3Stopped, setIsReel3Stopped] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setStage('idle');
      setIsReel1Stopped(false);
      setIsReel2Stopped(false);
      setIsReel3Stopped(false);
      completedRef.current = false;
      return;
    }

    completedRef.current = false;
    setStage('inserting_coin');
    audioManager.playSlotMachineCoinInsertSound();
    haptics.firmImpact();

    // Reel spinning symbol animation loop
    const symbols = ['⚽', '🏆', '⭐', '👑', '🎴', '⚡'];
    const interval = setInterval(() => {
      setReel1Symbol((prev) => (!isReel1Stopped ? symbols[Math.floor(Math.random() * symbols.length)] : prev));
      setReel2Symbol((prev) => (!isReel2Stopped ? symbols[Math.floor(Math.random() * symbols.length)] : prev));
      setReel3Symbol((prev) => (!isReel3Stopped ? symbols[Math.floor(Math.random() * symbols.length)] : prev));
    }, 60);

    // Sequence timing
    // 0ms - 550ms: Coin drops into slot
    const t1 = setTimeout(() => {
      setStage('spinning_reels');
      haptics.lightTap();
    }, 550);

    // Stop reels progressively
    const tStop1 = setTimeout(() => {
      setIsReel1Stopped(true);
      setReel1Symbol('🏆');
      haptics.lightTap();
    }, 950);

    const tStop2 = setTimeout(() => {
      setIsReel2Stopped(true);
      setReel2Symbol('🏆');
      haptics.lightTap();
    }, 1200);

    const tStop3 = setTimeout(() => {
      setIsReel3Stopped(true);
      setReel3Symbol('🏆');
      haptics.success();
    }, 1450);

    // Unlocked phase
    const t2 = setTimeout(() => {
      setStage('unlocked');
      haptics.firmImpact();
    }, 1600);

    // Complete and enter mode
    const t3 = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(tStop1);
      clearTimeout(tStop2);
      clearTimeout(tStop3);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onComplete]);

  // Click to fast-forward animation immediately
  const handleFastForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completedRef.current) {
      completedRef.current = true;
      haptics.success();
      onComplete();
    }
  };

  if (!isActive) return null;

  return (
    <div
      onClick={handleFastForward}
      className="absolute inset-0 z-30 rounded-3xl bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-5 sm:p-7 select-none overflow-hidden cursor-pointer"
      title="Click anytime to skip animation"
    >
      {/* Background Animated Arcade Light Scan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent blur-2xl animate-pulse" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
      </div>

      {/* TOP HEADER: Retro Slot Marquee */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-300">
            {stage === 'inserting_coin'
              ? '🪙 INSERTING 1 CHAMPION COIN...'
              : stage === 'spinning_reels'
              ? '🎰 SLOT MACHINE SPINNING...'
              : '🔓 MODE UNLOCKED • ENTERING!'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md">
          TAP TO SKIP ⏩
        </span>
      </div>

      {/* CENTER STAGE: SLOT MACHINE & COIN DROP */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto py-2">
        <AnimatePresence mode="wait">
          {/* STAGE 1: COIN INSERTION INTO MECHANICAL BEZEL */}
          {stage === 'inserting_coin' && (
            <motion.div
              key="inserting_coin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              {/* Flying 3D Champion Coin */}
              <div className="relative h-20 w-20 flex items-center justify-center">
                <motion.div
                  initial={{ y: -60, scale: 1.3, rotateX: 0, rotateZ: -10, opacity: 1 }}
                  animate={{
                    y: [ -60, -20, 20, 50 ],
                    scale: [ 1.3, 1.1, 0.9, 0.3 ],
                    rotateX: [ 0, 45, 90, 90 ],
                    rotateZ: [ -10, 0, 15, 0 ],
                    opacity: [ 1, 1, 0.9, 0 ],
                  }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-slate-950 font-black relative"
                >
                  <Star className="w-6 h-6 fill-slate-950" />
                  <span className="text-[9px] font-mono font-black tracking-tighter">1 COIN</span>
                  <div className="absolute inset-1 rounded-full border border-yellow-100/50 pointer-events-none" />
                </motion.div>
              </div>

              {/* Arcade Coin Slot Bezel */}
              <div className="w-56 bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-3 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex flex-col items-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>CHAMPION COIN CHUTE</span>
                </div>

                {/* The Metallic Slit */}
                <div className="w-32 h-3.5 bg-black rounded-full border border-amber-500/60 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.9, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-10 h-1 bg-amber-400/80 rounded-full blur-[1px]"
                  />
                </div>

                <div className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>PAYING 1 COIN FOR UNIQUE CAREER</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: 3-REEL SLOT MACHINE ROLLING */}
          {(stage === 'spinning_reels' || stage === 'unlocked') && (
            <motion.div
              key="reels"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex flex-col items-center justify-center space-y-3 w-full max-w-xs"
            >
              {/* Retro Slot Frame */}
              <div className="w-full bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-4 border-yellow-300 rounded-3xl p-3 sm:p-4 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex flex-col items-center">
                
                {/* Marquee Sign */}
                <div className="w-full bg-slate-950 border border-yellow-300/60 rounded-xl py-1.5 px-3 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono font-black text-yellow-300 uppercase tracking-widest">
                    {stage === 'unlocked' ? '★ JACKPOT UNLOCK ★' : 'CAREER REEL'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                </div>

                {/* 3 Tumbler Reels Window */}
                <div className="grid grid-cols-3 gap-2 w-full bg-black/90 p-2.5 rounded-2xl border-2 border-yellow-400/70 shadow-inner">
                  {/* Reel 1 */}
                  <div className={`h-20 sm:h-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    isReel1Stopped ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-slate-800' : 'border-slate-700'
                  }`}>
                    <span className="text-3xl sm:text-4xl filter drop-shadow">
                      {isReel1Stopped ? '🏆' : reel1Symbol}
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase text-amber-300 mt-1">
                      {isReel1Stopped ? 'PRO' : '...'}
                    </span>
                  </div>

                  {/* Reel 2 */}
                  <div className={`h-20 sm:h-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    isReel2Stopped ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-slate-800' : 'border-slate-700'
                  }`}>
                    <span className="text-3xl sm:text-4xl filter drop-shadow">
                      {isReel2Stopped ? '🏆' : reel2Symbol}
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase text-amber-300 mt-1">
                      {isReel2Stopped ? 'STAR' : '...'}
                    </span>
                  </div>

                  {/* Reel 3 */}
                  <div className={`h-20 sm:h-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    isReel3Stopped ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-slate-800' : 'border-slate-700'
                  }`}>
                    <span className="text-3xl sm:text-4xl filter drop-shadow">
                      {isReel3Stopped ? '🏆' : reel3Symbol}
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase text-amber-300 mt-1">
                      {isReel3Stopped ? 'LEGEND' : '...'}
                    </span>
                  </div>
                </div>

                {/* Bottom Payout Status Bar */}
                <div className="w-full mt-3 py-1 px-3 bg-slate-950/80 rounded-xl border border-yellow-400/40 flex items-center justify-between text-[10px] font-mono text-amber-300">
                  <span>ENTRY: 1 COIN PAID</span>
                  <span className="text-emerald-400 font-bold">
                    {stage === 'unlocked' ? 'UNLOCKED ✅' : 'SPINNING...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM ACTION / STATUS BANNER */}
      <div className="relative z-10 w-full text-center">
        {stage === 'unlocked' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.7)]"
          >
            <Unlock className="w-4 h-4 stroke-[3]" />
            <span>UNIQUE CAREER UNLOCKED • ENTERING...</span>
          </motion.div>
        ) : (
          <div className="text-[11px] font-mono text-slate-400">
            {stage === 'inserting_coin' ? 'Inserting Champion Coin...' : 'Activating football career engine...'}
          </div>
        )}
      </div>
    </div>
  );
};
