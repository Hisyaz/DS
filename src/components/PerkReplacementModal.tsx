import React, { useState } from 'react';
import { CareerPerk, getActivePerks, getLocalizedPerk } from '../utils/perksSystem';
import { PlayerCardData } from '../types';
import { PerkIcon } from './PerkIcon';
import { AlertTriangle, ArrowRight, Check, X, ShieldAlert, Trash2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PerkReplacementModalProps {
  player: PlayerCardData;
  newPerk: CareerPerk;
  isForced?: boolean;
  onReplace: (oldPerkId: string, newPerkId: string) => void;
  onDiscard: (discardedPerkId: string) => void;
  onClose: () => void;
}

export const PerkReplacementModal: React.FC<PerkReplacementModalProps> = ({
  player,
  newPerk,
  isForced = false,
  onReplace,
  onDiscard,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const isMandatory = isForced || newPerk.id === 'snake';
  const locNewPerk = getLocalizedPerk(newPerk, language);
  const rawActivePerks = getActivePerks(player);
  const activePerks = rawActivePerks.map((p) => getLocalizedPerk(p, language));
  const [selectedOldPerk, setSelectedOldPerk] = useState<CareerPerk | null>(null);
  const [showReplaceConfirmation, setShowReplaceConfirmation] = useState<boolean>(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState<boolean>(false);

  const handleConfirmReplace = () => {
    if (selectedOldPerk) {
      onReplace(selectedOldPerk.id, newPerk.id);
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    if (isMandatory) return;
    onDiscard(newPerk.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl text-white max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Close Button */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer z-10"
            title="Close without changes"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {isMandatory
              ? (t('MANDATORY_PERK_ASSIGNMENT') || 'MANDATORY PERK ASSIGNMENT • SLOTS FULL')
              : (t('PERK_CAPACITY_REACHED') || 'PERK CAPACITY REACHED (5/5)')}
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
            {isMandatory
              ? (t('REPLACE_PERK_WITH', { name: locNewPerk.name }) || `REPLACE AN ACTIVE PERK WITH "${locNewPerk.name}"`)
              : (t('MANAGE_NEW_PERK', { name: locNewPerk.name }) || `MANAGE NEW PERK: "${locNewPerk.name}"`)}
          </h2>
          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
            {isMandatory
              ? (t('MANDATORY_PERK_NOTICE') ||
                  'This career trait is mandatory and cannot be declined. Select which existing perk to permanently replace and deactivate.')
              : (t('VOLUNTARY_PERK_NOTICE') ||
                  'Your 5 active perk slots are full. You can select an existing perk to permanently replace, or discard this new perk.')}
          </p>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-16 sm:pb-4 space-y-4">
          {/* New Perk Showcase Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
              <PerkIcon iconName={locNewPerk.iconName} className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-black text-white">{locNewPerk.name}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 uppercase">
                  {locNewPerk.category}
                </span>
              </div>
              <p className="text-xs text-slate-300">{locNewPerk.shortDescription}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-1">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                  <span className="font-black text-emerald-400 uppercase block text-[10px]">✨ Benefit:</span>
                  <span className="font-semibold text-slate-200">{locNewPerk.effect}</span>
                </div>
                <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-[11px] text-sky-300">
                  <span className="font-black text-sky-400 uppercase block text-[10px]">🎯 How Obtained:</span>
                  <span className="font-medium text-slate-300">{locNewPerk.howToObtain}</span>
                </div>
              </div>
            </div>
          </div>

          {/* OPTION 1: DISCARD NEW PERK & KEEP CURRENT 5 (Hidden if Mandatory) */}
          {!isMandatory ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-2 border-slate-700 hover:border-amber-400/60 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>OPTION A: Keep Current 5 Perks</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                      No Changes
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Discard <strong className="text-amber-300 font-bold">{locNewPerk.name}</strong> and preserve your entire existing 5-perk lineup.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowReplaceConfirmation(false);
                  setSelectedOldPerk(null);
                  setShowDiscardConfirmation(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 shrink-0"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Discard {locNewPerk.name}</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center flex items-center justify-center gap-2 text-rose-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Judas perk is mandatory. Select an active perk below to replace.</span>
            </div>
          )}

          {/* DISCARD CONFIRMATION BANNER */}
          {showDiscardConfirmation && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/80 text-center animate-fadeIn shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span>CONFIRM DISCARD NEW PERK</span>
              </div>
              <p className="text-xs text-slate-200 mb-2">
                Are you sure you want to discard <span className="font-extrabold text-amber-300">{locNewPerk.name}</span> and keep your current <span className="font-extrabold text-emerald-300">5 active perks</span>?
              </p>
              <div className="text-[11px] text-slate-300 mb-4 bg-black/40 p-2.5 rounded-lg border border-slate-800">
                Current 5 active perks retained: <strong className="text-emerald-300">{activePerks.map((p) => p.name).join(' • ')}</strong>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDiscardConfirmation(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-extrabold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                >
                  BACK
                </button>
                <button
                  onClick={handleConfirmDiscard}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-950 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> CONFIRM DISCARD & KEEP 5
                </button>
              </div>
            </div>
          )}

          {/* OPTION 2: REPLACE 1 ACTIVE PERK */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>OPTION B: CHOOSE ACTIVE PERK TO REPLACE (1 OF 5)</span>
              </h3>
              <span className="text-[10px] text-rose-300 font-bold">Slot Limit: 5/5</span>
            </div>

            {/* Notice Box */}
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Warning:</strong> Replaced perks become permanently deactivated and can never be reactivated later in your career.
              </span>
            </div>

            <div className="space-y-2">
              {activePerks.map((perk, idx) => {
                const isSelected = selectedOldPerk?.id === perk.id;
                return (
                  <div
                    key={perk.id}
                    onClick={() => {
                      setShowDiscardConfirmation(false);
                      setSelectedOldPerk(perk);
                      setShowReplaceConfirmation(true);
                    }}
                    className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-950/50 scale-[1.01]'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-black text-slate-400 w-8 text-center shrink-0">
                      SLOT {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0">
                      <PerkIcon iconName={perk.iconName} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{perk.name}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                          {perk.category}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-semibold truncate mt-0.5">✨ Benefit: {perk.effect}</p>
                      <p className="text-[11px] text-slate-400 truncate">🎯 Source: {perk.howToObtain}</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-700 text-slate-300 hover:bg-rose-700 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'REPLACE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REPLACEMENT CONFIRMATION BANNER */}
          {showReplaceConfirmation && selectedOldPerk && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/80 text-center animate-fadeIn shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span>CONFIRM PERK REPLACEMENT</span>
              </div>
              <p className="text-xs text-slate-200 mb-3">
                Replace <span className="font-extrabold text-rose-300">{selectedOldPerk.name}</span> with{' '}
                <span className="font-extrabold text-amber-300">{locNewPerk.name}</span>?
              </p>
              <div className="text-[11px] text-rose-300/80 mb-4 bg-black/40 p-2 rounded-lg italic">
                "{selectedOldPerk.name}" will be permanently deactivated and can NEVER be reactivated again!
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowReplaceConfirmation(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-extrabold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmReplace}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-950 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> CONFIRM REPLACEMENT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
  </svg>
);

