import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Globe,
  Shield,
  Star,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  MapPin,
} from 'lucide-react';
import { PlayerCardData } from '../types';
import { LeagueDatabase } from '../types/leagueEditor';
import { getLeagueDatabase } from '../utils/leagueDatabaseSystem';
import { ContinentalFederation } from '../types/competitionEditor';
import {
  ContinentalCompetitionId,
  ContinentalTournamentSeasonState,
  ContinentalClubRegistration,
  SuperCupSeasonState,
} from '../types/continentalCompetitions';
import {
  CONTINENTAL_COMPETITIONS_CATALOG,
  checkContinentalCompetitionPlayability,
  getEligibleClubsForFederation,
} from '../utils/continentalDatabaseSystem';
import { audioManager } from '../utils/audioSystem';
import {
  determineContinentalQualifiers,
  DomesticSeasonResultSnapshot,
} from '../utils/continentalQualificationSystem';
import { awardTrophiesToPlayer } from '../utils/trophySystem';
import {
  getOrCreateContinentalSquadRegistration,
  applyMidSeasonContinentalSquadChange,
} from '../utils/continentalSquadRegistrationSystem';
import {
  generateContinentalTournamentDraw,
  simulateContinentalGroupMatchday,
  advanceContinentalKnockoutStage,
  getContinentalTournamentState,
  saveContinentalTournamentState,
  getSuperCupSeasonState,
  buildSuperCupSeasonState,
} from '../utils/continentalTournamentEngine';
import {
  getContinentalFinalVenue,
  getNextSeasonContinentalFinalVenue,
} from '../utils/continentalVenueSystem';

interface ContinentalDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  leagueDb?: LeagueDatabase;
  currentSeasonYear: number;
  domesticSnapshots?: DomesticSeasonResultSnapshot[];
  onPlayerUpdate?: (updatedPlayer: PlayerCardData) => void;
}

const FEDERATION_TABS: { id: ContinentalFederation; name: string; region: string }[] = [
  { id: 'UEFA', name: 'UEFA', region: 'Europe' },
  { id: 'CONMEBOL', name: 'CONMEBOL', region: 'South America' },
  { id: 'CONCACAF', name: 'CONCACAF', region: 'North & Central America' },
  { id: 'AFC', name: 'AFC', region: 'Asia & Oceania' },
  { id: 'CAF', name: 'CAF', region: 'Africa' },
  { id: 'OFC', name: 'OFC', region: 'Oceania' },
];

export const ContinentalDashboardModal: React.FC<ContinentalDashboardModalProps> = ({
  isOpen,
  onClose,
  player,
  leagueDb,
  currentSeasonYear,
  domesticSnapshots = [],
  onPlayerUpdate,
}) => {
  const activeLeagueDb = leagueDb || getLeagueDatabase();
  const [selectedFed, setSelectedFed] = useState<ContinentalFederation>('UEFA');
  const [selectedCompId, setSelectedCompId] = useState<ContinentalCompetitionId>('UEFA_CL');
  const [activeTab, setActiveTab] = useState<'groups' | 'knockout' | 'squad' | 'supercup'>('groups');
  const [tournamentState, setTournamentState] = useState<ContinentalTournamentSeasonState | null>(null);
  const [squadRegistration, setSquadRegistration] = useState<ContinentalClubRegistration | null>(null);
  const [superCupState, setSuperCupState] = useState<SuperCupSeasonState | null>(null);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
  const [selectedLeagueMatchday, setSelectedLeagueMatchday] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Player's club info
  const playerClub = player.clubId ? activeLeagueDb.teams[player.clubId] : undefined;

  // Federations competitions list
  const fedCompetitions = Object.values(CONTINENTAL_COMPETITIONS_CATALOG).filter(
    (c) => c.federation === selectedFed
  );

  // Update selectedCompId if not in current federation
  useEffect(() => {
    if (!fedCompetitions.some((c) => c.id === selectedCompId)) {
      if (fedCompetitions.length > 0) {
        setSelectedCompId(fedCompetitions[0].id);
      }
    }
  }, [selectedFed]);

  // Immediately switch to Continental Playlist when viewing or playing continental tournaments
  useEffect(() => {
    if (isOpen) {
      const meta = CONTINENTAL_COMPETITIONS_CATALOG[selectedCompId];
      audioManager.enterMatchMode('continental', meta?.name || selectedCompId);
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, selectedCompId, player]);

  // Load tournament state and registration for selectedCompId
  useEffect(() => {
    if (!isOpen) return;

    const playability = checkContinentalCompetitionPlayability(selectedCompId, activeLeagueDb);
    if (!playability.isPlayable) {
      setTournamentState(null);
      setSquadRegistration(null);
      return;
    }

    const meta = CONTINENTAL_COMPETITIONS_CATALOG[selectedCompId];
    if (meta.isSuperCup) {
      setActiveTab('supercup');
      let sc = getSuperCupSeasonState(selectedCompId as 'UEFA_SC' | 'CONMEBOL_REC', currentSeasonYear);
      if (!sc) {
        const pool = getEligibleClubsForFederation(selectedFed, activeLeagueDb);
        const tA = pool[0] || { id: 'champ_a', name: 'Champions League Winners', overallRating: 85 };
        const tB = pool[1] || { id: 'champ_b', name: 'Europa League Winners', overallRating: 83 };
        sc = buildSuperCupSeasonState(
          selectedCompId as any,
          currentSeasonYear,
          { id: tA.id, name: tA.name, ovr: tA.overallRating || 84, isPlayer: tA.id === player.clubId, title: 'UCL Champion' },
          { id: tB.id, name: tB.name, ovr: tB.overallRating || 82, isPlayer: tB.id === player.clubId, title: 'UEL Champion' }
        );
      }
      setSuperCupState(sc);
      return;
    }

    // Load standard tournament
    let currentTourn = getContinentalTournamentState(selectedCompId, currentSeasonYear);
    if (!currentTourn) {
      const qualifiers = determineContinentalQualifiers(
        selectedCompId,
        activeLeagueDb,
        domesticSnapshots,
        player
      );
      currentTourn = generateContinentalTournamentDraw(
        selectedCompId,
        currentSeasonYear,
        qualifiers,
        player.clubId
      );
    }
    setTournamentState(currentTourn);

    // Load squad registration for player's club if participant
    if (playerClub && currentTourn.participatingTeamIds.includes(playerClub.id)) {
      const reg = getOrCreateContinentalSquadRegistration(
        playerClub,
        selectedCompId,
        currentSeasonYear,
        player
      );
      setSquadRegistration(reg);
    } else {
      setSquadRegistration(null);
    }
  }, [isOpen, selectedCompId, selectedFed, currentSeasonYear]);

  if (!isOpen) return null;

  const currentPlayability = checkContinentalCompetitionPlayability(selectedCompId, activeLeagueDb);
  const compMeta = CONTINENTAL_COMPETITIONS_CATALOG[selectedCompId];

  const handleSimulateMatchday = (mdIdx: number) => {
    if (!tournamentState) return;
    const updated = simulateContinentalGroupMatchday(tournamentState, mdIdx, player);
    setTournamentState(updated);
    setStatusMessage(`Matchday ${mdIdx} simulated successfully!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAdvanceKnockout = () => {
    if (!tournamentState) return;
    const updated = advanceContinentalKnockoutStage(tournamentState, player);
    setTournamentState(updated);
    if (updated.playerClubIsChampion && onPlayerUpdate) {
      const compMeta = CONTINENTAL_COMPETITIONS_CATALOG[selectedCompId];
      const prestige = compMeta?.tier === 1 ? 100 : compMeta?.tier === 2 ? 80 : 60;
      const updatedPlayer = awardTrophiesToPlayer(player, [
        {
          name: compMeta?.name || 'Continental Champions Cup',
          category: 'continental',
          year: String(currentSeasonYear),
          prestige: prestige,
          iconType: compMeta?.tier === 1 ? 'champions-league' : 'cup',
        },
      ]);
      onPlayerUpdate(updatedPlayer);
    }
    setStatusMessage(`Advanced to stage: ${updated.currentStage.toUpperCase()}!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div
      id="continental-dashboard-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto font-pixel select-none"
    >
      <motion.div
        id="continental-dashboard-modal-container"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-7xl max-h-[96vh] bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* Header */}
        <div
          id="continental-dashboard-header"
          className="relative z-10 px-6 py-4 border-b-2 border-slate-800 flex items-center justify-between bg-slate-950"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 pixel-corners pixel-bevel-raised flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: compMeta?.bannerColor || '#2563eb' }}
            >
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white pixel-text-shadow">
                  Continental Competition System
                </h2>
                <span className="px-2 py-0.5 text-xs font-arcade font-semibold pixel-corners bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Season {currentSeasonYear}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-retro">
                Official International Club Tournaments across all 6 Global Federations
              </p>
            </div>
          </div>
          <button
            id="continental-dashboard-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white pixel-corners hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Federation Selector Bar */}
        <div
          id="continental-federation-bar"
          className="relative z-10 px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none"
        >
          {FEDERATION_TABS.map((fed) => {
            const isSelected = selectedFed === fed.id;
            return (
              <button
                key={fed.id}
                id={`fed-tab-${fed.id}`}
                onClick={() => setSelectedFed(fed.id)}
                className={`px-3.5 py-1.5 pixel-corners text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer font-pixel ${
                  isSelected
                    ? 'bg-blue-600 text-white pixel-bevel-raised border border-blue-400 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{fed.name}</span>
                <span className="text-[10px] font-retro opacity-70">({fed.region})</span>
              </button>
            );
          })}
        </div>

        {/* Competitions Sub-Nav & Status Bar */}
        <div
          id="continental-competitions-bar"
          className="relative z-10 px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {fedCompetitions.map((comp) => {
              const isSelected = selectedCompId === comp.id;
              const pStatus = checkContinentalCompetitionPlayability(comp.id, activeLeagueDb);
              return (
                <button
                  key={comp.id}
                  id={`comp-tab-${comp.id}`}
                  onClick={() => {
                    setSelectedCompId(comp.id);
                    if (comp.isSuperCup) setActiveTab('supercup');
                    else if (activeTab === 'supercup') setActiveTab('groups');
                  }}
                  className={`px-3 py-1.5 pixel-corners text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer font-pixel ${
                    isSelected
                      ? 'border-blue-400 bg-blue-950 text-blue-200 pixel-bevel-raised shadow-sm font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Trophy
                    className="w-3.5 h-3.5"
                    style={{ color: isSelected ? comp.bannerColor : undefined }}
                  />
                  <span>{comp.name}</span>
                  {!pStatus.isPlayable && (
                    <span className="px-1.5 py-0.2 text-[9px] pixel-corners font-arcade bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-Tabs for playable tournaments */}
          {currentPlayability.isPlayable && !compMeta?.isSuperCup && (
            <div className="flex items-center bg-slate-950 p-1 pixel-corners border border-slate-800 text-xs font-pixel">
              <button
                id="tab-groups-btn"
                onClick={() => setActiveTab('groups')}
                className={`px-3 py-1 pixel-corners transition-colors cursor-pointer ${
                  activeTab === 'groups'
                    ? 'bg-blue-600 text-white font-bold pixel-bevel-raised'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tournamentState?.isLeaguePhaseFormat ? 'League Phase' : 'Group Stage'}
              </button>
              <button
                id="tab-knockout-btn"
                onClick={() => setActiveTab('knockout')}
                className={`px-3 py-1 pixel-corners transition-colors cursor-pointer ${
                  activeTab === 'knockout'
                    ? 'bg-blue-600 text-white font-bold pixel-bevel-raised'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Knockout Bracket
              </button>
              <button
                id="tab-squad-btn"
                onClick={() => setActiveTab('squad')}
                className={`px-3 py-1 pixel-corners transition-colors cursor-pointer ${
                  activeTab === 'squad'
                    ? 'bg-blue-600 text-white font-bold pixel-bevel-raised'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                25-Player Squad
              </button>
            </div>
          )}
        </div>

        {/* Toast / Status Alert */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body Content */}
        <div id="continental-dashboard-body" className="flex-1 p-6 overflow-y-auto bg-slate-950/50">
          {/* Confirmed Locked Final Venue Widget (for playable tournaments) */}
          {currentPlayability.isPlayable && !compMeta?.isSuperCup && (
            (() => {
              const finalVenue = tournamentState?.finalVenue || getContinentalFinalVenue(selectedCompId, currentSeasonYear);
              const nextSeasonVenue = getNextSeasonContinentalFinalVenue(selectedCompId, currentSeasonYear);
              return (
                <div id="continental-locked-venue-card" className="bg-slate-900 border-2 border-amber-500/50 pixel-corners pixel-bevel-gold p-4 shadow-xl mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-3 pixel-corners bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                        <MapPin className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 font-arcade">
                            Confirmed Grand Final Venue • Season {currentSeasonYear}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-arcade">
                            Locked 1 Season Prior
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mt-0.5 font-pixel">
                          {finalVenue.stadium} <span className="text-slate-400 font-semibold font-retro">— {finalVenue.city}, {finalVenue.country}</span>
                        </h3>
                        <p className="text-xs text-slate-400 font-medium font-retro">
                          Approximate Capacity: <strong className="text-slate-200 font-arcade">{finalVenue.capacity.toLocaleString()} seats</strong> • Atmosphere: <strong className="text-amber-300 font-arcade">★★★★★ Continental Showpiece</strong>
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end pl-4 border-l border-slate-800 shrink-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-arcade">
                        Next Season ({currentSeasonYear + 1}) Locked Venue
                      </span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 font-pixel">
                        {nextSeasonVenue.stadium}
                      </span>
                      <span className="text-[11px] text-slate-400 font-retro">
                        {nextSeasonVenue.city}, {nextSeasonVenue.country} ({nextSeasonVenue.capacity.toLocaleString()} seats)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {!currentPlayability.isPlayable ? (
            /* NON-PLAYABLE FEDERATION / TOURNAMENT STATE */
            <div
              id="non-playable-federation-view"
              className="py-12 px-8 max-w-xl mx-auto text-center flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-800 pixel-corners"
            >
              <div className="w-16 h-16 pixel-corners bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-pixel">{compMeta?.name}</h3>
              <p className="text-xs text-amber-400 font-medium mb-3 font-retro">
                {currentPlayability.reason}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-retro">
                This continental competition exists in the global football structure. It will
                automatically unlock and become fully playable when the {selectedFed} database is
                expanded with sufficient registered clubs.
              </p>
              <div className="w-full bg-slate-950 p-4 pixel-corners border border-slate-800 text-left text-xs font-arcade">
                <div className="flex justify-between items-center mb-1 text-slate-400 font-pixel">
                  <span>Clubs in Federation Database:</span>
                  <span className="font-semibold text-slate-200 font-arcade">
                    {currentPlayability.eligibleClubsCount} / {currentPlayability.minTeamsRequired}
                  </span>
                </div>
                <div className="w-full bg-slate-800 pixel-corners h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentPlayability.eligibleClubsCount /
                          currentPlayability.minTeamsRequired) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : compMeta?.isSuperCup && superCupState ? (
            /* SUPER CUP VIEW */
            <div id="supercup-view" className="max-w-3xl mx-auto py-6">
              <div className="text-center mb-6">
                <span className="px-3 py-1 pixel-corners text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-arcade">
                  Showpiece Super Cup
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2 font-pixel pixel-text-shadow">{superCupState.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-retro">
                  Season-opening clash between the reigning Champions
                </p>
              </div>

              <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-6 shadow-xl">
                <div className="grid grid-cols-3 items-center gap-4 text-center">
                  <div className="p-4 bg-slate-950 pixel-corners border border-slate-800">
                    <span className="text-[10px] text-blue-400 font-semibold uppercase font-arcade">
                      {superCupState.teamA.title}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-1 font-pixel">
                      {superCupState.teamA.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-arcade">OVR {superCupState.teamA.ovr}</span>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1 font-arcade pixel-text-shadow">VS</div>
                    <span className="px-2 py-0.5 text-[10px] pixel-corners bg-slate-800 text-slate-400 font-arcade">
                      Neutral Ground Final
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950 pixel-corners border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase font-arcade">
                      {superCupState.teamB.title}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-1 font-pixel">
                      {superCupState.teamB.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-arcade">OVR {superCupState.teamB.ovr}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'groups' && tournamentState ? (
            /* LEAGUE PHASE (36 TEAMS) OR TRADITIONAL GROUP STAGE VIEW */
            tournamentState.isLeaguePhaseFormat ? (
              /* 36-TEAM SWISS LEAGUE PHASE VIEW */
              <div id="tournament-league-phase-view" className="space-y-6">
                {/* Matchday Selector & Simulation Bar */}
                <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-950 p-3.5 pixel-corners border border-slate-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-400 mr-2 shrink-0 font-pixel">Matchday:</span>
                    {Array.from({ length: tournamentState.leaguePhaseTotalMatchdays || 8 }).map((_, mdIdx) => {
                      const mdNum = mdIdx + 1;
                      const isCurrent = (tournamentState.leaguePhaseCurrentMatchday || 0) >= mdNum;
                      const isSelected = selectedLeagueMatchday === mdNum;
                      return (
                        <button
                          key={mdNum}
                          id={`league-md-pill-${mdNum}`}
                          onClick={() => setSelectedLeagueMatchday(mdNum)}
                          className={`px-3 py-1.5 pixel-corners text-xs font-bold transition-all shrink-0 cursor-pointer font-arcade ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md pixel-bevel-raised font-bold'
                              : isCurrent
                              ? 'bg-slate-900 text-slate-200 border border-slate-700'
                              : 'bg-slate-900/60 text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          MD {mdNum} {isCurrent ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="simulate-league-md-btn"
                      onClick={() => handleSimulateMatchday(selectedLeagueMatchday)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 pixel-corners bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 pixel-bevel-raised text-white text-xs font-bold shadow-md transition-all cursor-pointer font-pixel uppercase"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Simulate MD {selectedLeagueMatchday}
                    </button>
                  </div>
                </div>

                {/* League Standings & Matchday Fixtures */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Unified 36-Team Standings Table (2 cols on large) */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 pixel-corners overflow-hidden shadow-lg">
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-pixel">
                          36-Team Single League Table
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 pixel-corners bg-blue-500/20 text-blue-300 font-arcade">
                          MD {tournamentState.leaguePhaseCurrentMatchday || 0}/{tournamentState.leaguePhaseTotalMatchdays || 8}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-arcade">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-2 h-2 pixel-corners bg-emerald-400" />
                          1–8: Direct R16
                        </span>
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <span className="w-2 h-2 pixel-corners bg-blue-400" />
                          9–24: Play-offs
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <span className="w-2 h-2 pixel-corners bg-slate-500" />
                          25–36: Eliminated
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[520px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur-sm font-pixel">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Club</th>
                            <th className="py-2.5 px-2 text-center">PL</th>
                            <th className="py-2.5 px-2 text-center">W</th>
                            <th className="py-2.5 px-2 text-center">D</th>
                            <th className="py-2.5 px-2 text-center">L</th>
                            <th className="py-2.5 px-2 text-center">GF</th>
                            <th className="py-2.5 px-2 text-center">GA</th>
                            <th className="py-2.5 px-2 text-center">GD</th>
                            <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                            <th className="py-2.5 px-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-arcade">
                          {(tournamentState.leaguePhaseStandings || []).map((team, rank) => {
                            const isDirectR16 = rank < 8;
                            const isPlayoff = rank >= 8 && rank < 24;
                            const isEliminated = rank >= 24;

                            return (
                              <tr
                                key={team.teamId}
                                className={`transition-colors ${
                                  team.isPlayerTeam
                                    ? 'bg-blue-950/60 hover:bg-blue-950/80 font-bold text-blue-100 ring-1 ring-inset ring-blue-500/50'
                                    : isDirectR16
                                    ? 'bg-emerald-950/20 hover:bg-emerald-950/30 text-slate-200'
                                    : isPlayoff
                                    ? 'bg-blue-950/10 hover:bg-blue-950/20 text-slate-300'
                                    : 'hover:bg-slate-800/40 text-slate-400'
                                }`}
                              >
                                <td className="py-2 px-3 font-arcade font-bold">
                                  <span
                                    className={`w-5 h-5 pixel-corners inline-flex items-center justify-center text-[10px] ${
                                      isDirectR16
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                        : isPlayoff
                                        ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                                        : 'bg-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {rank + 1}
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-medium font-pixel">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{team.teamName}</span>
                                    {team.isPlayerTeam && (
                                      <span className="px-1.5 py-0.2 pixel-corners text-[9px] bg-amber-400 text-slate-950 font-black font-arcade">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center text-slate-400">{team.played}</td>
                                <td className="py-2 px-2 text-center">{team.won}</td>
                                <td className="py-2 px-2 text-center">{team.drawn}</td>
                                <td className="py-2 px-2 text-center">{team.lost}</td>
                                <td className="py-2 px-2 text-center text-slate-400">{team.goalsFor}</td>
                                <td className="py-2 px-2 text-center text-slate-400">{team.goalsAgainst}</td>
                                <td className="py-2 px-2 text-center font-semibold">
                                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                                </td>
                                <td className="py-2 px-3 text-center font-black text-amber-300 text-sm">
                                  {team.points}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  {isDirectR16 ? (
                                    <span className="px-1.5 py-0.5 pixel-corners text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-arcade">
                                      R16
                                    </span>
                                  ) : isPlayoff ? (
                                    <span className="px-1.5 py-0.5 pixel-corners text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-arcade">
                                      Play-off
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 font-arcade">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* League Matchday Fixtures */}
                  <div className="bg-slate-900 border border-slate-800 pixel-corners overflow-hidden shadow-lg flex flex-col">
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-pixel">
                      <h4 className="text-sm font-bold text-white">
                        Matchday {selectedLeagueMatchday} Fixtures
                      </h4>
                      <span className="text-[10px] text-slate-400 font-arcade">
                        {
                          (tournamentState.leaguePhaseFixtures || []).filter(
                            (f) => f.matchdayIndex === selectedLeagueMatchday
                          ).length
                        }{' '}
                        Matches
                      </span>
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto max-h-[520px]">
                      {(tournamentState.leaguePhaseFixtures || [])
                        .filter((f) => f.matchdayIndex === selectedLeagueMatchday)
                        .map((fix) => (
                          <div
                            key={fix.id}
                            className={`p-2.5 pixel-corners border text-xs flex items-center justify-between gap-2 ${
                              fix.isPlayerMatch
                                ? 'bg-blue-950/50 border-blue-500/50 shadow-md ring-1 ring-blue-400/40 pixel-bevel-raised'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <span
                                className={`truncate text-left flex-1 font-pixel ${
                                  fix.homeTeamId === player.clubId ? 'font-black text-amber-300' : 'text-slate-200'
                                }`}
                              >
                                {fix.homeTeamName}
                              </span>
                              <div className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 font-arcade font-bold text-center min-w-12 text-white">
                                {fix.isCompleted ? `${fix.homeScore} - ${fix.awayScore}` : 'vs'}
                              </div>
                              <span
                                className={`truncate text-right flex-1 font-pixel ${
                                  fix.awayTeamId === player.clubId ? 'font-black text-amber-300' : 'text-slate-200'
                                }`}
                              >
                                {fix.awayTeamName}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TRADITIONAL 32-TEAM GROUP STAGE VIEW */
              <div id="tournament-group-stage-view" className="space-y-6">
                {/* Group Selector Pills */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {tournamentState.groups.map((grp, idx) => {
                      const isSelected = selectedGroupIdx === idx;
                      const hasPlayer = grp.teams.some((t) => t.isPlayer);
                      return (
                        <button
                          key={grp.id}
                          id={`group-pill-${grp.groupLetter}`}
                          onClick={() => setSelectedGroupIdx(idx)}
                          className={`px-3 py-1.5 pixel-corners text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-pixel ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md pixel-bevel-raised'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <span>Group {grp.groupLetter}</span>
                          {hasPlayer && (
                            <span className="w-2 h-2 pixel-corners bg-emerald-400" title="Your Club" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="simulate-group-md-btn"
                      onClick={() => handleSimulateMatchday(tournamentState.currentMatchday || 1)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 pixel-corners bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 pixel-bevel-raised text-white text-xs font-bold shadow-md transition-all cursor-pointer font-pixel uppercase"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Simulate Matchday {tournamentState.currentMatchday || 1}
                    </button>
                  </div>
                </div>

                {/* Group Standings & Fixtures */}
                {tournamentState.groups[selectedGroupIdx] && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Standings Table (2 cols on large) */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 pixel-corners overflow-hidden shadow-lg">
                      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-pixel">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Group {tournamentState.groups[selectedGroupIdx].groupLetter} Standings</span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-retro">
                          Top 2 advance to Round of 16
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-pixel">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3">Club</th>
                              <th className="py-2.5 px-2 text-center">PL</th>
                              <th className="py-2.5 px-2 text-center">W</th>
                              <th className="py-2.5 px-2 text-center">D</th>
                              <th className="py-2.5 px-2 text-center">L</th>
                              <th className="py-2.5 px-2 text-center">GF</th>
                              <th className="py-2.5 px-2 text-center">GA</th>
                              <th className="py-2.5 px-2 text-center">GD</th>
                              <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-arcade">
                            {tournamentState.groups[selectedGroupIdx].standings.map((team, rank) => (
                              <tr
                                key={team.teamId}
                                className={`transition-colors ${
                                  team.isPlayerTeam
                                    ? 'bg-blue-950/50 hover:bg-blue-950/70 font-semibold text-blue-200'
                                    : rank < 2
                                    ? 'bg-slate-900/50 hover:bg-slate-800/50'
                                    : 'hover:bg-slate-800/40 text-slate-300'
                                }`}
                              >
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`w-5 h-5 pixel-corners inline-flex items-center justify-center text-[10px] font-bold ${
                                      rank < 2
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {rank + 1}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-medium font-pixel">
                                  <div className="flex items-center gap-2">
                                    <span>{team.teamName}</span>
                                    {team.isPlayerTeam && (
                                      <span className="px-1.5 py-0.2 pixel-corners text-[9px] bg-blue-500 text-white font-bold font-arcade">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-center text-slate-400">{team.played}</td>
                                <td className="py-2.5 px-2 text-center">{team.won}</td>
                                <td className="py-2.5 px-2 text-center">{team.drawn}</td>
                                <td className="py-2.5 px-2 text-center">{team.lost}</td>
                                <td className="py-2.5 px-2 text-center text-slate-400">{team.goalsFor}</td>
                                <td className="py-2.5 px-2 text-center text-slate-400">{team.goalsAgainst}</td>
                                <td className="py-2.5 px-2 text-center font-semibold">
                                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-amber-300 text-sm">
                                  {team.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Group Fixtures List */}
                    <div className="bg-slate-900 border border-slate-800 pixel-corners overflow-hidden shadow-lg flex flex-col">
                      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 font-pixel">
                        <h4 className="text-sm font-bold text-white">Group Fixtures</h4>
                      </div>
                      <div className="p-3 space-y-2 overflow-y-auto max-h-[340px]">
                        {tournamentState.groups[selectedGroupIdx].fixtures.map((fix) => (
                          <div
                            key={fix.id}
                            className={`p-2.5 pixel-corners border text-xs flex items-center justify-between gap-2 ${
                              fix.isPlayerMatch
                                ? 'bg-blue-950/40 border-blue-500/40 pixel-bevel-raised'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 font-semibold w-10 font-arcade">
                              MD{fix.matchdayIndex}
                            </span>
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <span className={`truncate font-pixel ${fix.homeTeamId === player.clubId ? 'font-bold text-blue-300' : ''}`}>
                                {fix.homeTeamName}
                              </span>
                              <div className="px-2 py-0.5 pixel-corners bg-slate-900 border border-slate-700 font-arcade font-bold text-center min-w-10">
                                {fix.isCompleted ? `${fix.homeScore} - ${fix.awayScore}` : 'vs'}
                              </div>
                              <span className={`truncate text-right font-pixel ${fix.awayTeamId === player.clubId ? 'font-bold text-blue-300' : ''}`}>
                                {fix.awayTeamName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'knockout' && tournamentState ? (
            /* KNOCKOUT BRACKET VIEW */
            <div id="tournament-knockout-view" className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-base font-bold text-white font-pixel">Knockout Stage Bracket</h4>
                  <p className="text-xs text-slate-400 font-retro">
                    {tournamentState.isLeaguePhaseFormat
                      ? 'Knockout Play-offs (9th–24th) → Round of 16 (Top 8 + Play-off Winners) → QF → SF → Grand Final'
                      : 'Two-legged home & away ties (Round of 16 through Semi-Finals) + Grand Final'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 pixel-corners text-xs font-semibold text-slate-300 font-arcade">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stage: <strong className="text-white uppercase">{tournamentState.currentStage.replace(/_/g, ' ')}</strong></span>
                  </div>
                  {tournamentState.currentStage !== 'finished' && (
                    <button
                      id="advance-knockout-stage-btn"
                      onClick={handleAdvanceKnockout}
                      className="flex items-center gap-1.5 px-4 py-1.5 pixel-corners bg-blue-600 hover:bg-blue-500 border border-blue-400 pixel-bevel-raised text-white text-xs font-bold shadow-lg transition-all cursor-pointer font-pixel uppercase"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Advance Stage
                    </button>
                  )}
                </div>
              </div>

              {/* Champion Banner if finished */}
              {tournamentState.championTeamName && (
                <div className="p-6 pixel-corners bg-slate-900 border-2 border-amber-400/50 pixel-bevel-gold text-center shadow-2xl">
                  <div className="w-12 h-12 pixel-corners bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/40">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-arcade">
                    Official Continental Champion
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1 font-pixel pixel-text-shadow">
                    {tournamentState.championTeamName} 🏆
                  </h3>
                </div>
              )}

              {/* Ties Grid - Knockout Play-offs (9th–24th) for League Phase */}
              {tournamentState.knockoutPlayoffTies && tournamentState.knockoutPlayoffTies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5 font-pixel">
                      <span className="w-2 h-2 pixel-corners bg-blue-400" />
                      Knockout Phase Play-offs (9th–16th Seeded vs 17th–24th Unseeded)
                    </h5>
                    <span className="text-[10px] text-slate-400 font-arcade">8 Winners Advance to R16</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tournamentState.knockoutPlayoffTies.map((tie) => (
                      <div
                        key={tie.id}
                        className="p-3 bg-slate-900 border border-slate-800 pixel-corners space-y-2 text-xs"
                      >
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-arcade">
                          {tie.stageName}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamA.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.homeScore : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamB.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.awayScore : '-'}</span>
                          </div>
                        </div>
                        {tie.winnerTeamName && (
                          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-arcade">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Qualified to R16: {tie.winnerTeamName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ties Grid - Round of 16 */}
              {tournamentState.r16Ties && tournamentState.r16Ties.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-pixel">Round of 16</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tournamentState.r16Ties.map((tie) => (
                      <div
                        key={tie.id}
                        className="p-3 bg-slate-900 border border-slate-800 pixel-corners space-y-2 text-xs"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade">
                          {tie.stageName}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamA.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.homeScore : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamB.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.awayScore : '-'}</span>
                          </div>
                        </div>
                        {tie.winnerTeamName && (
                          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-arcade">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Advanced: {tie.winnerTeamName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quarter-Finals */}
              {tournamentState.qfTies && tournamentState.qfTies.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-pixel">Quarter-Finals</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tournamentState.qfTies.map((tie) => (
                      <div
                        key={tie.id}
                        className="p-3 bg-slate-900 border border-slate-800 pixel-corners space-y-2 text-xs"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade">
                          {tie.stageName}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamA.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.homeScore : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamB.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.awayScore : '-'}</span>
                          </div>
                        </div>
                        {tie.winnerTeamName && (
                          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-arcade">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Advanced: {tie.winnerTeamName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Semi-Finals */}
              {tournamentState.sfTies && tournamentState.sfTies.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-pixel">Semi-Finals</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournamentState.sfTies.map((tie) => (
                      <div
                        key={tie.id}
                        className="p-3 bg-slate-900 border border-slate-800 pixel-corners space-y-2 text-xs"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-arcade">
                          {tie.stageName}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamA.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.homeScore : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center font-medium font-pixel">
                            <span className={tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : ''}>
                              {tie.teamB.name}
                            </span>
                            <span className="font-bold font-arcade">{tie.leg1?.isCompleted ? tie.leg1.awayScore : '-'}</span>
                          </div>
                        </div>
                        {tie.winnerTeamName && (
                          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-arcade">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Advanced: {tie.winnerTeamName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand Final Single-Match Showpiece */}
              {tournamentState.finalTie && (
                <div className="space-y-2 pt-2">
                  <div className="p-4 bg-slate-950 border-2 border-amber-400/50 pixel-corners pixel-bevel-gold shadow-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black uppercase text-amber-300 tracking-wider font-pixel">
                          {compMeta?.name} Grand Final
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-slate-900 px-3 py-1 pixel-corners border border-slate-700 font-retro">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {tournamentState.finalVenue?.stadium || getContinentalFinalVenue(selectedCompId, currentSeasonYear).stadium} ({(tournamentState.finalVenue || getContinentalFinalVenue(selectedCompId, currentSeasonYear)).city})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center py-2">
                      <div>
                        <h4 className={`text-sm sm:text-base font-bold font-pixel ${tournamentState.finalTie.winnerTeamId === tournamentState.finalTie.teamA.id ? 'text-amber-300' : 'text-white'}`}>
                          {tournamentState.finalTie.teamA.name}
                        </h4>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-white px-3 py-1 bg-slate-900 pixel-corners border border-slate-800 inline-block font-arcade">
                          {tournamentState.finalTie.leg1?.isCompleted
                            ? `${tournamentState.finalTie.leg1.homeScore} - ${tournamentState.finalTie.leg1.awayScore}`
                            : 'VS'}
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-bold font-pixel ${tournamentState.finalTie.winnerTeamId === tournamentState.finalTie.teamB.id ? 'text-amber-300' : 'text-white'}`}>
                          {tournamentState.finalTie.teamB.name}
                        </h4>
                      </div>
                    </div>

                    {tournamentState.finalTie.winnerTeamName && (
                      <div className="pt-2 text-center border-t border-slate-800 text-xs font-black text-amber-300 font-pixel">
                        🏆 Champion: {tournamentState.finalTie.winnerTeamName}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'squad' && squadRegistration ? (
            /* 25-PLAYER SQUAD REGISTRATION VIEW */
            <div id="continental-squad-registration-view" className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 pixel-corners">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-pixel">
                      CONTINENTAL SQUAD REGISTRATION — 25/25
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] pixel-corners bg-emerald-500/20 text-emerald-400 font-bold font-arcade">
                      Eligible
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-retro">
                    Official 25-man squad roster registered with {selectedFed} for continental matchdays.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-retro">Mid-Season Changes Left:</span>
                  <div className="text-sm font-bold text-blue-400 font-arcade">
                    {3 - squadRegistration.midSeasonChangesUsed} / 3
                  </div>
                </div>
              </div>

              {/* Registered Players Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {squadRegistration.registeredPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-3 pixel-corners border text-xs flex flex-col justify-between ${
                      p.isUserPlayer
                        ? 'bg-blue-950/60 border-blue-500 shadow-md pixel-bevel-raised'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 font-bold font-arcade">#{idx + 1}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] pixel-corners font-bold font-arcade ${
                          p.position === 'GK'
                            ? 'bg-amber-500/20 text-amber-400'
                            : p.position.includes('D')
                            ? 'bg-blue-500/20 text-blue-400'
                            : p.position.includes('M')
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {p.position}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 truncate font-pixel">{p.name}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-retro">OVR</span>
                      <span className="text-xs font-bold text-white font-arcade">{p.ovr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-retro">
              Select a continental competition or tab to view fixtures and standings.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
