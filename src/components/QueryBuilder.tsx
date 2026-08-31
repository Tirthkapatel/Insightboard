import React, { useState, useEffect } from 'react';
import {
  DataSource,
  QueryConfig,
  QueryResult,
  ChartSuggestion,
  FilterCondition,
  ChartType,
  Dashboard
} from '../types.js';
import { ChartRenderer } from './ChartRenderer.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Play,
  Sparkles,
  Copy,
  Plus,
  Trash2,
  Check,
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Table as TableIcon,
  Save,
  Clock,
  Layers,
  Database
} from 'lucide-react';

interface QueryBuilderProps {
  dataSources: DataSource[];
  dashboards: Dashboard[];
  onSaveChartToDashboard: (chartTitle: string, queryConfig: QueryConfig, dashboardId: string) => Promise<void>;
  onNavigateToDataSources: () => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  dataSources,
  dashboards,
  onSaveChartToDashboard,
  onNavigateToDataSources
}) => {
  const { token } = useAuth();
  const [selectedDsId, setSelectedDsId] = useState<string>(dataSources[0]?.id || '');
  const activeDs = dataSources.find((ds) => ds.id === selectedDsId) || dataSources[0];

  const schema = activeDs?.schema || [];

  const defaultX = schema.find((s) => s.type === 'category' || s.type === 'text' || s.type === 'date')?.name || schema[0]?.name || '';
  const defaultY = schema.find((s) => s.type === 'number')?.name || schema[0]?.name || '';

  const [xAxis, setXAxis] = useState<string>(defaultX);
  const [yAxis, setYAxis] = useState<string>(defaultY);
  const [aggregation, setAggregation] = useState<'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN'>('AVG');
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [limit, setLimit] = useState<number>(20);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [chartSuggestion, setChartSuggestion] = useState<ChartSuggestion | null>(null);

  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add to Dashboard Modal state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [chartTitle, setChartTitle] = useState<string>('');
  const [targetDashId, setTargetDashId] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Update defaults when active datasource changes
  useEffect(() => {
    if (activeDs && activeDs.schema.length > 0) {
      const catCol = activeDs.schema.find((s) => s.type === 'category' || s.type === 'text' || s.type === 'date')?.name || activeDs.schema[0].name;
      const numCol = activeDs.schema.find((s) => s.type === 'number')?.name || activeDs.schema[0].name;
      setXAxis(catCol);
      setYAxis(numCol);
      setFilters([]);
    }
  }, [selectedDsId]);

  // Request Auto-Chart Suggestion whenever fields change
  useEffect(() => {
    async function fetchSuggestion() {
      if (!xAxis || !yAxis || schema.length === 0) return;
      try {
        const res = await fetch('/api/query/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ schema, xAxis, yAxis, aggregation })
        });
        if (res.ok) {
          const data = await res.json();
          setChartSuggestion(data.suggestion);
          setSelectedChartType(data.suggestion.recommendedType);
        }
      } catch (err) {
        console.error('Failed to fetch chart suggestion:', err);
      }
    }
    fetchSuggestion();
  }, [selectedDsId, xAxis, yAxis, aggregation]);

  // Execute Initial Query
  useEffect(() => {
    if (activeDs && xAxis && yAxis) {
      handleExecuteQuery();
    }
  }, [selectedDsId]);

  const handleExecuteQuery = async () => {
    if (!activeDs || !xAxis || !yAxis) return;
    setLoading(true);
    setError(null);

    const queryConfig: QueryConfig = {
      dataSourceId: activeDs.id,
      tableName: activeDs.tableName,
      xAxis,
      yAxis,
      aggregation,
      filters,
      chartType: selectedChartType,
      limit,
      sortOrder
    };

    try {
      const res = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(queryConfig)
      });
      const data = await res.json();

      if (res.ok) {
        setQueryResult(data.result);
      } else {
        setError(data.error || 'Query execution failed.');
      }
    } catch (err: any) {
      setError('Network error while executing query.');
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => {
    if (schema.length === 0) return;
    const firstCol = schema[0].name;
    setFilters([
      ...filters,
      { id: `f_${Date.now()}`, column: firstCol, operator: '=', value: '' }
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterCondition, val: any) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  const handleCopySql = () => {
    if (queryResult?.sql) {
      navigator.clipboard.writeText(queryResult.sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleOpenSaveModal = () => {
    setChartTitle(`${aggregation} of ${yAxis} by ${xAxis}`);
    if (dashboards.length > 0) {
      setTargetDashId(dashboards[0].id);
    }
    setShowSaveModal(true);
  };

  const handleConfirmSaveToDashboard = async () => {
    if (!activeDs) return;
    const currentConfig: QueryConfig = {
      dataSourceId: activeDs.id,
      tableName: activeDs.tableName,
      xAxis,
      yAxis,
      aggregation,
      filters,
      chartType: selectedChartType,
      limit,
      sortOrder
    };

    await onSaveChartToDashboard(chartTitle, currentConfig, targetDashId);
    setSaveSuccessMsg('Chart added to dashboard successfully!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setShowSaveModal(false);
    }, 1500);
  };

  if (dataSources.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-8">
        <div className="w-full max-w-lg p-10 sm:p-14 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-600 dark:text-indigo-400">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Data Sources Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
            Upload a CSV dataset or connect a database first before building queries.
          </p>
          <button
            onClick={onNavigateToDataSources}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <span>Go to Data Sources</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            No-Code Visual Query Builder
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select dimensions, metrics, and aggregations to generate and execute real SQL queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExecuteQuery}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'Executing...' : 'Run SQL Query'}
          </button>

          <button
            onClick={handleOpenSaveModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            Save to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Data Source Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Select Data Source / Table
            </label>
            <select
              value={selectedDsId}
              onChange={(e) => setSelectedDsId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* X-Axis Dimension */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. X-Axis (Dimension / Category)
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {schema.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Y-Axis Metric + Aggregation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                3. Y-Axis (Metric)
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {schema.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Aggregation
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="SUM">SUM</option>
                <option value="AVG">AVG</option>
                <option value="COUNT">COUNT</option>
                <option value="MAX">MAX</option>
                <option value="MIN">MIN</option>
              </select>
            </div>
          </div>

          {/* Filters Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                4. Filter Conditions ({filters.length})
              </label>
              <button
                type="button"
                onClick={addFilter}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Filter
              </button>
            </div>

            {filters.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active filters applied.</p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2">
                    <select
                      value={filter.column}
                      onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                      className="w-1/3 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                    >
                      {schema.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value as any)}
                      className="w-1/4 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="LIKE">LIKE</option>
                    </select>

                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-1/3 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                    />

                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart Type Selector + Auto Suggestion */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                5. Chart Type Selector
              </label>
              {chartSuggestion && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Auto-Suggested
                </span>
              )}
            </div>

            {chartSuggestion && (
              <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Reasoning: </span>
                {chartSuggestion.reason}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedChartType('bar')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedChartType === 'bar'
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Bar</span>
              </button>

              <button
                onClick={() => setSelectedChartType('line')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedChartType === 'line'
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Line</span>
              </button>

              <button
                onClick={() => setSelectedChartType('pie')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedChartType === 'pie'
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <PieIcon className="w-4 h-4" />
                <span>Pie</span>
              </button>

              <button
                onClick={() => setSelectedChartType('table')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedChartType === 'table'
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Column (Right: SQL Code + Chart Preview) */}
        <div className="lg:col-span-7 space-y-5">
          {/* SQL Output Box */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Generated SQL Query
              </span>

              <div className="flex items-center gap-3">
                {queryResult && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {queryResult.executionTimeMs}ms ({queryResult.rowCount} rows)
                  </span>
                )}

                <button
                  onClick={handleCopySql}
                  disabled={!queryResult?.sql}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSql ? 'Copied' : 'Copy SQL'}
                </button>
              </div>
            </div>

            <pre className="text-indigo-300 whitespace-pre-wrap overflow-x-auto leading-relaxed py-1">
              {queryResult?.sql || '-- Select parameters and click Run SQL Query to generate SQL --'}
            </pre>
          </div>

          {/* Chart Canvas Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                Visualization Preview ({selectedChartType} Chart)
              </h3>
            </div>

            {error ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            ) : (
              <ChartRenderer type={selectedChartType} result={queryResult} height={320} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Save to Dashboard Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-indigo-600" />
              Add Chart to Dashboard
            </h3>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
                {saveSuccessMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chart Title
              </label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Target Dashboard
              </label>
              <select
                value={targetDashId}
                onChange={(e) => setTargetDashId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              >
                {dashboards.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveToDashboard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
