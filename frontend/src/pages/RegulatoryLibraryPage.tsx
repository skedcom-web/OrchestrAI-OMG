import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { getComplianceControls } from '../services/storageService';
import type { ComplianceControl } from '../types';

export const RegulatoryLibraryPage: React.FC = () => {
  const [controls] = useState<ComplianceControl[]>(() => getComplianceControls());
  const [filterSource, setFilterSource] = useState<string>('All');

  const filtered = controls.filter(c => 
    filterSource === 'All' || c.source === filterSource
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Regulatory & Control Library</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Master Library of RBI AI Governance Controls & Enterprise Information Security Policies
        </p>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterSource('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterSource === 'All'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          All Controls ({controls.length})
        </button>
        <button
          onClick={() => setFilterSource('RBI Standards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterSource === 'RBI Standards'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          🏛️ RBI AI Governance Standards (8)
        </button>
        <button
          onClick={() => setFilterSource('Internal Policy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterSource === 'Internal Policy'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          🔒 Internal Enterprise Policies (2)
        </button>
      </div>

      {/* Control Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="!p-8 text-center text-[var(--text-muted)]">
          No regulatory controls found for this source.
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(ctrl => (
          <Card key={ctrl.id} className="!p-5 flex flex-col justify-between gap-4 border-[var(--border-color)]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-[var(--accent-primary)] px-2.5 py-0.5 rounded bg-[var(--accent-light)] border border-[var(--accent-border)]">
                  {ctrl.id}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--bg-badge)] text-[var(--text-muted)] border border-[var(--border-color)]">
                  {ctrl.source}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] mt-1">{ctrl.controlName}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{ctrl.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-[10px]">
              <span className="font-semibold text-[var(--text-muted)]">Category: {ctrl.category}</span>
              <span className={`font-black uppercase px-2 py-0.5 rounded ${
                ctrl.mandatory ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {ctrl.mandatory ? 'Mandatory Control' : 'Recommended'}
              </span>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
};
