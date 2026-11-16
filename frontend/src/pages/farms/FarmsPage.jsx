import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trees, Plus, MapPin, Layers, Sprout, Edit2, Trash2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const FarmsPage = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    total_area: '',
    area_unit: 'Acres',
    soil_type: 'Red Sandy Loam',
    location: '',
    village: '',
    district: 'Hanamkonda',
    state: 'Telangana',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      if (res.data.success) {
        setFarms(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      total_area: '',
      area_unit: 'Acres',
      soil_type: 'Red Sandy Loam',
      location: '',
      village: '',
      district: 'Hanamkonda',
      state: 'Telangana',
      description: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm, e) => {
    e.stopPropagation();
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      total_area: farm.total_area,
      area_unit: farm.area_unit,
      soil_type: farm.soil_type,
      location: farm.location || '',
      village: farm.village || '',
      district: farm.district || '',
      state: farm.state || 'Telangana',
      description: farm.description || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm.id}`, formData);
      } else {
        await api.post('/farms', formData);
      }
      setIsModalOpen(false);
      fetchFarms();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving farm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/farms/${deleteTarget.id}`);
      fetchFarms();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting farm');
    }
  };

  const columns = [
    {
      header: 'Farm Name',
      accessor: 'name',
      render: (row) => (
        <div 
          onClick={() => navigate(`/farms/${row.id}`)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-slate-900 group-hover:text-forest-700 flex items-center space-x-1.5">
            <span>{row.name}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{row.description || 'No description provided'}</p>
        </div>
      )
    },
    {
      header: 'Total Area',
      accessor: 'total_area',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.total_area} {row.area_unit}
        </span>
      )
    },
    {
      header: 'Location',
      accessor: 'district',
      render: (row) => (
        <div className="text-slate-600">
          <p className="font-medium">{row.village || row.location || 'Rural Block'}</p>
          <p className="text-[11px] text-slate-400">{row.district}, {row.state}</p>
        </div>
      )
    },
    {
      header: 'Soil Profile',
      accessor: 'soil_type',
      render: (row) => (
        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {row.soil_type || 'Sandy Loam'}
        </span>
      )
    },
    {
      header: 'Plots / Active Crops',
      accessor: 'total_plots',
      render: (row) => (
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-slate-600" title="Agricultural Plots">
            <Layers className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {row.total_plots || 0}
          </span>
          <span className="flex items-center text-emerald-700 font-semibold" title="Active Crops">
            <Sprout className="w-3.5 h-3.5 text-emerald-500 mr-1" />
            {row.active_crops || 0}
          </span>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner_name',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.owner_name || 'Self'}
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Farm"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Farm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farm Holdings Management"
        subtitle="Register, configure, and monitor agricultural farms, soil zones, and geographic locations."
        actionLabel="Register New Farm"
        onAction={handleOpenAdd}
        actionIcon={Plus}
      />

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={farms}
          searchPlaceholder="Search farms by name, village, or district..."
        />
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Edit Farm Holding' : 'Register Agricultural Farm'}
        subtitle="Enter cadastral details, area specifications, and soil characteristics."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Farm Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sri Lakshmi Precision Farm"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total Area *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                placeholder="e.g. 15.5"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Area Unit
              </label>
              <select
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
              >
                <option value="Acres">Acres</option>
                <option value="Hectares">Hectares</option>
                <option value="Guntas">Guntas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Primary Soil Type
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
                Village / Landmark
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Ananthasagar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                District
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Hanamkonda"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Telangana"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Drip fertigation network, organic certification in progress..."
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
              {submitting ? 'Saving...' : editingFarm ? 'Update Farm' : 'Register Farm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Farm Holding"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? All associated agricultural plots, crops, irrigation schedules, and activity logs will also be permanently deleted.`}
      />
    </div>
  );
};

export default FarmsPage;

