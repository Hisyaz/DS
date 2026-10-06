import React from 'react';
import { EmblemConfig, EmblemShape } from '../types';

interface CustomEmblemProps {
  config?: EmblemConfig;
  emblem?: EmblemConfig;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CustomEmblem: React.FC<CustomEmblemProps> = ({ config, emblem, size = 'md', className = '' }) => {
  const activeConfig = config || emblem;
  const { shape = 'crested-shield', mode = '1', color1 = '#2563eb', color2 = '#facc15', color3 = '#ffffff' } = activeConfig || {};

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  // SVG paths for various emblem shapes
  const renderShapeContent = () => {
    switch (shape) {
      case 'circle':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill={color1} stroke={color2} strokeWidth="6" />
            <circle cx="50" cy="50" r="32" fill="none" stroke={color2} strokeWidth="3" strokeDasharray={mode === '2' ? '6 3' : undefined} />
            {mode === '3' ? (
              <polygon points="50,22 58,38 76,40 62,53 66,71 50,62 34,71 38,53 24,40 42,38" fill={color3 || color2} />
            ) : (
              <circle cx="50" cy="50" r="18" fill={color2} />
            )}
          </svg>
        );

      case 'square':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <rect x="6" y="6" width="88" height="88" rx="8" fill={color1} stroke={color2} strokeWidth="6" />
            {mode === '2' && <line x1="6" y1="6" x2="94" y2="94" stroke={color2} strokeWidth="6" />}
            {mode === '3' && <rect x="25" y="25" width="50" height="50" fill={color3 || color2} transform="rotate(45 50 50)" />}
            <rect x="20" y="20" width="60" height="60" fill="none" stroke={color2} strokeWidth="2" />
          </svg>
        );

      case 'diamond':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <polygon points="50,4 96,50 50,96 4,50" fill={color1} stroke={color2} strokeWidth="6" />
            {mode === '2' && <line x1="50" y1="4" x2="50" y2="96" stroke={color2} strokeWidth="4" />}
            <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke={color3 || color2} strokeWidth="3" />
          </svg>
        );

      case 'crown-shield':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            {/* Crown Top */}
            <path d="M 25 22 L 35 32 L 50 18 L 65 32 L 75 22 L 72 38 L 28 38 Z" fill={color2} stroke="#000000" strokeWidth="2" />
            {/* Main Shield */}
            <path d="M 20 38 L 80 38 L 80 65 Q 80 88 50 98 Q 20 88 20 65 Z" fill={color1} stroke={color2} strokeWidth="5" />
            <path d="M 50 38 L 50 98" stroke={color2} strokeWidth="4" />
          </svg>
        );

      case 'flame-shield':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <path d="M 15 20 Q 50 5 85 20 L 85 55 Q 85 85 50 96 Q 15 85 15 55 Z" fill={color1} stroke={color2} strokeWidth="5" />
            <path d="M 50 25 Q 65 45 50 75 Q 35 45 50 25 Z" fill={color2} />
            <path d="M 50 35 Q 58 50 50 68 Q 42 50 50 35 Z" fill={color3 || '#ffffff'} />
          </svg>
        );

      case 'star-shield':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <polygon points="50,4 62,35 96,35 68,55 78,88 50,68 22,88 32,55 4,35 38,35" fill={color1} stroke={color2} strokeWidth="4" />
            <polygon points="50,22 58,42 78,42 62,54 68,74 50,60 32,74 38,54 22,42 42,42" fill={color2} />
          </svg>
        );

      case 'barcelona':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <path d="M 10 15 Q 50 10 90 15 L 85 55 Q 80 85 50 98 Q 20 85 15 55 Z" fill={color1} stroke={color2} strokeWidth="5" />
            {/* Top Cross */}
            <line x1="15" y1="35" x2="85" y2="35" stroke={color2} strokeWidth="4" />
            <line x1="50" y1="12" x2="50" y2="98" stroke={color2} strokeWidth="4" />
            <rect x="20" y="42" width="12" height="42" fill={color2} />
            <rect x="68" y="42" width="12" height="42" fill={color2} />
          </svg>
        );

      case 'real-madrid':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <circle cx="50" cy="55" r="38" fill={color1} stroke={color2} strokeWidth="5" />
            <line x1="20" y1="28" x2="80" y2="82" stroke={color2} strokeWidth="12" />
            {/* Crown */}
            <path d="M 28 22 L 38 12 L 50 20 L 62 12 L 72 22 Z" fill={color2} />
          </svg>
        );

      case 'liverpool':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <path d="M 20 15 L 80 15 L 80 55 Q 80 85 50 98 Q 20 85 20 55 Z" fill={color1} stroke={color2} strokeWidth="5" />
            {/* Bird Silhouette */}
            <path d="M 50 30 Q 60 38 52 50 Q 58 60 50 72 Q 42 60 48 50 Q 40 38 50 30 Z" fill={color2} />
          </svg>
        );

      case 'arrow':
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <polygon points="50,6 92,30 92,70 50,96 8,70 8,30" fill={color1} stroke={color2} strokeWidth="6" />
            <polygon points="50,22 76,40 76,64 50,80 24,64 24,40" fill="none" stroke={color3 || color2} strokeWidth="3" />
          </svg>
        );

      case 'crested-shield':
      default:
        return (
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 100">
            <path d="M 10 12 L 90 12 L 90 55 Q 90 85 50 98 Q 10 85 10 55 Z" fill={color1} stroke={color2} strokeWidth="6" />
            {mode === '2' && <path d="M 50 12 L 50 98" stroke={color2} strokeWidth="5" />}
            {mode === '3' && (
              <>
                <line x1="10" y1="50" x2="90" y2="50" stroke={color2} strokeWidth="5" />
                <line x1="50" y1="12" x2="50" y2="98" stroke={color2} strokeWidth="5" />
              </>
            )}
            <path d="M 22 24 L 78 24 L 78 52 Q 78 74 50 85 Q 22 74 22 52 Z" fill="none" stroke={color3 || color2} strokeWidth="2" />
          </svg>
        );
    }
  };

  return <div className={`inline-block ${sizeClasses} ${className}`}>{renderShapeContent()}</div>;
};
