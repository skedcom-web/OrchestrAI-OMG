import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { getTenants, getCurrentTenant } from '../config/tenantFoundation';

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const TenantManagementPage: React.FC = () => {
  const [tenants] = useState(() => getTenants());
  const currentTenant = getCurrentTenant();
  const activeCount = tenants.filter(t => t.status === 'Active').length;
  const plannedCount = tenants.filter(t => t.status === 'Planned').length;
  const industries = new Set(tenants.map(t => t.industry)).size;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Tenant Registry</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Foundation for future customer onboarding. OMG operates as a single shared tenant today — the records
          below prepare the data architecture for tenant isolation without redesigning anything that exists now.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Current Tenant', currentTenant.name],
          ['Active Tenants', activeCount],
          ['Planned Tenants', plannedCount],
          ['Industries Represented', industries],
        ].map(([label, val]) => (
          <Card key={label as string} className="!p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{label}</p>
            <p className="text-sm font-extrabold text-[var(--text-primary)] mt-1">{val}</p>
          </Card>
        ))}
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tenant Context Service</p>
        <p className="text-sm text-[var(--text-primary)]">
          The active session resolves to <strong>{currentTenant.name}</strong>.
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
          Every seeded record in OMG today belongs to this one tenant. Tenant switching, tenant-specific
          security isolation and tenant-scoped reporting are future ODF/customer implementation activities,
          not part of this foundation release.
        </p>
      </Card>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tenant Registry</p>
        <div className="flex flex-col gap-3">
          {tenants.map(tenant => (
            <Card key={tenant.id} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{tenant.name}</span>
                    <Pill tone={tenant.status === 'Active' ? 'var(--status-success)' : 'var(--text-muted)'}>{tenant.status}</Pill>
                    <Pill tone="var(--accent-primary)">{tenant.industry}</Pill>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{tenant.description}</p>
                </div>
                <Pill tone="var(--text-muted)">Env: {tenant.environmentTier}</Pill>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
