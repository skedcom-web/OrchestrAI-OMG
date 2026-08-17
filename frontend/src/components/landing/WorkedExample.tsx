import React from 'react';
import { WORKED_EXAMPLE_STEPS } from '../../config/landingContent';

/**
 * Blueprint Section 3 — See Governance in Action.
 *
 * An illustrative walkthrough of a single AI asset moving through governance,
 * used to make the abstract lifecycle concrete for a first-time reader.
 */
export const WorkedExample: React.FC = () => (
  <div className="flex flex-col gap-4">
    <div
      data-noglass
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <span
        data-noglass
        className="shrink-0 w-12 h-12 grid place-items-center rounded-xl text-[22px] bg-[var(--accent-light)] border border-[var(--accent-border)]"
        aria-hidden
      >
        🤖
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
          Illustrative example
        </p>
        <h3 className="text-[16px] font-bold text-[var(--text-primary)] mt-0.5">
          Customer Service AI Agent
        </h3>
        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          An agent that answers customer queries and can access customer records. Follow it from
          registration through to a change that forces reapproval.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {WORKED_EXAMPLE_STEPS.map((s, i) => (
        <div
          key={s.step}
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 grid place-items-center rounded-full text-[11px] font-extrabold text-white shrink-0"
              style={{ background: s.accent }}
            >
              {s.step}
            </span>
            <p className="text-[13.5px] font-bold text-[var(--text-primary)]">{s.title}</p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {s.detail.map(d => (
              <li key={d} className="flex items-start gap-2">
                <span
                  className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: s.accent }}
                  aria-hidden
                />
                <span className="text-[11.5px] text-[var(--text-secondary)] leading-snug">{d}</span>
              </li>
            ))}
          </ul>

          <div
            data-noglass
            className="mt-auto rounded-lg border px-3 py-2"
            style={{
              background: `color-mix(in srgb, ${s.accent} 10%, transparent)`,
              borderColor: `color-mix(in srgb, ${s.accent} 32%, transparent)`,
            }}
          >
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Outcome
            </p>
            <p className="text-[12px] font-bold mt-0.5" style={{ color: s.accent }}>
              {s.outcome}
            </p>
          </div>

          {i === WORKED_EXAMPLE_STEPS.length - 1 && (
            <p className="text-[10.5px] italic text-[var(--text-muted)] leading-snug">
              The loop closes here — the asset returns to monitoring only once the change has been
              reapproved.
            </p>
          )}
        </div>
      ))}
    </div>

    <div
      className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ background: 'var(--grad-brand)', borderColor: 'transparent' }}
    >
      <span className="text-[28px] shrink-0" aria-hidden>
        ✅
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/80">
          Final outcome
        </p>
        <p className="text-[17px] font-bold text-white mt-0.5">A governed AI lifecycle</p>
        <p className="text-[12.5px] text-white/85 mt-1 leading-relaxed">
          Every stage above is recorded, attributed and evidenced — so the question is never
          “was this approved?” but “can we still justify that approval today?”
        </p>
      </div>
    </div>
  </div>
);
