import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glowOnHover = false,
  glass = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 transition-all duration-200 border ${
        glass
          ? 'glass-panel'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--shadow-sm)]'
      } ${glowOnHover ? 'glow-on-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
