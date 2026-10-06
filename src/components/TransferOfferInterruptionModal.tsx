import React, { useEffect } from 'react';
import { UnifiedClubOffer } from '../utils/clubOfferSystem';
import { PlayerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRightLeft,
  Building,
  DollarSign,
  Calendar,
  Award,
  ShieldCheck,
  Check,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface TransferOfferInterruptionModalProps {
  isOpen: boolean;
  offer: UnifiedClubOffer | null;
  player: PlayerConfig;
  onAccept: (offer: UnifiedClubOffer) => void;
  onWait: (offer: UnifiedClubOffer) => void;
  onDecline: (offer: UnifiedClubOffer) => void;
}

export const TransferOfferInterruptionModal: React.FC<TransferOfferInterruptionModalProps> = ({
  isOpen,
  offer,
  player,
  onAccept,
  onWait,
  onDecline,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      audioManager.playCardFlipSound();
      haptics.firmImpact();
    }
  }, [isOpen]);

  // Keyboard navigation support (1 = YES, 2 = WAIT, 3 / Esc = NO)
  useEffect(() => {
    if (!isOpen || !offer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
        e.preventDefault();
        onAccept(offer);
      } else if (e.key === '2' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onWait(offer);
      } else if (e.key === '3' || e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
        e.preventDefault();
        onDecline(offer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, offer, onAccept, onWait, onDecline]);

  if (!isOpen || !offer) return null;

  const isRenewal = offer.isRenewalOffer || offer.transferType === 'club_renewal';
  const yearly = offer.yearlySalary || offer.weeklyWage * 52;
  const weekly = offer.weeklyWage || Math.round(yearly / 52);

  return (
    <div
      id="transfer-offer-interruption-modal"
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* 32-Bit Pixel Backdrop & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111827] via-[#090d16] to-[#030712] border-2 border-amber-500/80 pixel-bevel-gold p-4 sm:p-6 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[92vh] flex flex-col overflow-y-auto">
        {/* Decorative Pixel Corners */}
        <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
        <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
        <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
        <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

        {/* Marquee Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-500/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-amber-400 animate-ping rounded-none shrink-0" />
            <div className="text-left">
              <span className="inline-block px-2 py-0.5 bg-rose-600 border border-rose-400 text-white font-pixel text-[10px] font-black uppercase tracking-wider">
                🚨 {t('OFFER INTERRUPTION • SIMULATION PAUSED')}
              </span>
              <h2 className="text-base sm:text-lg font-arcade font-black text-amber-300 uppercase tracking-wide mt-1">
                {isRenewal ? t('CONTRACT EXTENSION SUBMITTED') : t('OFFICIAL TRANSFER BID RECEIVED')}
              </h2>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              {t('MARKET WINDOW')}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {offer.buyerClub?.countryCode || 'INT'}
            </span>
          </div>
        </div>

        {/* Club Profile & Terms Card */}
        <div className="my-4 space-y-3.5 text-left">
          {/* Club Identity Banner */}
          <div className="p-3.5 sm:p-4 bg-slate-900/90 border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-arcade font-black text-lg border-2 border-amber-400/80 shrink-0 text-white shadow-md bg-gradient-to-br ${
                  offer.clubBadgeBg || 'from-amber-600 to-slate-900'
                }`}
              >
                {offer.buyerClub?.clubName?.charAt(0) || 'C'}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-black font-arcade text-white uppercase tracking-tight truncate">
                  {offer.buyerClub?.clubName}
                </h3>
                <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 flex-wrap">
                  <span>{offer.leagueName}</span>
                  <span className="text-slate-600">•</span>
                  <span>{offer.countryName}</span>
                  {offer.isEuropean && (
                    <span className="px-1.5 py-0.2 bg-blue-900/80 border border-blue-500/50 text-[9px] text-blue-200">
                      UEFA
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">TRANSFER FEE</span>
              <span className="text-sm sm:text-base font-arcade font-black text-amber-400">
                {offer.formattedFee || '€0'}
              </span>
            </div>
          </div>

          {/* Financial Package 3-Column 32-Bit Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-black/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>SALARY & WAGE</span>
              </span>
              <div className="mt-1">
                <p className="text-sm sm:text-base font-arcade font-black text-emerald-400">
                  €{yearly.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  €{weekly.toLocaleString()}/wk
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/70 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>CONTRACT LENGTH</span>
              </span>
              <div className="mt-1">
                <p className="text-sm sm:text-base font-arcade font-black text-sky-300">
                  {offer.contractYears || 3} YEARS
                </p>
                <p className="text-[10px] font-mono text-indigo-300">
                  Release: €{((offer.releaseClause || 20000000) / 1000000).toFixed(0)}M
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/70 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>SIGNING BONUS</span>
              </span>
              <div className="mt-1">
                <p className="text-sm sm:text-base font-arcade font-black text-amber-300">
                  +€{(offer.signingBonus || 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-slate-400">Directly into Savings</p>
              </div>
            </div>
          </div>

          {/* Squad Role & Tactic Context */}
          <div className="p-2.5 bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Role: <strong className="text-white">{offer.squadRole || offer.expectedRole || 'Starter'}</strong> ({offer.initialSquadDestination || 'First Team'})
            </span>
            <span className="text-emerald-400">
              Playstyle: {offer.expectedPlaystyle || player.playStyle || 'Balanced'}
            </span>
          </div>
        </div>

        {/* 3 Large, Highly Readable 32-Bit Action Choices */}
        <div className="mt-2 pt-3 border-t-2 border-amber-500/40 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase text-center mb-1">
            {t('SELECT YOUR RESPONSE (SIMULATION AUTOMATICALLY RESUMES AFTERWARDS)')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* OPTION 1: YES - ACCEPT */}
            <button
              id="interruption-accept-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onAccept(offer)}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-2 border-emerald-300 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>YES (ACCEPT)</span>
              <span className="text-[9px] font-mono opacity-80 ml-1 hidden sm:inline">[1]</span>
            </button>

            {/* OPTION 2: WAIT - KEEP ON TABLE */}
            <button
              id="interruption-wait-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onWait(offer)}
              className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 border-2 border-amber-300 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Save this offer in your Transfer Hub to decide later"
            >
              <Clock className="w-4 h-4" />
              <span>WAIT (LATER)</span>
              <span className="text-[9px] font-mono opacity-80 ml-1 hidden sm:inline">[2]</span>
            </button>

            {/* OPTION 3: NO - DECLINE */}
            <button
              id="interruption-decline-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onDecline(offer)}
              className="py-3 px-3 bg-rose-700 hover:bg-rose-600 text-white border-2 border-rose-400 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>NO (DECLINE)</span>
              <span className="text-[9px] font-mono opacity-80 ml-1 hidden sm:inline">[3]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
