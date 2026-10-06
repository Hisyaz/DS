import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Copy,
  Download,
  Trash2,
  X,
  Check,
  Search,
  Plus,
  Eye,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  Award,
  Compass,
} from 'lucide-react';
import {
  getInspectedItems,
  saveInspectedItems,
  recordInspectedText,
  removeInspectedItem,
  clearAllInspectedItems,
  exportInspectedItemsAsJson,
  exportInspectedItemsAsMarkdown,
  InspectedTranslationItem,
} from '../utils/translationInspectorSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  getCanonicalPosition,
  getCanonicalStat,
  getCanonicalPerk,
  getCanonicalClubName,
  getCanonicalManagerName,
  getCanonicalTrophyName,
} from '../utils/canonicalEntityResolver';

interface TranslationInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInspectModeActive: boolean;
  onToggleInspectMode: () => void;
  showToast?: (msg: string) => void;
}

export const TranslationInspectorModal: React.FC<TranslationInspectorModalProps> = ({
  isOpen,
  onClose,
  isInspectModeActive,
  onToggleInspectMode,
  showToast = () => {},
}) => {
  const { currentLanguage, t } = useLanguage();
  const [items, setItems] = useState<InspectedTranslationItem[]>([]);
  const [filterScreen, setFilterScreen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'audit_list' | 'manual_add' | 'canonical_check'>('audit_list');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Manual add form state
  const [manualText, setManualText] = useState('');
  const [manualScreen, setManualScreen] = useState('Wonderkid Profile Creator');
  const [manualNotes, setManualNotes] = useState('');

  // Canonical check test
  const [canonicalTestQuery, setCanonicalTestQuery] = useState('');

  const refreshItems = () => {
    setItems(getInspectedItems());
  };

  useEffect(() => {
    if (isOpen) {
      refreshItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const jsonStr = exportInspectedItemsAsJson();
    navigator.clipboard.writeText(jsonStr);
    setCopiedFormat('json');
    showToast('📋 Copied Untranslated Audit JSON to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyMarkdown = () => {
    const mdStr = exportInspectedItemsAsMarkdown();
    navigator.clipboard.writeText(mdStr);
    setCopiedFormat('markdown');
    showToast('📋 Copied Untranslated Markdown list to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadJson = () => {
    const jsonStr = exportInspectedItemsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawstar_untranslated_strings_${currentLanguage}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Downloaded translation audit file!');
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    recordInspectedText(manualText, manualScreen, currentLanguage, manualNotes);
    setManualText('');
    setManualNotes('');
    refreshItems();
    setActiveTab('audit_list');
    showToast('✨ Added text to translation audit list!');
  };

  const handleDeleteItem = (id: string) => {
    removeInspectedItem(id);
    refreshItems();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all recorded untranslated items?')) {
      clearAllInspectedItems();
      refreshItems();
      showToast('🗑️ Cleared translation audit list.');
    }
  };

  const uniqueScreens = Array.from(new Set(items.map((i) => i.screenContext)));

  const filteredItems = items.filter((item) => {
    const matchesScreen = filterScreen === 'all' || item.screenContext === filterScreen;
    const matchesSearch =
      !searchQuery.trim() ||
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.screenContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.suggestedKey && item.suggestedKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesScreen && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-amber-400/90 pixel-corners pixel-bevel-gold flex flex-col h-[94vh] sm:h-[88vh] shadow-2xl overflow-hidden text-slate-100">
        {/* HEADER BAR */}
        <div className="bg-slate-900/95 border-b-2 border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pixel-corners bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Wand2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-arcade text-sm sm:text-base font-black text-amber-300 uppercase tracking-wider">
                  TRANSLATION INSPECTOR & AUDIT TOOL
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-pixel text-[10px] border border-blue-500/40 uppercase">
                  Lang: {currentLanguage}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-retro">
                Track, log, and export untranslated texts, card descriptions, and popups to ensure 100% canonical consistency.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 pixel-corners bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition-colors shrink-0"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP STATUS & LIVE PICKER CONTROLLER */}
        <div className="bg-slate-900/60 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Live Inspector Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleInspectMode}
              className={`px-3.5 py-2 pixel-corners font-pixel text-xs font-black flex items-center gap-2 transition-all cursor-pointer border-2 ${
                isInspectModeActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 pixel-bevel-emerald shadow-lg animate-pulse'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:border-amber-400'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isInspectModeActive ? 'MAGIC INSPECTOR: ACTIVE (TAP TEXT IN-GAME)' : 'ACTIVATE MAGIC INSPECTOR'}</span>
            </button>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {isInspectModeActive
                ? 'Close this panel and click any text in the game to capture it directly!'
                : 'Click to enable tap-to-capture on any in-game screen.'}
            </span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 pixel-corners border border-slate-800 font-pixel text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('audit_list')}
              className={`px-3 py-1.5 pixel-corners font-bold transition-all cursor-pointer ${
                activeTab === 'audit_list' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audited List ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual_add')}
              className={`px-3 py-1.5 pixel-corners font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'manual_add' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Text</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('canonical_check')}
              className={`px-3 py-1.5 pixel-corners font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'canonical_check' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Canonical Check</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: AUDIT LIST & EXPORT ACTIONS */}
        {activeTab === 'audit_list' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Filter & Export Toolbar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search audited texts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                {uniqueScreens.length > 0 && (
                  <select
                    value={filterScreen}
                    onChange={(e) => setFilterScreen(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-300 py-1.5 px-2 rounded outline-none cursor-pointer"
                  >
                    <option value="all">All Screens ({items.length})</option>
                    {uniqueScreens.map((s) => (
                      <option key={s} value={s}>
                        {s} ({items.filter((i) => i.screenContext === s).length})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Action Buttons: Copy JSON & Export */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  disabled={items.length === 0}
                  className={`px-3 py-1.5 pixel-corners text-xs font-arcade font-black uppercase flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                    copiedFormat === 'json'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 pixel-bevel-gold disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  title="Copy formatted JSON list to paste and send to AI"
                >
                  {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'json' ? 'COPIED!' : 'COPY JSON FOR AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  disabled={items.length === 0}
                  className="px-2.5 py-1.5 pixel-corners bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-pixel flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Copy as Markdown table"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Markdown</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  disabled={items.length === 0}
                  className="px-2.5 py-1.5 pixel-corners bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-pixel flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Download JSON File"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="p-1.5 pixel-corners bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600 text-xs cursor-pointer transition-colors"
                    title="Clear All Recorded Items"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 pixel-corners bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-arcade text-sm font-bold text-slate-300 uppercase">
                    No untranslated items recorded yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md font-retro leading-relaxed">
                    Activate the <strong>Magic Inspector</strong> button above, then tap any text in the game,
                    or use the <strong>Add Text</strong> tab to log phrases that need translation.
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 pixel-corners p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-pixel font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-pixel font-black px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                          {item.screenContext}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          Lang: {item.activeLanguage}
                        </span>
                        {item.suggestedKey && (
                          <span className="text-[9px] font-mono bg-slate-950 text-amber-400/90 px-1.5 py-0.5 border border-slate-800 rounded">
                            Key: {item.suggestedKey}
                          </span>
                        )}
                      </div>

                      <div className="font-sans text-sm font-bold text-white leading-snug break-words">
                        "{item.originalText}"
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-400 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.originalText);
                          showToast(`Copied: "${item.originalText}"`);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-pixel rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 rounded cursor-pointer transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: MANUAL ADD FORM */}
        {activeTab === 'manual_add' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="font-arcade text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Manually Record Untranslated Text</span>
              </h3>
              <p className="text-xs text-slate-400 font-retro">
                Found a phrase, popup message, or card description that remains in English? Enter it here to add it to your exportable audit list.
              </p>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 max-w-2xl font-pixel">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Screen / Location:
                </label>
                <select
                  value={manualScreen}
                  onChange={(e) => setManualScreen(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Wonderkid Profile Creator">Wonderkid Profile Creator</option>
                  <option value="Player Development Panel">Player Development Panel</option>
                  <option value="Card Description">Card Description</option>
                  <option value="Career Hub">Career Hub</option>
                  <option value="Youth Season Dashboard">Youth Season Dashboard</option>
                  <option value="Match Day / Simulation">Match Day / Simulation</option>
                  <option value="Trophy Cabinet">Trophy Cabinet</option>
                  <option value="Contract / Agent Offer">Contract / Agent Offer</option>
                  <option value="Store / Champion Shop">Store / Champion Shop</option>
                  <option value="General Popup / Alert">General Popup / Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Exact Text Appearing in English:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Select your primary kicking foot. Weak foot begins at 0 ★."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Optional Notes / Desired Translation:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needs translation into Spanish (es-ES and es-AR)"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-gold rounded-lg shadow-lg cursor-pointer transition-all active:scale-95"
              >
                Add to Audit List
              </button>
            </form>
          </div>
        )}

        {/* TAB CONTENT 3: CANONICAL DICTIONARY VERIFIER */}
        {activeTab === 'canonical_check' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="font-arcade text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Canonical Vocabulary Consistency Check</span>
              </h3>
              <p className="text-xs text-slate-400 font-retro">
                DrawStar enforces that attributes, perks, positions, club names, managers, and trophy names
                are permanently tied to their canonical identifiers so translations and editor modifications stay 100% synchronized across the entire game.
              </p>
            </div>

            <div className="max-w-xl space-y-3 font-pixel">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Test Any Term (e.g. "finishing", "Striker", "hawk", "Real Madrid", "Ballon d'Or"):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter stat, position, perk, club, manager..."
                    value={canonicalTestQuery}
                    onChange={(e) => setCanonicalTestQuery(e.target.value)}
                    className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                  />
                  {canonicalTestQuery && (
                    <button
                      type="button"
                      onClick={() => setCanonicalTestQuery('')}
                      className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {canonicalTestQuery.trim() && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="text-amber-400 font-bold uppercase text-[11px] border-b border-slate-800 pb-1">
                    Canonical Resolver Output:
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Position Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalPosition(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Stat Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalStat(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Perk Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalPerk(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Club Name:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalClubName(canonicalTestQuery)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Manager Name:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalManagerName(canonicalTestQuery)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Trophy Name:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {getCanonicalTrophyName(canonicalTestQuery)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER INFO */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px]">
            Audited items are saved in your browser. Tap <strong>Copy JSON for AI</strong> to send the full list to the developer.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-pixel text-xs rounded pixel-corners cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
