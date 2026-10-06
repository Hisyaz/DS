import React, { useState } from 'react';
import { Target, Activity, Shield, Zap, Sparkles, Check, Footprints, ArrowLeft } from 'lucide-react';
import { ChoiceSystem } from './ChoiceSystem';
import { ALL_PLAYER_TYPES } from '../data/playerTypes';
import { useLanguage } from '../context/LanguageContext';
import { getOfficialPositionName, getOfficialStatName, getOfficialPlayerTypeName } from '../utils/gameVocabulary';

export type PrimaryPosition = 'ATT' | 'MID' | 'DEF';

export interface PositionSelectionModalProps {
  isOpen: boolean;
  selectedPosition?: PrimaryPosition | any;
  selectedSubPosition?: string;
  selectedPlayerType?: any;
  playerTypeId?: string;
  preferredFoot?: 'Right' | 'Left';
  onConfirmPosition: (position: any, subPosition: string) => void;
  onBack?: () => void;
}

interface PositionOption {
  id: PrimaryPosition;
  name: string;
  badge: string;
  badgeBg: string;
  pitchZone: string;
  description: string;
  tacticalRoles: string[];
  keyAttributes: string[];
  subPositions: {
    code: string;
    name: string;
    roleDescription: string;
    footRecommendation: string;
    isFootMatched: boolean;
  }[];
}

export const PositionSelectionModal: React.FC<PositionSelectionModalProps> = ({
  isOpen,
  selectedPosition = 'MID',
  selectedSubPosition,
  selectedPlayerType,
  playerTypeId = 'speedster',
  preferredFoot = 'Right',
  onConfirmPosition,
  onBack,
}) => {
  const { t, language } = useLanguage();

  const resolvedTypeId = selectedPlayerType?.id || playerTypeId;
  const isLeftFooted = preferredFoot === 'Left';
  const activePlayerType =
    selectedPlayerType ||
    ALL_PLAYER_TYPES.find((t) => t.id === resolvedTypeId) ||
    ALL_PLAYER_TYPES[0];

  const positionOptions: PositionOption[] = [
    {
      id: 'ATT',
      name: t('ATT / ATTACKER') || `${getOfficialPositionName('ATT', language)} / ${t('ATTACKER') || 'Attacker'}`,
      badge: getOfficialPositionName('ATT', language).toUpperCase(),
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-500 pixel-bevel-crimson',
      pitchZone: t('FINAL_THIRD_BOX') || 'Final Third & Penalty Box',
      description:
        t('ATT_POSITION_DESCRIPTION') ||
        'The spearhead of the attack. Your primary job is finishing chances, exploiting defensive gaps, converting high-pressure moments into goals, and creating scoring opportunities.',
      tacticalRoles: [
        `${getOfficialPositionName('ST', language)} (ST)`,
        `${getOfficialPositionName('LW', language)} (LW)`,
        `${getOfficialPositionName('RW', language)} (RW)`,
      ],
      keyAttributes: [
        getOfficialStatName('finishing', language),
        getOfficialStatName('attackingMovement', language),
        getOfficialStatName('shotPower', language),
        getOfficialStatName('composure', language),
      ],
      subPositions: [
        {
          code: 'ST',
          name: getOfficialPositionName('ST', language),
          roleDescription: t('ST_ROLE_DESC') || 'Pure goalscorer holding up play, making blindside runs, and converting inside the penalty box.',
          footRecommendation: t('BOTH_FEET_DEADLY') || 'Equally deadly with both feet.',
          isFootMatched: true,
        },
        {
          code: isLeftFooted ? 'RW' : 'LW',
          name: isLeftFooted ? `${t('INVERTED') || 'Inverted'} ${getOfficialPositionName('RW', language)}` : `${t('INVERTED') || 'Inverted'} ${getOfficialPositionName('LW', language)}`,
          roleDescription: isLeftFooted
            ? (t('INVERTED_RW_DESC') || 'Cuts inside onto stronger Left foot to shoot or deliver curling through-balls.')
            : (t('INVERTED_LW_DESC') || 'Cuts inside onto stronger Right foot to shoot or deliver curling through-balls.'),
          footRecommendation: `${t('HIGH_SYNERGY_WITH') || 'High Synergy with'} ${preferredFoot} ${t('FOOT') || 'foot'}`,
          isFootMatched: true,
        },
        {
          code: isLeftFooted ? 'LW' : 'RW',
          name: isLeftFooted ? `${t('CLASSIC') || 'Classic'} ${getOfficialPositionName('LW', language)}` : `${t('CLASSIC') || 'Classic'} ${getOfficialPositionName('RW', language)}`,
          roleDescription: isLeftFooted
            ? (t('CLASSIC_LW_DESC') || 'Hugs the touchline, beats fullbacks on the outside, and delivers pinpoint crosses.')
            : (t('CLASSIC_RW_DESC') || 'Hugs the touchline, beats fullbacks on the outside, and delivers pinpoint crosses.'),
          footRecommendation: `${t('NATURAL_FLANK') || 'Natural Flank'} (${preferredFoot}-${t('FOOTED') || 'Footed'})`,
          isFootMatched: true,
        },
      ],
    },
    {
      id: 'MID',
      name: getOfficialPositionName('MID', language),
      badge: getOfficialPositionName('MID', language).toUpperCase(),
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500 pixel-bevel-emerald',
      pitchZone: t('ENGINE_ROOM_ZONE') || 'Engine Room & Central Sector',
      description:
        t('MID_POSITION_DESCRIPTION') ||
        'The heart and engine of the team. Dictate the tempo of the game, break opponent counter-attacks, supply incisive progressive passes, and control possession.',
      tacticalRoles: [
        `${getOfficialPositionName('CM', language)} (CM)`,
        `${getOfficialPositionName('CAM', language)} (CAM)`,
        `${getOfficialPositionName('CDM', language)} (CDM)`,
      ],
      keyAttributes: [
        getOfficialStatName('vision', language),
        getOfficialStatName('passing', language),
        getOfficialStatName('stamina', language),
        getOfficialStatName('ballControl', language),
      ],
      subPositions: [
        {
          code: 'CM',
          name: getOfficialPositionName('CM', language),
          roleDescription: t('CM_ROLE_DESC') || 'Complete dynamic midfielder linking defense to attack, pressing, and arriving late in the box.',
          footRecommendation: t('OPTIMAL_PASSING_RANGE') || 'Two-footed passing range is optimal.',
          isFootMatched: true,
        },
        {
          code: 'CAM',
          name: getOfficialPositionName('CAM', language),
          roleDescription: t('CAM_ROLE_DESC') || 'Operating between opponent lines to unlock tight defenses with final passes and long-range efforts.',
          footRecommendation: t('CREATIVE_VISION_PRIMARY') || 'Creative vision with primary foot.',
          isFootMatched: true,
        },
        {
          code: 'CDM',
          name: getOfficialPositionName('CDM', language),
          roleDescription: t('CDM_ROLE_DESC') || 'Screening the back four, breaking up opponent counters, and distributing cleanly to playmakers.',
          footRecommendation: t('TACTICAL_DISCIPLINE_STRENGTH') || 'Tactical discipline and strength.',
          isFootMatched: true,
        },
      ],
    },
    {
      id: 'DEF',
      name: getOfficialPositionName('DEF', language),
      badge: getOfficialPositionName('DEF', language).toUpperCase(),
      badgeBg: 'bg-sky-950 text-sky-300 border-sky-500 pixel-bevel-cyan',
      pitchZone: t('BACKLINE_ZONE') || 'Backline & Defensive Third',
      description:
        t('DEF_POSITION_DESCRIPTION') ||
        'Anchor the defensive line, shut down opposing attackers, dominate aerial and physical duels, and launch buildups from deep.',
      tacticalRoles: [
        `${getOfficialPositionName('CB', language)} (CB)`,
        `${getOfficialPositionName('LB', language)} (LB)`,
        `${getOfficialPositionName('RB', language)} (RB)`,
      ],
      keyAttributes: [
        getOfficialStatName('tackling', language),
        getOfficialStatName('interceptions', language),
        getOfficialStatName('strength', language),
        getOfficialStatName('heading', language),
      ],
      subPositions: [
        {
          code: 'CB',
          name: getOfficialPositionName('CB', language),
          roleDescription: t('CB_ROLE_DESC') || 'Core defensive anchor winning aerial duels, executing slide tackles, and neutralizing strikers.',
          footRecommendation: t('AERIAL_PHYSICAL_DOMINANCE') || 'Strong physical and tactical aerial dominance.',
          isFootMatched: true,
        },
        {
          code: isLeftFooted ? 'LB' : 'RB',
          name: isLeftFooted ? `${getOfficialPositionName('LB', language)} (${t('NATURAL') || 'Natural'})` : `${getOfficialPositionName('RB', language)} (${t('NATURAL') || 'Natural'})`,
          roleDescription: isLeftFooted
            ? (t('NATURAL_LB_DESC') || 'Natural left-footed defensive flank guardian supporting transitions and defending on the left.')
            : (t('NATURAL_RB_DESC') || 'Natural right-footed defensive flank guardian supporting transitions and defending on the right.'),
          footRecommendation: `${t('NATURAL_FLANK_SYNERGY') || 'Natural Flank Synergy'} (${preferredFoot}-${t('FOOTED') || 'Footed'})`,
          isFootMatched: true,
        },
        {
          code: isLeftFooted ? 'RB' : 'LB',
          name: isLeftFooted ? `${getOfficialPositionName('RB', language)} (${t('INVERTED') || 'Inverted'})` : `${getOfficialPositionName('LB', language)} (${t('INVERTED') || 'Inverted'})`,
          roleDescription: isLeftFooted
            ? (t('INVERTED_RB_DESC') || 'Inverted fullback tucking inside into central areas during buildup.')
            : (t('INVERTED_LB_DESC') || 'Inverted fullback tucking inside into central areas during buildup.'),
          footRecommendation: t('INVERTED_FULLBACK_ROLE') || 'Inverted Fullback Role',
          isFootMatched: false,
        },
      ],
    },
  ];

  const initialIndex = Math.max(
    0,
    positionOptions.findIndex((p) => p.id === selectedPosition)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  const activePosition = positionOptions[currentIndex] || positionOptions[0];

  const handleConfirm = React.useCallback(() => {
    const defaultSub =
      activePosition.id === 'ATT'
        ? 'ST'
        : activePosition.id === 'MID'
        ? 'CM'
        : 'CB';
    onConfirmPosition(activePosition.id, defaultSub);
  }, [activePosition.id, onConfirmPosition]);

  if (!isOpen) return null;

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={positionOptions.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={handleConfirm}
      title={activePosition.name}
      subtitle={`${t('SECTOR') || 'Sector'}: ${activePosition.pitchZone} • ${t('FOOT') || 'Foot'}: ${preferredFoot}-${t('FOOTED') || 'Footed'}`}
      selectorLabel={`${t('CHOICE') || 'CHOICE'} ${currentIndex + 1} ${t('OF') || 'OF'} ${positionOptions.length}`}
      themeColor={
        activePosition.id === 'ATT'
          ? '#f43f5e'
          : activePosition.id === 'MID'
          ? '#10b981'
          : '#0ea5e9'
      }
      accentGradient="from-amber-400 via-yellow-300 to-amber-500"
      categoryBadge={
        <span className={`px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider border ${activePosition.badgeBg}`}>
          {activePosition.badge}
        </span>
      }
      topActions={
        <div className="flex items-center gap-2 font-mono">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-700 pixel-bevel-raised transition cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('BACK') || 'BACK'}</span>
            </button>
          )}
          <div className="px-2.5 py-1 bg-slate-950 border border-slate-700 pixel-bevel-raised text-slate-300 text-xs flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span>{preferredFoot}-{t('FOOTED') || 'Footed'}</span>
          </div>
        </div>
      }
      confirmLabel={`${t('CONFIRM') || 'CONFIRM'} ${activePosition.badge} ${t('POSITION') || 'POSITION'}`}
      confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
    >
      {/* 32-Bit Central Position Display */}
      <div className="w-full max-w-2xl flex flex-col p-3.5 sm:p-5 bg-slate-900 border-2 border-slate-700 pixel-bevel-raised shadow-2xl relative overflow-hidden font-mono">
        {/* 32-Bit Tactical Pitch Background Diagram */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full border-2 border-emerald-500/50 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-500/40" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {/* Header Info */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-black text-xl shadow-md shrink-0 border-2 ${
                  activePosition.id === 'ATT'
                    ? 'bg-rose-950 text-rose-300 border-rose-500 pixel-bevel-crimson'
                    : activePosition.id === 'MID'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 pixel-bevel-emerald'
                    : 'bg-sky-950 text-sky-300 border-sky-500 pixel-bevel-cyan'
                }`}
              >
                {activePosition.id}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  {t('PRIMARY_SECTOR') || 'SECTOR PRINCIPAL'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
                  {activePosition.name}
                </h3>
                <div className="text-xs text-slate-300 font-medium">
                  {t(activePosition.pitchZone) || activePosition.pitchZone}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1.5 border border-slate-800 pixel-bevel-raised">
              <span className="text-[9px] text-slate-400 block uppercase">
                {t('SYNERGY') || 'SINERGIA'}
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                {getOfficialPlayerTypeName(activePlayerType.id, language) || activePlayerType.name}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-950 p-2.5 border border-slate-800 pixel-bevel-raised">
            {t(activePosition.description) || activePosition.description}
          </p>

          {/* Key Roles & Key Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Tactical Roles */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                {t('AVAILABLE_ROLES') || t('AVAILABLE ROLES') || 'ROLES DISPONIBLES'}
              </span>
              <div className="flex flex-wrap gap-1">
                {activePosition.tacticalRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-0.5 text-[11px] font-bold bg-slate-900 text-slate-200 border border-slate-700"
                  >
                    {t(role) || role}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 pt-0.5">
                *{t('SUBPOS_ASSIGNED_DESC') || 'Subposición asignada al incorporarse al club según táctica y necesidades.'}
              </p>
            </div>

            {/* Crucial Attributes */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {t('ESSENTIAL_SKILLS') || t('ESSENTIAL SKILLS') || 'HABILIDADES CLAVE'}
              </span>
              <div className="flex flex-wrap gap-1">
                {activePosition.keyAttributes.map((attr) => (
                  <span
                    key={attr}
                    className="px-2 py-0.5 text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500"
                  >
                    {t(attr) || attr}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 pt-0.5">
                {t('STARTING_ATTRS_BOOSTED_DESC') || 'Los 725 atributos iniciales se potencian con rendimiento y entrenamientos.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Tactical Banner */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {t('POSITION_NEUTRAL_ARCHETYPE_FITS') || `${t('POSITION_NEUTRAL') || 'Posición neutral'} ${getOfficialPlayerTypeName(activePlayerType.id, language)} ${t('FITS_ALL_SETUPS') || 'encaja en cualquier esquema'}`}
            </span>
          </div>
          <span className="text-amber-300 font-bold hidden sm:inline">
            {t('OPTION') || 'OPCIÓN'} {currentIndex + 1} / {positionOptions.length}
          </span>
        </div>
      </div>
    </ChoiceSystem>
  );
};
