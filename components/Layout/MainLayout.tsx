import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const SidebarContext = React.createContext({
  isMobileOpen: false,
  toggleMobileSidebar: () => {},
});

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <SidebarContext.Provider value={{ isMobileOpen, toggleMobileSidebar }}>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Sidebar (Fixed position handling is inside Sidebar component, but we reserve space here for LG screens) */}
        <Sidebar />
        
        {/* Main Content Wrapper - Flex Column */}
        <div className="flex-1 flex flex-col h-full min-w-0 lg:ml-64 transition-all duration-300 ease-in-out">
          {/* Header - Flex Item (Not Fixed) */}
          <Header />
          
          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {children}
          </main>
        </div>
        
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </div>
    </SidebarContext.Provider>
  );
};

export default MainLayout;