import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sprout, ArrowLeft, Calendar, Clock, Droplets, TestTube2, Layers, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

const CropDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const res = await api.get(`/crops/${id}`);
        if (res.data.success) {
          setCrop(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCropDetails();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton count={3} height="h-32" />;
  }

  if (!crop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-base font-bold text-slate-800">Crop not found</h2>
        <button
          onClick={() => navigate('/crops')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-forest-800 text-white rounded-xl"
        >
          Back to Crops
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/crops')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{crop.crop_name}</span>
            <StatusBadge status={crop.status} />
          </h1>
          <p className="text-xs text-slate-500">
            Variety: <span className="font-semibold text-slate-700">{crop.variety || 'Hybrid'}</span> · {crop.crop_category} · {crop.farm_name} ({crop.plot_name})
          </p>
        </div>
      </div>

      {/* Calculated KPIs Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Growth Lifecycle</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-forest-800">{crop.growth_progress_percentage}%</span>
            <span className="text-xs text-slate-500">complete</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-fresh h-full rounded-full" style={{ width: `${crop.growth_progress_percentage}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Harvest Status</p>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
              crop.is_overdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {crop.harvest_status_label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Target: {formatDate(crop.expected_harvest_date)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cultivated Area</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{crop.cultivated_area} Acres</p>
          <p className="text-xs text-slate-500 mt-0.5">Plot total: {crop.plot_total_area} Acres</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yield Benchmark</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {crop.expected_yield ? `${crop.expected_yield} Qtl` : 'Not Set'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {crop.actual_yield ? `Actual: ${crop.actual_yield} Qtl (${crop.yield_variance_status})` : 'Pending harvest'}
          </p>
        </div>
      </div>

      {/* Observations and Irrigation Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Observations for this crop */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <TestTube2 className="w-4 h-4 text-forest-700" />
            <span>Soil Observations Log</span>
          </h3>

          <div className="mt-3 divide-y divide-slate-100">
            {!crop.soil_observations || crop.soil_observations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No soil observations recorded yet.</p>
            ) : (
              crop.soil_observations.map(obs => (
                <div key={obs.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{formatDate(obs.observation_date)}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">pH: {obs.soil_ph} · Temp: {obs.soil_temperature}°C</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{obs.soil_moisture}% Moisture</span>
                    <p className="text-[10px] text-slate-400">N:{obs.nitrogen} P:{obs.phosphorus} K:{obs.potassium}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Irrigation Events for this crop */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Irrigation Applications</span>
          </h3>

          <div className="mt-3 divide-y divide-slate-100">
            {!crop.irrigation_records || crop.irrigation_records.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No irrigation events logged.</p>
            ) : (
              crop.irrigation_records.map(irr => (
                <div key={irr.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{irr.irrigation_method} · {formatDate(irr.scheduled_date)}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Duration: {irr.duration_minutes} mins</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sky-700">{irr.water_quantity_litres?.toLocaleString()} L</span>
                    <div className="mt-0.5"><StatusBadge status={irr.status} /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetailsPage;
