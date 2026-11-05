import React, { useState, useEffect } from 'react';
import { 
  Trees, 
  Grid3X3, 
  Sprout, 
  Clock, 
  Droplets, 
  AlertTriangle, 
  Filter, 
  Activity, 
  RefreshCw,
  TrendingUp,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton, EmptyState } from '../../components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PIE_COLORS = ['#166534', '#22c55e', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [cropDistribution, setCropDistribution] = useState([]);
  const [monthlyActivities, setMonthlyActivities] = useState([]);
  const [soilTrends, setSoilTrends] = useState([]);
  const [irrigationTrends, setIrrigationTrends] = useState([]);
  const [cropProgress, setCropProgress] = useState([]);

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      if (res.data.success) {
        setFarms(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    }
  };

  const fetchDashboardData = async (farmId = selectedFarm) => {
    try {
      const farmParam = farmId ? `?farm_id=${farmId}` : '';
      const [sumRes, cropDistRes, actRes, soilRes, irrRes, progRes] = await Promise.all([
        api.get(`/dashboard/summary${farmParam}`),
        api.get(`/dashboard/crop-distribution${farmParam}`),
        api.get(`/dashboard/monthly-activity${farmParam}`),
        api.get(`/dashboard/soil-trends${farmParam}`),
        api.get(`/dashboard/irrigation-trends${farmParam}`),
        api.get(`/dashboard/crop-progress${farmParam}`)
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (cropDistRes.data.success) setCropDistribution(cropDistRes.data.data);
      if (actRes.data.success) setMonthlyActivities(actRes.data.data);
      if (soilRes.data.success) setSoilTrends(soilRes.data.data);
      if (irrRes.data.success) setIrrigationTrends(irrRes.data.data);
      if (progRes.data.success) setCropProgress(progRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarms();
    fetchDashboardData();
  }, []);

  const handleFarmFilterChange = (e) => {
    const val = e.target.value;
    setSelectedFarm(val);
    setLoading(true);
    fetchDashboardData(val);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(selectedFarm);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <LoadingSkeleton count={6} height="h-28" />
        </div>
        <LoadingSkeleton count={3} height="h-64" />
      </div>
    );
  }

  const kpi = summary?.kpi || {};
  const widgets = summary?.widgets || {};

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Farm Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Farm Operations & Analytics</span>
            <span className="text-xs bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded-full border border-forest-300">
              Live DB
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time farm status, vegetative growth indices, soil chemistry, and automated irrigation telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Farm Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedFarm}
              onChange={handleFarmFilterChange}
              className="pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent cursor-pointer"
            >
              <option value="">All Farms (Consolidated)</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-forest-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Key Performance Indicator (KPI) Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Farms"
          value={kpi.total_farms || 0}
          icon={Trees}
          color="forest"
          subtitle="Registered holdings"
        />
        <StatCard
          title="Agri Plots"
          value={kpi.total_plots || 0}
          icon={Grid3X3}
          color="sky"
          subtitle="Zoned cultivation units"
        />
        <StatCard
          title="Active Crops"
          value={kpi.active_crops || 0}
          icon={Sprout}
          color="fresh"
          subtitle="Under cultivation"
        />
        <StatCard
          title="Near Harvest"
          value={kpi.crops_near_harvest || 0}
          icon={Clock}
          color="amber"
          subtitle="Due within 20 days"
        />
        <StatCard
          title="Irrigations"
          value={kpi.irrigation_activities || 0}
          icon={Droplets}
          color="indigo"
          subtitle={`${kpi.total_water_usage_litres?.toLocaleString() || 0} L applied`}
        />
        <StatCard
          title="Telemetry Alerts"
          value={kpi.environmental_alerts_count || 0}
          icon={AlertTriangle}
          color={kpi.environmental_alerts_count > 0 ? 'rose' : 'forest'}
          subtitle="Active sensor warnings"
        />
      </div>

      {/* Primary Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Crop-wise Distribution (Pie Chart) - 5 cols */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Crop Area Distribution</h3>
              <p className="text-[11px] text-slate-500">Acreage breakdown by active crop variety</p>
            </div>
            <Sprout className="w-4 h-4 text-forest-700" />
          </div>

          <div className="h-64 w-full mt-3 flex items-center justify-center">
            {cropDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No crop acreage recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    dataKey="total_area"
                    nameKey="crop_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {cropDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`${val} Acres`, 'Cultivated Area']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Monthly Farm Activities & Costs (Bar Chart) - 7 cols */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Farm Activities & Costs</h3>
              <p className="text-[11px] text-slate-500">Operation frequency and total labor/input expenses (₹)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full mt-3">
            {monthlyActivities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity logs available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivities} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val, name) => [name === 'total_cost' ? formatCurrency(val) : val, name === 'total_cost' ? 'Total Cost' : 'Activity Count']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="activity_count" name="Activities" fill="#166534" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="total_cost" name="Cost (₹)" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Analytics Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Soil Moisture & Temperature Trends (Line Chart) - 6 cols */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Soil Moisture & Chemistry Trends</h3>
              <p className="text-[11px] text-slate-500">Historical moisture (%) and pH telemetry</p>
            </div>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full mt-3">
            {soilTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No soil observation records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={soilTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="soil_moisture" name="Moisture %" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="soil_temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Irrigation Water Usage (Area Chart) - 6 cols */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Irrigation Consumption Volume</h3>
              <p className="text-[11px] text-slate-500">Water quantity delivered in Litres by scheduled date</p>
            </div>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>

          <div className="h-64 w-full mt-3">
            {irrigationTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No irrigation logs recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={irrigationTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val) => [`${val.toLocaleString()} L`, 'Water Delivered']}
                  />
                  <Area type="monotone" dataKey="total_litres" name="Water (Litres)" stroke="#0284c7" fillOpacity={1} fill="url(#waterColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 5 & Dashboard Widgets Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 5: Crop Cultivation Growth Progress (Horizontal Bars) - 6 cols */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Crop Cultivation Lifecycle Progress</h3>
              <p className="text-[11px] text-slate-500">Elapsed days / cultivation duration ratio (0–100%)</p>
            </div>
            <Sprout className="w-4 h-4 text-forest-700" />
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {cropProgress.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No active crop growth data.</p>
            ) : (
              cropProgress.map((crop, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{crop.crop_name}</span>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={crop.status} />
                      <span className="font-mono font-bold text-slate-700">{crop.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-forest-700 to-fresh h-full rounded-full transition-all duration-500"
                      style={{ width: `${crop.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 1: Upcoming Harvests & Near Harvest Crops - 6 cols */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Crops Approaching Harvest</h3>
              <p className="text-[11px] text-slate-500">Scheduled harvest dates and urgent picking deadlines</p>
            </div>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>

          <div className="mt-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {!widgets.upcoming_harvests || widgets.upcoming_harvests.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No crops immediately due for harvest.</p>
            ) : (
              widgets.upcoming_harvests.map(crop => (
                <div key={crop.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{crop.crop_name} ({crop.variety || 'Hybrid'})</h4>
                    <p className="text-[11px] text-slate-500">{crop.farm_name} · {crop.plot_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      crop.is_overdue ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {crop.harvest_label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Due: {formatDate(crop.expected_harvest_date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Widgets Row 4: Recent Activities & Environmental Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget 2: Recent Farm Activities - 7 cols */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Farm Operations & Field Activities</h3>
              <p className="text-[11px] text-slate-500">Logged cultivation tasks, labor hours, and input costs</p>
            </div>
            <Layers className="w-4 h-4 text-forest-700" />
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {!widgets.recent_activities || widgets.recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No farm activities logged recently.</p>
            ) : (
              widgets.recent_activities.map(act => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{act.activity_type}</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-slate-600">{act.crop_name || 'Plot Wide'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">{act.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-forest-800">{formatCurrency(act.cost)}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(act.activity_date)} · {act.labour_hours}h labor</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Active Environmental Alerts - 5 cols */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Active Sensor & Environmental Alerts</h3>
              <p className="text-[11px] text-slate-500">Threshold alerts evaluated from sensor streams</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>

          <div className="mt-3 space-y-2.5">
            {!widgets.environmental_alerts || widgets.environmental_alerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-200">
                🌱 All sensor telemetry currently within optimal agronomic thresholds.
              </div>
            ) : (
              widgets.environmental_alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs ${
                  alert.severity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{alert.parameter} Alert</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{alert.farm_name} · {alert.plot_name}</p>
                    </div>
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

export default DashboardPage;
