import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { TOUR_STEPS } from '../../config/landingContent';

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
  /**
   * When false the "Open this module" action is hidden — used pre-authentication
   * on the sign-in screen, where the modules are not reachable yet.
   */
  allowNavigation?: boolean;
}

/**
 * Blueprint Section 5 — the guided tour.
 *
 * Renders TOUR_STEPS from landingContent.ts (currently 35 steps, one per
 * governance module), each answering: what the module is, why it exists,
 * and what to look at. Portal-rendered so an animated ancestor cannot
 * reposition the overlay.
 */
export const GuidedTour: React.FC<GuidedTourProps> = ({
  open,
  onClose,
  allowNavigation = true,
}) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(TOUR_STEPS.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const step = TOUR_STEPS[index];
  const isLast = index === TOUR_STEPS.length - 1;

  const goToModule = () => {
    onClose();
    navigate(step.path);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 sm:px-6 py-6 sm:py-10 overflow-y-auto"
      role="presentation"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="OMG guided tour"
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-modal)] shadow-[var(--shadow-lg)]"
      >
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-7 pt-5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
                Guided tour · {TOUR_STEPS.length} stops
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1">
                Step {step.n} of {TOUR_STEPS.length} — {step.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close guided tour"
              className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mt-3.5">
            {TOUR_STEPS.map((t, i) => (
              <button
                key={t.n}
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${t.n}: ${t.title}`}
                title={`${t.n}. ${t.title}`}
                className="flex-1 h-1.5 rounded-full transition-all cursor-pointer"
                style={{
                  background:
                    i < index
                      ? 'var(--accent-primary)'
                      : i === index
                        ? 'var(--accent-primary)'
                        : 'var(--bg-sunken)',
                  opacity: i <= index ? 1 : 0.7,
                }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 overflow-y-auto px-4 sm:px-7 py-5">
          <div className="flex items-start gap-4">
            <span
              data-noglass
              className="shrink-0 w-14 h-14 grid place-items-center rounded-2xl text-[26px] border border-[var(--accent-border)] bg-[var(--accent-light)]"
              aria-hidden
            >
              {step.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-relaxed">
                {step.what}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-3"
              style={{ background: 'var(--bg-sunken)' }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Why this stage exists
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {step.why}
              </p>
            </div>

            <div
              data-noglass
              className="rounded-xl border px-4 py-3"
              style={{
                background: 'var(--accent-light)',
                borderColor: 'var(--accent-border)',
              }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
                What to look at
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {step.look}
              </p>
            </div>
          </div>

          {/* Stage rail */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {TOUR_STEPS.map((t, i) => (
              <button
                key={t.n}
                onClick={() => setIndex(i)}
                data-noglass
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                  i === index
                    ? 'text-white border-transparent'
                    : 'bg-[var(--bg-badge)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                style={i === index ? { background: 'var(--accent-primary)' } : undefined}
              >
                {t.n}. {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-7 py-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="px-3 py-2 rounded-xl text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {allowNavigation && (
              <button
                onClick={goToModule}
                data-noglass
                className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
              >
                Open this module
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                style={{ background: 'var(--grad-brand)' }}
              >
                Finish tour
              </button>
            ) : (
              <button
                onClick={() => setIndex(i => Math.min(TOUR_STEPS.length - 1, i + 1))}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                style={{ background: 'var(--grad-brand)' }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
