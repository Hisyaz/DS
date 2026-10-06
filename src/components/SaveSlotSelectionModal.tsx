import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePickerButton } from './LanguagePickerModal';
import {
  getAllSaveSlots,
  deleteSaveSlot,
  SaveSlotInfo,
  TOTAL_SAVE_SLOTS,
  downloadSaveSlotAsFile,
  importSaveSlotFromJson,
  exportSaveSlotToJson,
} from '../utils/careerSaveSystem';
import {
  getChampionCredits,
  checkUniqueCareerStartEligibility,
} from '../utils/storeCollectionSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  Save,
  Trash2,
  Play,
  RotateCcw,
  Plus,
  AlertTriangle,
  X,
  Clock,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  Gamepad2,
  Calendar,
  Shield,
  FileDown,
  ArrowRight,
  Copy,
  Loader2,
} from 'lucide-react';

export type SaveSlotModalMode = 'new_career' | 'continue_career' | 'save_manager';

interface SaveSlotSelectionModalProps {
  isOpen: boolean;
  mode: SaveSlotModalMode;
  activeSlotId?: number;
  isAlreadyPaid?: boolean;
  onSelectSlotForNewCareer: (slotId: number) => void;
  onSelectSlotForLoad: (slotId: number) => void;
  onSelectSlotForSave?: (slotId: number) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const SaveSlotSelectionModal: React.FC<SaveSlotSelectionModalProps> = ({
  isOpen,
  mode,
  activeSlotId = 1,
  isAlreadyPaid = false,
  onSelectSlotForNewCareer,
  onSelectSlotForLoad,
  onSelectSlotForSave,
  onClose,
  showToast,
}) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
  const [slotToOverwrite, setSlotToOverwrite] = useState<SaveSlotInfo | null>(null);
  const [slotChoiceModal, setSlotChoiceModal] = useState<SaveSlotInfo | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<SaveSlotInfo | null>(null);
  const [targetImportSlotId, setTargetImportSlotId] = useState<number | null>(null);
  const [recentlyImportedSlotId, setRecentlyImportedSlotId] = useState<number | null>(null);
  const [championCredits, setChampionCredits] = useState<number>(() => getChampionCredits());
  const [loadedFilePrompt, setLoadedFilePrompt] = useState<{
    slotId: number;
    playerName: string;
    ovr: number;
    position: string;
    clubOrCity: string;
    age?: number;
    seasonText?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSlots = () => {
    setSlots(getAllSaveSlots());
    setChampionCredits(getChampionCredits());
  };

  useEffect(() => {
    if (isOpen) {
      refreshSlots();
      setChampionCredits(getChampionCredits());
      setSlotToOverwrite(null);
      setSlotChoiceModal(null);
      setSlotToDelete(null);
      setTargetImportSlotId(null);
      setRecentlyImportedSlotId(null);
      setLoadedFilePrompt(null);
    }
  }, [isOpen]);

  const [exportingSlotId, setExportingSlotId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExportSlot = async (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.mediumTap();
    setExportingSlotId(slotId);
    try {
      const success = await downloadSaveSlotAsFile(slotId);
      if (success) {
        showToast(`📥 ${t('Slot {slotId} exported!', { slotId })}`);
      } else {
        showToast(`❌ ${t('Failed to export Slot {slotId}', { slotId })}`);
      }
    } catch {
      showToast(`❌ ${t('Failed to export Slot {slotId}', { slotId })}`);
    } finally {
      setExportingSlotId(null);
    }
  };

  const handleCopySlotData = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.lightTap();
    try {
      const json = exportSaveSlotToJson(slotId);
      if (json && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(json);
        showToast(`📋 ${t('Slot {slotId} raw save data copied to clipboard!', { slotId })}`);
      } else {
        showToast(`❌ ${t('Clipboard copy not supported on this device')}`);
      }
    } catch {
      showToast(`❌ ${t('Failed to copy save data')}`);
    }
  };

  const handleTriggerImport = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.lightTap();
    setTargetImportSlotId(slotId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || targetImportSlotId === null) return;

    const importedSlotId = targetImportSlotId;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importSaveSlotFromJson(importedSlotId, content);
        if (result.success) {
          haptics.success();
          showToast(`✅ ${result.message}`);
          refreshSlots();
          setRecentlyImportedSlotId(importedSlotId);

          const player = result.save?.player;
          const seasonCount = player?.careerHistory?.seasonsPlayed?.length || 0;
          const seasonText = seasonCount > 0 ? `Season ${seasonCount + 1}` : 'Debut Season';

          setLoadedFilePrompt({
            slotId: importedSlotId,
            playerName: player?.name || 'Imported Player',
            ovr: player?.ovr || 70,
            position: player?.position || 'ST',
            clubOrCity: player?.club || player?.startingCity || 'Career',
            age: player?.age,
            seasonText,
          });
        } else {
          haptics.errorBuzz();
          showToast(`❌ ${result.message}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmOverwrite = () => {
    if (!slotToOverwrite) return;
    const targetSlotId = slotToOverwrite.slotId;
    setSlotToOverwrite(null);
    if (mode === 'new_career') {
      const eligibility = checkUniqueCareerStartEligibility();
      if (!eligibility.canStart) {
        haptics.errorBuzz();
        showToast(
          eligibility.message ||
            '⚠️ Insufficient Champion Credits! Starting a Unique Career requires 1 Champion Credit. Visit the Store to view your balance.'
        );
        return;
      }
      onSelectSlotForNewCareer(targetSlotId);
    } else if (mode === 'save_manager' && onSelectSlotForSave) {
      onSelectSlotForSave(targetSlotId);
    }
  };

  const handleConfirmDelete = () => {
    if (!slotToDelete) return;
    deleteSaveSlot(slotToDelete.slotId);
    showToast(`🗑️ ${t('Slot {slotId} deleted.', { slotId: slotToDelete.slotId })}`);
    setSlotToDelete(null);
    refreshSlots();
  };

  const getTitle = () => {
    switch (mode) {
      case 'new_career':
        return t('NEW CAREER — SELECT SAVE SLOT');
      case 'continue_career':
        return t('CONTINUE CAREER — SELECT SAVE SLOT');
      case 'save_manager':
        return t('SAVE CAREER — MANAGE SLOTS');
      default:
        return t('CAREER SAVE SLOTS');
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'new_career':
        return t('Start a fresh journey in an empty slot, load a saved career, or upload a savefile from your computer.');
      case 'continue_career':
        return t('Select which isolated career instance you want to resume, or upload a savefile.');
      case 'save_manager':
        return t('Current active slot: Slot {slotId}. Select a slot to save your progress.', { slotId: activeSlotId });
      default:
        return t('5 independent, fully isolated Unique Career save slots.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden sm:p-4 md:p-6 sm:flex-row sm:items-center sm:justify-center sm:bg-black/85 sm:backdrop-blur-md animate-fadeIn"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* CONSOLE FULLSCREEN DASHBOARD ON MOBILE / MAX-W-4XL ON DESKTOP */}
      <div
        id="save-slot-modal-card"
        className="w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-4xl bg-slate-950 sm:bg-slate-900 border-0 sm:border-4 sm:border-slate-700 pixel-corners pixel-bevel-raised sm:shadow-[0_12px_0_0_#000] flex flex-col text-left relative overflow-hidden font-retro"
        style={{ imageRendering: 'pixelated' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines pointer-events-none z-10 opacity-30" />

        {/* 4 Corner Screws for 32-bit arcade chassis */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-black/60 border border-white/20 pointer-events-none z-30" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-black/60 border border-white/20 pointer-events-none z-30" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-black/60 border border-white/20 pointer-events-none z-30" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-black/60 border border-white/20 pointer-events-none z-30" />

        {/* CONSOLE HEADER BAR (Selector 1) */}
        <div className="relative z-20 bg-slate-950 sm:bg-slate-900/95 border-b-2 sm:border-b-4 border-slate-950 pixel-bevel-raised p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 pixel-corners bg-emerald-950 border-2 border-emerald-500 pixel-bevel-emerald flex items-center justify-center text-emerald-400 shadow-[0_3px_0_0_#000] shrink-0">
              {mode === 'continue_career' ? (
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : mode === 'new_career' ? (
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Save className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-pixel uppercase tracking-widest px-2 py-0.5 pixel-corners-sm bg-emerald-950 text-emerald-300 border-2 border-emerald-500 pixel-bevel-emerald shadow-[0_2px_0_0_#000]">
                  {mode === 'new_career' ? 'NEW CAREER' : mode === 'continue_career' ? 'RESUME GAME' : 'SAVE MANAGER'}
                </span>
                <span className="text-[9px] font-pixel uppercase tracking-wider px-2 py-0.5 pixel-corners-sm bg-cyan-950 text-cyan-300 border-2 border-cyan-800 pixel-bevel-cyan shadow-[0_2px_0_0_#000] hidden sm:inline">
                  5 ISOLATED SLOTS
                </span>
                {mode === 'new_career' && (
                  <span className="text-[9px] sm:text-[10px] font-pixel px-2 py-0.5 pixel-corners-sm bg-amber-950 text-amber-300 border-2 border-amber-500 pixel-bevel-gold flex items-center gap-1.5 shadow-[0_2px_0_0_#000]">
                    {isAlreadyPaid ? (
                      <span className="text-emerald-400 font-pixel">✅ 1 Coin Paid</span>
                    ) : (
                      <>
                        <span>🪙 Cost: 1 Credit</span>
                        <span className="text-amber-500/60">•</span>
                        <span>Bal: {championCredits.toLocaleString()}</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <h1
                id="save-slot-modal-title"
                className="text-xs sm:text-base font-pixel text-yellow-300 uppercase tracking-wide leading-tight truncate pixel-text-shadow"
              >
                {getTitle()}
              </h1>
              <p
                id="save-slot-modal-subtitle"
                className="text-[10px] sm:text-xs font-arcade text-slate-300 hidden sm:block truncate mt-0.5 tracking-wide"
              >
                {getSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguagePickerButton />
            <button
              id="save-slot-modal-btn-close"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 pixel-corners bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border-2 border-slate-700 hover:border-rose-600 pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center justify-center transition-all cursor-pointer"
              title={t('CLOSE')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK UPLOAD SAVEFILE STRIP (Selector 2) */}
        <div className="relative z-20 px-3 py-2 sm:px-4 sm:py-2 bg-cyan-950/70 border-b-2 border-cyan-800 pixel-bevel-sunken flex items-center justify-between gap-2 shrink-0 font-arcade text-xs text-cyan-200">
          <div className="flex items-center gap-2 text-cyan-200 min-w-0">
            <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs font-arcade tracking-wide">
              {t('Have a savefile on your device?')} <strong className="text-cyan-300 underline underline-offset-2">{t('Upload & play right away.')}</strong>
            </span>
          </div>
          <button
            onClick={(e) => {
              const firstEmpty = slots.find((s) => s.isEmpty);
              const target = firstEmpty ? firstEmpty.slotId : activeSlotId || 1;
              handleTriggerImport(target, e);
            }}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-pixel text-[9px] sm:text-[10px] uppercase tracking-wider pixel-corners-sm border-2 border-cyan-300 pixel-bevel-cyan shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t('Upload Savefile')}</span>
          </button>
        </div>

        {/* 5 CONSOLE SAVE BOXES (Selector 3: save slot cards container) */}
        <div className="relative z-20 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar smooth-scroll">
          {slots.map((slot) => {
            const isActive = slot.slotId === activeSlotId;
            const isJustImported = slot.slotId === recentlyImportedSlotId;

            return (
              <div
                key={slot.slotId}
                id={`save-slot-card-${slot.slotId}`}
                className={`pixel-corners border-2 transition-all p-3 sm:p-4 flex flex-col gap-2.5 relative shadow-[0_4px_0_0_#000] ${
                  slot.isEmpty
                    ? 'bg-slate-950/80 border-dashed border-slate-700 hover:border-emerald-400 hover:bg-slate-900/90 pixel-bevel-sunken'
                    : isJustImported
                    ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-400 pixel-bevel-emerald ring-2 ring-emerald-400'
                    : isActive
                    ? 'bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500 pixel-bevel-emerald'
                    : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 hover:border-cyan-600 pixel-bevel-raised'
                }`}
              >
                {/* Pixel Corner Rivets */}
                <div className="absolute top-1 left-1 w-1 h-1 bg-black/50 border border-white/20 pointer-events-none" />
                <div className="absolute top-1 right-1 w-1 h-1 bg-black/50 border border-white/20 pointer-events-none" />

                {/* 1. SLOT TOP STATUS LINE */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] sm:text-xs font-pixel uppercase px-2.5 py-1 pixel-corners-sm border-2 shadow-[0_2px_0_0_#000] ${
                        isJustImported
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 animate-pulse'
                          : isActive
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 pixel-bevel-emerald'
                          : 'bg-slate-800 text-yellow-300 border-slate-600 pixel-bevel-raised'
                      }`}
                    >
                      {t('SLOT {id}', { id: slot.slotId })}
                    </span>

                    {isActive && (
                      <span className="text-[9px] font-pixel uppercase bg-emerald-950 text-emerald-300 border-2 border-emerald-400 pixel-corners-sm pixel-bevel-emerald px-2 py-0.5 flex items-center gap-1.5 shadow-[0_2px_0_0_#000]">
                        <span className="w-1.5 h-1.5 bg-emerald-400 animate-ping" />
                        {t('ACTIVE')}
                      </span>
                    )}

                    {isJustImported && (
                      <span className="text-[9px] font-pixel uppercase bg-emerald-950 text-emerald-300 border-2 border-emerald-400 pixel-corners-sm pixel-bevel-emerald px-2 py-0.5 flex items-center gap-1 shadow-[0_2px_0_0_#000]">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {t('JUST LOADED')}
                      </span>
                    )}

                    {!slot.isEmpty && (
                      <span className="text-[10px] font-pixel bg-amber-950 text-amber-300 border-2 border-amber-500 pixel-corners-sm pixel-bevel-gold px-2.5 py-0.5 shadow-[0_2px_0_0_#000]">
                        {slot.position || 'ST'} • OVR {slot.ovr || 50}
                      </span>
                    )}
                  </div>

                  {/* Right side timestamp or Empty tag */}
                  <div className="text-[10px] sm:text-xs text-slate-400 font-arcade flex items-center gap-1.5">
                    {!slot.isEmpty && slot.formattedSavedAt ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">{slot.formattedSavedAt}</span>
                        <span className="sm:hidden">{slot.formattedSavedAt.split(',')[0]}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 font-pixel text-[9px] uppercase tracking-wider">{t('CARD_EMPTY_SLOT')}</span>
                    )}
                  </div>
                </div>

                {/* 2. MAIN BODY CONTENT */}
                {slot.isEmpty ? (
                  /* ================= EMPTY SLOT CONSOLE BOX ================= */
                  <div className="py-2 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 pixel-corners bg-slate-900 border-2 border-slate-700 pixel-bevel-sunken flex items-center justify-center text-slate-500 shrink-0">
                        <Plus className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div>
                        <h2 className="text-xs sm:text-sm font-pixel text-slate-300 uppercase tracking-wide pixel-text-shadow-sm">
                          {t('— Empty Save Slot —')}
                        </h2>
                        <p className="text-[10px] sm:text-xs font-arcade text-slate-400 mt-0.5">
                          {mode === 'new_career'
                            ? 'Ready for your brand new career journey.'
                            : 'No career data currently saved in this slot.'}
                        </p>
                      </div>
                    </div>

                    {/* BIG TACTILE BUTTON TO START HERE (IN NEW CAREER MODE) */}
                    {mode === 'new_career' && (
                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        <button
                          id={`wk-start-new-career-slot-${slot.slotId}-btn`}
                          type="button"
                          onClick={() => {
                            if (!isAlreadyPaid) {
                              const eligibility = checkUniqueCareerStartEligibility();
                              if (!eligibility.canStart) {
                                haptics.errorBuzz();
                                showToast(
                                  eligibility.message ||
                                    '⚠️ Insufficient Champion Credits! Starting a Unique Career requires 1 Champion Credit. Visit the Store to view your balance.'
                                );
                                return;
                              }
                            }
                            haptics.mediumTap();
                            onSelectSlotForNewCareer(slot.slotId);
                          }}
                          className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-pixel text-[11px] sm:text-xs uppercase tracking-wider pixel-corners border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-between gap-2 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>START NEW CAREER IN SLOT {slot.slotId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-pixel px-2 py-0.5 pixel-corners-sm bg-slate-950 text-amber-300 border border-amber-400 pixel-bevel-gold shadow-xs">
                              {isAlreadyPaid ? '✅ 1 Coin Paid' : '🪙 1 Credit'}
                            </span>
                            <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleTriggerImport(slot.slotId, e)}
                          className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border-2 border-slate-600 hover:border-cyan-500 pixel-corners-sm pixel-bevel-raised shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none text-[10px] font-pixel uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                          title={t('Import career file (.ftsave / .json) into Slot {id}', { id: slot.slotId })}
                        >
                          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Import File</span>
                        </button>
                      </div>
                    )}

                    {mode === 'save_manager' && onSelectSlotForSave && (
                      <button
                        type="button"
                        onClick={() => onSelectSlotForSave(slot.slotId)}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs uppercase tracking-wider pixel-corners border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4 stroke-[3]" />
                        <span>SAVE GAME TO SLOT {slot.slotId}</span>
                      </button>
                    )}

                    {mode === 'continue_career' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-arcade text-slate-500 italic">No saved career data to resume.</span>
                        <button
                          type="button"
                          onClick={(e) => handleTriggerImport(slot.slotId, e)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border-2 border-slate-700 hover:border-cyan-500 pixel-corners-sm pixel-bevel-raised text-[10px] font-pixel uppercase tracking-wider flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import Save</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= OCCUPIED SAVE SLOT CONSOLE BOX ================= */
                  <div className="space-y-2.5">
                    {/* Player Info Line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <h2 className="text-sm sm:text-base font-pixel text-yellow-300 uppercase tracking-wide pixel-text-shadow">
                          {slot.playerName}
                        </h2>
                        <div className="flex items-center gap-2.5 text-xs text-slate-300 font-arcade mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-200">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            {slot.clubOrCity || 'Independent'}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span>{t('Age')} {slot.age}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-emerald-300 font-bold">{slot.seasonText || t('Season 1')}</span>
                        </div>
                      </div>
                    </div>

                    {/* BIG CONSOLE ACTION BUTTONS */}
                    <div className="pt-0.5">
                      {mode === 'new_career' && (
                        /* NEW CAREER MODE ON OCCUPIED SLOT: PROVIDE PROMINENT OVERWRITE OR PLAY CHOICE */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            id={`wk-overwrite-slot-${slot.slotId}-btn`}
                            type="button"
                            onClick={() => setSlotToOverwrite(slot)}
                            className="w-full py-3 px-3 bg-amber-950/80 hover:bg-amber-900 border-2 border-amber-500 hover:border-amber-400 text-amber-200 hover:text-white pixel-corners-sm font-pixel text-[10px] sm:text-xs uppercase tracking-wider pixel-bevel-gold shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>START NEW (OVERWRITE SLOT {slot.slotId})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectSlotForLoad(slot.slotId)}
                            className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300 text-slate-950 font-pixel text-[10px] sm:text-xs uppercase tracking-wider pixel-corners-sm pixel-bevel-emerald shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>RESUME {slot.playerName}</span>
                          </button>
                        </div>
                      )}

                      {mode === 'continue_career' && (
                        /* CONTINUE CAREER MODE: HUGE RESUME BUTTON */
                        <button
                          id={`wk-load-slot-${slot.slotId}-btn`}
                          type="button"
                          onClick={() => onSelectSlotForLoad(slot.slotId)}
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-pixel text-xs sm:text-sm uppercase tracking-wider pixel-corners border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>RESUME CAREER ({slot.playerName})</span>
                        </button>
                      )}

                      {mode === 'save_manager' && onSelectSlotForSave && (
                        /* SAVE MANAGER MODE: SAVE BUTTON */
                        <button
                          type="button"
                          onClick={() => {
                            if (slot.slotId === activeSlotId) {
                              onSelectSlotForSave(slot.slotId);
                            } else {
                              setSlotToOverwrite(slot);
                            }
                          }}
                          className={`w-full py-3 px-4 pixel-corners-sm font-pixel text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                            slot.slotId === activeSlotId
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-2 border-emerald-300 pixel-bevel-emerald'
                              : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-2 border-amber-300 pixel-bevel-gold'
                          }`}
                        >
                          <Save className="w-4 h-4 stroke-[3]" />
                          <span>{slot.slotId === activeSlotId ? 'SAVE TO ACTIVE SLOT' : `OVERWRITE SLOT ${slot.slotId}`}</span>
                        </button>
                      )}
                    </div>

                    {/* 3. QUICK UTILITIES TOOLBAR (DOWNLOAD, IMPORT, DELETE) */}
                    <div className="pt-2 border-t-2 border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          disabled={exportingSlotId === slot.slotId}
                          onClick={(e) => handleExportSlot(slot.slotId, e)}
                          className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500 pixel-corners-sm pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer text-[10px] font-arcade uppercase"
                          title={t('Download / Export Slot {id} as .ftsave file', { id: slot.slotId })}
                        >
                          {exportingSlotId === slot.slotId ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>{exportingSlotId === slot.slotId ? 'Exporting...' : 'Export'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopySlotData(slot.slotId, e)}
                          className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500 pixel-corners-sm pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer text-[10px] font-arcade uppercase"
                          title={t('Copy raw JSON save data to clipboard', { id: slot.slotId })}
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleTriggerImport(slot.slotId, e)}
                          className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500 pixel-corners-sm pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer text-[10px] font-arcade uppercase"
                          title={t('Import / Replace Slot {id} from file', { id: slot.slotId })}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSlotToDelete(slot)}
                        className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-600 pixel-corners-sm pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer text-[10px] font-arcade uppercase"
                        title={t('Delete Save Slot {id}', { id: slot.slotId })}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".ftsave,.json"
          className="hidden"
        />

        {/* CONSOLE FOOTER BAR */}
        <div className="relative z-20 bg-slate-900 sm:bg-slate-900/95 border-t-2 sm:border-t-4 border-slate-950 pixel-bevel-raised p-3 sm:p-4 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
            <span className="font-pixel text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-wider">{t('{total} Isolated Save Slots', { total: TOTAL_SAVE_SLOTS })}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white pixel-corners-sm border-2 border-slate-600 pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none font-pixel text-[10px] uppercase tracking-wider transition-all cursor-pointer"
          >
            {t('CLOSE')}
          </button>
        </div>

        {/* ================= LOADED FILE PROMPT SUB-MODAL ================= */}
        {loadedFilePrompt && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-4 border-emerald-500 pixel-corners pixel-bevel-emerald p-4 sm:p-5 max-w-md w-full shadow-[0_8px_0_0_#000] space-y-3.5 text-left relative overflow-hidden font-retro">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-3">
                <div className="w-11 h-11 pixel-corners bg-emerald-950 text-emerald-400 border-2 border-emerald-500 pixel-bevel-emerald flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#000]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-pixel uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500 pixel-corners-sm px-2 py-0.5">
                    {t('SLOT {id} LOADED', { id: loadedFilePrompt.slotId })}
                  </span>
                  <h3 className="text-xs sm:text-sm font-pixel text-yellow-300 uppercase tracking-wide mt-1 pixel-text-shadow">
                    {t('CAREER READY TO PLAY!')}
                  </h3>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 pixel-corners-sm border-2 border-slate-800 pixel-bevel-sunken space-y-1">
                <p className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider">{t('Loaded Player')}</p>
                <p className="font-pixel text-white text-sm uppercase tracking-wide">
                  {loadedFilePrompt.playerName}
                </p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 font-arcade">
                  <span className="bg-amber-950 text-amber-300 border border-amber-500 pixel-corners-sm px-2 py-0.5 font-pixel text-[10px]">
                    {loadedFilePrompt.position} • OVR {loadedFilePrompt.ovr}
                  </span>
                  {loadedFilePrompt.age && <span>{t('Age')} {loadedFilePrompt.age}</span>}
                  <span>•</span>
                  <span className="text-slate-200">{loadedFilePrompt.clubOrCity}</span>
                </div>
              </div>

              <p className="text-xs font-arcade text-slate-300 leading-relaxed">
                {t('Savefile loaded successfully into Slot {id}. Would you like to play with this career right away?', { id: loadedFilePrompt.slotId })}
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const slotId = loadedFilePrompt.slotId;
                    setLoadedFilePrompt(null);
                    haptics.success();
                    onSelectSlotForLoad(slotId);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-pixel text-xs uppercase tracking-wider pixel-corners border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {t('PLAY RIGHT AWAY')}
                </button>

                <button
                  type="button"
                  onClick={() => setLoadedFilePrompt(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-pixel text-[10px] uppercase tracking-wider pixel-corners-sm border-2 border-slate-700 pixel-bevel-raised shadow-[0_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  {t('VIEW ALL SLOTS')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SLOT CHOICE SUB-MODAL ================= */}
        {slotChoiceModal && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-4 border-slate-700 pixel-corners pixel-bevel-raised p-4 sm:p-5 max-w-md w-full shadow-[0_8px_0_0_#000] space-y-3.5 text-left font-retro">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-3">
                <div className="w-10 h-10 pixel-corners bg-emerald-950 text-emerald-400 border-2 border-emerald-500 pixel-bevel-emerald flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-pixel text-yellow-300 uppercase tracking-wide pixel-text-shadow">
                    {t('SLOT {id} CAREER', { id: slotChoiceModal.slotId })}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-arcade text-slate-400 mt-0.5">
                    {t('Play this career or start a new character in this slot.')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 pixel-corners-sm border-2 border-slate-800 pixel-bevel-sunken space-y-1 text-xs">
                <p className="text-slate-400 font-arcade text-[10px]">{t('Saved Career:')}</p>
                <p className="font-pixel text-white text-xs sm:text-sm uppercase">{slotChoiceModal.playerName}</p>
                <p className="text-slate-300 font-arcade text-xs">
                  {slotChoiceModal.position} (OVR {slotChoiceModal.ovr}) • {t('Age')} {slotChoiceModal.age} • {slotChoiceModal.clubOrCity}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const slotId = slotChoiceModal.slotId;
                    setSlotChoiceModal(null);
                    onSelectSlotForLoad(slotId);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs uppercase tracking-wider pixel-corners-sm border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {t('PLAY THIS CAREER')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const slot = slotChoiceModal;
                    setSlotChoiceModal(null);
                    setSlotToOverwrite(slot);
                  }}
                  className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border-2 border-amber-500 pixel-corners-sm pixel-bevel-gold font-pixel text-[10px] uppercase tracking-wider shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  {t('OVERWRITE & START FRESH')}
                </button>

                <button
                  type="button"
                  onClick={() => setSlotChoiceModal(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-pixel text-[10px] uppercase pixel-corners-sm border border-slate-700 transition-all cursor-pointer"
                >
                  {t('CANCEL')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= OVERWRITE CONFIRMATION SUB-MODAL ================= */}
        {slotToOverwrite && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-4 border-amber-500 pixel-corners pixel-bevel-gold p-4 sm:p-5 max-w-md w-full shadow-[0_8px_0_0_#000] space-y-3 text-left font-retro">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-3">
                <div className="w-10 h-10 pixel-corners bg-amber-950 text-amber-400 border-2 border-amber-500 pixel-bevel-gold flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-pixel text-yellow-300 uppercase tracking-wide pixel-text-shadow">
                    {t('OVERWRITE CAREER?')}
                  </h3>
                  <p className="text-[10px] font-arcade text-amber-300/90 mt-0.5">
                    {t('Slot {id} already contains saved career data.', { id: slotToOverwrite.slotId })}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 pixel-corners-sm border-2 border-slate-800 pixel-bevel-sunken space-y-1 text-xs">
                <p className="text-slate-400 font-arcade text-[10px]">{t('Current Career in Slot {id}:', { id: slotToOverwrite.slotId })}</p>
                <p className="font-pixel text-white text-xs sm:text-sm uppercase">{slotToOverwrite.playerName}</p>
                <p className="text-slate-300 font-arcade text-xs">
                  {slotToOverwrite.position} (OVR {slotToOverwrite.ovr}) • {t('Age')} {slotToOverwrite.age} • {slotToOverwrite.clubOrCity}
                </p>
              </div>

              <p className="text-xs font-arcade text-slate-300 leading-relaxed">
                {t('This will permanently replace the existing career in Slot {id} with a new character. This action cannot be undone.', { id: slotToOverwrite.slotId })}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmOverwrite}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-pixel text-[10px] sm:text-xs uppercase tracking-wider pixel-corners-sm border-2 border-amber-300 pixel-bevel-gold shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  {t('CONFIRM & OVERWRITE')}
                </button>
                <button
                  type="button"
                  onClick={() => setSlotToOverwrite(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] uppercase pixel-corners-sm border border-slate-700 transition-all cursor-pointer"
                >
                  {t('CANCEL')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= DELETE CONFIRMATION SUB-MODAL ================= */}
        {slotToDelete && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-4 border-rose-500 pixel-corners pixel-bevel-crimson p-4 sm:p-5 max-w-md w-full shadow-[0_8px_0_0_#000] space-y-3 text-left font-retro">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-3">
                <div className="w-10 h-10 pixel-corners bg-rose-950 text-rose-400 border-2 border-rose-500 pixel-bevel-crimson flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-pixel text-rose-300 uppercase tracking-wide pixel-text-shadow">
                    {t('DELETE SAVE SLOT {id}?', { id: slotToDelete.slotId })}
                  </h3>
                  <p className="text-[10px] font-arcade text-rose-300/90 mt-0.5">
                    {t('This will permanently delete this career instance.')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 pixel-corners-sm border-2 border-slate-800 pixel-bevel-sunken space-y-1 text-xs">
                <p className="font-pixel text-white text-xs sm:text-sm uppercase">{slotToDelete.playerName}</p>
                <p className="text-slate-300 font-arcade text-xs">
                  {slotToDelete.position} (OVR {slotToDelete.ovr}) • {t('Age')} {slotToDelete.age} • {slotToDelete.clubOrCity}
                </p>
              </div>

              <p className="text-xs font-arcade text-slate-400 leading-relaxed">
                {t('Deleting Slot {id} will have zero effect on your other 4 save slots.', { id: slotToDelete.slotId })}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-pixel text-[10px] sm:text-xs uppercase tracking-wider pixel-corners-sm border-2 border-rose-300 pixel-bevel-crimson shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  {t('DELETE CAREER')}
                </button>
                <button
                  type="button"
                  onClick={() => setSlotToDelete(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] uppercase pixel-corners-sm border border-slate-700 transition-all cursor-pointer"
                >
                  {t('CANCEL')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
