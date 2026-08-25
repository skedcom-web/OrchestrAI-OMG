import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getFindings, saveFinding, getAssets } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { Finding, FindingSeverity, FindingStatus } from '../types';

export const FindingsPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: this page's Finding model is a distinct type from the
  // roleActionMatrix's 'governanceFinding:*' keys (Governance Intelligence Engine), so there is
  // no exact ActionKey match — gated with the safe !isReadOnly fallback.
  const { isReadOnly } = useAuth();
  const [findings, setFindings] = useState<Finding[]>(() => getFindings());
  const [assets] = useState(() => getAssets());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  const [newFinding, setNewFinding] = useState<Partial<Finding>>({
    title: '',
    assetId: assets[0]?.id || '',
    severity: 'High',
    status: 'Open',
    assignedTo: 'Sarah Jenkins',
    reportedBy: 'Dr. Aris Thorne',
    description: '',
  });

  const refreshFindings = () => {
    setFindings(getFindings());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === newFinding.assetId);
    saveFinding({
      ...newFinding,
      assetName: asset?.name || 'AI Asset',
    });
    refreshFindings();
    setIsModalOpen(false);
  };

  const handleStatusChange = (finding: Finding, status: FindingStatus) => {
    saveFinding({ ...finding, status });
    refreshFindings();
  };

  const filtered = findings.filter(f => 
    filterSeverity === 'All' || f.severity === filterSeverity
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Findings Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Governance Defect & Risk Finding Tracker • 4 Severity Tiers (Low, Medium, High, Critical)
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<span>⚠️</span>}
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit logging governance findings.' : undefined}
        >
          Log Governance Finding
        </Button>
      </div>

      {/* Severity Filter Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilterSeverity('All')}
          className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
            filterSeverity === 'All'
              ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
              : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <span className="text-xs font-bold uppercase text-[var(--text-primary)]">All Findings</span>
          <p className="text-lg font-black text-[var(--text-primary)]">{findings.length}</p>
        </div>
        {(['Critical', 'High', 'Medium', 'Low'] as FindingSeverity[]).map(sev => {
          const count = findings.filter(f => f.severity === sev).length;
          return (
            <div
              key={sev}
              onClick={() => setFilterSeverity(filterSeverity === sev ? 'All' : sev)}
              className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                filterSeverity === sev
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <span className={`text-xs font-black uppercase ${
                sev === 'Critical' ? 'text-purple-400' : sev === 'High' ? 'text-red-400' : sev === 'Medium' ? 'text-amber-400' : 'text-blue-400'
              }`}>{sev}</span>
              <p className="text-lg font-black text-[var(--text-primary)]">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Findings Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="p-4">Finding Title</th>
                <th className="p-4">AI Asset</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Owner</th>
                <th className="p-4">Reported Date</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No findings match the selected severity filter.
                  </td>
                </tr>
              ) : (
              filtered.map(fnd => (
                <tr key={fnd.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)]">{fnd.title}</span>
                      <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">{fnd.description}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-[var(--text-primary)]">{fnd.assetName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${
                      fnd.severity === 'Critical'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : fnd.severity === 'High'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : fnd.severity === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {fnd.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      fnd.status === 'Resolved' || fnd.status === 'Verified'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : fnd.status === 'In Progress'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {fnd.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[var(--text-secondary)]">{fnd.assignedTo}</td>
                  <td className="p-4 text-xs text-[var(--text-muted)]">{fnd.reportedDate}</td>
                  <td className="p-4 text-right">
                    <select
                      value={fnd.status}
                      onChange={e => handleStatusChange(fnd, e.target.value as FindingStatus)}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Your governance role does not permit updating finding status.' : undefined}
                      className="px-2 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOG FINDING MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Log Governance Finding / Risk Defect"
          subtitle="Assign Severity and Owner for Resolution"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Input
              label="Finding Title"
              required
              value={newFinding.title || ''}
              onChange={e => setNewFinding({ ...newFinding, title: e.target.value })}
              placeholder="e.g. Agent execution kill switch missing"
            />
            <Select
              label="Associated AI Asset"
              value={newFinding.assetId}
              onChange={e => setNewFinding({ ...newFinding, assetId: e.target.value })}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />
            <Select
              label="Severity Tier"
              value={newFinding.severity}
              onChange={e => setNewFinding({ ...newFinding, severity: e.target.value as FindingSeverity })}
              options={[
                { value: 'Critical', label: 'Critical — Immediate Gatekeeper Blocker' },
                { value: 'High', label: 'High — Risk Mitigation Required' },
                { value: 'Medium', label: 'Medium — Moderate Impact' },
                { value: 'Low', label: 'Low — Advisory / Optimization' },
              ]}
            />
            <Input
              label="Assigned Owner Name"
              value={newFinding.assignedTo || ''}
              onChange={e => setNewFinding({ ...newFinding, assignedTo: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Detailed Finding Description</label>
              <textarea
                rows={3}
                required
                value={newFinding.description || ''}
                onChange={e => setNewFinding({ ...newFinding, description: e.target.value })}
                placeholder="Explain the defect, risk condition, or missing governance requirement..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Log Finding</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
