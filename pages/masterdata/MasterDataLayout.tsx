

import React, { useState, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  GitBranch, 
  Briefcase, 
  Shield, 
  Users, 
  Settings2,
  CreditCard,
  Map,
  FileCheck,
  ChevronDown,
  FileText,
  Gift,
  DollarSign,
  PieChart,
  Navigation,
  Heart
} from 'lucide-react';

interface MasterDataLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MasterDataLayout: React.FC<MasterDataLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Restore scroll position immediately after mount
  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('masterDataSidebarScroll');
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  // Save scroll position on scroll event
  const handleScroll = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem('masterDataSidebarScroll', sidebarRef.current.scrollTop.toString());
    }
  };

  // Helper icons
  function CalendarIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  }
  
  function TrendingIcon(props: any) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  }

  const masterDataMenu = [
    { name: 'Company Master', path: '/master-data/company', icon: Building2 },
    { name: 'Branch', path: '/master-data/branch', icon: GitBranch },
    { name: 'Business Vertical', path: '/master-data/business', icon: Briefcase },
    { name: 'Policy Configuration', path: '/master-data/policy', icon: Settings2 },
    { name: 'Agency and Scheme', path: '/master-data/agency', icon: Shield },
    { name: 'Mutual Funds', path: '/master-data/mutual-funds', icon: CreditCard },
    { name: 'Designation', path: '/master-data/designation', icon: Users },
    { name: 'Role', path: '/master-data/role', icon: Users },
    { name: 'Role Permissions', path: '/master-data/permissions', icon: Shield },
    { name: 'Financial Year', path: '/master-data/financial-year', icon: CalendarIcon },
    { name: 'Religions & Festivals', path: '/master-data/religions', icon: Map },
    { name: 'Lead/Referral', path: '/master-data/lead-referral', icon: Users },
    { name: 'Lead Stage Master', path: '/master-data/lead-stage', icon: TrendingIcon },
    { name: 'Relationship', path: '/master-data/relationship', icon: Users },
    { name: 'Marital Status', path: '/master-data/marital-status', icon: Heart },
    { name: 'Geography', path: '/master-data/geography', icon: Map },
    { name: 'Document Master', path: '/master-data/documents', icon: FileCheck },
    { name: 'Bank Master', path: '/master-data/bank', icon: Building2 },
    { name: 'Expense Master', path: '/master-data/expense', icon: PieChart },
    { name: 'Income Master', path: '/master-data/income', icon: DollarSign },
    { name: 'Route Master', path: '/master-data/route', icon: Navigation },
    { name: 'Task Status', path: '/master-data/task-status', icon: FileText },
    { name: 'Customer Segment', path: '/master-data/customer-segment', icon: Users },
    { name: 'Gender', path: '/master-data/gender', icon: Users },
    { name: 'Type & Gift Mgmt', path: '/master-data/type-gift', icon: Gift },
  ];

  const currentPathName = masterDataMenu.find(item => item.path === location.pathname)?.name || 'Select Module';

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Mobile/Tablet Dropdown Navigation */}
      <div className="md:hidden w-full mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Master Data Module</label>
        <div className="relative">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 flex items-center justify-between text-left shadow-sm"
          >
            <span className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
               <DatabaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
               {currentPathName}
            </span>
            <ChevronDown size={20} className="text-slate-400" />
          </button>
          
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
              {masterDataMenu.map((item) => (
                <div 
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 flex items-center gap-3 text-sm border-b border-gray-50 dark:border-slate-700 last:border-0 cursor-pointer ${
                    location.pathname === item.path 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar for Master Data */}
      <div className="hidden md:flex w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex-col sticky top-0 max-h-[calc(100vh-6rem)]">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <DatabaseIcon className="w-5 h-5" />
            Master Data
          </h2>
        </div>
        <div 
          ref={sidebarRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar py-2"
        >
          {masterDataMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={16} className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 hidden md:block">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

function DatabaseIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
}

export default MasterDataLayout;
