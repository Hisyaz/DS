import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { simulateFarewellMatch } from '../utils/careerConclusionSystem';
import { FarewellMatchResult } from '../types/careerConclusion';
import { audioManager } from '../utils/audioSystem';
import { Flame, Trophy, Users, CheckCircle2, RefreshCw, ArrowRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FarewellMatchModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onCompleteFarewell: (updatedPlayer: PlayerCardData, result: FarewellMatchResult) => void;
  onClose?: () => void;
}

export const FarewellMatchModal: React.FC<FarewellMatchModalProps> = ({
  isOpen,
  player,
  onCompleteFarewell,
  onClose,
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'glory' | 'torch' | null>(null);
  const [inheritorName, setInheritorName] = useState<string>('Mateo Silva');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [farewellResult, setFarewellResult] = useState<FarewellMatchResult | null>(null);
  const [tempPlayer, setTempPlayer] = useState<PlayerCardData | null>(null);

  useEffect(() => {
    if (isOpen) {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.enterMatchMode('domestic', 'Career Farewell Match', clubCountry);
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, player]);

  if (!isOpen) return null;

  const handleSimulateChoice = (choice: 'glory' | 'torch') => {
    setSimulating(true);
    setSelectedOption(choice);

    setTimeout(() => {
      const { updatedPlayer, result } = simulateFarewellMatch(player, choice, inheritorName);
      setFarewellResult(result);
      setTempPlayer(updatedPlayer);
      setSimulating(false);
    }, 1100);
  };

  const handleFinishAndProceed = () => {
    if (tempPlayer && farewellResult) {
      onCompleteFarewell(tempPlayer, farewellResult);
    }
  };

  return (
    <div
      id="drawstar-farewell-match-screen"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none font-pixel overflow-hidden animate-in fade-in"
    >
      {/* 32-Bit Scanline Backdrop */}
      <div className="absolute inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.9)_100%)] pointer-events-none z-0" />

      {/* Atmospheric Theme Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* TOP CONSOLE APP BAR: BACK BUTTON + TITLE */}
      {/* ========================================================================= */}
      <header className="relative z-10 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900 border-b-2 border-slate-700 pixel-bevel-raised flex items-center justify-between gap-3 shadow-xl shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onClose && !farewellResult && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-600 font-arcade font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>RETURN</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-arcade font-bold text-amber-400 uppercase tracking-widest block">
                {t('FAREWELL MATCH • FINAL APPEARANCE')}
              </span>
              <h1 className="text-xs sm:text-sm font-arcade font-black text-white uppercase tracking-tight">
                {t('The Last Chapter of {name}', { name: player.name })}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-2.5 py-1 bg-slate-950 border border-amber-500/50 pixel-corners text-xs font-arcade text-amber-300">
          {player.club}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT (STEPS 1, 2, 3) */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center overflow-y-auto space-y-4">
        {/* STEP 1: CHOICE SELECTION */}
        {!farewellResult && !simulating && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="text-xs font-arcade font-bold uppercase tracking-widest text-amber-400">
                {t('CHOOSE YOUR FAREWELL MOMENT')}
              </div>
              <p className="text-xs text-slate-300 font-retro max-w-lg mx-auto leading-relaxed">
                {t("The referee's whistle is about to blow on your legendary career with {club}. You stand at the center circle for one final iconic decision.", {
                  club: player.club || t('your club'),
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* OPTION 1: GO FOR GLORY */}
              <div
                onClick={() => handleSimulateChoice('glory')}
                className="group p-5 pixel-corners border-2 border-rose-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 hover:border-rose-400 pixel-bevel-raised transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-arcade font-black px-2 py-0.5 pixel-corners bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                      OPTION 1
                    </span>
                    <span className="text-[10px] font-arcade font-black px-2 py-0.5 pixel-corners bg-rose-950 text-rose-200 border border-rose-500/50">
                      28% SUCCESS RATE
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 pixel-corners bg-rose-500/20 text-rose-400 border border-rose-500/40 group-hover:scale-110 transition-transform shrink-0">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-arcade font-black text-base text-rose-200 group-hover:text-white uppercase">
                        GO FOR GLORY
                      </h3>
                      <div className="text-[10px] font-arcade font-bold text-rose-400 uppercase">
                        &ldquo;TRY THE IMPOSSIBLE&rdquo;
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-retro leading-relaxed">
                    Attempt an extraordinary final goal from 30 yards or an acrobatic volley. Low probability, but connects for an immortal fairytale farewell!
                  </p>
                </div>

                <div className="pt-3 border-t border-rose-500/30 flex items-center justify-between text-xs font-arcade font-black text-rose-300 group-hover:text-white">
                  <span>ATTEMPT FINAL GOAL</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* OPTION 2: PASS THE TORCH */}
              <div
                onClick={() => setSelectedOption('torch')}
                className={`group p-5 pixel-corners border-2 ${
                  selectedOption === 'torch'
                    ? 'border-emerald-400 bg-emerald-950/40 pixel-bevel-emerald'
                    : 'border-emerald-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 hover:border-emerald-400 pixel-bevel-raised'
                } transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-arcade font-black px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      OPTION 2
                    </span>
                    <span className="text-[10px] font-arcade font-black px-2 py-0.5 pixel-corners bg-emerald-950 text-emerald-200 border border-emerald-500/50">
                      98% SUCCESS RATE
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 pixel-corners bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 group-hover:scale-110 transition-transform shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-arcade font-black text-base text-emerald-200 group-hover:text-white uppercase">
                        PASS THE TORCH
                      </h3>
                      <div className="text-[10px] font-arcade font-bold text-emerald-400 uppercase">
                        &ldquo;EMPOWER THE NEXT GENERATION&rdquo;
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-retro leading-relaxed">
                    Safely assist a promising young academy graduate who becomes your designated club heir. An unselfish act of legendary leadership.
                  </p>

                  {selectedOption === 'torch' && (
                    <div className="mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-arcade font-black uppercase text-emerald-300">
                        Young Inheritor Name:
                      </label>
                      <input
                        type="text"
                        value={inheritorName}
                        onChange={(e) => setInheritorName(e.target.value)}
                        placeholder="e.g. Mateo Silva"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-emerald-500/60 pixel-corners text-white focus:outline-none font-arcade"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-emerald-500/30">
                  {selectedOption === 'torch' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateChoice('torch');
                      }}
                      className="w-full min-h-[44px] py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs pixel-corners pixel-bevel-emerald transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>CONFIRM & PASS TORCH</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-arcade font-black text-emerald-300 group-hover:text-white">
                      <span>PASS TO INHERITOR</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIMULATING MATCHDAY */}
        {simulating && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto pixel-corners bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-base font-arcade font-black text-white uppercase">
              {t('SIMULATING FAREWELL MATCHDAY...')}
            </h3>
            <p className="text-xs text-slate-400 font-retro animate-pulse">
              {t('The stadium is on its feet • Final whistle approaching...')}
            </p>
          </div>
        )}

        {/* STEP 3: RESULT DISPLAY */}
        {farewellResult && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-5 pixel-corners border-2 border-amber-500/80 bg-slate-900 pixel-bevel-gold space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-arcade font-black text-sm text-amber-300 uppercase">
                    {farewellResult.choiceTitle}
                  </span>
                </div>
                <span className="text-xs font-arcade font-black px-2.5 py-1 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  FINAL SCORE: {farewellResult.finalMatchScore}
                </span>
              </div>

              {/* Match Commentary */}
              <div className="p-4 bg-slate-950 border border-amber-500/30 pixel-corners text-xs font-retro text-amber-200 leading-relaxed shadow-inner">
                &ldquo;{farewellResult.commentary}&rdquo;
              </div>

              {/* Stats Summary from Match */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 pixel-corners bg-slate-950 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-arcade uppercase">Farewell Goals</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-amber-300 mt-0.5">
                    {farewellResult.finalMatchGoals}
                  </div>
                </div>
                <div className="p-2.5 pixel-corners bg-slate-950 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-arcade uppercase">Farewell Assists</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-emerald-300 mt-0.5">
                    {farewellResult.finalMatchAssists}
                  </div>
                </div>
                <div className="p-2.5 pixel-corners bg-slate-950 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-arcade uppercase">Match Rating</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-cyan-300 mt-0.5">
                    {farewellResult.finalMatchRating}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishAndProceed}
              className="w-full min-h-[48px] py-3.5 pixel-corners bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider pixel-bevel-gold shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('PROCEED TO CAREER SUMMARY & RETROSPECTIVE')}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
