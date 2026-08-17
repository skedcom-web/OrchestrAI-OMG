import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOURNEY_STAGES } from '../../config/landingContent';

/**
 * Blueprint Section 2 — How OMG Works.
 *
 * The nine-stage governance journey rendered as an interactive path. Selecting
 * a stage reveals its purpose, inputs, outputs, owner and decision criteria,
 * and links straight into the module where that stage is performed.
 */
export const JourneyExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(JOURNEY_STAGES[0].id);
  const active = JOURNEY_STAGES.find(s => s.id === activeId) || JOURNEY_STAGES[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Stage path */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {JOURNEY_STAGES.map(stage => {
          const isActive = stage.id === activeId;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveId(stage.id)}
              aria-pressed={isActive}
              title={stage.summary}
              data-noglass
              className={`group rounded-xl border p-2.5 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                isActive
                  ? 'shadow-md -translate-y-0.5'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-border)] hover:-translate-y-0.5'
              }`}
              style={
                isActive
                  ? {
                      background: `color-mix(in srgb, ${stage.accent} 14%, transparent)`,
                      borderColor: stage.accent,
                    }
                  : undefined
              }
            >
              <span
                className="w-7 h-7 grid place-items-center rounded-full text-[11px] font-extrabold border-2 shrink-0"
                style={{
                  borderColor: stage.accent,
                  color: isActive ? '#fff' : stage.accent,
                  background: isActive ? stage.accent : 'transparent',
                }}
              >
                {stage.step}
              </span>
              <span className="text-[13px] leading-none" aria-hidden>
                {stage.icon}
              </span>
              <span
                className={`text-[10.5px] font-bold leading-tight ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          background: `color-mix(in srgb, ${active.accent} 6%, var(--bg-card))`,
          borderColor: `color-mix(in srgb, ${active.accent} 35%, transparent)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span
              data-noglass
              className="shrink-0 w-11 h-11 grid place-items-center rounded-xl text-[20px] border"
              style={{
                background: `color-mix(in srgb, ${active.accent} 15%, transparent)`,
                borderColor: `color-mix(in srgb, ${active.accent} 40%, transparent)`,
              }}
              aria-hidden
            >
              {active.icon}
            </span>
            <div className="min-w-0">
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.12em]"
                style={{ color: active.accent }}
              >
                Stage {active.step} of {JOURNEY_STAGES.length}
              </p>
              <h3 className="text-[17px] font-bold text-[var(--text-primary)] mt-0.5">
                {active.label}
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 leading-relaxed max-w-2xl">
                {active.purpose}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(active.path)}
            data-noglass
            className="shrink-0 px-3.5 py-2 rounded-xl text-[11.5px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer whitespace-nowrap"
          >
            Open {active.moduleLabel} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div
            data-noglass
            className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-3"
            style={{ background: 'var(--bg-card)' }}
          >
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Inputs
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {active.inputs.map(i => (
                <li key={i} className="text-[11.5px] text-[var(--text-secondary)] leading-snug">
                  · {i}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-noglass
            className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-3"
            style={{ background: 'var(--bg-card)' }}
          >
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Outputs
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {active.outputs.map(o => (
                <li key={o} className="text-[11.5px] text-[var(--text-secondary)] leading-snug">
                  · {o}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-noglass
            className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-3 flex flex-col gap-2.5"
            style={{ background: 'var(--bg-card)' }}
          >
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Accountable owner
              </p>
              <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-1 leading-snug">
                {active.owner}
              </p>
            </div>
            <div>
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Decision criteria
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 leading-snug">
                {active.decisionCriteria}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
