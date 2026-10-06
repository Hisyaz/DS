import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import { ClubTransferOffer, calculatePlayerMarketValue, isSaudiClubOffer } from '../utils/transferMarketSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRightLeft,
  Building,
  DollarSign,
  Calendar,
  X,
  Check,
  Globe,
  Briefcase,
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  Scale,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { negotiateOfferWithClub, ManagerNegotiationDetails } from '../utils/managerInteractionSystem';

interface TransferInterestModalProps {
  isOpen: boolean;
  offers: ClubTransferOffer[];
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onAcceptTransfer: (offer: ClubTransferOffer) => void;
  onRejectOffer: (offerId: string) => void;
  onClose: () => void;
  onOpenArabianMegaOffer?: (offer: ClubTransferOffer) => void;
}

export const TransferInterestModal: React.FC<TransferInterestModalProps> = ({
  isOpen,
  offers: initialOffers,
  player,
  accounting,
  manager,
  onAcceptTransfer,
  onRejectOffer,
  onClose,
  onOpenArabianMegaOffer,
}) => {
  const { t } = useLanguage();
  const [activeOffers, setActiveOffers] = useState<ClubTransferOffer[]>(initialOffers);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(initialOffers[0]?.id || '');
  const [showValuationDetails, setShowValuationDetails] = useState<boolean>(false);
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<{
    offerId: string;
    details: ManagerNegotiationDetails;
  } | null>(null);

  React.useEffect(() => {
    setActiveOffers(initialOffers);
    if (initialOffers.length > 0 && (!selectedOfferId || !initialOffers.some((o) => o.id === selectedOfferId))) {
      setSelectedOfferId(initialOffers[0].id);
    }
  }, [initialOffers]);

  if (!isOpen || activeOffers.length === 0) {
    if (isOpen && activeOffers.length === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black">{t('All Transfer Bids Withdrawn')}</h3>
            <p className="text-xs text-slate-400">
              {t('Contract demands exceeded what bidding clubs were willing to accommodate. Continue performing in league matches to attract new bids!')}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              {t('Back to Career')}
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const mvBreakdown = calculatePlayerMarketValue(player);
  const selectedOffer = activeOffers.find((o) => o.id === selectedOfferId) || activeOffers[0];

  const handleNegotiateTransfer = (offerToNegotiate: ClubTransferOffer) => {
    setNegotiatingId(offerToNegotiate.id);

    setTimeout(() => {
      const details = negotiateOfferWithClub(
        {
          yearlySalary: offerToNegotiate.yearlySalary,
          weeklyWage: offerToNegotiate.weeklyWage,
          contractYears: offerToNegotiate.contractYears,
          expectedRole: offerToNegotiate.expectedRole,
          proposedSquad: offerToNegotiate.proposedSquad,
          countryCode: offerToNegotiate.buyerClub.countryCode,
          countryName: offerToNegotiate.buyerClub.countryName,
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
        const remaining = activeOffers.filter((o) => o.id !== offerToNegotiate.id);
        setActiveOffers(remaining);
        if (remaining.length > 0) {
          setSelectedOfferId(remaining[0].id);
        }
      } else {
        const updated = activeOffers.map((o) => {
          if (o.id === offerToNegotiate.id) {
            return {
              ...o,
              yearlySalary: details.newSalary,
              weeklyWage: details.newWeeklyWage,
              contractYears: details.newContractYears,
              expectedRole: details.newRole as any,
              proposedSquad: details.newSquad as any,
              signingBonus: Math.round(details.newSalary * 0.18),
              isNegotiated: true,
            };
          }
          return o;
        });
        setActiveOffers(updated);
      }
    }, 600);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border-2 border-purple-500/80 pixel-corners pixel-bevel-gold shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[94vh] flex flex-col text-left relative overflow-hidden font-pixel select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* Header (Fixed) */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3.5 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pixel-corners pixel-bevel-raised bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shrink-0 border border-purple-400/40">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-purple-500/20 border border-purple-400/50 text-purple-300 text-[9px] font-black uppercase font-arcade">
                ⚽ {t('TRANSFER MARKET WINDOW')}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                {t('Official Transfer Bids Received ({count})', { count: activeOffers.length })}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 pixel-corners bg-slate-800 hover:bg-slate-700 pixel-bevel-raised flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer shrink-0 border border-slate-700 active:translate-y-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Negotiation Feedback Alert */}
        {negotiationResult && (
          <div
            className={`mt-3 p-3 pixel-corners border-2 text-xs flex items-start justify-between gap-3 relative z-10 ${
              negotiationResult.details.outcome === 'success'
                ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200 pixel-bevel-emerald'
                : negotiationResult.details.outcome === 'partial'
                ? 'bg-sky-950 border-sky-500/80 text-sky-200 pixel-bevel-cyan'
                : 'bg-rose-950 border-rose-500/80 text-rose-200 pixel-bevel-crimson'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] block font-arcade">
                {negotiationResult.details.outcome === 'success'
                  ? `🎉 ${t('Transfer Terms Upgraded!')}`
                  : negotiationResult.details.outcome === 'partial'
                  ? `🤝 ${t('Partial Wage Concession')}`
                  : `⚠️ ${t('Transfer Bid Withdrawn')}`}
              </span>
              <p className="text-[11px] leading-relaxed font-retro">{t(negotiationResult.details.clubResponse)}</p>
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-3 space-y-3.5 relative z-10">
          {/* Player Market Value Summary Bar */}
          <div className="bg-slate-950 p-3.5 pixel-corners border border-slate-800 pixel-bevel-sunken flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block font-arcade">{t('Estimated Market Value')}</span>
                <span className="text-xl font-black text-amber-400 font-arcade">{mvBreakdown.formattedValue}</span>
              </div>
              <div className="h-7 w-px bg-slate-800 hidden sm:block" />
              <div className="text-xs text-slate-300 font-retro">
                <span className="font-bold text-slate-200">{player.ovr} {t('OVR')}</span> ({mvBreakdown.ovrWeight}%) •{' '}
                <span className="font-bold text-amber-300">{player.potentialOvr} {t('Potential')}</span> ({mvBreakdown.potentialWeight}%)
                <div className="text-[10px] text-slate-400">
                  {t('Fame Multiplier')}: <strong>{mvBreakdown.fameMultiplier}x</strong> ({player.fame || 0} {t('Fame')})
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowValuationDetails(!showValuationDetails)}
              className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 pixel-bevel-raised text-xs font-bold text-purple-300 hover:text-purple-200 transition flex items-center gap-1 cursor-pointer active:translate-y-0.5 font-arcade"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showValuationDetails ? t('Hide Formula') : t('Valuation Formula')}</span>
            </button>
          </div>

          {/* Detailed Valuation Formula Drawer */}
          {showValuationDetails && (
            <div className="bg-slate-950 p-3 pixel-corners border border-purple-500/50 pixel-bevel-sunken text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-200">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5 font-arcade">
                <TrendingUp className="w-4 h-4" /> {t('Progressive Market Value Engine')}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-retro">
                {t('Market Value uses a continuous formula combining weighted current OVR and Potential. Fame acts as a continuous multiplier without hard caps, while contract length and bad reputation adjust negotiating power.')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-arcade text-[10px]">
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-800 pixel-bevel-raised">
                  <span className="text-slate-500 block">{t('Weighted Score')}</span>
                  <span className="text-white font-bold">{mvBreakdown.weightedAbilityScore}</span>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-800 pixel-bevel-raised">
                  <span className="text-slate-500 block">{t('Fame Multiplier')}</span>
                  <span className="text-amber-400 font-bold">{mvBreakdown.fameMultiplier}x</span>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-800 pixel-bevel-raised">
                  <span className="text-slate-500 block">{t('Contract Factor')}</span>
                  <span className="text-sky-400 font-bold">{mvBreakdown.contractLengthMultiplier}x</span>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-800 pixel-bevel-raised">
                  <span className="text-slate-500 block">{t('Reputation Factor')}</span>
                  <span className="text-emerald-400 font-bold">{mvBreakdown.badRepMultiplier}x</span>
                </div>
              </div>
            </div>
          )}

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeOffers.map((offer) => {
              const isSelected = offer.id === selectedOfferId;
              const isBeingNegotiated = negotiatingId === offer.id;
              const isSaudi = isSaudiClubOffer(offer);

              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`p-4 pixel-corners border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 bg-slate-950 ${
                    isSelected
                      ? isSaudi
                        ? 'border-amber-400 pixel-bevel-gold bg-amber-950/20'
                        : 'border-purple-400 pixel-bevel-raised bg-purple-950/30'
                      : isSaudi
                      ? 'border-amber-500/50 hover:border-amber-400 pixel-bevel-sunken'
                      : 'border-slate-800 hover:border-slate-700 pixel-bevel-sunken'
                  }`}
                >
                  {/* Header Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSaudi ? (
                        <span className="px-2 py-0.5 pixel-corners text-[9px] font-black uppercase bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/60 flex items-center gap-1 shadow-sm font-arcade">
                          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                          🇸🇦 {t('MEGA ARABIAN OFFER')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 pixel-corners text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 font-arcade">
                          {offer.buyerClub.leagueName}
                        </span>
                      )}
                      <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-arcade">
                        <Globe className="w-3 h-3 text-sky-400" />
                        {offer.buyerClub.countryName}
                      </span>
                      {(offer as any).isNegotiated && (
                        <span className="px-2 py-0.5 pixel-corners text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 font-arcade">
                          <TrendingUp className="w-3 h-3" />
                          {t('Negotiated')}
                        </span>
                      )}
                    </div>

                    {offer.isExpiringContractMove && (
                      <span className="px-2 py-0.5 pixel-corners text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-arcade">
                        {t('1-Yr Move')}
                      </span>
                    )}
                  </div>

                  {/* Club Title */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-gradient-to-br ${offer.buyerClub.clubBadgeBg} pixel-corners pixel-bevel-raised border border-white/20 text-white shadow-lg shrink-0`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white pixel-text-shadow font-arcade">{offer.buyerClub.clubName}</h3>
                      <p className="text-xs text-slate-400 font-retro">
                        {t('Manager')}: <strong className="text-slate-200">{offer.buyerClub.managerName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Financial Terms */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 pixel-corners border border-slate-800 pixel-bevel-sunken text-xs font-retro">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block font-arcade">
                        {offer.isFreeAgentMove ? t('Transfer Status') : t('Transfer Fee')}
                      </span>
                      <span className="text-sm font-black text-amber-400 font-arcade mt-0.5 block">
                        {offer.isFreeAgentMove ? t('Free Transfer (€0 Fee)') : offer.formattedFee}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block font-arcade">{t('Proposed Salary')}</span>
                      <span className="text-sm font-black text-emerald-400 font-arcade mt-0.5 block">€{offer.weeklyWage.toLocaleString()} / {t('wk')}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                      <span>{t('Squad')}: <strong className="text-white">{t(offer.proposedSquad)}</strong></span>
                      <span>{t('Role')}: <strong className="text-amber-300">{t(offer.expectedRole)}</strong></span>
                    </div>
                    {offer.playerTransferFeeCutPercent && offer.playerTransferFeeCutPercent > 0 && !offer.isFreeAgentMove && (
                      <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold font-arcade">{t('Player Transfer Cut')} ({offer.playerTransferFeeCutPercent}%):</span>
                        <span className="text-emerald-300 font-black font-arcade">
                          +€{Math.round((offer.offeredFee || 0) * (offer.playerTransferFeeCutPercent / 100)).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {offer.isFreeAgentMove && (
                      <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-purple-300 font-bold font-arcade">{t('Free Agent Signing Bonus')}:</span>
                        <span className="text-purple-200 font-black font-arcade">
                          +€{(offer.signingBonus || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Manager Negotiation Trigger */}
                  {!(offer as any).isNegotiated && (
                    <button
                      type="button"
                      disabled={isBeingNegotiated}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNegotiateTransfer(offer);
                      }}
                      className="w-full py-2 px-3 pixel-corners bg-slate-900 hover:bg-slate-800 border border-slate-700 pixel-bevel-raised text-xs font-bold text-amber-300 hover:text-amber-200 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-arcade"
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBeingNegotiated ? t('Negotiating...') : t('Agent: Negotiate Terms')}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions (Fixed Footer) */}
        <div className="pt-3 mt-1 border-t-2 border-slate-800 bg-slate-900 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 font-arcade">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {t('Selected Transfer')}: <strong className="text-white">{selectedOffer.buyerClub.clubName}</strong> ({selectedOffer.formattedFee})
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onRejectOffer(selectedOffer.id)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 pixel-corners pixel-bevel-raised text-xs font-bold border border-slate-700 transition cursor-pointer active:translate-y-0.5"
            >
              {t('Decline Offer')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isSaudiClubOffer(selectedOffer) && !player.hasSeenSaudiOfferEvent && onOpenArabianMegaOffer) {
                  onOpenArabianMegaOffer(selectedOffer);
                } else {
                  onAcceptTransfer(selectedOffer);
                }
              }}
              className="w-full sm:w-auto px-6 py-2.5 pixel-corners text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 pixel-bevel-raised shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('Accept Transfer & Join')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

