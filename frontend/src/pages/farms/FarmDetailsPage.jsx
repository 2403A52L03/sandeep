import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trees, ArrowLeft, Layers, Sprout, MapPin, Droplets, ClipboardList, Calendar } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/formatters';

const FarmDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        const res = await api.get(`/farms/${id}`);
        if (res.data.success) {
          setFarm(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmDetails();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton count={4} height="h-32" />;
  }

  if (!farm) {
    return (
      <div className="text-center py-12">
        <h2 className="text-base font-bold text-slate-800">Farm not found</h2>
        <button
          onClick={() => navigate('/farms')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-forest-800 text-white rounded-xl"
        >
          Back to Farms List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/farms')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{farm.name}</span>
          </h1>
          <p className="text-xs text-slate-500">{farm.village || farm.location}, {farm.district}, {farm.state}</p>
        </div>
      </div>

      {/* Farm Overview Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Holding Area</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{farm.total_area} {farm.area_unit}</p>
          <p className="text-xs text-slate-500 mt-0.5">Cadastral agricultural unit</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Soil Characterization</span>
          <p className="text-xl font-extrabold text-forest-700 mt-1">{farm.soil_type || 'Sandy Loam'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Root zone classification</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Plots</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{farm.plots?.length || 0} Plots</p>
          <p className="text-xs text-slate-500 mt-0.5">Subdivided blocks</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Owner</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{farm.owner_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{farm.owner_email}</p>
        </div>
      </div>

      {/* Associated Plots & Crops Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plots List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-forest-700" />
              <span>Zoned Agricultural Plots ({farm.plots?.length || 0})</span>
            </h3>
            <button
              onClick={() => navigate('/plots')}
              className="text-xs text-forest-700 hover:text-forest-900 font-semibold"
            >
              Manage Plots →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {farm.plots?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No plots configured on this farm.</p>
            ) : (
              farm.plots?.map(plot => (
                <div key={plot.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{plot.name}</h4>
                    <p className="text-[11px] text-slate-500">Irrigation: {plot.irrigation_type} · Soil: {plot.soil_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-700">{plot.area} {farm.area_unit}</span>
                    <p className="text-[11px] text-emerald-700 font-medium">{plot.active_crops_count || 0} active crops</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Crops List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Active Crops Cultivated ({farm.crops?.length || 0})</span>
            </h3>
            <button
              onClick={() => navigate('/crops')}
              className="text-xs text-forest-700 hover:text-forest-900 font-semibold"
            >
              View All Crops →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {farm.crops?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No crops cultivated on this farm.</p>
            ) : (
              farm.crops?.map(crop => (
                <div key={crop.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{crop.crop_name} ({crop.variety || 'Var'})</h4>
                    <p className="text-[11px] text-slate-500">Plot: {crop.plot_name} · Harvest: {formatDate(crop.expected_harvest_date)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={crop.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{crop.cultivated_area} {farm.area_unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log on this Farm */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center space-x-2">
          <ClipboardList className="w-4 h-4 text-forest-700" />
          <span>Recent Field Activities on {farm.name}</span>
        </h3>

        <div className="mt-3 divide-y divide-slate-100">
          {farm.recent_activities?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No field activities recorded for this farm.</p>
          ) : (
            farm.recent_activities?.map(act => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{act.activity_type}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-slate-600">{act.plot_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-forest-800">{formatCurrency(act.cost)}</span>
                  <p className="text-[10px] text-slate-400">{formatDate(act.activity_date)} · {act.labour_hours}h</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsPage;
