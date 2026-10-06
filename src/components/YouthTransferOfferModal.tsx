import React, { useState } from 'react';
import { PlayerConfig, PlayerCardData } from '../types';
import { YouthTransferOffer } from '../utils/transferRequestSystem';
import {
  GraduationCap,
  Globe,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Target,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface YouthTransferOfferModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  offers: YouthTransferOffer[];
  onAcceptOffer: (offer: YouthTransferOffer) => void;
  onClose: () => void;
}

export const YouthTransferOfferModal: React.FC<YouthTransferOfferModalProps> = ({
  isOpen,
  player,
  offers,
  onAcceptOffer,
  onClose,
}) => {
  const { t } = useLanguage();
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');

  if (!isOpen || offers.length === 0) return null;

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  return (
    <div
      id="youth-transfer-offer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-pixel select-none"
    >
      <div
        id="youth-transfer-offer-modal"
        className="relative w-full max-w-4xl bg-slate-900 border-2 border-indigo-500 pixel-corners pixel-bevel-raised shadow-2xl shadow-indigo-500/10 overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-indigo-900 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg border-b-2 border-indigo-500/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-indigo-950/80 border border-indigo-400/40 text-indigo-300 text-[10px] font-black uppercase pixel-corners tracking-wider font-arcade">
                Youth League Transfer Window
              </span>
              <span className="text-[10px] text-indigo-200/80 font-semibold font-retro">
                Academy Relocation Opportunity
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 pixel-text-shadow">
              Youth Academy Transfer Offers
            </h2>
          </div>
          <button
            onClick={onClose}
            className="self-end sm:self-center p-1.5 pixel-corners text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-slate-700 bg-slate-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Youth Context Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-retro">Current Academy:</span>
            <span className="font-bold text-white font-arcade">{player.club || player.youthTeamName || 'Youth Academy'}</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-300 font-retro">{player.youthLeagueName || 'Domestic Youth League'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-retro">Primary Nationality:</span>
            <span className="font-bold text-amber-300 font-arcade">
              {player.nationality?.name || player.country || 'National Citizen'}
            </span>
          </div>
        </div>

        {/* Main Content: Offers List & Selected Offer Detail */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Offer Selector Cards (Left / Top) */}
            <div className="lg:col-span-5 space-y-2.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-arcade">
                Eligible Youth Academies ({offers.length})
              </h3>
              <div className="space-y-2">
                {offers.map((offer) => {
                  const isSelected = offer.id === currentOffer.id;
                  return (
                    <button
                      key={offer.id}
                      onClick={() => setSelectedOfferId(offer.id)}
                      className={`w-full text-left p-3 pixel-corners border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-950 border-indigo-400 pixel-bevel-raised shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 pixel-bevel-sunken'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{offer.flag}</span>
                          <span className="font-black text-xs text-white truncate">
                            {offer.destinationClub}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-retro">
                          {offer.destinationLeague} • {offer.destinationCountry}
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end">
                        {offer.isInternational ? (
                          <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-[9px] font-bold pixel-corners font-arcade">
                            Dual Passport
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-bold pixel-corners font-arcade">
                            Domestic
                          </span>
                        )}
                        <span className="text-[10px] text-indigo-300 font-bold mt-1 font-arcade">
                          {offer.ovr} OVR
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Offer Detail Card (Right / Bottom) */}
            <div className="lg:col-span-7 bg-slate-950 p-4 pixel-corners border-2 border-indigo-500/40 pixel-bevel-sunken space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Academy Title & Country */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-arcade">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {currentOffer.academyTier}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2 pixel-text-shadow">
                      <span>{currentOffer.flag}</span>
                      <span>{currentOffer.destinationClub}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-retro">
                      {currentOffer.destinationLeague} • {currentOffer.destinationCity},{' '}
                      {currentOffer.destinationCountry}
                    </p>
                  </div>
                  <div className="p-2.5 bg-indigo-950/60 pixel-corners border border-indigo-500/30 text-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase font-pixel">Rating</span>
                    <span className="text-base font-black text-indigo-300 font-arcade">{currentOffer.ovr}</span>
                  </div>
                </div>

                {/* Academy Development Style */}
                {currentOffer.developmentStyle && (
                  <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-pixel">
                      Tactical Philosophy & School
                    </span>
                    <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5 capitalize font-retro">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      {currentOffer.developmentStyle.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}

                {/* International Dual Nationality Earned Section (Requirement 8) */}
                {currentOffer.isInternational ? (
                  <div className="p-3 bg-cyan-950/40 pixel-corners border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-300 font-black text-[10px] uppercase tracking-wider font-arcade">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>International Youth Pathway & Earned Nationality</span>
                    </div>
                    <p className="text-[11px] text-cyan-100/90 leading-relaxed font-retro">
                      By transferring to <strong>{currentOffer.destinationClub}</strong>, you will develop inside{' '}
                      <strong>{currentOffer.destinationCountry}’s</strong> football academy ecosystem. Upon turning 18, you will
                      officially earn <strong>{currentOffer.destinationCountry}</strong> nationality alongside your primary{' '}
                      <strong>{player.nationality?.name || player.country || 'original'}</strong> nationality!
                    </p>
                    <div className="pt-0.5 flex items-center gap-1.5 text-[10px] text-cyan-300 font-semibold font-retro">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Primary citizenship preserved • Full European/domestic eligibility upon turning 18</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 pixel-corners border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300 font-black text-[10px] uppercase tracking-wider font-arcade">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Domestic Academy Development</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-retro">
                      Continue developing within your home country’s youth system with competitive league matches and direct first-team scout observation.
                    </p>
                  </div>
                )}

                {/* Scouting Assessment */}
                <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800 text-[11px] text-slate-300 leading-relaxed italic font-retro">
                  "{currentOffer.reason}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 pixel-corners border-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer pixel-bevel-raised uppercase font-pixel"
                >
                  Stay at Current Academy
                </button>
                <button
                  type="button"
                  onClick={() => onAcceptOffer(currentOffer)}
                  className="w-full sm:w-auto px-5 py-2 pixel-corners bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-400 text-white text-xs font-black pixel-bevel-raised flex items-center justify-center gap-2 transition-all cursor-pointer uppercase font-pixel"
                >
                  <span>Accept & Join {currentOffer.destinationClub}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
