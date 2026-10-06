import React, { useState, useMemo } from 'react';
import { PlayerConfig, PlayerCardData, ManagerState, AccountingState } from '../types';
import { AgentState } from '../types';
import {
  isEnglishPlayer,
  isLondonYouthLeaguePlayer,
  calculateEffectiveFame,
  isLockedEliteClub,
} from '../utils/professionalOfferEligibility';
import { getProClubsFromDatabase, ProClubDefinition } from '../utils/earlyCareerSystem';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = () => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  } catch (e) {
    // ignore
  }
};
import {
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Briefcase,
  Banknote,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Building,
} from 'lucide-react';

export interface PremierLeagueClubOffer {
  club: ProClubDefinition;
  weeklyWage: number;
  yearlySalary: number;
  signingBonus: number;
  contractYears: number;
  releaseClause: number;
  startingRole: string;
  roleDescription: string;
  developmentPoints: number;
  pitch: string;
}

interface PremierLeagueEventModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  manager?: ManagerState | AgentState | null;
  accounting?: AccountingState;
  onCompleteTransfer: (offer: PremierLeagueClubOffer) => void;
  onClose: () => void;
}

export const PremierLeagueEventModal: React.FC<PremierLeagueEventModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  onCompleteTransfer,
  onClose,
}) => {
  const [selectedClubIndex, setSelectedClubIndex] = useState<number>(0);
  const [stage, setStage] = useState<'selection' | 'negotiation' | 'work_permit' | 'permit_result'>('selection');
  const [workPermitApproved, setWorkPermitApproved] = useState<boolean | null>(null);

  const ovr = player.ovr || 75;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, manager);
  const isEnglish = isEnglishPlayer(player);
  const isLondonYouth = isLondonYouthLeaguePlayer(player);
  const requiresWorkPermit = !isEnglish && !isLondonYouth;

  const hasAgent = Boolean(
    manager && manager.name && !manager.name.includes('Self-Managed') && !manager.name.includes('No current')
  );

  // Pool of eligible EPL clubs (Tier 1 England, excluding Big 6)
  const candidateOffers: PremierLeagueClubOffer[] = useMemo(() => {
    const allClubs = getProClubsFromDatabase();
    const eplPool = allClubs.filter(
      (c) =>
        c.countryCode === 'ENG' &&
        c.leagueTier === 1 &&
        !isLockedEliteClub(c) &&
        (c.leagueName.toLowerCase().includes('premier') || c.leagueName.toLowerCase().includes('epl'))
    );

    // Fallback if specific search is narrow
    const fallbackClubs: Partial<ProClubDefinition>[] = [
      {
        id: 'eng_astonvilla',
        clubName: 'Aston Villa',
        clubBadgeBg: 'from-amber-700 via-sky-800 to-slate-950',
        leagueName: 'Premier League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Unai Emery',
        managerFormation: '4-2-3-1 / 4-4-2',
        managerTacticalStyle: 'Structured High-Block & Deadly Transitions',
      },
      {
        id: 'eng_newcastle',
        clubName: 'Newcastle United',
        clubBadgeBg: 'from-neutral-800 via-slate-900 to-sky-950',
        leagueName: 'Premier League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Eddie Howe',
        managerFormation: '4-3-3 Intense Press',
        managerTacticalStyle: 'High-Intensity Athletic Press & Vertical Attack',
      },
      {
        id: 'eng_brighton',
        clubName: 'Brighton & Hove Albion',
        clubBadgeBg: 'from-blue-600 via-sky-500 to-amber-400',
        leagueName: 'Premier League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Fabian Hürzeler',
        managerFormation: '4-2-3-1 Fluid',
        managerTacticalStyle: 'Positional Fluidity & Elite Scouting Pathway',
      },
      {
        id: 'eng_westham',
        clubName: 'West Ham United',
        clubBadgeBg: 'from-rose-900 via-sky-800 to-slate-950',
        leagueName: 'Premier League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Julen Lopetegui',
        managerFormation: '4-3-3 Balanced',
        managerTacticalStyle: 'Direct Wingplay & European Ambition',
      },
    ];

    const sourcePool = eplPool.length >= 3 ? eplPool : (fallbackClubs as ProClubDefinition[]);
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    return selected.map((club, idx) => {
      const baseWeekly = Math.round((45000 + (ovr - 75) * 4500 + (effectiveFame - 200) * 80) / 1000) * 1000;
      const weeklyWage = Math.max(38000, baseWeekly);
      const yearlySalary = weeklyWage * 52;
      const signingBonus = Math.round((yearlySalary * 0.35) / 50000) * 50000;
      const releaseClause = Math.round((55000000 + (ovr - 75) * 5000000) / 5000000) * 5000000;
      const startingRole = ovr >= 80 ? 'Crucial First-Team Starter' : 'Senior First-Team Regular';
      const roleDescription =
        ovr >= 80
          ? 'Guaranteed starting minutes across the Premier League campaign and domestic cup ties.'
          : 'Integrated directly into senior matchday squads with consistent weekly Premier League minutes.';

      const pitches = [
        `"Our analytical scouts have tracked your acceleration, tactical awareness, and ceiling. At ${club.clubName}, you will be developed directly under elite Premier League coaching."`,
        `"We play fearless, progressive football. We want you to challenge top Premier League defenses and spearhead our European qualification push."`,
        `"You have the physical dynamism and technical composure to excel in England. We have prepared an undisputed senior pathway for your profile."`,
      ];

      return {
        club,
        weeklyWage,
        yearlySalary,
        signingBonus,
        contractYears: 5,
        releaseClause,
        startingRole,
        roleDescription,
        developmentPoints: 210,
        pitch: pitches[idx % pitches.length],
      };
    });
  }, [ovr, effectiveFame]);

  if (!isOpen || candidateOffers.length === 0) return null;

  const currentOffer = candidateOffers[selectedClubIndex] || candidateOffers[0];

  const handleStartNegotiation = (index: number) => {
    setSelectedClubIndex(index);
    setStage('negotiation');
  };

  const handleProceedToRegistration = () => {
    if (requiresWorkPermit) {
      setStage('work_permit');
    } else {
      // Automatic domestic registration!
      triggerConfetti();
      onCompleteTransfer(currentOffer);
    }
  };

  const handleRunWorkPermitDecision = () => {
    // 80% approved, 20% rejected
    const roll = Math.random() * 100;
    const isApproved = roll < 80;
    setWorkPermitApproved(isApproved);
    setStage('permit_result');

    if (isApproved) {
      triggerConfetti();
    }
  };

  const handleFinalizeApprovedTransfer = () => {
    onCompleteTransfer(currentOffer);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto relative">
        {/* Glow Header Banner */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-5 sm:p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <Trophy className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  PREMIER LEAGUE DEDICATED EVENT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Premier League Wants You
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 border border-slate-700 transition"
            >
              ✕
            </button>
          </div>

          <p className="text-xs sm:text-sm text-purple-200/80 mt-2.5 max-w-2xl leading-relaxed">
            Your standout progression (<strong>{ovr} OVR</strong>) and soaring reputation (
            <strong>{effectiveFame} Effective Fame</strong>) have triggered official transfer approaches from England's
            top flight.
          </p>
        </div>

        {/* STAGE 1: EPL PROSPECT CLUB SELECTION */}
        {stage === 'selection' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stage 1 — Select Interested Premier League Club ({candidateOffers.length} Approaches)
              </h3>
              <span className="text-xs text-purple-400 font-semibold">Choose one club to open contract talks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidateOffers.map((offer, idx) => (
                <div
                  key={offer.club.id || idx}
                  className="bg-slate-800/60 border border-slate-700/80 hover:border-purple-500/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                          offer.club.clubBadgeBg || 'from-purple-800 to-slate-950'
                        } flex items-center justify-center font-black text-white text-base shadow-md border border-white/20`}
                      >
                        {offer.club.clubName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base leading-snug group-hover:text-purple-300 transition">
                          {offer.club.clubName}
                        </h4>
                        <div className="text-[11px] text-slate-400">
                          {offer.club.leagueName} • England
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Offered Role:</span>
                        <strong className="text-emerald-400">{offer.startingRole}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Weekly Wage:</span>
                        <strong className="text-white">€{offer.weeklyWage.toLocaleString()}/wk</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Manager:</span>
                        <span className="text-slate-200">{offer.club.managerName}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic leading-relaxed line-clamp-3">
                      {offer.pitch}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartNegotiation(idx)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <span>Enter Boardroom Talks</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {requiresWorkPermit && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong>Work Permit Advisory:</strong> Because you are not an English national and did not graduate
                  from the London Youth League, an international Governing Body Endorsement (GBE) review will take
                  place during the registration stage.
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: NEGOTIATION */}
        {stage === 'negotiation' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStage('selection')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 border border-slate-700"
                >
                  ← Back to Clubs
                </button>
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  Stage 2 — Boardroom Negotiation: {currentOffer.club.clubName}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                Premier League Formal Pitch
              </span>
            </div>

            {/* Club Representative & Agent Dialog Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-black text-purple-300">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {currentOffer.club.managerName} & Sporting Board
                    </h4>
                    <p className="text-[11px] text-slate-400">{currentOffer.club.clubName} Delegation</p>
                  </div>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 italic">
                  {currentOffer.pitch}
                </p>
              </div>

              {/* Agent or Self-Managed Representation Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {hasAgent ? (manager as any)?.name : 'Self-Represented Talent'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {hasAgent ? 'Official Registered Agent' : 'Direct Player Boardroom Negotiation'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                  {hasAgent ? (
                    <span>
                      🤝 <strong>Agent Negotiation Active:</strong> Leveraged your{' '}
                      <strong>{effectiveFame} Effective Fame</strong> to secure a lucrative 5-year structure with a
                      €{currentOffer.signingBonus.toLocaleString()} upfront signing bonus!
                    </span>
                  ) : (
                    <span>
                      👔 <strong>Self-Managed:</strong> You personally presented your <strong>{ovr} OVR</strong>{' '}
                      credentials to the English board, guaranteeing an immediate senior squad inclusion role.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* The 5 Factors: Money, Role, Contract Length, Release Clause, Development */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Official Premier League Package Factors
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Money */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
                  <Banknote className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Weekly Wage</div>
                  <div className="text-sm font-black text-emerald-400">
                    €{currentOffer.weeklyWage.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    +€{currentOffer.signingBonus.toLocaleString()} Bonus
                  </div>
                </div>

                {/* 2. Starting Role */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
                  <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Starting Role</div>
                  <div className="text-xs font-black text-white line-clamp-1">{currentOffer.startingRole}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">First Team squad</div>
                </div>

                {/* 3. Contract Length */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Contract Length</div>
                  <div className="text-sm font-black text-sky-400">{currentOffer.contractYears} Years</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Long-term commitment</div>
                </div>

                {/* 4. Release Clause */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
                  <ShieldCheck className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Release Clause</div>
                  <div className="text-sm font-black text-rose-400">
                    €{(currentOffer.releaseClause / 1000000).toFixed(0)}M
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Fixed buyout</div>
                </div>

                {/* 5. Development */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                  <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Development</div>
                  <div className="text-sm font-black text-purple-400">+{currentOffer.developmentPoints} Pts</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Premier League facility</div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStage('selection')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition"
              >
                Review Other Clubs
              </button>

              <button
                onClick={handleProceedToRegistration}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-purple-500/20 flex items-center gap-2 transition hover:scale-[1.01] active:scale-95"
              >
                <span>Accept Terms & Proceed to Registration</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* WORK PERMIT DRAMA EVENT */}
        {stage === 'work_permit' && (
          <div className="p-6 sm:p-8 text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-300 shadow-xl">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                UK HOME OFFICE & FA GOVERNING BODY ENDORSEMENT
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Work-Permit Review Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Because you do not possess English nationality and did not graduate from the London Youth League,
                your international transfer to <strong>{currentOffer.club.clubName}</strong> is subject to the FA GBE
                points-based appeals committee.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between">
                <span>Governing Body Endorsement Approval Probability:</span>
                <strong className="text-emerald-400">80% Approved</strong>
              </div>
              <div className="flex justify-between">
                <span>Strict Post-Brexit Rejection Risk:</span>
                <strong className="text-rose-400">20% Rejected</strong>
              </div>
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/60">
                If approved, your Premier League contract is signed and registered immediately. If rejected, the
                transfer is cancelled.
              </p>
            </div>

            <button
              onClick={handleRunWorkPermitDecision}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 transition hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Submit Application to FA Appeals Panel</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* WORK PERMIT RESULT */}
        {stage === 'permit_result' && (
          <div className="p-6 sm:p-8 text-center space-y-6 max-w-xl mx-auto">
            {workPermitApproved ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300 shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    FA GOVERNING BODY ENDORSEMENT GRANTED
                  </span>
                  <h3 className="text-2xl font-black text-white">Work Permit Approved!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The FA Appeals Panel reviewed your exceptional <strong>{ovr} OVR</strong> and recognized you as a
                    generational talent worthy of an elite international visa. Your Premier League registration with{' '}
                    <strong>{currentOffer.club.clubName}</strong> is officially finalized!
                  </p>
                </div>

                <button
                  onClick={handleFinalizeApprovedTransfer}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/20 transition hover:scale-[1.01] active:scale-95"
                >
                  Sign Contract & Join {currentOffer.club.clubName}
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-rose-300 shadow-xl">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    UK HOME OFFICE REGISTRATION BLOCKED
                  </span>
                  <h3 className="text-2xl font-black text-white">Work Permit Denied!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The UK Home Office panel strictly enforced post-Brexit international quota caps. Despite{' '}
                    {currentOffer.club.clubName}'s appeal, the Governing Body Endorsement was denied.
                  </p>
                  <p className="text-xs text-rose-300 font-semibold mt-2">
                    The Premier League transfer is cancelled. You will continue through alternative career pathways.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Return to Available Opportunities
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
