import React, { useState, useMemo } from 'react';
import {
  LeagueDatabase,
  EditorTeamData,
  LeagueData,
  CountryCode,
} from '../../types/leagueEditor';
import { saveLeagueDatabase } from '../../utils/leagueDatabaseSystem';
import { getTeamSimulationRatings } from '../../utils/leagueThemeHelper';
import { EditorHeader } from './EditorHeader';
import { EditorControllerBar } from './EditorControllerBar';
import { useEditorControls } from '../../hooks/useEditorControls';

// Section Components
import { ClubIdentitySection } from './sections/ClubIdentitySection';
import { ClubKitSection } from './sections/ClubKitSection';
import { ClubStartingXISection } from './sections/ClubStartingXISection';
import { ClubSquadSection } from './sections/ClubSquadSection';
import { ClubKeyRolesSection } from './sections/ClubKeyRolesSection';
import { ClubManagerSection } from './sections/ClubManagerSection';
import { ClubEconomySection } from './sections/ClubEconomySection';
import { ClubStadiumSection } from './sections/ClubStadiumSection';
import { ClubStaffSection } from './sections/ClubStaffSection';
import { ClubYouthAcademySection } from './sections/ClubYouthAcademySection';
import { ClubCompetitionsSection } from './sections/ClubCompetitionsSection';
import { ClubRivalsSection } from './sections/ClubRivalsSection';
import { ClubHistorySection } from './sections/ClubHistorySection';

// National Team Editor
import { NationalTeamEditor } from '../NationalTeamEditor';
import { CustomEmblem } from '../CustomEmblem';

// Icons
import {
  Shield,
  Globe,
  Trophy,
  Users,
  Flag,
  ChevronRight,
  Search,
  Sparkles,
  Layers,
  ArrowLeft,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface TeamEditorContainerProps {
  leagueDb: LeagueDatabase;
  onUpdateDb: (updated: LeagueDatabase) => void;
  showToast: (msg: string) => void;
  initialTeamId?: string;
  onExit?: () => void;
}

type NavigationLevel =
  | 'team_type' // Clubs vs National Teams
  | 'confederation' // UEFA, CONMEBOL, etc.
  | 'country' // Countries in confederation
  | 'league' // Leagues in country
  | 'team' // Teams in league
  | 'editor_sections' // Full-screen section editor
  | 'national_teams'; // National team editor flow

const CONFEDERATIONS = [
  { key: 'UEFA', name: 'UEFA', region: 'Europe', desc: 'Premier European leagues & continental giants', icon: Trophy, color: 'from-blue-600 to-indigo-900', border: 'border-blue-500/40' },
  { key: 'CONMEBOL', name: 'CONMEBOL', region: 'South America', desc: 'Fierce passion, traditional powerhouses & cup history', icon: Trophy, color: 'from-amber-600 to-emerald-900', border: 'border-amber-500/40' },
  { key: 'CONCACAF', name: 'CONCACAF', region: 'North & Central America', desc: 'Expanding franchises, regional cups & dynamic clubs', icon: Globe, color: 'from-sky-600 to-slate-900', border: 'border-sky-500/40' },
  { key: 'AFC', name: 'AFC', region: 'Asia & Gulf', desc: 'High-investment mega projects & rising national leagues', icon: Globe, color: 'from-purple-600 to-slate-900', border: 'border-purple-500/40' },
  { key: 'CAF', name: 'CAF', region: 'Africa', desc: 'Historic continental clubs & relentless talent incubators', icon: Trophy, color: 'from-emerald-600 to-slate-900', border: 'border-emerald-500/40' },
  { key: 'OFC', name: 'OFC', region: 'Oceania', desc: 'Pacific island champions & grassroots leagues', icon: Globe, color: 'from-teal-600 to-slate-900', border: 'border-teal-500/40' },
  { key: 'ALL', name: 'ALL CLUBS', region: 'Global Database', desc: 'Browse all registered clubs worldwide without filtering', icon: Globe, color: 'from-slate-700 to-slate-950', border: 'border-slate-700' },
];

const COUNTRY_CONFEDERATION_MAP: Record<string, string> = {
  ENG: 'UEFA',
  ESP: 'UEFA',
  FRA: 'UEFA',
  FR: 'UEFA',
  GER: 'UEFA',
  ITA: 'UEFA',
  POR: 'UEFA',
  NED: 'UEFA',
  SCO: 'UEFA',
  TUR: 'UEFA',
  BEL: 'UEFA',
  ARG: 'CONMEBOL',
  BRA: 'CONMEBOL',
  URU: 'CONMEBOL',
  COL: 'CONMEBOL',
  CHI: 'CONMEBOL',
  USA: 'CONCACAF',
  MEX: 'CONCACAF',
  CAN: 'CONCACAF',
  KOR: 'AFC',
  JPN: 'AFC',
  KSA: 'AFC',
  QAT: 'AFC',
  EGY: 'CAF',
  MAR: 'CAF',
  NGA: 'CAF',
  RSA: 'CAF',
  AUS: 'AFC',
  NZL: 'OFC',
};

const SECTIONS_CONFIG = [
  { id: 'identity', name: 'Club Identity', shortLabel: 'Identity' },
  { id: 'kits', name: 'Kit Studio', shortLabel: 'Kits' },
  { id: 'tactics', name: 'Tactical Lineup', shortLabel: 'Tactics' },
  { id: 'squad', name: 'Squad Roster', shortLabel: 'Squad' },
  { id: 'key_roles', name: 'Key Roles & Captaincy', shortLabel: 'Roles' },
  { id: 'manager', name: 'Manager & Philosophy', shortLabel: 'Manager' },
  { id: 'economy', name: 'Economy & Warchest', shortLabel: 'Economy' },
  { id: 'stadium', name: 'Stadium & Venue', shortLabel: 'Stadium' },
  { id: 'staff', name: 'Coaching & Medical Staff', shortLabel: 'Staff' },
  { id: 'youth', name: 'Youth Academy', shortLabel: 'Academy' },
  { id: 'competitions', name: 'Competitions & Cups', shortLabel: 'Tournaments' },
  { id: 'rivals', name: 'Derby Rivals & Feuds', shortLabel: 'Rivals' },
  { id: 'heritage', name: 'History & Silverware', shortLabel: 'Heritage' },
];

export const TeamEditorContainer: React.FC<TeamEditorContainerProps> = ({
  leagueDb,
  onUpdateDb,
  showToast,
  initialTeamId,
  onExit,
}) => {
  // Navigation State
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>(
    initialTeamId ? 'editor_sections' : 'team_type'
  );
  const [selectedConfederation, setSelectedConfederation] = useState<string>('ALL');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId || '');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // Active Team Editing State
  const [editingTeam, setEditingTeam] = useState<EditorTeamData | null>(() => {
    if (initialTeamId && leagueDb.teams[initialTeamId]) {
      return { ...leagueDb.teams[initialTeamId] };
    }
    return null;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Save handler: commits current editingTeam back to database
  const handleSaveCurrentTeam = () => {
    if (!editingTeam) return;
    setIsSaving(true);

    const updatedDb: LeagueDatabase = {
      ...leagueDb,
      teams: {
        ...leagueDb.teams,
        [editingTeam.id]: editingTeam,
      },
    };

    saveLeagueDatabase(updatedDb);
    onUpdateDb(updatedDb);
    setLastSavedAt(new Date());
    setIsSaving(false);
    showToast(`Saved changes for ${editingTeam.name}!`);
  };

  // Updaters
  const handleUpdateEditingTeam = (
    updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)
  ) => {
    setEditingTeam((prev) => {
      if (!prev) return prev;
      const nextTeam = typeof updater === 'function' ? updater(prev) : updater;
      return nextTeam;
    });
  };

  // Controller / Keyboard Navigation
  const handleNextSection = () => {
    if (currentLevel === 'editor_sections') {
      if (currentSectionIndex < SECTIONS_CONFIG.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
      }
    }
  };

  const handlePrevSection = () => {
    if (currentLevel === 'editor_sections') {
      if (currentSectionIndex > 0) {
        setCurrentSectionIndex((prev) => prev - 1);
      }
    }
  };

  const handleBackNavigation = () => {
    if (currentLevel === 'editor_sections') {
      // Prompt or auto-save on back
      handleSaveCurrentTeam();
      setCurrentLevel('team');
    } else if (currentLevel === 'team') {
      setCurrentLevel('league');
    } else if (currentLevel === 'league') {
      setCurrentLevel('country');
    } else if (currentLevel === 'country') {
      setCurrentLevel('confederation');
    } else if (currentLevel === 'confederation') {
      setCurrentLevel('team_type');
    } else if (currentLevel === 'national_teams') {
      setCurrentLevel('team_type');
    } else if (currentLevel === 'team_type') {
      onExit?.();
    }
  };

  useEditorControls({
    onPrevSection: handlePrevSection,
    onNextSection: handleNextSection,
    onBack: handleBackNavigation,
    onSave: handleSaveCurrentTeam,
    enabled: true,
  });

  // Derived filtered lists
  const allLeagues = useMemo(() => Object.values(leagueDb.leagues), [leagueDb.leagues]);
  const allTeams = useMemo(() => Object.values(leagueDb.teams), [leagueDb.teams]);

  // Countries in selected confederation
  const countriesInConfederation = useMemo(() => {
    const countryMap = new Map<string, { code: string; name: string; count: number }>();

    allLeagues.forEach((l) => {
      const conf = COUNTRY_CONFEDERATION_MAP[l.countryCode] || 'UEFA';
      if (selectedConfederation === 'ALL' || conf === selectedConfederation) {
        const existing = countryMap.get(l.countryCode);
        if (existing) {
          existing.count += 1;
        } else {
          countryMap.set(l.countryCode, {
            code: l.countryCode,
            name: l.countryName || l.countryCode,
            count: 1,
          });
        }
      }
    });

    return Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allLeagues, selectedConfederation]);

  // Leagues in selected country
  const leaguesInCountry = useMemo(() => {
    return allLeagues
      .filter((l) => !selectedCountryCode || l.countryCode === selectedCountryCode)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allLeagues, selectedCountryCode]);

  // Teams in selected league
  const teamsInLeague = useMemo(() => {
    return allTeams
      .filter((t) => {
        if (selectedLeagueId) return t.leagueId === selectedLeagueId;
        if (selectedCountryCode) return t.countryCode === selectedCountryCode;
        return true;
      })
      .filter((t) => {
        if (!filterSearch) return true;
        const q = filterSearch.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.city?.toLowerCase().includes(q) ||
          t.countryCode.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTeams, selectedLeagueId, selectedCountryCode, filterSearch]);

  // Select team and open full-screen editor
  const handleSelectTeamToEdit = (team: EditorTeamData) => {
    setSelectedTeamId(team.id);
    setEditingTeam({ ...team });
    setCurrentSectionIndex(0);
    setCurrentLevel('editor_sections');
  };

  // Render Current Section
  const renderCurrentSection = () => {
    if (!editingTeam) return null;

    switch (currentSectionIndex) {
      case 0:
        return <ClubIdentitySection team={editingTeam} leagueDb={leagueDb} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 1:
        return <ClubKitSection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 2:
        return <ClubStartingXISection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 3:
        return <ClubSquadSection team={editingTeam} leagueDb={leagueDb} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 4:
        return <ClubKeyRolesSection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 5:
        return <ClubManagerSection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 6:
        return <ClubEconomySection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 7:
        return <ClubStadiumSection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 8:
        return <ClubStaffSection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 9:
        return <ClubYouthAcademySection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 10:
        return <ClubCompetitionsSection team={editingTeam} leagueDb={leagueDb} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 11:
        return <ClubRivalsSection team={editingTeam} leagueDb={leagueDb} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      case 12:
        return <ClubHistorySection team={editingTeam} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
      default:
        return <ClubIdentitySection team={editingTeam} leagueDb={leagueDb} onUpdate={handleUpdateEditingTeam} showToast={showToast} />;
    }
  };

  // =========================================================================
  // VIEW: NATIONAL TEAMS
  // =========================================================================
  if (currentLevel === 'national_teams') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <EditorHeader
          title="NATIONAL TEAMS EDITOR"
          subtitle="International Federations & World Rosters"
          onBack={() => setCurrentLevel('team_type')}
          backLabel="Back to Categories"
        />
        <div className="flex-1 overflow-y-auto">
          <NationalTeamEditor leagueDb={leagueDb} showToast={showToast} />
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: FULL-SCREEN EDITOR SECTIONS (Step 6)
  // =========================================================================
  if (currentLevel === 'editor_sections' && editingTeam) {
    const activeSection = SECTIONS_CONFIG[currentSectionIndex];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
        {/* Full-Screen Editor Top Header */}
        <EditorHeader
          title={editingTeam.name}
          subtitle={`${editingTeam.city || 'Club'} • ${editingTeam.countryCode} • ${activeSection.name}`}
          emblem={editingTeam.emblem}
          currentSectionIndex={currentSectionIndex}
          totalSections={SECTIONS_CONFIG.length}
          sections={SECTIONS_CONFIG}
          onSelectSection={(idx) => setCurrentSectionIndex(idx)}
          onBack={handleBackNavigation}
          backLabel="Exit Club"
          onSave={handleSaveCurrentTeam}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
        />

        {/* Full-Screen Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-[1600px] mx-auto animate-fadeIn">
            {renderCurrentSection()}
          </div>
        </main>

        {/* Controller Bar at Bottom */}
        <EditorControllerBar
          prevLabel={
            currentSectionIndex > 0
              ? SECTIONS_CONFIG[currentSectionIndex - 1].shortLabel
              : undefined
          }
          nextLabel={
            currentSectionIndex < SECTIONS_CONFIG.length - 1
              ? SECTIONS_CONFIG[currentSectionIndex + 1].shortLabel
              : undefined
          }
          canPrev={currentSectionIndex > 0}
          canNext={currentSectionIndex < SECTIONS_CONFIG.length - 1}
          onPrev={handlePrevSection}
          onNext={handleNextSection}
          showSaveHint={true}
          backLabel="Teams"
          onBack={handleBackNavigation}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP 1 — TEAM TYPE (Clubs vs National Teams)
  // =========================================================================
  if (currentLevel === 'team_type') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <EditorHeader
          title="TEAM EDITOR"
          subtitle="Choose Team Category"
          onBack={onExit}
          backLabel="Main Menu"
        />

        <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              STEP 1 — CHOOSE TEAM TYPE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              SELECT CATEGORY
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
              Select whether you want to customize domestic league clubs or international national teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* CLUBS OPTION */}
            <div
              onClick={() => setCurrentLevel('confederation')}
              className="group bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border-2 border-slate-800 hover:border-cyan-500 rounded-3xl p-8 transition-all duration-200 cursor-pointer shadow-2xl flex flex-col items-center text-center space-y-5 hover:scale-[1.02] active:scale-95"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <Shield className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  CLUBS
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Domestic leagues, premier divisions, kits, stadiums, transfers, finances, and rivalries.
                </p>
              </div>
              <span className="px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-cyan-500 group-hover:text-slate-950 border border-slate-700 text-xs font-mono font-bold text-cyan-400 transition-colors">
                ENTER CLUBS EDITOR →
              </span>
            </div>

            {/* NATIONAL TEAMS OPTION */}
            <div
              onClick={() => setCurrentLevel('national_teams')}
              className="group bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border-2 border-slate-800 hover:border-amber-500 rounded-3xl p-8 transition-all duration-200 cursor-pointer shadow-2xl flex flex-col items-center text-center space-y-5 hover:scale-[1.02] active:scale-95"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Globe className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  NATIONAL TEAMS
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  International federations, FIFA World Cup rosters, national kits, and continental tournaments.
                </p>
              </div>
              <span className="px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 border border-slate-700 text-xs font-mono font-bold text-amber-400 transition-colors">
                ENTER NATIONAL TEAMS →
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STEP 2 — CONFEDERATION SELECTION
  // =========================================================================
  if (currentLevel === 'confederation') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <EditorHeader
          title="CONFEDERATION"
          subtitle="Step 2 of 5: Select Continental Confederation"
          onBack={handleBackNavigation}
          backLabel="Team Types"
        />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              STEP 2 — CONTINENTAL GOVERNING BODY
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              SELECT CONFEDERATION
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Choose the continental region to locate the club you wish to customize.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONFEDERATIONS.map((conf) => {
              const IconComp = conf.icon;
              return (
                <div
                  key={conf.key}
                  onClick={() => {
                    setSelectedConfederation(conf.key);
                    setCurrentLevel('country');
                  }}
                  className={`group bg-gradient-to-br ${conf.color} border-2 ${conf.border} rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-95`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-black/40 rounded-2xl text-white">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider bg-black/40 px-3 py-1 rounded-xl text-white/90">
                      {conf.region}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {conf.name}
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {conf.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-white/90 group-hover:text-white">
                    <span>EXPLORE COUNTRIES</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STEP 3 — COUNTRY SELECTION
  // =========================================================================
  if (currentLevel === 'country') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <EditorHeader
          title={`COUNTRIES IN ${selectedConfederation}`}
          subtitle="Step 3 of 5: Select Country"
          onBack={handleBackNavigation}
          backLabel="Confederations"
        />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              STEP 3 — COUNTRY / TERRITORY
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              SELECT COUNTRY
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Select the nation hosting the league and clubs you want to inspect.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countriesInConfederation.map((country) => (
              <div
                key={country.code}
                onClick={() => {
                  setSelectedCountryCode(country.code);
                  setCurrentLevel('league');
                }}
                className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-2xl p-5 transition-all cursor-pointer shadow-lg flex items-center justify-between hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-black text-cyan-400 text-sm shadow-inner">
                    {country.code}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      {country.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {country.count} {country.count === 1 ? 'League' : 'Leagues'}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STEP 4 — LEAGUE SELECTION
  // =========================================================================
  if (currentLevel === 'league') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <EditorHeader
          title={`LEAGUES IN ${selectedCountryCode}`}
          subtitle="Step 4 of 5: Select League Division"
          onBack={handleBackNavigation}
          backLabel="Countries"
        />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              STEP 4 — COMPETITION DIVISION
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              SELECT LEAGUE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Choose the domestic division to browse clubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaguesInCountry.map((league) => (
              <div
                key={league.id}
                onClick={() => {
                  setSelectedLeagueId(league.id);
                  setCurrentLevel('team');
                }}
                className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-2xl p-6 transition-all cursor-pointer shadow-lg flex items-center justify-between hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 shadow-inner">
                    {league.emblem ? (
                      <CustomEmblem emblem={league.emblem} className="w-10 h-10" />
                    ) : (
                      <Trophy className="w-7 h-7 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                      {league.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                      <span className="text-cyan-400 font-bold uppercase">
                        {league.divisionTier} Tier
                      </span>
                      <span>•</span>
                      <span>{league.teamIds?.length || 0} Clubs</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // STEP 5 — TEAM SELECTION
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <EditorHeader
        title="SELECT TEAM TO EDIT"
        subtitle="Step 5 of 5: Choose Club to Launch Section Editor"
        onBack={handleBackNavigation}
        backLabel="Leagues"
      />

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              STEP 5 — CLUB ROSTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              SELECT CLUB
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search club name or city..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* TEAMS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsInLeague.map((team) => {
            const ratings = getTeamSimulationRatings(team);

            return (
              <div
                key={team.id}
                onClick={() => handleSelectTeamToEdit(team)}
                className="group bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-cyan-500 rounded-2xl p-5 transition-all cursor-pointer shadow-lg flex flex-col justify-between space-y-4 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-inner">
                    {team.emblem ? (
                      <CustomEmblem emblem={team.emblem} className="w-10 h-10" />
                    ) : (
                      <Shield className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-white truncate group-hover:text-cyan-300 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {team.city || 'Club'} • {team.countryCode}
                    </p>
                  </div>
                </div>

                {/* Team Ratings Bar */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80 font-mono text-center">
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-bold">OVR</div>
                    <div className="text-xs font-black text-amber-400">{ratings.overall}</div>
                  </div>
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-bold">ATT</div>
                    <div className="text-xs font-black text-red-400">{ratings.attack}</div>
                  </div>
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-bold">MID</div>
                    <div className="text-xs font-black text-indigo-400">{ratings.midfield}</div>
                  </div>
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-bold">DEF</div>
                    <div className="text-xs font-black text-blue-400">{ratings.defense}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 pt-1">
                  <span>LAUNCH FULL-SCREEN EDITOR</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
