import React from 'react';

interface PixelIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * 32-Bit Pixel-Art SVG Icon Collection
 * Crisp, authentic, snapped to pixel grids with sharp edges.
 */

// Classic Football (Soccer Ball)
export const PixelBallIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Outer border */}
    <rect x="7" y="2" width="10" height="2" fill="#000" />
    <rect x="7" y="20" width="10" height="2" fill="#000" />
    <rect x="2" y="7" width="2" height="10" fill="#000" />
    <rect x="20" y="7" width="2" height="10" fill="#000" />
    <rect x="4" y="4" width="3" height="3" fill="#000" />
    <rect x="17" y="4" width="3" height="3" fill="#000" />
    <rect x="4" y="17" width="3" height="3" fill="#000" />
    <rect x="17" y="17" width="3" height="3" fill="#000" />
    {/* White leather panels */}
    <rect x="7" y="4" width="10" height="16" fill="#f8fafc" />
    <rect x="4" y="7" width="16" height="10" fill="#f8fafc" />
    {/* Central pentagon & seams */}
    <rect x="10" y="10" width="4" height="4" fill="#0f172a" />
    <rect x="11" y="9" width="2" height="1" fill="#0f172a" />
    <rect x="11" y="14" width="2" height="1" fill="#0f172a" />
    <rect x="9" y="11" width="1" height="2" fill="#0f172a" />
    <rect x="14" y="11" width="1" height="2" fill="#0f172a" />
    {/* Outer pentagon corner accents */}
    <rect x="5" y="11" width="2" height="2" fill="#334155" />
    <rect x="17" y="11" width="2" height="2" fill="#334155" />
    <rect x="11" y="5" width="2" height="2" fill="#334155" />
    <rect x="11" y="17" width="2" height="2" fill="#334155" />
    {/* Highlight shine */}
    <rect x="6" y="6" width="2" height="2" fill="#ffffff" />
  </svg>
);

// Trophy Cup
export const PixelTrophyIcon: React.FC<PixelIconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Cup Cup Lip & Body */}
    <rect x="6" y="3" width="12" height="2" fill="#ca8a04" />
    <rect x="7" y="5" width="10" height="6" fill="#eab308" />
    <rect x="8" y="11" width="8" height="2" fill="#eab308" />
    <rect x="9" y="13" width="6" height="2" fill="#ca8a04" />
    {/* Highlight */}
    <rect x="8" y="5" width="2" height="5" fill="#fef08a" />
    {/* Handles */}
    <rect x="4" y="4" width="2" height="5" fill="#ca8a04" />
    <rect x="18" y="4" width="2" height="5" fill="#ca8a04" />
    <rect x="5" y="8" width="2" height="2" fill="#a16207" />
    <rect x="17" y="8" width="2" height="2" fill="#a16207" />
    {/* Stem */}
    <rect x="11" y="15" width="2" height="3" fill="#a16207" />
    {/* Base Pedestal */}
    <rect x="7" y="18" width="10" height="2" fill="#334155" />
    <rect x="6" y="20" width="12" height="2" fill="#0f172a" />
    <rect x="9" y="19" width="6" height="1" fill="#94a3b8" />
  </svg>
);

// Football Boots / Cleats
export const PixelCleatIcon: React.FC<PixelIconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="4" y="10" width="4" height="4" fill="#0284c7" />
    <rect x="8" y="12" width="12" height="3" fill="#0284c7" />
    <rect x="18" y="13" width="4" height="3" fill="#0284c7" />
    <rect x="6" y="14" width="16" height="3" fill="#0369a1" />
    {/* Stripes */}
    <rect x="9" y="11" width="1" height="4" fill="#38bdf8" />
    <rect x="11" y="12" width="1" height="4" fill="#38bdf8" />
    <rect x="13" y="13" width="1" height="3" fill="#38bdf8" />
    {/* Sole & Studs */}
    <rect x="5" y="17" width="17" height="2" fill="#0f172a" />
    <rect x="6" y="19" width="2" height="2" fill="#facc15" />
    <rect x="10" y="19" width="2" height="2" fill="#facc15" />
    <rect x="17" y="19" width="2" height="2" fill="#facc15" />
    <rect x="20" y="19" width="2" height="2" fill="#facc15" />
  </svg>
);

// Football Whistle
export const PixelWhistleIcon: React.FC<PixelIconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Mouthpiece */}
    <rect x="3" y="7" width="7" height="4" fill="#94a3b8" />
    <rect x="4" y="8" width="5" height="1" fill="#f1f5f9" />
    <rect x="8" y="6" width="2" height="2" fill="#475569" />
    {/* Chamber */}
    <rect x="9" y="7" width="11" height="9" fill="#cbd5e1" />
    <rect x="18" y="9" width="3" height="5" fill="#94a3b8" />
    <rect x="11" y="9" width="7" height="5" fill="#475569" />
    <rect x="13" y="10" width="3" height="3" fill="#0f172a" />
    {/* Ring loop */}
    <rect x="20" y="10" width="2" height="3" fill="#64748b" />
  </svg>
);

// Football Jersey / Shirt
export const PixelJerseyIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#2563eb' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Collar / Neck cutout */}
    <rect x="6" y="4" width="12" height="2" fill="#0f172a" />
    <rect x="10" y="4" width="4" height="2" fill="transparent" />
    {/* Sleeves */}
    <rect x="3" y="6" width="4" height="6" fill={color} />
    <rect x="17" y="6" width="4" height="6" fill={color} />
    {/* Sleeve cuffs */}
    <rect x="3" y="11" width="4" height="1" fill="#f8fafc" />
    <rect x="17" y="11" width="4" height="1" fill="#f8fafc" />
    {/* Torso */}
    <rect x="7" y="6" width="10" height="13" fill={color} />
    {/* Stripe */}
    <rect x="11" y="6" width="2" height="13" fill="#f8fafc" />
    {/* Collar detail */}
    <rect x="9" y="4" width="2" height="2" fill="#f8fafc" />
    <rect x="13" y="4" width="2" height="2" fill="#f8fafc" />
  </svg>
);

// Shield / Club Crest
export const PixelShieldIcon: React.FC<PixelIconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="4" y="3" width="16" height="2" fill="#000" />
    <rect x="4" y="5" width="2" height="9" fill="#000" />
    <rect x="18" y="5" width="2" height="9" fill="#000" />
    <rect x="6" y="5" width="12" height="9" fill="#0284c7" />
    <rect x="6" y="14" width="12" height="2" fill="#000" />
    <rect x="6" y="14" width="12" height="2" fill="#0284c7" />
    <rect x="7" y="16" width="10" height="2" fill="#0284c7" />
    <rect x="8" y="18" width="8" height="2" fill="#0284c7" />
    <rect x="10" y="20" width="4" height="2" fill="#0284c7" />
    {/* Star / Emblem in center */}
    <rect x="11" y="8" width="2" height="5" fill="#facc15" />
    <rect x="9" y="10" width="6" height="2" fill="#facc15" />
  </svg>
);

// Pixel Retro Cursor (Right pointer ▶ or Hand)
export const PixelArrowRightIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="2" y="7" width="8" height="2" fill={color} />
    <rect x="8" y="5" width="2" height="6" fill={color} />
    <rect x="10" y="6" width="2" height="4" fill={color} />
    <rect x="12" y="7" width="2" height="2" fill={color} />
  </svg>
);

export const PixelArrowLeftIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="6" y="7" width="8" height="2" fill={color} />
    <rect x="6" y="5" width="2" height="6" fill={color} />
    <rect x="4" y="6" width="2" height="4" fill={color} />
    <rect x="2" y="7" width="2" height="2" fill={color} />
  </svg>
);

// Checkmark / Confirm
export const PixelCheckIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = '#22c55e' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="2" y="8" width="2" height="3" fill={color} />
    <rect x="4" y="10" width="2" height="3" fill={color} />
    <rect x="6" y="12" width="3" height="2" fill={color} />
    <rect x="8" y="9" width="2" height="3" fill={color} />
    <rect x="10" y="6" width="2" height="3" fill={color} />
    <rect x="12" y="3" width="2" height="3" fill={color} />
  </svg>
);

// Close / Cross
export const PixelCloseIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = '#ef4444' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="4" width="2" height="2" fill={color} />
    <rect x="6" y="6" width="4" height="4" fill={color} />
    <rect x="10" y="4" width="2" height="2" fill={color} />
    <rect x="12" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="2" y="12" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
  </svg>
);

// Notification Bell
export const PixelBellIcon: React.FC<PixelIconProps> = ({ className = '', size = 18, color = '#facc15' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="9" y="2" width="2" height="2" fill={color} />
    <rect x="6" y="4" width="8" height="2" fill={color} />
    <rect x="5" y="6" width="10" height="7" fill={color} />
    <rect x="3" y="13" width="14" height="2" fill={color} />
    <rect x="8" y="15" width="4" height="2" fill="#ca8a04" />
    <rect x="7" y="6" width="2" height="4" fill="#fef08a" />
  </svg>
);

// Gold Coin / Credit
export const PixelCoinIcon: React.FC<PixelIconProps> = ({ className = '', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="5" y="1" width="8" height="2" fill="#000" />
    <rect x="5" y="15" width="8" height="2" fill="#000" />
    <rect x="1" y="5" width="2" height="8" fill="#000" />
    <rect x="15" y="5" width="2" height="8" fill="#000" />
    <rect x="3" y="3" width="12" height="12" fill="#eab308" />
    <rect x="4" y="4" width="3" height="3" fill="#fef08a" />
    <rect x="8" y="5" width="2" height="8" fill="#ca8a04" />
    <rect x="6" y="6" width="6" height="2" fill="#ca8a04" />
  </svg>
);

// Pixel Star
export const PixelStarIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="7" y="1" width="2" height="3" fill={color} />
    <rect x="6" y="4" width="4" height="2" fill={color} />
    <rect x="1" y="6" width="14" height="2" fill={color} />
    <rect x="3" y="8" width="10" height="2" fill={color} />
    <rect x="5" y="10" width="6" height="2" fill={color} />
    <rect x="4" y="12" width="2" height="3" fill={color} />
    <rect x="10" y="12" width="2" height="3" fill={color} />
  </svg>
);

// Stamina / Heart Battery
export const PixelHeartIcon: React.FC<PixelIconProps> = ({ className = '', size = 16, color = '#ef4444' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="2" y="2" width="4" height="2" fill={color} />
    <rect x="10" y="2" width="4" height="2" fill={color} />
    <rect x="1" y="4" width="14" height="4" fill={color} />
    <rect x="2" y="8" width="12" height="2" fill={color} />
    <rect x="4" y="10" width="8" height="2" fill={color} />
    <rect x="6" y="12" width="4" height="2" fill={color} />
    <rect x="7" y="14" width="2" height="1" fill={color} />
    <rect x="3" y="3" width="2" height="2" fill="#fca5a5" />
  </svg>
);

// Gamepad Controller D-Pad Icon
export const PixelGamepadIcon: React.FC<PixelIconProps> = ({ className = '', size = 18, color = '#38bdf8' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="3" y="5" width="14" height="10" fill="#334155" />
    <rect x="1" y="7" width="2" height="6" fill="#334155" />
    <rect x="17" y="7" width="2" height="6" fill="#334155" />
    {/* Dpad */}
    <rect x="4" y="8" width="5" height="2" fill="#0f172a" />
    <rect x="5" y="7" width="2" height="4" fill="#0f172a" />
    {/* Buttons */}
    <rect x="13" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="15" y="9" width="2" height="2" fill="#22c55e" />
    <rect x="11" y="9" width="2" height="2" fill="#38bdf8" />
    <rect x="13" y="11" width="2" height="2" fill="#facc15" />
  </svg>
);

// Transfer Market Handshake / Swap Arrow
export const PixelTransferIcon: React.FC<PixelIconProps> = ({ className = '', size = 18, color = '#facc15' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Top arrow right */}
    <rect x="4" y="5" width="9" height="2" fill={color} />
    <rect x="11" y="3" width="2" height="6" fill={color} />
    <rect x="13" y="4" width="2" height="4" fill={color} />
    <rect x="15" y="5" width="2" height="2" fill={color} />
    {/* Bottom arrow left */}
    <rect x="7" y="13" width="9" height="2" fill="#38bdf8" />
    <rect x="7" y="11" width="2" height="6" fill="#38bdf8" />
    <rect x="5" y="12" width="2" height="4" fill="#38bdf8" />
    <rect x="3" y="13" width="2" height="2" fill="#38bdf8" />
  </svg>
);

// Pixel Trading Cards Deck / Collection Icon
export const PixelCardsIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#60a5fa' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Back Card */}
    <rect x="3" y="2" width="12" height="16" fill="#1e293b" />
    <rect x="4" y="3" width="10" height="14" fill="#334155" />
    {/* Middle Card */}
    <rect x="6" y="4" width="12" height="16" fill="#0f172a" />
    <rect x="7" y="5" width="10" height="14" fill="#1d4ed8" />
    {/* Front Card */}
    <rect x="9" y="6" width="12" height="16" fill="#000000" />
    <rect x="10" y="7" width="10" height="14" fill="#2563eb" />
    <rect x="11" y="8" width="8" height="6" fill="#38bdf8" />
    <rect x="11" y="15" width="8" height="2" fill="#facc15" />
    <rect x="11" y="18" width="5" height="1" fill="#ffffff" />
    <rect x="17" y="8" width="2" height="2" fill="#ffffff" />
  </svg>
);

// Pixel Shop / Store Bag Icon
export const PixelShopIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#f59e0b' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Bag Handle */}
    <rect x="8" y="2" width="8" height="2" fill="#d97706" />
    <rect x="8" y="4" width="2" height="4" fill="#d97706" />
    <rect x="14" y="4" width="2" height="4" fill="#d97706" />
    {/* Bag Body */}
    <rect x="4" y="7" width="16" height="14" fill="#000000" />
    <rect x="5" y="8" width="14" height="12" fill={color} />
    {/* Highlight & Shadow */}
    <rect x="5" y="8" width="2" height="12" fill="#fde68a" />
    <rect x="17" y="8" width="2" height="12" fill="#b45309" />
    {/* Star badge on shop bag */}
    <rect x="11" y="11" width="2" height="4" fill="#ffffff" />
    <rect x="10" y="12" width="4" height="2" fill="#ffffff" />
  </svg>
);

// Pixel Sliders / Editor Studio Icon
export const PixelSlidersIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#a855f7' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Line 1 */}
    <rect x="3" y="5" width="18" height="2" fill="#334155" />
    <rect x="7" y="3" width="4" height="6" fill="#c084fc" />
    <rect x="8" y="4" width="2" height="4" fill="#ffffff" />
    {/* Line 2 */}
    <rect x="3" y="11" width="18" height="2" fill="#334155" />
    <rect x="14" y="9" width="4" height="6" fill="#c084fc" />
    <rect x="15" y="10" width="2" height="4" fill="#ffffff" />
    {/* Line 3 */}
    <rect x="3" y="17" width="18" height="2" fill="#334155" />
    <rect x="9" y="15" width="4" height="6" fill="#c084fc" />
    <rect x="10" y="16" width="2" height="4" fill="#ffffff" />
  </svg>
);

// Pixel Crown / Legend Icon
export const PixelCrownIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#eab308' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="3" y="5" width="2" height="2" fill="#ef4444" />
    <rect x="11" y="3" width="2" height="2" fill="#38bdf8" />
    <rect x="19" y="5" width="2" height="2" fill="#ef4444" />
    {/* Crown spikes */}
    <rect x="3" y="7" width="3" height="7" fill={color} />
    <rect x="19" y="7" width="3" height="7" fill={color} />
    <rect x="10" y="5" width="4" height="9" fill={color} />
    <rect x="6" y="10" width="4" height="4" fill="#ca8a04" />
    <rect x="14" y="10" width="4" height="4" fill="#ca8a04" />
    {/* Crown Base */}
    <rect x="3" y="14" width="18" height="4" fill={color} />
    <rect x="4" y="15" width="2" height="2" fill="#ef4444" />
    <rect x="8" y="15" width="2" height="2" fill="#38bdf8" />
    <rect x="11" y="15" width="2" height="2" fill="#22c55e" />
    <rect x="14" y="15" width="2" height="2" fill="#38bdf8" />
    <rect x="18" y="15" width="2" height="2" fill="#ef4444" />
    <rect x="3" y="18" width="18" height="2" fill="#a16207" />
  </svg>
);

// Pixel Sparkles
export const PixelSparklesIcon: React.FC<PixelIconProps> = ({ className = '', size = 18, color = '#facc15' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="8" y="2" width="2" height="6" fill={color} />
    <rect x="6" y="4" width="6" height="2" fill={color} />
    <rect x="8" y="4" width="2" height="2" fill="#ffffff" />

    <rect x="14" y="9" width="2" height="4" fill={color} />
    <rect x="13" y="10" width="4" height="2" fill={color} />

    <rect x="3" y="11" width="2" height="4" fill={color} />
    <rect x="2" y="12" width="4" height="2" fill={color} />
  </svg>
);

// Pixel Settings Gear Icon
export const PixelGearIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#94a3b8' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Center circle */}
    <rect x="7" y="7" width="10" height="10" fill={color} />
    <rect x="9" y="9" width="6" height="6" fill="#0f172a" />
    {/* Teeth */}
    <rect x="10" y="3" width="4" height="4" fill={color} />
    <rect x="10" y="17" width="4" height="4" fill={color} />
    <rect x="3" y="10" width="4" height="4" fill={color} />
    <rect x="17" y="10" width="4" height="4" fill={color} />
    {/* Corner teeth */}
    <rect x="5" y="5" width="3" height="3" fill={color} />
    <rect x="16" y="5" width="3" height="3" fill={color} />
    <rect x="5" y="16" width="3" height="3" fill={color} />
    <rect x="16" y="16" width="3" height="3" fill={color} />
  </svg>
);

// Pixel Music Note Icon
export const PixelMusicIcon: React.FC<PixelIconProps> = ({ className = '', size = 20, color = '#38bdf8' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`pixel-crisp ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="6" y="15" width="5" height="4" fill={color} />
    <rect x="15" y="12" width="5" height="4" fill={color} />
    <rect x="9" y="6" width="2" height="10" fill={color} />
    <rect x="18" y="4" width="2" height="9" fill={color} />
    <rect x="9" y="4" width="11" height="3" fill={color} />
  </svg>
);

