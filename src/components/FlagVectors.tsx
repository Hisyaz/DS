import React from 'react';
import { LanguageCode } from '../utils/localizationSystem';

interface FlagComponentProps {
  className?: string;
  isHovered?: boolean;
}

// 🏳️ WHITE BLANK FLAG (Initial unselected state)
export const WhiteFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Pure crisp white fabric with subtle satin weave texture */}
    <rect width="60" height="40" fill="#FFFFFF" />
    {/* Soft fabric weave highlights */}
    <rect x="0" y="0" width="60" height="1" fill="#F8FAFC" />
    <rect x="0" y="13" width="60" height="1" fill="#F1F5F9" />
    <rect x="0" y="26" width="60" height="1" fill="#F1F5F9" />
    <rect x="0" y="39" width="60" height="1" fill="#E2E8F0" />
    <rect x="19" y="0" width="1" height="40" fill="#F8FAFC" />
    <rect x="39" y="0" width="1" height="40" fill="#F8FAFC" />
  </svg>
);

// 🇬🇧 UNITED KINGDOM FLAG (Union Jack)
export const UKFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Blue Background */}
    <rect width="60" height="40" fill="#012169" />
    {/* White Diagonals */}
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
    {/* Red Diagonals */}
    <path d="M0,0 L30,20 M60,0 L30,20 M60,40 L30,20 M0,40 L30,20" stroke="#C8102E" strokeWidth="3" />
    {/* White Cross */}
    <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
    {/* Red Cross */}
    <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
  </svg>
);

// 🇪🇸 SPAIN FLAG (Rojigualda with Crest)
export const SpainFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Red Top Stripe */}
    <rect width="60" height="10" y="0" fill="#AA151B" />
    {/* Yellow Center Stripe */}
    <rect width="60" height="20" y="10" fill="#F1BF00" />
    {/* Red Bottom Stripe */}
    <rect width="60" height="10" y="30" fill="#AA151B" />
    {/* Spanish Royal Crest / Coat of Arms */}
    <g transform="translate(18, 20) scale(0.65)">
      {/* Crown */}
      <path d="M -7 -10 L -9 -6 L -3 -7 L 0 -11 L 3 -7 L 9 -6 L 7 -10 Z" fill="#D4AF37" stroke="#8B0000" strokeWidth="0.5" />
      <circle cx="0" cy="-12" r="1.2" fill="#E60000" />
      {/* Shield */}
      <path d="M -7 -5 L 7 -5 L 7 3 C 7 8 0 11 0 11 C 0 11 -7 8 -7 3 Z" fill="#AA151B" stroke="#D4AF37" strokeWidth="1" />
      {/* Shield Quarters */}
      <rect x="-6" y="-4" width="6" height="6" fill="#C8102E" />
      <rect x="0" y="-4" width="6" height="6" fill="#FFFFFF" />
      <rect x="-6" y="2" width="6" height="6" fill="#F1BF00" />
      <rect x="0" y="2" width="6" height="6" fill="#AA151B" />
      {/* Center Bourbon Inescutcheon */}
      <ellipse cx="0" cy="1" rx="2" ry="2.5" fill="#012169" stroke="#F1BF00" strokeWidth="0.5" />
      <circle cx="0" cy="1" r="0.8" fill="#F1BF00" />
      {/* Pillars of Hercules */}
      <rect x="-11" y="-5" width="2" height="14" fill="#FFFFFF" stroke="#666" strokeWidth="0.3" rx="0.5" />
      <rect x="9" y="-5" width="2" height="14" fill="#FFFFFF" stroke="#666" strokeWidth="0.3" rx="0.5" />
    </g>
  </svg>
);

// 🇦🇷 ARGENTINA FLAG (Celeste y Blanca con Sol de Mayo)
export const ArgentinaFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Light Blue Top Stripe */}
    <rect width="60" height="13.33" y="0" fill="#75AADB" />
    {/* White Center Stripe */}
    <rect width="60" height="13.34" y="13.33" fill="#FFFFFF" />
    {/* Light Blue Bottom Stripe */}
    <rect width="60" height="13.33" y="26.67" fill="#75AADB" />
    {/* Sol de Mayo (Sun of May) */}
    <g transform="translate(30, 20)">
      {/* Sun Glow */}
      <circle cx="0" cy="0" r="4.2" fill="#F6B40E" stroke="#855B04" strokeWidth="0.4" />
      {/* Sun Rays (16 straight, 16 wavy) */}
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
        <line
          key={`ray-${i}`}
          x1="0"
          y1="-4.2"
          x2="0"
          y2="-6.8"
          stroke="#855B04"
          strokeWidth="0.8"
          strokeLinecap="round"
          transform={`rotate(${angle})`}
        />
      ))}
      {/* Face details */}
      <circle cx="-1.3" cy="-0.8" r="0.6" fill="#855B04" />
      <circle cx="1.3" cy="-0.8" r="0.6" fill="#855B04" />
      <path d="M -1.6 1.4 Q 0 2.5 1.6 1.4" fill="none" stroke="#855B04" strokeWidth="0.6" strokeLinecap="round" />
      <ellipse cx="0" cy="0.4" rx="0.4" ry="0.6" fill="#855B04" />
    </g>
  </svg>
);

// 🇧🇷 BRAZIL FLAG (Verde e Amarela con Globo Celeste)
export const BrazilFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Green Field */}
    <rect width="60" height="40" fill="#009739" />
    {/* Yellow Rhombus / Diamond */}
    <polygon points="30,4 55,20 30,36 5,20" fill="#FEDD00" />
    {/* Blue Circle / Celestial Globe */}
    <circle cx="30" cy="20" r="8.5" fill="#012169" />
    {/* White Curved Ribbon */}
    <path
      d="M 21.8 19.5 C 25 17 32 18 38.2 21.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Southern Cross & Stars */}
    <g fill="#FFFFFF">
      <circle cx="30" cy="16" r="0.4" />
      <circle cx="30" cy="24" r="0.4" />
      <circle cx="27" cy="21" r="0.4" />
      <circle cx="33" cy="22" r="0.4" />
      <circle cx="31.5" cy="23.2" r="0.3" />
      <circle cx="25" cy="23" r="0.3" />
      <circle cx="34.5" cy="18" r="0.3" />
      <circle cx="28" cy="25" r="0.3" />
    </g>
  </svg>
);

// 🇫🇷 FRANCE FLAG (Tricolore)
export const FranceFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Blue Left */}
    <rect width="20" height="40" x="0" fill="#002654" />
    {/* White Center */}
    <rect width="20" height="40" x="20" fill="#FFFFFF" />
    {/* Red Right */}
    <rect width="20" height="40" x="40" fill="#ED2939" />
  </svg>
);

// 🇸🇦 SAUDI ARABIA FLAG (Arab)
export const SaudiArabiaFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Green Field */}
    <rect width="60" height="40" fill="#006C35" />
    {/* Stylized Arabic Calligraphy Shahada & Sword Motif */}
    <g fill="#FFFFFF" transform="translate(14, 11) scale(0.55)">
      {/* Calligraphy lines */}
      <path d="M4 8 h8 v3 h-8 z M14 5 h6 v6 h-6 z M22 8 h10 v3 h-10 z M34 4 h6 v7 h-6 z M42 8 h12 v3 h-12 z" />
      <path d="M6 14 h14 v2 h-14 z M22 14 h18 v2 h-18 z M42 14 h14 v2 h-14 z" />
      <path d="M10 2 h4 v4 h-4 z M28 2 h4 v4 h-4 z M48 2 h4 v4 h-4 z" />
      {/* Traditional Curved Sword */}
      <path d="M2 24 h46 c4 0 8 2 10 3 c-2 2 -6 2 -10 2 h-46 c-2 0 -3 -1 -3 -2.5 c0 -1.5 1 -2.5 3 -2.5 z" />
      <path d="M8 20 v10 h2 v-10 z" />
      <circle cx="9" cy="25" r="1.5" fill="#FFFFFF" />
    </g>
  </svg>
);

// 🇮🇹 ITALY FLAG (Tricolore)
export const ItalyFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Green Left */}
    <rect width="20" height="40" x="0" fill="#009246" />
    {/* White Center */}
    <rect width="20" height="40" x="20" fill="#FFFFFF" />
    {/* Red Right */}
    <rect width="20" height="40" x="40" fill="#CE2B37" />
  </svg>
);

// 🇩🇪 GERMANY FLAG (Schwarz-Rot-Gold)
export const GermanyFlag: React.FC<FlagComponentProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    {/* Black Top */}
    <rect width="60" height="13.33" y="0" fill="#1A1A1A" />
    {/* Red Center */}
    <rect width="60" height="13.34" y="13.33" fill="#DD0000" />
    {/* Gold Bottom */}
    <rect width="60" height="13.33" y="26.67" fill="#FFCC00" />
  </svg>
);

export interface WavingFlagItem {
  code: string;
  name: string;
  nativeName?: string;
  region?: string;
  component: React.FC<FlagComponentProps>;
  isUpcoming?: boolean;
}

export const WAVING_FLAGS: WavingFlagItem[] = [
  { code: 'en-GB', name: 'UK English', nativeName: 'English (UK)', component: UKFlag },
  { code: 'es-ES', name: 'Castilian Spanish', nativeName: 'Español (España)', component: SpainFlag },
  { code: 'es-AR', name: 'Argentinean Spanish', nativeName: 'Español (Argentina)', component: ArgentinaFlag },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português (Brasil)', component: BrazilFlag },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', component: FranceFlag },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', region: 'Deutschland', component: GermanyFlag, isUpcoming: true },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', region: 'Italia', component: ItalyFlag, isUpcoming: true },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية (السعودية)', region: 'Saudi Arabia', component: SaudiArabiaFlag, isUpcoming: true },
];

export const FlagVector: React.FC<{ countryCode?: string; className?: string }> = ({ countryCode, className = "w-4 h-3 inline-block" }) => {
  if (!countryCode) return <span className="text-xs">🌐</span>;
  const cc = countryCode.toUpperCase();
  if (cc === 'GB' || cc === 'ENG' || cc === 'UK' || cc === 'EN-GB') return <UKFlag className={className} />;
  if (cc === 'ES' || cc === 'ESP' || cc === 'ES-ES') return <SpainFlag className={className} />;
  if (cc === 'AR' || cc === 'ARG' || cc === 'ES-AR') return <ArgentinaFlag className={className} />;
  if (cc === 'BR' || cc === 'BRA' || cc === 'PT-BR') return <BrazilFlag className={className} />;
  if (cc === 'FR' || cc === 'FRA' || cc === 'FR-FR') return <FranceFlag className={className} />;
  if (cc === 'DE' || cc === 'GER' || cc === 'DE-DE') return <GermanyFlag className={className} />;
  if (cc === 'IT' || cc === 'ITA' || cc === 'IT-IT') return <ItalyFlag className={className} />;
  if (cc === 'SA' || cc === 'KSA' || cc === 'AR-SA') return <SaudiArabiaFlag className={className} />;
  return <span className="text-xs">🌐</span>;
};
