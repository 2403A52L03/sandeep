import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for evaluation demonstration
  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* App Logo */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-fresh to-forest-500 items-center justify-center shadow-xl shadow-fresh/20 text-white text-3xl font-bold mb-4 border border-fresh/40">
          🌱
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Smart Agriculture & Crop Monitoring
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-forest-200">
          SR University · DevOps & Full Stack Project No. 60
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 shadow-lg shadow-forest-900/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Evaluation Quick-Fill Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
              Demonstration Role Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('farmer@smartagri.edu')}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors text-left"
              >
                👨‍🌾 Lead Farmer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@smartagri.edu')}
                className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold hover:bg-amber-100 transition-colors text-left"
              >
                🛡️ Administrator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('officer@smartagri.edu')}
                className="p-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-semibold hover:bg-sky-100 transition-colors text-left"
              >
                📋 Agri Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('agronomist@smartagri.edu')}
                className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold hover:bg-purple-100 transition-colors text-left"
              >
                🔬 Agronomist
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              All demo accounts configured with password: <span className="font-mono font-bold">Password@123</span>
            </p>
          </div>

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-forest-700 hover:text-forest-900 underline">
              Register as Farmer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

