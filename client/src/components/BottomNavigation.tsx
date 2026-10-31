import React from 'react';
import { useApp } from '../context/AppContext.js';
import { Home, Activity, Bell, DoorClosed, Sliders, User } from 'lucide-react';
import { ActiveTab } from '../types/index.js';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, activeAlerts, roomOccupancy } = useApp();

  const tabs: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { tab: 'sensors', label: 'Sensors', icon: <Activity className="w-5 h-5" /> },
    {
      tab: 'alerts',
      label: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: activeAlerts.length,
    },
    {
      tab: 'room',
      label: 'Room',
      icon: <DoorClosed className="w-5 h-5" />,
      badge: roomOccupancy?.isOccupied ? roomOccupancy.members.length : undefined,
    },
    { tab: 'simulator', label: 'Simulate', icon: <Sliders className="w-5 h-5" /> },
    { tab: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-6 h-16">
        {tabs.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center relative py-1 transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
