import { Alert, RoomOccupancy, SensorReading, SystemOverview, User } from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data !== undefined ? result.data : result;
}

export const api = {
  // System Overview
  async getSystemOverview(): Promise<SystemOverview> {
    return request<SystemOverview>('/system/overview');
  },

  // Sensors
  async getLatestSensor(): Promise<SensorReading | null> {
    return request<SensorReading | null>('/sensors/latest');
  },

  async getSensorHistory(limit: number = 30): Promise<SensorReading[]> {
    return request<SensorReading[]>(`/sensors/history?limit=${limit}`);
  },

  async postSensorReading(reading: Partial<SensorReading>): Promise<{ reading: SensorReading; alertsTriggered: Alert[] }> {
    const res = await fetch(`${API_BASE}/sensors/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    });
    if (!res.ok) throw new Error('Failed to post sensor reading');
    return res.json();
  },

  async simulateScenario(scenario: 'FIRE' | 'INTRUDER' | 'POWER_WASTE' | 'NORMAL'): Promise<{ reading: SensorReading; alertsTriggered: Alert[] }> {
    const res = await fetch(`${API_BASE}/sensors/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  // Alerts
  async getActiveAlerts(): Promise<Alert[]> {
    return request<Alert[]>('/alerts');
  },

  async getAllAlerts(limit: number = 50): Promise<Alert[]> {
    return request<Alert[]>(`/alerts/all?limit=${limit}`);
  },

  async resolveAlert(id: string): Promise<Alert> {
    return request<Alert>(`/alerts/${id}/resolve`, { method: 'POST' });
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    return request<Alert>(`/alerts/${id}/acknowledge`, { method: 'POST' });
  },

  // Room
  async getRoomOccupancy(): Promise<RoomOccupancy> {
    return request<RoomOccupancy>('/room');
  },

  async toggleRoomPresence(userId: string): Promise<{ occupancy: RoomOccupancy; isPresent: boolean }> {
    return request<{ occupancy: RoomOccupancy; isPresent: boolean }>('/room/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Users & OTRK
  async getUser(id: string): Promise<User> {
    return request<User>(`/users/${id}`);
  },

  async registerUser(userData: {
    name: string;
    email: string;
    contact: string;
    profession?: string;
    gender?: string;
    dob?: string;
    id?: string;
  }): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async registerDevice(userId: string, token: string): Promise<User> {
    return request<User>('/users/device', {
      method: 'POST',
      body: JSON.stringify({ userId, token }),
    });
  },
};
