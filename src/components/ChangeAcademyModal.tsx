import React, { useState, useMemo } from 'react';
import { PlayerCardData } from '../types';
import {
  YOUTH_LEAGUES_DATABASE,
  YouthTeamData,
  YouthLeagueData,
  getPlayerCurrentYouthLeague,
} from '../data/youthLeaguesDatabase';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import {
  School,
  GraduationCap,
  Globe,
  Sparkles,
  Shield,
  ArrowRightLeft,
  Lock,
  CheckCircle2,
  X,
  AlertCircle,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';

export interface ChangeAcademyModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onClose: () => void;
  onSwitchAcademy: (updatedPlayer: PlayerCardData) => void;
  showToast?: (msg: string) => void;
}

export const ChangeAcademyModal: React.FC<ChangeAcademyModalProps> = ({
  isOpen,
  player,
  onClose,
  onSwitchAcademy,
  showToast,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'same_league' | 'international'>('all');
  const [confirmingTeam, setConfirmingTeam] = useState<{
    team: YouthTeamData;
    league: YouthLeagueData;
    isInternational: boolean;
  } | null>(null);

  const fame = player.fame || 0;
  const currentTeamName = (player.youthTeamName || player.club || '').trim();
  const currentLeague = useMemo(() => getPlayerCurrentYouthLeague(player), [player]);

  // Teams in the SAME youth league (excluding current team)
  const sameLeagueTeams = useMemo(() => {
    if (fame < 50) return [];
    return currentLeague.teams
      .filter((t) => t.name.toLowerCase().trim() !== currentTeamName.toLowerCase().trim())
      .map((team) => ({
        team,
        league: currentLeague,
        isInternational: false,
      }));
  }, [currentLeague, currentTeamName, fame]);

  // Teams in OTHER countries' youth leagues (only if fame > 100)
  const internationalTeams = useMemo(() => {
    if (fame <= 100) return [];
    const otherLeagues = Object.values(YOUTH_LEAGUES_DATABASE).filter(
      (l) => l.country.toLowerCase().trim() !== currentLeague.country.toLowerCase().trim()
    );

    const list: { team: YouthTeamData; league: YouthLeagueData; isInternational: boolean }[] = [];
    for (const l of otherLeagues) {
      for (const t of l.teams) {
        list.push({
          team: t,
          league: l,
          isInternational: true,
        });
      }
    }
    return list;
  }, [currentLeague, fame]);

  const displayedList = useMemo(() => {
    if (fame < 50) return [];
    if (selectedTab === 'same_league') return sameLeagueTeams;
    if (selectedTab === 'international') return internationalTeams;
    return [...sameLeagueTeams, ...internationalTeams];
  }, [fame, selectedTab, sameLeagueTeams, internationalTeams]);

  if (!isOpen) return null;

  const handleExecuteSwitch = () => {
    if (!confirmingTeam) return;
    const { team, isInternational } = confirmingTeam;

    const trainedCountries = [...(player.youthTrainedCountries || [])];
    if (isInternational && !trainedCountries.includes(team.country)) {
      trainedCountries.push(team.country);
    }

    const updatedPlayer: PlayerCardData = {
      ...player,
      club: team.name,
      youthTeamName: team.name,
      youthLeagueName: team.youthLeague,
      city: team.city,
      clubCountry: team.country,
      youthTrainedCountries: trainedCountries,
    };

    onSwitchAcademy(updatedPlayer);

    const toastMsg = isInternational
      ? `🛫 International Academy Relocation! Transferred to ${team.name} in ${team.country} (${team.youthLeague}). No salary or bonuses.`
      : `🏃 Academy Switch Complete! Transferred to ${team.name} (${team.youthLeague}). No salary or bonuses.`;

    if (showToast) {
      showToast(toastMsg);
    }

    setConfirmingTeam(null);
    onClose();
  };

  return (
    <div
      id="change-academy-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-pixel select-none"
    >
      <div
        id="change-academy-modal"
        className="relative w-full max-w-4xl bg-slate-900 border-2 border-emerald-500 pixel-corners pixel-bevel-emerald shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* TOP HEADER */}
        <div className="bg-emerald-950/90 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-emerald-500/60 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pixel-corners bg-emerald-850 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-inner">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-arcade">
                  YOUTH ACADEMY NETWORK
                </span>
                <span className="text-[10px] text-emerald-300/80 font-retro">
                  • FREE ACADEMY RELOCATION
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight pixel-text-shadow">
                CHANGE ACADEMY
              </h2>
            </div>
          </div>
          <button
            id="change-academy-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 pixel-corners text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-slate-700 bg-slate-950"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATUS BAR: CURRENT CLUB & FAME SCOUTING TIER */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-retro">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Current Academy:</span>
            <span className="text-emerald-300 font-bold font-pixel">
              {currentTeamName || 'Youth Academy'}
            </span>
            <span className="text-slate-500">({currentLeague.name} • {currentLeague.country})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 pixel-corners text-amber-300 text-[11px] font-arcade">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>PLAYER FAME: {fame}</span>
            </div>

            <div className="text-[10px] font-mono px-2 py-0.5 pixel-corners border border-slate-700 bg-slate-900 text-slate-400">
              {fame < 50
                ? '🔒 Under 50 Fame'
                : fame <= 100
                ? '✅ 50–100: Same League'
                : '🌟 100+: International Unlocked'}
            </div>
          </div>
        </div>

        {/* FAME SCOUTING RULES EXPLANATION BANNER */}
        <div className="bg-emerald-950/40 border-b border-emerald-900/60 px-4 sm:px-6 py-2 text-[11px] font-retro text-emerald-200/90 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Academy Transfer Rules: </span>
            <span>
              Under 50 Fame: no academy offers • 50–100 Fame: teams in your same youth league • Over 100 Fame: international academies from other countries unlocked.
            </span>
            <span className="block text-amber-300/90 font-bold mt-0.5">
              ⚠️ Pure development switch: NO salary and NO signing bonuses.
            </span>
          </div>
        </div>

        {/* TAB FILTERS (When Fame > 100) */}
        {fame > 100 && (
          <div className="bg-slate-950/60 px-4 sm:px-6 pt-3 pb-1 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 pixel-corners font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 pixel-bevel-emerald'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Available ({sameLeagueTeams.length + internationalTeams.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('same_league')}
              className={`px-3 py-1.5 pixel-corners font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                selectedTab === 'same_league'
                  ? 'bg-emerald-500 text-slate-950 pixel-bevel-emerald'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Same League ({sameLeagueTeams.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('international')}
              className={`px-3 py-1.5 pixel-corners font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                selectedTab === 'international'
                  ? 'bg-indigo-500 text-white pixel-bevel-raised'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              International Academies ({internationalTeams.length})
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {/* CASE 1: UNDER 50 FAME (NOTHING APPEARS HERE) */}
          {fame < 50 && (
            <div
              id="change-academy-locked-state"
              className="p-8 sm:p-12 text-center rounded-none pixel-corners bg-slate-950/90 border-2 border-slate-800 flex flex-col items-center justify-center space-y-4 my-4"
            >
              <div className="w-16 h-16 pixel-corners bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-500 pixel-bevel-low shadow-inner">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base sm:text-lg font-black uppercase text-amber-400 font-pixel tracking-wide">
                  NO ACADEMIES SCOUTING YOU
                </h3>
                <p className="text-xs font-retro text-slate-300 leading-relaxed">
                  Youth academies require at least <strong className="text-amber-300 font-pixel">50 Fame</strong> to scout your talent and extend an academy switch proposal.
                </p>
              </div>

              {/* FAME PROGRESS BAR */}
              <div className="w-full max-w-sm space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-arcade">
                  <span className="text-slate-400">Current Fame:</span>
                  <span className="text-amber-300 font-black">{fame} / 50</span>
                </div>
                <div className="w-full h-3.5 pixel-corners bg-slate-900 border border-slate-700 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 pixel-corners transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, (fame / 50) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-retro text-slate-400 block pt-1">
                  Need {Math.max(0, 50 - fame)} more Fame to unlock same league academy transfers.
                </span>
              </div>

              <div className="p-3 pixel-corners bg-slate-900/90 border border-slate-800 text-[11px] font-retro text-slate-400 max-w-md text-left space-y-1">
                <div className="text-slate-200 font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How to Increase Fame:</span>
                </div>
                <p>• Perform well in youth league matches (score goals, assists, high match ratings)</p>
                <p>• Win Player of the Match & Team of the Week awards</p>
                <p>• Compete in the National Championship or International Youth Cup</p>
              </div>
            </div>
          )}

          {/* CASE 2 & 3: FAME >= 50 (TEAMS APPEAR) */}
          {fame >= 50 && displayedList.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-retro text-xs bg-slate-950/80 border border-slate-800 pixel-corners">
              No matching academies found in this category.
            </div>
          )}

          {fame >= 50 && displayedList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayedList.map(({ team, league, isInternational }) => {
                const school = getFootballSchoolForClub(team.name, team.youthLeague, '', team.country);

                return (
                  <div
                    key={`${league.id}-${team.id}`}
                    className={`p-4 pixel-corners border-2 transition-all duration-150 flex flex-col justify-between ${
                      isInternational
                        ? 'bg-slate-900/95 border-indigo-500/60 hover:border-indigo-400 hover:bg-slate-850'
                        : 'bg-slate-900/95 border-emerald-500/60 hover:border-emerald-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* CARD HEADER TAGS */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 pixel-corners tracking-wider font-arcade ${
                            isInternational
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/50'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {isInternational ? '🌍 International Pathway' : '📍 Same Youth League'}
                        </span>

                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 px-2 py-0.5 pixel-corners text-[11px] font-arcade text-amber-300 font-black">
                          <span>OVR</span>
                          <span className="text-white">{team.ovr}</span>
                        </div>
                      </div>

                      {/* TEAM & LEAGUE IDENTITY */}
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                          <span>{team.name}</span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-retro mt-0.5">
                          <span>{league.flag}</span>
                          <span className="font-semibold text-slate-200">{team.youthLeague}</span>
                          <span>•</span>
                          <span className="text-slate-400">{team.city}, {team.country}</span>
                        </div>
                      </div>

                      {/* DEVELOPMENT PHILOSOPHY */}
                      {school && (
                        <div className="p-2 pixel-corners bg-slate-950 border border-slate-800/80 text-[11px] font-retro text-slate-300 space-y-0.5">
                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-arcade">
                            ⚽ {school.name}
                          </div>
                          <p className="text-slate-400 text-[10px] line-clamp-2">
                            {school.corePhilosophy}
                          </p>
                        </div>
                      )}

                      {/* INTERNATIONAL NATIONALITY NOTE */}
                      {isInternational && (
                        <div className="p-1.5 pixel-corners bg-indigo-950/60 border border-indigo-900/80 text-[10px] font-retro text-indigo-300 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Developing here qualifies for {team.country} nationality upon turning 18!</span>
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER & SWITCH BUTTON */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div className="text-[10px] font-retro text-slate-400 leading-tight">
                        <span className="text-slate-300 font-semibold block">Pure Academy Switch</span>
                        <span>No salary • No bonuses</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setConfirmingTeam({ team, league, isInternational })}
                        className={`px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
                          isInternational
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white pixel-bevel-raised shadow-md'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 pixel-bevel-emerald shadow-md'
                        }`}
                      >
                        <span>SWITCH</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SWITCH CONFIRMATION DIALOG OVERLAY */}
        {confirmingTeam && (
          <div
            id="change-academy-confirmation-backdrop"
            className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
          >
            <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold p-5 space-y-4 text-slate-100 shadow-2xl">
              <div className="flex items-center gap-2.5 text-amber-400 font-pixel text-sm uppercase font-black">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>CONFIRM ACADEMY TRANSFER</span>
              </div>

              <div className="space-y-2 text-xs font-retro text-slate-300">
                <p>
                  Are you sure you want to switch your youth academy to{' '}
                  <strong className="text-white font-pixel">{confirmingTeam.team.name}</strong>?
                </p>
                <div className="p-3 pixel-corners bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">New League:</span>
                    <span className="text-emerald-300 font-bold">{confirmingTeam.team.youthLeague}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white font-bold">{confirmingTeam.team.city}, {confirmingTeam.team.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Financial Terms:</span>
                    <span className="text-amber-300 font-bold">€0 Salary • €0 Bonus (Youth)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  You will immediately relocate and continue your season matches and development with {confirmingTeam.team.name}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmingTeam(null)}
                  className="px-4 py-2 pixel-corners text-xs font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSwitch}
                  className="px-5 py-2 pixel-corners text-xs font-black uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 pixel-bevel-emerald font-black cursor-pointer shadow-md"
                >
                  Confirm Switch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
