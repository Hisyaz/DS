import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translateAttributeName } from '../utils/localizationSystem';
import {
  getMaxStamina,
  getCurrentStamina,
  getStaminaPercentage,
  calculateInjuryRisk,
  calculateTrainingInjuryRisk,
  checkManagerSelection,
  simulateMatchParticipation,
  simulateWeekRest,
  useRecoveryPoint,
  applyBiAnnualPassiveRecovery,
  calculatePassiveRecoveryPoints,
} from '../utils/staminaInjurySystem';
import { getChemistryInfo } from '../utils/chemistrySystem';
import {
  Activity,
  Heart,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Bandage,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCw,
  Award,
  Coffee,
  PlusCircle,
  TrendingDown,
  XCircle,
  Users,
} from 'lucide-react';

interface StaminaInjuryPanelProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  showToast: (msg: string) => void;
  triggerConfetti?: (opts?: any) => void;
}

export const StaminaInjuryPanel: React.FC<StaminaInjuryPanelProps> = ({
  player,
  onUpdatePlayer,
  showToast,
  triggerConfetti,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const maxStam = getMaxStamina(player);
  const currentStam = getCurrentStamina(player);
  const staminaPct = getStaminaPercentage(player);
  const { riskPercentage, isHighRisk, explanation } = calculateInjuryRisk(player);
  const { trainingRiskPercentage } = calculateTrainingInjuryRisk(player);
  const managerCheck = checkManagerSelection(player);
  const passivePoints6Mo = calculatePassiveRecoveryPoints(maxStam);
  const chemInfo = getChemistryInfo(
    player.chemistry,
    player.chemistryCeiling,
    player.chemistryCeilingMonthsRemaining,
    player.chemistryCeilingReason,
    player.chemistryGainHalvedMonthsRemaining,
    player.chemistryCaps
  );

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 9)]);
  };

  // HANDLERS
  const handlePlayMatch = () => {
    if (player.isInjured) {
      showToast(`🚨 ${t('CANNOT_PLAY_INJURED') || 'Cannot play: Player is injured'} (${player.injuryName})!`);
      return;
    }

    const res = simulateMatchParticipation(player);
    onUpdatePlayer(res.updatedPlayer);
    addLog(res.message);
    showToast(res.message);

    if (res.injuryOccurred && triggerConfetti) {
      // no confetti on injury
    }
  };

  const handleRestWeek = () => {
    const res = simulateWeekRest(player);
    onUpdatePlayer(res.updatedPlayer);
    addLog(res.message);
    showToast(res.message);
  };

  const handleUseRecoveryPoint = () => {
    const res = useRecoveryPoint(player);
    if (!res.success) {
      showToast(res.message);
      return;
    }
    onUpdatePlayer(res.updatedPlayer);
    addLog(res.message);
    showToast(res.message);

    if (res.updatedPlayer.isInjured === false && triggerConfetti) {
      triggerConfetti({ particleCount: 60, spread: 50 });
    }
  };

  const handleBiAnnualPhysioCheck = () => {
    const res = applyBiAnnualPassiveRecovery(player);
    onUpdatePlayer(res.updatedPlayer);
    addLog(res.message);
    showToast(res.message);
    if (triggerConfetti) {
      triggerConfetti({ particleCount: 40, spread: 40 });
    }
  };

  const handleUseRecoverySupplement = () => {
    const supplements = player.recoverySupplements || 0;
    if (supplements <= 0) {
      showToast(t('NO_RECOVERY_SUPPLEMENTS') || '❌ No Recovery Supplements in inventory! Purchase one in the Store (€10,000).');
      return;
    }
    const copy = JSON.parse(JSON.stringify(player)) as PlayerCardData;
    copy.fitness = 100;
    copy.staminaCurrent = 100;
    copy.recoverySupplements = supplements - 1;
    onUpdatePlayer(copy);
    const msg = `⚡ ${t('RECOVERY_SUPPLEMENT_USED') || 'Recovery Supplement Used! Condition restored to 100%.'} (${supplements - 1} ${t('REMAINING') || 'remaining'})`;
    addLog(msg);
    showToast(msg);
  };

  // Fitness Bar Color
  const getBarColor = () => {
    if (staminaPct >= 70) return 'from-emerald-500 to-teal-400';
    if (staminaPct >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-rose-600 to-red-500';
  };

  const fitnessName = translateAttributeName('fitness', currentLanguage) || 'Fitness';
  const staminaName = translateAttributeName('stamina', currentLanguage) || 'Stamina';

  return (
    <div className="space-y-4">
      {/* SECTION 1: STAMINA & FITNESS METERS */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                {t('PHYSICAL_FITNESS_STAMINA_SYSTEM') || `${fitnessName} & ${staminaName} System`}
              </h2>
              <p className="text-[10px] text-gray-400">
                {staminaName}: <strong className="text-amber-300">{maxStam} STA</strong> • {fitnessName}: <strong className="text-cyan-300">{staminaPct}%</strong>
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase ${
              player.isInjured
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {t('STATUS') || 'STATUS'}: {player.isInjured ? (t('STATUS_INJURED') || 'INJURED') : (t('STATUS_HEALTHY') || 'HEALTHY')}
          </span>
        </div>

        {/* FITNESS BAR or INJURY RECOVERY BAR */}
        {player.isInjured ? (
          <div className="bg-rose-950/30 border border-rose-500/50 p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-rose-300 flex items-center gap-1.5">
                <Bandage className="w-4 h-4 text-rose-400" />
                {t('INJURY_RECOVERY_BAR') || 'Injury Recovery Bar (Incapacitated)'}
              </span>
              <span className="text-emerald-400 font-black">
                {(() => {
                  const rem = player.injuryWeeksRemaining || 0;
                  const tot = player.injuryTotalWeeks && player.injuryTotalWeeks > 0 ? player.injuryTotalWeeks : Math.max(rem, 1);
                  const passed = Math.max(0, tot - rem);
                  return Math.min(100, Math.round((passed / tot) * 100));
                })()}% {t('RECOVERED') || 'RECOVERED'}
              </span>
            </div>

            <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden p-0.5 border border-rose-500/40 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                style={{
                  width: `${(() => {
                    const rem = player.injuryWeeksRemaining || 0;
                    const tot = player.injuryTotalWeeks && player.injuryTotalWeeks > 0 ? player.injuryTotalWeeks : Math.max(rem, 1);
                    const passed = Math.max(0, tot - rem);
                    return Math.min(100, Math.round((passed / tot) * 100));
                  })()}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-300 font-semibold px-0.5">
              <span className="text-rose-400 font-bold">🚨 {player.injuryName || (t('STATUS_INJURED') || 'Injured')}</span>
              <span className="text-amber-300 font-mono">
                {player.injuryWeeksRemaining || 0} {(player.injuryWeeksRemaining || 0) === 1 ? (t('WEEK') || 'Week') : (t('WEEKS') || 'Weeks')} {t('TILL_FULL_RECOVERY') || 'Till Full Recovery'}
              </span>
              <span className="text-emerald-400 font-bold">{t('FIT_TO_PLAY') || '100% Fit To Play'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#12131c] border border-gray-800 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                {t('CURRENT_CONDITION_BAR') || 'Current Condition Bar'}
              </span>
              <span className="text-white">
                <strong className="text-cyan-400">{staminaPct}%</strong> {fitnessName.toUpperCase()}
              </span>
            </div>

            <div className="w-full bg-gray-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-800 relative">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-300`}
                style={{ width: `${staminaPct}%` }}
              />
              {/* 70% & 50% Threshold Indicators */}
              <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-amber-400/60" title="70% Manager Selection Limit" />
              <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-rose-500/80" title="50% Elevated Injury Risk" />
            </div>

            <div className="flex items-center justify-between text-[9px] text-gray-400 font-semibold px-0.5">
              <span>0% {t('EXHAUSTED') || 'Exhausted'}</span>
              <span className="text-rose-400 font-bold">50% {t('DANGER_ZONE') || 'Danger Zone'}</span>
              <span className="text-amber-300 font-bold">60% {t('MANAGER_AI_TARGET') || 'Manager AI Target'}</span>
              <span>100% {t('PEAK') || 'Peak'}</span>
            </div>
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Match Injury Risk */}
          <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              {t('MATCH_INJURY_RISK') || 'Match Injury Risk'}
            </span>
            <span
              className={`text-sm font-black ${
                riskPercentage >= 25
                  ? 'text-rose-400 animate-pulse'
                  : riskPercentage >= 10
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {riskPercentage}% {t('RISK') || 'Risk'}
            </span>
          </div>

          {/* Training Injury Risk */}
          <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              {t('TRAINING_INJURY_RISK') || 'Training Injury Risk'}
            </span>
            <span className="text-sm font-black text-cyan-300">
              {trainingRiskPercentage}% <span className="text-[9px] font-normal text-gray-400">(10% {t('OF_MATCH') || 'of match'})</span>
            </span>
          </div>

          {/* Manager Selection Status */}
          <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Award className="w-3 h-3 text-blue-400" />
              {t('MANAGER_STATUS') || 'Manager AI Status'}
            </span>
            <span
              className={`text-xs font-black ${
                managerCheck.willBeSelected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {managerCheck.recommendedStatus === 'starter' ? (t('STARTING_XI') || 'Starting XI') : managerCheck.recommendedStatus === 'sub' ? (t('ROTATED_SUB') || 'Rotated Sub') : (t('TACTICAL_REST') || 'Tactical Rest / Bench')}
            </span>
          </div>

          {/* Injury Recovery Points */}
          <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Bandage className="w-3 h-3 text-purple-400" />
              {t('RECOVERY_POINTS') || 'Recovery Points'}
            </span>
            <span className="text-sm font-black text-purple-300">
              {player.recoveryPoints || 0} {t('POINTS') || 'Points'}
            </span>
          </div>
        </div>

        {/* WARNING BANNERS */}
        {staminaPct < 50 && !player.isInjured && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-rose-300 block">
                🔥 {t('CRITICAL_EXHAUSTION_TITLE') || 'CRITICAL STAMINA EXHAUSTION (<50%)'}
              </span>
              <p className="text-[10px] text-gray-300 leading-normal">
                {t('CRITICAL_EXHAUSTION_DESC') || 'Fitness has fallen below 50%! Full fatigue risk active. Rest or rotate immediately to avoid long-term layoffs!'}
              </p>
            </div>
          </div>
        )}

        {staminaPct >= 50 && staminaPct < 60 && !player.isInjured && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-amber-300 block">
                ⚠️ {t('SUB_60_FITNESS_TITLE') || 'SUB-60% FITNESS (Manager AI Protection Active)'}
              </span>
              <p className="text-[10px] text-gray-300 leading-normal">
                {t('SUB_60_FITNESS_DESC') || 'Manager AI actively rests players below 60% fitness in routine fixtures to maintain squad health.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1.5: TEAM CHEMISTRY & LOCKER ROOM INTEGRATION */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                {t('TEAM_CHEMISTRY_TITLE') || 'Team Chemistry & Locker Room Cohesion'}
              </h2>
              <p className="text-[10px] text-gray-400">
                {t('CURRENT_LEVEL') || 'Current Level'}: <strong className="text-blue-300">{chemInfo.chemistry}%</strong> • {t('ATTRIBUTE_MODIFIER') || 'Attribute Modifier'}:{' '}
                <strong className={chemInfo.penaltyPercent > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {chemInfo.penaltyPercent > 0 ? `-${chemInfo.penaltyPercent}%` : (t('OPTIMAL') || '0% (Optimal)')}
                </strong>
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase ${chemInfo.badgeColor}`}
          >
            {chemInfo.statusLabel}
          </span>
        </div>

        {/* CHEMISTRY BAR */}
        <div className="bg-[#12131c] border border-gray-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-300 flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${chemInfo.isOverflow ? 'text-cyan-400 animate-pulse' : 'text-blue-400'}`} />
              {t('LOCKER_ROOM_SYNERGY_BAR') || 'Locker Room Synergy Bar'}
              {chemInfo.isOverflow && (
                <span className="ml-1 px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded text-[9px] font-black">
                  OVERFLOW
                </span>
              )}
            </span>
            <span className="text-white font-mono">
              {chemInfo.isOverflow ? (
                <>
                  <strong className="text-blue-400">100%</strong> + <strong className="text-cyan-400 font-black">{chemInfo.overflowChemistry}% OVERFLOW</strong>
                </>
              ) : chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number' ? (
                <>
                  <strong className="text-amber-400">
                    {Math.min(chemInfo.ceilingPercent, chemInfo.chemistry)}%
                  </strong>{' '}
                  /{' '}
                  <strong className="text-rose-400">
                    {chemInfo.ceilingPercent}%
                  </strong>{' '}
                  <span className="text-[10px] text-rose-300 font-black uppercase tracking-tight">
                    ({t('CAPPED') || 'Capped'})
                  </span>
                </>
              ) : (
                <>
                  <strong className="text-blue-400">{chemInfo.chemistry}%</strong> / 100%
                </>
              )}
            </span>
          </div>

          <div className="w-full bg-gray-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-800 relative">
            {/* Base Chemistry Bar (0-100%) - strictly clamped so it never fills past ceilingPercent when capped */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                chemInfo.hasCeiling
                  ? 'bg-gradient-to-r from-blue-600 via-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400'
              }`}
              style={{
                width: `${
                  chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number'
                    ? Math.max(0, Math.min(chemInfo.ceilingPercent, chemInfo.chemistry))
                    : Math.max(0, Math.min(100, chemInfo.chemistry))
                }%`
              }}
            />
            {/* Overflow Blue Bar filling across after 100% */}
            {chemInfo.isOverflow && (
              <div
                className="absolute inset-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.95)] border border-cyan-200/60 z-10"
                style={{ width: `${chemInfo.overflowChemistry}%` }}
                title={`Overflow Chemistry: +${chemInfo.overflowChemistry}%`}
              />
            )}
            {/* Visual Cap Wall: prevents visual filling past current cap value and shades out the locked range */}
            {chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number' && !chemInfo.isOverflow && (
              <div
                className="absolute top-0 bottom-0 right-0 bg-slate-950/80 border-l-2 border-rose-500 z-10 pointer-events-none"
                style={{ left: `${chemInfo.ceilingPercent}%` }}
                title={`Chemistry Ceiling: Capped at ${chemInfo.ceilingPercent}% - Cannot exceed cap value`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-400 font-semibold px-0.5">
            <span>0% {t('OUTCAST') || 'Outcast'} (-50%)</span>
            <span>50% {t('NEW_CLUB') || 'New Club'} (-40%)</span>
            <span>80% {t('GOOD_FIT') || 'Good Fit'} (-10%)</span>
            <span className={chemInfo.isOverflow ? "text-cyan-400 font-bold" : "text-emerald-400 font-bold"}>
              {chemInfo.isOverflow ? `100% + ${chemInfo.overflowChemistry}% Overflow` : `100% ${t('FULL_CHEMISTRY') || 'Full Chemistry'}`}
            </span>
          </div>
        </div>

        {/* ACTIVE CHEMISTRY CEILING BANNER */}
        {chemInfo.hasCeiling && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/50 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 uppercase">
                  🔒 {t('ACTIVE_CHEMISTRY_CEILING') || 'ACTIVE CHEMISTRY CEILING'}: {chemInfo.ceilingPercent}%
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {chemInfo.ceilingMonthsRemaining} {chemInfo.ceilingMonthsRemaining === 1 ? (t('MONTH') || 'Month') : (t('MONTHS') || 'Months')} {t('REMAINING') || 'Remaining'}
                </span>
              </div>
              <p className="text-[10px] text-gray-300 leading-normal">
                {chemInfo.ceilingReason || (t('CHEMISTRY_LIMIT_REASON') || 'A post-match media incident or locker room controversy has limited team cohesion.')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MEDICAL & INJURY STATUS */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <Bandage className="w-4 h-4 text-rose-400" />
            {t('MEDICAL_DEPT_TITLE') || 'Medical Department & Injury Status'}
          </h3>
          <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
            {player.recoveryPoints || 0} {t('RECOVERY_POINTS_AVAILABLE') || 'Recovery Points Available'}
          </span>
        </div>

        {player.isInjured ? (
          <div className="bg-rose-950/30 border border-rose-500/50 p-3.5 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[9px] font-black uppercase border border-rose-500/40">
                  {t('PLAYER_INJURED') || 'PLAYER INJURED'}
                </span>
                <h4 className="text-sm font-black text-white flex items-center gap-2 mt-1">
                  {player.injuryName || (t('MEDICAL_INJURY') || 'Medical Injury')}
                </h4>
                <p className="text-[10px] text-rose-200">
                  {t('DURATION_REMAINING') || 'Duration Remaining'}: <strong className="text-white">{player.injuryWeeksRemaining} {t('WEEKS') || 'Weeks'}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  {player.injuryWeeksRemaining} {t('WKS_OUT') || 'Wks Out'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-gray-300 leading-relaxed">
              {t('INJURED_PLAYER_NOTICE') || 'Player cannot participate in official matches while injured. Use Recovery Points or Rehabilitation Rest to heal.'}
            </p>

            <button
              onClick={handleUseRecoveryPoint}
              disabled={(player.recoveryPoints || 0) <= 0}
              className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                (player.recoveryPoints || 0) > 0
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('USE_RECOVERY_POINT_BTN') || 'Use 1 Recovery Point (+10% Recovery Progress)'}
            </button>
          </div>
        ) : (
          <div className="bg-[#12131c] border border-gray-800 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t('CLEARED_HEALTHY') || '100% Healthy — Cleared for Match Participation'}
            </span>
            <span className="text-[10px] text-gray-400">{t('NO_ACTIVE_INJURIES') || 'No active injuries'}</span>
          </div>
        )}

        {/* BI-ANNUAL PASSIVE RECOVERY EXPLANATION */}
        <div className="bg-[#12131c] border border-gray-800 p-3 rounded-xl space-y-1.5 text-[10px] text-gray-300">
          <div className="flex items-center justify-between font-bold text-gray-200">
            <span className="flex items-center gap-1 text-purple-300">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {t('BIANNUAL_RECOVERY_RULE') || 'Bi-Annual Passive Recovery Rule (Every 6 Months)'}
            </span>
            <span className="text-emerald-400 font-extrabold">+{passivePoints6Mo} {t('POINTS') || 'Points'} / 6 Mo</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            {t('BIANNUAL_RECOVERY_DESC') || 'Every 6 months, players passively accumulate Recovery Points based on their Stamina attribute.'}
          </p>
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE ACTION CONTROLS */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
          <RotateCw className="w-4 h-4 text-blue-400" />
          {t('FITNESS_MATCH_SIM') || 'Interactive Fitness & Match Simulation'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Play Match */}
          <button
            onClick={handlePlayMatch}
            disabled={Boolean(player.isInjured)}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
              player.isInjured
                ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/40 cursor-pointer shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">⚽ {t('PLAY_OFFICIAL_MATCH') || 'Play Official Match'}</span>
              <span className="text-[10px] font-bold text-amber-200">-25 {staminaName}</span>
            </div>
            <p className="text-[10px] text-blue-100 mt-1">
              {t('PLAY_OFFICIAL_MATCH_DESC') || `Participate in 90 mins. Checks manager selection & injury risk (${riskPercentage}% risk).`}
            </p>
          </button>

          {/* Take Rest Week */}
          <button
            onClick={handleRestWeek}
            className="p-3 rounded-xl border text-left flex flex-col justify-between bg-[#12131c] hover:bg-[#181a28] border-gray-800 hover:border-purple-500/40 text-white cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400">😴 {t('REST_REHAB_WEEK') || 'Rest / Rehab Week'}</span>
              <span className="text-[10px] font-bold text-emerald-300">+30 {staminaName} / -1 Wk</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {t('REST_REHAB_WEEK_DESC') || 'Skip matchday to recover stamina (+30) or heal injury (-1 week duration).'}
            </p>
          </button>

          {/* Bi-Annual Physio Check */}
          <button
            onClick={handleBiAnnualPhysioCheck}
            className="p-3 rounded-xl border text-left flex flex-col justify-between bg-[#12131c] hover:bg-[#181a28] border-gray-800 hover:border-purple-500/40 text-white cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300">📅 {t('SIX_MONTH_PHYSIO_CHECK') || '6-Month Physio Check'}</span>
              <span className="text-[10px] font-bold text-purple-400">+{passivePoints6Mo} {t('POINTS') || 'Points'}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {t('SIX_MONTH_PHYSIO_DESC') || `Simulate 6 months & collect passive recovery points based on ${maxStam} Stamina.`}
            </p>
          </button>

          {/* Recovery Supplement */}
          <button
            onClick={handleUseRecoverySupplement}
            className="p-3 rounded-xl border text-left flex flex-col justify-between bg-[#12131c] hover:bg-[#181a28] border-gray-800 hover:border-amber-500/40 text-white cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">⚡ {t('USE_RECOVERY_SUPPLEMENT') || 'Use Recovery Supplement'}</span>
              <span className="text-[10px] font-bold text-amber-400">{player.recoverySupplements || 0} {t('OWNED') || 'Owned'}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {t('USE_RECOVERY_SUPPLEMENT_DESC') || `Restores physical condition to 100% instantly (${maxStam}/${maxStam}).`}
            </p>
          </button>
        </div>
      </div>

      {/* ACTIVITY LOGS */}
      {logMessages.length > 0 && (
        <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('MEDICAL_ACTIVITY_LOG') || 'Medical & Match Activity Log'}
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {logMessages.map((msg, idx) => (
              <div key={idx} className="text-[11px] text-gray-300 bg-[#12131c] p-2 rounded border border-gray-800 leading-snug">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

