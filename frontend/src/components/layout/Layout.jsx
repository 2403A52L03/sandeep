import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* University Academic Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Smart Agriculture & Crop Monitoring Dashboard</span>
            <span className="mx-2">·</span>
            <span>Project No. 60</span>
          </div>
          <div className="mt-2 sm:mt-0">
            <span>B.Tech IV Year I Sem · DevOps & Full Stack Development · SR University (2026–2027)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

