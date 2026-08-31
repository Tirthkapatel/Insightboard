import React, { useEffect } from 'react';
import { Shield, ArrowLeft, Lock, Database, Eye, Server, Cookie, UserCheck, RefreshCw, Mail, BarChart3 } from 'lucide-react';
import { ScrollReveal } from './ui/scroll-reveal.js';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    window.scrollTo(0, 0);
    onBack();
  };

  const sections = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: '1. Introduction & Overview',
      content: (
        <>
          <p>
            At InsightBoard ("we," "our," or "us"), we value your privacy and are committed to protecting the personal and analytical data you entrust to us. This Privacy Policy explains how we collect, use, store, and process your information when you use our Business Intelligence and data visualization platform located at InsightBoard.
          </p>
          <p>
            By accessing or using InsightBoard, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy.
          </p>
        </>
      ),
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: '2. Information We Collect',
      content: (
        <>
          <p>
            To provide you with high-performance query execution and dashboard visualization services, we collect information in the following categories:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>
              <strong className="text-white">Account Information:</strong> Full name, email address, password hashes, user role preferences (Admin or Viewer), and email verification status (OTP verification records).
            </li>
            <li>
              <strong className="text-white">Data Source Connection Information:</strong> Connection configurations for database engines (PostgreSQL, MySQL, SQLite) and uploaded raw data files (CSV datasets). Connection passwords and tokens are kept securely encrypted.
            </li>
            <li>
              <strong className="text-white">Usage &amp; Query Metrics:</strong> Aggregated query execution logs, runtime metrics (execution latency in milliseconds), dashboard configurations, and widget settings to optimize query caching.
            </li>
            <li>
              <strong className="text-white">Cookies &amp; Technical Identifiers:</strong> Session state indicators, JWT authentication tokens stored in browser local state, browser user-agent types, and anonymized access IPs.
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: '3. How We Use Your Data',
      content: (
        <>
          <p>We utilize collected information strictly for the following operational purposes:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>Providing, maintaining, and executing sub-millisecond query evaluation on connected data sources.</li>
            <li>Authenticating user credentials, enforcing multi-tenant role permissions, and verifying OTP login security.</li>
            <li>Generating real-time SQL auto-suggest formatting and chart visualization suggestions.</li>
            <li>Monitoring platform stability, diagnosing API route errors, and optimizing in-memory cache performance.</li>
            <li>Communicating critical security updates, password resets, and account status notifications.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: '4. Data Storage and Security',
      content: (
        <>
          <p>
            Security is foundational to our platform architecture. We enforce industry-standard security protocols:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>
              <strong className="text-white">Encryption in Transit &amp; At Rest:</strong> All web traffic is encrypted using TLS 1.3. User passwords are hashed using salted cryptographic algorithms.
            </li>
            <li>
              <strong className="text-white">Isolated Data Engine:</strong> In-memory SQLite instances and remote database queries operate within sandboxed execution contexts to prevent cross-tenant data leakage.
            </li>
            <li>
              <strong className="text-white">Session Security:</strong> Access tokens expire automatically and require multi-factor OTP verification for unverified accounts or password reset workflows.
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: <Server className="w-5 h-5" />,
      title: '5. Third-Party Sharing',
      content: (
        <>
          <p>
            InsightBoard does <strong className="text-white">NOT</strong> sell, rent, or trade your personal information or connected database query content to advertisers or third-party data brokers.
          </p>
          <p>
            We may share data only with trusted infrastructure providers (such as secure Cloud Run hosting and database engines) strictly necessary for hosting and running the InsightBoard service, or when required by law to comply with valid legal process.
          </p>
        </>
      ),
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: '6. Your Rights (Access, Deletion, Export)',
      content: (
        <>
          <p>You maintain full control over your account and business data:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li><strong className="text-white">Access &amp; Inspection:</strong> Review all saved dashboards, data sources, and account profile metadata within Settings.</li>
            <li><strong className="text-white">Data Export:</strong> Export your query results and custom chart configurations in CSV/JSON formats at any time.</li>
            <li><strong className="text-white">Account Deletion:</strong> Delete connected data sources, dashboards, or request full deletion of your user account from our system.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Cookie className="w-5 h-5" />,
      title: '7. Cookies &amp; Storage Policy',
      content: (
        <p>
          InsightBoard uses essential browser storage (such as HTML5 LocalStorage and HTTP-only session cookies) solely to retain your active authentication token and dark theme display preferences. We do not use third-party cross-site tracking cookies.
        </p>
      ),
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: '8. Changes to This Policy',
      content: (
        <p>
          We may update this Privacy Policy from time to time to reflect platform upgrades or legal compliance requirements. The "Last updated" date at the top of this document will indicate when modifications take effect.
        </p>
      ),
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: '9. Contact Information',
      content: (
        <>
          <p>
            If you have any questions or concerns regarding this Privacy Policy or our data handling practices, please contact our privacy response team:
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
            Email: privacy@insightboard.app<br />
            Address: InsightBoard Analytics Inc., 100 Innovation Way, Suite 400, San Francisco, CA 94105
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent font-display">
              InsightBoard
            </span>
          </div>

          <ScrollReveal direction="up" delayMs={50}>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Application</span>
            </button>
          </ScrollReveal>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Title Header */}
        <ScrollReveal direction="up" delayMs={100}>
          <div className="mb-10 pb-8 border-b border-zinc-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Privacy & Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-zinc-400 text-sm">
              Last updated: <span className="text-indigo-300 font-mono font-medium">July 31, 2026</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Content Body */}
        <div className="space-y-10 text-zinc-300 text-sm leading-relaxed">
          {sections.map((sec, idx) => (
            <ScrollReveal key={idx} direction="up" delayMs={(idx % 3) * 90}>
              <section className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-3 text-white font-bold text-lg font-display mb-1">
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/60">
                    {sec.icon}
                  </div>
                  <h2>{sec.title}</h2>
                </div>
                {sec.content}
              </section>
            </ScrollReveal>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black py-6 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} InsightBoard BI Analytics. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-indigo-400 hover:underline cursor-pointer">Return to Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
