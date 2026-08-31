import React, { useState } from 'react';
import { DataSource } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Database,
  Upload,
  Server,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Table,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';

interface DataSourceManagerProps {
  dataSources: DataSource[];
  onRefreshDataSources: () => Promise<void>;
  onNavigateToQueryBuilder: () => void;
}

export const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  dataSources,
  onRefreshDataSources,
  onNavigateToQueryBuilder
}) => {
  const { token } = useAuth();
  const [selectedDsId, setSelectedDsId] = useState<string>(dataSources[0]?.id || '');
  const activeDs = dataSources.find((ds) => ds.id === selectedDsId) || dataSources[0];

  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // DB Connection Form State
  const [connName, setConnName] = useState<string>('Production Postgres DB');
  const [host, setHost] = useState<string>('db.university.edu');
  const [port, setPort] = useState<number>(5432);
  const [user, setUser] = useState<string>('postgres_admin');
  const [database, setDatabase] = useState<string>('college_bi_db');
  const [engine, setEngine] = useState<'postgres' | 'mysql'>('postgres');
  const [connLoading, setConnLoading] = useState<boolean>(false);
  const [connMsg, setConnMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const csvText = await file.text();

      const res = await fetch('/api/datasources/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fileName: file.name,
          csvText
        })
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess(`Dataset '${file.name}' uploaded! Schema auto-detected and stored.`);
        await onRefreshDataSources();
        if (data.dataSource) setSelectedDsId(data.dataSource.id);
      } else {
        setUploadError(data.error || 'Failed to process CSV file.');
      }
    } catch (err: any) {
      setUploadError('Failed to read CSV file.');
    } finally {
      setUploading(false);
    }
  };

  const handleConnectDbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnLoading(true);
    setConnMsg(null);

    try {
      const res = await fetch('/api/datasources/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: connName,
          host,
          port,
          user,
          database,
          engine
        })
      });

      const data = await res.json();

      if (res.ok) {
        setConnMsg(`Successfully connected to ${engine.toUpperCase()} database '${database}'.`);
        await onRefreshDataSources();
        if (data.dataSource) setSelectedDsId(data.dataSource.id);
      } else {
        setConnMsg(data.error || 'Failed to connect database.');
      }
    } catch (err) {
      setConnMsg('Network error connecting database.');
    } finally {
      setConnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Data Source & Schema Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload CSV files to parse dynamic tables into SQLite or configure external database connections.
          </p>
        </div>

        <button
          onClick={onNavigateToQueryBuilder}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Query Active Dataset</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Source List + Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* CSV File Drag & Drop Upload */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              1. Upload CSV Dataset
            </h3>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <FileSpreadsheet className="w-8 h-8 text-indigo-500 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {uploading ? 'Parsing CSV & Creating SQL Table...' : 'Click or Drag CSV File to Upload'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Auto-detects data types (date, number, category, text) & creates dynamic SQL table
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* External DB Connection Form */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              2. Connect External Database
            </h3>

            {connMsg && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 rounded-lg">
                {connMsg}
              </div>
            )}

            <form onSubmit={handleConnectDbSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Database Engine
                  </label>
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Host Address
                  </label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    required
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={connLoading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors border border-slate-700"
              >
                {connLoading ? 'Testing Connection...' : 'Test & Save DB Connection'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Schema Inspector & Sample Rows */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Data Source Inspector
                </label>
                <select
                  value={selectedDsId}
                  onChange={(e) => setSelectedDsId(e.target.value)}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white"
                >
                  {dataSources.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {activeDs && (
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {activeDs.rowCount} Records
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Table: {activeDs.tableName}
                  </span>
                </div>
              )}
            </div>

            {/* Schema Table */}
            {activeDs && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Auto-Detected Column Schema ({activeDs.schema.length} columns)
                </h4>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Column Name</th>
                        <th className="px-4 py-2.5">Detected Type</th>
                        <th className="px-4 py-2.5">Unique Count</th>
                        <th className="px-4 py-2.5">Sample Values</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {activeDs.schema.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-2 font-mono font-semibold text-slate-900 dark:text-white">
                            {col.name}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                col.type === 'number'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : col.type === 'category'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : col.type === 'date'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {col.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-mono">{col.uniqueCount}</td>
                          <td className="px-4 py-2 font-mono text-slate-500 truncate max-w-xs">
                            {col.sampleValues.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
