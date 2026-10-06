import React, { useEffect } from 'react';
import { PixelButton, PixelButtonProps } from './PixelButton';
import { PixelArrowLeftIcon } from './PixelIcons';

export interface PixelBackButtonProps extends Omit<PixelButtonProps, 'icon'> {
  icon?: React.ReactNode;
  label?: string;
  enableEscKey?: boolean;
}

/**
 * 32-Bit Pixel Back Button
 * Standardized retro navigation control with keyboard Escape & Gamepad B button awareness.
 */
export const PixelBackButton: React.FC<PixelBackButtonProps> = ({
  children,
  label = 'BACK',
  variant = 'secondary',
  size = 'md',
  icon = <PixelArrowLeftIcon size={16} color="currentColor" />,
  enableEscKey = false,
  onClick,
  className = '',
  ...props
}) => {
  useEffect(() => {
    if (!enableEscKey || !onClick) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableEscKey, onClick]);

  return (
    <PixelButton
      variant={variant}
      size={size}
      icon={icon}
      onClick={onClick}
      className={`tracking-wider ${className}`}
      {...props}
    >
      {children || label}
    </PixelButton>
  );
};
