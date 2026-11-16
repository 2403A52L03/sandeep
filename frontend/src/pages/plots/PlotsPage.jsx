import React, { useState, useEffect } from 'react';
import { Grid3X3, Plus, Edit2, Trash2, Sprout, Filter, Trees } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const PlotsPage = () => {
  const [plots, setPlots] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    farm_id: '',
    name: '',
    area: '',
    soil_type: 'Red Sandy Loam',
    irrigation_type: 'Drip',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFarmsAndPlots = async (farmId = selectedFarmFilter) => {
    try {
      const farmParam = farmId ? `?farm_id=${farmId}` : '';
      const [plotsRes, farmsRes] = await Promise.all([
        api.get(`/plots${farmParam}`),
        api.get('/farms')
      ]);

      if (plotsRes.data.success) setPlots(plotsRes.data.data);
      if (farmsRes.data.success) setFarms(farmsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmsAndPlots();
  }, []);

  const handleFarmFilterChange = (e) => {
    const val = e.target.value;
    setSelectedFarmFilter(val);
    setLoading(true);
    fetchFarmsAndPlots(val);
  };

  const handleOpenAdd = () => {
    setEditingPlot(null);
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      name: '',
      area: '',
      soil_type: 'Red Sandy Loam',
      irrigation_type: 'Drip',
      latitude: '',
      longitude: '',
      description: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plot) => {
    setEditingPlot(plot);
    setFormData({
      farm_id: plot.farm_id,
      name: plot.name,
      area: plot.area,
      soil_type: plot.soil_type || 'Red Sandy Loam',
      irrigation_type: plot.irrigation_type || 'Drip',
      latitude: plot.latitude || '',
      longitude: plot.longitude || '',
      description: plot.description || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingPlot) {
        await api.put(`/plots/${editingPlot.id}`, formData);
      } else {
        await api.post('/plots', formData);
      }
      setIsModalOpen(false);
      fetchFarmsAndPlots(selectedFarmFilter);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving plot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/plots/${deleteTarget.id}`);
      fetchFarmsAndPlots(selectedFarmFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting plot');
    }
  };

  const columns = [
    {
      header: 'Plot Identifier',
      accessor: 'name',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.name}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.description || 'Precision agriculture sector'}</p>
        </div>
      )
    },
    {
      header: 'Parent Farm',
      accessor: 'farm_name',
      render: (row) => (
        <span className="font-semibold text-forest-800 flex items-center space-x-1">
          <Trees className="w-3.5 h-3.5 text-forest-600 mr-1" />
          {row.farm_name}
        </span>
      )
    },
    {
      header: 'Plot Area',
      accessor: 'area',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.area} {row.area_unit || 'Acres'}</span>
          <p className="text-[10px] text-slate-400">of {row.farm_total_area} {row.area_unit || 'Acres'} farm total</p>
        </div>
      )
    },
    {
      header: 'Irrigation Layout',
      accessor: 'irrigation_type',
      render: (row) => (
        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
          {row.irrigation_type || 'Drip'}
        </span>
      )
    },
    {
      header: 'Cultivated Crop',
      accessor: 'current_crop_name',
      render: (row) => (
        row.current_crop_name ? (
          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            {row.current_crop_name}
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">Unplanted</span>
        )
      )
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
            title="Edit Plot"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete Plot"
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
            Agricultural Plots & Sectors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Divide farms into calibrated plots with verified area constraints and irrigation networks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedFarmFilter}
              onChange={handleFarmFilterChange}
              className="pl-9 pr-6 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="">All Farms</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plot</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={plots}
          searchPlaceholder="Search plots by name, farm, or soil..."
        />
      )}

      {/* Add / Edit Plot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlot ? 'Edit Agricultural Plot' : 'Create Plot Sector'}
        subtitle="Calibrate plot acreage with parent farm capacity verification."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Farm *
            </label>
            <select
              required
              disabled={!!editingPlot}
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
            >
              <option value="">Choose parent farm</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.total_area} {f.area_unit})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Plot Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Plot A - North Ridge"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Plot Area (Acres/Hectares) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. 5.0"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Irrigation Method
              </label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler System</option>
                <option value="Surface">Surface / Flood</option>
                <option value="Manual">Manual / Hose</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Soil Type
            </label>
            <select
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
            >
              <option value="Red Sandy Loam">Red Sandy Loam</option>
              <option value="Black Clay Loam">Black Clay Loam</option>
              <option value="Alluvial Clay">Alluvial Clay</option>
              <option value="Loamy Sand">Loamy Sand</option>
              <option value="Laterite Soil">Laterite Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Telemetry Nodes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Drip lines with soil moisture sensor probes installed at 15cm and 30cm depths."
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
              {submitting ? 'Validating...' : editingPlot ? 'Update Plot' : 'Create Plot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Plot"
        message={`Are you sure you want to delete plot '${deleteTarget?.name}'? Active crops and historical observations linked to this plot will also be removed.`}
      />
    </div>
  );
};

export default PlotsPage;

