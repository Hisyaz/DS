import React, { useState } from 'react';
import { Trophy, Flame, Users, ArrowRight, CheckCircle2, Shield, Sparkles, X, Activity } from 'lucide-react';
import { PlayerConfig, TrophyItem } from '../types';
import {
  simulatePreseasonFriendlyTournament,
  getClubPreseasonTrophyConfig,
  PreseasonTournamentResult,
  PreseasonFriendlyMatch,
} from '../utils/preseasonFriendlyEngine';
import { awardTrophiesToPlayer } from '../utils/trophySystem';
import { useLanguage } from '../context/LanguageContext';

interface PreseasonFriendlyCupModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerConfig;
  seasonYear: number | string;
  onUpdatePlayer: (updated: PlayerConfig) => void;
  onCompletedTournament?: (result: PreseasonTournamentResult) => void;
}

export const PreseasonFriendlyCupModal: React.FC<PreseasonFriendlyCupModalProps> = ({
  isOpen,
  onClose,
  player,
  seasonYear,
  onUpdatePlayer,
  onCompletedTournament,
}) => {
  const { t } = useLanguage();
  const [tournamentResult, setTournamentResult] = useState<PreseasonTournamentResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'completed'>('intro');

  const trophyConfig = getClubPreseasonTrophyConfig(player.club || '', player.league);

  if (!isOpen) return null;

  const handleStartTournament = () => {
    setIsSimulating(true);
    setCurrentStep('playing');

    setTimeout(() => {
      const result = simulatePreseasonFriendlyTournament(player, seasonYear);
      setTournamentResult(result);
      setIsSimulating(false);
      setCurrentStep('completed');

      // Update player fitness and award trophy if won
      const currentFit = player.fitness ?? 80;
      const newFitness = Math.min(100, currentFit + result.totalFitnessGained);
      let updatedPlayer: PlayerConfig = {
        ...player,
        fitness: newFitness,
        staminaCurrent: newFitness,
      };

      if (result.isWon && result.trophyItem) {
        updatedPlayer = awardTrophiesToPlayer(updatedPlayer, [result.trophyItem]);
      }

      onUpdatePlayer(updatedPlayer);
      onCompletedTournament?.(result);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-pixel">
      <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl relative text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-gradient-to-br from-rose-500/20 to-amber-500/20 border-2 border-rose-500/40 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 pixel-corners bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-black uppercase tracking-wider font-arcade">
                <Sparkles className="w-3 h-3 text-rose-400" /> Pre-Season Friendly Tournament
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                {trophyConfig.trophyName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white pixel-corners transition hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* INTRO STEP */}
        {currentStep === 'intro' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 border-2 border-rose-500/30 pixel-corners pixel-bevel-raised p-4 sm:p-5 space-y-3 shadow-inner">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-rose-300 uppercase">
                    {trophyConfig.trophyName}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-retro">
                    {trophyConfig.description}
                  </p>
                </div>
                {trophyConfig.isUnique && (
                  <span className="shrink-0 px-2.5 py-1 bg-amber-500/20 border border-amber-400/50 pixel-corners text-[9px] font-black text-amber-300 uppercase font-arcade">
                    Unique Trophy
                  </span>
                )}
              </div>

              {/* 7-Substitutions Rule Highlight */}
              <div className="bg-slate-900 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 space-y-1.5 font-arcade">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Special Pre-Season Match Rule: 7 Substitutions</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-retro">
                  To prepare complete squad conditioning, 7 substitutions are conducted simultaneously at half-time (45'). This gives the full squad match sharpness and awards a permanent <strong className="text-emerald-400 font-bold">+20% Squad Fitness boost</strong> for the upcoming campaign.
                </p>
              </div>

              {/* Club Host Info */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-arcade">
                <div className="bg-slate-900/60 p-2.5 pixel-corners border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Host / Participant</div>
                  <div className="font-black text-white uppercase">{player.club || 'Pro Club'}</div>
                </div>
                <div className="bg-slate-900/60 p-2.5 pixel-corners border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Fitness Conditioning</div>
                  <div className="font-black text-emerald-400 uppercase">+20% Match Sharpness</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-arcade">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs pixel-corners pixel-bevel-raised transition uppercase cursor-pointer"
              >
                Skip Friendly Cup
              </button>
              <button
                type="button"
                onClick={handleStartTournament}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-slate-950 font-black text-xs pixel-corners pixel-bevel-raised shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center gap-2 uppercase"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Play {trophyConfig.trophyName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PLAYING SIMULATION STEP */}
        {currentStep === 'playing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center font-arcade">
            <div className="w-16 h-16 pixel-corners pixel-bevel-raised border-4 border-rose-500/30 border-t-rose-500 animate-spin flex items-center justify-center">
              <Trophy className="w-7 h-7 text-rose-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-white uppercase">Simulating Pre-Season Matches...</h4>
              <p className="text-xs text-slate-400 font-retro">Applying 7 wholesale substitutions at half-time for fitness conditioning</p>
            </div>
          </div>
        )}

        {/* COMPLETED STEP */}
        {currentStep === 'completed' && tournamentResult && (
          <div className="space-y-5">
            {/* Winner Banner */}
            <div className={`p-4 pixel-corners border-2 flex items-center justify-between gap-4 ${
              tournamentResult.isWon
                ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/60 border-rose-500/60 pixel-bevel-gold shadow-xl'
                : 'bg-slate-950 border-slate-800 pixel-bevel-raised'
            }`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏆</div>
                <div>
                  <div className="text-[9px] uppercase font-black tracking-wider text-rose-400 font-arcade">
                    {tournamentResult.isWon ? 'Champions 🏆' : 'Finalists'}
                  </div>
                  <h4 className="text-base font-black text-white uppercase">
                    {tournamentResult.isWon
                      ? `${player.club || 'Your Club'} lifts the ${tournamentResult.trophyName}!`
                      : `${tournamentResult.trophyName} Completed`}
                  </h4>
                  <p className="text-xs text-slate-300 font-retro">
                    {tournamentResult.isWon
                      ? 'The trophy has been placed into your Career Trophy Cabinet under Friendly Trophies.'
                      : 'Great pre-season conditioning match practice gained.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 font-arcade">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Fitness Boost</div>
                <div className="text-sm font-black text-emerald-400">+{tournamentResult.totalFitnessGained}% Stamina</div>
              </div>
            </div>

            {/* Matches Timeline breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5 font-arcade">
                <Activity className="w-3.5 h-3.5 text-rose-400" /> Matches Breakdown (7-Substitutions Rule)
              </h4>

              <div className="space-y-2.5">
                {tournamentResult.matches.map((m) => (
                  <div key={m.matchId} className="bg-slate-950 p-3.5 pixel-corners pixel-bevel-sunken border-2 border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-[10px] font-black text-amber-400 uppercase font-arcade">{m.stageTitle}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-700 pixel-corners text-slate-300 font-mono font-arcade">
                        7 Subs Executed @ 45'
                      </span>
                    </div>

                    {/* Score line */}
                    <div className="flex items-center justify-between text-xs font-black px-1">
                      <span className={m.homeTeam.isPlayerTeam ? 'text-rose-300 font-bold uppercase' : 'text-white uppercase'}>
                        {m.homeTeam.name}
                      </span>
                      <span className="font-arcade text-sm bg-slate-900 px-3 py-1 pixel-corners border border-slate-800 text-amber-300">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span className={m.awayTeam.isPlayerTeam ? 'text-rose-300 font-bold uppercase' : 'text-white uppercase'}>
                        {m.awayTeam.name}
                      </span>
                    </div>

                    {/* Timeline & Player performance */}
                    <div className="bg-slate-900/60 p-2 pixel-corners text-[11px] text-slate-300 space-y-1">
                      <div className="text-[9px] font-bold text-slate-400 flex items-center justify-between font-arcade">
                        <span>Player Performance: {m.playerMinutes} Min | {m.playerGoals} Goals | {m.playerAssists} Assists</span>
                        <span className="text-amber-400 font-black">Rating: {m.playerRating}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 italic font-medium border-t border-slate-800/60 pt-1 font-retro">
                        {m.halfTimeSubsCommentary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 font-arcade">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs pixel-corners pixel-bevel-raised shadow-lg transition cursor-pointer flex items-center gap-2 uppercase"
              >
                <span>Continue to Official Season</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
