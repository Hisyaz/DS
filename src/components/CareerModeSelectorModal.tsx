import React from 'react';
import { KeyMatchPlayMode, CAREER_PLAY_MODES } from '../utils/matchImportanceSystem';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePickerButton } from './LanguagePickerModal';
import { Trophy, Flame, Gauge, CheckCircle2, Sparkles, ChevronRight, Check } from 'lucide-react';

interface CareerModeSelectorModalProps {
  isOpen: boolean;
  currentMode?: KeyMatchPlayMode;
  onSelectMode: (mode: KeyMatchPlayMode) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const CareerModeSelectorModal: React.FC<CareerModeSelectorModalProps> = ({
  isOpen,
  currentMode = 'decisive',
  onSelectMode,
  onClose,
  isInitialSetup = false,
}) => {
  const { t } = useLanguage();
  const [selected, setSelected] = React.useState<KeyMatchPlayMode>(currentMode || 'decisive');

  if (!isOpen) return null;

  const modes: KeyMatchPlayMode[] = ['slow', 'decisive', 'finals_only'];

  const handleConfirm = () => {
    onSelectMode(selected);
    if (onClose) onClose();
  };

  const getModeStyles = (modeKey: KeyMatchPlayMode, isSelected: boolean) => {
    switch (modeKey) {
      case 'slow':
        return {
          themeColor: 'blue',
          cardClass: isSelected
            ? 'bg-sky-950/70 border-2 border-sky-400 pixel-bevel-cyan shadow-[0_0_25px_rgba(56,189,248,0.3)] ring-1 ring-sky-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-sky-500/60 pixel-bevel-raised hover:bg-sky-950/20',
          titleColor: 'text-sky-300',
          badgeClass: 'bg-sky-950 text-sky-300 border border-sky-500 pixel-bevel-cyan',
          iconColor: 'text-sky-400',
          buttonClass: isSelected
            ? 'bg-sky-400 text-slate-950 font-black pixel-bevel-cyan'
            : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 pixel-bevel-raised',
          frequencyText: t('Play 100% of Matches (Every Match is Interactive)'),
        };
      case 'decisive':
        return {
          themeColor: 'green',
          cardClass: isSelected
            ? 'bg-emerald-950/70 border-2 border-emerald-400 pixel-bevel-emerald shadow-[0_0_25px_rgba(52,211,153,0.3)] ring-1 ring-emerald-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-emerald-500/60 pixel-bevel-raised hover:bg-emerald-950/20',
          titleColor: 'text-emerald-300',
          badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-500 pixel-bevel-emerald',
          iconColor: 'text-emerald-400',
          buttonClass: isSelected
            ? 'bg-emerald-400 text-slate-950 font-black pixel-bevel-emerald'
            : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 pixel-bevel-raised',
          frequencyText: t('Play ~30% Stakes (Finals, Derbies & Title Deciders)'),
        };
      case 'finals_only':
        return {
          themeColor: 'red',
          cardClass: isSelected
            ? 'bg-rose-950/70 border-2 border-rose-400 pixel-bevel-crimson shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-rose-500/60 pixel-bevel-raised hover:bg-rose-950/20',
          titleColor: 'text-rose-300',
          badgeClass: 'bg-rose-950 text-rose-300 border border-rose-500 pixel-bevel-crimson',
          iconColor: 'text-rose-400',
          buttonClass: isSelected
            ? 'bg-rose-400 text-slate-950 font-black pixel-bevel-crimson'
            : 'bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 pixel-bevel-raised',
          frequencyText: t('Play ~10% Finals Only (Trophy & Survival Games)'),
        };
    }
  };

  return (
    <div id="career-mode-selector-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/95 backdrop-blur-sm animate-fade-in text-left overflow-y-auto custom-scrollbar select-none font-mono">
      {/* 32-Bit Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40 z-0" />

      <div id="career-mode-selector-modal-card" className="bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-4 sm:p-6 max-w-4xl w-full shadow-[0_0_35px_rgba(245,158,11,0.35)] space-y-4 sm:space-y-5 relative overflow-hidden my-auto z-10">
        {/* HEADER - 32-BIT RETRO */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 sm:pb-4 gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950 border border-amber-500 pixel-bevel-gold text-[10px] font-mono font-black uppercase text-amber-300 tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isInitialSetup ? t('NEW UNIQUE CAREER CONFIGURATION') : t('CAREER MATCH ENGINE SETTINGS')}</span>
            </div>
            <h2 id="career-mode-modal-title" className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow flex items-center gap-2">
              <span>{t('Select Match Importance Mode')}</span>
              <span className="text-amber-400">⚡</span>
            </h2>
            <p id="career-mode-modal-subtitle" className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {t('Choose how frequently you step onto the pitch for interactive')}{' '}
              <span className="text-amber-300 font-bold">{t('Key Matches')}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguagePickerButton />
            {onClose && !isInitialSetup && (
              <button
                id="career-mode-btn-close"
                type="button"
                onClick={onClose}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 pixel-bevel-raised text-xs font-bold transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                title={t('CLOSE')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3 COLOR-CODED 32-BIT MODE BOXES (CYAN, EMERALD, CRIMSON) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {modes.map((modeKey) => {
            const mode = CAREER_PLAY_MODES[modeKey];
            const isSelected = selected === modeKey;
            const style = getModeStyles(modeKey, isSelected);

            return (
              <div
                key={modeKey}
                id={`career-mode-option-${modeKey}`}
                onClick={() => setSelected(modeKey)}
                className={`relative flex flex-col justify-between p-4 sm:p-5 transition-all duration-150 cursor-pointer space-y-3.5 active:scale-[0.99] ${style.cardClass}`}
              >
                {/* TOP HEADER & BADGES */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 ${style.badgeClass}`}>
                      {t(mode.badge)}
                    </span>

                    {mode.recommendedTag && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-400 text-slate-950 pixel-bevel-gold font-mono">
                        ★ {t(mode.recommendedTag)}
                      </span>
                    )}
                  </div>

                  {/* TITLE & ICON */}
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base sm:text-lg font-black uppercase tracking-wider pixel-text-shadow ${style.titleColor}`}>
                      {t(mode.name)}
                    </h3>
                    <div className={style.iconColor}>
                      {modeKey === 'slow' ? (
                        <Gauge className="w-5 h-5" />
                      ) : modeKey === 'decisive' ? (
                        <Flame className="w-5 h-5" />
                      ) : (
                        <Trophy className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* TAGLINE */}
                  <p className="text-xs font-bold text-slate-100 leading-snug">
                    {t(mode.tagline)}
                  </p>

                  {/* DESCRIPTION */}
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal bg-slate-950/70 p-2 border border-slate-800/80">
                    {t(mode.description)}
                  </p>

                  {/* BULLET HIGHLIGHTS */}
                  <ul className="space-y-1.5 pt-1">
                    {mode.highlights.map((h, i) => (
                      <li key={i} className="text-[10px] sm:text-[11px] text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${style.iconColor}`} />
                        <span>{t(h)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BOTTOM ACTION & 32-BIT SELECT BUTTON */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {modeKey === 'slow' ? t('100% Matches') : modeKey === 'decisive' ? t('~30% High Stakes') : t('~10% Finals Only')}
                  </span>

                  <button
                    id={`career-mode-btn-select-${modeKey}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(modeKey);
                    }}
                    className={`px-3 py-1 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${style.buttonClass}`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{t('SELECTED')}</span>
                      </>
                    ) : (
                      <span>{t('SELECT')}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 32-BIT FOOTER ACTION DOCK */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t-2 border-slate-800 gap-3">
          <div id="career-mode-active-summary" className="text-xs text-slate-300 text-center sm:text-left font-mono">
            {t('Active Mode:')} <strong className="text-amber-400 uppercase">{t(CAREER_PLAY_MODES[selected].name)}</strong> — {t(CAREER_PLAY_MODES[selected].badge)}
          </div>

          <button
            id="career-mode-btn-confirm"
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isInitialSetup ? t('Confirm Career Mode & Continue') : t('Save Match Settings')}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
