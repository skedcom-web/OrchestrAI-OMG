import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import {
  getCertificationPrograms,
  getCertificationRecords,
  issueCertificationRecord,
  renewCertificationRecord,
  revokeCertificationRecord,
  getAssets,
  getModels,
  getTools,
} from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { CertificationRecord } from '../types';

type EntityKind = CertificationRecord['entityType'];
type DisplayStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Revoked';

const ENTITY_KIND_OPTIONS: { value: EntityKind; label: string }[] = [
  { value: 'Asset', label: 'AI Asset' },
  { value: 'Model', label: 'Model' },
  { value: 'Tool', label: 'Tool' },
];

const STATUS_TONE: Record<DisplayStatus, string> = {
  'Active': 'var(--status-success)',
  'Expiring Soon': 'var(--status-warning)',
  'Expired': 'var(--status-danger)',
  'Revoked': 'var(--text-muted)',
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
}

/** Expiring Soon = within 30 days, same threshold as the Evidence Registry's own expiry indicator. */
function displayStatus(record: CertificationRecord): DisplayStatus {
  if (record.status === 'REVOKED') return 'Revoked';
  const remaining = daysUntil(record.expiresAt);
  if (remaining < 0) return 'Expired';
  if (remaining <= 30) return 'Expiring Soon';
  return 'Active';
}

/**
 * R20 — Certification Governance. Assess -> Issue -> Monitor (renewal
 * window) -> Renew or Revoke. Renewal and revocation are both recorded human
 * decisions. A certification's status is informational everywhere it's
 * shown — it never gates whether the underlying entity can operate.
 */
export const CertificationRecordsPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [records, setRecords] = useState<CertificationRecord[]>(() => getCertificationRecords());
  const [programs] = useState(() => getCertificationPrograms());
  const [statusFilter, setStatusFilter] = useState<'All' | DisplayStatus>('All');

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueProgramId, setIssueProgramId] = useState('');
  const [issueEntityKind, setIssueEntityKind] = useState<EntityKind>('Asset');
  const [issueEntityId, setIssueEntityId] = useState('');

  const [renewTarget, setRenewTarget] = useState<CertificationRecord | null>(null);
  const [renewalNotes, setRenewalNotes] = useState('');

  const [revokeTarget, setRevokeTarget] = useState<CertificationRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

  const [saving, setSaving] = useState(false);

  const refresh = () => setRecords(getCertificationRecords());

  const assets = getAssets();
  const models = getModels();
  const tools = getTools();

  const entityOptionsFor = (kind: EntityKind): { value: string; label: string }[] => {
    switch (kind) {
      case 'Asset': return assets.map(a => ({ value: a.id, label: a.name }));
      case 'Model': return models.map(m => ({ value: m.id, label: m.name }));
      case 'Tool': return tools.map(t => ({ value: t.id, label: t.name }));
    }
  };

  const entityNameFor = (kind: EntityKind, id: string): string => entityOptionsFor(kind).find(o => o.value === id)?.label || id;

  const rows = useMemo(() => records.map(r => ({ record: r, status: displayStatus(r) })), [records]);
  const filtered = rows.filter(r => statusFilter === 'All' || r.status === statusFilter);

  const counts = {
    Active: rows.filter(r => r.status === 'Active').length,
    'Expiring Soon': rows.filter(r => r.status === 'Expiring Soon').length,
    Expired: rows.filter(r => r.status === 'Expired').length,
    Revoked: rows.filter(r => r.status === 'Revoked').length,
  };

  const openIssue = () => {
    setIssueProgramId(programs[0]?.id || '');
    setIssueEntityKind('Asset');
    setIssueEntityId('');
    setIssueOpen(true);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueProgramId || !issueEntityId) return;
    setSaving(true);
    try {
      await issueCertificationRecord(issueProgramId, issueEntityKind, issueEntityId, entityNameFor(issueEntityKind, issueEntityId), currentUser?.name || 'Unknown');
      refresh();
      setIssueOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const openRenew = (record: CertificationRecord) => {
    setRenewTarget(record);
    setRenewalNotes('');
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;
    setSaving(true);
    try {
      await renewCertificationRecord(renewTarget.id, currentUser?.name || 'Unknown', renewalNotes || undefined);
      refresh();
      setRenewTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const openRevoke = (record: CertificationRecord) => {
    setRevokeTarget(record);
    setRevocationReason('');
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeTarget || !revocationReason.trim()) return;
    setSaving(true);
    try {
      await revokeCertificationRecord(revokeTarget.id, currentUser?.name || 'Unknown', revocationReason);
      refresh();
      setRevokeTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Certification Records"
        subtitle="Every certification issued, active, expiring or revoked, across Models, Tools and Assets."
        icon="🏆"
        action={canPerform('certificationRecord:issue') && <Button onClick={openIssue} icon={<span>➕</span>}>Issue Certification</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['Active', 'Expiring Soon', 'Expired', 'Revoked'] as DisplayStatus[]).map(status => (
          <Card key={status} className="!p-4">
            <p className="text-2xl font-extrabold tnum" style={{ color: STATUS_TONE[status] }}>{counts[status]}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">{status}</p>
          </Card>
        ))}
      </div>

      <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} options={[{ value: 'All', label: 'All statuses' }, ...(['Active', 'Expiring Soon', 'Expired', 'Revoked'] as DisplayStatus[]).map(s => ({ value: s, label: s }))]} className="sm:max-w-[12rem]" />

      <div className="flex flex-col gap-3">
        {filtered.map(({ record, status }) => (
          <Card key={record.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{record.entityType}</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{record.entityName}</p>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: STATUS_TONE[status], background: 'var(--bg-badge)', border: `1px solid ${STATUS_TONE[status]}40` }}>{status}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                {record.program?.name || programs.find(p => p.id === record.programId)?.name} — issued {String(record.issuedAt).split('T')[0]} by {record.issuedBy}, expires {String(record.expiresAt).split('T')[0]}
              </p>
              {record.status === 'REVOKED' && record.revocationReason && (
                <p className="text-xs text-[var(--status-danger)] mt-1">"{record.revocationReason}" — {record.revokedBy}, {String(record.revokedAt).split('T')[0]}</p>
              )}
              {record.renewedAt && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Last renewed {String(record.renewedAt).split('T')[0]} by {record.renewedBy}</p>
              )}
            </div>
            {record.status !== 'REVOKED' && (
              <div className="flex gap-2 shrink-0">
                {canPerform('certificationRecord:renew') && (
                  <Button variant="secondary" size="sm" onClick={() => openRenew(record)}>Renew</Button>
                )}
                {canPerform('certificationRecord:revoke') && (
                  <Button variant="ghost" size="sm" onClick={() => openRevoke(record)}>Revoke</Button>
                )}
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No certification records match this filter.</p>}
      </div>

      <Modal isOpen={issueOpen} onClose={() => setIssueOpen(false)} title="Issue Certification" subtitle="Expiry is computed automatically from the program's validity period." maxWidth="sm">
        <form onSubmit={handleIssue} className="flex flex-col gap-4">
          <Select label="Program" value={issueProgramId} onChange={e => setIssueProgramId(e.target.value)} options={programs.map(p => ({ value: p.id, label: p.name }))} />
          <Select label="Entity Type" value={issueEntityKind} onChange={e => { setIssueEntityKind(e.target.value as EntityKind); setIssueEntityId(''); }} options={ENTITY_KIND_OPTIONS} />
          <Select label="Entity" value={issueEntityId} onChange={e => setIssueEntityId(e.target.value)} options={[{ value: '', label: 'Select an entity…' }, ...entityOptionsFor(issueEntityKind)]} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !issueEntityId || !issueProgramId}>{saving ? 'Issuing…' : 'Issue Certification'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!renewTarget} onClose={() => setRenewTarget(null)} title={`Renew Certification — ${renewTarget?.entityName || ''}`} subtitle="Extends the expiry date by the program's full validity period from today." maxWidth="sm">
        <form onSubmit={handleRenew} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Renewal Notes (optional)</label>
            <textarea rows={3} value={renewalNotes} onChange={e => setRenewalNotes(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Renewing…' : 'Renew'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!revokeTarget} onClose={() => setRevokeTarget(null)} title={`Revoke Certification — ${revokeTarget?.entityName || ''}`} subtitle="A reason is required — this becomes part of the certification's permanent record. Revocation is informational; it does not stop the underlying entity from operating." maxWidth="sm">
        <form onSubmit={handleRevoke} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Revocation Reason</label>
            <textarea required rows={3} value={revocationReason} onChange={e => setRevocationReason(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Revoking…' : 'Revoke'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
