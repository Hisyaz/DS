import React from 'react';
import { CompetitionTrophyConfig, TrophyBaseDesign } from '../types/leagueEditor';
import { useLanguage } from '../context/LanguageContext';

interface TrophyDesignerPreviewProps {
  trophy: CompetitionTrophyConfig;
  size?: 'sm' | 'md' | 'lg';
}

export const TrophyDesignerPreview: React.FC<TrophyDesignerPreviewProps> = ({ trophy, size = 'md' }) => {
  const { t } = useLanguage();
  const getMetalGradients = () => {
    switch (trophy.metalTone) {
      case 'gold':
        return {
          c1: '#fef08a',
          c2: '#eab308',
          c3: '#854d0e',
          shine: '#ffffff',
          stroke: '#ca8a04',
        };
      case 'silver':
        return {
          c1: '#f8fafc',
          c2: '#94a3b8',
          c3: '#334155',
          shine: '#ffffff',
          stroke: '#64748b',
        };
      case 'bronze':
        return {
          c1: '#ffedd5',
          c2: '#c2410c',
          c3: '#7c2d12',
          shine: '#fed7aa',
          stroke: '#9a3412',
        };
      case 'platinum':
      default:
        return {
          c1: '#f0f9ff',
          c2: '#38bdf8',
          c3: '#0369a1',
          shine: '#ffffff',
          stroke: '#0284c7',
        };
    }
  };

  const getBaseColors = (baseDesign?: TrophyBaseDesign) => {
    switch (baseDesign) {
      case 'mahogany_wood':
        return { bg: '#451a03', border: '#78350f', highlight: '#92400e', text: '#fef08a' };
      case 'gold_tier':
        return { bg: '#713f12', border: '#eab308', highlight: '#ca8a04', text: '#ffffff' };
      case 'silver_pedestal':
        return { bg: '#1e293b', border: '#94a3b8', highlight: '#475569', text: '#f8fafc' };
      case 'glass_stand':
        return { bg: '#082f49', border: '#38bdf8', highlight: '#0e7490', text: '#e0f2fe' };
      case 'marble_black':
      default:
        return { bg: '#0f172a', border: '#334155', highlight: '#1e293b', text: '#cbd5e1' };
    }
  };

  const grads = getMetalGradients();
  const baseCol = getBaseColors(trophy.baseDesign);
  const ribbonColor = trophy.ribbonColor || '#2563eb';
  const iconType = trophy.iconType || 'cup';

  const containerSizes = {
    sm: 'w-28 h-36',
    md: 'w-36 h-48',
    lg: 'w-48 h-60',
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 shadow-inner">
      <div className={`${containerSizes[size]} relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id={`trophy-grad-${trophy.metalTone}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={grads.c1} />
              <stop offset="45%" stopColor={grads.c2} />
              <stop offset="100%" stopColor={grads.c3} />
            </linearGradient>
            <linearGradient id={`trophy-base-grad-${trophy.baseDesign || 'marble'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={baseCol.highlight} />
              <stop offset="100%" stopColor={baseCol.bg} />
            </linearGradient>
          </defs>

          {/* Pedestal Base */}
          <rect x="20" y="100" width="60" height="20" rx="4" fill={`url(#trophy-base-grad-${trophy.baseDesign || 'marble'})`} stroke={baseCol.border} strokeWidth="1.5" />
          <rect x="28" y="92" width="44" height="10" fill={baseCol.highlight} stroke={baseCol.border} strokeWidth="1" />

          {/* Engraving Plate */}
          <rect x="24" y="105" width="52" height="10" rx="1.5" fill="#000000" opacity="0.6" stroke={baseCol.border} strokeWidth="0.5" />
          <text x="50" y="112" fill={baseCol.text} fontSize="4" fontWeight="bold" textAnchor="middle" className="font-mono uppercase tracking-wider">
            {(trophy.engravingText || trophy.name || 'CHAMPION').slice(0, 18)}
          </text>

          {/* Ribbon Decor */}
          <path d="M 30 94 Q 15 102 10 115" stroke={ribbonColor} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 70 94 Q 85 102 90 115" stroke={ribbonColor} strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Trophy Stem */}
          <rect x="44" y="72" width="12" height="22" fill={`url(#trophy-grad-${trophy.metalTone})`} />
          <circle cx="50" cy="83" r="8" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke={grads.stroke} strokeWidth="0.5" />

          {/* Trophy Top Body by iconType / shape */}
          {iconType === 'champions-league' ? (
            /* Big Ears European Cup */
            <g>
              <path d="M 26 28 Q 8 28 12 58 Q 18 74 32 74" fill="none" stroke={`url(#trophy-grad-${trophy.metalTone})`} strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 74 28 Q 92 28 88 58 Q 82 74 68 74" fill="none" stroke={`url(#trophy-grad-${trophy.metalTone})`} strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 28 20 L 72 20 L 66 58 Q 50 82 34 58 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="0.8" />
              <line x1="28" y1="20" x2="72" y2="20" stroke={grads.shine} strokeWidth="2" />
            </g>
          ) : iconType === 'super-cup' || iconType === 'crown-cup' ? (
            /* Plate / Shield Trophy */
            <g>
              <circle cx="50" cy="46" r="30" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="50" cy="46" r="21" fill="#0f172a" stroke={`url(#trophy-grad-${trophy.metalTone})`} strokeWidth="2.5" />
              <path d="M 50 28 L 56 38 L 68 40 L 59 49 L 61 61 L 50 55 L 39 61 L 41 49 L 32 40 L 44 38 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} />
            </g>
          ) : iconType === 'golden-boot' ? (
            /* Golden Boot Award */
            <g>
              <path d="M 20 52 C 20 40, 35 32, 50 32 L 72 32 C 82 32, 88 42, 85 52 L 78 58 L 20 58 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="1" />
              {/* Studs */}
              <circle cx="30" cy="62" r="2.5" fill={grads.c3} />
              <circle cx="45" cy="62" r="2.5" fill={grads.c3} />
              <circle cx="60" cy="62" r="2.5" fill={grads.c3} />
              <circle cx="75" cy="62" r="2.5" fill={grads.c3} />
            </g>
          ) : iconType === 'ballon-or' || iconType === 'globe-trophy' ? (
            /* Golden Ball / Globe Award */
            <g>
              <circle cx="50" cy="44" r="28" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="1" />
              <ellipse cx="50" cy="44" rx="28" ry="12" fill="none" stroke="#000000" strokeWidth="1" opacity="0.4" />
              <ellipse cx="50" cy="44" rx="12" ry="28" fill="none" stroke="#000000" strokeWidth="1" opacity="0.4" />
            </g>
          ) : iconType === 'statue' ? (
            /* Victory Player Statue */
            <g>
              <circle cx="50" cy="24" r="7" fill={`url(#trophy-grad-${trophy.metalTone})`} />
              <path d="M 42 32 L 58 32 L 62 60 L 54 60 L 50 44 L 46 60 L 38 60 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="0.8" />
            </g>
          ) : iconType === 'whistle' ? (
            /* Manager Golden Whistle */
            <g>
              <rect x="25" y="38" width="40" height="18" rx="8" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="1" />
              <rect x="62" y="42" width="16" height="10" fill={`url(#trophy-grad-${trophy.metalTone})`} />
              <circle cx="35" cy="47" r="4" fill="#000000" opacity="0.5" />
            </g>
          ) : iconType === 'league' ? (
            /* League Tower Shield Trophy */
            <g>
              <path d="M 30 18 L 70 18 L 64 74 L 36 74 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="1" />
              <line x1="50" y1="18" x2="50" y2="74" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
            </g>
          ) : (
            /* Classic Cup */
            <g>
              <path d="M 22 30 Q 10 40 22 56" fill="none" stroke={`url(#trophy-grad-${trophy.metalTone})`} strokeWidth="4.5" />
              <path d="M 78 30 Q 90 40 78 56" fill="none" stroke={`url(#trophy-grad-${trophy.metalTone})`} strokeWidth="4.5" />
              <path d="M 26 20 L 74 20 Q 72 58 50 74 Q 28 58 26 20 Z" fill={`url(#trophy-grad-${trophy.metalTone})`} stroke="#ffffff" strokeWidth="0.8" />
            </g>
          )}
        </svg>
      </div>

      <div className="text-center">
        <h5 className="text-xs font-black text-white truncate max-w-[150px]">{t(trophy.name) || trophy.name || t('TROPHY') || 'Trophy'}</h5>
        <span className="text-[10px] text-amber-400 font-mono capitalize">
          {t(trophy.metalTone) || trophy.metalTone} {t('METAL') || 'Metal'} • {trophy.baseDesign ? (t(trophy.baseDesign) || trophy.baseDesign.replace('_', ' ')) : (t('STANDARD_BASE') || 'Standard Base')}
        </span>
      </div>
    </div>
  );
};

