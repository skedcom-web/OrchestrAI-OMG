import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import {
  getWorkspaceAssets,
  getWorkspaceFindings,
  getWorkspaceReassessmentTriggers,
  getWorkspaceEvidenceRecords,
  getWorkspaceGovernanceAlerts,
  getWorkspaceAuditTrail,
  getGovernanceTimeline,
  getGovernabilityForAsset,
  isWorkspaceReadOnly,
  saveAsset,
  saveFinding,
  addWorkspaceAuditEntry,
} from '../services/storageService';
import type { AssetType, RiskLevel, FindingSeverity } from '../types';

const ASSET_TYPES: AssetType[] = ['Application', 'Agent', 'Model', 'LLM', 'Copilot', 'RAG System', 'AI Workflow', 'Multi-Agent System', 'Third-Party AI Service'];
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITIES: FindingSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const GOVERNABILITY_TONE: Record<string, string> = {
  'Governable': 'var(--status-success)', 'Governable With Conditions': 'var(--status-warning)',
  'Review Required': 'var(--status-warning)', 'Governance Attention Required': 'var(--status-danger)', 'Not Governable': 'var(--status-danger)',
};

export const WorkspaceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace, currentWorkspaceUser, currentPersona, logoutWorkspace } = useAuth();
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = () => setRefreshTick(t => t + 1);

  const assets = useMemo(() => (currentWorkspace ? getWorkspaceAssets(currentWorkspace.id) : []), [currentWorkspace, refreshTick]);
  const findings = useMemo(() => (currentWorkspace ? getWorkspaceFindings(currentWorkspace.id) : []), [currentWorkspace, refreshTick]);
  const triggers = useMemo(() => (currentWorkspace ? getWorkspaceReassessmentTriggers(currentWorkspace.id) : []), [currentWorkspace, refreshTick]);
  const openTriggers = triggers.filter(t => t.status === 'Open' || t.status === 'Under Review');

  const [timelineAssetId, setTimelineAssetId] = useState('');
  const timeline = useMemo(() => (timelineAssetId ? getGovernanceTimeline(timelineAssetId) : []), [timelineAssetId, refreshTick]);

  // Quick-add Asset
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('Agent');
  const [assetRisk, setAssetRisk] = useState<RiskLevel>('Medium');
  const [creatingAsset, setCreatingAsset] = useState(false);

  // Quick-add Finding
  const [findingTitle, setFindingTitle] = useState('');
  const [findingAssetId, setFindingAssetId] = useState('');
  const [findingSeverity, setFindingSeverity] = useState<FindingSeverity>('Medium');

  if (!currentWorkspace || !currentWorkspaceUser) {
    return (
      <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
        No active workspace session. Sign in through Workspace Login to see this dashboard.
      </Card>
    );
  }

  // Release 18.1 Patch, Module 6 — Suspended/Provisioned can't reach this
  // page at all (blocked at login); Archived/Retired can log in to view
  // history but every write action below is disabled.
  const readOnly = isWorkspaceReadOnly(currentWorkspace);

  const handleAddAsset = async () => {
    if (!assetName || readOnly) return;
    setCreatingAsset(true);
    try {
      await saveAsset({
        name: assetName,
        type: assetType,
        riskLevel: assetRisk,
        department: currentWorkspace.name,
        workspaceId: currentWorkspace.id,
        tenantId: currentWorkspace.tenantId,
        environmentId: currentWorkspace.environmentTier,
      });
    } catch {
      // The local, workspace-tagged write already succeeded before this
      // network round-trip; a Production-Mode sync failure (e.g. offline)
      // must not stop the dashboard from reflecting it.
    }
    addWorkspaceAuditEntry({
      workspaceId: currentWorkspace.id,
      workspaceName: currentWorkspace.name,
      userName: currentWorkspaceUser.name,
      persona: currentPersona?.role || 'GOVERNANCE_ADMIN',
      action: 'Created Asset',
      entityType: 'Asset',
      entityName: assetName,
    });
    setAssetName('');
    setCreatingAsset(false);
    refresh();
  };

  const handleAddFinding = () => {
    if (readOnly) return;
    // The Select has no blank placeholder option, so the browser can display
    // the first asset while React's own state is still '' — resolve the
    // same fallback here rather than silently no-op-ing on that mismatch.
    const resolvedAssetId = findingAssetId || assets[0]?.id || '';
    if (!findingTitle || !resolvedAssetId) return;
    const asset = assets.find(a => a.id === resolvedAssetId);
    saveFinding({
      title: findingTitle,
      assetId: resolvedAssetId,
      assetName: asset?.name || '',
      severity: findingSeverity,
      status: 'Open',
      assignedTo: currentWorkspaceUser.name,
      reportedBy: currentWorkspaceUser.name,
      reportedDate: new Date().toISOString().split('T')[0],
      description: `Reported by ${currentWorkspaceUser.name} in ${currentWorkspace.name}.`,
      workspaceId: currentWorkspace.id,
      tenantId: currentWorkspace.tenantId,
      environmentId: currentWorkspace.environmentTier,
    });
    addWorkspaceAuditEntry({
      workspaceId: currentWorkspace.id,
      workspaceName: currentWorkspace.name,
      userName: currentWorkspaceUser.name,
      persona: currentPersona?.role || 'GOVERNANCE_ADMIN',
      action: 'Created Finding',
      entityType: 'Finding',
      entityName: findingTitle,
    });
    setFindingTitle('');
    refresh();
  };

  // ============== MODULE 4 — WORKSPACE GOVERNANCE EXPORT PACK ==============
  const logExport = () => addWorkspaceAuditEntry({
    workspaceId: currentWorkspace.id,
    workspaceName: currentWorkspace.name,
    userName: currentWorkspaceUser.name,
    persona: currentPersona?.role || 'GOVERNANCE_ADMIN',
    action: 'Exported Governance Pack',
    entityType: 'Workspace',
    entityName: currentWorkspace.name,
  });

  const buildPack = () => ({
    workspace: currentWorkspace,
    assets: assets.map(a => ({ ...a, governability: getGovernabilityForAsset(a.id) })),
    evidence: getWorkspaceEvidenceRecords(currentWorkspace.id),
    findings,
    alerts: getWorkspaceGovernanceAlerts(currentWorkspace.id),
    reassessmentTriggers: triggers,
    governanceTimelines: assets.map(a => ({ assetId: a.id, assetName: a.name, timeline: getGovernanceTimeline(a.id) })),
    workspaceAuditTrail: getWorkspaceAuditTrail(currentWorkspace.id),
  });

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(buildPack(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspace.name.replace(/\s+/g, '_')}_Governance_Pack.json`;
    a.click();
    URL.revokeObjectURL(url);
    logExport();
    refresh();
  };

  const handleExportCSV = () => {
    const header = ['Section', 'Name', 'Type/Severity', 'Governability/Status', 'Detail'];
    const rows: string[][] = [];
    assets.forEach(a => {
      const g = getGovernabilityForAsset(a.id);
      rows.push(['Asset', a.name, a.type, g?.status || '', `${a.riskLevel} risk`]);
    });
    findings.forEach(f => rows.push(['Finding', f.title, f.severity, f.status, f.description]));
    getWorkspaceAuditTrail(currentWorkspace.id).forEach(e => rows.push(['Audit', e.entityName, e.action, e.persona, e.timestamp]));
    const csv = [header, ...rows].map(r => r.map(cell => `"${(cell || '').replace(/"/g, "'")}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspace.name.replace(/\s+/g, '_')}_Governance_Pack.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logExport();
    refresh();
  };

  const handlePrint = () => { logExport(); refresh(); window.print(); };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{currentWorkspace.name}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Workspace Dashboard for {currentWorkspaceUser.name} ({currentWorkspaceUser.email}) — only records tagged
            to this workspace are visible here.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button onClick={() => navigate('/workspace-persona-landing')} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">Choose Perspective</button>
          <button onClick={() => navigate('/workspace-audit-trail')} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">Audit Trail</button>
          <button onClick={handleExportJSON} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">Export JSON</button>
          <button onClick={handleExportCSV} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">Export CSV</button>
          <button onClick={handlePrint} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">Print / PDF</button>
          <button
            onClick={() => { logoutWorkspace(); navigate('/login'); }}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer"
          >
            Leave Workspace
          </button>
        </div>
      </div>

      {readOnly && (
        <div className="rounded-xl border border-[var(--status-warning)] bg-[var(--bg-card)] px-4 py-3 text-[12.5px] text-[var(--text-secondary)] print:hidden">
          <strong className="text-[var(--status-warning)]">{currentWorkspace.status} — read-only.</strong> All records are preserved and visible for historical reference, but uploading assets or creating findings is disabled.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{assets.length}</p><p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Assets</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold text-[var(--status-warning)] tnum">{openTriggers.length}</p><p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Reassessment Alerts</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{findings.length}</p><p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Findings</p></Card>
      </div>

      {/* Governability / Evidence Sufficiency / Authority Currency per workspace asset */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Assets — Governability, Evidence Sufficiency &amp; Authority Currency</p>
        {assets.length === 0 ? (
          <Card className="!p-6 text-center text-sm text-[var(--text-muted)]">No assets uploaded to this workspace yet — add one below.</Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {assets.map(a => {
              const g = getGovernabilityForAsset(a.id);
              return (
                <Card key={a.id} className="!p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{a.name}</span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{a.type} · {a.riskLevel} risk</p>
                    </div>
                    {g && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Pill tone={GOVERNABILITY_TONE[g.status]}>{g.status}</Pill>
                        <Pill tone="var(--text-muted)">Evidence: {g.evidenceSufficiency.status}</Pill>
                        <Pill tone="var(--text-muted)">Authority: {g.authorityCurrency.status}</Pill>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick-add Asset */}
      {!readOnly && (
        <Card className="!p-5 border-[var(--accent-border)] print:hidden">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Upload Asset</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Asset Name</label>
              <input value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="e.g. Claims Triage Assistant" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
            <Select label="Type" value={assetType} onChange={e => setAssetType(e.target.value as AssetType)} options={ASSET_TYPES.map(t => ({ value: t, label: t }))} />
            <Select label="Risk Level" value={assetRisk} onChange={e => setAssetRisk(e.target.value as RiskLevel)} options={RISK_LEVELS.map(r => ({ value: r, label: r }))} />
          </div>
          <button onClick={handleAddAsset} disabled={!assetName || creatingAsset} className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
            {creatingAsset ? 'Uploading…' : 'Upload Asset'}
          </button>
        </Card>
      )}

      {/* Quick-add Finding */}
      {!readOnly && (
        <Card className="!p-5 border-[var(--accent-border)] print:hidden">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Create Finding</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Finding Title</label>
              <input value={findingTitle} onChange={e => setFindingTitle(e.target.value)} disabled={assets.length === 0} placeholder="e.g. Missing bias evaluation" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
            <Select label="Asset" value={findingAssetId || assets[0]?.id || ''} onChange={e => setFindingAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: a.name }))} disabled={assets.length === 0} />
            <Select label="Severity" value={findingSeverity} onChange={e => setFindingSeverity(e.target.value as FindingSeverity)} options={SEVERITIES.map(s => ({ value: s, label: s }))} disabled={assets.length === 0} />
          </div>
          {assets.length === 0 && <p className="text-[11px] text-[var(--text-muted)] mt-2">Upload an asset first.</p>}
          <button onClick={handleAddFinding} disabled={!findingTitle || (!findingAssetId && assets.length === 0)} className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
            Create Finding
          </button>
        </Card>
      )}

      {/* Governance Timeline for a workspace asset */}
      {assets.length > 0 && (
        <Card className="!p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Governance Timeline</p>
          <Select label="Asset" value={timelineAssetId} onChange={e => setTimelineAssetId(e.target.value)} options={[{ value: '', label: 'Select an asset…' }, ...assets.map(a => ({ value: a.id, label: a.name }))]} />
          {timelineAssetId && (
            timeline.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No governance events recorded yet.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-[var(--border-color)] flex flex-col gap-3 mt-4">
                {timeline.map(event => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[var(--accent-primary)] border-2 border-[var(--bg-card)]" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-primary)]">{event.stage}</span>
                    <p className="text-xs text-[var(--text-primary)]">{event.details}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>
      )}
    </div>
  );
};
