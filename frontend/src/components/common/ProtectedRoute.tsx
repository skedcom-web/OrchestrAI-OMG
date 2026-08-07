import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
  /**
   * Phase 8G roadmap placeholders are authenticated but not permission-gated —
   * they describe future capability rather than exposing governance data.
   */
  requirePermission?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  path,
  requirePermission = true,
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePermission && !hasPermission(path)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500 text-4xl border border-red-500/20">
          🚫
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted (RBAC Security)</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md">
          Your current governance role does not have authorization to view this module. Use the Topbar Persona Switcher or log in with higher privileges.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
