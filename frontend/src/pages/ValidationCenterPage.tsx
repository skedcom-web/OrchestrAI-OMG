import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getValidations, saveValidation, getAssets } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { ValidationRecord, ValidationCategory } from '../types';

export const ValidationCenterPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: this page's ValidationRecord has no dedicated ActionKey in
  // roleActionMatrix.ts, so recording a validation is gated with the safe !isReadOnly fallback.
  const { isReadOnly } = useAuth();
  const [validations, setValidations] = useState<ValidationRecord[]>(() => getValidations());
  const [assets] = useState(() => getAssets());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [newVal, setNewVal] = useState<Partial<ValidationRecord>>({
    assetId: assets[0]?.id || '',
    category: 'Security',
    reviewer: 'Dr. Aris Thorne',
    reviewerRole: 'VALIDATOR',
    status: 'Approved',
    score: 100,
    findings: '',
    recommendations: '',
  });

  const refreshValidations = () => {
    setValidations(getValidations());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === newVal.assetId);
    saveValidation({
      ...newVal,
      assetName: asset?.name || 'AI Asset',
    });
    refreshValidations();
    setIsModalOpen(false);
  };

  const categories: ValidationCategory[] = [
    'Business', 'Technical', 'Security', 'Compliance', 'Operational', 'Model'
  ];

  const filteredValidations = validations.filter(v => 
    filterCategory === 'All' || v.category === filterCategory
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Validation Center</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Phase 3 Command Center • Can this AI asset prove it is ready for deployment?
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<span>🧪</span>}
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit executing a validation review.' : undefined}
        >
          Execute Validation Review
        </Button>
      </div>

      {/* 6 Validation Types Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map(cat => {
          const count = validations.filter(v => v.category === cat).length;
          const passed = validations.filter(v => v.category === cat && v.status === 'Approved').length;
          return (
            <div
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                filterCategory === cat
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[var(--text-primary)]">{cat}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-badge)]">
                  {passed}/{count} Pass
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Multi-Discipline Check</p>
            </div>
          );
        })}
      </div>

      {/* Validations Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="p-4">AI Asset</th>
                <th className="p-4">Validation Category</th>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Outcome</th>
                <th className="p-4">Score</th>
                <th className="p-4">Review Date</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredValidations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No validation reviews found for this category.
                  </td>
                </tr>
              ) : (
              filteredValidations.map(val => (
                <tr key={val.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)]">{val.assetName}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">ID: {val.assetId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]">
                      {val.category} Validation
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{val.reviewer}</span>
                      <span className="text-[10px] text-[var(--accent-primary)] font-semibold">{val.reviewerRole}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      val.status === 'Approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : val.status === 'Rejected'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {val.status === 'Approved' ? 'PASS ✅' : val.status === 'Rejected' ? 'FAIL ❌' : 'IN REVIEW ⏳'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-extrabold ${val.score >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {val.score}%
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-[var(--text-muted)]">{val.reviewDate}</td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-[var(--text-secondary)] line-clamp-1 max-w-xs inline-block">
                      {val.findings}
                    </span>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW VALIDATION REVIEW MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Execute Validation Review"
          subtitle="Phase 3 Proof-Based Governance Assessment"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Select
              label="Select AI Asset"
              value={newVal.assetId}
              onChange={e => setNewVal({ ...newVal, assetId: e.target.value })}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />
            <Select
              label="Validation Category"
              value={newVal.category}
              onChange={e => setNewVal({ ...newVal, category: e.target.value as ValidationCategory })}
              options={categories.map(c => ({ value: c, label: `${c} Validation` }))}
            />
            <Select
              label="Validation Status Outcome"
              value={newVal.status}
              onChange={e => setNewVal({ 
                ...newVal, 
                status: e.target.value as any,
                score: e.target.value === 'Approved' ? 100 : 0
              })}
              options={[
                { value: 'Approved', label: 'PASS (100% Score)' },
                { value: 'Rejected', label: 'FAIL (0% Score)' },
                { value: 'In Review', label: 'IN REVIEW (Pending Evidence)' },
              ]}
            />
            <Input
              label="Reviewer Name"
              value={newVal.reviewer || ''}
              onChange={e => setNewVal({ ...newVal, reviewer: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Validation Findings</label>
              <textarea
                rows={3}
                required
                value={newVal.findings || ''}
                onChange={e => setNewVal({ ...newVal, findings: e.target.value })}
                placeholder="Enter review findings and evidence evaluation..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Recommendations & Mitigation</label>
              <textarea
                rows={2}
                value={newVal.recommendations || ''}
                onChange={e => setNewVal({ ...newVal, recommendations: e.target.value })}
                placeholder="Recommendations for decision gatekeeper..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Record Validation Outcome</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
