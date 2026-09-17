import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { GovernanceTruthCard } from '../components/governance/GovernanceTruthCard';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getGovernanceStateHistoryForAsset,
  getRelianceElementsForAsset,
  saveRelianceElement,
  getActiveAgpForAsset,
  getAgpsForAsset,
  saveAuthorisedGovernancePosition,
  issueGovernancePositionContract,
  getGovernancePositionContractsForAsset,
  detectChangedConditionsForPosition,
  createReassessmentRequest,
  routeReassessmentRequestToAuthority,
  createReauthorisationRequest,
  routeReauthorisationRequestToAuthority,
  getReassessmentRequestsForPosition,
  getReauthorisationRequestsForPosition,
} from '../services/storageService';
import type { RelianceElementStatus, RelianceElementType, ReassessmentRequest, ReauthorisationRequest } from '../types';

const RELIANCE_TYPES: RelianceElementType[] = ['Assumption', 'Required Control', 'Required Evidence', 'Regulatory Dependency', 'Operational Dependency'];
const RELIANCE_STATUSES: RelianceElementStatus[] = ['Valid', 'Degraded', 'Broken'];

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const listToLines = (value: string): string[] => value.split('\n').map(l => l.trim()).filter(Boolean);

export const GovernancePositionPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [refreshTick, setRefreshTick] = useState(0);

  const canRelianceCreate = canPerform('relianceElement:create');
  const canPositionCreate = canPerform('governancePosition:create');
  const canContractIssue = canPerform('governancePositionContract:issue');

  const asset = assets.find(a => a.id === assetId);
  const stateHistory = useMemo(() => (assetId ? getGovernanceStateHistoryForAsset(assetId) : []), [assetId, refreshTick]);
  const relianceElements = useMemo(() => (assetId ? getRelianceElementsForAsset(assetId) : []), [assetId, refreshTick]);
  const activeAgp = useMemo(() => (assetId ? getActiveAgpForAsset(assetId) : null), [assetId, refreshTick]);
  const agpHistory = useMemo(() => (assetId ? getAgpsForAsset(assetId) : []), [assetId, refreshTick]);
  const contracts = useMemo(() => (assetId ? getGovernancePositionContractsForAsset(assetId) : []), [assetId, refreshTick]);

  const [elementType, setElementType] = useState<RelianceElementType>('Operational Dependency');
  const [elementDesc, setElementDesc] = useState('');
  const [elementStatus, setElementStatus] = useState<RelianceElementStatus>('Valid');

  const [agpState, setAgpState] = useState('Monitoring');
  const [agpConditions, setAgpConditions] = useState('');
  const [agpObligations, setAgpObligations] = useState('');
  const [agpAssumptions, setAgpAssumptions] = useState('');
  const [agpValidUntil, setAgpValidUntil] = useState('');

  // Release 20 — Capabilities 4 & 5: Changed Condition Recognition and the Authority Return Path.
  const canReassessmentCreate = canPerform('reassessmentRequest:create');
  const canReauthorisationCreate = canPerform('reauthorisationRequest:create');
  const changedConditions = useMemo(() => (activeAgp ? detectChangedConditionsForPosition(activeAgp.id) : null), [activeAgp, refreshTick]);
  const [reassessmentRequests, setReassessmentRequests] = useState<ReassessmentRequest[]>([]);
  const [reauthorisationRequests, setReauthorisationRequests] = useState<ReauthorisationRequest[]>([]);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    if (!activeAgp) { setReassessmentRequests([]); setReauthorisationRequests([]); return; }
    getReassessmentRequestsForPosition(activeAgp.id).then(setReassessmentRequests).catch(() => setReassessmentRequests([]));
    getReauthorisationRequestsForPosition(activeAgp.id).then(setReauthorisationRequests).catch(() => setReauthorisationRequests([]));
  }, [activeAgp, refreshTick]);

  const refresh = () => setRefreshTick(t => t + 1);

  const handleAddElement = () => {
    if (!asset || !elementDesc || !canRelianceCreate) return;
    saveRelianceElement({ assetId: asset.id, assetName: asset.name, elementType, description: elementDesc, status: elementStatus });
    setElementDesc('');
    refresh();
  };

  const handleAuthorisePosition = () => {
    if (!asset || !canPositionCreate) return;
    saveAuthorisedGovernancePosition({
      assetId: asset.id,
      assetName: asset.name,
      authorisedGovernanceState: agpState,
      conditions: listToLines(agpConditions),
      obligations: listToLines(agpObligations),
      assumptions: listToLines(agpAssumptions),
      relianceElementIds: relianceElements.map(e => e.id),
      authorityReferenceIds: [],
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: agpValidUntil || undefined,
      status: 'Active',
      createdBy: currentUser?.name || 'David Chen (Governance Admin)',
    });
    setAgpConditions('');
    setAgpObligations('');
    setAgpAssumptions('');
    setAgpValidUntil('');
    refresh();
  };

  const handleIssueContract = () => {
    if (!activeAgp || !canContractIssue) return;
    issueGovernancePositionContract(activeAgp.id, currentUser?.name || 'David Chen (Governance Admin)');
    refresh();
  };

  /**
   * Capability 5 — Authority Return Path. Creates the request, then
   * immediately routes it back to the position's own named authority
   * (accountableOwner) — OMG never decides the matter, it only hands it off
   * and records that hand-off.
   */
  const handleRequestReassessment = async () => {
    if (!activeAgp || !asset || !canReassessmentCreate || !requestReason) return;
    const created = await createReassessmentRequest({
      positionId: activeAgp.id,
      assetId: asset.id,
      assetName: asset.name,
      triggerReason: requestReason,
      supportingEvidenceRefs: [],
      createdBy: currentUser?.name || 'David Chen (Governance Admin)',
    });
    await routeReassessmentRequestToAuthority(created.id, asset.authorityProfile?.accountableOwner || asset.ownership.approver || asset.ownership.businessOwner || 'David Chen (Governance Admin)');
    setRequestReason('');
    refresh();
  };

  const handleRequestReauthorisation = async () => {
    if (!activeAgp || !asset || !canReauthorisationCreate || !requestReason) return;
    const created = await createReauthorisationRequest({
      positionId: activeAgp.id,
      assetId: asset.id,
      assetName: asset.name,
      changedConditions: changedConditions?.triggerTypes || [],
      governanceImpactSummary: requestReason,
      createdBy: currentUser?.name || 'David Chen (Governance Admin)',
    });
    await routeReauthorisationRequestToAuthority(created.id, asset.authorityProfile?.accountableOwner || asset.ownership.approver || asset.ownership.businessOwner || 'David Chen (Governance Admin)');
    setRequestReason('');
    refresh();
  };

  const handleExportContract = () => {
    if (contracts.length === 0) return;
    const blob = new Blob([JSON.stringify(contracts[0], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset?.name.replace(/\s+/g, '_')}_Governance_Position_Contract.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Position &amp; Reauthorisation</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Release 19.1 — Governance State Harmonisation. One authoritative Governance Truth, resolved by the Governance
            State Resolution Layer from Authority Currency, Reliance Basis, Evidence Sufficiency, Admissibility,
            Reauthorisation and Governance Continuity — advisory only; runtime implementation stays entirely external.
          </p>
        </div>
        <Link to="/governance-position-traceability" className="text-xs font-bold text-[var(--accent-strong)] shrink-0 hover:underline">
          View Cross-Layer Traceability →
        </Link>
      </div>

      <Select label="Asset" value={assetId} onChange={e => setAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: a.name }))} />

      {assetId && <GovernanceTruthCard assetId={assetId} />}

      {stateHistory.length > 0 && (
        <Card className="!p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Governance State History</p>
          <div className="flex flex-col gap-2">
            {stateHistory.slice(0, 6).map(h => (
              <div key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{h.previousState || '(none)'} → {h.newState}</span>
                  <p className="text-[11px] text-[var(--text-muted)]">{h.triggeringEvent} — {h.triggeringEngine}</p>
                </div>
                <span className="text-[10.5px] text-[var(--text-faint)] shrink-0">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="!p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Governance Reliance Basis (Domain E)</p>
        <div className="flex flex-col gap-2 mb-3">
          {relianceElements.length === 0 && <p className="text-[11px] text-[var(--text-muted)]">No reliance elements recorded for this asset yet.</p>}
          {relianceElements.map(e => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
              <div className="min-w-0">
                <span className="text-xs font-bold text-[var(--text-primary)]">{e.elementType}</span>
                <p className="text-[11px] text-[var(--text-muted)]">{e.description}</p>
              </div>
              <Pill tone={e.status === 'Valid' ? 'var(--status-success)' : e.status === 'Broken' ? 'var(--status-danger)' : 'var(--status-warning)'}>{e.status}</Pill>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Type" value={elementType} onChange={e => setElementType(e.target.value as RelianceElementType)} options={RELIANCE_TYPES.map(t => ({ value: t, label: t }))} disabled={!canRelianceCreate} />
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <input value={elementDesc} onChange={e => setElementDesc(e.target.value)} disabled={!canRelianceCreate} placeholder="e.g. Vendor Certification Valid" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <Select label="Status" value={elementStatus} onChange={e => setElementStatus(e.target.value as RelianceElementStatus)} options={RELIANCE_STATUSES.map(s => ({ value: s, label: s }))} disabled={!canRelianceCreate} />
        </div>
        <button onClick={handleAddElement} disabled={!canRelianceCreate || !elementDesc} className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
          Record Reliance Element
        </button>
      </Card>

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Authorised Governance Position (Domain C)</p>
        {activeAgp ? (
          <div className="mb-3 px-3 py-2.5 rounded-lg bg-[var(--bg-sunken)]">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Pill tone="var(--status-success)">Active</Pill>
              <Pill tone={activeAgp.positionOrigin === 'External Intake' ? 'var(--accent-strong)' : 'var(--text-muted)'}>{activeAgp.positionOrigin || 'Internal'}</Pill>
              <span className="text-xs font-bold text-[var(--text-primary)]">{activeAgp.authorisedGovernanceState}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Conditions: {activeAgp.conditions.join('; ') || 'None'}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Obligations: {activeAgp.obligations.join('; ') || 'None'}</p>
            {(activeAgp.evidenceRequirements?.length || 0) > 0 && (
              <p className="text-[11px] text-[var(--text-muted)]">Evidence Requirements: {activeAgp.evidenceRequirements!.join('; ')}</p>
            )}
            {activeAgp.authorityProvenanceRef && (
              <p className="text-[11px] text-[var(--text-muted)]">Authority Reference: {activeAgp.authorityProvenanceRef}</p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)] mb-3">No Active Authorised Governance Position for this asset — Unified Governance State cannot reach "Governed" until one is authorised.</p>
        )}
        {agpHistory.length > (activeAgp ? 1 : 0) && (
          <p className="text-[10.5px] text-[var(--text-muted)] mb-3">{agpHistory.length} position(s) on file for this asset, including superseded history.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Authorised Governance State</label>
            <input value={agpState} onChange={e => setAgpState(e.target.value)} disabled={!canPositionCreate} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Valid Until (optional)</label>
            <input type="date" value={agpValidUntil} onChange={e => setAgpValidUntil(e.target.value)} disabled={!canPositionCreate} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Conditions (one per line)</label>
            <textarea value={agpConditions} onChange={e => setAgpConditions(e.target.value)} disabled={!canPositionCreate} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Obligations (one per line)</label>
            <textarea value={agpObligations} onChange={e => setAgpObligations(e.target.value)} disabled={!canPositionCreate} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Assumptions (one per line)</label>
            <textarea value={agpAssumptions} onChange={e => setAgpAssumptions(e.target.value)} disabled={!canPositionCreate} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
        </div>
        <button onClick={handleAuthorisePosition} disabled={!canPositionCreate} className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
          Authorise Governance Position
        </button>
        <p className="text-[10.5px] text-[var(--text-muted)] mt-2">Authorising a new position automatically supersedes any previously Active position for this asset — an asset never has more than one Active position at once.</p>
      </Card>

      {activeAgp && (
        <Card className="!p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Changed Condition Recognition &amp; Authority Return Path (Release 20, Capabilities 4–5)</p>
          <p className="text-[11px] text-[var(--text-muted)] mb-3">
            Reuses the existing Reauthorisation Engine and Reassessment Trigger signals — no new detection logic. OMG
            routes a detected change back to the position's own named authority; it never decides the outcome itself.
          </p>
          {changedConditions && (
            <div className="mb-3 px-3 py-2.5 rounded-lg bg-[var(--bg-sunken)]">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Pill tone={changedConditions.hasChangedConditions ? 'var(--status-warning)' : 'var(--status-success)'}>
                  {changedConditions.hasChangedConditions ? 'Changed Conditions Detected' : 'No Changed Conditions'}
                </Pill>
                {changedConditions.reauthorisationOutcome && <span className="text-[11px] text-[var(--text-muted)]">Reauthorisation Engine: {changedConditions.reauthorisationOutcome}</span>}
              </div>
              {changedConditions.triggerTypes.length > 0 && (
                <p className="text-[11px] text-[var(--text-muted)]">Trigger types: {changedConditions.triggerTypes.join(', ')}</p>
              )}
            </div>
          )}
          {(reassessmentRequests.length > 0 || reauthorisationRequests.length > 0) && (
            <div className="flex flex-col gap-1.5 mb-3">
              {reassessmentRequests.map(r => (
                <div key={r.id} className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Reassessment: {r.triggerReason}</span>
                  <Pill tone="var(--status-warning)">{r.status}{r.routedTo ? ` → ${r.routedTo}` : ''}</Pill>
                </div>
              ))}
              {reauthorisationRequests.map(r => (
                <div key={r.id} className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Reauthorisation: {r.governanceImpactSummary}</span>
                  <Pill tone="var(--status-warning)">{r.status}{r.routedTo ? ` → ${r.routedTo}` : ''}</Pill>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1.5 mb-3">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Reason / Governance Impact Summary</label>
            <textarea value={requestReason} onChange={e => setRequestReason(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleRequestReassessment} disabled={!canReassessmentCreate || !requestReason} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
              Request Reassessment
            </button>
            <button onClick={handleRequestReauthorisation} disabled={!canReauthorisationCreate || !requestReason} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Request Reauthorisation
            </button>
          </div>
        </Card>
      )}

      <Card className="!p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governance Position Contract (Domain G)</p>
        <p className="text-[11px] text-[var(--text-muted)] mb-3">
          A standard handoff package a downstream runtime or execution system may consume — conditions, obligations,
          monitoring and reporting expectations. Runtime implementation of any of it stays entirely outside OMG.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleIssueContract} disabled={!activeAgp || !canContractIssue} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
            Issue Contract from Active Position
          </button>
          <button onClick={handleExportContract} disabled={contracts.length === 0} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Export Latest Contract (JSON)
          </button>
        </div>
        {contracts.length > 0 && <p className="text-[10.5px] text-[var(--text-muted)] mt-2">{contracts.length} contract(s) issued for this asset. Most recent issued {new Date(contracts[0].issuedAt).toLocaleString()}.</p>}
      </Card>
    </div>
  );
};
