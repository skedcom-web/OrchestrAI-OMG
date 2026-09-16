import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { GovernanceTruthCard } from '../components/governance/GovernanceTruthCard';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getAuthorityProvenanceRecords,
  getAuthorityProvenanceForAssetResult,
  saveAuthorityProvenanceRecord,
} from '../services/storageService';
import type { AuthorityGovernanceOutcome, AuthorityRecordStatus } from '../types';

const OUTCOME_TONE: Record<AuthorityGovernanceOutcome, string> = {
  'Authority Current': 'var(--status-success)',
  'Authority At Risk': 'var(--status-warning)',
  'Authority Invalid': 'var(--status-danger)',
};

const STATUS_OPTIONS: AuthorityRecordStatus[] = ['Active', 'Expired', 'Suspended', 'Delegated', 'Superseded', 'Pending Review'];
const ROLE_OPTIONS = ['accountableOwner', 'governanceSponsor', 'riskOwner', 'technicalOwner', 'complianceOwner', 'humanOverrideAuthority', 'killSwitchAuthority', 'reassessmentAuthority'];

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const AuthorityProvenanceRegistryPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [records, setRecords] = useState(() => getAuthorityProvenanceRecords());
  const canFile = canPerform('authorityProvenance:create');

  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [authorityRole, setAuthorityRole] = useState(ROLE_OPTIONS[0]);
  const [holderName, setHolderName] = useState('');
  const [authoritySource, setAuthoritySource] = useState('AI Governance Committee');
  const [delegationRef, setDelegationRef] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<AuthorityRecordStatus>('Active');
  const [supersedes, setSupersedes] = useState('');
  const [saving, setSaving] = useState(false);

  const results = useMemo(
    () => assets.map(a => getAuthorityProvenanceForAssetResult(a.id)).filter((r): r is NonNullable<typeof r> => !!r),
    [assets, records]
  );

  const supersedeCandidates = records.filter(r => r.assetId === assetId && r.status === 'Active');

  const handleRecord = () => {
    if (!assetId || !holderName || !delegationRef || !canFile) return;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    setSaving(true);
    saveAuthorityProvenanceRecord({
      assetId,
      assetName: asset.name,
      authorityRole,
      holderName,
      authoritySource,
      delegationRef,
      effectiveDate,
      expiryDate: expiryDate || undefined,
      status,
      supersedes: supersedes || undefined,
      createdBy: currentUser?.name || 'David Chen (Governance Admin)',
    });
    setRecords(getAuthorityProvenanceRecords());
    setHolderName('');
    setDelegationRef('');
    setExpiryDate('');
    setSupersedes('');
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Authority Provenance Registry</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Release 19 — Domain A. OMG records and operationalizes authority; it does not create it. Every grant of
          authority here is traceable to a source, a delegation reference, and an effective/expiry window — advisory
          reference data, never a new authorization mechanism.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['Authority Current', 'Authority At Risk', 'Authority Invalid'] as AuthorityGovernanceOutcome[]).map(outcome => (
          <Card key={outcome} className="!p-4">
            <p className="text-2xl font-extrabold tnum" style={{ color: OUTCOME_TONE[outcome] }}>
              {results.filter(r => r.outcome === outcome).length}
            </p>
            <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">{outcome}</p>
          </Card>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Authority Standing by Asset</p>
        <div className="flex flex-col gap-2.5">
          {results.map(r => (
            <Card key={r.assetId} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.assetName}</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{r.reasons[0]}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <Pill tone={OUTCOME_TONE[r.outcome]}>{r.outcome}</Pill>
                  <Pill>{r.activeRecordCount} active</Pill>
                  <Pill>{r.expiredRecordCount} expired</Pill>
                  <Pill>{r.supersededRecordCount} superseded</Pill>
                  <GovernanceTruthCard assetId={r.assetId} compact />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Record Authority</p>
        {!canFile && <p className="text-[11px] text-[var(--text-muted)] mb-3">Your role can view provenance but not record new authority grants.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Asset" value={assetId} onChange={e => setAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: a.name }))} disabled={!canFile} />
          <Select label="Authority Role" value={authorityRole} onChange={e => setAuthorityRole(e.target.value)} options={ROLE_OPTIONS.map(r => ({ value: r, label: r }))} disabled={!canFile} />
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value as AuthorityRecordStatus)} options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))} disabled={!canFile} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Holder Name</label>
            <input value={holderName} onChange={e => setHolderName(e.target.value)} disabled={!canFile} placeholder="e.g. Marcus Vance" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Authority Source</label>
            <input value={authoritySource} onChange={e => setAuthoritySource(e.target.value)} disabled={!canFile} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Delegation Ref</label>
            <input value={delegationRef} onChange={e => setDelegationRef(e.target.value)} disabled={!canFile} placeholder="e.g. GOV-2026-014" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Effective Date</label>
              <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} disabled={!canFile} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} disabled={!canFile} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
          </div>
        </div>
        {supersedeCandidates.length > 0 && (
          <div className="mt-3">
            <Select
              label="Supersedes (optional)"
              value={supersedes}
              onChange={e => setSupersedes(e.target.value)}
              options={[{ value: '', label: 'None — this is a new grant' }, ...supersedeCandidates.map(c => ({ value: c.id, label: `${c.authorityRole} — ${c.holderName} (${c.delegationRef})` }))]}
              disabled={!canFile}
            />
          </div>
        )}
        <button
          onClick={handleRecord}
          disabled={!canFile || saving || !holderName || !delegationRef}
          className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--grad-brand)' }}
        >
          {saving ? 'Recording…' : 'Record Authority'}
        </button>
        <p className="text-[10.5px] text-[var(--text-muted)] mt-2">
          Selecting an existing active grant to supersede preserves it as history rather than deleting it — Authority
          Lineage stays intact.
        </p>
      </Card>
    </div>
  );
};
