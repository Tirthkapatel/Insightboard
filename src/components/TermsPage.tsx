import React, { useEffect } from 'react';
import { FileText, ArrowLeft, ShieldCheck, Scale, CheckCircle2, AlertTriangle, CreditCard, Ban, HelpCircle, Mail, BarChart3 } from 'lucide-react';
import { ScrollReveal } from './ui/scroll-reveal.js';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    window.scrollTo(0, 0);
    onBack();
  };

  const sections = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p>
            Welcome to InsightBoard. By creating an account, accessing our website, or using our Business Intelligence, SQL query execution, and dashboard visualization services, you agree to be bound by these Terms and Conditions ("Terms").
          </p>
          <p>
            If you do not agree to all of these Terms, you may not access or use the InsightBoard platform.
          </p>
        </>
      ),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: '2. Description of Service',
      content: (
        <>
          <p>
            InsightBoard provides a high-performance web-based analytics platform featuring interactive SQL auto-suggest formatting, SQLite in-memory evaluation, Recharts dynamic widget generation, and role-based dashboard sharing.
          </p>
          <p>
            We reserve the right to modify, enhance, or discontinue any feature or service component at any time with or without prior notice.
          </p>
        </>
      ),
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: '3. User Accounts and Responsibilities',
      content: (
        <>
          <p>To access certain features of InsightBoard, you must register for an account:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>You must provide accurate, current, and complete registration information during signup.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials and one-time password (OTP) verification codes.</li>
            <li>You are fully responsible for all activity that occurs under your user account.</li>
            <li>Disposable or temporary email addresses are restricted to preserve platform security.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Ban className="w-5 h-5" />,
      title: '4. Acceptable Use Policy',
      content: (
        <>
          <p>You agree not to engage in any prohibited activity, including but not limited to:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>Attempting SQL injection, unauthorized database connections, or reverse engineering platform source code.</li>
            <li>Interfering with or disrupting the integrity, latency, or server performance of the InsightBoard execution engine.</li>
            <li>Storing or querying illegal, malicious, or infringing content through connected data sources.</li>
            <li>Bypassing multi-tenant role permissions or attempting to access dashboards belonging to other organizations without authorization.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: '5. Data and Content Ownership',
      content: (
        <>
          <p>
            <strong className="text-white">Your Data:</strong> You retain full ownership and intellectual property rights in all data sources, queries, and dataset content you upload or connect to InsightBoard. We claim no ownership over your business data.
          </p>
          <p>
            <strong className="text-white">Our Platform:</strong> InsightBoard and its software, visual designs, UI components, code, and trademarks remain the exclusive property of InsightBoard Analytics Inc.
          </p>
        </>
      ),
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: '6. Subscription and Billing Terms',
      content: (
        <>
          <p>
            InsightBoard offers both Free tier access and premium plans. If you subscribe to a paid tier:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>Subscription fees are billed in advance on a monthly or annual recurring cycle.</li>
            <li>All payments are non-refundable except where required by applicable consumer law.</li>
            <li>You may cancel your subscription at any time prior to your next billing cycle.</li>
          </ul>
        </>
      ),
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: '7. Limitation of Liability',
      content: (
        <p>
          To the maximum extent permitted by law, InsightBoard and its officers, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or service interruption resulting from your use of the platform.
        </p>
      ),
    },
    {
      icon: <Ban className="w-5 h-5" />,
      title: '8. Termination',
      content: (
        <p>
          We reserve the right to suspend or terminate your account and access to InsightBoard immediately if you breach these Terms or engage in fraudulent or abusive activities. You may terminate your account at any time via Settings.
        </p>
      ),
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: '9. Governing Law',
      content: (
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles.
        </p>
      ),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: '10. Changes to Terms',
      content: (
        <p>
          We reserve the right to update these Terms at any time. Continued use of InsightBoard following any posted updates constitutes acceptance of the revised Terms.
        </p>
      ),
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: '11. Contact Information',
      content: (
        <>
          <p>
            For legal inquiries regarding these Terms and Conditions, please contact us at:
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
            Email: legal@insightboard.app<br />
            Address: InsightBoard Legal Dept., 100 Innovation Way, Suite 400, San Francisco, CA 94105
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
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight mb-3">
              Terms and Conditions
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
