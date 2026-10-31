import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Navbar } from './components/Navbar.js';
import { BottomNavigation } from './components/BottomNavigation.js';
import { AlertBanner } from './components/AlertBanner.js';
import { DashboardView } from './components/views/DashboardView.js';
import { SensorsView } from './components/views/SensorsView.js';
import { AlertsView } from './components/views/AlertsView.js';
import { RoomView } from './components/views/RoomView.js';
import { ProfileView } from './components/views/ProfileView.js';
import { SimulatorView } from './components/views/SimulatorView.js';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderView = () => {
    switch (activeTab) {
      case 'sensors':
        return <SensorsView />;
      case 'alerts':
        return <AlertsView />;
      case 'room':
        return <RoomView />;
      case 'profile':
        return <ProfileView />;
      case 'simulator':
        return <SimulatorView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 pb-20 md:pb-8">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AlertBanner />
        {renderView()}
      </main>
      <BottomNavigation />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
