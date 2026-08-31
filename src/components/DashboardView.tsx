import React, { useState, useEffect, useRef } from 'react';
import { Dashboard, DashboardChart, QueryResult, DashboardShare } from '../types.js';
import { ChartRenderer } from './ChartRenderer.js';
import { ChartSkeleton } from './Skeletons.js';
import { useAuth } from '../context/AuthContext.js';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  LayoutDashboard,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  BarChart2,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Share2
} from 'lucide-react';

interface DashboardViewProps {
  dashboards: Dashboard[];
  activeDashboardId: string;
  onSelectDashboard: (id: string) => void;
  onCreateDashboard: (title: string, description: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteDashboard: (id: string) => Promise<void>;
  onUpdateDashboardCharts: (dashboardId: string, updatedCharts: DashboardChart[]) => Promise<void>;
  onNavigateToQueryBuilder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dashboards,
  activeDashboardId,
  onSelectDashboard,
  onCreateDashboard,
  onDeleteDashboard,
  onUpdateDashboardCharts,
  onNavigateToQueryBuilder
}) => {
  const { token, user } = useAuth();
  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId) || dashboards[0];
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [chartResults, setChartResults] = useState<Record<string, QueryResult>>({});
  const [loadingCharts, setLoadingCharts] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // New Dashboard Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // Share / Manage Access Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareEmail, setShareEmail] = useState<string>('');
  const [shareRole, setShareRole] = useState<'viewer' | 'admin'>('viewer');
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);
  const [sharesList, setSharesList] = useState<DashboardShare[]>([]);
  const [sharesLoading, setSharesLoading] = useState<boolean>(false);

  const isViewer = activeDashboard?.permission === 'viewer';

  // Fetch list of current shares for active dashboard
  const fetchShares = async () => {
    if (!activeDashboard || isViewer || !token) return;
    setSharesLoading(true);
    try {
      const res = await fetch(`/api/dashboards/${activeDashboard.id}/shares`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSharesList(data.shares || []);
      }
    } catch (err) {
      console.error('Failed to fetch shares:', err);
    } finally {
      setSharesLoading(false);
    }
  };

  useEffect(() => {
    if (showShareModal && activeDashboard && !isViewer) {
      fetchShares();
    }
  }, [showShareModal, activeDashboardId]);

  // Re-run queries for all charts on active dashboard
  const refreshAllDashboardQueries = async () => {
    if (!activeDashboard || activeDashboard.charts.length === 0) return;
    setLoadingCharts(true);

    const newResults: Record<string, QueryResult> = {};

    for (const chart of activeDashboard.charts) {
      try {
        const res = await fetch('/api/query/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(chart.queryConfig)
        });
        if (res.ok) {
          const data = await res.json();
          newResults[chart.id] = data.result;
        }
      } catch (err) {
        console.error(`Failed to refresh query for chart ${chart.id}:`, err);
      }
    }

    setChartResults(newResults);
    setLoadingCharts(false);
  };

  useEffect(() => {
    if (activeDashboard) {
      refreshAllDashboardQueries();
    }
  }, [activeDashboardId, dashboards]);

  const handleCreateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateError(null);
    setCreateLoading(true);
    const result = await onCreateDashboard(newTitle, newDesc);
    setCreateLoading(false);

    if (result && !result.success) {
      setCreateError(result.error || 'Failed to create dashboard.');
    } else {
      setNewTitle('');
      setNewDesc('');
      setCreateError(null);
      setShowCreateModal(false);
    }
  };

  const handleInviteViewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || !activeDashboard || !token) return;
    setShareError(null);
    setShareSuccessMsg(null);
    setShareLoading(true);

    try {
      const res = await fetch(`/api/dashboards/${activeDashboard.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: shareEmail, role: shareRole })
      });

      const data = await res.json();
      if (res.ok) {
        setShareSuccessMsg(data.message || `Successfully shared with ${shareEmail}`);
        setShareEmail('');
        await fetchShares();
      } else {
        setShareError(data.error || 'Failed to share dashboard.');
      }
    } catch (err: any) {
      setShareError(err.message || 'Failed to share dashboard.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    if (!activeDashboard || !token) return;
    setShareError(null);
    setShareSuccessMsg(null);
    try {
      const res = await fetch(`/api/dashboards/${activeDashboard.id}/shares/${shareId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setShareSuccessMsg('Viewer access revoked.');
        await fetchShares();
      } else {
        const data = await res.json();
        setShareError(data.error || 'Failed to revoke access.');
      }
    } catch (err: any) {
      setShareError(err.message || 'Failed to revoke access.');
    }
  };

  const handleToggleSpan = async (chartId: string) => {
    if (!activeDashboard || isViewer) return;
    const updated = activeDashboard.charts.map((c) => {
      if (c.id === chartId) {
        return {
          ...c,
          gridSpan: c.gridSpan === 'full' ? 'half' : ('full' as const)
        };
      }
      return c;
    });
    await onUpdateDashboardCharts(activeDashboard.id, updated);
  };

  const handleDeleteChart = async (chartId: string) => {
    if (!activeDashboard || isViewer) return;
    const updated = activeDashboard.charts.filter((c) => c.id !== chartId);
    await onUpdateDashboardCharts(activeDashboard.id, updated);
  };

  // Export Dashboard Data as CSV
  const handleExportCsv = () => {
    if (!activeDashboard) return;
    const combinedRows: any[] = [];

    activeDashboard.charts.forEach((chart) => {
      const res = chartResults[chart.id];
      if (res && res.rows) {
        res.rows.forEach((r) => {
          combinedRows.push({
            Chart_Title: chart.title,
            ...r
          });
        });
      }
    });

    if (combinedRows.length === 0) return;

    const csv = Papa.unparse(combinedRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDashboard.title.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Dashboard View as PDF
  const handleExportPdf = async () => {
    if (!dashboardRef.current) return;
    setExportingPdf(true);

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${activeDashboard.title.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  if (dashboards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-8">
        <div className="w-full max-w-lg p-10 sm:p-14 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-600 dark:text-indigo-400">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Saved Dashboards</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
            Create your first dashboard or build custom queries to populate charts.
          </p>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dashboard</span>
          </button>
        </div>

        {/* Create Dashboard Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <form
              onSubmit={handleCreateConfirm}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-left"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create New Dashboard
              </h3>

              {createError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dashboard Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Department Attendance & Performance"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key summary metrics for department heads..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  {createLoading ? 'Creating...' : 'Create Dashboard'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  const myDashboards = dashboards.filter((d) => d.isOwner || !d.isShared);
  const sharedDashboards = dashboards.filter((d) => d.isShared && !d.isOwner);

  return (
    <div className="space-y-6">
      {/* Dashboard Selector & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Dashboard
            </label>
            <select
              value={activeDashboard?.id}
              onChange={(e) => onSelectDashboard(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              {myDashboards.length > 0 && (
                <optgroup label="My Dashboards">
                  {myDashboards.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.charts.length} charts)
                    </option>
                  ))}
                </optgroup>
              )}
              {sharedDashboards.length > 0 && (
                <optgroup label="Shared with me">
                  {sharedDashboards.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} (Shared by {d.ownerName || d.ownerEmail || 'Admin'})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <button
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="mt-4 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
            title="Create New Dashboard"
          >
            <Plus className="w-3.5 h-3.5" />
            New Dashboard
          </button>

          {!isViewer && activeDashboard && (
            <button
              onClick={() => onDeleteDashboard(activeDashboard.id)}
              className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-xs font-medium transition-colors"
              title="Delete current dashboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Viewer Badge or Invite Button */}
          {activeDashboard.isShared && (
            <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold ${
              activeDashboard.permission === 'admin' 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-800'
            }`}>
              <Users className="w-3.5 h-3.5" />
              Shared with me ({activeDashboard.permission === 'admin' ? 'Can Edit' : 'Read-only'})
            </div>
          )}
          
          {activeDashboard.isOwner && (
            <button
              onClick={() => {
                setShareError(null);
                setShareSuccessMsg(null);
                setShowShareModal(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite / Share
            </button>
          )}

          <button
            onClick={refreshAllDashboardQueries}
            disabled={loadingCharts}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCharts ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            {exportingPdf ? 'Exporting...' : 'PDF Report'}
          </button>

          {!isViewer && (
            <button
              onClick={onNavigateToQueryBuilder}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
              Add New Chart
            </button>
          )}
        </div>
      </div>

      {/* Captured Dashboard Canvas for PDF Export */}
      <div ref={dashboardRef} className="space-y-6 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
        {/* Title Header inside report */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{activeDashboard?.title}</h1>
              {isViewer ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Shared Viewer
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Owner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{activeDashboard?.description || 'No description provided.'}</p>
            {isViewer && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Shared by: {activeDashboard.ownerName || activeDashboard.ownerEmail || 'Admin'}
              </p>
            )}
          </div>
          <div className="text-right text-[11px] text-slate-400 font-mono">
            <div>Saved Dashboard ID: {activeDashboard?.id}</div>
            <div>Updated: {new Date(activeDashboard?.updatedAt || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Chart Cards Grid */}
        {activeDashboard?.charts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 min-h-[calc(100vh-22rem)]">
            <div className="w-full max-w-lg p-10 sm:p-14 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-600 dark:text-indigo-400">
                <BarChart2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">This dashboard is currently empty</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                {isViewer
                  ? 'The owner has not added any charts to this dashboard yet.'
                  : 'Build a query in the Query Builder and click "Save to Dashboard" to add your first chart.'}
              </p>
              {!isViewer && (
                <button
                  onClick={onNavigateToQueryBuilder}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>Launch Query Builder</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDashboard?.charts.map((chart) => {
              const res = chartResults[chart.id];
              const isFull = chart.gridSpan === 'full';

              return (
                <div
                  key={chart.id}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between ${
                    isFull ? 'md:col-span-2' : 'md:col-span-1'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{chart.title}</h3>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>
                          {chart.queryConfig.aggregation} of {chart.queryConfig.yAxis} by {chart.queryConfig.xAxis}
                        </span>
                        {res && (
                          <span className="text-emerald-500 font-semibold">
                            • {res.executionTimeMs}ms
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleSpan(chart.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        title={isFull ? 'Collapse to half width' : 'Expand to full width'}
                      >
                        {isFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>

                      {!isViewer && (
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete chart from dashboard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chart Body */}
                  <div className="my-auto py-2">
                    <ChartRenderer
                      type={chart.queryConfig.chartType}
                      result={res || null}
                      height={isFull ? 340 : 280}
                      loading={loadingCharts}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateConfirm}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Create New Dashboard
            </h3>

            {createError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{createError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dashboard Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Department Attendance & Performance"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Key summary metrics for department heads..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
              >
                {createLoading ? 'Creating...' : 'Create Dashboard'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Share / Invite Viewer Modal */}
      {showShareModal && activeDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Dashboard & Manage Access</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeDashboard.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Feedback Banners */}
            {shareError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{shareError}</span>
              </div>
            )}

            {shareSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{shareSuccessMsg}</span>
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleInviteViewer} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Invite a registered user
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value as 'viewer' | 'admin')}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="admin">Admin (Can Edit)</option>
                </select>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm transition-colors shrink-0"
                >
                  {shareLoading ? 'Sending...' : 'Invite'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Viewers can only see charts. Admins can edit the layout and configuration.
              </p>
            </form>

            {/* Shares List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                People with Access
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {/* Owner entry */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {user?.name || 'Owner'} <span className="text-[10px] font-normal text-slate-400">(You)</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{user?.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Owner
                  </span>
                </div>

                {/* Invited viewers entries */}
                {sharesLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                          <div className="space-y-1">
                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : sharesList.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No viewers invited yet.
                  </div>
                ) : (
                  sharesList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{s.userEmail}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.role === 'admin' 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {s.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Invited {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          Viewer
                        </span>
                        <button
                          onClick={() => handleRevokeShare(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Revoke viewer access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
