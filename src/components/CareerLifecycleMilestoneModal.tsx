import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, TrendingUp, Award, ShieldAlert, ArrowRight, CheckCircle2, Flame, HeartPulse } from 'lucide-react';

export type LifecycleMilestoneType = 'age_10' | 'age_20' | 'age_28' | 'age_33';

export interface LifecycleMilestoneData {
  type: LifecycleMilestoneType;
  age: number;
}

interface CareerLifecycleMilestoneModalProps {
  isOpen: boolean;
  data: LifecycleMilestoneData | null;
  onClose: () => void;
}

export const CareerLifecycleMilestoneModal: React.FC<CareerLifecycleMilestoneModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !data) return null;

  const { type, age } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* TOP ACCENT BANNER */}
        {type === 'age_10' && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-100 uppercase">
                {t('Career Guidance • Age {age}', { age })}
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">{t('Player Development System')}</h2>
            </div>
          </div>
        )}

        {type === 'age_20' && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 shadow-inner">
              <TrendingUp className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-blue-100 uppercase">
                {t('Career Milestone • Age {age}', { age })}
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">{t('Adulthood & Pro Level Reached')}</h2>
            </div>
          </div>
        )}

        {type === 'age_28' && (
          <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 shadow-inner">
              <Award className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-100 uppercase">
                {t('Peak Athletic Window • Age {age}', { age })}
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">{t('Physical Peak Reached')}</h2>
            </div>
          </div>
        )}

        {type === 'age_33' && (
          <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-700 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 shadow-inner">
              <HeartPulse className="w-6 h-6 text-rose-200 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-rose-100 uppercase">
                {t('Veteran Phase • Age {age}', { age })}
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">{t('Physical Regression Begins')}</h2>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-sm">
          
          {/* AGE 10 INTRO CARD */}
          {type === 'age_10' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed font-medium">
                {t('Welcome to the structured Club Development System! Your progression is designed to mirror a real football career trajectory:')}
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-black text-xs">
                    10-19
                  </div>
                  <div>
                    <div className="font-bold text-emerald-300 text-xs sm:text-sm">{t('Youth Foundation Phase (Ages 10–19)')}</div>
                    <div className="text-xs text-slate-300 space-y-1 mt-0.5">
                      <div>
                        • <strong className="text-emerald-400 font-bold">{t('+15 Personal Stat Points')}</strong> {t('to allocate directly into your attributes every season.')}
                      </div>
                      <div>
                        • <strong className="text-amber-300 font-bold">{t('Club Academy Development')}</strong>: {t("Automatic position growth based on your club's Tier & Football Philosophy.")}
                      </div>
                      <div>
                        • <strong className="text-blue-300 font-bold">{t('Weekly Training')}</strong>: {t('Complete drill sessions to earn bonus attribute increments.')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-black text-xs">
                    20-27
                  </div>
                  <div>
                    <div className="font-bold text-blue-300 text-xs sm:text-sm">{t('Professional Prime Phase')}</div>
                    <div className="text-xs text-slate-300">
                      {t('Development stabilizes at')} <span className="font-bold text-blue-400">{t('+5 Stat Points')}</span> {t('per season as you compete at senior professional speed.')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-xs">
                    28-32
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 text-xs sm:text-sm">{t('Physical Peak Window')}</div>
                    <div className="text-xs text-slate-300">
                      {t('Stat point generation ceases')} (<span className="font-bold text-amber-400">{t('0 Points/Year')}</span>). {t('You reach your absolute physical maximum.')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-black text-xs">
                    33+
                  </div>
                  <div>
                    <div className="font-bold text-rose-300 text-xs sm:text-sm">{t('Natural Physical Regression')}</div>
                    <div className="text-xs text-slate-300">
                      {t('Natural aging sets in:')} <span className="font-bold text-rose-400">{t('-3 Pace, -3 Stamina, and -3 Strength')}</span> {t('lost every season until retirement.')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('Stat points are fully preserved in your pool until you choose to assign them!')}</span>
              </div>
            </div>
          )}

          {/* AGE 20 MESSAGE */}
          {type === 'age_20' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-500/40 space-y-2">
                <p className="text-slate-200 font-medium leading-relaxed italic text-xs sm:text-sm">
                  &quot;{t('Teenage years are over, your development will continue but slower since you already reached a pro level of development, you\'ll still keep learning and developing your playstyle as you get experience, and that at 28 it\'ll stop and you\'ll start slowly downgrading from there after reaching physical peak.')}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <span className="text-slate-400 font-mono">{t('Current Phase')}</span>
                  <span className="font-bold text-blue-400 text-sm mt-1">{t('Senior Pro Development')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <span className="text-slate-400 font-mono">{t('Annual Stat Points')}</span>
                  <span className="font-bold text-emerald-400 text-sm mt-1">{t('+5 PTS / Season')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {t('Take advantage of training focus, coaching staff, and performance facilities to maximize your remaining growth window before Age 28.')}
              </p>
            </div>
          )}

          {/* AGE 28 MESSAGE */}
          {type === 'age_28' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 space-y-2">
                <p className="text-slate-200 font-medium leading-relaxed italic text-xs sm:text-sm">
                  &quot;{t('You reached your physical peak! You can keep working to retain your ability, but development points have capped and you will start to slowly degrade from here.')}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <span className="text-slate-400 font-mono">{t('Current Status')}</span>
                  <span className="font-bold text-amber-400 text-sm mt-1">{t('Athletic Peak (Capped)')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <span className="text-slate-400 font-mono">{t('Annual Stat Points')}</span>
                  <span className="font-bold text-slate-300 text-sm mt-1">{t('0 PTS / Season')}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/40 text-xs text-amber-200 flex items-start gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t('Maintain peak match ratings and invest in recovery & performance upgrades to delay physical decline!')}</span>
              </div>
            </div>
          )}

          {/* AGE 33 MESSAGE */}
          {type === 'age_33' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-2">
                <p className="text-slate-200 font-medium leading-relaxed italic text-xs sm:text-sm">
                  &quot;{t('From now on you\'ll regress from this point onward. You\'ll start losing -3 in physical stats (all of them: Pace, Stamina, and Strength) every year until retirement.')}&quot;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>{t('Annual Physical Decay Active:')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-red-500/30">
                    <div className="text-slate-400 text-[10px]">{t('PACE')}</div>
                    <div className="font-black text-rose-400 text-sm">-3 / {t('yr')}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-red-500/30">
                    <div className="text-slate-400 text-[10px]">{t('STAMINA')}</div>
                    <div className="font-black text-rose-400 text-sm">-3 / {t('yr')}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-red-500/30">
                    <div className="text-slate-400 text-[10px]">{t('STRENGTH')}</div>
                    <div className="font-black text-rose-400 text-sm">-3 / {t('yr')}</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {t('Tip: The {item} lifestyle upgrade mitigates decay to -2/yr and provides +5 retirement protection years.', { item: t('World-Class Football Performance Center') })}
              </p>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className={`w-full py-3 px-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer active:scale-98 ${
              type === 'age_10'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 shadow-emerald-500/20'
                : type === 'age_20'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:brightness-110 text-white shadow-blue-500/20'
                : type === 'age_28'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-rose-500/20'
            }`}
          >
            <span>
              {type === 'age_10'
                ? t('Understood • Continue Career')
                : type === 'age_20'
                ? t('Continue to Age 20 Season')
                : type === 'age_28'
                ? t('Acknowledge Physical Peak')
                : t('Accept Veteran Reality')}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
};
