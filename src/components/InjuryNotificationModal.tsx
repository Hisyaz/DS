import React from 'react';
import { PlayerConfig } from '../types';
import {
  Bandage,
  Clock,
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InjuryNotificationModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  injuryName?: string;
  weeksRemaining?: number;
  totalWeeks?: number;
  onAcknowledge: () => void;
}

export const InjuryNotificationModal: React.FC<InjuryNotificationModalProps> = ({
  isOpen,
  player,
  injuryName,
  weeksRemaining,
  totalWeeks,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const injDetails = player.injuryDetails;
  const name = injuryName || injDetails?.name || player.injuryName || 'Grade II Hamstring Strain';
  const weeks = weeksRemaining ?? player.injuryWeeksRemaining ?? 4;
  const totWeeks = totalWeeks ?? player.injuryTotalWeeks ?? weeks;
  const grade = injDetails?.grade || (weeks >= 24 ? 'Grave (6+ Months)' : weeks >= 9 ? 'Grade III' : weeks >= 4 ? 'Grade II' : 'Grade I');
  const type = injDetails?.type || 'Hamstring';
  const monthsText = injDetails?.monthsText || `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
  const description = injDetails?.description || 'Structural injury to muscle or ligament tissue requiring rest and physical rehabilitation.';

  const isInjuryProneActive = Boolean(
    player.justEarnedInjuryPronePerk ||
    player.activePerkIds?.includes('injury_prone')
  );

  let gradeBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (weeks >= 24 || grade.includes('Grave') || grade.includes('Catastrophic')) {
    gradeBadgeColor = 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse';
  } else if (weeks >= 9 || grade.includes('Grade III')) {
    gradeBadgeColor = 'bg-purple-500/25 text-purple-300 border-purple-500/50';
  } else if (weeks <= 3 || grade.includes('Grade I')) {
    gradeBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border-2 border-rose-500/80 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.3)] p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Emergency Medical Header */}
        <div className="border-b border-slate-800 pb-3.5 shrink-0 relative z-10 space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/60 animate-pulse">
            <Bandage className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            {t('MEDICAL_ALERT_RECOVERY_REQUIRED') || 'MEDICAL ALERT • RECOVERY REQUIRED'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {t('MEDICAL_DIAGNOSIS') || 'Medical Diagnosis'}
          </h2>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3.5 custom-scrollbar relative z-10 text-left">
          {/* Primary Injury Card */}
          <div className="bg-slate-950/90 border border-rose-500/40 p-3.5 sm:p-4 rounded-xl space-y-3 relative shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold text-rose-400/90 uppercase tracking-widest block">
                  {t('OFFICIAL_DIAGNOSIS') || 'Official Diagnosis'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  {t(name) || name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {t(type) || type}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${gradeBadgeColor}`}>
                  {t(grade) || grade}
                </span>
              </div>
            </div>

            {/* Medical Description */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">{t('MEDICAL_REPORT') || 'Medical Report:'}</span>
                <p>{t(description) || description}</p>
              </div>
            </div>

            {/* Recovery Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('EXPECTED_OUT') || 'Expected Out'}</span>
                <span className="text-sm sm:text-base font-black text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {weeks} {weeks === 1 ? (t('WEEK') || 'Week') : (t('WEEKS') || 'Weeks')}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('EST_DURATION') || 'Est. Duration'}</span>
                <span className="text-sm sm:text-base font-black text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  {monthsText}
                </span>
              </div>
            </div>

            {/* Mandatory Safety Notice */}
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                {t('INJURY_SAFETY_NOTICE') ||
                  'You are marked NOT SELECTED / INJURED for upcoming matches during recovery. Matches and simulation continue automatically as you heal.'}
              </p>
            </div>
          </div>

          {/* INJURY PRONE PERK UNLOCKED ALERT */}
          {isInjuryProneActive && (
            <div className="bg-gradient-to-r from-rose-950/90 via-red-950/90 to-rose-950/90 border-2 border-rose-500 p-3.5 rounded-xl text-left relative shadow-lg space-y-1.5 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-2 text-rose-300">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-yellow-300">
                  {t('PERK_UNLOCKED_TITLE') || 'PERK UNLOCKED • "INJURY PRONE"'}
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                {t('INJURY_PRONE_UNLOCKED_DESC') ||
                  'Suffered severe or recurring physical trauma! You have acquired the permanent Injury Prone perk, increasing your future injury risk by +50% forever.'}
              </p>
            </div>
          )}
        </div>

        {/* STICKY FOOTER ACKNOWLEDGE BUTTON */}
        <div className="pt-3 mt-1 border-t border-slate-800 bg-slate-900 shrink-0 relative z-10">
          <button
            id="focus-on-recovery-btn"
            onClick={onAcknowledge}
            className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 hover:from-rose-300 hover:to-amber-200 shadow-xl shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{t('FOCUS_ON_RECOVERY_RESUME') || 'FOCUS ON RECOVERY & RESUME SIMULATION →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
