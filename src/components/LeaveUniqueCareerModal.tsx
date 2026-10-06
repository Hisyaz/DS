import React from 'react';
import { LogOut, Save, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LeaveUniqueCareerModalProps {
  isOpen: boolean;
  onSaveAndReturn: () => void;
  onReturnWithoutSaving: () => void;
  onCancel: () => void;
  isCharacterCreation?: boolean;
  activeSlotId?: number;
}

export const LeaveUniqueCareerModal: React.FC<LeaveUniqueCareerModalProps> = ({
  isOpen,
  onSaveAndReturn,
  onReturnWithoutSaving,
  onCancel,
  isCharacterCreation = false,
  activeSlotId = 1,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide">
                {isCharacterCreation
                  ? t('EXIT_CHARACTER_CREATION') || 'EXIT CHARACTER CREATION?'
                  : t('LEAVE_UNIQUE_CAREER') || 'LEAVE UNIQUE CAREER?'}
              </h2>
              <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                {isCharacterCreation
                  ? t('CHOOSE_SAVE_OR_DISCARD_DRAFT') || 'Choose whether to save your character draft or discard it.'
                  : `${t('ACTIVE_SAVE_SLOT') || 'Active Save Slot'}: Slot ${activeSlotId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-3.5 space-y-2">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {isCharacterCreation
                ? (t('DISCARD_CHARACTER_WARNING', { slot: activeSlotId }) ||
                    `Returning without saving will discard unconfirmed character setup changes. Select SAVE & RETURN to preserve your progress in Slot ${activeSlotId}.`)
                : (t('SAVE_BEFORE_MENU_PROMPT', { slot: activeSlotId }) ||
                    `Save your career progress to Slot ${activeSlotId} before returning to the Main Menu, or exit without saving.`)}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2 pt-3 mt-1 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            onClick={onSaveAndReturn}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {t('SAVE_AND_RETURN') || 'SAVE & RETURN'} (SLOT {activeSlotId})
          </button>

          <button
            onClick={onReturnWithoutSaving}
            className="w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-rose-800/60 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('RETURN_TO_MENU_WITHOUT_SAVING') || 'RETURN TO MENU WITHOUT SAVING'}
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            {t('CANCEL') || 'CANCEL'}
          </button>
        </div>
      </div>
    </div>
  );
};
