import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { GUIDED_TOURS, getTourSteps, type GuidedTourDefinition, type TourStep } from '../../config/landingContent';

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
 * Guided tour: opens on a picker of 5 named, audience-specific tours
 * (Executive Overview, Governance Lifecycle, Agent Governance, Audit &
 * Assurance, Governance Intelligence), each a curated subset of steps drawn
 * from landingContent.ts. A step can appear in more than one tour, so
 * indexing is by array position, never by the step's own TOUR_STEPS.n.
 */
export const GuidedTour: React.FC<GuidedTourProps> = ({
  open,
  onClose,
  allowNavigation = true,
}) => {
  const navigate = useNavigate();
  const [selectedTour, setSelectedTour] = useState<GuidedTourDefinition | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setSelectedTour(null);
      setIndex(0);
    }
  }, [open]);

  const steps: TourStep[] = selectedTour ? getTourSteps(selectedTour) : [];

  useEffect(() => {
    if (!open || !selectedTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(steps.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, selectedTour, steps.length]);

  useEffect(() => {
    if (!open || selectedTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, selectedTour]);

  if (!open) return null;

  // ---- Picker screen ----
  if (!selectedTour) {
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
          aria-label="Choose a guided tour"
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-modal)] shadow-[var(--shadow-lg)]"
        >
          <div className="shrink-0 px-4 sm:px-7 pt-5 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
                Guided tours
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1">
                Choose the tour that matches what you're here to see
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

          <div className="min-h-0 overflow-y-auto px-4 sm:px-7 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GUIDED_TOURS.map(tour => (
                <button
                  key={tour.id}
                  onClick={() => {
                    setSelectedTour(tour);
                    setIndex(0);
                  }}
                  data-noglass
                  className="text-left rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-border)] transition-all px-4 py-4 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      data-noglass
                      className="shrink-0 w-10 h-10 grid place-items-center rounded-xl text-[20px] border border-[var(--accent-border)] bg-[var(--accent-light)]"
                      aria-hidden
                    >
                      {tour.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[var(--text-primary)]">{tour.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {tour.stepTitles.length} stops
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                    {tour.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ---- Step screen ----
  const step = steps[index];
  const isLast = index === steps.length - 1;

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
        aria-label={`OMG guided tour — ${selectedTour.name}`}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-modal)] shadow-[var(--shadow-lg)]"
      >
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-7 pt-5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                onClick={() => setSelectedTour(null)}
                className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                ← {selectedTour.name} · Step {index + 1} of {steps.length}
              </button>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1">
                {step.title}
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
            {steps.map((t, i) => (
              <button
                key={`${t.n}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to step ${i + 1}: ${t.title}`}
                title={`${i + 1}. ${t.title}`}
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
            {steps.map((t, i) => (
              <button
                key={`${t.n}-${i}`}
                onClick={() => setIndex(i)}
                data-noglass
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                  i === index
                    ? 'text-white border-transparent'
                    : 'bg-[var(--bg-badge)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                style={i === index ? { background: 'var(--accent-primary)' } : undefined}
              >
                {i + 1}. {t.title}
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
                onClick={() => setIndex(i => Math.min(steps.length - 1, i + 1))}
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
