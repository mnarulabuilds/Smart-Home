import React from 'react';
import { useApp } from '../context/AppContext.js';
import { Home, ShieldCheck, Wifi, WifiOff, Bell, User, RefreshCw, Sliders } from 'lucide-react';
import { ActiveTab } from '../types/index.js';

export const Navbar: React.FC = () => {
  const { isConnected, activeAlerts, currentUser, otrkKey, activeTab, setActiveTab, refreshData, isLoading } = useApp();

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { tab: 'sensors', label: 'Sensors', icon: <ShieldCheck className="w-4 h-4" /> },
    { tab: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" />, badge: activeAlerts.length },
    { tab: 'room', label: 'Room Presence', icon: <ShieldCheck className="w-4 h-4" /> },
    { tab: 'simulator', label: 'IoT Simulator', icon: <Sliders className="w-4 h-4" /> },
    { tab: 'profile', label: 'Profile & OTRK', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Status */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">SmartHome</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.0
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 font-medium">Live Telemetry Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-rose-400 font-medium">Offline / Reconnecting</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 text-xs rounded-full font-bold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User & Refresh Action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              title="Refresh telemetry"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser ? currentUser.name : 'Guest User'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {otrkKey ? `${otrkKey.substring(0, 10)}...` : 'No OTRK key'}
                </p>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
