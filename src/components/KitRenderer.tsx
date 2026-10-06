import React from 'react';
import { KitConfig, EmblemConfig, SponsorDesignConfig } from '../types';
import { CustomEmblem } from './CustomEmblem';
import { EditorTeamData } from '../types/leagueEditor';
import { resolveEffectiveSponsor, formatSponsorLines } from '../utils/uniformSponsorSystem';

export interface KitRendererProps {
  kit: KitConfig;
  emblem?: EmblemConfig;
  team?: EditorTeamData | null;
  sponsorName?: string;
  showSponsor?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const KitRenderer: React.FC<KitRendererProps> = ({
  kit,
  emblem,
  team,
  sponsorName,
  showSponsor = true,
  size = 'md',
  className = '',
}) => {
  const { color1, color2, pattern, collar = 'crew' } = kit;

  // Resolve effective sponsor configuration
  const resolvedSponsor: SponsorDesignConfig | null = showSponsor
    ? resolveEffectiveSponsor(kit, team, sponsorName)
    : null;

  // Size mapping
  const sizeClasses = {
    xs: 'w-12 h-14',
    sm: 'w-20 h-24',
    md: 'w-32 h-36',
    lg: 'w-44 h-52',
    xl: 'w-56 h-64',
  };

  const containerClass = sizeClasses[size] || sizeClasses.md;

  // Unique pattern identifiers to prevent SVG defs collision
  const baseKey = `${color1.replace('#', '')}-${color2.replace('#', '')}`;
  const stripePatternId = `kit-stripe-${baseKey}`;
  const checkPatternId = `kit-check-${baseKey}`;
  const hoopsPatternId = `kit-hoops-${baseKey}`;

  // Sponsor typography & formatting
  const effectiveSponsorText = resolvedSponsor?.name || '';
  const writingStyle = resolvedSponsor?.writingStyle || 'bold';
  const letterColor = resolvedSponsor?.letterColor || '#ffffff';
  const borderStyle = resolvedSponsor?.borderStyle || 'none';
  const borderColor = resolvedSponsor?.borderColor || '#000000';

  // Compute font styling attributes for SVG text
  let fontFamily = 'system-ui, -apple-system, sans-serif';
  let fontWeight: string | number = 800;
  let letterSpacing = '1.2';
  let textTransform: 'uppercase' | 'none' = 'uppercase';

  switch (writingStyle) {
    case 'classic':
      fontFamily = 'Times New Roman, Georgia, serif';
      fontWeight = 700;
      letterSpacing = '1.8';
      break;
    case 'modern':
      fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      fontWeight = 700;
      letterSpacing = '1.2';
      break;
    case 'bold':
      fontFamily = 'Impact, Arial Black, sans-serif';
      fontWeight = 900;
      letterSpacing = '0.8';
      break;
    case 'condensed':
      fontFamily = '"Arial Narrow", "Helvetica Neue Condensed", Oswald, sans-serif';
      fontWeight = 800;
      letterSpacing = '-0.2';
      break;
    case 'elegant':
      fontFamily = 'Didot, "Playfair Display", Georgia, serif';
      fontWeight = 600;
      letterSpacing = '3.0';
      break;
    case 'athletic':
      fontFamily = 'ui-monospace, SFMono-Regular, "Courier New", monospace';
      fontWeight = 900;
      letterSpacing = '1.5';
      break;
  }

  // Border calculation for SVG stroke
  let strokeWidth = 0;
  if (borderStyle === 'thin') strokeWidth = 0.8;
  if (borderStyle === 'medium') strokeWidth = 1.6;
  if (borderStyle === 'thick') strokeWidth = 2.6;

  const isOutline = borderStyle === 'outline';
  const textFill = isOutline ? 'transparent' : letterColor;
  const textStroke = isOutline ? (borderColor || letterColor) : borderColor;
  // If borderStyle is none, provide a subtle 0.5px contrast outline so text doesn't blend into jersey patterns
  const effectiveStrokeWidth = isOutline ? 1.2 : borderStyle === 'none' ? 0.4 : strokeWidth;
  const effectiveStrokeColor = borderStyle === 'none' ? (letterColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff') : textStroke;

  // Clump words: one word per line, unless two small words (e.g. combined <= 9-10 chars)
  const sponsorLines = formatSponsorLines(effectiveSponsorText, 10);
  const lineCount = sponsorLines.length;

  // Responsive font size and vertical layout based on line count and max line length
  const maxLineLength = sponsorLines.reduce((max, l) => Math.max(max, l.length), 0);
  let fontSize = 11.5;
  let lineGap = 13;
  let startBaseY = pattern === 'horizontal-middle-strip' ? 120 : 118;

  if (lineCount === 1) {
    if (maxLineLength > 12) fontSize = 9.0;
    else if (maxLineLength > 8) fontSize = 10.5;
    else if (maxLineLength <= 4) fontSize = 13.0;
    else fontSize = 12.0;
    startBaseY = pattern === 'horizontal-middle-strip' ? 120 : 118;
  } else if (lineCount === 2) {
    if (maxLineLength > 10) fontSize = 9.0;
    else if (maxLineLength > 7) fontSize = 10.0;
    else fontSize = 11.0;
    lineGap = 12.5;
    startBaseY = pattern === 'horizontal-middle-strip' ? 114 : 112;
  } else {
    // 3 lines
    fontSize = maxLineLength > 8 ? 7.8 : 8.5;
    lineGap = 10.5;
    startBaseY = pattern === 'horizontal-middle-strip' ? 108 : 106;
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${containerClass} ${className}`}>
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full drop-shadow-xl filter"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vertical Stripes Pattern */}
          <pattern
            id={stripePatternId}
            width="26"
            height="220"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="13" height="220" fill={color1} />
            <rect x="13" y="0" width="13" height="220" fill={color2} />
          </pattern>

          {/* Horizontal Hoops Pattern */}
          <pattern
            id={hoopsPatternId}
            width="200"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="200" height="12" fill={color1} />
            <rect x="0" y="12" width="200" height="12" fill={color2} />
          </pattern>

          {/* Checkered Pattern */}
          <pattern
            id={checkPatternId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="11" height="11" fill={color1} />
            <rect x="11" y="0" width="11" height="11" fill={color2} />
            <rect x="0" y="11" width="11" height="11" fill={color2} />
            <rect x="11" y="11" width="11" height="11" fill={color1} />
          </pattern>

          {/* Gradient Pattern */}
          <linearGradient id={`kit-gradient-${baseKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>

          {/* Modern Athletic Torso Clip Path */}
          <clipPath id="torso-clip">
            <path d="M 74 26 Q 100 36 126 26 L 160 40 L 150 64 L 146 200 Q 100 206 54 200 L 50 64 L 40 40 Z" />
          </clipPath>

          {/* Left Sleeve Clip */}
          <clipPath id="left-sleeve-clip">
            <path d="M 74 26 L 40 40 L 14 96 L 38 108 L 50 64 Z" />
          </clipPath>

          {/* Right Sleeve Clip */}
          <clipPath id="right-sleeve-clip">
            <path d="M 126 26 L 160 40 L 186 96 L 162 108 L 150 64 Z" />
          </clipPath>

          {/* Realistic Fabric Lighting Overlay */}
          <linearGradient id="jersey-lighting" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
          </linearGradient>

          {/* Sleeve Ambient Shading */}
          <linearGradient id="sleeve-lighting" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* 1. LEFT SLEEVE */}
        <g clipPath="url(#left-sleeve-clip)">
          <rect
            x="0"
            y="0"
            width="80"
            height="120"
            fill={pattern === 'raglan-shoulders' ? color2 : (pattern === 'two-colors' || pattern === 'halves' ? color1 : color1)}
          />
          {pattern === 'stripes' && (
            <rect x="0" y="0" width="80" height="120" fill={`url(#${stripePatternId})`} />
          )}
          {pattern === 'hoops' && (
            <rect x="0" y="0" width="80" height="120" fill={`url(#${hoopsPatternId})`} />
          )}
          {pattern === 'checkered' && (
            <rect x="0" y="0" width="80" height="120" fill={`url(#${checkPatternId})`} />
          )}
          {pattern === 'gradient' && (
            <rect x="0" y="0" width="80" height="120" fill={`url(#kit-gradient-${baseKey})`} />
          )}
          {/* Left Sleeve Cuff / Athletic Trim */}
          <polygon points="14 96, 38 108, 34 114, 10 102" fill={color2} />
          {/* Lighting Overlay */}
          <rect x="0" y="0" width="80" height="120" fill="url(#sleeve-lighting)" />
        </g>

        {/* 2. RIGHT SLEEVE */}
        <g clipPath="url(#right-sleeve-clip)">
          <rect
            x="120"
            y="0"
            width="80"
            height="120"
            fill={pattern === 'raglan-shoulders' ? color2 : (pattern === 'two-colors' || pattern === 'halves' ? color2 : color1)}
          />
          {pattern === 'stripes' && (
            <rect x="120" y="0" width="80" height="120" fill={`url(#${stripePatternId})`} />
          )}
          {pattern === 'hoops' && (
            <rect x="120" y="0" width="80" height="120" fill={`url(#${hoopsPatternId})`} />
          )}
          {pattern === 'checkered' && (
            <rect x="120" y="0" width="80" height="120" fill={`url(#${checkPatternId})`} />
          )}
          {pattern === 'gradient' && (
            <rect x="120" y="0" width="80" height="120" fill={`url(#kit-gradient-${baseKey})`} />
          )}
          {/* Right Sleeve Cuff / Athletic Trim */}
          <polygon points="186 96, 162 108, 166 114, 190 102" fill={color2} />
          {/* Lighting Overlay */}
          <rect x="120" y="0" width="80" height="120" fill="url(#sleeve-lighting)" />
        </g>

        {/* 3. MAIN TORSO / CHEST BODY */}
        <g clipPath="url(#torso-clip)">
          {/* Base Background Fill */}
          <rect x="30" y="10" width="140" height="200" fill={color1} />

          {/* Pattern: Vertical Stripes */}
          {pattern === 'stripes' && (
            <rect x="30" y="10" width="140" height="200" fill={`url(#${stripePatternId})`} />
          )}

          {/* Pattern: Horizontal Hoops */}
          {pattern === 'hoops' && (
            <rect x="30" y="10" width="140" height="200" fill={`url(#${hoopsPatternId})`} />
          )}

          {/* Pattern: Checkered */}
          {pattern === 'checkered' && (
            <rect x="30" y="10" width="140" height="200" fill={`url(#${checkPatternId})`} />
          )}

          {/* Pattern: Diagonal Sash */}
          {(pattern === 'sash' || pattern === 'diagonal') && (
            <polygon
              points="140 20, 166 20, 52 205, 26 205"
              fill={color2}
            />
          )}

          {/* Pattern: Solid Line (Center Vertical Stripe) */}
          {pattern === 'solid-line' && (
            <g>
              {/* Outer accent trim pinstripes */}
              <rect x="80" y="10" width="40" height="200" fill={color2} opacity="0.25" />
              {/* Bold central solid line */}
              <rect x="84" y="10" width="32" height="200" fill={color2} />
              <line x1="84" y1="10" x2="84" y2="210" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="116" y1="10" x2="116" y2="210" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
            </g>
          )}

          {/* Pattern: Two Colors / Halves (Vertical Half Split) */}
          {(pattern === 'two-colors' || pattern === 'halves') && (
            <rect x="100" y="10" width="70" height="200" fill={color2} />
          )}

          {/* Pattern: Horizontal Middle Strip (Classic South American Chest Band) */}
          {pattern === 'horizontal-middle-strip' && (
            <g>
              {/* Prominent Center Chest Band */}
              <rect x="30" y="96" width="140" height="38" fill={color2} />
              {/* Top and Bottom Accent Trim Borders */}
              <line x1="30" y1="96" x2="170" y2="96" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="30" y1="134" x2="170" y2="134" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
            </g>
          )}

          {/* Pattern: Raglan Shoulders */}
          {pattern === 'raglan-shoulders' && (
            <>
              <polygon points="74 26, 100 36, 40 40" fill={color2} />
              <polygon points="126 26, 100 36, 160 40" fill={color2} />
            </>
          )}

          {/* Pattern: Gradient */}
          {pattern === 'gradient' && (
            <rect x="30" y="10" width="140" height="200" fill={`url(#kit-gradient-${baseKey})`} />
          )}

          {/* Subtle Side Mesh Ventilation Seams */}
          <path d="M 54 200 L 50 64 L 53 66 L 57 200 Z" fill="#000000" opacity="0.18" />
          <path d="M 146 200 L 150 64 L 147 66 L 143 200 Z" fill="#000000" opacity="0.18" />

          {/* Realistic Fabric Lighting Overlay */}
          <rect x="30" y="10" width="140" height="200" fill="url(#jersey-lighting)" />
        </g>

        {/* SHIRT OUTLINE SEAMS */}
        <path
          d="M 74 26 Q 100 36 126 26 L 160 40 L 150 64 L 146 200 Q 100 206 54 200 L 50 64 L 40 40 Z"
          fill="none"
          stroke="#000000"
          strokeWidth="1.2"
          strokeOpacity="0.3"
        />

        {/* 4. COLLARS & NECKLINES */}
        {/* Inner Neck Shadow */}
        <ellipse cx="100" cy="26" rx="22" ry="8" fill="#090d16" opacity="0.75" />
        {/* Inner back neck fabric */}
        <path d="M 78 26 Q 100 34 122 26 Q 100 20 78 26 Z" fill={color2} opacity="0.7" />

        {/* COLLAR: Crew Neck */}
        {collar === 'crew' && (
          <g>
            <path
              d="M 74 25 Q 100 44 126 25 Q 100 35 74 25 Z"
              fill={color2}
              stroke="#000000"
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
            {/* Subtle ribbing highlight */}
            <path
              d="M 78 25 Q 100 40 122 25"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeOpacity="0.4"
            />
          </g>
        )}

        {/* COLLAR: V-Neck (Clean, Symmetrical, Natural Depth, No Gaps/Distortions) */}
        {collar === 'v-neck' && (
          <g>
            {/* Outer V band ribbon */}
            <path
              d="M 74 25 Q 84 32 98 47 L 100 50 L 102 47 Q 116 32 126 25 L 121 24 Q 112 30 100 43 Q 88 30 79 24 Z"
              fill={color2}
              stroke="#000000"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            {/* Crossover Front Tab Detail */}
            <line x1="99" y1="44" x2="100" y2="50" stroke="#000000" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="100" y1="44" x2="101" y2="50" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* COLLAR: Polo (Folded Lapels Framing Neck, Clear Neck Visibility, Center Placket & Buttons) */}
        {collar === 'polo' && (
          <g>
            {/* Center Placket */}
            <rect
              x="94"
              y="30"
              width="12"
              height="30"
              rx="1.5"
              fill={color2}
              stroke="#000000"
              strokeWidth="0.6"
              strokeOpacity="0.3"
            />
            {/* Left Polo Lapel Wing */}
            <polygon
              points="84 24, 62 38, 76 46, 94 32"
              fill={color2}
              stroke="#000000"
              strokeWidth="0.7"
              strokeOpacity="0.35"
            />
            {/* Right Polo Lapel Wing */}
            <polygon
              points="116 24, 138 38, 124 46, 106 32"
              fill={color2}
              stroke="#000000"
              strokeWidth="0.7"
              strokeOpacity="0.35"
            />
            {/* Placket Pearl Buttons */}
            <circle cx="100" cy="38" r="1.4" fill="#f8fafc" stroke="#64748b" strokeWidth="0.4" />
            <circle cx="100" cy="50" r="1.4" fill="#f8fafc" stroke="#64748b" strokeWidth="0.4" />
          </g>
        )}

        {/* 5. APPAREL BRAND MARK (PLAYER'S RIGHT CHEST / VIEWER'S LEFT SIDE) */}
        <path
          d="M 64 68 Q 69 64 74 66 Q 68 70 64 68 Z"
          fill="#ffffff"
          opacity="0.85"
          filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.6))"
        />

        {/* 6. SPONSOR LOGO / NAME (CENTERED ACROSS CHEST/MIDDLE) */}
        {effectiveSponsorText && showSponsor && (
          <g>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill={textFill}
              stroke={effectiveStrokeWidth > 0 ? effectiveStrokeColor : undefined}
              strokeWidth={effectiveStrokeWidth > 0 ? effectiveStrokeWidth : undefined}
              paintOrder="stroke fill"
              fontSize={fontSize}
              fontWeight={fontWeight}
              fontFamily={fontFamily}
              letterSpacing={letterSpacing}
              filter="drop-shadow(0px 1.5px 2px rgba(0,0,0,0.85)) drop-shadow(0px 0px 1px rgba(0,0,0,0.6))"
              style={{ textTransform: 'uppercase' }}
            >
              {sponsorLines.map((line, idx) => (
                <tspan
                  key={idx}
                  x="100"
                  y={startBaseY + idx * lineGap}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )}
      </svg>

      {/* 7. CLUB EMBLEM (PLAYER'S LEFT CHEST / VIEWER'S RIGHT SIDE) */}
      {emblem && (
        <div className="absolute top-[31%] right-[22%] translate-x-1/2 -translate-y-1/2 z-20 drop-shadow-md pointer-events-none">
          <CustomEmblem config={emblem} size="xs" />
        </div>
      )}
    </div>
  );
};
