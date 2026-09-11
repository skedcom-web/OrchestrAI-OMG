import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import {
  getWorkspaces,
  getWorkspaceUsers,
  saveWorkspaceUser,
  resetWorkspaceUserPassword,
  disableWorkspaceUser,
  enableWorkspaceUser,
  sendWorkspaceInvitation,
} from '../services/storageService';

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const STATUS_TONE: Record<string, string> = { Active: 'var(--status-success)', Disabled: 'var(--status-danger)', Invited: 'var(--status-warning)' };

export const WorkspaceUserAdministrationPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const canManage = canPerform('workspaceUser:create');
  const [workspaces] = useState(() => getWorkspaces());
  const [users, setUsers] = useState(() => getWorkspaceUsers());
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const actor = currentUser?.name || 'Super Admin';
  const refresh = () => setUsers(getWorkspaceUsers());

  const handleCreate = () => {
    if (!canManage || !name || !email || !workspaceId) return;
    saveWorkspaceUser({ workspaceId, name, email, password: 'demo1234' }, actor);
    setName('');
    setEmail('');
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Workspace User Administration</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Provision Workspace Owner accounts. Platform administration only — workspace users can never reach this page.
        </p>
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Create User</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            label="Workspace"
            value={workspaceId}
            onChange={e => setWorkspaceId(e.target.value)}
            options={workspaces.map(w => ({ value: w.id, label: w.name }))}
            disabled={!canManage}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} disabled={!canManage} placeholder="Chris" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} disabled={!canManage} placeholder="chris@company.com" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              disabled={!canManage || !name || !email}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--grad-brand)' }}
            >
              Create User
            </button>
          </div>
        </div>
        <p className="text-[10.5px] text-[var(--text-muted)] mt-2">New users are created with the demo credential <strong>demo1234</strong> — not real security, see Workspace Login.</p>
        {!canManage && <p className="text-[11px] text-[var(--text-muted)] mt-2">Only Super Admin / Platform Admin can manage workspace users.</p>}
      </Card>

      <div className="flex flex-col gap-3">
        {users.map(u => {
          const ws = workspaces.find(w => w.id === u.workspaceId);
          return (
            <Card key={u.id} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{u.name}</span>
                    <Pill tone={STATUS_TONE[u.status]}>{u.status}</Pill>
                    <Pill tone="var(--accent-primary)">{u.role}</Pill>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{u.email} · Workspace: {ws?.name || u.workspaceId}</p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {u.status === 'Active' ? (
                      <button onClick={() => { disableWorkspaceUser(u.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--status-danger)] hover:underline cursor-pointer">Disable</button>
                    ) : (
                      <button onClick={() => { enableWorkspaceUser(u.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--status-success)] hover:underline cursor-pointer">Enable</button>
                    )}
                    <button onClick={() => { sendWorkspaceInvitation(u.id, actor); refresh(); }} className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer">Send Invitation</button>
                    {resettingId === u.id ? (
                      <>
                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="w-28 px-2.5 py-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs" />
                        <button onClick={() => { if (newPassword) { resetWorkspaceUserPassword(u.id, newPassword, actor); setNewPassword(''); setResettingId(null); refresh(); } }} className="text-[11px] font-bold text-[var(--accent-primary)] cursor-pointer">Save</button>
                        <button onClick={() => setResettingId(null)} className="text-[11px] font-semibold text-[var(--text-muted)] cursor-pointer">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setResettingId(u.id)} className="text-[11px] font-bold text-[var(--text-secondary)] hover:underline cursor-pointer">Reset Password</button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
