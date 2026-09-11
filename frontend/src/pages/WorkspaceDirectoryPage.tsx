import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { getWorkspaces, saveWorkspace, suspendWorkspace, reactivateWorkspace, archiveWorkspace } from '../services/storageService';
import { getTenants } from '../config/tenantFoundation';
import type { EnvironmentTier } from '../types';

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const STATUS_TONE: Record<string, string> = { Active: 'var(--status-success)', Suspended: 'var(--status-warning)', Archived: 'var(--text-muted)' };

export const WorkspaceDirectoryPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const canManage = canPerform('workspace:create');
  const [workspaces, setWorkspaces] = useState(() => getWorkspaces());
  const [tenants] = useState(() => getTenants());
  const [newName, setNewName] = useState('');
  const [newTenantId, setNewTenantId] = useState(tenants[0]?.id || 'tnt-demo');

  const refresh = () => setWorkspaces(getWorkspaces());
  const actor = currentUser?.name || 'Super Admin';

  const handleCreate = () => {
    if (!newName || !canManage) return;
    saveWorkspace({ name: newName, tenantId: newTenantId, environmentTier: 'DEV' as EnvironmentTier }, actor);
    setNewName('');
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Workspace Directory</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Isolated customer evaluation workspaces. Platform administration only — workspace users can never reach this page.
        </p>
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Create Workspace</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Workspace Name</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={!canManage}
              placeholder="e.g. Acme Corp Evaluation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <Select
            label="Tenant"
            value={newTenantId}
            onChange={e => setNewTenantId(e.target.value)}
            options={tenants.map(t => ({ value: t.id, label: t.name }))}
            disabled={!canManage}
          />
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              disabled={!canManage || !newName}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--grad-brand)' }}
            >
              Create Workspace
            </button>
          </div>
        </div>
        {!canManage && <p className="text-[11px] text-[var(--text-muted)] mt-2">Only Super Admin / Platform Admin can create or manage workspaces.</p>}
      </Card>

      <div className="flex flex-col gap-3">
        {workspaces.map(ws => (
          <Card key={ws.id} className="!p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{ws.name}</span>
                  <Pill tone={STATUS_TONE[ws.status]}>{ws.status}</Pill>
                  <Pill tone="var(--text-muted)">Tenant: {tenants.find(t => t.id === ws.tenantId)?.name || ws.tenantId}</Pill>
                  <Pill tone="var(--text-muted)">Env: {ws.environmentTier}</Pill>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Created {ws.createdAt} by {ws.createdBy}</p>
              </div>
              {canManage && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {ws.status !== 'Suspended' && ws.status !== 'Archived' && (
                    <button onClick={() => { suspendWorkspace(ws.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--status-warning)] hover:underline cursor-pointer">Suspend</button>
                  )}
                  {ws.status === 'Suspended' && (
                    <button onClick={() => { reactivateWorkspace(ws.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--status-success)] hover:underline cursor-pointer">Reactivate</button>
                  )}
                  {ws.status !== 'Archived' && (
                    <button onClick={() => { archiveWorkspace(ws.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--text-muted)] hover:underline cursor-pointer">Archive</button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
