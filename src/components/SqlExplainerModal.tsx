import React from 'react';
import { Code2, Sparkles, Layers, BookOpen, Database, ShieldCheck } from 'lucide-react';

export const SqlExplainerModal: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold">College Final Project Code & Algorithm Explainer</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          This panel explains the underlying engineering principles behind InsightBoard. Use this guide to explain the SQL query generator and auto-chart suggestion logic to your professor!
        </p>
      </div>

      {/* Grid of Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: SQL Generator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            1. SQL Query Generation Logic
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The backend query engine transforms no-code dropdown selections into syntactically valid, secure SQL query strings executed directly against SQLite or PostgreSQL.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2">
            <div className="text-slate-400 font-sans font-semibold text-[11px]">Example Generated SQL:</div>
            <pre className="whitespace-pre-wrap text-[11px] text-emerald-400">
{`SELECT 
  department AS "department", 
  AVG(marks) AS "AVG_of_marks"
FROM college_analytics
WHERE attendance_percentage >= 75
GROUP BY department
ORDER BY "AVG_of_marks" DESC
LIMIT 10;`}
            </pre>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <strong className="text-slate-900 dark:text-white">Sanitization:</strong> Table and column identifiers are sanitized using regular expressions to prevent SQL injection.
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <strong className="text-slate-900 dark:text-white">Dynamic Aggregation:</strong> Supports <code className="text-indigo-600 dark:text-indigo-400 font-bold">SUM</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">AVG</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">COUNT</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">MAX</code>, and <code className="text-indigo-600 dark:text-indigo-400 font-bold">MIN</code> functions dynamically.
            </div>
          </div>
        </div>

        {/* Section 2: Auto-Chart Algorithm */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            2. Auto-Chart Suggestion Algorithm
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            When a user selects fields, <code className="text-indigo-600 dark:text-indigo-400 font-mono">autoSuggestChart()</code> inspects data type metadata and column cardinality to recommend the best visual chart.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>Line Chart</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-200 dark:bg-indigo-900 rounded">Rule 1</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">
                Triggered when X-axis column is a date/time or sequential string (e.g. <code className="font-mono">semester</code>, <code className="font-mono">year</code>, <code className="font-mono">date</code>).
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>Pie Chart</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 rounded">Rule 2</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">
                Triggered when X-axis is a low-cardinality category (&le; 6 distinct values, e.g. <code className="font-mono">placement_status</code>).
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>Bar Chart</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200 dark:bg-amber-900 rounded">Rule 3</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">
                Triggered for discrete categories or grouped comparisons (e.g. <code className="font-mono">department</code>).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Stack Architecture Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          3. Tech Stack & Security Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Auth & Security
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              JWT access tokens (15m), httpOnly refresh tokens (7d), bcrypt password hashing, and disposable email domain blocking.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Database className="w-4 h-4 text-emerald-500" />
              Database Engine
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              SQLite in WebAssembly (<code className="font-mono">sql.js</code>) with persistent disk saves, pre-seeded with 105 college analytics records.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Reporting & Export
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Recharts rendering engine with 1-click PapaParse CSV data export and jsPDF + html2canvas PDF report generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
