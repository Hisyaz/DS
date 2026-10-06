import React from 'react';
import { ProfileAvatarColor, PROFILE_COLORS } from '../types/profile';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  color: ProfileAvatarColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  className?: string;
  onClick?: () => void;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-[9px]', ring: 'border-[1.5px]' },
  sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5', text: 'text-[11px]', ring: 'border-2' },
  md: { box: 'w-9 h-9', icon: 'w-4 h-4', text: 'text-xs', ring: 'border-2' },
  lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base', ring: 'border-[2.5px]' },
  xl: { box: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-xl', ring: 'border-[3px]' },
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  color,
  size = 'md',
  name,
  className = '',
  onClick,
  showGlow = true,
}) => {
  const config = PROFILE_COLORS[color] || PROFILE_COLORS.blue;
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const initial = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative rounded-full flex items-center justify-center shrink-0 select-none overflow-hidden transition-all duration-200 ${
        sizeConfig.box
      } ${sizeConfig.ring} ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`}
      style={{
        backgroundColor: config.bgHex,
        borderColor: config.borderHex,
        boxShadow: showGlow ? `0 0 10px ${config.glowHex}` : undefined,
        color: config.textHex,
      }}
      title={name ? `Profile: ${name}` : `Avatar (${config.label})`}
    >
      {/* Glossy / 3D Retro Highlight Arc */}
      <span className="absolute top-0 inset-x-0 h-1/2 rounded-t-full bg-white/20 pointer-events-none" />

      {/* Center Initial or Retro Icon */}
      {initial ? (
        <span className={`font-arcade font-black leading-none drop-shadow ${sizeConfig.text}`}>
          {initial}
        </span>
      ) : (
        <User className={`${sizeConfig.icon} opacity-90 drop-shadow`} />
      )}
    </div>
  );
};
