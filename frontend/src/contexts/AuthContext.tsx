import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole, PersonaDemoUser, Workspace, WorkspaceUser } from '../types';
import { DEMO_PERSONAS, INITIAL_USERS } from '../services/mockData';
import { ROLE_ACTION_MATRIX, isReadOnlyRole, type ActionKey } from '../config/roleActionMatrix';
import { authenticateWorkspaceUser } from '../services/storageService';

/**
 * Release 18.1 — Workspace Enablement Patch, Security Rules. Regardless of
 * which of the 6 seeded personas a workspace session is currently viewing
 * as, these paths stay unreachable — platform administration belongs only
 * to OrchestrAI, never to a workspace evaluator.
 */
const PLATFORM_ADMIN_ONLY_PATHS = new Set([
  '/users',
  '/rbac',
  '/environment-management',
  '/tenant-management',
  '/workspace-directory',
  '/workspace-user-administration',
  '/release-notes',
]);

interface AuthContextType {
  currentUser: User | null;
  currentPersona: PersonaDemoUser | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  switchPersona: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (path: string) => boolean;
  /** Q1 Stabilization — Phase 2: per-action (not just per-page) permission check, driven by roleActionMatrix.ts. */
  canPerform: (action: ActionKey) => boolean;
  /** True for Auditor/Viewer — every write action is unavailable regardless of individual action grants. */
  isReadOnly: boolean;
  /** Release 18.1 — set only for a Workspace Login session; null in ordinary demo persona mode. */
  currentWorkspace: Workspace | null;
  currentWorkspaceUser: WorkspaceUser | null;
  loginToWorkspace: (email: string, password: string) => boolean;
  logoutWorkspace: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omg_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    // Default to Super Admin demo persona
    return INITIAL_USERS[0];
  });

  const [currentPersona, setCurrentPersona] = useState<PersonaDemoUser | null>(() => {
    if (!currentUser) return DEMO_PERSONAS[0];
    return DEMO_PERSONAS.find(p => p.role === currentUser.role) || DEMO_PERSONAS[0];
  });

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
    const saved = localStorage.getItem('omg_auth_workspace');
    if (saved) { try { return JSON.parse(saved); } catch { /* fallback below */ } }
    return null;
  });
  const [currentWorkspaceUser, setCurrentWorkspaceUser] = useState<WorkspaceUser | null>(() => {
    const saved = localStorage.getItem('omg_auth_workspace_user');
    if (saved) { try { return JSON.parse(saved); } catch { /* fallback below */ } }
    return null;
  });

  const switchPersona = (role: UserRole) => {
    const targetPersona = DEMO_PERSONAS.find(p => p.role === role) || DEMO_PERSONAS[0];
    const targetUser = INITIAL_USERS.find(u => u.role === role) || {
      id: `usr-${Date.now()}`,
      name: targetPersona.name,
      email: targetPersona.email,
      role: targetPersona.role,
      department: targetPersona.department,
      status: 'Active' as const,
    };

    setCurrentUser(targetUser);
    setCurrentPersona(targetPersona);
    localStorage.setItem('omg_auth_user', JSON.stringify(targetUser));
  };

  const login = (email: string, role?: UserRole) => {
    const matchedPersona = DEMO_PERSONAS.find(
      p => p.email.toLowerCase() === email.toLowerCase() || p.role === role
    ) || DEMO_PERSONAS[0];

    switchPersona(matchedPersona.role);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPersona(null);
    setCurrentWorkspace(null);
    setCurrentWorkspaceUser(null);
    localStorage.removeItem('omg_auth_user');
    localStorage.removeItem('omg_auth_workspace');
    localStorage.removeItem('omg_auth_workspace_user');
  };

  /** Module 3 — Workspace Login. Resolves email/password to a workspace, then defaults the evaluation lens to Governance Admin — the Workspace Owner can Persona Switch across the other 5 seeded lenses from there. */
  const loginToWorkspace = (email: string, password: string): boolean => {
    const result = authenticateWorkspaceUser(email, password);
    if (!result) return false;
    setCurrentWorkspace(result.workspace);
    setCurrentWorkspaceUser(result.user);
    localStorage.setItem('omg_auth_workspace', JSON.stringify(result.workspace));
    localStorage.setItem('omg_auth_workspace_user', JSON.stringify(result.user));
    switchPersona('GOVERNANCE_ADMIN');
    return true;
  };

  const logoutWorkspace = () => {
    setCurrentWorkspace(null);
    setCurrentWorkspaceUser(null);
    localStorage.removeItem('omg_auth_workspace');
    localStorage.removeItem('omg_auth_workspace_user');
  };

  const hasPermission = (path: string): boolean => {
    if (!currentUser || !currentPersona) return false;
    // Release 18.1 — Security Rules: platform administration stays unreachable
    // from a workspace session, regardless of which persona lens is active.
    if (currentWorkspace && PLATFORM_ADMIN_ONLY_PATHS.has(path)) return false;
    if (currentPersona.role === 'SUPER_ADMIN') return true;
    return currentPersona.allowedNav.includes(path);
  };

  const canPerform = (action: ActionKey): boolean => {
    if (!currentUser || !currentPersona) return false;
    if (currentPersona.role === 'SUPER_ADMIN') return true;
    const allowedRoles = ROLE_ACTION_MATRIX[action];
    return !!allowedRoles && allowedRoles.includes(currentPersona.role);
  };

  const isReadOnly = isReadOnlyRole(currentPersona?.role);

  useEffect(() => {
    if (currentUser) {
      const persona = DEMO_PERSONAS.find(p => p.role === currentUser.role);
      if (persona) setCurrentPersona(persona);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPersona,
        isAuthenticated: !!currentUser,
        login,
        switchPersona,
        logout,
        hasPermission,
        canPerform,
        isReadOnly,
        currentWorkspace,
        currentWorkspaceUser,
        loginToWorkspace,
        logoutWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
