import React, { useState, useEffect } from 'react';
import { Droplets, Plus, CheckCircle2, XCircle, Clock, Filter, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

const IrrigationPage = () => {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    farm_id: '',
    plot_id: '',
    crop_id: '',
    irrigation_method: 'Drip',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_time: '06:00 AM',
    duration_minutes: 60,
    water_quantity_litres: 3500,
    status: 'Scheduled',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIrrigationData = async (status = statusFilter) => {
    try {
      const statusParam = status ? `?status=${status}` : '';
      const [irrRes, farmsRes, plotsRes, cropsRes] = await Promise.all([
        api.get(`/irrigation${statusParam}`),
        api.get('/farms'),
        api.get('/plots'),
        api.get('/crops')
      ]);

      if (irrRes.data.success) setRecords(irrRes.data.data);
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
    fetchIrrigationData();
  }, []);

  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    setLoading(true);
    fetchIrrigationData(val);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      plot_id: plots.length > 0 ? plots[0].id : '',
      crop_id: crops.length > 0 ? crops[0].id : '',
      irrigation_method: 'Drip',
      scheduled_date: new Date().toISOString().split('T')[0],
      start_time: '06:00 AM',
      duration_minutes: 60,
      water_quantity_litres: 3500,
      status: 'Scheduled',
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      farm_id: rec.farm_id,
      plot_id: rec.plot_id,
      crop_id: rec.crop_id || '',
      irrigation_method: rec.irrigation_method,
      scheduled_date: rec.scheduled_date?.split('T')[0] || '',
      start_time: rec.start_time || '06:00 AM',
      duration_minutes: rec.duration_minutes || 60,
      water_quantity_litres: rec.water_quantity_litres || 0,
      status: rec.status,
      notes: rec.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (rec, newStatus) => {
    try {
      await api.put(`/irrigation/${rec.id}`, { status: newStatus });
      fetchIrrigationData(statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingRecord) {
        await api.put(`/irrigation/${editingRecord.id}`, formData);
      } else {
        await api.post('/irrigation', formData);
      }
      setIsModalOpen(false);
      fetchIrrigationData(statusFilter);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving irrigation schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/irrigation/${deleteTarget.id}`);
      fetchIrrigationData(statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting record');
    }
  };

  // Cumulative Water Usage
  const totalWaterLitres = records.reduce((acc, r) => acc + parseFloat(r.water_quantity_litres || 0), 0);

  const columns = [
    {
      header: 'Scheduled Date & Time',
      accessor: 'scheduled_date',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{formatDate(row.scheduled_date)}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.start_time} · {row.duration_minutes} mins</p>
        </div>
      )
    },
    {
      header: 'Location & Target',
      accessor: 'farm_name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.farm_name}</span>
          <p className="text-[11px] text-slate-400">{row.plot_name} · {row.crop_name || 'All-plot'}</p>
        </div>
      )
    },
    {
      header: 'Irrigation Method',
      accessor: 'irrigation_method',
      render: (row) => (
        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
          {row.irrigation_method}
        </span>
      )
    },
    {
      header: 'Water Volume',
      accessor: 'water_quantity_litres',
      render: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-slate-800">{parseFloat(row.water_quantity_litres || 0).toLocaleString()} Litres</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.duration_minutes} min run</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Quick Update & Actions',
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleToggleStatus(row, 'Completed')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center space-x-1"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleToggleStatus(row, 'Cancelled')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Cancel"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
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
      {/* Overview Stat Ribbon */}
      <div className="bg-gradient-to-r from-sky-900 to-forest-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-sky-200">Total Irrigation Water Applied</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">{totalWaterLitres.toLocaleString()} Litres</h2>
          <p className="text-xs text-slate-300 mt-1">Aggregated across active plots and drip channels</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-fresh text-forest-950 font-bold text-xs hover:bg-emerald-400 shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Irrigation</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Irrigation Management & Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan water delivery cycles, record actual discharge, and optimize micro-irrigation consumption.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="pl-9 pr-6 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          searchPlaceholder="Search irrigation by date, farm, method, or notes..."
        />
      )}

      {/* Add / Edit Irrigation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Update Irrigation Event' : 'Schedule Irrigation Event'}
        subtitle="Specify target plot, delivery method, time, duration, and water quantity."
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
                Target Crop
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
                Irrigation Method *
              </label>
              <select
                value={formData.irrigation_method}
                onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler System</option>
                <option value="Surface">Surface Flood</option>
                <option value="Manual">Manual Hose</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                placeholder="06:00 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Water Volume (Litres)
              </label>
              <input
                type="number"
                min="0"
                value={formData.water_quantity_litres}
                onChange={(e) => setFormData({ ...formData, water_quantity_litres: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Execution Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Field Notes & Additives
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Water-soluble potassium nitrate fertigation added to drip cycle."
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
              {submitting ? 'Saving...' : editingRecord ? 'Update Schedule' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Irrigation Record"
        message="Are you sure you want to delete this irrigation event log?"
      />
    </div>
  );
};

export default IrrigationPage;

