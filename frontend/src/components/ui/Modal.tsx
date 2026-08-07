import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative w-full ${widthClass} rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 z-10 transition-all transform scale-100`}>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5 text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
