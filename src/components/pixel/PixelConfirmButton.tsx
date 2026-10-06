import React from 'react';
import { PixelButton, PixelButtonProps } from './PixelButton';
import { PixelCheckIcon } from './PixelIcons';

export interface PixelConfirmButtonProps extends Omit<PixelButtonProps, 'icon'> {
  icon?: React.ReactNode;
  label?: string;
}

/**
 * 32-Bit Pixel Confirmation Button
 * High-impact confirm action for forms, signings, match start, and tactical decisions.
 */
export const PixelConfirmButton: React.FC<PixelConfirmButtonProps> = ({
  children,
  label = 'CONFIRM',
  variant = 'primary',
  size = 'md',
  icon = <PixelCheckIcon size={18} color="#ffffff" />,
  className = '',
  ...props
}) => {
  return (
    <PixelButton
      variant={variant}
      size={size}
      icon={icon}
      className={`font-bold tracking-widest ${className}`}
      {...props}
    >
      {children || label}
    </PixelButton>
  );
};
