import React, { useState, useEffect } from 'react';
import { PlayerConfig } from '../types';
import { Building2, Home, ArrowRight } from 'lucide-react';
import { isPerformanceModeActive, shouldDisableAnimations } from '../utils/graphicSettingsSystem';
import { useLanguage } from '../context/LanguageContext';

interface YouthClubCinematicModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  isBigClub: boolean;
  onProceed: () => void;
}

export const YouthClubCinematicModal: React.FC<YouthClubCinematicModalProps> = ({
  isOpen,
  player,
  isBigClub,
  onProceed,
}) => {
  const { t } = useLanguage();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const localText =
    t('YOUTH_CINEMATIC_LOCAL_TEXT') ||
    `Tu viaje empieza cerca de casa.\n\nEste es el club de barrio por el que pasaste caminando mil veces.\n\nTe acordás de ver a los chicos más grandes jugar acá y soñar con ponerte la misma camiseta.\n\nAhora, por primera vez, entrás a esta cancha siendo uno de ellos.\n\nEl viaje empieza acá.`;

  const bigClubText =
    t('YOUTH_CINEMATIC_BIG_CLUB_TEXT') ||
    `Tu viaje empieza con sacrificio.\n\nCada entrenamiento te exige un viaje larguísimo, a casi tres horas de tu casa.\n\nEl viaje es agotador, pero el momento en que pisás el predio todo cobra sentido.\n\nEste es un escenario mucho más grande.\n\nEl nivel es altísimo.\n\nAhora tenés que demostrar que estás a la altura.`;

  const fullText = isBigClub ? bigClubText : localText;

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTypingComplete(false);
      return;
    }

    // In performance mode or with animations disabled, show immediately without lag
    if (isPerformanceModeActive() || shouldDisableAnimations()) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    // Fast, ultra-responsive typewriter pacing using requestAnimationFrame / time delta to avoid background throttling
    const startTime = performance.now();
    const charsPerSec = 180; // 180 chars per second
    let animId: number;

    const tick = (now: number) => {
      if (isPerformanceModeActive() || shouldDisableAnimations()) {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
        return;
      }
      const elapsed = (now - startTime) / 1000;
      currentIndex = Math.min(fullText.length, Math.floor(elapsed * charsPerSec) + 6);
      setDisplayedText(fullText.slice(0, currentIndex));

      if (currentIndex < fullText.length) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isOpen, fullText]);

  const handleSkipTyping = () => {
    if (!isTypingComplete) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
    }
  };

  // Keyboard shortcut: Space or Enter to reveal text or proceed
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!isTypingComplete) {
          e.preventDefault();
          handleSkipTyping();
        } else {
          e.preventDefault();
          onProceed();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTypingComplete, fullText, onProceed]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-500 font-pixel select-none cursor-pointer"
      onClick={!isTypingComplete ? handleSkipTyping : undefined}
    >
      <div className="bg-slate-950 border-2 border-amber-500 pixel-corners pixel-bevel-gold max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-center relative overflow-hidden cursor-default" onClick={(e) => { if (!isTypingComplete) { e.stopPropagation(); handleSkipTyping(); } }}>
        {/* Top Header Badge & Title (Fixed Header) */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-800 shrink-0 bg-slate-950 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 pixel-corners bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mx-auto font-arcade">
            {isBigClub ? <Building2 className="w-3.5 h-3.5 text-amber-400" /> : <Home className="w-3.5 h-3.5 text-blue-400" />}
            {isBigClub
              ? t('JOINING_BIG_ACADEMY') || 'INCORPORACIÓN A GRAN ACADEMIA JUVENIL'
              : t('JOINING_LOCAL_CLUB') || 'INCORPORACIÓN AL CLUB DE BARRIO LOCAL'}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight pixel-text-shadow">
              {player.club || 'Youth Academy'}
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-400 font-retro tracking-widest uppercase">
              {player.city || 'Home City'} • {t('YOUTH_LEAGUE_U10') || 'LIGA JUVENIL U10'}
            </p>
          </div>
        </div>

        {/* Typewriter Story Box (Scrollable Body) */}
        <div 
          className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10 cursor-pointer"
          onClick={handleSkipTyping}
          title={!isTypingComplete ? 'Click to reveal entire narrative instantly' : undefined}
        >
          <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-4 sm:p-6 min-h-[160px] text-left text-slate-100 font-mono text-xs sm:text-sm md:text-base leading-relaxed shadow-inner whitespace-pre-line relative select-text transition-colors hover:border-slate-600">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2.5 h-4 sm:h-5 ml-1 bg-amber-400 animate-pulse align-middle shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            )}
            {!isTypingComplete && (
              <div className="mt-3 text-[10px] text-amber-400/80 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2 select-none">
                <span>⚡ {t('FAST_CINEMATIC_TEXT') || 'Texto Cinemático Rápido'}</span>
                <span className="hover:underline font-bold">{t('CLICK_OR_SPACE_SKIP') || 'TOCAR O ESPACIO PARA SALTEAR ▶'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skip / Proceed Button (Fixed Footer) */}
        <div className="p-3 sm:p-4 border-t-2 border-slate-800 bg-slate-950 shrink-0 flex justify-center pb-8 sm:pb-4 relative z-10">
          <button
            onClick={onProceed}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group uppercase font-pixel"
          >
            <span>{t('MEET_YOUR_YOUTH_MANAGER') || 'CONOCÉ A TU DT JUVENIL'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
