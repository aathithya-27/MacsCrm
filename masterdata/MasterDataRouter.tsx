

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const CompanyMasterPage = lazy(() => import('./CompanyMasterPage'));
const BranchPage = lazy(() => import('./BranchPage'));
const BusinessVerticalPage = lazy(() => import('./BusinessVerticalPage'));
const GeographyManagementPage = lazy(() => import('./GeographyManagementPage'));
const DesignationPage = lazy(() => import('./DesignationPage'));
const RolePage = lazy(() => import('./RolePage'));
const MaritalStatusPage = lazy(() => import('./MaritalStatusPage'));
const GenderPage = lazy(() => import('./GenderPage'));
const RelationshipMasterPage = lazy(() => import('./RelationshipMasterPage'));
const LeadStageMasterPage = lazy(() => import('./LeadStageMasterPage'));
const ExpenseCategoryPage = lazy(() => import('./ExpenseCategoryPage'));
const IncomeCategoryPage = lazy(() => import('./IncomeCategoryPage'));
const PolicyConfigurationPage = lazy(() => import('./PolicyConfigurationPage'));
const DocumentMasterPage = lazy(() => import('./DocumentMasterPage'));
const AgencyPage = lazy(() => import('./AgencyPage'));
const RoutesManager = lazy(() => import('./RoutesManager'));
const CustomerSegmentPage = lazy(() => import('./CustomerSegmentPage'));
const TierAndGiftPage = lazy(() => import('./TierAndGiftPage'));
const ReligionAndFestivalPage = lazy(() => import('./ReligionAndFestivalPage'));
const FinancialYearPage = lazy(() => import('./FinancialYearPage'));
const BankMasterPage = lazy(() => import('./BankMasterPage'));

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="text-slate-500 dark:text-slate-400">Loading Page...</div>
    </div>
);

const MasterDataRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="companyMaster" element={<CompanyMasterPage />} />
                <Route path="branch" element={<BranchPage />} />
                <Route path="businessVertical" element={<BusinessVerticalPage />} />
                <Route path="geography" element={<GeographyManagementPage />} />
                <Route path="financialYear" element={<FinancialYearPage />} />
                <Route path="bankMaster" element={<BankMasterPage />} />
                <Route path="customerSegment" element={<CustomerSegmentPage />} />
                <Route path="tierAndGift" element={<TierAndGiftPage />} />
                <Route path="designation" element={<DesignationPage />} />
                <Route path="role" element={<RolePage />} />
                <Route path="maritalStatus" element={<MaritalStatusPage />} />
                <Route path="gender" element={<GenderPage />} />
                <Route path="relationship" element={<RelationshipMasterPage />} />
                <Route path="religionAndFestival" element={<ReligionAndFestivalPage />} />
                <Route path="leadStage" element={<LeadStageMasterPage />} />
                <Route path="expenseCategory" element={<ExpenseCategoryPage />} />
                <Route path="incomeCategory" element={<IncomeCategoryPage />} />
                <Route path="policyConfiguration" element={<PolicyConfigurationPage />} />
                <Route path="documentMaster" element={<DocumentMasterPage />} />
                <Route path="agency" element={<AgencyPage />} />
                <Route path="route" element={<RoutesManager />} />
                <Route path="/" element={<div className="p-8 text-center">Select an item from the menu.</div>} />
                <Route path="*" element={<div className="p-8 text-center">Select an item from the menu.</div>} />
            </Routes>
        </Suspense>
    );
};

export default MasterDataRouter;