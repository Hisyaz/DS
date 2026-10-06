import React, { useState } from 'react';
import { PlayerCardData, AccountingState, StoreUpgradeItem } from '../types';
import { STORE_TIER_NAMES, STORE_CATEGORY_THEMES } from '../data/storeItems';
import { StoreItemIcon } from './StoreItemIcon';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ArrowLeft,
  ShoppingBag,
  Coins,
  Sparkles,
  CheckCircle2,
  Package,
  Wrench,
  TrendingUp,
  Shield,
  Dumbbell,
  Scissors,
  AlertCircle,
  Clock,
  Heart,
  Zap,
} from 'lucide-react';
import { executeDirectPurchase, getAvailableFunds, PurchaseTarget } from '../utils/directPurchaseSystem';
import type { GeneticOutcomeDetail } from './GeneticActivationModal';

const GeneticActivationModal = React.lazy(() =>
  import('./GeneticActivationModal').then((m) => ({ default: m.GeneticActivationModal }))
);

export interface UniqueCareerStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  accounting?: AccountingState;
  onUpdateAccounting?: (updated: AccountingState) => void;
  storeItems?: StoreUpgradeItem[];
  onUpdateStoreItems?: (items: StoreUpgradeItem[]) => void;
  showToast?: (msg: string) => void;
}

export const UniqueCareerStoreModal: React.FC<UniqueCareerStoreModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
  accounting,
  onUpdateAccounting,
  storeItems = [],
  onUpdateStoreItems,
  showToast,
}) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'consumables' | 'upgrade' | 'season_boost' | 'pro_equipment' | 'special_hair'
  >('all');
  const [isGeneticActivationModalOpen, setIsGeneticActivationModalOpen] = useState(false);

  if (!isOpen) return null;

  const availableCash = getAvailableFunds(accounting);

  const categories: {
    id: 'all' | 'consumables' | 'upgrade' | 'season_boost' | 'pro_equipment' | 'special_hair';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'all', label: 'All Items', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'consumables', label: 'Consumables', icon: <Heart className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'upgrade', label: 'Upgrades', icon: <Wrench className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'season_boost', label: 'Seasonal Boosts', icon: <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'pro_equipment', label: 'Pro Equipment', icon: <Shield className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'special_hair', label: 'Cosmetics', icon: <Scissors className="w-3.5 h-3.5 text-pink-400" /> },
  ];

  const filteredItems = [...storeItems]
    .sort((a, b) => (a.tier || 1) - (b.tier || 1))
    .filter((item) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'pro_equipment')
        return item.category === 'pro_equipment' || item.category === 'equipment';
      if (activeCategory === 'special_hair')
        return item.category === 'special_hair' || item.category === 'cosmetics';
      return item.category === activeCategory;
    });

  const handleBuy = (item: StoreUpgradeItem) => {
    // Check genetic potential activation procedure
    if (item.id === 'upg_genetic_activation') {
      if (item.unlocked || (player as any)?.geneticActivationCompleted) {
        showToast?.('⚠️ Genetic Potential Activation can only be undergone ONCE per career!');
        return;
      }
      const cost = item.costEuros || 100000000;
      if (availableCash < cost) {
        showToast?.(
          `❌ Not enough funds! Genetic Activation requires €${cost.toLocaleString()} (Available: €${availableCash.toLocaleString()}).`
        );
        return;
      }
      setIsGeneticActivationModalOpen(true);
      return;
    }

    const itemCost =
      item.costEuros ||
      (item.tier === 2
        ? 20000
        : item.tier === 3
        ? 75000
        : item.tier === 4
        ? 250000
        : item.tier === 5
        ? 1000000
        : item.tier === 6
        ? 100000000
        : 5000);

    let purchaseType: PurchaseTarget['type'] = 'store_upgrade';
    if (item.category === 'consumables') purchaseType = 'consumable';
    else if (item.category === 'season_boost') purchaseType = 'season_boost';
    else if (item.category === 'pro_equipment' || item.category === 'equipment')
      purchaseType = 'pro_equipment';
    else if (item.category === 'special_hair' || item.category === 'cosmetics')
      purchaseType = 'cosmetic';

    const target: PurchaseTarget = {
      type: purchaseType,
      id: item.id,
      name: item.name,
      categoryLabel: item.category,
      cost: itemCost,
      benefit: item.effectSummary || item.effect || 'Store Item',
      iconType:
        item.category === 'consumables'
          ? 'consumable'
          : item.category === 'season_boost'
          ? 'season_boost'
          : item.category === 'pro_equipment'
          ? 'equipment'
          : item.category === 'special_hair'
          ? 'cosmetic'
          : 'upgrade',
      rawItem: item,
    };

    const result = executeDirectPurchase(target, player, accounting, storeItems);
    if (result.success) {
      onUpdatePlayer(result.updatedPlayer);
      if (onUpdateAccounting && result.updatedAccounting) {
        onUpdateAccounting(result.updatedAccounting);
      }
      if (onUpdateStoreItems && result.updatedStoreItems) {
        onUpdateStoreItems(result.updatedStoreItems);
      }
      showToast?.(result.message);
    } else {
      showToast?.(result.message);
    }
  };

  const handleGeneticApplyOutcome = (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    outcome: GeneticOutcomeDetail
  ) => {
    setIsGeneticActivationModalOpen(false);
    const updated = { ...updatedPlayer, geneticActivationCompleted: true };
    onUpdatePlayer(updated);

    if (onUpdateAccounting) {
      onUpdateAccounting(updatedAccounting);
    }

    if (onUpdateStoreItems) {
      onUpdateStoreItems(
        storeItems.map((i) => (i.id === 'upg_genetic_activation' ? { ...i, unlocked: true } : i))
      );
    }

    showToast?.(`🧬 ${outcome.headline} (${outcome.description})`);
  };

  return (
    <div
      id="unique-career-store-screen"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none font-pixel overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
        {/* CONSOLE FULLSCREEN HEADER */}
        <header className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-900 border-b-2 border-amber-500/70 pixel-bevel-gold flex items-center justify-between shrink-0 shadow-xl z-20">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="unique-career-store-back-button"
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border-2 border-amber-400/80 pixel-bevel-gold cursor-pointer transition-all active:scale-95 shadow-md font-arcade font-black text-xs sm:text-sm tracking-wide"
              title="Return to Career"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>RETURN TO CAREER</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 text-slate-950 pixel-corners pixel-bevel-gold flex items-center justify-center shadow-md">
                <ShoppingBag className="w-4 h-4 text-slate-950" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wider font-arcade">
                CAREER STORE & UPGRADES
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AVAILABLE CASH DISPLAY */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 sm:px-4 sm:py-2 pixel-corners border-2 border-amber-500/70 pixel-bevel-sunken shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Cash:</span>
              <span className="text-xs sm:text-base font-black text-amber-300 font-arcade">
                €{availableCash.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* ACTIVE LOADOUT SUMMARY STRIP */}
        <div className="px-4 sm:px-8 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Active Loadout:</span>
            {player.activeTapingMonths && player.activeTapingMonths > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-black text-[10px]">
                <Shield className="w-3 h-3 text-emerald-400" />
                TAPING ({player.activeTapingMonths} mo)
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">No Taping Active</span>
            )}

            {player.activeSeasonBoosts && player.activeSeasonBoosts.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-purple-950 border border-purple-500/50 text-purple-300 font-black text-[10px]">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                {player.activeSeasonBoosts.length} SEASON BOOST(S)
              </span>
            ) : null}

            {player.recoveryPoints !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-rose-950 border border-rose-500/50 text-rose-300 font-black text-[10px]">
                <Heart className="w-3 h-3 text-rose-400" />
                {player.recoveryPoints} RECOVERY PTS
              </span>
            )}
          </div>

          <div className="sm:hidden text-xs font-black text-amber-300 font-arcade">
            Cash: €{availableCash.toLocaleString()}
          </div>
        </div>

        {/* CATEGORY SELECTOR TABS WITH BIG TARGETS */}
        <div className="flex items-center gap-2 px-4 sm:px-8 py-2.5 bg-slate-950/70 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 pixel-corners text-xs sm:text-sm font-arcade font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border-2 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* STORE ITEMS GRID */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar space-y-4 max-w-7xl w-full mx-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 pixel-corners text-slate-500">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs uppercase font-bold">No items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const isOutOfStock =
                  (item.category === 'consumables' || item.category === 'pro_equipment') &&
                  item.availableStock !== undefined &&
                  item.availableStock <= 0;
                const isUnlocked =
                  item.unlocked &&
                  (item.category === 'upgrade' ||
                    item.category === 'season_boost' ||
                    item.category === 'special_hair');
                const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
                const categoryTheme =
                  STORE_CATEGORY_THEMES[item.category] || STORE_CATEGORY_THEMES.upgrade;
                const isGeneticActivation = item.id === 'upg_genetic_activation';
                const itemCost =
                  item.costEuros ||
                  (item.tier === 2
                    ? 20000
                    : item.tier === 3
                    ? 75000
                    : item.tier === 4
                    ? 250000
                    : item.tier === 5
                    ? 1000000
                    : item.tier === 6
                    ? 100000000
                    : 5000);
                const canAfford = availableCash >= itemCost;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 pixel-corners border-2 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                      isGeneticActivation
                        ? 'bg-gradient-to-b from-purple-950/60 to-slate-950 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : isUnlocked
                        ? 'bg-emerald-950/25 border-emerald-500/50'
                        : isOutOfStock
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : 'bg-slate-950/85 border-slate-700/80 hover:border-slate-500'
                    } pixel-bevel-raised`}
                  >
                    <div>
                      {/* HEADER: ICON + NAME + BADGES */}
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 mt-0.5">
                          <StoreItemIcon item={item} size="md" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-white truncate">
                              {t(`${item.id}:name`) || t(`STORE_ITEM_${item.id}_NAME`) || t(item.name)}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 pixel-corners border ${tierInfo.color}`}
                            >
                              {tierInfo.name}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 pixel-corners border ${categoryTheme.badge}`}
                            >
                              {categoryTheme.name}
                            </span>
                            {isGeneticActivation && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 pixel-corners border border-rose-500/50 bg-rose-950/40 text-rose-300 animate-pixel-blink">
                                RISKY PROCEDURE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="text-xs text-slate-400 mt-2 font-retro leading-relaxed line-clamp-3">
                        {t(`${item.id}:desc`) || t(`STORE_ITEM_${item.id}_DESC`) || t(item.description)}
                      </p>

                      {/* EFFECT SUMMARY */}
                      <div className="text-xs font-extrabold text-cyan-300 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="line-clamp-2">
                          {t(`${item.id}:effect`) ||
                            t(`STORE_ITEM_${item.id}_EFFECT`) ||
                            t(item.effectSummary || item.effect || '')}
                        </span>
                      </div>

                      {/* ITEM META / STOCK / DURATION */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        {item.category === 'consumables' && (
                          <span
                            className={
                              item.availableStock && item.availableStock > 0
                                ? 'text-emerald-400 font-black'
                                : 'text-rose-400 font-black'
                            }
                          >
                            📦 Stock: {item.availableStock ?? 0}/{item.maxStock ?? 1} (Preseason Refill)
                          </span>
                        )}
                        {item.category === 'pro_equipment' && (
                          <>
                            <span className="text-amber-300">
                              ⏱️ {item.matchDuration || item.durability?.max || 10} Matches Duration
                            </span>
                            <span
                              className={
                                item.availableStock && item.availableStock > 0
                                  ? 'text-slate-300'
                                  : 'text-rose-400'
                              }
                            >
                              Stock: {item.availableStock ?? 0}
                            </span>
                          </>
                        )}
                        {item.category === 'upgrade' && (
                          <span
                            className={
                              isGeneticActivation ? 'text-purple-300 font-black' : 'text-amber-400'
                            }
                          >
                            {isGeneticActivation
                              ? '🧬 1-Time Experimental Surgery'
                              : '🏗️ Permanent Facility Upgrade'}
                          </span>
                        )}
                        {item.category === 'season_boost' && (
                          <span className="text-purple-300">⏳ Active For Current Season</span>
                        )}
                        {item.category === 'special_hair' && (
                          <span className="text-pink-300">💈 Hairstyle Cosmetic</span>
                        )}
                      </div>
                    </div>

                    {/* BUY / STATUS FOOTER */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-black text-amber-300 font-arcade">
                          €{itemCost.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-amber-500/80">
                          {item.coinPrice || Math.round(itemCost / 150)} Coins
                        </span>
                      </div>

                      {isUnlocked ? (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {isGeneticActivation ? 'ACTIVATED' : 'ACTIVE'}
                        </span>
                      ) : isOutOfStock ? (
                        <span className="text-xs font-black text-rose-400 px-3 py-1 bg-rose-950/60 border border-rose-800/60 pixel-corners">
                          OUT OF STOCK
                        </span>
                      ) : !canAfford ? (
                        <button
                          disabled
                          className="bg-slate-800 text-slate-500 font-bold px-3 py-1.5 pixel-corners text-xs cursor-not-allowed opacity-60 border border-slate-700"
                          title={`Requires €${itemCost.toLocaleString()}`}
                        >
                          NEED €{itemCost >= 1000000 ? `${(itemCost / 1000000).toFixed(0)}M` : itemCost.toLocaleString()}
                        </button>
                      ) : isGeneticActivation ? (
                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-3.5 py-1.5 pixel-corners text-xs shadow-lg ring-1 ring-purple-400/50 transition-all cursor-pointer active:scale-95 animate-pixel-blink"
                        >
                          🧬 UNDERGO
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          className="px-3.5 py-1.5 pixel-corners text-xs font-arcade font-black uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 pixel-bevel-emerald shadow-md transition-all active:translate-y-0.5 cursor-pointer"
                        >
                          {item.category === 'consumables'
                            ? 'USE'
                            : item.category === 'pro_equipment'
                            ? 'EQUIP'
                            : 'BUY'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RISKY GENETIC ACTIVATION MODAL */}
      {isGeneticActivationModalOpen && (
        <React.Suspense fallback={null}>
          <GeneticActivationModal
            isOpen={isGeneticActivationModalOpen}
            player={player}
            accounting={accounting}
            onClose={() => setIsGeneticActivationModalOpen(false)}
            onApplyOutcome={handleGeneticApplyOutcome}
            showToast={showToast || (() => {})}
          />
        </React.Suspense>
      )}
    </div>
  );
};
