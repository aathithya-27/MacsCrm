
import React from 'react';
import { MoonIcon, SunIcon } from '../icons/Icons';
import { Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-slate-100 dark:bg-slate-900 flex-shrink-0 relative z-20">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                 <button
                    onClick={onMenuClick}
                    className="xl:hidden p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                <div className="flex-1 hidden xl:block">
                </div>

                <div className="flex items-center space-x-4">
                     <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        aria-label="Toggle theme"
                     >
                        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;