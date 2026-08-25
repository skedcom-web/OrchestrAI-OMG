import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getUsers, saveUser, toggleUserStatus } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { User, UserRole } from '../types';

export const UserManagementPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: user create/edit/deactivate has no dedicated ActionKey in
  // roleActionMatrix.ts yet, so this is gated with the safe !isReadOnly fallback (Auditor/Viewer
  // are never granted a write endpoint on the real backend).
  const { isReadOnly } = useAuth();
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const handleOpenCreateModal = () => {
    setEditingUser({
      name: '',
      email: '',
      role: 'GOVERNANCE_ADMIN',
      department: 'AI Governance Office',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.name || !editingUser?.email) return;

    saveUser(editingUser as any);
    refreshUsers();
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleStatus = (id: string) => {
    toggleUserStatus(id);
    refreshUsers();
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'SUPER_ADMIN', label: 'Super Admin (Platform Owner)' },
    { value: 'GOVERNANCE_ADMIN', label: 'Governance Admin (Program Manager)' },
    { value: 'RISK_OFFICER', label: 'Risk Officer (Risk Governance)' },
    { value: 'BUSINESS_OWNER', label: 'Business Owner (Business Accountability)' },
    { value: 'VALIDATOR', label: 'Validator (AI Testing & Scorecards)' },
    { value: 'AUDITOR', label: 'Auditor (Independent Compliance Audit)' },
    { value: 'VIEWER', label: 'Viewer (Executive Visibility)' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">User Management & RBAC Directory</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Phase 2.5 Governance Identity Layer • 7 Standardized Governance Roles
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          icon={<span>➕</span>}
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit creating governance users.' : undefined}
        >
          Create Governance User
        </Button>
      </div>

      {/* Role Badges Legend Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {roleOptions.map(r => (
          <div key={r.value} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-[var(--accent-primary)]">{r.value}</span>
            <span className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{r.label.split('(')[1]?.replace(')', '')}</span>
          </div>
        ))}
      </div>

      {/* User Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">User Identity</th>
                <th className="p-4">Governance Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Assets</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No governance users found.
                  </td>
                </tr>
              ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-red-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{user.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)] text-xs font-bold">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{user.department}</td>
                  <td className="p-4 text-xs font-bold text-[var(--text-primary)]">{user.assignedAssetsCount || 0} Assets</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(user)}
                        disabled={isReadOnly}
                        title={isReadOnly ? 'Your governance role does not permit editing user roles.' : undefined}
                      >
                        Edit Role
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={isReadOnly}
                        title={isReadOnly ? `Your governance role does not permit ${user.status === 'Active' ? 'deactivating' : 'activating'} users.` : undefined}
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser.id ? 'Edit Governance User Role' : 'Create Governance User'}
          subtitle="Phase 2.5 Role-Based Access Control Setup"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Input
              label="Full Name"
              required
              value={editingUser.name || ''}
              onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
            />
            <Input
              label="Corporate Email"
              type="email"
              required
              value={editingUser.email || ''}
              onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
              placeholder="officer@enterprise-bank.com"
            />
            <Select
              label="Governance Role (7 Roles Supported)"
              options={roleOptions}
              value={editingUser.role || 'GOVERNANCE_ADMIN'}
              onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
            />
            <Input
              label="Department / Unit"
              value={editingUser.department || ''}
              onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
              placeholder="e.g. Model Risk Management"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser.id ? 'Save User Role' : 'Create User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
