import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Globe, Shield, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Eye, Calendar } from 'lucide-react';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';
import { ContinentalCompetitionId } from '../types/continentalCompetitions';
import { useLanguage } from '../context/LanguageContext';

interface ContinentalDrawsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectTournamentDraw?: (compId: ContinentalCompetitionId) => void;
  isSouthAmerica?: boolean;
  region?: 'europe' | 'south_america' | 'other';
  playerClub?: string;
  playerLeague?: string;
  seasonYear?: string;
  onProceedToBlock?: () => void;
  player?: any;
}

export const ContinentalDrawsSummaryModal: React.FC<ContinentalDrawsSummaryModalProps> = ({
  isOpen,
  onClose,
  onInspectTournamentDraw,
  isSouthAmerica,
  region,
  playerClub,
  playerLeague,
  seasonYear = '2026/27',
  onProceedToBlock,
  player,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const isSA = isSouthAmerica !== undefined ? isSouthAmerica : region === 'south_america';
  const effectiveClub = playerClub || player?.club || 'Your Club';
  const effectiveLeague = playerLeague || player?.league || 'First Division';

  const comps: { id: ContinentalCompetitionId; title: string; subtitle: string; icon: string; badgeColor: string; bgGradient: string }[] = isSA
    ? [
        {
          id: 'CONMEBOL_LIB',
          title: 'Copa Libertadores',
          subtitle: t('COMP_SUBTITLE_LIB') || '32 Clubs • 8 Groups of 4',
          icon: '👑',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          bgGradient: 'from-amber-950/40 to-slate-900',
        },
        {
          id: 'CONMEBOL_SUD',
          title: 'Copa Sudamericana',
          subtitle: t('COMP_SUBTITLE_SUD') || '32 Clubs • 8 Groups of 4',
          icon: '🌐',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
          bgGradient: 'from-sky-950/40 to-slate-900',
        },
      ]
    : [
        {
          id: 'UEFA_CL',
          title: 'UEFA Champions League',
          subtitle: t('COMP_SUBTITLE_UCL') || '36 Elite European Clubs • Swiss League Stage',
          icon: '⭐',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
          bgGradient: 'from-blue-950/40 to-slate-900',
        },
        {
          id: 'UEFA_EL',
          title: 'UEFA Europa League',
          subtitle: t('COMP_SUBTITLE_UEL') || '36 Clubs • Swiss League Stage',
          icon: '🛡️',
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
          bgGradient: 'from-orange-950/40 to-slate-900',
        },
        {
          id: 'UEFA_ECL',
          title: 'UEFA Conference League',
          subtitle: t('COMP_SUBTITLE_UECL') || '36 Clubs • 6 Matchdays Stage',
          icon: '🏆',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
          bgGradient: 'from-emerald-950/40 to-slate-900',
        },
      ];

  const headerTitle = isSouthAmerica
    ? `${seasonYear} ${t('CONMEBOL_DRAWS_COMPLETED') || 'CONMEBOL Continental Draws Completed'}`
    : `${seasonYear} ${t('EUROPEAN_DRAWS_COMPLETED') || 'European Competition Draws Completed'}`;

  const nextBlockLabel = isSouthAmerica
    ? (t('SUMMER_BLOCK_SA') || 'Summer Block (August → December)')
    : (t('SUMMER_BLOCK_EU') || 'Summer Block (August → January)');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-left overflow-y-auto">
      <div className="bg-slate-900 border-0 sm:border-2 border-slate-700/80 rounded-none sm:rounded-3xl p-4 sm:p-7 max-w-2xl w-full shadow-[0_0_60px_rgba(30,58,138,0.3)] space-y-4 sm:space-y-5 relative overflow-hidden my-auto min-h-screen sm:min-h-0 flex flex-col justify-between">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {isSouthAmerica
                  ? (t('JULY_MIDSEASON_STOP') || 'JULY MID-SEASON STOP • CONTINENTAL DRAWS')
                  : (t('AUGUST_PRESEASON_DRAWS') || 'AUGUST PRESEASON • EUROPEAN DRAWS')}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">{headerTitle}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-400 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
              {isSouthAmerica ? '👑' : '⭐'}
            </div>
          </div>

        {/* Club Qualification Status Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-black">
                🛡️
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{effectiveClub}</h4>
                <p className="text-[11px] text-slate-400">{effectiveLeague}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
              {t('DOMESTIC_FOCUS') || 'Domestic Focus'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{t('NOT_PARTICIPATING_CONTINENTAL') || 'Not participating in continental tournaments this season.'}</strong>{' '}
              {t('FOCUS_DOMESTIC_CAMPAIGN') || 'You will focus 100% of physical conditioning on the domestic league and cup campaign!'}
            </span>
          </div>
        </div>

        {/* Competitions Draw Status */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t('OFFICIAL_TOURNAMENT_DRAWS_CONDUCTED') || 'Official Tournament Draws Conducted:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {comps.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl bg-gradient-to-br ${c.bgGradient} border border-slate-800 flex items-center justify-between hover:border-slate-700 transition`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <h5 className="text-xs font-black text-white">{c.title}</h5>
                    <p className="text-[10px] text-slate-400">{c.subtitle}</p>
                  </div>
                </div>
                {onInspectTournamentDraw && (
                  <button
                    type="button"
                    onClick={() => onInspectTournamentDraw(c.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition"
                    title={`Inspect ${c.title} Draw`}
                  >
                    <Eye className="w-3 h-3 text-slate-300" />
                    <span>{t('INSPECT') || 'Inspect'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onProceedToBlock || onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <span>{t('PROCEED_TO', { block: nextBlockLabel }) || `Proceed to ${nextBlockLabel}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
