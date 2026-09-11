import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole, PersonaDemoUser, Workspace, WorkspaceUser } from '../types';
import { DEMO_PERSONAS, INITIAL_USERS } from '../services/mockData';
import { ROLE_ACTION_MATRIX, isReadOnlyRole, type ActionKey } from '../config/roleActionMatrix';
import { authenticateWorkspaceUser, addWorkspaceAuditEntry } from '../services/storageService';

/**
 * Release 18.2 — Platform Login Segregation & Access Boundary Correction.
 *
 * Three genuinely distinct session types, not two-with-a-bypass. Prior to
 * this release, the Demo "Super Admin" persona silently doubled as platform
 * administration (an unconditional role-based bypass in hasPermission and
 * canPerform) — the exact architecture flaw this release corrects. Platform
 * administration is now its own login (hardcoded demo credential, no
 * backend) and its own session type, checked before any persona/role logic
 * ever runs, for every page and every action listed below.
 */
export type SessionType = 'PLATFORM' | 'DEMO' | 'WORKSPACE';

const PLATFORM_USERNAME = 'orchestraiomg';
/** DEMO-ONLY credential, hardcoded by explicit product decision — same posture as WorkspaceUser.password (see its doc comment in types/index.ts). Not real authentication. */
const PLATFORM_PASSWORD = 'OMG@123';

/**
 * Platform administration surface — reachable only when sessionType is
 * PLATFORM, regardless of which persona/role is otherwise active.
 */
const PLATFORM_ADMIN_ONLY_PATHS = new Set([
  '/users',
  '/rbac',
  '/environment-management',
  '/tenant-management',
  '/customer-workspace',
  '/workspace-directory',
  '/workspace-user-administration',
  '/release-notes',
]);

/** The action-level counterpart to PLATFORM_ADMIN_ONLY_PATHS — gates the write actions behind those pages the same way. */
const PLATFORM_ADMIN_ONLY_ACTIONS = new Set<ActionKey>([
  'environment:switch',
  'workspace:create',
  'workspace:edit',
  'workspace:suspend',
  'workspaceUser:create',
  'workspaceUser:manage',
]);

export function canAccessPlatformAdministration(sessionType: SessionType | null): boolean {
  return sessionType === 'PLATFORM';
}

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
  /** Release 18.2 — which of the three login types produced the current session. */
  sessionType: SessionType;
  currentPlatformAdmin: boolean;
  loginToPlatform: (username: string, password: string) => boolean;
  canAccessPlatformAdministration: () => boolean;
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

  const [sessionType, setSessionType] = useState<SessionType>(() => {
    const saved = localStorage.getItem('omg_session_type');
    if (saved === 'PLATFORM' || saved === 'DEMO' || saved === 'WORKSPACE') return saved;
    // Legacy sessions from before Release 18.2 predate this key — infer from
    // whether a workspace was already active, default to DEMO otherwise.
    return localStorage.getItem('omg_auth_workspace') ? 'WORKSPACE' : 'DEMO';
  });

  const setSession = (type: SessionType) => {
    setSessionType(type);
    localStorage.setItem('omg_session_type', type);
  };

  /** Persona-lens switching only — never changes sessionType. Used by all three session types alike (Demo Persona Login, the Topbar switcher during a Workspace session, and to give a Platform session full governance visibility). */
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

    // Release 18.1 Patch, Module 3 — only a genuine change of lens during an
    // active workspace session counts as a "Changed Persona" event; the
    // initial lens set by loginToWorkspace itself is not a persona change.
    if (currentWorkspace && currentWorkspaceUser && currentPersona && currentPersona.role !== role) {
      addWorkspaceAuditEntry({
        workspaceId: currentWorkspace.id,
        workspaceName: currentWorkspace.name,
        userName: currentWorkspaceUser.name,
        persona: role,
        action: 'Changed Persona',
        entityType: 'Persona',
        entityName: `${currentPersona.role} → ${role}`,
      });
    }

    setCurrentUser(targetUser);
    setCurrentPersona(targetPersona);
    localStorage.setItem('omg_auth_user', JSON.stringify(targetUser));
  };

  /** Login Type 2 — Demo Persona Login. Product demonstrations, guided tours, RBAC demonstrations. Never platform administration, not even as Super Admin. */
  const login = (email: string, role?: UserRole) => {
    const matchedPersona = DEMO_PERSONAS.find(
      p => p.email.toLowerCase() === email.toLowerCase() || p.role === role
    ) || DEMO_PERSONAS[0];

    setSession('DEMO');
    switchPersona(matchedPersona.role);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPersona(null);
    setCurrentWorkspace(null);
    setCurrentWorkspaceUser(null);
    setSession('DEMO');
    localStorage.removeItem('omg_auth_user');
    localStorage.removeItem('omg_auth_workspace');
    localStorage.removeItem('omg_auth_workspace_user');
  };

  /** Login Type 3 — Workspace Login. Resolves email/password to a workspace, then defaults the evaluation lens to Governance Admin — the Workspace Owner can Persona Switch across the other 5 seeded lenses from there. Never platform administration, regardless of lens. */
  const loginToWorkspace = (email: string, password: string): boolean => {
    const result = authenticateWorkspaceUser(email, password);
    if (!result) return false;
    setCurrentWorkspace(result.workspace);
    setCurrentWorkspaceUser(result.user);
    localStorage.setItem('omg_auth_workspace', JSON.stringify(result.workspace));
    localStorage.setItem('omg_auth_workspace_user', JSON.stringify(result.user));
    setSession('WORKSPACE');
    switchPersona('GOVERNANCE_ADMIN');
    return true;
  };

  const logoutWorkspace = () => {
    setCurrentWorkspace(null);
    setCurrentWorkspaceUser(null);
    setSession('DEMO');
    localStorage.removeItem('omg_auth_workspace');
    localStorage.removeItem('omg_auth_workspace_user');
  };

  /** Login Type 1 — OrchestrAI OMG Platform Login. The only session type that reaches platform administration; also retains full governance module access. */
  const loginToPlatform = (username: string, password: string): boolean => {
    if (username !== PLATFORM_USERNAME || password !== PLATFORM_PASSWORD) return false;
    setSession('PLATFORM');
    switchPersona('SUPER_ADMIN');
    return true;
  };

  const hasPermission = (path: string): boolean => {
    if (!currentUser || !currentPersona) return false;
    // Release 18.2 — platform administration is decided by sessionType alone,
    // checked before any persona/role logic — a Demo or Workspace session
    // never reaches these paths no matter which persona is active.
    if (PLATFORM_ADMIN_ONLY_PATHS.has(path)) return sessionType === 'PLATFORM';
    if (sessionType === 'PLATFORM') return true;
    if (currentPersona.role === 'SUPER_ADMIN') return true;
    return currentPersona.allowedNav.includes(path);
  };

  const canPerform = (action: ActionKey): boolean => {
    if (!currentUser || !currentPersona) return false;
    if (PLATFORM_ADMIN_ONLY_ACTIONS.has(action)) return sessionType === 'PLATFORM';
    if (sessionType === 'PLATFORM') return true;
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
        sessionType,
        currentPlatformAdmin: sessionType === 'PLATFORM',
        loginToPlatform,
        canAccessPlatformAdministration: () => sessionType === 'PLATFORM',
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
