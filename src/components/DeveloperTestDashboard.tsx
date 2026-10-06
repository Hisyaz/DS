import React, { useState, useMemo } from 'react';
import {
  PlayerCardData,
  AccountingState,
  ManagerState,
  TrophyItem,
  CustomCard,
  CustomCardCategory,
  CustomCardTier,
  OutfieldDetailedStats,
} from '../types';
import {
  Sparkles,
  Sliders,
  DollarSign,
  HeartPulse,
  Activity,
  Trophy,
  Zap,
  Play,
  Layers,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Plus,
  Shield,
  Target,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingUp,
  Globe,
  Briefcase,
  Star,
  Users,
  Eye,
  X,
  Crown,
  FastForward,
  Wand2,
  Copy,
  Download,
  Crosshair,
  FileSpreadsheet,
} from 'lucide-react';
import { CareerPerk, CAREER_PERKS_REGISTRY } from '../utils/perksSystem';
import { safeGetItem } from '../utils/storageCleaner';
import {
  TranslationAuditItem,
  getAuditItems,
  runPredefinedScan,
  exportAuditAsJson,
  exportAuditAsCsv,
  clearAuditItems,
  triggerMagicInspect,
  triggerMagicAuditModal,
} from '../utils/translationAuditSystem';
import { useLanguage } from '../context/LanguageContext';
import { useMagicTool } from '../utils/testModeSystem';
import {
  getAllDefaultCustomCards,
  applyCustomCardToPlayer,
} from '../utils/cardDatabaseSystem';
import { calculatePlayerMarketValue } from '../utils/transferMarketSystem';
import { PenaltyQteModal } from './PenaltyQteModal';
import { PenaltyQteOutcome } from '../types/penaltyQte';
import { audioManager } from '../utils/audioSystem';
import {
  getStoredGlobalIconPoints,
  setStoredGlobalIconPoints,
  modifyStoredGlobalIconPoints,
} from '../utils/legendCareerSystem';
import { isTestModeEnabled } from '../utils/testModeSystem';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from '../utils/statCalculations';

interface DeveloperTestDashboardProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  accounting?: AccountingState;
  setAccounting?: React.Dispatch<React.SetStateAction<AccountingState>>;
  manager?: ManagerState;
  setManager?: React.Dispatch<React.SetStateAction<ManagerState>>;
  onTriggerKeyMatch?: (stageTitle: string, opponentName: string, opponentOvr: number) => void;
  onTriggerPerkUnlock?: (perk: CareerPerk | string) => void;
  onTriggerInjuryModal?: (injuryName: string, weeks: number) => void;
  onOpenChampionCelebration?: (data: any) => void;
  onTriggerRetirement?: () => void;
  onOpenCareerSummary?: () => void;
  onOpenSaudiOffer?: () => void;
  onOpenTransferOffer?: () => void;
  onOpenSpecialChoiceModal?: (clubIds?: string[]) => void;
  onOpenSpecialSigningChain?: (clubId: string) => void;
  onOpenSpecialRetryModal?: (clubId: string) => void;
  onOpenCallUp?: () => void;
  onOpenCardEditor?: () => void;
  showToast: (msg: string) => void;
  onClose?: () => void;
}

type TestTab = 'player' | 'resources' | 'key_match' | 'trophies' | 'events' | 'cards' | 'magic_tool';

export const DeveloperTestDashboard: React.FC<DeveloperTestDashboardProps> = ({
  player,
  onUpdatePlayer,
  accounting,
  setAccounting,
  manager,
  setManager,
  onTriggerKeyMatch,
  onTriggerPerkUnlock,
  onTriggerInjuryModal,
  onOpenChampionCelebration,
  onTriggerRetirement,
  onOpenCareerSummary,
  onOpenSaudiOffer,
  onOpenTransferOffer,
  onOpenSpecialChoiceModal,
  onOpenSpecialSigningChain,
  onOpenSpecialRetryModal,
  onOpenCallUp,
  onOpenCardEditor,
  showToast,
  onClose,
}) => {
  const { currentLanguage } = useLanguage();
  const { isMagicTool, setMagicTool } = useMagicTool();
  const [activeTab, setActiveTab] = useState<TestTab>('player');
  const [magicAuditItems, setMagicAuditItems] = useState<TranslationAuditItem[]>(() => getAuditItems());
  const [magicSearch, setMagicSearch] = useState('');
  const [magicCategory, setMagicCategory] = useState<string>('all');
  const [magicCopied, setMagicCopied] = useState<string | null>(null);

  // Custom Match Builder state
  const [customStageTitle, setCustomStageTitle] = useState('UEFA Champions League Final');
  const [customOpponentName, setCustomOpponentName] = useState('Real Madrid');
  const [customOpponentOvr, setCustomOpponentOvr] = useState(89);

  // Custom Trophy state
  const [newTrophyName, setNewTrophyName] = useState('');
  const [newTrophyCategory, setNewTrophyCategory] = useState<'domestic' | 'continental' | 'international' | 'individual' | 'youth'>('continental');
  const [newTrophyYear, setNewTrophyYear] = useState(new Date().getFullYear().toString());

  // Card Drawer state
  const [cardCategoryFilter, setCardCategoryFilter] = useState<string>('all');
  const [cardTierFilter, setCardTierFilter] = useState<string>('all');
  const [cardSearchQuery, setCardSearchQuery] = useState<string>('');
  const [selectedCardForTest, setSelectedCardForTest] = useState<CustomCard | null>(null);

  // Custom Money Input
  const [customCashInput, setCustomCashInput] = useState<string>('1000000');
  const [customPointsInput, setCustomPointsInput] = useState<string>('10');

  // Custom Injury state
  const [customInjuryName, setCustomInjuryName] = useState('Grade II Hamstring Strain');
  const [customInjuryWeeks, setCustomInjuryWeeks] = useState(4);

  // Selected Perk for Event Trigger
  const [selectedPerkId, setSelectedPerkId] = useState<string>(CAREER_PERKS_REGISTRY[0]?.id || 'iron_body');

  // Penalty QTE Sandbox State
  const [isPenaltyQteTestOpen, setIsPenaltyQteTestOpen] = useState<boolean>(false);
  const [testGkOvr, setTestGkOvr] = useState<number>(84);
  const [testGkName, setTestGkName] = useState<string>('Thibaut Courtois');
  const [testOpponentTeam, setTestOpponentTeam] = useState<string>('Real Madrid');
  const [testIsShootout, setTestIsShootout] = useState<boolean>(false);
  const [lastPenaltyOutcome, setLastPenaltyOutcome] = useState<PenaltyQteOutcome | null>(null);

  // All Cards from Storage / Defaults
  const allCards = useMemo(() => {
    try {
      const stored = safeGetItem('footballer_custom_cards_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored cards', e);
    }
    return getAllDefaultCustomCards();
  }, []);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (cardCategoryFilter !== 'all') {
        const cat = card.category.toLowerCase();
        if (cardCategoryFilter === 'parents' && !(cat === 'parents' || cat === 'parent')) return false;
        if (cardCategoryFilter === 'life' && !(cat === 'life' || cat === 'lifestyle')) return false;
        if (cardCategoryFilter !== 'parents' && cardCategoryFilter !== 'life' && cat !== cardCategoryFilter) return false;
      }
      if (cardTierFilter !== 'all' && card.tier !== cardTierFilter) return false;
      if (cardSearchQuery.trim()) {
        const q = cardSearchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesDesc = (card.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [allCards, cardCategoryFilter, cardTierFilter, cardSearchQuery]);

  // Player OVR helper updater
  const handleDirectOvrChange = (newOvr: number) => {
    const clamped = Math.max(40, Math.min(99, newOvr));
    const delta = clamped - (player.ovr || 60);

    const updated = { ...player, ovr: clamped };
    if (updated.stats) {
      const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
      if (isGk && updated.stats.gkDetailed) {
        Object.keys(updated.stats.gkDetailed).forEach((k) => {
          const cur = (updated.stats!.gkDetailed as any)[k] || 50;
          (updated.stats!.gkDetailed as any)[k] = Math.max(1, Math.min(99, cur + delta));
        });
      } else if (updated.stats.detailed) {
        Object.keys(updated.stats.detailed).forEach((k) => {
          const cur = (updated.stats!.detailed as any)[k] || 50;
          (updated.stats!.detailed as any)[k] = Math.max(1, Math.min(99, cur + delta));
        });
      }
      if (updated.stats.pro !== undefined) updated.stats.pro = Math.max(1, Math.min(99, (updated.stats.pro || 50) + delta));
      if (updated.stats.cre !== undefined) updated.stats.cre = Math.max(1, Math.min(99, (updated.stats.cre || 50) + delta));
      if (updated.stats.def !== undefined) updated.stats.def = Math.max(1, Math.min(99, (updated.stats.def || 50) + delta));
      if (updated.stats.phy !== undefined) updated.stats.phy = Math.max(1, Math.min(99, (updated.stats.phy || 50) + delta));
    }
    updated.marketValue = calculatePlayerMarketValue(updated).marketValue;
    onUpdatePlayer(updated);
    showToast(`⚡ Player OVR adjusted to ${clamped}!`);
  };

  const handleStatChange = (statCategory: 'pro' | 'cre' | 'def' | 'phy', delta: number) => {
    const updated = { ...player };
    if (!updated.stats) {
      updated.stats = { pro: 50, cre: 50, def: 50, phy: 50, men: 50, goa: 50 };
    }
    const current = (updated.stats as any)[statCategory] || 50;
    const newVal = Math.max(1, Math.min(99, current + delta));
    (updated.stats as any)[statCategory] = newVal;

    // Recalculate average OVR
    const avg = Math.round(((updated.stats.pro || 50) + (updated.stats.cre || 50) + (updated.stats.def || 50) + (updated.stats.phy || 50)) / 4);
    updated.ovr = Math.max(45, Math.min(99, avg));
    updated.marketValue = calculatePlayerMarketValue(updated).marketValue;
    onUpdatePlayer(updated);
    showToast(`📊 ${statCategory.toUpperCase()} adjusted to ${newVal} (OVR: ${updated.ovr})`);
  };

  const handleIndividualStatChange = (
    statKey: keyof OutfieldDetailedStats,
    valueOrDelta: number,
    isAbsolute: boolean = false
  ) => {
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
    if (!copy.stats) {
      copy.stats = { pro: 50, cre: 50, def: 50, phy: 50, men: 50, goa: 50 };
    }
    const d = getOrCreateOutfieldDetailed(copy.stats);
    const isBroken = Boolean(copy.statBreakStats?.[statKey as string]);
    const maxLimit = isBroken ? 110 : 99;

    const currentVal = d[statKey] ?? 50;
    let newVal = isAbsolute ? valueOrDelta : currentVal + valueOrDelta;
    newVal = Math.max(1, Math.min(maxLimit, Math.round(newVal)));

    d[statKey] = newVal;
    copy.stats.detailed = d;
    copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);

    const pos = copy.position || 'ST';
    const subPos = copy.subPosition || pos;
    const style = copy.playStyle;
    const newOvr = calculateWeightedOvr(pos, subPos, copy.stats, style);
    copy.ovr = Math.min(isBroken ? 105 : 99, Math.max(40, newOvr));
    copy.marketValue = calculatePlayerMarketValue(copy).marketValue;

    onUpdatePlayer(copy);
  };

  const handleToggleStatBreak = (statKey: string, checked: boolean) => {
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
    if (!copy.stats) {
      copy.stats = { pro: 50, cre: 50, def: 50, phy: 50, men: 50, goa: 50 };
    }
    const isGk = (copy.subPosition || copy.position || '').toUpperCase() === 'GK';
    const currentBroken = { ...(copy.statBreakStats || {}) };

    if (checked) {
      currentBroken[statKey] = 100;
      copy.statBreakStats = currentBroken;
      if (isGk) {
        const gk = getOrCreateGkDetailed(copy.stats);
        (gk as any)[statKey] = 100;
        copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
        const newOvr = calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle);
        copy.ovr = Math.min(105, newOvr);
      } else {
        const d = getOrCreateOutfieldDetailed(copy.stats);
        (d as any)[statKey] = 100;
        copy.stats.detailed = d;
        copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
        const newOvr = calculateWeightedOvr(
          copy.position || 'ST',
          copy.subPosition || copy.position || 'ST',
          copy.stats,
          copy.playStyle
        );
        copy.ovr = Math.min(105, newOvr);
      }
      audioManager.playSuccessChime();
      showToast(`🌟 STAT BREAK: ${statKey} locked at 100!`);
    } else {
      delete currentBroken[statKey];
      copy.statBreakStats = currentBroken;
      if (isGk) {
        const gk = getOrCreateGkDetailed(copy.stats);
        (gk as any)[statKey] = Math.min(99, (gk as any)[statKey] || 99);
        copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
        const newOvr = calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle);
        copy.ovr = Math.min(99, newOvr);
      } else {
        const d = getOrCreateOutfieldDetailed(copy.stats);
        (d as any)[statKey] = Math.min(99, (d as any)[statKey] || 99);
        copy.stats.detailed = d;
        copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
        const newOvr = calculateWeightedOvr(
          copy.position || 'ST',
          copy.subPosition || copy.position || 'ST',
          copy.stats,
          copy.playStyle
        );
        copy.ovr = Math.min(99, newOvr);
      }
      showToast(`🔒 Stat Break removed for ${statKey} (normal 1–99)`);
    }

    copy.marketValue = calculatePlayerMarketValue(copy).marketValue;
    onUpdatePlayer(copy);
  };

  // Stat Break Trigger Handlers (99 -> 100 Permanent Lock)
  const handleTriggerStatBreak = (statKey: string, statLabel: string) => {
    const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
    const currentBroken = { ...(copy.statBreakStats || {}) };
    currentBroken[statKey] = 100;
    copy.statBreakStats = currentBroken;

    if (isGk) {
      const gk = getOrCreateGkDetailed(copy.stats);
      (gk as any)[statKey] = 100;
      copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
      const newOvr = calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle);
      copy.ovr = Math.min(105, newOvr);
    } else {
      const d = getOrCreateOutfieldDetailed(copy.stats);
      (d as any)[statKey] = 100;
      copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
      copy.stats.detailed = d;
      const newOvr = calculateWeightedOvr(
        copy.position || 'ST',
        copy.subPosition || copy.position || 'ST',
        copy.stats,
        copy.playStyle
      );
      copy.ovr = Math.min(105, newOvr);
    }

    onUpdatePlayer(copy);
    audioManager.playSuccessChime();
    showToast(`🌟 STAT BREAK TRIGGERED: ${statLabel} permanently locked at 100!`);
  };

  const handleSetStatTo99 = (statKey: string, statLabel: string) => {
    const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));

    if (isGk) {
      const gk = getOrCreateGkDetailed(copy.stats);
      (gk as any)[statKey] = 99;
      copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
      const newOvr = calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle);
      copy.ovr = Math.min(99, newOvr);
    } else {
      const d = getOrCreateOutfieldDetailed(copy.stats);
      (d as any)[statKey] = 99;
      copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
      copy.stats.detailed = d;
      const newOvr = calculateWeightedOvr(
        copy.position || 'ST',
        copy.subPosition || copy.position || 'ST',
        copy.stats,
        copy.playStyle
      );
      copy.ovr = Math.min(99, newOvr);
    }

    onUpdatePlayer(copy);
    showToast(`⭐ ${statLabel} set to 99! Player is now eligible for 1% Iconic Stat Break Card Draw.`);
  };

  // Money Handlers
  const handleAddMoney = (amount: number) => {
    if (setAccounting) {
      setAccounting((prev) => ({
        ...prev,
        totalSavings: Math.max(0, (prev.totalSavings || 0) + amount),
      }));
      showToast(`💰 Added €${amount.toLocaleString()} to savings!`);
    } else {
      showToast('Accounting state not available.');
    }
  };

  const handleSetMoney = (amount: number) => {
    if (setAccounting) {
      setAccounting((prev) => ({
        ...prev,
        totalSavings: Math.max(0, amount),
      }));
      showToast(`💰 Set total savings to €${amount.toLocaleString()}!`);
    }
  };

  // Fitness & Recovery Handlers
  const handleFullRecovery = () => {
    const updated = {
      ...player,
      fitness: 100,
      stamina: 100,
      isInjured: false,
      injuryWeeksRemaining: 0,
      injuryTotalWeeks: 0,
      injuryName: undefined,
      injuryDetails: undefined,
    };
    onUpdatePlayer(updated);
    showToast('💚 100% Fitness restored & all injuries cleared!');
  };

  const handleSetStamina = (val: number) => {
    const updated = {
      ...player,
      fitness: val,
      stamina: val,
    };
    onUpdatePlayer(updated);
    showToast(`⚡ Stamina & Fitness set to ${val}%!`);
  };

  const handleTriggerSimulatedInjury = (name: string, weeks: number) => {
    const updated = {
      ...player,
      isInjured: true,
      injuryWeeksRemaining: weeks,
      injuryTotalWeeks: weeks,
      injuryName: name,
      injuryDetails: {
        id: `inj-${Date.now()}`,
        name,
        type: name.includes('Hamstring') ? 'Hamstring' : name.includes('ACL') ? 'Knee' : 'Muscular',
        weeks,
        grade: weeks >= 20 ? 'Catastrophic' : weeks >= 8 ? 'Grade III' : weeks >= 4 ? 'Grade II' : 'Grade I',
        monthsText: `${weeks} Weeks`,
        description: `Simulated test injury: ${name} requiring ${weeks} weeks of medical rehabilitation.`,
      },
    };
    onUpdatePlayer(updated);
    if (onTriggerInjuryModal) {
      onTriggerInjuryModal(name, weeks);
    }
    showToast(`🚑 Injury simulated: ${name} (${weeks} weeks)`);
  };

  // Training Points Handlers
  const handleAddTrainingPoints = (points: number) => {
    const updated = {
      ...player,
      freeStatPoints: Math.max(0, (player.freeStatPoints || 0) + points),
      unassignedPoints: Math.max(0, (player.unassignedPoints || 0) + points),
    };
    onUpdatePlayer(updated);
    showToast(`⭐ Added +${points} Free Stat Points! Total: ${updated.freeStatPoints}`);
  };

  // Trophy Handlers
  const handleAddTrophy = (
    name: string,
    category: 'national' | 'continental' | 'international' | 'individual' | 'youth' | 'friendly',
    prestige: number,
    iconType?: 'world-cup' | 'champions-league' | 'league' | 'cup' | 'ballon-dor' | 'golden-boot' | 'best-player' | 'youth-trophy' | 'super-cup' | 'olympic-gold' | 'friendly'
  ) => {
    const currentTrophies = player.trophies || [];
    const newTrophy: TrophyItem = {
      id: `trophy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      category,
      year: new Date().getFullYear().toString(),
      prestige,
      iconType: iconType || (category === 'international' ? 'world-cup' : category === 'continental' ? 'champions-league' : 'cup'),
    };
    const updated = {
      ...player,
      trophies: [...currentTrophies, newTrophy],
    };
    onUpdatePlayer(updated);
    showToast(`🏆 Added title: "${name}" to Trophy Cabinet!`);
  };

  const handleRemoveTrophy = (id: string) => {
    const currentTrophies = player.trophies || [];
    const target = currentTrophies.find((t) => t.id === id);
    const updated = {
      ...player,
      trophies: currentTrophies.filter((t) => t.id !== id),
    };
    onUpdatePlayer(updated);
    showToast(`🗑️ Removed title: "${target?.name || 'Trophy'}"`);
  };

  // Card Draw & Apply Handler
  const handleDrawAndApplyCard = (card: CustomCard) => {
    const { updatedPlayer, updatedAccounting, updatedManager, summaryMessage } = applyCustomCardToPlayer(
      card,
      player,
      accounting,
      manager
    );

    onUpdatePlayer(updatedPlayer);
    if (setAccounting && updatedAccounting) setAccounting(updatedAccounting);
    if (setManager && updatedManager) setManager(updatedManager);

    showToast(summaryMessage);
  };

  return (
    <div className="w-full bg-[#0d0f17] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                DEVELOPER TEST MODE DASHBOARD
              </h2>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                DEBUG ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive sandbox tool to adjust stats, test card draws, trigger matches, simulate injuries, and verify mechanics
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Close Test Mode Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-thin">
        {[
          { id: 'player', label: '👤 Player & OVR', icon: Sliders },
          { id: 'resources', label: '💰 Money & Fitness', icon: DollarSign },
          { id: 'key_match', label: '⚽ Trigger Match', icon: Play },
          { id: 'trophies', label: '🏆 Titles & Trophies', icon: Trophy },
          { id: 'events', label: '🎭 Career Events', icon: Flame },
          { id: 'cards', label: '🃏 Cards & Deck Test', icon: Layers },
          { id: 'magic_tool', label: '✨ Magic Tool', icon: Wand2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TestTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PLAYER & OVR EDITOR */}
      {activeTab === 'player' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick OVR Row */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Player Overall Rating (OVR: {player.ovr || 60})
                </h3>
                <p className="text-xs text-slate-400">Directly set player rating across all calculations</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDirectOvrChange((player.ovr || 60) - 5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700"
                >
                  -5
                </button>
                <button
                  onClick={() => handleDirectOvrChange((player.ovr || 60) - 1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700"
                >
                  -1
                </button>
                <span className="text-lg font-black text-emerald-400 px-3 font-mono">
                  {player.ovr || 60}
                </span>
                <button
                  onClick={() => handleDirectOvrChange((player.ovr || 60) + 1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700"
                >
                  +1
                </button>
                <button
                  onClick={() => handleDirectOvrChange((player.ovr || 60) + 5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="40"
              max="99"
              value={player.ovr || 60}
              onChange={(e) => handleDirectOvrChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 self-center mr-1">PRESETS:</span>
              {[
                { label: '50 Youth', val: 50 },
                { label: '65 Academy Ace', val: 65 },
                { label: '75 Solid Pro', val: 75 },
                { label: '82 Star', val: 82 },
                { label: '88 World Class', val: 88 },
                { label: '94 Ballon d\'Or', val: 94 },
                { label: '99 GOAT', val: 99 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => handleDirectOvrChange(p.val)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600/30 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 rounded-lg text-xs font-mono font-bold border border-slate-700 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full 18-Player Stat Editor Organized by 6 Categories */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Full Player Stat Editor (18 Underlying Attributes)
                </h3>
                <p className="text-xs text-slate-400">
                  Directly edit all 18 granular attributes (1–99) across PHY, SCO, PRO, CRE, MEN, and DEF. Synchronizes with category aggregates & weighted OVR instantly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                  OVR: {player.ovr || 60}
                </span>
              </div>
            </div>

            {/* Render 6 Outfield Categories (or Goalkeeping if GK) */}
            {((player.subPosition || player.position || '').toUpperCase() === 'GK') ? (
              <div className="space-y-4">
                <div className="border border-sky-500/30 bg-sky-950/20 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                      GOA — Goalkeeping Fundamentals
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-500/40">
                      GK Core
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: 'gkReflexes', label: 'GK Reflexes' },
                      { key: 'gkDiving', label: 'GK Diving' },
                      { key: 'gkHandling', label: 'GK Handling' },
                      { key: 'gkPositioning', label: 'GK Positioning' },
                      { key: 'gkAerial', label: 'GK Aerial' },
                      { key: 'gkSaving', label: 'GK Saving' },
                    ].map((stat) => {
                      const gkStats = getOrCreateGkDetailed(player.stats);
                      const val = (gkStats as any)[stat.key] || 50;
                      const isBroken = Boolean(player.statBreakStats?.[stat.key]);
                      return (
                        <div
                          key={stat.key}
                          className={`p-3 rounded-xl border space-y-2 transition-all ${
                            isBroken
                              ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
                              : 'bg-slate-950/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200">{stat.label}</span>
                            <div className="flex items-center gap-1.5">
                              {isBroken && (
                                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                                  BROKEN 🔒
                                </span>
                              )}
                              <input
                                type="number"
                                min="1"
                                max={isBroken ? 110 : 99}
                                value={val}
                                onChange={(e) => {
                                  const num = parseInt(e.target.value);
                                  if (!isNaN(num)) {
                                    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
                                    const gk = getOrCreateGkDetailed(copy.stats);
                                    (gk as any)[stat.key] = Math.max(1, Math.min(isBroken ? 110 : 99, num));
                                    copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
                                    copy.ovr = Math.min(isBroken ? 105 : 99, calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle));
                                    copy.marketValue = calculatePlayerMarketValue(copy).marketValue;
                                    onUpdatePlayer(copy);
                                  }
                                }}
                                className="w-14 text-center py-0.5 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[-5, -1, 1, 5].map((d) => (
                              <button
                                key={d}
                                onClick={() => {
                                  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
                                  const gk = getOrCreateGkDetailed(copy.stats);
                                  const cur = (gk as any)[stat.key] || 50;
                                  (gk as any)[stat.key] = Math.max(1, Math.min(isBroken ? 110 : 99, cur + d));
                                  copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
                                  copy.ovr = Math.min(isBroken ? 105 : 99, calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle));
                                  copy.marketValue = calculatePlayerMarketValue(copy).marketValue;
                                  onUpdatePlayer(copy);
                                }}
                                className="flex-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                              >
                                {d > 0 ? `+${d}` : d}
                              </button>
                            ))}
                          </div>

                          <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isBroken}
                              onChange={(e) => handleToggleStatBreak(stat.key, e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                            />
                            <span className={isBroken ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                              Stat Break (Lock 100)
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    code: 'PHY',
                    name: 'Physicality & Athleticism',
                    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                    border: 'border-purple-500/30',
                    bg: 'bg-purple-950/20',
                    stats: [
                      { key: 'pace' as keyof OutfieldDetailedStats, label: 'Pace' },
                      { key: 'stamina' as keyof OutfieldDetailedStats, label: 'Stamina' },
                      { key: 'strength' as keyof OutfieldDetailedStats, label: 'Strength' },
                    ],
                  },
                  {
                    code: 'SCO',
                    name: 'Goalscoring & Finishing',
                    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    border: 'border-amber-500/30',
                    bg: 'bg-amber-950/20',
                    stats: [
                      { key: 'heading' as keyof OutfieldDetailedStats, label: 'Heading' },
                      { key: 'shooting' as keyof OutfieldDetailedStats, label: 'Shooting' },
                      { key: 'longShots' as keyof OutfieldDetailedStats, label: 'Long Shots' },
                    ],
                  },
                  {
                    code: 'PRO',
                    name: 'Progression & Technique',
                    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
                    border: 'border-yellow-500/30',
                    bg: 'bg-yellow-950/20',
                    stats: [
                      { key: 'dribbling' as keyof OutfieldDetailedStats, label: 'Dribbling' },
                      { key: 'retention' as keyof OutfieldDetailedStats, label: 'Retention' },
                      { key: 'ballControl' as keyof OutfieldDetailedStats, label: 'Ball Control' },
                    ],
                  },
                  {
                    code: 'CRE',
                    name: 'Creation & Playmaking',
                    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                    border: 'border-sky-500/30',
                    bg: 'bg-sky-950/20',
                    stats: [
                      { key: 'shortPass' as keyof OutfieldDetailedStats, label: 'Short Pass' },
                      { key: 'longPass' as keyof OutfieldDetailedStats, label: 'Long Pass' },
                      { key: 'crossing' as keyof OutfieldDetailedStats, label: 'Crossing' },
                    ],
                  },
                  {
                    code: 'MEN',
                    name: 'Mental & Tactical IQ',
                    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                    border: 'border-rose-500/30',
                    bg: 'bg-rose-950/20',
                    stats: [
                      { key: 'composure' as keyof OutfieldDetailedStats, label: 'Composure' },
                      { key: 'positioning' as keyof OutfieldDetailedStats, label: 'Positioning' },
                      { key: 'reactions' as keyof OutfieldDetailedStats, label: 'Reactions' },
                    ],
                  },
                  {
                    code: 'DEF',
                    name: 'Defensive & Ball Winning',
                    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    border: 'border-emerald-500/30',
                    bg: 'bg-emerald-950/20',
                    stats: [
                      { key: 'tackling' as keyof OutfieldDetailedStats, label: 'Tackling' },
                      { key: 'marking' as keyof OutfieldDetailedStats, label: 'Marking' },
                      { key: 'interceptions' as keyof OutfieldDetailedStats, label: 'Interceptions' },
                    ],
                  },
                ].map((category) => {
                  const detailed = getOrCreateOutfieldDetailed(player.stats);
                  return (
                    <div
                      key={category.code}
                      className={`border ${category.border} ${category.bg} rounded-xl p-3.5 space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                          {category.code} — {category.name}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${category.badge}`}>
                          {category.code}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {category.stats.map((stat) => {
                          const val = detailed[stat.key] ?? 50;
                          const isBroken = Boolean(player.statBreakStats?.[stat.key as string]);
                          return (
                            <div
                              key={stat.key as string}
                              className={`p-2.5 rounded-lg border space-y-2 transition-all ${
                                isBroken
                                  ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                                  : 'bg-slate-950/80 border-slate-800/90'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-200">{stat.label}</span>
                                <div className="flex items-center gap-1.5">
                                  {isBroken && (
                                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                                      100 🔒
                                    </span>
                                  )}
                                  <input
                                    type="number"
                                    min="1"
                                    max={isBroken ? 110 : 99}
                                    value={val}
                                    onChange={(e) => {
                                      const num = parseInt(e.target.value);
                                      if (!isNaN(num)) {
                                        handleIndividualStatChange(stat.key, num, true);
                                      }
                                    }}
                                    className="w-14 text-center py-0.5 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded focus:outline-none focus:border-cyan-500"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {[-5, -1, 1, 5].map((d) => (
                                  <button
                                    key={d}
                                    onClick={() => handleIndividualStatChange(stat.key, d, false)}
                                    className="flex-1 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    {d > 0 ? `+${d}` : d}
                                  </button>
                                ))}
                              </div>

                              <label className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-300 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isBroken}
                                  onChange={(e) => handleToggleStatBreak(stat.key as string, e.target.checked)}
                                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                                />
                                <span className={isBroken ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                                  Stat Break (100)
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ⭐ STAT BREAK (100 ATTRIBUTE LOCK) TEST TRIGGER */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-purple-950/40 border-2 border-amber-500/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 tracking-wide">
                  <Crown className="w-4 h-4 text-amber-400" />
                  ⭐ STAT BREAK DEVELOPER LAB (99 → 100 PERMANENT LOCK)
                </h3>
                <p className="text-xs text-slate-300">
                  Trigger Stat Breaks, simulate 99-rated attributes to test the 1% iconic draw chance, and verify permanent lock immunity against age decay & point redistribution.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Active Breaks: {Object.keys(player.statBreakStats || {}).length}
                </span>
              </div>
            </div>

            {/* Currently Broken Attributes List */}
            {Object.keys(player.statBreakStats || {}).length > 0 ? (
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-3">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  PERMANENTLY STAT-BROKEN ATTRIBUTES (LOCKED AT 100):
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(player.statBreakStats || {}).map(([statName, val]) => (
                    <div
                      key={statName}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-200"
                    >
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="capitalize">{statName.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black text-[11px]">
                        {val} 🔒
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                No attributes currently Stat Broken. Click below to trigger a Stat Break or set an attribute to 99 to test the 1% iconic draw chance.
              </div>
            )}

            {/* Quick Stat Break Triggers for Key Stats */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide block">
                TRIGGER STAT BREAK / SET ELIGIBLE (99):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(
                  (player.subPosition || player.position || '').toUpperCase() === 'GK'
                    ? [
                        { key: 'gkReflexes', label: 'GK Reflexes' },
                        { key: 'gkDiving', label: 'GK Diving' },
                        { key: 'gkHandling', label: 'GK Handling' },
                        { key: 'gkPositioning', label: 'GK Positioning' },
                        { key: 'gkAerial', label: 'GK Aerial' },
                        { key: 'gkSaving', label: 'GK Saving' },
                      ]
                    : [
                        { key: 'pace', label: 'Pace & Acceleration' },
                        { key: 'shooting', label: 'Shooting & Finishing' },
                        { key: 'shortPassing', label: 'Short Passing & Vision' },
                        { key: 'dribbling', label: 'Dribbling & Ball Control' },
                        { key: 'defending', label: 'Defending & Tackling' },
                        { key: 'physicality', label: 'Physicality & Stamina' },
                      ]
                ).map((stat) => {
                  const isBroken = Boolean(player.statBreakStats?.[stat.key]);
                  return (
                    <div
                      key={stat.key}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        isBroken
                          ? 'bg-amber-950/30 border-amber-500/70 shadow-md'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{stat.label}</span>
                        {isBroken && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                            100 🔒
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleSetStatTo99(stat.key, stat.label)}
                          className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold border border-slate-700 transition cursor-pointer"
                          title="Set stat to 99 so the player becomes eligible for 1% Iconic Stat Break draw"
                        >
                          Set 99
                        </button>
                        <button
                          onClick={() => handleTriggerStatBreak(stat.key, stat.label)}
                          className="flex-1 py-1 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-lg text-[11px] font-black shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                          title="Instantly Break stat to 100 and permanently lock it"
                        >
                          <Crown className="w-3 h-3" />
                          Break 100
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player Identity & Squad Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Player Career Status & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Age ({player.age || 18} Years):</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...player, age: Math.max(10, (player.age || 18) - 1) };
                      onUpdatePlayer(updated);
                      showToast(`Age adjusted to ${updated.age}`);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                  >
                    -1 Yr
                  </button>
                  <span className="font-mono text-sm font-bold text-white px-2">{player.age || 18}</span>
                  <button
                    onClick={() => {
                      const updated = { ...player, age: Math.min(45, (player.age || 18) + 1) };
                      onUpdatePlayer(updated);
                      showToast(`Age adjusted to ${updated.age}`);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                  >
                    +1 Yr
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Potential OVR ({player.potentialOvr || 80}):</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...player, potentialOvr: Math.max(50, (player.potentialOvr || 80) - 2) };
                      onUpdatePlayer(updated);
                      showToast(`Potential OVR: ${updated.potentialOvr}`);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                  >
                    -2
                  </button>
                  <span className="font-mono text-sm font-bold text-amber-400 px-2">{player.potentialOvr || 80}</span>
                  <button
                    onClick={() => {
                      const updated = { ...player, potentialOvr: Math.min(99, (player.potentialOvr || 80) + 2) };
                      onUpdatePlayer(updated);
                      showToast(`Potential OVR: ${updated.potentialOvr}`);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                  >
                    +2
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Weak Foot ({(player as any).weakFoot || 3}★):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        const updated = { ...player, weakFoot: star };
                        onUpdatePlayer(updated);
                        showToast(`Weak foot set to ${star}★`);
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        ((player as any).weakFoot || 3) === star
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCES (MONEY, FITNESS & TRAINING POINTS) */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Money Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Liquid Cash & Savings (Balance: €{(accounting?.totalSavings ?? 0).toLocaleString()})
                </h3>
                <p className="text-xs text-slate-400">Quickly inject capital to test business investments, luxury store items, and lifestyle perks</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: '+€10K', val: 10000 },
                { label: '+€100K', val: 100000 },
                { label: '+€1M', val: 1000000 },
                { label: '+€10M', val: 10000000 },
                { label: '+€50M', val: 50000000 },
                { label: '+€100M', val: 100000000 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleAddMoney(btn.val)}
                  className="p-2.5 bg-slate-950 hover:bg-emerald-950/60 hover:border-emerald-500 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 transition-all flex flex-col items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="number"
                value={customCashInput}
                onChange={(e) => setCustomCashInput(e.target.value)}
                placeholder="Custom Amount"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono flex-1 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleAddMoney(parseInt(customCashInput) || 0)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Add Custom Cash
              </button>
              <button
                onClick={() => handleSetMoney(parseInt(customCashInput) || 0)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-all"
              >
                Set Exact Total
              </button>
            </div>
          </div>

          {/* Fitness, Stamina & Injury Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              Fitness, Fatigue & Injury Simulation (Fitness: {player.fitness ?? 100}%)
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleFullRecovery}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                💚 100% Fitness & Clear All Injuries
              </button>

              <button
                onClick={() => handleSetStamina(20)}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Activity className="w-4 h-4" />
                ⚡ Set Fatigue to 20%
              </button>

              <button
                onClick={() => handleSetStamina(0)}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                ⚡ Set Exhausted to 0%
              </button>
            </div>

            {/* Quick Injury Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold text-slate-400">SIMULATE SPECIFIC INJURY:</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Grade I Ankle Knock', weeks: 2, badge: 'Minor (2 Wks)' },
                  { name: 'Grade II Hamstring Strain', weeks: 4, badge: 'Moderate (4 Wks)' },
                  { name: 'Grade III Knee Ligament', weeks: 8, badge: 'Severe (8 Wks)' },
                  { name: 'Torn ACL (Catastrophic)', weeks: 24, badge: 'Catastrophic (24 Wks)' },
                ].map((inj) => (
                  <button
                    key={inj.name}
                    onClick={() => handleTriggerSimulatedInjury(inj.name, inj.weeks)}
                    className="p-2.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-all"
                  >
                    <div className="text-xs font-bold text-slate-200">{inj.name}</div>
                    <div className="text-[10px] text-rose-400 font-mono">{inj.badge}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Training Points */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Free Training & Development Points (Available: {player.freeStatPoints || player.unassignedPoints || 0} Pts)
            </h3>

            <div className="flex flex-wrap gap-2">
              {[
                { label: '+5 Pts', val: 5 },
                { label: '+10 Pts', val: 10 },
                { label: '+25 Pts', val: 25 },
                { label: '+50 Pts', val: 50 },
                { label: '+100 Pts', val: 100 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleAddTrainingPoints(btn.val)}
                  className="px-4 py-2 bg-slate-950 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500 text-amber-400 rounded-xl text-xs font-bold font-mono transition-all"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Global Icon Points (Legend Career Testing) */}
          <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  Global Icon Points (Legend Career Mode):{' '}
                  <span className="text-cyan-300 font-mono font-black">{getStoredGlobalIconPoints()} Pts</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isTestModeEnabled()
                    ? '⚡ Test Mode is active: Points are set to 9999 and auto-replenish if spent!'
                    : 'Earned across careers to unlock Play as Legend mode (1,000 Pts required).'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Set to 9999 (Max / Test)', val: 9999 },
                { label: 'Set to 1000 (Unlock)', val: 1000 },
                { label: '+500 Pts', delta: 500 },
                { label: '+1000 Pts', delta: 1000 },
                { label: 'Reset to 0', val: 0 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.val !== undefined) {
                      setStoredGlobalIconPoints(item.val);
                      showToast(`Global Icon Points set to ${item.val}`);
                    } else if (item.delta !== undefined) {
                      const updated = modifyStoredGlobalIconPoints(item.delta);
                      showToast(`Global Icon Points updated: ${updated}`);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-bold font-mono transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIGGER KEY MATCH */}
      {activeTab === 'key_match' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              One-Click Match Stage Presets
            </h3>
            <p className="text-xs text-slate-400">
              Launch the interactive 3-Zone QTE match engine directly with real-time commentary, opponent AI, and match rewards
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  title: 'UEFA Champions League Final',
                  opponent: 'Real Madrid',
                  ovr: 89,
                  icon: '🏆',
                  desc: 'Elite European pinnacle match under the stadium lights',
                },
                {
                  title: 'Premier League Title Decider',
                  opponent: 'Manchester City',
                  ovr: 88,
                  icon: '👑',
                  desc: '90-minute high-intensity domestic league decider',
                },
                {
                  title: 'FIFA World Cup Final',
                  opponent: 'France',
                  ovr: 88,
                  icon: '🌍',
                  desc: 'International glory on the grandest stage of football',
                },
                {
                  title: 'Domestic FA Cup Final',
                  opponent: 'Liverpool',
                  ovr: 86,
                  icon: '⚔️',
                  desc: 'Historic knockout silverware showdown at Wembley',
                },
                {
                  title: 'Youth League Academy Final',
                  opponent: 'Kensington Youth',
                  ovr: 65,
                  icon: '🌱',
                  desc: 'Academy championship deciding senior scout promotions',
                },
                {
                  title: 'Promotion Playoff Final',
                  opponent: 'Sunderland',
                  ovr: 74,
                  icon: '🚀',
                  desc: 'High-stakes £100M playoff promotion match',
                },
              ].map((m) => (
                <button
                  key={m.title}
                  onClick={() => {
                    if (onTriggerKeyMatch) {
                      onTriggerKeyMatch(m.title, m.opponent, m.ovr);
                      showToast(`⚽ Triggered Key Match: ${m.title} vs ${m.opponent}!`);
                    } else {
                      showToast('Match trigger handler not available.');
                    }
                  }}
                  className="p-3 bg-slate-950 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {m.ovr} OVR
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-slate-400">vs {m.opponent}</div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Match Configurator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Custom Match Configurator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Stage / Tournament Title:</label>
                <input
                  type="text"
                  value={customStageTitle}
                  onChange={(e) => setCustomStageTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Opponent Club Name:</label>
                <input
                  type="text"
                  value={customOpponentName}
                  onChange={(e) => setCustomOpponentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Opponent OVR ({customOpponentOvr}):</label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={customOpponentOvr}
                  onChange={(e) => setCustomOpponentOvr(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-3"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (onTriggerKeyMatch) {
                  onTriggerKeyMatch(customStageTitle, customOpponentName, customOpponentOvr);
                  showToast(`⚽ Launched Custom Match: ${customStageTitle} vs ${customOpponentName}!`);
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Launch Custom Match Now
            </button>
          </div>

          {/* 16-BIT PENALTY KICK QTE TEST BENCH */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border-2 border-amber-500/40 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded tracking-wider font-mono">
                    16-Bit Engine
                  </span>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    ⚽ Penalty QTE Mini-Game Sandbox
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Test the retro 16-bit 3-scene penalty kick sequence with 1-button controls, inverse aim physics, and dynamic potency formula.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playCannedLaughterSound();
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-yellow-500/50 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  title="Play 50's Canned Laughter Sound Effect"
                >
                  <span>😂 Test 50s Laugh SFX</span>
                </button>

                <button
                  onClick={() => {
                    setLastPenaltyOutcome(null);
                    setIsPenaltyQteTestOpen(true);
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-amber-300"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Launch Penalty QTE Test</span>
                </button>
              </div>
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Opponent Goalkeeper:</label>
                <input
                  type="text"
                  value={testGkName}
                  onChange={(e) => setTestGkName(e.target.value)}
                  placeholder="Goalkeeper Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Opponent Club:</label>
                <input
                  type="text"
                  value={testOpponentTeam}
                  onChange={(e) => setTestOpponentTeam(e.target.value)}
                  placeholder="Opponent Club"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Goalkeeper OVR:</label>
                  <span className="font-mono font-black text-amber-400">{testGkOvr}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="99"
                  value={testGkOvr}
                  onChange={(e) => setTestGkOvr(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Match Situation Mode:</label>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setTestIsShootout(false)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      !testIsShootout
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Awarded PK
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestIsShootout(true)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      testIsShootout
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Shootout
                  </button>
                </div>
              </div>
            </div>

            {/* Goalkeeper Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400">GK Presets:</span>
              {[
                { label: 'Youth Academy GK', ovr: 62, name: 'Lucas Meyer' },
                { label: 'League Starter GK', ovr: 77, name: 'David Soria' },
                { label: 'Champions League GK', ovr: 86, name: 'Thibaut Courtois' },
                { label: 'Legendary Wall GK', ovr: 94, name: 'Manuel Neuer' },
              ].map((gk) => (
                <button
                  key={gk.label}
                  onClick={() => {
                    setTestGkOvr(gk.ovr);
                    setTestGkName(gk.name);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    testGkOvr === gk.ovr
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {gk.label} ({gk.ovr})
                </button>
              ))}
            </div>

            {/* Player Stats Snapshot for Penalty */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs">
              <div className="text-center">
                <span className="text-slate-500 block text-[10px]">Shooting Stat</span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  {player.stats?.detailed?.shooting || player.stats?.goa || (player as any).shooting || (player as any).sho || 70}
                </span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block text-[10px]">Composure Stat</span>
                <span className="font-mono font-black text-cyan-300 text-sm">
                  {player.stats?.detailed?.composure || (player as any).detailedStats?.composure || (player as any).composure || Math.round((player.ovr || 70) * 0.95)}
                </span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block text-[10px]">Potency Target (90% × Formula)</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {Math.round(
                    (((player.stats?.detailed?.composure || (player as any).detailedStats?.composure || (player as any).composure || Math.round((player.ovr || 70) * 0.95))) * 0.6 +
                      (player.stats?.detailed?.shooting || player.stats?.goa || (player as any).shooting || (player as any).sho || 70) * 0.4) *
                      0.9
                  )}%
                </span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block text-[10px]">GK Advantage State</span>
                <span className={`font-mono font-black text-sm ${
                  testGkOvr >= (player.stats?.detailed?.shooting || player.stats?.goa || (player as any).shooting || (player as any).sho || 70) + 5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {testGkOvr >= (player.stats?.detailed?.shooting || player.stats?.goa || (player as any).shooting || (player as any).sho || 70) + 5 ? 'GK Reads Intent' : 'Neutral 50/50'}
                </span>
              </div>
            </div>

            {/* Last Penalty Result Feedback */}
            {lastPenaltyOutcome && (
              <div className={`p-4 rounded-xl border ${
                lastPenaltyOutcome.isGoal
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              } space-y-2 animate-fadeIn`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {lastPenaltyOutcome.isGoal ? '⚽' : lastPenaltyOutcome.isSaved ? '🧤' : '❌'}
                    </span>
                    <span className="font-black text-sm uppercase tracking-wider">
                      Result: {lastPenaltyOutcome.isGoal ? 'GOAL' : lastPenaltyOutcome.isSaved ? 'SAVED' : 'MISSED'}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700">
                    Scoring Prob: {Math.round(lastPenaltyOutcome.calculatedScoringChance || 0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1 text-slate-300">
                  <div>Contact: <span className="text-white font-bold">{lastPenaltyOutcome.contactTier} (+{lastPenaltyOutcome.contactBonus || 0}%)</span></div>
                  <div>Potency: <span className="text-white font-bold">{lastPenaltyOutcome.potencyValue}% ({lastPenaltyOutcome.potencyQuality || 'GOOD'})</span></div>
                  <div>GK Action: <span className="text-white font-bold">{(lastPenaltyOutcome.gkAction || 'CENTER').replace('_', ' ').toUpperCase()}</span></div>
                  <div>GK Save: <span className="text-white font-bold">{lastPenaltyOutcome.isSaved ? 'YES 🧤' : 'NO'}</span></div>
                </div>

                <p className="text-xs text-slate-200 italic pt-1 border-t border-slate-800/80">
                  "{lastPenaltyOutcome.commentary || lastPenaltyOutcome.headline || ''}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TROPHIES & TITLES */}
      {activeTab === 'trophies' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Add Silverware */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Quick Add Official Silverware
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[
                { name: 'FIFA World Cup', cat: 'international' as const, prestige: 100, icon: 'world-cup' as const },
                { name: 'UEFA Champions League', cat: 'continental' as const, prestige: 95, icon: 'champions-league' as const },
                { name: 'Premier League Title', cat: 'national' as const, prestige: 90, icon: 'league' as const },
                { name: 'Ballon d\'Or', cat: 'individual' as const, prestige: 98, icon: 'ballon-dor' as const },
                { name: 'European Golden Boot', cat: 'individual' as const, prestige: 92, icon: 'golden-boot' as const },
                { name: 'FA Cup / National Cup', cat: 'national' as const, prestige: 75, icon: 'cup' as const },
                { name: 'UEFA Super Cup', cat: 'continental' as const, prestige: 80, icon: 'super-cup' as const },
                { name: 'Youth League Trophy', cat: 'youth' as const, prestige: 60, icon: 'youth-trophy' as const },
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleAddTrophy(t.name, t.cat, t.prestige, t.icon)}
                  className="p-2.5 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/60 rounded-xl text-left transition-all flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Trophies List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Player Trophy Cabinet ({player.trophies?.length || 0} Titles)
              </span>
            </h3>

            {(!player.trophies || player.trophies.length === 0) ? (
              <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No trophies in cabinet. Use the quick add buttons above to grant silverware!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {player.trophies.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{tr.name}</div>
                        <div className="text-[10px] text-slate-400">{tr.year} • {tr.category}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveTrophy(tr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                      title="Remove trophy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trigger Champion Celebration Modal */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Launch Cinematic Champion Celebration Modal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { title: 'Treble Celebration', comp: 'Historic Treble (League + FA Cup + UCL)', type: 'treble' },
                { title: 'World Cup Champions', comp: 'FIFA World Cup 2026', type: 'world_cup' },
                { title: 'Champions League Glory', comp: 'UEFA Champions League', type: 'champions_league' },
              ].map((c) => (
                <button
                  key={c.title}
                  onClick={() => {
                    if (onOpenChampionCelebration) {
                      onOpenChampionCelebration({
                        title: c.title,
                        competitionName: c.comp,
                        clubName: player.club || 'Manchester City',
                        season: '2025/2026',
                        goals: 34,
                        assists: 18,
                        mvpCount: 8,
                        trophyCount: (player.trophies?.length || 0) + 1,
                        type: c.type,
                      });
                      showToast(`🎉 Launched ${c.title}!`);
                    }
                  }}
                  className="p-3 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition-all"
                >
                  <div className="text-xs font-bold text-amber-300">{c.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.comp}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAREER EVENTS CATALOG */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Story Perk Unlock Trigger */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Trigger Story Perk Unlock Modal (All {CAREER_PERKS_REGISTRY.length} Perks)
            </h3>
            <p className="text-xs text-slate-400">
              Opens the narrative story chapter modal detailing the emotional lore and unlocking the requested perk
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedPerkId}
                onChange={(e) => setSelectedPerkId(e.target.value)}
                className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {CAREER_PERKS_REGISTRY.map((pk) => (
                  <option key={pk.id} value={pk.id}>
                    {pk.name} ({pk.category})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const targetPerk = CAREER_PERKS_REGISTRY.find((p) => p.id === selectedPerkId) || selectedPerkId;
                  if (onTriggerPerkUnlock) {
                    onTriggerPerkUnlock(targetPerk);
                    showToast(`📖 Triggered Story Unlock for "${typeof targetPerk === 'string' ? targetPerk : targetPerk.name}"!`);
                  } else {
                    showToast('Perk unlock handler not available.');
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Trigger Perk Unlock Story
              </button>
            </div>
          </div>

          {/* Season Simulation & Fast-Forward */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FastForward className="w-4 h-4 text-red-500" />
              Season Simulation & Fast-Forward
            </h3>
            <p className="text-xs text-slate-400">
              When in season simulation, a bright red <strong className="text-red-400">SKIP SEASON</strong> button is available directly in the simulation controls to bypass match-by-match rendering and generate all season results instantly.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (onOpenCareerSummary) {
                    onOpenCareerSummary();
                    showToast('📊 Opened Season & Career Summary View!');
                  } else {
                    showToast('⚡ Use the bright red [SKIP SEASON] button on the Season simulation screen to generate full season results instantly!');
                  }
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
              >
                <FastForward className="w-4 h-4 fill-white" />
                <span>Open Season / Career Summary</span>
              </button>
            </div>
          </div>

          {/* Major Career Modals */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Major Career Milestone Events
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  if (onOpenSpecialChoiceModal) {
                    onOpenSpecialChoiceModal();
                    showToast('👑 Triggered Special Club Choice Summit Event!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-amber-300">👑 Special Choice Summit</div>
                <div className="text-[10px] text-slate-400 mt-1">Multi-club power choice (Real Madrid, PSG, Saudi)</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenSpecialSigningChain) {
                    onOpenSpecialSigningChain('real_madrid');
                    showToast('👑 Triggered Real Madrid Boardroom Signing Chain!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-amber-300">⚪ Real Madrid Signing Chain</div>
                <div className="text-[10px] text-slate-400 mt-1">Florentino Pérez 5-step summit & negotiation</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenSpecialSigningChain) {
                    onOpenSpecialSigningChain('barcelona');
                    showToast('🔵 Triggered FC Barcelona Boardroom Signing Chain!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-rose-300">🔴 FC Barcelona Signing Chain</div>
                <div className="text-[10px] text-slate-400 mt-1">Laporta & Deco Cruyffian philosophy summit</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenSpecialSigningChain) {
                    onOpenSpecialSigningChain('psg');
                    showToast('🗼 Triggered PSG Boardroom Signing Chain!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-blue-300">🗼 PSG Signing Chain</div>
                <div className="text-[10px] text-slate-400 mt-1">Al-Khelaifi & Luis Enrique Paris mega-deal</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenSpecialRetryModal) {
                    onOpenSpecialRetryModal('real_madrid');
                    showToast('🔄 Triggered "They’re Still Interested" Follow-up Event!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-yellow-950/40 border border-slate-800 hover:border-yellow-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-yellow-300">🔄 They’re Still Interested</div>
                <div className="text-[10px] text-slate-400 mt-1">Short retry event for decay follow-up window</div>
              </button>

              <button
                onClick={() => {
                  onUpdatePlayer({
                    ...player,
                    isCurrentlyHostage: !player.isCurrentlyHostage,
                    hostageMonthsRemaining: player.isCurrentlyHostage ? 0 : 6,
                    hasBeenHostageBefore: true,
                    squadDestination: player.isCurrentlyHostage ? 'First Team' : 'Reserves',
                    squadRole: player.isCurrentlyHostage ? 'Starter' : 'Develop With Reserves',
                  });
                  showToast(
                    player.isCurrentlyHostage
                      ? '✅ Cleared Hostage Status (Returned to First Team)'
                      : '🔒 Applied Hostage Status (6 Months in Reserves)'
                  );
                }}
                className="p-3 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-red-400">
                  {player.isCurrentlyHostage ? '🔓 Clear Hostage Status' : '🔒 Set Hostage Status (Reserves)'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {player.isCurrentlyHostage ? 'Currently in Reserves' : '6 months benching after forced exit refusal'}
                </div>
              </button>

              <button
                onClick={() => {
                  if (onOpenSaudiOffer) {
                    onOpenSaudiOffer();
                    showToast('💰 Triggered Saudi Arabian Mega Offer Modal!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-emerald-300">🇸🇦 Arabian Mega Offer</div>
                <div className="text-[10px] text-slate-400 mt-1">€200M/year Saudi Pro League offer with signing bonus</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenTransferOffer) {
                    onOpenTransferOffer();
                    showToast('⭐ Triggered European Transfer Interest Modal!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-indigo-300">⭐ European Transfer Offer</div>
                <div className="text-[10px] text-slate-400 mt-1">Powerhouse European club contract offer</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenCallUp) {
                    onOpenCallUp();
                    showToast('🌍 Triggered National Team Call-Up Modal!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-cyan-300">🌍 International Call-Up</div>
                <div className="text-[10px] text-slate-400 mt-1">Senior national squad call-up invitation</div>
              </button>

              <button
                onClick={() => {
                  if (onOpenCareerSummary) {
                    onOpenCareerSummary();
                    showToast('📜 Opened Career Summary & Legacy View!');
                  }
                }}
                className="p-3 bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-bold text-purple-300">📜 Career Summary Recap</div>
                <div className="text-[10px] text-slate-400 mt-1">Full lifetime stats, honors & trophies breakdown</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CARDS & DECK TESTER */}
      {activeTab === 'cards' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card Filters & Quick Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Live Card Draw & Testing Engine ({filteredCards.length} Available)
                </h3>
                <p className="text-xs text-slate-400">
                  Select and draw any card across all 7 categories and all tiers to instantly verify mechanics
                </p>
              </div>

              {onOpenCardEditor && (
                <button
                  onClick={onOpenCardEditor}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Open Full Card Deck Editor
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search cards by name or effect..."
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={cardCategoryFilter}
                onChange={(e) => setCardCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories (7)</option>
                <option value="parents">Parent Heritage Cards</option>
                <option value="street">Street Football Cards</option>
                <option value="youth">Youth Academy Cards</option>
                <option value="career">Career Pro Development Cards</option>
                <option value="life">Lifestyle & Prestige Cards</option>
                <option value="sponsor">Sponsorship Deals</option>
                <option value="match_day">Match Day Situation Cards</option>
              </select>

              <select
                value={cardTierFilter}
                onChange={(e) => setCardTierFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Tiers (7 Tiers)</option>
                <option value="white">White Tier</option>
                <option value="bronze">Bronze Tier</option>
                <option value="silver">Silver Tier</option>
                <option value="gold">Gold Tier</option>
                <option value="legendary">Legendary Tier</option>
                <option value="iconic">Iconic Tier</option>
                <option value="epic_goat">Epic GOAT Tier</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredCards.map((card) => {
              const tierBadgeColors: Record<string, string> = {
                white: 'bg-slate-800 text-slate-300 border-slate-700',
                bronze: 'bg-amber-950 text-amber-400 border-amber-700/50',
                silver: 'bg-slate-800 text-slate-200 border-slate-500',
                gold: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
                legendary: 'bg-purple-950 text-purple-300 border-purple-500',
                iconic: 'bg-cyan-950 text-cyan-300 border-cyan-500',
                epic_goat: 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-200 border-amber-400',
              };

              const hasNegativeMod = card.modifiers?.some((m) => m.operation === 'subtract');
              const hasPositiveMod = card.modifiers?.some((m) => m.operation === 'add');
              const isDoubleEdged = hasNegativeMod && hasPositiveMod;

              return (
                <div
                  key={card.id}
                  className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${tierBadgeColors[card.tier] || tierBadgeColors.gold}`}>
                        {card.tier}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {card.category}
                      </span>
                      {isDoubleEdged && (
                        <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-600 px-1.5 py-0.2 rounded font-bold">
                          ⚡ DOUBLE-EDGED
                        </span>
                      )}
                      {!isDoubleEdged && hasNegativeMod && (
                        <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-600 px-1.5 py-0.2 rounded font-bold">
                          ⚠️ NEGATIVE
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-white leading-snug">
                      {card.name}
                    </div>

                    {card.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    )}

                    {card.modifiers && card.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {card.modifiers.map((m, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              m.operation === 'add'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {m.operation === 'add' ? '+' : '-'}{m.value} {m.target}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDrawAndApplyCard(card)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Draw & Apply to Player
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: MAGIC TOOL */}
      {activeTab === 'magic_tool' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-950/80 via-yellow-950/40 to-slate-900 border-2 border-amber-500/50 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-500/20">
                <Wand2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-arcade text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                    TRANSLATION MAGIC TOOL & HUD
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isMagicTool;
                      setMagicTool(next);
                      showToast(next ? '✨ Magic Tool enabled! Floating inspector is active on Main Menu & in-game.' : 'Magic Tool disabled.');
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase transition-all cursor-pointer border ${
                      isMagicTool
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {isMagicTool ? '✨ MAGIC TOOL: ACTIVE' : 'MAGIC TOOL: DISABLED'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Interactive floating tool enabled in Test Mode. When toggled ON, the floating inspector appears on the Main Menu and throughout gameplay. Pick any on-screen text, inspect translations, review suggestions, and export clean audit reports.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!isMagicTool) setMagicTool(true);
                  triggerMagicInspect(true);
                  if (onClose) onClose();
                  showToast('✨ Magic Inspect mode activated! Hover & click any text on screen.');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-arcade text-xs font-black uppercase tracking-wider rounded-xl border border-amber-300 shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Crosshair className="w-4 h-4 stroke-[2.5]" />
                <span>ACTIVATE MAGIC INSPECT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerMagicAuditModal(true);
                  if (onClose) onClose();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-arcade text-xs font-black uppercase tracking-wider rounded-xl border border-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>OPEN AUDIT MODAL</span>
              </button>
            </div>
          </div>

          {/* Quick Actions & Exporters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const items = runPredefinedScan(currentLanguage);
                  setMagicAuditItems(items);
                  showToast('🔍 Magic Pre-Scan complete! Added verified untranslated audit items.');
                }}
                className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RUN PREDEFINED SCAN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const json = exportAuditAsJson(magicAuditItems);
                  navigator.clipboard.writeText(json);
                  setMagicCopied('json');
                  setTimeout(() => setMagicCopied(null), 2500);
                  showToast('📋 Audit JSON copied to clipboard!');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{magicCopied === 'json' ? 'COPIED JSON!' : 'COPY JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const csv = exportAuditAsCsv(magicAuditItems);
                  navigator.clipboard.writeText(csv);
                  setMagicCopied('csv');
                  setTimeout(() => setMagicCopied(null), 2500);
                  showToast('📋 Audit CSV copied to clipboard!');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{magicCopied === 'csv' ? 'COPIED CSV!' : 'COPY CSV'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const json = exportAuditAsJson(magicAuditItems);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `drawstar-translations-audit-${currentLanguage}-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('💾 Audit report downloaded!');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>DOWNLOAD JSON</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Items: <strong className="text-amber-400">{magicAuditItems.length}</strong>
              </span>
              {magicAuditItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearAuditItems();
                    setMagicAuditItems([]);
                    showToast('🗑️ Cleared translation audit items.');
                  }}
                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={magicSearch}
                onChange={(e) => setMagicSearch(e.target.value)}
                placeholder="Search audit items by text or screen..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={magicCategory}
              onChange={(e) => setMagicCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Categories</option>
              <option value="Card Description">Card Description</option>
              <option value="Wonderkid Profile">Wonderkid Profile</option>
              <option value="Stat / Attribute">Stat / Attribute</option>
              <option value="Perk / Playstyle">Perk / Playstyle</option>
              <option value="Position">Position</option>
              <option value="UI Label">UI Label</option>
              <option value="Popup / Explainer">Popup / Explainer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {magicAuditItems
              .filter((it) => {
                const matchesCat = magicCategory === 'all' || it.category === magicCategory;
                const matchesText =
                  !magicSearch ||
                  it.englishText.toLowerCase().includes(magicSearch.toLowerCase()) ||
                  it.screen.toLowerCase().includes(magicSearch.toLowerCase()) ||
                  (it.suggestedTranslation && it.suggestedTranslation.toLowerCase().includes(magicSearch.toLowerCase()));
                return matchesCat && matchesText;
              })
              .map((it) => (
                <div
                  key={it.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-600/60 text-[10px] font-black uppercase">
                        {it.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Screen: <strong className="text-slate-200">{it.screen}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(it.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-black">
                        English Text (Source)
                      </span>
                      <p className="text-slate-200 font-medium leading-relaxed">
                        {it.englishText}
                      </p>
                    </div>

                    <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40 space-y-1">
                      <span className="text-[10px] text-emerald-400 uppercase font-black">
                        Suggested Translation
                      </span>
                      <p className="text-emerald-200 font-medium leading-relaxed">
                        {it.suggestedTranslation || 'Pending manual translation'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {magicAuditItems.length === 0 && (
              <div className="text-center py-10 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                <Wand2 className="w-8 h-8 text-amber-400 mx-auto opacity-40 animate-pulse" />
                <p className="text-sm text-slate-300 font-bold">No translation audit items recorded yet.</p>
                <p className="text-xs text-slate-500">
                  Click "Run Predefined Scan" above or activate "Magic Inspect" to click and flag any text directly on screen!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 16-BIT PENALTY KICK QTE MODAL TEST INSTANCE */}
      <PenaltyQteModal
        isOpen={isPenaltyQteTestOpen}
        player={player}
        goalkeeperOvr={testGkOvr}
        goalkeeperName={testGkName}
        opponentName={testOpponentTeam}
        matchMinute={testIsShootout ? 120 : 84}
        isShootout={testIsShootout}
        penaltyRoundIndex={testIsShootout ? 5 : undefined}
        onComplete={(outcome) => {
          setLastPenaltyOutcome(outcome);
          setIsPenaltyQteTestOpen(false);
          if (outcome.isGoal) {
            showToast(`⚽ GOAL! Penalty scored into the net! (Chance: ${outcome.calculatedScoringChance}%)`);
          } else if (outcome.isSaved) {
            showToast(`🧤 SAVED! ${testGkName} blocked the penalty!`);
          } else {
            showToast(`❌ MISSED! Penalty went off target!`);
          }
        }}
        onClose={() => setIsPenaltyQteTestOpen(false)}
      />
    </div>
  );
};
