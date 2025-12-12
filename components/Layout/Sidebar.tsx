import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Database,
  MessageSquare,
  MapPin,
  LogOut,
  User,
  X
} from 'lucide-react';
import { SidebarContext } from './MainLayout';
import { companyMasterApi } from '../../services/masterDataApi/companyMaster.api';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isMobileOpen, toggleMobileSidebar } = useContext(SidebarContext);
  const [companyName, setCompanyName] = useState('Finroots');

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        // Fetching Company ID 1 as the default active company
        const response = await companyMasterApi.getById(1);
        if (response && response.data && response.data.comp_name) {
          setCompanyName(response.data.comp_name);
        }
      } catch (error) {
        console.error('Failed to fetch company name', error);
      }
    };
    fetchCompanyName();
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports & Insights', path: '/reports', icon: BarChart3 },
    { name: 'Profit & Loss', path: '/profit-loss', icon: TrendingUp },
    { name: 'Employee Management', path: '/employees', icon: Users },
    { name: 'Lead Management', path: '/leads', icon: Briefcase },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Task Management', path: '/tasks', icon: CheckSquare },
    { name: 'Policy List', path: '/policies', icon: FileText },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Master Data', path: '/master-data/company', icon: Database },
    { name: 'Location Services', path: '/location', icon: MapPin },
    { name: 'Chatbot', path: '/chatbot', icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/master-data') && location.pathname.startsWith('/master-data')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <>
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-30 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 flex flex-col shadow-sm
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <span className="text-xl font-bold text-slate-800 dark:text-white truncate" title={companyName}>
            {companyName}
          </span>
          <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleMobileSidebar()}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-600'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 dark:border-slate-700 py-4 bg-white dark:bg-slate-800">
          <ul className="space-y-1">
            <li>
              <Link to="/profile" className="flex items-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-l-4 border-transparent">
                <User size={18} className="mr-3 text-slate-400 dark:text-slate-500" />
                My Profile
              </Link>
            </li>
            <li>
              <button className="flex w-full items-center px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-l-4 border-transparent">
                <LogOut size={18} className="mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;