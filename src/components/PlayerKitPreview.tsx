import React, { useState, useMemo } from 'react';
import { KitConfig, EmblemConfig, PlayerCardData } from '../types';
import { EditorTeamData } from '../types/leagueEditor';
import { PlayerCard } from './PlayerCard';
import { Shirt, User, ZoomIn, Sparkles, Sliders } from 'lucide-react';

interface PlayerKitPreviewProps {
  kit: KitConfig;
  emblem: EmblemConfig;
  teamName: string;
  shortName?: string;
  team?: EditorTeamData | null;
  size?: number; // 0 to 100
  onSizeChange?: (newSize: number) => void;
  className?: string;
}

export const PlayerKitPreview: React.FC<PlayerKitPreviewProps> = ({
  kit,
  emblem,
  teamName,
  shortName,
  team,
  size = 50,
  onSizeChange,
  className = '',
}) => {
  // View mode: 'card' (full authentic player card) vs 'portrait' (focused chest & portrait studio)
  const [viewMode, setViewMode] = useState<'card' | 'portrait'>('card');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('star');

  // Realistic strength mapping (40 to 99)
  const currentSize = typeof size === 'number' && !isNaN(size) ? Math.max(0, Math.min(100, size)) : 50;
  const strengthRating = 40 + Math.round((currentSize / 100) * 55);

  // Available players from the team roster
  const squadPlayers = useMemo(() => {
    const rawSlots = team?.squadSaveFile?.squad || [];
    const players: PlayerCardData[] = [];
    for (const slot of rawSlots) {
      if (slot?.player && slot.player.name && slot.player.name !== 'Empty Spot') {
        players.push(slot.player);
      }
    }
    return players;
  }, [team]);

  // Construct representative or chosen squad player using the exact PlayerCardData schema
  const previewPlayer: PlayerCardData = useMemo(() => {
    const activeKit = { ...kit };

    if (selectedPlayerId !== 'star' && squadPlayers.length > 0) {
      const found = squadPlayers.find((p) => p.id === selectedPlayerId);
      if (found) {
        return {
          ...found,
          useDirectKit: true,
          isKitPreview: true,
          _forceKit: true,
          overrideKit: true,
          kit: activeKit,
          emblem: emblem,
          club: teamName || found.club || 'Club',
          biometrics: {
            ...found.biometrics,
            strength: strengthRating,
          },
        } as any;
      }
    }

    // Default authentic club star player
    const countryCode = team?.countryCode || 'ENG';
    const countryName = team?.countryName || 'England';

    const defaultCard: any = {
      id: `preview_${team?.id || 'club_star'}`,
      name: shortName ? `${shortName} STAR` : teamName ? `${teamName.slice(0, 10).toUpperCase()} #10` : 'CLUB STAR',
      ovr: team?.overallRating || 84,
      overallRating: team?.overallRating || 84,
      position: 'ST',
      subPosition: 'ST',
      club: teamName || 'Club',
      useDirectKit: true,
      isKitPreview: true,
      _forceKit: true,
      overrideKit: true,
      nationality: {
        code: countryCode.slice(0, 3).toUpperCase(),
        iso: countryCode.length === 2 ? countryCode.toLowerCase() : 'gb-eng',
        name: countryName,
      },
      preferredFoot: 'Right',
      weakFootStars: 4,
      age: 24,
      stats: {
        pro: 84,
        def: 58,
        cre: 82,
        men: 80,
        goa: 86,
        phy: strengthRating,
      },
      biometrics: {
        skinColor: '#e0ac69',
        strength: strengthRating,
        height: 183,
        weight: 77,
        hairStyle: 'fade',
        hairColor: '#18181b',
        hairDye: 'none',
        facialHairStyle: 'stubble-light',
        facialHairColor: '#18181b',
        hairLength: 'short',
        hairRoot: '#18181b',
      },
      accessories: {
        wristbandL: 'none',
        wristbandR: 'none',
        tattooArmL: 'none',
        tattooArmR: 'none',
        necklace: 'none',
        headwear: 'none',
        eyewear: 'none',
      },
      kit: activeKit,
      emblem: emblem,
      marketValue: 45000000,
    };

    return defaultCard as PlayerCardData;
  }, [selectedPlayerId, squadPlayers, kit, emblem, teamName, shortName, team, strengthRating]);

  return (
    <div
      className={`bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center select-none ${className}`}
    >
      {/* HEADER CONTROLS: VIEW TOGGLE & SQUAD PLAYER SELECTOR */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Shirt className="w-4 h-4 text-cyan-400" />
          <span>Player Kit Model</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 font-black rounded-md border border-cyan-500/30">
            Card Model
          </span>
        </div>

        {/* VIEW MODE TOGGLE BUTTONS */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
              viewMode === 'card'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Card
          </button>
          <button
            type="button"
            onClick={() => setViewMode('portrait')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'portrait'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ZoomIn className="w-3 h-3" />
            Portrait Focus
          </button>
        </div>
      </div>

      {/* SQUAD PLAYER SELECTION DROPDOWN (IF TEAM HAS SQUAD) */}
      {squadPlayers.length > 0 && (
        <div className="w-full mb-3 flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            Model:
          </label>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 focus:border-cyan-500 cursor-pointer"
          >
            <option value="star">★ Club Star Player (#10)</option>
            {squadPlayers.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.position || 'ST'} • {p.overallRating || p.ovr || 75} OVR)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* AUTHENTIC PLAYER CARD RENDERING CONTAINER */}
      <div className="w-full flex justify-center items-center py-2 overflow-hidden min-h-[380px]">
        {viewMode === 'card' ? (
          /* FULL CARD VIEW WITH SMOOTH DYNAMIC SCALING */
          <div className="relative transform origin-top transition-transform duration-200 scale-[0.88] sm:scale-[0.95]">
            <PlayerCard
              key={`card-${kit.color1}-${kit.color2}-${kit.pattern}-${kit.collar}-${kit.style}-${selectedPlayerId}`}
              player={previewPlayer}
              hideTeam={false}
              className="shadow-2xl ring-1 ring-white/10 rounded-[20px]"
            />
          </div>
        ) : (
          /* PORTRAIT FOCUS VIEW: CROPPED TO UPPER CHEST, COLLAR & SPONSOR */
          <div className="relative w-[280px] h-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/30 shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />
            <div className="relative transform -translate-y-8 scale-[1.08] transition-transform duration-200">
              <PlayerCard
                key={`portrait-${kit.color1}-${kit.color2}-${kit.pattern}-${kit.collar}-${kit.style}-${selectedPlayerId}`}
                player={previewPlayer}
                hideTeam={false}
                hidePosition={true}
                hideNationality={true}
              />
            </div>
            {/* Overlay badge with kit pattern and sponsor */}
            <div className="absolute bottom-2 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] shadow-lg">
              <span className="font-bold text-slate-300 truncate">
                {kit.collar?.toUpperCase()} • {kit.pattern?.toUpperCase()}
              </span>
              <span className="font-mono text-cyan-400 font-black text-[10px]">
                {strengthRating} STR
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BIOMETRIC MUSCLE STRENGTH & BUILD SLIDER */}
      {onSizeChange && (
        <div className="w-full mt-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <Sliders className="w-3 h-3 text-cyan-400" />
              Player Physique & Muscle Build
            </span>
            <span className="font-mono font-bold text-cyan-300 text-xs">
              {strengthRating} STR ({currentSize}%)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Slender (40)</span>
            <span>Athletic (70)</span>
            <span>Muscular (95+)</span>
          </div>
        </div>
      )}
    </div>
  );
};
