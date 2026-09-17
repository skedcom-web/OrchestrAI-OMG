import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getGovernancePositionIntakes,
  createGovernancePositionIntake,
  reviewGovernancePositionIntake,
} from '../services/storageService';
import type { GovernancePositionIntake, GovernancePositionIntakeStatus } from '../types';

const STATUSES: GovernancePositionIntakeStatus[] = ['Received', 'Under Review', 'Accepted', 'Rejected'];

const STATUS_TONE: Record<GovernancePositionIntakeStatus, string> = {
  'Received': 'var(--text-muted)',
  'Under Review': 'var(--status-warning)',
  'Accepted': 'var(--status-success)',
  'Rejected': 'var(--status-danger)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]";
const labelClass = "text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider";

const listToLines = (value: string): string[] => value.split('\n').map(l => l.trim()).filter(Boolean);

export const GovernancePositionIntakeDashboardPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [intakes, setIntakes] = useState<GovernancePositionIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<GovernancePositionIntakeStatus | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canCreate = canPerform('governancePositionIntake:create');
  const canReview = canPerform('governancePositionIntake:review');

  const [sourceSystem, setSourceSystem] = useState('');
  const [sourceAuthority, setSourceAuthority] = useState('');
  const [authorityReference, setAuthorityReference] = useState('');
  const [scope, setScope] = useState('');
  const [applicability, setApplicability] = useState('');
  const [conditions, setConditions] = useState('');
  const [obligations, setObligations] = useState('');
  const [evidenceRequirements, setEvidenceRequirements] = useState('');

  const [reviewAssetId, setReviewAssetId] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const reload = () => {
    setLoading(true);
    getGovernancePositionIntakes().then(rows => { setIntakes(rows); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(
    () => (statusFilter === 'All' ? intakes : intakes.filter(i => i.status === statusFilter)),
    [intakes, statusFilter]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: intakes.length };
    STATUSES.forEach(s => { map[s] = intakes.filter(i => i.status === s).length; });
    return map;
  }, [intakes]);

  const handleCreate = async () => {
    if (!canCreate || !sourceSystem || !sourceAuthority || !authorityReference) return;
    await createGovernancePositionIntake({
      sourceSystem,
      sourceAuthority,
      authorityReference,
      scope,
      applicability,
      conditions: listToLines(conditions),
      obligations: listToLines(obligations),
      evidenceRequirements: listToLines(evidenceRequirements),
      reassessmentTriggerTypes: [],
      accountabilityReferences: {},
      versionMetadata: { version: '1' },
    });
    setSourceSystem(''); setSourceAuthority(''); setAuthorityReference('');
    setScope(''); setApplicability(''); setConditions(''); setObligations(''); setEvidenceRequirements('');
    reload();
  };

  const handleMoveToReview = async (intake: GovernancePositionIntake) => {
    if (!canReview) return;
    await reviewGovernancePositionIntake(intake.id, { status: 'Under Review', reviewedBy: currentUser?.name || 'David Chen (Governance Admin)' });
    reload();
  };

  const handleReject = async (intake: GovernancePositionIntake) => {
    if (!canReview) return;
    await reviewGovernancePositionIntake(intake.id, {
      status: 'Rejected',
      reviewedBy: currentUser?.name || 'David Chen (Governance Admin)',
      reviewNotes: reviewNotes[intake.id] || 'Rejected — did not satisfy OMG intake requirements.',
    });
    reload();
  };

  const handleAccept = async (intake: GovernancePositionIntake) => {
    if (!canReview) return;
    const assetId = reviewAssetId[intake.id];
    if (!assetId) return;
    await reviewGovernancePositionIntake(intake.id, {
      status: 'Accepted',
      reviewedBy: currentUser?.name || 'David Chen (Governance Admin)',
      reviewNotes: reviewNotes[intake.id],
      assetId,
      authorisedGovernanceState: 'Monitoring',
      validFrom: new Date().toISOString().split('T')[0],
    });
    reload();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Position Intake</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Release 20, Capability 1 — External Governance Position Intake. Every position received here is preserved
          exactly as received; accepting one operationalises it inside OMG by authorising a real Governance Position
          against a named asset. OMG never edits what was received — only whether and how it accepts it.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('All')} className="cursor-pointer">
          <Pill tone={statusFilter === 'All' ? 'var(--accent-strong)' : 'var(--text-muted)'}>All ({counts.All})</Pill>
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className="cursor-pointer">
            <Pill tone={statusFilter === s ? STATUS_TONE[s] : 'var(--text-muted)'}>{s} ({counts[s] || 0})</Pill>
          </button>
        ))}
      </div>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Receive New Governance Position</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Source System</label>
            <input value={sourceSystem} onChange={e => setSourceSystem(e.target.value)} disabled={!canCreate} placeholder="e.g. Aegis" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Source Authority</label>
            <input value={sourceAuthority} onChange={e => setSourceAuthority(e.target.value)} disabled={!canCreate} placeholder="e.g. Astrynn Holdings Governance Committee" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Authority Reference</label>
            <input value={authorityReference} onChange={e => setAuthorityReference(e.target.value)} disabled={!canCreate} placeholder="e.g. AEGIS-GOV-2026-004" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Scope</label>
            <textarea value={scope} onChange={e => setScope(e.target.value)} disabled={!canCreate} rows={2} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Applicability</label>
            <textarea value={applicability} onChange={e => setApplicability(e.target.value)} disabled={!canCreate} rows={2} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Conditions (one per line)</label>
            <textarea value={conditions} onChange={e => setConditions(e.target.value)} disabled={!canCreate} rows={3} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Obligations (one per line)</label>
            <textarea value={obligations} onChange={e => setObligations(e.target.value)} disabled={!canCreate} rows={3} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Evidence Requirements (one per line)</label>
            <textarea value={evidenceRequirements} onChange={e => setEvidenceRequirements(e.target.value)} disabled={!canCreate} rows={3} className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={!canCreate || !sourceSystem || !sourceAuthority || !authorityReference}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--grad-brand)' }}
        >
          Receive Governance Position
        </button>
      </Card>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading intakes…</p>
      ) : filtered.length === 0 ? (
        <Card className="!p-5"><p className="text-sm text-[var(--text-muted)]">No governance position intakes{statusFilter !== 'All' ? ` in ${statusFilter}` : ''}.</p></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(intake => (
            <Card key={intake.id} className="!p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Pill tone={STATUS_TONE[intake.status]}>{intake.status}</Pill>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{intake.sourceAuthority}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">via {intake.sourceSystem}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Reference {intake.authorityReference} — received {new Date(intake.createdAt).toLocaleString()}</p>
                  {intake.assetName && <p className="text-[11px] text-[var(--text-muted)]">Operationalised against: {intake.assetName}</p>}
                </div>
                <button onClick={() => setExpandedId(expandedId === intake.id ? null : intake.id)} className="text-[11px] font-bold text-[var(--accent-strong)] cursor-pointer shrink-0">
                  {expandedId === intake.id ? 'Hide details' : 'Show details'}
                </button>
              </div>

              {expandedId === intake.id && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Scope</p>
                    <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.scope || '—'}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Applicability</p>
                    <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.applicability || '—'}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Conditions</p>
                    <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.conditions.join('; ') || 'None'}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Obligations</p>
                    <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.obligations.join('; ') || 'None'}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)] sm:col-span-2">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Evidence Requirements</p>
                    <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.evidenceRequirements.join('; ') || 'None'}</p>
                  </div>
                  {intake.reviewNotes && (
                    <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)] sm:col-span-2">
                      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Review Notes</p>
                      <p className="text-[11.5px] text-[var(--text-primary)] mt-0.5">{intake.reviewNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {canReview && intake.status === 'Received' && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleMoveToReview(intake)} className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">
                    Move to Under Review
                  </button>
                </div>
              )}

              {canReview && intake.status === 'Under Review' && (
                <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border-color)] pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Operationalise against Asset"
                      value={reviewAssetId[intake.id] || ''}
                      onChange={e => setReviewAssetId(prev => ({ ...prev, [intake.id]: e.target.value }))}
                      options={[{ value: '', label: 'Select an asset…' }, ...assets.map(a => ({ value: a.id, label: a.name }))]}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Review Notes</label>
                      <input value={reviewNotes[intake.id] || ''} onChange={e => setReviewNotes(prev => ({ ...prev, [intake.id]: e.target.value }))} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(intake)}
                      disabled={!reviewAssetId[intake.id]}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--grad-brand)' }}
                    >
                      Accept &amp; Authorise Position
                    </button>
                    <button onClick={() => handleReject(intake)} className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--status-danger)] text-[var(--status-danger)] cursor-pointer">
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
