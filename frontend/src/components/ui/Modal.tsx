import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    // Rendered via a portal straight into <body>: any animated ancestor in the
    // page tree (e.g. the page-transition transform on <main>) would otherwise
    // establish a new containing block for this `fixed` overlay, quietly
    // repositioning it relative to that ancestor instead of the viewport.
    //
    // Top-aligned, not centered: centering a scrollable overlay whose content
    // is taller than the viewport leaves the browser's initial scroll position
    // showing blank backdrop with the dialog's header cut off below the fold.
    // Anchoring to the top with breathing-room padding avoids that entirely,
    // and the dialog caps its own height and scrolls its body internally.
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 sm:px-6 py-6 sm:py-10 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog — fixed header, independently scrolling body, capped total height */}
      <div
        className={`relative w-full ${widthClass} max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-color)] shadow-2xl z-10`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-8 pb-4 border-b border-[var(--border-color)]">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5 shrink-0 text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>

        {/* Content — scrolls independently; header above stays put */}
        <div className="min-h-0 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
