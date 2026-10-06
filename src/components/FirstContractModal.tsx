import React, { useState } from 'react';
import { ProContractOffer } from '../types/streetCards';
import { PlayerConfig, ManagerState } from '../types';
import {
  Trophy,
  Building,
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
} from 'lucide-react';
import { negotiateOfferWithClub, ManagerNegotiationDetails } from '../utils/managerInteractionSystem';
import { ChoiceSystem } from './ChoiceSystem';

interface FirstContractModalProps {
  isOpen: boolean;
  offers: ProContractOffer[];
  player: PlayerConfig;
  manager?: ManagerState;
  onAcceptOffer: (offer: ProContractOffer) => void;
  onDeclineAll?: () => void;
}

export const FirstContractModal: React.FC<FirstContractModalProps> = ({
  isOpen,
  offers: initialOffers,
  player,
  manager,
  onAcceptOffer,
  onDeclineAll,
}) => {
  const [activeOffers, setActiveOffers] = useState<ProContractOffer[]>(initialOffers);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<{
    offerId: string;
    details: ManagerNegotiationDetails;
  } | null>(null);

  React.useEffect(() => {
    setActiveOffers(initialOffers);
    setCurrentIndex((prev) => (prev >= initialOffers.length ? 0 : prev));
  }, [initialOffers]);

  if (!isOpen || activeOffers.length === 0) {
    if (isOpen && activeOffers.length === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-pixel select-none">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold p-6 text-center text-white space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black font-arcade">All Offers Withdrawn</h3>
            <p className="text-xs text-slate-300 font-retro leading-relaxed">
              Aggressive negotiations led all interested clubs to withdraw their contract offers. Focus on upcoming matches to generate new scouting interest!
            </p>
            <button
              type="button"
              onClick={onDeclineAll}
              className="px-6 py-2.5 pixel-corners text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition font-arcade pixel-bevel-raised cursor-pointer"
            >
              Continue Career
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const selectedOffer = activeOffers[currentIndex] || activeOffers[0];
  const isBeingNegotiated = negotiatingId === selectedOffer.id;

  const handleNegotiate = (offerToNegotiate: ProContractOffer) => {
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
          clubName: offerToNegotiate.clubName,
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
        const remaining = activeOffers.filter((o) => o.id !== offerToNegotiate.id);
        setActiveOffers(remaining);
        if (remaining.length > 0) {
          setCurrentIndex(0);
        }
      } else {
        const updated = activeOffers.map((o) => {
          if (o.id === offerToNegotiate.id) {
            return {
              ...o,
              yearlySalary: details.newSalary,
              weeklyWage: details.newWeeklyWage,
              contractYears: details.newContractYears,
              squadRole: details.newRole as any,
              expectedRole: details.newRole as any,
              initialSquadDestination: details.newSquad as any,
              playingTimeExpectation: (details.newSquad === 'First Team' ? 'STARTER' : o.playingTimeExpectation) as any,
              signingBonus: Math.round(details.newSalary * 0.15),
              isNegotiated: true,
            };
          }
          return o;
        });
        setActiveOffers(updated);
      }
    }, 600);
  };

  const handleDeclineCurrentOffer = () => {
    const remaining = activeOffers.filter((o) => o.id !== selectedOffer.id);
    setActiveOffers(remaining);
    if (remaining.length === 0) {
      if (onDeclineAll) onDeclineAll();
    } else {
      setCurrentIndex((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={activeOffers.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={() => onAcceptOffer(selectedOffer)}
      title={selectedOffer.clubName}
      subtitle={`${selectedOffer.leagueName} • ${selectedOffer.countryName}`}
      selectorLabel={`OFFER ${currentIndex + 1} OF ${activeOffers.length}`}
      themeColor="#f59e0b"
      accentGradient="from-amber-400 via-yellow-300 to-amber-500"
      categoryBadge={
        <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-arcade">
          ⭐ PRO CONTRACT OFFER
        </span>
      }
      topActions={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-400/30 pixel-corners text-amber-300 text-xs font-bold font-arcade">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>+10 Fame</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-800/90 border border-slate-700/80 pixel-corners text-slate-300 text-xs font-arcade">
            OVR: <strong className="text-white">{player.ovr || 65}</strong>
          </div>
        </div>
      }
      secondaryAction={{
        label: 'DECLINE',
        onClick: handleDeclineCurrentOffer,
        icon: <X className="w-4 h-4" />,
        variant: 'danger',
      }}
      extraBottomContent={
        !(selectedOffer as any).isNegotiated ? (
          <button
            type="button"
            disabled={isBeingNegotiated}
            onClick={() => handleNegotiate(selectedOffer)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/60 pixel-bevel-gold disabled:opacity-50"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{isBeingNegotiated ? 'NEGOTIATING...' : 'NEGOTIATE'}</span>
          </button>
        ) : (
          <span className="px-2.5 py-1 text-[11px] font-arcade font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            TERMS AGREED
          </span>
        )
      }
      confirmLabel={`SIGN WITH ${selectedOffer.clubName.toUpperCase()}`}
      confirmIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
    >
      {/* Central Focused Contract Card */}
      <div className="w-full max-w-3xl h-full flex flex-col justify-between p-3.5 sm:p-5 bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl relative overflow-hidden my-auto backdrop-blur-md font-pixel select-none">
        <div className="space-y-3 sm:space-y-3.5 relative z-10">
          {/* Club Header */}
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 sm:p-3.5 bg-gradient-to-br ${selectedOffer.clubBadgeBg || 'from-amber-500 to-yellow-600'} pixel-corners pixel-bevel-raised border-2 border-white/20 text-white shadow-lg shrink-0`}>
                <Building className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-arcade">
                    {selectedOffer.leagueName}
                  </span>
                  <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-arcade">
                    <Globe className="w-3 h-3 text-sky-400" />
                    {selectedOffer.countryName}
                  </span>
                  {(selectedOffer as any).isNegotiated && (
                    <span className="px-2 py-0.5 pixel-corners text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 font-arcade">
                      <TrendingUp className="w-3 h-3" />
                      Negotiated
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                  {selectedOffer.clubName}
                </h2>
                <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                  {Array.from({ length: selectedOffer.prestigeStars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-950 px-3 py-1.5 pixel-corners border border-slate-800">
              <span className="text-[9px] font-arcade text-slate-400 block uppercase">
                Squad Plan
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-arcade">
                {selectedOffer.initialSquadDestination || 'First Team'}
              </span>
            </div>
          </div>

          {/* Negotiation Result Alert */}
          {negotiationResult && (
            <div
              className={`p-2.5 pixel-corners border text-xs flex items-start justify-between gap-2 ${
                negotiationResult.details.outcome === 'success'
                  ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                  : 'bg-sky-950 border-sky-500/50 text-sky-200'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-black uppercase tracking-wider block font-arcade">
                  {negotiationResult.details.outcome === 'success'
                    ? '🎉 Contract Terms Upgraded!'
                    : '🤝 Negotiation Response'}
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">PLAYING TIME</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-300 truncate block mt-0.5">
                {selectedOffer.playingTimeExpectation || 'Starter'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">WEEKLY WAGE</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-emerald-400 truncate block mt-0.5">
                €{(selectedOffer.weeklyWage || 40000).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">CONTRACT LENGTH</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-white truncate block mt-0.5">
                {selectedOffer.contractYears || 3} Years
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
              <span className="text-[9px] font-arcade uppercase text-slate-400 block">SIGNING BONUS</span>
              <span className="text-xs sm:text-sm font-arcade font-black text-amber-400 truncate block mt-0.5">
                +€{(selectedOffer.signingBonus || Math.round(selectedOffer.yearlySalary * 0.1)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Manager & Tactical Vision */}
          <div className="bg-slate-950 p-3 pixel-corners border border-slate-800 pixel-bevel-sunken space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 font-arcade text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Coach: {selectedOffer.managerName || 'Head Coach'} ({selectedOffer.managerNationality || 'International'})
              </span>
              <span className="font-arcade text-slate-400 bg-slate-900 px-2 py-0.5 pixel-corners border border-slate-800 text-[10px]">
                {selectedOffer.managerFormation || '4-3-3'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[9px] flex items-center gap-1 font-pixel">
                  <Target className="w-3 h-3 text-sky-400" /> Role & Sub-Position
                </span>
                <p className="font-black text-slate-200 mt-0.5 text-xs sm:text-sm font-arcade">
                  {selectedOffer.expectedPosition} ({selectedOffer.expectedSubPosition || player.subPosition || 'ST'}) • {selectedOffer.tacticalRole || 'Attacker'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[9px] flex items-center gap-1 font-pixel">
                  <ClipboardList className="w-3 h-3 text-emerald-400" /> Proposed Playstyle
                </span>
                <p className="font-black text-emerald-300 mt-0.5 text-xs sm:text-sm font-arcade">
                  {selectedOffer.expectedPlaystyle || 'Complete Forward'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee Note */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-retro">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progression Guaranteed: Zero OVR downgrade on signing</span>
          </div>
          <span className="text-amber-300 font-arcade font-bold hidden sm:inline text-xs">
            Choice {currentIndex + 1} of {activeOffers.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
