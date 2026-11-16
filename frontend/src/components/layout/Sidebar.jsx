import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trees, 
  Grid3X3, 
  Sprout, 
  Activity, 
  TestTube2, 
  Droplets, 
  ClipboardList, 
  Radio, 
  FileBarChart2, 
  Users, 
  UserCircle2, 
  Settings, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Farms', path: '/farms', icon: Trees },
    { name: 'Plots', path: '/plots', icon: Grid3X3 },
    { name: 'Crops', path: '/crops', icon: Sprout },
    { name: 'Crop Monitoring', path: '/monitoring/crop', icon: Activity },
    { name: 'Soil Monitoring', path: '/monitoring/soil', icon: TestTube2 },
    { name: 'Irrigation', path: '/irrigation', icon: Droplets },
    { name: 'Farm Activities', path: '/activities', icon: ClipboardList },
    { name: 'Environmental Sensors', path: '/monitoring/sensors', icon: Radio },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
  ];

  if (hasRole('admin')) {
    navItems.push({ name: 'User Management', path: '/admin/users', icon: Users, adminOnly: true });
  }

  navItems.push(
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
    { name: 'Settings', path: '/settings', icon: Settings }
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-forest-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fresh to-forest-500 flex items-center justify-center shadow-lg shadow-fresh/20 text-white font-bold text-xl">
              🌱
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight text-white">Smart Agriculture</h1>
              <p className="text-[11px] text-forest-200 font-medium">SR University · Proj #60</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-forest-800/80 border border-forest-700/60 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-fresh/20 border border-fresh/40 flex items-center justify-center text-fresh font-bold text-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Farmer User'}</p>
            <div className="flex items-center mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-fresh'}`} />
              <p className="text-[10px] text-forest-300 capitalize tracking-wide font-medium">{user?.role || 'Farmer'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-forest-400 px-3 py-1">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-fresh text-forest-950 font-bold shadow-md shadow-fresh/20' 
                    : 'text-forest-200 hover:bg-forest-800 hover:text-white'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.adminOnly && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold uppercase">
                    Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-forest-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

