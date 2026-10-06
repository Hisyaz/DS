import React from 'react';
import { Sparkles, Zap, ArrowRight, ShieldCheck, TrendingDown, Layers } from 'lucide-react';
import { t } from '../utils/localizationSystem';

interface OverflowChemistryExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChemistry?: number;
}

export const OverflowChemistryExplainerModal: React.FC<OverflowChemistryExplainerModalProps> = ({
  isOpen,
  onClose,
  currentChemistry = 110,
}) => {
  if (!isOpen) return null;

  const overflowPct = Math.max(0, Math.min(100, currentChemistry - 100));

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-slate-950 border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl shadow-cyan-500/20 space-y-5 my-auto text-left relative overflow-hidden">
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 bg-cyan-400" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 bg-blue-600" />

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/25 to-blue-600/30 border border-cyan-400/50 rounded-2xl text-cyan-300 shadow-lg shadow-cyan-500/20 shrink-0">
            <Sparkles className="w-7 h-7 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3 h-3 text-cyan-400" /> {t('OVERFLOW_CHEM_BADGE') || 'NEW MECHANIC • TRANSCENDENCE'}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              {t('OVERFLOW_CHEM_TITLE')}
            </h2>
            <p className="text-xs text-cyan-300/80 font-medium">
              {t('OVERFLOW_CHEM_SUBTITLE')}
            </p>
          </div>
        </div>

        {/* Interactive Visual Bar Demonstration */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {t('OVERFLOW_CHEM_METER_TITLE') || 'Overflow Synergy Meter'}
            </span>
            <span className="text-white font-mono">
              <span className="text-emerald-400 font-black">100%</span>
              <span className="text-slate-400 mx-1">+</span>
              <span className="text-cyan-400 font-black tracking-wide">
                {overflowPct > 0 ? (t('OVERFLOW_CHEM_METER_OVERFLOW', { pct: overflowPct }) || `${overflowPct}% OVERFLOW`) : (t('OVERFLOW_CHEM_METER_ZONE') || 'OVERFLOW ZONE (0–100%)')}
              </span>
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 relative p-0.5">
            {/* 100% Base Synergy Bar underneath */}
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 w-full opacity-60" />
            {/* Glowing Blue Overflow Bar filling across */}
            <div
              className="absolute inset-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 shadow-[0_0_14px_rgba(56,189,248,0.9)] border border-cyan-200/60"
              style={{ width: `${Math.max(15, overflowPct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span>{t('OVERFLOW_CHEM_BASE_LABEL') || 'Base Chemistry (100%)'}</span>
            <span className="text-cyan-300 font-bold">{t('OVERFLOW_CHEM_LAYER_LABEL') || 'Blue Overflow Layer (Max 200%)'}</span>
          </div>
        </div>

        {/* Core Rules List */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-slate-200 leading-relaxed">
              {t('OVERFLOW_CHEM_DESC_1')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-slate-200 leading-relaxed">
              {t('OVERFLOW_CHEM_DESC_2')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <TrendingDown className="w-4 h-4" />
            </div>
            <p className="text-slate-200 leading-relaxed">
              {t('OVERFLOW_CHEM_DESC_3')}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-sky-200 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{t('OVERFLOW_CHEM_BUTTON')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
