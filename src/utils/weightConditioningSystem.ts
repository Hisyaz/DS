import { PlayerCardData } from '../types';

export interface WeightConditioningInfo {
  idealWeight: number;
  currentWeight: number;
  excessKg: number;
  deficitKg: number;
  pacePenalty: number;
  staminaPenalty: number;
  isOverweight: boolean;
  isUnderweight: boolean;
  isOptimal: boolean;
  statusText: string;
  badgeColor: string;
}

/**
 * Calculates a footballer's ideal competitive weight:
 * Height (cm) - 100 = Ideal Weight (kg)
 * e.g., 180 cm -> 80 kg, 170 cm -> 70 kg, 160 cm -> 60 kg
 */
export function getIdealWeight(heightCm: number = 180): number {
  const safeHeight = typeof heightCm === 'number' && !isNaN(heightCm) && heightCm > 0 ? heightCm : 180;
  return Math.max(40, safeHeight - 100);
}

/**
 * Evaluates body composition and returns active pace and stamina debuffs:
 * Each kg over ideal weight applies -1 Stamina and -1 Pace.
 * Underweight players have no artificial debuffs.
 */
export function getWeightConditioning(player?: Partial<PlayerCardData> | null): WeightConditioningInfo {
  const heightCm = player?.heightCm && !isNaN(player.heightCm) ? player.heightCm : 180;
  const weightKg = player?.weightKg && !isNaN(player.weightKg) ? player.weightKg : 75;

  const idealWeight = getIdealWeight(heightCm);
  const diff = weightKg - idealWeight;
  const excessKg = Math.max(0, diff);
  const deficitKg = Math.max(0, -diff);

  const pacePenalty = excessKg * 1;
  const staminaPenalty = excessKg * 1;
  const isOverweight = excessKg > 0;
  const isUnderweight = deficitKg > 3;
  const isOptimal = excessKg === 0 && !isUnderweight;

  let statusText = '';
  let badgeColor = '';

  if (isOverweight) {
    statusText = `Overweight Penalty: -${pacePenalty} PAC, -${staminaPenalty} STA (+${excessKg} kg over ideal ${idealWeight} kg)`;
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';
  } else if (isOptimal) {
    statusText = `Optimal Athletic Weight (${weightKg} kg / Ideal: ${idealWeight} kg) · Full Athleticism`;
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else {
    statusText = `Lean Athletic Build (${weightKg} kg / Ideal: ${idealWeight} kg) · No Penalties`;
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  }

  return {
    idealWeight,
    currentWeight: weightKg,
    excessKg,
    deficitKg,
    pacePenalty,
    staminaPenalty,
    isOverweight,
    isUnderweight,
    isOptimal,
    statusText,
    badgeColor,
  };
}
