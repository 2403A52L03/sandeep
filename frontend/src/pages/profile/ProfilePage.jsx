import React, { useState } from 'react';
import { UserCircle2, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered stakeholder profile, farm association, and Role-Based Access Control status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-forest-800 to-fresh text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-fresh/20">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.full_name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-300">
                {user?.role}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Primary Email
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
              <Mail className="w-4 h-4 text-forest-700" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Contact Phone
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
              <Phone className="w-4 h-4 text-forest-700" />
              <span>{user?.phone || 'Not configured'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Academic Affiliation
            </span>
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>SR University · Academic Year 2026-2027</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Evaluation Reference
            </span>
            <div className="text-slate-800 font-semibold text-sm">
              <span>Project No. 60 (DevOps & Full Stack)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
