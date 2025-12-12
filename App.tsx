import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/Layout/MainLayout';
import CompanyMasterPage from './pages/masterdata/CompanyMaster';
import BranchPage from './pages/masterdata/Branch';
import BusinessVerticalPage from './pages/masterdata/BusinessVertical';
import PolicyConfigurationPage from './pages/masterdata/PolicyConfiguration';
import DocumentMasterPage from './pages/masterdata/DocumentMaster';
import AgencySchemePage from './pages/masterdata/AgencyScheme';
import GeographyPage from './pages/masterdata/Geography';
import DesignationPage from './pages/masterdata/Designation';
import RolePage from './pages/masterdata/Role';
import RolePermissionsPage from './pages/masterdata/RolePermissions';
import FinancialYearPage from './pages/masterdata/FinancialYear';
import ReligionsPage from './pages/masterdata/Religions';
import LeadStageMaster from './pages/masterdata/LeadStageMaster';
import RelationshipMaster from './pages/masterdata/RelationshipMaster';
import LeadReferralPage from './pages/masterdata/LeadReferral';
import BankMasterPage from './pages/masterdata/BankMaster';
import GenderMasterPage from './pages/masterdata/GenderMaster';
import CustomerSegmentPage from './pages/masterdata/CustomerSegment';
import TypeGiftManagementPage from './pages/masterdata/TypeGiftManagement';
import ExpenseMasterPage from './pages/masterdata/ExpenseMaster';
import IncomeMasterPage from './pages/masterdata/IncomeMaster';
import RouteMasterPage from './pages/masterdata/RouteMaster';
import MaritalStatusMasterPage from './pages/masterdata/MaritalStatusMaster';
import UnderConstruction from './pages/masterdata/UnderConstruction';
import { ThemeProvider } from './context/ThemeContext';

const DashboardStub = () => <div className="p-8 text-center text-slate-500 dark:text-slate-400">Dashboard Module (Coming Soon)</div>;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
      <HashRouter>
        <MainLayout>
          <Routes>
            {}
            <Route path="/" element={<Navigate to="/master-data/company" replace />} />
            
            <Route path="/dashboard" element={<DashboardStub />} />
            
            {}
            <Route path="/master-data/company" element={<CompanyMasterPage />} />
            <Route path="/master-data/branch" element={<BranchPage />} />
            <Route path="/master-data/business" element={<BusinessVerticalPage />} />
            <Route path="/master-data/policy" element={<PolicyConfigurationPage />} />
            <Route path="/master-data/documents" element={<DocumentMasterPage />} />
            <Route path="/master-data/agency" element={<AgencySchemePage />} />
            <Route path="/master-data/geography" element={<GeographyPage />} />
            <Route path="/master-data/designation" element={<DesignationPage />} />
            <Route path="/master-data/role" element={<RolePage />} />
            <Route path="/master-data/permissions" element={<RolePermissionsPage />} />
            <Route path="/master-data/financial-year" element={<FinancialYearPage />} />
            <Route path="/master-data/religions" element={<ReligionsPage />} />
            
            {}
            <Route path="/master-data/lead-stage" element={<LeadStageMaster />} />
            <Route path="/master-data/relationship" element={<RelationshipMaster />} />
            <Route path="/master-data/lead-referral" element={<LeadReferralPage />} />
            
            <Route path="/master-data/bank" element={<BankMasterPage />} />
            <Route path="/master-data/gender" element={<GenderMasterPage />} />
            <Route path="/master-data/customer-segment" element={<CustomerSegmentPage />} />
            <Route path="/master-data/type-gift" element={<TypeGiftManagementPage />} />
            <Route path="/master-data/expense" element={<ExpenseMasterPage />} />
            <Route path="/master-data/income" element={<IncomeMasterPage />} />
            <Route path="/master-data/route" element={<RouteMasterPage />} />
            <Route path="/master-data/marital-status" element={<MaritalStatusMasterPage />} />
            
            <Route path="/master-data/mutual-funds" element={<UnderConstruction title="Mutual Funds" />} />
            <Route path="/master-data/task-status" element={<UnderConstruction title="Task Status" />} />

            {}
            <Route path="/master-data" element={<Navigate to="/master-data/company" replace />} />

            {}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;