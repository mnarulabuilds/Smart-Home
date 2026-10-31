import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert, RoomOccupancy, SensorReading, User, ActiveTab } from '../types/index.js';
import { api } from '../services/api.js';

interface AppContextType {
  // State
  currentUser: User | null;
  otrkKey: string;
  activeTab: ActiveTab;
  latestSensor: SensorReading | null;
  sensorHistory: SensorReading[];
  activeAlerts: Alert[];
  allAlerts: Alert[];
  roomOccupancy: RoomOccupancy | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setOtrkKey: (key: string) => void;
  loginWithOtrk: (key: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  toggleRoomPresence: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  simulateScenario: (scenario: 'FIRE' | 'INTRUDER' | 'POWER_WASTE' | 'NORMAL') => Promise<void>;
  registerNewUser: (user: { name: string; email: string; contact: string; profession?: string }) => Promise<User>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const OTRK_STORAGE_KEY = 'smarthome_otrk_key';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [otrkKey, setOtrkKeyState] = useState<string>(() => localStorage.getItem(OTRK_STORAGE_KEY) || 'DEMO-OTRK-999');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [latestSensor, setLatestSensor] = useState<SensorReading | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancy | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync OTRK to localStorage
  const setOtrkKey = (key: string) => {
    setOtrkKeyState(key);
    if (key) {
      localStorage.setItem(OTRK_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(OTRK_STORAGE_KEY);
    }
  };

  // Refresh entire data snapshot
  const refreshData = useCallback(async () => {
    try {
      const [overview, history, allAlertsList] = await Promise.all([
        api.getSystemOverview().catch(() => null),
        api.getSensorHistory(25).catch(() => []),
        api.getAllAlerts(30).catch(() => []),
      ]);

      if (overview) {
        setIsConnected(true);
        setLatestSensor(overview.latestSensorReading);
        setActiveAlerts(overview.activeAlerts);
        setRoomOccupancy(overview.roomOccupancy);
        setError(null);
      } else {
        setIsConnected(false);
      }

      setSensorHistory(history);
      setAllAlerts(allAlertsList);
    } catch (err: any) {
      console.warn('Sync error:', err);
      setIsConnected(false);
      setError(err.message || 'Failed to sync with backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user by OTRK
  const loginWithOtrk = async (key: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const user = await api.getUser(key.trim());
      if (user) {
        setCurrentUser(user);
        setOtrkKey(key.trim());
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('OTRK login failed:', err);
      setError(`Key '${key}' not found in registry.`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setOtrkKey('');
  };

  // Toggle room presence
  const toggleRoomPresence = async () => {
    const userId = otrkKey || 'DEMO-OTRK-999';
    try {
      const result = await api.toggleRoomPresence(userId);
      setRoomOccupancy(result.occupancy);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle room presence');
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve alert');
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge alert');
    }
  };

  // Run simulation
  const simulateScenario = async (scenario: 'FIRE' | 'INTRUDER' | 'POWER_WASTE' | 'NORMAL') => {
    try {
      await api.simulateScenario(scenario);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to run scenario');
    }
  };

  // Register new user
  const registerNewUser = async (user: { name: string; email: string; contact: string; profession?: string }) => {
    const created = await api.registerUser(user);
    setCurrentUser(created);
    setOtrkKey(created.id);
    await refreshData();
    return created;
  };

  // Initial load
  useEffect(() => {
    refreshData();
    if (otrkKey) {
      api.getUser(otrkKey)
        .then((u) => setCurrentUser(u))
        .catch(() => setCurrentUser(null));
    }

    // Polling interval (3 seconds)
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [refreshData, otrkKey]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        otrkKey,
        activeTab,
        latestSensor,
        sensorHistory,
        activeAlerts,
        allAlerts,
        roomOccupancy,
        isConnected,
        isLoading,
        error,
        setActiveTab,
        setOtrkKey,
        loginWithOtrk,
        logout,
        refreshData,
        toggleRoomPresence,
        resolveAlert,
        acknowledgeAlert,
        simulateScenario,
        registerNewUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
