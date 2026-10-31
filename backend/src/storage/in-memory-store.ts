import { IDataStore } from './data-store.interface.js';
import { Alert, SensorReading, User, RoomOccupancy } from '../types/index.js';

export class InMemoryStore implements IDataStore {
  private sensorReadings: SensorReading[] = [];
  private alerts: Map<string, Alert> = new Map();
  private users: Map<string, User> = new Map();
  private roomOccupancy: Map<string, Set<string>> = new Map();

  constructor() {
    // Default main room
    this.roomOccupancy.set('default', new Set<string>());
  }

  // --- Sensor readings ---

  async saveSensorReading(reading: SensorReading): Promise<SensorReading> {
    const saved: SensorReading = {
      ...reading,
      id: reading.id || `sensor_${reading.timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.sensorReadings.push(saved);
    // Sort chronologically
    this.sensorReadings.sort((a, b) => a.timestamp - b.timestamp);
    return saved;
  }

  async getLatestSensorReading(): Promise<SensorReading | null> {
    if (this.sensorReadings.length === 0) return null;
    return this.sensorReadings[this.sensorReadings.length - 1];
  }

  async getSensorHistory(limit: number = 100, sinceTimestamp?: number): Promise<SensorReading[]> {
    let list = this.sensorReadings;
    if (sinceTimestamp !== undefined) {
      list = list.filter((r) => r.timestamp >= sinceTimestamp);
    }
    return list.slice(-limit);
  }

  async pruneSensorReadings(olderThanTimestamp: number): Promise<number> {
    const initialCount = this.sensorReadings.length;
    this.sensorReadings = this.sensorReadings.filter((r) => r.timestamp >= olderThanTimestamp);
    return initialCount - this.sensorReadings.length;
  }

  // --- Alerts ---

  async saveAlert(alert: Omit<Alert, 'id'> | Alert): Promise<Alert> {
    const id = 'id' in alert && alert.id ? alert.id : `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAlert: Alert = {
      ...alert,
      id,
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    const existing = this.alerts.get(id);
    if (!existing) return null;
    const updated: Alert = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((a) => a.status === 'ACTIVE')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getAllAlerts(limit: number = 50): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getAlertByType(type: string): Promise<Alert | null> {
    for (const alert of this.alerts.values()) {
      if (alert.type === type && alert.status === 'ACTIVE') {
        return alert;
      }
    }
    return null;
  }

  async resolveAlert(id: string): Promise<Alert | null> {
    const existing = this.alerts.get(id);
    if (!existing) return null;
    existing.status = 'RESOLVED';
    existing.resolvedAt = Date.now();
    this.alerts.set(id, existing);
    return existing;
  }

  // --- Users ---

  async saveUser(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: User = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // --- Room occupancy ---

  async getRoomOccupancy(roomId: string = 'default'): Promise<RoomOccupancy> {
    const membersSet = this.roomOccupancy.get(roomId) || new Set<string>();
    const members = Array.from(membersSet);
    return {
      roomId,
      members,
      isOccupied: members.length > 0,
      lastChanged: Date.now(),
    };
  }

  async setRoomMember(roomId: string = 'default', userId: string, isPresent: boolean): Promise<RoomOccupancy> {
    let membersSet = this.roomOccupancy.get(roomId);
    if (!membersSet) {
      membersSet = new Set<string>();
      this.roomOccupancy.set(roomId, membersSet);
    }

    if (isPresent) {
      membersSet.add(userId);
    } else {
      membersSet.delete(userId);
    }

    return this.getRoomOccupancy(roomId);
  }

  async clearRoomMembers(roomId: string = 'default'): Promise<RoomOccupancy> {
    this.roomOccupancy.set(roomId, new Set<string>());
    return this.getRoomOccupancy(roomId);
  }

  // --- Reset ---

  async clear(): Promise<void> {
    this.sensorReadings = [];
    this.alerts.clear();
    this.users.clear();
    this.roomOccupancy.clear();
    this.roomOccupancy.set('default', new Set<string>());
  }
}
