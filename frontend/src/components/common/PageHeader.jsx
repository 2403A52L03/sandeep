import React from 'react';

const PageHeader = ({ title, subtitle, actionLabel, onAction, actionIcon: ActionIcon }) => {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white font-semibold text-sm hover:bg-forest-900 shadow-md shadow-forest-900/10 active:scale-95 transition-all"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default PageHeader;

