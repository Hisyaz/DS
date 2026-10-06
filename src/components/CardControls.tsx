import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  translateFoot,
  translatePosition,
  translatePlaystyle,
  translateSkinColor,
  translateHairColor,
  translateSpecialHair,
  translateHairLengthOption,
  translateHairStyleOption,
  translateFacialHairOption,
  translateKitPatternOption,
  translateAttributeName,
  translateAttributeAbbreviation,
} from '../utils/localizationSystem';
import { formatPersonName } from '../utils/originLastNameSystem';
import {
  PlayerCardData,
  PlayerStats,
  HairStyle,
  HairLength,
  FacialHairStyle,
  KitStyle,
  KitPattern,
  KitCollar,
  AccessoryType,
  NeckTattooType,
  ArmTattooType,
  FaceTattooType,
  EarringType,
  EarringMaterial,
  EarringGemColor,
  NecklaceType,
  EmblemShape,
  EmblemMode,
  OutfieldDetailedStats,
  GkDetailedStats,
  StoreUpgradeItem,
} from '../types';
import {
  NATIONALITIES,
  SKIN_COLORS,
  PALETTE_COLORS,
  HAIR_ROOT_COLORS,
  HAIR_DYE_COLORS,
  FACIAL_HAIR_STYLES,
  NECK_TATTOO_OPTIONS,
  ARM_TATTOO_OPTIONS,
  FACE_TATTOO_OPTIONS,
  EARRING_OPTIONS,
  EARRING_MATERIAL_OPTIONS,
  EARRING_GEM_OPTIONS,
  NECKLACE_OPTIONS,
  ACCESSORY_COLOR_OPTIONS,
} from '../constants';
import {
  POSITION_TAXONOMY,
  getSubPositionInfo,
  getPlayStyleDetail,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from '../utils/statCalculations';
import {
  getInfamyTierInfo,
  getBadFameDrawChancePercent,
} from '../utils/cardsCollectionSystem';
import {
  User,
  Dumbbell,
  Shirt,
  Shield,
  Sparkles,
  SlidersHorizontal,
  Award,
  Zap,
  AlertTriangle,
  Info,
  Lock,
  CheckCircle2,
  Globe2,
  Search,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  Layers,
} from 'lucide-react';

import { KitRenderer } from './KitRenderer';
import { PlayerEditorAllCardsPanel } from './PlayerEditorAllCardsPanel';
import { getLeagueDatabase } from '../utils/leagueDatabaseSystem';
import { LeagueDatabase, LeagueData, EditorTeamData } from '../types/leagueEditor';
import {
  CAREER_PERKS_REGISTRY,
  getPerkById,
  getActivePerks,
  ensurePlayerPerksSync,
  CareerPerk,
} from '../utils/perksSystem';
import { PerkIcon } from './PerkIcon';

interface CardControlsProps {
  player: PlayerCardData;
  onChange: (updated: PlayerCardData) => void;
  onRandomize: () => void;
  onReset: () => void;
  onConfirm?: () => void;
  onSaveAsLegend?: (player: PlayerCardData) => void;
  isEditorMode?: boolean;
  isCharacterConfirmed?: boolean;
  storeItems?: StoreUpgradeItem[];
  careerMode?: 'unique_career' | 'play_as_legend' | 'editor';
  leagueDb?: LeagueDatabase;
}

export const CardControls: React.FC<CardControlsProps> = ({
  player,
  onChange,
  onRandomize,
  onReset,
  onConfirm,
  onSaveAsLegend,
  isEditorMode = false,
  isCharacterConfirmed = false,
  storeItems = [],
  careerMode = 'unique_career',
  leagueDb,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'biometrics' | 'kit' | 'emblem' | 'stats' | 'perks' | 'all_cards'>('info');
  const [perkSearchQuery, setPerkSearchQuery] = useState('');
  const [perkSelectedCategory, setPerkSelectedCategory] = useState<string>('ALL');

  const activePerkIds = player.activePerkIds || [];

  const handleEquipPerk = (perkId: string) => {
    let newActive = [...activePerkIds];
    if (newActive.includes(perkId)) return;
    if (newActive.length >= 5) {
      newActive = [...newActive.slice(0, 4), perkId];
    } else {
      newActive.push(perkId);
    }
    onChange({
      ...player,
      activePerkIds: newActive,
      hasOutsideFootPerk: newActive.includes('outside_foot'),
      hasSnakePerk: newActive.includes('snake'),
    });
  };

  const handleUnequipPerk = (perkId: string) => {
    const newActive = activePerkIds.filter((id) => id !== perkId);
    onChange({
      ...player,
      activePerkIds: newActive,
      hasOutsideFootPerk: newActive.includes('outside_foot'),
      hasSnakePerk: newActive.includes('snake'),
    });
  };

  const handleClearAllPerks = () => {
    onChange({
      ...player,
      activePerkIds: [],
      hasOutsideFootPerk: false,
      hasSnakePerk: false,
    });
  };

  const handleEquipRandomPerks = () => {
    const shuffled = [...CAREER_PERKS_REGISTRY].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5).map((p) => p.id);
    onChange({
      ...player,
      activePerkIds: selected,
      hasOutsideFootPerk: selected.includes('outside_foot'),
      hasSnakePerk: selected.includes('snake'),
    });
  };

  // After character confirmation in career mode, Stats & OVR tab is moved into DEVELOPMENT
  useEffect(() => {
    if (isCharacterConfirmed && !isEditorMode) {
      setActiveTab((prev) => (prev === 'stats' || prev === 'perks' ? 'info' : prev));
    }
  }, [isCharacterConfirmed, isEditorMode]);
  const [statViewMode, setStatViewMode] = useState<'core' | 'categories'>('core');

  const isLegendaryPreset = Boolean(player.id && player.id !== 'prodigy' && !player.id.startsWith('prospect-'));

  // DATABASE TEAMS / LEAGUES SELECTION SYSTEM
  const db = leagueDb || getLeagueDatabase();

  const dbCountriesMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (Object.values(db.leagues) as LeagueData[]).forEach((l) => {
      if (l.countryCode && l.countryName) {
        map.set(l.countryCode, l.countryName);
      }
    });
    return map;
  }, [db]);

  const dbCountriesList = Array.from(dbCountriesMap.entries()).map(([code, name]) => ({
    code,
    name,
  }));

  const currentMatchingTeam = (Object.values(db.teams) as EditorTeamData[]).find(
    (t) => t.name.toLowerCase() === (player.club || '').toLowerCase()
  );
  const currentMatchingLeague = currentMatchingTeam
    ? db.leagues[currentMatchingTeam.leagueId]
    : (Object.values(db.leagues) as LeagueData[]).find(
        (l) => l.name.toLowerCase() === (player.league || '').toLowerCase()
      );

  const selectedCountryCode = currentMatchingLeague?.countryCode || dbCountriesList[0]?.code || 'ENG';
  const selectedLeagueId = currentMatchingLeague?.id || (Object.values(db.leagues) as LeagueData[]).find((l) => l.countryCode === selectedCountryCode)?.id || '';
  const selectedTeamId = currentMatchingTeam?.id || (Object.values(db.teams) as EditorTeamData[]).find((t) => t.leagueId === selectedLeagueId)?.id || '';

  const handleSelectCountry = (countryCode: string) => {
    const matchingLeague = (Object.values(db.leagues) as LeagueData[]).find((l) => l.countryCode === countryCode);
    if (!matchingLeague) return;
    const matchingTeam = (Object.values(db.teams) as EditorTeamData[]).find((t) => t.leagueId === matchingLeague.id);
    if (!matchingTeam) return;

    onChange({
      ...player,
      club: matchingTeam.name,
      clubId: matchingTeam.id,
      league: matchingLeague.name,
      clubCountry: matchingLeague.countryName,
      emblem: matchingTeam.emblem,
      kit: matchingTeam.kit,
    });
  };

  const handleSelectLeague = (leagueId: string) => {
    const targetLeague = db.leagues[leagueId];
    if (!targetLeague) return;
    const matchingTeam = (Object.values(db.teams) as EditorTeamData[]).find((t) => t.leagueId === targetLeague.id);
    if (!matchingTeam) return;

    onChange({
      ...player,
      club: matchingTeam.name,
      clubId: matchingTeam.id,
      league: targetLeague.name,
      clubCountry: targetLeague.countryName,
      emblem: matchingTeam.emblem,
      kit: matchingTeam.kit,
    });
  };

  const handleSelectTeam = (teamId: string) => {
    const targetTeam = db.teams[teamId];
    if (!targetTeam) return;
    const targetLeague = db.leagues[targetTeam.leagueId];
    if (!targetLeague) return;

    onChange({
      ...player,
      club: targetTeam.name,
      clubId: targetTeam.id,
      league: targetLeague.name,
      clubCountry: targetLeague.countryName,
      emblem: targetTeam.emblem,
      kit: targetTeam.kit,
    });
  };

  // Cosmetic Unlock Helpers
  const isCosmeticItemUnlocked = (type: string, value: string) => {
    if (isEditorMode) return true;
    if (!value || value === 'none' || value === 'clean-shaven') return true;
    return storeItems.some(
      (item) => item.cosmeticType === type && item.cosmeticValue === value && item.unlocked
    );
  };

  const isSpecialHairUnlocked = (specialHairType: string) => {
    if (isEditorMode) return true;
    return storeItems.some(
      (item) => item.specialHairType === specialHairType && item.unlocked
    );
  };

  const isCategoryUnlocked = (type: string) => {
    if (isEditorMode) return true;
    if (type === 'special_hair') {
      return storeItems.some((item) => item.category === 'special_hair' && item.unlocked);
    }
    return storeItems.some((item) => item.cosmeticType === type && item.unlocked);
  };

  // Sanitize locked cosmetics in New Game / Career mode
  useEffect(() => {
    if (isEditorMode) return;
    let needsUpdate = false;
    const updated = JSON.parse(JSON.stringify(player || {}));

    if (updated.biometrics?.hairDye && updated.biometrics.hairDye !== 'none') {
      if (!isCosmeticItemUnlocked('hair_dye', updated.biometrics.hairDye)) {
        updated.biometrics.hairDye = 'none';
        needsUpdate = true;
      }
    }

    if (updated.biometrics?.facialHair && updated.biometrics.facialHair !== 'none') {
      if (!isCosmeticItemUnlocked('facial_hair', updated.biometrics.facialHair)) {
        updated.biometrics.facialHair = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.accessory && updated.accessories.accessory !== 'none') {
      if (!isCosmeticItemUnlocked('headwear', updated.accessories.accessory)) {
        updated.accessories.accessory = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.necklace && updated.accessories.necklace !== 'none') {
      if (!isCosmeticItemUnlocked('necklace', updated.accessories.necklace)) {
        updated.accessories.necklace = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.earring && updated.accessories.earring !== 'none') {
      if (!isCosmeticItemUnlocked('earring', updated.accessories.earring)) {
        updated.accessories.earring = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.tattooNeck && updated.accessories.tattooNeck !== 'none' && updated.accessories.tattooNeck !== false) {
      const neckVal = typeof updated.accessories.tattooNeck === 'string' ? updated.accessories.tattooNeck : 'rose';
      if (!isCosmeticItemUnlocked('tattoo', neckVal)) {
        updated.accessories.tattooNeck = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.tattooArmL && updated.accessories.tattooArmL !== 'none' && updated.accessories.tattooArmL !== false) {
      const armLVal = typeof updated.accessories.tattooArmL === 'string' ? updated.accessories.tattooArmL : 'mandala-sleeve';
      if (!isCosmeticItemUnlocked('tattoo', armLVal)) {
        updated.accessories.tattooArmL = 'none';
        needsUpdate = true;
      }
    }

    if (updated.accessories?.tattooArmR && updated.accessories.tattooArmR !== 'none' && updated.accessories.tattooArmR !== false) {
      const armRVal = typeof updated.accessories.tattooArmR === 'string' ? updated.accessories.tattooArmR : 'mandala-sleeve';
      if (!isCosmeticItemUnlocked('tattoo', armRVal)) {
        updated.accessories.tattooArmR = 'none';
        needsUpdate = true;
      }
    }

    if (updated.biometrics?.hairLength === 'special' || updated.biometrics?.hairStyle === 'special') {
      const specHair = updated.biometrics.specialHair;
      if (!specHair || !isSpecialHairUnlocked(specHair)) {
        updated.biometrics.hairLength = 'short';
        updated.biometrics.hairStyle = 'straight';
        delete updated.biometrics.specialHair;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      onChange(updated);
    }
  }, [isEditorMode, storeItems, player]);

  // Stat zero warning disclaimer modal state
  const [hasSeenZeroDisclaimer, setHasSeenZeroDisclaimer] = useState<boolean>(false);
  const [showZeroDisclaimerModal, setShowZeroDisclaimerModal] = useState<boolean>(false);
  const [pendingStatAction, setPendingStatAction] = useState<(() => void) | null>(null);

  const updateField = (path: string, value: any) => {
    const copy: any = JSON.parse(JSON.stringify(player || {}));
    const parts = path.split('.');
    let current = copy;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    onChange(copy);
  };

  const handleNationalityChange = (val: string) => {
    const [code, iso] = val.split('|');
    const matched = NATIONALITIES.find((n) => n.code === code && n.iso === iso);
    if (matched) {
      const currentOthers = player.otherNationalities || player.extraNationalities || [];
      const updatedOthers = currentOthers.filter((n) => n.code !== matched.code);
      onChange({
        ...player,
        nationality: matched,
        otherNationalities: updatedOthers,
        extraNationalities: updatedOthers,
      });
    }
  };

  const handleAddOtherNationality = (val: string) => {
    const [code, iso] = val.split('|');
    const matched = NATIONALITIES.find((n) => n.code === code && n.iso === iso);
    if (!matched) return;
    if (player.nationality?.code === matched.code) return;

    const currentOthers = player.otherNationalities || player.extraNationalities || [];
    if (currentOthers.some((n) => n.code === matched.code)) return;

    const updatedOthers = [...currentOthers, matched];
    onChange({
      ...player,
      otherNationalities: updatedOthers,
      extraNationalities: updatedOthers,
    });
  };

  const handleRemoveOtherNationality = (code: string) => {
    const currentOthers = player.otherNationalities || player.extraNationalities || [];
    const updatedOthers = currentOthers.filter((n) => n.code !== code);
    onChange({
      ...player,
      otherNationalities: updatedOthers,
      extraNationalities: updatedOthers,
    });
  };

  // Determine active category based on current subPosition or position
  const currentSubInfo = getSubPositionInfo(player.subPosition || player.position || 'ST');
  const activeCategory = currentSubInfo.category;

  const handleCategoryChange = (catCode: 'ATT' | 'MID' | 'DEF' | 'GK') => {
    const catObj = POSITION_TAXONOMY.find((c) => c.category === catCode);
    if (!catObj || !catObj.subPositions.length) return;
    const defaultSub = catObj.subPositions[0];
    const defaultPlay = defaultSub.playStyles[0] || 'Balanced';

    const updatedStats = player.stats;
    const newOvr = calculateWeightedOvr(catCode, defaultSub.code, updatedStats, defaultPlay);

    onChange({
      ...player,
      position: catCode,
      subPosition: defaultSub.code,
      playStyle: defaultPlay,
      ovr: newOvr,
    });
  };

  const handleSubPositionChange = (subCode: string) => {
    const subInfo = getSubPositionInfo(subCode);
    const category = subInfo.category !== 'UNASSIGNED' ? subInfo.category : player.position || 'ATT';
    const validStyles = subInfo.playStyles || [];
    let nextPlayStyle = player.playStyle || validStyles[0] || 'Balanced';

    if (!validStyles.some((s) => s.toLowerCase() === nextPlayStyle.toLowerCase())) {
      nextPlayStyle = validStyles[0] || 'Balanced';
    }

    const newOvr = calculateWeightedOvr(category, subCode, player.stats, nextPlayStyle);

    onChange({
      ...player,
      position: category,
      subPosition: subCode,
      playStyle: nextPlayStyle,
      ovr: newOvr,
    });
  };

  const handlePlayStyleChange = (newStyle: string) => {
    const currentSub = player.subPosition || player.position || 'ST';
    const currentCat = player.position || 'ATT';
    const newOvr = calculateWeightedOvr(currentCat, currentSub, player.stats, newStyle);

    onChange({
      ...player,
      playStyle: newStyle,
      ovr: newOvr,
    });
  };

  const handleAutoCalcOvr = () => {
    const calculated = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || 'ST',
      player.stats,
      player.playStyle
    );
    updateField('ovr', calculated);
  };

  const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
  const outfieldDetailed = getOrCreateOutfieldDetailed(player.stats);
  const gkDetailed = getOrCreateGkDetailed(player.stats);
  const weightedOvr = calculateWeightedOvr(
    player.position || 'ST',
    player.subPosition || player.position || 'ST',
    player.stats,
    player.playStyle
  );

  const availableSubPositions = POSITION_TAXONOMY.find(
    (c) => c.category === activeCategory
  )?.subPositions || [];

  const availablePlayStyles =
    availableSubPositions.find((s) => s.code === (player.subPosition || player.position)?.toUpperCase())
      ?.playStyles || currentSubInfo.playStyles || [];

  // Point system logic for New Game (detailed 18 core stats or 7 GK stats)
  const outfieldSumSpent = Object.values(outfieldDetailed).reduce((sum, val) => sum + (val - 40), 0);
  const gkSumSpent = Object.values(gkDetailed).reduce((sum, val) => sum + (val - 40), 0);

  // Grant available attribute points from player's freeStatPoints pool (defaulting to 5 for new character)
  const basePointPool = player.freeStatPoints !== undefined ? player.freeStatPoints : (player.unassignedPoints !== undefined ? player.unassignedPoints : 5);
  const availablePoints = isGk ? Math.max(0, basePointPool - gkSumSpent) : Math.max(0, basePointPool - outfieldSumSpent);

  // 5 Stat Points Auto-Prompt Modal State
  const [showPointCompletionModal, setShowPointCompletionModal] = useState(false);
  const [hasDismissedPointModal, setHasDismissedPointModal] = useState(false);

  useEffect(() => {
    if (!isCharacterConfirmed && !isEditorMode && careerMode === 'unique_career') {
      const pointsSpent = isGk ? gkSumSpent : outfieldSumSpent;
      if (availablePoints === 0 && pointsSpent > 0) {
        if (!hasDismissedPointModal && !showPointCompletionModal) {
          setShowPointCompletionModal(true);
        }
      } else if (availablePoints > 0 && hasDismissedPointModal) {
        setHasDismissedPointModal(false);
      }
    }
  }, [
    availablePoints,
    isCharacterConfirmed,
    isEditorMode,
    careerMode,
    isGk,
    gkSumSpent,
    outfieldSumSpent,
    hasDismissedPointModal,
    showPointCompletionModal,
  ]);

  const handleDirectStrengthChange = (newStrength: number) => {
    const clampedStrength = Math.max(10, Math.min(120, newStrength));
    const updatedDetailed = { ...outfieldDetailed, strength: Math.min(99, clampedStrength) };
    const syncedStats = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || 'ST',
      syncedStats,
      player.playStyle
    );

    const updatedStatBreakStats = player.statBreakStats
      ? { ...player.statBreakStats, strength: clampedStrength }
      : clampedStrength >= 100
      ? { strength: clampedStrength }
      : undefined;

    onChange({
      ...player,
      biometrics: {
        ...player.biometrics,
        strength: clampedStrength,
      },
      stats: syncedStats,
      ovr: updatedOvr,
      ...(updatedStatBreakStats ? { statBreakStats: updatedStatBreakStats } : {}),
      ...(clampedStrength >= 100 ? { statBreakActive: true } : {}),
    });
  };

  const handleToggleStatBreak = (enable: boolean) => {
    if (enable) {
      onChange({
        ...player,
        statBreakActive: true,
      });
    } else {
      let updatedDetailed = { ...outfieldDetailed };
      (Object.keys(updatedDetailed) as (keyof OutfieldDetailedStats)[]).forEach((k) => {
        if (updatedDetailed[k] > 99) updatedDetailed[k] = 99;
      });
      let updatedGk = { ...gkDetailed };
      (Object.keys(updatedGk) as (keyof GkDetailedStats)[]).forEach((k) => {
        if (updatedGk[k] > 99) updatedGk[k] = 99;
      });
      const syncedStats = isGk
        ? syncCategoryStatsFromGkDetailed(player.stats, updatedGk)
        : syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
      const updatedOvr = Math.min(99, player.ovr);
      const updatedPot = Math.min(99, player.potentialOvr ?? player.ovr);
      onChange({
        ...player,
        statBreakActive: false,
        statBreakStats: undefined,
        stats: syncedStats,
        ovr: updatedOvr,
        potentialOvr: updatedPot,
      });
    }
  };

  const handleStatBreakAll = (val = 105) => {
    const newBreakStats: Record<string, number> = {};
    if (isGk) {
      const updatedGk = { ...gkDetailed };
      (Object.keys(updatedGk) as (keyof GkDetailedStats)[]).forEach((k) => {
        updatedGk[k] = val;
        newBreakStats[k] = val;
      });
      const synced = syncCategoryStatsFromGkDetailed(player.stats, updatedGk);
      onChange({
        ...player,
        statBreakActive: true,
        statBreakStats: newBreakStats,
        stats: synced,
        ovr: Math.min(115, Math.max(player.ovr, val)),
        potentialOvr: Math.min(115, Math.max(player.potentialOvr ?? 99, val)),
      });
    } else {
      const updatedDetailed = { ...outfieldDetailed };
      (Object.keys(updatedDetailed) as (keyof OutfieldDetailedStats)[]).forEach((k) => {
        updatedDetailed[k] = val;
        newBreakStats[k] = val;
      });
      const synced = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
      onChange({
        ...player,
        statBreakActive: true,
        statBreakStats: newBreakStats,
        stats: synced,
        biometrics: { ...player.biometrics, strength: val },
        ovr: Math.min(115, Math.max(player.ovr, val)),
        potentialOvr: Math.min(115, Math.max(player.potentialOvr ?? 99, val)),
      });
    }
  };

  const handleStatBreakPhysicals = (val = 110) => {
    const newBreakStats: Record<string, number> = { ...(player.statBreakStats || {}) };
    newBreakStats.pace = val;
    newBreakStats.stamina = val;
    newBreakStats.strength = val;
    const updatedDetailed = {
      ...outfieldDetailed,
      pace: val,
      stamina: val,
      strength: val,
    };
    const synced = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
    onChange({
      ...player,
      statBreakActive: true,
      statBreakStats: newBreakStats,
      stats: synced,
      biometrics: { ...player.biometrics, strength: val },
    });
  };

  const handleResetStatBreak = () => {
    handleToggleStatBreak(false);
  };

  const handleToggleSingleStatBreak = (statKey: string) => {
    if (isGk) {
      const current = gkDetailed[statKey as keyof GkDetailedStats] || 40;
      const target = current >= 100 ? 99 : 105;
      handleGkCoreChangeSlider(statKey as keyof GkDetailedStats, target);
    } else {
      const current = outfieldDetailed[statKey as keyof OutfieldDetailedStats] || 40;
      const target = current >= 100 ? 99 : 105;
      handleOutfieldCoreChangeSlider(statKey as keyof OutfieldDetailedStats, target);
    }
  };

  const handleOutfieldPointIncrement = (key: keyof OutfieldDetailedStats) => {
    if (availablePoints < 1) return;
    const currentVal = outfieldDetailed[key];
    if (currentVal >= 99) return;
    const updatedDetailed = { ...outfieldDetailed, [key]: currentVal + 1 };
    const syncedStats = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || 'ST',
      syncedStats,
      player.playStyle
    );
    const updatedBiometrics = key === 'strength' ? { ...player.biometrics, strength: updatedDetailed.strength } : player.biometrics;
    onChange({
      ...player,
      biometrics: updatedBiometrics,
      stats: syncedStats,
      ovr: updatedOvr,
    });
  };

  const handleOutfieldPointDecrement = (key: keyof OutfieldDetailedStats) => {
    const currentVal = outfieldDetailed[key];
    // Minimum stat floor of 40 enforced
    if (currentVal <= 40) return;
    const updatedDetailed = { ...outfieldDetailed, [key]: currentVal - 1 };
    const syncedStats = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || 'ST',
      syncedStats,
      player.playStyle
    );
    const updatedBiometrics = key === 'strength' ? { ...player.biometrics, strength: updatedDetailed.strength } : player.biometrics;
    onChange({
      ...player,
      biometrics: updatedBiometrics,
      stats: syncedStats,
      ovr: updatedOvr,
    });
  };

  const handleGkPointIncrement = (key: keyof GkDetailedStats) => {
    if (availablePoints < 1) return;
    const currentVal = gkDetailed[key];
    if (currentVal >= 99) return;
    const updatedDetailed = { ...gkDetailed, [key]: currentVal + 1 };
    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'GK',
      player.subPosition || 'GK',
      syncedStats,
      player.playStyle
    );
    onChange({
      ...player,
      stats: syncedStats,
      ovr: updatedOvr,
    });
  };

  const handleGkPointDecrement = (key: keyof GkDetailedStats) => {
    const currentVal = gkDetailed[key];
    // Minimum stat floor of 40 enforced
    if (currentVal <= 40) return;
    const updatedDetailed = { ...gkDetailed, [key]: currentVal - 1 };
    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'GK',
      player.subPosition || 'GK',
      syncedStats,
      player.playStyle
    );
    onChange({
      ...player,
      stats: syncedStats,
      ovr: updatedOvr,
    });
  };

  const handleOutfieldCoreChangeSlider = (key: keyof OutfieldDetailedStats, value: number) => {
    const updatedDetailed = { ...outfieldDetailed, [key]: value };
    const syncedStats = syncCategoryStatsFromDetailed(player.stats, updatedDetailed);
    const updatedOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || 'ST',
      syncedStats,
      player.playStyle
    );
    const updatedBiometrics = key === 'strength' ? { ...player.biometrics, strength: value } : player.biometrics;
    
    const updatedStatBreakStats = { ...(player.statBreakStats || {}) };
    if (value >= 100) {
      updatedStatBreakStats[key] = value;
    } else {
      delete updatedStatBreakStats[key];
    }
    const hasAnyBreak = Object.keys(updatedStatBreakStats).length > 0 || Boolean(player.statBreakActive);

    onChange({
      ...player,
      biometrics: updatedBiometrics,
      stats: syncedStats,
      ovr: updatedOvr,
      statBreakStats: Object.keys(updatedStatBreakStats).length > 0 ? updatedStatBreakStats : undefined,
      statBreakActive: hasAnyBreak,
    });
  };

  const handleGkCoreChangeSlider = (key: keyof GkDetailedStats, value: number) => {
    const updatedGk = { ...gkDetailed, [key]: value };
    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, updatedGk);
    const updatedOvr = calculateWeightedOvr('GK', 'GK', syncedStats, player.playStyle);
    
    const updatedStatBreakStats = { ...(player.statBreakStats || {}) };
    if (value >= 100) {
      updatedStatBreakStats[key] = value;
    } else {
      delete updatedStatBreakStats[key];
    }
    const hasAnyBreak = Object.keys(updatedStatBreakStats).length > 0 || Boolean(player.statBreakActive);

    onChange({
      ...player,
      stats: syncedStats,
      ovr: updatedOvr,
      statBreakStats: Object.keys(updatedStatBreakStats).length > 0 ? updatedStatBreakStats : undefined,
      statBreakActive: hasAnyBreak,
    });
  };

  return (
    <div className="w-full text-white space-y-6">
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          {isEditorMode ? t('NAV_PLAYER_EDITOR') : isCharacterConfirmed ? t('PLAYER_PROFILE_CUSTOMIZER') : t('SECTION_CHARACTER_CREATION')}
        </h3>
        {!isCharacterConfirmed && (
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
                {t('BTN_CONFIRM')}
              </button>
            )}
            <button
              type="button"
              onClick={onRandomize}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              {t('BTN_RANDOM_PROSPECT')}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              {t('BTN_RESET')}
            </button>
          </div>
        )}
      </div>

      {/* CHARACTER CREATION MODE (3 INDEPENDENT SECTIONS ON ONE RESPONSIVE PAGE) */}
      {!isCharacterConfirmed && !isEditorMode ? (
        <div className="space-y-6">
          {/* SECTION 1 — PLAYER INFO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <User className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t('SECTION_PLAYER_INFO')}
              </h2>
            </div>

            {isLegendaryPreset && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300 text-xs flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-400 block">{t('LEGEND_PRESET_LOCKED')}</span>
                  <span className="text-[11px] text-slate-400">
                    {t('LEGEND_PRESET_DESC')}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* FIRST NAME / PLAYER NAME */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between text-xs">
                  <span>
                    {player.equippedParentCard ? t('FIRST_NAME') : t('PLAYER_NAME_FIRST_NAME')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {((player.equippedParentCard ? (player.firstName || player.name) : (player.firstName || player.name)) || '').length}/12
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={
                    player.equippedParentCard
                      ? player.firstName || player.name
                      : player.firstName || player.name
                  }
                  disabled={isLegendaryPreset}
                  onChange={(e) => {
                    const rawVal = e.target.value.slice(0, 16);
                    const formattedFirst = formatPersonName(rawVal);
                    if (player.equippedParentCard) {
                      const activeLastName = formatPersonName(player.lastName || player.familyName || player.equippedParentCard.familyName || 'González');
                      const suffix = player.nameSuffix || (player.isBrazilHeritage ? 'Jr.' : '');
                      const cleanFirst = formattedFirst.trim() || 'Mateo';
                      const fullName = suffix ? `${cleanFirst} ${activeLastName} ${suffix}`.trim() : `${cleanFirst} ${activeLastName}`.trim();
                      onChange({
                        ...player,
                        firstName: formattedFirst,
                        name: fullName,
                      });
                    } else {
                      onChange({
                        ...player,
                        name: formattedFirst,
                        firstName: formattedFirst,
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Mateo"
                />
              </div>

              {/* LAST NAME (LOCKED) */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between text-xs">
                  <span>{t('LAST_NAME') || 'Last Name'}</span>
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {t('LOCKED') || 'Locked'}
                  </span>
                </label>
                <div className="w-full bg-slate-900/90 border border-slate-800 text-slate-400 rounded-lg px-3 py-2.5 text-xs font-semibold flex items-center justify-between min-h-[38px]">
                  <span className="truncate">
                    {player.equippedParentCard || player.familyName
                      ? (player.familyName || player.equippedParentCard?.familyName)
                      : (t('LAST_NAME_ASSIGNED_LATER') || 'Last Name is assigned later on')}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-2" />
                </div>
              </div>
            </div>

            {player.equippedParentCard ? (
              <div className="mt-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                <span>{t('FULL_IDENTITY')}: <strong className="text-white">{player.name}</strong></span>
                <span className="text-[10px] text-slate-400 font-mono">[{player.familyIdentity || player.equippedParentCard.familyDisplay}]</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 block">
                {t('FAMILY_NAME_ASSIGNED_BY_PARENT')}
              </span>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>{t('NATIONALITY')}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{t('ASSIGNED_AT_ORIGIN_CITY')}</span>
                </label>
                <div className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg px-3 py-2.5 text-xs font-medium">
                  {t('SELECTED_LATER_ORIGIN')}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>{t('STRONG_FOOT')}</span>
                  {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                </label>
                <select
                  value={player.preferredFoot || 'Right'}
                  disabled={isLegendaryPreset}
                  onChange={(e) => updateField('preferredFoot', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Right">{translateFoot('Right')}</option>
                  <option value="Left">{translateFoot('Left')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 — APPEARANCE */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Dumbbell className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t('SECTION_APPEARANCE')}
              </h2>
            </div>

            {isLegendaryPreset && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300 text-xs flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-400 block">{t('APPEARANCE_LOCKED')}</span>
                  <span className="text-[11px] text-slate-400">
                    {t('APPEARANCE_LOCKED_DESC')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>{t('SKIN_TONE')}</span>
                  {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                </label>
                <select
                  value={player.biometrics.skinColor}
                  disabled={isLegendaryPreset}
                  onChange={(e) => updateField('biometrics.skinColor', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {SKIN_COLORS.map((sk) => (
                    <option key={sk.hex} value={sk.hex}>
                      {translateSkinColor(sk.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hair Controls */}
              {(() => {
                const isSpecialSelected =
                  player.biometrics.hairLength === 'special' || player.biometrics.hairStyle === 'special';
                const specialHairCategoryUnlocked = isCategoryUnlocked('special_hair');

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                          <span>{t('HAIR_LENGTH')}</span>
                          {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                        </label>
                        <select
                          value={player.biometrics.hairLength}
                          disabled={isLegendaryPreset}
                          onChange={(e) => {
                            const newLen = e.target.value as HairLength;
                            updateField('biometrics.hairLength', newLen);
                            if (newLen === 'special') {
                              updateField('biometrics.hairStyle', 'special');
                              const firstUnlocked = storeItems?.find(
                                (i) => i.category === 'special_hair' && i.unlocked
                              )?.specialHairType;
                              if (firstUnlocked && !player.biometrics.specialHair) {
                                updateField('biometrics.specialHair', firstUnlocked);
                              }
                            } else if (player.biometrics.hairStyle === 'special') {
                              updateField('biometrics.hairStyle', 'straight');
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="shaved">{translateHairLengthOption('Bald')}</option>
                          <option value="fade">{translateHairStyleOption('Fade')}</option>
                          <option value="short">{translateHairLengthOption('Short')}</option>
                          <option value="medium">{translateHairLengthOption('Medium')}</option>
                          <option value="long">{translateHairLengthOption('Long')}</option>
                          <option value="special" disabled={!isEditorMode && !specialHairCategoryUnlocked}>
                            {t('SPECIAL_HAIR_CATEGORY')} {!specialHairCategoryUnlocked && !isEditorMode ? '🔒' : ''}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                          <span>{t('HAIR_STYLE')}</span>
                          {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                        </label>
                        <select
                          value={
                            player.biometrics.hairLength === 'shaved'
                              ? 'straight'
                              : player.biometrics.hairStyle
                          }
                          disabled={
                            isLegendaryPreset ||
                            player.biometrics.hairLength === 'shaved' ||
                            player.biometrics.hairLength === 'special'
                          }
                          onChange={(e) => updateField('biometrics.hairStyle', e.target.value as HairStyle)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="straight">{translateHairStyleOption('Straight')}</option>
                          <option value="wavy">{translateHairStyleOption('Flow')}</option>
                          <option value="curly">{translateHairStyleOption('Quiff')}</option>
                          <option value="braided">{translateHairStyleOption('Braids')}</option>
                          <option value="dreads">{translateHairStyleOption('Dreadlocks')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Special Hair Preset if selected */}
                    {isSpecialSelected && (
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                          <span>{t('SPECIAL_ICONIC_HAIRSTYLE')}</span>
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                            ⭐ {t('SPECIAL')}
                          </span>
                        </label>
                        <select
                          value={player.biometrics.specialHair || ''}
                          disabled={isLegendaryPreset}
                          onChange={(e) => updateField('biometrics.specialHair', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>-- Select Special Haircut --</option>
                          {[
                            { id: 'cucurella-afro', name: 'Voluminous Long Afro' },
                            { id: 'messi-flow', name: 'Classic Flow 2000s' },
                            { id: 'puyol-curly', name: 'Spanish Lion (T5)' },
                            { id: 'neymar-mohawk', name: 'Brazilian Youngstar (T5)' },
                            { id: 'r9-2002', name: 'Phenomenal Hair (T5)' },
                          ].map((sh) => {
                            const unlocked = isSpecialHairUnlocked(sh.id);
                            const translatedName = translateSpecialHair(sh.id);
                            return (
                              <option key={sh.id} value={sh.id} disabled={!unlocked && !isEditorMode}>
                                {unlocked || isEditorMode ? translatedName : `🔒 ${translatedName}`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {/* Natural Hair Color */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                        <span>{t('NATURAL_HAIR_COLOR')}</span>
                        {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                        {isSpecialSelected && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                            <Lock className="w-3 h-3" /> {t('PRESET_HAIR')}
                          </span>
                        )}
                      </label>
                      <select
                        value={player.biometrics.hairRoot}
                        disabled={isLegendaryPreset || isSpecialSelected}
                        onChange={(e) => updateField('biometrics.hairRoot', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {HAIR_ROOT_COLORS.map((hr) => (
                          <option key={hr.hex} value={hr.hex}>
                            {translateHairColor(hr.name)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kit Fit & Sleeves */}
                    <div className="border-t border-slate-800 pt-3">
                      <label className="block text-slate-400 mb-1 font-medium text-xs">
                        Shirt Fit & Sleeves Style
                      </label>
                      <select
                        value={player.kit.style}
                        onChange={(e) => updateField('kit.style', e.target.value as KitStyle)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer font-semibold"
                      >
                        <option value="normal">Standard Athletic Fit (Normal): Mid-bicep sleeves</option>
                        <option value="loose">Classic Retro Loose (Loose): Elbow-level draped sleeves</option>
                        <option value="tight">Pro Compression (Tight): High-cut lifted sleeves</option>
                      </select>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* SECTION 3 — DEVELOPMENT */}
          <div id="development-section" className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {t('SECTION_DEVELOPMENT')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {availablePoints > 0 ? (
                  <span className="px-2.5 py-1 bg-white text-slate-900 font-bold text-[11px] rounded-lg shadow-sm">
                    {availablePoints} {t('POINTS_AVAILABLE')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 font-semibold text-[11px] rounded-lg">
                    {t('ALL_POINTS_ASSIGNED')}
                  </span>
                )}
              </div>
            </div>

            {/* Position & Playstyle Selection only in Editor Mode */}
            {isEditorMode && (
              <div className="space-y-3 text-xs border-b border-slate-800 pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{t('POSITION_CATEGORY')}</label>
                    <select
                      value={activeCategory}
                      onChange={(e) => handleCategoryChange(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer font-semibold"
                    >
                      {POSITION_TAXONOMY.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.categoryLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{t('SUB_POSITION')}</label>
                    <select
                      value={(player.subPosition || player.position || 'ST').toUpperCase()}
                      onChange={(e) => handleSubPositionChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer font-bold text-white"
                    >
                      {availableSubPositions.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{t('PLAYSTYLE')}</label>
                  <select
                    value={player.playStyle || availablePlayStyles[0] || 'Balanced'}
                    onChange={(e) => handlePlayStyleChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-500 outline-none cursor-pointer font-medium"
                  >
                    {availablePlayStyles.map((ps) => (
                      <option key={ps} value={ps}>
                        {ps}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* OVR & Potential Display */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('CURRENT_OVR')}</span>
                  <span className="text-lg font-bold text-white">{player.ovr}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('POTENTIAL_POT')}</span>
                  <span className="text-lg font-bold text-white">{player.potentialOvr || 80}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('POSITION_OVR')}</span>
                  <span className="text-lg font-bold text-white">
                    {player.position === 'UNSELECTED' || player.position === 'UNASSIGNED' || !player.position ? t('UNASSIGNED') : weightedOvr}
                  </span>
                </div>
              </div>

              {/* STAT POINT DISTRIBUTION CONTROLS - ORGANIZED MINIMALIST LIST */}
              <div className="space-y-3 pt-2">
                {!isGk ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        cat: `${translateAttributeName('physical', currentLanguage)} (${translateAttributeAbbreviation('physical', currentLanguage)})`,
                        stats: [
                          { label: translateAttributeName('pace', currentLanguage), key: 'pace' as const },
                          { label: translateAttributeName('stamina', currentLanguage), key: 'stamina' as const },
                          { label: translateAttributeName('strength', currentLanguage), key: 'strength' as const },
                        ],
                      },
                      {
                        cat: `${t('Progression')} (${t('PRO')})`,
                        stats: [
                          { label: translateAttributeName('ballControl', currentLanguage), key: 'ballControl' as const },
                          { label: translateAttributeName('retention', currentLanguage), key: 'retention' as const },
                          { label: translateAttributeName('dribbling', currentLanguage), key: 'dribbling' as const },
                        ],
                      },
                      {
                        cat: `${translateAttributeName('passing', currentLanguage)} (${translateAttributeAbbreviation('passing', currentLanguage)})`,
                        stats: [
                          { label: translateAttributeName('shortPass', currentLanguage), key: 'shortPass' as const },
                          { label: translateAttributeName('longPass', currentLanguage), key: 'longPass' as const },
                          { label: translateAttributeName('crossing', currentLanguage), key: 'crossing' as const },
                        ],
                      },
                      {
                        cat: `${translateAttributeName('shooting', currentLanguage)} (${translateAttributeAbbreviation('shooting', currentLanguage)})`,
                        stats: [
                          { label: translateAttributeName('shooting', currentLanguage), key: 'shooting' as const },
                          { label: translateAttributeName('heading', currentLanguage), key: 'heading' as const },
                          { label: translateAttributeName('longShots', currentLanguage), key: 'longShots' as const },
                        ],
                      },
                      {
                        cat: `${translateAttributeName('defending', currentLanguage)} (${translateAttributeAbbreviation('defending', currentLanguage)})`,
                        stats: [
                          { label: translateAttributeName('tackling', currentLanguage), key: 'tackling' as const },
                          { label: translateAttributeName('marking', currentLanguage), key: 'marking' as const },
                          { label: translateAttributeName('interceptions', currentLanguage), key: 'interceptions' as const },
                        ],
                      },
                      {
                        cat: `${t('Mental')} (${t('MEN')})`,
                        stats: [
                          { label: translateAttributeName('positioning', currentLanguage), key: 'positioning' as const },
                          { label: translateAttributeName('composure', currentLanguage), key: 'composure' as const },
                          { label: translateAttributeName('reactions', currentLanguage), key: 'reactions' as const },
                        ],
                      },
                    ].map((section) => (
                      <div key={section.cat} className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800 flex items-center justify-between">
                          <span>{section.cat}</span>
                        </div>
                        <div className="space-y-1.5">
                          {section.stats.map((s) => {
                            const val = outfieldDetailed[s.key];
                            const canInc = availablePoints > 0 && val < 99;
                            const canDec = val > 40;
                            return (
                              <div key={s.key} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 transition-colors">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-300 font-medium">{s.label}</span>
                                  {val > 40 && (
                                    <span className="text-[10px] text-slate-500 font-mono">+{val - 40}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white w-6 text-right font-mono">{val}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOutfieldPointDecrement(s.key)}
                                      disabled={!canDec}
                                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOutfieldPointIncrement(s.key)}
                                      disabled={!canInc}
                                      className="w-6 h-6 rounded bg-white hover:bg-slate-100 disabled:opacity-20 text-slate-900 font-bold text-xs flex items-center justify-center transition cursor-pointer shadow-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* GK Stat Allocation */
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                      {t('Goalkeeper Attributes')}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: `${translateAttributeName('saving', currentLanguage)} (${translateAttributeAbbreviation('saving', currentLanguage)})`, key: 'saving' as const },
                        { label: `${translateAttributeName('reflexes', currentLanguage)} (${translateAttributeAbbreviation('reflexes', currentLanguage)})`, key: 'reflexes' as const },
                        { label: `${translateAttributeName('handling', currentLanguage)} (${translateAttributeAbbreviation('handling', currentLanguage)})`, key: 'handling' as const },
                        { label: `${translateAttributeName('positioning', currentLanguage)} (${translateAttributeAbbreviation('positioning', currentLanguage)})`, key: 'positioning' as const },
                        { label: `${translateAttributeName('aerialReach', currentLanguage)} (${translateAttributeAbbreviation('aerialReach', currentLanguage)})`, key: 'aerialReach' as const },
                        { label: `${translateAttributeName('oneOnOne', currentLanguage)} (${translateAttributeAbbreviation('oneOnOne', currentLanguage)})`, key: 'oneOnOne' as const },
                        { label: `${translateAttributeName('distribution', currentLanguage)} (${translateAttributeAbbreviation('distribution', currentLanguage)})`, key: 'distribution' as const },
                      ].map((item) => {
                        const val = gkDetailed[item.key];
                        const canInc = availablePoints > 0 && val < 99;
                        const canDec = val > 40;
                        return (
                          <div key={item.key} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                              {val > 40 && (
                                <span className="text-[10px] text-slate-500 font-mono">+{val - 40}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white w-6 text-right font-mono">{val}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleGkPointDecrement(item.key)}
                                  disabled={!canDec}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGkPointIncrement(item.key)}
                                  disabled={!canInc}
                                  className="w-6 h-6 rounded bg-white hover:bg-slate-100 disabled:opacity-20 text-slate-900 font-bold text-xs flex items-center justify-center transition cursor-pointer shadow-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EDITOR MODE OR CONFIRMED TAB VIEW */
        <div className="space-y-4">
          {/* Tabs for Editor Mode */}
          <div className="flex overflow-x-auto gap-1 bg-[#121216] p-1 rounded-lg mb-4 text-xs font-medium no-scrollbar">
            {(isEditorMode
              ? [
                  { id: 'info', label: 'Player Info', icon: User },
                  { id: 'biometrics', label: 'Appearance', icon: Dumbbell },
                  { id: 'kit', label: 'Kit Design', icon: Shirt },
                  { id: 'emblem', label: 'Crest & Badge', icon: Shield },
                  { id: 'stats', label: 'Stats & OVR', icon: SlidersHorizontal },
                  { id: 'perks', label: 'Perks', icon: Sparkles },
                  { id: 'all_cards', label: 'All Cards', icon: Layers },
                ]
              : [
                  { id: 'info', label: 'Player Info', icon: User },
                  { id: 'biometrics', label: 'Appearance', icon: Dumbbell },
                ]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

      {/* TAB 1: PLAYER INFO */}
      {activeTab === 'info' && (
        <div className="space-y-4 text-xs">
          {isLegendaryPreset && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-amber-200 text-xs flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300 block">Legendary Preset Locked</span>
                <span className="text-[11px] text-amber-300/80">
                  Name, nationality, strong foot, and biometrics are fixed for legendary stars to maintain authentic identity.
                </span>
              </div>
            </div>
          )}

          {/* PLAYER NAME SECTION (FIRST, LAST, DISPLAY IN EDITOR MODE) */}
          {isEditorMode ? (
            <div className="space-y-3 bg-[#181820] p-3.5 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 border-b border-gray-800 pb-2">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <User className="w-4 h-4 text-blue-400" />
                  Player Identity & Names
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Editor Mode</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    value={player.firstName || ''}
                    disabled={isLegendaryPreset}
                    onChange={(e) => {
                      const fName = formatPersonName(e.target.value);
                      const lName = formatPersonName(player.familyName || player.lastName || '');
                      const full = lName ? `${fName} ${lName}`.trim() : fName;
                      onChange({
                        ...player,
                        firstName: fName,
                        name: full ? formatPersonName(full) : player.name,
                      });
                    }}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold disabled:opacity-50"
                    placeholder="Mateo"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Last Name / Family Name</label>
                  <input
                    type="text"
                    value={player.familyName || player.lastName || ''}
                    disabled={isLegendaryPreset}
                    onChange={(e) => {
                      const lName = formatPersonName(e.target.value);
                      const fName = formatPersonName(player.firstName || '');
                      const full = fName ? `${fName} ${lName}`.trim() : lName;
                      onChange({
                        ...player,
                        familyName: lName,
                        lastName: lName,
                        name: full ? formatPersonName(full) : player.name,
                      });
                    }}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold disabled:opacity-50"
                    placeholder="González"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                  <span>Display Card Name</span>
                  {isLegendaryPreset && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={player.name}
                  disabled={isLegendaryPreset}
                  onChange={(e) => updateField('name', formatPersonName(e.target.value))}
                  className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                  placeholder="New Prodigy"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                <span>Player Name</span>
                {isLegendaryPreset && (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </label>
              <input
                type="text"
                value={player.name}
                disabled={isLegendaryPreset}
                onChange={(e) => updateField('name', formatPersonName(e.target.value))}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                placeholder="New Prodigy"
              />
            </div>
          )}

          {!isEditorMode ? (
            /* NEW GAME MODE: Simplified Player Info fields */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {careerMode !== 'unique_career' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Main Nationality</span>
                        {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                      </label>
                      <select
                        value={`${player.nationality?.code || ''}|${player.nationality?.iso || ''}`}
                        disabled={isLegendaryPreset}
                        onChange={(e) => handleNationalityChange(e.target.value)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        {NATIONALITIES.map((n) => (
                          <option key={`${n.code}-${n.iso}`} value={`${n.code}|${n.iso}`}>
                            {n.name} ({n.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Other Nationalities Manager */}
                    <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                        <span className="flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Other Nationalities</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({(player.otherNationalities || player.extraNationalities || []).length})
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(player.otherNationalities || player.extraNationalities || []).map((nat) => (
                          <span
                            key={nat.code}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2a2a32] border border-gray-700 rounded-lg text-xs font-semibold text-white shadow-xs"
                          >
                            <img
                              src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                              alt={nat.code}
                              className="w-4 h-2.5 object-cover rounded-[2px]"
                              referrerPolicy="no-referrer"
                            />
                            <span>{nat.name}</span>
                            <button
                              type="button"
                              disabled={isLegendaryPreset}
                              onClick={() => handleRemoveOtherNationality(nat.code)}
                              className="text-gray-400 hover:text-red-400 font-bold ml-1 cursor-pointer transition-colors"
                              title="Remove nationality"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {(!player.otherNationalities || player.otherNationalities.length === 0) && (
                          <span className="text-[11px] text-gray-500 italic">No secondary nationalities added</span>
                        )}
                      </div>

                      {!isLegendaryPreset && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddOtherNationality(e.target.value);
                            }
                          }}
                          className="w-full bg-[#2a2a32] border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                          <option value="">+ Add Secondary Nationality...</option>
                          {NATIONALITIES.filter(
                            (n) =>
                              n.code !== player.nationality?.code &&
                              !(player.otherNationalities || player.extraNationalities || []).some((on) => on.code === n.code)
                          ).map((n) => (
                            <option key={`add-${n.code}-${n.iso}`} value={`${n.code}|${n.iso}`}>
                              {n.name} ({n.code})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Nationality</span>
                      <span className="text-[10px] text-amber-400 font-bold">Assigned at Origin City</span>
                    </label>
                    <div className="w-full bg-[#1e1e24] border border-gray-700/80 text-amber-300/80 rounded-lg px-3 py-2 text-xs font-medium">
                      📍 Selected later with Starting City
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                    <span>Strong Foot</span>
                    {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                  </label>
                  <select
                    value={player.preferredFoot || 'Right'}
                    disabled={isLegendaryPreset}
                    onChange={(e) => updateField('preferredFoot', e.target.value)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-950/60 border border-blue-500/30 rounded-xl p-3 text-blue-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-300">
                  <Info className="w-4 h-4 text-blue-400" />
                  Prospect Gameplay Notice
                </div>
                <p className="text-[11px] text-blue-300/80 leading-relaxed">
                  Position, sub-position, playstyle, height, weight, age, and club squad will be selected later during gameplay as your 10yo prospect develops in the Youth Academy.
                </p>
              </div>
            </div>
          ) : (
            /* EDITOR MODE: Full Controls */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Position Category</label>
                  <select
                    value={activeCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-semibold text-blue-300"
                  >
                    {POSITION_TAXONOMY.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.categoryLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Sub-Position</label>
                  <select
                    value={(player.subPosition || player.position || 'ST').toUpperCase()}
                    onChange={(e) => handleSubPositionChange(e.target.value)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-bold text-white"
                  >
                    {availableSubPositions.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Playstyle</label>
                <select
                  value={player.playStyle || availablePlayStyles[0] || 'Balanced'}
                  onChange={(e) => handlePlayStyleChange(e.target.value)}
                  className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium text-emerald-300"
                >
                  {availablePlayStyles.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>

                {(() => {
                  const currentSubCode = (player.subPosition || player.position || 'ST').toUpperCase();
                  const psDetail = getPlayStyleDetail(currentSubCode, player.playStyle || availablePlayStyles[0] || 'Balanced');
                  if (!psDetail) return null;
                  return (
                    <div className="mt-2 p-2.5 bg-[#1a1a22] border border-emerald-500/30 rounded-lg text-[11px] space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center justify-between">
                        <span>{psDetail.name} Playstyle</span>
                        <span className="text-[10px] text-gray-400 font-normal">Filtered by {currentSubCode}</span>
                      </div>
                      <p className="text-gray-300 leading-snug">{psDetail.description}</p>
                      <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-gray-400 border-t border-gray-800">
                        <span>⭐ <strong className="text-gray-200">Modern:</strong> {psDetail.modernExample}</span>
                        <span>🏆 <strong className="text-amber-300">Legend:</strong> {psDetail.legendExample}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Overall (OVR)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="10"
                      max="99"
                      value={player.ovr}
                      onChange={(e) => updateField('ovr', parseInt(e.target.value) || 35)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-400"
                    />
                    <button
                      type="button"
                      onClick={handleAutoCalcOvr}
                      title="Auto-calculate OVR based on position weights"
                      className="px-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Potential (POT)</label>
                  <input
                    type="number"
                    min="10"
                    max="99"
                    value={player.potentialOvr ?? Math.min(99, Math.max(player.ovr, player.ovr + 4))}
                    onChange={(e) => updateField('potentialOvr', parseInt(e.target.value) || player.ovr)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Age</label>
                  <input
                    type="number"
                    min="15"
                    max="45"
                    value={player.age}
                    onChange={(e) => updateField('age', parseInt(e.target.value) || 16)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* SYNCHRONIZED DATABASE TEAM SELECTION CARD (COUNTRY -> LEAGUE -> TEAM) */}
              <div className="bg-[#12131c] p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-300 border-b border-gray-800 pb-2">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Team & League Database Selection
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Country → League → Team</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Country Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">1. Country</label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => handleSelectCountry(e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {dbCountriesList.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. League Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">2. League</label>
                    <select
                      value={selectedLeagueId}
                      onChange={(e) => handleSelectLeague(e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {(Object.values(db.leagues) as LeagueData[])
                        .filter((l) => l.countryCode === selectedCountryCode)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 3. Team Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">3. Team / Club</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => handleSelectTeam(e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {(Object.values(db.teams) as EditorTeamData[])
                        .filter((t) => t.leagueId === selectedLeagueId)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Custom Team / Club Direct Inputs in Editor Mode */}
                {isEditorMode && (
                  <div className="pt-2.5 border-t border-gray-800/80 space-y-2">
                    <div className="text-[11px] font-bold text-gray-300">Custom Club & League Override:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Club Name</label>
                        <input
                          type="text"
                          value={player.club || ''}
                          onChange={(e) => updateField('club', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          placeholder="e.g. Real Madrid"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">League</label>
                        <input
                          type="text"
                          value={player.league || ''}
                          onChange={(e) => updateField('league', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          placeholder="e.g. La Liga"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Country</label>
                        <input
                          type="text"
                          value={player.clubCountry || ''}
                          onChange={(e) => updateField('clubCountry', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          placeholder="e.g. Spain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Team Kit Visual Summary */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Assigned Club:</span>
                    <span className="font-extrabold text-white">{player.club}</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded font-mono">
                      {player.league} ({player.clubCountry})
                    </span>
                  </div>
                </div>
              </div>

              {(isEditorMode || careerMode !== 'unique_career') && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Main Nationality</span>
                      {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                    </label>
                    <select
                      value={`${player.nationality?.code || ''}|${player.nationality?.iso || ''}`}
                      disabled={isLegendaryPreset}
                      onChange={(e) => handleNationalityChange(e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      {NATIONALITIES.map((n) => (
                        <option key={`${n.code}-${n.iso}`} value={`${n.code}|${n.iso}`}>
                          {n.name} ({n.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Other Nationalities Manager */}
                  <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Other Nationalities</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ({(player.otherNationalities || player.extraNationalities || []).length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(player.otherNationalities || player.extraNationalities || []).map((nat) => (
                        <span
                          key={nat.code}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2a2a32] border border-gray-700 rounded-lg text-xs font-semibold text-white shadow-xs"
                        >
                          <img
                            src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                            alt={nat.code}
                            className="w-4 h-2.5 object-cover rounded-[2px]"
                            referrerPolicy="no-referrer"
                          />
                          <span>{nat.name}</span>
                          <button
                            type="button"
                            disabled={isLegendaryPreset}
                            onClick={() => handleRemoveOtherNationality(nat.code)}
                            className="text-gray-400 hover:text-red-400 font-bold ml-1 cursor-pointer transition-colors"
                            title="Remove nationality"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {(!player.otherNationalities || player.otherNationalities.length === 0) && (
                        <span className="text-[11px] text-gray-500 italic">No secondary nationalities added</span>
                      )}
                    </div>

                    {!isLegendaryPreset && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddOtherNationality(e.target.value);
                          }
                        }}
                        className="w-full bg-[#2a2a32] border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="">+ Add Secondary Nationality...</option>
                        {NATIONALITIES.filter(
                          (n) =>
                            n.code !== player.nationality?.code &&
                            !(player.otherNationalities || player.extraNationalities || []).some((on) => on.code === n.code)
                        ).map((n) => (
                          <option key={`add-${n.code}-${n.iso}`} value={`${n.code}|${n.iso}`}>
                            {n.name} ({n.code})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                    <span>Strong Foot</span>
                    {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                  </label>
                  <select
                    value={player.preferredFoot || 'Right'}
                    disabled={isLegendaryPreset}
                    onChange={(e) => updateField('preferredFoot', e.target.value)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Weak Foot</label>
                  <select
                    value={player.weakFootStars || 3}
                    onChange={(e) => updateField('weakFootStars', parseInt(e.target.value) || 3)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <option key={stars} value={stars}>
                        {stars} ★
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Height (cm)</label>
                  <input
                    type="number"
                    min="150"
                    max="210"
                    value={player.heightCm || 180}
                    onChange={(e) => updateField('heightCm', parseInt(e.target.value) || 180)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-400 font-medium">Weight (kg)</label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Ideal: {Math.max(40, (player.heightCm || 180) - 100)} kg
                    </span>
                  </div>
                  <input
                    type="number"
                    min="50"
                    max="110"
                    value={player.weightKg || 75}
                    onChange={(e) => updateField('weightKg', parseInt(e.target.value) || 75)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {(player.weightKg || 75) > Math.max(40, (player.heightCm || 180) - 100) ? (
                    <div className="mt-1 text-[10px] text-red-400 flex items-center justify-between">
                      <span>Overweight Penalty:</span>
                      <span className="font-bold">
                        -{((player.weightKg || 75) - Math.max(40, (player.heightCm || 180) - 100))} PAC, -{((player.weightKg || 75) - Math.max(40, (player.heightCm || 180) - 100))} STA
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-emerald-400 flex items-center justify-between">
                      <span>Conditioning:</span>
                      <span className="font-bold">Optimal Athleticism (0 Penalty)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Career Bio (Back of Card)</label>
                <textarea
                  value={player.customBio || ''}
                  onChange={(e) => updateField('customBio', e.target.value)}
                  rows={2}
                  className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter custom career highlight or scout narrative..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPEARANCE (Renamed from Physique & Hair) */}
      {activeTab === 'biometrics' && (
        <div className="space-y-4 text-xs">
          {isLegendaryPreset && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-amber-200 text-xs flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300 block">Appearance & Hair Locked</span>
                <span className="text-[11px] text-amber-300/80">
                  Skin tone, haircut, facial hair, tattoos, and cosmetic accessories are fixed for legendary preset stars.
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
              <span>Skin Tone</span>
              {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
            </label>
            <select
              value={player.biometrics.skinColor}
              disabled={isLegendaryPreset}
              onChange={(e) => updateField('biometrics.skinColor', e.target.value)}
              className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
            >
              {SKIN_COLORS.map((sk) => (
                <option key={sk.hex} value={sk.hex}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hair Controls: Length FIRST (Shaved, Fade, Short, Medium, Long, Special) */}
          {(() => {
            const isSpecialSelected =
              player.biometrics.hairLength === 'special' || player.biometrics.hairStyle === 'special';
            const hairDyeCategoryUnlocked = isCategoryUnlocked('hair_dye');
            const facialHairCategoryUnlocked = isCategoryUnlocked('facial_hair');
            const headwearCategoryUnlocked = isCategoryUnlocked('headwear');
            const necklaceCategoryUnlocked = isCategoryUnlocked('necklace');
            const earringCategoryUnlocked = isCategoryUnlocked('earring');
            const tattooCategoryUnlocked = isCategoryUnlocked('tattoo');
            const specialHairCategoryUnlocked = isCategoryUnlocked('special_hair');

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Hair Length</span>
                      {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                    </label>
                    <select
                      value={player.biometrics.hairLength}
                      disabled={isLegendaryPreset}
                      onChange={(e) => {
                        const newLen = e.target.value as HairLength;
                        updateField('biometrics.hairLength', newLen);
                        if (newLen === 'special') {
                          updateField('biometrics.hairStyle', 'special');
                          const firstUnlocked = storeItems?.find(
                            (i) => i.category === 'special_hair' && i.unlocked
                          )?.specialHairType;
                          if (firstUnlocked && !player.biometrics.specialHair) {
                            updateField('biometrics.specialHair', firstUnlocked);
                          }
                        } else if (player.biometrics.hairStyle === 'special') {
                          updateField('biometrics.hairStyle', 'straight');
                        }
                      }}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      <option value="shaved">Shaved</option>
                      <option value="fade">Fade</option>
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                      <option value="special" disabled={!isEditorMode && !specialHairCategoryUnlocked}>
                        Special {!specialHairCategoryUnlocked && !isEditorMode ? '🔒 (Store Locked)' : ''}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Hair Style</span>
                      {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                    </label>
                    <select
                      value={
                        player.biometrics.hairLength === 'shaved'
                          ? 'straight'
                          : player.biometrics.hairStyle
                      }
                      disabled={
                        isLegendaryPreset ||
                        player.biometrics.hairLength === 'shaved' ||
                        player.biometrics.hairLength === 'special'
                      }
                      onChange={(e) => updateField('biometrics.hairStyle', e.target.value as HairStyle)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      {player.biometrics.hairLength === 'shaved' ? (
                        <option value="straight">N/A (Shaved)</option>
                      ) : player.biometrics.hairLength === 'special' ? (
                        <option value="straight">N/A (Special length selected)</option>
                      ) : (
                        <>
                          <option value="straight">Straight</option>
                          <option value="wavy">Wavy / Flow</option>
                          <option value="curly">Curly / Quiff</option>
                          <option value="braided">Braided / Cornrows</option>
                          <option value="dreads">Dreadlocks</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Special Haircuts dropdown directly below Length */}
                {isSpecialSelected && (
                  <div>
                    <label className="block text-amber-400 mb-1 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Special Haircut</span>
                        {!specialHairCategoryUnlocked && !isEditorMode && (
                          <span className="text-[10px] text-amber-400/80 font-normal">
                            (Store Locked)
                          </span>
                        )}
                      </span>
                      {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                    </label>
                    <select
                      value={player.biometrics.specialHair || ''}
                      disabled={isLegendaryPreset || (!isEditorMode && !specialHairCategoryUnlocked)}
                      onChange={(e) => updateField('biometrics.specialHair', e.target.value)}
                      className="w-full bg-[#2a2a32] border border-amber-500/60 text-amber-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      <option value="" disabled>-- Select Special Haircut --</option>
                      {[
                        { id: 'el-shaarawy-spikes', name: "Faraon's Crest (T2)" },
                        { id: 'taribo-west', name: "Nigeria's Horns (T2)" },
                        { id: 'valderrama-afro', name: 'Playmaking Afro (T3)' },
                        { id: 'davids-goggles', name: 'Elite Box to Box Tools (T3)' },
                        { id: 'pogba-razor', name: '100M Midfield Star (T3)' },
                        { id: 'beckham-mohawk', name: 'British Star (T4)' },
                        { id: 'cucurella-afro', name: 'Haaland Tiembla (T4)' },
                        { id: 'vidal-crest', name: 'Austral Crest (T4)' },
                        { id: 'ronaldo-noodle', name: 'Mr. Champions (T4)' },
                        { id: 'puyol-curly', name: 'Spanish Lion (T5)' },
                        { id: 'neymar-mohawk', name: 'Brazilian Youngstar (T5)' },
                        { id: 'r9-2002', name: 'Phenomenal Hair (T5)' },
                      ].map((sh) => {
                        const unlocked = isSpecialHairUnlocked(sh.id);
                        return (
                          <option key={sh.id} value={sh.id} disabled={!unlocked}>
                            {unlocked ? sh.name : `🔒 ${sh.name} (Career Store)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Hair Colors: Natural Hair Color & Hair Dye */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Natural Hair Color</span>
                      {isSpecialSelected && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                          <Lock className="w-3 h-3" /> Preset Hair
                        </span>
                      )}
                    </label>
                    <select
                      value={player.biometrics.hairRoot}
                      disabled={isLegendaryPreset || isSpecialSelected}
                      onChange={(e) => updateField('biometrics.hairRoot', e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      {HAIR_ROOT_COLORS.map((hr) => (
                        <option key={hr.hex} value={hr.hex}>
                          {hr.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                      <span>Hair Dye / Highlights</span>
                      {isSpecialSelected ? (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                          <Lock className="w-3 h-3" /> Preset Hair
                        </span>
                      ) : !hairDyeCategoryUnlocked && !isEditorMode ? (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Career Store
                        </span>
                      ) : null}
                    </label>
                    <select
                      value={player.biometrics.hairDye || 'none'}
                      disabled={isLegendaryPreset || isSpecialSelected || (!hairDyeCategoryUnlocked && !isEditorMode)}
                      onChange={(e) => updateField('biometrics.hairDye', e.target.value)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                    >
                      <option value="none">Natural (No Dye)</option>
                      {HAIR_DYE_COLORS.map((hd) => {
                        const unlocked = isCosmeticItemUnlocked('hair_dye', hd.hex);
                        return (
                          <option key={hd.hex} value={hd.hex} disabled={!unlocked}>
                            {unlocked ? hd.name : `🔒 ${hd.name} (Career Store)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Facial Hair */}
                <div>
                  <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                    <span>Facial Hair & Beard Style</span>
                    {isLegendaryPreset ? (
                      <Lock className="w-3 h-3 text-amber-400" />
                    ) : !facialHairCategoryUnlocked && !isEditorMode ? (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" /> Career Store
                      </span>
                    ) : null}
                  </label>
                  <select
                    value={player.biometrics.facialHair || 'none'}
                    disabled={isLegendaryPreset || (!facialHairCategoryUnlocked && !isEditorMode)}
                    onChange={(e) => updateField('biometrics.facialHair', e.target.value as FacialHairStyle)}
                    className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                  >
                    {FACIAL_HAIR_STYLES.map((fhs) => {
                      const unlocked = isCosmeticItemUnlocked('facial_hair', fhs.id);
                      return (
                        <option key={fhs.id} value={fhs.id} disabled={!unlocked}>
                          {unlocked ? fhs.name : `🔒 ${fhs.name} (Career Store)`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Accessories & Tattoos */}
                <div className="border-t border-gray-800 pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Cosmetics, Accessories & Tattoos
                    </span>
                    {!isEditorMode && (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 capitalize">
                        <Lock className="w-3 h-3" /> Career Store Cosmetics
                      </span>
                    )}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Headwear / Glasses</span>
                        {isLegendaryPreset ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : !headwearCategoryUnlocked && !isEditorMode ? (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> Career Store
                          </span>
                        ) : null}
                      </label>
                      <select
                        value={player.accessories.accessory || 'none'}
                        disabled={isLegendaryPreset || (!headwearCategoryUnlocked && !isEditorMode)}
                        onChange={(e) => updateField('accessories.accessory', e.target.value as AccessoryType)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        <option value="none">None</option>
                        {[
                          { id: 'headband', name: 'Sports Headband' },
                          { id: 'performance-band', name: 'Performance Elastic Band' },
                          { id: 'protective-mask', name: 'Protective Face Mask' },
                          { id: 'sports-glasses', name: 'Sport Glasses' },
                        ].map((opt) => {
                          const unlocked = isCosmeticItemUnlocked('headwear', opt.id);
                          return (
                            <option key={opt.id} value={opt.id} disabled={!unlocked}>
                              {unlocked ? opt.name : `🔒 ${opt.name} (Career Store)`}
                            </option>
                          );
                        })}
                      </select>

                      {/* Headband Color Picker */}
                      {(player.accessories.accessory === 'headband' ||
                        player.accessories.accessory === 'performance-band') && (
                        <div className="mt-2">
                          <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                            Headband Color
                          </label>
                          <select
                            value={player.accessories.headbandColor || '#ffffff'}
                            onChange={(e) => updateField('accessories.headbandColor', e.target.value)}
                            className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {ACCESSORY_COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.hex}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Sports Glasses Color Picker */}
                      {player.accessories.accessory === 'sports-glasses' && (
                        <div className="mt-2">
                          <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                            Sports Glasses Color
                          </label>
                          <select
                            value={player.accessories.glassesColor || player.accessories.sportsGlassesColor || '#2563eb'}
                            onChange={(e) => {
                              updateField('accessories.glassesColor', e.target.value);
                              updateField('accessories.sportsGlassesColor', e.target.value);
                            }}
                            className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {ACCESSORY_COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.hex}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Necklace Jewelry</span>
                        {isLegendaryPreset ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : !necklaceCategoryUnlocked && !isEditorMode ? (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> Career Store
                          </span>
                        ) : null}
                      </label>
                      <select
                        value={player.accessories.necklace || 'none'}
                        disabled={isLegendaryPreset || (!necklaceCategoryUnlocked && !isEditorMode)}
                        onChange={(e) => updateField('accessories.necklace', e.target.value as NecklaceType)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        {NECKLACE_OPTIONS.map((n) => {
                          const unlocked = isCosmeticItemUnlocked('necklace', n.id);
                          return (
                            <option key={n.id} value={n.id} disabled={!unlocked}>
                              {unlocked ? n.name : `🔒 ${n.name} (Career Store)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Tattoos Dropdowns */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
                      <span>Body & Face Tattoos (Tier 1 - 4)</span>
                      {isLegendaryPreset ? (
                        <Lock className="w-3 h-3 text-amber-400" />
                      ) : !tattooCategoryUnlocked && !isEditorMode ? (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Career Store
                        </span>
                      ) : null}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium text-[11px]">
                          Neck Tattoo
                        </label>
                        <select
                          value={
                            typeof player.accessories.tattooNeck === 'boolean'
                              ? player.accessories.tattooNeck ? 'rose' : 'none'
                              : player.accessories.tattooNeck || 'none'
                          }
                          disabled={isLegendaryPreset || (!tattooCategoryUnlocked && !isEditorMode)}
                          onChange={(e) => updateField('accessories.tattooNeck', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                        >
                          {NECK_TATTOO_OPTIONS.map((opt) => {
                            const unlocked = isCosmeticItemUnlocked('tattoo', opt.id);
                            return (
                              <option key={opt.id} value={opt.id} disabled={!unlocked}>
                                {unlocked ? opt.name : `🔒 ${opt.name} (Career Store)`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-medium text-[11px]">
                          Left Arm Tattoo
                        </label>
                        <select
                          value={
                            typeof player.accessories.tattooArmL === 'boolean'
                              ? player.accessories.tattooArmL ? 'mandala-sleeve' : 'none'
                              : player.accessories.tattooArmL || 'none'
                          }
                          disabled={isLegendaryPreset || (!tattooCategoryUnlocked && !isEditorMode)}
                          onChange={(e) => updateField('accessories.tattooArmL', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                        >
                          {ARM_TATTOO_OPTIONS.map((opt) => {
                            const unlocked = isCosmeticItemUnlocked('tattoo', opt.id);
                            return (
                              <option key={opt.id} value={opt.id} disabled={!unlocked}>
                                {unlocked ? opt.name : `🔒 ${opt.name} (Career Store)`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-medium text-[11px]">
                          Right Arm Tattoo
                        </label>
                        <select
                          value={
                            typeof player.accessories.tattooArmR === 'boolean'
                              ? player.accessories.tattooArmR ? 'mandala-sleeve' : 'none'
                              : player.accessories.tattooArmR || 'none'
                          }
                          disabled={isLegendaryPreset || (!tattooCategoryUnlocked && !isEditorMode)}
                          onChange={(e) => updateField('accessories.tattooArmR', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                        >
                          {ARM_TATTOO_OPTIONS.map((opt) => {
                            const unlocked = isCosmeticItemUnlocked('tattoo', opt.id);
                            return (
                              <option key={opt.id} value={opt.id} disabled={!unlocked}>
                                {unlocked ? opt.name : `🔒 ${opt.name} (Career Store)`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-medium text-[11px]">
                          Face Tattoo
                        </label>
                        <select
                          value={player.accessories.tattooFace || 'none'}
                          disabled={isLegendaryPreset || (!tattooCategoryUnlocked && !isEditorMode)}
                          onChange={(e) => updateField('accessories.tattooFace', e.target.value)}
                          className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                        >
                          {FACE_TATTOO_OPTIONS.map((opt) => {
                            const unlocked = isCosmeticItemUnlocked('tattoo', opt.id);
                            return (
                              <option key={opt.id} value={opt.id} disabled={!unlocked}>
                                {unlocked ? opt.name : `🔒 ${opt.name} (Career Store)`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Earring Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Earring Style</span>
                        {isLegendaryPreset ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : !earringCategoryUnlocked && !isEditorMode ? (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> Career Store
                          </span>
                        ) : null}
                      </label>
                      <select
                        value={player.accessories.earring || 'none'}
                        disabled={isLegendaryPreset || (!earringCategoryUnlocked && !isEditorMode)}
                        onChange={(e) => updateField('accessories.earring', e.target.value as EarringType)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        {EARRING_OPTIONS.map((eOpt) => {
                          const unlocked = isCosmeticItemUnlocked('earring', eOpt.id);
                          return (
                            <option key={eOpt.id} value={eOpt.id} disabled={!unlocked}>
                              {unlocked ? eOpt.name : `🔒 ${eOpt.name} (Career Store)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Metal Material</span>
                        {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                      </label>
                      <select
                        value={player.accessories.earringMaterial || 'silver'}
                        disabled={isLegendaryPreset || (!earringCategoryUnlocked && !isEditorMode)}
                        onChange={(e) => updateField('accessories.earringMaterial', e.target.value as EarringMaterial)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        {EARRING_MATERIAL_OPTIONS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-medium flex items-center justify-between">
                        <span>Gemstone Color</span>
                        {isLegendaryPreset && <Lock className="w-3 h-3 text-amber-400" />}
                      </label>
                      <select
                        value={player.accessories.earringGemColor || 'diamond'}
                        disabled={isLegendaryPreset || (!earringCategoryUnlocked && !isEditorMode)}
                        onChange={(e) => updateField('accessories.earringGemColor', e.target.value as EarringGemColor)}
                        className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800"
                      >
                        {EARRING_GEM_OPTIONS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Physique & Muscle Mass (Strength Scaling & Veins) in Editor / Profile Mode */}
                <div className="border-t border-gray-800 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Physique & Muscle Mass (Strength)
                    </span>
                    {(() => {
                      const strVal = player.statBreakStats?.strength || outfieldDetailed.strength || player.biometrics.strength || 40;
                      let tierLabel = 'Slender (40-69)';
                      let tierColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
                      if (strVal >= 100 || player.statBreakActive) {
                        tierLabel = 'Stat Break (100+) ⚡';
                        tierColor = 'text-amber-300 bg-amber-950/60 border-amber-500/50 animate-pulse';
                      } else if (strVal >= 95) {
                        tierLabel = 'Beast (95-99) • Veins Active 🔥';
                        tierColor = 'text-rose-400 bg-rose-950/60 border-rose-500/40';
                      } else if (strVal >= 90) {
                        tierLabel = 'Muscular (90-94) 💪';
                        tierColor = 'text-purple-400 bg-purple-950/60 border-purple-500/40';
                      } else if (strVal >= 70) {
                        tierLabel = 'Athletic (70-89) 🏃';
                        tierColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
                      }
                      return (
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tierColor}`}>
                          {tierLabel}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Quick Tier Selection Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                    {[
                      { label: 'Slender', val: 50, desc: '40-69' },
                      { label: 'Athletic', val: 78, desc: '70-89' },
                      { label: 'Muscular', val: 92, desc: '90-94' },
                      { label: 'Beast', val: 99, desc: '95-99' },
                      { label: 'Stat Break', val: 105, desc: '100+' },
                    ].map((preset) => {
                      const currentStr = player.statBreakStats?.strength || outfieldDetailed.strength || player.biometrics.strength || 40;
                      const isSelected =
                        preset.val === 105
                          ? currentStr >= 100
                          : preset.val === 99
                          ? currentStr >= 95 && currentStr < 100
                          : preset.val === 92
                          ? currentStr >= 90 && currentStr < 95
                          : preset.val === 78
                          ? currentStr >= 70 && currentStr < 90
                          : currentStr < 70;

                      return (
                        <button
                          key={preset.label}
                          type="button"
                          disabled={isLegendaryPreset}
                          onClick={() => handleDirectStrengthChange(preset.val)}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer disabled:opacity-50 ${
                            isSelected
                              ? 'bg-white text-slate-900 border-white font-black shadow'
                              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold text-[11px]">{preset.label}</div>
                          <div className="text-[9px] opacity-75">{preset.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Strength Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Strength / Muscle Rating:</span>
                      <span className="font-mono font-bold text-white bg-[#1e1e24] px-2 py-0.5 rounded border border-gray-700">
                        {player.statBreakStats?.strength || outfieldDetailed.strength || player.biometrics.strength || 40}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={isEditorMode ? 115 : 99}
                      value={player.statBreakStats?.strength || outfieldDetailed.strength || player.biometrics.strength || 40}
                      disabled={isLegendaryPreset}
                      onChange={(e) => handleDirectStrengthChange(Number(e.target.value))}
                      className="w-full accent-white cursor-pointer h-2 bg-[#1e1e24] rounded-lg"
                    />
                  </div>

                  {/* Kit Fit & Sleeves */}
                  <div className="pt-2">
                    <label className="block text-gray-400 mb-1 font-medium text-xs">
                      Shirt Fit & Sleeves Style
                    </label>
                    <select
                      value={player.kit.style}
                      onChange={(e) => updateField('kit.style', e.target.value as KitStyle)}
                      className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-semibold"
                    >
                      <option value="normal">Standard Athletic Fit (Normal): Mid-bicep sleeves</option>
                      <option value="loose">Classic Retro Loose (Loose): Elbow-level draped sleeves</option>
                      <option value="tight">Pro Compression (Tight): High-cut lifted sleeves</option>
                    </select>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* TAB 3: KIT DESIGN (EDITOR MODE ONLY) */}
      {activeTab === 'kit' && isEditorMode && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Shirt Fit & Sleeves Style</label>
              <select
                value={player.kit.style}
                onChange={(e) => updateField('kit.style', e.target.value as KitStyle)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="normal">Standard Athletic Fit (Normal): Mid-bicep sleeves</option>
                <option value="loose">Classic Retro Loose (Loose): Elbow-level draped sleeves</option>
                <option value="tight">Pro Compression (Tight): High-cut lifted sleeves</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Collar Type</label>
              <select
                value={player.kit.collar}
                onChange={(e) => updateField('kit.collar', e.target.value as KitCollar)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="crew">Crew Neck</option>
                <option value="v-neck">V-Neck</option>
                <option value="polo">Polo Collar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Primary Base Color</label>
              <select
                value={player.kit.color1}
                onChange={(e) => updateField('kit.color1', e.target.value)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {PALETTE_COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Secondary / Trim Color</label>
              <select
                value={player.kit.color2}
                onChange={(e) => updateField('kit.color2', e.target.value)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {PALETTE_COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Jersey Pattern</label>
            <select
              value={player.kit.pattern}
              onChange={(e) => updateField('kit.pattern', e.target.value as KitPattern)}
              className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="solid">Solid Base</option>
              <option value="stripes">Vertical Stripes</option>
              <option value="sash">Diagonal Sash</option>
              <option value="checkered">Checkered Pattern</option>
              <option value="raglan-shoulders">Shoulder Contrast</option>
            </select>
          </div>

          {/* REALISTIC KIT SHIRT PREVIEW */}
          <div className="bg-[#12131c] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              Match Jersey Model Preview
            </span>
            <KitRenderer kit={player.kit} emblem={player.emblem} sponsorName={player.club} size="lg" />
          </div>
        </div>
      )}

      {/* TAB 4: EMBLEM CUSTOMIZATION (EDITOR MODE ONLY) */}
      {activeTab === 'emblem' && isEditorMode && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Emblem Crest Shape</label>
              <select
                value={player.emblem.shape}
                onChange={(e) => updateField('emblem.shape', e.target.value as EmblemShape)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="square">Square Badge</option>
                <option value="circle">Circle Badge</option>
                <option value="diamond">Diamond Shield</option>
                <option value="arrow">Chevron Shield</option>
                <option value="barcelona">FC Barcelona Shape Crest</option>
                <option value="real-madrid">Real Madrid Crown Crest</option>
                <option value="liverpool">Liverpool Flame Shield</option>
                <option value="star-shield">5-Star Classical Shield</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Color Mode</label>
              <select
                value={player.emblem.mode}
                onChange={(e) => updateField('emblem.mode', e.target.value as EmblemMode)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="1">1 Color (Solid Base)</option>
                <option value="2">2 Colors (Outer Border + Stripe)</option>
                <option value="3">3 Colors (Tri-Tone Stripes + Gold Star)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">
                {player.emblem.mode === '1' ? 'Emblem Color' : 'Primary Base Color'}
              </label>
              <select
                value={player.emblem.color1}
                onChange={(e) => updateField('emblem.color1', e.target.value)}
                className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {PALETTE_COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {player.emblem.mode !== '1' && (
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Secondary / Trim Color</label>
                <select
                  value={player.emblem.color2}
                  onChange={(e) => updateField('emblem.color2', e.target.value)}
                  className="w-full bg-[#2a2a32] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {PALETTE_COLORS.map((c) => (
                    <option key={c.hex} value={c.hex}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {player.emblem.mode === '3' && (
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Tertiary Frame / Star Color</label>
                <select
                  value={player.emblem.color3 || '#facc15'}
                  onChange={(e) => updateField('emblem.color3', e.target.value)}
                  className="w-full bg-[#2a2a32] border border-amber-500/60 text-amber-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer font-medium"
                >
                  {PALETTE_COLORS.map((c) => (
                    <option key={c.hex} value={c.hex}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STATS & OVR ECOSYSTEM */}
      {activeTab === 'stats' && (
        <div className="space-y-4 text-xs">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#121216] p-3 rounded-lg border border-gray-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-blue-400">{player.ovr} OVR</span>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-bold uppercase border border-blue-700/50">
                  Prospect Base Rating
                </span>
              </div>
              <span className="text-gray-400 text-[11px] block mt-0.5">
                Calculated from core stat distribution across key tactical attributes.
              </span>
            </div>

            <div className="bg-blue-950/80 border border-blue-500/40 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Available Points</span>
              <span className={`text-base font-black ${availablePoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {availablePoints} PTS
              </span>
            </div>
          </div>

          {/* NEW GAME MODE: Point Allocation System only (NO sliders) */}
          {!isEditorMode ? (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-blue-500/30 p-3 rounded-lg text-xs flex items-center justify-between text-gray-300">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>All core attributes start at <strong>40</strong> base rating. Subtract points to gain points for other stats.</span>
                </div>
              </div>

              {/* GOALKEEPER 7 STATS POINT ALLOCATION */}
              {isGk ? (
                <div className="space-y-3">
                  <div className="text-gray-300 font-bold border-b border-gray-800 pb-1 text-xs flex items-center justify-between">
                    <span className="text-blue-400">{t('GOA — Goalkeeper Core Skills')}</span>
                    <span className="text-gray-400 font-normal">{t('7 Core Metrics')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: `${translateAttributeName('saving', currentLanguage)} (${translateAttributeAbbreviation('saving', currentLanguage)})`, key: 'saving' as const, desc: 'The core ability and technique to successfully stop a shot on target.' },
                      { label: `${translateAttributeName('reflexes', currentLanguage)} (${translateAttributeAbbreviation('reflexes', currentLanguage)})`, key: 'reflexes' as const, desc: 'The raw speed required to react instantly to sudden, close-range, or deflected shots.' },
                      { label: `${translateAttributeName('handling', currentLanguage)} (${translateAttributeAbbreviation('handling', currentLanguage)})`, key: 'handling' as const, desc: 'The ability to cleanly catch the ball upon impact, preventing dangerous secondary rebounds or spills.' },
                      { label: `${translateAttributeName('positioning', currentLanguage)} (${translateAttributeAbbreviation('positioning', currentLanguage)})`, key: 'positioning' as const, desc: "The goalkeeper's spatial awareness to correctly align themselves relative to the ball and goal frame." },
                      { label: `${translateAttributeName('aerialReach', currentLanguage)} (${translateAttributeAbbreviation('aerialReach', currentLanguage)})`, key: 'aerialReach' as const, desc: 'The physical wingspan and vertical jump used to claim high crosses and corner kicks.' },
                      { label: `${translateAttributeName('oneOnOne', currentLanguage)} (${translateAttributeAbbreviation('oneOnOne', currentLanguage)})`, key: 'oneOnOne' as const, desc: 'Specialist metric determining success rate when facing an attacking player rushing the box alone.' },
                      { label: `${translateAttributeName('distribution', currentLanguage)} (${translateAttributeAbbreviation('distribution', currentLanguage)})`, key: 'distribution' as const, desc: 'The accuracy of throwing or kicking the ball out to launch immediate counter-attacks.' },
                    ].map((item) => {
                      const val = gkDetailed[item.key];
                      const canInc = val < 99 && availablePoints >= 1;
                      const canDec = val > 0;
                      return (
                        <div key={item.key} className="bg-[#2a2a32] p-3 rounded-lg border border-gray-700 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-white text-xs">{item.label}</span>
                              <span className="font-black text-blue-400 text-sm">{val}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-tight">{item.desc}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-700/50">
                            <button
                              type="button"
                              onClick={() => handleGkPointDecrement(item.key)}
                              disabled={!canDec}
                              className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 font-black text-white text-sm flex items-center justify-center transition cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-[10px] text-gray-400 font-mono font-medium">
                              {val === 40 ? 'Base 40' : val < 40 ? `-${40 - val} pts` : `+${val - 40} pts`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleGkPointIncrement(item.key)}
                              disabled={!canInc}
                              className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 font-black text-white text-sm flex items-center justify-center transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* OUTFIELD 18 STATS POINT ALLOCATION (Across 6 Tactical Categories) */
                <div className="space-y-4">
                  {[
                    {
                      cat: `${translateAttributeName('physical', currentLanguage)} (${translateAttributeAbbreviation('physical', currentLanguage)})`,
                      color: 'border-amber-500/30 text-amber-400',
                      stats: [
                        { label: translateAttributeName('pace', currentLanguage), key: 'pace' as const, desc: 'Top sprinting speed and acceleration curve, determining how fast a player moves across the pitch.' },
                        { label: translateAttributeName('stamina', currentLanguage), key: 'stamina' as const, desc: "The player's energy reservoir; lower stamina applies a negative multiplier to all other stats late in a match." },
                        { label: translateAttributeName('strength', currentLanguage), key: 'strength' as const, desc: 'Physical mass and power, dictating success in shoulder-to-shoulder duels and holding off opponents.' },
                      ],
                    },
                    {
                      cat: `${t('Progression')} (${t('PRO')})`,
                      color: 'border-blue-500/30 text-blue-400',
                      stats: [
                        { label: translateAttributeName('ballControl', currentLanguage), key: 'ballControl' as const, desc: 'First-touch ability to cleanly trap incoming passes without letting the ball bounce away.' },
                        { label: translateAttributeName('retention', currentLanguage), key: 'retention' as const, desc: 'Shielding and keeping possession under heavy pressure from surrounding defenders.' },
                        { label: translateAttributeName('dribbling', currentLanguage), key: 'dribbling' as const, desc: 'Close control at high speeds, reducing the radius at which defenders can trigger a tackle animation.' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('passing', currentLanguage)} (${translateAttributeAbbreviation('passing', currentLanguage)})`,
                      color: 'border-purple-500/30 text-purple-400',
                      stats: [
                        { label: translateAttributeName('shortPass', currentLanguage), key: 'shortPass' as const, desc: 'Accuracy and ball speed for ground distribution under 15 yards.' },
                        { label: translateAttributeName('longPass', currentLanguage), key: 'longPass' as const, desc: 'Accuracy, loft, and backspin for aerial balls, switches, and long through-balls.' },
                        { label: translateAttributeName('crossing', currentLanguage), key: 'crossing' as const, desc: 'Accuracy of lofted balls delivered from wide areas into the penalty box.' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('shooting', currentLanguage)} (${translateAttributeAbbreviation('shooting', currentLanguage)})`,
                      color: 'border-emerald-500/30 text-emerald-400',
                      stats: [
                        { label: translateAttributeName('shooting', currentLanguage), key: 'shooting' as const, desc: 'Accuracy of shots inside the penalty box, narrowing the targeting RNG cone.' },
                        { label: translateAttributeName('heading', currentLanguage), key: 'heading' as const, desc: 'Aerial accuracy and timing when connecting with crosses or set-pieces with the head.' },
                        { label: translateAttributeName('longShots', currentLanguage), key: 'longShots' as const, desc: 'Power and accuracy when striking the ball from outside the penalty box.' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('defending', currentLanguage)} (${translateAttributeAbbreviation('defending', currentLanguage)})`,
                      color: 'border-rose-500/30 text-rose-400',
                      stats: [
                        { label: translateAttributeName('tackling', currentLanguage), key: 'tackling' as const, desc: 'Success rate of clean standing and sliding challenges to win back possession.' },
                        { label: translateAttributeName('marking', currentLanguage), key: 'marking' as const, desc: 'Stickiness to an assigned opponent, reducing their receiving space and forcing first-touch errors.' },
                        { label: translateAttributeName('interceptions', currentLanguage), key: 'interceptions' as const, desc: 'Anticipation logic that allows a player to automatically step into passing lanes to intercept balls.' },
                      ],
                    },
                    {
                      cat: `${t('Mental')} (${t('MEN')})`,
                      color: 'border-cyan-500/30 text-cyan-400',
                      stats: [
                        { label: translateAttributeName('positioning', currentLanguage), key: 'positioning' as const, desc: 'Off-ball awareness and spatial intelligence, helping players find open space or hold a defensive line.' },
                        { label: translateAttributeName('composure', currentLanguage), key: 'composure' as const, desc: 'Pressure resistance that prevents performance drops when surrounded by opponents or in high-stakes moments.' },
                        { label: translateAttributeName('reactions', currentLanguage), key: 'reactions' as const, desc: 'Mental speed in responding to loose balls, deflections, and sudden shifts in play.' },
                      ],
                    },
                  ].map((section) => (
                    <div key={section.cat} className={`bg-[#121216] border p-3.5 rounded-xl space-y-2.5 ${section.color.split(' ')[0]}`}>
                      <div className={`font-black text-xs uppercase tracking-wider ${section.color.split(' ')[1]}`}>
                        {section.cat}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {section.stats.map((s) => {
                          const val = outfieldDetailed[s.key];
                          const canInc = val < 99 && availablePoints >= 1;
                          const canDec = val > 0;
                          return (
                            <div key={s.key} className="bg-[#2a2a32] p-2.5 rounded-lg border border-gray-700 flex flex-col justify-between space-y-2">
                              <div>
                                <div className="flex justify-between font-bold text-gray-200 text-xs mb-0.5">
                                  <span>{s.label}</span>
                                  <span className="text-white font-black">{val}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight mb-1">{s.desc}</p>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-700/50">
                                <button
                                  type="button"
                                  onClick={() => handleOutfieldPointDecrement(s.key)}
                                  disabled={!canDec}
                                  className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 font-black text-white text-sm flex items-center justify-center transition cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-[10px] text-gray-400 font-mono font-medium">
                                  {val === 40 ? 'Base 40' : val < 40 ? `-${40 - val} pts` : `+${val - 40} pts`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOutfieldPointIncrement(s.key)}
                                  disabled={!canInc}
                                  className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 font-black text-white text-sm flex items-center justify-center transition cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* EDITOR MODE: View Mode Toggle & Sliders */
            <div className="space-y-4">
              {/* STAT BREAK SYSTEM CONTROLS (EDITOR MODE) */}
              <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-blue-950/30 border border-amber-500/40 p-3.5 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${player.statBreakActive ? 'text-amber-400 animate-pulse' : 'text-gray-400'}`} />
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Stat Break Mastery (100 - 115+)
                      </span>
                      <span className="text-[10px] text-amber-300/80">
                        {player.statBreakActive
                          ? 'Stat break is active! Sliders can reach up to 115.'
                          : 'Unlock attribute caps beyond 99 up to 115+.'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatBreak(!player.statBreakActive)}
                    className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                      player.statBreakActive
                        ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    <span>⚡ {player.statBreakActive ? 'Stat Break ACTIVE' : 'Enable Stat Break'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => handleStatBreakAll(105)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    ⚡ Break All Stats (105)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatBreakPhysicals(110)}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    💪 Break Physicals (110)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetStatBreak()}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-lg font-medium transition cursor-pointer"
                  >
                    🔄 Cap All to 99
                  </button>
                </div>
              </div>

              <div className="flex bg-[#121216] p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatViewMode('core')}
                  className={`flex-1 py-1.5 rounded-md transition cursor-pointer text-center ${
                    statViewMode === 'core' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isGk ? '7 Goalkeeper Metrics' : '18 Core Stats Breakdown'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatViewMode('categories')}
                  className={`flex-1 py-1.5 rounded-md transition cursor-pointer text-center ${
                    statViewMode === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Category Averages
                </button>
              </div>

              {/* DETAILED GOALKEEPER METRICS (EDITOR MODE SLIDERS) */}
              {isGk && statViewMode === 'core' && (
                <div className="space-y-3">
                  <div className="text-gray-300 font-bold border-b border-gray-800 pb-1 text-xs flex items-center justify-between">
                    <span>GOA — Goalkeeper Specialist Skills</span>
                    <span className="text-gray-400 font-normal">7 Core Metrics</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { label: 'Saving (SAV)', key: 'saving' as const, desc: 'Shot-stopping ability' },
                      { label: 'Reflexes (REF)', key: 'reflexes' as const, desc: 'Reaction speed to quick strikes' },
                      { label: 'Handling (HAN)', key: 'handling' as const, desc: 'Clean catches without spills' },
                      { label: 'Positioning (POS)', key: 'positioning' as const, desc: 'Goal frame spatial alignment' },
                      { label: 'Aerial Reach (AER)', key: 'aerialReach' as const, desc: 'Wingspan & vertical reach on crosses' },
                      { label: 'One-on-One (1v1)', key: 'oneOnOne' as const, desc: 'Breakaway box duel success' },
                      { label: 'Distribution (DIS)', key: 'distribution' as const, desc: 'Throwing & kicking counter accuracy' },
                    ].map((item) => {
                      const val = gkDetailed[item.key];
                      const isBroken = val >= 100;
                      return (
                        <div
                          key={item.key}
                          className={`p-2.5 rounded-lg border transition-all ${
                            isBroken
                              ? 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                              : 'bg-[#2a2a32] border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between font-medium mb-0.5 items-center">
                            <span className="text-gray-200 font-bold">{item.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-extrabold px-1.5 py-0.5 rounded text-xs ${
                                  isBroken
                                    ? 'text-amber-300 bg-amber-950/80 border border-amber-500/50 animate-pulse'
                                    : 'text-blue-400'
                                }`}
                              >
                                {isBroken ? `⚡ ${val}` : val}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleSingleStatBreak(item.key)}
                                title={isBroken ? 'Reset to 99' : 'Stat Break to 105'}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${
                                  isBroken
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                              >
                                {isBroken ? 'Cap' : '⚡ Break'}
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-400 mb-1.5">{item.desc}</div>
                          <input
                            type="range"
                            min="10"
                            max={player.statBreakActive || isEditorMode ? 115 : 99}
                            value={val}
                            onChange={(e) => handleGkCoreChangeSlider(item.key, parseInt(e.target.value) || 10)}
                            className={`w-full cursor-pointer ${
                              isBroken ? 'accent-amber-400' : 'accent-blue-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DETAILED OUTFIELD CORE STATS Breakdown (EDITOR MODE SLIDERS) */}
              {!isGk && statViewMode === 'core' && (
                <div className="space-y-4">
                  {[
                    {
                      cat: `${translateAttributeName('physical', currentLanguage)} (${translateAttributeAbbreviation('physical', currentLanguage)})`,
                      color: 'border-amber-500/30 text-amber-400',
                      stats: [
                        { label: translateAttributeName('pace', currentLanguage), key: 'pace' as const, desc: 'Top sprinting speed and acceleration curve' },
                        { label: translateAttributeName('stamina', currentLanguage), key: 'stamina' as const, desc: 'Energy reservoir prevents late-match stat penalty' },
                        { label: translateAttributeName('strength', currentLanguage), key: 'strength' as const, desc: 'Physical mass and duel power shielding ball' },
                      ],
                    },
                    {
                      cat: `${t('Progression')} (${t('PRO')})`,
                      color: 'border-blue-500/30 text-blue-400',
                      stats: [
                        { label: translateAttributeName('ballControl', currentLanguage), key: 'ballControl' as const, desc: 'Clean first touch trapping passes' },
                        { label: translateAttributeName('retention', currentLanguage), key: 'retention' as const, desc: 'Shielding possession under heavy pressure' },
                        { label: translateAttributeName('dribbling', currentLanguage), key: 'dribbling' as const, desc: 'Close control at high speeds' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('passing', currentLanguage)} (${translateAttributeAbbreviation('passing', currentLanguage)})`,
                      color: 'border-purple-500/30 text-purple-400',
                      stats: [
                        { label: translateAttributeName('shortPass', currentLanguage), key: 'shortPass' as const, desc: 'Ground distribution accuracy under 15 yards' },
                        { label: translateAttributeName('longPass', currentLanguage), key: 'longPass' as const, desc: 'Lofted accuracy, backspin & switches' },
                        { label: translateAttributeName('crossing', currentLanguage), key: 'crossing' as const, desc: 'Accuracy of wide deliveries into penalty box' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('shooting', currentLanguage)} (${translateAttributeAbbreviation('shooting', currentLanguage)})`,
                      color: 'border-emerald-500/30 text-emerald-400',
                      stats: [
                        { label: translateAttributeName('shooting', currentLanguage), key: 'shooting' as const, desc: 'Inside box accuracy & targeting cone' },
                        { label: translateAttributeName('heading', currentLanguage), key: 'heading' as const, desc: 'Aerial timing & header accuracy on crosses' },
                        { label: translateAttributeName('longShots', currentLanguage), key: 'longShots' as const, desc: 'Striking power & accuracy outside box' },
                      ],
                    },
                    {
                      cat: `${translateAttributeName('defending', currentLanguage)} (${translateAttributeAbbreviation('defending', currentLanguage)})`,
                      color: 'border-rose-500/30 text-rose-400',
                      stats: [
                        { label: translateAttributeName('tackling', currentLanguage), key: 'tackling' as const, desc: 'Clean standing and sliding challenges' },
                        { label: translateAttributeName('marking', currentLanguage), key: 'marking' as const, desc: 'Stickiness to assigned opponent receiving space' },
                        { label: translateAttributeName('interceptions', currentLanguage), key: 'interceptions' as const, desc: 'Anticipation stepping into passing lanes' },
                      ],
                    },
                    {
                      cat: `${t('Mental')} (${t('MEN')})`,
                      color: 'border-cyan-500/30 text-cyan-400',
                      stats: [
                        { label: translateAttributeName('positioning', currentLanguage), key: 'positioning' as const, desc: 'Off-ball awareness and spatial intelligence' },
                        { label: translateAttributeName('composure', currentLanguage), key: 'composure' as const, desc: 'Pressure resistance in high-stakes moments' },
                        { label: translateAttributeName('reactions', currentLanguage), key: 'reactions' as const, desc: 'Mental speed responding to loose balls & turns' },
                      ],
                    },
                  ].map((section) => (
                    <div key={section.cat} className={`bg-[#121216] border p-3 rounded-lg ${section.color.split(' ')[0]}`}>
                      <div className={`font-black text-xs uppercase tracking-wider mb-2 ${section.color.split(' ')[1]}`}>
                        {section.cat}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {section.stats.map((s) => {
                          const val = outfieldDetailed[s.key];
                          const isBroken = val >= 100;
                          return (
                            <div
                              key={s.key}
                              className={`p-2 rounded-lg border transition-all ${
                                isBroken
                                  ? 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                                  : 'bg-[#2a2a32] border-gray-700'
                              }`}
                            >
                              <div className="flex justify-between font-bold text-gray-200 text-xs mb-0.5 items-center">
                                <span>{s.label}</span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-black px-1.5 py-0.5 rounded text-xs ${
                                      isBroken
                                        ? 'text-amber-300 bg-amber-950/80 border border-amber-500/50 animate-pulse'
                                        : 'text-white'
                                    }`}
                                  >
                                    {isBroken ? `⚡ ${val}` : val}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSingleStatBreak(s.key)}
                                    title={isBroken ? 'Reset to 99' : 'Stat Break to 105'}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${
                                      isBroken
                                        ? 'bg-amber-400 text-slate-900'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    }`}
                                  >
                                    {isBroken ? 'Cap' : '⚡'}
                                  </button>
                                </div>
                              </div>
                              <p className="text-[9.5px] text-gray-400 leading-tight mb-1 truncate" title={s.desc}>
                                {s.desc}
                              </p>
                              <input
                                type="range"
                                min="10"
                                max={player.statBreakActive || isEditorMode ? 115 : 99}
                                value={val}
                                onChange={(e) => handleOutfieldCoreChangeSlider(s.key, parseInt(e.target.value) || 10)}
                                className={`w-full cursor-pointer ${
                                  isBroken ? 'accent-amber-400' : 'accent-blue-500'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CATEGORY SUMMARY RATINGS (EDITOR MODE) */}
              {statViewMode === 'categories' && (
                <div className="space-y-3">
                  <div className="text-gray-300 font-bold border-b border-gray-800 pb-1 text-xs">
                    Tactical Category Ratings
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'PRO (Progression)', key: 'stats.pro' },
                      { label: 'DEF (Defense)', key: 'stats.def' },
                      { label: 'CRE (Creation)', key: 'stats.cre' },
                      { label: 'MEN (Mentality)', key: 'stats.men' },
                      { label: 'SCO (Goalscoring)', key: 'stats.goa' },
                      { label: 'PHY (Physicality)', key: 'stats.phy' },
                    ].map((statItem) => {
                      const currentVal = (player.stats as any)[statItem.key.replace('stats.', '')];
                      return (
                        <div key={statItem.key} className="bg-[#2a2a32] p-2.5 rounded-lg border border-gray-700">
                          <div className="flex justify-between font-medium mb-1 text-gray-300">
                            <span>{statItem.label}</span>
                            <span className="font-bold text-white">{currentVal}</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="99"
                            value={currentVal}
                            onChange={(e) => updateField(statItem.key, parseInt(e.target.value) || 10)}
                            className="w-full accent-blue-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Player Perks Section */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Player Perks & Playstyle Traits
              </h4>
              <span className="text-[10px] text-gray-400 font-semibold bg-gray-800 px-2.5 py-1 rounded">
                0 / 4 Perks Unlocked
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              No active perks unlocked yet. Playstyle perks and signature traits will be earned during gameplay as your prospect develops in their career.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((slot) => (
                <div
                  key={slot}
                  className="bg-[#121216] border border-dashed border-gray-700/70 rounded-lg p-3 flex flex-col items-center justify-center text-center text-gray-500 hover:border-gray-600 transition"
                >
                  <Sparkles className="w-4 h-4 mb-1 opacity-40 text-amber-400" />
                  <span className="text-[11px] font-semibold text-gray-400">Perk Slot {slot}</span>
                  <span className="text-[9px] text-gray-500">Locked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ALL CARDS (PLAYER EDITOR FULL CATALOG) */}
      {activeTab === 'all_cards' && (
        <PlayerEditorAllCardsPanel />
      )}

      {/* PRIMARY ACTION: SAVE AS LEGEND IN EDITOR MODE OR CONFIRM CHARACTER IN CAREER MODE */}
      {!isCharacterConfirmed && (onConfirm || onSaveAsLegend) && (
        <div className="mt-6 pt-4 border-t border-gray-800 space-y-3">
          {!(isEditorMode || careerMode === 'editor') && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                availablePoints > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('ATTRIBUTE_POINTS_STATUS')}</span>
              </div>
              <span className="font-bold">
                {availablePoints > 0
                  ? `${availablePoints} ${t('UNASSIGNED_POINTS_REMAINING')} ⚠️`
                  : `${t('ALL_POINTS_ASSIGNED')} ✅`}
              </span>
            </div>
          )}

          {isEditorMode || careerMode === 'editor' ? (
            <button
              type="button"
              onClick={() => onSaveAsLegend && onSaveAsLegend(player)}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 border border-amber-300/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Award className="w-5 h-5" />
              {t('SAVE_AS_LEGEND')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 border border-emerald-400/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              {t('CONFIRM_AND_START')}
            </button>
          )}
        </div>
      )}
        </div>
      )}

      {/* 5 STAT POINTS ALLOCATION COMPLETION POPUP */}
      {showPointCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111322] border border-emerald-500/50 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {t('MODAL_POINTS_ASSIGNED_TITLE')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('MODAL_POINTS_ASSIGNED_DESC')}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPointCompletionModal(false);
                  if (onConfirm) {
                    onConfirm();
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{t('MODAL_CONFIRM_AND_START')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPointCompletionModal(false);
                  setHasDismissedPointModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
              >
                {t('MODAL_KEEP_CREATING')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
