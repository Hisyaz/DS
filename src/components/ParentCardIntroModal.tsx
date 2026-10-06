import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ParentCardInstance } from '../types/parentCards';
import { getParentCardIntroStory, isWastedTalentArchetype } from '../utils/parentCardIntroSystem';
import { getRarityBadgeText } from '../utils/parentCardSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  FastForward,
  ChevronRight,
  Sparkles,
  Flame,
  AlertTriangle,
  ScrollText,
  Check,
  Zap,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';
import { isPerformanceModeActive, shouldDisableAnimations } from '../utils/graphicSettingsSystem';

interface ParentCardIntroModalProps {
  card: ParentCardInstance;
  playerType?: string;
  onConfirm: () => void;
}

export const ParentCardIntroModal: React.FC<ParentCardIntroModalProps> = ({
  card,
  playerType,
  onConfirm,
}) => {
  const { language, t } = useLanguage();
  const isWasted = isWastedTalentArchetype(playerType);

  // Story Text based on parent card type, rarity tier, player archetype, and language
  const fullStoryText = getParentCardIntroStory(card.typeId, card.rarity, playerType, language);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const textEndRef = useRef<HTMLDivElement | null>(null);

  // Fluid, fast, letter-by-letter typewriter effect with natural literary cadence
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    if (!fullStoryText) {
      setIsTypingComplete(true);
      return;
    }

    if (isPerformanceModeActive() || shouldDisableAnimations()) {
      setDisplayedText(fullStoryText);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    const startTime = performance.now();
    const charsPerSec = 160; // snappier, responsive typing
    let animId: number;

    const tick = (now: number) => {
      // Re-check performance mode dynamically in case toggled during session
      if (isPerformanceModeActive() || shouldDisableAnimations()) {
        setDisplayedText(fullStoryText);
        setIsTypingComplete(true);
        return;
      }

      const elapsed = (now - startTime) / 1000;
      currentIndex = Math.min(fullStoryText.length, Math.floor(elapsed * charsPerSec) + 4);
      setDisplayedText(fullStoryText.slice(0, currentIndex));

      if (currentIndex < fullStoryText.length) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayedText(fullStoryText);
        setIsTypingComplete(true);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [fullStoryText]);

  // Gentle auto-scroll to keep newly written lines in view during typing (disabled in performance mode to avoid reflow)
  useEffect(() => {
    if (!isTypingComplete && textEndRef.current && containerRef.current && !isPerformanceModeActive()) {
      const el = containerRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
      if (isNearBottom) {
        textEndRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [displayedText, isTypingComplete]);

  const handleSkipTyping = useCallback(() => {
    setDisplayedText(fullStoryText);
    setIsTypingComplete(true);
    haptics.buttonPress();
  }, [fullStoryText]);

  const handleProceed = useCallback(() => {
    haptics.success();
    onConfirm();
  }, [onConfirm]);

  // Keyboard navigation: Space or Enter reveals text or proceeds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isTypingComplete) {
          handleSkipTyping();
        } else {
          handleProceed();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTypingComplete, handleSkipTyping, handleProceed]);

  const getRarityBadgeStyle = () => {
    switch (card.rarity) {
      case 'iconic':
        return 'bg-amber-950 text-amber-300 border-amber-400 pixel-bevel-gold';
      case 'legendary':
        return 'bg-purple-950 text-purple-300 border-purple-400 pixel-bevel-raised';
      case 'gold':
        return 'bg-yellow-950 text-yellow-300 border-yellow-400 pixel-bevel-gold';
      case 'silver':
        return 'bg-slate-800 text-slate-200 border-slate-400 pixel-bevel-raised';
      default:
        return 'bg-amber-950 text-amber-300 border-amber-700 pixel-bevel-gold';
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((displayedText.length / Math.max(1, fullStoryText.length)) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-[10000] bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 lg:p-8 select-none overflow-hidden"
      onClick={!isTypingComplete ? handleSkipTyping : undefined}
    >
      {/* Retro 32-Bit Scanline & Vignette Atmosphere */}
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-25" />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isWasted
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950/80 to-slate-950'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950/80 to-slate-950'
        }`}
      />

      {/* Main Theatrical Screen Stage */}
      <div
        className={`bg-slate-950/95 border-2 sm:border-4 ${
          isWasted
            ? 'border-red-600 pixel-bevel-crimson shadow-[0_0_80px_rgba(225,29,72,0.45)]'
            : 'border-amber-500 pixel-bevel-gold shadow-[0_0_75px_rgba(245,158,11,0.35)]'
        } pixel-corners w-full max-w-5xl xl:max-w-6xl h-full max-h-[96vh] sm:max-h-[94vh] relative overflow-hidden flex flex-col my-auto text-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================================= */}
        {/* 1. THEATRICAL RETRO HEADER BAR                                          */}
        {/* ======================================================================= */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-800 px-4 sm:px-6 py-3 bg-slate-950/90 shrink-0 relative z-10 flex-wrap">
          {/* Left Metadata & Archetype Badge */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-black font-pixel border pixel-corners ${getRarityBadgeStyle()}`}
              >
                {card.rarity === 'iconic' ? '★ ICONIC' : card.rarity.toUpperCase()} PARENT
              </span>

              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-pixel bg-slate-900 border border-slate-700 text-slate-300 pixel-corners">
                🌱 AGE 10 PROLOGUE
              </span>

              {isWasted ? (
                <span className="px-2.5 py-0.5 text-[9px] sm:text-[10px] font-pixel font-bold bg-red-950 text-red-300 border border-red-600 pixel-corners flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  {t('WASTED_TALENT_BAD_BOY') || 'WASTED TALENT • BAD BOY'}
                </span>
              ) : (
                <span className="text-[10px] font-black font-arcade text-amber-400 flex items-center gap-1.5 uppercase">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  {t('CHILDHOOD_ORIGIN_STORY') || 'CHILDHOOD ORIGIN STORY'}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-lg md:text-xl font-black font-arcade text-white uppercase tracking-wider truncate pixel-text-shadow">
              {getRarityBadgeText(card.rarity, card.name)}
            </h2>
          </div>

          {/* Right Heritage & Quick Actions */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-pixel text-slate-400 block uppercase">
                HERITAGE ARCHIVE
              </span>
              <span className="text-xs sm:text-sm font-black font-arcade text-amber-300">
                {card.name}
              </span>
            </div>

            {!isTypingComplete && (
              <button
                type="button"
                onClick={handleSkipTyping}
                className="px-3 py-1.5 text-[10px] font-arcade uppercase tracking-wider text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 pixel-corners pixel-bevel-raised flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
                title="Reveal all text immediately"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('INSTANT_REVEAL') || 'INSTANT REVEAL'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. PROLOGUE THEMATIC BANNER (VOLATILE GENIUS VS NOBLE ROOTS)             */}
        {/* ======================================================================= */}
        <div className="px-4 sm:px-6 pt-3 pb-1 shrink-0 relative z-10">
          {isWasted ? (
            <div className="bg-gradient-to-r from-red-950/95 via-rose-950/90 to-red-950/95 border-2 border-red-600/90 p-3 sm:p-4 pixel-corners pixel-bevel-crimson flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 shrink-0 animate-pulse" />
              <div className="text-xs sm:text-sm font-retro text-red-100 leading-snug">
                <span className="font-arcade font-black text-red-300 uppercase block tracking-wider mb-0.5">
                  {t('VOLATILE_GENIUS_TITLE') || 'VOLATILE GENIUS: GIFTED PROBLEM KID (AGE 10)'}
                </span>
                {t('VOLATILE_GENIUS_DESC') ||
                  'Transcendent generational football touch and god-given instincts, burdened by an uncontrollable temper, brawls, and disciplinary friction.'}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 border-2 border-amber-500/60 p-3 sm:p-4 pixel-corners pixel-bevel-gold flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <div className="text-xs sm:text-sm font-retro text-amber-100 leading-snug">
                <span className="font-arcade font-black text-amber-300 uppercase block tracking-wider mb-0.5">
                  {t('FOUNDATIONAL_HERITAGE_TITLE') || 'FOUNDATIONAL HERITAGE • AGE 10 PROLOGUE'}
                </span>
                {t('FOUNDATIONAL_HERITAGE_DESC') ||
                  'The early habits, family environment, and raw instinct that forged your football identity before entering the academy trials.'}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 3. EXPANSIVE FULL-SCREEN STORY READING CANVAS                           */}
        {/* ======================================================================= */}
        <div
          ref={containerRef}
          className="p-4 sm:p-8 md:p-12 lg:p-16 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar relative z-10 cursor-pointer flex flex-col justify-start"
          onClick={!isTypingComplete ? handleSkipTyping : undefined}
          title={!isTypingComplete ? 'Click anywhere to reveal text immediately' : undefined}
        >
          <div className="w-full max-w-4xl lg:max-w-5xl mx-auto my-auto py-2">
            <p className="text-base sm:text-xl md:text-2xl lg:text-[26px] text-slate-100 font-retro leading-relaxed sm:leading-[1.95] md:leading-[2.1] tracking-wide relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {displayedText}

              {/* High-Fidelity Typewriter Cursor */}
              {!isTypingComplete && (
                <span
                  className={`inline-block w-2.5 sm:w-3.5 h-[1.15em] ml-1.5 align-middle ${
                    isWasted
                      ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                      : 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                  } animate-pulse`}
                />
              )}
            </p>

            <div ref={textEndRef} className="h-6 shrink-0" />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. REAL-TIME STORY WRITING PROGRESS BAR                                  */}
        {/* ======================================================================= */}
        <div className="w-full h-1.5 bg-slate-900 border-t border-slate-800 shrink-0 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isWasted
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ======================================================================= */}
        {/* 5. FIXED TACTILE FOOTER BAR WITH PROCEED CONTROLS                       */}
        {/* ======================================================================= */}
        <div className="border-t-2 border-slate-800 px-4 sm:px-6 py-3.5 bg-slate-950 flex items-center justify-between gap-3 shrink-0 relative z-10 flex-wrap sm:flex-nowrap">
          {/* Status & Keyboard Hint */}
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            {isTypingComplete ? (
              <span className="font-retro text-emerald-400 flex items-center gap-1.5 font-bold truncate">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {t('STORY_REVEALED_PROCEED') ||
                  'Origin Story Revealed • Ready for Early Career Choices'}
              </span>
            ) : (
              <span className="font-retro text-amber-300 flex items-center gap-1.5 truncate">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                {t('WRITING_STORY_LETTER_BY_LETTER') ||
                  'Writing childhood origin story letter by letter...'}
              </span>
            )}

            <span className="text-[10px] font-retro text-slate-500 hidden md:inline ml-2">
              (Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-300 text-[9px] pixel-corners">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-300 text-[9px] pixel-corners">ENTER</kbd>)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 ml-auto w-full sm:w-auto shrink-0 justify-end">
            {!isTypingComplete ? (
              <button
                type="button"
                onClick={handleSkipTyping}
                className="flex-1 sm:flex-initial px-4 py-2.5 pixel-corners bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-arcade text-xs uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all"
              >
                {t('INSTANT_REVEAL') || 'INSTANT REVEAL'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleProceed}
              className={`flex-1 sm:flex-initial px-6 py-2.5 pixel-corners ${
                isWasted
                  ? 'pixel-bevel-crimson bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)]'
                  : 'pixel-bevel-gold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              } font-black font-arcade text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all`}
            >
              <span>{t('CONTINUE_TO_EARLY_CAREER_CHOICES') || 'CONTINUE TO EARLY CAREER CHOICES'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
