import React, { useState, useEffect, useRef } from 'react';
import {
  CustomCard,
  CustomCardCategory,
  CustomCardTier,
  CardModifier,
  ModifierTarget,
  OfficialEffectCategory,
  TemporalSubtype,
  CardDuration,
} from '../types';
import {
  getAllDefaultCustomCards,
  getCardsByCategory,
  getCategoryCardCount,
  matchesCategory,
  generateDefaultParentCustomCards,
  generateDefaultStreetCustomCards,
  generateDefaultYouthCustomCards,
  generateDefaultLifeCustomCards,
  generateDefaultSponsorCustomCards,
  generateDefaultCareerCustomCards,
  generateDefaultMatchDayCustomCards,
  generateDefaultAgentCustomCards,
  generateDefaultInterviewCustomCards,
  applyCustomCardToPlayer,
} from '../utils/cardDatabaseSystem';
import { safeGetItem, safeSetItem, safeDownloadBlob } from '../utils/storageCleaner';
import { getOptionFileCards, saveAllOptionFileCards } from '../utils/optionFileSystem';
import { haptics } from '../utils/hapticsSystem';
import { CardVisualRenderer } from './CardVisualRenderer';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Layers,
  Sparkles,
  Shield,
  HeartHandshake,
  Flame,
  Award,
  Briefcase,
  Zap,
  DollarSign,
  Activity,
  UserCheck,
  Clock,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  FileText,
  RotateCcw,
  Pencil,
  Play,
  Copy,
  MessageSquare,
  Search,
  Hourglass,
  Crosshair,
  Skull,
  Eye,
} from 'lucide-react';

interface CardDeckEditorProps {
  showToast: (msg: string) => void;
  player?: any;
  onUpdatePlayer?: (updated: any) => void;
  accounting?: any;
  setAccounting?: any;
  manager?: any;
  setManager?: any;
  onApplyCardToPlayer?: (card: CustomCard) => void;
}

const CATEGORIES: { id: CustomCardCategory; label: string; icon: any; color: string; desc: string; familyKey: string }[] = [
  { id: 'youth', label: 'Youth Academy', icon: Award, color: 'from-emerald-500 to-teal-600', desc: 'Academy growth, developmental milestones & youth training', familyKey: 'youth' },
  { id: 'street', label: 'Street', icon: Flame, color: 'from-amber-500 to-orange-600', desc: 'Cage matches, asphalt rivalries & raw street flair', familyKey: 'street' },
  { id: 'career', label: 'Career', icon: Shield, color: 'from-blue-500 to-indigo-600', desc: 'Match performances, contract milestones & squad triumphs', familyKey: 'career' },
  { id: 'life', label: 'Lifestyle', icon: Sparkles, color: 'from-purple-500 to-violet-600', desc: 'Off-pitch lifestyle, media publicity & personal achievements', familyKey: 'lifestyle' },
  { id: 'sponsor', label: 'Sponsor', icon: Briefcase, color: 'from-yellow-400 to-amber-500', desc: 'Commercial brand endorsement contracts & sponsorships', familyKey: 'sponsor' },
  { id: 'agent', label: 'Agent', icon: UserCheck, color: 'from-cyan-500 to-blue-600', desc: 'Tactical strategy, agent networking & negotiation leverage', familyKey: 'agent' },
  { id: 'parents', label: 'Parent', icon: HeartHandshake, color: 'from-rose-500 to-pink-600', desc: 'Family upbringing, heritage roots & parental guidance', familyKey: 'parent' },
  { id: 'match_day', label: 'Match Day', icon: Zap, color: 'from-cyan-400 to-blue-500', desc: 'Clutch conditions, high-stakes matches & weather modifiers', familyKey: 'career' },
  { id: 'interview', label: 'Interview', icon: MessageSquare, color: 'from-violet-500 to-fuchsia-600', desc: 'Post-match declarations, media soundbites & controversy', familyKey: 'career' },
];

export type CardFilterCategory = 'all' | 'positive' | 'negative' | 'double_edged' | 'temporal';

export interface TierDefinition {
  id: CustomCardTier;
  label: string;
  category: 'positive' | 'negative' | 'double_edged';
  tierNumber: number;
  bg: string;
  text: string;
  border: string;
  badge: string;
  desc: string;
}

const TIERS: TierDefinition[] = [
  // 🟢 POSITIVE TIERS (Official 4 Tiers + Iconic)
  {
    id: 'bronze',
    label: '🥉 Bronze (Tier 1)',
    category: 'positive',
    tierNumber: 1,
    bg: 'bg-gradient-to-b from-amber-900/90 via-stone-900 to-amber-950',
    text: 'text-amber-200',
    border: 'border-2 border-amber-700/90 shadow-[0_0_20px_rgba(180,83,9,0.35)]',
    badge: 'bg-amber-900 text-amber-100 border border-amber-600 font-bold',
    desc: 'Tier 1: Metallic Bronze finish',
  },
  {
    id: 'silver',
    label: '🥈 Silver (Tier 2)',
    category: 'positive',
    tierNumber: 2,
    bg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900',
    text: 'text-slate-100',
    border: 'border-2 border-slate-300 shadow-[0_0_22px_rgba(203,213,225,0.35)]',
    badge: 'bg-slate-300 text-slate-950 border border-slate-100 font-bold',
    desc: 'Tier 2: Metallic Silver Sheen',
  },
  {
    id: 'gold',
    label: '🥇 Gold (Tier 3)',
    category: 'positive',
    tierNumber: 3,
    bg: 'bg-gradient-to-b from-yellow-950/95 via-amber-900/90 to-stone-950',
    text: 'text-yellow-300',
    border: 'border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)]',
    badge: 'bg-amber-400 text-slate-950 border border-amber-200 font-bold',
    desc: 'Tier 3: Radiant Gold Metallic',
  },
  {
    id: 'legendary',
    label: '👑 Legendary (Tier 4)',
    category: 'positive',
    tierNumber: 4,
    bg: 'bg-gradient-to-b from-black via-zinc-950 to-black',
    text: 'text-amber-300',
    border: 'border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.55)]',
    badge: 'bg-amber-500 text-slate-950 border border-amber-300 font-black',
    desc: 'Tier 4: Obsidian Black with Golden Aura',
  },
  {
    id: 'iconic',
    label: '💎 ⭐ Iconic (Masterpiece)',
    category: 'positive',
    tierNumber: 5,
    bg: 'bg-gradient-to-b from-slate-950 via-cyan-950/70 to-slate-950',
    text: 'text-cyan-200',
    border: 'border-2 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.65)]',
    badge: 'bg-cyan-300 text-slate-950 border border-cyan-100 font-black',
    desc: 'Iconic: Prismatic Diamond Sheen',
  },

  // 🔴 NEGATIVE TIERS (Official 4 Tiers: Scrap, Rust, Ash, Disaster)
  {
    id: 'scrap',
    label: '🗑️ Scrap (Tier 1)',
    category: 'negative',
    tierNumber: 1,
    bg: 'bg-gradient-to-b from-stone-900 via-zinc-900 to-slate-900',
    text: 'text-slate-200',
    border: 'border-2 border-slate-300 shadow-[0_0_22px_rgba(203,213,225,0.45)]',
    badge: 'bg-slate-700 text-slate-100 border border-slate-300 font-bold',
    desc: 'Tier 1: Dark stonelike material with silver shine',
  },
  {
    id: 'rust',
    label: '⚙️ Rust (Tier 2)',
    category: 'negative',
    tierNumber: 2,
    bg: 'bg-gradient-to-b from-stone-700 via-zinc-800 to-stone-800',
    text: 'text-amber-200',
    border: 'border-[3px] border-[#78350f] shadow-[0_0_24px_rgba(120,53,15,0.5)]',
    badge: 'bg-amber-900 text-amber-200 border border-amber-800 font-bold',
    desc: 'Tier 2: Grey iron base with brown rust borders',
  },
  {
    id: 'ash',
    label: '🔥 Ash (Tier 3)',
    category: 'negative',
    tierNumber: 3,
    bg: 'bg-gradient-to-b from-black via-red-950 to-stone-950',
    text: 'text-red-200',
    border: 'border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)]',
    badge: 'bg-red-800 text-red-100 border border-red-500 font-bold',
    desc: 'Tier 3: Burnt black body with fire red borders',
  },
  {
    id: 'disaster',
    label: '☠️ Disaster (Tier 4)',
    category: 'negative',
    tierNumber: 4,
    bg: 'bg-gradient-to-b from-red-950 via-rose-950 to-black',
    text: 'text-emerald-300',
    border: 'border-2 border-emerald-400 shadow-[0_0_35px_rgba(225,29,72,0.8)]',
    badge: 'bg-red-950 text-emerald-300 border border-emerald-400 font-black',
    desc: 'Tier 4: Deep crimson flame with bright green borders',
  },

  // ⚔️ DOUBLE-EDGED TIERS (Official 4 Tiers: Obsidian Knife, Copper Dagger, Steel Blade, Muramasa Blade)
  {
    id: 'obsidian_knife',
    label: '🗡️ Obsidian Knife (Tier 1)',
    category: 'double_edged',
    tierNumber: 1,
    bg: 'bg-gradient-to-b from-stone-950 via-neutral-900 to-black',
    text: 'text-purple-200',
    border: 'border-2 border-purple-500 shadow-[0_0_22px_rgba(168,85,247,0.45)]',
    badge: 'bg-purple-950 text-purple-200 border border-purple-400 font-bold',
    desc: 'Tier 1: Volcanic dark glass with sharp purple edge',
  },
  {
    id: 'copper_dagger',
    label: '🥉🗡️ Copper Dagger (Tier 2)',
    category: 'double_edged',
    tierNumber: 2,
    bg: 'bg-gradient-to-b from-orange-950 via-amber-950 to-stone-950',
    text: 'text-amber-100',
    border: 'border-2 border-orange-500 shadow-[0_0_24px_rgba(234,88,12,0.45)]',
    badge: 'bg-orange-800 text-amber-100 border border-orange-400 font-bold',
    desc: 'Tier 2: Warm metallic copper with distinct dagger styling',
  },
  {
    id: 'steel_blade',
    label: '⚔️ Steel Blade (Tier 3)',
    category: 'double_edged',
    tierNumber: 3,
    bg: 'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300',
    text: 'text-slate-950',
    border: 'border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.45)]',
    badge: 'bg-white text-black border-2 border-slate-300 font-black',
    desc: 'Tier 3: Bright silver steel with white shiny border',
  },
  {
    id: 'muramasa_blade',
    label: '👹🗡️ Muramasa Blade (Tier 4)',
    category: 'double_edged',
    tierNumber: 4,
    bg: 'bg-gradient-to-b from-purple-950 via-fuchsia-950 to-indigo-950',
    text: 'text-emerald-300',
    border: 'border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.55)]',
    badge: 'bg-purple-950 text-emerald-300 border border-emerald-400 font-black animate-pulse',
    desc: 'Tier 4: Shiny purple metallic texture with bright green border',
  },
];

const MODIFIER_TARGETS: { id: ModifierTarget; label: string; category: string }[] = [
  { id: 'stat_pro', label: 'Pace & Shooting (Finishing/Speed)', category: 'Offense' },
  { id: 'stat_cre', label: 'Passing & Vision (Short/Long Pass)', category: 'Playmaking' },
  { id: 'stat_def', label: 'Defending & Tackling', category: 'Defense' },
  { id: 'stat_dribbling', label: 'Dribbling & Ball Control', category: 'Technical' },
  { id: 'stat_composure', label: 'Composure', category: 'Mental' },
  { id: 'stat_stamina', label: 'Stamina & Match Fitness', category: 'Physical' },
  { id: 'stat_strength', label: 'Physical Strength', category: 'Physical' },
  { id: 'stat_position', label: 'Offensive Positioning', category: 'Offense' },
  { id: 'stat_reaction', label: 'Reactions & Reflexes', category: 'Mental' },
  { id: 'stat_potential', label: 'Potential Ceiling OVR', category: 'Growth' },
  { id: 'stat_free_points', label: 'Free Stat Growth Points', category: 'Growth' },
  { id: 'stat_weak_foot', label: 'Weak Foot Stars (1-5★)', category: 'Technical' },
  { id: 'stat_fame', label: 'Fame (Global Stardom)', category: 'Reputation' },
  { id: 'bad_reputation', label: 'Bad Reputation / Controversy', category: 'Reputation' },
  { id: 'team_chemistry', label: 'Team Chemistry (%)', category: 'Squad' },
  { id: 'chemistry_ceiling', label: 'Chemistry Ceiling Cap (%)', category: 'Squad' },
  { id: 'money', label: 'Cash / Earnings (€)', category: 'Finance' },
  { id: 'injury_chance', label: 'Injury Risk (%)', category: 'Health' },
  { id: 'agent_negotiation', label: 'Agent Negotiation Skill (0-100)', category: 'Agent' },
  { id: 'agent_network', label: 'Agent Network Skill (0-100)', category: 'Agent' },
  { id: 'agent_marketing', label: 'Agent Marketing Skill (0-100)', category: 'Agent' },
  { id: 'perk', label: 'Special Trait / Perk', category: 'Perks' },
];

const STORAGE_KEY = 'footballer_custom_cards_v2';

export const CardDeckEditor: React.FC<CardDeckEditorProps> = ({
  showToast,
  player,
  onUpdatePlayer,
  accounting,
  setAccounting,
  manager,
  setManager,
  onApplyCardToPlayer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CustomCardCategory>('youth');
  const [selectedFilter, setSelectedFilter] = useState<CardFilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [cards, setCards] = useState<CustomCard[]>(() => {
    try {
      const ofCards = getOptionFileCards();
      if (Array.isArray(ofCards) && ofCards.length > 0) {
        return ofCards;
      }
      const saved = safeGetItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading custom cards from Option File', e);
    }
    return getAllDefaultCustomCards();
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardCategory, setCardCategory] = useState<CustomCardCategory>('youth');
  const [cardEffectCategory, setCardEffectCategory] = useState<OfficialEffectCategory>('positive');
  const [isTemporalCard, setIsTemporalCard] = useState(false);
  const [cardDuration, setCardDuration] = useState<CardDuration>('6_months');
  const [cardTier, setCardTier] = useState<CustomCardTier>('gold');
  const [cardDesc, setCardDesc] = useState('');
  const [modifiers, setModifiers] = useState<CardModifier[]>([]);

  // Current Modifier Builder State
  const [modTarget, setModTarget] = useState<ModifierTarget>('stat_pro');
  const [modOp, setModOp] = useState<'add' | 'subtract'>('add');
  const [modType, setModType] = useState<'flat' | 'percentage'>('flat');
  const [modValue, setModValue] = useState<number>(10);
  const [modPerkName, setModPerkName] = useState('');
  const [modPerkAction, setModPerkAction] = useState<'add' | 'remove'>('add');

  // Save to LocalStorage and sync with Option File (Single Source of Truth)
  useEffect(() => {
    try {
      safeSetItem(STORAGE_KEY, JSON.stringify(cards));
      saveAllOptionFileCards(cards);
    } catch (e) {
      console.error('Error saving custom cards to Option File', e);
    }
  }, [cards]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const allCategoryCards = getCardsByCategory(cards, selectedCategory);

  // Helper to categorize card
  const getCardEffectCategory = (card: CustomCard): 'positive' | 'negative' | 'double_edged' => {
    if (card.effectCategory === 'negative' || ['scrap', 'rust', 'ash', 'disaster'].includes(card.tier)) return 'negative';
    if (card.effectCategory === 'double_edged' || ['obsidian_knife', 'copper_dagger', 'copper_knife', 'stone_dagger', 'steel_blade', 'muramasa_blade'].includes(card.tier)) return 'double_edged';
    return 'positive';
  };

  const isCardTemporal = (card: CustomCard): boolean => {
    return Boolean(card.duration && card.duration !== 'none') || card.effectCategory === 'temporal' || Boolean(card.temporalSubtype);
  };

  // Filter category cards
  const filteredCards = allCategoryCards.filter((card) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = card.name.toLowerCase().includes(q);
      const matchDesc = card.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'temporal') return isCardTemporal(card);
    if (selectedFilter === 'positive') return getCardEffectCategory(card) === 'positive' && !isCardTemporal(card);
    if (selectedFilter === 'negative') return getCardEffectCategory(card) === 'negative' && !isCardTemporal(card);
    if (selectedFilter === 'double_edged') return getCardEffectCategory(card) === 'double_edged' && !isCardTemporal(card);
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingCardId(null);
    setCardName('');
    setCardCategory(selectedCategory);
    setCardEffectCategory('positive');
    setIsTemporalCard(false);
    setCardDuration('6_months');
    setCardTier('gold');
    setCardDesc('');
    setModifiers([
      {
        id: `mod-${Date.now()}-1`,
        target: 'stat_pro',
        operation: 'add',
        valueType: 'flat',
        value: 10,
      },
    ]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (card: CustomCard) => {
    setEditingCardId(card.id);
    setCardName(card.name);
    setCardCategory(card.category);
    const eff = getCardEffectCategory(card);
    setCardEffectCategory(eff);
    const temp = isCardTemporal(card);
    setIsTemporalCard(temp);
    setCardDuration(card.duration === '1_year' ? '1_year' : '6_months');
    setCardTier(card.tier);
    setCardDesc(card.description || '');
    setModifiers([...card.modifiers]);
    setShowAddModal(true);
  };

  const handleEffectCategoryChange = (eff: OfficialEffectCategory) => {
    setCardEffectCategory(eff);
    const available = TIERS.filter((t) => t.category === (eff === 'temporal' ? 'positive' : eff));
    if (!available.some((t) => t.id === cardTier)) {
      setCardTier(available[0]?.id || 'bronze');
    }
  };

  const handleAddModifier = () => {
    if (modTarget === 'perk' && !modPerkName.trim()) {
      showToast('Please specify a perk name!');
      return;
    }

    const newMod: CardModifier = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      target: modTarget,
      operation: modOp,
      valueType: modType,
      value: Math.abs(modValue) || 0,
      perkName: modTarget === 'perk' ? modPerkName.trim() : undefined,
      perkAction: modTarget === 'perk' ? modPerkAction : undefined,
    };

    setModifiers((prev) => [...prev, newMod]);
    setModPerkName('');
  };

  const handleRemoveModifier = (id: string) => {
    setModifiers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) {
      showToast('Please enter a card name!');
      return;
    }

    let resolvedEffCat: OfficialEffectCategory = cardEffectCategory;
    let resolvedTempSubtype: TemporalSubtype | undefined = undefined;

    if (isTemporalCard) {
      resolvedEffCat = 'temporal';
      resolvedTempSubtype =
        cardEffectCategory === 'negative'
          ? 'temporal_negative'
          : cardEffectCategory === 'double_edged'
          ? 'temporal_double_edged'
          : 'temporal_positive';
    }

    if (editingCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCardId
            ? {
                ...c,
                name: cardName.trim(),
                category: cardCategory,
                tier: cardTier,
                effectCategory: resolvedEffCat,
                temporalSubtype: resolvedTempSubtype,
                duration: isTemporalCard ? cardDuration : 'none',
                description: cardDesc.trim() || undefined,
                modifiers: [...modifiers],
              }
            : c
        )
      );
      haptics.success();
      showToast(`✏️ Updated card "${cardName.trim()}"!`);
    } else {
      const newCard: CustomCard = {
        id: `card-${cardCategory}-${Date.now()}`,
        name: cardName.trim(),
        category: cardCategory,
        tier: cardTier,
        effectCategory: resolvedEffCat,
        temporalSubtype: resolvedTempSubtype,
        duration: isTemporalCard ? cardDuration : 'none',
        description: cardDesc.trim() || undefined,
        modifiers: [...modifiers],
        createdAt: new Date().toISOString(),
      };

      setCards((prev) => [newCard, ...prev]);
      haptics.success();
      showToast(`🃏 Card "${newCard.name}" created!`);
    }

    setEditingCardId(null);
    setShowAddModal(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    haptics.lightTap();
    showToast('🗑️ Card deleted.');
  };

  const handleDuplicateCard = (card: CustomCard) => {
    const duplicated: CustomCard = {
      ...card,
      id: `card-${card.category}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: `${card.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setCards((prev) => [duplicated, ...prev]);
    haptics.lightTap();
    showToast(`📋 Duplicated card "${card.name}"!`);
  };

  const handleTestApplyCard = (card: CustomCard) => {
    haptics.firmImpact();
    if (onApplyCardToPlayer) {
      onApplyCardToPlayer(card);
      return;
    }
    if (player && onUpdatePlayer) {
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
    } else {
      showToast(`🃏 Card "${card.name}" test applied!`);
    }
  };

  const handleClearCategoryCards = () => {
    if (allCategoryCards.length === 0) {
      showToast('No cards to delete in this category.');
      return;
    }
    setCards((prev) => prev.filter((c) => !matchesCategory(c.category, selectedCategory)));
    showToast(`🗑️ Cleared all cards in ${activeCategoryInfo.label}.`);
  };

  const handleResetCategoryDeck = () => {
    let defaults: CustomCard[] = [];
    if (selectedCategory === 'youth') defaults = generateDefaultYouthCustomCards();
    else if (selectedCategory === 'street') defaults = generateDefaultStreetCustomCards();
    else if (selectedCategory === 'career') defaults = generateDefaultCareerCustomCards();
    else if (selectedCategory === 'life') defaults = generateDefaultLifeCustomCards();
    else if (selectedCategory === 'sponsor') defaults = generateDefaultSponsorCustomCards();
    else if (selectedCategory === 'agent') defaults = generateDefaultAgentCustomCards();
    else if (selectedCategory === 'parents') defaults = generateDefaultParentCustomCards();
    else if (selectedCategory === 'match_day') defaults = generateDefaultMatchDayCustomCards();
    else if (selectedCategory === 'interview') defaults = generateDefaultInterviewCustomCards();

    setCards((prev) => {
      const otherCards = prev.filter((c) => !matchesCategory(c.category, selectedCategory));
      return [...otherCards, ...defaults];
    });

    showToast(`⚡ Reset official ${activeCategoryInfo.label} deck! (${defaults.length} cards)`);
  };

  const handleSaveCategoryCards = () => {
    if (allCategoryCards.length === 0) {
      showToast(`No cards in ${activeCategoryInfo.label} to save.`);
      return;
    }
    const exportData = {
      category: selectedCategory,
      exportedAt: new Date().toISOString(),
      cards: allCategoryCards,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const fileName = `deck_${selectedCategory}_${new Date().toISOString().slice(0, 10)}.json`;
    safeDownloadBlob(blob, fileName, {
      shareTitle: `Deck Export - ${activeCategoryInfo.label}`,
      shareText: `Export of ${allCategoryCards.length} cards from ${activeCategoryInfo.label}`,
    }).catch(() => {});
    showToast(`💾 Exported ${allCategoryCards.length} cards from ${activeCategoryInfo.label}!`);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedCards: CustomCard[] = Array.isArray(parsed) ? parsed : parsed.cards;

        if (Array.isArray(importedCards) && importedCards.length > 0) {
          const validated = importedCards.map((c, i) => ({
            ...c,
            id: c.id || `imported-card-${Date.now()}-${i}`,
            createdAt: c.createdAt || new Date().toISOString(),
            modifiers: Array.isArray(c.modifiers) ? c.modifiers : [],
          }));

          setCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newToAdd = validated.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newToAdd];
          });
          showToast(`📥 Successfully imported ${validated.length} cards!`);
        } else {
          showToast('No valid cards found in JSON file.');
        }
      } catch (err) {
        showToast('Error parsing JSON document file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatModifierDescriptions = (mods: CardModifier[]): string[] => {
    return mods.map((m) => {
      if (m.target === 'perk') {
        return `${m.perkAction === 'add' ? 'Adds' : 'Removes'} Trait: ${m.perkName || 'Custom Perk'}`;
      }
      const targetLabel = MODIFIER_TARGETS.find((t) => t.id === m.target)?.label.split(' ')[0] || m.target;
      const sign = m.operation === 'add' ? '+' : '-';
      const unit = m.valueType === 'percentage' ? '%' : '';
      if (m.target === 'money' || m.target === 'starting_cash') {
        return `${sign}€${m.value.toLocaleString()}`;
      }
      return `${sign}${m.value}${unit} ${targetLabel}`;
    });
  };

  return (
    <div className="w-full bg-[#0d0e15] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* TOP TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              CARD SYSTEM & DECK EDITOR
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official 7 Families
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage Youth Academy, Street, Career, Lifestyle, Sponsor, Agent, and Parent decks with real gameplay effects
            </p>
          </div>
        </div>

        {/* Global Import/Export Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Import Deck
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJsonFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleSaveCategoryCards}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Save Category
          </button>
        </div>
      </div>

      {/* 7 CARD FAMILIES SELECTOR */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
          Card Type / Family ({CATEGORIES.length}):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCardCount(cards, cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  haptics.lightTap();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? `bg-gradient-to-b ${cat.color} text-white border-white shadow-xl scale-[1.03] ring-2 ring-white/30`
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs font-black leading-tight line-clamp-1">{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full mt-1.5 font-bold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {count} Cards
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE CATEGORY BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${activeCategoryInfo.color} flex items-center justify-center text-white shadow-lg`}>
            {React.createElement(activeCategoryInfo.icon, { className: 'w-6 h-6' })}
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              {activeCategoryInfo.label} Cards
              <span className="text-xs font-mono font-bold text-slate-400">
                ({allCategoryCards.length} in deck)
              </span>
            </h3>
            <p className="text-xs text-slate-400">{activeCategoryInfo.desc}</p>
          </div>
        </div>

        {/* Action Controls for Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetCategoryDeck}
            className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/80 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset Official Pool
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Card
          </button>

          <button
            onClick={handleClearCategoryCards}
            disabled={allCategoryCards.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              allCategoryCards.length === 0
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear Category
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Effect Category Sub-Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'all'
                ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-slate-800 text-slate-300">
              {allCategoryCards.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('positive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'positive'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60 hover:bg-emerald-900/40'
            }`}
          >
            <span>🟢 Positive</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-emerald-950 text-emerald-200">
              {allCategoryCards.filter((c) => getCardEffectCategory(c) === 'positive' && !isCardTemporal(c)).length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('negative')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'negative'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                : 'bg-rose-950/40 text-rose-300 border-rose-900/60 hover:bg-rose-900/40'
            }`}
          >
            <span>🔴 Negative (Scrap/Rust/Ash/Disaster)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-rose-950 text-rose-200">
              {allCategoryCards.filter((c) => getCardEffectCategory(c) === 'negative' && !isCardTemporal(c)).length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('double_edged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'double_edged'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-purple-950/40 text-purple-300 border-purple-900/60 hover:bg-purple-900/40'
            }`}
          >
            <span>⚔️ Double-Edged (Blade Tiers)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-purple-950 text-purple-200">
              {allCategoryCards.filter((c) => getCardEffectCategory(c) === 'double_edged' && !isCardTemporal(c)).length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('temporal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              selectedFilter === 'temporal'
                ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                : 'bg-sky-950/40 text-sky-300 border-sky-900/60 hover:bg-sky-900/40'
            }`}
          >
            <span>⏳ Temporal (6m / 1y)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black bg-sky-950 text-sky-200">
              {allCategoryCards.filter((c) => isCardTemporal(c)).length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* CARDS VISUAL GRID */}
      {filteredCards.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-300">No Cards Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No cards match the active filters in this category. Click "Create Card" or "Reset Official Pool".
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card, idx) => {
            const effCat = getCardEffectCategory(card);
            const isTemp = isCardTemporal(card);
            const effectDescs = formatModifierDescriptions(card.modifiers);

            return (
              <div key={card.id} className="flex flex-col space-y-2 group">
                <CardVisualRenderer
                  name={card.name}
                  cardFamily={card.category}
                  categoryLabel={CATEGORIES.find((c) => matchesCategory(card.category, c.id))?.label || card.category}
                  categoryType={isTemp ? 'temporal' : effCat}
                  effectCategory={isTemp ? 'temporal' : effCat}
                  temporalSubtype={card.temporalSubtype}
                  isTemporal={isTemp}
                  duration={card.duration}
                  tier={card.tier}
                  rarity={card.tier}
                  description={card.description}
                  effectDescriptions={effectDescs}
                  iconName={card.iconName}
                  index={idx}
                />

                {/* Card Management Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 px-1">
                  <button
                    onClick={() => handleTestApplyCard(card)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-slate-950 border border-slate-800 hover:border-emerald-500 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                    title="Test-apply card modifiers directly to active player"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Test Apply
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(card)}
                    className="p-1.5 bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-800 hover:border-blue-500 rounded-lg transition-all"
                    title="Edit card"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicateCard(card)}
                    className="p-1.5 bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500 rounded-lg transition-all"
                    title="Duplicate card"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-800 hover:border-rose-500 rounded-lg transition-all"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#11121c] border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${activeCategoryInfo.color} flex items-center justify-center text-white`}>
                  {React.createElement(activeCategoryInfo.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingCardId ? 'Edit Card' : 'Create Custom Card'}
                  </h3>
                  <p className="text-xs text-slate-400">Card Family: {activeCategoryInfo.label}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCardId(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: FORM CONTROLS (7 Cols) */}
              <form onSubmit={handleCreateCardSubmit} className="lg:col-span-7 space-y-4">
                {/* 1. CARD FAMILY SELECTION */}
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5">
                    1. Card Family *
                  </label>
                  <select
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value as CustomCardCategory)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} Card Family
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. EFFECT CATEGORY */}
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5">
                    2. Effect Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEffectCategoryChange('positive')}
                      className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 ${
                        cardEffectCategory === 'positive'
                          ? 'bg-emerald-950 text-emerald-200 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🟢 Positive</span>
                      <span className="text-[10px] text-slate-400 font-normal">Bronze → Legendary</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEffectCategoryChange('negative')}
                      className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 ${
                        cardEffectCategory === 'negative'
                          ? 'bg-rose-950 text-rose-200 border-rose-500 ring-2 ring-rose-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🔴 Negative</span>
                      <span className="text-[10px] text-slate-400 font-normal">Scrap → Disaster</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEffectCategoryChange('double_edged')}
                      className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 ${
                        cardEffectCategory === 'double_edged'
                          ? 'bg-purple-950 text-purple-200 border-purple-500 ring-2 ring-purple-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>⚔️ Double-Edged</span>
                      <span className="text-[10px] text-slate-400 font-normal">Obsidian → Muramasa</span>
                    </button>
                  </div>
                </div>

                {/* 3. TEMPORAL DURATION TOGGLE */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-sky-300 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTemporalCard}
                        onChange={(e) => setIsTemporalCard(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700"
                      />
                      <span>⏳ Temporal Card (Automatic Expiration)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold font-mono">
                      {isTemporalCard ? 'TEMPORARY' : 'PERMANENT'}
                    </span>
                  </div>

                  {isTemporalCard && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCardDuration('6_months')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          cardDuration === '6_months'
                            ? 'bg-sky-900/80 text-sky-100 border-sky-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        ⏱️ Duration: 6 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardDuration('1_year')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          cardDuration === '1_year'
                            ? 'bg-sky-900/80 text-sky-100 border-sky-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        📅 Duration: 1 Year
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. TIER SELECTOR */}
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5">
                    3. Official Tier *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIERS.filter((t) => t.category === cardEffectCategory).map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setCardTier(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${t.bg} ${
                          cardTier === t.id
                            ? `${t.border} ring-2 ring-blue-400 scale-[1.02] shadow-lg`
                            : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${t.text}`}>{t.label}</span>
                          {cardTier === t.id && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-slate-300/80 mt-0.5 leading-tight">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. CARD NAME & DESCRIPTION */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-black text-slate-300 block mb-1">4. Card Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Masterclass Dribbler, Torn Meniscus, Super-Agent Blitz..."
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-300 block mb-1">5. Description / Backstory</label>
                    <textarea
                      placeholder="Card lore and flavor text..."
                      value={cardDesc}
                      onChange={(e) => setCardDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 h-14 resize-none"
                    />
                  </div>
                </div>

                {/* 6. MODIFIERS BUILDER */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      6. Real Gameplay Modifiers ({modifiers.length})
                    </h4>
                  </div>

                  {/* Modifiers List */}
                  {modifiers.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {modifiers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs flex items-center justify-between font-mono"
                        >
                          <span className="text-slate-300">
                            {m.target === 'perk' ? `Perk: ${m.perkName}` : MODIFIER_TARGETS.find((t) => t.id === m.target)?.label.split(' ')[0]}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-black ${m.operation === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {m.operation === 'add' ? '+' : '-'}{m.value}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveModifier(m.id)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Modifier Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <select
                      value={modTarget}
                      onChange={(e) => setModTarget(e.target.value as ModifierTarget)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs outline-none"
                    >
                      {MODIFIER_TARGETS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={modOp}
                      onChange={(e) => setModOp(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs outline-none font-bold"
                    >
                      <option value="add">+ Add</option>
                      <option value="subtract">- Subtract</option>
                    </select>

                    <input
                      type="number"
                      value={modValue}
                      onChange={(e) => setModValue(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs outline-none font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Modifier
                  </button>
                </div>

                {/* Submit Toolbar */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCardId(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    {editingCardId ? 'Update Card' : 'Save Card to Deck'}
                  </button>
                </div>
              </form>

              {/* RIGHT COLUMN: LIVE CARD VISUAL PREVIEW (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  Live Card Visual Preview
                </span>

                <div className="w-full max-w-sm">
                  <CardVisualRenderer
                    name={cardName || 'Card Name Preview'}
                    cardFamily={cardCategory}
                    categoryLabel={CATEGORIES.find((c) => matchesCategory(cardCategory, c.id))?.label || cardCategory}
                    categoryType={isTemporalCard ? 'temporal' : cardEffectCategory}
                    effectCategory={isTemporalCard ? 'temporal' : cardEffectCategory}
                    temporalSubtype={
                      isTemporalCard
                        ? cardEffectCategory === 'negative'
                          ? 'temporal_negative'
                          : cardEffectCategory === 'double_edged'
                          ? 'temporal_double_edged'
                          : 'temporal_positive'
                        : undefined
                    }
                    isTemporal={isTemporalCard}
                    duration={isTemporalCard ? cardDuration : 'none'}
                    tier={cardTier}
                    rarity={cardTier}
                    description={cardDesc || 'Card description text will appear here...'}
                    effectDescriptions={formatModifierDescriptions(modifiers)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
