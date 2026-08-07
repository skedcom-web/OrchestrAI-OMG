import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getGovernanceMetrics } from '../services/storageService';
import type { AssetType } from '../types';

/**
 * Platform Overview — the explanatory surface for OMG.
 *
 * Phase 8B moved the executive landing experience to the Enterprise Governance
 * Command Center; this page retains the "what / why / how" narrative used for
 * onboarding, executive briefings and vendor review.
 */
export const OmgOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const metrics = getGovernanceMetrics();

  const assetTypesList: { type: AssetType; description: string; icon: string }[] = [
    { type: 'Application', description: 'AI-infused standalone enterprise applications', icon: '💻' },
    { type: 'Agent', description: 'Autonomous goal-driven reasoning & task agents', icon: '🤖' },
    { type: 'Model', description: 'Custom predictive ML & statistical classification models', icon: '📈' },
    { type: 'LLM', description: 'Foundation models, fine-tuned LLMs & SLMs', icon: '🧠' },
    { type: 'Copilot', description: 'Human-in-the-loop interactive assistant copilots', icon: '👥' },
    { type: 'RAG System', description: 'Retrieval-augmented knowledge indexing systems', icon: '📚' },
    { type: 'AI Workflow', description: 'Orchestrated multi-step AI decision pipelines', icon: '⚡' },
    { type: 'Multi-Agent System', description: 'Swarm multi-agent collaborative networks', icon: '🌐' },
    { type: 'Third-Party AI Service', description: 'External vendor SaaS & API AI integrations', icon: '🔌' },
  ];

  const problemCards = [
    { title: 'Visibility Gap', text: 'Organizations lack a single source of truth for what AI assets exist across departments.', icon: '👁️' },
    { title: 'Ownership Gap', text: 'AI systems operate without clear business, technical, risk, and compliance accountability.', icon: '👤' },
    { title: 'Risk Gap', text: 'Unmonitored high-risk AI models deploy into production without formalized risk tiering.', icon: '⚠️' },
    { title: 'Governance Gap', text: 'Approvals, validations, and human oversight checks become siloed or forgotten.', icon: '📑' },
    { title: 'Audit Gap', text: 'Generating regulatory audit proof takes weeks of manual evidence gathering.', icon: '🔍' },
  ];

  const solutionPillars = [
    { title: 'Inventory', text: 'Know every AI asset enterprise-wide.' },
    { title: 'Ownership', text: 'Assign 5-role accountability.' },
    { title: 'Risk', text: 'Classify risk & data sensitivity.' },
    { title: 'Validation', text: 'Track test evidence & model performance.' },
    { title: 'Monitoring', text: 'Maintain real-time observability.' },
    { title: 'Audit', text: 'Generate instant compliance proof.' },
    { title: 'Control', text: 'Enforce kill-switches & human oversight.' },
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* SECTION 1: HERO */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] p-8 sm:p-12"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="max-w-3xl flex flex-col gap-6 relative z-10">
          <div
            data-noglass
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-[11px] font-extrabold uppercase tracking-[0.12em] border border-[var(--accent-border)] w-fit"
          >
            <span>🛡️ Platform Overview</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            The Enterprise AI Governance{' '}
            <span className="text-gradient-brand">Operating System</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            OrchestrAI Model Governance governs every form of enterprise artificial intelligence —
            applications, agents, models, copilots, RAG systems and third-party services — through
            one accountable operating model: govern every AI, control every decision, prove every
            outcome.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" onClick={() => navigate('/command-center')}>
              <span>Open Command Center</span>
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/assets')}>
              <span>Register AI Asset</span>
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/decision-workbench-v4')}>
              <span>Decision Authority</span>
            </Button>
          </div>
        </div>

        {/* Decorative orbital */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <div
            className="w-80 h-80 rounded-full border-4 border-[var(--accent-primary)]/40 animate-spin"
            style={{ animationDuration: '40s' }}
          />
        </div>
      </section>

      {/* SECTION 6: EXECUTIVE SNAPSHOT */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Executive Snapshot</h2>
          <span className="text-xs text-[var(--text-muted)] font-medium">Real-Time Metrics</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card glowOnHover className="!p-5">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">Total Governed Assets</p>
            <h3 className="text-3xl font-black mt-1 text-[var(--text-primary)]">{metrics.totalAssets}</h3>
            <p className="text-xs text-emerald-400 mt-1 font-medium">100% Registry Coverage</p>
          </Card>

          <Card glowOnHover className="!p-5">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">High / Critical Risk</p>
            <h3 className="text-3xl font-black mt-1 text-red-500">
              {metrics.riskBreakdown['High'] + metrics.riskBreakdown['Critical']}
            </h3>
            <p className="text-xs text-red-400 mt-1 font-medium">{metrics.highRiskUnapprovedCount} Unapproved</p>
          </Card>

          <Card glowOnHover className="!p-5">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">Ownership Completion</p>
            <h3 className="text-3xl font-black mt-1 text-cyan-400">{metrics.ownershipCompletionRate}%</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Full 5-Role Matrix</p>
          </Card>

          <Card glowOnHover className="!p-5">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">Governed Decisions</p>
            <h3 className="text-3xl font-black mt-1 text-purple-400">{metrics.decisionBreakdown['GO']}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Production Approved</p>
          </Card>
        </div>
      </section>

      {/* SECTION 2: AI ASSET TYPES */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">What OMG Governs</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            OMG governs every form of enterprise artificial intelligence across 9 supported asset classes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assetTypesList.map(item => (
            <Card key={item.type} glowOnHover className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{item.type}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3: WHY OMG EXISTS */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Why OMG Exists</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Addressing the critical AI governance gaps faced by modern enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {problemCards.map(card => (
            <Card key={card.title} className="flex flex-col gap-2">
              <span className="text-2xl">{card.icon}</span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{card.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{card.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW OMG HELPS */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">How OMG Helps</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            End-to-end enterprise governance capabilities in one single pane of glass.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {solutionPillars.map(p => (
            <div key={p.title} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center flex flex-col gap-1">
              <h4 className="text-sm font-bold text-[var(--accent-primary)]">{p.title}</h4>
              <p className="text-[11px] text-[var(--text-secondary)]">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: QUICK ACTIONS */}
      <section className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Ready to Govern Enterprise AI?</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Register your first asset, assign ownership, or evaluate decision readiness today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button onClick={() => navigate('/assets')}>Register AI Asset</Button>
          <Button variant="secondary" onClick={() => navigate('/ownership')}>Manage Ownership</Button>
          <Button variant="outline" onClick={() => navigate('/risk')}>Risk Wizard</Button>
        </div>
      </section>
    </div>
  );
};
