import React, { useState, useMemo, useRef } from 'react';
import {
  FileCode,
  Download,
  Upload,
  RotateCcw,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Languages,
  X,
  FileJson,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePacket } from '../types/languagePacket';
import { DEFAULT_UK_ENGLISH_PACKET } from '../data/defaultLanguagePacket';
import { DEFAULT_ARGENTINEAN_SPANISH_PACKET } from '../data/argentineanSpanishLanguagePacket';
import { DEFAULT_CASTILIAN_SPANISH_PACKET } from '../data/castilianSpanishLanguagePacket';

interface LanguagePacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

type CategoryFilter =
  | 'ALL'
  | 'SYSTEM'
  | 'STATS'
  | 'POSITIONS'
  | 'STORE'
  | 'BUSINESS'
  | 'PERKS'
  | 'CARDS'
  | 'CHOICES'
  | 'TROPHIES';

export const LanguagePacketModal: React.FC<LanguagePacketModalProps> = ({
  isOpen,
  onClose,
  showToast = () => {},
}) => {
  const {
    activePacket,
    isPacketLoaded,
    loadPacket,
    unloadPacket,
    resetPacket,
    resetToCastilianSpanish,
    resetToArgentineanSpanish,
    setLanguage,
    currentLanguage,
    downloadPacket,
    validatePacket,
  } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'load' | 'inspector'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load / Import state
  const [pastedJson, setPastedJson] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 50;

  // Filter keys for inspector
  const filteredKeys = useMemo(() => {
    if (!activePacket || !activePacket.translations) return [];
    const entries = Object.entries(activePacket.translations);
    const query = searchQuery.toLowerCase().trim();

    return entries.filter(([key, val]) => {
      // Category filter
      if (selectedCategory === 'SYSTEM' && !key.startsWith('SYSTEM_') && !key.startsWith('NAV_') && !key.startsWith('MENU_')) return false;
      if (selectedCategory === 'STATS' && !key.startsWith('ATTR_') && !key.startsWith('STAT_') && !key.startsWith('ABBR_')) return false;
      if (selectedCategory === 'POSITIONS' && !key.startsWith('POS_') && !key.startsWith('SUBPOS_') && !key.startsWith('PLAYSTYLE_')) return false;
      if (selectedCategory === 'STORE' && !key.startsWith('STORE_') && !key.startsWith('con_') && !key.startsWith('upg_') && !key.startsWith('sb_') && !key.startsWith('equip_') && !key.startsWith('cos_')) return false;
      if (selectedCategory === 'BUSINESS' && !key.startsWith('BIZ_') && !key.startsWith('sportswear') && !key.startsWith('fitness') && !key.startsWith('restaurant') && !key.startsWith('vc_fund') && !key.startsWith('hotel')) return false;
      if (selectedCategory === 'PERKS' && !key.startsWith('PERK_')) return false;
      if (selectedCategory === 'CARDS' && !key.startsWith('CARD_') && !key.startsWith('default-') && !key.startsWith('parent-') && !key.startsWith('street-')) return false;
      if (selectedCategory === 'CHOICES' && !key.startsWith('CHOICE_') && !key.startsWith('EVENT_')) return false;
      if (selectedCategory === 'TROPHIES' && !key.startsWith('TROPHY_')) return false;

      // Search query
      if (query) {
        return key.toLowerCase().includes(query) || (typeof val === 'string' && val.toLowerCase().includes(query));
      }
      return true;
    });
  }, [activePacket, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / PAGE_SIZE));
  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredKeys.slice(start, start + PAGE_SIZE);
  }, [filteredKeys, currentPage]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadPacket();
    showToast(`📥 Downloading ${activePacket?.meta?.languageName || 'Language'} Packet (.json)...`);
  };

  const handleDownloadSpecific = (packet: LanguagePacket, filename: string) => {
    try {
      const jsonStr = JSON.stringify(packet, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`📥 Exported ${filename} successfully!`);
    } catch (e: any) {
      showToast(`❌ Failed to download packet: ${e.message}`);
    }
  };

  const handleCopyKey = (key: string, val: string) => {
    navigator.clipboard.writeText(`"${key}": "${val}"`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = loadPacket(parsed);
        if (res.success) {
          setImportStatus({ type: 'success', message: res.message });
          showToast(`✅ ${res.message}`);
        } else {
          setImportStatus({ type: 'error', message: res.message });
        }
      } catch (err: any) {
        setImportStatus({ type: 'error', message: `JSON Parse Error: ${err.message}` });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyPastedJson = () => {
    if (!pastedJson.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste JSON content first.' });
      return;
    }
    try {
      const parsed = JSON.parse(pastedJson);
      const res = loadPacket(parsed);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
        setPastedJson('');
        showToast(`✅ ${res.message}`);
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setImportStatus({ type: 'error', message: `Invalid JSON: ${err.message}` });
    }
  };

  const handleUnload = () => {
    unloadPacket();
    showToast('⚠️ Language Packet unloaded! The game now has NO text active.');
  };

  const handleReset = () => {
    resetPacket();
    setLanguage('en-GB');
    showToast('🇬🇧 Restored official UK English Language Packet!');
  };

  const handleLoadEsEs = () => {
    resetToCastilianSpanish();
    setLanguage('es-ES');
    showToast('🇪🇸 ¡Paquete de Idioma Español (España) cargado con éxito!');
  };

  const handleLoadEsAr = () => {
    resetToArgentineanSpanish();
    setLanguage('es-AR');
    showToast('🇦🇷 ¡Paquete de Idioma Español Argentino cargado con éxito!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f111a] border border-slate-700/80 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Universal Language Packet System
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single-source language translation engine • Complete game text coverage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATUS BANNER */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/70">
          {isPacketLoaded && activePacket ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Language Packet Active: {activePacket.meta.languageName} ({activePacket.meta.languageCode})
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                  {Object.keys(activePacket.translations || {}).length.toLocaleString()} Keys Loaded
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Author: <strong className="text-slate-200">{activePacket.meta.author}</strong> • Region: <strong className="text-slate-200">{activePacket.meta.region} {activePacket.meta.flag}</strong>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-rose-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-wide">
                  NO LANGUAGE PACKET LOADED • ALL GAME TEXT IS BLANK
                </span>
              </div>
              <span className="text-[11px] text-rose-300/80">
                As per universal design: if no packet is loaded, the game displays no text.
              </span>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 bg-[#121420]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-black uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white border-t-2 border-indigo-500 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Overview & Quick Actions
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`px-4 py-2.5 text-xs font-black uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'load'
                ? 'bg-slate-800 text-white border-t-2 border-indigo-500 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Load / Import Packet
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2.5 text-xs font-black uppercase rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-slate-800 text-white border-t-2 border-indigo-500 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Key Inspector ({filteredKeys.length.toLocaleString()})
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* ACTION BUTTONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleDownload}
                  className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-indigo-950/90 border border-indigo-500/50 hover:border-indigo-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/40 mb-3 group-hover:bg-indigo-500/30">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">Download Packet</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Export editable .json file containing all game strings
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('load')}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/60 to-purple-950/90 border border-purple-500/50 hover:border-purple-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40 mb-3 group-hover:bg-purple-500/30">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">Load Custom Packet</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Upload translated or modified JSON file into the game
                  </div>
                </button>

                <button
                  onClick={handleReset}
                  className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-emerald-950/90 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40 mb-3 group-hover:bg-emerald-500/30">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">Reset to UK English</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Restore master official UK English language packet
                  </div>
                </button>

                <button
                  onClick={handleUnload}
                  className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/60 to-rose-950/90 border border-rose-500/50 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/40 mb-3 group-hover:bg-rose-500/30">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">Unload Packet</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Test blank state (shows no text when packet is missing)
                  </div>
                </button>
              </div>

              {/* OFFICIAL INCLUDED LANGUAGE PACKETS */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white text-sm font-black uppercase tracking-wider">
                    <Languages className="w-4 h-4 text-indigo-400" />
                    Official Pre-Installed Language Packets
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                    3 PACKETS AVAILABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* UK English */}
                  <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    activePacket?.meta?.languageCode === 'en-GB'
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow">🇬🇧</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">UK English</span>
                            {activePacket?.meta?.languageCode === 'en-GB' && (
                              <span className="text-[9px] font-mono font-bold bg-blue-500 text-slate-950 px-1.5 py-0.5 rounded">ACTIVE</span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">English (UK) • Master</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={handleReset}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Load English
                      </button>
                      <button
                        onClick={() => handleDownloadSpecific(DEFAULT_UK_ENGLISH_PACKET, 'ukEnglishLanguagePacket.json')}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Download UK English JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JSON
                      </button>
                    </div>
                  </div>

                  {/* Castilian Spanish (Spain) */}
                  <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    activePacket?.meta?.languageCode === 'es-ES'
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow">🇪🇸</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">Español (España)</span>
                            {activePacket?.meta?.languageCode === 'es-ES' && (
                              <span className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">ACTIVE</span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">Spanish (Spain) • Castellano</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={handleLoadEsEs}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Load Español (ES)
                      </button>
                      <button
                        onClick={() => handleDownloadSpecific(DEFAULT_CASTILIAN_SPANISH_PACKET, 'castilianSpanishLanguagePacket.json')}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Download Castilian Spanish JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JSON
                      </button>
                    </div>
                  </div>

                  {/* Argentinean Spanish */}
                  <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    activePacket?.meta?.languageCode === 'es-AR'
                      ? 'bg-sky-950/40 border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow">🇦🇷</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">Español (Argentina)</span>
                            {activePacket?.meta?.languageCode === 'es-AR' && (
                              <span className="text-[9px] font-mono font-bold bg-sky-400 text-slate-950 px-1.5 py-0.5 rounded">ACTIVE</span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">Spanish (Argentina) • Rioplatense</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={handleLoadEsAr}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Load Español (AR)
                      </button>
                      <button
                        onClick={() => handleDownloadSpecific(DEFAULT_ARGENTINEAN_SPANISH_PACKET, 'argentineanSpanishLanguagePacket.json')}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Download Argentinean Spanish JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARCHITECTURE INFORMATION CARD */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white text-sm font-black">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  How the Universal Language Packet System Works
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="font-extrabold text-indigo-300">1. Total Independence</div>
                    <p className="leading-relaxed">
                      Every single piece of text the player reads—cards, choices, store items, stats, perks, trophies, and dialogues—is supplied exclusively through the active language packet.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="font-extrabold text-purple-300">2. Zero Text Without Packet</div>
                    <p className="leading-relaxed">
                      If no language packet is loaded, the game returns empty strings across all translation helpers, ensuring 100% compliance with language packet control.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="font-extrabold text-emerald-300">3. Universal Translation Ready</div>
                    <p className="leading-relaxed">
                      Anyone can download the UK English packet, translate the JSON values into any target language, and load it into the game instantly with zero code changes!
                    </p>
                  </div>
                </div>
              </div>

              {/* PACKET SPECIFICATIONS */}
              {activePacket && (
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    Current Packet Metadata & Breakdown
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase">Language</span>
                      <strong className="text-white text-sm">{activePacket.meta.languageName}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase">Locale Code</span>
                      <strong className="text-indigo-400 text-sm font-mono">{activePacket.meta.languageCode}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase">Total Keys</span>
                      <strong className="text-emerald-400 text-sm font-mono">
                        {Object.keys(activePacket.translations || {}).length.toLocaleString()}
                      </strong>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase">Format</span>
                      <strong className="text-amber-400 text-sm font-mono">{activePacket.meta.formatVersion}</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LOAD / IMPORT */}
          {activeTab === 'load' && (
            <div className="space-y-6">
              
              {/* QUICK LOAD OFFICIAL PACKETS */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-black uppercase text-slate-300">
                  Quick Load Official Packets
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleReset}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/60 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇬🇧</span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300">UK English</div>
                        <div className="text-[10px] text-slate-400 font-mono">5,105 Keys • Official</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-400 group-hover:underline">Load</span>
                  </button>

                  <button
                    onClick={handleLoadEsAr}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇦🇷</span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-sky-300">Español (Argentina)</div>
                        <div className="text-[10px] text-slate-400 font-mono">5,105 Keys • Official</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-sky-400 group-hover:underline">Cargar</span>
                  </button>
                </div>
              </div>

              {/* FILE UPLOAD ZONE */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center cursor-pointer space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40 group-hover:scale-110 transition-transform">
                  <FileJson className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Click to browse or drop language packet JSON
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts standard LanguagePacket JSON files (*.json)
                  </p>
                </div>
              </div>

              {/* PASTE RAW JSON */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-300">
                    Or Paste JSON Content Directly
                  </span>
                  <button
                    onClick={() => setPastedJson('')}
                    className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <textarea
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder='{"meta": {"languageCode": "en-GB", ...}, "translations": {"SYSTEM_CONFIRM": "Confirm", ...}}'
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleApplyPastedJson}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Upload className="w-4 h-4" />
                    Apply Pasted Packet
                  </button>
                </div>
              </div>

              {/* FEEDBACK STATUS */}
              {importStatus.type && (
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: KEY INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              
              {/* SEARCH & FILTERS BAR */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search any key or translated text (e.g. 'Pace', 'CARD_', 'STORE_')..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* CATEGORY CHIPS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {[
                    { id: 'ALL', label: 'All Keys' },
                    { id: 'SYSTEM', label: 'System & Menus' },
                    { id: 'STATS', label: 'Stats & Attributes' },
                    { id: 'POSITIONS', label: 'Positions & Roles' },
                    { id: 'STORE', label: 'Store Items' },
                    { id: 'BUSINESS', label: 'Businesses' },
                    { id: 'PERKS', label: 'Career Perks' },
                    { id: 'CARDS', label: 'Cards & Stories' },
                    { id: 'CHOICES', label: 'Choices & Events' },
                    { id: 'TROPHIES', label: 'Trophies & Awards' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id as CategoryFilter);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KEYS TABLE */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-800/80">
                  {paginatedKeys.length > 0 ? (
                    paginatedKeys.map(([k, v]) => (
                      <div
                        key={k}
                        className="px-4 py-2.5 flex items-start justify-between gap-4 hover:bg-slate-900/60 transition group text-xs font-mono"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-400 select-all truncate">{k}</span>
                            <button
                              onClick={() => handleCopyKey(k, String(v))}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition p-0.5"
                              title="Copy JSON pair"
                            >
                              {copiedKey === k ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-slate-300 text-xs font-sans mt-0.5 select-all break-words leading-relaxed">
                            {String(v)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No matching keys found in active packet.
                    </div>
                  )}
                </div>

                {/* PAGINATION BAR */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredKeys.length.toLocaleString()} items)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
                      >
                        Prev
                      </button>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-400" />
            <span>Active Packet: {activePacket?.meta.languageName || 'None'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
