import React from 'react';
import { BarChart3, Sparkles, Database, Layers } from 'lucide-react';

interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'table';
  height?: number;
  title?: string;
  isFullWidth?: boolean;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type = 'bar',
  height = 300,
  title,
  isFullWidth = false
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between animate-pulse ${
        isFullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'
      }`}
    >
      {/* Skeleton Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div className="space-y-2 w-2/3">
          {title ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 animate-spin text-indigo-500" />
                Querying...
              </span>
            </div>
          ) : (
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
          )}
          <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-3/4"></div>
        </div>

        {/* Skeleton Action Controls */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
        </div>
      </div>

      {/* Skeleton Visual Body depending on chart type */}
      <div
        className="my-auto py-2 flex flex-col items-center justify-between w-full relative overflow-hidden rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-4"
        style={{ height }}
      >
        {/* Shimmer overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 dark:via-indigo-500/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

        {type === 'bar' && (
          <div className="w-full h-full flex items-end justify-between gap-3 px-4 pt-6 pb-2">
            {[45, 75, 30, 90, 60, 80, 50, 65, 40, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600/80 via-indigo-500/50 to-indigo-400/30 dark:from-indigo-600 dark:via-indigo-500/40 dark:to-indigo-400/20 rounded-t-md transition-all duration-500"
                  style={{ height: `${h}%` }}
                ></div>
                <div className="w-3/4 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {type === 'line' && (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50 pb-1">
              <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="relative w-full h-3/4 flex items-center justify-center">
              {/* SVG Line Graph Skeleton Wave */}
              <svg className="w-full h-full text-indigo-500/40 dark:text-indigo-400/30" viewBox="0 0 400 120" preserveAspectRatio="none">
                <path
                  d="M0,80 Q50,20 100,70 T200,30 T300,90 T400,40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
                <path
                  d="M0,80 Q50,20 100,70 T200,30 T300,90 T400,40 L400,120 L0,120 Z"
                  fill="currentColor"
                  opacity="0.1"
                />
              </svg>
            </div>
            <div className="flex justify-between pt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        )}

        {type === 'pie' && (
          <div className="w-full h-full flex items-center justify-center gap-8 p-4">
            <div className="relative w-36 h-36 rounded-full border-8 border-indigo-500/30 dark:border-indigo-500/20 flex items-center justify-center border-t-indigo-600 border-r-emerald-500/40">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-500/40 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3 w-1/3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500/40"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'table' && (
          <div className="w-full h-full flex flex-col space-y-2">
            <div className="h-8 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-full flex items-center px-3 gap-4">
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="h-6 bg-slate-100 dark:bg-slate-800/40 rounded w-full flex items-center px-3 gap-4">
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Branded watermark */}
        <div className="mt-2 flex items-center justify-between w-full pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span>InsightBoard Engine</span>
          </div>
          <span>Evaluating sub-second query...</span>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Dashboard Top Toolbar Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800/60">
              <BarChart3 className="w-5 h-5 text-indigo-500 animate-pulse" />
            </div>
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-48"></div>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-64"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-9 w-28 bg-indigo-600/30 rounded-xl"></div>
        </div>
      </div>

      {/* Grid of Chart Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSkeleton type="bar" height={280} title="Revenue by Department" />
        <ChartSkeleton type="line" height={280} title="Monthly Growth Trends" />
        <ChartSkeleton type="pie" height={320} title="Market Share Breakdown" isFullWidth={true} />
      </div>
    </div>
  );
};

export const DataSourceSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800/60">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-indigo-950/60 border border-indigo-800/60 rounded-full"></div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              <div className="h-2 bg-indigo-500/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SqlExecutionSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* SQL Output Box Skeleton */}
      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div className="h-3 bg-slate-800 rounded w-32"></div>
          </div>
          <div className="h-6 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-2 py-1 font-mono">
          <div className="h-3 bg-indigo-950/80 rounded w-3/4"></div>
          <div className="h-3 bg-indigo-950/80 rounded w-1/2"></div>
        </div>
      </div>

      {/* Chart Preview Skeleton */}
      <ChartSkeleton type="bar" height={320} title="Query Result Visualization" isFullWidth={true} />
    </div>
  );
};
