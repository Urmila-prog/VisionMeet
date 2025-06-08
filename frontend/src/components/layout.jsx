import Sidebar from './sidebar';
import React, { useState } from 'react';
import Navbar from './navbar';
import { Menu } from 'lucide-react';

export const Layout = ({ children, showSidebar = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-base-100'>
      <div className='flex h-screen overflow-hidden'>
        {/* Mobile menu button */}
        {showSidebar && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-base-200 rounded-lg shadow-lg hover:bg-base-300 transition-colors"
          >
            <Menu className="size-6" />
          </button>
        )}

        {/* Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}

        {/* Main content */}
        <div className='flex-1 flex flex-col min-h-screen overflow-hidden'>
          <Navbar />
          <main className='flex-1 overflow-y-auto p-4'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
