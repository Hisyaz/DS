import React, { useState } from 'react';
import {
  ALL_PLAYER_TYPES,
  PlayerTypeDefinition,
  PlayerTypeId,
} from '../data/playerTypes';
import {
  Zap,
  Shield,
  Sparkles,
  Compass,
  Snowflake,
  Activity,
  Flame,
  Bomb,
  Check,
  TrendingUp,
  AlertTriangle,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { ChoiceSystem } from './ChoiceSystem';
import { getStartingTypeNickname } from '../utils/nicknameSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  getOfficialPlayerTypeName,
  getOfficialPlayerTypeBadge,
  getOfficialPlayerTypeSubtitle,
  getOfficialPlayerTypeRole,
  getOfficialPlayerTypeTagline,
  getOfficialPlayerTypeDescription,
  getOfficialPlayerTypeWarning,
  getOfficialPlayerTypeProfileSummary,
  getOfficialRatingLabel,
  getOfficialStatName,
} from '../utils/gameVocabulary';

export interface PlayerTypeSelectionModalProps {
  isOpen?: boolean;
  playerName?: string;
  startingCity?: string;
  selectedTypeId?: string;
  onSelectType?: (playerType: PlayerTypeDefinition) => void;
  onSelectPlayerType?: (playerType: PlayerTypeDefinition) => void;
  onBack?: () => void;
}

export const PlayerTypeSelectionModal: React.FC<PlayerTypeSelectionModalProps> = ({
  isOpen = true,
  playerName = 'Player',
  startingCity,
  selectedTypeId: initialTypeId,
  onSelectType,
  onSelectPlayerType,
  onBack,
}) => {
  const { t, language } = useLanguage();

  const initialIndex = Math.max(
    0,
    ALL_PLAYER_TYPES.findIndex((t) => t.id === initialTypeId)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(
    initialIndex !== -1 ? initialIndex : 0
  );

  const activeType = ALL_PLAYER_TYPES[currentIndex] || ALL_PLAYER_TYPES[0];
  const localizedTypeName = getOfficialPlayerTypeName(activeType.id, language) || activeType.name;
  const localizedBadge = getOfficialPlayerTypeBadge(activeType.id, language) || activeType.badge;
  const localizedSubtitle = getOfficialPlayerTypeSubtitle(activeType.id, language) || activeType.subtitle;
  const localizedRole = getOfficialPlayerTypeRole(activeType.id, language) || activeType.archetypeRole;
  const localizedTagline = getOfficialPlayerTypeTagline(activeType.id, language) || activeType.tagline;
  const localizedDescription = getOfficialPlayerTypeDescription(activeType.id, language) || activeType.description;
  const localizedWarning = getOfficialPlayerTypeWarning(activeType.id, language) || activeType.conductWarning;
  const localizedProfileSummary = getOfficialPlayerTypeProfileSummary(activeType.id, language) || activeType.profile?.summary;

  const startingNicknamePreview = getStartingTypeNickname(activeType.id, startingCity);

  const handleConfirm = React.useCallback(() => {
    if (onSelectType) onSelectType(activeType);
    if (onSelectPlayerType) onSelectPlayerType(activeType);
  }, [activeType, onSelectType, onSelectPlayerType]);

  const getCategoryColor = (rating: string) => {
    switch (rating) {
      case 'Supreme':
        return 'bg-amber-950 text-amber-300 border-amber-400 pixel-bevel-gold font-black shadow-sm';
      case 'Elite':
        return 'bg-purple-950 text-purple-300 border-purple-400 pixel-bevel-raised font-bold shadow-sm';
      case 'High':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500 pixel-bevel-emerald font-bold';
      case 'Solid':
        return 'bg-sky-950 text-sky-300 border-sky-500 pixel-bevel-cyan font-medium';
      case 'Moderate':
        return 'bg-slate-900 text-slate-300 border-slate-700 pixel-bevel-raised';
      default:
        return 'bg-rose-950 text-rose-300 border-rose-700 pixel-bevel-crimson';
    }
  };

  const getArchetypeIcon = (id: PlayerTypeId) => {
    switch (id) {
      case 'speedster':
        return <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />;
      case 'tank':
        return <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400" />;
      case 'flair':
        return <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />;
      case 'architect':
        return <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400" />;
      case 'ice_cold':
        return <Snowflake className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />;
      case 'patient':
        return <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />;
      case 'wasted_talent':
        return <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400" />;
      case 'cannon':
        return <Bomb className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={ALL_PLAYER_TYPES.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={handleConfirm}
      title={localizedTypeName}
      subtitle={`${localizedSubtitle} • ${localizedRole}`}
      selectorLabel={`${t('CHOICE') || 'OPCIÓN'} ${currentIndex + 1} ${t('OF') || 'DE'} ${ALL_PLAYER_TYPES.length}`}
      themeColor={activeType.theme.primaryColor}
      accentGradient="from-amber-400 via-yellow-300 to-amber-500"
      categoryBadge={
        <span className="px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold">
          {localizedBadge}
        </span>
      }
      topActions={
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-700 pixel-bevel-raised transition cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('BTN_BACK') || 'ATRÁS'}</span>
            </button>
          )}
          <span className="text-[10px] font-mono text-amber-400 hidden md:inline px-2 py-0.5 bg-slate-950 border border-slate-800">
            {t('POINTS_725_ALLOCATION') || '725 PTS ASIGNACIÓN'}
          </span>
        </div>
      }
      confirmLabel={`${t('BTN_CONFIRM') || 'CONFIRMAR'} ${localizedTypeName.toUpperCase()}`}
      confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
    >
      {/* 32-Bit Central Archetype Card Display */}
      <div className="w-full max-w-2xl flex flex-col p-3 sm:p-5 bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold shadow-2xl relative overflow-hidden font-mono">
        {/* Subtle Pixel Dither Background */}
        <div className="absolute inset-0 pointer-events-none pixel-dither-pattern opacity-10" />

        <div className="space-y-2.5 sm:space-y-3 relative z-10">
          {/* Card Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 border-b-2 border-slate-800 pb-2 sm:pb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-slate-950 border-2 border-amber-400 pixel-bevel-gold flex items-center justify-center shadow-md shrink-0">
                {getArchetypeIcon(activeType.id)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                    {localizedRole}
                  </span>
                  <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-700 font-bold">
                    {t('POSITION_NEUTRAL') || 'POSICIÓN NEUTRAL'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow truncate">
                  {localizedTypeName}
                </h2>
                <div className="text-[11px] sm:text-xs text-amber-300 font-medium line-clamp-1">
                  {localizedTagline}
                </div>
              </div>
            </div>

            {/* Starting Nickname preview */}
            <div className="sm:text-right shrink-0 bg-slate-950 px-2 sm:px-2.5 py-1 sm:py-1.5 border border-amber-500/60 pixel-bevel-gold flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 block">
                {t('NICKNAME') || 'APODO'} ({startingCity ? startingCity.split(',')[0].trim() : t('ACADEMY') || 'ACADEMIA'})
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                "{startingNicknamePreview}"
              </span>
            </div>
          </div>

          {/* Description Box */}
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal bg-slate-950 p-2 sm:p-2.5 border border-slate-800 pixel-bevel-raised">
            {localizedDescription}
          </p>

          {/* Archetype Conduct Warning Disclaimer in Red Text */}
          {localizedWarning && (
            <div className="p-2.5 sm:p-3 bg-red-950/90 border-2 border-red-600 pixel-bevel-crimson flex items-start gap-2.5 shadow-[0_0_20px_rgba(225,29,72,0.5)]">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[11px] sm:text-xs font-bold font-retro leading-snug tracking-wide">
                <span className="text-red-400 font-arcade font-black uppercase block mb-1">
                  {t('DISCIPLINARY_CONDUCT_DISCLAIMER') || 'AVISO DE CONDUCTA DISCIPLINARIA:'}
                </span>
                <span className="text-red-300 font-bold">
                  {localizedWarning}
                </span>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Defining Strengths */}
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/60 pixel-bevel-emerald space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t('PRIMARY_STRENGTHS_YR') || 'FORTALEZAS PRINCIPALES (+2/AÑO)'}
                </span>
                <span className="text-[9px] text-emerald-300 font-bold">{t('DOMINANT') || 'DOMINANTE'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeType.primaryStrengths.map((s) => (
                  <span
                    key={s.key}
                    className="px-2 py-0.5 text-[11px] font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-500"
                  >
                    {getOfficialStatName(s.key, language)}
                  </span>
                ))}
              </div>
              {activeType.secondaryStrengths && activeType.secondaryStrengths.length > 0 && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-emerald-900/40">
                  <span className="text-cyan-300 font-bold">{t('SECONDARY_STRENGTHS_YR') || 'Secundarias (+1/año):'} </span>
                  {activeType.secondaryStrengths.map((s) => getOfficialStatName(s.key, language)).join(', ')}
                </div>
              )}
            </div>

            {/* Defining Weaknesses */}
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/60 pixel-bevel-crimson space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('KEY_WEAKNESSES_PTS') || 'DEBILIDADES CLAVE (+10% PTS)'}
                </span>
                <span className="text-[9px] text-rose-300 font-bold">{t('DEVELOPMENT') || 'DESARROLLO'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeType.weaknesses.map((w) => (
                  <span
                    key={w.key}
                    className="px-2 py-0.5 text-[10px] font-medium bg-rose-900/80 text-rose-200 border border-rose-500"
                  >
                    {getOfficialStatName(w.key, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Qualitative Profile Breakdown (PRO, GOA, CRE, DEF, PHY, MEN) */}
          <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
              <span className="font-black text-amber-400">{t('ARCHETYPE_PROFILE_RATINGS') || 'CALIFICACIONES DEL ARQUETIPO'}</span>
              <span className="text-slate-400">{t('ARCHETYPE_GROWTH_RULE') || '+2 PRINC / +1 SEC CREC. ANUAL (10–20)'}</span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              {(['PRO', 'GOA', 'CRE', 'DEF', 'PHY', 'MEN'] as const).map((cat) => {
                const rating = activeType.profile.categoryRatings[cat];
                const localizedRating = getOfficialRatingLabel(rating, language);
                return (
                  <div
                    key={cat}
                    className={`py-1 px-0.5 border flex flex-col items-center justify-center ${getCategoryColor(rating)}`}
                  >
                    <span className="text-[8px] sm:text-[9px] opacity-80">{cat}</span>
                    <span className="text-[10px] sm:text-xs font-black tracking-tight">{localizedRating}</span>
                  </div>
                );
              })}
            </div>
            {localizedProfileSummary && (
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 font-mono italic pt-1 border-t border-slate-800/80 text-left">
                {localizedProfileSummary}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{t('PRESEASON_GROWTH_NOTE') || 'Crecimiento Pretemporada: +2 pts/año a fortalezas principales y +1 pt/año a secundarias (10–20 años)'}</span>
          </div>
          <span className="text-amber-300 font-bold hidden sm:inline">
            {t('CARD') || 'CARTA'} {currentIndex + 1} / {ALL_PLAYER_TYPES.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
