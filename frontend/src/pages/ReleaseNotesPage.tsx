import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { NAV_DOMAINS, FUTURE_MODULES } from '../config/navigation';

/**
 * The one place release, build and platform-version information is shown to
 * users. Every other screen in OMG shows business content only — no release
 * numbers, no phase labels, no build tags. Admin → Tenant Settings →
 * Product Release Notes is that single, deliberate exception.
 */

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

const RELEASE_HISTORY: ReleaseEntry[] = [
  {
    version: 'Release 13',
    date: '2026',
    title: 'Assessment Consistency & Decision Quality',
    highlights: [
      'Assessor Certification — score benchmark scenarios and see calibration accuracy',
      'Multi-Assessor Consensus — independent scoring rounds with variance reporting',
      'Confidence Scoring across assessment and validation records',
      'Benchmark Recommendations guided by use case, risk category and asset type',
    ],
  },
  {
    version: 'Release 12',
    date: '2026',
    title: 'Regulatory Knowledge & Audit Readiness',
    highlights: [
      'Regulatory Applicability, Cross-Framework Mapping and Compliance Impact Analysis',
      'Regulatory Change Readiness and Audit Readiness Intelligence',
      'Universal Regulatory Knowledge & Obligation Engine: Source → Requirement → Obligation → Control → Evidence',
    ],
  },
  {
    version: 'Release 11',
    date: '2025',
    title: 'Governance Effectiveness & Outcomes',
    highlights: [
      'Governance Effectiveness Score, ROI, Maturity and Benchmarking',
      'Governance Outcomes — value delivered, not just activity performed',
      'Executive dashboards for governance-as-value, not governance-as-overhead',
    ],
  },
  {
    version: 'Release 10',
    date: '2025',
    title: 'Compliance Pack Framework',
    highlights: [
      'Universal, reusable Compliance Pack architecture — packs, requirements, controls, evidence',
      'Governance Intelligence Studio for no-code condition, outcome and action configuration',
      'Customer Governance Profiles scoping which regulations apply per tenant',
    ],
  },
  {
    version: 'Releases 1–9',
    date: '2024 – 2025',
    title: 'Foundational Governance Platform',
    highlights: [
      'AI Asset Registry, Ownership Matrix and Asset Lifecycle',
      'Risk tiering, independent Validation Center and Findings tracking',
      'Compliance Center, Policy Registry and regulatory control evaluation',
      'Decision Authority, Evidence Center and immutable Audit Logs',
      'Operations monitoring, incident management and human override controls',
      'Governance Intelligence, Actions and full Decision Traceability',
    ],
  },
];

export const ReleaseNotesPage: React.FC = () => {
  const workspaceCount = NAV_DOMAINS.length;
  const moduleCount = NAV_DOMAINS.reduce((n, d) => n + d.modules.length, 0) + 3;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Product Release Notes</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Platform version history. Every other screen in OMG is release-number free by design —
          this is where that information lives instead.
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
            { label: 'Current Version', value: RELEASE_HISTORY[0].version },
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

      {/* Release history */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-5">
        <SectionHeader
          title="Release History"
          subtitle="What shipped, most recent first."
          icon="📜"
        />

        <div className="flex flex-col gap-4">
          {RELEASE_HISTORY.map(entry => (
            <div
              key={entry.version}
              className="relative pl-5 border-l-2 border-[var(--border-subtle)]"
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
