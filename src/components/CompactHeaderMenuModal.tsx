import React, { useState } from 'react';
import {
  Menu,
  X,
  Database,
  ShoppingBag,
  Layers,
  Save,
  FolderHeart,
  Settings,
  Music,
  Globe,
  FileCode,
  User,
  Crown,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import {
  PixelGearIcon,
  PixelShopIcon,
  PixelCardsIcon,
  PixelCrownIcon,
} from './pixel/PixelIcons';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../utils/profileSystem';
import { ProfileAvatar } from './ProfileAvatar';

interface CompactHeaderMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  championCredits: number;
  activeSaveSlotId: number;
  careerMode: string;
  isEditorMode: boolean;
  isCharacterConfirmed: boolean;
  isTestMode: boolean;
  onOpenStore: () => void;
  onOpenCollection: () => void;
  onOpenLegendObjectives: () => void;
  onManualSave: () => void;
  onOpenSaveSlots: () => void;
  onOpenOptionFile: () => void;
  onOpenGraphicSettings: () => void;
  onOpenLanguagePicker: () => void;
  onOpenLanguagePacket: () => void;
  onOpenProfile: () => void;
  onOpenSoundtrack: () => void;
}

export const CompactHeaderMenuModal: React.FC<CompactHeaderMenuModalProps> = ({
  isOpen,
  onClose,
  championCredits,
  activeSaveSlotId,
  careerMode,
  isEditorMode,
  isCharacterConfirmed,
  isTestMode,
  onOpenStore,
  onOpenCollection,
  onOpenLegendObjectives,
  onManualSave,
  onOpenSaveSlots,
  onOpenOptionFile,
  onOpenGraphicSettings,
  onOpenLanguagePicker,
  onOpenLanguagePacket,
  onOpenProfile,
  onOpenSoundtrack,
}) => {
  const { t, languageInfo } = useLanguage();
  const { activeProfile } = useProfile();

  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    onClose();
    cb();
  };

  return (
    <div
      id="compact-header-menu-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md font-pixel select-none animate-in fade-in duration-200"
    >
      {/* Top Bar with Close */}
      <header className="px-4 py-3 bg-slate-900 border-b-2 border-amber-500/80 pixel-bevel-gold flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2">
          <Menu className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-black font-arcade uppercase tracking-wide text-amber-300">
            QUICK ACCESS MENU
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border-2 border-slate-700 hover:border-amber-400 pixel-bevel-raised flex items-center gap-1.5 cursor-pointer font-arcade text-xs font-black uppercase transition-all"
        >
          <X className="w-4 h-4" />
          <span>CLOSE</span>
        </button>
      </header>

      {/* Menu Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-lg w-full mx-auto">
        {/* Active Profile Header Card */}
        {activeProfile && (
          <div
            onClick={() => handleAction(onOpenProfile)}
            className="p-3.5 bg-slate-900/90 border-2 border-amber-500/70 pixel-bevel-gold flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <ProfileAvatar color={activeProfile.avatarColor} size="md" name={activeProfile.name} showGlow />
              <div>
                <span className="text-[10px] font-pixel text-amber-400/90 uppercase tracking-wider block">
                  ACTIVE PROFILE
                </span>
                <span className="font-arcade font-black text-sm text-white block">
                  {activeProfile.name}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-arcade font-black uppercase pixel-corners">
              MANAGE
            </span>
          </div>
        )}

        {/* Quick Career Actions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-pixel uppercase tracking-widest text-slate-400 font-bold block px-1">
            CAREER & STORAGE
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {careerMode === 'unique_career' && !isEditorMode && (
              <>
                <button
                  type="button"
                  onClick={() => handleAction(onManualSave)}
                  className="p-3 bg-emerald-950/80 hover:bg-emerald-900/90 border-2 border-emerald-500/70 pixel-bevel-emerald text-emerald-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
                >
                  <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="block leading-none">QUICK SAVE</span>
                    <span className="text-[9px] text-emerald-400/80 font-pixel">SLOT #{activeSaveSlotId}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onOpenSaveSlots)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised text-amber-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
                >
                  <FolderHeart className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="block leading-none">SAVE SLOTS</span>
                    <span className="text-[9px] text-slate-400 font-pixel">5 SLOTS</span>
                  </div>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handleAction(onOpenStore)}
              className="p-3 bg-amber-950/80 hover:bg-amber-900/90 border-2 border-amber-500/70 pixel-bevel-gold text-amber-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <PixelShopIcon size={18} className="text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">CARD STORE</span>
                <span className="text-[9px] text-amber-400 font-pixel">{championCredits.toLocaleString()} CREDITS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenCollection)}
              className="p-3 bg-cyan-950/80 hover:bg-cyan-900/90 border-2 border-cyan-500/70 pixel-bevel-cyan text-cyan-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <PixelCardsIcon size={18} className="text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">COLLECTION</span>
                <span className="text-[9px] text-cyan-400/80 font-pixel">DECK & ARCHIVE</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenOptionFile)}
              className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-blue-400 pixel-bevel-raised text-blue-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left col-span-2"
            >
              <Database className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">OPTION FILE DATABASE</span>
                <span className="text-[9px] text-slate-400 font-pixel">CUSTOM LEAGUES, CLUBS & ROSTERS</span>
              </div>
            </button>
          </div>
        </div>

        {/* System & Audio Settings */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-pixel uppercase tracking-widest text-slate-400 font-bold block px-1">
            SETTINGS & AUDIO
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenGraphicSettings)}
              className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised text-slate-200 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <PixelGearIcon size={18} color="#f59e0b" className="shrink-0" />
              <div className="truncate">
                <span className="block leading-none">GRAPHICS</span>
                <span className="text-[9px] text-amber-400/80 font-pixel">FPS & FIDELITY</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenSoundtrack)}
              className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-purple-400 pixel-bevel-raised text-purple-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <Music className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">SOUNDTRACK</span>
                <span className="text-[9px] text-slate-400 font-pixel">MUSIC & PLAYLISTS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenLanguagePicker)}
              className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-blue-400 pixel-bevel-raised text-slate-200 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">LANGUAGE</span>
                <span className="text-[9px] text-slate-400 font-pixel">{languageInfo.flag} {languageInfo.name}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenLanguagePacket)}
              className="p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-indigo-400 pixel-bevel-raised text-indigo-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left"
            >
              <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <span className="block leading-none">PACKET HUB</span>
                <span className="text-[9px] text-slate-400 font-pixel">CUSTOM TRANSLATION</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
