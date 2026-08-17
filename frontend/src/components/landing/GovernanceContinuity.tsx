import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTINUITY_STATES, REASSESSMENT_TRIGGERS } from '../../config/landingContent';

const KIND_TONE: Record<string, string> = {
  steady: 'var(--status-success)',
  change: 'var(--status-warning)',
  decision: 'var(--accent-primary)',
};

/**
 * Blueprint Section 4 — Approval Is Not The End.
 *
 * The strategic differentiator: governance continuity. Every trigger listed
 * maps to an implemented change category or detection mechanism.
 */
export const GovernanceContinuity: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* The framing question */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            data-noglass
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-3.5"
            style={{ background: 'var(--bg-card)' }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Traditional governance asks
            </p>
            <p className="text-[18px] font-bold text-[var(--text-secondary)] mt-1.5">
              “Was this approved?”
            </p>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
              A point-in-time answer that ages the moment the system changes.
            </p>
          </div>

          <div
            data-noglass
            className="rounded-xl border px-4 py-3.5"
            style={{
              background: 'var(--accent-light)',
              borderColor: 'var(--accent-border)',
            }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
              OMG asks
            </p>
            <p className="text-[18px] font-bold text-[var(--text-primary)] mt-1.5">
              “Can we still justify that approval today?”
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              A standing answer, re-tested every time something material changes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Triggers */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
              When authority must be re-earned
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">
              Each trigger maps to a change category the platform actually classifies and routes.
            </p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {REASSESSMENT_TRIGGERS.map(t => (
              <li
                key={t.trigger}
                data-noglass
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] px-3 py-2"
                style={{ background: 'var(--bg-sunken)' }}
              >
                <span className="text-[11.5px] text-[var(--text-secondary)] leading-snug min-w-0">
                  {t.trigger}
                </span>
                <span
                  data-noglass
                  className="shrink-0 text-[9.5px] font-bold px-2 py-1 rounded-md border border-[var(--accent-border)] text-[var(--accent-primary)] bg-[var(--accent-light)] whitespace-nowrap"
                >
                  {t.mechanism}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* State model */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
              The continuity loop
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">
              States an asset moves through when a change challenges its authority.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {CONTINUITY_STATES.map((st, i) => (
              <React.Fragment key={st.label}>
                <div
                  data-noglass
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  style={{
                    background: `color-mix(in srgb, ${KIND_TONE[st.kind]} 9%, transparent)`,
                    borderColor: `color-mix(in srgb, ${KIND_TONE[st.kind]} 30%, transparent)`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: KIND_TONE[st.kind] }}
                    aria-hidden
                  />
                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                    {st.label}
                  </span>
                  {st.kind === 'change' && (
                    <span className="ml-auto text-[9.5px] font-bold uppercase tracking-wide text-[var(--status-warning)]">
                      authority challenged
                    </span>
                  )}
                </div>
                {i < CONTINUITY_STATES.length - 1 && (
                  <span className="text-[10px] text-[var(--text-muted)] text-center leading-none" aria-hidden>
                    ↓
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            The reapproval decision is the same GO / CONDITIONAL GO / NO GO authority used for the
            original approval — reassessment is not a lighter process.
          </p>

          <button
            onClick={() => navigate('/change-requests')}
            data-noglass
            className="self-start px-3.5 py-2 rounded-xl text-[11.5px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
          >
            Open Change Request Center →
          </button>
        </div>
      </div>
    </div>
  );
};
