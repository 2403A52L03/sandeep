import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Filter, Edit2, Trash2, DollarSign, Clock } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    farm_id: '',
    plot_id: '',
    crop_id: '',
    activity_type: 'Fertilization',
    activity_date: new Date().toISOString().split('T')[0],
    description: '',
    labour_hours: 8,
    cost: 3200,
    status: 'Completed',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActivitiesData = async (type = typeFilter) => {
    try {
      const typeParam = type ? `?activity_type=${type}` : '';
      const [actRes, farmsRes, plotsRes, cropsRes] = await Promise.all([
        api.get(`/activities${typeParam}`),
        api.get('/farms'),
        api.get('/plots'),
        api.get('/crops')
      ]);

      if (actRes.data.success) {
        setActivities(actRes.data.data);
        setMeta(actRes.data.meta || {});
      }
      if (farmsRes.data.success) setFarms(farmsRes.data.data);
      if (plotsRes.data.success) setPlots(plotsRes.data.data);
      if (cropsRes.data.success) setCrops(cropsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesData();
  }, []);

  const handleTypeFilterChange = (e) => {
    const val = e.target.value;
    setTypeFilter(val);
    setLoading(true);
    fetchActivitiesData(val);
  };

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      plot_id: plots.length > 0 ? plots[0].id : '',
      crop_id: crops.length > 0 ? crops[0].id : '',
      activity_type: 'Fertilization',
      activity_date: new Date().toISOString().split('T')[0],
      description: '',
      labour_hours: 8,
      cost: 3200,
      status: 'Completed',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act) => {
    setEditingActivity(act);
    setFormData({
      farm_id: act.farm_id,
      plot_id: act.plot_id,
      crop_id: act.crop_id || '',
      activity_type: act.activity_type,
      activity_date: act.activity_date?.split('T')[0] || '',
      description: act.description || '',
      labour_hours: act.labour_hours || 0,
      cost: act.cost || 0,
      status: act.status || 'Completed',
      notes: act.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingActivity) {
        await api.put(`/activities/${editingActivity.id}`, formData);
      } else {
        await api.post('/activities', formData);
      }
      setIsModalOpen(false);
      fetchActivitiesData(typeFilter);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving farm activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/activities/${deleteTarget.id}`);
      fetchActivitiesData(typeFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting activity');
    }
  };

  const columns = [
    {
      header: 'Activity & Description',
      accessor: 'activity_type',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.activity_type}</span>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm truncate">{row.description || 'Routine field operation'}</p>
        </div>
      )
    },
    {
      header: 'Location & Target',
      accessor: 'farm_name',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.farm_name}</span>
          <p className="text-[11px] text-slate-400">{row.plot_name} · {row.crop_name || 'General Plot'}</p>
        </div>
      )
    },
    {
      header: 'Date Logged',
      accessor: 'activity_date',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{formatDate(row.activity_date)}</span>
    },
    {
      header: 'Labour Hours',
      accessor: 'labour_hours',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.labour_hours} hrs
        </span>
      )
    },
    {
      header: 'Expenditure (Cost)',
      accessor: 'cost',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-forest-800">
          {formatCurrency(row.cost)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Aggregated Cost Summary Header */}
      <div className="bg-gradient-to-r from-forest-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-forest-200">Total Activity Expenditure</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">{formatCurrency(meta.total_cost || 0)}</h2>
          </div>
          <div className="border-l border-forest-800 pl-6">
            <span className="text-xs uppercase font-bold tracking-wider text-forest-200">Total Labour Hours</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">{meta.total_labour_hours || 0} hrs</h2>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-fresh text-forest-950 font-bold text-xs hover:bg-emerald-400 shadow-md active:scale-95 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Farm Activity</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Farm Activities & Labor Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record land preparation, fertilization, weeding, pest management, and harvesting activities.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="pl-9 pr-6 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="">All Activity Types</option>
              <option value="Land Preparation">Land Preparation</option>
              <option value="Sowing">Sowing</option>
              <option value="Fertilization">Fertilization</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Weeding">Weeding</option>
              <option value="Pruning">Pruning</option>
              <option value="Harvesting">Harvesting</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={activities}
          searchPlaceholder="Search activities by description, type, or farm..."
        />
      )}

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Edit Field Activity' : 'Record Agricultural Activity'}
        subtitle="Log operational labor, input materials, costs, and field execution status."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Farm *
              </label>
              <select
                required
                value={formData.farm_id}
                onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="">Choose Farm</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Plot *
              </label>
              <select
                required
                value={formData.plot_id}
                onChange={(e) => setFormData({ ...formData, plot_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="">Choose Plot</option>
                {plots.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Crop
              </label>
              <select
                value={formData.crop_id}
                onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
              >
                <option value="">General Plot</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.crop_name} ({c.plot_name})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Activity Type *
              </label>
              <select
                value={formData.activity_type}
                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="Land Preparation">Land Preparation</option>
                <option value="Sowing">Sowing</option>
                <option value="Fertilization">Fertilization</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Weeding">Weeding</option>
                <option value="Pruning">Pruning</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Activity Date *
              </label>
              <input
                type="date"
                required
                value={formData.activity_date}
                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description of Field Work
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Basal application of bio-fertilizers and organic compost."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Labour Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.labour_hours}
                onChange={(e) => setFormData({ ...formData, labour_hours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total Cost (INR ₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
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
              {submitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Record Activity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Farm Activity"
        message="Are you sure you want to delete this farm activity record?"
      />
    </div>
  );
};

export default ActivitiesPage;

