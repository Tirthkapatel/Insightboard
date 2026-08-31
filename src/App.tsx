import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './components/LandingPage.js';
import { DashboardView } from './components/DashboardView.js';
import { QueryBuilder } from './components/QueryBuilder.js';
import { DataSourceManager } from './components/DataSourceManager.js';
import { SqlExplainerModal } from './components/SqlExplainerModal.js';
import { AuthModal } from './components/AuthModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage.js';
import { TermsPage } from './components/TermsPage.js';
import { LoginPage } from './components/LoginPage.js';
import { SignupPage } from './components/SignupPage.js';
import { DashboardSkeleton, DataSourceSkeleton, SqlExecutionSkeleton } from './components/Skeletons.js';
import { DataSource, Dashboard, DashboardChart, QueryConfig } from './types.js';

function MainApp() {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'privacy' | 'terms' | 'login' | 'signup'>(() => {
    const rawPath = window.location.pathname;
    const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
    const lastView = sessionStorage.getItem('ib_last_view');

    if (path === '/privacy-policy') return 'privacy';
    if (path === '/terms-and-conditions') return 'terms';
    if (path === '/login') return 'login';
    if (path === '/signup' || path === '/register' || path === '/create-account') return 'signup';
    if (path === '/app' || path === '/dashboard' || lastView === 'app') return 'app';
    return 'landing';
  });
  const [activeTab, setActiveTab] = useState<'dashboards' | 'query' | 'datasources' | 'explainer'>('dashboards');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>('');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Sync viewMode with auth state on initial load / change (unless on dedicated pages)
  useEffect(() => {
    if (isLoading) return;

    const rawPath = window.location.pathname;
    const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
    const lastView = sessionStorage.getItem('ib_last_view');

    if (path === '/privacy-policy') {
      setViewMode('privacy');
    } else if (path === '/terms-and-conditions') {
      setViewMode('terms');
    } else if (path === '/app' || path === '/dashboard' || (isAuthenticated && lastView === 'app')) {
      if (isAuthenticated) {
        window.history.replaceState({}, '', '/app');
        sessionStorage.setItem('ib_last_view', 'app');
        setViewMode('app');
      } else {
        window.history.replaceState({}, '', '/login');
        sessionStorage.setItem('ib_last_view', 'login');
        setViewMode('login');
      }
    } else if (path === '/login') {
      if (isAuthenticated) {
        window.history.replaceState({}, '', '/app');
        sessionStorage.setItem('ib_last_view', 'app');
        setViewMode('app');
      } else {
        setViewMode('login');
      }
    } else if (path === '/signup' || path === '/register' || path === '/create-account') {
      if (isAuthenticated) {
        window.history.replaceState({}, '', '/app');
        sessionStorage.setItem('ib_last_view', 'app');
        setViewMode('app');
      } else {
        setViewMode('signup');
      }
    } else {
      if (isAuthenticated && lastView === 'app') {
        window.history.replaceState({}, '', '/app');
        sessionStorage.setItem('ib_last_view', 'app');
        setViewMode('app');
      } else {
        setViewMode('landing');
      }
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    const handlePopState = () => {
      if (isLoading) return;

      const rawPath = window.location.pathname;
      const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
      const lastView = sessionStorage.getItem('ib_last_view');

      if (path === '/privacy-policy') {
        setViewMode('privacy');
      } else if (path === '/terms-and-conditions') {
        setViewMode('terms');
      } else if (path === '/app' || path === '/dashboard') {
        if (isAuthenticated) {
          sessionStorage.setItem('ib_last_view', 'app');
          setViewMode('app');
        } else {
          window.history.replaceState({}, '', '/login');
          sessionStorage.setItem('ib_last_view', 'login');
          setViewMode('login');
        }
      } else if (path === '/login') {
        if (isAuthenticated) {
          window.history.replaceState({}, '', '/app');
          sessionStorage.setItem('ib_last_view', 'app');
          setViewMode('app');
        } else {
          setViewMode('login');
        }
      } else if (path === '/signup' || path === '/register' || path === '/create-account') {
        if (isAuthenticated) {
          window.history.replaceState({}, '', '/app');
          sessionStorage.setItem('ib_last_view', 'app');
          setViewMode('app');
        } else {
          setViewMode('signup');
        }
      } else {
        sessionStorage.setItem('ib_last_view', 'landing');
        setViewMode('landing');
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoading, isAuthenticated]);

  // Always reset scroll to top on viewMode change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [viewMode]);

  const navigateToPrivacy = () => {
    window.history.pushState({}, '', '/privacy-policy');
    sessionStorage.setItem('ib_last_view', 'privacy');
    setViewMode('privacy');
    setAuthModalOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const navigateToTerms = () => {
    window.history.pushState({}, '', '/terms-and-conditions');
    sessionStorage.setItem('ib_last_view', 'terms');
    setViewMode('terms');
    setAuthModalOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    sessionStorage.setItem('ib_last_view', 'login');
    setAuthMode('login');
    setViewMode('login');
    setAuthModalOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const navigateToSignup = () => {
    window.history.pushState({}, '', '/signup');
    sessionStorage.setItem('ib_last_view', 'signup');
    setAuthMode('signup');
    setViewMode('signup');
    setAuthModalOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const navigateToApp = () => {
    window.history.pushState({}, '', '/app');
    sessionStorage.setItem('ib_last_view', 'app');
    setViewMode('app');
    setAuthModalOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    sessionStorage.setItem('ib_last_view', 'landing');
    setViewMode('landing');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Fetch Data Sources
  const fetchDs = async () => {
    if (!token) {
      setDataSources([]);
      return;
    }
    try {
      const res = await fetch('/api/datasources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDataSources(data.dataSources || []);
      } else {
        setDataSources([]);
      }
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
    }
  };

  // Fetch Dashboards
  const fetchDashboards = async () => {
    if (!token) {
      setDashboards([]);
      setActiveDashboardId('');
      return;
    }
    try {
      const res = await fetch('/api/dashboards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const dashes: Dashboard[] = data.dashboards || [];
        setDashboards(dashes);
        if (dashes.length > 0) {
          if (!activeDashboardId || !dashes.find((d) => d.id === activeDashboardId)) {
            setActiveDashboardId(dashes[0].id);
          }
        } else {
          setActiveDashboardId('');
        }
      } else {
        setDashboards([]);
        setActiveDashboardId('');
      }
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setInitialLoading(true);
      await Promise.all([fetchDs(), fetchDashboards()]);
      if (isMounted) {
        setInitialLoading(false);
      }
    };
    loadAll();
    return () => { isMounted = false; };
  }, [token]);

  const handleCreateDashboard = async (title: string, description: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return { success: false, error: 'Please log in to create a dashboard.' };
    }
    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          charts: []
        })
      });

      const data = await res.json();
      if (res.ok) {
        await fetchDashboards();
        if (data.dashboard) setActiveDashboardId(data.dashboard.id);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to create dashboard.' };
      }
    } catch (err: any) {
      console.error('Failed to create dashboard:', err);
      return { success: false, error: err.message || 'Failed to create dashboard.' };
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/dashboards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to delete dashboard:', err);
    }
  };

  const handleSaveChartToDashboard = async (
    chartTitle: string,
    queryConfig: QueryConfig,
    targetDashboardId: string
  ) => {
    if (!token) return;
    const targetDash = dashboards.find((d) => d.id === targetDashboardId) || dashboards[0];
    if (!targetDash) return;

    const newChart: DashboardChart = {
      id: `chart_${Date.now()}`,
      title: chartTitle,
      queryConfig,
      gridSpan: 'half'
    };

    const updatedCharts = [...targetDash.charts, newChart];

    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: targetDash.id,
          title: targetDash.title,
          description: targetDash.description,
          charts: updatedCharts
        })
      });

      if (res.ok) {
        await fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to add chart to dashboard:', err);
    }
  };

  const handleUpdateDashboardCharts = async (dashboardId: string, updatedCharts: DashboardChart[]) => {
    if (!token) return;
    const targetDash = dashboards.find((d) => d.id === dashboardId);
    if (!targetDash) return;

    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: targetDash.id,
          title: targetDash.title,
          description: targetDash.description,
          charts: updatedCharts
        })
      });

      if (res.ok) {
        await fetchDashboards();
      }
    } catch (err) {
      console.error('Failed to update dashboard charts:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-indigo-500 animate-spin border-2 border-white/80 border-t-transparent" />
          </div>
          <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full -z-10" />
        </div>
        <p className="text-xs font-medium text-slate-400 tracking-wide animate-pulse">
          Authenticating session...
        </p>
      </div>
    );
  }

  if (viewMode === 'login') {
    return (
      <LoginPage
        onNavigateToSignup={navigateToSignup}
        onBackToHome={navigateToHome}
        onNavigateToApp={navigateToApp}
        onNavigateToPrivacy={navigateToPrivacy}
        onNavigateToTerms={navigateToTerms}
      />
    );
  }

  if (viewMode === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={navigateToLogin}
        onBackToHome={navigateToHome}
        onNavigateToApp={navigateToApp}
        onNavigateToPrivacy={navigateToPrivacy}
        onNavigateToTerms={navigateToTerms}
      />
    );
  }

  if (viewMode === 'privacy') {
    return (
      <>
        <PrivacyPolicyPage onBack={navigateToHome} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
          onNavigateToApp={navigateToApp}
          onNavigateToPrivacy={navigateToPrivacy}
          onNavigateToTerms={navigateToTerms}
        />
      </>
    );
  }

  if (viewMode === 'terms') {
    return (
      <>
        <TermsPage onBack={navigateToHome} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
          onNavigateToApp={navigateToApp}
          onNavigateToPrivacy={navigateToPrivacy}
          onNavigateToTerms={navigateToTerms}
        />
      </>
    );
  }

  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <LandingPage
          onOpenAuth={(mode) => {
            if (mode === 'signup') {
              navigateToSignup();
            } else {
              navigateToLogin();
            }
          }}
          onExploreDemo={navigateToApp}
          isAuthenticated={isAuthenticated}
          onGoToApp={navigateToApp}
          onOpenPrivacyPolicy={navigateToPrivacy}
          onOpenTerms={navigateToTerms}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
          onNavigateToApp={navigateToApp}
          onNavigateToPrivacy={navigateToPrivacy}
          onNavigateToTerms={navigateToTerms}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => {
          if (mode === 'signup') {
            navigateToSignup();
          } else {
            navigateToLogin();
          }
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {initialLoading ? (
          activeTab === 'dashboards' ? (
            <DashboardSkeleton />
          ) : activeTab === 'datasources' ? (
            <DataSourceSkeleton />
          ) : activeTab === 'query' ? (
            <SqlExecutionSkeleton />
          ) : (
            <DashboardSkeleton />
          )
        ) : (
          <>
            {activeTab === 'dashboards' && (
              <DashboardView
                dashboards={dashboards}
                activeDashboardId={activeDashboardId}
                onSelectDashboard={setActiveDashboardId}
                onCreateDashboard={handleCreateDashboard}
                onDeleteDashboard={handleDeleteDashboard}
                onUpdateDashboardCharts={handleUpdateDashboardCharts}
                onNavigateToQueryBuilder={() => setActiveTab('query')}
              />
            )}

            {activeTab === 'query' && (
              <QueryBuilder
                dataSources={dataSources}
                dashboards={dashboards}
                onSaveChartToDashboard={handleSaveChartToDashboard}
                onNavigateToDataSources={() => setActiveTab('datasources')}
              />
            )}

            {activeTab === 'datasources' && (
              <DataSourceManager
                dataSources={dataSources}
                onRefreshDataSources={fetchDs}
                onNavigateToQueryBuilder={() => setActiveTab('query')}
              />
            )}

            {activeTab === 'explainer' && <SqlExplainerModal />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">InsightBoard</strong> • Metabase-style BI Analytics Project
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                navigateToPrivacy();
              }}
              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms-and-conditions"
              onClick={(e) => {
                e.preventDefault();
                navigateToTerms();
              }}
              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onNavigateToPrivacy={navigateToPrivacy}
        onNavigateToTerms={navigateToTerms}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
