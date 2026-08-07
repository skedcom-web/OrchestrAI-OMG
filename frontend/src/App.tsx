import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

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
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetRegistryPage />} />
            <Route path="/ownership" element={<OwnershipMatrixPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/risk" element={<RiskCenterPage />} />
            <Route path="/decision-governance" element={<DecisionGovernancePage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
