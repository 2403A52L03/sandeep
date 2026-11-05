import React, { useState, useEffect } from 'react';
import { 
  TestTube2, 
  Radio, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  Filter, 
  Activity, 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate, formatDateTime } from '../../utils/formatters';

const MonitoringPage = () => {
  const [activeTab, setActiveTab] = useState('soil'); // 'soil' or 'environment'
  const [soilObservations, setSoilObservations] = useState([]);
  const [environmentalReadings, setEnvironmentalReadings] = useState([]);
  const [trends, setTrends] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Form State for Soil Observation
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [soilForm, setSoilForm] = useState({
    farm_id: '',
    plot_id: '',
    crop_id: '',
    observation_date: new Date().toISOString().split('T')[0],
    soil_moisture: '40.0',
    soil_temperature: '25.0',
    soil_ph: '6.8',
    nitrogen: '210',
    phosphorus: '45',
    potassium: '180',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      const [soilRes, envRes, trendRes, farmsRes, plotsRes, cropsRes] = await Promise.all([
        api.get('/monitoring/soil'),
        api.get('/monitoring/environment'),
        api.get('/monitoring/trends'),
        api.get('/farms'),
        api.get('/plots'),
        api.get('/crops')
      ]);

      if (soilRes.data.success) setSoilObservations(soilRes.data.data);
      if (envRes.data.success) setEnvironmentalReadings(envRes.data.data);
      if (trendRes.data.success) setTrends(trendRes.data.data);
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
    fetchMonitoringData();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.post('/monitoring/environment/simulate', {});
      await fetchMonitoringData();
    } catch (err) {
      alert('Error triggering simulation: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenAddSoil = () => {
    setSoilForm({
      farm_id: farms.length > 0 ? farms[0].id : '',
      plot_id: plots.length > 0 ? plots[0].id : '',
      crop_id: crops.length > 0 ? crops[0].id : '',
      observation_date: new Date().toISOString().split('T')[0],
      soil_moisture: '42.0',
      soil_temperature: '26.0',
      soil_ph: '6.8',
      nitrogen: '220',
      phosphorus: '45',
      potassium: '180',
      notes: ''
    });
    setFormError('');
    setIsSoilModalOpen(true);
  };

  const handleSubmitSoil = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/monitoring/soil', soilForm);
      setIsSoilModalOpen(false);
      fetchMonitoringData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error recording observation');
    } finally {
      setSubmitting(false);
    }
  };

  const soilColumns = [
    {
      header: 'Date & Recorder',
      accessor: 'observation_date',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{formatDate(row.observation_date)}</span>
          <p className="text-[11px] text-slate-400">By: {row.recorder_name || 'Agronomist'}</p>
        </div>
      )
    },
    {
      header: 'Farm & Plot',
      accessor: 'farm_name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.farm_name}</span>
          <p className="text-[11px] text-slate-500">{row.plot_name} · {row.crop_name || 'General Plot'}</p>
        </div>
      )
    },
    {
      header: 'Moisture (%)',
      accessor: 'soil_moisture',
      render: (row) => {
        const val = parseFloat(row.soil_moisture);
        const isLow = val < 30;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
            isLow ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {val}%
          </span>
        );
      }
    },
    {
      header: 'Temp (°C)',
      accessor: 'soil_temperature',
      render: (row) => <span className="font-mono text-slate-700">{row.soil_temperature}°C</span>
    },
    {
      header: 'pH Level',
      accessor: 'soil_ph',
      render: (row) => {
        const ph = parseFloat(row.soil_ph);
        const isAlert = ph < 6.0 || ph > 7.8;
        return (
          <span className={`font-mono font-bold ${isAlert ? 'text-amber-600' : 'text-slate-800'}`}>
            {ph} {isAlert && '⚠️'}
          </span>
        );
      }
    },
    {
      header: 'NPK Profile (mg/kg)',
      accessor: 'nitrogen',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          N:{row.nitrogen} · P:{row.phosphorus} · K:{row.potassium}
        </span>
      )
    },
    {
      header: 'Agronomic Notes',
      accessor: 'notes',
      render: (row) => (
        <p className="text-[11px] text-slate-500 max-w-xs truncate">{row.notes || 'Normal condition'}</p>
      )
    }
  ];

  const envColumns = [
    {
      header: 'Timestamp',
      accessor: 'recorded_at',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{formatDateTime(row.recorded_at)}</span>
          <div className="mt-0.5">
            <span className="inline-block text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
              {row.data_source || 'Simulated (Demo)'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Telemetry Source',
      accessor: 'farm_name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.farm_name}</span>
          <p className="text-[11px] text-slate-400">{row.plot_name}</p>
        </div>
      )
    },
    {
      header: 'Temperature',
      accessor: 'temperature',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 flex items-center">
          <Thermometer className="w-3.5 h-3.5 text-amber-500 mr-1" />
          {row.temperature}°C
        </span>
      )
    },
    {
      header: 'Humidity',
      accessor: 'humidity',
      render: (row) => (
        <span className="font-mono text-slate-700 flex items-center">
          <Droplets className="w-3.5 h-3.5 text-sky-500 mr-1" />
          {row.humidity}%
        </span>
      )
    },
    {
      header: 'Rainfall',
      accessor: 'rainfall',
      render: (row) => (
        <span className="font-mono text-slate-700 flex items-center">
          <CloudRain className="w-3.5 h-3.5 text-blue-500 mr-1" />
          {row.rainfall} mm
        </span>
      )
    },
    {
      header: 'Wind Speed',
      accessor: 'wind_speed',
      render: (row) => (
        <span className="font-mono text-slate-700 flex items-center">
          <Wind className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {row.wind_speed} km/h
        </span>
      )
    },
    {
      header: 'Soil Moisture',
      accessor: 'soil_moisture',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-700">
          {row.soil_moisture}%
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Simulation Compliance */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start space-x-2.5">
          <Radio className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded mr-2">
              Demo / Simulated Data Notice
            </span>
            <span>
              Environmental telemetry is generated via calibrated diurnal simulation models and stored directly in PostgreSQL. Modular schema allows instant live IoT hardware telemetry node connection.
            </span>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex-shrink-0 inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-md active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? 'Generating...' : 'Trigger Telemetry Pulse'}</span>
        </button>
      </div>

      {/* Header and Switch Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Soil & Environmental Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track root-zone soil chemistry and real-time microclimate observations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('soil')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'soil' ? 'bg-white text-forest-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Soil Observations
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'environment' ? 'bg-white text-forest-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sensor Streams
            </button>
          </div>

          {activeTab === 'soil' && (
            <button
              onClick={handleOpenAddSoil}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Observation</span>
            </button>
          )}
        </div>
      </div>

      {/* Historical Telemetry Trends Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Telemetry Time-Series Trends</h3>
            <p className="text-[11px] text-slate-500">Real-time chronologically sorted temperature, humidity, and soil moisture</p>
          </div>
          <Activity className="w-4 h-4 text-forest-700" />
        </div>

        <div className="h-64 w-full mt-3">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No telemetry readings logged yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp_label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="soil_moisture" name="Soil Moisture (%)" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : activeTab === 'soil' ? (
        <DataTable
          columns={soilColumns}
          data={soilObservations}
          searchPlaceholder="Search soil observations by date, farm, plot, or notes..."
        />
      ) : (
        <DataTable
          columns={envColumns}
          data={environmentalReadings}
          searchPlaceholder="Search environmental telemetry by timestamp, farm, or plot..."
        />
      )}

      {/* Add Soil Observation Modal */}
      <Modal
        isOpen={isSoilModalOpen}
        onClose={() => setIsSoilModalOpen(false)}
        title="Record Field Soil Observation"
        subtitle="Log laboratory soil sample results or handheld agronomic probe readings."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitSoil} className="space-y-4">
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
                value={soilForm.farm_id}
                onChange={(e) => setSoilForm({ ...soilForm, farm_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="">Select Farm</option>
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
                value={soilForm.plot_id}
                onChange={(e) => setSoilForm({ ...soilForm, plot_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 font-medium"
              >
                <option value="">Select Plot</option>
                {plots.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.farm_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Active Crop
              </label>
              <select
                value={soilForm.crop_id}
                onChange={(e) => setSoilForm({ ...soilForm, crop_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50"
              >
                <option value="">General Plot</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.crop_name} ({c.plot_name})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Observation Date *
              </label>
              <input
                type="date"
                required
                value={soilForm.observation_date}
                onChange={(e) => setSoilForm({ ...soilForm, observation_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Soil Moisture (0-100%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={soilForm.soil_moisture}
                onChange={(e) => setSoilForm({ ...soilForm, soil_moisture: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Soil Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={soilForm.soil_temperature}
                onChange={(e) => setSoilForm({ ...soilForm, soil_temperature: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Soil pH (0-14)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={soilForm.soil_ph}
                onChange={(e) => setSoilForm({ ...soilForm, soil_ph: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nitrogen (N)
              </label>
              <input
                type="number"
                value={soilForm.nitrogen}
                onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phosphorus (P)
              </label>
              <input
                type="number"
                value={soilForm.phosphorus}
                onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Potassium (K)
              </label>
              <input
                type="number"
                value={soilForm.potassium}
                onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Agronomic Observations / Recommendations
            </label>
            <textarea
              rows={2}
              value={soilForm.notes}
              onChange={(e) => setSoilForm({ ...soilForm, notes: e.target.value })}
              placeholder="e.g. Optimum moisture levels maintained in grain filling stage."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSoilModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Save Observation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MonitoringPage;
