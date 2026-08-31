import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Code2,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Settings,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboards' | 'query' | 'datasources' | 'explainer';
  setActiveTab: (tab: 'dashboards' | 'query' | 'datasources' | 'explainer') => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSettings: () => void;
  onGoToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenSettings,
  onGoToLanding
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={onGoToLanding}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                InsightBoard
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                BI Analytics
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboards')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'dashboards'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-300" />
              <span className="whitespace-nowrap">Dashboards</span>
            </button>

            <button
              onClick={() => setActiveTab('query')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'query'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-indigo-300" />
              <span className="whitespace-nowrap">Query Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('datasources')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'datasources'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 shrink-0 text-indigo-300" />
              <span className="whitespace-nowrap">Data Sources</span>
            </button>

            <button
              onClick={() => setActiveTab('explainer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'explainer'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="whitespace-nowrap">SQL &amp; Auto-Suggest Logic</span>
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors whitespace-nowrap"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-medium text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span
                        className={`capitalize font-semibold ${
                          user.role === 'admin' ? 'text-amber-400' : 'text-sky-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Role: {user.role.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 whitespace-nowrap"
                    >
                      <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                      Account Settings
                    </button>

                    {onGoToLanding && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onGoToLanding();
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 whitespace-nowrap"
                      >
                        <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                        Landing Page
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-800 hover:text-rose-300 flex items-center gap-2 border-t border-slate-800 mt-1 whitespace-nowrap"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('dashboards')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'dashboards' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboards</span>
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'query' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Query</span>
        </button>
        <button
          onClick={() => setActiveTab('datasources')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'datasources' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data</span>
        </button>
        <button
          onClick={() => setActiveTab('explainer')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'explainer' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Logic</span>
        </button>
      </div>
    </header>
  );
};
