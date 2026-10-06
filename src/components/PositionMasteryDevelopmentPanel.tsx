import React from 'react';
import { PlayerCardData, PlayerPositionSlot, PositionMasteryTier } from '../types';
import {
  ensurePlayerPositions,
  calculatePositionSlotOvr,
  upgradePositionTier,
  POSITION_MASTERY_CONFIG,
} from '../utils/positionMasterySystem';
import { useLanguage } from '../context/LanguageContext';
import {
  Compass,
  Zap,
  Lock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Shield,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface PositionMasteryDevelopmentPanelProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  showToast: (msg: string) => void;
  triggerConfetti?: (opts?: any) => void;
}

export const PositionMasteryDevelopmentPanel: React.FC<PositionMasteryDevelopmentPanelProps> = ({
  player,
  onUpdatePlayer,
  showToast,
  triggerConfetti,
}) => {
  const { t } = useLanguage();
  const positions = ensurePlayerPositions(player);
  const availablePoints = player.freeStatPoints || player.unassignedPoints || 0;

  const handleUpgrade = (slot: PlayerPositionSlot) => {
    const res = upgradePositionTier(player, slot.id, 10);
    if (!res.success) {
      showToast(res.message);
      return;
    }

    onUpdatePlayer(res.updatedPlayer);
    showToast(`⚡ ${res.message}`);
    if (triggerConfetti) {
      triggerConfetti();
    }
  };

  const activePositionsCount = positions.length;
  const maxPositionsCount = 5; // Up to 5 positions total (1 main + 4 additional)

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  {t('POSITION_MASTERY_CENTER') || 'Position Development & Tactical Mastery'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                  {activePositionsCount} / {maxPositionsCount} Positions
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('POSITION_MASTERY_SUB') ||
                  'Master additional tactical positions, upgrade mastery tiers with stat points, and adapt to team needs.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  {t('AVAILABLE_STAT_POINTS') || 'Stat Points'}
                </div>
                <div className="text-sm font-black text-amber-300">{availablePoints} pts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Explainer Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Mastery System:</strong> Main position is always at{' '}
            <span className="text-emerald-400 font-bold">Tier V (100% proficiency)</span>. Additional positions start
            at <span className="text-rose-400 font-bold">Tier I (-40% on non-physical stats)</span>. Spend{' '}
            <span className="text-amber-300 font-bold">10 stat points</span> to advance tiers:{' '}
            <span className="text-slate-400 font-semibold">Tier I (-40%) → Tier II (-30%) → Tier III (-15%) → Tier IV (0%)</span>.
            If you play 80%+ of a season at Tier IV, you can promote it to your new Main Position!
          </p>
        </div>
      </div>

      {/* 5 Position Slots Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            {t('TACTICAL_POSITION_SLOTS') || 'Tactical Position Slots (5 Total)'}
          </h4>
          <span className="text-[11px] text-slate-500">
            {activePositionsCount < maxPositionsCount
              ? `${maxPositionsCount - activePositionsCount} position slot(s) unlockable via manager request`
              : 'Maximum 5 active positions reached'}
          </span>
        </div>

        {/* Render Slots 1 to 5 */}
        {[1, 2, 3, 4, 5].map((slotNumber) => {
          const slot = positions.find((s) => s.slotIndex === slotNumber);

          if (slot) {
            const isMain = slot.isMain || slot.tier === 'V';
            const tierConfig = POSITION_MASTERY_CONFIG[slot.tier];
            const slotOvr = calculatePositionSlotOvr(player, slot);
            const canUpgrade = !isMain && slot.tier !== 'IV' && availablePoints >= 10;
            const needsPoints = !isMain && slot.tier !== 'IV' && availablePoints < 10;

            const getTierColor = (tier: PositionMasteryTier) => {
              switch (tier) {
                case 'V':
                  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                case 'IV':
                  return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                case 'III':
                  return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                case 'II':
                  return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                case 'I':
                default:
                  return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              }
            };

            return (
              <div
                key={slot.id}
                className={`border rounded-2xl p-4 transition-all ${
                  isMain
                    ? 'bg-gradient-to-r from-slate-900 via-[#1e2337] to-slate-900 border-emerald-500/40 shadow-lg'
                    : 'bg-[#1a1c28] border-gray-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${
                        isMain
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-amber-400'
                      }`}
                    >
                      {slot.subPosition}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">
                          {slot.subPosition} ({slot.playStyle})
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          • {slot.position}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider ${getTierColor(
                            slot.tier
                          )}`}
                        >
                          {isMain
                            ? 'Main Position (Tier V)'
                            : `${tierConfig.label}: ${tierConfig.title}`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        {isMain
                          ? '100% Native Proficiency • Zero attribute penalties'
                          : tierConfig.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: OVR & Upgrade Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Position OVR</div>
                      <div
                        className={`text-xl font-black ${
                          isMain
                            ? 'text-emerald-400'
                            : slot.tier === 'IV'
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {slotOvr}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {slot.tier === 'V' || slot.tier === 'IV' ? 'OVR' : `(-${Math.round(tierConfig.penalty * 100)}%)`}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {isMain && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Native Main</span>
                      </div>
                    )}

                    {!isMain && slot.tier === 'IV' && (
                      <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Mastered (0% Penalty)</span>
                      </div>
                    )}

                    {!isMain && slot.tier !== 'IV' && (
                      <button
                        onClick={() => handleUpgrade(slot)}
                        disabled={needsPoints}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                          canUpgrade
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer active:scale-95 shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Upgrade to {tierConfig.nextTier}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            canUpgrade ? 'bg-black/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          10 pts
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Empty / Locked Slot
          const isUnlockableSlot = slotNumber <= maxPositionsCount;
          return (
            <div
              key={`empty_slot_${slotNumber}`}
              className="bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-slate-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400">
                    {t('POSITION_SLOT') || 'Position Slot'} #{slotNumber}{' '}
                    {isUnlockableSlot ? '(Unlockable)' : '(Tactical Reserve)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isUnlockableSlot
                      ? 'Unlocked when your manager requests you to play elsewhere in Unique Career'
                      : 'Tactical reserve slot'}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600">
                {isUnlockableSlot ? 'Awaiting Manager Event' : 'Locked'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Position Mastery Rules Card */}
      <div className="bg-[#1a1c28] border border-gray-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
        <h5 className="text-xs uppercase font-black text-white flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-amber-400" />
          {t('POSITION_TACTICAL_RULES') || 'Position Mastery & Tactical Rules'}
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-400 block font-bold">1. Stat Penalty Logic</strong>
            <span>
              At Tier I, non-physical attributes are reduced by 40%. At Tier II by 30%, Tier III by 15%, and at Tier IV 0%.
              Physical attributes (<strong className="text-white">Pace, Stamina, Strength</strong>) suffer NO penalties.
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block font-bold">2. Natural Main Position Promotion</strong>
            <span>
              If you hold another position at Tier IV and play 80%+ of matches in a single season at that position,
              you will receive an end-of-season prompt to make it your new permanent Main Position!
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block font-bold">3. Manager Request Event</strong>
            <span>
              Triggered if your team has a teammate rated 85+ at your current sub-position, and a weaker starter (&le;84)
              at a compatible position. Players can hold up to 4 positions maximum.
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-purple-400 block font-bold">4. Tactical Compatibility</strong>
            <span>
              Goalkeepers never play outfield. Attackers are never asked to play defense, and defenders never attack.
              Fullbacks and Wingers are exempt and can adapt to each other!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
