import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { ComplianceCoverageBadge } from '../components/ui/Badge';
import { getRegulatorySources, getRegulatoryRequirements, getRegulatoryRequirementCoverage } from '../services/storageService';

/**
 * OMG Release 6 — Universal Regulatory Knowledge & Obligation Engine.
 *
 * Capability 2's cross-source catalogue view: every requirement registered
 * across every regulatory source, filterable and searchable, with a link
 * into the Mapping Workspace to drill into obligations/controls/evidence.
 * CRUD for individual requirements lives in the Mapping Workspace — this
 * page is read-first, the same relationship Compliance Center has to the
 * Compliance Pack Framework.
 */
export const RequirementRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const sources = getRegulatorySources();
  const requirements = getRegulatoryRequirements();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = Array.from(new Set(requirements.map(r => r.category))).sort();

  const filtered = requirements.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === 'ALL' || r.sourceId === sourceFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesSource && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Requirement Registry</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Every requirement registered across every regulatory source — the catalogue Capability 2 builds as sources onboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input placeholder="Search requirements..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select
          options={[{ value: 'ALL', label: 'All Sources' }, ...sources.map(s => ({ value: s.id, label: s.name }))]}
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        />
        <Select
          options={[{ value: 'ALL', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))]}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Requirement</th>
                <th className="p-4">Source</th>
                <th className="p-4">Category</th>
                <th className="p-4">Criticality</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-sm text-[var(--text-muted)] italic">No requirements match this filter.</td></tr>
              ) : (
                filtered.map(req => {
                  const coverage = getRegulatoryRequirementCoverage(req.id);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => navigate('/mapping-workspace')}
                      className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text-primary)]">{req.name}</span>
                          <span className="text-xs font-mono text-[var(--text-muted)]">{req.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{req.sourceName}</td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{req.category}</td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{req.criticality}</td>
                      <td className="p-4 text-xs text-[var(--text-secondary)]">{req.status}</td>
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
