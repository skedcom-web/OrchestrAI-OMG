import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { ComplianceCoverageBadge } from '../components/ui/Badge';
import { getRegulatoryRequirements, getObligations, getObligationCoverage } from '../services/storageService';

/**
 * OMG Release 6 — Universal Regulatory Knowledge & Obligation Engine.
 *
 * Capability 3's cross-requirement catalogue: every obligation translated
 * from every requirement, filterable and searchable, with a link into the
 * Mapping Workspace to drill into control mappings and evidence. CRUD for
 * individual obligations lives in the Mapping Workspace — this page is
 * read-first, the same relationship the Requirement Registry has above.
 */
export const ObligationLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const requirements = getRegulatoryRequirements();
  const obligations = getObligations();

  const [search, setSearch] = useState('');
  const [requirementFilter, setRequirementFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = obligations.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesRequirement = requirementFilter === 'ALL' || o.requirementId === requirementFilter;
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesRequirement && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Obligation Library</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Every requirement translated into actionable obligations — the Obligation Engine's output, browsable across every source.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input placeholder="Search obligations..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select
          options={[{ value: 'ALL', label: 'All Requirements' }, ...requirements.map(r => ({ value: r.id, label: r.name }))]}
          value={requirementFilter}
          onChange={e => setRequirementFilter(e.target.value)}
        />
        <Select
          options={['ALL', 'Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v === 'ALL' ? 'All Statuses' : v }))}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Obligation</th>
                <th className="p-4">Requirement</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-[var(--text-muted)] italic">No obligations match this filter.</td></tr>
              ) : (
                filtered.map(obligation => {
                  const coverage = getObligationCoverage(obligation.id);
                  return (
                    <tr
                      key={obligation.id}
                      onClick={() => navigate('/mapping-workspace')}
                      className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text-primary)]">{obligation.name}</span>
                          <span className="text-xs font-mono text-[var(--text-muted)]">{obligation.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{obligation.requirementName}</td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{obligation.owner || 'Unassigned'}</td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{obligation.status}</td>
                      <td className="p-4">{coverage && <ComplianceCoverageBadge status={coverage.status} size="sm" />}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
