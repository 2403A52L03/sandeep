import React, { useState } from 'react';
import { Lock, Bell, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const SettingsPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Preference switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [sensorAlertPings, setSensorAlertPings] = useState(true);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Error updating password'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage password security, sensor alert thresholds, and notification delivery options.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center space-x-2 text-xs font-semibold ${
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Lock className="w-5 h-5 text-forest-700" />
          <span>Change Account Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Bell className="w-5 h-5 text-forest-700" />
          <span>Telemetry & Alert Preferences</span>
        </h3>

        <div className="mt-5 space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">In-App Critical Alerts</h4>
              <p className="text-[11px] text-slate-500">Show notification banner when soil moisture drops below 30%</p>
            </div>
            <input
              type="checkbox"
              checked={sensorAlertPings}
              onChange={(e) => setSensorAlertPings(e.target.checked)}
              className="w-4 h-4 text-forest-700 rounded focus:ring-forest-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Harvest Readiness Pings</h4>
              <p className="text-[11px] text-slate-500">Alert 5 days before anticipated harvest date</p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 text-forest-700 rounded focus:ring-forest-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">SMS / Email Notifications</h4>
              <p className="text-[11px] text-slate-500">Future integration placeholder for GSM IoT SMS gateway</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-forest-700 rounded focus:ring-forest-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
