import React from 'react';

interface LegendPixelArtCharacterProps {
  className?: string;
  isLocked?: boolean;
}

export const LegendPixelArtCharacter: React.FC<LegendPixelArtCharacterProps> = ({
  className = '',
  isLocked = false,
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Neon Halo & Atmospheric World Map Grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Soft Radial Glow */}
        <div
          className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl transition-opacity duration-700 ${
            isLocked ? 'bg-slate-500/20' : 'bg-cyan-500/25'
          }`}
        />
        {/* Subtle Pitch Floor Lighting Disc */}
        <div
          className={`absolute bottom-6 w-52 sm:w-64 h-12 rounded-full blur-md transition-colors ${
            isLocked
              ? 'bg-slate-700/30'
              : 'bg-gradient-to-r from-cyan-500/30 via-blue-500/40 to-indigo-500/30 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
          }`}
        />
      </div>

      {/* High-Resolution Crisp Pixel Art SVG */}
      <svg
        viewBox="0 0 160 220"
        className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10"
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
        }}
      >
        <defs>
          {/* Kit Pattern & Colors */}
          <linearGradient id="blaugranaStripe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a50044" />
            <stop offset="100%" stopColor="#7a0033" />
          </linearGradient>
          <linearGradient id="blaugranaBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#004d98" />
            <stop offset="100%" stopColor="#002d5b" />
          </linearGradient>
          <filter id="pixelGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= PITCH SHADOW & PARTICLES ================= */}
        <ellipse cx="80" cy="208" rx="42" ry="7" fill="#030712" opacity="0.8" />
        <ellipse cx="80" cy="208" rx="28" ry="4" fill="#000000" opacity="0.9" />

        {/* Ambient Floating Sparkle Pixels */}
        {!isLocked && (
          <g fill="#38bdf8" opacity="0.8">
            <rect x="26" y="140" width="2" height="2" />
            <rect x="34" y="165" width="2" height="2" />
            <rect x="124" y="150" width="2" height="2" />
            <rect x="130" y="125" width="2" height="2" />
            <rect x="30" y="70" width="2" height="2" opacity="0.6" />
            <rect x="128" y="80" width="2" height="2" opacity="0.6" />
            <rect x="78" y="212" width="2" height="2" fill="#67e8f9" />
            <rect x="92" y="210" width="2" height="2" fill="#67e8f9" />
          </g>
        )}

        {/* ================= LEGS & PURPLE/BLUE CLEATS ================= */}
        {/* Left Leg (Player's Right) */}
        {/* Thigh (Skin) */}
        <rect x="58" y="144" width="10" height="14" fill="#f5d0b1" />
        <rect x="56" y="146" width="3" height="10" fill="#e0b292" />
        {/* Knee & Calf */}
        <rect x="58" y="158" width="9" height="18" fill="#f5d0b1" />
        <rect x="56" y="160" width="2" height="14" fill="#e0b292" />
        {/* Socks - Blue with Red Ring */}
        <rect x="57" y="174" width="10" height="22" fill="#004d98" />
        <rect x="57" y="174" width="10" height="3" fill="#a50044" />
        <rect x="57" y="179" width="10" height="2" fill="#a50044" />
        <rect x="56" y="176" width="2" height="18" fill="#002d5b" />
        <rect x="65" y="180" width="2" height="14" fill="#1e3a8a" />
        {/* Cleats Left */}
        <path d="M 54 196 L 68 196 L 70 204 L 52 204 Z" fill="#6b21a8" />
        <rect x="52" y="202" width="18" height="4" fill="#581c87" />
        <rect x="54" y="198" width="12" height="2" fill="#9333ea" />
        <rect x="52" y="205" width="18" height="2" fill="#3b0764" />
        <rect x="54" y="206" width="3" height="2" fill="#38bdf8" />
        <rect x="64" y="206" width="3" height="2" fill="#38bdf8" />

        {/* Right Leg (Player's Left) */}
        {/* Thigh (Skin) */}
        <rect x="92" y="144" width="10" height="14" fill="#f5d0b1" />
        <rect x="101" y="146" width="3" height="10" fill="#e0b292" />
        {/* Knee & Calf */}
        <rect x="93" y="158" width="9" height="18" fill="#f5d0b1" />
        <rect x="101" y="160" width="2" height="14" fill="#e0b292" />
        {/* Socks - Blue with Red Ring */}
        <rect x="93" y="174" width="10" height="22" fill="#004d98" />
        <rect x="93" y="174" width="10" height="3" fill="#a50044" />
        <rect x="93" y="179" width="10" height="2" fill="#a50044" />
        <rect x="101" y="176" width="2" height="18" fill="#002d5b" />
        <rect x="93" y="180" width="2" height="14" fill="#1e3a8a" />
        {/* Cleats Right */}
        <path d="M 92 196 L 106 196 L 108 204 L 90 204 Z" fill="#6b21a8" />
        <rect x="90" y="202" width="18" height="4" fill="#581c87" />
        <rect x="92" y="198" width="12" height="2" fill="#9333ea" />
        <rect x="90" y="205" width="18" height="2" fill="#3b0764" />
        <rect x="92" y="206" width="3" height="2" fill="#38bdf8" />
        <rect x="102" y="206" width="3" height="2" fill="#38bdf8" />

        {/* ================= SHORTS ================= */}
        {/* Blaugrana Blue Shorts */}
        <path d="M 52 118 L 108 118 L 106 146 L 88 146 L 80 130 L 72 146 L 54 146 Z" fill="#004d98" />
        {/* Shadows & Highlights on Shorts */}
        <rect x="52" y="118" width="56" height="3" fill="#002d5b" />
        <rect x="53" y="121" width="4" height="24" fill="#002d5b" />
        <rect x="103" y="121" width="4" height="24" fill="#002d5b" />
        <rect x="76" y="124" width="8" height="10" fill="#002d5b" />
        {/* Yellow Swoosh Accent & Tiny Crest on Shorts */}
        <rect x="98" y="136" width="4" height="2" fill="#facc15" />
        <rect x="58" y="134" width="5" height="6" fill="#a50044" />
        <rect x="59" y="135" width="3" height="4" fill="#facc15" />

        {/* ================= ARMS & HANDS ================= */}
        {/* Left Arm (Player's Right) */}
        {/* Short Sleeve */}
        <rect x="42" y="66" width="14" height="18" fill="#004d98" />
        <rect x="44" y="66" width="5" height="18" fill="#a50044" />
        <rect x="42" y="82" width="14" height="3" fill="#a50044" />
        {/* Forearm (Skin) */}
        <rect x="43" y="84" width="11" height="32" fill="#f5d0b1" />
        <rect x="41" y="86" width="3" height="28" fill="#e0b292" />
        {/* Hand */}
        <rect x="43" y="116" width="9" height="10" fill="#f5d0b1" />
        <rect x="41" y="118" width="2" height="6" fill="#e0b292" />
        <rect x="45" y="124" width="6" height="3" fill="#e0b292" />

        {/* Right Arm (Player's Left) */}
        {/* Short Sleeve */}
        <rect x="104" y="66" width="14" height="18" fill="#004d98" />
        <rect x="111" y="66" width="5" height="18" fill="#a50044" />
        <rect x="104" y="82" width="14" height="3" fill="#a50044" />
        {/* Forearm (Skin) */}
        <rect x="106" y="84" width="11" height="32" fill="#f5d0b1" />
        <rect x="115" y="86" width="3" height="28" fill="#e0b292" />
        {/* Hand */}
        <rect x="108" y="116" width="9" height="10" fill="#f5d0b1" />
        <rect x="116" y="118" width="2" height="6" fill="#e0b292" />
        <rect x="109" y="124" width="6" height="3" fill="#e0b292" />

        {/* ================= TORSO & ICONIC BLAUGRANA JERSEY ================= */}
        {/* Base Body Fill */}
        <rect x="54" y="64" width="52" height="56" fill="#004d98" />
        
        {/* Vertical Stripes (Red/Garnet) */}
        <rect x="58" y="64" width="7" height="56" fill="#a50044" />
        <rect x="69" y="64" width="8" height="56" fill="#a50044" />
        <rect x="83" y="64" width="8" height="56" fill="#a50044" />
        <rect x="95" y="64" width="7" height="56" fill="#a50044" />

        {/* Jersey Shading & Creases */}
        <rect x="54" y="64" width="3" height="56" fill="#002d5b" opacity="0.6" />
        <rect x="103" y="64" width="3" height="56" fill="#002d5b" opacity="0.6" />
        <rect x="54" y="116" width="52" height="4" fill="#002d5b" opacity="0.4" />

        {/* Center Chest Crest Emblem */}
        <g transform="translate(73, 76)">
          <path d="M 0 0 L 14 0 L 14 10 Q 14 16 7 19 Q 0 16 0 10 Z" fill="#facc15" />
          <path d="M 1 1 L 13 1 L 13 9 Q 13 14 7 17 Q 1 14 1 9 Z" fill="#a50044" />
          {/* Inner Cross & Stripes */}
          <rect x="2" y="2" width="10" height="4" fill="#ffffff" />
          <rect x="6" y="2" width="2" height="4" fill="#dc2626" />
          <rect x="2" y="3" width="10" height="2" fill="#dc2626" />
          <rect x="2" y="6" width="10" height="6" fill="#004d98" />
          <rect x="4" y="6" width="2" height="6" fill="#a50044" />
          <rect x="8" y="6" width="2" height="6" fill="#a50044" />
          <circle cx="7" cy="13" r="1.5" fill="#facc15" />
        </g>

        {/* Yellow Collar / Trim */}
        <path d="M 70 64 L 90 64 L 84 70 L 76 70 Z" fill="#002d5b" />
        <path d="M 72 64 L 88 64 L 84 68 L 76 68 Z" fill="#facc15" />

        {/* ================= NECK & HEAD ================= */}
        {/* Neck */}
        <rect x="74" y="54" width="12" height="12" fill="#f5d0b1" />
        <rect x="72" y="56" width="3" height="9" fill="#e0b292" />
        <rect x="85" y="56" width="3" height="9" fill="#e0b292" />

        {/* Head / Face */}
        <rect x="68" y="26" width="24" height="30" fill="#f5d0b1" rx="2" />
        {/* Cheekbones & Jaw Shading */}
        <rect x="68" y="36" width="2" height="18" fill="#e0b292" />
        <rect x="90" y="36" width="2" height="18" fill="#e0b292" />
        <rect x="72" y="52" width="16" height="4" fill="#e0b292" />

        {/* Ears */}
        <rect x="64" y="36" width="4" height="9" fill="#f5d0b1" />
        <rect x="65" y="38" width="2" height="5" fill="#e0b292" />
        <rect x="92" y="36" width="4" height="9" fill="#f5d0b1" />
        <rect x="93" y="38" width="2" height="5" fill="#e0b292" />

        {/* Eyebrows */}
        <rect x="71" y="36" width="6" height="2" fill="#261408" />
        <rect x="83" y="36" width="6" height="2" fill="#261408" />

        {/* Eyes (Dark, determined, iconic gaze) */}
        <rect x="72" y="39" width="4" height="3" fill="#ffffff" />
        <rect x="73" y="39" width="3" height="3" fill="#3b220c" />
        <rect x="74" y="40" width="1" height="1" fill="#000000" />
        <rect x="84" y="39" width="4" height="3" fill="#ffffff" />
        <rect x="84" y="39" width="3" height="3" fill="#3b220c" />
        <rect x="85" y="40" width="1" height="1" fill="#000000" />

        {/* Nose */}
        <rect x="78" y="41" width="3" height="7" fill="#e0b292" />
        <rect x="77" y="47" width="5" height="2" fill="#d49e7b" />

        {/* Mouth */}
        <rect x="76" y="50" width="7" height="2" fill="#b97c59" />

        {/* ================= ICONIC MEDIUM WAVY HAIR ================= */}
        {/* Back Hair Strands */}
        <rect x="64" y="24" width="32" height="16" fill="#261408" rx="3" />
        <rect x="62" y="28" width="6" height="16" fill="#261408" />
        <rect x="92" y="28" width="6" height="16" fill="#261408" />

        {/* Top Voluminous Wavy Hair */}
        <rect x="66" y="16" width="28" height="14" fill="#3b220c" rx="4" />
        <rect x="64" y="20" width="32" height="10" fill="#3b220c" />
        
        {/* Hair Strands & Fringe Layering */}
        <rect x="66" y="22" width="7" height="14" fill="#261408" />
        <rect x="72" y="22" width="8" height="12" fill="#3b220c" />
        <rect x="78" y="22" width="8" height="14" fill="#261408" />
        <rect x="84" y="22" width="7" height="12" fill="#3b220c" />

        {/* Highlights & Texture */}
        <rect x="70" y="18" width="4" height="3" fill="#5c3818" />
        <rect x="78" y="17" width="5" height="3" fill="#5c3818" />
        <rect x="86" y="19" width="4" height="3" fill="#5c3818" />
        <rect x="65" y="24" width="3" height="4" fill="#5c3818" />
        <rect x="92" y="24" width="3" height="4" fill="#5c3818" />
        <rect x="74" y="27" width="3" height="5" fill="#5c3818" />
        <rect x="82" y="28" width="3" height="4" fill="#5c3818" />

        {/* Locked Silhouette Overlay */}
        {isLocked && (
          <rect
            x="0"
            y="0"
            width="160"
            height="220"
            fill="#0f172a"
            opacity="0.25"
            style={{ mixBlendMode: 'saturation' }}
          />
        )}
      </svg>
    </div>
  );
};
