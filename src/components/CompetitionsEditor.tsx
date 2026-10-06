import React, { useState, useRef } from 'react';
import {
  GlobalCompetitionsDatabase,
  CompetitionData,
  CompetitionCategory,
  ContinentalFederation,
  CompetitionValidationResult,
} from '../types/competitionEditor';
import { LeagueDatabase } from '../types/leagueEditor';
import {
  getGlobalCompetitionsDatabase,
  saveGlobalCompetitionsDatabase,
  resetGlobalCompetitionsDatabase,
  exportGlobalCompetitionsJSON,
  validateGlobalCompetitionsDatabase,
} from '../utils/competitionDatabaseManager';
import { CompetitionModal } from './competitions/CompetitionModal';
import {
  Trophy,
  Globe,
  Flag,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Edit,
  Copy,
  Trash2,
  Shield,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

import { syncCompetitionToLeagueDb } from '../utils/competitionMigration';

interface CompetitionsEditorProps {
  leagueDb?: LeagueDatabase;
  onUpdateLeagueDb?: (updated: LeagueDatabase) => void;
  showToast: (msg: string) => void;
}

export const CompetitionsEditor: React.FC<CompetitionsEditorProps> = ({
  leagueDb,
  onUpdateLeagueDb,
  showToast,
}) => {
  const [globalDb, setGlobalDb] = useState<GlobalCompetitionsDatabase>(() =>
    getGlobalCompetitionsDatabase()
  );

  // Nav Category: 'national' | 'continental' | 'international'
  const [selectedCategory, setSelectedCategory] =
    useState<CompetitionCategory>('national');

  // National Country Filter
  const [selectedCountry, setSelectedCountry] = useState<string>('ARG');

  // Continental Federation Filter
  const [selectedFederation, setSelectedFederation] =
    useState<ContinentalFederation>('UEFA');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [editingComp, setEditingComp] = useState<CompetitionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Import Validation Dialog State
  const [importValidationResult, setImportValidationResult] =
    useState<CompetitionValidationResult | null>(null);
  const [pendingImportDb, setPendingImportDb] =
    useState<GlobalCompetitionsDatabase | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateDatabase = (updatedDb: GlobalCompetitionsDatabase) => {
    setGlobalDb(updatedDb);
    saveGlobalCompetitionsDatabase(updatedDb);
  };

  const handleCreateNewCompetition = (
    category?: CompetitionCategory,
    countryCode?: string,
    federationId?: ContinentalFederation
  ) => {
    const cat = category || selectedCategory;
    const newComp: CompetitionData = {
      id: `CUSTOM_${Date.now().toString().slice(-6)}`,
      name: 'New Competition Placeholder',
      shortName: 'NEW',
      category: cat,
      competitionType: cat === 'national' ? 'cup' : 'tournament',
      countryCode: countryCode || (cat === 'national' ? selectedCountry : undefined),
      countryName:
        cat === 'national'
          ? selectedCountry === 'ARG'
            ? 'Argentina'
            : selectedCountry === 'ENG'
            ? 'England'
            : selectedCountry === 'ESP'
            ? 'Spain'
            : selectedCountry === 'FR'
            ? 'France'
            : selectedCountry === 'BRA'
            ? 'Brazil'
            : 'Custom Country'
          : undefined,
      federationId: cat === 'continental' ? federationId || selectedFederation : 'FIFA',
      numParticipants: 16,
      participantAssignmentMode: 'automatic',
      qualificationRules: [],
      stages: [
        { id: 'stg_1', name: 'Quarter-Finals', stageType: 'quarter_finals', order: 1 },
        { id: 'stg_2', name: 'Semi-Finals', stageType: 'semi_finals', order: 2 },
        { id: 'stg_3', name: 'Final', stageType: 'final', order: 3 },
      ],
      schedule: { startMonth: 'August', endMonth: 'May', matchdayFrequencyDays: 7 },
      registrationRules: { maxSquadSize: 25 },
      trophy: {
        name: 'Custom Championship Trophy',
        metalTone: 'gold',
        iconType: 'cup',
        ribbonColor: '#00A8FF',
        shape: 'cup',
        baseDesign: 'marble_black',
      },
      emblem: { shape: 'crested-shield', mode: '1', color1: '#00A8FF', color2: '#FFFFFF' },
      branding: { primaryHex: '#00A8FF', secondaryHex: '#74B9FF', accentHex: '#FFD700' },
      isPlaceholder: true,
    };

    setEditingComp(newComp);
    setIsModalOpen(true);
  };

  const handleSaveCompetition = (compToSave: CompetitionData) => {
    const updatedCompetitions = {
      ...globalDb.competitions,
      [compToSave.id]: {
        ...compToSave,
        isPlaceholder: false,
        lastUpdated: new Date().toISOString(),
      },
    };

    const newDb: GlobalCompetitionsDatabase = {
      ...globalDb,
      competitions: updatedCompetitions,
      lastUpdated: new Date().toISOString(),
    };

    updateDatabase(newDb);

    if (leagueDb) {
      const updatedLeagueDb = syncCompetitionToLeagueDb(compToSave, leagueDb);
      if (onUpdateLeagueDb) {
        onUpdateLeagueDb(updatedLeagueDb);
      }
    }

    setIsModalOpen(false);
    setEditingComp(null);
    showToast(`🏆 Competition "${compToSave.name}" saved successfully!`);
  };

  const handleDuplicateCompetition = (comp: CompetitionData) => {
    const newId = `${comp.id}_COPY_${Math.floor(Math.random() * 1000)}`;
    const duplicated: CompetitionData = {
      ...comp,
      id: newId,
      name: `${comp.name} (Copy)`,
      shortName: `${comp.shortName} C`,
      lastUpdated: new Date().toISOString(),
    };

    const newDb: GlobalCompetitionsDatabase = {
      ...globalDb,
      competitions: {
        ...globalDb.competitions,
        [newId]: duplicated,
      },
    };

    updateDatabase(newDb);
    showToast(`📋 Duplicated competition as "${duplicated.name}" (ID: ${newId})`);
  };

  const handleRemoveCompetition = (id: string, name: string) => {
    let proceed = true;
    try {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        proceed = window.confirm(`Are you sure you want to delete "${name}"?`);
      }
    } catch (e) {
      console.warn('Confirm dialog blocked by iframe:', e);
    }
    if (proceed) {
      const updated = { ...globalDb.competitions };
      delete updated[id];

      const newDb: GlobalCompetitionsDatabase = {
        ...globalDb,
        competitions: updated,
      };

      updateDatabase(newDb);
      showToast(`🗑️ Competition "${name}" removed from database.`);
    }
  };

  const handleExportDatabase = () => {
    exportGlobalCompetitionsJSON(globalDb, 'global_competitions_database.json');
    showToast('📥 Exported Global Competitions database to JSON file!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validation = validateGlobalCompetitionsDatabase(parsed, leagueDb);

        setPendingImportDb(parsed);
        setImportValidationResult(validation);
      } catch (err) {
        showToast('❌ Invalid JSON file. Please check syntax.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (pendingImportDb) {
      updateDatabase(pendingImportDb);
      setPendingImportDb(null);
      setImportValidationResult(null);
      showToast('✅ Global Competitions database imported successfully!');
    }
  };

  const handleResetDefaults = () => {
    let proceed = true;
    try {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        proceed = window.confirm(
          'Are you sure you want to reset all competitions to factory default database settings?'
        );
      }
    } catch (e) {
      console.warn('Confirm dialog blocked by iframe:', e);
    }
    if (proceed) {
      const defaultDb = resetGlobalCompetitionsDatabase();
      setGlobalDb(defaultDb);
      showToast('🔄 Reset all competitions to factory defaults.');
    }
  };

  const compList = Object.values(globalDb.competitions) as CompetitionData[];

  // Statistics
  const nationalCount = compList.filter((c) => c.category === 'national').length;
  const continentalCount = compList.filter((c) => c.category === 'continental').length;
  const internationalCount = compList.filter((c) => c.category === 'international').length;

  // Filtered List
  const filteredComps = compList.filter((c) => {
    if (selectedCategory && c.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchCountry = c.countryName?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCountry) return false;
    }

    if (selectedCategory === 'national') {
      if (selectedCountry) {
        const isMatch =
          c.countryCode === selectedCountry ||
          (selectedCountry === 'FR' && c.countryCode === 'FRA') ||
          (selectedCountry === 'FRA' && c.countryCode === 'FR');
        if (!isMatch) return false;
      }
    }

    if (selectedCategory === 'continental') {
      if (selectedFederation && c.federationId !== selectedFederation) return false;
    }

    return true;
  });

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 space-y-6 text-left select-none">
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* HEADER BAR */}
      <header className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              COMPETITIONS EDITOR
              <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                DATA-DRIVEN ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, customize, reorder stages, edit qualification rules & export competition database.
            </p>
          </div>
        </div>

        {/* TOP STATS & GLOBAL ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCreateNewCompetition()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD NEW COMPETITION</span>
          </button>

          <button
            onClick={handleExportDatabase}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Export Global Competitions to JSON"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Import Global Competitions from JSON"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>IMPORT JSON</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CATEGORY NAV TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. NATIONAL */}
        <button
          onClick={() => setSelectedCategory('national')}
          className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            selectedCategory === 'national'
              ? 'bg-gradient-to-br from-blue-900/60 to-slate-900 border-blue-500/80 shadow-xl ring-1 ring-blue-500/40'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === 'national' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">NATIONAL</h3>
              <p className="text-xs text-slate-400">Domestic League & Cup Tournaments</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full">
            {nationalCount}
          </span>
        </button>

        {/* 2. CONTINENTAL */}
        <button
          onClick={() => setSelectedCategory('continental')}
          className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            selectedCategory === 'continental'
              ? 'bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/80 shadow-xl ring-1 ring-indigo-500/40'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === 'continental' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">CONTINENTAL</h3>
              <p className="text-xs text-slate-400">UEFA, CONMEBOL, CAF, AFC, OFC</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full">
            {continentalCount}
          </span>
        </button>

        {/* 3. INTERNATIONAL */}
        <button
          onClick={() => setSelectedCategory('international')}
          className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
            selectedCategory === 'international'
              ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/80 shadow-xl ring-1 ring-amber-500/40'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === 'international' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">INTERNATIONAL</h3>
              <p className="text-xs text-slate-400">FIFA World Cup, Youth & Intercontinental</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full">
            {internationalCount}
          </span>
        </button>
      </div>

      {/* CATEGORY SUB-FILTERS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* CATEGORY-SPECIFIC SECONDARY NAV */}
          {selectedCategory === 'national' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Country:
              </span>
              {[
                { code: 'ARG', name: 'Argentina 🇦🇷' },
                { code: 'ENG', name: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                { code: 'ESP', name: 'Spain 🇪🇸' },
                { code: 'FR', name: 'France 🇫🇷' },
                { code: 'BRA', name: 'Brazil 🇧🇷' },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCountry === c.code
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {selectedCategory === 'continental' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Federation:
              </span>
              {(['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'] as ContinentalFederation[]).map(
                (fed) => (
                  <button
                    key={fed}
                    onClick={() => setSelectedFederation(fed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                      selectedFederation === fed
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {fed}
                  </button>
                )
              )}
            </div>
          )}

          {selectedCategory === 'international' && (
            <div className="text-xs text-slate-400 font-medium">
              Showing global FIFA, Intercontinental, Youth & World Cup tournaments database.
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competition..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* COMPETITION CARDS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>
              {selectedCategory === 'national' && `NATIONAL COMPETITIONS (${selectedCountry})`}
              {selectedCategory === 'continental' && `CONTINENTAL COMPETITIONS (${selectedFederation})`}
              {selectedCategory === 'international' && 'INTERNATIONAL & WORLD COMPETITIONS'}
            </span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              • {filteredComps.length} Total
            </span>
          </h2>

          <button
            onClick={() =>
              handleCreateNewCompetition(
                selectedCategory,
                selectedCategory === 'national' ? selectedCountry : undefined,
                selectedCategory === 'continental' ? selectedFederation : 'FIFA'
              )
            }
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Competition To Category</span>
          </button>
        </div>

        {filteredComps.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">
              No competitions found in this category or filter.
            </p>
            <button
              onClick={() => handleCreateNewCompetition()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Competition</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComps.map((comp) => (
              <div
                key={comp.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Emblem & Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md border"
                        style={{
                          backgroundColor: comp.branding?.primaryHex || '#1e293b',
                          borderColor: comp.branding?.secondaryHex || '#334155',
                        }}
                      >
                        {comp.shortName || comp.name.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                          {comp.name}
                        </h3>
                        <p className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                          <span>{comp.id}</span>
                          {comp.countryName && <span>• {comp.countryName}</span>}
                          {comp.federationId && <span>• {comp.federationId}</span>}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {comp.competitionType}
                    </span>
                  </div>

                  {/* Summary Info Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        PARTICIPANTS
                      </span>
                      <span className="font-extrabold text-white text-xs">
                        {comp.numParticipants} Teams ({comp.participantAssignmentMode})
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        STAGES & FORMAT
                      </span>
                      <span className="font-extrabold text-white text-xs">
                        {comp.stages?.length || 1} Stage{(comp.stages?.length || 1) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Qualification Rules Preview */}
                  {comp.qualificationRules && comp.qualificationRules.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 space-y-1">
                      <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider block">
                        QUALIFICATION SLOTS:
                      </span>
                      {comp.qualificationRules.slice(0, 2).map((q, qIdx) => (
                        <p key={qIdx} className="text-[11px] text-slate-300 truncate">
                          • {q.description || `${q.sourceName || q.sourceId}: ${q.directQualificationSpots} Direct`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingComp(comp);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateCompetition(comp)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Duplicate Competition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRemoveCompetition(comp.id, comp.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove Competition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT / CREATION MODAL */}
      {isModalOpen && (
        <CompetitionModal
          isOpen={isModalOpen}
          competition={editingComp}
          onClose={() => {
            setIsModalOpen(false);
            setEditingComp(null);
          }}
          onSave={handleSaveCompetition}
          leagueDb={leagueDb}
          allCompetitions={globalDb.competitions}
        />
      )}

      {/* IMPORT VALIDATION DIALOG MODAL */}
      {importValidationResult && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-950">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                {importValidationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                IMPORT VALIDATION RESULT
              </h3>
              <button
                onClick={() => {
                  setImportValidationResult(null);
                  setPendingImportDb(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-3.5">
              {importValidationResult.summary && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-white">
                    Total Competitions Detected: {importValidationResult.summary.totalCompetitions}
                  </p>
                  <p className="text-slate-400">
                    National: {importValidationResult.summary.nationalCount} • Continental:{' '}
                    {importValidationResult.summary.continentalCount} • International:{' '}
                    {importValidationResult.summary.internationalCount}
                  </p>
                </div>
              )}

              {/* Errors */}
              {importValidationResult.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 space-y-1">
                  <p className="font-black text-red-400">CRITICAL ERRORS ({importValidationResult.errors.length}):</p>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                    {importValidationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importValidationResult.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 space-y-1">
                  <p className="font-bold text-amber-400">WARNINGS ({importValidationResult.warnings.length}):</p>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                    {importValidationResult.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setImportValidationResult(null);
                  setPendingImportDb(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              {importValidationResult.isValid && (
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition cursor-pointer"
                >
                  Confirm & Import Database
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
