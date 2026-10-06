import React, { useState } from 'react';
import {
  Shield,
  Building,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Briefcase,
  AlertTriangle,
  X,
  Target,
  GraduationCap,
  Globe,
  Clock,
  Star,
  Users,
} from 'lucide-react';
import { PlayerConfig, ManagerState, AgentState } from '../types';
import { Age16TransferOffer } from '../utils/age16TransferSystem';
import { calculateEffectiveFame } from '../utils/professionalOfferEligibility';
import { t } from '../utils/localizationSystem';
import { ChoiceSystem } from './ChoiceSystem';

interface Age16TransferOffersModalProps {
  player: PlayerConfig;
  offers: Age16TransferOffer[];
  isOpen: boolean;
  onAcceptOffer: (offer: Age16TransferOffer) => void;
  onClose?: () => void;
  onDeclineAllOffers?: () => void;
  manager?: ManagerState | AgentState | null;
  onLaunchTryouts?: () => void;
  onSpeakWithAgent?: () => void;
}

export const Age16TransferOffersModal: React.FC<Age16TransferOffersModalProps> = ({
  player,
  offers: initialOffers,
  isOpen,
  onAcceptOffer,
  onClose,
  onDeclineAllOffers,
  manager,
  onLaunchTryouts,
  onSpeakWithAgent,
}) => {
  const [activeOffers, setActiveOffers] = useState<Age16TransferOffer[]>(initialOffers);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  React.useEffect(() => {
    setActiveOffers(initialOffers);
    setCurrentIndex((prev) => (prev >= initialOffers.length ? 0 : prev));
  }, [initialOffers]);

  if (!isOpen) return null;

  const rawFame = player.fame || 0;
  const effectiveFame = calculateEffectiveFame(rawFame, manager);
  const ovr = player.ovr || 65;
  const hasAgent = Boolean(
    manager && manager.name && !manager.name.includes('Self-Managed') && !manager.name.includes('No current')
  );

  const handleDeclineAll = () => {
    if (onDeclineAllOffers) {
      onDeclineAllOffers();
    } else if (onClose) {
      onClose();
    }
  };

  const handleDeclineSingle = (offerId: string) => {
    const remaining = activeOffers.filter((o) => o.id !== offerId);
    setActiveOffers(remaining);
    if (remaining.length === 0) {
      handleDeclineAll();
    } else {
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  // =========================================================================
  // VIEW A: NO DIRECT OFFERS (ADVISORY & ALTERNATIVE PATHWAYS)
  // =========================================================================
  if (activeOffers.length === 0) {
    return (
      <div
        id="age16-transfer-offers-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md select-none font-pixel animate-in fade-in"
      >
        <div className="relative w-full max-w-2xl bg-slate-950 border-4 border-amber-500/80 pixel-corners pixel-bevel-gold p-5 sm:p-7 text-white shadow-2xl space-y-5 text-left">
          <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-3">
            <div className="w-12 h-12 pixel-corners bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-arcade font-bold text-amber-400 uppercase tracking-wider block">
                {t('AGE16_OFFERS_TAG')}
              </span>
              <h2 className="text-lg sm:text-xl font-arcade font-black text-white uppercase tracking-tight">
                {t('AGE16_OFFERS_NO_DIRECT_TITLE')}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-retro leading-relaxed">
            {t('AGE16_OFFERS_NO_DIRECT_DESC', { ovr: String(ovr), effectiveFame: String(effectiveFame) })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Pathway 1: Perform Club Tryouts */}
            <div className="p-3.5 bg-slate-900 border-2 border-emerald-500/40 pixel-corners flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-arcade font-bold text-emerald-300 text-xs flex items-center gap-1.5 uppercase">
                  <span>🏃 Perform Club Tryouts</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-retro mt-1 leading-relaxed">
                  Attend regional professional combine tryouts to earn a senior contract directly through your pitch performance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onLaunchTryouts) onLaunchTryouts();
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs uppercase pixel-corners pixel-bevel-emerald transition cursor-pointer"
              >
                Launch Club Tryouts
              </button>
            </div>

            {/* Pathway 2: Speak with Agent */}
            <div className="p-3.5 bg-slate-900 border-2 border-purple-500/40 pixel-corners flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-arcade font-bold text-purple-300 text-xs flex items-center gap-1.5 uppercase">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>{hasAgent ? 'Consult Your Agent' : 'Acquire Agent Representation'}</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-retro mt-1 leading-relaxed">
                  {hasAgent
                    ? `Your agent (${manager?.name}) can leverage industry networking to unlock trial opportunities.`
                    : 'Hiring an agent calculates Effective Fame using 50% player fame + 50% agent networking.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onSpeakWithAgent) onSpeakWithAgent();
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-arcade font-black text-xs uppercase pixel-corners pixel-bevel-raised transition cursor-pointer"
              >
                {hasAgent ? 'Speak with Agent' : 'Explore Agents'}
              </button>
            </div>
          </div>

          {/* Decline & Continue Youth Development */}
          <div className="pt-2 border-t-2 border-slate-850 flex justify-end">
            <button
              type="button"
              onClick={handleDeclineAll}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-slate-700 pixel-corners font-arcade font-bold text-xs uppercase pixel-bevel-raised transition cursor-pointer"
            >
              {t('AGE16_OFFERS_CONTINUE_YOUTH_BTN')} ({player.club || 'Youth Club'})
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: SINGLE-CARD CAROUSEL (ARCADE DRILL-DOWN FLOW)
  // =========================================================================
  const currentOffer = activeOffers[currentIndex] || activeOffers[0];

  const getCategoryBadge = (category?: 'local' | 'money' | 'development' | 'glory') => {
    switch (category) {
      case 'local':
        return {
          icon: '🏛️',
          label: t('AGE16_OFFERS_CAT_LOCAL'),
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'money':
        return {
          icon: '💰',
          label: t('AGE16_OFFERS_CAT_MONEY'),
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'development':
        return {
          icon: '🌟',
          label: t('AGE16_OFFERS_CAT_DEV'),
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      case 'glory':
        return {
          icon: '🏆',
          label: t('AGE16_OFFERS_CAT_GLORY'),
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      default:
        return {
          icon: '⚽',
          label: t('AGE16_OFFERS_TAG'),
          badgeClass: 'bg-slate-700 text-slate-200 border-slate-600',
        };
    }
  };

  const catBadge = getCategoryBadge(currentOffer.offerCategory);

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={activeOffers.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={() => onAcceptOffer(currentOffer)}
      title={currentOffer.clubName}
      subtitle={`${currentOffer.leagueName} (${currentOffer.countryName}) • Div ${currentOffer.leagueTier}`}
      selectorLabel={`OFFER ${currentIndex + 1} OF ${activeOffers.length}`}
      themeColor="#10b981"
      accentGradient="from-emerald-400 via-teal-300 to-emerald-500"
      categoryBadge={
        <span className={`px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase tracking-wider border font-arcade ${catBadge.badgeClass}`}>
          {catBadge.icon} {catBadge.label}
        </span>
      }
      topActions={
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 pixel-corners text-xs font-arcade text-slate-300">
            FAME: <strong className="text-amber-400">{effectiveFame}</strong>
          </div>
          <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 pixel-corners text-xs font-arcade text-slate-300">
            OVR: <strong className="text-emerald-400">{ovr}</strong>
          </div>
        </div>
      }
      secondaryAction={{
        label: t('DECLINE'),
        onClick: () => handleDeclineSingle(currentOffer.id),
        icon: <X className="w-4 h-4" />,
        variant: 'danger',
      }}
      extraBottomContent={
        hasAgent && onSpeakWithAgent ? (
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              onSpeakWithAgent();
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/60 pixel-bevel-raised"
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>CONSULT AGENT</span>
          </button>
        ) : onLaunchTryouts ? (
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              onLaunchTryouts();
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/60 pixel-bevel-raised"
          >
            <span>TRYOUTS</span>
          </button>
        ) : undefined
      }
      confirmLabel={t('AGE16_OFFERS_SIGN_BTN', { clubName: currentOffer.clubName.toUpperCase() })}
      confirmIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
    >
      {/* Central Focused Age 16 Offer Card */}
      <div className="w-full max-w-3xl h-full flex flex-col justify-between p-3.5 sm:p-5 bg-slate-900 border-2 border-emerald-500/80 pixel-corners pixel-bevel-emerald shadow-2xl relative overflow-hidden my-auto backdrop-blur-md font-pixel select-none">
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        <div className="space-y-3.5 sm:space-y-4 relative z-10">
          {/* Club Header */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 sm:p-4 bg-gradient-to-br ${
                  currentOffer.clubBadgeBg || 'from-emerald-700 to-slate-950'
                } pixel-corners pixel-bevel-raised border-2 border-white/20 text-white shadow-lg shrink-0`}
              >
                <Building className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700 font-arcade">
                    {currentOffer.leagueName}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-arcade">
                    <Globe className="w-3 h-3 text-sky-400" />
                    {currentOffer.countryName}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-arcade">
                    <GraduationCap className="w-3 h-3 text-emerald-400" />
                    {currentOffer.developmentTierName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                  {currentOffer.clubName}
                </h2>
                <div className="text-xs text-amber-300 font-retro mt-0.5">
                  Fee to Youth Academy: {currentOffer.formattedTransferFee || 'Free Release'}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-950 px-3 py-1.5 pixel-corners border border-slate-800 pixel-bevel-sunken">
              <span className="text-[9px] font-arcade text-slate-400 block uppercase">
                {t('AGE16_OFFERS_DESTINATION')}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-arcade">
                {currentOffer.squadPlacement.initialSquadDestination}
              </span>
            </div>
          </div>

          {/* Key Metrics Dashboard: Role Guarantee, Weekly Wage, Buyout / Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">ROLE GUARANTEE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-300 truncate block mt-0.5">
                {currentOffer.squadPlacement.squadName}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">WEEKLY WAGE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-emerald-400 truncate block mt-0.5">
                €{currentOffer.weeklyWage.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">CONTRACT LENGTH</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-white truncate block mt-0.5">
                3 Years
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">SIGNING BONUS</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-400 truncate block mt-0.5">
                +€{currentOffer.signingBonus.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Scout Insight & Pitch Assessment */}
          <div className="bg-slate-950 p-3 pixel-corners border border-slate-800 pixel-bevel-sunken text-xs space-y-1 text-left">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px] font-arcade">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Scouting Insight & Project Plan
              </span>
              <span className="text-slate-400 font-normal">
                +{currentOffer.youthDevelopmentPoints} Youth Dev Points / Season
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-retro text-[11px]">
              &ldquo;{currentOffer.curatedReason}&rdquo;
            </p>
          </div>

          {/* Manager & Tactical Vision */}
          <div className="bg-slate-950 p-3.5 pixel-corners border border-slate-800 pixel-bevel-sunken space-y-2 text-xs text-left">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 font-arcade">
                <Target className="w-4 h-4 text-amber-400" />
                Role: {currentOffer.tacticalRole}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-arcade text-slate-300 bg-slate-900 px-2 py-0.5 pixel-corners border border-slate-800 text-[10px] font-bold">
                  {currentOffer.managerFormation}
                </span>
                <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 pixel-corners border border-sky-500/30 text-[10px] font-bold font-arcade">
                  {currentOffer.managerTacticalStyle}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block font-arcade">
                Development Philosophy
              </span>
              <p className="font-medium text-slate-200 mt-0.5 text-xs font-retro">
                {currentOffer.developmentPhilosophy}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Guarantee Note */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10 font-retro">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Complete attribute continuity & zero progression regression guaranteed</span>
          </div>
          <span className="text-emerald-300 font-arcade font-bold hidden sm:inline">
            Offer {currentIndex + 1} of {activeOffers.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
