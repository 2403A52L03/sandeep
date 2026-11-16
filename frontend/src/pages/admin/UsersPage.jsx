import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, ShieldAlert, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'farmer',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async (role = roleFilter) => {
    try {
      const roleParam = role ? `?role=${role}` : '';
      const res = await api.get(`/admin/users${roleParam}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleFilterChange = (e) => {
    const val = e.target.value;
    setRoleFilter(val);
    setLoading(true);
    fetchUsers(val);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'farmer',
      password: 'Password@123'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`);
      fetchUsers(roleFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers(roleFilter);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving user');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Full Name & Email',
      accessor: 'full_name',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.full_name}</span>
          <p className="text-[11px] text-slate-500">{r.email}</p>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (r) => {
        const roleColors = {
          admin: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
          farmer: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          officer: 'bg-sky-100 text-sky-800 border-sky-300',
          agronomist: 'bg-purple-100 text-purple-800 border-purple-300'
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleColors[r.role] || 'bg-slate-100 text-slate-800'}`}>
            {r.role}
          </span>
        );
      }
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      render: (r) => <span className="font-mono text-xs">{r.phone || 'N/A'}</span>
    },
    {
      header: 'Farms Owned',
      accessor: 'farms_owned_count',
      render: (r) => <span className="font-semibold text-slate-700">{r.farms_owned_count || 0}</span>
    },
    {
      header: 'Registration Date',
      accessor: 'created_at',
      render: (r) => formatDate(r.created_at)
    },
    {
      header: 'Account Status',
      accessor: 'is_active',
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
          r.is_active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {r.is_active ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleToggleStatus(r)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              r.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={r.is_active ? 'Deactivate User' : 'Activate User'}
          >
            {r.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>User Management & Role Permissions</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">
              Admin Exclusive
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision user accounts, configure role access (Admin, Farmer, Officer, Agronomist), and manage activation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="pl-9 pr-6 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="farmer">Farmers</option>
              <option value="officer">Agriculture Officers</option>
              <option value="agronomist">Agronomists</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 shadow-md active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search users by name, email, or role..."
        />
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Update User Account' : 'Provision User Account'}
        subtitle="Manage credentials and Role-Based Access Control (RBAC) privileges."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Role Permission *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
            >
              <option value="farmer">Farmer</option>
              <option value="officer">Agriculture Officer</option>
              <option value="agronomist">Agronomist</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {editingUser ? 'Password (Leave blank to keep current)' : 'Initial Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Min 6 chars'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;

