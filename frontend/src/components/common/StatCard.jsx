import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'forest', subtitle, trend }) => {
  const colorStyles = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    fresh: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const iconColors = {
    forest: 'bg-forest-700 text-white shadow-forest-700/20',
    fresh: 'bg-emerald-600 text-white shadow-emerald-600/20',
    amber: 'bg-amber-600 text-white shadow-amber-600/20',
    rose: 'bg-rose-600 text-white shadow-rose-600/20',
    indigo: 'bg-indigo-600 text-white shadow-indigo-600/20',
    sky: 'bg-sky-600 text-white shadow-sky-600/20',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${iconColors[color] || iconColors.forest}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

