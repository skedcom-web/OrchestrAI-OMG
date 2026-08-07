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
import { AuditLogsPage } from './pages/AuditLogsPage';

// Phase 3 Pages
import { ValidationCenterPage } from './pages/ValidationCenterPage';
import { EvidenceCenterPage } from './pages/EvidenceCenterPage';
import { ReviewWorkbenchPage } from './pages/ReviewWorkbenchPage';
import { FindingsPage } from './pages/FindingsPage';
import { ValidationDashboardPage } from './pages/ValidationDashboardPage';

// Phase 4 Pages
import { DecisionIntelligencePage } from './pages/DecisionIntelligencePage';
import { GovernanceBlockersPage } from './pages/GovernanceBlockersPage';
import { DecisionWorkbenchPageV4 } from './pages/DecisionWorkbenchPageV4';
import { DecisionDashboardPage } from './pages/DecisionDashboardPage';

// Phase 5 Pages
import { ComplianceCenterPage } from './pages/ComplianceCenterPage';
import { RegulatoryLibraryPage } from './pages/RegulatoryLibraryPage';
import { ComplianceAssessmentPage } from './pages/ComplianceAssessmentPage';
import { ComplianceFindingsPage } from './pages/ComplianceFindingsPage';
import { ComplianceDashboardPage } from './pages/ComplianceDashboardPage';

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

                    {/* Phase 3 Routes */}
                    <Route
                      path="/validation"
                      element={
                        <ProtectedRoute path="/validation">
                          <ValidationCenterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/evidence"
                      element={
                        <ProtectedRoute path="/evidence">
                          <EvidenceCenterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review-workbench"
                      element={
                        <ProtectedRoute path="/review-workbench">
                          <ReviewWorkbenchPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/findings"
                      element={
                        <ProtectedRoute path="/findings">
                          <FindingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/validation-dashboard"
                      element={
                        <ProtectedRoute path="/validation-dashboard">
                          <ValidationDashboardPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 4 Routes */}
                    <Route
                      path="/decision-intelligence"
                      element={
                        <ProtectedRoute path="/decision-intelligence">
                          <DecisionIntelligencePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/governance-blockers"
                      element={
                        <ProtectedRoute path="/governance-blockers">
                          <GovernanceBlockersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/decision-workbench-v4"
                      element={
                        <ProtectedRoute path="/decision-workbench-v4">
                          <DecisionWorkbenchPageV4 />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/decision-dashboard"
                      element={
                        <ProtectedRoute path="/decision-dashboard">
                          <DecisionDashboardPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 5 Routes */}
                    <Route
                      path="/compliance-center"
                      element={
                        <ProtectedRoute path="/compliance-center">
                          <ComplianceCenterPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/regulatory-library"
                      element={
                        <ProtectedRoute path="/regulatory-library">
                          <RegulatoryLibraryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance-assessment"
                      element={
                        <ProtectedRoute path="/compliance-assessment">
                          <ComplianceAssessmentPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance-findings"
                      element={
                        <ProtectedRoute path="/compliance-findings">
                          <ComplianceFindingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/compliance-dashboard"
                      element={
                        <ProtectedRoute path="/compliance-dashboard">
                          <ComplianceDashboardPage />
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
