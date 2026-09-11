import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import {
  getCustomerWorkspaces,
  getCustomerExtensionCatalog,
  getCustomerSolutionBlueprints,
  getCustomerConfigurationLayer,
  computeCustomerWorkspaceReadiness,
} from '../config/customerWorkspaceFoundation';

type WorkspaceTab = 'registry' | 'configuration' | 'extensions' | 'blueprints' | 'readiness';

const TABS: { key: WorkspaceTab; label: string; shortLabel: string; icon: string }[] = [
  { key: 'registry', label: 'Workspace Registry', shortLabel: 'Registry', icon: '🗂️' },
  { key: 'configuration', label: 'Configuration Layer', shortLabel: 'Config', icon: '⚙️' },
  { key: 'extensions', label: 'Extension Catalog', shortLabel: 'Extensions', icon: '🧩' },
  { key: 'blueprints', label: 'Solution Blueprints', shortLabel: 'Blueprints', icon: '📘' },
  { key: 'readiness', label: 'Readiness Dashboard', shortLabel: 'Readiness', icon: '🛡️' },
];

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const READINESS_TONE: Record<string, string> = {
  'Ready': 'var(--status-success)',
  'Partially Ready': 'var(--status-warning)',
  'Not Ready': 'var(--status-danger)',
};

export const CustomerWorkspaceFoundationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('registry');
  const [workspaces] = useState(() => getCustomerWorkspaces());
  const [extensions] = useState(() => getCustomerExtensionCatalog());
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id || '');
  const blueprints = useMemo(() => getCustomerSolutionBlueprints(workspaceId), [workspaceId]);
  const configEntries = useMemo(() => getCustomerConfigurationLayer(workspaceId), [workspaceId]);
  const readiness = useMemo(() => (workspaceId ? computeCustomerWorkspaceReadiness(workspaceId) : 'Not Ready'), [workspaceId]);
  const activeWorkspace = workspaces.find(w => w.id === workspaceId);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Customer Workspace Foundation</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Separates common OMG platform capability from customer-specific extensions, preparing the seam future
          ODF-driven customization plugs into. Workspaces below are illustrative — Banking, Insurance and Telecom —
          for demonstration purposes only.
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-5 pt-3 border-b border-[var(--border-color)] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 sm:flex-initial px-1.5 sm:px-3.5 py-2 rounded-t-lg text-[10.5px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                activeTab === tab.key
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.icon} <span className="sm:hidden">{tab.shortLabel}</span><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ============== WORKSPACE REGISTRY ============== */}
          {activeTab === 'registry' && (
            <div className="flex flex-col gap-3">
              {workspaces.map(ws => (
                <Card key={ws.id} className="!p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{ws.name}</span>
                        <Pill tone={ws.status === 'Active' ? 'var(--status-success)' : 'var(--text-muted)'}>{ws.status}</Pill>
                        <Pill tone="var(--accent-primary)">{ws.industry}</Pill>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{ws.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ============== CONFIGURATION LAYER ============== */}
          {activeTab === 'configuration' && (
            <div className="flex flex-col gap-4">
              <Select
                label="Select Customer Workspace"
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                options={workspaces.map(w => ({ value: w.id, label: `${w.name} (${w.industry})` }))}
              />
              <div className="flex flex-col gap-3">
                {getCustomerConfigurationLayer(workspaceId).map(cfg => (
                  <Card key={cfg.id} className="!p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{cfg.configArea}</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{cfg.description}</p>
                      </div>
                      <Pill tone={cfg.status === 'Configured' ? 'var(--status-success)' : 'var(--text-muted)'}>{cfg.status}</Pill>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ============== EXTENSION CATALOG ============== */}
          {activeTab === 'extensions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extensions.map(ext => (
                <Card key={ext.id} className="!p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{ext.name}</span>
                    <Pill tone={ext.deliveryLayer === 'ODF Implementation' ? 'var(--accent-primary)' : 'var(--status-warning)'}>{ext.deliveryLayer}</Pill>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{ext.category}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5">{ext.description}</p>
                </Card>
              ))}
            </div>
          )}

          {/* ============== SOLUTION BLUEPRINTS ============== */}
          {activeTab === 'blueprints' && (
            <div className="flex flex-col gap-4">
              <Select
                label="Select Customer Workspace"
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                options={workspaces.map(w => ({ value: w.id, label: `${w.name} (${w.industry})` }))}
              />
              {blueprints.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">No solution blueprint on file for this workspace.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {blueprints.map(bp => (
                    <Card key={bp.id} className="!p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{bp.name}</span>
                        <Pill tone="var(--text-muted)">{bp.status}</Pill>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5">{bp.summary}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============== READINESS DASHBOARD ============== */}
          {activeTab === 'readiness' && (
            <div className="flex flex-col gap-4">
              <Select
                label="Select Customer Workspace"
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                options={workspaces.map(w => ({ value: w.id, label: `${w.name} (${w.industry})` }))}
              />
              <Card className="!p-5 border-[var(--accent-border)]">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Customer Readiness</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">{activeWorkspace?.name}</span>
                  <Pill tone={READINESS_TONE[readiness]}>{readiness}</Pill>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {configEntries.filter(c => c.status === 'Configured').length} of {configEntries.length} configuration areas
                  configured · {blueprints.length} solution blueprint{blueprints.length === 1 ? '' : 's'} on file.
                  This reading informs onboarding planning — it never blocks a workspace from proceeding.
                </p>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
