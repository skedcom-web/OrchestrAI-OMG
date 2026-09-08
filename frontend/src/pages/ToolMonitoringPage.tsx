import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { getTools, getAgentToolGrants } from '../services/storageService';
import type { ToolClassification } from '../types';

const CLASSIFICATIONS: ToolClassification[] = ['Read-Only', 'Write', 'Financial', 'External API', 'Destructive'];
const CLASSIFICATION_TONE: Record<ToolClassification, string> = {
  'Read-Only': 'var(--status-info)',
  'Write': 'var(--status-warning)',
  'Financial': 'var(--status-warning)',
  'External API': 'var(--status-info)',
  'Destructive': 'var(--status-danger)',
};

/**
 * R17 — Tool Governance. Which agents are granted which tools, and where
 * tool-access risk concentrates across the portfolio — a rollup over the
 * AgentToolGrant boundary R16 already built, not a new engine.
 */
export const ToolMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const tools = useMemo(() => getTools(), []);
  const grants = useMemo(() => getAgentToolGrants(), []);

  const byClassification = CLASSIFICATIONS.map(c => ({ classification: c, count: tools.filter(t => t.classification === c).length }));
  const ungranted = tools.filter(t => !grants.some(g => g.toolId === t.id));
  const destructiveGrants = grants.filter(g => tools.find(t => t.id === g.toolId)?.classification === 'Destructive');
  const maxCount = Math.max(1, ...byClassification.map(c => c.count));

  const grantsByTool = tools.map(tool => ({
    tool,
    grants: grants.filter(g => g.toolId === tool.id),
  })).filter(x => x.grants.length > 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Tool Call Monitoring"
        subtitle="Which agents are granted which tools, and where tool-access risk concentrates."
        icon="📶"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{tools.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Governed Tools</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--accent-primary)]">{grants.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Active Grants</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{destructiveGrants.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Destructive Grants</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{ungranted.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Not Yet Granted</p></Card>
      </div>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Tool Portfolio by Classification</p>
        <div className="flex flex-col gap-2.5">
          {byClassification.map(({ classification, count }) => (
            <div key={classification} className="flex items-center gap-3">
              <span className="w-28 text-xs font-semibold text-[var(--text-secondary)] shrink-0">{classification}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-badge)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: CLASSIFICATION_TONE[classification] }} />
              </div>
              <span className="w-5 text-xs font-bold text-[var(--text-primary)] tnum text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Tool → Agent Grants</p>
        {grantsByTool.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No tool grants recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {grantsByTool.map(({ tool, grants: toolGrants }) => (
              <div key={tool.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0" style={{ color: CLASSIFICATION_TONE[tool.classification], background: 'var(--bg-badge)', border: `1px solid ${CLASSIFICATION_TONE[tool.classification]}40` }}>
                    {tool.classification}
                  </span>
                  <button onClick={() => navigate('/tool-registry')} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left truncate">
                    {tool.name}
                  </button>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0">
                  Granted to {toolGrants.map(g => g.assetName).filter(Boolean).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {ungranted.length > 0 && (
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Registered, Not Yet Granted</p>
          <div className="flex flex-wrap gap-2">
            {ungranted.map(t => (
              <span key={t.id} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {t.name}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
