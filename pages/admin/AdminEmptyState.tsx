import React from 'react';

type AdminEmptyStateProps = {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

/** Shared empty / zero state for admin panels. */
export const AdminEmptyState = ({
  title,
  hint,
  actionLabel,
  onAction,
  className = '',
}: AdminEmptyStateProps) => {
  return (
    <div
      className={`bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-10 text-center ${className}`}
    >
      <p className="text-slate-300 font-semibold mb-1">{title}</p>
      {hint && (
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">{hint}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
