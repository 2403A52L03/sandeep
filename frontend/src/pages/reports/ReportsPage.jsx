import React, { useState, useEffect } from 'react';
import { 
  FileBarChart2, 
  Download, 
  Printer, 
  Sprout, 
  ClipboardList, 
  Droplets, 
  TrendingUp, 
  Filter, 
  Calendar,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { exportToCSV, triggerPrint } from '../../utils/export';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('crop-monitoring'); // 'crop-monitoring', 'farm-activities', 'irrigation', 'yield'
  const [reportData, setReportData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');

  const fetchReport = async (reportType = activeReport, farmId = selectedFarm) => {
    setLoading(true);
    try {
      const farmParam = farmId ? `?farm_id=${farmId}` : '';
      const [repRes, farmsRes] = await Promise.all([
        api.get(`/reports/${reportType}${farmParam}`),
        api.get('/farms')
      ]);

      if (repRes.data.success) {
        setReportData(repRes.data.data);
        setMeta(repRes.data.meta || {});
      }
      if (farmsRes.data.success) setFarms(farmsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport, selectedFarm);
  }, [activeReport]);

  const handleFarmFilter = (e) => {
    const val = e.target.value;
    setSelectedFarm(val);
    fetchReport(activeReport, val);
  };

  const handleExportCSV = () => {
    exportToCSV(reportData, `${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Report A Columns: Crop-wise Monitoring Report
  const cropMonitoringColumns = [
    {
      header: 'Crop Name & Variety',
      accessor: 'crop_name',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.crop_name}</span>
          <p className="text-[11px] text-slate-500">{r.variety || 'Standard'} · {r.crop_category}</p>
        </div>
      )
    },
    {
      header: 'Farm Holding',
      accessor: 'farm_name',
      render: (r) => <span className="font-semibold text-forest-800">{r.farm_name}</span>
    },
    {
      header: 'Plot Sector',
      accessor: 'plot_name'
    },
    {
      header: 'Planting Date',
      accessor: 'planting_date',
      render: (r) => formatDate(r.planting_date)
    },
    {
      header: 'Crop Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Latest Soil Moisture',
      accessor: 'latest_soil_moisture',
      render: (r) => <span className="font-mono font-bold text-emerald-700">{r.latest_soil_moisture}</span>
    },
    {
      header: 'Ambient Temp',
      accessor: 'latest_temperature',
      render: (r) => <span className="font-mono text-slate-700">{r.latest_temperature}</span>
    },
    {
      header: 'Cultivation Progress',
      accessor: 'growth_progress',
      render: (r) => (
        <div className="flex items-center space-x-2 w-28">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-fresh h-full rounded-full" style={{ width: `${r.growth_progress}%` }} />
          </div>
          <span className="font-mono font-bold text-xs text-slate-800">{r.growth_progress}%</span>
        </div>
      )
    }
  ];

  // Report B Columns: Farm Activity Report
  const farmActivityColumns = [
    {
      header: 'Farm Name',
      accessor: 'farm_name',
      render: (r) => <span className="font-bold text-slate-900">{r.farm_name}</span>
    },
    {
      header: 'Activity Type',
      accessor: 'activity_type',
      render: (r) => <span className="font-semibold text-forest-800">{r.activity_type}</span>
    },
    {
      header: 'Date Executed',
      accessor: 'activity_date',
      render: (r) => formatDate(r.activity_date)
    },
    {
      header: 'Target Crop / Plot',
      accessor: 'crop_name',
      render: (r) => `${r.crop_name} (${r.plot_name})`
    },
    {
      header: 'Labour Hours',
      accessor: 'labour_hours',
      render: (r) => <span className="font-mono">{r.labour_hours} hrs</span>
    },
    {
      header: 'Cost (INR ₹)',
      accessor: 'cost',
      render: (r) => <span className="font-mono font-bold text-forest-800">{formatCurrency(r.cost)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Report C Columns: Irrigation Report
  const irrigationColumns = [
    {
      header: 'Farm Name',
      accessor: 'farm_name',
      render: (r) => <span className="font-bold text-slate-900">{r.farm_name}</span>
    },
    {
      header: 'Plot & Crop',
      accessor: 'plot_name',
      render: (r) => `${r.plot_name} · ${r.crop_name}`
    },
    {
      header: 'Irrigation Method',
      accessor: 'irrigation_method',
      render: (r) => (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
          {r.irrigation_method}
        </span>
      )
    },
    {
      header: 'Irrigation Date',
      accessor: 'irrigation_date',
      render: (r) => formatDate(r.irrigation_date)
    },
    {
      header: 'Water Delivered',
      accessor: 'water_quantity_litres',
      render: (r) => <span className="font-mono font-bold text-sky-800">{parseFloat(r.water_quantity_litres || 0).toLocaleString()} Litres</span>
    },
    {
      header: 'Duration',
      accessor: 'duration_minutes',
      render: (r) => <span className="font-mono">{r.duration_minutes} mins</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  // Report D Columns: Yield / Production Report
  const yieldColumns = [
    {
      header: 'Farm & Plot',
      accessor: 'farm_name',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900">{r.farm_name}</span>
          <p className="text-[11px] text-slate-500">{r.plot_name}</p>
        </div>
      )
    },
    {
      header: 'Crop Specimen',
      accessor: 'crop_name',
      render: (r) => (
        <div>
          <span className="font-bold text-forest-800">{r.crop_name}</span>
          <p className="text-[11px] text-slate-500">{r.variety || 'Var'} · {r.crop_category}</p>
        </div>
      )
    },
    {
      header: 'Acreage',
      accessor: 'cultivated_area',
      render: (r) => `${r.cultivated_area} Acres`
    },
    {
      header: 'Expected Yield',
      accessor: 'expected_yield',
      render: (r) => r.expected_yield ? `${r.expected_yield} ${r.yield_unit}` : 'Pending'
    },
    {
      header: 'Actual Yield',
      accessor: 'actual_yield',
      render: (r) => r.actual_yield ? <span className="font-bold text-slate-900">{r.actual_yield} ${r.yield_unit}</span> : 'In Cultivation'
    },
    {
      header: 'Production Difference',
      accessor: 'production_difference',
      render: (r) => (
        <span className={`font-mono font-bold ${
          r.production_status === 'Surplus' ? 'text-emerald-700' : r.production_status === 'Deficit' ? 'text-rose-700' : 'text-slate-600'
        }`}>
          {r.production_difference}
        </span>
      )
    },
    {
      header: 'Variance',
      accessor: 'variance_percentage',
      render: (r) => <span className="font-mono text-xs">{r.variance_percentage}</span>
    },
    {
      header: 'Harvest Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    }
  ];

  const reportTabs = [
    { id: 'crop-monitoring', label: 'A. Crop Monitoring', icon: Sprout, columns: cropMonitoringColumns },
    { id: 'farm-activities', label: 'B. Farm Activities', icon: ClipboardList, columns: farmActivityColumns },
    { id: 'irrigation', label: 'C. Irrigation Usage', icon: Droplets, columns: irrigationColumns },
    { id: 'yield', label: 'D. Yield & Production', icon: TrendingUp, columns: yieldColumns },
  ];

  const currentTab = reportTabs.find(t => t.id === activeReport);

  return (
    <div className="space-y-6 print-container">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Agricultural Reports & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            University evaluation audit reports derived strictly from authenticated PostgreSQL database records.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-forest-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-200/60 p-1 rounded-2xl">
          {reportTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeReport === tab.id
                    ? 'bg-white text-forest-900 shadow-md shadow-slate-200/60 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Farm Filter */}
        <div className="relative flex-shrink-0">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedFarm}
            onChange={handleFarmFilter}
            className="pl-9 pr-6 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="">All Farm Holdings</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Totals Cards for Active Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {activeReport === 'crop-monitoring' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Crops Reported</span>
            <p className="text-2xl font-extrabold text-forest-800 mt-1">{meta.total_crops_reported || reportData.length}</p>
          </div>
        )}

        {activeReport === 'farm-activities' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Activity Cost</span>
              <p className="text-2xl font-extrabold text-forest-800 mt-1">{formatCurrency(meta.total_cost || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cumulative Labour Hours</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{meta.total_labour_hours || 0} hrs</p>
            </div>
          </>
        )}

        {activeReport === 'irrigation' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Irrigation Water</span>
              <p className="text-2xl font-extrabold text-sky-800 mt-1">{parseFloat(meta.total_water_litres || 0).toLocaleString()} L</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Operating Run Time</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{meta.total_duration_hours || 0} hrs</p>
            </div>
          </>
        )}

        {activeReport === 'yield' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Expected Yield</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{meta.total_expected_yield || 0} Qtl</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Actual Yield</span>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">{meta.total_actual_yield || 0} Qtl</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Production Difference</span>
              <p className={`text-2xl font-extrabold mt-1 ${meta.net_variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {meta.net_variance >= 0 ? `+${meta.net_variance}` : meta.net_variance} Qtl
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Report Table */}
      {loading ? (
        <LoadingSkeleton count={5} height="h-16" />
      ) : (
        <DataTable
          columns={currentTab.columns}
          data={reportData}
          searchPlaceholder={`Search ${currentTab.label} records...`}
        />
      )}
    </div>
  );
};

export default ReportsPage;

