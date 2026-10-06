import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Sparkles,
  Shield,
  Briefcase,
  User,
  Heart,
  TrendingUp,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Split,
  ChevronRight,
  X,
  Award,
} from 'lucide-react';
import { CustomCard, CustomCardCategory } from '../types';
import { getAllDefaultCustomCards } from '../utils/cardDatabaseSystem';
import { safeGetItem } from '../utils/storageCleaner';
import { CardVisualRenderer } from './CardVisualRenderer';

interface PlayerEditorAllCardsPanelProps {
  onSelectCard?: (card: CustomCard) => void;
}

export const PlayerEditorAllCardsPanel: React.FC<PlayerEditorAllCardsPanelProps> = ({
  onSelectCard,
}) => {
  // Load all cards from official default repository plus user custom cards
  const allCards: CustomCard[] = useMemo(() => {
    const defaults = getAllDefaultCustomCards();
    let userCustoms: CustomCard[] = [];
    try {
      const saved = safeGetItem('footballer_custom_cards_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          userCustoms = parsed;
        }
      }
    } catch {
      // ignore
    }
    // deduplicate by id
    const map = new Map<string, CustomCard>();
    defaults.forEach((c) => map.set(c.id, c));
    userCustoms.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPolarity, setSelectedPolarity] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [inspectCard, setInspectCard] = useState<CustomCard | null>(null);

  // Filter Categories
  const categoryFilters = [
    { id: 'ALL', label: 'All Categories', icon: Layers },
    { id: 'parents', label: 'Parent Cards', icon: User },
    { id: 'youth', label: 'Youth Academy Cards', icon: TrendingUp },
    { id: 'street', label: 'Street Cards', icon: Sparkles },
    { id: 'career', label: 'Career Cards', icon: Award },
    { id: 'life', label: 'Lifestyle Cards', icon: Heart },
    { id: 'sponsor', label: 'Sponsor Cards', icon: Briefcase },
    { id: 'agent', label: 'Agent Cards', icon: Shield },
  ];

  // Polarity / Effect Types
  const polarityFilters = [
    { id: 'ALL', label: 'All Effects' },
    { id: 'positive', label: 'Positive', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' },
    { id: 'negative', label: 'Negative', color: 'text-red-400 bg-red-950/40 border-red-500/40' },
    { id: 'double_edged', label: 'Double-Edged', color: 'text-purple-400 bg-purple-950/40 border-purple-500/40' },
    { id: 'temporal', label: 'Temporal', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40' },
  ];

  // Tiers
  const tierFilters = ['ALL', 'bronze', 'silver', 'gold', 'legendary', 'goat', 'ash'];

  // Filtered Cards Computation
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // 1. Category check
      if (selectedCategory !== 'ALL') {
        const cat = card.category.toLowerCase();
        if (selectedCategory === 'parents' && !(cat === 'parents' || cat === 'parent')) return false;
        if (selectedCategory === 'life' && !(cat === 'life' || cat === 'lifestyle')) return false;
        if (selectedCategory === 'agent' && !(cat === 'agent' || cat === 'manager')) return false;
        if (selectedCategory === 'youth' && cat !== 'youth') return false;
        if (selectedCategory === 'street' && cat !== 'street') return false;
        if (selectedCategory === 'career' && cat !== 'career') return false;
        if (selectedCategory === 'sponsor' && cat !== 'sponsor') return false;
      }

      // 2. Polarity / Type check
      if (selectedPolarity !== 'ALL') {
        if (selectedPolarity === 'temporal') {
          const isTemp = card.duration !== 'none' || card.effectCategory === 'temporal' || Boolean(card.temporalSubtype);
          if (!isTemp) return false;
        } else if (selectedPolarity === 'positive') {
          if (card.effectCategory !== 'positive' && card.temporalSubtype !== 'temporal_positive') return false;
        } else if (selectedPolarity === 'negative') {
          if (card.effectCategory !== 'negative' && card.temporalSubtype !== 'temporal_negative') return false;
        } else if (selectedPolarity === 'double_edged') {
          if (card.effectCategory !== 'double_edged' && card.temporalSubtype !== 'temporal_double_edged') return false;
        }
      }

      // 3. Tier check
      if (selectedTier !== 'ALL') {
        if (card.tier.toLowerCase() !== selectedTier.toLowerCase()) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = card.name.toLowerCase().includes(q);
        const inDesc = (card.description || '').toLowerCase().includes(q);
        const inModifiers = card.modifiers.some((m) =>
          m.target.toLowerCase().includes(q) || String(m.value).includes(q)
        );
        const inPerks = card.modifiers.some((m) =>
          m.perkName && m.perkName.toLowerCase().includes(q)
        );
        if (!inName && !inDesc && !inModifiers && !inPerks) return false;
      }

      return true;
    });
  }, [allCards, selectedCategory, selectedPolarity, selectedTier, searchQuery]);

  // Helpers to render category tag
  const getCategoryBadge = (category: string) => {
    const c = category.toLowerCase();
    if (c === 'parents' || c === 'parent') return { label: 'Parent Card', bg: 'bg-indigo-950 text-indigo-300 border-indigo-500/40' };
    if (c === 'youth') return { label: 'Youth Academy Card', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
    if (c === 'street') return { label: 'Street Card', bg: 'bg-amber-950 text-amber-300 border-amber-500/40' };
    if (c === 'career') return { label: 'Career Card', bg: 'bg-blue-950 text-blue-300 border-blue-500/40' };
    if (c === 'life' || c === 'lifestyle') return { label: 'Lifestyle Card', bg: 'bg-rose-950 text-rose-300 border-rose-500/40' };
    if (c === 'sponsor') return { label: 'Sponsor Card', bg: 'bg-yellow-950 text-yellow-300 border-yellow-500/40' };
    if (c === 'agent' || c === 'manager') return { label: 'Agent Card', bg: 'bg-purple-950 text-purple-300 border-purple-500/40' };
    return { label: category, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const getTierBadge = (tier: string) => {
    const t = tier.toLowerCase();
    if (t === 'goat') return 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]';
    if (t === 'legendary') return 'bg-amber-950 text-amber-300 border-amber-400';
    if (t === 'gold') return 'bg-yellow-950 text-yellow-300 border-yellow-500';
    if (t === 'silver') return 'bg-slate-800 text-slate-200 border-slate-400';
    if (t === 'bronze') return 'bg-amber-900/60 text-amber-300 border-amber-700';
    if (t === 'ash' || t === 'scrap' || t === 'rust') return 'bg-red-950 text-red-300 border-red-800';
    return 'bg-slate-800 text-slate-300 border-slate-600';
  };

  return (
    <div id="player-editor-all-cards-panel" className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-4 rounded-xl border border-indigo-500/30 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Card Catalog & Database Explorer</span>
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Player Editor — All Cards</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Explore every card in the game: Parent, Youth Academy, Street, Career, Lifestyle, Sponsor, Manager, Positive, Negative, Double-Edged, and Temporal Cards.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
            Total Cards: <span className="text-amber-400 font-black">{allCards.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-500/40 rounded-lg text-xs font-bold text-indigo-300">
            Showing: <span className="text-white font-black">{filteredCards.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="editor-all-cards-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card name, description, stat target, or perk..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Card Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Polarity & Tier Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
          {/* Polarity / Type */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Effect Polarity & Temporal
            </div>
            <div className="flex flex-wrap gap-1.5">
              {polarityFilters.map((pol) => {
                const isSelected = selectedPolarity === pol.id;
                return (
                  <button
                    key={pol.id}
                    id={`pol-filter-${pol.id}`}
                    onClick={() => setSelectedPolarity(pol.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {pol.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tier Rarity
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tierFilters.map((tier) => {
                const isSelected = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    id={`tier-filter-${tier}`}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
            <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">No cards found matching your active filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedPolarity('ALL');
                setSelectedTier('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCards.map((card) => {
            const catBadge = getCategoryBadge(card.category);
            const tierBadge = getTierBadge(card.tier);
            const isTemporal = card.duration !== 'none' || card.effectCategory === 'temporal' || Boolean(card.temporalSubtype);
            const positiveMods = card.modifiers.filter(
              (m) => m.operation === 'add' && !m.target.includes('bad_') && !m.target.includes('injury')
            );
            const negativeMods = card.modifiers.filter(
              (m) => m.operation === 'subtract' || m.target.includes('bad_') || m.target.includes('injury')
            );

            return (
              <div
                key={card.id}
                id={`card-entry-${card.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-lg hover:shadow-indigo-950/20"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${catBadge.bg}`}>
                      {catBadge.label}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${tierBadge}`}>
                        {card.tier}
                      </span>
                      {isTemporal && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{card.duration === '6_months' ? '6M' : card.duration === '1_year' ? '1Y' : 'Temp'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base font-black text-white leading-tight">{card.name}</h3>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>

                  {/* Modifiers List */}
                  <div className="mt-2.5 space-y-1">
                    {/* Positive Modifiers */}
                    {positiveMods.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {positiveMods.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                          >
                            +{m.value} {m.target.replace('stat_', '').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Negative Modifiers */}
                    {negativeMods.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {negativeMods.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300"
                          >
                            -{m.value} {m.target.replace('stat_', '').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Associated Perks */}
                    {card.modifiers.some((m) => Boolean(m.perkName)) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {card.modifiers.filter((m) => Boolean(m.perkName)).map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center space-x-0.5"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Perk: {m.perkName}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-500 truncate">{card.id}</span>
                  <button
                    id={`inspect-card-btn-${card.id}`}
                    onClick={() => setInspectCard(card)}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visual Card Preview</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect High-Res Visual Card Modal */}
      {inspectCard && (
        <div
          id="inspect-card-visual-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">Full Visual Card Representation</h3>
              </div>
              <button
                onClick={() => setInspectCard(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Card Renderer Instance */}
            <div className="flex justify-center py-2">
              <CardVisualRenderer
                name={inspectCard.name}
                categoryType={inspectCard.effectCategory}
                cardFamily={inspectCard.category}
                tier={inspectCard.tier}
                rarity={inspectCard.tier}
                effectCategory={inspectCard.effectCategory}
                temporalSubtype={inspectCard.temporalSubtype}
                isTemporal={inspectCard.duration !== 'none' || inspectCard.effectCategory === 'temporal' || Boolean(inspectCard.temporalSubtype)}
                duration={inspectCard.duration}
                description={inspectCard.description}
                effectDescriptions={inspectCard.modifiers.map(
                  (m) =>
                    `${m.operation === 'add' ? '+' : '-'}${m.value} ${m.target.replace('stat_', '').toUpperCase()}`
                )}
                disableRevealAnimation={true}
              />
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectCard(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
