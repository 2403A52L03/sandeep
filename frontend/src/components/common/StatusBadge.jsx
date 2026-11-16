import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const statusMap = {
    // Crop Lifecycle
    'Planned': 'bg-slate-100 text-slate-700 border-slate-300',
    'Planted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Growing': 'bg-lime-50 text-lime-800 border-lime-300',
    'Flowering': 'bg-teal-50 text-teal-700 border-teal-200',
    'Maturing': 'bg-amber-50 text-amber-800 border-amber-300',
    'Ready for Harvest': 'bg-orange-50 text-orange-800 border-orange-300 font-bold animate-pulse',
    'Harvested': 'bg-forest-100 text-forest-800 border-forest-300',
    'Failed': 'bg-rose-50 text-rose-700 border-rose-300',

    // Irrigation & Activity Status
    'Scheduled': 'bg-sky-50 text-sky-700 border-sky-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
    'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-slate-100 text-slate-500 border-slate-200',

    // Production status
    'Surplus': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    'Deficit': 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
    'On Target': 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
  };

  const badgeStyle = statusMap[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

