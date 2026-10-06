import React from 'react';

export interface OutsideFootBallIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

const OutsideFootBallIconComponent: React.FC<OutsideFootBallIconProps> = ({
  className = 'w-5 h-5',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Dynamic outside-foot curved spin trajectory */}
      <path
        d="M13 3C8 4.5 4.5 9 5.5 15"
        strokeWidth="2"
        className="stroke-amber-400"
      />
      <path
        d="M11 6.5C7.8 7.8 5.8 11 6.5 15.5"
        strokeWidth="1.5"
        strokeDasharray="1.5 2"
        className="stroke-amber-300/80"
      />

      {/* Soccer Ball at top right being struck with outside spin */}
      <circle cx="16.5" cy="7.5" r="4.2" className="fill-amber-400/25 stroke-amber-400" strokeWidth="1.8" />
      <polygon
        points="16.5,5.5 18,6.6 17.4,8.4 15.6,8.4 15,6.6"
        className="fill-amber-400 stroke-amber-500"
        strokeWidth="1"
      />
      <line x1="16.5" y1="5.5" x2="16.5" y2="3.4" strokeWidth="1.2" className="stroke-amber-400" />
      <line x1="18" y1="6.6" x2="20.3" y2="7.5" strokeWidth="1.2" className="stroke-amber-400" />
      <line x1="17.4" y1="8.4" x2="19" y2="10.8" strokeWidth="1.2" className="stroke-amber-400" />
      <line x1="15.6" y1="8.4" x2="14" y2="10.8" strokeWidth="1.2" className="stroke-amber-400" />
      <line x1="15" y1="6.6" x2="12.7" y2="7.5" strokeWidth="1.2" className="stroke-amber-400" />

      {/* Football Boot striking with the outside instep (outer curve) */}
      <path
        d="M2.5 18c1.5-3 4.2-4.5 7.5-4.2 2 0.2 3.8 1.2 4.8 2.5 0.8 1 0.8 2.2-0.2 3.2-1.2 1.2-4.2 1.8-7.8 1.5-2.2-0.2-3.8-1.5-4.3-3z"
        strokeWidth="1.8"
        className="fill-current/15 stroke-current"
      />
      {/* Outer boot striking edge highlight */}
      <path d="M9.5 13.8c2-1.4 4.5-1.2 6.2 0.2" strokeWidth="2.2" className="stroke-amber-400" />

      {/* Trivela impact spin burst sparks */}
      <path d="M13.5 12l1-1.5" strokeWidth="1.8" className="stroke-amber-400" />
      <path d="M16 13l2-0.5" strokeWidth="1.8" className="stroke-amber-400" />
      <path d="M14.5 15l1.5 1.5" strokeWidth="1.8" className="stroke-amber-400" />
    </svg>
  );
};

export const OutsideFootBallIcon = React.memo(OutsideFootBallIconComponent);
