import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { ProContractOffer } from '../types/streetCards';
import { generateFirstContractIntro, IntroNarrative } from '../utils/firstContractIntroEngine';
import { Sparkles, ArrowRight, Building, Globe, Trophy, RefreshCw } from 'lucide-react';
import { isPerformanceModeActive, shouldDisableAnimations } from '../utils/graphicSettingsSystem';

interface FirstContractIntroModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  offer: ProContractOffer;
  onProceedToCareer: () => void;
}

export const FirstContractIntroModal: React.FC<FirstContractIntroModalProps> = ({
  isOpen,
  player,
  offer,
  onProceedToCareer,
}) => {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const intro: IntroNarrative = generateFirstContractIntro(player, offer, variant);

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTypingComplete(false);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const fullText = intro.narrativeText;
    if (isPerformanceModeActive() || shouldDisableAnimations()) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
      return;
    }

    const startTime = performance.now();
    const charsPerSec = 180;
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
  }, [isOpen, offer.id, variant, intro.narrativeText]);

  const handleSkipTyping = () => {
    if (!isTypingComplete) {
      setDisplayedText(intro.narrativeText);
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
          onProceedToCareer();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTypingComplete, intro.narrativeText, onProceedToCareer]);

  if (!isOpen) return null;

  const toggleVariant = () => {
    setVariant((prev) => (prev === 'A' ? 'B' : 'A'));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-pixel select-none"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-3xl bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge & Variant Selector (Fixed Header) */}
        <div className="border-b-2 border-slate-800 pb-3 shrink-0 flex items-center justify-between gap-2 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 pixel-corners border text-[9px] sm:text-[10px] font-black uppercase tracking-widest font-arcade ${intro.badgeBg}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {intro.badgeText}
          </span>

          {/* Narrative Variant Toggle Button */}
          <button
            type="button"
            onClick={toggleVariant}
            className="px-2.5 py-1 pixel-corners bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-[9px] sm:text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 font-pixel"
            title="Switch intro story perspective"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Variant {intro.variant}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3.5 custom-scrollbar relative z-10 text-left">
          {/* Club & Title Section */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className={`p-2.5 bg-gradient-to-br ${offer.clubBadgeBg} pixel-corners pixel-bevel-raised border-2 border-white/20 text-white shadow-xl`}>
                <Building className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight pixel-text-shadow">
                  {offer.clubName}
                </h2>
                <div className="flex items-center gap-2 text-xs font-retro text-amber-400 font-bold">
                  <span>{offer.leagueName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Globe className="w-3 h-3 text-sky-400" /> {offer.countryName}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase pt-1 font-arcade">
              {intro.title}
            </h3>
          </div>

          {/* Contract Assignment Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-2.5 pixel-corners border border-slate-800 pixel-bevel-sunken text-xs">
            <div className="bg-slate-900 p-2 pixel-corners border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-bold block font-pixel">Squad Assigned</span>
              <span className="font-black text-emerald-400 text-xs sm:text-sm mt-0.5 block font-arcade">{offer.initialSquadDestination || 'First Team'}</span>
            </div>
            <div className="bg-slate-900 p-2 pixel-corners border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-bold block font-pixel">Expected Role</span>
              <span className="font-black text-amber-300 text-xs sm:text-sm mt-0.5 block font-arcade">{offer.expectedRole || 'Starter'}</span>
            </div>
            <div className="bg-slate-900 p-2 pixel-corners border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-bold block font-pixel">Contract Length</span>
              <span className="font-black text-white text-xs sm:text-sm mt-0.5 block font-arcade">{offer.contractYears} Years</span>
            </div>
            <div className="bg-slate-900 p-2 pixel-corners border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-bold block font-pixel">Weekly Salary</span>
              <span className="font-black text-emerald-400 text-xs sm:text-sm font-arcade mt-0.5 block">€{offer.weeklyWage?.toLocaleString()}/wk</span>
            </div>
          </div>

          {/* Typewriter Story Box */}
          <div 
            className="bg-slate-950 border border-slate-800 pixel-corners pixel-bevel-sunken p-4 sm:p-5 min-h-[140px] text-slate-150 font-mono text-xs sm:text-sm leading-relaxed shadow-inner whitespace-pre-line relative cursor-pointer hover:border-slate-700 transition-colors"
            onClick={handleSkipTyping}
            title={!isTypingComplete ? 'Click to reveal entire narrative instantly' : undefined}
          >
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            )}
            {!isTypingComplete && (
              <div className="mt-3 text-[10px] text-amber-400/80 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2 select-none">
                <span>⚡ Fast Cinematic Text</span>
                <span className="hover:underline font-bold">CLICK OR PRESS SPACE TO SKIP ▶</span>
              </div>
            )}
          </div>
        </div>

        {/* Proceed Button (Fixed Footer) */}
        <div className="pt-3 mt-1 border-t-2 border-slate-800 bg-slate-900 shrink-0 flex justify-center relative z-10">
          <button
            type="button"
            onClick={onProceedToCareer}
            className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-95 font-pixel uppercase"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>ENTER CAREER MODE WITH {offer.clubName.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
