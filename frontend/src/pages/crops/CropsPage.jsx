import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Plus, Edit2, Trash2, Calendar, Clock, Filter, Layers, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

const CropsPage = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [plots, setPlots] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    plot_id: '',
    crop_name: '',
    crop_category: 'Cereals',
    variety: '',
    planting_date: '',
    expected_harvest_date: '',
    actual_harvest_date: '',
    cultivated_area: '',
    expected_yield: '',
    actual_yield: '',
    yield_unit: 'Quintals',
    status: 'Planted'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCropsAndPlots = async (status = statusFilter) => {
    try {
      const statusParam = status ? `?status=${status}` : '';
      const [cropsRes, plotsRes] = await Promise.all([
        api.get(`/crops${statusParam}`),
        api.get('/plots')
      ]);

      if (cropsRes.data.success) setCrops(cropsRes.data.data);
      if (plotsRes.data.success) setPlots(plotsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropsAndPlots();
  }, []);

  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    setLoading(true);
    fetchCropsAndPlots(val);
  };

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setFormData({
      plot_id: plots.length > 0 ? plots[0].id : '',
      crop_name: '',
      crop_category: 'Cereals',
      variety: '',
      planting_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: '',
      actual_harvest_date: '',
      cultivated_area: '',
      expected_yield: '',
      actual_yield: '',
      yield_unit: 'Quintals',
      status: 'Planted'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crop, e) => {
    e.stopPropagation();
    setEditingCrop(crop);
    setFormData({
      plot_id: crop.plot_id,
      crop_name: crop.crop_name,
      crop_category: crop.crop_category,
      variety: crop.variety || '',
      planting_date: crop.planting_date?.split('T')[0] || '',
      expected_harvest_date: crop.expected_harvest_date?.split('T')[0] || '',
      actual_harvest_date: crop.actual_harvest_date?.split('T')[0] || '',
      cultivated_area: crop.cultivated_area,
      expected_yield: crop.expected_yield || '',
      actual_yield: crop.actual_yield || '',
      yield_unit: crop.yield_unit || 'Quintals',
      status: crop.status || 'Planted'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingCrop) {
        await api.put(`/crops/${editingCrop.id}`, formData);
      } else {
        await api.post('/crops', formData);
      }
      setIsModalOpen(false);
      fetchCropsAndPlots(statusFilter);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving crop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/crops/${deleteTarget.id}`);
      fetchCropsAndPlots(statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting crop');
    }
  };

  const columns = [
    {
      header: 'Crop Name & Variety',
      accessor: 'crop_name',
      render: (row) => (
        <div 
          onClick={() => navigate(`/crops/${row.id}`)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-slate-900 group-hover:text-forest-700 flex items-center space-x-1.5">
            <span>{row.crop_name}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.variety || 'Standard Hybrid'} · {row.crop_category}</p>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: 'plot_name',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.plot_name}</p>
          <p className="text-[11px] text-slate-400">{row.farm_name}</p>
        </div>
      )
    },
    {
      header: 'Growth Progress',
      accessor: 'growth_progress_percentage',
      render: (row) => (
        <div className="w-36 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="font-mono font-bold text-slate-800">{row.growth_progress_percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-forest-700 to-fresh h-full rounded-full"
              style={{ width: `${row.growth_progress_percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">{row.days_since_planting || 0} days elapsed</p>
        </div>
      )
    },
    {
      header: 'Harvest Target',
      accessor: 'expected_harvest_date',
      render: (row) => (
        <div className="text-xs">
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
            row.is_overdue ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
          }`}>
            {row.harvest_status_label}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">Exp: {formatDate(row.expected_harvest_date)}</p>
        </div>
      )
    },
    {
      header: 'Lifecycle Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Acreage',
      accessor: 'cultivated_area',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.cultivated_area} Acres
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Edit Crop"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete Crop"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Crop Cultivation Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track planting dates, phenological stages, automated growth calculations, and harvest readiness.
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
              <option value="">All Crop Stages</option>
              <option value="Planned">Planned</option>
              <option value="Planted">Planted</option>
              <option value="Growing">Growing</option>
              <option value="Flowering">Flowering</option>
              <option value="Maturing">Maturing</option>
              <option value="Ready for Harvest">Ready for Harvest</option>
              <option value="Harvested">Harvested</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Crop</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={crops}
          searchPlaceholder="Search crops by name, variety, plot, or category..."
        />
      )}

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'Update Crop Cultivation' : 'Register New Crop'}
        subtitle="Configure crop species, planting dates, and expected cultivation lifecycle duration."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Cultivation Plot *
              </label>
              <select
                required
                disabled={!!editingCrop}
                value={formData.plot_id}
                onChange={(e) => setFormData({ ...formData, plot_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="">Choose Plot</option>
                {plots.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.farm_name} - {p.area} Acres)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                required
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                placeholder="e.g. Telangana Sona Rice"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.crop_category}
                onChange={(e) => setFormData({ ...formData, crop_category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
              >
                <option value="Cereals">Cereals</option>
                <option value="Pulses">Pulses</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Fiber">Fiber (Cotton/Jute)</option>
                <option value="Spices & Cash">Spices & Cash</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Variety / Hybrid
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g. RNR 15048"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cultivated Area (Acres) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.cultivated_area}
                onChange={(e) => setFormData({ ...formData, cultivated_area: e.target.value })}
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Planting Date *
              </label>
              <input
                type="date"
                required
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Expected Harvest Date *
              </label>
              <input
                type="date"
                required
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="Planned">Planned</option>
                <option value="Planted">Planted</option>
                <option value="Growing">Growing</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturing">Maturing</option>
                <option value="Ready for Harvest">Ready for Harvest</option>
                <option value="Harvested">Harvested</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Expected Yield (Quintals)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.expected_yield}
                onChange={(e) => setFormData({ ...formData, expected_yield: e.target.value })}
                placeholder="e.g. 95"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Actual Yield (If Harvested)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.actual_yield}
                onChange={(e) => setFormData({ ...formData, actual_yield: e.target.value })}
                placeholder="e.g. 102.5"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
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
              {submitting ? 'Calculating...' : editingCrop ? 'Update Crop' : 'Register Crop'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Crop Record"
        message={`Are you sure you want to delete crop '${deleteTarget?.crop_name}'?`}
      />
    </div>
  );
};

export default CropsPage;
