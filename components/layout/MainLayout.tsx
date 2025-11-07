
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MainSidebar from './MainSidebar';
import Header from './Header';
import type { Company } from '../../types';

interface MainLayoutProps {
    company: Company | null;
    isLoading: boolean;
    updateCompany: (company: Company) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ company, isLoading, updateCompany }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
            <MainSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} company={company} isLoading={isLoading} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    <Outlet context={{ company, isLoading, updateCompany }} />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
