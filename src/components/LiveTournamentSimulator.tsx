import React, { useState, useMemo } from 'react';
import { PlayerConfig } from '../types';
import { FullInternationalYouthCupData, buildInternationalYouthCup32 } from '../utils/internationalYouthCupEngine';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { YouthMatchCard } from './YouthMatchCard';
import { generateTournamentMatchResult } from '../utils/youthMatchSimulator';
import { getFitnessPercentage } from '../utils/staminaInjurySystem';
import { classifyMatchImportance } from '../utils/matchImportanceSystem';
import { audioManager } from '../utils/audioSystem';
import { Trophy, ArrowRight, Shield, Zap, CheckCircle2, ChevronRight, Users, Play, Award, Activity, Flame } from 'lucide-react';

interface LiveTournamentSimulatorProps {
  tournamentTitle?: string;
  player: PlayerConfig;
  intCupData?: FullInternationalYouthCupData;
  cupData?: FullInternationalYouthCupData;
  onTriggerKeyMatch: (step: 'quarter_final' | 'semi_final' | 'final' | 'third_place', opponentName: string, opponentOvr: number) => void;
  onFinishTournament: (completedMatches: SimulatedMatchResult[], finalPositionLabel: string) => void;
  activeKeyMatchStep?: 'quarter_final' | 'semi_final' | 'final' | 'third_place' | 'finished' | null;
  latestKeyMatchResult?: {
    isWinner: boolean;
    playerTeamScore: number;
    opponentScore: number;
    playerGoals: number;
    playerAssists: number;
    rating: number;
    isMvp: boolean;
  } | null;
  onUpdatePlayer?: (updated: PlayerConfig) => void;
}

export const LiveTournamentSimulator: React.FC<LiveTournamentSimulatorProps> = ({
  tournamentTitle,
  player,
  intCupData,
  cupData,
  onTriggerKeyMatch,
  onFinishTournament,
  activeKeyMatchStep,
  latestKeyMatchResult,
  onUpdatePlayer,
}) => {
  // Group Stage Match step (0, 1, 2)
  const [groupMatchIndex, setGroupMatchIndex] = useState<number>(0);
  const [completedMatches, setCompletedMatches] = useState<SimulatedMatchResult[]>([]);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [tournamentStage, setTournamentStage] = useState<
    'group_stage' | 'quarter_final' | 'semi_final' | 'final' | 'third_place' | 'eliminated' | 'completed'
  >('group_stage');

  React.useEffect(() => {
    if (activeKeyMatchStep === 'quarter_final') {
      setTournamentStage('quarter_final');
    } else if (activeKeyMatchStep === 'semi_final') {
      setTournamentStage('semi_final');
    } else if (activeKeyMatchStep === 'final') {
      setTournamentStage('final');
    } else if (activeKeyMatchStep === 'third_place') {
      setTournamentStage('third_place');
    } else if (activeKeyMatchStep === 'finished') {
      setTournamentStage('completed');
    }
  }, [activeKeyMatchStep]);

  const playerClubName = player.club || 'Kensington United';
  const age = player.age || 10;
  const categoryLabel = `U${age}`;
  const effectiveTitle = tournamentTitle || `International Youth Cup U${age} (32 Clubs)`;
  const currentFitness = getFitnessPercentage(player);

  // Immediately transition into World playlist during international youth tournaments
  React.useEffect(() => {
    audioManager.enterMatchMode('world', effectiveTitle);
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [effectiveTitle, player]);

  // Safe data retrieval
  const effectiveCupData: FullInternationalYouthCupData =
    intCupData || cupData || buildInternationalYouthCup32(player);

  const playerGroup = effectiveCupData.playerGroup || effectiveCupData.groups?.[0];
  const nonPlayerMatches = effectiveCupData.playerGroupNonPlayerMatches || [];

  const opponentList = playerGroup?.teams
    ? playerGroup.teams.filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase())
    : [];

  while (opponentList.length < 3) {
    opponentList.push({
      id: `opp-fb-${opponentList.length}`,
      name: `FC International U${age} #${opponentList.length + 1}`,
      country: 'International',
      federation: 'UEFA',
      flag: '🇪🇺',
      primaryColor: '#3b82f6',
      secondaryColor: '#ffffff',
      preferredFormation: '4-3-3',
      teamOvr: Math.max(35, (player.ovr || 60) + Math.floor(Math.random() * 5) - 2),
      attOvr: player.ovr || 60,
      midOvr: player.ovr || 60,
      defOvr: player.ovr || 60,
      representativePlayers: [],
      sourceType: 'federation_pool',
    });
  }

  // Knockout stage opponents
  const quarterOpp = effectiveCupData.quarterOpponent || { name: 'FC Barcelona Youth', teamOvr: 68 };
  const semiOpp = effectiveCupData.semiOpponent || { name: 'Real Madrid Youth', teamOvr: 70 };
  const finalOpp = effectiveCupData.finalOpponent || { name: 'Flamengo Youth', teamOvr: 72 };
  const thirdOpp = effectiveCupData.thirdPlaceOpponent || { name: 'Bayern Munich Youth', teamOvr: 67 };

  // Calculate real-time dynamic group standings based on actual completed matches
  const liveStandings = useMemo(() => {
    if (!playerGroup) return [];

    const standingsMap = new Map<
      string,
      {
        clubId: string;
        clubName: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        ga: number;
        gd: number;
        points: number;
      }
    >();

    playerGroup.teams.forEach((gt) => {
      standingsMap.set(gt.id, {
        clubId: gt.id,
        clubName: gt.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      });
    });

    const pTeam =
      playerGroup.teams.find((t) => t.name.toLowerCase() === playerClubName.toLowerCase()) || playerGroup.teams[0];

    const oppList = playerGroup.teams.filter((t) => t.id !== pTeam.id);

    completedMatches.forEach((m, idx) => {
      const oppTeam = oppList[idx];
      const pStat = standingsMap.get(pTeam.id);
      const oppStat = oppTeam ? standingsMap.get(oppTeam.id) : undefined;

      if (pStat && oppStat) {
        pStat.played += 1;
        oppStat.played += 1;

        const pScore = m.playerTeamScore ?? (m.isPlayerHome ? m.homeScore : m.awayScore);
        const oppScore = m.opponentScore ?? (m.isPlayerHome ? m.awayScore : m.homeScore);

        pStat.gf += pScore;
        pStat.ga += oppScore;
        pStat.gd = pStat.gf - pStat.ga;

        oppStat.gf += oppScore;
        oppStat.ga += pScore;
        oppStat.gd = oppStat.gf - oppStat.ga;

        if (pScore > oppScore) {
          pStat.won += 1;
          pStat.points += 3;
          oppStat.lost += 1;
        } else if (pScore < oppScore) {
          oppStat.won += 1;
          oppStat.points += 3;
          pStat.lost += 1;
        } else {
          pStat.drawn += 1;
          pStat.points += 1;
          oppStat.drawn += 1;
          oppStat.points += 1;
        }
      }

      // Process non-player match for this round
      const np = nonPlayerMatches[idx];
      if (np) {
        const sA = standingsMap.get(np.teamAId);
        const sB = standingsMap.get(np.teamBId);
        if (sA && sB) {
          sA.played += 1;
          sB.played += 1;
          sA.gf += np.gA;
          sA.ga += np.gB;
          sA.gd = sA.gf - sA.ga;
          sB.gf += np.gB;
          sB.ga += np.gA;
          sB.gd = sB.gf - sB.ga;

          if (np.gA > np.gB) {
            sA.won += 1;
            sA.points += 3;
            sB.lost += 1;
          } else if (np.gA < np.gB) {
            sB.won += 1;
            sB.points += 3;
            sA.lost += 1;
          } else {
            sA.drawn += 1;
            sA.points += 1;
            sB.drawn += 1;
            sB.points += 1;
          }
        }
      }
    });

    return Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.clubName.localeCompare(b.clubName);
    });
  }, [playerGroup, playerClubName, completedMatches, nonPlayerMatches]);

  // Handle Advance in Group Stage
  const handleAdvanceGroupMatch = () => {
    if (groupMatchIndex >= 3 || isAdvancing) return;

    setIsAdvancing(true);

    setTimeout(() => {
      const currentOpponent = opponentList[groupMatchIndex] || { name: 'FC Youth Academy', teamOvr: 64 };
      const stageName = `GROUP STAGE — MATCH ${groupMatchIndex + 1}`;

      const { matchResult, updatedPlayer } = generateTournamentMatchResult(
        player,
        stageName,
        currentOpponent.name,
        currentOpponent.teamOvr
      );

      // Instantly update player career state and Persistent UI
      if (onUpdatePlayer) {
        onUpdatePlayer(updatedPlayer);
      }

      const nextMatches = [...completedMatches, matchResult];
      setCompletedMatches(nextMatches);

      const nextIndex = groupMatchIndex + 1;
      setGroupMatchIndex(nextIndex);
      setIsAdvancing(false);

      if (nextIndex >= 3) {
        // Calculate final standings using all 3 completed matches
        const standingsMap = new Map<
          string,
          {
            clubId: string;
            clubName: string;
            played: number;
            won: number;
            drawn: number;
            lost: number;
            gf: number;
            ga: number;
            gd: number;
            points: number;
          }
        >();

        playerGroup.teams.forEach((gt) => {
          standingsMap.set(gt.id, {
            clubId: gt.id,
            clubName: gt.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            points: 0,
          });
        });

        const pTeam =
          playerGroup.teams.find((t) => t.name.toLowerCase() === playerClubName.toLowerCase()) || playerGroup.teams[0];
        const oppList = playerGroup.teams.filter((t) => t.id !== pTeam.id);

        nextMatches.forEach((m, idx) => {
          const oppTeam = oppList[idx];
          const pStat = standingsMap.get(pTeam.id);
          const oppStat = oppTeam ? standingsMap.get(oppTeam.id) : undefined;

          if (pStat && oppStat) {
            pStat.played += 1;
            oppStat.played += 1;

            const pScore = m.isPlayerHome ? m.homeScore : m.awayScore;
            const oppScore = m.isPlayerHome ? m.awayScore : m.homeScore;

            pStat.gf += pScore;
            pStat.ga += oppScore;
            pStat.gd = pStat.gf - pStat.ga;

            oppStat.gf += oppScore;
            oppStat.ga += pScore;
            oppStat.gd = oppStat.gf - oppStat.ga;

            if (pScore > oppScore) {
              pStat.won += 1;
              pStat.points += 3;
              oppStat.lost += 1;
            } else if (pScore < oppScore) {
              oppStat.won += 1;
              oppStat.points += 3;
              pStat.lost += 1;
            } else {
              pStat.drawn += 1;
              pStat.points += 1;
              oppStat.drawn += 1;
              oppStat.points += 1;
            }
          }

          const np = nonPlayerMatches[idx];
          if (np) {
            const sA = standingsMap.get(np.teamAId);
            const sB = standingsMap.get(np.teamBId);
            if (sA && sB) {
              sA.played += 1;
              sB.played += 1;
              sA.gf += np.gA;
              sA.ga += np.gB;
              sA.gd = sA.gf - sA.ga;
              sB.gf += np.gB;
              sB.ga += np.gA;
              sB.gd = sB.gf - sB.ga;

              if (np.gA > np.gB) {
                sA.won += 1;
                sA.points += 3;
                sB.lost += 1;
              } else if (np.gA < np.gB) {
                sB.won += 1;
                sB.points += 3;
                sA.lost += 1;
              } else {
                sA.drawn += 1;
                sA.points += 1;
                sB.drawn += 1;
                sB.points += 1;
              }
            }
          }
        });

        const finalStandings = Array.from(standingsMap.values()).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          if (b.gf !== a.gf) return b.gf - a.gf;
          return a.clubName.localeCompare(b.clubName);
        });

        // Sync standings to playerGroup for external tab rendering
        playerGroup.standings = finalStandings;

        const playerRankIndex = finalStandings.findIndex(
          (s) => s.clubId === pTeam.id || s.clubName.toLowerCase() === playerClubName.toLowerCase()
        );
        const playerRank = playerRankIndex >= 0 ? playerRankIndex + 1 : 1;

        if (playerRank <= 2) {
          setTournamentStage('quarter_final');
        } else {
          setTournamentStage('eliminated');
        }
      }
    }, 250);
  };

  const handleSimulateKnockoutStage = (
    step: 'quarter_final' | 'semi_final' | 'final' | 'third_place',
    opp: { name: string; teamOvr: number }
  ) => {
    const stageName =
      step === 'quarter_final'
        ? 'Quarter-Final'
        : step === 'semi_final'
        ? 'Semi-Final'
        : step === 'final'
        ? 'Grand Final'
        : 'Third-Place Match';

    const { matchResult, updatedPlayer } = generateTournamentMatchResult(
      player,
      stageName,
      opp.name,
      opp.teamOvr
    );

    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }

    const nextMatches = [...completedMatches, matchResult];
    setCompletedMatches(nextMatches);

    const isWon = (matchResult.homeScore ?? 0) > (matchResult.awayScore ?? 0);

    if (step === 'quarter_final') {
      if (isWon) {
        setTournamentStage('semi_final');
      } else {
        setTournamentStage('completed');
        onFinishTournament(nextMatches, 'Quarter-Finalist');
      }
    } else if (step === 'semi_final') {
      if (isWon) {
        setTournamentStage('final');
      } else {
        setTournamentStage('third_place');
      }
    } else if (step === 'final') {
      setTournamentStage('completed');
      onFinishTournament(nextMatches, isWon ? 'Champion 🏆' : 'Runner-Up 🥈');
    } else if (step === 'third_place') {
      setTournamentStage('completed');
      onFinishTournament(nextMatches, isWon ? '3rd Place 🥉' : '4th Place');
    }
  };

  const handleSkipEntireTournament = () => {
    let nextMatches = [...completedMatches];
    let currentPlayer = { ...player };

    // 1. Finish group stage if still in group stage
    let currentIdx = groupMatchIndex;
    while (currentIdx < 3) {
      const currentOpponent = opponentList[currentIdx] || { name: `FC Youth Academy #${currentIdx + 1}`, teamOvr: 64 };
      const stageName = `GROUP STAGE — MATCH ${currentIdx + 1}`;
      const { matchResult, updatedPlayer } = generateTournamentMatchResult(
        currentPlayer,
        stageName,
        currentOpponent.name,
        currentOpponent.teamOvr
      );
      currentPlayer = updatedPlayer;
      nextMatches.push(matchResult);
      currentIdx++;
    }
    setGroupMatchIndex(3);

    // Compute player group points and goal difference
    let playerPoints = 0;
    let playerGd = 0;
    nextMatches.slice(0, 3).forEach((m) => {
      const pScore = m.homeScore ?? 0;
      const oppScore = m.awayScore ?? 0;
      playerGd += (pScore - oppScore);
      if (pScore > oppScore) playerPoints += 3;
      else if (pScore === oppScore) playerPoints += 1;
    });

    const qualifies = playerPoints >= 4 || (playerPoints === 3 && playerGd >= 0);

    if (!qualifies) {
      setCompletedMatches(nextMatches);
      setTournamentStage('completed');
      if (onUpdatePlayer) onUpdatePlayer(currentPlayer);
      onFinishTournament(nextMatches, 'Group Stage (3rd/4th)');
      return;
    }

    // 2. Simulate Quarter-Final (if not already played)
    const hasQF = nextMatches.some((m) => m.stageName?.includes('Quarter'));
    if (!hasQF) {
      const qfOpp = { name: 'Bayern Munich U17', teamOvr: 68 };
      const { matchResult: qfResult, updatedPlayer: qfPlayer } = generateTournamentMatchResult(
        currentPlayer,
        'Quarter-Final',
        qfOpp.name,
        qfOpp.teamOvr
      );
      currentPlayer = qfPlayer;
      nextMatches.push(qfResult);
      const wonQF = (qfResult.homeScore ?? 0) > (qfResult.awayScore ?? 0);
      if (!wonQF) {
        setCompletedMatches(nextMatches);
        setTournamentStage('completed');
        if (onUpdatePlayer) onUpdatePlayer(currentPlayer);
        onFinishTournament(nextMatches, 'Quarter-Finalist');
        return;
      }
    }

    // 3. Simulate Semi-Final (if not already played)
    const hasSF = nextMatches.some((m) => m.stageName?.includes('Semi'));
    let wonSF = false;
    if (!hasSF) {
      const sfOpp = { name: 'Real Madrid U17', teamOvr: 71 };
      const { matchResult: sfResult, updatedPlayer: sfPlayer } = generateTournamentMatchResult(
        currentPlayer,
        'Semi-Final',
        sfOpp.name,
        sfOpp.teamOvr
      );
      currentPlayer = sfPlayer;
      nextMatches.push(sfResult);
      wonSF = (sfResult.homeScore ?? 0) > (sfResult.awayScore ?? 0);
    } else {
      const sfMatch = nextMatches.find((m) => m.stageName?.includes('Semi'));
      wonSF = (sfMatch?.homeScore ?? 0) > (sfMatch?.awayScore ?? 0);
    }

    // 4. Simulate Final or Third-Place
    if (wonSF) {
      const hasFinal = nextMatches.some(
        (m) => m.stageName?.includes('Final') && !m.stageName?.includes('Quarter') && !m.stageName?.includes('Semi')
      );
      if (!hasFinal) {
        const finalOpp = { name: 'Manchester City U17', teamOvr: 73 };
        const { matchResult: fResult, updatedPlayer: fPlayer } = generateTournamentMatchResult(
          currentPlayer,
          'Grand Final',
          finalOpp.name,
          finalOpp.teamOvr
        );
        currentPlayer = fPlayer;
        nextMatches.push(fResult);
        const wonFinal = (fResult.homeScore ?? 0) > (fResult.awayScore ?? 0);
        setCompletedMatches(nextMatches);
        setTournamentStage('completed');
        if (onUpdatePlayer) onUpdatePlayer(currentPlayer);
        onFinishTournament(nextMatches, wonFinal ? 'Champion 🏆' : 'Runner-Up 🥈');
        return;
      }
    } else {
      const hasTP = nextMatches.some((m) => m.stageName?.includes('Third'));
      if (!hasTP) {
        const tpOpp = { name: 'Ajax Academy U17', teamOvr: 69 };
        const { matchResult: tpResult, updatedPlayer: tpPlayer } = generateTournamentMatchResult(
          currentPlayer,
          'Third-Place Match',
          tpOpp.name,
          tpOpp.teamOvr
        );
        currentPlayer = tpPlayer;
        nextMatches.push(tpResult);
        const wonTP = (tpResult.homeScore ?? 0) > (tpResult.awayScore ?? 0);
        setCompletedMatches(nextMatches);
        setTournamentStage('completed');
        if (onUpdatePlayer) onUpdatePlayer(currentPlayer);
        onFinishTournament(nextMatches, wonTP ? '3rd Place 🥉' : '4th Place');
        return;
      }
    }

    setCompletedMatches(nextMatches);
    setTournamentStage('completed');
    if (onUpdatePlayer) onUpdatePlayer(currentPlayer);
    onFinishTournament(nextMatches, 'Tournament Concluded');
  };

  if (!playerGroup) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <p className="text-amber-400 font-bold text-sm">Initializing International Youth Cup Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* TOURNAMENT HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>{effectiveTitle}</span>
                <span className="text-xs bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-400/40 font-extrabold">
                  LIVE MATCH SIMULATION
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                Representing <span className="text-amber-300 font-bold">{playerClubName} {categoryLabel}</span> in World Championship
              </p>
            </div>
          </div>

          {/* STAGE STATUS & SKIP BUTTON */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {tournamentStage !== 'completed' && (
              <button
                type="button"
                onClick={handleSkipEntireTournament}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95"
                title="Simulate all remaining tournament matches and jump to final tournament results"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>SKIP TOURNAMENT ⏩</span>
              </button>
            )}

            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Stage</span>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {tournamentStage === 'group_stage' && `Group Stage (${groupMatchIndex}/3 Matches)`}
                {tournamentStage === 'quarter_final' && 'Quarter-Final ⚡'}
                {tournamentStage === 'semi_final' && 'Semi-Final ⚡'}
                {tournamentStage === 'final' && 'Grand Final 🏆'}
                {tournamentStage === 'third_place' && 'Third-Place Match 🥉'}
                {tournamentStage === 'eliminated' && 'Eliminated'}
                {tournamentStage === 'completed' && 'Tournament Completed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GROUP STAGE SECTION */}
      {tournamentStage === 'group_stage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: LIVE MATCH PROGRESSION */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  Live Match Simulation
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {groupMatchIndex < 3 ? `Upcoming: Match ${groupMatchIndex + 1} of 3` : 'Group Matches Complete'}
                </span>
              </div>

              {/* NEXT MATCH PREVIEW BOX */}
              {groupMatchIndex < 3 && (
                <div className="bg-slate-950 border-2 border-indigo-500/50 rounded-xl p-4 space-y-3 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <span>Group Stage Match {groupMatchIndex + 1}</span>
                    <span className="bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40">
                      VS {opponentList[groupMatchIndex]?.name || 'Opponent'}
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    <div className="text-center">
                      <p className="text-xs font-black text-amber-300">{playerClubName} {categoryLabel}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">OVR {player.ovr || 60}</p>
                    </div>
                    <div className="text-xl font-black text-slate-500">VS</div>
                    <div className="text-center">
                      <p className="text-xs font-black text-white">{opponentList[groupMatchIndex]?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">OVR {opponentList[groupMatchIndex]?.teamOvr || 64}</p>
                    </div>
                  </div>

                  {/* ADVANCE & SKIP BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAdvanceGroupMatch}
                      disabled={isAdvancing}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      <span>{isAdvancing ? 'SIMULATING...' : 'ADVANCE →'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipEntireTournament}
                      className="px-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                      title="Skip entire tournament to summary"
                    >
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>SKIP TOURNAMENT ⏩</span>
                    </button>
                  </div>
                </div>
              )}

              {/* COMPLETED MATCHES LIST */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Group Matches</h4>
                {completedMatches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                    Click ADVANCE → above to generate the first group match!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...completedMatches].reverse().map((m) => (
                      <YouthMatchCard key={m.matchId} match={m} animateIn={true} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: REAL-TIME GROUP STANDINGS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  {playerGroup.groupName} Table
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  Top 2 Qualify
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-800">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-1 text-center">P</th>
                      <th className="py-2 px-1 text-center">GD</th>
                      <th className="py-2 px-1 text-center font-black text-amber-300">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-semibold">
                    {liveStandings.map((s, idx) => {
                      const isPlayerClub = s.clubName.toLowerCase() === playerClubName.toLowerCase();
                      const isQualifiedRow = idx < 2;

                      return (
                        <tr
                          key={s.clubId}
                          className={`${
                            isPlayerClub
                              ? 'bg-amber-950/40 font-black text-amber-200'
                              : isQualifiedRow
                              ? 'text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          <td className="py-2 px-1 font-bold">
                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                              isQualifiedRow ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2 px-2 truncate max-w-[120px]">
                            {s.clubName}
                          </td>
                          <td className="py-2 px-1 text-center text-slate-300">{s.played}</td>
                          <td className="py-2 px-1 text-center text-slate-300">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                          <td className="py-2 px-1 text-center font-black text-amber-300 text-xs">{s.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KNOCKOUT STAGE / KEY MATCH INTERFACE */}
      {['quarter_final', 'semi_final', 'final', 'third_place'].includes(tournamentStage) && (() => {
        const step = tournamentStage as 'quarter_final' | 'semi_final' | 'final' | 'third_place';
        let opp = quarterOpp;
        let stageName = 'Quarter-Final';
        if (step === 'semi_final') {
          opp = semiOpp;
          stageName = 'Semi-Final';
        }
        if (step === 'final') {
          opp = finalOpp;
          stageName = 'Grand Final';
        }
        if (step === 'third_place') {
          opp = thirdOpp;
          stageName = 'Third-Place Match';
        }

        const matchEval = classifyMatchImportance({
          stageTitle: stageName,
          competitionName: 'International Youth Cup',
          teamAName: playerClubName,
          teamBName: opp.name,
          isFinalMatchday: step === 'final',
          playerPlayMode: player.keyMatchPlayMode || 'decisive',
        });

        return (
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl text-center space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-300 shadow-lg">
              <Zap className="w-8 h-8 fill-amber-300 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    matchEval.category === 'DEFINITIVE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  }`}
                >
                  {matchEval.category === 'DEFINITIVE' ? (
                    <Trophy className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  {matchEval.badgeLabel}
                </span>

                {matchEval.derbyName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-black uppercase">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {matchEval.derbyName}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {stageName} MATCH READY ⚡
              </h3>
              <p className="text-xs text-slate-300 mt-1 font-semibold max-w-md mx-auto">
                {matchEval.reasonDescription}
              </p>
            </div>

            {/* OPPONENT CARD */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-around">
              <div className="text-center">
                <p className="text-xs font-black text-amber-300">{playerClubName} {categoryLabel}</p>
                <p className="text-[10px] text-slate-400">OVR {player.ovr || 60}</p>
              </div>
              <div className="text-lg font-black text-amber-400">VS</div>
              <div className="text-center">
                <p className="text-xs font-black text-white">
                  {opp.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  OVR {opp.teamOvr}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {matchEval.isPlayableInCurrentMode ? (
                <>
                  <button
                    onClick={() => {
                      onTriggerKeyMatch(step, opp.name, opp.teamOvr);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>PLAY KEY MATCH ⚡</span>
                  </button>
                  <button
                    onClick={() => handleSimulateKnockoutStage(step, opp)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Quick Simulate Match ⏩</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSimulateKnockoutStage(step, opp)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>SIMULATE {stageName.toUpperCase()} ⏩</span>
                  </button>
                  <button
                    onClick={() => {
                      onTriggerKeyMatch(step, opp.name, opp.teamOvr);
                    }}
                    className="w-full bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-500/30"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Play Key Match Manually ⚡</span>
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ELIMINATED BANNER */}
      {tournamentStage === 'eliminated' && (
        <div className="bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center mx-auto text-rose-400">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white uppercase">Eliminated in Group Stage</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your team finished 3rd/4th in Group A and did not qualify for the knockout rounds.
            </p>
          </div>

          <button
            onClick={() => onFinishTournament(completedMatches, 'Group Stage Elimination')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            RETURN TO SEASON SUMMARY →
          </button>
        </div>
      )}
    </div>
  );
};
