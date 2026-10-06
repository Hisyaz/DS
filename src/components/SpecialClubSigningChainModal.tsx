import React, { useState } from 'react';
import {
  SpecialClubEvaluation,
  SigningChainStep,
  NegotiationResultState,
  SpecialClubId,
} from '../types/specialClubInterest';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  rollBigThreeClubNegotiation,
  rollForceWayOutNegotiation,
} from '../utils/specialClubInterestSystem';
import {
  Crown,
  Trophy,
  Coins,
  DollarSign,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  AlertTriangle,
  Building,
  Flame,
  Star,
  Compass,
  Globe,
} from 'lucide-react';

interface SpecialClubSigningChainModalProps {
  isOpen: boolean;
  evaluation: SpecialClubEvaluation;
  player: PlayerCardData;
  onCompleteTransferToUniversalOffer: (evaluation: SpecialClubEvaluation) => void;
  onExplicitRejectBigThree: (clubId: SpecialClubId) => void;
  onRejectPsg: () => void;
  onRejectSaudiTemporary: () => void;
  onRejectSaudiPermanent: () => void;
  onFailedTransferToDecay: (clubId: SpecialClubId) => void;
  onHostagePenalty: () => void;
  onClose: () => void;
}

export const SpecialClubSigningChainModal: React.FC<SpecialClubSigningChainModalProps> = ({
  isOpen,
  evaluation,
  player,
  onCompleteTransferToUniversalOffer,
  onExplicitRejectBigThree,
  onRejectPsg,
  onRejectSaudiTemporary,
  onRejectSaudiPermanent,
  onFailedTransferToDecay,
  onHostagePenalty,
  onClose,
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<SigningChainStep>(1);
  const [negotiationState, setNegotiationState] = useState<NegotiationResultState>({
    status: 'idle',
  });
  const [isSimulatingRoll, setIsSimulatingRoll] = useState<boolean>(false);

  if (!isOpen || !evaluation) return null;

  const { config, salary, weeklyWage, signingBonus, formattedFee, buyerClub } = evaluation;
  const isBigThree = config.category === 'big_three';
  const isBigSix = config.category === 'big_six';
  const isPsg = config.category === 'psg';
  const isSaudi = config.category === 'saudi';

  // Step 5: Transfer negotiation trigger
  const handleInitiateClubNegotiation = () => {
    if (!isBigThree && !isBigSix) {
      // PSG and Saudi Arabia have unlimited financial backing -> 100% Automatic Agreement!
      setNegotiationState({
        status: 'club_accepted',
        narrativeText: isSaudi
          ? `Representatives from the Kingdom have finalized a record transfer fee with ${player.club}. The board accepted the unprecedented sum immediately with zero resistance.`
          : `Paris Saint-Germain met ${player.club}'s full buyout asking price without hesitation. Transfer documentation is officially ratified!`,
      });
      return;
    }

    // For Big Three and Big Six: Roll 80% Acceptance / 20% Refusal
    setIsSimulatingRoll(true);
    setTimeout(() => {
      setIsSimulatingRoll(false);
      const result = rollBigThreeClubNegotiation();
      if (result.isClubAgreed) {
        setNegotiationState({
          status: 'club_accepted',
          rollPercentage: result.rollNumber,
          narrativeText: `80% AGREEMENT! ${config.name} negotiators successfully reached a full transfer accord with ${player.club}. The selling board officially authorized your medical and contract signing!`,
        });
      } else {
        setNegotiationState({
          status: 'club_refused',
          rollPercentage: result.rollNumber,
          narrativeText: `20% REFUSAL! ${player.club}'s board has refused to sell. They consider you irreplaceable to their sporting ambitions and have blocked ${config.name}'s formal bid.`,
        });
      }
    }, 1000);
  };

  // Step 5: Force My Way Out Handler
  const handleForceWayOut = () => {
    setIsSimulatingRoll(true);
    const wasHostage = Boolean(player.hasBeenHostageBefore);

    setTimeout(() => {
      setIsSimulatingRoll(false);
      const forceResult = rollForceWayOutNegotiation(wasHostage);

      if (forceResult.isAccepted) {
        setNegotiationState({
          status: 'force_accepted',
          isPreviouslyHostage: wasHostage,
          narrativeText: `${wasHostage ? '95%' : '80%'} BREAKTHROUGH! You went on strike, skipped training, and issued a fiery public transfer request. Under intense media scrutiny, ${player.club}'s board buckled and agreed to the transfer!`,
        });
      } else {
        setNegotiationState({
          status: 'force_hostage',
          isPreviouslyHostage: wasHostage,
          narrativeText: `${wasHostage ? '5%' : '20%'} BOARD HARDLINE — HOSTAGE! Your club refused to be intimidated. The chairman declared your rebellion unacceptable, banished you to the Reserves for 6 months, and stripped your matchday privileges.`,
        });
      }
    }, 1200);
  };

  return (
    <div
      id="special-club-signing-chain-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/95 backdrop-blur-xl text-white overflow-hidden animate-fadeIn"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.badgeBg} flex items-center justify-center text-2xl shadow-lg shrink-0 border border-white/20`}
            >
              {config.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  {t('BOARDROOM SIGNING CHAIN')}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {t('STEP {current} OF 5', { current: currentStep })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {config.name} • {t('Official Transfer Summit')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    stepNum === currentStep
                      ? 'bg-amber-400 text-slate-950'
                      : stepNum < currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {stepNum < currentStep ? '✓' : stepNum}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar text-left">
          {/* STEP 1: KEY LEADERS & OFFICIAL SUMMIT */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3 text-amber-400 text-sm font-black uppercase tracking-wider">
                  <Crown className="w-6 h-6" />
                  <span>{t('OFFICIAL SUMMIT WITH CLUB LEADERSHIP')}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shrink-0">
                    <Users className="w-8 h-8 text-slate-950" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white">{config.keyLeaders}</div>
                    <div className="text-xs uppercase font-bold text-amber-400">{config.leaderTitle}</div>
                    <div className="text-xs text-slate-300">
                      {t('Private delegation meeting at five-star presidential suite')}
                    </div>
                  </div>
                </div>

                <blockquote className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 text-sm sm:text-base text-slate-200 italic leading-relaxed">
                  &ldquo;{t(config.presidentialQuote)}&rdquo;
                </blockquote>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {isBigThree &&
                    t('The delegation presents you with the official club badge, outlining a historic multi-year sporting project designed to make you the undisputed leader of the team.')}
                  {isBigSix &&
                    t('The English delegation presents their grand Premier League tactical masterplan, offering you the iconic shirt and the key to dominating the world’s most watched football league.')}
                  {isPsg &&
                    t('President Al-Khelaïfi outlines Paris Saint-Germain’s ambition to conquer Europe, offering unmatched worldwide visibility in the fashion capital.')}
                  {isSaudi &&
                    t('The royal emissaries present a state-backed vision that goes beyond football, offering unprecedented private luxury, royal security, and ambassadorial status across the Kingdom.')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: FINANCIAL & SALARY SUMMIT */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3 text-amber-400 text-sm font-black uppercase tracking-wider">
                    <Coins className="w-6 h-6" />
                    <span>{t('FINANCIAL & SALARY PACKAGE')}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    {config.financialTier}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-1">
                    <div className="text-xs uppercase font-black text-amber-400">
                      {t('YEARLY SALARY')}
                    </div>
                    <div className="text-3xl font-black text-amber-300 font-mono">
                      €{(salary / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      €{salary.toLocaleString()}/{t('yr')}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
                    <div className="text-xs uppercase font-black text-emerald-400">
                      {t('WEEKLY WAGES')}
                    </div>
                    <div className="text-3xl font-black text-emerald-300 font-mono">
                      €{Math.round(weeklyWage / 1000)}k
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      €{weeklyWage.toLocaleString()}/{t('wk')}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 text-center space-y-1">
                    <div className="text-xs uppercase font-black text-cyan-400">
                      {t('SIGNING BONUS')}
                    </div>
                    <div className="text-3xl font-black text-cyan-300 font-mono">
                      €{(signingBonus / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-cyan-400/80 font-bold">
                      {t('Paid immediately on signature')}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white uppercase">{t('CONTRACT DURATION & COMMERCIAL RIGHTS')}</div>
                  <div>• {t('Contract Length')}: <strong className="text-white">{evaluation.contractYears} {t('Years')}</strong></div>
                  <div>• {t('Offered Transfer Fee to Current Club')}: <strong className="text-amber-300">{formattedFee}</strong></div>
                  {isSaudi && (
                    <div className="text-emerald-400 font-bold">
                      • {t('Tax-Free Compensation with complimentary luxury palace residence & private jet allocation.')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GLORY, HERITAGE & AMBITION */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-5">
                <div className="flex items-center gap-3 text-amber-400 text-sm font-black uppercase tracking-wider">
                  <Trophy className="w-6 h-6" />
                  <span>{t('SPORTING LEGACY, HERITAGE & WORLD GLORY')}</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3">
                  <div className="text-base font-black text-white">
                    {t('The Sporting Pitch of {club}', { club: config.name })}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t(config.legacyPitch)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                      <Star className="w-4 h-4" />
                      {t('Ballon d’Or & Individual Honors')}
                    </div>
                    <p className="text-xs text-slate-300">
                      {isBigThree && t('Playing here places you in the absolute epicenter of global media, providing the highest multiplier for world player awards.')}
                      {isPsg && t('Paris provides supreme French and European spotlight to lead a historic first continental crown.')}
                      {isSaudi && t('Step into history as the face of the Kingdom’s global football revolution.')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
                      <Globe className="w-4 h-4" />
                      {t('Sponsorship & Global Brand')}
                    </div>
                    <p className="text-xs text-slate-300">
                      {t('Massive surge in international commercial sponsors, elite lifestyle partnerships, and worldwide jersey sales.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MANAGER & TACTICAL VISION */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-5">
                <div className="flex items-center gap-3 text-amber-400 text-sm font-black uppercase tracking-wider">
                  <Briefcase className="w-6 h-6" />
                  <span>{t('MANAGER & TACTICAL BLUEPRINT')}</span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                    {config.managerNationality}
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{config.managerName}</div>
                    <div className="text-xs text-amber-400 font-bold">
                      {t('Head Coach')} • {config.formation} System
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {config.tacticalStyle}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-sm font-bold text-white uppercase">{t('YOUR GUARANTEED SQUAD ROLE')}</div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-sm">
                      {t('UNDISPUTED KEY STARTER')}
                    </div>
                    <div className="text-xs text-slate-300">
                      {t('Expected Position')}: <strong className="text-white">{evaluation.proposedPosition}</strong> ({evaluation.proposedPlaystyle})
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {t('Manager {name} confirms the starting XI is specifically arranged around your strengths to maximize goal contributions and tactical dominance.', {
                      name: config.managerName,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FORMAL PLAYER AGREEMENT & TRANSFER NEGOTIATION */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-5">
                <div className="flex items-center gap-3 text-amber-400 text-sm font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{t('FORMAL AGREEMENT & CLUB TRANSFER NEGOTIATION')}</span>
                </div>

                {negotiationState.status === 'idle' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="text-base font-black text-white">
                        {t('You have formally agreed to all personal terms with {club}!', {
                          club: config.name,
                        })}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {config.shortName}’s sporting director extends a warm handshake:
                        <br />
                        <strong className="text-amber-300 text-base">
                          &ldquo;{t('“We’ll negotiate with your club now.”')}&rdquo;
                        </strong>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">{t('Offering Club')}</div>
                        <div className="text-sm font-black text-white">{config.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase font-bold">{t('Current Club')}</div>
                        <div className="text-sm font-black text-amber-300">{player.club}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSimulatingRoll}
                      onClick={handleInitiateClubNegotiation}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition cursor-pointer"
                    >
                      {isSimulatingRoll ? (
                        <span>{t('Negotiating Transfer Fee with {club}...', { club: player.club })}</span>
                      ) : (
                        <>
                          <Briefcase className="w-5 h-5" />
                          <span>{t('Authorize {club} to Negotiate with {current}', {
                            club: config.shortName,
                            current: player.club,
                          })}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* CLUB ACCEPTED (80% for Big 3, or 100% for PSG/Saudi) */}
                {(negotiationState.status === 'club_accepted' || negotiationState.status === 'force_accepted') && (
                  <div className="space-y-4 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 animate-fadeIn">
                    <div className="flex items-center gap-3 text-emerald-400 text-base font-black">
                      <CheckCircle2 className="w-7 h-7" />
                      <span>{t('TRANSFER ACCORD REACHED!')}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {negotiationState.narrativeText}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        onCompleteTransferToUniversalOffer(evaluation);
                      }}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>{t('Proceed to Universal Contract Signing & Presentation')}</span>
                    </button>
                  </div>
                )}

                {/* CLUB REFUSED (20% for Big 3) */}
                {negotiationState.status === 'club_refused' && (
                  <div className="space-y-5 p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 animate-fadeIn">
                    <div className="flex items-center gap-3 text-rose-400 text-base font-black">
                      <ShieldAlert className="w-7 h-7" />
                      <span>{t('TRANSFER BLOCKED BY YOUR CURRENT CLUB')}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {negotiationState.narrativeText}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-amber-400 uppercase">{t('YOUR DECISION POINT')}</div>
                      <div>
                        • <strong className="text-white">{t('Force My Way Out')}:</strong> {t('Stop training, demand a transfer publicly.')} (80% club folds, 20% HOSTAGE banishment).
                      </div>
                      <div>
                        • <strong className="text-white">{t('Accept Club Decision & Stay')}:</strong> {t('End transfer chain peacefully. {club} will retain future interest.', { club: config.shortName })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onFailedTransferToDecay(config.id);
                          onClose();
                        }}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
                      >
                        {t('Accept Decision & Stay at {club}', { club: player.club })}
                      </button>

                      <button
                        type="button"
                        disabled={isSimulatingRoll}
                        onClick={handleForceWayOut}
                        className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Flame className="w-4 h-4" />
                        <span>{t('FORCE MY WAY OUT (Stop Training & Demand Sale)')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* HOSTAGE STATE */}
                {negotiationState.status === 'force_hostage' && (
                  <div className="space-y-4 p-5 rounded-2xl bg-red-950/60 border border-red-500/60 animate-fadeIn">
                    <div className="flex items-center gap-3 text-red-400 text-base font-black">
                      <AlertTriangle className="w-7 h-7" />
                      <span>{t('CAREER HOSTAGE: BANISHED TO RESERVES')}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {negotiationState.narrativeText}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-950 border border-red-500/30 text-xs text-slate-300 space-y-1.5">
                      <div className="font-bold text-red-400 uppercase">{t('HOSTAGE SANCTION DETAILS')}</div>
                      <div>• {t('Duration')}: <strong className="text-white">6 {t('Months')}</strong> ({t('Club refuses to field you in matches')})</div>
                      <div>• {t('Status')}: <strong className="text-amber-400">{t('Sent to Reserves')}</strong></div>
                      <div>• {t('Future Transfer Impact')}: <strong className="text-emerald-400">{t('95% acceptance rate on all future forced transfer exits')}</strong></div>
                      <div>• {t('Special Club Interest')}: <strong className="text-white">{t('{club} remains interested and will retry in future windows.', { club: config.shortName })}</strong></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onFailedTransferToDecay(config.id);
                        onHostagePenalty();
                        onClose();
                      }}
                      className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
                    >
                      {t('Acknowledge Sanction & Complete Transfer Window')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="shrink-0 p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep < 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as SigningChainStep)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Previous Step')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Explicit Reject Button (visible during steps 1-4) */}
            {currentStep < 5 && (
              <button
                type="button"
                onClick={() => {
                  if (isBigThree || isBigSix) {
                    onExplicitRejectBigThree(config.id);
                  } else if (isPsg) {
                    onRejectPsg();
                  } else if (isSaudi) {
                    onRejectSaudiTemporary();
                  }
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-xs uppercase border border-rose-500/30 transition cursor-pointer"
              >
                {t('Reject {club}', { club: config.shortName })}
              </button>
            )}

            {currentStep < 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as SigningChainStep)}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 transition cursor-pointer"
              >
                <span>{t('Agree & Proceed to Step {next}', { next: currentStep + 1 })}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
