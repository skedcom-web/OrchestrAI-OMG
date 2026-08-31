import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ExperienceProvider } from './contexts/ExperienceContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetRegistryPage } from './pages/AssetRegistryPage';
import { OwnershipMatrixPage } from './pages/OwnershipMatrixPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Phase 3 Pages
import { ValidationCenterPage } from './pages/ValidationCenterPage';
import { EvidenceCenterPage } from './pages/EvidenceCenterPage';
import { EvidenceRegistryPage } from './pages/EvidenceRegistryPage';
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
import { CompliancePackWorkspacePage } from './pages/CompliancePackWorkspacePage';
import { RegulatoryLibraryPage } from './pages/RegulatoryLibraryPage';
import { ComplianceAssessmentPage } from './pages/ComplianceAssessmentPage';
import { ComplianceFindingsPage } from './pages/ComplianceFindingsPage';
import { ComplianceDashboardPage } from './pages/ComplianceDashboardPage';

// Phase 6 Pages
import { OperationsCenterPage } from './pages/OperationsCenterPage';
import { KillSwitchCenterPage } from './pages/KillSwitchCenterPage';
import { OverrideCenterPage } from './pages/OverrideCenterPage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { OperationalDashboardPage } from './pages/OperationalDashboardPage';
import { RetirementCenterPage } from './pages/RetirementCenterPage';
import { ArchivedAssetsPage } from './pages/ArchivedAssetsPage';
import { GovernanceReadinessDashboardPage } from './pages/GovernanceReadinessDashboardPage';
import { GovernanceTimelinePage } from './pages/GovernanceTimelinePage';

// Phase 7 Pages
import { GovernanceMonitoringPage } from './pages/GovernanceMonitoringPage';
import { GovernanceAlertsPage } from './pages/GovernanceAlertsPage';
import { ReviewCalendarPage } from './pages/ReviewCalendarPage';
import { CorrectiveActionsPage } from './pages/CorrectiveActionsPage';
import { GovernanceTrendsDashboardPage } from './pages/GovernanceTrendsDashboardPage';

// Phase 8 Pages — Governance Operating System
import { CommandCenterPage } from './pages/CommandCenterPage';
import { AssetLifecyclePage } from './pages/AssetLifecyclePage';
import { RbacAdministrationPage } from './pages/RbacAdministrationPage';
import { TenantSettingsPage } from './pages/TenantSettingsPage';
import { OmgOverviewPage } from './pages/OmgOverviewPage';
import { FutureModulePage } from './pages/FutureModulePage';

// Phase 9 Pages — Executive Governance Hub & Policy Governance
import { ExecutiveGovernanceHubPage } from './pages/ExecutiveGovernanceHubPage';
import { GovernanceScorecardsPage } from './pages/GovernanceScorecardsPage';
import { ExecutiveHeatmapsPage } from './pages/ExecutiveHeatmapsPage';
import { GovernanceInsightsPage } from './pages/GovernanceInsightsPage';
import { BoardReportingPage } from './pages/BoardReportingPage';
import { PolicyRegistryPage } from './pages/PolicyRegistryPage';
import { PolicyMappingPage } from './pages/PolicyMappingPage';
import { PolicyViolationsPage } from './pages/PolicyViolationsPage';

// Phase 10 Pages — Governance Change Management
import { ChangeRequestCenterPage } from './pages/ChangeRequestCenterPage';
import { ChangeImpactPage } from './pages/ChangeImpactPage';
import { ChangeGovernanceDashboardPage } from './pages/ChangeGovernanceDashboardPage';
import { ChangeHistoryPage } from './pages/ChangeHistoryPage';
import { GovernanceTriggersPage } from './pages/GovernanceTriggersPage';

// Release 6 Pages — Universal Regulatory Knowledge & Obligation Engine
import { MappingWorkspacePage } from './pages/MappingWorkspacePage';
import { RequirementRegistryPage } from './pages/RequirementRegistryPage';
import { ObligationLibraryPage } from './pages/ObligationLibraryPage';

// Release 7 Pages — Governance Intelligence Engine (Foundation)
import { GovernanceIntelligenceWorkspacePage } from './pages/GovernanceIntelligenceWorkspacePage';

// Release 8 Pages — Governance Intelligence Engine (Actions Edition)
import { GovernanceActionsWorkspacePage } from './pages/GovernanceActionsWorkspacePage';

// Release 9 Pages — Governance Decision Traceability Engine
import { DecisionTraceabilityPage } from './pages/DecisionTraceabilityPage';

// Release 10 Pages — Governance Intelligence Studio (Customer Configuration Edition)
import { GovernanceIntelligenceStudioPage } from './pages/GovernanceIntelligenceStudioPage';

// OMG vNext Pages — Governance Intelligence (Value, Drift, Health)
import { GovernanceValueDashboardPage } from './pages/GovernanceValueDashboardPage';
import { GovernanceDriftCenterPage } from './pages/GovernanceDriftCenterPage';
import { GovernanceHealthCenterPage } from './pages/GovernanceHealthCenterPage';

/** Every governed route declared once, guarded by the same RBAC boundary. */
const GOVERNED_ROUTES: { path: string; element: React.ReactNode }[] = [
  // Command surfaces — OMG Overview is the landing page, then the operational view.
  { path: '/', element: <OmgOverviewPage /> },
  { path: '/command-center', element: <CommandCenterPage /> },
  { path: '/dashboard', element: <DashboardPage /> },

  // Domain — Executive Governance (Phase 9)
  { path: '/executive-hub', element: <ExecutiveGovernanceHubPage /> },
  { path: '/governance-scorecards', element: <GovernanceScorecardsPage /> },
  { path: '/executive-heatmaps', element: <ExecutiveHeatmapsPage /> },
  { path: '/governance-insights', element: <GovernanceInsightsPage /> },
  { path: '/board-reporting', element: <BoardReportingPage /> },

  // Domain — Executive Governance, OMG vNext — Governance Intelligence
  { path: '/governance-value', element: <GovernanceValueDashboardPage /> },
  { path: '/governance-drift', element: <GovernanceDriftCenterPage /> },
  { path: '/governance-health', element: <GovernanceHealthCenterPage /> },

  // Domain — Policy Governance (Phase 9)
  { path: '/policy-management', element: <PolicyRegistryPage /> },
  { path: '/policy-mapping', element: <PolicyMappingPage /> },
  { path: '/policy-violations', element: <PolicyViolationsPage /> },

  // Domain — Change Governance (Phase 10)
  { path: '/change-requests', element: <ChangeRequestCenterPage /> },
  { path: '/change-impact', element: <ChangeImpactPage /> },
  { path: '/change-dashboard', element: <ChangeGovernanceDashboardPage /> },
  { path: '/change-history', element: <ChangeHistoryPage /> },
  { path: '/governance-triggers', element: <GovernanceTriggersPage /> },

  // Domain 1 — AI Governance Registry
  { path: '/assets', element: <AssetRegistryPage /> },
  { path: '/ownership', element: <OwnershipMatrixPage /> },
  { path: '/asset-lifecycle', element: <AssetLifecyclePage /> },
  { path: '/retirement', element: <RetirementCenterPage /> },
  { path: '/archived-assets', element: <ArchivedAssetsPage /> },
  { path: '/governance-readiness', element: <GovernanceReadinessDashboardPage /> },

  // Domain 2 — Risk & Compliance
  { path: '/risk', element: <RiskCenterPage /> },
  { path: '/validation', element: <ValidationCenterPage /> },
  { path: '/evidence', element: <EvidenceCenterPage /> },
  { path: '/evidence-registry', element: <EvidenceRegistryPage /> },
  { path: '/findings', element: <FindingsPage /> },
  { path: '/governance-blockers', element: <GovernanceBlockersPage /> },
  { path: '/validation-dashboard', element: <ValidationDashboardPage /> },
  { path: '/compliance-center', element: <ComplianceCenterPage /> },
  { path: '/compliance-packs', element: <CompliancePackWorkspacePage /> },
  { path: '/regulatory-library', element: <RegulatoryLibraryPage /> },
  { path: '/compliance-assessment', element: <ComplianceAssessmentPage /> },
  { path: '/compliance-findings', element: <ComplianceFindingsPage /> },
  { path: '/compliance-dashboard', element: <ComplianceDashboardPage /> },
  { path: '/mapping-workspace', element: <MappingWorkspacePage /> },
  { path: '/requirement-registry', element: <RequirementRegistryPage /> },
  { path: '/obligation-library', element: <ObligationLibraryPage /> },
  { path: '/governance-intelligence', element: <GovernanceIntelligenceWorkspacePage /> },
  { path: '/governance-actions', element: <GovernanceActionsWorkspacePage /> },
  { path: '/decision-traceability', element: <DecisionTraceabilityPage /> },
  { path: '/governance-studio', element: <GovernanceIntelligenceStudioPage /> },

  // Domain 3 — Decision Governance
  { path: '/decision-workbench-v4', element: <DecisionWorkbenchPageV4 /> },
  { path: '/decision-intelligence', element: <DecisionIntelligencePage /> },
  { path: '/review-workbench', element: <ReviewWorkbenchPage /> },
  { path: '/review-calendar', element: <ReviewCalendarPage /> },
  { path: '/decision-dashboard', element: <DecisionDashboardPage /> },

  // Domain 4 — Operations & Monitoring
  { path: '/operations-dashboard', element: <OperationalDashboardPage /> },
  { path: '/governance-monitoring', element: <GovernanceMonitoringPage /> },
  { path: '/governance-alerts', element: <GovernanceAlertsPage /> },
  { path: '/corrective-actions', element: <CorrectiveActionsPage /> },
  { path: '/operations-center', element: <OperationsCenterPage /> },
  { path: '/kill-switch', element: <KillSwitchCenterPage /> },
  { path: '/override-center', element: <OverrideCenterPage /> },
  { path: '/incidents', element: <IncidentManagementPage /> },

  // Domain 5 — Audit & Oversight
  { path: '/governance-timeline', element: <GovernanceTimelinePage /> },
  { path: '/governance-trends', element: <GovernanceTrendsDashboardPage /> },
  { path: '/audit-logs', element: <AuditLogsPage /> },

  // Domain 6 — Administration
  { path: '/users', element: <UserManagementPage /> },
  { path: '/rbac', element: <RbacAdministrationPage /> },
  { path: '/tenant-settings', element: <TenantSettingsPage /> },
];

/**
 * Phase 8G — future modules are routed now so navigation, deep links and RBAC
 * keys are stable before the capabilities themselves land.
 */
const FUTURE_ROUTES = [
  '/regulatory-compliance-center',
  '/ai-control-library',
  '/enterprise-reporting',
];

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExperienceProvider>
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
                      {GOVERNED_ROUTES.map(route => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <ProtectedRoute path={route.path}>{route.element}</ProtectedRoute>
                          }
                        />
                      ))}

                      {FUTURE_ROUTES.map(path => (
                        <Route
                          key={path}
                          path={path}
                          element={
                            <ProtectedRoute path={path} requirePermission={false}>
                              <FutureModulePage />
                            </ProtectedRoute>
                          }
                        />
                      ))}

                      <Route path="*" element={<OmgOverviewPage />} />
                    </Routes>
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </ExperienceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
