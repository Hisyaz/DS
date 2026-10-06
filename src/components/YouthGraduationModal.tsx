import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Newspaper,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  User,
  Shield,
  FileText,
  Star,
  Flame,
} from 'lucide-react';
import { PlayerCardData } from '../types';
import { triggerTactileNav, triggerTactileConfirm, triggerTactileSuccess, triggerTactileGraduation } from '../utils/tactileFeedback';
import confetti from 'canvas-confetti';

interface YouthGraduationModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  managerName?: string;
  onComplete: () => void;
}

type GraduationStep = 'manager_note' | 'city_press' | 'pro_license';

export const YouthGraduationModal: React.FC<YouthGraduationModalProps> = ({
  isOpen,
  player,
  managerName,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<GraduationStep>('manager_note');
  const [signatureDone, setSignatureDone] = useState(false);

  const cityName = useMemo(() => {
    if (player.city) return player.city;
    if (player.startingCity) return player.startingCity.split(',')[0].trim();
    if (player.nationality?.name) return player.nationality.name;
    return 'Metropolis';
  }, [player.city, player.startingCity, player.nationality]);

  const newspaperName = useMemo(() => {
    const c = cityName.toUpperCase();
    const nat = (player.nationality?.code || '').toUpperCase();
    if (nat === 'ENG' || nat === 'GBR') return `THE ${c} DAILY CHRONICLE`;
    if (nat === 'ESP' || nat === 'ARG') return `EL HERALDO DE ${c}`;
    if (nat === 'ITA') return `LA GAZZETTA DI ${c}`;
    if (nat === 'GER') return `${c} SPORT KURIER`;
    if (nat === 'FRA') return `LE COURRIER DE ${c}`;
    if (nat === 'BRA') return `O DIÁRIO ESPORTIVO DE ${c}`;
    return `THE ${c} GAZETTE`;
  }, [cityName, player.nationality]);

  const effectiveManagerName = managerName || player.youthCoachName || 'Director Vance';

  const ovr = player.ovr || 60;
  const potential = player.potentialOvr || 85;
  const badRepTier = player.badReputationTier ?? 0;
  const isBadRep = badRepTier >= 1;

  // Press article logic matching user specification:
  // 1. ovr < 70 & pot >= 90: Future Elite / Raw Diamond
  // 2. ovr < 70 & pot < 90: Casual class mention
  // 3. ovr >= 70 & pot < 90: Rising Star / First-Team Ready
  // 4. ovr >= 70 & pot >= 90: Next Big Thing / Generational
  // Each with Bad Reputation Tier 1+ disciplinary shift
  const pressVariant = useMemo(() => {
    if (ovr < 70 && potential >= 90) {
      if (isBadRep) {
        return {
          category: 'DISCIPLINARY WATCHLIST',
          badgeColor: 'bg-rose-950 text-rose-300 border-rose-600',
          headline: `VOLATILE RAW TALENT: COACHES PRAY CEILING OVERCOMES ${player.name.toUpperCase()}'S TEMPERAMENT`,
          subhead: `World-class potential overshadowed by recurring locker room friction and training ground outbursts.`,
          article: `Local scouts are locked in heated debates regarding ${player.name}. While technical evaluations reveal a dizzying 90+ ceiling that could grace the world's most prestigious arenas, academy staff admit managing the teenager has tested everyone's patience. "The talent is undisputed, but the temperament is a powder keg," confided an insider. If a senior manager can channel this raw fury into football, ${cityName} might just have an eccentric superstar on its hands.`,
          verdict: 'Raw Diamond with Volatile Friction',
        };
      }
      return {
        category: 'HOT PROSPECT DISCOVERY',
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-500',
        headline: `ACADEMY'S UNPOLISHED GEM: SCOUTS ENTHRALLED BY ${player.name.toUpperCase()}'S UNTAPPED CEILING`,
        subhead: `Quiet graduation marks the departure of a technical prodigy destined for elite heights.`,
        article: `While ${player.name} finishes youth football with modest senior metrics (${ovr} OVR), scouts from across the federation have secretly flooded ${cityName}. Internal analytics project a stratosphere potential (${potential} POT). Academy coaches emphasize patience: "Give this teenager three seasons under professional physical conditioning, and you are witnessing a future international centerpiece."`,
        verdict: 'Future Elite Wonderkid (Raw Ceiling)',
      };
    } else if (ovr < 70 && potential < 90) {
      if (isBadRep) {
        return {
          category: 'LOCAL CONTROVERSY',
          badgeColor: 'bg-red-950 text-red-300 border-red-600',
          headline: `TROUBLEMAKER AMONG GRADUATES: ACADEMY RELIEVED AS ${player.name.toUpperCase()} DEPARTS`,
          subhead: `Disciplinary hearings dominate end-of-year review rather than pitch performance.`,
          article: `The annual list of departing academy hopefuls was published this morning, but local whispers center around ${player.name}. Despite unremarkable academy statistics (${ovr} OVR), the young player generated constant headaches for administration due to off-field defiance, curfew breaches, and training disputes. Senior clubs taking a gamble will need an iron-fisted dressing room to prevent this career from derailing before it even begins.`,
          verdict: 'High-Risk Disciplinary Free Agent',
        };
      }
      return {
        category: 'ANNUAL ACADEMY REVIEW',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-600',
        headline: `LOCAL ACADEMY NAMES ANNUAL GRADUATING ROSTER FOR PRO TRANSITIONS`,
        subhead: `Class of youth prospects released to pursue senior ranks across lower tiers.`,
        article: `The academy concluded its seasonal cycle this week, presenting diplomas to this year's batch of graduates. Among the numerous names listed, midfielder ${player.name} (${ovr} OVR) completed the curriculum alongside dozens of peers. Local coaches commended the cohort's dedication and wished them steady progression as they seek tryouts and squad contracts in professional leagues.`,
        verdict: 'Humble Graduate Cohort Member',
      };
    } else if (ovr >= 70 && potential < 90) {
      if (isBadRep) {
        return {
          category: 'SENIOR SQUAD ALERT',
          badgeColor: 'bg-orange-950 text-orange-300 border-orange-500',
          headline: `SENIOR SQUAD ON HIGH ALERT: POLISHED PRODIGY ${player.name.toUpperCase()} BRINGS HEAVY BAGGAGE`,
          subhead: `Physically dominant prospect carries reputation for defying coaching staff.`,
          article: `There is zero doubt that ${player.name} is ready for senior football. Operating at an impressive ${ovr} OVR, the prodigy possesses the physique and tactical composure to compete against veteran professionals immediately. However, reports of rebellious clashes with youth coaches have put senior dressing rooms on alert. Can the first team keep this prodigy's fierce ego pointed toward winning matches?`,
          verdict: 'Ready-Made Starter with Defiant Edge',
        };
      }
      return {
        category: 'FIRST-TEAM READY',
        badgeColor: 'bg-sky-950 text-sky-300 border-sky-500',
        headline: `INSTANT IMPACT: POLISHED TALENT ${player.name.toUpperCase()} GRADUATES READY FOR SENIOR BATTLES`,
        subhead: `Academy graduate bypasses reserve stage, commanding immediate first-team consideration.`,
        article: `${player.name} exits the youth setup with flying colors, boasting an extraordinary ${ovr} OVR that few teenagers in ${cityName}'s history have matched on graduation day. Physical resilience, tactical discipline, and adult-level composure have drawn praise from regional journalists. Senior managers will have no hesitation plunging this rising star straight into competitive league fixtures.`,
        verdict: 'Polished Rising Star (Immediate Senior Starter)',
      };
    } else {
      // ovr >= 70 && potential >= 90
      if (isBadRep) {
        return {
          category: 'SENSATIONAL HEADLINE',
          badgeColor: 'bg-amber-950 text-amber-300 border-amber-500 pixel-bevel-gold',
          headline: `FOOTBALL'S NEWEST WILDCAT: UNSTOPPABLE GENIUS ${player.name.toUpperCase()} WITH AN UNGOVERNABLE EDGE`,
          subhead: `Generational wonderkid dominates every metric while collecting press controversies like trading cards.`,
          article: `Not since the golden era of world football has ${cityName} witnessed a prospect of ${player.name}'s caliber (${ovr} OVR / ${potential} POT). The boy is a hurricane on the pitch — slicing defenses open at will. Yet the tabloids feast just as eagerly on their nightlife sightings, press conference snarls, and fearless disregard for academy etiquette. A generational phenomenon destined for the global throne, provided their wild spirit doesn't burn down the stadium first.`,
          verdict: 'Generational Wonderkid & Notorious Rebel',
        };
      }
      return {
        category: 'GENERATIONAL SPOTLIGHT',
        badgeColor: 'bg-amber-500 text-slate-950 font-black border-amber-300 pixel-bevel-gold',
        headline: `THE NEXT BIG THING: GENERATIONAL PHENOMENON ${player.name.toUpperCase()} TAKES THE LEAP`,
        subhead: `Front pages across the nation proclaim the arrival of ${cityName}'s most gifted academy product in decades.`,
        article: `The graduation ceremony felt more like a coronation. ${player.name} departs the youth academy boasting a staggering ${ovr} OVR and an elite ceiling (${potential}+ POT) that has triggered scouting hysteria across Europe and South America. Clean, composed, explosive, and relentlessly ambitious, the teenage phenom enters professional football with the weight of great expectations — and the rare magic to surpass them all.`,
        verdict: 'Generational Phenomenon (Front Page Superstar)',
      };
    }
  }, [ovr, potential, isBadRep, player.name, cityName]);

  if (!isOpen) return null;

  return (
    <div
      id="youth-graduation-modal"
      className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between select-none font-pixel overflow-y-auto pt-safe pb-safe"
    >
      {/* Top Header Navigation Strip */}
      <div className="w-full bg-slate-900 border-b-2 border-emerald-500/80 px-4 py-3 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-arcade text-emerald-300 uppercase tracking-wide">
              YOUTH ACADEMY COMMENCEMENT
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Age {player.age || 17} Graduation • Transition to Senior Pro Rank
            </p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              currentStep === 'manager_note' ? 'bg-emerald-400 scale-125' : 'bg-slate-700'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              currentStep === 'city_press' ? 'bg-emerald-400 scale-125' : 'bg-slate-700'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              currentStep === 'pro_license' ? 'bg-emerald-400 scale-125' : 'bg-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Main Viewport Takeover Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: MANAGER CONGRATULATIONS NOTE & CAREER LEDGER */}
          {currentStep === 'manager_note' && (
            <motion.div
              key="manager_note"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Tactical Chalkboard Note Container */}
              <div className="bg-[#032318] border-2 border-dashed border-emerald-500/80 rounded-xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-emerald-500/40 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-arcade text-emerald-300 uppercase">
                        From: Coach {effectiveManagerName}
                      </span>
                      <p className="text-[10px] text-emerald-400/80 font-mono">
                        Youth Academy Headmaster • {cityName} Center
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-arcade uppercase">
                    OFFICIAL APPRAISAL
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-emerald-100 font-sans leading-relaxed italic mb-4">
                  "{player.name}, when you first laced up boots on our gravel training pitches, you were full of raw ambition. Watching your development through training drills, tryouts, and tactical chalkboards has been an honor for all our staff. Today, your youth status officially concludes. Step into professional football with humility, discipline, and the hunger to conquer the game."
                </p>

                {/* Youth Progression Ledger */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-emerald-500/30 text-center">
                  <div className="bg-[#021810] p-2.5 rounded-lg border border-emerald-600/40">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase block">CURRENT OVR</span>
                    <span className="text-lg font-arcade font-bold text-amber-300">{ovr}</span>
                  </div>
                  <div className="bg-[#021810] p-2.5 rounded-lg border border-emerald-600/40">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase block">PROJECTED CEILING</span>
                    <span className="text-lg font-arcade font-bold text-emerald-300">{potential} POT</span>
                  </div>
                  <div className="bg-[#021810] p-2.5 rounded-lg border border-emerald-600/40">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase block">PRIMARY ATTRIBUTE</span>
                    <span className="text-sm font-arcade text-sky-300 truncate block mt-1">
                      {player.position}
                    </span>
                  </div>
                  <div className="bg-[#021810] p-2.5 rounded-lg border border-emerald-600/40">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase block">REPUTATION TIER</span>
                    <span className={`text-sm font-arcade block mt-1 ${isBadRep ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {isBadRep ? `Tier ${badRepTier} (Notorious)` : 'Clean Academy'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CITY NEWSPAPER PRESS RELEASE */}
          {currentStep === 'city_press' && (
            <motion.div
              key="city_press"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Newspaper Broadside Container */}
              <div className="bg-[#FAF7EE] text-slate-900 rounded-lg p-5 sm:p-6 shadow-2xl border-4 border-slate-900 relative font-serif">
                {/* Newspaper Masthead */}
                <div className="border-b-2 border-slate-900 pb-2 mb-3 text-center">
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-700 border-b border-slate-300 pb-1 mb-1">
                    <span>CITY SPORTS EDITION</span>
                    <span>{cityName.toUpperCase()}</span>
                    <span>CIRCULATION: 120,000</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase font-serif text-slate-950">
                    {newspaperName}
                  </h1>
                </div>

                {/* Category Badge & Headline */}
                <div className="space-y-2 mb-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider rounded border ${pressVariant.badgeColor}`}>
                    {pressVariant.category}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold leading-tight text-slate-950 tracking-tight">
                    {pressVariant.headline}
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 italic border-l-2 border-slate-900 pl-2">
                    {pressVariant.subhead}
                  </p>
                </div>

                {/* Article Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-relaxed text-slate-800 border-t border-slate-300 pt-3">
                  <div className="sm:col-span-2 space-y-2">
                    <p>{pressVariant.article}</p>
                  </div>

                  {/* Player Scouting Snapshot Box */}
                  <div className="bg-slate-200/90 border border-slate-400 p-2.5 rounded font-mono text-[10px] space-y-1">
                    <span className="font-bold text-slate-900 block border-b border-slate-300 pb-1">
                      LOCAL SCOUTING FILE
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Player:</span>
                      <strong className="text-slate-900">{player.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rating:</span>
                      <strong className="text-amber-800 font-bold">{ovr} OVR</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ceiling:</span>
                      <strong className="text-emerald-800 font-bold">{potential} POT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Press Label:</span>
                      <strong className="text-slate-900">{pressVariant.verdict}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SENIOR PRO FOOTBALL RATIFICATION */}
          {currentStep === 'pro_license' && (
            <motion.div
              key="pro_license"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-center"
            >
              <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-6 pixel-bevel-gold shadow-[0_0_35px_rgba(245,158,11,0.25)] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                  <Award className="w-10 h-10 animate-pulse" />
                </div>

                <div>
                  <span className="text-[10px] font-arcade text-amber-400 uppercase tracking-widest block">
                    FEDERATION OF PROFESSIONAL FOOTBALL
                  </span>
                  <h3 className="text-lg sm:text-xl font-arcade font-black text-amber-300 uppercase tracking-wide">
                    SENIOR PROFESSIONAL PLAYER LICENSE
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Licensed to compete in domestic senior divisions, international tournaments & cup competitions.
                  </p>
                </div>

                {/* Player Signature Confirmation */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-w-md mx-auto space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block text-left">
                    Player Ratification Signature:
                  </span>
                  <div
                    onClick={() => {
                      if (!signatureDone) {
                        setSignatureDone(true);
                        triggerTactileGraduation();
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                      }
                    }}
                    className={`h-14 border-2 rounded flex items-center justify-center cursor-pointer transition-all ${
                      signatureDone
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-dashed border-amber-500/60 hover:border-amber-400 bg-slate-900 text-amber-400/80'
                    }`}
                  >
                    {signatureDone ? (
                      <span className="font-serif italic text-lg sm:text-xl font-bold tracking-wide">
                        ✍️ {player.name} (Ratified)
                      </span>
                    ) : (
                      <span className="text-xs font-arcade">TAP TO SIGN SENIOR REGISTRATION</span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono max-w-sm mx-auto">
                  Senior mode unlocks broadcast stadium visual framing, commercial deals, transfer market listings, and the Ballon d'Or ceremony.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Console Action Strip (Limit to 3 buttons max) */}
      <div className="w-full bg-slate-900 border-t-2 border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xl shrink-0">
        {currentStep !== 'manager_note' ? (
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => {
              triggerTactileNav();
              if (currentStep === 'city_press') setCurrentStep('manager_note');
              if (currentStep === 'pro_license') setCurrentStep('city_press');
            }}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-arcade text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep === 'manager_note' && (
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => {
              triggerTactileConfirm();
              setCurrentStep('city_press');
            }}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-arcade font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 pixel-bevel-emerald ml-auto"
          >
            <span>READ CITY PRESS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 'city_press' && (
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => {
              triggerTactileConfirm();
              setCurrentStep('pro_license');
            }}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-arcade font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 pixel-bevel-gold"
          >
            <span>RATIFY PRO STATUS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 'pro_license' && (
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={() => {
              triggerTactileSuccess();
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
              onComplete();
            }}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-arcade font-black text-xs flex items-center gap-2 cursor-pointer shadow-xl active:scale-95 pixel-bevel-gold"
          >
            <span>ENTER PROFESSIONAL CAREER ►</span>
          </button>
        )}
      </div>
    </div>
  );
};
