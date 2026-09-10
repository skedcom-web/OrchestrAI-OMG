import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { NAV_DOMAINS, FUTURE_MODULES } from '../config/navigation';

/**
 * The one place release, build and platform-version information is shown to
 * users. Every other screen in OMG shows business content only — no release
 * numbers, no phase labels, no build tags. Admin → Product Release Notes is
 * that single, deliberate exception.
 *
 * Reframed from a "what shipped" changelog into OMG's product evolution
 * timeline: oldest release first, so the platform's own governance story —
 * how practitioner feedback became operational capability — reads the same
 * direction it happened in.
 */

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  current?: boolean;
}

/** Oldest first — this is a timeline, not a changelog. */
const RELEASE_HISTORY: ReleaseEntry[] = [
  {
    version: 'Releases 1–9',
    date: '2024 – 2025',
    title: 'Foundational Governance Platform',
    highlights: [
      'AI Asset Registry',
      'Ownership Matrix',
      'Asset Lifecycle Management',
      'Risk Classification',
      'Independent Validation Center',
      'Findings Tracking',
      'Compliance Center',
      'Policy Registry',
      'Regulatory Controls',
      'Governance Workflows',
      'Audit Trail Foundation',
      'Governance Dashboard Foundation',
    ],
  },
  {
    version: 'Release 10',
    date: '2025',
    title: 'Compliance Pack Framework',
    highlights: [
      'Compliance Pack Architecture',
      'Requirement → Control → Evidence Mapping',
      'Governance Intelligence Studio',
      'Customer Governance Profiles',
      'Cross-Regulatory Mapping',
    ],
  },
  {
    version: 'Release 11',
    date: '2025',
    title: 'Governance Effectiveness & Outcomes',
    highlights: [
      'Governance Effectiveness Scoring',
      'Governance ROI',
      'Governance Maturity Assessment',
      'Governance Outcome Measurement',
      'Executive Governance Dashboards',
    ],
  },
  {
    version: 'Release 12',
    date: '2026',
    title: 'Regulatory Knowledge & Audit Readiness',
    highlights: [
      'Universal Regulatory Knowledge Engine',
      'Source → Requirement → Obligation → Control → Evidence',
      'Regulatory Applicability Analysis',
      'Audit Readiness Intelligence',
      'Regulatory Change Readiness',
    ],
  },
  {
    version: 'Release 13',
    date: '2026',
    title: 'Assessment Consistency & Decision Quality',
    highlights: [
      'Assessor Certification',
      'Benchmark Assessments',
      'Multi-Assessor Consensus',
      'Variance Analysis',
      'Confidence Scoring',
      'Assessment Recommendations',
    ],
  },
  {
    version: 'Release 14',
    date: '2026',
    title: 'Governance Operations & Journey Intelligence',
    current: true,
    highlights: [
      'Agent Governance',
      'Tool Governance',
      'Control Governance',
      'Certification Governance',
      'Governance Continuity',
      'Governance Reassessment',
      'Evidence Traceability',
      'Decision Reconstruction',
      'Governance Journey Explorer',
      'Governance Story',
      'Governance Value Dashboard',
      'Governance Readiness',
      'Certification Readiness',
      'Governance Findings Intelligence',
      'Corrective Action Intelligence',
      'Executive Governance Command Center',
      'Cross-Domain Governance Reporting',
    ],
  },
];

export const ReleaseNotesPage: React.FC = () => {
  const workspaceCount = NAV_DOMAINS.length;
  const moduleCount = NAV_DOMAINS.reduce((n, d) => n + d.modules.length, 0) + 3;
  const currentRelease = RELEASE_HISTORY.find(r => r.current) || RELEASE_HISTORY[RELEASE_HISTORY.length - 1];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Product Release Notes</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Track the evolution of governance capabilities across OMG releases and understand how
          practitioner feedback became operational governance functionality.
        </p>
      </div>

      {/* System Information → Platform Metadata */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="System Information"
          title="Platform Metadata"
          subtitle="Current build, in machine-readable form."
          icon="🗞️"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { label: 'Current Version', value: currentRelease.version },
            { label: 'Governance Workspaces', value: String(workspaceCount) },
            { label: 'Governed Modules', value: String(moduleCount) },
            { label: 'Roadmap Items', value: String(FUTURE_MODULES.length) },
          ].map(fact => (
            <div
              key={fact.label}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                {fact.label}
              </p>
              <p className="tnum text-[13px] font-bold text-[var(--text-primary)] mt-1">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ODF in Action */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
        <SectionHeader
          title="ODF in Action"
          icon="🔁"
        />
        <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          Many OMG capabilities originated from practitioner discussions, governance challenges,
          audit observations, and customer feedback. Through the OrchestrAI Delivery Framework
          (ODF), insights are continuously validated, operationalized, and transformed into
          governance capabilities.
        </p>
      </section>

      {/* Release history — product evolution timeline */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-5">
        <SectionHeader
          title="Product Evolution Timeline"
          subtitle="How governance capabilities evolved, oldest to newest."
          icon="📜"
        />

        <div className="flex flex-col gap-4">
          {RELEASE_HISTORY.map(entry => (
            <div
              key={entry.version}
              className="relative pl-5 border-l-2"
              style={{ borderColor: entry.current ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
            >
              <div
                className="absolute -left-[5px] top-1 w-2 h-2 rounded-full"
                style={{ background: 'var(--accent-primary)' }}
                aria-hidden
              />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[13px] font-extrabold text-[var(--text-primary)]">
                  {entry.version}
                </span>
                <span className="text-[10.5px] font-bold text-[var(--text-muted)]">{entry.date}</span>
                <span className="text-[12.5px] font-semibold text-[var(--text-secondary)]">
                  · {entry.title}
                </span>
                {entry.current && (
                  <span
                    data-noglass
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wide bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
                  >
                    Current Release
                  </span>
                )}
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {entry.highlights.map(h => (
                  <li
                    key={h}
                    className="text-[11.5px] text-[var(--text-muted)] leading-relaxed flex items-start gap-2"
                  >
                    <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-[var(--text-muted)]" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Governance Roadmap"
          subtitle="Architected in the navigation and RBAC model today; capability delivery follows."
          icon="🧭"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {FUTURE_MODULES.map(module => (
            <div
              key={module.path}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  {module.icon}
                </span>
                <p className="text-[12.5px] font-bold text-[var(--text-primary)]">{module.label}</p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
