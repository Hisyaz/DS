import React, { useState } from 'react';
import {
  BUSINESS_TEMPLATES,
  BusinessTemplate,
  formatEuros,
  createBusinessInstance,
} from '../data/businesses';
import { BusinessItem } from '../types';
import {
  Building2,
  Shirt,
  Dumbbell,
  Utensils,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Check,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { ChoiceSystem } from './ChoiceSystem';

interface BuyBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCash?: number;
  ownedBusinesses?: BusinessItem[];
  onPurchaseBusiness: (newBiz: BusinessItem, cost: number) => void;
  showToast: (msg: string) => void;
}

export const BuyBusinessModal: React.FC<BuyBusinessModalProps> = ({
  isOpen,
  onClose,
  availableCash = 0,
  ownedBusinesses = [],
  onPurchaseBusiness,
  showToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [previewTierMap, setPreviewTierMap] = useState<Record<string, number>>({
    sportswear: 1,
    fitness: 1,
    restaurant: 1,
    vc_fund: 1,
    hotel: 1,
  });

  if (!isOpen) return null;

  const safeOwnedBusinesses = Array.isArray(ownedBusinesses) ? ownedBusinesses : [];
  const safeTemplates = Array.isArray(BUSINESS_TEMPLATES) ? BUSINESS_TEMPLATES : [];

  const selectedTemplate = safeTemplates[currentIndex] || safeTemplates[0];

  if (!selectedTemplate || !selectedTemplate.tiers) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#141622] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            BUSINESS DATA UNAVAILABLE
          </h2>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  const existingBiz = safeOwnedBusinesses.find(
    (b) => b && (b.templateId === selectedTemplate.id || b.name === selectedTemplate.name)
  );
  const isAlreadyOwned = Boolean(existingBiz);

  const currentPreviewTier = (previewTierMap && previewTierMap[selectedTemplate.id]) || (existingBiz?.tier || 1);
  const tierData = (selectedTemplate.tiers && selectedTemplate.tiers[currentPreviewTier]) || {
    cost: 0,
    minRevenue: 0,
    maxRevenue: 0,
  };

  const getBusinessIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-7 h-7 text-blue-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-7 h-7 text-emerald-400" />;
      case 'Utensils':
        return <Utensils className="w-7 h-7 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-purple-400" />;
      case 'Building2':
        return <Building2 className="w-7 h-7 text-rose-400" />;
      default:
        return <Building2 className="w-7 h-7 text-indigo-400" />;
    }
  };

  const selectedTier1Cost = selectedTemplate?.tiers?.[1]?.cost || 0;
  const canAffordSelected = availableCash >= selectedTier1Cost;

  const handleBuy = (template: BusinessTemplate) => {
    const alreadyOwned = safeOwnedBusinesses.some(
      (b) => b && (b.templateId === template.id || b.name === template.name)
    );
    if (alreadyOwned) {
      showToast(`❌ You already own ${template.name}! You can only own one of each business type. Upgrade it in your portfolio.`);
      return;
    }

    const cost = template?.tiers?.[1]?.cost || 0;
    if (availableCash < cost) {
      showToast(`❌ Not enough funds to purchase ${template.name}! Requires ${formatEuros(cost)} (Available: ${formatEuros(availableCash)}).`);
      return;
    }
    const newBiz = createBusinessInstance(template);
    onPurchaseBusiness(newBiz, cost);
    showToast(`💼 Successfully purchased ${template.name} (Tier 1) for ${formatEuros(cost)}!`);
    onClose();
  };

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={safeTemplates.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={() => handleBuy(selectedTemplate)}
      title={selectedTemplate.name}
      subtitle={`${selectedTemplate.category} • Cost: ${formatEuros(selectedTier1Cost)}`}
      selectorLabel={`CHOICE ${currentIndex + 1} OF ${safeTemplates.length}`}
      themeColor="#a855f7"
      accentGradient="from-purple-500 via-pink-400 to-purple-600"
      categoryBadge={
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          BUSINESS INVESTMENT
        </span>
      }
      topActions={
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-mono">
            Funds: <strong className="text-emerald-400">{formatEuros(availableCash)}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      }
      secondaryAction={{
        label: 'Close',
        onClick: onClose,
        variant: 'ghost',
      }}
      confirmLabel={
        isAlreadyOwned
          ? 'ALREADY OWNED'
          : canAffordSelected
          ? `ACQUIRE ${selectedTemplate.name.toUpperCase()} (TIER 1)`
          : `INSUFFICIENT FUNDS (${formatEuros(selectedTier1Cost)})`
      }
      confirmDisabled={isAlreadyOwned || !canAffordSelected}
      confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
    >
      {/* Central Focused Business Display */}
      <div className="w-full max-w-3xl h-full flex flex-col justify-between p-3.5 sm:p-6 bg-slate-900/90 border border-slate-700/70 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden my-auto backdrop-blur-md">
        <div className="space-y-3 sm:space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 sm:p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 shadow-inner shrink-0">
                {getBusinessIcon(selectedTemplate.iconName)}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  {selectedTemplate.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedTemplate.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Franchise Enterprise (Upgradable to Tier 5)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">
                Tier 1 Cost
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                {formatEuros(selectedTier1Cost)}
              </span>
            </div>
          </div>

          {/* Owned Alert */}
          {isAlreadyOwned && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Owned Franchise: Tier {existingBiz?.tier || 1} of 5 Active</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                1 Per Player Limit
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            {selectedTemplate.description}
          </p>

          {/* Margins */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Operating Costs</div>
              <div className="text-sm font-black text-rose-400 font-mono">
                {Math.round((selectedTemplate.operatingCostsPct || 0) * 100)}%
              </div>
              <p className="text-[9px] text-slate-400">Deducted from gross annual revenue</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Net Profit Margin</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {Math.round((selectedTemplate.netProfitPct || 0) * 100)}%
              </div>
              <p className="text-[9px] text-slate-400">Net revenue added to player savings</p>
            </div>
          </div>

          {/* Tier Selector */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tier Specs & Progression Preview
              </span>
              <span className="text-[10px] text-slate-400">Inspect Tier Specs</span>
            </div>

            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((tNum) => {
                const isCurrent = currentPreviewTier === tNum;
                return (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() =>
                      setPreviewTierMap((prev) => ({ ...prev, [selectedTemplate.id]: tNum }))
                    }
                    className={`py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    Tier {tNum}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950/80 border border-purple-500/30 p-2.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-white">Tier {currentPreviewTier} Estimates</span>
                <span className="text-amber-400 font-bold font-mono">
                  {currentPreviewTier === 1
                    ? `Cost: ${formatEuros(tierData.cost || 0)}`
                    : `Upgrade: ${formatEuros(tierData.cost || 0)}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[9px] text-slate-400">Annual Revenue</div>
                  <div className="font-extrabold text-sky-400 font-mono text-[11px] sm:text-xs">
                    {formatEuros(tierData.minRevenue || 0)} – {formatEuros(tierData.maxRevenue || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Est. Net Profit</div>
                  <div className="font-extrabold text-emerald-400 font-mono text-[11px] sm:text-xs">
                    {formatEuros(Math.round((tierData.minRevenue || 0) * (selectedTemplate.netProfitPct || 0)))} – {formatEuros(Math.round((tierData.maxRevenue || 0) * (selectedTemplate.netProfitPct || 0)))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Generate passive off-pitch income every season</span>
          </div>
          <span className="text-purple-300 font-mono font-bold hidden sm:inline">
            Choice {currentIndex + 1} of {safeTemplates.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
