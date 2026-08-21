import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useExperience } from '../contexts/ExperienceContext';
import { useAuth } from '../contexts/AuthContext';
import { getGovernanceMetrics } from '../services/storageService';
import { NAV_DOMAINS, FUTURE_MODULES } from '../config/navigation';
import { API_BASE_URL } from '../repositories/apiClient';
import { migrateLocalDataToNeon, type MigrationResult } from '../services/migrationService';
import { bootstrapPersistence, getAssets, getEvidenceRecords } from '../services/storageService';
import type { ThemeMode } from '../types';

const SettingRow: React.FC<{
  label: string;
  description: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-[var(--border-subtle)] last:border-0">
    <div className="min-w-0">
      <p className="text-[13px] font-bold text-[var(--text-primary)]">{label}</p>
      <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
        {description}
      </p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const TenantSettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = useExperience();
  const { currentPersona } = useAuth();
  const metrics = getGovernanceMetrics();

  // Release 4.1 — Persistence Completion: Neon is the only System of Record.
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [reloading, setReloading] = useState(false);
  const [reloadedAt, setReloadedAt] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationLog, setMigrationLog] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const checkBackendHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      setHealthStatus(res.ok ? 'online' : 'offline');
    } catch {
      setHealthStatus('offline');
    }
  };

  const reloadFromNeon = async () => {
    setReloading(true);
    try {
      await bootstrapPersistence({ force: true });
      setReloadedAt(new Date().toLocaleTimeString());
    } finally {
      setReloading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm('Copy all local demo data (assets, evidence, continuity records) to the live Neon database? This creates new records — it does not delete anything locally.')) return;
    setMigrating(true);
    setMigrationResult(null);
    setMigrationLog('Starting migration...');
    try {
      const result = await migrateLocalDataToNeon(msg => setMigrationLog(msg));
      setMigrationResult(result);
    } catch (err) {
      setMigrationLog(`Migration failed: ${(err as Error).message}`);
    } finally {
      setMigrating(false);
    }
  };

  const themes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'glass', label: 'Glass', icon: '💎' },
  ];

  const tenantFacts = [
    { label: 'Tenant', value: 'Enterprise Banking' },
    { label: 'Governance Framework', value: 'ODF v1 · RBI Aligned' },
    { label: 'Platform Phase', value: 'Phase 8 — Governance OS' },
    { label: 'Governed Assets', value: String(metrics.totalAssets) },
    { label: 'Governance Domains', value: String(NAV_DOMAINS.length) },
    { label: 'Audit Retention', value: 'Immutable · Day 1' },
  ];

  const thresholds = [
    { label: 'Validation pass threshold', value: '80 / 100', note: 'Minimum independent validation score for a GO recommendation.' },
    { label: 'Governance readiness floor', value: '70 / 100', note: 'Below this, an asset is marked Not Ready for production.' },
    { label: 'High-risk review cadence', value: 'Quarterly', note: 'High and Critical risk assets require quarterly governance review.' },
    { label: 'Standard review cadence', value: 'Annual', note: 'Low and Medium risk assets require annual governance review.' },
    { label: 'Evidence minimum', value: '3 deliverables', note: 'Minimum ODF deliverables filed before an asset is audit ready.' },
  ];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Tenant Settings</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Tenant profile, governance thresholds and platform experience defaults.
        </p>
      </div>

      {/* Tenant profile */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Tenant Profile"
          subtitle="Identity and governance framework in force for this deployment."
          icon="🏢"
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tenantFacts.map(fact => (
            <div
              key={fact.label}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                {fact.label}
              </p>
              <p className="text-[13px] font-bold text-[var(--text-primary)] mt-1">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Release 4.1 — Persistence Completion: System of Record */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="System of Record"
          subtitle="One persistence architecture. Neon is the only System of Record — local storage is a cache, never primary."
          icon="🗄️"
        />

        <div
          data-noglass
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">Demo Tenant</p>
            <p className="text-[13px] font-bold text-[var(--text-primary)] mt-1">OMG Demo Organization</p>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
            Demo Mode means seeded users, roles, assets and evidence living in this same Neon
            database — not a different storage path. A future customer tenant (a bank, an insurer,
            an enterprise customer) differs only in whose data it holds, via the same repository
            pattern below; multi-tenant isolation is prepared, not yet active.
          </p>
        </div>

        <SettingRow
          label="Persistence"
          description="Frontend → API → NestJS → Prisma → Neon, for Assets, Evidence and Continuity records. This path is fixed — there is no local-storage-only mode."
        >
          <span
            data-noglass
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11.5px] font-bold text-emerald-500"
          >
            Neon PostgreSQL
          </span>
        </SettingRow>

        <SettingRow
          label="Backend API connection"
          description="NestJS + Prisma + Neon. The same API every asset, evidence and continuity read and write goes through."
        >
          <div className="flex items-center gap-2">
            {healthStatus !== 'idle' && (
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg ${
                  healthStatus === 'online' ? 'bg-emerald-500/15 text-emerald-500' :
                  healthStatus === 'offline' ? 'bg-red-500/15 text-red-500' :
                  'bg-[var(--bg-badge)] text-[var(--text-muted)]'
                }`}
              >
                {healthStatus === 'checking' ? 'Checking…' : healthStatus}
              </span>
            )}
            <Button size="sm" variant="secondary" onClick={checkBackendHealth}>
              Check connection
            </Button>
          </div>
        </SettingRow>

        <SettingRow
          label="Reload from Neon"
          description={`Currently showing ${getAssets().length} assets and ${getEvidenceRecords().length} evidence records from this session's cache.${reloadedAt ? ` Last reloaded ${reloadedAt}.` : ''}`}
        >
          <Button size="sm" variant="secondary" onClick={reloadFromNeon} disabled={reloading}>
            {reloading ? 'Reloading…' : 'Reload from Neon'}
          </Button>
        </SettingRow>

        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[var(--text-primary)]">Data Migration Utility</p>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                For records that only ever made it as far as this browser's cache — e.g. a save
                that couldn't reach Neon at the time. Copies anything still local-only up to the
                live database; already-synced records are unaffected.
              </p>
            </div>
            <Button size="sm" onClick={runMigration} disabled={migrating}>
              {migrating ? 'Migrating…' : 'Migrate Local Data to Neon'}
            </Button>
          </div>

          {migrationLog && (
            <p className="text-[11px] text-[var(--text-muted)] font-mono">{migrationLog}</p>
          )}

          {migrationResult && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Assets', value: migrationResult.assetsCreated },
                { label: 'Evidence', value: migrationResult.evidenceCreated },
                { label: 'Triggers', value: migrationResult.triggersCreated },
                { label: 'Reauthorizations', value: migrationResult.reauthorizationsCreated },
                { label: 'Reviews', value: migrationResult.reviewsCreated },
              ].map(row => (
                <div key={row.label} data-noglass className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2">
                  <p className="text-[9px] font-extrabold uppercase text-[var(--text-muted)]">{row.label}</p>
                  <p className="text-[15px] font-black text-[var(--text-primary)]">{row.value}</p>
                </div>
              ))}
            </div>
          )}

          {migrationResult && migrationResult.errors.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold text-red-500">{migrationResult.errors.length} error(s):</p>
              {migrationResult.errors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-[10.5px] text-red-500 font-mono">{err}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience defaults */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-1">
        <SectionHeader
          title="Experience Defaults"
          subtitle="How OMG presents itself to this operator. Presentation only — never a substitute for RBAC."
          icon="🎛️"
        />

        <div className="mt-2">
          <SettingRow
            label="Experience mode"
            description="Executive mode narrows the surface to the decisions leadership must make. Governance mode exposes full operational depth."
          >
            <div
              data-noglass
              className="flex items-center p-0.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]"
            >
              {(['executive', 'governance'] as const).map(value => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold capitalize transition-all cursor-pointer ${
                    mode === value
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            label="Visual theme"
            description="Light for daylight review sessions, Dark for the command centre, Glass for executive presentation."
          >
            <div
              data-noglass
              className="flex items-center p-0.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]"
            >
              {themes.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer ${
                    theme === t.value
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span aria-hidden>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            label="Active governance persona"
            description="Change the persona from the identity menu in the top bar. Persona determines module authorisation."
          >
            <span
              data-noglass
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)] text-[12px] font-bold text-[var(--accent-primary)]"
            >
              <span aria-hidden>{currentPersona?.icon}</span>
              {currentPersona?.title}
            </span>
          </SettingRow>
        </div>
      </section>

      {/* Governance thresholds */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Governance Thresholds"
          subtitle="The quantitative rules the governance engine applies when scoring readiness."
          icon="📐"
        />

        <div className="flex flex-col">
          {thresholds.map(t => (
            <div
              key={t.label}
              className="flex items-center justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0"
            >
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[var(--text-primary)]">{t.label}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{t.note}</p>
              </div>
              <span
                data-noglass
                className="shrink-0 tnum text-[12px] font-extrabold px-3 py-1.5 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                {t.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Thresholds are fixed for this tenant in Phase 8. Configurable per-tenant policy thresholds
          arrive with Policy Management in Phase 10.
        </p>
      </section>

      {/* Roadmap */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Platform Roadmap"
          subtitle="Modules architected in Phase 8 and delivered in subsequent phases."
          icon="🧭"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {FUTURE_MODULES.map(module => (
            <div
              key={module.path}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base" aria-hidden>
                  {module.icon}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {module.phase}
                </span>
              </div>
              <p className="text-[12.5px] font-bold text-[var(--text-primary)] mt-2">
                {module.label}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
