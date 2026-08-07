import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getAssets, getIncidents, saveIncident } from '../services/storageService';
import type { GovernanceIncident, IncidentType, IncidentSeverity, IncidentStatus } from '../types';

export const IncidentManagementPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [incidents, setIncidents] = useState<GovernanceIncident[]>(() => getIncidents());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<IncidentType>('Model Drift');
  const [severity, setSeverity] = useState<IncidentSeverity>('Medium');
  const [description, setDescription] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !title || !description) return;

    saveIncident({
      assetId: selectedAssetId,
      title,
      type,
      severity,
      description,
      reportedBy: 'Dr. Aris Thorne (Validator)',
    });
    setIncidents(getIncidents());
    alert('⚡ Governance Incident logged successfully!');
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = (id: string, newStatus: IncidentStatus) => {
    saveIncident({ id, status: newStatus });
    setIncidents(getIncidents());
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Incident Management Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Operational AI Incident Tracker • Model Drift, Hallucination Events, & Governance Anomaly Management
        </p>
      </div>

      {/* Log Incident Card */}
      <Card className="!p-6 flex flex-col gap-4 border-[var(--accent-border)]">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">Log New Operational AI Incident</h3>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select AI System"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />

            <Select
              label="Incident Type"
              value={type}
              onChange={e => setType(e.target.value as IncidentType)}
              options={[
                { value: 'Model Drift', label: 'Model Drift' },
                { value: 'Hallucination Event', label: 'Hallucination Event' },
                { value: 'Security Incident', label: 'Security Incident' },
                { value: 'Compliance Breach', label: 'Compliance Breach' },
                { value: 'Operational Failure', label: 'Operational Failure' },
              ]}
            />

            <Select
              label="Severity"
              value={severity}
              onChange={e => setSeverity(e.target.value as IncidentSeverity)}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>

          <Input
            label="Incident Title"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Swarm consensus infinite loop anomaly..."
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Incident Description & Impact</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe incident behavior, error trace, and impacted operational workflow..."
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full">
            Log Governance Incident
          </Button>
        </form>
      </Card>

      {/* Incidents Table / Cards */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Governance Incidents Directory ({incidents.length})
        </h3>

        {incidents.map(inc => (
          <Card key={inc.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">
                {inc.severity === 'Critical' ? '🚨' : inc.severity === 'High' ? '⚡' : '⚠️'}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{inc.assetName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-muted)]">
                    {inc.type}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    inc.severity === 'Critical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {inc.severity} Severity
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-[var(--text-primary)] mt-1">{inc.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{inc.description}</p>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {(['Open', 'Investigating', 'Mitigation', 'Resolved', 'Closed'] as IncidentStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(inc.id, st)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                    inc.status === st
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                  }`}
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
