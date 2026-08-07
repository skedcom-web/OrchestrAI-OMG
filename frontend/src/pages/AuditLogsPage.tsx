import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { getAuditLogs } from '../services/storageService';
import type { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => getAuditLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    l =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entityName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Audit Trail & Compliance Logs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Day-1 Immutable Governance Activity Stream for Enterprise Regulatory Compliance
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card className="!p-4">
        <Input
          placeholder="Search audit trail by user, action, entity name, or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Governance User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                    No audit records match search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-4 text-[var(--text-muted)] font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{log.userName}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{log.userRole}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] font-bold text-[10px] border border-[var(--accent-border)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-primary)]">
                      {log.entityName} ({log.entityType})
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] leading-normal">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
