import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getEnvironments, getActiveEnvironment } from '../config/environmentFoundation';
import type { EnvironmentTier } from '../types';

const TIER_TONE: Record<EnvironmentTier, string> = {
  DEV: 'var(--status-success)',
  QA: 'var(--status-warning)',
  PROD: 'var(--accent-primary)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const EnvironmentManagementPage: React.FC = () => {
  const { canPerform } = useAuth();
  const canSwitch = canPerform('environment:switch');
  const environments = useState(() => getEnvironments())[0];
  const activeEnvironment = getActiveEnvironment();
  const [previewTier, setPreviewTier] = useState<EnvironmentTier>(activeEnvironment.tier);
  const previewEnv = environments.find(e => e.tier === previewTier) || activeEnvironment;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Environment Management</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Foundation for future DEV / QA / PROD environment separation. The running app is backed by exactly one
          environment today — everything below is architecture, not a live switch.
        </p>
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Environment Selector {canSwitch ? '' : '(Super Admin only)'}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {environments.map(env => (
            <button
              key={env.id}
              disabled={!canSwitch}
              onClick={() => setPreviewTier(env.tier)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                previewTier === env.tier
                  ? 'text-white shadow-md'
                  : 'text-[var(--text-secondary)] bg-[var(--bg-sunken)] border-[var(--border-subtle)]'
              } ${canSwitch ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              style={previewTier === env.tier ? { background: TIER_TONE[env.tier], borderColor: TIER_TONE[env.tier] } : undefined}
            >
              {env.tier}
            </button>
          ))}
        </div>
        {!canSwitch && (
          <p className="text-[11px] text-[var(--text-muted)] mt-3">
            Only a Super Admin can change the environment preview. You are viewing the {activeEnvironment.tier} environment.
          </p>
        )}
        {previewTier !== activeEnvironment.tier && (
          <p className="text-[11px] text-[var(--status-warning)] mt-3 font-semibold">
            Preview only — the app continues reading from {activeEnvironment.tier}. Selecting {previewTier} does not switch the underlying data source.
          </p>
        )}
      </Card>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Environment Metadata Dashboard</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Tier', previewEnv.tier],
            ['Status', previewEnv.status],
            ['Seed Data', previewEnv.seedStatus],
            ['Health', previewEnv.health],
          ].map(([label, val]) => (
            <Card key={label} className="!p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{label}</p>
              <p className="text-sm font-extrabold text-[var(--text-primary)] mt-1">{val}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Environment Registry &amp; Health Indicators</p>
        <div className="flex flex-col gap-3">
          {environments.map(env => (
            <Card key={env.id} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{env.name}</span>
                    <Pill tone={TIER_TONE[env.tier]}>{env.tier}</Pill>
                    <Pill tone={env.status === 'Active' ? 'var(--status-success)' : 'var(--text-muted)'}>{env.status}</Pill>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{env.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Pill tone={env.health === 'Healthy' ? 'var(--status-success)' : 'var(--text-muted)'}>{env.health}</Pill>
                  <Pill tone="var(--text-muted)">{env.seedStatus}</Pill>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)]">
        Environment-Aware Seed Loading: seed data is loaded per environment status above — DEV remains fully seeded;
        QA and PROD carry no live or seeded data until a future release provisions them.
      </p>
    </div>
  );
};
