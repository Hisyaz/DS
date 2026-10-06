import React, { useState, useMemo } from 'react';
import { LeagueDatabase, ManagerData, KitConfig, FormationType, TacticalStyle, PlayerRolePosition } from '../types/leagueEditor';
import { NationalTeam, Confederation } from '../types/nationalTeam';
import { PlayerCardData } from '../types';
import { getNationalTeamsDatabase, updateNationalTeamInDatabase, saveNationalTeamsDatabase } from '../utils/nationalTeamDatabaseManager';
import { TacticalPitchEditor } from './TacticalPitchEditor';
import { KitRenderer } from './KitRenderer';
import { PlayerKitPreview } from './PlayerKitPreview';
import { TeamPlayerEditorModal } from './TeamPlayerEditorModal';
import {
  Globe,
  Search,
  Trophy,
  Shield,
  Shirt,
  User,
  Sliders,
  Building2,
  Users,
  Edit3,
  Check,
  CheckCircle2,
  X,
  Flag,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { TACTICAL_STYLES, FORMATION_LIST, getDefaultTacticalPositions } from '../utils/tacticalSystem';

interface NationalTeamEditorProps {
  leagueDb?: LeagueDatabase;
  showToast: (msg: string) => void;
}

const CONFEDERATIONS: { key: Confederation | 'ALL'; label: string; count: number }[] = [
  { key: 'ALL', label: 'All Nations', count: 50 },
  { key: 'UEFA', label: 'UEFA (Europe)', count: 23 },
  { key: 'CONMEBOL', label: 'CONMEBOL (South America)', count: 7 },
  { key: 'CAF', label: 'CAF (Africa)', count: 9 },
  { key: 'CONCACAF', label: 'CONCACAF (N. America)', count: 6 },
  { key: 'AFC', label: 'AFC (Asia)', count: 4 },
  { key: 'OFC', label: 'OFC (Oceania)', count: 1 },
];

export const NationalTeamEditor: React.FC<NationalTeamEditorProps> = ({ leagueDb, showToast }) => {
  const [nationalTeams, setNationalTeams] = useState<NationalTeam[]>(() => getNationalTeamsDatabase(leagueDb));
  const [selectedConfederation, setSelectedConfederation] = useState<Confederation | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Active Editor Tab for Selected Team
  const [activeTab, setActiveTab] = useState<'identity' | 'kits' | 'tactics' | 'stadium' | 'squad'>('identity');
  const [activeSquadTier, setActiveSquadTier] = useState<'Senior' | 'U20' | 'U17'>('Senior');
  const [activeTacticTab, setActiveTacticTab] = useState<'primary' | 'secondary'>('primary');

  // Player Editor Modal State
  const [editingPlayerModal, setEditingPlayerModal] = useState<{
    slotNumber: number;
    player: PlayerCardData;
    tier: 'Senior' | 'U20' | 'U17';
  } | null>(null);

  // Filter national teams by Confederation and Search
  const filteredTeams = useMemo(() => {
    return nationalTeams.filter((t) => {
      if (selectedConfederation !== 'ALL' && t.confederation !== selectedConfederation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = t.nation.name.toLowerCase().includes(q);
        const codeMatch = t.nation.code.toLowerCase().includes(q);
        const managerMatch = (t.manager as any)?.name?.toLowerCase().includes(q);
        const stadiumMatch = t.stadium?.name?.toLowerCase().includes(q);
        return nameMatch || codeMatch || managerMatch || stadiumMatch;
      }
      return true;
    }).sort((a, b) => (a.fifaRanking || 99) - (b.fifaRanking || 99));
  }, [nationalTeams, selectedConfederation, searchQuery]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return nationalTeams.find((t) => t.id === selectedTeamId) || null;
  }, [nationalTeams, selectedTeamId]);

  // Handler to save full team changes
  const handleUpdateTeam = (updated: NationalTeam) => {
    const updatedList = updateNationalTeamInDatabase(updated);
    setNationalTeams(updatedList);
    showToast(`Saved changes for ${updated.nation.name} National Team`);
  };

  // Handler for saving edited player inside a tier
  const handleSavePlayerInTier = (updatedPlayer: PlayerCardData) => {
    if (!selectedTeam || !editingPlayerModal) return;

    const tier = editingPlayerModal.tier;
    const teamCopy = { ...selectedTeam };

    let targetSquad = tier === 'Senior' ? [...teamCopy.squad] : tier === 'U20' ? [...(teamCopy.u20Squad || [])] : [...(teamCopy.u17Squad || [])];

    const idx = targetSquad.findIndex((p) => p.id === updatedPlayer.id || p.shirtNumber === updatedPlayer.shirtNumber);
    if (idx !== -1) {
      targetSquad[idx] = updatedPlayer;
    } else {
      targetSquad.push(updatedPlayer);
    }

    if (tier === 'Senior') teamCopy.squad = targetSquad;
    else if (tier === 'U20') teamCopy.u20Squad = targetSquad;
    else if (tier === 'U17') teamCopy.u17Squad = targetSquad;

    handleUpdateTeam(teamCopy);
    setEditingPlayerModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl relative overflow-hidden pixel-bevel-raised">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 font-arcade">
              <Globe className="w-4 h-4" />
              FIFA World Ranking Database
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 font-pixel pixel-text-shadow">
              NATIONAL TEAM EDITOR
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 pixel-corners font-bold font-arcade">
                TOP 50 NATIONS
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-retro">
              Manage complete Senior, U20, and U17 squads, tactical setups, national managers, and kits across all 50 official FIFA national teams.
            </p>
          </div>

          {selectedTeam && (
            <button
              onClick={() => setSelectedTeamId(null)}
              className="self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 pixel-corners text-xs font-bold flex items-center gap-2 transition-all shadow-md font-pixel uppercase cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to National Teams List
            </button>
          )}
        </div>
      </div>

      {!selectedTeam ? (
        /* MAIN LIST VIEW OF ALL 50 NATIONS */
        <div className="space-y-6">
          {/* Confederation Tabs & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950 p-4 pixel-corners border border-slate-800">
            {/* Confederation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CONFEDERATIONS.map((conf) => (
                <button
                  key={conf.key}
                  onClick={() => setSelectedConfederation(conf.key)}
                  className={`px-3 py-1.5 pixel-corners text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 font-pixel uppercase cursor-pointer ${
                    selectedConfederation === conf.key
                      ? 'bg-blue-600 text-white border border-blue-400 pixel-bevel-raised shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {conf.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search nation, code, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pixel-corners pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-retro transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* National Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeams.map((team) => {
              const managerObj = team.manager as ManagerData;
              const seniorCount = team.squad?.length || 35;
              const u20Count = team.u20Squad?.length || 35;
              const u17Count = team.u17Squad?.length || 35;

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 pixel-corners p-5 shadow-lg hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-blue-500/20 transition-all" />

                  <div>
                    {/* Top Header: Ranking & Confederation */}
                    <div className="flex items-center justify-between mb-3 font-arcade">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 pixel-corners text-xs font-black">
                          #{team.fifaRanking || '?'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 pixel-corners text-[10px] font-bold uppercase tracking-wider">
                          {team.confederation || 'FIFA'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-900/40 text-blue-300 border border-blue-700/40 pixel-corners text-xs font-black">
                        OVR {team.teamOvr || team.ovr || 75}
                      </span>
                    </div>

                    {/* Nation Name & Flag */}
                    <div className="flex items-center gap-3 my-3">
                      <div className="w-12 h-12 pixel-corners bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                        <span className={`fi fi-${team.nation.iso?.toLowerCase()}`}></span>
                        {!team.nation.iso && <Flag className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors font-pixel">
                          {team.nation.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium font-retro">
                          {team.nation.code} National Football Team
                        </p>
                      </div>
                    </div>

                    {/* Manager & Tactical Info */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs font-retro">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          Manager:
                        </span>
                        <span className="font-bold text-slate-200 font-pixel">
                          {managerObj?.name || 'Head Coach'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          Primary Tactic:
                        </span>
                        <span className="font-bold text-slate-200 capitalize font-arcade">
                          {managerObj?.primaryTactic?.formation || '4-3-3'} ({managerObj?.primaryTactic?.style || 'possession'})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          Stadium:
                        </span>
                        <span className="font-medium text-slate-300 truncate max-w-[140px]">
                          {team.stadium?.name || 'National Stadium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Squad Summary & Action */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold font-arcade">
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">Sr: {seniorCount}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">U20: {u20Count}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">U17: {u17Count}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-pixel">
                      Edit Team
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* INDIVIDUAL NATIONAL TEAM EDITOR VIEW */
        <div className="space-y-6">
          {/* Team Selected Banner */}
          <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 pixel-bevel-raised">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 pixel-corners bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
                <span className={`fi fi-${selectedTeam.nation.iso?.toLowerCase()}`}></span>
                {!selectedTeam.nation.iso && <Flag className="w-8 h-8 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2 font-arcade">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 pixel-corners text-xs font-black">
                    FIFA Rank #{selectedTeam.fifaRanking}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 pixel-corners text-[10px] font-bold uppercase tracking-wider">
                    {selectedTeam.confederation}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1 font-pixel pixel-text-shadow">
                  {selectedTeam.nation.name} National Team
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-retro">
                  National Team OVR: <strong className="text-amber-300">{selectedTeam.teamOvr || selectedTeam.ovr || 75}</strong> • Senior Pool: {selectedTeam.squad?.length || 35} Players
                </p>
              </div>
            </div>

            {/* Navigation Tabs for Selected Team */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 pixel-corners border border-slate-800 overflow-x-auto">
              {[
                { id: 'identity', label: 'Identity & Info', icon: Globe },
                { id: 'kits', label: 'National Kits', icon: Shirt },
                { id: 'tactics', label: 'Manager & Tactics', icon: Sliders },
                { id: 'stadium', label: 'National Stadium', icon: Building2 },
                { id: 'squad', label: 'Squad Pool (35)', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 pixel-corners text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap font-pixel uppercase cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: IDENTITY & BASIC INFO */}
          {activeTab === 'identity' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 font-pixel">
                <Globe className="w-5 h-5 text-amber-400" />
                National Team Identity & FIFA Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-retro">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Nation Name
                  </label>
                  <input
                    type="text"
                    value={selectedTeam.nation.name}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, name: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Nation Code (3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={selectedTeam.nation.code}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, code: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    ISO Country Flag Code (2 letters / gb-eng)
                  </label>
                  <input
                    type="text"
                    value={selectedTeam.nation.iso}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, iso: e.target.value.toLowerCase() },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Confederation
                  </label>
                  <select
                    value={selectedTeam.confederation || 'UEFA'}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        confederation: e.target.value as Confederation,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="UEFA">UEFA (Europe)</option>
                    <option value="CONMEBOL">CONMEBOL (South America)</option>
                    <option value="CAF">CAF (Africa)</option>
                    <option value="CONCACAF">CONCACAF (North/Central America)</option>
                    <option value="AFC">AFC (Asia)</option>
                    <option value="OFC">OFC (Oceania)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    FIFA World Ranking
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={selectedTeam.fifaRanking || 1}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        fifaRanking: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    National Team Rating (OVR)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={99}
                    value={selectedTeam.teamOvr || selectedTeam.ovr || 75}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        teamOvr: parseInt(e.target.value) || 75,
                        ovr: parseInt(e.target.value) || 75,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KITS */}
          {activeTab === 'kits' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 font-pixel">
                <Shirt className="w-5 h-5 text-amber-400" />
                National Team Kit Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Home Kit */}
                <div className="bg-slate-950 border border-slate-800 p-5 pixel-corners space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-arcade">
                    Home Kit
                  </h4>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-900 pixel-corners p-2 flex items-center justify-center border border-slate-800">
                      <KitRenderer kit={selectedTeam.homeKit || { color1: '#38bdf8', color2: '#ffffff', pattern: 'stripes' }} />
                    </div>
                    <div className="space-y-2 flex-1 font-retro">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Primary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.homeKit?.color1 || '#38bdf8'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              homeKit: { ...selectedTeam.homeKit, color1: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Secondary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.homeKit?.color2 || '#ffffff'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              homeKit: { ...selectedTeam.homeKit, color2: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Away Kit */}
                <div className="bg-slate-950 border border-slate-800 p-5 pixel-corners space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-arcade">
                    Away Kit
                  </h4>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-900 pixel-corners p-2 flex items-center justify-center border border-slate-800">
                      <KitRenderer kit={selectedTeam.awayKit || { color1: '#1e3a8a', color2: '#ffffff', pattern: 'solid' }} />
                    </div>
                    <div className="space-y-2 flex-1 font-retro">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Primary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.awayKit?.color1 || '#1e3a8a'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              awayKit: { ...selectedTeam.awayKit, color1: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Secondary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.awayKit?.color2 || '#ffffff'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              awayKit: { ...selectedTeam.awayKit, color2: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGER & TACTICS */}
          {activeTab === 'tactics' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-pixel">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  National Manager & Tactical Philosophy
                </h3>

                {/* Primary / Secondary Tactic Switcher */}
                <div className="flex items-center gap-2 bg-slate-950 p-1 pixel-corners border border-slate-800">
                  <button
                    onClick={() => setActiveTacticTab('primary')}
                    className={`px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer ${
                      activeTacticTab === 'primary'
                        ? 'bg-blue-600 text-white border border-blue-400 pixel-bevel-raised shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Primary Tactic
                  </button>
                  <button
                    onClick={() => setActiveTacticTab('secondary')}
                    className={`px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer ${
                      activeTacticTab === 'secondary'
                        ? 'bg-indigo-600 text-white border border-indigo-400 pixel-bevel-raised shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Secondary Tactic
                  </button>
                </div>
              </div>

              {/* Manager Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 pixel-corners border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Head Coach / Manager Name
                  </label>
                  <input
                    type="text"
                    value={(selectedTeam.manager as any)?.name || ''}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        manager: { ...selectedTeam.manager, name: e.target.value } as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Manager Nationality
                  </label>
                  <input
                    type="text"
                    value={(selectedTeam.manager as any)?.nationality || selectedTeam.nation.name}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        manager: { ...selectedTeam.manager, nationality: e.target.value } as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro"
                  />
                </div>
              </div>

              {/* Tactical Setup Controls */}
              {(() => {
                const managerObj = selectedTeam.manager as ManagerData;
                const isPrimary = activeTacticTab === 'primary';
                const currentTactic = isPrimary
                  ? managerObj?.primaryTactic || { formation: '4-3-3', style: 'possession', positions: getDefaultTacticalPositions('4-3-3', 'possession') }
                  : managerObj?.secondaryTactic || { formation: '4-2-3-1', style: 'counter_attack', positions: getDefaultTacticalPositions('4-2-3-1', 'counter_attack') };

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Formation selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                          Formation
                        </label>
                        <select
                          value={currentTactic.formation}
                          onChange={(e) => {
                            const newFormation = e.target.value as FormationType;
                            const newPositions = getDefaultTacticalPositions(newFormation, currentTactic.style);
                            const updatedTactic = { ...currentTactic, formation: newFormation, positions: newPositions };

                            const updatedManager = { ...managerObj };
                            if (isPrimary) updatedManager.primaryTactic = updatedTactic;
                            else updatedManager.secondaryTactic = updatedTactic;

                            handleUpdateTeam({ ...selectedTeam, manager: updatedManager });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro cursor-pointer"
                        >
                          {FORMATION_LIST.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tactical style selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                          Tactical Philosophy / Style
                        </label>
                        <select
                          value={currentTactic.style}
                          onChange={(e) => {
                            const newStyle = e.target.value as TacticalStyle;
                            const updatedTactic = { ...currentTactic, style: newStyle };

                            const updatedManager = { ...managerObj };
                            if (isPrimary) updatedManager.primaryTactic = updatedTactic;
                            else updatedManager.secondaryTactic = updatedTactic;

                            handleUpdateTeam({ ...selectedTeam, manager: updatedManager });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro cursor-pointer"
                        >
                          {TACTICAL_STYLES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Interactive Tactical Pitch Editor */}
                    <div className="bg-slate-950 p-4 pixel-corners border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-arcade">
                        Tactical Pitch Layout & Playstyle Assignments
                      </h4>
                      <TacticalPitchEditor
                        tactic={isPrimary ? managerObj.primaryTactic : (managerObj.secondaryTactic || managerObj.primaryTactic)}
                        title={isPrimary ? 'Primary Tactic' : 'Secondary Tactic'}
                        onChange={(newTactic) => {
                          const updatedManager = { ...managerObj };
                          if (isPrimary) {
                            updatedManager.primaryTactic = newTactic;
                          } else {
                            updatedManager.secondaryTactic = newTactic;
                          }
                          handleUpdateTeam({ ...selectedTeam, manager: updatedManager });
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: STADIUM */}
          {activeTab === 'stadium' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 font-pixel">
                <Building2 className="w-5 h-5 text-amber-400" />
                Home National Stadium Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-retro">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    National Stadium Name
                  </label>
                  <input
                    type="text"
                    value={selectedTeam.stadium?.name || 'National Stadium'}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        stadium: { ...selectedTeam.stadium, name: e.target.value, capacity: selectedTeam.stadium?.capacity || 60000, tier: 5 },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Stadium Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={5000}
                    max={150000}
                    value={selectedTeam.stadium?.capacity || 60000}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        stadium: { ...selectedTeam.stadium, capacity: parseInt(e.target.value) || 60000, name: selectedTeam.stadium?.name || 'National Stadium', tier: 5 },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SQUAD POOL */}
          {activeTab === 'squad' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-pixel">
                    <Users className="w-5 h-5 text-amber-400" />
                    National Team Squad Roster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-retro">
                    Select Senior, U20, or U17 squads. Target size: 35 players per squad.
                  </p>
                </div>

                {/* Tier Switcher */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 pixel-corners border border-slate-800">
                  <button
                    onClick={() => setActiveSquadTier('Senior')}
                    className={`px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer ${
                      activeSquadTier === 'Senior'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Senior ({selectedTeam.squad?.length || 35})
                  </button>
                  <button
                    onClick={() => setActiveSquadTier('U20')}
                    className={`px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer ${
                      activeSquadTier === 'U20'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    U20 Youth ({selectedTeam.u20Squad?.length || 35})
                  </button>
                  <button
                    onClick={() => setActiveSquadTier('U17')}
                    className={`px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer ${
                      activeSquadTier === 'U17'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    U17 Youth ({selectedTeam.u17Squad?.length || 35})
                  </button>
                </div>
              </div>

              {/* Squad Table */}
              {(() => {
                const squadList =
                  activeSquadTier === 'Senior'
                    ? selectedTeam.squad || []
                    : activeSquadTier === 'U20'
                    ? selectedTeam.u20Squad || []
                    : selectedTeam.u17Squad || [];

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-arcade">
                        <tr>
                          <th className="py-3 px-3">#</th>
                          <th className="py-3 px-3">Pos</th>
                          <th className="py-3 px-3">Player Name</th>
                          <th className="py-3 px-3">Age</th>
                          <th className="py-3 px-3 text-center">OVR</th>
                          <th className="py-3 px-3">PAC</th>
                          <th className="py-3 px-3">SHO</th>
                          <th className="py-3 px-3">PAS</th>
                          <th className="py-3 px-3">DRI</th>
                          <th className="py-3 px-3">DEF</th>
                          <th className="py-3 px-3">PHY</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-retro">
                        {squadList.map((player, idx) => (
                          <tr
                            key={player.id || idx}
                            className="hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="py-2.5 px-3 font-bold text-slate-400 font-arcade">
                              {player.shirtNumber || idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-black text-amber-400 font-arcade">
                              {player.position}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                              <span>{player.name || `${player.firstName} ${player.lastName}`}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {player.age || 22}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 pixel-corners font-black text-xs font-arcade ${
                                  player.overallRating >= 85
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : player.overallRating >= 75
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {player.overallRating}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.pace ?? player.stats?.pro ?? 70}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.shooting ?? player.stats?.goa ?? 70}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.passing ?? player.stats?.cre ?? 70}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.dribbling ?? player.stats?.cre ?? 70}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.defending ?? player.stats?.def ?? 70}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.physicality ?? player.stats?.phy ?? 70}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() =>
                                  setEditingPlayerModal({
                                    slotNumber: idx + 1,
                                    player,
                                    tier: activeSquadTier,
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 pixel-corners font-bold text-[11px] flex items-center gap-1 ml-auto border border-slate-700 transition-all font-pixel cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* PLAYER EDITOR MODAL */}
      {editingPlayerModal && (
        <TeamPlayerEditorModal
          isOpen={true}
          slotNumber={editingPlayerModal.slotNumber}
          player={editingPlayerModal.player}
          groupLabel={editingPlayerModal.tier}
          occupiedNumbers={new Map()}
          onSave={handleSavePlayerInTier}
          onClose={() => setEditingPlayerModal(null)}
        />
      )}
    </div>
  );
};
