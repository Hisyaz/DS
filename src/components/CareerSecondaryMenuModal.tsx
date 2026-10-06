import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  User,
  Briefcase,
  Globe,
  Settings,
  ChevronRight,
  Trophy,
  DollarSign,
  FileText,
  Heart,
  BarChart3,
  Sliders,
  TrendingUp,
  Save,
  Volume2,
  LogOut,
  Database,
  Award,
  Sparkles,
  ArrowLeft,
  Flame,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderArchive,
  ArrowRightLeft,
  Calendar,
  Layers,
} from 'lucide-react';
import { ProjectSyncModal } from './ProjectSyncModal';
import { PlayerCardData, AccountingState, ManagerState, StoreUpgradeItem } from '../types';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { FlagVector } from './FlagVectors';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { CareerTutorialWikiModal } from './CareerTutorialWikiModal';
import { useLanguage } from '../context/LanguageContext';

export type ConsoleDomainId = 'matchday' | 'development' | 'career' | 'lifestyle';
export type DrillDownLevel = 'hub' | 'domain' | 'subview';

export interface ConsoleDomainCard {
  id: ConsoleDomainId;
  label: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  primaryGradient: string;
  borderColor: string;
  accentColor: string;
  badgeText: string;
  quickStats: { label: string; value: string }[];
}

export interface DomainActionItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export interface CareerSecondaryMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  accounting?: AccountingState | null;
  manager?: ManagerState | null;
  seasonYear?: string;
  storeItems?: StoreUpgradeItem[];
  recentMatches?: SimulatedMatchResult[];
  // Existing systems callbacks
  onOpenWorldResults?: () => void;
  onOpenSaveSlots?: () => void;
  onOpenDatabaseViewer?: () => void;
  onOpenCareerSummary?: () => void;
  onOpenSoundtrack?: () => void;
  onOpenSettings?: () => void;
  onExitToMainMenu?: () => void;
  onOpenStore?: () => void;
  onOpenCard?: () => void;
  onOpenDevelopment?: () => void;
  onOpenCustomization?: () => void;
  onOpenTransfer?: () => void;
  onOpenParentAdvice?: () => void;
  onOpenYearlyAwards?: () => void;
  onUpdatePlayer?: (player: PlayerCardData) => void;
  onUpdateAccounting?: (accounting: AccountingState) => void;
  showToast?: (message: string) => void;
}

// Retro 8-bit synthetic audio feedback for console drill-down navigation
function playRetroMenuSound(type: 'move' | 'select' | 'back' | 'tab') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'tab') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'select') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'back') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

export const CareerSecondaryMenuModal: React.FC<CareerSecondaryMenuModalProps> = ({
  isOpen,
  onClose,
  player,
  accounting,
  manager,
  seasonYear = '2026/27',
  storeItems = [],
  recentMatches = [],
  onOpenWorldResults,
  onOpenSaveSlots,
  onOpenDatabaseViewer,
  onOpenCareerSummary,
  onOpenSoundtrack,
  onOpenSettings,
  onExitToMainMenu,
  onOpenStore,
  onOpenCard,
  onOpenDevelopment,
  onOpenCustomization,
  onOpenTransfer,
  onOpenParentAdvice,
  onOpenYearlyAwards,
  onUpdatePlayer,
  onUpdateAccounting,
  showToast,
}) => {
  const { t } = useLanguage();
  const isPro = isProfessionalPlayer(player);

  // 3-Layer Console Drill-Down State
  const [drillDownLevel, setDrillDownLevel] = useState<DrillDownLevel>('hub');
  const [activeDomainId, setActiveDomainId] = useState<ConsoleDomainId>('matchday');
  const [selectedSubView, setSelectedSubView] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Modals inside secondary menu
  const [isTutorialWikiOpen, setIsTutorialWikiOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);

  const gamepadPollingRef = useRef<number | null>(null);
  const lastGamepadActionTimeRef = useRef<number>(0);

  // Calculations
  const totalMatches = useMemo(() => {
    return (
      player.totalSeasonMatchesPlayed ||
      (player.seasonMatchesByPosition
        ? Object.values(player.seasonMatchesByPosition || {}).reduce((a, b) => a + b, 0)
        : 0)
    );
  }, [player]);

  const weeklyWageFormatted = useMemo(() => {
    const rawWage = accounting?.yearlySalary ? Math.round(accounting.yearlySalary / 52) : 1500;
    return `€${rawWage.toLocaleString()}/wk`;
  }, [accounting]);

  const bankSavingsFormatted = useMemo(() => {
    return `€${(accounting?.totalSavings || 25000).toLocaleString()}`;
  }, [accounting]);

  const chemistryVal = useMemo(() => {
    return Math.min(100, Math.max(0, player.chemistry ?? 78));
  }, [player.chemistry]);

  const fitnessVal = useMemo(() => {
    return Math.min(100, Math.max(0, player.fitness ?? 100));
  }, [player.fitness]);

  const unassignedPoints = (player.freeStatPoints || player.unassignedPoints || 0);

  const seasonGoals = useMemo(() => {
    const list: SimulatedMatchResult[] = recentMatches?.length ? recentMatches : (player as any).lastSimulatedMatches || [];
    return list.reduce((sum, m) => sum + (m.playerGoals || 0), 0);
  }, [recentMatches, player]);

  const seasonAssists = useMemo(() => {
    const list: SimulatedMatchResult[] = recentMatches?.length ? recentMatches : (player as any).lastSimulatedMatches || [];
    return list.reduce((sum, m) => sum + (m.playerAssists || 0), 0);
  }, [recentMatches, player]);

  const avgRating = useMemo(() => {
    const list: SimulatedMatchResult[] = recentMatches?.length ? recentMatches : (player as any).lastSimulatedMatches || [];
    const rated = list.filter((m) => typeof m.playerRating === 'number' && m.playerRating > 0);
    if (!rated.length) return '7.2';
    const sum = rated.reduce((s, m) => s + (m.playerRating || 7), 0);
    return (sum / rated.length).toFixed(1);
  }, [recentMatches, player]);

  // Level 1: The 4 Big Console Domain Cards Definition
  const domains: ConsoleDomainCard[] = useMemo(() => [
    {
      id: 'matchday',
      label: 'MATCHDAY & FIXTURES',
      tag: 'SCHEDULE & TOURNAMENTS',
      description: 'Fixtures calendar, global results, continental tournament brackets, option files, and match history.',
      icon: Calendar,
      primaryGradient: 'from-emerald-950 via-teal-950/70 to-slate-950',
      borderColor: 'border-emerald-500/80 hover:border-emerald-300',
      accentColor: 'text-emerald-400',
      badgeText: 'FIXTURES READY',
      quickStats: [
        { label: 'MATCHES', value: `${totalMatches}` },
        { label: 'FORM', value: `${avgRating} ★` },
        { label: 'SEASON', value: seasonYear },
      ],
    },
    {
      id: 'development',
      label: 'PLAYER & DEVELOPMENT',
      tag: 'ATTRIBUTES & TRAINING',
      description: 'Player passport card, stat training progress, perks, biometrics, customization, and career rulebook.',
      icon: Zap,
      primaryGradient: 'from-indigo-950 via-purple-950/70 to-slate-950',
      borderColor: 'border-purple-500/80 hover:border-purple-300',
      accentColor: 'text-purple-400',
      badgeText: unassignedPoints > 0 ? `+${unassignedPoints} STAT PTS` : 'TRAINED',
      quickStats: [
        { label: 'OVR', value: `${player.ovr}` },
        { label: 'POTENTIAL', value: `${player.potentialOvr || 88}` },
        { label: 'FITNESS', value: `${fitnessVal}%` },
      ],
    },
    {
      id: 'career',
      label: 'CLUB & CAREER',
      tag: 'CONTRACT & HARMONY',
      description: 'Club contract terms, weekly wage, agent directives, locker room chemistry, and transfer market interest.',
      icon: Briefcase,
      primaryGradient: 'from-amber-950 via-yellow-950/70 to-slate-950',
      borderColor: 'border-amber-500/80 hover:border-amber-300',
      accentColor: 'text-amber-400',
      badgeText: weeklyWageFormatted,
      quickStats: [
        { label: 'CLUB', value: (player.club || (isPro ? 'Free Agent' : 'Youth Academy')).slice(0, 12) },
        { label: 'CHEMISTRY', value: `${chemistryVal}%` },
        { label: 'AGENT', value: manager?.name ? 'ACTIVE' : 'NONE' },
      ],
    },
    {
      id: 'lifestyle',
      label: 'LIFESTYLE & ACHIEVEMENTS',
      tag: 'STORE & HONORS',
      description: 'Unique career store, property investments, Ballon d’Or awards gala, 5 save slots, and game settings.',
      icon: Trophy,
      primaryGradient: 'from-rose-950 via-pink-950/70 to-slate-950',
      borderColor: 'border-rose-500/80 hover:border-rose-300',
      accentColor: 'text-rose-400',
      badgeText: bankSavingsFormatted,
      quickStats: [
        { label: 'SAVINGS', value: bankSavingsFormatted },
        { label: 'AWARDS', value: 'GALA' },
        { label: 'SAVES', value: '5 SLOTS' },
      ],
    },
  ], [
    player,
    totalMatches,
    avgRating,
    seasonYear,
    unassignedPoints,
    fitnessVal,
    weeklyWageFormatted,
    isPro,
    chemistryVal,
    manager,
    bankSavingsFormatted,
  ]);

  // Level 2: Domain Action Items Catalog (Max 4 Spacious Cards Per Domain)
  const domainActionItems: Record<ConsoleDomainId, DomainActionItem[]> = useMemo(() => ({
    matchday: [
      {
        id: 'statistics',
        title: 'FIXTURES & PERFORMANCE LOG',
        tag: 'MATCH LOGS & RATINGS',
        description: 'Chronological match log, goals, assists, minutes, player match ratings, and key moment history.',
        icon: BarChart3,
        badge: `${seasonGoals}G • ${seasonAssists}A`,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        action: () => {
          setSelectedSubView('statistics');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'world_results',
        title: 'WORLD RESULTS & DRAWS',
        tag: 'LEAGUES, UCL & BRACKETS',
        description: 'Complete domestic league standings, UEFA Champions League brackets, world rankings, and cup draws.',
        icon: Globe,
        badge: 'LIVE RESULTS',
        badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400 animate-pulse',
        action: () => {
          setSelectedSubView('world_results');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'database',
        title: 'GLOBAL DATABASE & ROSTERS',
        tag: 'CLUBS, SQUADS & OPTION FILE',
        description: 'Interactive encyclopedia covering all licensed clubs, domestic leagues, player attributes, and formations.',
        icon: Database,
        badge: 'ALL LEAGUES',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        action: () => {
          setSelectedSubView('database');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'career_summary',
        title: 'CAREER HONORS & TROPHIES',
        tag: 'MILESTONES & CABINET',
        description: 'Review lifetime team trophies, Ballon d’Or awards, Golden Boot titles, and historic season archives.',
        icon: Trophy,
        badge: 'ARCHIVES',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        action: () => {
          if (onOpenCareerSummary) {
            onClose();
            onOpenCareerSummary();
          } else {
            setSelectedSubView('statistics');
            setDrillDownLevel('subview');
          }
        },
      },
    ],

    development: [
      {
        id: 'career_info',
        title: 'PLAYER CARD PASSPORT',
        tag: 'BIOGRAPHY & ATTRIBUTES',
        description: 'Complete inspect of player card, sub-position ratings, preferred foot, and positive/negative modifiers.',
        icon: User,
        badge: `${player.ovr} OVR`,
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        action: () => {
          setSelectedSubView('career_info');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'training',
        title: 'TRAINING & DEVELOPMENT',
        tag: 'STAT POINTS & ATTRIBUTES',
        description: 'Invest stat development points, train core attributes, manage career aging curve, and enhance club facilities.',
        icon: TrendingUp,
        badge: unassignedPoints > 0 ? `+${unassignedPoints} STAT PTS` : 'TRAINED',
        badgeColor: unassignedPoints > 0
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        action: () => {
          onClose();
          if (onOpenDevelopment) onOpenDevelopment();
        },
      },
      {
        id: 'customization',
        title: 'PLAYER CUSTOMIZATION',
        tag: 'KIT, BOOTS & CELEBRATION',
        description: 'Change shirt number, boots model, styling accessories, celebration animations, and nickname.',
        icon: Sliders,
        badge: `#${player.shirtNumber || player.number || 10}`,
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        action: () => {
          if (onOpenCustomization) {
            onClose();
            onOpenCustomization();
          } else {
            setSelectedSubView('customization');
            setDrillDownLevel('subview');
          }
        },
      },
      {
        id: 'tutorial_wiki',
        title: 'GAME MANUAL & RULES WIKI',
        tag: 'ENCYCLOPEDIA & GUIDES',
        description: 'Complete interactive encyclopedia explaining chemistry synergy, career stages, perks, and game mechanics.',
        icon: HelpCircle,
        badge: 'MANUAL',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        action: () => {
          setIsTutorialWikiOpen(true);
        },
      },
    ],

    career: [
      {
        id: 'contract',
        title: 'CONTRACT & FINANCES',
        tag: 'WAGE & CLAUSES',
        description: 'Current club contract, weekly salary terms, years remaining, buyout clause, and active offers.',
        icon: FileText,
        badge: weeklyWageFormatted,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        action: () => {
          setSelectedSubView('contract');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'agent',
        title: 'AGENT & STRATEGY',
        tag: 'REPRESENTATIVE DOSSIER',
        description: 'Representative skills, contract negotiation rating, commercial network, and career directives.',
        icon: Briefcase,
        badge: manager?.name ? 'REPRESENTED' : 'FREE AGENT',
        badgeColor: manager?.name ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-slate-700 text-slate-300 border-slate-600',
        action: () => {
          setSelectedSubView('agent');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'chemistry',
        title: 'LOCKER ROOM CHEMISTRY',
        tag: 'TEAM SPIRIT & MORALE',
        description: 'Dressing room harmony, manager trust, squad cohesion, and overflow chemistry bonus progression.',
        icon: Heart,
        badge: `${chemistryVal}% SPIRIT`,
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        action: () => {
          setSelectedSubView('chemistry');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'transfers',
        title: 'TRANSFER MARKET OFFERS',
        tag: 'BIDS & SCOUTING INTEREST',
        description: 'Review transfer offers from elite clubs, submit transfer requests, or explore international trials.',
        icon: ArrowRightLeft,
        badge: 'TRANSFER RADAR',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        action: () => {
          if (onOpenTransfer) {
            onClose();
            onOpenTransfer();
          } else {
            setSelectedSubView('contract');
            setDrillDownLevel('subview');
          }
        },
      },
    ],

    lifestyle: [
      {
        id: 'store',
        title: 'UNIQUE CAREER STORE',
        tag: 'UPGRADES & ASSETS',
        description: 'Purchase fitness recovery supplements, properties, luxury sports cars, and permanent career perks.',
        icon: DollarSign,
        badge: bankSavingsFormatted,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        action: () => {
          if (onOpenStore) {
            onClose();
            onOpenStore();
          } else {
            setSelectedSubView('economy');
            setDrillDownLevel('subview');
          }
        },
      },
      {
        id: 'yearly_awards',
        title: 'YEARLY AWARDS & BALLON D’OR',
        tag: 'GALA CEREMONY & WORLD XI',
        description: 'Annual Ballon d’Or voting gala, Continental Best Player, Golden Boy ranking, and World XI selection.',
        icon: Award,
        badge: 'TROPHY GALA',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        action: () => {
          setSelectedSubView('yearly_awards');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'save_slots',
        title: 'CAREER SAVE MANAGER',
        tag: '5 SLOTS & AUTO-SAVE',
        description: 'Manage 5 career save slots, quick save current progress, and export backup files.',
        icon: Save,
        badge: '5 SLOTS',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        action: () => {
          setSelectedSubView('save_slots');
          setDrillDownLevel('subview');
        },
      },
      {
        id: 'settings',
        title: 'SETTINGS, AUDIO & BACKUP',
        tag: 'JUKEBOX & ACCESSIBILITY',
        description: 'Chiptune soundtrack player, UI text scaling, colorblind filters, and offline project .ZIP sync.',
        icon: Settings,
        badge: 'SYSTEM',
        badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
        action: () => {
          setSelectedSubView('settings');
          setDrillDownLevel('subview');
        },
      },
    ],
  }), [
    seasonGoals,
    seasonAssists,
    player,
    unassignedPoints,
    weeklyWageFormatted,
    manager,
    chemistryVal,
    bankSavingsFormatted,
    onOpenCareerSummary,
    onClose,
    onOpenDevelopment,
    onOpenCustomization,
    onOpenTransfer,
    onOpenStore,
  ]);

  const currentDomainItems = useMemo(() => {
    return domainActionItems[activeDomainId] || [];
  }, [domainActionItems, activeDomainId]);

  // Back Navigation Handler for the 3-Layer Console Hierarchy
  const handleBack = useCallback(() => {
    playRetroMenuSound('back');

    if (confirmExit) {
      setConfirmExit(false);
      return;
    }

    if (drillDownLevel === 'subview') {
      setDrillDownLevel('domain');
      setSelectedSubView(null);
      return;
    }

    if (drillDownLevel === 'domain') {
      setDrillDownLevel('hub');
      return;
    }

    // At Level 1 (Hub) -> Close Modal
    onClose();
  }, [confirmExit, drillDownLevel, onClose]);

  // Keyboard navigation across Level 1 & Level 2
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmExit) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setConfirmExit(false);
          playRetroMenuSound('back');
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'b' || e.key === 'Backspace') {
        e.preventDefault();
        handleBack();
        return;
      }

      if (drillDownLevel === 'hub') {
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % 4);
          playRetroMenuSound('move');
        } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + 4) % 4);
          playRetroMenuSound('move');
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const targetDomain = domains[focusedIndex]?.id || 'matchday';
          setActiveDomainId(targetDomain);
          setDrillDownLevel('domain');
          setFocusedIndex(0);
          playRetroMenuSound('select');
        }
      } else if (drillDownLevel === 'domain') {
        const itemCount = currentDomainItems.length || 1;
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % itemCount);
          playRetroMenuSound('move');
        } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          playRetroMenuSound('move');
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const item = currentDomainItems[focusedIndex];
          if (item) {
            playRetroMenuSound('select');
            item.action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, confirmExit, drillDownLevel, focusedIndex, domains, currentDomainItems, handleBack]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDrillDownLevel('hub');
      setSelectedSubView(null);
      setFocusedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeDomain = domains.find((d) => d.id === activeDomainId) || domains[0];

  return (
    <div
      id="drawstar-console-modal"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950 text-white font-pixel select-none animate-in fade-in duration-150 safe-top safe-bottom safe-px"
    >
      {/* 32-Bit Scanline & Pitch Overlay */}
      {isPro ? (
        <div className="absolute inset-0 pixel-dither-pattern opacity-15 pointer-events-none" />
      ) : (
        <div className="absolute inset-0 pixel-pitch-stripes opacity-20 pointer-events-none" />
      )}
      <div className="absolute inset-0 pixel-scanlines opacity-40 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. UNIVERSAL MOBILE CONSOLE TOP BAR */}
      {/* ========================================================================= */}
      <header
        className={`relative z-20 shrink-0 bg-slate-900/95 border-b-2 ${
          isPro ? 'border-amber-500/80 pixel-bevel-gold' : 'border-emerald-500/80 pixel-bevel-emerald'
        } px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-2xl`}
      >
        {/* Left: Standardized Back Button */}
        <button
          id="console-back-button"
          type="button"
          onClick={handleBack}
          className={`px-3 sm:px-4 py-2 border-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md pixel-corners ${
            drillDownLevel === 'hub'
              ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-500/80 pixel-bevel-crimson'
              : 'bg-amber-950/90 hover:bg-amber-900 text-amber-200 border-amber-400 pixel-bevel-gold'
          }`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>
            {drillDownLevel === 'hub'
              ? 'EXIT CONSOLE [ESC]'
              : drillDownLevel === 'domain'
              ? 'BACK TO HUB'
              : `BACK TO ${activeDomain.label.split('&')[0].trim()}`}
          </span>
        </button>

        {/* Center: Title & Hierarchy Breadcrumb */}
        <div className="text-center min-w-0 flex-1 px-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            <h1 className="text-xs sm:text-base font-black uppercase tracking-wider text-white pixel-text-shadow truncate">
              {drillDownLevel === 'hub' && 'DRAWSTAR CAREER CONSOLE'}
              {drillDownLevel === 'domain' && activeDomain.label}
              {drillDownLevel === 'subview' && (
                currentDomainItems.find((i) => i.id === selectedSubView)?.title ||
                selectedSubView?.toUpperCase()
              )}
            </h1>
          </div>
          <p className="text-[10px] font-arcade text-slate-400 tracking-wider truncate hidden xs:block">
            {drillDownLevel === 'hub' && '4-DOMAIN DRILL-DOWN ARCHITECTURE • CHOOSE A CATEGORY'}
            {drillDownLevel === 'domain' && `${activeDomain.tag} • SELECT AN ACTION`}
            {drillDownLevel === 'subview' && 'FULL-SCREEN SPECIALIZED DEDICATED VIEW'}
          </p>
        </div>

        {/* Right: Quick Bio Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950/90 px-2.5 py-1 border border-slate-700/80 pixel-corners text-xs">
            <div
              className={`w-6 h-6 pixel-corners flex items-center justify-center font-black text-xs ${
                isPro
                  ? 'bg-amber-500 text-slate-950 border border-amber-300 pixel-bevel-gold'
                  : 'bg-emerald-500 text-slate-950 border border-emerald-300 pixel-bevel-emerald'
              }`}
            >
              {player.ovr}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-black text-white text-[10px] leading-tight truncate max-w-[100px]">
                {player.name}
              </div>
              <div className={`text-[9px] font-mono leading-none ${isPro ? 'text-amber-400' : 'text-emerald-400'}`}>
                {player.club ? player.club.slice(0, 10) : 'Free Agent'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY CONTENT: 3-LAYER VIEWPORT */}
      {/* ========================================================================= */}
      <main className="relative z-20 flex-1 overflow-y-auto smooth-scroll p-3 sm:p-6 flex flex-col">
        {/* ======================================================================= */}
        {/* LEVEL 1: THE 4 BIG HERO DOMAIN CONSOLE CARDS */}
        {/* ======================================================================= */}
        {drillDownLevel === 'hub' && (
          <div className="max-w-4xl mx-auto w-full my-auto flex flex-col gap-4">
            <div className="text-center space-y-1 mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 pixel-corners text-xs text-amber-300 font-mono">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>SELECT 1 OF 4 CORE CAREER DOMAINS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {domains.map((dom, idx) => {
                const Icon = dom.icon;
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => {
                      setFocusedIndex(idx);
                      setActiveDomainId(dom.id);
                      setDrillDownLevel('domain');
                      playRetroMenuSound('select');
                    }}
                    onMouseEnter={() => {
                      if (focusedIndex !== idx) {
                        setFocusedIndex(idx);
                        playRetroMenuSound('move');
                      }
                    }}
                    className={`relative p-4 sm:p-5 border-2 text-left transition-all cursor-pointer pixel-corners active:translate-y-1 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] ${
                      isFocused
                        ? `bg-gradient-to-br ${dom.primaryGradient} ${dom.borderColor} scale-[1.01] shadow-2xl pixel-focused ring-2 ring-amber-400`
                        : `bg-slate-900/90 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500 pixel-bevel-raised`
                    }`}
                  >
                    {/* Top Row: Icon + Domain Header + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 pixel-corners border-2 flex items-center justify-center shrink-0 shadow-md ${
                            isFocused
                              ? 'bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold'
                              : 'bg-slate-950 text-slate-200 border-slate-700 pixel-bevel-raised'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${dom.accentColor}`}>
                            {dom.tag}
                          </span>
                          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight pixel-text-shadow">
                            {dom.label}
                          </h2>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 pixel-corners text-[10px] font-mono font-bold bg-slate-950 text-amber-300 border border-amber-500/50 shrink-0">
                        {dom.badgeText}
                      </span>
                    </div>

                    {/* Middle: Clear Subtitle */}
                    <p className="text-xs text-slate-300 font-retro leading-relaxed my-2 line-clamp-2">
                      {dom.description}
                    </p>

                    {/* Bottom Row: Quick Stats & Enter Prompt */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        {dom.quickStats.map((st, sIdx) => (
                          <span key={sIdx} className="flex items-center gap-1">
                            <span className="text-slate-500 text-[9px] uppercase">{st.label}:</span>
                            <span className="font-bold text-white">{st.value}</span>
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
                        <span>OPEN</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Utility Quick Actions Bar (Quicksave, Project Sync, Title Screen) */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDomainId('lifestyle');
                    setSelectedSubView('save_slots');
                    setDrillDownLevel('subview');
                  }}
                  className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/70 pixel-bevel-emerald text-emerald-300 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>5 SAVE SLOTS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 pixel-bevel-raised text-slate-300 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                  <span>BACKUP .ZIP</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setConfirmExit(true)}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/70 pixel-bevel-crimson text-rose-300 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>EXIT TO MAIN MENU</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* LEVEL 2: DEDICATED DOMAIN VIEW (3 TO 4 LARGE ACTION CARDS) */}
        {/* ======================================================================= */}
        {drillDownLevel === 'domain' && (
          <div className="max-w-4xl mx-auto w-full my-auto flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-bold">[{activeDomain.label}]</span>
                <span>• {currentDomainItems.length} DEDICATED OPERATIONS</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
                [▲/▼ / TOUCH] SELECT AN ACTION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentDomainItems.map((item, idx) => {
                const Icon = item.icon;
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFocusedIndex(idx);
                      playRetroMenuSound('select');
                      item.action();
                    }}
                    onMouseEnter={() => {
                      if (focusedIndex !== idx) {
                        setFocusedIndex(idx);
                        playRetroMenuSound('move');
                      }
                    }}
                    className={`relative p-4 sm:p-5 border-2 text-left transition-all cursor-pointer pixel-corners active:translate-y-1 flex flex-col justify-between min-h-[130px] ${
                      isFocused
                        ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40 border-amber-400 pixel-bevel-gold scale-[1.01] shadow-2xl ring-2 ring-amber-400'
                        : 'bg-slate-900/90 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500 pixel-bevel-raised'
                    }`}
                  >
                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 pixel-corners border-2 flex items-center justify-center shrink-0 ${
                            isFocused
                              ? 'bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold'
                              : 'bg-slate-950 text-slate-200 border-slate-700 pixel-bevel-raised'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider block text-slate-400 font-mono">
                            {item.tag}
                          </span>
                          <h3 className="text-sm font-black text-white uppercase tracking-tight pixel-text-shadow">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 pixel-corners text-[10px] font-mono border shrink-0 ${item.badgeColor || 'bg-slate-950 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Middle: Description */}
                    <p className="text-xs text-slate-300 font-retro leading-relaxed my-2">
                      {item.description}
                    </p>

                    {/* Bottom: Enter Action */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 text-[10px]">EXECUTE OPERATION</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                        <span>SELECT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* LEVEL 3: DEDICATED FULL-SCREEN SUBVIEW */}
        {/* ======================================================================= */}
        {drillDownLevel === 'subview' && (
          <div className="max-w-4xl mx-auto w-full my-auto flex flex-col gap-4">
            <div className="bg-slate-900/90 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4 sm:p-6 shadow-2xl">
              {/* SUBVIEW: CAREER INFO */}
              {selectedSubView === 'career_info' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 border border-slate-800 pixel-corners space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl pixel-corners">
                        {player.ovr}
                      </div>
                      <div>
                        <div className="text-base font-black text-white">{player.name}</div>
                        <div className="text-emerald-400 font-mono">
                          {player.position} {player.subPosition ? `(${player.subPosition})` : ''} • Age {player.age || 17}
                        </div>
                        <div className="text-slate-400 font-mono">
                          {player.club || 'Youth Academy'} • {player.nationality?.name || 'International'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono pt-2 border-t border-slate-800">
                      <div className="p-2 bg-slate-900 pixel-corners">
                        <div className="text-slate-400 text-[10px]">POTENTIAL</div>
                        <div className="font-black text-amber-300">{player.potentialOvr || 88}</div>
                      </div>
                      <div className="p-2 bg-slate-900 pixel-corners">
                        <div className="text-slate-400 text-[10px]">PREFERRED FOOT</div>
                        <div className="font-black text-white">{player.preferredFoot || 'Right'}</div>
                      </div>
                      <div className="p-2 bg-slate-900 pixel-corners">
                        <div className="text-slate-400 text-[10px]">WEAK FOOT</div>
                        <div className="font-black text-white">★ {player.weakFootStars || 3}/5</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCard) onOpenCard();
                      }}
                      className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase pixel-bevel-cyan cursor-pointer"
                    >
                      OPEN COMPLETE PASSPORT CARD
                    </button>
                    {onOpenCareerSummary && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCareerSummary();
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase pixel-bevel-raised cursor-pointer"
                      >
                        CAREER HISTORY ARCHIVES
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SUBVIEW: WORLD RESULTS */}
              {selectedSubView === 'world_results' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    World Results covers domestic leagues, continental stages (UEFA Champions League, Europa League, Copa Libertadores), international tournaments, and competition DRAWS.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenWorldResults) onOpenWorldResults();
                      }}
                      className="p-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase pixel-bevel-gold cursor-pointer text-center"
                    >
                      OPEN COMPLETE WORLD RESULTS & DRAWS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenWorldResults) onOpenWorldResults();
                      }}
                      className="p-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black uppercase pixel-bevel-raised cursor-pointer text-center border border-amber-500/40"
                    >
                      VIEW COMPETITION DRAWS & POTS
                    </button>
                  </div>
                </div>
              )}

              {/* SUBVIEW: STATISTICS */}
              {selectedSubView === 'statistics' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners">
                      <div className="text-[10px] text-slate-400">MATCHES</div>
                      <div className="text-base font-black text-white">{totalMatches}</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners">
                      <div className="text-[10px] text-slate-400">GOALS</div>
                      <div className="text-base font-black text-emerald-400">{seasonGoals}</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners">
                      <div className="text-[10px] text-slate-400">ASSISTS</div>
                      <div className="text-base font-black text-sky-400">{seasonAssists}</div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners">
                      <div className="text-[10px] text-slate-400">AVG RATING</div>
                      <div className="text-base font-black text-amber-400">{avgRating}</div>
                    </div>
                  </div>

                  {onOpenCareerSummary && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCareerSummary();
                      }}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase pixel-bevel-emerald cursor-pointer"
                    >
                      OPEN CAREER RECORDS & TROPHY CABINET
                    </button>
                  )}
                </div>
              )}

              {/* SUBVIEW: CONTRACT */}
              {selectedSubView === 'contract' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 bg-slate-950 border border-slate-800 pixel-corners space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CURRENT CLUB:</span>
                      <span className="text-white font-bold">{player.club || 'Youth Academy'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">WEEKLY SALARY:</span>
                      <span className="text-amber-300 font-bold">{weeklyWageFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CONTRACT EXPIRY:</span>
                      <span className="text-white font-bold">{accounting?.contractYears || 2} Years remaining</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenTransfer) onOpenTransfer();
                    }}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase pixel-bevel-gold cursor-pointer"
                  >
                    VIEW TRANSFER MARKET OFFERS & PROPOSALS
                  </button>
                </div>
              )}

              {/* SUBVIEW: ECONOMY */}
              {selectedSubView === 'economy' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 bg-slate-950 border border-slate-800 pixel-corners space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">BANK BALANCE:</span>
                      <span className="text-emerald-400 font-bold">{bankSavingsFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ESTIMATED NET WORTH:</span>
                      <span className="text-white font-bold">
                        €{((accounting?.totalSavings || 25000) + (storeItems.length * 15000)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenStore) onOpenStore();
                    }}
                    className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black uppercase pixel-bevel-emerald cursor-pointer"
                  >
                    VISIT LIFESTYLE & EQUIPMENT STORE
                  </button>
                </div>
              )}

              {/* SUBVIEW: AGENT */}
              {selectedSubView === 'agent' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Your agent actively monitors transfer negotiations, elite trials, contract bonuses and commercial opportunities.
                  </p>
                  {onOpenParentAdvice ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenParentAdvice();
                      }}
                      className="w-full py-3 bg-violet-500 hover:bg-violet-400 text-slate-950 font-black uppercase pixel-bevel-raised cursor-pointer"
                    >
                      CONSULT CAREER ADVISORY
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase pixel-bevel-raised cursor-pointer"
                    >
                      RETURN TO MENU
                    </button>
                  )}
                </div>
              )}

              {/* SUBVIEW: CHEMISTRY */}
              {selectedSubView === 'chemistry' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 bg-slate-950 border border-slate-800 pixel-corners space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">TEAM SPIRIT:</span>
                      <span className="text-rose-400 font-bold">{chemistryVal}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">LOCKER ROOM HARMONY:</span>
                      <span className="text-emerald-400 font-bold">
                        {chemistryVal >= 90 ? 'EXCELLENT' : chemistryVal >= 70 ? 'STABLE' : 'FRAGILE'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase pixel-bevel-raised cursor-pointer"
                  >
                    RETURN TO DOMAIN
                  </button>
                </div>
              )}

              {/* SUBVIEW: CUSTOMIZATION */}
              {selectedSubView === 'customization' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Change your kit number, match boots, celebration animations, accessories, hairstyle, facial hair, tattoos, and personal player nickname.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCustomization) onOpenCustomization();
                    }}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black uppercase pixel-bevel-cyan cursor-pointer"
                  >
                    LAUNCH PLAYER CUSTOMIZATION STUDIO
                  </button>
                </div>
              )}

              {/* SUBVIEW: SAVE SLOTS */}
              {selectedSubView === 'save_slots' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    DrawStar features a robust 5-slot career save system. Manage your save files, create backups, or load alternate timelines.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSaveSlots) onOpenSaveSlots();
                    }}
                    className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black uppercase pixel-bevel-emerald cursor-pointer"
                  >
                    OPEN SAVE FILE MANAGER
                  </button>
                </div>
              )}

              {/* SUBVIEW: DATABASE */}
              {selectedSubView === 'database' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Browse complete option files, global team rosters, tactical formations, and custom league databases.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenDatabaseViewer) onOpenDatabaseViewer();
                    }}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black uppercase pixel-bevel-raised cursor-pointer"
                  >
                    LAUNCH DATABASE & OPTION FILE
                  </button>
                </div>
              )}

              {/* SUBVIEW: SOUNDTRACK */}
              {selectedSubView === 'soundtrack' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Control authentic procedural 8-bit/16-bit chiptune soundtracks, stadium crowd chants, and audio levels.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSoundtrack) onOpenSoundtrack();
                    }}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black uppercase pixel-bevel-raised cursor-pointer"
                  >
                    OPEN JUKEBOX AUDIO CONTROLS
                  </button>
                </div>
              )}

              {/* SUBVIEW: SETTINGS */}
              {selectedSubView === 'settings' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Configure UI font scaling, colorblind filters (Protanopia, Deuteranopia, Tritanopia), languages, and gameplay accessibility.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenSettings) onOpenSettings();
                      }}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase pixel-bevel-raised cursor-pointer"
                    >
                      OPEN SYSTEM SETTINGS & PREFERENCES
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenSoundtrack) onOpenSoundtrack();
                      }}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase pixel-bevel-raised cursor-pointer"
                    >
                      JUKEBOX SOUNDTRACK
                    </button>
                  </div>
                </div>
              )}

              {/* SUBVIEW: YEARLY AWARDS */}
              {selectedSubView === 'yearly_awards' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-300 font-retro leading-relaxed">
                    Review annual World Player of the Year results, Ballon d’Or galas, World XI nominations, and continental trophy rankings.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenYearlyAwards) onOpenYearlyAwards();
                    }}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black uppercase pixel-bevel-gold cursor-pointer"
                  >
                    ENTER AWARDS GALA
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. CONFIRM EXIT TO MAIN MENU DIALOG */}
      {/* ========================================================================= */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 pixel-bevel-crimson max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white">
              EXIT TO MAIN MENU?
            </h3>
            <p className="text-xs text-slate-300 font-retro">
              Ensure you have saved your career progress in the Save Manager before exiting to the DrawStar title screen.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase pixel-bevel-raised cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExit(false);
                  onClose();
                  if (onExitToMainMenu) onExitToMainMenu();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase pixel-bevel-crimson cursor-pointer"
              >
                CONFIRM EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BOTTOM STATUS FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-20 shrink-0 bg-slate-950 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="font-black">[▲/▼ / TOUCH]</span> NAVIGATE
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="font-black">[ENTER]</span> SELECT
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="font-black">[ESC / BACK]</span> RETURN
          </span>
        </div>

        <div className="text-slate-500 font-arcade hidden md:block">
          DRAWSTAR CONSOLE • 32-BIT DRILL-DOWN ENGINE
        </div>
      </footer>

      {/* TUTORIAL & GAME WIKI MODAL */}
      <CareerTutorialWikiModal
        isOpen={isTutorialWikiOpen}
        onClose={() => setIsTutorialWikiOpen(false)}
        showToast={showToast}
      />

      {/* PROJECT DOWNLOAD & SYNC MODAL */}
      <ProjectSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
};
