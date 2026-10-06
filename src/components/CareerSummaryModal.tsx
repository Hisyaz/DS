import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { compileFullCareerHistory, getFameTitleDetails } from '../utils/careerConclusionSystem';
import { FullCareerHistory } from '../types/careerConclusion';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Award,
  BarChart2,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  Heart,
  Star,
  CheckCircle2,
  Share2,
  X,
  ChevronRight,
  Shield,
  Medal,
  Crown,
} from 'lucide-react';

interface CareerSummaryModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onClose: () => void;
}

export const CareerSummaryModal: React.FC<CareerSummaryModalProps> = ({
  isOpen,
  player,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stats' | 'teams_seasons' | 'trophies' | 'transfers' | 'development' | 'timeline' | 'legacy_card' | 'developer'
  >('overview');

  if (!isOpen) return null;

  const history: FullCareerHistory = player.careerHistory || compileFullCareerHistory(player);
  const farewell = player.farewellResult;
  const fameDetails = getFameTitleDetails(history.finalFame);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto font-pixel select-none"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-5xl bg-[#0b0d17] border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl p-4 md:p-6 text-white my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />
        
        {/* TOP HEADER */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-amber-500/50 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 pixel-corners pixel-bevel-raised bg-amber-500 text-slate-950 font-black shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-widest border border-amber-400/40 font-arcade">
                  {t('CAREER RETROSPECTIVE & FAREWELL')}
                </span>
                <span className={`px-2.5 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider border font-arcade ${fameDetails.borderColor} ${fameDetails.textColor} bg-slate-900`}>
                  {t(fameDetails.badge)}
                </span>
              </div>
              <h1 className="text-lg md:text-2xl font-black text-white tracking-tight mt-0.5 pixel-text-shadow">
                {t('{name} — Career Summary', { name: player.name })}
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 pixel-corners bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white transition-all cursor-pointer pixel-bevel-raised"
            title={t('Close Summary')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 shrink-0 border-b border-slate-800 custom-scrollbar">
          {[
            { id: 'overview', label: t('Overview'), icon: Star },
            { id: 'stats', label: t('Matches & Goals'), icon: BarChart2 },
            { id: 'teams_seasons', label: t('Teams & Seasons'), icon: Calendar },
            { id: 'trophies', label: t('Trophies & Awards'), icon: Trophy },
            { id: 'transfers', label: t('Transfers & Value'), icon: DollarSign },
            { id: 'development', label: t('OVR & Records'), icon: TrendingUp },
            { id: 'timeline', label: t('Timeline'), icon: Clock },
            { id: 'legacy_card', label: t('Legacy Card'), icon: Medal },
            { id: 'developer', label: t('Developer Note'), icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 pixel-corners text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer font-pixel ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 pixel-bevel-gold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* FAREWELL MOMENT BANNER */}
              {farewell && (
                <div className="p-4 md:p-5 pixel-corners pixel-bevel-gold bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-2 border-amber-500 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black px-2.5 py-0.5 pixel-corners bg-amber-500/30 text-amber-200 uppercase tracking-widest border border-amber-400/40 font-arcade">
                      {t('FAREWELL MOMENT RECAP')}
                    </span>
                    <span className="text-xs font-black text-amber-300 font-arcade uppercase">
                      {t(farewell.choiceTitle)} ({farewell.succeeded ? t('SUCCESSFUL') : t('ATTEMPTED')})
                    </span>
                  </div>
                  <p className="text-xs md:text-sm italic text-amber-100 font-retro leading-relaxed">
                    &ldquo;{t(farewell.commentary)}&rdquo;
                  </p>
                  {farewell.inheritorName && (
                    <div className="text-[11px] font-black text-emerald-300 pt-1 font-arcade">
                      {t('Symbolic Inheritor')}: <span className="text-white">{farewell.inheritorName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: CAREER OVERVIEW GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 font-arcade">
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Starting Age')}</div>
                  <div className="text-xl font-black text-amber-300 mt-1">{t('{age} Years Old', { age: `${history.startingAge}` })}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Retirement Age')}</div>
                  <div className="text-xl font-black text-amber-300 mt-1">{t('{age} Years Old', { age: `${history.retirementAge}` })}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Starting Team')}</div>
                  <div className="text-sm font-black text-white mt-1 truncate">{history.startingClub}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Final Team')}</div>
                  <div className="text-sm font-black text-amber-400 mt-1 truncate">{history.finalClub}</div>
                </div>

                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Total Duration')}</div>
                  <div className="text-xl font-black text-indigo-300 mt-1">{t('{count} Seasons', { count: `${history.totalDurationYears}` })}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Starting Baseline OVR')}</div>
                  <div className="text-xl font-black text-slate-300 mt-1">{history.startingOvr || 88} {t('OVR')}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Peak OVR')}</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{history.peakOvr.ovr} {t('OVR')}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Final OVR')}</div>
                  <div className="text-xl font-black text-cyan-300 mt-1">{history.finalOvr} {t('OVR')}</div>
                </div>

                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Starting Potential')}</div>
                  <div className="text-xl font-black text-indigo-300 mt-1">{history.startingPotential} {t('POT')}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Peak Potential')}</div>
                  <div className="text-xl font-black text-indigo-400 mt-1">{history.peakPotential} {t('POT')}</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Final Fame')}</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{history.finalFame} / 1000</div>
                </div>
                <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('Bad Reputation')}</div>
                  <div className="text-xl font-black text-rose-400 mt-1">{history.finalBadReputation} / 100</div>
                </div>
              </div>

              {/* SECTION 16: CAREER LEGACY NARRATIVE & FAME TIER STATUS */}
              <div className={`p-5 pixel-corners pixel-bevel-raised bg-gradient-to-br ${fameDetails.bgGradient} border-2 ${fameDetails.borderColor} space-y-3 shadow-xl`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-white font-arcade">
                      {t('CAREER IMMORTALITY STATUS')}: <span className={fameDetails.colorClass}>{t(fameDetails.title).toUpperCase()}</span>
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 pixel-corners text-xs font-black bg-black/50 border font-arcade ${fameDetails.borderColor} ${fameDetails.textColor}`}>
                    {t('{fame} / 1000 Fame ({req})', { fame: `${history.finalFame}`, req: t(fameDetails.fameRequired) })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-retro">
                  {t(fameDetails.description)}
                </p>

                {/* Fame Tier Scale Breakdown */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px] font-arcade">
                  {[
                    { name: t('Iconic'), range: '1000+', active: history.finalFame >= 1000, color: 'border-amber-400 text-amber-300 bg-amber-500/20' },
                    { name: t('Legendary'), range: '900-999', active: history.finalFame >= 900 && history.finalFame < 1000, color: 'border-purple-400 text-purple-300 bg-purple-500/20' },
                    { name: t('Gold'), range: '800-899', active: history.finalFame >= 800 && history.finalFame < 900, color: 'border-yellow-400 text-yellow-300 bg-yellow-500/20' },
                    { name: t('Silver'), range: '700-799', active: history.finalFame >= 700 && history.finalFame < 800, color: 'border-slate-300 text-slate-200 bg-slate-500/20' },
                    { name: t('Bronze'), range: '600-699', active: history.finalFame >= 600 && history.finalFame < 700, color: 'border-amber-600 text-amber-500 bg-amber-800/20' },
                    { name: t('White'), range: '≤500', active: history.finalFame < 600, color: 'border-slate-500 text-slate-400 bg-slate-700/20' },
                  ].map((tier) => (
                    <div
                      key={tier.name}
                      className={`p-1.5 pixel-corners border transition-all ${
                        tier.active ? `${tier.color} font-black ring-1 ring-white/50 scale-105 pixel-bevel-raised` : 'border-slate-800/80 text-slate-500 bg-black/40'
                      }`}
                    >
                      <div className="font-bold">{tier.name}</div>
                      <div className="text-[9px] opacity-80">{tier.range}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 16: CAREER LEGACY NARRATIVE */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900/80 border-2 border-amber-500/30 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2 font-arcade">
                  <Sparkles className="w-4 h-4" /> {t('CAREER LEGACY NARRATIVE')}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-retro">
                  {t(history.narrativeLegacy)}
                </p>
              </div>
            </div>
          )}

          {/* 2. MATCH STATISTICS & GOALS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 4: MATCH STATISTICS BREAKDOWN */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <BarChart2 className="w-4 h-4" /> {t('TOTAL MATCHES BREAKDOWN ({count} Official Matches)', { count: `${history.matchStats.totalMatches}` })}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-arcade">
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Youth Matches')}</div>
                    <div className="text-xl font-black text-purple-300 mt-1">{history.matchStats.youthMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Professional Matches')}</div>
                    <div className="text-xl font-black text-indigo-300 mt-1">{history.matchStats.proMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Domestic League')}</div>
                    <div className="text-xl font-black text-emerald-300 mt-1">{history.matchStats.domesticMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Continental Cups')}</div>
                    <div className="text-xl font-black text-cyan-300 mt-1">{history.matchStats.continentalMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('International Caps')}</div>
                    <div className="text-xl font-black text-amber-300 mt-1">{history.matchStats.internationalMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Cup Tournaments')}</div>
                    <div className="text-xl font-black text-rose-300 mt-1">{history.matchStats.cupMatches}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 text-center col-span-2">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Other Official Fixtures')}</div>
                    <div className="text-xl font-black text-slate-300 mt-1">{history.matchStats.otherMatches}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: GOALS & ASSISTS */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Award className="w-4 h-4" /> {t('GOALS & ASSISTS RECORD')}
                </h3>
                <div className="grid grid-cols-2 gap-4 font-arcade">
                  <div className="p-4 pixel-corners pixel-bevel-gold bg-gradient-to-br from-amber-950/60 to-slate-950 border-2 border-amber-500/40 text-center">
                    <div className="text-xs text-amber-300 font-extrabold uppercase">{t('TOTAL CAREER GOALS')}</div>
                    <div className="text-4xl font-black text-amber-400 mt-1">{history.totalGoals}</div>
                  </div>
                  <div className="p-4 pixel-corners pixel-bevel-raised bg-gradient-to-br from-emerald-950/60 to-slate-950 border-2 border-emerald-500/40 text-center">
                    <div className="text-xs text-emerald-300 font-extrabold uppercase">{t('TOTAL CAREER ASSISTS')}</div>
                    <div className="text-4xl font-black text-emerald-400 mt-1">{history.totalAssists}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 font-arcade">
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Most Goals / Season')}</div>
                    <div className="text-base font-black text-amber-300 mt-1">
                      {t('{count} Goals ({season})', { count: `${history.mostGoalsSingleSeason.count}`, season: `${history.mostGoalsSingleSeason.season}` })}
                    </div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Most Assists / Season')}</div>
                    <div className="text-base font-black text-emerald-300 mt-1">
                      {t('{count} Assists ({season})', { count: `${history.mostAssistsSingleSeason.count}`, season: `${history.mostAssistsSingleSeason.season}` })}
                    </div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Best Scoring Season')}</div>
                    <div className="text-base font-black text-white mt-1">
                      {t('{count} Goals ({season})', { count: `${history.bestScoringSeason.goals}`, season: `${history.bestScoringSeason.season}` })}
                    </div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Best Rated Season')}</div>
                    <div className="text-base font-black text-cyan-300 mt-1">
                      {t('{rating} Rating ({season})', { rating: `${history.bestRatedSeason.rating}`, season: `${history.bestRatedSeason.season}` })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. TEAMS & SEASONS TAB */}
          {activeTab === 'teams_seasons' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 6: TEAMS REPRESENTED */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Users className="w-4 h-4" /> {t('TEAMS REPRESENTED (INCLUDING YOUTH TEAMS)')}
                </h3>
                <div className="space-y-2.5">
                  {history.teamsRepresented.map((team) => (
                    <div
                      key={team.id}
                      className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm uppercase">{team.teamName}</span>
                          <span className="px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30 font-arcade">
                            {t(team.squadLevel)}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-bold font-retro">
                          {t(team.country)} • {t('{count} Seasons', { count: `${team.seasonsSpent}` })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right font-arcade">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">{t('Matches')}</div>
                          <div className="font-bold text-slate-200">{team.matches}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">{t('Goals')}</div>
                          <div className="font-bold text-amber-300">{team.goals}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">{t('Assists')}</div>
                          <div className="font-bold text-emerald-300">{team.assists}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: SEASONS PLAYED */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Calendar className="w-4 h-4" /> {t('SEASONS PLAYED LOG')}
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {history.seasonsPlayed.map((season, idx) => (
                    <div
                      key={idx}
                      className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 font-arcade">
                        <div className="font-black text-amber-300 uppercase">
                          {season.seasonYear} — {t(season.competitionName)}
                        </div>
                        <div className="text-slate-300 font-bold font-retro">
                          {season.teamName} ({t(season.squadLevel)}) • {t('Age {age}', { age: `${season.age}` })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right font-arcade">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase">{t('M / G / A')}</div>
                          <div className="font-bold text-white">
                            {season.matches} / <span className="text-amber-300">{season.goals}</span> / <span className="text-emerald-300">{season.assists}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase">{t('Avg Rating')}</div>
                          <div className="font-bold text-cyan-300">{season.avgRating}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. TROPHIES & INDIVIDUAL AWARDS TAB */}
          {activeTab === 'trophies' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 8: TROPHIES & TITLES (INCLUDING YOUTH TITLES) */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Trophy className="w-4 h-4" /> {t('TROPHIES & TITLES ({count} Major Titles)', { count: `${history.trophiesWon.length}` })}
                </h3>

                {/* YOUTH TITLES SECTION */}
                <div className="p-3.5 pixel-corners pixel-bevel-raised bg-purple-950/40 border-2 border-purple-500/40 space-y-2">
                  <div className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2 font-arcade">
                    <Shield className="w-4 h-4" /> {t('YOUTH TITLES')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.youthTitlesWon.map((yt, i) => (
                      <span key={i} className="px-3 py-1 pixel-corners bg-purple-900/60 text-purple-200 border border-purple-400/40 text-xs font-bold font-arcade uppercase">
                        🏆 {t(yt)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TROPHIES LIST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.trophiesWon.map((trophyItem) => (
                    <div key={trophyItem.id} className="p-3.5 pixel-corners pixel-bevel-gold bg-slate-950 border-2 border-amber-500/30 flex items-center gap-3">
                      <div className="p-2.5 pixel-corners pixel-bevel-raised bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-white uppercase font-arcade">{t(trophyItem.name)}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase font-retro">{t(trophyItem.category)} • {t('Year {year}', { year: `${trophyItem.year}` })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 9: INDIVIDUAL AWARDS */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Award className="w-4 h-4" /> {t('INDIVIDUAL AWARDS ({count} Honors)', { count: `${history.individualAwards.length}` })}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {history.individualAwards.map((award) => (
                    <div key={award.id} className="p-3.5 pixel-corners pixel-bevel-raised bg-slate-950 border-2 border-cyan-500/30 flex items-center gap-3">
                      <div className="p-2.5 pixel-corners pixel-bevel-raised bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-cyan-200">{t(award.awardName)}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{award.seasonYear} • {award.teamName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 5. TRANSFERS & MARKET VALUE TAB */}
          {activeTab === 'transfers' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 10 & 11: TRANSFERS RECORD & TOTAL SPENDING */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                    <DollarSign className="w-4 h-4" /> {t('TRANSFER RECORD')}
                  </h3>
                  <div className="text-right font-arcade">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('CAREER TRANSFER SPENDING')}</div>
                    <div className="text-lg font-black text-emerald-400">{history.formattedTotalTransferFeesPaid}</div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {history.transfersHistory.map((tr) => (
                    <div key={tr.id} className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-arcade">
                      <div>
                        <div className="font-black text-white flex items-center gap-2 uppercase">
                          <span>{tr.previousClub}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300">{tr.newClub}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 font-retro">
                          {t('Season {year} • {type}', { year: `${tr.seasonYear}`, type: t(tr.transferType) })}
                        </div>
                      </div>
                      <div className="text-right font-black text-emerald-300 text-sm font-arcade">
                        {tr.formattedFee}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 12: PEAK TRANSFER VALUE */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <TrendingUp className="w-4 h-4" /> {t('PEAK TRANSFER MARKET VALUE')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-arcade">
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Peak Valuation')}</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">{history.peakMarketValue.formattedValue}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Age at Peak')}</div>
                    <div className="text-xl font-black text-amber-300 mt-1">{t('{age} Y/O', { age: `${history.peakMarketValue.age}` })}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Club at Peak')}</div>
                    <div className="text-sm font-black text-white mt-1 truncate uppercase">{history.peakMarketValue.clubName}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('OVR at Peak')}</div>
                    <div className="text-xl font-black text-cyan-300 mt-1">{history.peakMarketValue.ovrAtPeak} {t('OVR')}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 6. DEVELOPMENT & RECORDS TAB */}
          {activeTab === 'development' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 13: OVR & POTENTIAL CAREER DEVELOPMENT */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <TrendingUp className="w-4 h-4" /> {t('PLAYER DEVELOPMENT')}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-arcade">
                  <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Starting Baseline')}</div>
                    <div className="text-2xl font-black text-slate-300 mt-1">{history.startingOvr || 88} {t('OVR')}</div>
                  </div>
                  <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Peak OVR')}</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{history.peakOvr.ovr} {t('OVR')}</div>
                  </div>
                  <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Final OVR')}</div>
                    <div className="text-2xl font-black text-cyan-300 mt-1">{history.finalOvr} {t('OVR')}</div>
                  </div>
                  <div className="p-3.5 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{t('Total OVR Growth')}</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">+{history.ovrGrowth}</div>
                  </div>
                </div>

                <div className="p-4 pixel-corners pixel-bevel-raised bg-indigo-950/40 border-2 border-indigo-500/40 flex items-center justify-between font-arcade">
                  <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">{t('POTENTIAL CLASSIFICATION')}</span>
                  <span className="px-3 py-1 pixel-corners bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 font-black text-xs uppercase">
                    {t(history.potentialOutcome)}
                  </span>
                </div>
              </div>

              {/* SECTION 14: CAREER RECORDS */}
              <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                  <Award className="w-4 h-4" /> {t('PERSONAL CAREER RECORDS')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold font-arcade">
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Most Goals / Season')}</div>
                    <div className="text-sm font-black text-amber-300 mt-0.5">{t('{count} Goals', { count: `${history.mostGoalsSingleSeason.count}` })}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Most Assists / Season')}</div>
                    <div className="text-sm font-black text-emerald-300 mt-0.5">{t('{count} Assists', { count: `${history.mostAssistsSingleSeason.count}` })}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Highest Match Rating')}</div>
                    <div className="text-sm font-black text-cyan-300 mt-0.5">{history.highestSingleMatchRating} / 10</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Longest Scoring Streak')}</div>
                    <div className="text-sm font-black text-purple-300 mt-0.5">{t('{count} Matches', { count: `${history.longestScoringStreakMatches}` })}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Most Trophies / Season')}</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">{t('{count} Trophies', { count: `${history.mostTrophiesSingleSeason.count}` })}</div>
                  </div>
                  <div className="p-3 pixel-corners pixel-bevel-sunken bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">{t('Peak Transfer Fee')}</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">{history.transfersHistory[2]?.formattedFee || '€45,000,000'}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 7. TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="p-5 pixel-corners pixel-bevel-raised bg-slate-900 border-2 border-slate-800 space-y-4 animate-fadeIn">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-arcade">
                <Clock className="w-4 h-4" /> {t('CHRONOLOGICAL CAREER TIMELINE')}
              </h3>
              <div className="relative border-l-2 border-amber-500/40 ml-4 pl-6 space-y-6">
                {history.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 pixel-corners bg-slate-950 border-2 border-amber-400 group-hover:bg-amber-400 transition-colors" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30 font-arcade">
                          {t('AGE {age} • {year}', { age: `${event.age}`, year: `${event.year}` })}
                        </span>
                        <h4 className="font-black text-sm text-white uppercase font-arcade">{t(event.title)}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-retro">
                        {t(event.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. CAREER LEGACY CARD TAB */}
          {activeTab === 'legacy_card' && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`max-w-md mx-auto p-6 pixel-corners pixel-bevel-gold bg-gradient-to-b ${fameDetails.bgGradient} border-2 ${fameDetails.borderColor} shadow-2xl space-y-5 text-center relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" />
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 pixel-corners bg-black/60 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/50 font-arcade">
                  <Trophy className="w-3.5 h-3.5" /> {t('CAREER LEGACY CARD')}
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase pixel-text-shadow">
                    {player.name}
                  </h2>
                  <div className={`text-sm font-black ${fameDetails.colorClass} uppercase tracking-wider font-arcade`}>
                    {t(fameDetails.badge)} • {t(fameDetails.title)}
                  </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-left bg-black/70 p-4 pixel-corners pixel-bevel-sunken border border-white/10 text-xs font-arcade">
                  <div><span className="text-slate-400">{t('Starting OVR')}:</span> <span className="font-bold text-slate-200">{history.startingOvr || 88}</span></div>
                  <div><span className="text-slate-400">{t('Peak OVR')}:</span> <span className="font-bold text-emerald-400">{history.peakOvr.ovr}</span></div>
                  <div><span className="text-slate-400">{t('Peak Value')}:</span> <span className="font-bold text-emerald-300">{history.peakMarketValue.formattedValue}</span></div>
                  <div><span className="text-slate-400">{t('Matches')}:</span> <span className="font-bold text-white">{history.matchStats.totalMatches}</span></div>
                  <div><span className="text-slate-400">{t('Goals')}:</span> <span className="font-bold text-amber-300">{history.totalGoals}</span></div>
                  <div><span className="text-slate-400">{t('Assists')}:</span> <span className="font-bold text-emerald-300">{history.totalAssists}</span></div>
                  <div><span className="text-slate-400">{t('Titles')}:</span> <span className="font-bold text-amber-400">{history.trophiesWon.length}</span></div>
                  <div><span className="text-slate-400">{t('Awards')}:</span> <span className="font-bold text-cyan-300">{history.individualAwards.length}</span></div>
                  <div><span className="text-slate-400">{t('Clubs')}:</span> <span className="font-bold text-white">{history.teamsRepresented.length}</span></div>
                  <div><span className="text-slate-400">{t('Seasons')}:</span> <span className="font-bold text-indigo-300">{history.totalDurationYears}</span></div>
                </div>

                <div className={`text-[11px] font-black ${fameDetails.textColor} bg-black/60 py-2 px-3 pixel-corners border ${fameDetails.borderColor} font-arcade uppercase`}>
                  {t('FINAL FAME: {fame} / 1000 ({req})', { fame: `${history.finalFame}`, req: t(fameDetails.fameRequired) })}
                </div>
              </div>
            </div>
          )}

          {/* 9. DEVELOPER NOTE TAB */}
          {activeTab === 'developer' && (
            <div className="max-w-xl mx-auto p-6 md:p-8 pixel-corners pixel-bevel-gold bg-slate-900/90 border-2 border-amber-500/60 shadow-2xl space-y-6 text-center animate-fadeIn my-4">
              <div className="w-16 h-16 mx-auto pixel-corners pixel-bevel-raised bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300">
                <Heart className="w-8 h-8 fill-amber-400 text-amber-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
                  {t('THANK YOU FOR PLAYING')}
                </h2>
                <div className="text-sm font-black text-amber-400 tracking-wide font-arcade uppercase">
                  {t('From Hisyaz — Developer')}
                </div>
              </div>

              <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 text-left bg-slate-950 p-5 pixel-corners pixel-bevel-sunken border-2 border-slate-800 font-retro">
                <p>
                  {t('Thank you for supporting this game and taking your player through this entire career journey! Your support directly fuels the ongoing development and continuous improvement of this football experience.')}
                </p>
                <p>
                  {t('This project was created with a deep passion for bringing authentic, meaningful, and unforgettable football career stories to life. Every match, transfer, trophy, and decision was built to make your player\'s legacy feel personal and impactful.')}
                </p>
                <p className="text-amber-200 font-semibold italic">
                  {t('We are continuously working to enhance features, expand depth, and refine every single detail for future career mode adventures. Thank you for being a part of this journey!')}
                </p>
              </div>

              <div className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2 font-arcade">
                {t('CAREER ARCHIVED & SAVED PERMANENTLY')}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
