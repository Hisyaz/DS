import React, { useState, useEffect } from 'react';
import { UnifiedClubOffer } from '../utils/clubOfferSystem';
import { PlayerConfig, ManagerState, AccountingState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Building,
  Trophy,
  Check,
  Star,
  Award,
  Globe,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  ClipboardList,
  Target,
  Briefcase,
  X,
  TrendingUp,
  AlertTriangle,
  Scale,
  GraduationCap,
  Clock,
  Crown,
} from 'lucide-react';
import { negotiateOfferWithClub, ManagerNegotiationDetails } from '../utils/managerInteractionSystem';
import { ChoiceSystem } from './ChoiceSystem';

interface UnifiedClubOfferModalProps {
  isOpen: boolean;
  offers: UnifiedClubOffer[];
  specialOpportunity?: UnifiedClubOffer | null;
  player: PlayerConfig;
  manager?: ManagerState;
  accounting?: AccountingState;
  onAcceptOffer: (offer: UnifiedClubOffer) => void;
  onAcceptSpecialOpportunity?: (offer: UnifiedClubOffer) => void;
  onDeclineSpecialOpportunity?: (offer: UnifiedClubOffer) => void;
  onDeclineAll: () => void;
  onWait?: () => void;
  onClose?: () => void;
  initialTab?: 'regular' | 'special';
}

export const UnifiedClubOfferModal: React.FC<UnifiedClubOfferModalProps> = ({
  isOpen,
  offers: initialOffers,
  specialOpportunity,
  player,
  manager,
  accounting,
  onAcceptOffer,
  onAcceptSpecialOpportunity,
  onDeclineSpecialOpportunity,
  onDeclineAll,
  onWait,
  onClose,
  initialTab = 'regular',
}) => {
  const { t } = useLanguage();
  const [activeOffers, setActiveOffers] = useState<UnifiedClubOffer[]>(initialOffers);
  const [activeTab, setActiveTab] = useState<'regular' | 'special'>(
    initialTab === 'special' || (initialOffers.length === 0 && specialOpportunity) ? 'special' : 'regular'
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<{
    offerId: string;
    details: ManagerNegotiationDetails;
  } | null>(null);

  useEffect(() => {
    setActiveOffers(initialOffers);
    setCurrentIndex((prev) => (prev >= initialOffers.length ? 0 : prev));
  }, [initialOffers]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (initialOffers.length === 0 && specialOpportunity) {
      setActiveTab('special');
    }
  }, [initialTab, initialOffers.length, specialOpportunity]);

  const hasAnyOffers = activeOffers.length > 0 || !!specialOpportunity;

  if (!isOpen || !hasAnyOffers) {
    if (isOpen && !hasAnyOffers) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-pixel">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-6 text-center text-white space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black font-arcade uppercase">{t('NO ACTIVE TRANSFER OFFERS')}</h3>
            <p className="text-xs text-slate-300 font-retro leading-relaxed">
              {t('There are currently no regular transfer bids or special opportunities on the table. You will continue with your current squad.')}
            </p>
            <button
              type="button"
              onClick={onDeclineAll}
              className="px-6 py-2.5 pixel-corners text-xs font-arcade font-black bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition cursor-pointer pixel-bevel-raised"
            >
              {t('RETURN TO CAREER')}
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const selectedOffer = activeOffers[currentIndex] || activeOffers[0];
  const isRenewal = selectedOffer ? (selectedOffer.isRenewalOffer || selectedOffer.transferType === 'club_renewal') : false;
  const isBeingNegotiated = selectedOffer ? negotiatingId === selectedOffer.id : false;

  const handleDeclineSingleOffer = (offerId: string) => {
    const remaining = activeOffers.filter((o) => o.id !== offerId);
    setActiveOffers(remaining);
    if (remaining.length === 0) {
      if (!specialOpportunity) {
        onDeclineAll();
      } else {
        setActiveTab('special');
      }
    } else {
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  const handleNegotiate = (offerToNegotiate: UnifiedClubOffer) => {
    setNegotiatingId(offerToNegotiate.id);

    setTimeout(() => {
      const details = negotiateOfferWithClub(
        {
          yearlySalary: offerToNegotiate.yearlySalary,
          weeklyWage: offerToNegotiate.weeklyWage,
          contractYears: offerToNegotiate.contractYears,
          squadRole: offerToNegotiate.squadRole,
          expectedRole: offerToNegotiate.expectedRole,
          initialSquadDestination: offerToNegotiate.initialSquadDestination,
          countryCode: offerToNegotiate.countryCode,
          countryName: offerToNegotiate.countryName,
          clubName: offerToNegotiate.buyerClub.clubName,
        },
        {
          ovr: player.ovr,
          potentialOvr: player.potentialOvr,
          fame: player.fame,
          position: player.position,
          subPosition: player.subPosition,
        },
        manager
      );

      setNegotiationResult({ offerId: offerToNegotiate.id, details });
      setNegotiatingId(null);

      if (details.outcome === 'dropped') {
        handleDeclineSingleOffer(offerToNegotiate.id);
      } else {
        const updated = activeOffers.map((o) => {
          if (o.id === offerToNegotiate.id) {
            const newSalary = details.newSalary;
            const newWeeklyWage = details.newWeeklyWage;
            const newContractYears = details.newContractYears;
            const bonusPercent = Math.min(25, o.signingBonusPercent + 5);
            const newSigningBonus = Math.round(
              o.transferFee > 0 ? o.transferFee * (bonusPercent / 100) : newSalary * (bonusPercent / 100)
            );

            return {
              ...o,
              yearlySalary: newSalary,
              weeklyWage: newWeeklyWage,
              contractYears: newContractYears,
              squadRole: (details.newRole as any) || o.squadRole,
              expectedRole: (details.newRole as any) || o.expectedRole,
              initialSquadDestination: (details.newSquad as any) || o.initialSquadDestination,
              proposedSquad: (details.newSquad as any) || o.proposedSquad,
              signingBonus: newSigningBonus,
              signingBonusPercent: bonusPercent,
              isNegotiated: true,
            };
          }
          return o;
        });
        setActiveOffers(updated);
      }
    }, 600);
  };

  // Top Section Selector Bar: REGULAR OFFERS [RED ! ${count}] and SPECIAL OPPORTUNITY [BLUE !]
  const topTabs = (
    <div className="flex items-center gap-2 mb-3 select-none font-pixel relative z-10">
      {activeOffers.length > 0 && (
        <button
          type="button"
          onClick={() => setActiveTab('regular')}
          className={`px-3.5 py-1.5 pixel-corners text-xs font-arcade font-black uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === 'regular'
              ? 'bg-slate-900 border-amber-400 text-amber-300 pixel-bevel-gold shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white pixel-bevel-raised'
          }`}
        >
          <span>{t('REGULAR OFFERS')}</span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 pixel-corners bg-rose-600 border border-rose-400 text-white font-pixel text-[10px] font-black animate-pixel-blink">
            <span>!</span>
            <span>{Math.min(4, activeOffers.length)}</span>
          </span>
        </button>
      )}

      {specialOpportunity && (
        <button
          type="button"
          onClick={() => setActiveTab('special')}
          className={`px-3.5 py-1.5 pixel-corners text-xs font-arcade font-black uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === 'special'
              ? 'bg-sky-950 border-sky-400 text-sky-200 pixel-bevel-cyan shadow-md'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white pixel-bevel-raised'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span>{t('SPECIAL OPPORTUNITY')}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 pixel-corners bg-sky-600 border border-sky-400 text-white font-pixel text-[10px] font-black animate-pixel-blink">
            !
          </span>
        </button>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // VIEW A: SPECIAL OPPORTUNITY (Distinct 32-bit Presentation)
  // ---------------------------------------------------------------------------
  if (activeTab === 'special' && specialOpportunity) {
    const spec = specialOpportunity;
    const yearly = spec.yearlySalary || spec.weeklyWage * 52;
    const weekly = spec.weeklyWage || Math.round(yearly / 52);

    return (
      <div
        id="special-opportunity-view"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md select-none font-pixel animate-in fade-in"
      >
        <div className="relative w-full max-w-3xl bg-slate-950 border-4 border-sky-400 pixel-corners pixel-bevel-cyan p-4 sm:p-6 text-white shadow-[0_0_60px_rgba(56,189,248,0.4)] flex flex-col max-h-[92vh] overflow-y-auto">
          {/* Retro Scanline Overlay */}
          <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

          {/* Top Tabs */}
          {topTabs}

          {/* Special Header */}
          <div className="relative z-10 flex items-center justify-between border-b-2 border-sky-400/60 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 pixel-corners pixel-bevel-raised flex items-center justify-center font-arcade font-black text-xl border-2 border-sky-400 text-white shadow-lg bg-gradient-to-br ${
                  spec.clubBadgeBg || 'from-sky-600 to-indigo-950'
                }`}
              >
                <Crown className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-sky-600 border border-sky-300 pixel-corners text-[10px] font-black text-white uppercase font-arcade">
                    🌟 SPECIAL OPPORTUNITY
                  </span>
                  <span className="text-[10px] font-arcade text-sky-300 font-bold hidden sm:inline">
                    NON-REGULAR SLOT
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-arcade font-black text-white uppercase tracking-tight mt-0.5 pixel-text-shadow">
                  {spec.buyerClub?.clubName}
                </h2>
                <p className="text-xs text-slate-300 font-retro">
                  {spec.leagueName} • {spec.countryName}
                </p>
              </div>
            </div>

            <div className="relative z-10 text-right shrink-0 bg-slate-900 px-3 py-1.5 pixel-corners border border-slate-700 pixel-bevel-raised">
              <span className="text-[9px] font-arcade text-slate-400 uppercase block">TRANSFER STATUS</span>
              <span className="text-xs font-arcade font-black text-amber-300">
                {spec.formattedFee || 'RECORD FEE'}
              </span>
            </div>
          </div>

          {/* Special Pitch / Reasoning */}
          <div className="relative z-10 my-4 space-y-3 text-left">
            <div className="p-3.5 bg-slate-900/90 border-2 border-sky-500/40 pixel-corners pixel-bevel-sunken text-xs font-retro text-slate-200 leading-relaxed">
              <span className="text-amber-300 font-bold font-arcade block mb-1">👑 OFFICIAL BOARDROOM PROPOSAL:</span>
              <p>{spec.curatedReason || 'World-class landmark signing agreement with unprecedented sporting and economic freedom.'}</p>
            </div>

            {/* Financials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-900/90 border-2 border-slate-700 pixel-corners pixel-bevel-raised">
                <span className="text-[10px] font-arcade font-bold text-slate-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span>SALARY & WAGE</span>
                </span>
                <p className="text-sm sm:text-base font-arcade font-black text-emerald-400 mt-1">
                  €{yearly.toLocaleString()}
                </p>
                <p className="text-[10px] font-retro text-slate-400">€{weekly.toLocaleString()}/wk</p>
              </div>

              <div className="p-3 bg-slate-900/90 border-2 border-slate-700 pixel-corners pixel-bevel-raised">
                <span className="text-[10px] font-arcade font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>CONTRACT YEARS</span>
                </span>
                <p className="text-sm sm:text-base font-arcade font-black text-sky-300 mt-1">
                  {spec.contractYears || 4} YEARS
                </p>
                <p className="text-[10px] font-retro text-indigo-300">
                  Clause: €{((spec.releaseClause || 500000000) / 1000000).toFixed(0)}M
                </p>
              </div>

              <div className="p-3 bg-slate-900/90 border-2 border-slate-700 pixel-corners pixel-bevel-raised col-span-2 sm:col-span-1">
                <span className="text-[10px] font-arcade font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>SIGNING BONUS</span>
                </span>
                <p className="text-sm sm:text-base font-arcade font-black text-amber-300 mt-1">
                  +€{(spec.signingBonus || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-retro text-slate-400">Directly into Savings</p>
              </div>
            </div>

            {/* Role Guarantee */}
            <div className="p-3 bg-slate-950 border border-slate-800 pixel-corners text-xs font-retro flex items-center justify-between">
              <span className="text-slate-300">
                Role: <strong className="text-white">{spec.squadRole || 'Guaranteed First-Team Starter'}</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                Manager: {spec.managerName || 'Head Coach'} ({spec.managerFormation || '4-3-3'})
              </span>
            </div>
          </div>

          {/* Action Buttons: YES / WAIT / NO */}
          <div className="relative z-10 pt-3 border-t-2 border-sky-400/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* YES */}
            <button
              id="special-offer-accept-btn"
              type="button"
              onClick={() => {
                if (onAcceptSpecialOpportunity) {
                  onAcceptSpecialOpportunity(spec);
                } else {
                  onAcceptOffer(spec);
                }
              }}
              className="py-3 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 border-2 border-sky-300 pixel-corners pixel-bevel-cyan font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>YES (ACCEPT & SIGN)</span>
            </button>

            {/* WAIT */}
            <button
              id="special-offer-wait-btn"
              type="button"
              onClick={() => {
                if (onWait) {
                  onWait();
                } else if (onClose) {
                  onClose();
                } else {
                  onDeclineAll();
                }
              }}
              className="py-3 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 pixel-corners pixel-bevel-gold font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>WAIT (DECIDE LATER)</span>
            </button>

            {/* NO */}
            <button
              id="special-offer-decline-btn"
              type="button"
              onClick={() => {
                if (onDeclineSpecialOpportunity) {
                  onDeclineSpecialOpportunity(spec);
                } else {
                  setActiveTab('regular');
                }
              }}
              className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-slate-700 pixel-corners pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>NO (DECLINE)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW B: REGULAR OFFERS (Choice System 1 of max 4)
  // ---------------------------------------------------------------------------
  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={activeOffers.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={() => onAcceptOffer(selectedOffer)}
      title={selectedOffer.buyerClub.clubName}
      subtitle={`${selectedOffer.leagueName} • ${selectedOffer.countryName}`}
      selectorLabel={`OFFER ${currentIndex + 1} OF ${activeOffers.length} (MAX 4)`}
      themeColor={isRenewal ? '#f59e0b' : '#0ea5e9'}
      accentGradient={
        isRenewal
          ? 'from-amber-400 via-yellow-300 to-amber-500'
          : 'from-emerald-400 via-teal-300 to-emerald-400'
      }
      categoryBadge={
        isRenewal ? (
          <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1 font-arcade">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            CONTRACT EXTENSION (RENEWAL)
          </span>
        ) : selectedOffer.isSaudiMegaOffer ? (
          <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-arcade">
            💰 MEGA WAGE BID
          </span>
        ) : selectedOffer.transferType === 'free_agent_direct' || selectedOffer.transferType === 'pre_contract_free' ? (
          <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-arcade">
            🆓 FREE AGENT SIGNING
          </span>
        ) : (
          <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/50 font-arcade">
            ✈️ TRANSFER BID ({selectedOffer.formattedFee})
          </span>
        )
      }
      topActions={
        <div className="flex items-center gap-2">
          {topTabs}
          <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 pixel-corners pixel-bevel-raised text-slate-300 text-xs font-arcade">
            OVR: <strong className="text-white">{player.ovr || 65}</strong>
          </div>
        </div>
      }
      secondaryAction={{
        label: t('DECLINE'),
        onClick: () => handleDeclineSingleOffer(selectedOffer.id),
        icon: <X className="w-4 h-4" />,
        variant: 'danger',
      }}
      extraBottomContent={
        !selectedOffer.isNegotiated ? (
          <button
            type="button"
            disabled={isBeingNegotiated}
            onClick={() => handleNegotiate(selectedOffer)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/60 pixel-bevel-gold disabled:opacity-50"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{isBeingNegotiated ? t('NEGOTIATING...') : t('NEGOTIATE')}</span>
          </button>
        ) : (
          <span className="px-2.5 py-1 text-[11px] font-arcade font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{t('TERMS AGREED')}</span>
          </span>
        )
      }
      confirmLabel={
        isRenewal
          ? `${t('ACCEPT & RENEW')}`
          : `${t('ACCEPT & SIGN')}`
      }
      confirmIcon={
        isRenewal ? (
          <Star className="w-5 h-5 fill-slate-950 stroke-[3]" />
        ) : (
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        )
      }
    >
      {/* Central Focused Offer Card */}
      <div className="w-full max-w-3xl h-full flex flex-col justify-between p-3.5 sm:p-5 bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold shadow-2xl relative overflow-hidden my-auto backdrop-blur-md font-pixel select-none">
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        <div className="space-y-3.5 sm:space-y-4 relative z-10">
          {/* Club Header */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 sm:p-4 bg-gradient-to-br ${
                  selectedOffer.clubBadgeBg || 'from-blue-900 to-slate-950'
                } pixel-corners pixel-bevel-raised border-2 border-white/20 text-white shadow-lg shrink-0`}
              >
                <Building className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700 font-arcade">
                    {selectedOffer.leagueName}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-arcade">
                    <Globe className="w-3 h-3 text-sky-400" />
                    {selectedOffer.countryName}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-arcade">
                    <GraduationCap className="w-3 h-3 text-purple-400" />
                    {selectedOffer.developmentTierName}
                  </span>
                  {selectedOffer.isNegotiated && (
                    <span className="px-2 py-0.5 pixel-corners text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 font-arcade">
                      <TrendingUp className="w-3 h-3" />
                      Negotiated
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                  {selectedOffer.buyerClub.clubName}
                </h2>
                <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                  {Array.from({
                    length: Math.max(1, Math.round(selectedOffer.prestigeStars || 3)),
                  }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-950 px-3 py-1.5 pixel-corners border border-slate-800 pixel-bevel-sunken">
              <span className="text-[9px] font-arcade text-slate-400 block uppercase">
                Squad Plan
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-arcade">
                {selectedOffer.initialSquadDestination || selectedOffer.proposedSquad || 'First Team'}
              </span>
            </div>
          </div>

          {/* Negotiation Result Alert */}
          {negotiationResult && (
            <div
              className={`p-3 pixel-corners border-2 text-xs flex items-start justify-between gap-2 ${
                negotiationResult.details.outcome === 'success'
                  ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 pixel-bevel-emerald'
                  : 'bg-sky-950 border-sky-500/80 text-sky-200 pixel-bevel-cyan'
              }`}
            >
              <div className="space-y-0.5 text-left">
                <span className="font-black uppercase tracking-wider block font-arcade">
                  {negotiationResult.details.outcome === 'success'
                    ? '🎉 Terms Upgraded!'
                    : '🤝 Negotiation Agreement'}
                </span>
                <p className="leading-relaxed font-retro text-[11px]">{negotiationResult.details.clubResponse}</p>
              </div>
              <button
                type="button"
                onClick={() => setNegotiationResult(null)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Key Metrics Dashboard: Role Guarantee, Weekly Wage & Buyout Clause */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">ROLE GUARANTEE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-300 truncate block mt-0.5">
                {selectedOffer.squadRole || selectedOffer.expectedRole || 'Starter'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">WEEKLY WAGE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-emerald-400 truncate block mt-0.5">
                €{(selectedOffer.weeklyWage || Math.round(selectedOffer.yearlySalary / 52)).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">BUYOUT CLAUSE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-sky-300 truncate block mt-0.5">
                €{((selectedOffer.releaseClause || 15000000) / 1000000).toFixed(0)}M
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">SIGNING BONUS</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-400 truncate block mt-0.5">
                +€{(selectedOffer.signingBonus || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Club Strategic Fit / Vision */}
          <div className="bg-slate-950 p-3 pixel-corners border border-slate-800 pixel-bevel-sunken text-xs space-y-1 text-left">
            <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] font-arcade">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {isRenewal ? 'Club Retention & Project Vision' : 'Scouting Assessment & Fit'}
              </span>
              <span className="text-indigo-300 font-normal">
                {selectedOffer.starterComparisonText}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-retro text-[11px]">
              {selectedOffer.curatedReason}
            </p>
          </div>

          {/* Manager & Tactical Vision */}
          <div className="bg-slate-950 p-3.5 pixel-corners border border-slate-800 pixel-bevel-sunken space-y-2 text-xs text-left">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 font-arcade">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Coach: {selectedOffer.managerName || 'Head Coach'} ({selectedOffer.managerNationality || selectedOffer.countryCode || 'INT'})
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-arcade text-slate-300 bg-slate-900 px-2 py-0.5 pixel-corners border border-slate-800 text-[10px] font-bold">
                  {selectedOffer.managerFormation || '4-3-3'}
                </span>
                <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 pixel-corners border border-sky-500/30 text-[10px] font-bold font-arcade">
                  {selectedOffer.managerTacticalStyle || 'Attacking'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1 font-arcade">
                  <Target className="w-3 h-3 text-sky-400" /> Expected Position
                </span>
                <p className="font-black text-slate-200 mt-0.5 text-xs sm:text-sm font-arcade">
                  {selectedOffer.expectedPosition} ({selectedOffer.expectedSubPosition || player.subPosition || 'ST'}) • {selectedOffer.tacticalRole || 'Contender'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1 font-arcade">
                  <ClipboardList className="w-3 h-3 text-emerald-400" /> Proposed Playstyle
                </span>
                <p className="font-black text-emerald-300 mt-0.5 text-xs sm:text-sm font-arcade">
                  {selectedOffer.expectedPlaystyle || player.playStyle || 'Balanced'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee Note */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10 font-retro">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progression Guaranteed: Complete attribute & development continuity</span>
          </div>
          <span className="text-amber-300 font-arcade font-bold hidden sm:inline">
            Offer {currentIndex + 1} of {activeOffers.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
