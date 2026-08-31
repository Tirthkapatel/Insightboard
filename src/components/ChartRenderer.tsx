import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChartType, QueryResult } from '../types.js';
import { ChartSkeleton } from './Skeletons.js';

interface ChartRendererProps {
  type: ChartType;
  result: QueryResult | null;
  height?: number;
  loading?: boolean;
}

const COLOR_PALETTE = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#0284c7', // Sky
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#6366f1', // Blue Violet
  '#f59e0b', // Amber bright
  '#10b981', // Emerald bright
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4'  // Cyan
];

const truncateLabel = (value: any, maxLen = 12) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.length > maxLen) {
    return str.slice(0, maxLen - 1) + '…';
  }
  return str;
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({ type, result, height = 300, loading = false }) => {
  if (loading) {
    return <ChartSkeleton type={type} height={height} />;
  }

  if (!result || !result.rows || result.rows.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center"
        style={{ height }}
      >
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No chart data available</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Execute a query to visualize data or select a valid dataset.
        </p>
      </div>
    );
  }

  const { columns, rows } = result;
  const xKey = columns[0];
  const yKey = columns[1] || columns[0];

  const rowCount = rows.length;
  const isLargeDataset = rowCount > 10;
  const maxLabelLen = isLargeDataset ? 10 : 14;
  const bottomMargin = isLargeDataset ? 75 : 45;

  if (type === 'bar') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 15, right: 20, left: 0, bottom: bottomMargin }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis
              dataKey={xKey}
              type="category"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={0}
              angle={-55}
              textAnchor="end"
              tickFormatter={(val) => truncateLabel(val, maxLabelLen)}
              dy={6}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              labelFormatter={(label) => `${xKey}: ${label}`}
            />
            <Bar
              dataKey={yKey}
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
              maxBarSize={rowCount > 15 ? 24 : rowCount > 10 ? 32 : 40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 15, right: 20, left: 0, bottom: bottomMargin }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis
              dataKey={xKey}
              type="category"
              padding={{ left: 15, right: 15 }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={rowCount > 15 ? 0 : 0}
              angle={-55}
              textAnchor="end"
              tickFormatter={(val) => truncateLabel(val, maxLabelLen)}
              dy={6}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              labelFormatter={(label) => `${xKey}: ${label}`}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: rowCount > 15 ? 3.5 : 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    const totalY = rows.reduce((acc, row) => acc + (Number(row[yKey]) || 0), 0);

    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="45%"
              outerRadius={rowCount > 12 ? 80 : 95}
              innerRadius={rowCount > 12 ? 38 : 45}
              paddingAngle={2}
              label={false}
            >
              {rows.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              formatter={(val: any) => {
                const numVal = Number(val) || 0;
                const pct = totalY > 0 ? ((numVal / totalY) * 100).toFixed(1) : 0;
                return [`${numVal} (${pct}%)`, yKey];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={rowCount > 12 ? 55 : 36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '11px',
                maxHeight: rowCount > 12 ? '55px' : '36px',
                overflowY: 'auto',
                paddingTop: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback: Data Table view
  return (
    <div style={{ height }} className="overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2.5">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              {columns.map((col, cIdx) => (
                <td key={cIdx} className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                  {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
