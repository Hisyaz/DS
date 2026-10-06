import React from 'react';
import { PixelBadge } from './PixelBadge';
import { PixelButton } from './PixelButton';
import {
  PixelBallIcon,
  PixelCoinIcon,
  PixelHeartIcon,
  PixelTransferIcon,
  PixelBellIcon,
} from './PixelIcons';

export interface PixelStatusBarProps {
  playerName?: string;
  clubName?: string;
  position?: string;
  age?: number;
  ovr?: number;
  currency?: number | string;
  fitness?: number; // 0 - 100
  transferNotificationsCount?: number;
  isTransferWindowOpen?: boolean;
  onTransferClick?: () => void;
  clubEmblem?: React.ReactNode;
  additionalStatus?: React.ReactNode;
  theme?: 'pitch' | 'steel' | 'arcade' | 'gold';
  className?: string;
  id?: string;
}

/**
 * 32-Bit Pixel Status Bar
 * Full-screen game header displaying player profile, club, OVR,
 * currency, segmented stamina gauge, and the transfer notification button.
 */
export const PixelStatusBar: React.FC<PixelStatusBarProps> = ({
  playerName = 'PRODIGY',
  clubName = 'Free Agent',
  position = 'ST',
  age = 16,
  ovr = 75,
  currency = '€0',
  fitness = 100,
  transferNotificationsCount = 0,
  isTransferWindowOpen = false,
  onTransferClick,
  clubEmblem,
  additionalStatus,
  theme = 'steel',
  className = '',
  id,
}) => {
  // 8-segment stamina block calculation
  const totalSegments = 8;
  const activeSegments = Math.round((Math.max(0, Math.min(100, fitness)) / 100) * totalSegments);
  const staminaColor =
    fitness >= 75
      ? 'bg-emerald-500 border-emerald-300'
      : fitness >= 45
      ? 'bg-amber-400 border-amber-300'
      : 'bg-rose-500 border-rose-300 animate-pixel-blink';

  return (
    <header
      id={id}
      className={`
        w-full select-none border-b-4 border-slate-950 bg-slate-900/95 pixel-bevel-raised
        px-2 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 shadow-[0_4px_0_0_#000]
        ${className}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Left: Player Profile & OVR */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* OVR Box */}
        <div className="flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 bg-slate-950 border-2 border-yellow-500 pixel-bevel-gold shadow-[0_2px_0_0_#000] shrink-0">
          <span className="font-pixel text-[9px] text-yellow-400 leading-none">OVR</span>
          <span className="font-pixel text-sm sm:text-base font-bold text-white pixel-text-shadow leading-none mt-0.5">
            {ovr}
          </span>
        </div>

        {/* Name & Club Info */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-pixel text-xs sm:text-sm text-slate-100 uppercase truncate pixel-text-shadow">
              {playerName}
            </span>
            <PixelBadge variant="cyan" size="xs">
              {position}
            </PixelBadge>
            <span className="hidden sm:inline-block font-arcade text-xs text-slate-400">
              Age {age}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-arcade truncate">
            {clubEmblem && <span className="shrink-0">{clubEmblem}</span>}
            <span className="truncate text-cyan-300/90">{clubName}</span>
          </div>
        </div>
      </div>

      {/* Middle/Center: Fitness Gauge & Currency */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
        {/* Segmented Stamina Gauge */}
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-1.5 text-[10px] font-pixel text-slate-300 uppercase">
            <PixelHeartIcon size={12} color="#f87171" />
            <span>FITNESS {fitness}%</span>
          </div>
          <div className="flex items-center gap-1 bg-black p-1 border border-slate-700">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-3 border ${
                  i < activeSegments ? staminaColor : 'bg-slate-900 border-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Currency / Credits */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 border-2 border-amber-950 pixel-bevel-gold">
          <PixelCoinIcon size={16} />
          <span className="font-pixel text-xs text-amber-300 font-bold">
            {currency}
          </span>
        </div>

        {additionalStatus}
      </div>

      {/* Right: Transfer Notification Button & Quick Status */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Mini Currency */}
        <div className="flex md:hidden items-center gap-1 bg-slate-950 px-2 py-1 border border-amber-900/60">
          <PixelCoinIcon size={12} />
          <span className="font-pixel text-[10px] text-amber-300 font-bold">
            {currency}
          </span>
        </div>

        {/* Transfer Notification Button */}
        {onTransferClick && (
          <PixelButton
            variant={transferNotificationsCount > 0 ? 'gold' : isTransferWindowOpen ? 'accent' : 'secondary'}
            size="sm"
            onClick={onTransferClick}
            icon={<PixelTransferIcon size={16} />}
            badge={
              transferNotificationsCount > 0 ? (
                <PixelBadge variant="red" size="xs" pulse>
                  {transferNotificationsCount}
                </PixelBadge>
              ) : isTransferWindowOpen ? (
                <PixelBadge variant="green" size="xs">
                  OPEN
                </PixelBadge>
              ) : undefined
            }
            className="font-pixel text-[10px] sm:text-xs tracking-wider"
          >
            <span className="hidden xs:inline">TRANSFERS</span>
          </PixelButton>
        )}
      </div>
    </header>
  );
};
