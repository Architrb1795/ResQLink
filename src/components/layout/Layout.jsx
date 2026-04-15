import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CommandRail from './Header';
import { Outlet } from 'react-router-dom';
import ChatBot from '../chatbot/ChatBot';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-background flex">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <CommandRail onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
        </main>
      </div>
      {/* Global Live ChatBot — available on all pages */}
      <ChatBot />
    </div>
  );
};

export default Layout;
