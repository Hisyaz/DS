import React, { useState, useEffect } from 'react';
import {
  CompetitionData,
  CompetitionCategory,
  CompetitionType,
  ContinentalFederation,
} from '../../types/competitionEditor';
import {
  LeagueDatabase,
  LeagueDesignConfig,
  LeagueStructureConfig,
  IndividualAwardsConfig,
  IndividualAwardConfig,
  CompetitionSubConfig,
  CompetitionTrophyConfig,
  LeagueShapeStyle,
  LeagueColorOption,
  TextOutlineStyleOption,
  BackgroundStyleOption,
  PanelStyleOption,
  ButtonStyleOption,
  IconStyleOption,
  TrophyShapeStyle,
  TrophyBaseDesign,
  TrophyIconType,
} from '../../types/leagueEditor';
import { EmblemShape } from '../../types';
import { QualificationRuleBuilder } from './QualificationRuleBuilder';
import { StageFormatEditor } from './StageFormatEditor';
import { TrophyDesignerPreview } from '../TrophyDesignerPreview';
import { CustomEmblem } from '../CustomEmblem';
import { LeagueUiPreview } from '../LeagueUiPreview';
import {
  getDefaultChampionshipTrophy,
  getDefaultIndividualAwards,
  getDefaultNewspaperName,
} from '../../utils/leagueDatabaseSystem';
import {
  X,
  Save,
  Trophy,
  Shield,
  Layers,
  Calendar,
  Sliders,
  Check,
  Plus,
  Newspaper,
  Award,
  Palette,
  Users,
  Sparkles,
  Medal,
  Globe,
} from 'lucide-react';

interface CompetitionModalProps {
  isOpen: boolean;
  competition: CompetitionData | null;
  onClose: () => void;
  onSave: (updated: CompetitionData) => void;
  leagueDb?: LeagueDatabase;
  allCompetitions?: Record<string, CompetitionData>;
}

const EMBLEM_SHAPES: { id: EmblemShape; label: string }[] = [
  { id: 'crested-shield', label: 'Crested Shield' },
  { id: 'crown-shield', label: 'Royal Crown' },
  { id: 'flame-shield', label: 'Flame Shield' },
  { id: 'star-shield', label: 'Star Shield' },
  { id: 'circle', label: 'Circle Emblem' },
  { id: 'diamond', label: 'Diamond Badge' },
  { id: 'barcelona', label: 'Spanish Crest' },
  { id: 'real-madrid', label: 'Crown Crest' },
  { id: 'liverpool', label: 'Liverpool Crest' },
  { id: 'arrow', label: 'Arrow Badge' },
  { id: 'square', label: 'Modern Square' },
];

const SHAPE_OPTIONS: { id: LeagueShapeStyle; label: string; desc: string }[] = [
  { id: 'modern_square', label: 'Modern Square', desc: 'Sharp edges, uppercase bold typography, square box layout' },
  { id: 'modern_rounded', label: 'Modern Rounded', desc: 'Curved pill badges, smooth padding, soft modern curves' },
  { id: 'classic', label: 'Classic', desc: 'Serif fonts, double border accents, traditional football aesthetic' },
  { id: 'futuristic', label: 'Futuristic', desc: 'Cyber-angled cards, monospace HUD metrics, neon high contrast' },
  { id: 'simple', label: 'Simple', desc: 'Clean minimal border lines, subtle typography, uncluttered HUD' },
];

const COLOR_OPTIONS: LeagueColorOption[] = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'White', 'Grey'];

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  isOpen,
  competition,
  onClose,
  onSave,
  leagueDb,
  allCompetitions,
}) => {
  const [activeTab, setActiveTab] = useState<
    'info' | 'structure' | 'qualification' | 'trophies' | 'design' | 'teams' | 'rules'
  >('info');

  const [formData, setFormData] = useState<CompetitionData>(() => {
    if (competition) return competition;
    const defaultName = 'New Custom Competition';
    return {
      id: `COMP_${Date.now()}`,
      name: defaultName,
      shortName: 'NCC',
      category: 'national',
      competitionType: 'league',
      countryCode: 'ARG',
      countryName: 'Argentina',
      divisionTier: '1st',
      newspaperName: getDefaultNewspaperName('ARG', '1st'),
      numParticipants: 16,
      participantAssignmentMode: 'automatic',
      participatingDivisions: ['First Division', 'Second Division'],
      qualificationRules: [],
      stages: [
        {
          id: 'stg_1',
          name: 'League Table',
          stageType: 'league_table',
          order: 1,
        },
      ],
      schedule: { startMonth: 'August', endMonth: 'May', matchdayFrequencyDays: 7 },
      registrationRules: { maxSquadSize: 25 },
      trophy: getDefaultChampionshipTrophy(defaultName),
      individualAwards: getDefaultIndividualAwards(defaultName),
      emblem: {
        shape: 'crested-shield',
        mode: '1',
        color1: '#00A8FF',
        color2: '#FFFFFF',
      },
      design: {
        shape: 'modern_square',
        primaryColor: 'Blue',
        secondaryColor: 'White',
        accentColor: 'Yellow',
        primaryHex: '#00A8FF',
        secondaryHex: '#74B9FF',
        accentHex: '#FFD700',
      },
      structure: {
        numTeams: 16,
        format: 'double_round_robin',
        directRelegationSpots: 3,
        playoffRelegationSpots: 0,
      },
      branding: { primaryHex: '#00A8FF', secondaryHex: '#74B9FF', accentHex: '#FFD700' },
    };
  });

  useEffect(() => {
    if (competition) {
      setFormData({
        ...competition,
        newspaperName:
          competition.newspaperName ||
          getDefaultNewspaperName(competition.countryCode || 'ENG', competition.divisionTier || '1st'),
        trophy: competition.trophy || getDefaultChampionshipTrophy(competition.name || 'Competition'),
        individualAwards: competition.individualAwards || getDefaultIndividualAwards(competition.name || 'Competition'),
        design: competition.design || {
          shape: 'modern_square',
          primaryColor: 'Blue',
          secondaryColor: 'White',
          accentColor: 'Yellow',
          primaryHex: competition.branding?.primaryHex || '#00A8FF',
          secondaryHex: competition.branding?.secondaryHex || '#74B9FF',
          accentHex: competition.branding?.accentHex || '#FFD700',
        },
        structure: competition.structure || {
          numTeams: competition.numParticipants || 16,
          format: 'double_round_robin',
          directRelegationSpots: 3,
          playoffRelegationSpots: 0,
        },
      });
    }
  }, [competition]);

  if (!isOpen) return null;

  const handleDivisionToggle = (divName: string) => {
    const current = formData.participatingDivisions || [];
    const updated = current.includes(divName)
      ? current.filter((d) => d !== divName)
      : [...current, divName];
    setFormData({ ...formData, participatingDivisions: updated });
  };

  const availableTeams = leagueDb ? (Object.values(leagueDb.teams) as { id: string; name: string; countryCode?: string }[]) : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left relative">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md border border-blue-400/30 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{formData.name || 'Untitled Competition'}</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded uppercase font-mono font-bold">
                  {formData.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Data-driven competition manager • Edit metadata, trophies, UI theme, stages, rules & team rosters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP TAB STRIP */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Basic Info & Newspaper</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'structure'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Structure & Stages ({formData.stages?.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'qualification'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>3. Qualification System ({formData.qualificationRules?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trophies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'trophies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>4. Trophies & Awards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'design'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span>5. Emblem & UI Design</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'teams'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>6. Teams ({formData.participatingTeamIds?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>7. Schedule & Rules</span>
          </button>
        </div>

        {/* MAIN BODY scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB 1: BASIC INFO & NEWSPAPER */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  COMPETITION IDENTIFICATION & CLASSIFICATION
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      COMPETITION ID (STABLE UNIQUE KEY)
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-300 focus:border-blue-500"
                      placeholder="e.g. UEFA_CL, ARG_CUP, ENG_L1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      FULL COMPETITION NAME
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setFormData({
                          ...formData,
                          name: newName,
                          trophy: formData.trophy || getDefaultChampionshipTrophy(newName),
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-blue-500"
                      placeholder="e.g. English Premier Division"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      SHORT NAME / ACRONYM
                    </label>
                    <input
                      type="text"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                      placeholder="e.g. EPL"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      CATEGORY
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CompetitionCategory })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      <option value="national">NATIONAL (Domestic Country)</option>
                      <option value="continental">CONTINENTAL (Federation Level)</option>
                      <option value="international">INTERNATIONAL (World Level)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      COMPETITION TYPE
                    </label>
                    <select
                      value={formData.competitionType}
                      onChange={(e) => setFormData({ ...formData, competitionType: e.target.value as CompetitionType })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      <option value="league">League Table</option>
                      <option value="cup">Domestic Cup</option>
                      <option value="supercup">Super Cup</option>
                      <option value="youth">Youth Competition</option>
                      <option value="qualifier">Qualifying Tournament</option>
                      <option value="tournament">Continental / World Tournament</option>
                    </select>
                  </div>

                  {formData.category === 'continental' && (
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 mb-1">
                        CONTINENTAL FEDERATION
                      </label>
                      <select
                        value={formData.federationId || 'UEFA'}
                        onChange={(e) => setFormData({ ...formData, federationId: e.target.value as ContinentalFederation })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                      >
                        <option value="UEFA">UEFA (Europe)</option>
                        <option value="CONMEBOL">CONMEBOL (South America)</option>
                        <option value="CONCACAF">CONCACAF (North/Central America)</option>
                        <option value="CAF">CAF (Africa)</option>
                        <option value="AFC">AFC (Asia)</option>
                        <option value="OFC">OFC (Oceania)</option>
                        <option value="FIFA">FIFA (Global)</option>
                      </select>
                    </div>
                  )}

                  {formData.category === 'national' && (
                    <>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-300 mb-1">
                          COUNTRY NAME
                        </label>
                        <input
                          type="text"
                          value={formData.countryName || ''}
                          onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                          placeholder="e.g. Argentina, England, Spain"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-300 mb-1">
                          DIVISION TIER
                        </label>
                        <select
                          value={formData.divisionTier || '1st'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              divisionTier: e.target.value,
                              newspaperName:
                                formData.newspaperName ||
                                getDefaultNewspaperName(formData.countryCode || 'ENG', e.target.value),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                        >
                          <option value="1st">First Division</option>
                          <option value="2nd">Second Division</option>
                          <option value="3rd">Third Division</option>
                          <option value="Youth">Youth / Academy Tier</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      NUMBER OF PARTICIPATING TEAMS
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={128}
                      value={formData.numParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numParticipants: Math.max(2, parseInt(e.target.value) || 2),
                          structure: {
                            ...(formData.structure || { format: 'double_round_robin', directRelegationSpots: 3, playoffRelegationSpots: 0 }),
                            numTeams: Math.max(2, parseInt(e.target.value) || 2),
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 mb-1">
                      PARTICIPANT ASSIGNMENT MODE
                    </label>
                    <select
                      value={formData.participantAssignmentMode}
                      onChange={(e) => setFormData({ ...formData, participantAssignmentMode: e.target.value as 'automatic' | 'manual' })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      <option value="automatic">Automatic (Derived from Qualification Rules)</option>
                      <option value="manual">Manual (Direct Team Assignment)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NEWSPAPER CONFIGURATION */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  LEAGUE NEWSPAPER & MEDIA SYSTEM
                </h4>
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    NEWSPAPER TITLE (FOR HEADLINES, ARTICLES & CINEMATICS)
                  </label>
                  <input
                    type="text"
                    value={formData.newspaperName || ''}
                    onChange={(e) => setFormData({ ...formData, newspaperName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-blue-500"
                    placeholder="e.g. The Daily Football, Marca, Olé, L'Équipe"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used dynamically across press releases, match outcome headlines, transfer rumors, and trophy ceremony news items.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURE & STAGES */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              {/* LEAGUE TABLE STRUCTURE CONFIG */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  LEAGUE STRUCTURE & RELEGATION / CONTINENTAL SPOTS
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      DIRECT RELEGATION SPOTS
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formData.structure?.directRelegationSpots ?? 3}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          structure: {
                            ...(formData.structure || { numTeams: formData.numParticipants || 16, format: 'double_round_robin', playoffRelegationSpots: 0 }),
                            directRelegationSpots: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      PLAYOFF RELEGATION SPOTS
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={formData.structure?.playoffRelegationSpots ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          structure: {
                            ...(formData.structure || { numTeams: formData.numParticipants || 16, format: 'double_round_robin', directRelegationSpots: 3 }),
                            playoffRelegationSpots: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      FORMAT TYPE
                    </label>
                    <select
                      value={formData.structure?.format || 'double_round_robin'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          structure: {
                            ...(formData.structure || { numTeams: formData.numParticipants || 16, directRelegationSpots: 3, playoffRelegationSpots: 0 }),
                            format: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      <option value="double_round_robin">Double Round Robin (Home & Away)</option>
                      <option value="single_round_robin">Single Round Robin</option>
                      <option value="split_season">Split Season (Apertura / Clausura)</option>
                      <option value="knockout">Pure Knockout</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MULTI-STAGE FORMAT EDITOR */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider">
                  TOURNAMENT STAGES & STAGE ORDER
                </h4>
                <StageFormatEditor
                  stages={formData.stages || []}
                  onChangeStages={(stages) => setFormData({ ...formData, stages })}
                />
              </div>
            </div>
          )}

          {/* TAB 3: QUALIFICATION SYSTEM */}
          {activeTab === 'qualification' && (
            <QualificationRuleBuilder
              rules={formData.qualificationRules || []}
              onChangeRules={(rules) => setFormData({ ...formData, qualificationRules: rules })}
              leagueDb={leagueDb}
              allCompetitions={allCompetitions}
            />
          )}

          {/* TAB 4: TROPHIES & AWARDS */}
          {activeTab === 'trophies' && (
            <div className="space-y-6">
              {/* CHAMPIONSHIP TROPHY DESIGNER */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  MAIN CHAMPIONSHIP TROPHY DESIGNER
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">TROPHY NAME</label>
                    <input
                      type="text"
                      value={formData.trophy?.name || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">METAL TONE</label>
                    <select
                      value={formData.trophy?.metalTone || 'gold'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            metalTone: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">TROPHY SHAPE</label>
                    <select
                      value={formData.trophy?.shape || 'tower'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            shape: e.target.value as TrophyShapeStyle,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="cup">Classic Championship Cup</option>
                      <option value="tower">Tower Trophy</option>
                      <option value="shield">Honor Shield</option>
                      <option value="globe">World Globe</option>
                      <option value="star">Star Trophy</option>
                      <option value="statue">Victory Statue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">BASE PEDESTAL DESIGN</label>
                    <select
                      value={formData.trophy?.baseDesign || 'marble_black'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            baseDesign: e.target.value as TrophyBaseDesign,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="marble_black">Black Marble Base</option>
                      <option value="mahogany_wood">Mahogany Wood Base</option>
                      <option value="gold_tier">Gold Pedestal</option>
                      <option value="silver_pedestal">Silver Base</option>
                      <option value="glass_stand">Glass Stand</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">RIBBON COLOR</label>
                    <input
                      type="color"
                      value={formData.trophy?.ribbonColor || '#00A8FF'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            ribbonColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ENGRAVING INSCRIPTION</label>
                    <input
                      type="text"
                      value={formData.trophy?.engravingText || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trophy: {
                            ...(formData.trophy || getDefaultChampionshipTrophy(formData.name)),
                            engravingText: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      placeholder="e.g. CHAMPIONS OF ENGLAND"
                    />
                  </div>
                </div>

                {formData.trophy && (
                  <div className="flex justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <TrophyDesignerPreview trophy={formData.trophy} size="md" />
                  </div>
                )}
              </div>

              {/* INDIVIDUAL AWARDS TROPHIES */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  INDIVIDUAL AWARDS TROPHIES
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'topGoalscorer', defaultLabel: 'Golden Boot (Top Goalscorer)' },
                    { key: 'topAssist', defaultLabel: 'Playmaker Trophy (Top Assists)' },
                    { key: 'bestPlayer', defaultLabel: 'Player of the Season (Ballon d\'Or)' },
                    { key: 'bestYoungPlayer', defaultLabel: 'Golden Boy U-21 (Best Young Player)' },
                    { key: 'bestManager', defaultLabel: 'Manager of the Season' },
                  ].map((item) => {
                    const awards = formData.individualAwards || getDefaultIndividualAwards(formData.name);
                    const awardData = (awards as any)[item.key] as IndividualAwardConfig | undefined;
                    if (!awardData) return null;

                    return (
                      <div key={item.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{item.defaultLabel}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedAwards = {
                                ...awards,
                                [item.key]: {
                                  ...awardData,
                                  enabled: !awardData.enabled,
                                },
                              };
                              setFormData({ ...formData, individualAwards: updatedAwards });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              awardData.enabled
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}
                          >
                            {awardData.enabled ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>

                        {awardData.enabled && (
                          <div className="space-y-2 pt-1">
                            <input
                              type="text"
                              value={awardData.awardName}
                              onChange={(e) => {
                                const updatedAwards = {
                                  ...awards,
                                  [item.key]: {
                                    ...awardData,
                                    awardName: e.target.value,
                                  },
                                };
                                setFormData({ ...formData, individualAwards: updatedAwards });
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                            />

                            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                              <span className="text-[11px] text-slate-400 font-mono">
                                {awardData.trophy?.metalTone?.toUpperCase()} • {awardData.trophy?.shape?.toUpperCase()}
                              </span>
                              <TrophyDesignerPreview trophy={awardData.trophy} size="sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMBLEM & UI DESIGN THEME */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              {/* EMBLEM DESIGNER */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  EMBLEM DESIGNER
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">EMBLEM SHAPE</label>
                    <select
                      value={formData.emblem?.shape || 'crested-shield'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emblem: {
                            ...(formData.emblem || { mode: '1', color1: '#00A8FF', color2: '#FFFFFF' }),
                            shape: e.target.value as EmblemShape,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {EMBLEM_SHAPES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">COLOR 1 (PRIMARY)</label>
                    <input
                      type="color"
                      value={formData.emblem?.color1 || '#00A8FF'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emblem: {
                            ...(formData.emblem || { shape: 'crested-shield', mode: '1', color2: '#FFFFFF' }),
                            color1: e.target.value,
                          },
                          branding: {
                            ...(formData.branding || { secondaryHex: '#74B9FF', accentHex: '#FFD700' }),
                            primaryHex: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">COLOR 2 (SECONDARY)</label>
                    <input
                      type="color"
                      value={formData.emblem?.color2 || '#FFFFFF'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emblem: {
                            ...(formData.emblem || { shape: 'crested-shield', mode: '1', color1: '#00A8FF' }),
                            color2: e.target.value,
                          },
                          branding: {
                            ...(formData.branding || { primaryHex: '#00A8FF', accentHex: '#FFD700' }),
                            secondaryHex: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>

                {formData.emblem && (
                  <div className="flex justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <CustomEmblem config={formData.emblem} className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* UI DESIGN THEME CONFIG */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-400" />
                  LEAGUE UI DESIGN THEME & CARD SHAPE STYLE
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SHAPE_OPTIONS.map((shape) => {
                    const isSelected = formData.design?.shape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            design: {
                              ...(formData.design || { primaryColor: 'Blue', secondaryColor: 'White', accentColor: 'Yellow' }),
                              shape: shape.id,
                            },
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <h5 className="text-xs font-black text-white">{shape.label}</h5>
                        <p className="text-[11px] text-slate-400 mt-1">{shape.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE LEAGUE UI PREVIEW */}
              {formData.design && (
                <div className="pt-2">
                  <LeagueUiPreview
                    leagueName={formData.name}
                    design={formData.design}
                    trophy={formData.trophy}
                    emblem={formData.emblem}
                    activePreviewMode="all"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TEAMS ASSIGNMENT */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  ASSIGN TEAMS TO THIS COMPETITION ({formData.participatingTeamIds?.length || 0} SELECTED)
                </h4>
              </div>

              <div className="max-h-80 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 custom-scrollbar p-1">
                {availableTeams.map((team) => {
                  const isAssigned = (formData.participatingTeamIds || []).includes(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        const current = formData.participatingTeamIds || [];
                        const updated = isAssigned
                          ? current.filter((id) => id !== team.id)
                          : [...current, team.id];
                        setFormData({
                          ...formData,
                          participatingTeamIds: updated,
                          numParticipants: updated.length > 0 ? updated.length : formData.numParticipants,
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-xs text-left truncate cursor-pointer transition-all flex items-center gap-2 ${
                        isAssigned
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${isAssigned ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-700'}`}>
                        {isAssigned && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="truncate">{team.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: SCHEDULE & RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-white border-b border-slate-800 pb-2">
                  SCHEDULE & MATCHDAY FREQUENCY
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      SEASON START MONTH
                    </label>
                    <select
                      value={formData.schedule?.startMonth || 'August'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...(formData.schedule || { endMonth: 'May', matchdayFrequencyDays: 7 }),
                            startMonth: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      SEASON END MONTH
                    </label>
                    <select
                      value={formData.schedule?.endMonth || 'May'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...(formData.schedule || { startMonth: 'August', matchdayFrequencyDays: 7 }),
                            endMonth: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      MATCHDAY FREQUENCY (DAYS)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={formData.schedule?.matchdayFrequencyDays || 7}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...(formData.schedule || { startMonth: 'August', endMonth: 'May' }),
                            matchdayFrequencyDays: parseInt(e.target.value) || 7,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-white border-b border-slate-800 pb-2">
                  SQUAD REGISTRATION RULES
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      MAX REGISTERED SQUAD SIZE
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={50}
                      value={formData.registrationRules?.maxSquadSize || 25}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationRules: {
                            ...(formData.registrationRules || { maxForeignPlayers: 0 }),
                            maxSquadSize: parseInt(e.target.value) || 25,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      MAX FOREIGN PLAYERS (0 = UNLIMITED)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={formData.registrationRules?.maxForeignPlayers || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationRules: {
                            ...(formData.registrationRules || { maxSquadSize: 25 }),
                            maxForeignPlayers: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 pb-16 sm:pb-4 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>SAVE COMPETITION DATA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
