import React, { useState, useEffect, useRef } from 'react';
import { PlayerCardData } from '../types';
import { PRESET_PLAYERS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePickerButton, LanguagePickerModal } from './LanguagePickerModal';
import { CompactMusicPlayerButton } from './CompactMusicPlayerButton';
import { ProfileTopRightBadge } from './ProfileTopRightBadge';
import { GraphicSettingsModal } from './GraphicSettingsModal';
import { useAudio } from '../context/AudioContext';
import { useAutosaveSettings, AutosaveFrequency } from '../utils/careerSaveSystem';
import { useTestMode, useMagicTool } from '../utils/testModeSystem';
import { useGraphicSettings } from '../utils/graphicSettingsSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Footprints,
  Crown,
  Play,
  RotateCcw,
  Sliders,
  Settings,
  Shield,
  CreditCard,
  Users,
  Volume2,
  VolumeX,
  Globe,
  Gauge,
  Monitor,
  Save,
  Beaker,
  Radio,
  Check,
  Lock,
  Eye,
  Type,
  Database,
  ShoppingBag,
  Download,
  FolderArchive,
  Wand2,
  Crosshair,
  Layers,
} from 'lucide-react';
import { ProjectSyncModal } from './ProjectSyncModal';
import { DrawStarMarkIcon } from './DrawStarMarkIcon';
import { DrawStarHeaderLogo } from './DrawStarHeaderLogo';
import { triggerMagicInspect, triggerMagicAuditModal } from '../utils/translationAuditSystem';

import pitchBg from '../assets/images/pitch_background_1786468261881.jpg';
import cleatsTiedImg from '../assets/images/cleats_tied_1786468275388.jpg';
import worldCupTrophyImg from '../assets/images/world_cup_globe_1786468309877.jpg';
import flagPaintingImg from '../assets/images/flag_painting_1787087312357.jpg';
import tacticsBoardImg from '../assets/images/tactics_board_1786468286153.jpg';
import drawstarLogoImg from '../assets/images/drawstar_logo_1789138230089.jpg';

const PickLegendModal = React.lazy(() => import('./PickLegendModal').then(m => ({ default: m.PickLegendModal })));
import {
  getChampionCredits,
  subscribeToChampionCredits,
  getStoreCollection,
  subscribeToStoreCollection,
  chargeUniqueCareerStartCost,
} from '../utils/storeCollectionSystem';
import { PixelCoinSlotCareerButton } from './pixel/PixelCoinSlotCareerButton';
import {
  PixelBallIcon,
  PixelTrophyIcon,
  PixelCleatIcon,
  PixelCoinIcon,
  PixelCardsIcon,
  PixelShopIcon,
  PixelSlidersIcon,
  PixelGearIcon,
  PixelCrownIcon,
  PixelArrowRightIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelStarIcon,
  PixelSparklesIcon,
} from './pixel/PixelIcons';
import { PixelBadge } from './pixel/PixelBadge';

interface MainMenuProps {
  onStartNewGame: (alreadyPaid?: boolean) => void;
  onSelectLegendPreset?: (preset: PlayerCardData) => void;
  onStartEditor?: (editorTab?: 'character' | 'team' | 'card' | 'competitions') => void;
  onOpenOptionFile?: () => void;
  onOpenStore?: () => void;
  onOpenCardCollection?: () => void;
  showToast: (msg: string) => void;
  legendsList?: PlayerCardData[];
  hasSavedCareer?: boolean;
  savedCareerInfo?: string | null;
  onContinueCareer?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onSelectLegendPreset,
  onStartEditor,
  onOpenOptionFile,
  onOpenStore,
  onOpenCardCollection,
  showToast,
  legendsList = [],
  hasSavedCareer = false,
  savedCareerInfo,
  onContinueCareer,
}) => {
  const { t } = useLanguage();
  const {
    startMenuMusic,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    soundtrackMode,
    setSoundtrackMode,
    nextTrack,
  } = useAudio();
  const { autosaveSettings, updateAutosaveSettings } = useAutosaveSettings();
  const { isTestMode, setTestMode } = useTestMode();
  const { isMagicTool, setMagicTool, enableMagicToolWithTestMode } = useMagicTool();
  const { graphicSettings, updateGraphicSettings } = useGraphicSettings();

  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showGraphicSettingsModal, setShowGraphicSettingsModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showCardCollectionModal, setShowCardCollectionModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [championCredits, setChampionCredits] = useState<number>(() => getChampionCredits());
  const [optionsActiveTab, setOptionsActiveTab] = useState<'soundtrack' | 'settings' | 'autosave' | 'testmode' | 'sync'>('soundtrack');
  const [totalOwnedCards, setTotalOwnedCards] = useState<number>((): number => {
    try {
      const col = getStoreCollection();
      if (!col || typeof col !== 'object') return 0;
      const cardsObj: Record<string, unknown> = ('cards' in col && (col as any).cards && typeof (col as any).cards === 'object')
        ? (col as any).cards
        : (col as Record<string, unknown>);
      return Object.values(cardsObj).reduce<number>((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    setChampionCredits(getChampionCredits());
    const unsubscribe = subscribeToChampionCredits((creds) => {
      setChampionCredits(creds);
    });
    const unsubCol = subscribeToStoreCollection((col) => {
      try {
        if (!col || typeof col !== 'object') {
          setTotalOwnedCards(0);
          return;
        }
        const cardsObj: Record<string, unknown> = ('cards' in col && (col as any).cards && typeof (col as any).cards === 'object')
          ? (col as any).cards
          : (col as Record<string, unknown>);
        const total: number = Object.values(cardsObj).reduce<number>((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);
        setTotalOwnedCards(total);
      } catch {
        setTotalOwnedCards(0);
      }
    });
    return () => {
      unsubscribe();
      unsubCol();
    };
  }, []);

  const handleOpenStore = () => {
    if (onOpenStore) {
      onOpenStore();
    } else {
      setShowStoreModal(true);
    }
  };

  const handleOpenCardCollection = () => {
    if (onOpenCardCollection) {
      onOpenCardCollection();
    } else {
      setShowCardCollectionModal(true);
    }
  };

  const handleUniqueCareerStart = () => {
    const charged = chargeUniqueCareerStartCost();
    if (!charged) {
      showToast('⚠️ Could not deduct Champion Credit.');
      return;
    }
    onStartNewGame(true);
  };

  const hasStartedMenuMusicRef = useRef(false);
  useEffect(() => {
    if (!hasStartedMenuMusicRef.current) {
      hasStartedMenuMusicRef.current = true;
      startMenuMusic();
    }
  }, [startMenuMusic]);

  // Combine default legend presets and user saved custom legends
  const allLegends = [
    ...PRESET_PLAYERS.filter((p) => p.id !== 'prodigy'),
    ...legendsList.filter((l) => !PRESET_PLAYERS.some((p) => p.id === l.id)),
  ];

  const handlePickLegend = (legend: PlayerCardData) => {
    if (onSelectLegendPreset) {
      onSelectLegendPreset(legend);
      setShowLegendModal(false);
    } else {
      showToast(`⭐ Selected ${legend.name}!`);
    }
  };

  return (
    <React.Suspense fallback={null}>
      <div
        id="main-menu-root"
      className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-y-auto overscroll-y-auto touch-pan-y p-3 sm:p-6 md:p-8 pb-10 sm:pb-6 font-sans select-none"
    >
      {/* ================= 32-BIT RETRO ATMOSPHERE & PITCH BACKGROUND ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Crisp stadium turf image with visible green grass blades below */}
        <img
          src={pitchBg}
          alt="Stadium pitch turf at night"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-bottom filter brightness-[0.65] contrast-[1.2] saturate-[1.1] scale-105"
        />
        {/* 32-bit scanline and halftone dither grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        {/* Soft atmospheric gradient allowing pitch floodlights & grass to shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/75" />
        {/* Pitch contact turf shadow at very bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-950/70 to-transparent pointer-events-none" />
      </div>

      {/* ================= 32-BIT TOP ARCADE HEADER BAR ================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between py-2 shrink-0">
        {/* Left: 32-Bit DrawStar Arcade Logo (Expanded & Uncut, occupying top-left space without redundant subtitle) */}
        <div className="flex items-center">
          <DrawStarHeaderLogo />
        </div>

        {/* Right: 32-Bit All-Inclusive Icon Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Real-time Champion Credits (Icon + Balance) */}
          <div
            id="main-menu-credits-badge"
            className="h-9 px-2.5 bg-amber-950/90 border-2 border-amber-500/80 pixel-bevel-gold text-amber-300 font-pixel text-xs flex items-center gap-1.5 shadow-md select-none shrink-0"
            title={`Champion Credits: ${championCredits.toLocaleString()}`}
          >
            <PixelCoinIcon size={16} />
            <span className="font-arcade font-bold tracking-tight text-white">{championCredits.toLocaleString()}</span>
          </div>

          {/* Quick Collection Button (Icon-first) */}
          <button
            id="main-menu-collection-quick-btn"
            type="button"
            onClick={handleOpenCardCollection}
            className="h-9 px-2 sm:px-2.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border-2 border-cyan-500/80 hover:border-cyan-400 pixel-bevel-cyan flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title={`Card Collection (${totalOwnedCards} Owned Cards)`}
            aria-label="Card Collection"
          >
            <PixelCardsIcon size={16} className="text-cyan-400" />
            <span className="font-arcade text-[10px] text-cyan-200 hidden md:inline uppercase font-bold">
              {totalOwnedCards}
            </span>
          </button>

          {/* Quick Store Button (Icon-first) */}
          <button
            id="main-menu-store-quick-btn"
            type="button"
            onClick={handleOpenStore}
            className="h-9 w-9 sm:w-auto sm:px-2.5 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title="DrawStar Card Store (10 Credits / Pack)"
            aria-label="Card Store"
          >
            <PixelShopIcon size={16} className="text-amber-400" />
            <span className="font-arcade text-[10px] text-amber-300 hidden md:inline uppercase font-bold">
              {t('SHOP')}
            </span>
          </button>

          {/* Quick Settings Button (Icon-first) */}
          <button
            id="main-menu-settings-quick-btn"
            type="button"
            onClick={() => {
              setOptionsActiveTab('settings');
              setShowOptionsModal(true);
            }}
            className="h-9 w-9 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-slate-700/80 hover:border-slate-500 pixel-bevel-raised flex items-center justify-center cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title={t('Settings') || 'Game Settings & Preferences'}
            aria-label="Settings"
          >
            <PixelGearIcon size={16} className="text-slate-300" />
          </button>


          {/* Compact 32-Bit Soundtrack Operator Button & Popover */}
          <CompactMusicPlayerButton />

          {/* Language Selector */}
          <LanguagePickerButton />

          {/* Player Profile Badge */}
          <ProfileTopRightBadge showToast={showToast} embedded />
        </div>
      </header>

      {/* ================= MAIN INTERACTION AREA ================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 my-3 sm:my-auto py-2 sm:py-5 flex flex-col justify-center gap-4 sm:gap-6">
        
        {/* ================= RESUME ACTIVE CAREER (32-BIT PIXEL BANNER) ================= */}
        {hasSavedCareer && onContinueCareer && (
          <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-3 duration-300">
            <button
              type="button"
              onClick={onContinueCareer}
              className="w-full max-w-4xl p-4 sm:p-4.5 bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-emerald-500 pixel-bevel-emerald shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group relative overflow-hidden"
            >
              {/* Corner Pixel Accents */}
              <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 bg-emerald-600 text-white pixel-bevel-emerald flex items-center justify-center shrink-0 border-2 border-emerald-400 shadow-md">
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-pixel uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2 py-0.5">
                      {t('SAVED CAREER FOUND')}
                    </span>
                  </div>
                  <h3 className="font-arcade text-sm sm:text-base text-white uppercase tracking-wide truncate mt-1 drop-shadow">
                    {savedCareerInfo || t('Resume Active Footballer Journey')}
                  </h3>
                </div>
              </div>

              <div className="shrink-0">
                <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs tracking-wider uppercase border-2 border-emerald-400 pixel-bevel-emerald shadow-md flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>{t('RESUME')}</span>
                  <PixelArrowRightIcon size={14} />
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ================= 32-BIT MENU GRID (8 COLS FOR MODES / 4 COLS FOR MENU ACTIONS) ================= */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* ================= LEFT 8 COLS: 2 PRIMARY 32-BIT GAME MODES ================= */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            
            {/* 1. UNIQUE CAREER WITH DETAILED 32-BIT COIN-IN-SLOT ANIMATION */}
            <PixelCoinSlotCareerButton
              championCredits={championCredits}
              hasSavedCareer={hasSavedCareer}
              onContinueCareer={onContinueCareer}
              onStartCareer={handleUniqueCareerStart}
              onOpenStore={handleOpenStore}
              showToast={showToast}
              t={t}
            />

            {/* 2. PLAY AS LEGEND (32-BIT ARCADE GOLDEN PANEL) */}
            <button
              type="button"
              onClick={() => setShowLegendModal(true)}
              className="group relative min-h-[340px] sm:min-h-[400px] bg-gradient-to-b from-[#1c1305] via-[#120c03] to-[#0a0701] text-slate-100 border-2 border-amber-500/80 pixel-bevel-gold shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col justify-between p-5 sm:p-7 text-left overflow-hidden cursor-pointer hover:border-amber-400 hover:-translate-y-1 active:translate-y-0"
            >
              {/* Pixel Corner Brackets */}
              <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

              {/* Background Artwork with 32-bit pixel dither & fade */}
              <div className="absolute top-0 right-0 bottom-0 w-3/4 sm:w-2/3 pointer-events-none overflow-hidden z-0">
                <img
                  src={worldCupTrophyImg}
                  alt="Golden world cup trophy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.2] opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c1305] via-[#1c1305]/70 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b12_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
              </div>

              {/* Header Badges */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/90 text-amber-300 border border-amber-500/70 text-[10px] font-pixel uppercase tracking-wider pixel-bevel-gold">
                    <PixelCrownIcon size={13} />
                    <span>{t('IMMORTAL ICONS')}</span>
                  </span>
                  <span className="text-[10px] font-pixel text-amber-400/80">
                    {t('SLOT 02')}
                  </span>
                </div>

                <h2 className="font-arcade font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase leading-none tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {t('PLAY AS LEGEND')}
                </h2>

                <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed max-w-[280px]">
                  {t('Take control of an all-time legend. Relive historical campaigns, lift major silverware, and cement eternal glory.')}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-pixel text-amber-300/80">
                  <PixelSparklesIcon size={12} className="text-amber-400" />
                  <span>{t('100+ Icons • Era Campaigns')}</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="relative z-10 pt-4 flex items-center justify-between border-t border-amber-500/30 mt-4">
                <div className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-lg group-hover:brightness-110 transition-all">
                  <PixelTrophyIcon size={15} />
                  <span>{t('CHOOSE ICON')}</span>
                </div>

                <div className="w-9 h-9 bg-amber-950/90 border border-amber-500/70 text-amber-300 pixel-bevel-gold flex items-center justify-center transition-all group-hover:translate-x-1 shadow-sm">
                  <PixelArrowRightIcon size={15} />
                </div>
              </div>
            </button>
          </div>

          {/* ================= RIGHT 4 COLS: 32-BIT ARCADE ACTION TILES ================= */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
            {/* 2x2 Square Boxes Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              
              {/* 1. DEDICATED CARD COLLECTION BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-card-collection-btn"
                type="button"
                onClick={handleOpenCardCollection}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-cyan-500/80 hover:border-cyan-400 pixel-bevel-cyan shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-cyan-950 border border-cyan-500/70 pixel-bevel-cyan text-cyan-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelCardsIcon size={22} className="text-cyan-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-cyan-950 text-cyan-300 border border-cyan-500/60 pixel-bevel-cyan shrink-0">
                    {totalOwnedCards}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors leading-tight">
                    {t('CARD COLLECTION')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Deck & Archives')}
                  </p>
                </div>

                <div className="pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-pixel text-cyan-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('VIEW')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. CARD STORE BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-store-card-btn"
                type="button"
                onClick={handleOpenStore}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-amber-950 border border-amber-500/70 pixel-bevel-gold text-amber-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelShopIcon size={22} className="text-amber-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-amber-950 text-amber-300 border border-amber-500/60 pixel-bevel-gold shrink-0">
                    {t('10 CREDITS')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors leading-tight">
                    {t('CARD STORE')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('7 Pack Types')}
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between text-[10px] font-pixel text-amber-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('SHOP')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 3. EDITOR STUDIO BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-editor-btn"
                type="button"
                onClick={() => setShowEditorModal(true)}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-purple-500/80 hover:border-purple-400 pixel-bevel-raised shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-purple-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-purple-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-purple-950 border border-purple-500/70 pixel-bevel-raised text-purple-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelSlidersIcon size={22} className="text-purple-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/60 pixel-bevel-raised shrink-0">
                    {t('SANDBOX')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors leading-tight">
                    {t('EDITOR STUDIO')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Players & Teams')}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-500/30 flex items-center justify-between text-[10px] font-pixel text-purple-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('EDIT')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 4. OPTIONS & SETTINGS BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-options-btn"
                type="button"
                onClick={() => setShowOptionsModal(true)}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-slate-600 hover:border-slate-400 pixel-bevel-raised shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-slate-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-600 pixel-bevel-raised text-slate-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelGearIcon size={22} className="text-slate-300" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-slate-800 text-slate-300 border border-slate-600 pixel-bevel-raised shrink-0">
                    {t('PREFS')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-slate-300 transition-colors leading-tight">
                    {t('OPTIONS')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Audio & Visuals')}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-pixel text-slate-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('CONFIG')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* 5. DOWNLOAD GAME (ALL-IN-ONE OFFLINE ARCHIVE BANNER) */}
            <button
              id="main-menu-btn-download-sync"
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="w-full p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-slate-100 border-2 border-amber-400/90 pixel-bevel-gold shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
              title="Download complete game archive (.ZIP) for offline play or cross-account AI sync"
            >
              {/* Corner Pixel Accents */}
              <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-amber-950 border border-amber-400/80 pixel-bevel-gold text-amber-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-arcade font-black text-sm text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors truncate">
                      {t('DOWNLOAD GAME')}
                    </h3>
                    <span className="text-[9px] font-pixel uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold shrink-0">
                      {t('OFFLINE')}
                    </span>
                  </div>
                  <p className="text-[10px] font-pixel text-amber-200/80 mt-0.5 truncate">
                    {t('Archive .ZIP & Cross-Device AI Sync')}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[11px] font-black tracking-wider uppercase border border-amber-300 pixel-bevel-gold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shadow-sm">
                  <span>{t('GET ZIP')}</span>
                  <PixelArrowRightIcon size={12} />
                </span>
              </div>
            </button>
          </div>

        </div>
      </main>

      {/* ================= 32-BIT RETRO FOOTER ================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto py-2 flex items-center justify-between text-slate-400 text-[10px] font-pixel shrink-0 drop-shadow">
        <span>DRAWSTAR 32-BIT • FOOTBALL LEGACY 2026</span>
        <span className="hidden sm:inline">D-PAD / TAP: NAVIGATE • ENTER / TAP: SELECT</span>
        <span>SYSTEM: 32-BIT PIXEL ENGINE</span>
      </footer>

      {/* ================= CINEMATIC PICK LEGEND MODAL ================= */}
      <PickLegendModal
        isOpen={showLegendModal}
        onClose={() => setShowLegendModal(false)}
        onStartLegendCareer={handlePickLegend}
        showToast={showToast}
      />

      {/* ================= EDITOR SELECTOR MODAL ================= */}
      {showEditorModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowEditorModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-4 text-left relative overflow-hidden my-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950 uppercase">
                    {t('Editor Studio')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('Select the sandbox suite you want to customize')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditorModal(false);
                  if (onStartEditor) onStartEditor('character');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950 uppercase">{t('NAV_PLAYER_EDITOR')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Player stats & appearance')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEditorModal(false);
                  if (onStartEditor) onStartEditor('team');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950 uppercase">{t('Team & Kits')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Club names & kits')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEditorModal(false);
                  if (onStartEditor) onStartEditor('competitions');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950 uppercase">{t('Competitions')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Leagues & tournaments')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEditorModal(false);
                  if (onStartEditor) onStartEditor('card');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950 uppercase">{t('Card Deck Studio')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Custom perk cards')}</p>
                </div>
              </button>

              <button
                id="main-menu-btn-option-file"
                type="button"
                onClick={() => {
                  setShowEditorModal(false);
                  if (onOpenOptionFile) onOpenOptionFile();
                }}
                className="col-span-full p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-500/40 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center justify-between group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Option File Database</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        SINGLE SOURCE OF TRUTH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Unified persistent database • Players, Teams, Leagues, Competitions, Cards, Import/Export
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform mr-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTIONS & PREFERENCES MODAL ================= */}
      {showOptionsModal && (
        <div
          id="main-menu-options-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-mono select-none"
          onClick={() => setShowOptionsModal(false)}
        >
          {/* 32-Bit Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40 z-0" />

          <div
            id="main-menu-options-modal-content"
            className="bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-4 sm:p-6 max-w-xl w-full shadow-[0_0_35px_rgba(245,158,11,0.35)] space-y-3.5 text-left relative overflow-hidden my-auto max-h-[90vh] flex flex-col z-10 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - 32-Bit Retro Style */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 bg-slate-950 border border-amber-400 pixel-bevel-gold text-amber-400 flex items-center justify-center shadow-sm shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider pixel-text-shadow">
                      {t('Game Preferences')}
                    </h3>
                    <span className="px-1.5 py-0.2 bg-amber-950 border border-amber-500 text-amber-300 text-[9px] font-mono font-black uppercase">
                      SYSTEM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {t('Soundtrack, graphic settings, autosave & developer test mode')}
                  </p>
                </div>
              </div>
              <button
                id="main-menu-options-close-btn"
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="p-1.5 sm:p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 pixel-bevel-raised transition cursor-pointer active:scale-95"
                title={t('Close')}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 pixel-bevel-raised text-xs font-mono font-bold shrink-0 overflow-x-auto">
              <button
                id="options-tab-soundtrack"
                type="button"
                onClick={() => setOptionsActiveTab('soundtrack')}
                className={`flex-1 min-w-[75px] py-1.5 px-2 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  optionsActiveTab === 'soundtrack'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('Audio')}</span>
              </button>

              <button
                id="options-tab-settings"
                type="button"
                onClick={() => setOptionsActiveTab('settings')}
                className={`flex-1 min-w-[75px] py-1.5 px-2 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  optionsActiveTab === 'settings'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('SETTINGS_TAB_GRAPHICS') || 'GRAPHICS'}</span>
              </button>

              <button
                id="options-tab-autosave"
                type="button"
                onClick={() => setOptionsActiveTab('autosave')}
                className={`flex-1 min-w-[75px] py-1.5 px-2 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  optionsActiveTab === 'autosave'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('Autosave')}</span>
              </button>

              <button
                id="options-tab-testmode"
                type="button"
                onClick={() => setOptionsActiveTab('testmode')}
                className={`flex-1 min-w-[75px] py-1.5 px-2 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  optionsActiveTab === 'testmode'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Beaker className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('Test Mode')}</span>
                {isMagicTool ? (
                  <span className="text-[8px] font-mono px-1 bg-amber-400 text-slate-950 font-black rounded">✨ MAGIC</span>
                ) : isTestMode ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : null}
              </button>

              <button
                id="options-tab-sync"
                type="button"
                onClick={() => setOptionsActiveTab('sync')}
                className={`flex-1 min-w-[75px] py-1.5 px-2 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  optionsActiveTab === 'sync'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('Download & Sync')}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3.5 pt-1 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              
              {/* TAB 1: SOUNDTRACK & AUDIO */}
              {optionsActiveTab === 'soundtrack' && (
                <div className="space-y-3">
                  {/* Soundtrack Mute Toggle */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-900 text-slate-100 border border-slate-700 pixel-bevel-raised flex items-center justify-center shadow-sm">
                        {!isMuted ? (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white block">
                          {t('Soundtrack Audio')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {!isMuted ? t('Playing 16-bit retro synth chiptunes') : t('Audio is currently muted')}
                        </span>
                      </div>
                    </div>
                    <button
                      id="options-toggle-mute-btn"
                      type="button"
                      onClick={toggleMute}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                        !isMuted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500 pixel-bevel-emerald shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised'
                      }`}
                    >
                      {!isMuted ? t('ACTIVE') : t('MUTED')}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-200">
                      <span>{t('Master Music Volume')}</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round((volume ?? 0.65) * 100)}%
                      </span>
                    </div>
                    <input
                      id="options-volume-range-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume ?? 0.65}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-none appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* Soundtrack Playback Mode Preference */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('Soundtrack Mode')}</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">
                        {soundtrackMode === 'immersive' ? 'Contextual' : 'All Tracks Shuffle'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Option 1: Immersive */}
                      <button
                        id="soundtrack-mode-immersive-btn"
                        type="button"
                        onClick={() => setSoundtrackMode('immersive')}
                        className={`p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                          soundtrackMode === 'immersive'
                            ? 'bg-emerald-950/70 border-emerald-400 pixel-bevel-emerald text-emerald-200'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 pixel-bevel-raised'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase tracking-wider">🎧 {t('Immersive')}</span>
                            {soundtrackMode === 'immersive' && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {t('Plays soundtrack based on your active league & competition context (Bundesliga, Champions League, World Cup, etc.)')}
                          </p>
                        </div>
                        <span className="mt-2 text-[8px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500 px-1.5 py-0.2 self-start pixel-bevel-emerald">
                          Authentic Matchday
                        </span>
                      </button>

                      {/* Option 2: Play All */}
                      <button
                        id="soundtrack-mode-playall-btn"
                        type="button"
                        onClick={() => {
                          setSoundtrackMode('play_all');
                          nextTrack();
                        }}
                        className={`p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                          soundtrackMode === 'play_all'
                            ? 'bg-amber-950/70 border-amber-400 pixel-bevel-gold text-amber-200'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 pixel-bevel-raised'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase tracking-wider">🎲 {t('Play All')}</span>
                            {soundtrackMode === 'play_all' && (
                              <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {t('Plays all songs in random order across all leagues and countries regardless of which competition you are in.')}
                          </p>
                        </div>
                        <span className="mt-2 text-[8px] font-mono font-black uppercase bg-amber-950 text-amber-300 border border-amber-500 px-1.5 py-0.2 self-start pixel-bevel-gold">
                          Full Library Shuffle
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Language Selector trigger */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-900 text-slate-100 border border-slate-700 pixel-bevel-raised flex items-center justify-center shadow-sm">
                        <Globe className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white block">
                          {t('Language')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t('Pick commentary & menu locale')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsModal(false);
                        setShowLangModal(true);
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 pixel-bevel-raised text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                    >
                      {t('CHANGE')}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SETTINGS & DISPLAY */}
              {optionsActiveTab === 'settings' && (
                <div className="space-y-3">
                  {/* Font Size Selection */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('Font Size')}</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {graphicSettings.fontSize === 'sm' && 'Compact (17.5px)'}
                        {graphicSettings.fontSize === 'base' && 'Standard (19px • Default)'}
                        {graphicSettings.fontSize === 'lg' && 'Large (21px)'}
                        {graphicSettings.fontSize === 'xl' && 'Extra Large (23px)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                      {[
                        { id: 'sm' as const, label: t('FONT_SIZE_COMPACT') || 'Compact', sub: '17.5px' },
                        { id: 'base' as const, label: t('FONT_SIZE_STANDARD') || 'Standard', sub: '19px' },
                        { id: 'lg' as const, label: t('FONT_SIZE_LARGE') || 'Large', sub: '21px' },
                        { id: 'xl' as const, label: t('FONT_SIZE_EXTRA_LARGE') || 'Extra Large', sub: '23px' },
                      ].map((f) => {
                        const isSelected = graphicSettings.fontSize === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => updateGraphicSettings({ fontSize: f.id })}
                            className={`p-2 border text-center transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-amber-950 text-amber-300 border-amber-400 pixel-bevel-gold font-black shadow-sm'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 pixel-bevel-raised'
                            }`}
                          >
                            <span className="text-xs block font-bold">{f.label}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{f.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colorblind Mode Selection */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('Colorblind Mode')}</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {graphicSettings.colorblindMode.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      {[
                        { id: 'none' as const, label: 'Standard', desc: 'Default color palette' },
                        { id: 'protanopia' as const, label: 'Protanopia', desc: 'Red-weak color assistance' },
                        { id: 'deuteranopia' as const, label: 'Deuteranopia', desc: 'Green-weak color assistance' },
                        { id: 'tritanopia' as const, label: 'Tritanopia', desc: 'Blue-weak color assistance' },
                        { id: 'high_contrast' as const, label: 'High Contrast', desc: 'Maximum contrast boost' },
                      ].map((c) => {
                        const isSelected = graphicSettings.colorblindMode === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateGraphicSettings({ colorblindMode: c.id })}
                            className={`w-full p-2 border text-left flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-emerald-950/70 border-emerald-400 pixel-bevel-emerald text-emerald-200 font-bold'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 pixel-bevel-raised'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black uppercase tracking-wider text-white">{c.label}</span>
                              <p className="text-[10px] text-slate-400">{c.desc}</p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Mode */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t('Quality Preset')}</span>
                      </label>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase ${
                          graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                            ? 'text-purple-300 bg-purple-950 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                            : graphicSettings.quality === 'performance'
                            ? 'text-cyan-300 bg-cyan-950 border border-cyan-500 pixel-bevel-cyan'
                            : 'text-amber-300 bg-amber-950 border border-amber-500 pixel-bevel-gold'
                        }`}
                      >
                        {graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                          ? 'HIGH QUALITY • 120 FPS'
                          : graphicSettings.quality === 'performance'
                          ? 'PERFORMANCE • 60+ FPS'
                          : 'BALANCED • 60 FPS'}
                      </span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      {[
                        {
                          id: 'performance' as const,
                          title: t('QUALITY_PERFORMANCE_TITLE') || 'Performance Mode (Low-Spec & Mobile)',
                          badge: '60+ FPS • Ultra-Fast',
                          desc:
                            t('QUALITY_PERFORMANCE_DESC') ||
                            'Optimized flat barebones styling for maximum responsiveness. Strips expensive blurs, scanlines, drop shadows, confetti cascades, and heavy GPU animation loops.',
                          featureTags: ['Maximum FPS', 'Low Battery Usage', 'Zero Input Lag'],
                        },
                        {
                          id: 'balanced' as const,
                          title: t('QUALITY_BALANCED_TITLE') || 'Balanced Mode (32-Bit Arcade)',
                          badge: 'Standard 60 FPS',
                          desc:
                            t('QUALITY_BALANCED_DESC') ||
                            'Original 32-bit retro arcade aesthetic with stepped pixel bevels, CRT scanlines, and authentic audio-visual pacing.',
                          featureTags: ['Authentic 32-Bit', 'CRT Scanlines', 'Procedural Audio'],
                        },
                        {
                          id: 'high' as const,
                          title: t('QUALITY_HIGH_QUALITY_TITLE') || 'High Quality Mode (Cyber-Arcade Glass)',
                          badge: '120 FPS • Max Fidelity',
                          desc:
                            t('QUALITY_HIGH_QUALITY_DESC') ||
                            'Deluxe visual overhaul with volumetric neon ambient glow, holographic foil card shimmer, interactive 3D tilt, and high-density celebration particle cascades.',
                          featureTags: [
                            'Max Fidelity',
                            'Volumetric Neon & Bloom',
                            'Deluxe Particle FX',
                            'Holo Card Shimmer',
                          ],
                        },
                      ].map((q) => {
                        const isSelected =
                          graphicSettings.quality === q.id ||
                          (q.id === 'high' && graphicSettings.quality === 'high_quality');
                        return (
                          <button
                            key={q.id}
                            id={`main-menu-quality-opt-${q.id}`}
                            type="button"
                            onClick={() => {
                              updateGraphicSettings({ quality: q.id });
                              haptics.buttonPress();
                            }}
                            className={`w-full p-2.5 sm:p-3 border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                              isSelected
                                ? q.id === 'high'
                                  ? 'bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-2 border-purple-400 text-white pixel-bevel-gold shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                                  : q.id === 'performance'
                                  ? 'bg-cyan-950/70 border-2 border-cyan-400 text-white pixel-bevel-cyan shadow-md'
                                  : 'bg-amber-950/70 border-2 border-amber-400 text-white pixel-bevel-gold shadow-md'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 pixel-bevel-raised active:scale-[0.98]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                  {q.title}
                                </span>
                                <span
                                  className={`text-[8px] font-mono font-black px-1.5 py-0.2 border ${
                                    isSelected
                                      ? q.id === 'high'
                                        ? 'bg-purple-400 text-slate-950 border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                                        : q.id === 'performance'
                                        ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                        : 'bg-amber-400 text-slate-950 border-amber-300'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {q.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 mt-1 leading-tight">
                                {q.desc}
                              </p>

                              {/* Feature tags */}
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {q.featureTags.map((tag, tagIdx) => (
                                  <span
                                    key={tagIdx}
                                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${
                                      isSelected
                                        ? q.id === 'high'
                                          ? 'bg-purple-900/50 text-purple-200 border-purple-400/60 shadow-[0_0_6px_rgba(168,85,247,0.3)]'
                                          : q.id === 'performance'
                                          ? 'bg-cyan-900/40 text-cyan-300 border-cyan-500/60'
                                          : 'bg-amber-900/40 text-amber-300 border-amber-500/60'
                                        : 'bg-slate-950/70 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {isSelected ? (
                                <div
                                  className={`flex items-center gap-1 text-[10px] font-mono font-black px-2 py-1 ${
                                    q.id === 'high'
                                      ? 'text-purple-200 bg-purple-950 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                                      : q.id === 'performance'
                                      ? 'text-cyan-300 bg-cyan-950 border border-cyan-500 pixel-bevel-cyan'
                                      : 'text-amber-300 bg-amber-950 border border-amber-500 pixel-bevel-gold'
                                  }`}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>ACTIVE</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 hover:bg-slate-700 hover:text-white">
                                  <span>SELECT</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 bg-slate-900/80 p-2 border border-slate-800">
                      💡 {t('QUALITY_STATUS_NOTE') ||
                        'Performance Mode (ultra-responsive), Balanced (standard 32-bit arcade), and High Quality (volumetric neon bloom, holographic card shimmer, deluxe particle cascades) are all active with live instant switching.'}
                    </p>

                    <button
                      type="button"
                      id="main-menu-open-advanced-graphic-btn"
                      onClick={() => {
                        setShowOptionsModal(false);
                        setShowGraphicSettingsModal(true);
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 pixel-bevel-raised text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('OPEN_ADVANCED_GRAPHICS_MODAL') || 'OPEN ADVANCED GRAPHICS & HAPTIC STUDIO'}</span>
                    </button>

                    {/* DEVELOPER TEST MODE & MAGIC TOOL EMBEDDED IN SETTINGS */}
                    <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Beaker className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-white block">
                              {t('Developer Test Mode')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isTestMode ? t('Test mode is ACTIVE') : t('Turn on to unlock test tools & Magic Tool')}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="settings-toggle-testmode-btn"
                          onClick={() => setTestMode(!isTestMode)}
                          className={`px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                            isTestMode
                              ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised hover:text-white'
                          }`}
                        >
                          {isTestMode ? t('ACTIVE') : t('DISABLED')}
                        </button>
                      </div>

                      {/* Magic Tool Toggle in Settings */}
                      <div
                        className={`p-2.5 rounded border pixel-bevel-raised flex items-center justify-between transition-all ${
                          isTestMode
                            ? isMagicTool
                              ? 'bg-amber-950/40 border-amber-500/80 pixel-bevel-gold'
                              : 'bg-slate-900 border-slate-800'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Wand2 className={`w-3.5 h-3.5 shrink-0 ${isMagicTool ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <span className="text-[11px] font-black uppercase text-white block truncate">
                              {t('Magic Tool (UI Inspector)')}
                            </span>
                            <span className="text-[9px] text-slate-400 block truncate">
                              {!isTestMode
                                ? t('Disabled by default. Turn on Test Mode first.')
                                : isMagicTool
                                ? t('Active: Visible on Main Menu and in-game')
                                : t('Disabled by default. Toggle ON to enable.')}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!isTestMode}
                          onClick={() => {
                            if (!isTestMode) return;
                            const next = !isMagicTool;
                            setMagicTool(next);
                            showToast(
                              next
                                ? '✨ Magic Tool enabled! Floating inspector is now active.'
                                : 'Magic Tool disabled.'
                            );
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95 border shrink-0 ${
                            !isTestMode
                              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              : isMagicTool
                              ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold shadow-md'
                              : 'bg-slate-800 text-slate-400 border-slate-700 pixel-bevel-raised hover:text-white'
                          }`}
                        >
                          {isMagicTool ? t('ACTIVE') : t('DISABLED')}
                        </button>
                      </div>

                      <button
                        type="button"
                        id="main-menu-open-testmode-from-settings-btn"
                        onClick={() => {
                          setOptionsActiveTab('testmode');
                        }}
                        className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-400 pixel-bevel-raised text-amber-300 text-[11px] font-mono font-bold flex items-center justify-between transition cursor-pointer active:scale-95"
                      >
                        <span>{t('OPEN TEST MODE MENU')} →</span>
                        <span className="text-[10px] text-slate-400">
                          {isTestMode ? (isMagicTool ? '✨ MAGIC READY' : 'TEST MODE READY') : 'TEST MODE'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AUTOSAVE OPTIONS */}
              {optionsActiveTab === 'autosave' && (
                <div className="space-y-3">
                  {/* Autosave Enable/Disable Toggle */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-900 text-slate-100 border border-slate-700 pixel-bevel-raised flex items-center justify-center shadow-sm">
                        <Save className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white block">
                          {t('Automatic Career Saving')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {autosaveSettings.enabled
                            ? t('Career progress saves automatically at scheduled milestones')
                            : t('Autosave is disabled (manual saves only)')}
                        </span>
                      </div>
                    </div>
                    <button
                      id="options-toggle-autosave-btn"
                      type="button"
                      onClick={() => updateAutosaveSettings({ enabled: !autosaveSettings.enabled })}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                        autosaveSettings.enabled
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 pixel-bevel-cyan shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised'
                      }`}
                    >
                      {autosaveSettings.enabled ? t('ENABLED') : t('DISABLED')}
                    </button>
                  </div>

                  {/* Autosave Frequency Selector */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <span>{t('Autosave Frequency')}</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">
                        {autosaveSettings.frequency === 'every_6_months' && 'High Frequency'}
                        {autosaveSettings.frequency === 'every_season' && 'Standard (Recommended)'}
                        {autosaveSettings.frequency === 'every_2_seasons' && 'Low Frequency'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        {
                          id: 'every_6_months' as AutosaveFrequency,
                          title: 'Every 6 Months',
                          sub: 'Saves at Pre-Season, Mid-Season Break & Season End',
                          tag: 'Highest Safety',
                        },
                        {
                          id: 'every_season' as AutosaveFrequency,
                          title: 'Every Season (Default)',
                          sub: 'Saves at End of Season during Contract & Trophy Gala',
                          tag: 'Recommended',
                        },
                        {
                          id: 'every_2_seasons' as AutosaveFrequency,
                          title: 'Every 2 Seasons',
                          sub: 'Saves every 2 full seasons for lighter storage footprint',
                          tag: 'Minimal',
                        },
                      ].map((opt) => {
                        const isSelected = autosaveSettings.frequency === opt.id;
                        return (
                          <button
                            key={opt.id}
                            id={`autosave-freq-opt-${opt.id}`}
                            type="button"
                            onClick={() => updateAutosaveSettings({ frequency: opt.id })}
                            className={`w-full p-2.5 border text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-95 ${
                              isSelected
                                ? 'bg-cyan-950/70 border-cyan-400 pixel-bevel-cyan text-cyan-200'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 pixel-bevel-raised'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-white">{opt.title}</span>
                                <span
                                  className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 border ${
                                    isSelected
                                      ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {opt.tag}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 bg-slate-900/80 p-2 border border-slate-800">
                    💾 {t('Autosaves preserve your current career progression, statistics, transfer history, and store inventory across local career slots.')}
                  </p>
                </div>
              )}

              {/* TAB 4: DEVELOPER TEST MODE */}
              {optionsActiveTab === 'testmode' && (
                <div className="space-y-3">
                  {/* Test Mode Switch */}
                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-900 text-slate-100 border border-slate-700 pixel-bevel-raised flex items-center justify-center shadow-sm">
                        <Beaker className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white block">
                          {t('Developer Test Mode')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isTestMode
                            ? t('Test mode is ACTIVE: debug tools and stat modifiers are unlocked')
                            : t('Test mode is OFF: standard simulation rules apply')}
                        </span>
                      </div>
                    </div>
                    <button
                      id="options-toggle-testmode-btn"
                      type="button"
                      onClick={() => setTestMode(!isTestMode)}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                        isTestMode
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold shadow-md animate-pulse'
                          : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised'
                      }`}
                    >
                      {isTestMode ? t('ACTIVE') : t('DISABLED')}
                    </button>
                  </div>

                  {/* Magic Tool Switch (In Settings Tab 4) */}
                  <div
                    className={`p-3 border pixel-bevel-raised flex items-center justify-between transition-all ${
                      isMagicTool
                        ? 'bg-amber-950/40 border-amber-500/80 pixel-bevel-gold'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 flex items-center justify-center shadow-sm border ${
                          isMagicTool
                            ? 'bg-amber-500 text-slate-950 border-amber-300 pixel-bevel-gold shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised'
                        }`}
                      >
                        <Wand2 className={`w-4 h-4 ${isMagicTool ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-white block">
                            {t('Magic Tool (UI & Translation Inspector)')}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 text-[8px] font-mono font-black uppercase border ${
                              isMagicTool
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {isMagicTool ? 'ACTIVE (FLOATING TOOL)' : 'DISABLED BY DEFAULT'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {!isTestMode
                            ? t('Activate to enable Test Mode and launch the floating Magic Tool')
                            : isMagicTool
                            ? t('Magic Tool is ACTIVE: Floating inspector is visible on screen')
                            : t('Magic Tool is OFF: Toggle ON to show the floating inspector')}
                        </span>
                      </div>
                    </div>
                    <button
                      id="options-toggle-magictool-btn"
                      type="button"
                      onClick={() => {
                        if (!isTestMode) {
                          enableMagicToolWithTestMode();
                          showToast('✨ Test Mode & Magic Tool enabled! Floating inspector is now active.');
                        } else {
                          const next = !isMagicTool;
                          setMagicTool(next);
                          showToast(
                            next
                              ? '✨ Magic Tool enabled! Floating inspector is now active.'
                              : 'Magic Tool disabled.'
                          );
                        }
                      }}
                      className={`px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                        isMagicTool
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-700 pixel-bevel-raised hover:text-white'
                      }`}
                    >
                      {isMagicTool ? t('ACTIVE') : t('DISABLED')}
                    </button>
                  </div>

                  {/* Magic Tool In-Game Quick Actions */}
                  {isTestMode && isMagicTool && (
                    <div className="p-3 bg-amber-950/20 border border-amber-500/40 pixel-bevel-gold space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono font-bold">
                        <span>✨ Magic Tool Live Actions:</span>
                        <span className="text-[9px] text-slate-400">Floating widget is ready in bottom-right corner</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsModal(false);
                            triggerMagicInspect(true);
                            showToast('✨ Magic Inspect mode activated! Hover & click any text on screen.');
                          }}
                          className="py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-arcade text-xs font-black uppercase tracking-wider rounded border border-amber-300 shadow flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Crosshair className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Inspect Main Menu UI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsModal(false);
                            triggerMagicAuditModal(true);
                          }}
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-arcade text-xs font-black uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Open Audit Center</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feature Breakdown */}
                  <div className="p-3 bg-amber-950/40 border border-amber-500/60 pixel-bevel-gold space-y-2 text-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('Test Mode Capabilities')}</span>
                    </div>
                    <ul className="text-[10px] text-slate-300 space-y-1 list-disc pl-4 leading-relaxed font-mono">
                      <li>{t('Instant test dashboard in Persistent UI with full stat inspector')}</li>
                      <li>{t('Quick-advance and speed simulation toggles')}</li>
                      <li>{t('Custom card deck testing and attribute override tools')}</li>
                      <li>{t('Transfers, contract, and youth academy fast validation')}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 5: BACKUP & CROSS-ACCOUNT SYNC */}
              {optionsActiveTab === 'sync' && (
                <div className="space-y-3 font-mono">
                  <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-900/80 border-2 border-amber-500/80 pixel-bevel-gold space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          {t('Complete Project Archive & Saves')}
                        </h4>
                        <p className="text-[10px] text-slate-300">
                          {t('Export single .ZIP file to play offline on PC or continue developing in Google AI Studio on another account.')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsModal(false);
                        setShowSyncModal(true);
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4 text-slate-950 stroke-[3]" />
                      <span>{t('OPEN DOWNLOAD & SYNC CENTER')}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                    <p className="font-bold text-slate-300 uppercase">⚡ {t('How cross-account syncing works:')}</p>
                    <p>1. {t('Click above and download the single .ZIP project archive.')}</p>
                    <p>2. {t('Log into your other Google Account on AI Studio.')}</p>
                    <p>3. {t('Upload the ZIP into the chat prompt to continue development with full saves and source files intact!')}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer - 32-Bit Arcade Confirm */}
            <div className="pt-2.5 border-t-2 border-slate-800 flex items-center justify-end shrink-0">
              <button
                id="main-menu-options-done-btn"
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-mono text-xs uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-md cursor-pointer active:scale-95"
              >
                {t('Done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graphic Settings Modal Standalone Trigger */}
      <GraphicSettingsModal
        isOpen={showGraphicSettingsModal}
        onClose={() => setShowGraphicSettingsModal(false)}
      />

      {/* Language Picker Modal Triggered from Options */}
      <LanguagePickerModal isOpen={showLangModal} onClose={() => setShowLangModal(false)} />

      {/* Project Sync & Archive Exporter Modal */}
      <ProjectSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        showToast={showToast}
      />
    </div>
    </React.Suspense>
  );
};

