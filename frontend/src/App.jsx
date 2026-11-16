import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FarmsPage from './pages/farms/FarmsPage';
import FarmDetailsPage from './pages/farms/FarmDetailsPage';
import PlotsPage from './pages/plots/PlotsPage';
import CropsPage from './pages/crops/CropsPage';
import CropDetailsPage from './pages/crops/CropDetailsPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import IrrigationPage from './pages/irrigation/IrrigationPage';
import ActivitiesPage from './pages/activities/ActivitiesPage';
import ReportsPage from './pages/reports/ReportsPage';
import UsersPage from './pages/admin/UsersPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating Smart Agriculture Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes wrapped in Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="farms" element={<FarmsPage />} />
            <Route path="farms/:id" element={<FarmDetailsPage />} />
            <Route path="plots" element={<PlotsPage />} />
            <Route path="crops" element={<CropsPage />} />
            <Route path="crops/:id" element={<CropDetailsPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="monitoring/crop" element={<MonitoringPage />} />
            <Route path="monitoring/soil" element={<MonitoringPage />} />
            <Route path="monitoring/sensors" element={<MonitoringPage />} />
            <Route path="irrigation" element={<IrrigationPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="reports" element={<ReportsPage />} />

            {/* Admin Exclusive Route */}
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

