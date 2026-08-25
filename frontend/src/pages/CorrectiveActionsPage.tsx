import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getAssets, getCorrectiveActions, saveCorrectiveAction } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { CorrectiveAction, CorrectiveActionStatus, FindingSeverity } from '../types';

export const CorrectiveActionsPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: 'correctiveAction:create' exists in roleActionMatrix.ts;
  // status-transition workflow buttons have no matching edit ActionKey, so they fall back
  // to the safe !isReadOnly minimum.
  const { canPerform, isReadOnly } = useAuth();
  const [assets] = useState(() => getAssets());
  const [actions, setActions] = useState<CorrectiveAction[]>(() => getCorrectiveActions());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [severity, setSeverity] = useState<FindingSeverity>('Medium');
  const [assignedTo, setAssignedTo] = useState<string>('Sarah Jenkins');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !title || !description) return;

    saveCorrectiveAction({
      assetId: selectedAssetId,
      title,
      severity,
      assignedTo,
      dueDate,
      description,
    });
    setActions(getCorrectiveActions());
    alert('🛠️ Corrective Action assigned successfully!');
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = (id: string, newStatus: CorrectiveActionStatus) => {
    saveCorrectiveAction({ id, status: newStatus });
    setActions(getCorrectiveActions());
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Corrective Action Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Governance Remediation Tracker • Remediating Findings, Incidents, & Compliance Exceptions
        </p>
      </div>

      {/* Assign New Task Card */}
      <Card className="!p-6 flex flex-col gap-4 border-[var(--accent-border)]">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">Assign New Corrective Action</h3>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select
              label="Select AI System"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />

            <Select
              label="Severity"
              value={severity}
              onChange={e => setSeverity(e.target.value as FindingSeverity)}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />

            <Input
              label="Assignee"
              required
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
            />

            <Input
              label="Target Due Date"
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <Input
            label="Corrective Action Title"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Implement Swarm Agent Hard Execution Circuit Breaker..."
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Remediation Rationale & Technical Scope</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe required code changes, model re-training, or policy updates..."
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canPerform('correctiveAction:create')}
            title={!canPerform('correctiveAction:create') ? 'Your governance role does not permit assigning corrective actions.' : undefined}
          >
            🛠️ Assign Corrective Remediation Task
          </Button>
        </form>
      </Card>

      {/* Corrective Actions Directory */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Corrective Action Remediation Directory ({actions.length})
        </h3>

        {actions.length === 0 ? (
          <Card className="!p-8 text-center text-[var(--text-muted)] text-sm">
            No corrective actions have been assigned yet.
          </Card>
        ) : actions.map(act => (
          <Card key={act.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🛠️</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{act.assetName}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    act.severity === 'Critical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {act.severity} Severity
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    act.status === 'Completed' || act.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {act.status}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-[var(--text-primary)] mt-1">{act.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{act.description}</p>
                <span className="text-[10px] text-[var(--text-muted)] mt-1">
                  Assigned To: {act.assignedTo} | Target Due Date: {act.dueDate}
                </span>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {(['Open', 'Assigned', 'In Progress', 'Completed', 'Verified'] as CorrectiveActionStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(act.id, st)}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Your governance role does not permit updating corrective action status.' : undefined}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                    act.status === st
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
