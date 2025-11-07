



import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRight } from 'lucide-react';
import { masterDataNavItems } from './masterDataConfig';

interface NavItem {
    to: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    hasChildren?: boolean;
    children?: NavItem[];
}


const NavItemLink: React.FC<{ item: NavItem; isOpen: boolean; onToggle: () => void; }> = ({ item, isOpen, onToggle }) => {
    const hasChildren = !!item.children || item.hasChildren;
    
    return (
        <li>
            <NavLink
                to={item.to}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                        onToggle();
                    }
                    if (item.to === '#') e.preventDefault();
                }}
                end={!hasChildren}
                className={({ isActive }) =>
                    `flex items-center justify-between w-full px-3 py-2 text-base rounded-md transition-colors ${
                        isActive
                            ? 'bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900/50 dark:text-blue-400'
                            : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`
                }
            >
                <div className="flex items-center gap-3">
                   <item.icon className="h-4 w-4 flex-shrink-0" />
                   <span>{item.label}</span>
                </div>
                {hasChildren && (isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </NavLink>
            {hasChildren && isOpen && item.children && (
                <ul className="pl-4 mt-1 space-y-1">
                    {item.children.map(child => (
                         <li key={child.to + child.label}>
                            <NavLink
                                to={child.to}
                                onClick={(e) => { if(child.to === '#') e.preventDefault()}}
                                className={({ isActive }) =>
                                    `flex items-center w-full px-3 py-2 text-base rounded-md transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900/50 dark:text-blue-400'
                                            : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <child.icon className="h-4 w-4" />
                                    <span>{child.label}</span>
                                </div>
                            </NavLink>
                         </li>
                    ))}
                </ul>
            )}
        </li>
    )
};


const MasterDataSidebar: React.FC = () => {
    const location = useLocation();
    const [openItems, setOpenItems] = useState<string[]>(() => {
        const activeParent = masterDataNavItems.find(item => item.children?.some(child => location.pathname.startsWith(child.to)) || location.pathname.startsWith(item.to));
        return activeParent ? [activeParent.label] : [];
    });

    const toggleItem = (label: string) => {
        setOpenItems(prev => prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]);
    };

    return (
        <aside className="w-70 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full rounded-lg">
            <div className="h-16 flex items-center px-4 shrink-0">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Master Data</h1>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                <ul>
                    {masterDataNavItems.map((item) => (
                        <NavItemLink 
                            key={item.label}
                            item={item}
                            isOpen={openItems.includes(item.label)}
                            onToggle={() => toggleItem(item.label)}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default MasterDataSidebar;