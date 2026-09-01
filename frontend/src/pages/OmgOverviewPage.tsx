import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { GuidedTour } from '../components/landing/GuidedTour';
import { JourneyExplorer } from '../components/landing/JourneyExplorer';
import { WorkedExample } from '../components/landing/WorkedExample';
import { GovernanceContinuity } from '../components/landing/GovernanceContinuity';
import { getGovernanceMetrics } from '../services/storageService';
import {
  BUSINESS_VALUE,
  CAPABILITIES,
  CUSTOMER_PACKS,
  DESIGN_PARTNER_INDUSTRIES,
  ENGAGEMENT_PHASES,
  ENTERPRISE_PROBLEMS,
  EFFECTIVENESS_HERO_STATEMENT,
  EFFECTIVENESS_POSITIONING_TAGS,
  EXECUTIVE_MESSAGE_STATEMENT,
  FINAL_DECLARATION_STATEMENT,
  FINAL_DECLARATION_TITLE,
  PREVENTION_POSITIONING_STATEMENT,
  FOUNDING_PARTNERS_STATEMENT,
  FUTURE_COMPLIANCE_ACCELERATORS_STATEMENT,
  PARTNER_WITH_US_STATEMENT,
  PERSONAS,
  PLATFORM_CAPABILITIES_SUMMARY,
  PLATFORM_JOURNEY,
  PLATFORM_STATUS_CAPABILITIES,
  PLATFORM_STATUS_STATEMENT,
  PLATFORM_STATUS_TITLE,
  REGULATORY_COMPLIANCE_PACKS,
} from '../config/landingContent';

/**
 * OMG Overview — the landing experience.
 *
 * Journey-centric rather than module-centric: a first-time reader should be able
 * to answer what problem OMG solves, how governance works, what happens after
 * approval, why the modules exist and where to start — without training.
 */
export const OmgOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const metrics = useMemo(() => getGovernanceMetrics(), []);

  const goToJourneyStep = (path: string) => {
    if (path === '#partner') {
      document.getElementById('partner-program')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* ===================== HERO ===================== */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] sheen"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-60 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
          style={{ background: 'var(--grad-brand)', opacity: 0.12, filter: 'blur(60px)' }}
          aria-hidden
        />

        <div className="relative p-6 sm:p-9 flex flex-col xl:flex-row xl:items-center gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                data-noglass
                className="inline-flex items-center gap-2 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.12em] bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
              >
                <span className="status-pulse" />
                Enterprise AI Governance Operating System
              </span>
              <span
                data-noglass
                className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.1em] bg-[var(--status-success)]/15 text-[var(--status-success)] border border-[var(--status-success)]/30"
              >
                ✓ Core Platform v1.0 Complete
              </span>
            </div>

            <h1 className="text-[2.1rem] sm:text-[2.9rem] font-extrabold leading-[1.08] text-[var(--text-primary)]">
              Everyone Talks AI Governance.<br />We <span className="text-gradient-brand">Make It Operational.</span>
            </h1>

            <p className="text-[15px] font-semibold text-[var(--text-secondary)]">
              Ownership. Risk. Approvals. Evidence. Accountability.
            </p>

            <p className="text-[15px] font-bold text-gradient-brand">
              Connected across the entire AI lifecycle.
            </p>

            <p className="text-[13px] font-semibold text-[var(--text-secondary)] leading-relaxed max-w-xl">
              OMG provides a configurable AI Governance Operating Platform that helps organizations govern AI assets, manage risk, demonstrate accountability, maintain traceability, and operationalize governance at scale.
            </p>

            {/* vNext — Prevention-First positioning statement */}
            <div
              data-noglass
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 backdrop-blur-sm px-4 py-3.5 max-w-xl"
            >
              <p className="text-[13px] font-bold text-[var(--text-primary)] leading-snug">
                Prevent governance failures before they become business consequences.
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Identify gaps early. Strengthen accountability. Preserve evidence. Enable informed decisions.
              </p>
            </div>

            {/* Release 11 — Governance Effectiveness & Outcomes Engine positioning, additive to the hero above. */}
            <div
              data-noglass
              className="rounded-xl border border-[var(--status-success)]/30 bg-[var(--bg-card)]/70 backdrop-blur-sm px-4 py-3.5 max-w-xl"
            >
              <p className="text-[13px] font-bold text-[var(--text-primary)] leading-snug">
                {EFFECTIVENESS_HERO_STATEMENT}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {EFFECTIVENESS_POSITIONING_TAGS.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/25"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[13px] font-bold text-gradient-brand">
              Built Once. Configured Together. Governed Continuously.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setTourOpen(true)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                style={{ background: 'var(--grad-brand)' }}
              >
                Start Guided Tour
              </button>
              <button
                onClick={() => navigate('/command-center')}
                data-noglass
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
              >
                Explore Demo
              </button>
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              Thirty-six steps — no training required.
            </p>
          </div>

          {/* Live posture snapshot */}
          <div
            data-noglass
            className="shrink-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 backdrop-blur-sm p-5 w-full xl:w-[19rem]"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              This tenant, right now
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                ['Governed assets', metrics.totalAssets, 'var(--accent-primary)'],
                ['Approved for production', metrics.decisionBreakdown.GO, 'var(--status-success)'],
                ['High & critical risk', metrics.riskBreakdown.High + metrics.riskBreakdown.Critical, 'var(--status-danger)'],
                ['Governance health', `${metrics.tenantGovernanceHealthScore}%`, 'var(--status-info)'],
              ].map(([label, value, tone]) => (
                <div
                  key={String(label)}
                  data-noglass
                  className="rounded-xl border border-[var(--border-subtle)] px-3 py-2.5"
                  style={{ background: 'var(--bg-sunken)' }}
                >
                  <p
                    className="tnum text-[1.35rem] font-extrabold leading-none"
                    style={{ color: String(tone) }}
                  >
                    {String(value)}
                  </p>
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-1.5 leading-tight">
                    {String(label)}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/command-center')}
              className="mt-3 w-full text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer text-left"
            >
              Open Command Center →
            </button>
          </div>
        </div>
      </section>

      {/* ============== SECTION: CORE PLATFORM STATUS ============== */}
      <section
        data-noglass
        className="rounded-2xl border border-[var(--status-success)]/30 bg-[var(--bg-card)] p-5 sm:p-6 flex flex-col gap-3"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]" aria-hidden>✅</span>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[var(--text-primary)]">{PLATFORM_STATUS_TITLE}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PLATFORM_STATUS_CAPABILITIES.map(cap => (
            <span
              key={cap}
              data-noglass
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              <span className="text-[var(--status-success)]" aria-hidden>✔</span>
              {cap}
            </span>
          ))}
        </div>
        <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          {PLATFORM_STATUS_STATEMENT}
        </p>
      </section>

      {/* ============== SECTION 1 — THE ENTERPRISE PROBLEM ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 1"
          title="Why AI Governance Matters"
          subtitle="What goes wrong without it — and the capability that closes each gap."
          icon="⚠️"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {ENTERPRISE_PROBLEMS.map(item => (
            <button
              key={item.problem}
              onClick={() => navigate(item.path)}
              data-noglass
              className="group text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex items-center gap-3 hover:border-[var(--accent-border)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className="shrink-0 text-[13px] font-bold mt-[1px]"
                  style={{ color: 'var(--status-danger)' }}
                  aria-hidden
                >
                  ✕
                </span>
                <span className="text-[12.5px] text-[var(--text-secondary)] leading-snug">
                  {item.problem}
                </span>
              </span>

              <span className="shrink-0 text-[var(--text-muted)] text-[13px]" aria-hidden>
                →
              </span>

              <span className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className="shrink-0 text-[13px] font-bold mt-[1px]"
                  style={{ color: 'var(--status-success)' }}
                  aria-hidden
                >
                  ✓
                </span>
                <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-primary)] transition-colors">
                  {item.solution}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ============== SECTION 2 — HOW OMG WORKS ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 2"
          title="How OMG Works"
          subtitle="Nine stages from AI idea to continuous governance. Select any stage to see what it takes in, what it produces and who owns it."
          icon="🛤️"
          action={
            <button
              onClick={() => setTourOpen(true)}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer whitespace-nowrap"
            >
              Take the guided tour →
            </button>
          }
        />
        <JourneyExplorer />
      </section>

      {/* ============== SECTION 3 — GOVERNANCE IN ACTION ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 3"
          title="See Governance in Action"
          subtitle="One AI agent, followed all the way through — including the change that forces its approval to be re-earned."
          icon="🔎"
        />
        <WorkedExample />
      </section>

      {/* ============== SECTION 4 — GOVERNANCE CONTINUITY ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 4 · What makes OMG different"
          title="Approval Is Not The End"
          subtitle="Most governance stops at the approval. OMG treats authority as something that has to hold up over time."
          icon="🔁"
        />
        <GovernanceContinuity />
      </section>

      {/* ============== SECTION 5 — GUIDED TOUR ============== */}
      <section
        className="rounded-2xl border border-[var(--border-color)] p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
            Section 5
          </p>
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mt-1">
            Take the Guided Tour
          </h2>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
            Thirty-six stops across the governance flow — accountability, oversight and autonomy,
            then risk, validation, evidence, decision, governance state, review schedule,
            reassessment triggers, timeline and reauthorization history, then readiness, gap
            detection and audit readiness, then compliance packs, requirements, controls,
            coverage and gaps, then change and audit, then the regulatory knowledge engine,
            governance intelligence, governance actions, decision traceability and the
            Governance Intelligence Studio. Each stop explains what the module is, why it
            exists and what to look at, and can take you straight there.
          </p>
        </div>
        <button
          onClick={() => setTourOpen(true)}
          className="shrink-0 px-5 py-3 rounded-xl text-[13px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          style={{ background: 'var(--grad-brand)' }}
        >
          Start Guided Tour
        </button>
      </section>

      {/* ============== SECTION 6 — WHO USES OMG ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 6"
          title="Who Uses OMG"
          subtitle="Four audiences, four different questions — and where each should start."
          icon="👥"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {PERSONAS.map(p => (
            <div
              key={p.role}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-3"
            >
              <span
                data-noglass
                className="w-11 h-11 grid place-items-center rounded-xl text-[20px] bg-[var(--accent-light)] border border-[var(--accent-border)]"
                aria-hidden
              >
                {p.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-[var(--text-primary)]">{p.role}</p>
                <p className="text-[11.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {p.need}
                </p>
              </div>
              <button
                onClick={() => navigate(p.path)}
                className="mt-auto self-start text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Start at {p.startAt} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============== SECTION 7 — PLATFORM CAPABILITIES ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 7"
          title="Key Platform Capabilities"
          subtitle="Twenty-four capabilities, each a working module you can open right now."
          icon="🧩"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {CAPABILITIES.map(c => (
            <button
              key={c.label}
              onClick={() => navigate(c.path)}
              data-noglass
              className="text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 flex flex-col gap-2 hover:border-[var(--accent-border)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-[19px]" aria-hidden>
                {c.icon}
              </span>
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-tight">
                {c.label}
              </span>
              <span className="text-[10.5px] text-[var(--text-muted)] leading-snug">{c.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============== SECTION 8 — BUSINESS VALUE ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 8"
          title="Business Value"
          subtitle="What the organisation gets once governance runs as a system rather than a scramble."
          icon="📈"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {BUSINESS_VALUE.map(v => (
            <div
              key={v.title}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-2"
            >
              <span className="text-[18px]" aria-hidden>
                {v.icon}
              </span>
              <p className="text-[13px] font-bold text-[var(--text-primary)]">{v.title}</p>
              <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                {v.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============== SECTION 8.5 — PLATFORM VS. CUSTOMER PACKS ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 8.5"
          title="Built Once. Configured Many Times."
          subtitle="What ships as platform today, and what a customer configures through the Studio — never a rebuild."
          icon="🎛️"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--accent-primary)]">Current Platform</p>
            <ul className="flex flex-col gap-2">
              {PLATFORM_CAPABILITIES_SUMMARY.map(line => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-primary)' }} aria-hidden />
                  <span className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Future Customer Add-ons — configuration packs</p>
            <div className="flex flex-col gap-2.5">
              {CUSTOMER_PACKS.map(pack => (
                <div key={pack.name} className="flex items-start gap-2.5">
                  <span className="text-[16px] shrink-0" aria-hidden>{pack.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[12.5px] font-bold text-[var(--text-primary)]">{pack.name}</span>
                    <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">{pack.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/governance-studio')}
              className="mt-1 self-start text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Open the Governance Intelligence Studio →
            </button>
          </div>
        </div>
      </section>

      {/* ============== SECTION 8.6 — THE OMG PLATFORM JOURNEY ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 8.6"
          title="The OMG Platform Journey"
          subtitle="Eleven stops across the platform, from governing your first AI asset to deploying with confidence alongside us. A separate, platform-level view — the asset lifecycle in Section 2 above is unchanged."
          icon="🧭"
        />

        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {PLATFORM_JOURNEY.map(step => (
            <button
              key={step.step}
              onClick={() => goToJourneyStep(step.path)}
              data-noglass
              className="shrink-0 w-[9.5rem] text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 flex flex-col gap-2 hover:border-[var(--accent-border)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-[10px] font-extrabold text-[var(--text-muted)] font-mono">{String(step.step).padStart(2, '0')}</span>
              <span className="text-[17px]" aria-hidden>{step.icon}</span>
              <span className="text-[11.5px] font-bold text-[var(--text-primary)] leading-tight">{step.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============== SECTION 9 — PARTNER WITH US ============== */}
      <section id="partner-program" className="flex flex-col gap-4 scroll-mt-6">
        <SectionHeader
          eyebrow="Section 9"
          title="Partner With Us"
          subtitle={PARTNER_WITH_US_STATEMENT}
          icon="🤝"
        />

        <div
          data-noglass
          className="rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
          style={{ background: 'var(--grad-hero)' }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Founding Governance Partners Program</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
            {FOUNDING_PARTNERS_STATEMENT}
          </p>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] mt-5">Across</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {DESIGN_PARTNER_INDUSTRIES.map(ind => (
              <span
                key={ind.name}
                data-noglass
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <span aria-hidden>{ind.icon}</span>{ind.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--accent-primary)]">Customer Engagement Model</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {ENGAGEMENT_PHASES.map(phase => (
              <div key={phase.phase} className="flex items-start gap-3">
                <span
                  data-noglass
                  className="shrink-0 w-6 h-6 grid place-items-center rounded-full text-[10.5px] font-extrabold bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
                >
                  {phase.phase}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-[var(--text-primary)]">{phase.title}</p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{phase.items.join(' · ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 10 — FUTURE COMPLIANCE ACCELERATORS ============== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Section 10"
          title="Future Compliance Accelerators"
          subtitle={FUTURE_COMPLIANCE_ACCELERATORS_STATEMENT}
          icon="🧩"
        />

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {REGULATORY_COMPLIANCE_PACKS.map(pack => (
              <span
                key={pack}
                className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]"
              >
                {pack}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate('/governance-studio')}
            className="mt-1 self-start text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            See how accelerators are configured in the Studio →
          </button>
        </div>
      </section>

      {/* ============== CLOSING — WHERE TO START ============== */}
      <section
        className="rounded-3xl border p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6"
        style={{ background: 'var(--grad-brand)', borderColor: 'transparent' }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-bold text-white">Where to start</h2>
          <p className="text-[13px] text-white/85 mt-1.5 leading-relaxed max-w-2xl">
            If you take one action: register an AI asset and assign its five owners. Everything else
            in OMG — risk, validation, evidence, decision, monitoring and reassessment — keys off
            that first record.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/assets')}
            data-noglass
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-[var(--accent-primary)] shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Register an AI Asset
          </button>
          <button
            onClick={() => setTourOpen(true)}
            data-noglass
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold border border-white/40 text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Start Guided Tour
          </button>
        </div>
      </section>

      {/* ============== CLOSING — EXECUTIVE MESSAGE ============== */}
      <section
        data-noglass
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 flex flex-col gap-2"
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">Executive Message</p>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          {EXECUTIVE_MESSAGE_STATEMENT}
        </p>
      </section>

      {/* ============== FINAL DECLARATION ============== */}
      <section
        data-noglass
        className="rounded-3xl border p-7 sm:p-9 flex flex-col items-center text-center gap-2"
        style={{ background: 'var(--grad-brand)', borderColor: 'transparent' }}
      >
        <span className="text-[22px]" aria-hidden>🏁</span>
        <h2 className="text-[20px] sm:text-[24px] font-extrabold text-white">{FINAL_DECLARATION_TITLE}</h2>
        <p className="text-[15px] font-bold text-white/90">{FINAL_DECLARATION_STATEMENT}</p>
        <p className="text-[13px] text-white/75 max-w-2xl leading-relaxed mt-1">{PREVENTION_POSITIONING_STATEMENT}</p>
      </section>

      <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};
