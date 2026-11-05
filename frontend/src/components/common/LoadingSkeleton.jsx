import React from 'react';

export const LoadingSkeleton = ({ count = 3, height = 'h-24' }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200/70 rounded-2xl ${height} w-full`} />
      ))}
    </div>
  );
};

export const EmptyState = ({ title = 'No Data Available', message = 'No records have been registered yet.', onAction, actionLabel, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4 shadow-sm">
        {Icon ? <Icon className="w-7 h-7" /> : <span className="text-2xl">🌱</span>}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{message}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest-800 text-white hover:bg-forest-900 shadow-md shadow-forest-900/10 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default { LoadingSkeleton, EmptyState };
