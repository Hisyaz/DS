import React, { useState, useEffect } from 'react';
import { PARENT_ADVICE_EFFECTS } from '../utils/parentCardSystem';
import { ParentAdviceEffect } from '../types/parentCards';
import { Heart, Sparkles, Check, Crown, ShieldAlert, Award, Zap, RefreshCw, X } from 'lucide-react';

interface ParentAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIconicUpgraded: boolean;
  onApplyAdvice: (effect: ParentAdviceEffect) => void;
}

export const ParentAdviceModal: React.FC<ParentAdviceModalProps> = ({
  isOpen,
  onClose,
  isIconicUpgraded,
  onApplyAdvice,
}) => {
  const [selectedEffectId, setSelectedEffectId] = useState<string>(PARENT_ADVICE_EFFECTS[0].id);
  const [randomRolledEffect, setRandomRolledEffect] = useState<ParentAdviceEffect>(() => {
    return PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)];
  });

  // Whenever modal opens, ensure we have an active rolled advice ready
  useEffect(() => {
    if (isOpen) {
      setRandomRolledEffect(
        PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)]
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRollRandom = () => {
    const rolled = PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)];
    setRandomRolledEffect(rolled);
  };

  const activeEffect = isIconicUpgraded
    ? PARENT_ADVICE_EFFECTS.find((e) => e.id === selectedEffectId) || PARENT_ADVICE_EFFECTS[0]
    : randomRolledEffect;

  const handleConfirm = () => {
    onApplyAdvice(activeEffect);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div 
        className="w-full max-w-xl bg-slate-950 border-4 border-amber-500 pixel-corners pixel-bevel-gold shadow-[0_0_50px_rgba(245,158,11,0.4)] p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro scanline & header glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-black pointer-events-none" />

        {/* Header (Fixed) */}
        <div className="border-b-2 border-slate-800 pb-3 shrink-0 flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-950 border border-rose-500/60 text-rose-300 text-[10px] font-pixel uppercase tracking-wider pixel-corners">
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
              <span>PERK • PARENTS' GUIDANCE</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-arcade text-white tracking-wide uppercase pixel-text-shadow">
              {isIconicUpgraded ? '👑 ICONIC PARENT: SELECT ADVICE' : 'ASK PARENTS FOR ADVICE'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center pixel-corners hover:border-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="py-4 space-y-4 flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <p className="text-xs font-retro text-slate-300 leading-relaxed">
            {isIconicUpgraded
              ? 'Because your parent card is upgraded to Iconic, you have the rare privilege of choosing exactly which piece of advice fits your current career needs best.'
              : 'Your parents provide heartfelt guidance based on their life experience. Receive their blessing to boost morale, recover energy, or sharpen composure.'}
          </p>

          {isIconicUpgraded ? (
            /* Iconic: Choice Grid */
            <div className="space-y-2">
              <span className="text-[10px] font-arcade font-black text-amber-400 uppercase tracking-wider block">
                CHOOSE ONE ACTIVE COUNSEL:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {PARENT_ADVICE_EFFECTS.map((effect) => {
                  const isSelected = selectedEffectId === effect.id;
                  return (
                    <div
                      key={effect.id}
                      onClick={() => setSelectedEffectId(effect.id)}
                      className={`p-3 border-2 pixel-corners cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-400 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 pixel-bevel-raised'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black font-arcade text-white uppercase">
                          {effect.title}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-pixel px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black pixel-corners">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-retro text-slate-300">
                        {effect.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Non-Iconic: Active Advice Display with Re-roll option */
            <div className="space-y-3">
              <div className="bg-slate-900 border-2 border-emerald-500/60 pixel-corners pixel-bevel-sunken p-4 text-center space-y-2 relative shadow-inner">
                <div className="w-10 h-10 pixel-corners bg-emerald-900/60 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto pixel-bevel-raised">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[9px] font-pixel uppercase tracking-widest text-emerald-400 block">
                  ADVICE FROM HOME READY
                </span>
                <h4 className="text-sm sm:text-base font-black font-arcade text-white uppercase tracking-wide">
                  {activeEffect.title}
                </h4>
                <p className="text-xs font-retro text-slate-200 max-w-md mx-auto leading-relaxed">
                  {activeEffect.description}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleRollRandom}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-amber-300 text-[10px] font-arcade uppercase tracking-wider pixel-corners flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Ask For Different Advice</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer (Always Visible & Clickable) */}
        <div className="pt-3 border-t-2 border-slate-800 bg-slate-950 shrink-0 flex items-center justify-end gap-2.5 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-arcade border border-slate-700 px-4 py-2.5 pixel-corners text-xs uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black font-arcade px-6 py-2.5 pixel-corners pixel-bevel-gold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer active:translate-y-0.5 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ACCEPT & APPLY ADVICE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
