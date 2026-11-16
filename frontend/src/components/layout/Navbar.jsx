import React, { useState, useEffect } from 'react';
import { Menu, Bell, Check, Sparkles, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.meta?.unread_count || 0);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/monitoring/environment/simulate', {});
      if (res.data.success) {
        showToast('Simulated IoT Reading Generated & Logged!');
        fetchNotifications();
      }
    } catch (err) {
      showToast('Simulation failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSimulating(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
          toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Context */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                Precision Agritech System
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400">·</span>
              <span className="hidden sm:inline-block text-xs text-slate-500">Live Campus & Farm Telemetry</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Simulation Trigger, Notifications, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Simulation Button for Demo Evaluation */}
          <button
            onClick={handleQuickSimulate}
            disabled={simulating}
            title="Generate simulated environmental reading into PostgreSQL"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${simulating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{simulating ? 'Simulating...' : 'Simulate Telemetry'}</span>
            <span className="md:hidden">Simulate</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Notifications & Alerts</h3>
                    <p className="text-[11px] text-slate-500">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-forest-700 hover:text-forest-900 font-medium flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No notifications logged.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-forest-50/40' : ''}`}>
                        <div className="flex items-start space-x-2.5">
                          <div className="mt-0.5">
                            {n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : n.type === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Info className="w-4 h-4 text-forest-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center pl-2 border-l border-slate-200">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              {user?.role || 'Farmer'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

