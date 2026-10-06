import React from 'react';
import { ClubTransferOffer } from '../utils/transferMarketSystem';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Coins,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Award,
  Building,
  CheckCircle2,
  XCircle,
  Flame,
  Globe,
} from 'lucide-react';

interface ArabianMegaOfferModalProps {
  isOpen: boolean;
  offer: ClubTransferOffer | null;
  player: PlayerCardData;
  onAccept: (offer: ClubTransferOffer) => void;
  onDecline: (offerId?: string) => void;
}

export const ArabianMegaOfferModal: React.FC<ArabianMegaOfferModalProps> = ({
  isOpen,
  offer,
  player,
  onAccept,
  onDecline,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !offer) return null;

  const yearlySalary = offer.yearlySalary || 45000000;
  const weeklyWage = offer.weeklyWage || Math.round(yearlySalary / 52);
  const signingBonus = offer.signingBonus || Math.round(yearlySalary * 0.20);
  const formattedFee = offer.formattedFee || '€85,000,000';
  const clubName = offer.buyerClub?.clubName || 'Saudi Pro League Club';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden animate-fadeIn">
      {/* Top Bar Header */}
      <header className="shrink-0 p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                {t('ARABIAN MEGA-DEAL')}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                🇸🇦 {t('Saudi Pro League Mega-Contract Event')}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
              {t('Generational Wealth Contract Proposal')}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDecline(offer.id)}
          className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          {t('Decline Offer')}
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6 custom-scrollbar text-left">
        {/* Banner Announcement */}
        <div className="text-center space-y-2 py-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            {t('THE ARABIAN LEAGUE COMES KNOCKING')}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('Representatives from the Saudi Pro League have arrived with a private jet and an unprecedented financial proposal that will forever alter your career and generational wealth.')}
          </p>
        </div>

        {/* Club Details & Numbers Grid */}
        <div className="bg-slate-900 rounded-3xl border border-amber-500/40 p-5 sm:p-7 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/60 flex items-center justify-center text-3xl shadow-md shrink-0">
                🇸🇦
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {clubName}
                </div>
                <div className="text-sm text-amber-400 font-bold mt-0.5">
                  {t('Saudi Pro League • Tier 1 Division')}
                </div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-right shrink-0">
              <div className="text-xs uppercase font-bold text-amber-300">{t('Offered Transfer Fee')}</div>
              <div className="text-lg font-black text-amber-200 font-mono">{formattedFee}</div>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                {t('YEARLY SALARY')}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                €{(yearlySalary / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-slate-400 font-mono">€{yearlySalary.toLocaleString()}/{t('yr')}</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                {t('WEEKLY WAGE')}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                €{(weeklyWage / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-slate-400 font-mono">€{weeklyWage.toLocaleString()}/{t('week')}</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                {t('SIGNING BONUS')}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                €{(signingBonus / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-slate-400">{t('Immediate liquid cash to savings')}</div>
            </div>
          </div>
        </div>

        {/* Narrative Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
              <TrendingUp className="w-5 h-5" /> {t('GENERATIONAL EMPIRE & UPGRADES')}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('This astronomical windfall will allow you to immediately purchase every luxury upgrade in the Lifestyle Store, establish massive global business ventures, and secure multi-generational wealth.')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
              <Building className="w-5 h-5" /> {t('ZERO FINANCIAL CEILING')}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('Never worry about training facility costs, elite kinesiologists, private cryogenic chambers, or investment capital again. You operate on an unlimited budget.')}
            </p>
          </div>
        </div>

        {/* The Trade-off: The "Mercenary" Perk */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/70 border border-rose-500/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>{t('THE SPORTING TRADEOFF: YOU GAIN THE "MERCENARY" PERK')}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('Taking the Arabian fortune means stepping outside the mainstream European sporting spotlight. Accepting this offer instantly awards you the permanent trait:')}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg">
              <DollarSign className="w-7 h-7 text-slate-950" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-black text-amber-300 uppercase tracking-wide">
                {t('PERK: "MERCENARY"')}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                <div><span className="text-rose-400 font-bold">• {t('-80% to all Fame gains')}</span> ({t('European media spotlight diminishes')}).</div>
                <div><span className="text-emerald-400 font-bold">• {t('+20% to all future bonuses & contract renewal fees')}</span> {t('in your favor')}.</div>
                <div><span className="text-amber-400 font-bold">• {t('Top European clubs become significantly less likely to sign you')}</span> {t('in future windows')}.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Footer */}
      <footer className="shrink-0 p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3 z-20 shadow-lg">
        <button
          type="button"
          onClick={() => onDecline(offer.id)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          {t('DECLINE (Stay For Sporting Glory)')}
        </button>

        <button
          type="button"
          onClick={() => onAccept(offer)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-200 stroke-[2.5]" />
          <span>{t('ACCEPT THE MEGA DEAL (Sign with {club})', { club: clubName })}</span>
        </button>
      </footer>
    </div>
  );
};
