import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Globe, Play, Pause, FastForward, CheckCircle, Shield, Award, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { InternationalDrawState, NationalTeamDrawGroup, NationalTeamDrawTeam, saveDrawState } from '../utils/internationalDrawEngine';
import { t } from '../utils/localizationSystem';

interface NationalTeamDrawModalProps {
  isOpen?: boolean;
  drawState: InternationalDrawState;
  onComplete?: (completedDraw: InternationalDrawState) => void;
  onDrawCompleted?: (completedDraw: InternationalDrawState) => void;
  onClose?: () => void;
}

export const NationalTeamDrawModal: React.FC<NationalTeamDrawModalProps> = ({
  isOpen = true,
  drawState: initialDrawState,
  onComplete,
  onDrawCompleted,
  onClose,
}) => {
  const handleFinishDraw = (completedState: InternationalDrawState) => {
    if (onDrawCompleted) onDrawCompleted(completedState);
    if (onComplete) onComplete(completedState);
    if (onClose) onClose();
  };

  if (isOpen === false) return null;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoDrawing, setIsAutoDrawing] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(initialDrawState.isCompleted);
  const [revealedGroups, setRevealedGroups] = useState<NationalTeamDrawGroup[]>(() => {
    if (initialDrawState.isCompleted) return initialDrawState.groups;
    return initialDrawState.groups.map((g) => ({
      ...g,
      teams: [],
    }));
  });

  const [currentStepTeam, setCurrentStepTeam] = useState<NationalTeamDrawTeam | null>(null);
  const [currentStepGroup, setCurrentStepGroup] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = initialDrawState.animationSteps.length;
  const isConmebol = initialDrawState.isLeagueFormat;

  const userGroupLetter = initialDrawState.groups.find(
    (g) => g.isPlayerGroup || g.teams.some((t) => t.isPlayerNation)
  )?.groupLetter || initialDrawState.groups[0]?.groupLetter || 'A';
  const [mobileGroupLetter, setMobileGroupLetter] = useState<string>(userGroupLetter);
  const [showAllGroupsMobile, setShowAllGroupsMobile] = useState<boolean>(false);

  // Process a single step
  const executeStep = (stepIdx: number) => {
    if (stepIdx >= totalSteps) {
      setIsComplete(true);
      setIsAutoDrawing(false);
      return;
    }

    const step = initialDrawState.animationSteps[stepIdx];
    setCurrentStepTeam(step.team);
    setCurrentStepGroup(step.targetGroupLetter);

    setRevealedGroups((prev) => {
      return prev.map((group) => {
        if (group.groupLetter === step.targetGroupLetter) {
          const exists = group.teams.some((t) => t.code === step.team.code);
          if (exists) return group;
          const isPlayer = group.isPlayerGroup || step.team.isPlayerNation;
          return {
            ...group,
            isPlayerGroup: isPlayer,
            teams: [...group.teams, step.team],
          };
        }
        return group;
      });
    });

    setLogMessages((prev) => [step.logText, ...prev.slice(0, 15)]);
    setCurrentStepIndex(stepIdx + 1);

    if (stepIdx + 1 >= totalSteps) {
      setIsComplete(true);
      setIsAutoDrawing(false);
    }
  };

  // Auto-drawing timer effect
  useEffect(() => {
    if (isAutoDrawing && !isComplete) {
      autoPlayTimerRef.current = setTimeout(() => {
        executeStep(currentStepIndex);
      }, currentStepIndex === 0 ? 500 : 700);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoDrawing, currentStepIndex, isComplete]);

  // Fast-forward / Skip directly to complete draw
  const handleSkipToFinish = () => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    setIsAutoDrawing(false);
    setCurrentStepIndex(totalSteps);
    setRevealedGroups(initialDrawState.groups);
    setIsComplete(true);
  };

  const handleFinish = () => {
    const finishedState: InternationalDrawState = {
      ...initialDrawState,
      groups: revealedGroups,
      isCompleted: true,
    };
    saveDrawState(finishedState);
    handleFinishDraw(finishedState);
  };

  // Get flag URL helper
  const getFlagUrl = (iso: string) => {
    const safeIso = (iso || 'un').toLowerCase();
    return `https://flagcdn.com/w80/${safeIso}.png`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden font-pixel animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col overflow-hidden bg-slate-900">
        {/* Fullscreen Console Header */}
        <header className="relative bg-slate-950 px-4 sm:px-8 py-3.5 sm:py-4 border-b-2 border-amber-500/70 pixel-bevel-gold flex items-center justify-between shrink-0 shadow-xl z-20 font-pixel">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {onClose && (
              <button
                id="btn-close-draw"
                onClick={onClose}
                className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 pixel-corners bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border-2 border-amber-400/80 pixel-bevel-gold cursor-pointer transition-all active:scale-95 shadow font-arcade font-black text-xs sm:text-sm uppercase"
                title="Return to Career"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>RETURN</span>
              </button>
            )}

            <div className="p-2 pixel-corners bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 pixel-corners bg-amber-400/10 text-amber-300 border border-amber-400/30 font-arcade">
                  {t('DRAW_OFFICIAL_CEREMONY') || 'Official Draw Ceremony'}
                </span>
                <span className="text-xs text-slate-400 font-medium font-arcade">{initialDrawState.seasonYear}</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                {initialDrawState.competitionName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isComplete && (
              <button
                id="btn-skip-draw"
                onClick={handleSkipToFinish}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition cursor-pointer font-pixel uppercase shadow"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('DRAW_SKIP_TO_RESULTS') || 'Skip to Results'}</span>
              </button>
            )}
            {isComplete && (
              <button
                id="btn-confirm-draw"
                onClick={handleFinish}
                className="flex items-center space-x-1.5 px-4 py-2 pixel-corners bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border border-emerald-400 pixel-bevel-raised shadow-lg transition animate-pulse cursor-pointer font-pixel uppercase"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('DRAW_CONFIRM_FIXTURES') || 'Confirm & Begin Fixtures'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Active Draw Ceremony Stage */}
          <div className="relative pixel-corners bg-slate-950 border-2 border-slate-800 p-4 sm:p-5 text-center overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

            <div className="max-w-xl mx-auto">
              {!isComplete ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex items-center justify-center space-x-2 font-pixel">
                    <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span className="font-arcade">
                      Drawing Ball {currentStepIndex} of {totalSteps}
                    </span>
                  </div>

                  {currentStepTeam ? (
                    <motion.div
                      key={currentStepTeam.code + currentStepIndex}
                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`inline-flex flex-col items-center p-4 pixel-corners border ${
                        currentStepTeam.isPlayerNation
                          ? 'bg-amber-950/60 border-amber-400 pixel-bevel-gold shadow-lg'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getFlagUrl(currentStepTeam.iso)}
                          alt={currentStepTeam.name}
                          className="w-16 h-10 sm:w-20 sm:h-12 object-cover pixel-corners shadow-md border border-slate-600"
                        />
                        {currentStepTeam.isPlayerNation && (
                          <div className="absolute -top-2.5 -right-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 pixel-corners font-arcade shadow">
                            YOU
                          </div>
                        )}
                      </div>

                      <span className="text-lg sm:text-xl font-black text-white mt-2 font-pixel pixel-text-shadow">
                        {currentStepTeam.name}
                      </span>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400 font-arcade">
                        <span>Rank #{currentStepTeam.rank}</span>
                        <span>•</span>
                        <span>{currentStepTeam.confederation}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">
                          {isConmebol ? 'CONMEBOL Eliminatorias' : `Assigned to Group ${currentStepGroup}`}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-6 text-slate-400 text-sm font-retro">
                      Press Start to commence the official draw ceremony...
                    </div>
                  )}

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={() => setIsAutoDrawing((prev) => !prev)}
                      className="px-3 py-1.5 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-600 transition font-pixel uppercase cursor-pointer"
                    >
                      {isAutoDrawing ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause Draw</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resume Draw</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => executeStep(currentStepIndex)}
                      className="px-3 py-1.5 pixel-corners bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 border border-indigo-400 pixel-bevel-raised transition font-pixel uppercase cursor-pointer"
                    >
                      <span>Draw Next Ball</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-3 space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-arcade">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Official Draw Ceremony Complete</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-pixel">
                    All participating nations have been assigned
                  </h3>
                  <p className="text-xs text-slate-400 font-retro">
                    Review your fixtures and opposition groups below before proceeding to the international window.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Groups Display Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 font-pixel">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isConmebol ? 'CONMEBOL Single League Standings Table' : 'Tournament Groups'}
                </span>
              </h3>
              {!isConmebol && (
                <span className="text-[11px] text-slate-400 font-retro">
                  Top 2 advance to Knockout Rounds / Direct Qualification
                </span>
              )}
            </div>

            {isConmebol ? (
              /* CONMEBOL Single League Format */
              <div className="bg-slate-900 border border-slate-700 pixel-corners overflow-hidden shadow-inner">
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300 font-pixel">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 text-center">#</span>
                    <span>Nation</span>
                  </div>
                  <div className="flex items-center space-x-6 text-slate-400 font-arcade">
                    <span>Confed</span>
                    <span>FIFA Rank</span>
                    <span>OVR</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-800">
                  {(revealedGroups[0]?.teams || []).map((team, idx) => (
                    <div
                      key={team.code}
                      className={`px-4 py-2 flex items-center justify-between text-xs transition ${
                        team.isPlayerNation
                          ? 'bg-amber-500/10 font-bold border-l-4 border-amber-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-6 text-center font-arcade font-bold ${
                            idx < 6 ? 'text-emerald-400' : idx === 6 ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <img
                          src={getFlagUrl(team.iso)}
                          alt={team.name}
                          className="w-5 h-3.5 object-cover pixel-corners shadow border border-slate-700"
                        />
                        <span className={`font-pixel ${team.isPlayerNation ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                          {team.name}
                        </span>
                        {team.isPlayerNation && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 pixel-corners font-arcade">
                            YOUR NATION
                          </span>
                        )}
                        {idx < 6 && (
                          <span className="text-[10px] text-emerald-400 font-medium font-retro hidden sm:inline">
                            • Direct Qualification Zone
                          </span>
                        )}
                        {idx === 6 && (
                          <span className="text-[10px] text-amber-400 font-medium font-retro hidden sm:inline">
                            • Intercontinental Playoff
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-8 text-slate-400 font-arcade">
                        <span className="text-[11px]">{team.confederation}</span>
                        <span className="text-slate-300">#{team.rank}</span>
                        <span className="font-bold text-amber-400">{team.ovr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Multi-Group Format (A through H or A through F) with Mobile Carousel Navigation */
              <div className="space-y-3">
                {/* Mobile Group Switcher Bar */}
                <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-950/80 border border-slate-800 pixel-corners sm:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const letters = revealedGroups.map((g) => g.groupLetter);
                      const idx = letters.indexOf(mobileGroupLetter);
                      const prevIdx = idx <= 0 ? letters.length - 1 : idx - 1;
                      setMobileGroupLetter(letters[prevIdx]);
                      setShowAllGroupsMobile(false);
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-900 border border-slate-700 pixel-corners text-slate-300 hover:text-amber-300"
                    title="Previous Group"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                    {revealedGroups.map((g) => {
                      const isUser = g.isPlayerGroup;
                      const isActive = !showAllGroupsMobile && mobileGroupLetter === g.groupLetter;
                      return (
                        <button
                          key={g.groupLetter}
                          type="button"
                          onClick={() => {
                            setMobileGroupLetter(g.groupLetter);
                            setShowAllGroupsMobile(false);
                          }}
                          className={`px-2.5 py-1.5 min-h-[44px] text-[11px] font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300'
                              : isUser
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/60 pixel-bevel-gold'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>{g.groupLetter}</span>
                          {isUser && <span>★</span>}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShowAllGroupsMobile((prev) => !prev)}
                      className={`px-2.5 py-1.5 min-h-[44px] text-[11px] font-arcade uppercase pixel-corners cursor-pointer whitespace-nowrap ${
                        showAllGroupsMobile
                          ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold border border-amber-300'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      ALL
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const letters = revealedGroups.map((g) => g.groupLetter);
                      const idx = letters.indexOf(mobileGroupLetter);
                      const nextIdx = idx === -1 || idx >= letters.length - 1 ? 0 : idx + 1;
                      setMobileGroupLetter(letters[nextIdx]);
                      setShowAllGroupsMobile(false);
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-900 border border-slate-700 pixel-corners text-slate-300 hover:text-amber-300"
                    title="Next Group"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {revealedGroups
                    .filter((group) => {
                      // On mobile, if not showing all, only show selected mobileGroupLetter
                      if (typeof window !== 'undefined' && window.innerWidth < 640 && !showAllGroupsMobile) {
                        return group.groupLetter === mobileGroupLetter;
                      }
                      return true;
                    })
                    .map((group) => {
                    return (
                      <div
                        key={group.groupLetter}
                        className={`pixel-corners border p-3 flex flex-col justify-between transition ${
                          group.isPlayerGroup
                            ? 'bg-amber-950/30 border-amber-400 pixel-bevel-gold shadow-lg'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2 font-pixel">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">{group.groupName}</span>
                            {group.isPlayerGroup && (
                              <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 pixel-corners font-arcade">
                                {t('DRAW_YOUR_GROUP') || 'Your Group'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-arcade">
                            {group.teams.length}/4 teams
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1 min-h-[110px]">
                          {group.teams.map((t, tIdx) => (
                            <div
                              key={t.code}
                              className={`flex items-center justify-between px-2 py-1 pixel-corners text-xs ${
                                t.isPlayerNation
                                  ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30'
                                  : 'text-slate-300 bg-slate-950'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className="text-[10px] text-slate-500 font-arcade w-3">
                                  {tIdx + 1}
                                </span>
                                <img
                                  src={getFlagUrl(t.iso)}
                                  alt={t.name}
                                  className="w-4 h-3 object-cover pixel-corners shadow border border-slate-700 flex-shrink-0"
                                />
                                <span className="truncate font-pixel">{t.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0 text-[11px] font-arcade">
                                <span className="text-slate-400">#{t.rank}</span>
                                <span className="font-semibold text-amber-400">{t.ovr}</span>
                              </div>
                            </div>
                          ))}

                          {Array.from({ length: Math.max(0, 4 - group.teams.length) }).map((_, emptyIdx) => (
                            <div
                              key={emptyIdx}
                              className="h-6 pixel-corners border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-retro"
                            >
                              Waiting for Pot {group.teams.length + emptyIdx + 1}...
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Draw Logs Marquee / Feed */}
          {logMessages.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 pixel-corners p-2.5 max-h-24 overflow-y-auto text-[11px] font-arcade text-slate-400 space-y-1">
              {logMessages.map((msg, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t-2 border-slate-800 flex items-center justify-between text-xs text-slate-400 font-pixel">
          <div>
            <span className="font-retro">Draw format: </span>
            <span className="font-semibold text-slate-200">
              {isConmebol ? 'CONMEBOL 10-Nation Round Robin' : 'Pot-Seeded Groups with Continental Constraints'}
            </span>
          </div>

          <button
            onClick={handleFinish}
            disabled={!isComplete}
            className={`px-4 py-2 pixel-corners font-bold text-xs flex items-center space-x-2 transition uppercase ${
              isComplete
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 pixel-bevel-raised shadow-md cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>Proceed to Matchday</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
