import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Briefcase,
  TrendingUp,
  Shield,
  Zap,
  Award,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Flame,
  Star,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ManagerState, PlayerCardData } from '../types';
import { MANAGER_TYPE_PROFILES, ManagerTypeProfile } from '../utils/managerInteractionSystem';
import { useLanguage } from '../context/LanguageContext';

interface ManagerRecruitmentOfferModalProps {
  isOpen: boolean;
  offers: ManagerState[];
  player: PlayerCardData;
  onSelectManager: (selectedManager: ManagerState) => void;
  onDeclineAll: () => void;
}

export const ManagerRecruitmentOfferModal: React.FC<ManagerRecruitmentOfferModalProps> = ({
  isOpen,
  offers,
  player,
  onSelectManager,
  onDeclineAll,
}) => {
  const { t } = useLanguage();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(0);

  if (!isOpen || !offers || offers.length === 0) return null;

  const currentOffer = offers[selectedOfferIndex] || offers[0];
  const typeProfile: ManagerTypeProfile =
    MANAGER_TYPE_PROFILES[currentOffer.managerType || 'professional'] ||
    MANAGER_TYPE_PROFILES.professional;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-white overflow-hidden animate-fadeIn">
      {/* FULL-SCREEN EVENT PANEL TOP BAR */}
      <header className="shrink-0 p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Briefcase className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                {t('AGENT REPRESENTATION')}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {t('Fame')}: <strong className="text-amber-300 font-mono text-sm">{player.fame || 0}</strong> • {t('OVR')}: <strong className="text-white font-mono text-sm">{player.ovr || 55}</strong>
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
              {offers.length === 1 ? t('Agent Representation Pitch') : t('Agency Representation Offers ({count})', { count: offers.length })}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onDeclineAll}
          className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition cursor-pointer flex items-center gap-2"
        >
          <X className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">{t('Decline (Stay Self-Managed)')}</span>
          <span className="sm:hidden">{t('Decline')}</span>
        </button>
      </header>

      {/* MAIN BODY AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6 custom-scrollbar text-left">
        {/* CANDIDATE SELECTOR TABS (If multiple offers) */}
        {offers.length > 1 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              {t('Select an Agent Candidate to Review Terms:')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {offers.map((offer, idx) => {
                const isSelected = selectedOfferIndex === idx;
                const profile = MANAGER_TYPE_PROFILES[offer.managerType || 'professional'] || MANAGER_TYPE_PROFILES.professional;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOfferIndex(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 shadow-xl shadow-amber-950/40 ring-2 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-md text-white bg-gradient-to-r ${profile.badgeColor} uppercase tracking-wider`}>
                        {t(profile.title)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {offer.isNewCardGuaranteed && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 uppercase tracking-wider shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse">
                            ✨ NEW
                          </span>
                        )}
                        {offer.tier && (
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                            {t(offer.tier.toUpperCase())}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-base font-black text-white line-clamp-1">
                        {offer.name}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {offer.agencyName || t('Independent Agency')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-2 border-t border-slate-800">
                      <span>{t('Neg')}: <strong className="text-blue-400 font-mono text-sm">{offer.negotiation}</strong></span>
                      <span>{t('Net')}: <strong className="text-amber-400 font-mono text-sm">{offer.network}</strong></span>
                      <span>{t('Mkt')}: <strong className="text-emerald-400 font-mono text-sm">{offer.marketing}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SELECTED MANAGER PROFILE CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-lg text-white bg-gradient-to-r ${typeProfile.badgeColor} uppercase tracking-wide`}>
                  {t(typeProfile.title)}
                </span>
                {currentOffer.isNewCardGuaranteed && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 uppercase tracking-wider shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse flex items-center gap-1">
                    <span>✨</span>
                    <span>NEW CARD GUARANTEE</span>
                  </span>
                )}
                {currentOffer.associatedClubName && (
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    🏛️ {currentOffer.associatedClubName}
                  </span>
                )}
                {currentOffer.tier && (
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg uppercase">
                    {t(currentOffer.tier)} {t('Tier')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentOffer.name}
              </h2>
              <p className="text-sm text-amber-300/90 font-medium italic">
                "{t(typeProfile.tagline)}"
              </p>
            </div>

            {/* RATINGS ROW */}
            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-blue-500/40 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Negotiation')}</div>
                <div className="text-xl font-black text-blue-400 font-mono mt-0.5">{currentOffer.negotiation}</div>
              </div>
              <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-amber-500/40 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Network')}</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{currentOffer.network}</div>
              </div>
              <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-emerald-500/40 text-center min-w-[90px]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Marketing')}</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{currentOffer.marketing}</div>
              </div>
            </div>
          </div>

          {/* BIO & TRAITS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-blue-400" />
                {t('Agent Dossier & Bio')}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t(currentOffer.bio || typeProfile.description)}
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 text-xs">
                <Star className="w-4 h-4 text-amber-400" />
                {t('Representation Impact')}
              </span>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span><strong>{t('Development')}:</strong> {t(typeProfile.developmentBonus)}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span><strong>{t('Financials')}:</strong> {t(typeProfile.financialBonus)}</span>
                </div>
                {typeProfile.riskFactor && (
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>{t('Risk Warning')}:</strong> {t(typeProfile.riskFactor)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SPECIAL TRAIT BANNER */}
          {currentOffer.specialTrait && (
            <div className="p-4 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-sm text-amber-200">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>{t('Signature Trait')}:</strong> {t(currentOffer.specialTrait)}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <footer className="shrink-0 p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3 z-20 shadow-lg">
        <button
          type="button"
          onClick={onDeclineAll}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer transition active:scale-95"
        >
          {t('Stay Self-Managed')}
        </button>

        <button
          type="button"
          onClick={() => onSelectManager(currentOffer)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer transition active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{t('Sign Representation Contract')}</span>
        </button>
      </footer>
    </div>,
    document.body
  );
};
