import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  DollarSign,
  Globe,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Building2,
  TrendingUp,
  ShieldCheck,
  Award,
  Zap,
  Briefcase,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Flame,
  Compass,
} from 'lucide-react';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  calculateContractRenewal,
  generateManagerTransferProposals,
  calculatePlayingTimeIntervention,
  generateYouthProFastTrackOffers,
  generateTopYouthAcademyOffers,
  ContractRenewalResult,
  ManagerTransferProposal,
  PlayingTimeInterventionResult,
  YouthProOffer,
  TopYouthAcademyOffer,
} from '../utils/managerInteractionSystem';
import { isProfessionalPlayer, ensureProgressionIntegrityOnProTransition } from '../utils/playerIdentitySystem';
import { addPlayerNewPosition } from '../utils/positionMasterySystem';
import { calculatePlayerMarketValue } from '../utils/transferMarketSystem';
import { getPerkById, CareerPerk } from '../utils/perksSystem';
import { findClubInLeagueDatabase } from '../utils/kitResolutionSystem';
import { rebuildPlayerCompetitiveContextOnTransfer } from '../utils/clubContextRebuilder';
import { useLanguage } from '../context/LanguageContext';

export type ManagerActiveAction =
  | 'none'
  | 'pro_contract_renewal'
  | 'pro_request_transfer'
  | 'pro_playing_time'
  | 'youth_get_pro_team'
  | 'youth_get_new_youth_team';

interface ManagerActionsModalProps {
  isOpen: boolean;
  action: ManagerActiveAction;
  onClose: () => void;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onUpdatePlayer: (updatedPlayer: PlayerCardData) => void;
  onUpdateAccounting: (updatedAccounting: AccountingState) => void;
  onUpdateManager?: (updatedManager: ManagerState) => void;
  onTriggerPerkUnlock?: (perk: CareerPerk) => void;
  showToast: (msg: string) => void;
}

export const ManagerActionsModal: React.FC<ManagerActionsModalProps> = ({
  isOpen,
  action,
  onClose,
  player,
  accounting,
  manager,
  onUpdatePlayer,
  onUpdateAccounting,
  onTriggerPerkUnlock,
  showToast,
}) => {
  const { t } = useLanguage();
  // State for generated payloads
  const [renewalResult, setRenewalResult] = useState<ContractRenewalResult | null>(null);
  const [transferProposals, setTransferProposals] = useState<ManagerTransferProposal[]>([]);
  const [playingTimeResult, setPlayingTimeResult] = useState<PlayingTimeInterventionResult | null>(null);
  const [youthProOffers, setYouthProOffers] = useState<YouthProOffer[]>([]);
  const [topYouthOffers, setTopYouthOffers] = useState<TopYouthAcademyOffer[]>([]);

  // Selected sub-items
  const [selectedTransferProposal, setSelectedTransferProposal] = useState<ManagerTransferProposal | null>(null);
  const [selectedYouthProOffer, setSelectedYouthProOffer] = useState<YouthProOffer | null>(null);
  const [selectedTopYouthOffer, setSelectedTopYouthOffer] = useState<TopYouthAcademyOffer | null>(null);

  // Initialize payload on action open
  React.useEffect(() => {
    if (!isOpen) return;

    if (action === 'pro_contract_renewal') {
      const res = calculateContractRenewal(player, accounting, manager);
      setRenewalResult(res);
    } else if (action === 'pro_request_transfer') {
      const props = generateManagerTransferProposals(player, manager);
      setTransferProposals(props);
      setSelectedTransferProposal(props[0] || null);
    } else if (action === 'pro_playing_time') {
      const res = calculatePlayingTimeIntervention(player, manager);
      setPlayingTimeResult(res);
    } else if (action === 'youth_get_pro_team') {
      const offers = generateYouthProFastTrackOffers(player, manager);
      setYouthProOffers(offers);
      setSelectedYouthProOffer(offers[0] || null);
    } else if (action === 'youth_get_new_youth_team') {
      const topOffers = generateTopYouthAcademyOffers(player, manager);
      setTopYouthOffers(topOffers);
      setSelectedTopYouthOffer(topOffers[0] || null);
    }
  }, [isOpen, action, player, accounting, manager]);

  if (!isOpen || action === 'none') return null;

  // HANDLERS
  const handleAcceptContractRenewal = () => {
    if (!renewalResult || !renewalResult.isSuccess) return;

    const updatedAccounting: AccountingState = {
      ...accounting,
      contractYears: renewalResult.newContractYears,
      yearlySalary: renewalResult.newYearlySalary,
      releaseClause: renewalResult.newReleaseClause ?? accounting?.releaseClause,
      transferStatus: 'not_listed',
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + renewalResult.signingBonus,
    };

    const updatedPlayer: PlayerCardData = {
      ...player,
      isFreeAgent: false,
      contractYearsRemaining: renewalResult.newContractYears,
      releaseClause: renewalResult.newReleaseClause ?? player.releaseClause,
      marketValue: calculatePlayerMarketValue({
        ...player,
        accounting: updatedAccounting,
      }).marketValue,
    };

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    showToast(t("✍️ Contract Renewed! New weekly wage: €{wage}/wk (+€{bonus} bonus)", {
      wage: renewalResult.newWeeklyWage.toLocaleString(),
      bonus: renewalResult.signingBonus.toLocaleString(),
    }));
    onClose();
  };

  const handleExecuteTransfer = (proposal: ManagerTransferProposal) => {
    const isSaudi =
      proposal.countryName.toLowerCase().includes('saudi') ||
      proposal.countryName.toLowerCase().includes('arabia') ||
      proposal.leagueName.toLowerCase().includes('saudi') ||
      proposal.leagueName.toLowerCase().includes('roshn');

    // Credit both signing bonus AND player's cut of the transfer fee (5%-10%)
    const playerFeeBonus = proposal.playerTransferFeeCutAmount || 0;
    const totalBonusGained = proposal.signingBonus + playerFeeBonus;

    const updatedAccounting: AccountingState = {
      ...accounting,
      contractYears: proposal.contractYears,
      yearlySalary: proposal.yearlySalary,
      releaseClause: proposal.releaseClause,
      transferStatus: 'not_listed',
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + totalBonusGained,
    };

    let nextActivePerks = [...(player.activePerkIds || [])];
    if (isSaudi && !nextActivePerks.includes('mercenary')) {
      if (nextActivePerks.length >= 5) {
        nextActivePerks[nextActivePerks.length - 1] = 'mercenary';
      } else {
        nextActivePerks.push('mercenary');
      }
    }

    const updatedPlayer: PlayerCardData = rebuildPlayerCompetitiveContextOnTransfer(
      player,
      proposal.clubName,
      {
        isFreeAgent: false,
        contractYearsRemaining: proposal.contractYears,
        releaseClause: proposal.releaseClause,
        squadDestination: proposal.proposedSquad,
        squadRole: proposal.expectedRole,
        hasSeenSaudiOfferEvent: isSaudi ? true : player.hasSeenSaudiOfferEvent,
        activePerkIds: nextActivePerks,
        accounting: updatedAccounting,
      } as any
    );

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    if (isSaudi) {
      const mercenaryPerk = getPerkById('mercenary');
      if (mercenaryPerk && onTriggerPerkUnlock) {
        onTriggerPerkUnlock(mercenaryPerk);
      }
      showToast(t('💰 Transferred to {club}! Fee: {fee} • Player Cut: €{cut} • Unlocked "Mercenary" perk!', {
        club: proposal.clubName,
        fee: proposal.formattedFee,
        cut: playerFeeBonus.toLocaleString(),
      }));
    } else {
      showToast(t('✈️ Transferred to {club}! Fee: {fee} • Wage: €{wage}/wk • Player Cut: €{cut}', {
        club: proposal.clubName,
        fee: proposal.formattedFee,
        wage: proposal.weeklyWage.toLocaleString(),
        cut: playerFeeBonus.toLocaleString(),
      }));
    }
    onClose();
  };

  const handleApplyPlayingTimeOutcome = () => {
    if (!playingTimeResult) return;

    let updatedPlayer: PlayerCardData = { ...player };

    if (
      playingTimeResult.outcomeType === 'first_team_starter' ||
      playingTimeResult.outcomeType === 'young_potential_succession'
    ) {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = playingTimeResult.newRole || 'Starting XI Pillar';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'first_team_rotation') {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = 'Primary First-Team Rotation';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (
      playingTimeResult.outcomeType === 'reserves_to_first_team' ||
      (playingTimeResult.outcomeType as string) === 'first_team_promotion'
    ) {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = 'First Team Squad Player';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'u20_to_reserves') {
      updatedPlayer.squadDestination = 'Reserves';
      updatedPlayer.squadRole = 'Reserves Prospect';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'u17_to_u20') {
      updatedPlayer.squadDestination = 'U20';
      updatedPlayer.squadRole = 'U20 Developing Talent';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'development_plan') {
      updatedPlayer.squadRole = 'Development Plan Focus';
    } else if (playingTimeResult.outcomeType === 'suggest_learn_position') {
      if (playingTimeResult.learnPositionProposal) {
        updatedPlayer = addPlayerNewPosition(updatedPlayer, playingTimeResult.learnPositionProposal);
        updatedPlayer.squadRole = `Learning ${playingTimeResult.learnPositionProposal.subPosition}`;
        updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
      }
    } else if (playingTimeResult.outcomeType === 'season_loan_move') {
      if (playingTimeResult.loanClub) {
        updatedPlayer.club = `${playingTimeResult.loanClub.name} (Loan)`;
        updatedPlayer.league = playingTimeResult.loanClub.league;
        updatedPlayer.squadDestination = 'First Team';
        updatedPlayer.squadRole = 'Guaranteed Starter';
      }
    } else if (playingTimeResult.outcomeType === 'transfer_list') {
      updatedPlayer.requestedTransfer = true;
      updatedPlayer.squadRole = 'Transfer Listed';
    }

    onUpdatePlayer(updatedPlayer);
    showToast(t('🎯 Manager Decision: {headline}', { headline: t(playingTimeResult.headline) }));
    onClose();
  };

  const handleSignYouthProContract = (offer: YouthProOffer) => {
    const updatedAccounting: AccountingState = {
      contractYears: offer.contractYears,
      yearlySalary: offer.yearlySalary,
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + offer.signingBonus,
    };

    const matchedProClub = findClubInLeagueDatabase(offer.clubName);

    const updatedPlayer = ensureProgressionIntegrityOnProTransition(player, {
      clubName: offer.clubName,
      leagueName: offer.leagueName,
      countryName: offer.countryName,
      squadDestination: offer.squadDestination,
      playingTimeExpectation: offer.expectedRole === 'First Team Starter' ? 'STARTER' : 'ROTATION',
      fameBonus: 10,
      chemistryBonus: 50,
      recoverySupplementsBonus: 1,
    });
    if (matchedProClub) {
      updatedPlayer.clubId = matchedProClub.id;
      if (matchedProClub.kit) updatedPlayer.kit = { ...matchedProClub.kit };
      if (matchedProClub.emblem) updatedPlayer.emblem = { ...matchedProClub.emblem };
    }
    updatedPlayer.squadRole = offer.expectedRole;
    updatedPlayer.marketValue = calculatePlayerMarketValue({
      ...updatedPlayer,
      accounting: updatedAccounting,
    }).marketValue;

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    showToast(t('🌟 Signed First Pro Contract with {club}! Wage: €{wage}/wk', {
      club: offer.clubName,
      wage: offer.weeklyWage.toLocaleString(),
    }));
    onClose();
  };

  const handleSelectTopYouthAcademy = (offer: TopYouthAcademyOffer) => {
    const matchedYouthClub = findClubInLeagueDatabase(offer.name);

    const updatedPlayer: PlayerCardData = {
      ...player,
      club: offer.name,
      clubId: matchedYouthClub?.id || player.clubId,
      youthLeagueTeam: offer.name,
      league: offer.youthLeague,
      city: offer.city,
      clubCountry: offer.country,
      kit: matchedYouthClub?.kit ? { ...matchedYouthClub.kit } : player.kit,
      emblem: matchedYouthClub?.emblem ? { ...matchedYouthClub.emblem } : player.emblem,
    };

    onUpdatePlayer(updatedPlayer);
    showToast(t('🚀 Transferred to {club} ({city}, {country})! {perk}', {
      club: offer.name,
      city: offer.city,
      country: offer.country,
      perk: t(offer.developmentPerk),
    }));
    onClose();
  };

  // RENDER CONTENT
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-blue-500/40 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-left relative overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                {t('Agent & Boardroom Summit')}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {action === 'pro_contract_renewal' && t('Contract Renewal Negotiations')}
                {action === 'pro_request_transfer' && t('Transfer Market Proposals')}
                {action === 'pro_playing_time' && t('Playing Time & Squad Role Summit')}
                {action === 'youth_get_pro_team' && t('Fast-Track Professional Contract')}
                {action === 'youth_get_new_youth_team' && t('Elite Youth Academy Transfer')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT BY ACTION */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          {/* 1. PRO CONTRACT RENEWAL */}
          {action === 'pro_contract_renewal' && renewalResult && (
            <div className="space-y-4">
              {/* Agent Pitch Banner */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-white text-xs mb-1">{t("Agent's Negotiation Pitch")}</div>
                  <p className="text-slate-300 text-xs leading-relaxed">{t(renewalResult.managerPitchText)}</p>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">{t('Club Importance')}</span>
                  <span className="text-xs font-black text-amber-400">{t(renewalResult.statusBreakdown.importance)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">{t('Contract Urgency')}</span>
                  <span className="text-xs font-black text-emerald-400">{t(renewalResult.statusBreakdown.contractUrgency)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">{t('Agent Skill Leverage')}</span>
                  <span className="text-xs font-black text-blue-400">{t(renewalResult.statusBreakdown.negotiationSkillBonus)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">{t('Success Chance')}</span>
                  <span className="text-xs font-black text-purple-400">{renewalResult.successProbability}%</span>
                </div>
              </div>

              {/* Result Card */}
              {renewalResult.isSuccess ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t('Contract Terms Agreed!')}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{t(renewalResult.clubResponseText)}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/20">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{t('New Weekly Wage')}</span>
                      <span className="text-sm font-black text-emerald-300">
                        €{renewalResult.newWeeklyWage.toLocaleString()} / {t('wk')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        (+{renewalResult.percentageIncrease}% {t('raise')})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{t('Contract Duration')}</span>
                      <span className="text-sm font-black text-white">
                        {renewalResult.newContractYears} {t('Years')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({t('Was')} {renewalResult.oldContractYears} {t('yrs')})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">{t('Signing Bonus')}</span>
                      <span className="text-sm font-black text-amber-400">
                        €{renewalResult.signingBonus.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-300/80 block font-bold">{t('Paid Immediately')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptContractRenewal}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wide shadow-sm border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" /> {t('Sign New Contract')}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{t('Contract Renewal Stalled')}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{t(renewalResult.clubResponseText)}</p>
                  <p className="text-slate-400 text-[11px]">
                    {t('Tip: Renewal is significantly easier when you have 1 year or less left on your contract, or after raising your OVR and match influence.')}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs cursor-pointer transition border border-slate-200 shadow-sm"
                  >
                    {t('Return to Career Hub')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. PRO REQUEST TRANSFER OFFERS */}
          {action === 'pro_request_transfer' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-slate-300 text-xs flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  {t("{agentName} tapped his club network (Rating: {network}/100) to bring {count} formal transfer bids.", {
                    agentName: manager?.name || t('Your Agent'),
                    network: manager?.network || 40,
                    count: transferProposals.length,
                  })}
                </span>
              </div>

              <div className="space-y-3">
                {transferProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 rounded-2xl space-y-3 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{prop.countryFlag}</span>
                        <div>
                          <div className="font-black text-white text-sm flex items-center flex-wrap gap-1.5">
                            <span>{prop.clubName}</span>
                            {prop.clubTierInfo && (
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${prop.clubTierInfo.badgeBg}`}>
                                {t(prop.clubTierInfo.shortLabel)}
                              </span>
                            )}
                            {prop.interestEvaluation && (
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                prop.interestEvaluation.classification === 'Aggressive Pursuit'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                                  : prop.interestEvaluation.classification === 'Very Strong Interest'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}>
                                {t(prop.interestEvaluation.classification)} ({prop.interestEvaluation.interestScore}%)
                              </span>
                            )}
                            {prop.isSaudiMegaOffer && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase">
                                🇸🇦 {t('Mega Offer')}
                              </span>
                            )}
                            {prop.isBenchRaidTransfer && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-black uppercase">
                                ⭐ {t('Bench-to-Starter')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{prop.leagueName} ({prop.countryName})</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Offered Fee')}</span>
                        <span className="text-sm font-black text-emerald-400">{prop.formattedFee}</span>
                      </div>
                    </div>

                    {/* Starter Comparison & Tactical Fit Banner */}
                    {prop.starterComparisonText && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t('Squad Starter Comparison')}:</span>
                        </span>
                        <span className="font-mono font-black text-cyan-300">{t(prop.starterComparisonText)}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Weekly Wage')}</span>
                        <span className="text-xs font-black text-white">€{prop.weeklyWage.toLocaleString()}/{t('wk')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Role Promised')}</span>
                        <span className="text-xs font-black text-amber-400">{t(prop.expectedRole)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Signing Bonus')}</span>
                        <span className="text-xs font-black text-purple-400">€{prop.signingBonus.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold block">{t('Player Cut')} ({prop.playerTransferFeeCutPercent || 7}%)</span>
                        <span className="text-xs font-black text-emerald-300">€{(prop.playerTransferFeeCutAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <p className="text-[11px] text-slate-400 italic flex-1">{t(prop.managerAssessment)}</p>
                      <button
                        type="button"
                        onClick={() => handleExecuteTransfer(prop)}
                        className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition shadow-sm border border-slate-200 shrink-0 min-h-[38px] active:scale-95"
                      >
                        <span>{t('Accept & Sign')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PRO PLAYING TIME INTERVENTION */}
          {action === 'pro_playing_time' && playingTimeResult && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{t('Coach & Boardroom Tactical Decision')}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">{t(playingTimeResult.coachStatement)}</p>
              </div>

              {/* Manager Tactical Evaluation Matrix */}
              {playingTimeResult.evaluation && (
                <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <span>{t('Position Depth & Rival Evaluation')}</span>
                    <span className="text-blue-400">{player.position || 'ST'} {t('Depth Chart')}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* You */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[10px]">{t('YOU')}</span>
                        <span className="font-bold text-white">{player.name} ({t('Age')} {player.age || 20})</span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="text-slate-300 font-extrabold">{player.ovr} {t('OVR')}</span>
                        <span className="text-amber-400 font-extrabold">{player.potentialOvr || 80} {t('POT')}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{t(playingTimeResult.evaluation.playerForm)}</span>
                      </div>
                    </div>

                    {/* Competitors */}
                    {playingTimeResult.evaluation.competitorsAhead.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">{t('RIVAL')}</span>
                          <span className="font-medium text-slate-200">{comp.name} ({t('Age')} {comp.age})</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-slate-300 font-bold">{comp.ovr} {t('OVR')}</span>
                          <span className="text-slate-400 font-bold">{comp.potential} {t('POT')}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{t(comp.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="font-extrabold text-white text-xs">{t('Negotiated Outcome')}: {t(playingTimeResult.headline)}</div>
                <p className="text-slate-300 text-xs leading-relaxed">{t(playingTimeResult.managerDebrief)}</p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">{t('Squad Destination')}</span>
                    <span className="text-xs font-black text-emerald-400">{t(playingTimeResult.newSquad)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">{t('Assigned Role')}</span>
                    <span className="text-xs font-black text-blue-400">{t(playingTimeResult.newRole)}</span>
                  </div>
                </div>

                {playingTimeResult.loanClub && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs">
                    <strong>{t('Loan Destination')}:</strong> {playingTimeResult.loanClub.name} ({playingTimeResult.loanClub.league}) • {t('Role')}: {t(playingTimeResult.loanClub.guaranteedRole)}
                  </div>
                )}

                {playingTimeResult.learnPositionProposal && (
                  <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-2 text-xs text-purple-200">
                    <div className="flex items-center gap-2 font-black text-purple-300">
                      <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{t('Position Opportunity')}: {playingTimeResult.learnPositionProposal.subPosition}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {t(playingTimeResult.learnPositionProposal.explanation)}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-purple-500/20 text-[11px]">
                      <span className="text-purple-300 font-bold">{t('Current Starter')}: {playingTimeResult.learnPositionProposal.starterName}</span>
                      <span className="text-amber-400 font-black">{playingTimeResult.learnPositionProposal.starterOvr} {t('OVR')}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyPlayingTimeOutcome}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wide shadow-sm border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {playingTimeResult.outcomeType === 'suggest_learn_position'
                  ? t('Confirm & Learn {pos}', { pos: playingTimeResult.learnPositionProposal?.subPosition || 'Position' })
                  : t('Confirm & Apply Changes')}
              </button>
            </div>
          )}

          {/* 4. YOUTH GET PRO TEAM */}
          {action === 'youth_get_pro_team' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {t("{agentName} pitched your youth academy tape to professional scouts. Choose an official professional contract to sign:", {
                    agentName: manager?.name || t('Your Agent'),
                  })}
                </span>
              </div>

              <div className="space-y-3">
                {youthProOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-2xl space-y-3 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{offer.countryFlag}</span>
                        <div>
                          <div className="font-black text-white text-sm flex items-center gap-2">
                            {offer.clubName}
                            <span className="px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              {t('Pro Tier')} {offer.leagueTier}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{offer.leagueName} ({offer.countryName})</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Weekly Salary')}</span>
                        <span className="text-sm font-black text-emerald-400">€{offer.weeklyWage.toLocaleString()}/{t('wk')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Squad')}</span>
                        <span className="text-xs font-black text-blue-400">{t(offer.squadDestination)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Expected Role')}</span>
                        <span className="text-xs font-black text-amber-400">{t(offer.expectedRole)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Signing Bonus')}</span>
                        <span className="text-xs font-black text-purple-400">€{offer.signingBonus.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-400 italic max-w-sm">{t(offer.managerReview)}</p>
                      <button
                        type="button"
                        onClick={() => handleSignYouthProContract(offer)}
                        className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition shadow-sm border border-slate-200 shrink-0 min-h-[38px] active:scale-95"
                      >
                        <span>{t('Sign Pro Deal')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. YOUTH GET NEW YOUTH TEAM */}
          {action === 'youth_get_new_youth_team' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  {t("{agentName} arranged transfers to Top-2 powerhouse academies across international youth leagues:", {
                    agentName: manager?.name || t('Your Agent'),
                  })}
                </span>
              </div>

              <div className="space-y-3">
                {topYouthOffers.map((topOffer) => (
                  <div
                    key={topOffer.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-2xl space-y-3 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{topOffer.countryFlag}</span>
                        <div>
                          <div className="font-black text-white text-sm flex items-center gap-2">
                            {topOffer.name}
                            <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              {t(topOffer.leagueStanding)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {topOffer.youthLeague} • {topOffer.city}, {topOffer.country}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">{t('Academy OVR')}</span>
                        <span className="text-sm font-black text-amber-400">{topOffer.ovr} {t('OVR')}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{t('Development Facility Perk')}</span>
                      <span className="text-xs font-extrabold text-emerald-300">{t(topOffer.developmentPerk)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-400 italic max-w-sm">{t(topOffer.managerPitch)}</p>
                      <button
                        type="button"
                        onClick={() => handleSelectTopYouthAcademy(topOffer)}
                        className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition shadow-sm border border-slate-200 shrink-0 min-h-[38px] active:scale-95"
                      >
                        <span>{t('Join Academy')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
