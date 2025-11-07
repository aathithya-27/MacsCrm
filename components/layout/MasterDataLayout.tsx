


import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MasterDataSidebar from './MasterDataSidebar';
import { masterDataNavItems } from './masterDataConfig';
import { ChevronDownIcon } from '../icons/Icons';
import { ChevronUp } from 'lucide-react';
import MasterDataRouter from '../../masterdata/MasterDataRouter';

const MasterDataNavDropdown: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentItem = [...masterDataNavItems]
        .reverse()
        .find(item => location.pathname.startsWith(item.to));

    const handleNavigation = (path: string) => {
        if (path) {
            navigate(path);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Master Data</h2>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-2.5 text-base font-semibold text-left text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="flex items-center gap-3">
                        {currentItem && <currentItem.icon className="h-5 w-5 flex-shrink-0" />}
                        <span>{currentItem?.label || 'Select Master Data...'}</span>
                    </span>
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </button>
                
                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-80 rounded-md text-base ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none overflow-hidden">
                        <ul className="py-1 overflow-y-auto max-h-80">
                            {masterDataNavItems.map(item => (
                                <li
                                    key={item.label}
                                    onClick={() => handleNavigation(item.to)}
                                    className={`flex items-center gap-3 px-4 py-2 text-base cursor-pointer transition-colors ${
                                        currentItem?.to === item.to
                                            ? 'bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900/50 dark:text-blue-400'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                    role="option"
                                    aria-selected={currentItem?.to === item.to}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const MasterDataLayout: React.FC = () => {
    return (
        <div>
            <div className="xl:hidden p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <MasterDataNavDropdown />
            </div>
            <div className="xl:grid xl:grid-cols-[280px_1fr] items-start">
                <div className="hidden xl:block sticky top-0 h-[calc(100vh-4rem)] p-4 md:p-6 md:pr-0">
                    <MasterDataSidebar />
                </div>
                <div className="min-w-0 p-4 md:p-6">
                    <MasterDataRouter />
                </div>
            </div>
        </div>
    );
};

export default MasterDataLayout;