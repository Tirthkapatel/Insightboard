import React, { useState, useRef, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LayoutDashboard,
  Database,
  Code2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Share2,
  CheckCircle2,
  LineChart,
  Play,
  User as UserIcon,
  ChevronRight,
  Check,
  Sparkles,
  Lock,
  Layers,
  Cpu,
  RefreshCw,
  Table,
  Sliders,
  Terminal,
  Server,
  Activity,
  Globe,
  Github,
} from 'lucide-react';
import { HeroSection } from './ui/hero-section.js';
import { Icons } from './ui/icons.js';
import { ScrollReveal } from './ui/scroll-reveal.js';

const scrollAnim: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut" 
    } 
  }
};

const subheadingAnim: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.1 
    } 
  }
};

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreDemo: () => void;
  isAuthenticated: boolean;
  onGoToApp: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTerms?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  isAuthenticated,
  onGoToApp,
  onOpenPrivacyPolicy,
  onOpenTerms,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isManualStep, setIsManualStep] = useState<boolean>(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'revenue' | 'retention' | 'regional'>('revenue');

  // Auto-cycle through the 3 workflow steps every 4 seconds unless user manually interacts
  useEffect(() => {
    if (isManualStep) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isManualStep]);

  // Sample data for the interactive SQL feature snippet
  const featureQuerySamples = {
    revenue: {
      sql: `SELECT 
  DATE_TRUNC('month', order_date) AS month,
  SUM(total_amount) AS monthly_revenue,
  COUNT(DISTINCT customer_id) AS active_buyers
FROM sales_transactions
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;`,
      metrics: "0.003s execution • 12 rows returned",
      highlight: "$128,450.00 (+14.2% YoY)",
    },
    retention: {
      sql: `SELECT 
  cohort_month,
  COUNT(user_id) AS total_users,
  ROUND(AVG(retention_rate_30d), 2) AS avg_30d_retention
FROM user_cohorts
GROUP BY cohort_month
ORDER BY cohort_month DESC;`,
      metrics: "0.005s execution • 8 cohorts analyzed",
      highlight: "68.4% Average 30-Day Retention",
    },
    regional: {
      sql: `SELECT 
  region_name,
  SUM(units_sold) AS volume,
  SUM(revenue_usd) AS regional_total
FROM global_sales
WHERE order_year = 2025
GROUP BY region_name
ORDER BY regional_total DESC;`,
      metrics: "0.002s execution • 5 regions summarized",
      highlight: "North America: $482,100 (Leader)",
    },
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-clip">
      
      {/* Global Ambient Gradient Mesh with Indigo/Purple Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px] animate-mesh-1" />
        <div className="absolute top-[30%] right-[-10%] w-[650px] h-[650px] bg-purple-600/10 rounded-full blur-[150px] animate-mesh-2" />
        <div className="absolute top-[60%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/08 rounded-full blur-[160px] animate-mesh-3" />
        <div className="absolute bottom-[5%] right-[15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] animate-mesh-1" />
      </div>

      {/* Landing Header / Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo with Ambient Glow */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center border border-indigo-400/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-300 bg-clip-text text-transparent">
                  InsightBoard
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Engine
                </span>
              </div>
            </div>

            {/* Navigation Links with Animated Hover Underline */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-zinc-300">
              <a href="#features" className="relative py-1 hover:text-white transition-colors group">
                <span>Features</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#how-it-works" className="relative py-1 hover:text-white transition-colors group">
                <span>How It Works</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#interactive-sql" className="relative py-1 hover:text-white transition-colors group">
                <span>Interactive SQL</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#pricing" className="relative py-1 hover:text-white transition-colors group">
                <span>Pricing</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={onGoToApp}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>App Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO SECTION */}
      <div className="relative z-0 w-full bg-black overflow-hidden pt-16">
        <HeroSection
          badge={{
            text: "New: SQL Auto-Suggest & Explainer",
            action: { text: "Try Interactive SQL", href: "#interactive-sql" },
          }}
          title="Turn raw data into insight, faster"
          description="InsightBoard connects to your data sources, helps you build queries with AI-powered auto-suggest, and turns them into live dashboards — no separate BI tool, no manual SQL grind."
          actions={[
            {
              text: "Get Started Free",
              onClick: () => onOpenAuth('signup'),
              variant: "default",
            },
          ]}
          image={{
            light: "",
            dark: "",
            alt: "InsightBoard dashboard preview",
          }}
          mockupNode={
            <div className="p-4 sm:p-5 md:p-6 text-left bg-black relative h-auto w-full overflow-hidden">
              
              {/* Top Engine Status Control Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-800/80 text-[11px] sm:text-xs font-mono">
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="text-zinc-200 font-bold tracking-wide truncate">SQLITE IN-MEMORY CACHE ACTIVE</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-indigo-400 font-semibold shrink-0">0.003s</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 shrink-0 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">demo_ecommerce.sqlite</span>
                </div>
              </div>

              {/* Mock KPI Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-zinc-950/90 border border-indigo-500/20 shadow-lg min-w-0 overflow-hidden">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs text-zinc-400 font-medium gap-1">
                    <span className="truncate">Monthly Revenue</span>
                    <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-base md:text-lg xl:text-xl font-black text-white font-display mt-1.5 truncate">$128,450.00</div>
                  <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1 truncate">
                    <span>↑ +14.2%</span>
                    <span className="text-zinc-500 font-normal truncate">vs last period</span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-zinc-950/90 border border-purple-500/20 shadow-lg min-w-0 overflow-hidden">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs text-zinc-400 font-medium gap-1">
                    <span className="truncate">Query Sessions</span>
                    <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-base md:text-lg xl:text-xl font-black text-white font-display mt-1.5 truncate">24,890</div>
                  <div className="text-[10px] sm:text-xs text-indigo-400 font-semibold mt-1.5 flex items-center gap-1 truncate">
                    <span>892</span>
                    <span className="text-zinc-500 font-normal truncate">live sockets</span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-zinc-950/90 border border-emerald-500/20 shadow-lg min-w-0 overflow-hidden">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs text-zinc-400 font-medium gap-1">
                    <span className="truncate">Avg Query Time</span>
                    <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-base md:text-lg xl:text-xl font-black text-emerald-400 font-display mt-1.5 truncate">12 ms</div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-semibold mt-1.5 truncate">
                    In-Memory Indexed
                  </div>
                </div>
              </div>

              {/* Chart + SQL Split Display */}
              <div className="grid grid-cols-1 gap-3 sm:gap-3.5 mt-3 sm:mt-3.5">
                
                {/* Visual Bar Chart */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="font-bold text-white flex items-center gap-1.5 font-display text-[11px] sm:text-xs truncate">
                      <LineChart className="w-4 h-4 text-indigo-400 shrink-0" />
                      Quarterly Revenue Aggregation
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono shrink-0">
                      GROUP BY Region
                    </span>
                  </div>
                  <div className="h-28 sm:h-32 flex items-end justify-between gap-3 pt-2 px-1">
                    <div className="w-full bg-slate-800/80 rounded-t h-[45%] relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-indigo-600 rounded-t h-[75%] transition-all group-hover:bg-indigo-500" />
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-t h-[65%] relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-t h-[80%] transition-all group-hover:bg-indigo-400" />
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-t h-[90%] relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-indigo-600 rounded-t h-[95%] transition-all group-hover:bg-indigo-500" />
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-t h-[70%] relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-purple-500 rounded-t h-[85%] transition-all group-hover:bg-purple-400" />
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-t h-[100%] relative group">
                      <div className="absolute inset-x-0 bottom-0 bg-emerald-500 rounded-t h-[100%] transition-all group-hover:bg-emerald-400" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 mt-3 font-mono">
                    <span>Q1 North</span>
                    <span>Q2 East</span>
                    <span>Q3 West</span>
                    <span>Q4 Central</span>
                    <span>Global</span>
                  </div>
                </div>

                {/* SQL Auto-Suggest Preview */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between font-mono text-xs text-slate-300 shadow-lg min-w-0 overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Auto-Suggest SQL
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">VALID</span>
                    </div>
                    <div className="space-y-1 font-mono text-[11px] sm:text-xs overflow-x-auto text-slate-300 py-1">
                      <p className="whitespace-nowrap"><span className="text-purple-400">SELECT</span> region, <span className="text-indigo-400">SUM</span>(amount)</p>
                      <p className="whitespace-nowrap"><span className="text-purple-400">FROM</span> sales_transactions</p>
                      <p className="whitespace-nowrap"><span className="text-purple-400">WHERE</span> status = <span className="text-emerald-300">'completed'</span></p>
                      <p className="whitespace-nowrap"><span className="text-purple-400">GROUP BY</span> region;</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">Execution: 0.003s • 42 rows returned</span>
                  </div>
                </div>

              </div>
            </div>
          }
        />
      </div>

      {/* SECTION 2: ASYMMETRIC PROCESS WORKFLOW ("HOW IT WORKS") */}
      <div className="relative z-10 bg-black w-full border-t border-slate-800/80">
        <motion.section 
          id="how-it-works" 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pt-16 pb-24 sm:pt-20 sm:pb-28 relative bg-slate-900/40 w-full"
        >
        
        {/* Background Dot Texture */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Asymmetric Header Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
            <div className="lg:col-span-8 space-y-3 text-left">
              <motion.div 
                variants={scrollAnim} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-50px" }}
                className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase"
              >
                <span className="w-5 h-[2px] bg-indigo-500 inline-block rounded-full" />
                <span>INTELLIGENT WORKFLOW SEQUENCE</span>
              </motion.div>
              <motion.h2 
                variants={scrollAnim} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-50px" }}
                className="text-3xl sm:text-5xl font-display tracking-tight leading-tight"
              >
                <span className="font-light text-slate-300">How InsightBoard Simplifies </span>
                <span className="font-black text-white">Business Intelligence</span>
              </motion.h2>
            </div>
            <div className="lg:col-span-4 text-left">
              <motion.p 
                variants={subheadingAnim} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-50px" }}
                className="text-slate-400 text-sm leading-relaxed"
              >
                Connect your database in seconds, craft custom queries visually or with AI auto-suggest, and generate live interactive dashboards without data engineering locks.
              </motion.p>
            </div>
          </div>

          {/* Interactive Process Layout: Asymmetric Left Controller + Right Live Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Controller Tabs with Distinct Numbered Markers */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Step 1 Tab Button */}
              <ScrollReveal direction="right" delayMs={100}>
                <div
                  onClick={() => { setActiveStep(1); setIsManualStep(true); }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    activeStep === 1
                      ? 'bg-gradient-to-r from-indigo-950/90 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/15'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {activeStep === 1 && (
                    <motion.div 
                      layoutId="activeStepIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 shadow-[0_0_12px_#6366f1]" 
                    />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                      activeStep === 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      01
                    </div>
                    <Database className={`w-5 h-5 ${activeStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Connect &amp; Auto-Parse Schemas</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Support SQLite files, PostgreSQL, MySQL, or CSV data. Automatic table and field type discovery happens instantly upon connection.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 2 Tab Button */}
              <ScrollReveal direction="right" delayMs={200}>
                <div
                  onClick={() => { setActiveStep(2); setIsManualStep(true); }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    activeStep === 2
                      ? 'bg-gradient-to-r from-purple-950/90 to-slate-900 border-purple-500 shadow-xl shadow-purple-600/15'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {activeStep === 2 && (
                    <motion.div 
                      layoutId="activeStepIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 shadow-[0_0_12px_#a855f7]" 
                    />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                      activeStep === 2 ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      02
                    </div>
                    <Code2 className={`w-5 h-5 ${activeStep === 2 ? 'text-purple-400' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Build Queries or Auto-Suggest SQL</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Toggle between visual dropdown builder and raw SQL editor with syntax validation, natural language assistance, and instant explanations.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 3 Tab Button */}
              <ScrollReveal direction="right" delayMs={300}>
                <div
                  onClick={() => { setActiveStep(3); setIsManualStep(true); }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    activeStep === 3
                      ? 'bg-gradient-to-r from-emerald-950/90 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-600/15'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {activeStep === 3 && (
                    <motion.div 
                      layoutId="activeStepIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_12px_#10b981]" 
                    />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                      activeStep === 3 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      03
                    </div>
                    <LayoutDashboard className={`w-5 h-5 ${activeStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Compose &amp; Share Dashboards</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Pin charts to grid layouts, adjust card spans, and invite teammates with Viewer or Editor permissions.
                  </p>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Side Live Interactive Preview Canvas */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="zoom">
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-center">
                  
                  {/* Decorative glow behind live canvas */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                  <AnimatePresence mode="wait">
                    {/* Step 1 Visual Render */}
                    {activeStep === 1 && (
                      <motion.div 
                        key="step-1"
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="space-y-4 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold">
                            <Table className="w-4 h-4" />
                            <span>AUTOMATED SCHEMA ENGINE</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                            4 TABLES DETECTED
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <div className="flex items-center justify-between font-bold text-white mb-2">
                            <span>tbl_sales_transactions</span>
                            <span className="text-[10px] text-slate-500">12,450 records</span>
                          </div>
                          <div className="space-y-1.5 text-[11px] text-slate-400">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-200">id</span>
                              <span className="text-purple-400 font-semibold">INTEGER PRIMARY KEY</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-200">customer_id</span>
                              <span className="text-indigo-400 font-semibold">VARCHAR(64)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-200">total_amount</span>
                              <span className="text-emerald-400 font-semibold">DECIMAL(10,2)</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-200">created_at</span>
                              <span className="text-amber-400 font-semibold">TIMESTAMP</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-slate-300 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>In-Memory Index Generated Successfully</span>
                          </span>
                          <span className="text-indigo-400 font-bold">0.001s</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2 Visual Render */}
                    {activeStep === 2 && (
                      <motion.div 
                        key="step-2"
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="space-y-4 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2 text-purple-400 font-bold">
                            <Terminal className="w-4 h-4" />
                            <span>SQL EDITOR &amp; AUTO-SUGGEST</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                            VALID SYNTAX
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                          <p><span className="text-purple-400">SELECT</span> region, <span className="text-indigo-400">COUNT</span>(*) <span className="text-purple-400">AS</span> order_count</p>
                          <p><span className="text-purple-400">FROM</span> sales_transactions</p>
                          <p className="p-1 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-200 flex items-center justify-between">
                            <span><span className="text-purple-400">GROUP BY</span> region|</span>
                            <span className="text-[10px] text-indigo-400 font-sans">Press TAB to complete</span>
                          </p>
                          <p><span className="text-purple-400">ORDER BY</span> order_count <span className="text-purple-400">DESC</span>;</p>
                        </div>

                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-slate-300 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>AI Suggestion: Grouping by region improves latency by 40%</span>
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 Visual Render */}
                    {activeStep === 3 && (
                      <motion.div 
                        key="step-3"
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="space-y-4 font-sans text-xs"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>LIVE DASHBOARD COMPOSER</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                            GRID RECHARTS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Conversion Rate</div>
                            <div className="text-xl font-bold text-white font-display mt-0.5">4.82%</div>
                            <div className="h-10 mt-2 flex items-end gap-1">
                              <div className="w-full bg-emerald-500 rounded-t h-[40%]" />
                              <div className="w-full bg-emerald-500 rounded-t h-[60%]" />
                              <div className="w-full bg-emerald-500 rounded-t h-[80%]" />
                              <div className="w-full bg-emerald-400 rounded-t h-[100%]" />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Total Orders</div>
                            <div className="text-xl font-bold text-white font-display mt-0.5">14,210</div>
                            <div className="h-10 mt-2 flex items-end gap-1">
                              <div className="w-full bg-indigo-500 rounded-t h-[50%]" />
                              <div className="w-full bg-indigo-500 rounded-t h-[70%]" />
                              <div className="w-full bg-indigo-500 rounded-t h-[65%]" />
                              <div className="w-full bg-indigo-400 rounded-t h-[90%]" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-indigo-400" />
                            <span className="font-semibold text-white">Shareable Dashboard URL</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]">
                            Copy Link
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </ScrollReveal>
            </div>

          </div>

        </div>
        </motion.section>
      </div>

      {/* SECTION 3: BENTO GRID FEATURES & INTERACTIVE SQL DEMO */}
      <section id="interactive-sql" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div 
              variants={scrollAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-purple-400 uppercase"
            >
              <Sparkles className="w-4 h-4 text-purple-400 inline-block" />
              <span>ENGINE CAPABILITIES</span>
            </motion.div>
            <motion.h2 
              variants={scrollAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="text-3xl sm:text-5xl font-display tracking-tight mt-4"
            >
              <span className="font-black text-white">Enterprise BI Analytics </span>
              <span className="font-light text-slate-300">Without Complexity</span>
            </motion.h2>
            <motion.p 
              variants={subheadingAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="mt-4 text-slate-400 text-sm sm:text-base"
            >
              Click the interactive SQL tabs below to test live query formatting and performance response times.
            </motion.p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Item 1 (Wide 2-Columns): Interactive SQL Engine */}
            <ScrollReveal className="md:col-span-2 h-full" direction="up" delayMs={0}>
              <div className="h-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono">
                      <Code2 className="w-5 h-5" />
                      <span>Interactive SQL Auto-Suggest</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold font-mono">
                      REAL-TIME
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white font-display mb-3">
                    Write Raw SQL or Let AI Suggest Aggregations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    Select a pre-built metric scenario to test SQL auto-formatting, query cost analysis, and immediate execution outputs:
                  </p>

                  {/* Scenario Tabs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setActiveFeatureTab('revenue')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeFeatureTab === 'revenue'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Revenue YoY
                    </button>
                    <button
                      onClick={() => setActiveFeatureTab('retention')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeFeatureTab === 'retention'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Cohort Retention
                    </button>
                    <button
                      onClick={() => setActiveFeatureTab('regional')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeFeatureTab === 'regional'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Regional Sales
                    </button>
                  </div>

                  {/* Formatted Code Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {featureQuerySamples[activeFeatureTab].sql}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-mono">
                    {featureQuerySamples[activeFeatureTab].metrics}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold font-display">
                    {featureQuerySamples[activeFeatureTab].highlight}
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 2 (1-Column): In-Memory SQLite Cache */}
            <ScrollReveal className="h-full" direction="up" delayMs={100}>
              <div className="h-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span>Sub-Millisecond Engine</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">In-Memory Execution</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Queries evaluate against indexed in-memory SQLite instances for zero network lag and sub-millisecond chart re-renders.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl font-black text-emerald-400 font-display">&lt; 10 ms</div>
                  <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Average Response Latency</div>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 3 (1-Column): Granular Access Control */}
            <ScrollReveal className="h-full" direction="up" delayMs={150}>
              <div className="h-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider mb-4">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span>RBAC Security Locks</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">Role Permissions</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Prevent unauthorized query modifications with Viewer read-only locks and Editor management permissions.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Viewer Role</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Read Only</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Editor Role</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">Full Access</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 4 (2-Columns): Visual Recharts Visualizer */}
            <ScrollReveal className="md:col-span-2 h-full" direction="up" delayMs={200}>
              <div className="h-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono mb-4">
                    <BarChart3 className="w-5 h-5" />
                    <span>Recharts Component Engine</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display mb-3">
                    Multi-Type Dynamic Visualizations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Automatically select from Bar Charts, Line Trends, Area Aggregations, or Donut Compositions based on returned SQL columns.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center group/card hover:border-indigo-500/40 transition-colors">
                    <svg className="w-8 h-6 text-indigo-400 mx-auto mb-1.5" viewBox="0 0 32 24" fill="currentColor">
                      <rect x="2" y="10" width="5" height="12" rx="1"/>
                      <rect x="10" y="4" width="5" height="18" rx="1"/>
                      <rect x="18" y="12" width="5" height="10" rx="1"/>
                      <rect x="26" y="2" width="5" height="20" rx="1"/>
                    </svg>
                    <div className="text-xs font-bold text-white font-display">Bar Charts</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Categories</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center group/card hover:border-indigo-500/40 transition-colors">
                    <svg className="w-8 h-6 text-indigo-400 mx-auto mb-1.5" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M 2 18 Q 8 10, 14 14 T 26 4 T 30 8" />
                    </svg>
                    <div className="text-xs font-bold text-white font-display">Line Trends</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Time Series</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center group/card hover:border-indigo-500/40 transition-colors">
                    <svg className="w-8 h-6 text-indigo-400 mx-auto mb-1.5" viewBox="0 0 32 24" fill="currentColor">
                      <path d="M 2 20 L 2 14 Q 10 6, 18 12 T 30 6 L 30 20 Z" opacity="0.3"/>
                      <path d="M 2 14 Q 10 6, 18 12 T 30 6" fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div className="text-xs font-bold text-white font-display">Area Fill</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Cumulative</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center group/card hover:border-indigo-500/40 transition-colors">
                    <svg className="w-8 h-6 text-indigo-400 mx-auto mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <circle cx="12" cy="12" r="8" strokeDasharray="36 14" strokeLinecap="round" />
                    </svg>
                    <div className="text-xs font-bold text-white font-display">Donuts</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Proportions</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* SECTION 4: ASYMMETRIC PRICING TIERS */}
      <section id="pricing" className="py-28 bg-slate-900/50 border-t border-slate-800 relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span 
              variants={scrollAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="inline-block px-3.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80 text-xs font-mono font-bold tracking-widest uppercase"
            >
              SIMPLE PRICING
            </motion.span>
            <motion.h2 
              variants={scrollAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="text-3xl sm:text-5xl font-display tracking-tight mt-4"
            >
              <span className="font-light text-slate-300">Transparent Plans for </span>
              <span className="font-black text-white">Solo Analysts &amp; Teams</span>
            </motion.h2>
            <motion.p 
              variants={subheadingAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="mt-4 text-slate-400 text-sm sm:text-base"
            >
              Start for free with local SQLite databases or upgrade to team sharing and remote database connectors.
            </motion.p>

            {/* Monthly / Yearly Toggle */}
            <motion.div 
              variants={subheadingAnim} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-50px" }}
              className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-medium"
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold font-mono">
                  20% OFF
                </span>
              </button>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Starter Tier */}
            <ScrollReveal delayMs={0} direction="up">
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-full hover:border-slate-700 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Starter</h3>
                  <p className="text-xs text-slate-400 mt-1">Ideal for side projects &amp; student labs</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white font-display">$0</span>
                    <span className="text-xs text-slate-400 font-mono">/ forever free</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs text-slate-300 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1 Active Data Source (SQLite / CSV)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Up to 3 Custom Grid Dashboards</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Visual Query Builder</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Recharts Standard Rendering</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3 px-4 rounded-2xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer text-center"
                >
                  Get Started Free
                </button>
              </div>
            </ScrollReveal>

            {/* Pro Tier (Featured / Highlighted) */}
            <ScrollReveal delayMs={150} direction="up">
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/25 flex flex-col justify-between h-full hover:border-indigo-400 transition-all">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold font-mono tracking-widest uppercase flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  RECOMMENDED FOR TEAMS
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white font-display">Pro Analyst</h3>
                  <p className="text-xs text-indigo-300 mt-1">For growing teams &amp; data analysts</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white font-display">
                      {billingCycle === 'monthly' ? '$29' : '$23'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ user / month</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs text-slate-200 border-t border-indigo-900/60 pt-6">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white">Unlimited Data Sources (Postgres, MySQL, SQLite)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unlimited Grid Dashboards</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-indigo-300 font-bold">AI SQL Auto-Suggest &amp; Query Explainer</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Role Access Control (Viewer/Editor)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>PDF &amp; PNG Dashboard Exports</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer text-center"
                >
                  Start 14-Day Free Trial
                </button>
              </div>
            </ScrollReveal>

            {/* Enterprise Tier */}
            <ScrollReveal delayMs={300} direction="up">
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-full hover:border-slate-700 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1">Dedicated SLAs, security &amp; custom drivers</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-display">Custom</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs text-slate-300 border-t border-slate-800 pt-6">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All Pro Capabilities</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Custom REST API &amp; DB Connectors</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>SSO Integration &amp; Audit Logs</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated Solutions Engineer</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3 px-4 rounded-2xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer text-center"
                >
                  Contact Sales
                </button>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* SECTION 5: SECURITY & TEAM COLLABORATION */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <motion.div 
                  variants={scrollAnim} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-50px" }}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>GRANULAR GOVERNANCE</span>
                </motion.div>

                <motion.h2 
                  variants={scrollAnim} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight"
                >
                  Share Dashboards with Role-Based Access Control
                </motion.h2>

                <motion.p 
                  variants={subheadingAnim} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-slate-300 text-sm leading-relaxed"
                >
                  Invite teammates by email with strict role enforcement. Viewer accounts maintain read-only guarantees on shared dashboards, preventing accidental SQL query modifications.
                </motion.p>

                <div className="space-y-3 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant access revocation by dashboard owner</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Shared read-only link generation with token security</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time dashboard state updates across viewers</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white font-display">Dashboard Sharing Matrix</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">2 ACTIVE USERS</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          A
                        </div>
                        <div>
                          <p className="font-bold text-white">Demo Administrator</p>
                          <p className="text-[10px] text-slate-400 font-mono">admin@insightboard.app</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        OWNER
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                          V
                        </div>
                        <div>
                          <p className="font-bold text-white">Data Viewer</p>
                          <p className="text-[10px] text-slate-400 font-mono">viewer@example.com</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-950 text-sky-300 border border-sky-800">
                        VIEWER
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BOTTOM CTA BANNER - Asymmetric Split Diagonal Card */}
      <section className="py-20 relative overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-zinc-950 to-purple-950/80 border border-indigo-800/60 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="space-y-3 text-left max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
                <span className="w-4 h-[2px] bg-indigo-500 rounded-full" />
                <span>GET STARTED IN SECONDS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
                Ready to Turn Data Into Live Dashboards?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Start building SQL queries and visual charts in seconds. No complex setup, no data engineering locks.
              </p>
            </div>

            {/* Right Action CTA */}
            <div className="shrink-0 relative z-10 w-full sm:w-auto">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* RICH MULTI-COLUMN FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Col 1: Brand & Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-black text-lg text-white">InsightBoard</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Modern Business Intelligence platform powered by SQLite, React, and Recharts.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">All Systems Operational</span>
              </div>
            </div>

            {/* Col 2: Product Capabilities */}
            <div className="space-y-3">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px] text-slate-300">
                Capabilities
              </div>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Visual Query Builder</a></li>
                <li><a href="#interactive-sql" className="hover:text-white transition-colors">SQL Auto-Suggest Engine</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Recharts Grid Composer</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Role-Based Sharing</a></li>
              </ul>
            </div>

            {/* Col 3: Supported Connectors */}
            <div className="space-y-3">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px] text-slate-300">
                Data Connectors
              </div>
              <ul className="space-y-2 text-slate-400 font-mono text-[11px]">
                <li>SQLite In-Memory / File</li>
                <li>PostgreSQL Remote</li>
                <li>MySQL Connector</li>
                <li>CSV Upload Ingestion</li>
              </ul>
            </div>

            {/* Col 4: Platform */}
            <div className="space-y-3">
              <div className="font-bold text-white font-display uppercase tracking-wider text-[11px] text-slate-300">
                Platform
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Built with Express backend, TypeScript, and Vite frontend.
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/your-org/insightboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} InsightBoard BI Analytics. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/privacy-policy"
                onClick={(e) => {
                  if (onOpenPrivacyPolicy) {
                    e.preventDefault();
                    onOpenPrivacyPolicy();
                  }
                }}
                className="hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-and-conditions"
                onClick={(e) => {
                  if (onOpenTerms) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                className="hover:text-slate-300 transition-colors"
              >
                Terms &amp; Conditions
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">Security Compliant</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
