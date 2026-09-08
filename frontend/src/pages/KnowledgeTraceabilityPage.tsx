import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { getKnowledgeAssets } from '../services/storageService';
import type { KnowledgeSourceType } from '../types';

const TYPES: KnowledgeSourceType[] = ['Document Store', 'Database', 'API', 'Vector Index'];

/**
 * R14 — Knowledge Governance. Which assets retrieve from which knowledge
 * sources — a rollup, not a new engine (Architecture Package §2, Reporting
 * Architecture).
 */
export const KnowledgeTraceabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const sources = useMemo(() => getKnowledgeAssets(), []);

  const byType = TYPES.map(type => ({ type, count: sources.filter(s => s.sourceType === type).length }));
  const shared = sources.filter(s => s.usedByAssetIds.length > 1);
  const unlinked = sources.filter(s => s.usedByAssetIds.length === 0);
  const totalLinks = sources.reduce((n, s) => n + s.usedByAssetIds.length, 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Knowledge Traceability"
        subtitle="Which assets retrieve from which knowledge sources across the portfolio."
        icon="🔗"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{sources.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Knowledge Sources</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--accent-primary)]">{totalLinks}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Asset Links</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{shared.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Shared Sources</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{unlinked.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Not Yet Linked</p></Card>
      </div>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">By Source Type</p>
        <div className="flex flex-wrap gap-2">
          {byType.map(({ type, count }) => (
            <span key={type} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              {type} · {count}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Asset → Source Traceability</p>
        <div className="flex flex-col gap-3">
          {sources.map(source => (
            <div key={source.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
              <div className="min-w-0">
                <button onClick={() => navigate('/knowledge-registry')} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left">
                  {source.name}
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {source.usedByAssetNames.length > 0 ? source.usedByAssetNames.join(' · ') : 'No asset currently retrieves from this source'}
                </p>
              </div>
              {source.usedByAssetIds.length > 0 && (
                <span className="shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)] tnum self-start sm:self-auto">
                  {source.usedByAssetIds.length} asset{source.usedByAssetIds.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
