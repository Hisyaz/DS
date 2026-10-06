import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translateAttributeName } from '../utils/localizationSystem';
import {
  getDevelopmentStageForAge,
  DEVELOPMENT_STAGES,
  getFootballSchoolForClub,
  mapPositionToCategory,
  ALL_FOOTBALL_SCHOOL_LIST,
} from '../data/youthFootballSchools';
import { FootballSchoolPhilosophy } from '../types/youthFootballSchools';
import {
  getClubDevelopmentTier,
  getClubDevelopmentInfo,
  CLUB_DEVELOPMENT_TIERS,
} from '../utils/clubDevelopmentEngine';
import {
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Info,
  TrendingUp,
  Flame,
  X,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';

interface DevelopmentStagePanelProps {
  player: PlayerCardData;
  isCompact?: boolean;
}

export const DevelopmentStagePanel: React.FC<DevelopmentStagePanelProps> = ({
  player,
  isCompact = false,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [showSchoolsGuide, setShowSchoolsGuide] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  const age = player.age || 10;
  const currentStage = getDevelopmentStageForAge(age);
  const isPro = isProfessionalPlayer(player);
  const isUnder20 = age < 20;

  const countryName =
    typeof player.nationality === 'string'
      ? player.nationality
      : player.nationality?.name || player.country || player.clubCountry || '';

  const currentSchool = getFootballSchoolForClub(
    player.club,
    player.league,
    player.city || player.startingCity,
    countryName
  );

  const clubDevInfo = getClubDevelopmentInfo(
    player.club,
    player.league,
    countryName,
    player.fame,
    isPro,
    player
  );

  const clubTier = getClubDevelopmentTier(
    player.club,
    player.league,
    countryName,
    player.fame
  );

  const posCategory = mapPositionToCategory(player.position || 'ST', player.subPosition);

  return (
    <div className="bg-[#161722] p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-100 tracking-wider flex items-center gap-1.5 uppercase">
              {t('DEVELOPMENT_STAGE') || 'Development Stage'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {t('CAREER_CURVE_DESC') || 'Simplified career progression curve & club development'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${currentStage.badgeClass}`}
          >
            {t('AGE') || 'Age'} {age} • {currentStage.name}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? (t('COLLAPSE') || 'Collapse') : (t('EXPAND') || 'Expand')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Stage Banner */}
      <div
        className={`p-3 rounded-xl border ${currentStage.borderClass} bg-gradient-to-r ${currentStage.bgGradient} space-y-2`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${currentStage.colorClass}`} />
            <span className="text-xs font-black text-white">{currentStage.name}</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {t('AGES') || 'Ages'} {currentStage.ageRange}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-300 font-bold">
              {t('PERSONAL_PTS') || 'Personal PTS'}:{' '}
              <strong className="text-emerald-400 font-mono">{currentStage.playerPointsLabel}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-bold">
              {t('CLUB_DEV_PTS') || 'Club Stat PTS'}:{' '}
              <strong className="font-mono text-amber-400">
                +{clubDevInfo.annualPoints}
              </strong>
            </span>
          </div>
        </div>

        <p className="text-[11px] italic text-slate-200 leading-relaxed font-sans">
          &ldquo;{currentStage.quote}&rdquo;
        </p>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* STAGES MATRIX TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#10111a]">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-black text-[10px] uppercase bg-slate-900/50">
                  <th className="py-2 px-3">{t('AGE') || 'Age'}</th>
                  <th className="py-2 px-3">{t('DEVELOPMENT_STAGE') || 'Development Stage'}</th>
                  <th className="py-2 px-3 text-center">{t('PERSONAL_POINTS') || 'Personal Points'}</th>
                  <th className="py-2 px-3 text-center">{t('CLUB_DEVELOPMENT_POINTS') || 'Club Stat Points'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {Object.values(DEVELOPMENT_STAGES).map((stage) => {
                  const isCurrent = currentStage.key === stage.key;
                  return (
                    <tr
                      key={stage.key}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/10 text-slate-100 font-bold'
                          : 'text-slate-400 hover:bg-slate-900/30'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono">
                        {isCurrent ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {stage.ageRange}
                          </span>
                        ) : (
                          stage.ageRange
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={isCurrent ? stage.colorClass : 'text-slate-300'}>
                          {stage.name}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            stage.playerPoints > 0
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : stage.playerPoints < 0
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {stage.playerPointsLabel}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            stage.key === 'teenage'
                              ? 'bg-amber-500/20 text-amber-300 font-black'
                              : 'bg-slate-800/80 text-amber-400 font-bold'
                          }`}
                        >
                          {stage.key === 'teenage'
                            ? `+10 ${t('TO') || 'to'} +30 (Tier 1–5)`
                            : `+5 ${t('TO') || 'to'} +15 (Tier 1–5)`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CLUB DEVELOPMENT TIER & PHILOSOPHY BANNER */}
          {(player.club || player.league) && (
            <div className="bg-[#12131e] p-3.5 rounded-xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        {player.club || (t('CURRENT_CLUB') || 'Current Club')}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${clubDevInfo.badgeClass}`}>
                        {clubDevInfo.displayText}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      {t('PHILOSOPHY') || 'Philosophy'}: <strong className="text-amber-300">{currentSchool?.name || 'Tiki-Taka'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSchoolsGuide(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Info className="w-3 h-3 text-amber-400" />
                  <span>{t('VIEW_ALL_PHILOSOPHIES') || 'View All Philosophies'}</span>
                </button>
              </div>

              {/* Squad Level Rule Confirmation */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isUnder20
                      ? `${t('UNDER_20_ACTIVE') || 'Youth Club Development Active'}: +${clubDevInfo.annualPoints} ${t('CLUB_PTS_YEAR') || 'Stat PTS/year awarded across U17, U20, Reserves & First Team.'}`
                      : `${t('SENIOR_CLUB_ACTIVE') || 'Senior Club Development Active'}: +${clubDevInfo.annualPoints} ${t('CLUB_PTS_YEAR') || 'Stat PTS/year (Tier 1: 5, Tier 2: 8, Tier 3: 10, Tier 4: 12, Tier 5: 15) allocated based on club style.'}`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('SQUAD_PROMOTION_POINTS_NOTE') || 'Being promoted to a higher squad level never removes or decreases your club development points.'}
                </p>

                {currentSchool && (
                  <div className="flex items-center justify-between flex-wrap gap-1 text-[10px] pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400">
                      {t('ANNUAL_ALLOCATION_FOR') || 'Annual Allocation for'} <strong className="text-amber-300">{posCategory}</strong>:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {Object.entries(
                        currentSchool.allocations[posCategory] || currentSchool.allocations.ST
                      ).map(([statKey, pts]) => (
                        <span
                          key={statKey}
                          className="bg-amber-500/15 text-amber-200 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-black"
                        >
                          +{pts} {translateAttributeName(statKey, currentLanguage).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL 10 FOOTBALL SCHOOLS GUIDE MODAL */}
      {showSchoolsGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12131f] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#161726]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {t('CLUB_PHILOSOPHIES_TITLE') || 'Club Development Philosophies & Schools'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('CLUB_PHILOSOPHIES_DESC') || 'Regional philosophies shaping annual club point distribution (+5 to +30 PTS)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSchoolsGuide(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ALL_FOOTBALL_SCHOOL_LIST.map((school) => {
                  const isCurrent = currentSchool?.id === school.id;
                  const alloc = school.allocations[posCategory] || school.allocations.ST;

                  return (
                    <div
                      key={school.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-amber-500/80 bg-amber-950/20 shadow-lg ring-1 ring-amber-500/30'
                          : 'border-slate-800 bg-[#171827] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{school.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">
                                {school.name}
                              </span>
                              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {t('STYLE') || 'Style'} #{school.styleNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {school.city}, {school.country} • {school.leagueName}
                            </span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                            {t('YOUR_CLUB_PHILOSOPHY') || 'YOUR CLUB PHILOSOPHY'}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] italic text-slate-300 mb-2 leading-relaxed bg-[#10111a] p-2 rounded-lg border border-slate-800">
                        &ldquo;{school.corePhilosophy}&rdquo;
                      </p>

                      <div className="text-[10px] text-slate-400 space-y-1">
                        <div>
                          <strong className="text-slate-300">{t('INSPIRATION') || 'Inspiration'}:</strong>{' '}
                          {school.inspiration}
                        </div>
                        <div>
                          <strong className="text-slate-300">{t('BOOSTS_FOR') || 'Boosts for'} {posCategory}:</strong>
                          <div className="flex items-center gap-1 flex-wrap mt-1">
                            {Object.entries(alloc).map(([k, pts]) => (
                              <span
                                key={k}
                                className="bg-slate-900 text-amber-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono font-black text-[9px]"
                              >
                                +{pts} {translateAttributeName(k, currentLanguage).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#161726] flex justify-end">
              <button
                onClick={() => setShowSchoolsGuide(false)}
                className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-all cursor-pointer active:scale-95"
              >
                {t('CLOSE_GUIDE') || 'Close Guide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

