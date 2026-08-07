import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  }[size];

  const variantStyles = {
    primary: 'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md hover:shadow-lg',
    secondary: 'bg-[var(--bg-badge)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)]',
    ghost: 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md',
    outline: 'border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-light)]',
  }[variant];

  return (
    <button
      className={`${baseStyle} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
