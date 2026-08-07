import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetRegistryPage } from './pages/AssetRegistryPage';
import { OwnershipMatrixPage } from './pages/OwnershipMatrixPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { DecisionGovernancePage } from './pages/DecisionGovernancePage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Unprotected Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes inside AppLayout */}
            <Route
              path="/*"
              element={
                <AppLayout>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute path="/">
                          <HomePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute path="/dashboard">
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/assets"
                      element={
                        <ProtectedRoute path="/assets">
                          <AssetRegistryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ownership"
                      element={
                        <ProtectedRoute path="/ownership">
                          <OwnershipMatrixPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/risk"
                      element={
                        <ProtectedRoute path="/risk">
                          <RiskCenterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/decision-governance"
                      element={
                        <ProtectedRoute path="/decision-governance">
                          <DecisionGovernancePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute path="/users">
                          <UserManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/audit-logs"
                      element={
                        <ProtectedRoute path="/audit-logs">
                          <AuditLogsPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
