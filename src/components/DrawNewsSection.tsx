import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Globe, Shield, ExternalLink, Sparkles, CheckCircle2, ChevronRight, Newspaper } from 'lucide-react';
import { DrawNewsItem } from '../utils/drawNewsSystem';
import { t } from '../utils/localizationSystem';

interface DrawNewsSectionProps {
  newsItems: DrawNewsItem[];
  onOpenContinentalDraw: (item: DrawNewsItem) => void;
  onOpenNationalDraw: (item: DrawNewsItem) => void;
  onOpenAllContinentalSummary?: () => void;
  seasonYear: string;
}

export const DrawNewsSection: React.FC<DrawNewsSectionProps> = ({
  newsItems,
  onOpenContinentalDraw,
  onOpenNationalDraw,
  onOpenAllContinentalSummary,
  seasonYear,
}) => {
  if (!newsItems || newsItems.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {t('NEWS_CONTINENTAL_DRAWS_TITLE') || 'Official Competition Draw Headlines'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-blue-300">
                {seasonYear}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('NEWS_CONTINENTAL_DRAWS_SUBTITLE') || 'Draw results for tournaments across your continent and national team. Click to inspect groups.'}
            </p>
          </div>
        </div>

        {onOpenAllContinentalSummary && (
          <button
            type="button"
            onClick={onOpenAllContinentalSummary}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition py-1"
          >
            <span>{t('VIEW_ALL_DRAWS') || 'All Continental Draws'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Draw News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {newsItems.map((item) => {
          const isCont = item.category === 'continental';
          const isPlayer = item.isPlayerInvolved;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isPlayer
                  ? 'bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/60 border-blue-500/50 hover:border-blue-400 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.flagOrEmblem ? (
                      <img
                        src={item.flagOrEmblem}
                        alt="Flag"
                        className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0"
                      />
                    ) : (
                      <span className="text-base leading-none">{item.icon}</span>
                    )}
                    <span className="text-xs font-black text-slate-200 truncate">
                      {item.competitionName}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                      isPlayer
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badgeText}
                  </span>
                </div>

                {/* Headline & Description */}
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-2">
                    {item.headline}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (isCont) {
                    onOpenContinentalDraw(item);
                  } else {
                    onOpenNationalDraw(item);
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
                  isPlayer
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{isPlayer ? (t('INSPECT_MY_DRAW') || 'View Draw & Matchups') : (t('VIEW_DRAW_RESULTS') || 'View Draw Results')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
