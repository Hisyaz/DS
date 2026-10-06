import React, { useState } from 'react';
import { PlayerCardData, StoreUpgradeItem, SkinColor, HairStyle, HairLength, FacialHairStyle, AccessoryType, NeckTattooType, ArmTattooType, FaceTattooType, EarringType, EarringMaterial, EarringGemColor, NecklaceType, KitStyle, KitPattern, KitCollar, EmblemShape, EmblemMode, AccountingState } from '../types';
import { SKIN_COLORS, PALETTE_COLORS, HAIR_ROOT_COLORS, HAIR_DYE_COLORS, ACCESSORY_COLOR_OPTIONS } from '../constants';
import { X, Sparkles, Check, Lock, Palette, Scissors, Shirt, Shield, Eye, AlertCircle, User, RotateCcw } from 'lucide-react';
import {
  calculateWeightedOvr,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
} from '../utils/statCalculations';
import {
  revertPlayerNickname,
  applyPlayerNickname,
  extractPlayerFirstName,
  extractPlayerLastName,
  calculateEmbracedFullName,
  getStartingTypeNickname,
} from '../utils/nicknameSystem';
import {
  getAvailableLastNames,
  switchPlayerLastName,
  formatPersonName,
} from '../utils/originLastNameSystem';
import { t } from '../utils/localizationSystem';
import { PlayerCard } from './PlayerCard';
import { haptics } from '../utils/hapticsSystem';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  accounting?: AccountingState;
  setAccounting?: React.Dispatch<React.SetStateAction<AccountingState>>;
  storeItems: StoreUpgradeItem[];
  setStoreItems: React.Dispatch<React.SetStateAction<StoreUpgradeItem[]>>;
  showToast: (msg: string) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
  accounting,
  setAccounting,
  storeItems,
  setStoreItems,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'skin_hair' | 'facial_hair' | 'tattoos' | 'accessories' | 'kit_emblem' | 'identity'>('skin_hair');

  // Confirmation modal for purchasing locked store cosmetic
  const [purchaseConfirmItem, setPurchaseConfirmItem] = useState<{
    item: StoreUpgradeItem;
    onApply: () => void;
  } | null>(null);

  if (!isOpen) return null;

  // Financial calculations
  const totalSponsorIncome = (accounting?.sponsors || []).reduce((sum, s) => sum + s.yearlyPayment, 0);
  const totalSanctionsCost = (accounting?.sanctions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalBusinessProfit = (accounting?.businesses || []).reduce((sum, b) => sum + (b.revenue - b.expenses), 0);
  const netYearlyIncome = (accounting?.yearlySalary || 0) + totalSponsorIncome + totalBusinessProfit - totalSanctionsCost;
  const availableCash = accounting?.totalSavings !== undefined ? Math.max(0, accounting.totalSavings) : 0;

  // Helper to handle selecting a cosmetic item
  const handleSelectCosmetic = (
    cosmeticType: 'hair_dye' | 'facial_hair' | 'headwear' | 'necklace' | 'earring' | 'tattoo' | 'special_hair',
    cosmeticValue: string,
    applyFn: () => void
  ) => {
    // Find if this cosmetic belongs to a store item
    const storeItem = storeItems.find(
      (i) => i.cosmeticType === cosmeticType && i.cosmeticValue === cosmeticValue
    );

    if (storeItem && !storeItem.unlocked) {
      // Locked cosmetic! Show confirmation popup
      setPurchaseConfirmItem({
        item: storeItem,
        onApply: applyFn,
      });
    } else {
      // Already unlocked or free -> Apply immediately!
      applyFn();
    }
  };

  const handleConfirmPurchase = () => {
    if (!purchaseConfirmItem) return;
    const { item, onApply } = purchaseConfirmItem;
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : 5000);

    if (availableCash < cost) {
      showToast(`❌ Not enough funds! Requires €${cost.toLocaleString()} (Available: €${availableCash.toLocaleString()}).`);
      setPurchaseConfirmItem(null);
      return;
    }

    if (setAccounting) {
      setAccounting((prev) => {
        const current = prev.totalSavings !== undefined ? prev.totalSavings : 0;
        return {
          ...prev,
          totalSavings: Math.max(0, current - cost),
        };
      });
    }

    setStoreItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, unlocked: true } : i))
    );

    // Apply cosmetic change
    onApply();

    // If special hair, grant its specific stat bonuses
    if (item.category === 'special_hair' || item.cosmeticType === 'special_hair') {
      const updatedPlayer = { ...player };
      if (!updatedPlayer.stats) {
        updatedPlayer.stats = { pro: 50, def: 50, cre: 50, men: 50, goa: 50, phy: 50 };
      }
      const isGk = (updatedPlayer.subPosition || updatedPlayer.position || '').toUpperCase() === 'GK';
      if (isGk) {
        const gk = getOrCreateGkDetailed(updatedPlayer.stats);
        if (item.statBonuses) {
          Object.entries(item.statBonuses).forEach(([stat, val]) => {
            if (stat in gk) {
              const key = stat as keyof typeof gk;
              (gk as any)[key] = Math.min(99, ((gk as any)[key] || 50) + (val || 0));
            }
          });
        }
        updatedPlayer.stats = syncCategoryStatsFromGkDetailed(updatedPlayer.stats, gk);
        updatedPlayer.ovr = calculateWeightedOvr('GK', 'GK', updatedPlayer.stats, updatedPlayer.playStyle);
      } else {
        const d = getOrCreateOutfieldDetailed(updatedPlayer.stats);
        if (item.statBonuses) {
          Object.entries(item.statBonuses).forEach(([stat, val]) => {
            if (stat in d) {
              const key = stat as keyof typeof d;
              (d as any)[key] = Math.min(99, ((d as any)[key] || 50) + (val || 0));
            }
          });
        }
        updatedPlayer.stats = syncCategoryStatsFromDetailed(updatedPlayer.stats, d);
        updatedPlayer.ovr = calculateWeightedOvr(
          updatedPlayer.position || 'ST',
          updatedPlayer.subPosition || updatedPlayer.position || 'ST',
          updatedPlayer.stats,
          updatedPlayer.playStyle
        );
      }

      onUpdatePlayer(updatedPlayer);
      showToast(`🟢 Unlocked & Equipped ${item.name}! (-€${cost.toLocaleString()} • ${item.effectSummary || item.effect || 'Bonus Applied'})`);
    } else {
      showToast(`🟢 Unlocked & Equipped ${item.name}! (-€${cost.toLocaleString()})`);
    }

    setPurchaseConfirmItem(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                PLAYER CUSTOMIZATION
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Appearance & Style
                </span>
              </h2>
              <p className="text-xs text-slate-400">Customize hair, dyes, tattoos and accessories.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUB-HEADER TABS */}
        <div className="bg-[#161722] p-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { id: 'skin_hair', label: 'Skin & Hair', icon: Scissors },
            { id: 'facial_hair', label: 'Facial Hair', icon: Palette },
            { id: 'tattoos', label: 'Tattoos', icon: Sparkles },
            { id: 'accessories', label: 'Accessories', icon: Shield },
            { id: 'kit_emblem', label: 'Kit & Emblem', icon: Shirt },
            { id: 'identity', label: 'Name & Nicknames', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* TAB 1: SKIN & HAIR */}
          {activeTab === 'skin_hair' && (
            <div className="space-y-5">
              {/* Skin Tone Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">Skin Tone</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SKIN_COLORS.map((sk) => (
                    <button
                      key={sk.name}
                      onClick={() =>
                        onUpdatePlayer({
                          ...player,
                          biometrics: { ...player.biometrics, skinColor: sk.hex },
                        })
                      }
                      className={`h-10 rounded-xl border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                        player.biometrics.skinColor === sk.hex
                          ? 'border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ backgroundColor: sk.hex }}
                      title={sk.name}
                    >
                      {player.biometrics.skinColor === sk.hex && (
                        <Check className="w-4 h-4 text-slate-900 drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Length Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">Hair Length</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'shaved', label: 'Shaved / Buzz' },
                    { id: 'fade', label: 'Fade Cut' },
                    { id: 'short', label: 'Short Hair' },
                    { id: 'medium', label: 'Medium Hair' },
                    { id: 'long', label: 'Long Hair' },
                    { id: 'special', label: 'Special Cut ✨' },
                  ].map((len) => {
                    const isSelected =
                      player.biometrics.hairLength === len.id ||
                      (len.id === 'special' &&
                        (player.biometrics.hairLength === 'special' || player.biometrics.hairStyle === 'special'));

                    return (
                      <button
                        key={len.id}
                        onClick={() => {
                          if (len.id === 'special') {
                            const unlockedSpecialHairs = storeItems.filter(
                              (i) => i.category === 'special_hair' && i.cosmeticType === 'special_hair' && i.unlocked
                            );
                            const equippedHair = player.biometrics.specialHair;
                            const isEquippedUnlocked = unlockedSpecialHairs.some(
                              (i) => i.specialHairType === equippedHair
                            );

                            if (isEquippedUnlocked && equippedHair) {
                              onUpdatePlayer({
                                ...player,
                                biometrics: {
                                  ...player.biometrics,
                                  hairLength: 'special',
                                  hairStyle: 'special',
                                  specialHair: equippedHair,
                                },
                              });
                            } else if (unlockedSpecialHairs.length > 0) {
                              const chosen = unlockedSpecialHairs[0].specialHairType!;
                              onUpdatePlayer({
                                ...player,
                                biometrics: {
                                  ...player.biometrics,
                                  hairLength: 'special',
                                  hairStyle: 'special',
                                  specialHair: chosen,
                                },
                              });
                              showToast(`✨ Equipped unlocked haircut: ${unlockedSpecialHairs[0].name}`);
                            } else {
                              showToast('🔒 You have not purchased any special hairstyles yet! Unlock one below to equip it.');
                            }
                          } else {
                            onUpdatePlayer({
                              ...player,
                              biometrics: {
                                ...player.biometrics,
                                hairLength: len.id as HairLength,
                                hairStyle: player.biometrics.hairStyle === 'special' ? 'straight' : player.biometrics.hairStyle,
                                specialHair: undefined,
                              },
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{len.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Style Selector */}
              {(() => {
                const isShavedOrSpecial =
                  player.biometrics.hairLength === 'shaved' ||
                  player.biometrics.hairLength === 'special' ||
                  player.biometrics.hairStyle === 'special';

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-300 block">Hair Style</label>
                      {isShavedOrSpecial && (
                        <span className="text-[10px] text-amber-400 font-medium">
                          (Not applicable for {player.biometrics.hairLength === 'shaved' ? 'Shaved' : 'Special Cut'})
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'straight', label: 'Straight' },
                        { id: 'wavy', label: 'Wavy' },
                        { id: 'curly', label: 'Curly' },
                        { id: 'braided', label: 'Braided' },
                        { id: 'dreads', label: 'Dreadlocks' },
                      ].map((style) => {
                        const isSelected = !isShavedOrSpecial && player.biometrics.hairStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            disabled={isShavedOrSpecial}
                            onClick={() => {
                              onUpdatePlayer({
                                ...player,
                                biometrics: {
                                  ...player.biometrics,
                                  hairStyle: style.id as HairStyle,
                                  hairLength: player.biometrics.hairLength === 'special' ? 'short' : player.biometrics.hairLength,
                                },
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isShavedOrSpecial
                                ? 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow cursor-pointer'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer'
                            }`}
                          >
                            <span className="text-xs font-bold">{style.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Special Hairstyles Catalog & Store Unlock */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      SPECIAL HAIRSTYLES & LEGENDARY CUTS
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select an unlocked haircut or purchase legendary cuts from the Career Store.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {storeItems
                    .filter((i) => i.category === 'special_hair' && i.cosmeticType === 'special_hair')
                    .map((item) => {
                      const specType = item.specialHairType || 'cucurella-afro';
                      const isSpecialActive =
                        (player.biometrics.hairLength === 'special' || player.biometrics.hairStyle === 'special') &&
                        player.biometrics.specialHair === specType;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (!item.unlocked) {
                              setPurchaseConfirmItem({
                                item,
                                onApply: () => {
                                  onUpdatePlayer({
                                    ...player,
                                    biometrics: {
                                      ...player.biometrics,
                                      hairLength: 'special',
                                      hairStyle: 'special',
                                      specialHair: specType,
                                    },
                                  });
                                },
                              });
                            } else {
                              onUpdatePlayer({
                                ...player,
                                biometrics: {
                                  ...player.biometrics,
                                  hairLength: 'special',
                                  hairStyle: 'special',
                                  specialHair: specType,
                                },
                              });
                              showToast(`✨ Equipped ${item.name}!`);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                            isSpecialActive
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                              : item.unlocked
                              ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                              : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:border-amber-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-black flex items-center gap-1.5 text-amber-200">
                                <span>{item.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                            </div>

                            {isSpecialActive ? (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" /> EQUIPPED
                              </span>
                            ) : item.unlocked ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                                UNLOCKED
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shrink-0">
                                <Lock className="w-3 h-3" /> €{item.costEuros.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
                            <span className="text-amber-300 font-semibold">Tier {item.tier || 1} • {item.effectSummary || item.effect || 'Bonus'}</span>
                            {!item.unlocked && (
                              <span className="text-amber-400 font-bold hover:underline">Click to Purchase & Equip</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Hair Dye Color */}
              {(() => {
                const isSpecialHairEquipped =
                  player.biometrics.hairLength === 'special' || player.biometrics.hairStyle === 'special';

                return (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-300 block">Hair Dye Palette</label>
                      {isSpecialHairEquipped && (
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Disabled during Special Hairstyle
                        </span>
                      )}
                    </div>

                    {isSpecialHairEquipped && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Special Hairstyles feature custom signature styling & colors. Switch to a standard haircut to equip hair dyes.</span>
                      </div>
                    )}

                    <div className={`grid grid-cols-4 sm:grid-cols-8 gap-2 ${isSpecialHairEquipped ? 'opacity-40 pointer-events-none' : ''}`}>
                      {HAIR_DYE_COLORS.map((dye) => {
                        const storeItem = storeItems.find(
                          (i) => i.cosmeticType === 'hair_dye' && i.cosmeticValue === dye.hex
                        );
                        const isLocked = storeItem && !storeItem.unlocked;

                        return (
                          <button
                            key={dye.name}
                            disabled={isSpecialHairEquipped}
                            onClick={() => {
                              if (isSpecialHairEquipped) {
                                showToast('ℹ️ Special Hairstyles have signature colors and disable hair dyes.');
                                return;
                              }
                              handleSelectCosmetic('hair_dye', dye.hex, () =>
                                onUpdatePlayer({
                                  ...player,
                                  biometrics: { ...player.biometrics, hairDye: dye.hex },
                                })
                              );
                            }}
                            className={`h-9 rounded-xl border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                              player.biometrics.hairDye === dye.hex && !isSpecialHairEquipped
                                ? 'border-purple-400 scale-105 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                            style={{ backgroundColor: dye.hex }}
                            title={`${dye.name}${isLocked ? ` (Locked - Tier ${storeItem?.tier || 1} • €${storeItem?.costEuros.toLocaleString()})` : ''}`}
                          >
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-slate-900 drop-shadow bg-amber-400/80 p-0.5 rounded-full" />
                            ) : player.biometrics.hairDye === dye.hex && !isSpecialHairEquipped ? (
                              <Check className="w-4 h-4 text-slate-900 drop-shadow" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: FACIAL HAIR (Age Gated) */}
          {activeTab === 'facial_hair' && (() => {
            const playerAge = player.age || 16;
            const facialHairOptions = [
              { id: 'none', label: 'Clean Shaven', minAge: 0, desc: 'Clean shaven fresh look' },
              { id: 'pubescent-moustache', label: 'Pubescent Moustache', minAge: 10, desc: 'Early youth moustache (+1 Fame)' },
              { id: '3-day-beard', label: '3-Day Stubble', minAge: 16, desc: 'Rugged stubble (+1 Strength)' },
              { id: 'well-kept', label: 'Well-Kept Beard', minAge: 18, desc: 'Sharp trimmed beard (+5 Strength)' },
              { id: 'chin-strap', label: 'Chin Strap', minAge: 18, desc: 'Crisp jawline beard (+5 Crossing)' },
              { id: 'goatee', label: 'Goatee', minAge: 18, desc: 'Classic goatee (+5 Positioning)' },
              { id: 'mutton-chops', label: 'Mutton Chops', minAge: 18, desc: 'Sideburn chops (+10 Strength)' },
              { id: 'wild-beard', label: 'Wild Beard', minAge: 18, desc: 'Warrior full beard (+10 Heading)' },
              { id: 'royal-beard', label: 'Royal Beard', minAge: 18, desc: 'Imperial beard (+18 Stats distributed < 99)' },
            ];

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                    Facial Hair Style (Age-Gated)
                  </label>
                  <span className="text-xs text-purple-300 font-bold bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md">
                    Player Age: {playerAge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {facialHairOptions.map((fh) => {
                    const isAgeLocked = playerAge < fh.minAge;
                    const storeItem = storeItems.find(
                      (i) => i.cosmeticType === 'facial_hair' && i.cosmeticValue === fh.id
                    );
                    const isLocked = !isAgeLocked && storeItem && !storeItem.unlocked;
                    const isSelected = (player.biometrics.facialHairStyle || 'none') === fh.id;

                    return (
                      <button
                        key={fh.id}
                        disabled={isAgeLocked}
                        onClick={() => {
                          if (isAgeLocked) {
                            showToast(`🔒 Requires Age ${fh.minAge}+ (Current Age: ${playerAge})`);
                            return;
                          }
                          handleSelectCosmetic('facial_hair', fh.id, () =>
                            onUpdatePlayer({
                              ...player,
                              biometrics: { ...player.biometrics, facialHairStyle: fh.id as FacialHairStyle },
                            })
                          );
                        }}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                          isAgeLocked
                            ? 'bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow cursor-pointer'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1">
                              <span>{fh.label}</span>
                              {fh.minAge > 0 && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                                  Age {fh.minAge}+
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{fh.desc}</p>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                        </div>

                        {isAgeLocked ? (
                          <div className="text-[10px] text-rose-400/90 font-bold flex items-center gap-1 pt-1 border-t border-slate-800/40">
                            <Lock className="w-3 h-3" /> Unlocks at Age {fh.minAge}
                          </div>
                        ) : isLocked ? (
                          <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pt-1 border-t border-slate-800/60">
                            <Lock className="w-3 h-3" /> €{storeItem?.costEuros.toLocaleString()} • Click to Purchase
                          </div>
                        ) : fh.minAge > 0 ? (
                          <div className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-slate-800/60">
                            Unlocked
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TAB 3: TATTOOS (Age 18+ Locked) */}
          {activeTab === 'tattoos' && (() => {
            const playerAge = player.age || 16;
            const isUnder18 = playerAge < 18;

            return (
              <div className="space-y-5">
                {isUnder18 && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-amber-200 text-xs">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Tattoos are locked until Age 18.</strong> (Current Age: {playerAge}). Professional studios cannot ink underage players.
                    </span>
                  </div>
                )}

                {/* Neck Tattoos */}
                <div className={`space-y-2 ${isUnder18 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                      Neck Tattoos (Age 18+ • Composure Boosts)
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Throat & Collar placement</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'None (Default)', tier: 0, bonus: '' },
                      { id: 'script', label: 'Script Lettering', tier: 1, bonus: '+5 Bad Fame • +1 Composure' },
                      { id: 'rose', label: 'Rose Neck Tattoo', tier: 2, bonus: '+10 Bad Fame • +3 Composure' },
                      { id: 'wings', label: 'Winged Crest Tattoo', tier: 3, bonus: '+15 Bad Fame • +5 Composure' },
                      { id: 'tribal', label: 'Tribal Neck Tattoo', tier: 4, bonus: '+20 Bad Fame • +10 Composure' },
                      { id: 'blackout', label: 'Blackout Neck Tattoo', tier: 5, bonus: '+20 Bad Fame • +30 Composure' },
                    ].map((tat) => {
                      const storeItem = storeItems.find(
                        (i) => i.cosmeticType === 'tattoo' && i.cosmeticValue === tat.id
                      );
                      const isLocked = storeItem && !storeItem.unlocked;
                      const isSelected = player.accessories.tattooNeck === tat.id || (!player.accessories.tattooNeck && tat.id === 'none');

                      return (
                        <button
                          key={tat.id}
                          type="button"
                          disabled={isUnder18}
                          onClick={() =>
                            handleSelectCosmetic('tattoo', tat.id, () =>
                              onUpdatePlayer({
                                ...player,
                                accessories: { ...player.accessories, tattooNeck: tat.id as NeckTattooType },
                              })
                            )
                          }
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold">{tat.label}</div>
                            {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                          </div>
                          {tat.bonus && <div className="text-[10px] text-slate-400 font-medium">{tat.bonus}</div>}
                          {tat.tier > 0 && (
                            <div className={`text-[10px] font-bold mt-0.5 ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Tier {tat.tier} • {isLocked ? `€${storeItem?.costEuros.toLocaleString() || '10,000'}` : 'Unlocked'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arm Tattoos */}
                <div className={`space-y-2 pt-2 border-t border-slate-800/80 ${isUnder18 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                      Arm Sleeve Tattoos (Age 18+ • Technique & Physical Boosts)
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Forearm & Full sleeves</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'None (Default)', tier: 0, bonus: '' },
                      { id: 'double-stripe', label: 'Double Stripe Band', tier: 1, bonus: '+1 Short Pass' },
                      { id: 'script-sleeve', label: 'Script / Name Sleeve', tier: 2, bonus: '+3 Dribbling' },
                      { id: 'tribal', label: 'Tribal Sleeve', tier: 3, bonus: '+5 Ball Control' },
                      { id: 'mandala-sleeve', label: 'Floral Mandala Sleeve', tier: 4, bonus: '+10 Long Pass' },
                      { id: 'blackout-sleeve', label: 'Blackout Sleeve', tier: 5, bonus: '+10 Bad Fame • +15 Strength' },
                    ].map((tat) => {
                      const storeItem = storeItems.find(
                        (i) => i.cosmeticType === 'tattoo' && i.cosmeticValue === tat.id
                      );
                      const isLocked = storeItem && !storeItem.unlocked;
                      const isSelected = player.accessories.tattooArmL === tat.id || (!player.accessories.tattooArmL && tat.id === 'none');

                      return (
                        <button
                          key={tat.id}
                          type="button"
                          disabled={isUnder18}
                          onClick={() =>
                            handleSelectCosmetic('tattoo', tat.id, () =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  tattooArmL: tat.id as ArmTattooType,
                                  tattooArmR: tat.id as ArmTattooType,
                                },
                              })
                            )
                          }
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold">{tat.label}</div>
                            {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                          </div>
                          {tat.bonus && <div className="text-[10px] text-slate-400 font-medium">{tat.bonus}</div>}
                          {tat.tier > 0 && (
                            <div className={`text-[10px] font-bold mt-0.5 ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Tier {tat.tier} • {isLocked ? `€${storeItem?.costEuros.toLocaleString() || '15,000'}` : 'Unlocked'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Face Tattoos */}
                <div className={`space-y-2 pt-2 border-t border-slate-800/80 ${isUnder18 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                      Face Tattoos (Age 18+ • Bad Fame & Defense Boosts)
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Cheek, Under-eye & Temple ink</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'None (Default)', tier: 0, bonus: '' },
                      { id: 'star', label: 'Cheek Star', tier: 1, bonus: '+10 Bad Fame • +1 Retention' },
                      { id: 'script-cheek', label: 'Cheek Script', tier: 2, bonus: '+20 Bad Fame • +3 Marking' },
                      { id: 'crown-temple', label: 'Temple Crown', tier: 3, bonus: '+30 Bad Fame • +5 Interceptions' },
                      { id: 'heart', label: 'Heart Cheek', tier: 4, bonus: '+40 Bad Fame • +10 Reactions' },
                      { id: 'under-eye-cross', label: 'Under-Eye Cross', tier: 5, bonus: '+40 Bad Fame • +15 Tackling' },
                    ].map((tat) => {
                      const storeItem = storeItems.find(
                        (i) => i.cosmeticType === 'tattoo' && i.cosmeticValue === tat.id
                      );
                      const isLocked = storeItem && !storeItem.unlocked;
                      const isSelected = player.accessories.tattooFace === tat.id || (!player.accessories.tattooFace && tat.id === 'none');

                      return (
                        <button
                          key={tat.id}
                          type="button"
                          disabled={isUnder18}
                          onClick={() =>
                            handleSelectCosmetic('tattoo', tat.id, () =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  tattooFace: tat.id as FaceTattooType,
                                },
                              })
                            )
                          }
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold">{tat.label}</div>
                            {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                          </div>
                          {tat.bonus && <div className="text-[10px] text-slate-400 font-medium">{tat.bonus}</div>}
                          {tat.tier > 0 && (
                            <div className={`text-[10px] font-bold mt-0.5 ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Tier {tat.tier} • {isLocked ? `€${storeItem?.costEuros.toLocaleString() || '20,000'}` : 'Unlocked'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: ACCESSORIES */}
          {activeTab === 'accessories' && (
            <div className="space-y-5">
              {/* Headwear & Glasses */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                  Headwear & Eyewear
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'headband', label: 'Sports Headband' },
                    { id: 'performance-band', label: 'Performance Band' },
                    { id: 'protective-mask', label: 'Protective Face Mask' },
                    { id: 'sports-glasses', label: 'Sports Glasses' },
                    { id: 'classic-glasses', label: 'Classic Glasses' },
                  ].map((acc) => {
                    const storeItem = storeItems.find(
                      (i) => i.cosmeticType === 'headwear' && i.cosmeticValue === acc.id
                    );
                    const isLocked = storeItem && !storeItem.unlocked;
                    const isSelected = player.accessories.accessory === acc.id || player.accessories.headwear === acc.id;

                    return (
                      <button
                        key={acc.id}
                        onClick={() =>
                          handleSelectCosmetic('headwear', acc.id, () =>
                            onUpdatePlayer({
                              ...player,
                              accessories: {
                                ...player.accessories,
                                accessory: acc.id as AccessoryType,
                                headwear: acc.id as any,
                              },
                            })
                          )
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{acc.label}</div>
                          {isLocked && <div className="text-[10px] text-amber-400 font-bold">Tier {storeItem?.tier || 1} • €{storeItem?.costEuros.toLocaleString()}</div>}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Sports Headband / Elastic Band Color Picker */}
                {(player.accessories.accessory === 'headband' ||
                  player.accessories.headwear === 'headband' ||
                  player.accessories.accessory === 'performance-band' ||
                  player.accessories.headwear === 'performance-band') && (
                  <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl mt-2">
                    <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                      Headband Color
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {ACCESSORY_COLOR_OPTIONS.map((col) => {
                        const currentColor = player.accessories.headbandColor || '#ffffff';
                        const isCurrent = currentColor.toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  headbandColor: col.hex,
                                },
                              })
                            }
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-3 h-3 rounded-full border border-black/40 shadow-sm shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="truncate text-[11px]">{col.name}</span>
                            </span>
                            {isCurrent && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sports Glasses Color Picker */}
                {(player.accessories.accessory === 'sports-glasses' ||
                  (player.accessories.headwear as any) === 'sports-glasses' ||
                  player.accessories.eyewear === 'sports-glasses') && (
                  <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl mt-2">
                    <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                      Sports Glasses Frame & Lens Color
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {ACCESSORY_COLOR_OPTIONS.map((col) => {
                        const currentColor = player.accessories.glassesColor || player.accessories.sportsGlassesColor || '#2563eb';
                        const isCurrent = currentColor.toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  glassesColor: col.hex,
                                  sportsGlassesColor: col.hex,
                                },
                              })
                            }
                            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-3 h-3 rounded-full border border-black/40 shadow-sm shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="truncate text-[11px]">{col.name}</span>
                            </span>
                            {isCurrent && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Earrings */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                    Earrings
                  </label>
                  {(player.accessories as any).earring && (player.accessories as any).earring !== 'none' && (
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                      Customizable
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None', mat: undefined },
                    { id: 'silver', label: 'Silver Earrings', mat: 'silver' as EarringMaterial },
                    { id: 'gold', label: 'Gold Earrings', mat: 'gold' as EarringMaterial },
                    { id: 'steel', label: 'Steel Earrings', mat: 'steel' as EarringMaterial },
                    { id: 'gem', label: 'Gem Earrings', mat: 'silver' as EarringMaterial },
                  ].map((ear) => {
                    const storeItem = storeItems.find(
                      (i) => i.cosmeticType === 'earring' && i.cosmeticValue === ear.id
                    );
                    const isLocked = storeItem && !storeItem.unlocked;
                    const isSelected = (player.accessories as any).earring === ear.id || (!player.accessories.earring && ear.id === 'none');

                    return (
                      <button
                        key={ear.id}
                        onClick={() =>
                          handleSelectCosmetic('earring', ear.id, () =>
                            onUpdatePlayer({
                              ...player,
                              accessories: {
                                ...player.accessories,
                                earringL: ear.id as EarringType,
                                earringR: ear.id as EarringType,
                                earringMaterial: ear.mat || player.accessories.earringMaterial || 'silver',
                                earringGemColor: player.accessories.earringGemColor || 'diamond',
                                earring: ear.id as any,
                              },
                            })
                          )
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{ear.label}</div>
                          {isLocked && <div className="text-[10px] text-amber-400 font-bold">Tier {storeItem?.tier || 1} • €{storeItem?.costEuros.toLocaleString()}</div>}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Earring Material Choice (Shown when any earring style is equipped) */}
                {((player.accessories as any).earring && (player.accessories as any).earring !== 'none') && (
                  <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                      Earring Metal Finish
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {[
                        { id: 'silver', label: 'Silver', color: '#e2e8f0' },
                        { id: 'gold', label: 'Gold', color: '#fbbf24' },
                        { id: 'bronze', label: 'Bronze', color: '#cd7f32' },
                        { id: 'black', label: 'Black', color: '#1e293b' },
                        { id: 'steel', label: 'Steel', color: '#94a3b8' },
                      ].map((mat) => {
                        const isCurrentMat = (player.accessories.earringMaterial || 'silver') === mat.id;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  earringMaterial: mat.id as EarringMaterial,
                                },
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                              isCurrentMat
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm shrink-0"
                                style={{ backgroundColor: mat.color }}
                              />
                              <span className="truncate">{mat.label}</span>
                            </span>
                            {isCurrentMat && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gemstone Color (Shown when 'gem' earring style is selected) */}
                {((player.accessories as any).earring === 'gem' || player.accessories.earringL === 'gem') && (
                  <div className="space-y-1.5 p-3 bg-slate-950/60 border border-purple-900/40 rounded-xl">
                    <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Gemstone Jewel Tint
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {[
                        { id: 'diamond', label: 'Diamond', color: '#38bdf8', glow: 'shadow-[0_0_8px_rgba(56,189,248,0.5)]' },
                        { id: 'white', label: 'Clear Crystal', color: '#ffffff', glow: 'shadow-[0_0_8px_rgba(255,255,255,0.5)]' },
                        { id: 'emerald', label: 'Emerald', color: '#10b981', glow: 'shadow-[0_0_8px_rgba(168,185,129,0.5)]' },
                        { id: 'sapphire', label: 'Sapphire', color: '#3b82f6', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
                        { id: 'amethyst', label: 'Amethyst', color: '#a855f7', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
                      ].map((gem) => {
                        const isCurrentGem = (player.accessories.earringGemColor || 'diamond') === gem.id;
                        return (
                          <button
                            key={gem.id}
                            type="button"
                            onClick={() =>
                              onUpdatePlayer({
                                ...player,
                                accessories: {
                                  ...player.accessories,
                                  earringGemColor: gem.id as EarringGemColor,
                                },
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                              isCurrentGem
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className={`w-2.5 h-2.5 rounded-full border border-white/60 shrink-0 ${gem.glow}`}
                                style={{ backgroundColor: gem.color }}
                              />
                              <span className="truncate">{gem.label}</span>
                            </span>
                            {isCurrentGem && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Necklaces */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                  Necklaces
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'dog-tags', label: 'Military Dog Tag' },
                    { id: 'silver-chain', label: 'Silver Necklace' },
                    { id: 'gold-chain', label: 'Gold Necklace' },
                    { id: 'diamonds-incrusted', label: 'Diamond-Encrusted Gold' },
                  ].map((nec) => {
                    const storeItem = storeItems.find(
                      (i) => i.cosmeticType === 'necklace' && i.cosmeticValue === nec.id
                    );
                    const isLocked = storeItem && !storeItem.unlocked;
                    const isSelected = player.accessories.necklace === nec.id || (!player.accessories.necklace && nec.id === 'none');

                    return (
                      <button
                        key={nec.id}
                        onClick={() =>
                          handleSelectCosmetic('necklace', nec.id, () =>
                            onUpdatePlayer({
                              ...player,
                              accessories: {
                                ...player.accessories,
                                necklace: nec.id as NecklaceType,
                              },
                            })
                          )
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{nec.label}</div>
                          {isLocked && <div className="text-[10px] text-amber-400 font-bold">Tier {storeItem?.tier || 1} • €{storeItem?.costEuros.toLocaleString()}</div>}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KIT & EMBLEM */}
          {activeTab === 'kit_emblem' && (
            <div className="space-y-6">
              {/* LIVE CARD PREVIEW CONTAINER */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/70 mb-2 text-xs">
                  <span className="font-extrabold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Shirt className="w-3.5 h-3.5 text-purple-400" />
                    Live Kit & Sleeve Fit Preview
                  </span>
                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wider">
                    {(player.kit?.style || 'normal').toUpperCase()} FIT ACTIVE
                  </span>
                </div>
                
                <div className="py-2 scale-90 sm:scale-95 origin-center transition-all">
                  <PlayerCard player={player} />
                </div>
                
                <div className="text-[11px] text-slate-400 text-center mt-1 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>Sleeve length, drapery, and arm definition dynamically transform in real time.</span>
                </div>
              </div>

              {/* FIT SELECTOR CARDS */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black text-slate-200 uppercase tracking-wider block">
                    Kit Fit & Sleeve Style
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Select your tailored matchday jersey cut. Adjusts sleeve length, shoulder draping, and arm definition.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'normal' as KitStyle,
                      title: 'Standard Athletic Fit (Normal)',
                      badge: 'NORMAL',
                      sleeveLabel: 'Arm-level mid-bicep sleeves',
                      description: 'Classic athletic drape with clean hem and balanced mid-bicep clearance.',
                    },
                    {
                      id: 'loose' as KitStyle,
                      title: 'Classic Retro Loose (Loose)',
                      badge: 'RETRO LOOSE',
                      sleeveLabel: 'Elbow-level draped sleeves',
                      description: 'Authentic 90s baggy drape with longer oversized sleeves reaching the elbow and retro fabric fold creases.',
                    },
                    {
                      id: 'tight' as KitStyle,
                      title: 'Pro Compression (Tight)',
                      badge: 'PRO TIGHT',
                      sleeveLabel: 'High-cut lifted sleeves',
                      description: 'Muscle-hugging compression fit accentuating arm vascularity, muscle definition, and tattoos.',
                    },
                  ].map((ks) => {
                    const isSelected = (player.kit?.style || 'normal') === ks.id;
                    return (
                      <button
                        key={ks.id}
                        onClick={() => {
                          let cleanClub = player.club;
                          if (typeof cleanClub !== 'string') {
                            if (cleanClub && typeof cleanClub === 'object') {
                              const chars: string[] = [];
                              let i = 0;
                              while (i in (cleanClub as any)) {
                                chars.push((cleanClub as any)[i]);
                                i++;
                              }
                              cleanClub = chars.length > 0 ? chars.join('') : 'Bastille Athletic';
                            } else {
                              cleanClub = 'Bastille Athletic';
                            }
                          }

                          haptics.lightTap();
                          const updatedKit = {
                            ...(player.kit || {
                              style: 'normal',
                              color1: '#2563eb',
                              color2: '#ffffff',
                              pattern: 'solid',
                              collar: 'crew',
                            }),
                            style: ks.id,
                          };

                          onUpdatePlayer({
                            ...player,
                            club: cleanClub,
                            kit: updatedKit,
                          });
                          showToast(`Equipped ${ks.title}`);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-b from-purple-900/40 to-slate-900 border-purple-400 text-white shadow-lg shadow-purple-950/30 ring-1 ring-purple-400/40'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-purple-500/20">
                              {ks.badge}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="font-bold text-xs text-white group-hover:text-purple-200 transition-colors">
                            {ks.title}
                          </div>

                          <div className="text-[10px] font-semibold text-purple-300/90">
                            {ks.sleeveLabel}
                          </div>

                          <p className="text-[10.5px] text-slate-400 leading-snug pt-1">
                            {ks.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: IDENTITY (LAST NAME ORIGIN & NICKNAMES) */}
          {activeTab === 'identity' && (() => {
            const hasActiveNickname = Boolean(player.nickname && player.nicknameAccepted && player.nickname.trim());
            const originalFirstName = extractPlayerFirstName(player);
            const playerLastName = extractPlayerLastName(player);
            const availableLastNames = getAvailableLastNames(player);

            // Collect all unique obtained nicknames (including player.nickname)
            const allNicknamesSet = new Set<string>(player.obtainedNicknames || []);
            if (player.nickname && player.nickname.trim()) {
              allNicknamesSet.add(player.nickname.trim());
            }
            if (player.playerTypeId) {
              const startingNick = getStartingTypeNickname(player.playerTypeId, player.startingCity || player.city);
              if (startingNick) {
                allNicknamesSet.add(startingNick);
              }
            }
            const allNicknames = Array.from(allNicknamesSet);

            return (
              <div className="space-y-5">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Current Matchday Name
                    </span>
                    <span className="text-xs font-black text-amber-300 font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md">
                      {player.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">{t('ORIGINAL_BIRTH_NAME') || 'Original Birth Name'}</span>
                      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 font-bold">
                        {originalFirstName}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">{t('LAST_NAME') || 'Last Name'}</span>
                      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 font-bold">
                        {playerLastName || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LAST NAME SELECTION: FAMILY HERITAGE VS ORIGIN CITY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <User className="w-4 h-4 text-sky-400" />
                      Last Name & Origin Style
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Active: <strong className="text-white font-mono">{playerLastName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableLastNames.map((opt) => {
                      const isSelected = opt.isEquipped;

                      return (
                        <div
                          key={opt.type}
                          onClick={() => {
                            if (isSelected) return;
                            const updated = switchPlayerLastName(player, opt.type);
                            onUpdatePlayer(updated);
                            haptics.selection();
                            showToast(`✨ Equipped ${opt.label}: ${opt.name}`);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-sky-950/50 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-sky-500/40'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black flex items-center gap-2">
                              <span className={isSelected ? 'text-sky-300' : 'text-slate-200'}>{opt.label}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-sky-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> EQUIPPED
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-white mt-1 tracking-tight">
                              {opt.name}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{opt.description}</p>
                          </div>

                          {!isSelected && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded-md font-bold shrink-0">
                              EQUIP
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nickname selection library */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Obtained Nicknames Library
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {allNicknames.length} Nickname{allNicknames.length === 1 ? '' : 's'} Unlocked
                    </span>
                  </div>

                  {/* Option to use Original Birth Name */}
                  <div
                    onClick={() => {
                      const updated = revertPlayerNickname(player);
                      onUpdatePlayer(updated);
                      showToast(`✨ Reverted to original birth name: ${updated.name}`);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      !hasActiveNickname
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-2">
                        <span>Original Birth Name</span>
                        {!hasActiveNickname && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {originalFirstName} {playerLastName}
                      </p>
                    </div>
                    {!hasActiveNickname && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {/* List of obtained nicknames */}
                  {allNicknames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allNicknames.map((nick) => {
                        const isThisNickEquipped = hasActiveNickname && player.nickname === nick;

                        return (
                          <div
                            key={nick}
                            onClick={() => {
                              const updated = applyPlayerNickname(player, nick);
                              onUpdatePlayer(updated);
                              showToast(`✨ Equipped Nickname: "${nick}" (${updated.name})`);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isThisNickEquipped
                                ? 'bg-amber-950/50 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-amber-500/40'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                                <span>"{nick}"</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Click to equip as matchday name</p>
                            </div>

                            {isThisNickEquipped ? (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" /> EQUIPPED
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded-md font-bold shrink-0">
                                EQUIP
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        No nicknames earned yet. When commentators or fans give you nicknames (e.g. "Wonderkid", "El Mago"), they will all be stored here forever, even if initially declined!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* FOOTER CLOSE BUTTON */}
        <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer text-center"
          >
            DONE CUSTOMIZING
          </button>
        </div>
      </div>

      {/* --- CONFIRMATION POPUP FOR PURCHASING LOCKED STORE COSMETIC --- */}
      {purchaseConfirmItem && (() => {
        const itemCost = purchaseConfirmItem.item.costEuros || (purchaseConfirmItem.item.tier === 2 ? 20000 : purchaseConfirmItem.item.tier === 3 ? 75000 : purchaseConfirmItem.item.tier === 4 ? 250000 : purchaseConfirmItem.item.tier === 5 ? 1000000 : 5000);
        const canAfford = availableCash >= itemCost;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#181a26] border border-amber-500/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">PURCHASE THIS COSMETIC?</h3>
                <p className="text-xs text-slate-300 font-bold mt-1">{purchaseConfirmItem.item.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{purchaseConfirmItem.item.description}</p>
                <div className="mt-3 bg-amber-950/60 border border-amber-500/40 py-2 px-3 rounded-xl inline-block text-xs font-black text-amber-300">
                  Tier {purchaseConfirmItem.item.tier || 1} • €{itemCost.toLocaleString()}
                  <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
                    Available: €{availableCash.toLocaleString()}
                  </div>
                  {(purchaseConfirmItem.item.effectSummary || purchaseConfirmItem.item.effect) && (
                    <div className="text-[11px] text-amber-200 mt-1 font-semibold">
                      ✨ {purchaseConfirmItem.item.effectSummary || purchaseConfirmItem.item.effect}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {canAfford ? (
                  <button
                    onClick={handleConfirmPurchase}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🟢</span> PURCHASE
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-slate-800 text-slate-500 border border-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed"
                  >
                    INSUFFICIENT FUNDS
                  </button>
                )}
                <button
                  onClick={() => setPurchaseConfirmItem(null)}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🔴</span> CANCEL
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
