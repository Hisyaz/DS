import React, { useState } from 'react';
import { TrophyItem, PlayerConfig } from '../types';
import { ChampionTitleData } from './ChampionsCelebrationModal';
import { useTestMode } from '../utils/testModeSystem';
import { Plus, Trash2, Trophy, Award, Shield, Star, Info, Sparkles, X, Globe, Zap, Crown } from 'lucide-react';

interface TrophyCabinetProps {
  trophies?: TrophyItem[];
  onChangeTrophies?: (updated: TrophyItem[]) => void;
  readOnly?: boolean;
  player?: PlayerConfig;
  onOpenChampionCelebration?: (data: ChampionTitleData) => void;
}

const CATEGORY_CONFIGS = [
  {
    key: 'national',
    title: '1. National',
    subtitle: 'Domestic Leagues & Local Cups (Copa del Rey, FA Cup, etc.)',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  {
    key: 'continental',
    title: '2. Continental',
    subtitle: 'Champions League, Europa League, Libertadores, Euros, Copa América, AFCON',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
  },
  {
    key: 'international',
    title: '3. International',
    subtitle: 'World Cup, Club World Cup, Intercontinental, Finalissima',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  {
    key: 'youth',
    title: '4. Youth',
    subtitle: 'U-20 World Cup, U-17 Championships, Olympic Gold',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  },
  {
    key: 'individual',
    title: '5. Individual',
    subtitle: "Ballon d'Or, Golden Boot, Pichichi, Player of Tournament, The Best",
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  {
    key: 'friendly',
    title: '6. Friendly & Pre-Season',
    subtitle: 'Pre-Season Friendly Cups, U17/U20/Reserves League & Cup Silverware',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  },
] as const;

// Subcomponent for individual shelf items (single trophy or expandable multi-trophy stack)
interface TrophyShelfItemProps {
  key?: string;
  trophy: TrophyItem;
  player?: PlayerConfig;
  renderTrophySvg: (iconType: TrophyItem['iconType'], scaleClass?: string) => React.ReactNode;
  onOpenSpotlight: (trophy: TrophyItem, selectedYear: string, teamName: string, allYears: string[]) => void;
}

function TrophyShelfItem({ trophy, player, renderTrophySvg, onOpenSpotlight }: TrophyShelfItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubIndex, setActiveSubIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Derive winning club or country
  const winningTeam = React.useMemo(() => {
    if (trophy.teamWonWith) return { name: trophy.teamWonWith, isNational: trophy.isNationalTeam ?? false };
    if (trophy.clubWonWith) return { name: trophy.clubWonWith, isNational: false };
    if (trophy.countryWonWith) return { name: trophy.countryWonWith, isNational: true };

    const nameLower = trophy.name.toLowerCase();
    const isNational = Boolean(
      trophy.isNationalTeam ||
      ['world-cup', 'olympic-gold'].includes(trophy.iconType) ||
      nameLower.includes('world cup') ||
      nameLower.includes('euro') ||
      nameLower.includes('copa américa') ||
      nameLower.includes('copa america') ||
      nameLower.includes('afcon') ||
      nameLower.includes('asian cup') ||
      nameLower.includes('finalissima') ||
      nameLower.includes('u-17') ||
      nameLower.includes('u-20') ||
      nameLower.includes('nations league')
    );

    if (isNational) {
      const country = typeof player?.nationality === 'string' ? player.nationality : (player?.nationality?.name || player?.country || 'National Team');
      return { name: country, isNational: true };
    } else {
      const club = player?.club || 'Club';
      return { name: club, isNational: false };
    }
  }, [trophy, player]);

  // Parse list of years from comma-separated year string or count
  const years = React.useMemo(() => {
    if (trophy.year.includes(',')) {
      return trophy.year.split(',').map((y) => y.trim()).filter(Boolean);
    }
    if (trophy.count && trophy.count > 1) {
      const parts = trophy.year.split('-').map((s) => s.trim());
      if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        const start = Number(parts[0]);
        const end = Number(parts[1]);
        const count = trophy.count;
        const step = Math.max(1, Math.floor((end - start) / (count - 1 || 1)));
        const res: string[] = [];
        for (let i = 0; i < count; i++) {
          res.push(String(start + i * step));
        }
        return res;
      }
      return Array(trophy.count).fill(trophy.year);
    }
    return [trophy.year];
  }, [trophy.year, trophy.count]);

  const totalCount = trophy.count || years.length;
  const isMulti = totalCount > 1;

  if (!isMulti) {
    // Single Trophy Item
    return (
      <div
        className={`group relative flex flex-col items-center shrink-0 cursor-pointer select-none transition-all duration-150 ${
          isHovered ? 'z-30' : 'z-10'
        }`}
        onMouseEnter={() => {
          setIsHovered(true);
          setActiveSubIndex(0);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setActiveSubIndex(null);
        }}
        onClick={() => onOpenSpotlight(trophy, trophy.year, winningTeam.name, years)}
        title="Click to take trophy out and inspect"
      >
        {/* Tooltip Popup with High Z-Index & Never Behind Shelf */}
        <div
          className={`absolute bottom-[calc(100%+8px)] z-50 bg-slate-950/95 text-white text-[11px] font-medium px-3.5 py-2.5 rounded-xl border-2 border-amber-400 shadow-[0_4px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.5)] whitespace-nowrap transition-all duration-150 pointer-events-none ${
            activeSubIndex === 0
              ? 'opacity-100 scale-100 translate-y-0 visible'
              : 'opacity-0 scale-95 translate-y-1 invisible'
          }`}
        >
          <div className="text-amber-300 font-black flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{trophy.name}</span>
          </div>
          <div className="text-slate-200 text-[11px] font-bold pt-1.5 flex items-center gap-1">
            <span className="text-slate-400 font-normal">Won with:</span>
            <span className="text-amber-200 font-black">{winningTeam.name}</span>
          </div>
          <div className="text-slate-300 text-[10px] pt-1 flex items-center justify-between gap-3 text-slate-400">
            <span>Year: <strong className="text-white font-mono">{trophy.year}</strong></span>
            <span className="capitalize text-amber-400/90 font-bold">{trophy.category}</span>
          </div>
          <div className="text-[9.5px] text-amber-400/90 pt-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Click to inspect trophy in 3D spotlight
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-amber-400" />
        </div>

        {/* Trophy Silhouette Icon */}
        <div className="transition-transform duration-200 group-hover:scale-115 group-hover:-translate-y-1 flex items-center justify-center min-h-[44px]">
          {renderTrophySvg(trophy.iconType)}
        </div>

        {/* Year Label & Name Tag Underneath */}
        <div className="mt-1.5 flex flex-col items-center gap-0.5 max-w-[88px]">
          <span className="text-[10px] font-black text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40 tracking-tight shadow group-hover:border-amber-400">
            {trophy.year}
          </span>
          <span className="text-[9.5px] font-bold text-amber-200/90 truncate w-full text-center group-hover:text-amber-300">
            {trophy.name}
          </span>
          <span className="text-[8.5px] font-medium text-slate-400 truncate w-full text-center">
            {winningTeam.name}
          </span>
        </div>
      </div>
    );
  }

  // Multi-Trophy Item (Stackable & Expandable)
  return (
    <div
      className={`relative shrink-0 flex items-end transition-all duration-300 ${
        isHovered ? 'z-30' : 'z-10'
      }`}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsExpanded(false);
        setActiveSubIndex(null);
      }}
    >
      {!isExpanded ? (
        /* Collapsed stack view: 1 trophy with "x N" pill underneath */
        <div
          className="group flex flex-col items-center shrink-0 cursor-pointer select-none"
          onClick={() => onOpenSpotlight(trophy, years[years.length - 1] || trophy.year, winningTeam.name, years)}
          title="Click to take trophy out and inspect"
        >
          {/* Summary Tooltip */}
          <div className="absolute bottom-[calc(100%+8px)] z-50 bg-slate-950/95 text-white text-[11px] font-medium px-3.5 py-2.5 rounded-xl border-2 border-amber-400 shadow-[0_4px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.5)] whitespace-nowrap transition-all duration-150 pointer-events-none opacity-0 group-hover:opacity-100">
            <div className="text-amber-300 font-black flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{trophy.name}</span>
            </div>
            <div className="text-slate-200 text-[11px] font-bold pt-1.5 flex items-center gap-1">
              <span className="text-slate-400 font-normal">Won with:</span>
              <span className="text-amber-200 font-black">{winningTeam.name}</span>
            </div>
            <div className="text-amber-300 text-[10px] font-bold pt-1">
              {totalCount}x Winner • Click to inspect details
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-amber-400" />
          </div>

          {/* Stacked Trophy Icon with duplicate shadow behind */}
          <div className="relative transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1 flex items-center justify-center min-h-[44px]">
            <div className="absolute -left-1.5 -top-1 opacity-35 blur-[0.4px]">
              {renderTrophySvg(trophy.iconType)}
            </div>
            <div className="relative z-10">
              {renderTrophySvg(trophy.iconType)}
            </div>
          </div>

          {/* "x N" pill badge underneath instead of year */}
          <div className="mt-1.5 flex flex-col items-center gap-0.5 max-w-[90px]">
            <span className="text-[10px] font-black text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-2 py-0.5 rounded-full border border-amber-200 tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.6)]">
              x {totalCount}
            </span>
            <span className="text-[9.5px] font-bold text-amber-200/90 truncate w-full text-center">
              {trophy.name}
            </span>
            <span className="text-[8.5px] font-medium text-slate-400 truncate w-full text-center">
              {winningTeam.name}
            </span>
          </div>
        </div>
      ) : (
        /* Expanded view: spread out across cabinet showing all individual trophies with their year */
        <div className="flex items-end gap-2.5 p-2 rounded-xl bg-slate-950/95 border-2 border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-95 duration-200 relative select-none">
          {/* Title tag above expanded container */}
          <div className="absolute -top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow border border-amber-200 whitespace-nowrap">
            {trophy.name} ({totalCount}x • {winningTeam.name})
          </div>

          {years.map((yearStr, idx) => (
            <div
              key={`${trophy.id}-sub-${idx}`}
              className="group/sub relative flex flex-col items-center shrink-0 cursor-pointer p-1 rounded-lg hover:bg-slate-900 transition-all select-none"
              onMouseEnter={() => setActiveSubIndex(idx)}
              onMouseLeave={() => setActiveSubIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSpotlight(trophy, yearStr, winningTeam.name, years);
              }}
              title="Click to take trophy out and inspect"
            >
              {/* Tooltip for specific year trophy */}
              <div
                className={`absolute bottom-[calc(100%+8px)] z-50 bg-slate-950/95 text-white text-[11px] font-medium px-3.5 py-2.5 rounded-xl border-2 border-amber-400 shadow-[0_4px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.5)] whitespace-nowrap transition-all duration-150 pointer-events-none ${
                  activeSubIndex === idx ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
                }`}
              >
                <div className="text-amber-300 font-black flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{trophy.name}</span>
                </div>
                <div className="text-slate-200 text-[10.5px] font-bold pt-1 flex items-center gap-1">
                  <span className="text-slate-400 font-normal">Won with:</span>
                  <span className="text-amber-200 font-black">{winningTeam.name}</span>
                </div>
                <div className="text-amber-100 text-[10px] font-bold pt-0.5">
                  Edition #{idx + 1} • Year: <strong className="text-white font-mono">{yearStr}</strong>
                </div>
                <div className="text-[9.5px] text-amber-400/90 pt-1 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Click to inspect in 3D spotlight
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-amber-400" />
              </div>

              {/* Individual Trophy Icon */}
              <div className="transition-transform duration-200 group-hover/sub:scale-120 group-hover/sub:-translate-y-1 flex items-center justify-center min-h-[40px]">
                {renderTrophySvg(trophy.iconType)}
              </div>

              {/* Individual Year Tag Underneath */}
              <span className="mt-1 text-[9.5px] font-black text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/40 tracking-tight shadow group-hover/sub:border-amber-400">
                {yearStr}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrophyCabinet({ trophies = [], onChangeTrophies, readOnly = false, player, onOpenChampionCelebration }: TrophyCabinetProps) {
  const { isTestMode } = useTestMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [spotlightData, setSpotlightData] = useState<{
    trophy: TrophyItem;
    selectedYear: string;
    teamName: string;
    allYears: string[];
  } | null>(null);

  const handleTriggerPresetCelebration = (type: 'standard' | 'double' | 'triple' | 'treble' | 'ucl' | 'world_cup') => {
    if (!onOpenChampionCelebration) return;

    const club = player?.club || 'Kensington United';
    const name = player?.name || 'Your Player';

    if (type === 'treble') {
      onOpenChampionCelebration({
        titleName: 'UEFA Champions League',
        trophyType: 'ucl',
        seasonYear: 2026,
        clubName: club,
        isTreble: true,
        seasonTrophiesList: ['Premier League', 'FA Cup', 'UEFA Champions League'],
        finalScore: '3 - 1',
        opponentName: 'Real Madrid',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 82,
          matchesPlayed: 48,
          goals: 38,
          assists: 19,
          avgRating: 8.9,
          keyContributionText: `A monumental Treble campaign leading ${club} to win the Premier League, FA Cup, and UEFA Champions League in the exact same season!`,
        },
      });
    } else if (type === 'world_cup') {
      onOpenChampionCelebration({
        titleName: 'FIFA World Cup',
        trophyType: 'world_cup',
        seasonYear: 2026,
        clubName: player?.nationality?.name || 'National Team',
        isWorldCup: true,
        finalScore: '2 - 1',
        opponentName: 'France',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 85,
          matchesPlayed: 7,
          goals: 8,
          assists: 4,
          avgRating: 9.2,
          keyContributionText: `Lifting the ultimate international prize! ${name} scored 8 goals in 7 matches to bring the FIFA World Cup home!`,
        },
      });
    } else if (type === 'ucl') {
      onOpenChampionCelebration({
        titleName: 'UEFA Champions League',
        trophyType: 'ucl',
        seasonYear: 2026,
        clubName: club,
        isUcl: true,
        finalScore: '2 - 0',
        opponentName: 'Bayern Munich',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 84,
          matchesPlayed: 13,
          goals: 12,
          assists: 6,
          avgRating: 8.7,
          keyContributionText: `Conquering Europe under the lights! ${name} scored the decisive opening goal in the Champions League final.`,
        },
      });
    } else if (type === 'triple') {
      onOpenChampionCelebration({
        titleName: 'Domestic & European Triple',
        trophyType: 'league',
        seasonYear: 2026,
        clubName: club,
        isTriple: true,
        seasonTrophiesList: ['League Title', 'League Cup', 'Europa League'],
        finalScore: '2 - 1',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 80,
          matchesPlayed: 52,
          goals: 29,
          assists: 14,
          avgRating: 8.5,
          keyContributionText: `A dominant three-trophy sweep across all domestic and European fixtures!`,
        },
      });
    } else if (type === 'double') {
      onOpenChampionCelebration({
        titleName: 'National League & Cup Double',
        trophyType: 'league',
        seasonYear: 2026,
        clubName: club,
        isDouble: true,
        seasonTrophiesList: ['National League', 'National Cup'],
        finalScore: '3 - 0',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 78,
          matchesPlayed: 42,
          goals: 24,
          assists: 11,
          avgRating: 8.3,
          keyContributionText: `Capturing both domestic trophies in a brilliant dual-silverware campaign.`,
        },
      });
    } else {
      onOpenChampionCelebration({
        titleName: 'National League Championship',
        trophyType: 'league',
        seasonYear: 2026,
        clubName: club,
        finalScore: '38 Matches / 92 PTS',
        playerPerformance: {
          name,
          position: player?.position || 'ST',
          ovr: player?.ovr || 76,
          matchesPlayed: 36,
          goals: 21,
          assists: 9,
          avgRating: 8.2,
          keyContributionText: `Finishing #1 in the league standings after a ruthless season-long campaign.`,
        },
      });
    }
  };

  // Form state for adding a new trophy
  const [newTrophyName, setNewTrophyName] = useState('');
  const [newTrophyCategory, setNewTrophyCategory] = useState<TrophyItem['category']>('international');
  const [newTrophyYear, setNewTrophyYear] = useState('');
  const [newTrophyCount, setNewTrophyCount] = useState<number | undefined>(undefined);
  const [newTrophyIcon, setNewTrophyIcon] = useState<TrophyItem['iconType']>('world-cup');

  const handleAddTrophy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrophyName.trim() || !newTrophyYear.trim()) return;

    const prestigeMap: Record<TrophyItem['iconType'], number> = {
      'world-cup': 100,
      'champions-league': 95,
      'ballon-dor': 92,
      'best-player': 88,
      'golden-boot': 85,
      'continental': 82,
      'league': 80,
      'cup': 75,
      'super-cup': 70,
      'olympic-gold': 78,
      'youth-trophy': 65,
      'friendly': 60,
    } as any;

    const newItem: TrophyItem = {
      id: `trophy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newTrophyName.trim(),
      category: newTrophyCategory,
      year: newTrophyYear.trim(),
      count: newTrophyCount && newTrophyCount > 1 ? newTrophyCount : undefined,
      prestige: prestigeMap[newTrophyIcon] || 75,
      iconType: newTrophyIcon,
    };

    const updated = [...trophies, newItem];
    onChangeTrophies?.(updated);

    // Reset form
    setNewTrophyName('');
    setNewTrophyYear('');
    setNewTrophyCount(undefined);
  };

  const handleRemoveTrophy = (id: string) => {
    const updated = trophies.filter((t) => t.id !== id);
    onChangeTrophies?.(updated);
  };

  const renderTrophySvg = (iconType: TrophyItem['iconType']) => {
    switch (iconType) {
      case 'world-cup':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="wcGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>
            {/* Globe top */}
            <circle cx="18" cy="11" r="9" fill="url(#wcGold)" stroke="#fef08a" strokeWidth="1" />
            <ellipse cx="18" cy="11" rx="8" ry="4" fill="none" stroke="#854d0e" strokeWidth="0.8" opacity="0.6" />
            {/* Dual holding figures / stem */}
            <path d="M12 19 C12 28 15 32 18 32 C21 32 24 28 24 19 Z" fill="url(#wcGold)" />
            <path d="M10 20 Q14 26 18 28 Q22 26 26 20 Q24 30 18 34 Q12 30 10 20 Z" fill="#ca8a04" />
            {/* Green malachite rings base */}
            <rect x="10" y="34" width="16" height="4" rx="1" fill="#15803d" />
            <rect x="8" y="38" width="20" height="6" rx="1.5" fill="url(#wcGold)" stroke="#fef08a" strokeWidth="0.8" />
            <rect x="9" y="40" width="18" height="2" fill="#166534" />
          </svg>
        );

      case 'champions-league':
        return (
          <svg className="w-9 h-10 drop-shadow-[0_2px_8px_rgba(226,232,240,0.5)]" viewBox="0 0 38 48" fill="none">
            <defs>
              <linearGradient id="uclSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Big ears handles */}
            <path d="M7 10 C 1 12, 1 28, 12 30" stroke="url(#uclSilver)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M31 10 C 37 12, 37 28, 26 30" stroke="url(#uclSilver)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Main Cup Body */}
            <path d="M10 8 L28 8 L26 28 C26 34 12 34 12 28 Z" fill="url(#uclSilver)" stroke="#ffffff" strokeWidth="1" />
            {/* Star pattern details */}
            <polygon points="19,12 20.5,15 24,15 21,17 22,20.5 19,18.5 16,20.5 17,17 14,15 17.5,15" fill="#1e293b" opacity="0.6" />
            {/* Stem & Base */}
            <rect x="16" y="34" width="6" height="5" fill="url(#uclSilver)" />
            <rect x="11" y="39" width="16" height="5" rx="1" fill="url(#uclSilver)" stroke="#e2e8f0" strokeWidth="0.8" />
          </svg>
        );

      case 'ballon-dor':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_10px_rgba(250,204,21,0.7)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <radialGradient id="bodorGold" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fffde7" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="85%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#713f12" />
              </radialGradient>
            </defs>
            {/* Golden sphere */}
            <circle cx="18" cy="18" r="14" fill="url(#bodorGold)" stroke="#fef08a" strokeWidth="1" />
            {/* Soccer ball panel seam highlights */}
            <path d="M12 12 L18 8 L24 12 L22 19 L14 19 Z" stroke="#854d0e" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M18 18 L18 28" stroke="#854d0e" strokeWidth="1" fill="none" opacity="0.5" />
            {/* Pyramidal pedestal */}
            <path d="M14 31 L22 31 L20 37 L16 37 Z" fill="#a16207" />
            <rect x="9" y="37" width="18" height="7" rx="1" fill="#451a03" stroke="#fef08a" strokeWidth="1" />
            <rect x="11" y="39" width="14" height="3" fill="#ca8a04" />
          </svg>
        );

      case 'golden-boot':
        return (
          <svg className="w-10 h-9 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]" viewBox="0 0 44 38" fill="none">
            <defs>
              <linearGradient id="bootGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            {/* Boot shape */}
            <path d="M6 14 C10 8 18 10 24 14 L38 20 C42 22 42 26 38 27 L6 27 C4 27 3 24 4 21 Z" fill="url(#bootGold)" stroke="#fef08a" strokeWidth="0.8" />
            <path d="M10 12 L15 17 M14 10 L19 15 M18 8 L23 13" stroke="#713f12" strokeWidth="1.2" />
            {/* Studs */}
            <circle cx="8" cy="29" r="1.5" fill="#fef08a" />
            <circle cx="16" cy="29" r="1.5" fill="#fef08a" />
            <circle cx="28" cy="29" r="1.5" fill="#fef08a" />
            <circle cx="36" cy="29" r="1.5" fill="#fef08a" />
            {/* Pedestal */}
            <rect x="4" y="30" width="36" height="5" rx="1" fill="#1e293b" stroke="#eab308" strokeWidth="0.8" />
          </svg>
        );

      case 'league':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(234,179,8,0.4)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="leagueGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>
            {/* Flared trophy handles */}
            <path d="M5 12 Q2 20 10 24" stroke="url(#leagueGold)" strokeWidth="2.5" fill="none" />
            <path d="M31 12 Q34 20 26 24" stroke="url(#leagueGold)" strokeWidth="2.5" fill="none" />
            {/* Trophy Cup */}
            <path d="M8 8 L28 8 L25 28 C25 33 11 33 11 28 Z" fill="url(#leagueGold)" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="18" cy="18" r="4" fill="#713f12" opacity="0.4" />
            {/* Base */}
            <rect x="15" y="33" width="6" height="5" fill="url(#leagueGold)" />
            <rect x="9" y="38" width="18" height="6" rx="1" fill="#0f172a" stroke="#eab308" strokeWidth="0.8" />
          </svg>
        );

      case 'cup':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(203,213,225,0.4)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="cupSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <path d="M6 10 C2 12 2 22 10 24" stroke="url(#cupSilver)" strokeWidth="2.5" fill="none" />
            <path d="M30 10 C34 12 34 22 26 24" stroke="url(#cupSilver)" strokeWidth="2.5" fill="none" />
            <path d="M9 6 L27 6 L24 26 C24 31 12 31 12 26 Z" fill="url(#cupSilver)" stroke="#ffffff" strokeWidth="0.8" />
            <rect x="15" y="31" width="6" height="6" fill="url(#cupSilver)" />
            <rect x="8" y="37" width="20" height="6" rx="1" fill="#1e293b" stroke="#cbd5e1" strokeWidth="0.8" />
          </svg>
        );

      case 'europa-league':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="uelSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="uelOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            {/* Slender chalice body with octagonal flared top */}
            <path d="M9 5 L27 5 L24 24 C24 30 12 30 12 24 Z" fill="url(#uelSilver)" stroke="#ffffff" strokeWidth="0.8" />
            <path d="M14 6 L14 26 M18 6 L18 28 M22 6 L22 26" stroke="#94a3b8" strokeWidth="0.8" opacity="0.6" />
            {/* Subtle angled triangular side wings */}
            <path d="M8 8 L5 12 L10 16" stroke="url(#uelSilver)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M28 8 L31 12 L26 16" stroke="url(#uelSilver)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Hexagonal/Plinth Stem & Orange Band */}
            <rect x="14" y="30" width="8" height="5" fill="url(#uelSilver)" />
            <rect x="13" y="35" width="10" height="2.5" fill="url(#uelOrange)" rx="0.5" />
            <rect x="10" y="37.5" width="16" height="6.5" rx="1.5" fill="#1e293b" stroke="#f97316" strokeWidth="0.8" />
          </svg>
        );

      case 'libertadores':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(203,213,225,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <radialGradient id="libSphere" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </radialGradient>
              <linearGradient id="libWood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            {/* Small bronze player silhouette atop sphere */}
            <circle cx="18" cy="4" r="1.5" fill="#d97706" />
            <path d="M18 5.5 L18 10 M16 7 L20 6.5 M17 10 L15 13 M18.5 10 L21 12" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
            {/* Main Silver Globe */}
            <circle cx="18" cy="19" r="8" fill="url(#libSphere)" stroke="#ffffff" strokeWidth="0.8" />
            <path d="M12 19 C12 23 24 23 24 19" stroke="#64748b" strokeWidth="0.7" fill="none" opacity="0.6" />
            {/* Silver handles */}
            <path d="M10 16 C6 18 6 22 10 24" stroke="url(#libSphere)" strokeWidth="1.8" fill="none" />
            <path d="M26 16 C30 18 30 22 26 24" stroke="url(#libSphere)" strokeWidth="1.8" fill="none" />
            {/* Wooden Base with Badges */}
            <path d="M14 27 L22 27 L24 43 L12 43 Z" fill="url(#libWood)" stroke="#92400e" strokeWidth="0.8" />
            <rect x="13.5" y="29" width="3" height="2" rx="0.3" fill="#fef08a" opacity="0.8" />
            <rect x="19.5" y="29" width="3" height="2" rx="0.3" fill="#fef08a" opacity="0.8" />
            <rect x="13" y="33" width="3" height="2" rx="0.3" fill="#cbd5e1" opacity="0.8" />
            <rect x="20" y="33" width="3" height="2" rx="0.3" fill="#cbd5e1" opacity="0.8" />
            <rect x="13.5" y="37" width="3" height="2" rx="0.3" fill="#fef08a" opacity="0.8" />
            <rect x="19.5" y="37" width="3" height="2" rx="0.3" fill="#fef08a" opacity="0.8" />
            <rect x="10" y="43" width="16" height="3" rx="1" fill="#1e1b4b" stroke="#78350f" strokeWidth="0.8" />
          </svg>
        );

      case 'club-world-cup':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="cwcGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="cwcSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Top Chrome football */}
            <circle cx="18" cy="10" r="5" fill="url(#cwcSilver)" stroke="#ffffff" strokeWidth="0.8" />
            {/* 6 Curved gold pillars supporting football */}
            <path d="M12 14 C9 22 11 32 14 36" stroke="url(#cwcGold)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M24 14 C27 22 25 32 22 36" stroke="url(#cwcGold)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M18 15 L18 36" stroke="url(#cwcSilver)" strokeWidth="2" strokeLinecap="round" />
            {/* Heavy layered pedestal */}
            <rect x="13" y="36" width="10" height="3" fill="url(#cwcGold)" />
            <rect x="9" y="39" width="18" height="6" rx="1.5" fill="#0f172a" stroke="#eab308" strokeWidth="1" />
          </svg>
        );

      case 'super-cup':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(203,213,225,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="scSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {/* Tall elegant fluted cup */}
            <path d="M10 6 L26 6 L23 25 C23 31 13 31 13 25 Z" fill="url(#scSilver)" stroke="#ffffff" strokeWidth="0.8" />
            <path d="M7 8 Q4 14 11 18" stroke="url(#scSilver)" strokeWidth="2" fill="none" />
            <path d="M29 8 Q32 14 25 18" stroke="url(#scSilver)" strokeWidth="2" fill="none" />
            <rect x="16" y="31" width="4" height="6" fill="url(#scSilver)" />
            <rect x="10" y="37" width="16" height="6" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        );

      case 'continental':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="contSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="50%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path d="M7 10 C3 12 3 24 11 26" stroke="url(#contSilver)" strokeWidth="2.5" fill="none" />
            <path d="M29 10 C33 12 33 24 25 26" stroke="url(#contSilver)" strokeWidth="2.5" fill="none" />
            <path d="M10 7 L26 7 L24 28 C24 33 12 33 12 28 Z" fill="url(#contSilver)" stroke="#e0f2fe" strokeWidth="0.8" />
            <circle cx="18" cy="17" r="4" fill="#0284c7" opacity="0.5" />
            <rect x="15" y="33" width="6" height="5" fill="url(#contSilver)" />
            <rect x="9" y="38" width="18" height="6" rx="1" fill="#082f49" stroke="#38bdf8" strokeWidth="0.8" />
          </svg>
        );

      case 'best-player':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="platPillar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            {/* Crystal pillar facets */}
            <path d="M12 6 L24 6 L28 32 L18 36 L8 32 Z" fill="url(#platPillar)" stroke="#bae6fd" strokeWidth="1" />
            <path d="M18 6 L18 36" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <polygon points="18,12 21,18 15,18" fill="#ffffff" opacity="0.8" />
            {/* Heavy Base */}
            <rect x="7" y="36" width="22" height="7" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          </svg>
        );

      case 'olympic-gold':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <radialGradient id="goldMedal" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </radialGradient>
            </defs>
            {/* Ribbon */}
            <path d="M10 2 L18 20 L26 2" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
            <path d="M14 2 L18 16 L22 2" stroke="#2563eb" strokeWidth="3" />
            {/* Medal */}
            <circle cx="18" cy="28" r="12" fill="url(#goldMedal)" stroke="#fef08a" strokeWidth="1" />
            <circle cx="18" cy="28" r="9" fill="none" stroke="#713f12" strokeWidth="1" opacity="0.6" />
            <polygon points="18,22 20,26 24,26 21,29 22,33 18,30 14,33 15,29 12,26 16,26" fill="#713f12" opacity="0.7" />
          </svg>
        );

      case 'friendly':
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="friendlySilverRose" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="40%" stopColor="#fda4af" />
                <stop offset="80%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>
            {/* Friendly Dual handles */}
            <path d="M6 11 C2 15 2 24 10 26" stroke="url(#friendlySilverRose)" strokeWidth="2.2" fill="none" />
            <path d="M30 11 C34 15 34 24 26 26" stroke="url(#friendlySilverRose)" strokeWidth="2.2" fill="none" />
            {/* Main Friendly Cup Body */}
            <path d="M9 8 L27 8 L24 27 C24 32 12 32 12 27 Z" fill="url(#friendlySilverRose)" stroke="#ffe4e6" strokeWidth="0.8" />
            {/* Friendly Star & Laurel Emblem */}
            <circle cx="18" cy="18" r="5" fill="#4c0519" opacity="0.6" />
            <polygon points="18,14 19.5,17 22.5,17 20,19 21,22 18,20.2 15,22 16,19 13.5,17 16.5,17" fill="#fecdd3" />
            {/* Stem & Pedestal */}
            <rect x="15" y="32" width="6" height="5" fill="url(#friendlySilverRose)" />
            <rect x="8" y="37" width="20" height="6" rx="1.5" fill="#1e1b4b" stroke="#fb7185" strokeWidth="0.8" />
          </svg>
        );

      case 'youth-trophy':
      default:
        return (
          <svg className="w-8 h-10 drop-shadow-[0_2px_8px_rgba(192,132,252,0.5)]" viewBox="0 0 36 48" fill="none">
            <defs>
              <linearGradient id="youthBronze" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            <path d="M11 8 L25 8 L22 26 C22 30 14 30 14 26 Z" fill="url(#youthBronze)" stroke="#f5d0fe" strokeWidth="0.8" />
            <path d="M18 12 L20.5,17 L26,17 L21.5,20 L23,25 L18,22 L13,25 L14.5,20 L10,17 L15.5,17 Z" fill="#ffffff" opacity="0.8" />
            <rect x="15" y="30" width="6" height="6" fill="url(#youthBronze)" />
            <rect x="8" y="36" width="20" height="6" rx="1" fill="#0f172a" stroke="#c084fc" strokeWidth="0.8" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur relative overflow-hidden">
      {/* Cabinet Header & Celebration Preview Bar */}
      <div className="space-y-3 pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-2">
                Career Trophy Cabinet
              </h3>
              <p className="text-[11px] text-slate-400">
                Organized left to right by prestige across 6 competition tiers
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Manage Trophies
            </button>
          )}
        </div>

        {/* Champions Celebration Popups Quick Launchers */}
        {onOpenChampionCelebration && isTestMode && (
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Test Title Celebration Popups
              </span>
              <span className="text-[9.5px] text-slate-400">Preview full-screen news & social media press</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('standard')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-400/60 rounded-lg text-[10px] font-bold text-amber-200 transition text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                Standard Title
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('double')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-yellow-950/40 border border-slate-700 hover:border-yellow-400/60 rounded-lg text-[10px] font-bold text-yellow-300 transition text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                Double
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('triple')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-400/60 rounded-lg text-[10px] font-bold text-emerald-300 transition text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Triple
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('treble')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-amber-950/60 border border-amber-500/80 rounded-lg text-[10px] font-black text-amber-300 transition text-center cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                TREBLE 🏆
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('ucl')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-blue-950/50 border border-slate-700 hover:border-blue-400/60 rounded-lg text-[10px] font-bold text-sky-300 transition text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
                UCL
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPresetCelebration('world_cup')}
                className="px-2 py-1.5 bg-slate-900 hover:bg-yellow-950/50 border border-slate-700 hover:border-yellow-400/60 rounded-lg text-[10px] font-bold text-amber-300 transition text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Globe className="w-3 h-3 text-amber-400" />
                World Cup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5 Category Shelves */}
      <div className="space-y-4">
        {CATEGORY_CONFIGS.map((catConfig) => {
          // Filter & sort trophies for this category by prestige descending
          const catTrophies = trophies
            .filter((t) => t.category === catConfig.key)
            .sort((a, b) => b.prestige - a.prestige);

          return (
            <div key={catConfig.key} className="space-y-1.5">
              {/* Shelf Title Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${catConfig.badgeBg}`}>
                    {catConfig.title}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                    {catConfig.subtitle}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {catTrophies.length} {catTrophies.length === 1 ? 'Trophy' : 'Trophies'}
                </span>
              </div>

              {/* Wooden/Glass Shelf Surface Box */}
              <div className="relative min-h-[110px] bg-gradient-to-b from-slate-950/80 to-slate-900/90 border border-slate-800/90 rounded-xl px-3 pt-10 pb-3 flex items-end gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
                {/* Subtle shelf bottom glow edge line */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-700/20 via-amber-500/20 to-slate-700/20 rounded-b-xl" />

                {catTrophies.length === 0 ? (
                  <div className="w-full py-3 text-center text-xs text-slate-500 italic flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-600" />
                    No trophies unlocked yet in this category
                  </div>
                ) : (
                  catTrophies.map((trophy) => (
                    <TrophyShelfItem
                      key={trophy.id}
                      trophy={trophy}
                      player={player}
                      renderTrophySvg={renderTrophySvg}
                      onOpenSpotlight={(tItem, sYear, tName, aYears) => {
                        setSpotlightData({
                          trophy: tItem,
                          selectedYear: sYear,
                          teamName: tName,
                          allYears: aYears,
                        });
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Drawer for Managing Trophies */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  Trophy Cabinet Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Trophy Form */}
            <form onSubmit={handleAddTrophy} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add New Trophy
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Trophy Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., FIFA World Cup, La Liga, Ballon d'Or"
                    value={newTrophyName}
                    onChange={(e) => setNewTrophyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newTrophyCategory}
                    onChange={(e) => setNewTrophyCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="national">1. National (Leagues & Domestic Cups)</option>
                    <option value="continental">2. Continental (UCL, Euros, Libertadores)</option>
                    <option value="international">3. International (World Cup, Club WC)</option>
                    <option value="youth">4. Youth (U-20, U-17, Olympic Gold)</option>
                    <option value="individual">5. Individual (Ballon d'Or, Golden Boot)</option>
                    <option value="friendly">6. Friendly (Pre-Season Cups, U17/U20/Reserves Silverware)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Year / Years</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2022 or 2009, 2011, 2015"
                    value={newTrophyYear}
                    onChange={(e) => setNewTrophyYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Trophy Shape / Icon</label>
                  <select
                    value={newTrophyIcon}
                    onChange={(e) => setNewTrophyIcon(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="world-cup">World Cup Pillar Trophy</option>
                    <option value="champions-league">Big Ears Cup (UCL/Euros)</option>
                    <option value="europa-league">Europa League Silver Vessel</option>
                    <option value="libertadores">Copa Libertadores Sphere</option>
                    <option value="club-world-cup">FIFA Club World Cup</option>
                    <option value="super-cup">Super Cup Fluted Chalice</option>
                    <option value="continental">Continental Championship Cup</option>
                    <option value="ballon-dor">Ballon d'Or Sphere</option>
                    <option value="golden-boot">Golden Boot</option>
                    <option value="league">League Championship Cup</option>
                    <option value="cup">Domestic/Local Cup</option>
                    <option value="best-player">Best Player Crystal Pillar</option>
                    <option value="olympic-gold">Olympic Gold Medal</option>
                    <option value="youth-trophy">Youth Cup</option>
                    <option value="friendly">Friendly & Pre-Season Cup</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition shadow cursor-pointer"
                >
                  + Add to Cabinet
                </button>
              </div>
            </form>

            {/* List of Existing Trophies with Delete Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Current Trophies ({trophies.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {trophies.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2 text-center">No trophies in cabinet.</div>
                ) : (
                  trophies.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          {renderTrophySvg(t.iconType)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{t.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {t.category.toUpperCase()} • {t.year}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTrophy(t.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition"
                        title="Delete Trophy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition"
              >
                Close Cabinet Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TROPHY SPOTLIGHT INSPECTION MODAL ================= */}
      {spotlightData && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={() => setSpotlightData(null)}
        >
          <div
            className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Spotlight Glow Beam */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-amber-400/25 via-yellow-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header / Close Bar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-black uppercase text-amber-300 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Trophy Inspection</span>
              </div>
              <button
                type="button"
                onClick={() => setSpotlightData(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition cursor-pointer"
                title="Return to Cabinet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Showcase Centerpiece / Pedestal */}
            <div className="relative py-8 my-3 flex flex-col items-center justify-center z-10 w-full">
              {/* Radial background pedestal illumination */}
              <div className="absolute w-44 h-44 rounded-full bg-radial from-amber-500/25 via-yellow-500/10 to-transparent blur-xl pointer-events-none" />

              {/* Large Trophy SVG */}
              <div className="relative z-10 transform scale-[2.5] drop-shadow-[0_15px_35px_rgba(245,158,11,0.7)] my-6 transition-all duration-300">
                {renderTrophySvg(spotlightData.trophy.iconType)}
              </div>

              {/* Circular Pedestal Base */}
              <div className="w-36 h-4 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent rounded-full blur-[1px] mt-4" />
            </div>

            {/* Engraved Presentation Plaque */}
            <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative z-10 shadow-xl space-y-3.5">
              {/* Trophy Name */}
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 tracking-tight leading-snug">
                {spotlightData.trophy.name}
              </h2>

              {/* Badges Grid: Team, Year, Category */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {/* Winning Team */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200">
                  <span className="text-slate-400 text-[10.5px]">Won with:</span>
                  <span className="text-amber-300 font-extrabold">{spotlightData.teamName}</span>
                </div>

                {/* Season / Year */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs font-mono font-black text-amber-300">
                  <span className="text-amber-400/70 font-sans text-[10.5px]">Year:</span>
                  <span>{spotlightData.selectedYear}</span>
                </div>

                {/* Category & Prestige */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300">
                  <span className="capitalize text-amber-400/90">{spotlightData.trophy.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-[10.5px]">Prestige:</span>
                  <span className="text-white font-mono">{spotlightData.trophy.prestige}</span>
                </div>
              </div>

              {/* Multi-Edition Switcher (if won multiple times) */}
              {spotlightData.allYears && spotlightData.allYears.length > 1 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10.5px] font-bold uppercase text-slate-400 tracking-wider">
                    All Editions Won ({spotlightData.allYears.length}x)
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {spotlightData.allYears.map((y, idx) => (
                      <button
                        key={`${y}-${idx}`}
                        type="button"
                        onClick={() =>
                          setSpotlightData((prev) =>
                            prev ? { ...prev, selectedYear: y } : null
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          spotlightData.selectedYear === y
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Return to Cabinet Button */}
            <div className="w-full mt-4 flex justify-center z-10">
              <button
                type="button"
                onClick={() => setSpotlightData(null)}
                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to Cabinet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
