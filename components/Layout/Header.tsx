import React, { useContext } from 'react';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SidebarContext } from './MainLayout';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { toggleMobileSidebar } = useContext(SidebarContext);
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('master-data')) return 'Master Data';
    if (path.includes('dashboard')) return 'Dashboard';
    return 'Finroots';
  };

  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-10 flex items-center justify-between px-4 md:px-8 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
        </button>
        <button 
          onClick={toggleTheme}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-transform active:scale-95"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;