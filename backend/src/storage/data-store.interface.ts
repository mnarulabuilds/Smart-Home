import { Alert, SensorReading, User, RoomOccupancy } from '../types/index.js';

export interface IDataStore {
  // Sensor readings
  saveSensorReading(reading: SensorReading): Promise<SensorReading>;
  getLatestSensorReading(): Promise<SensorReading | null>;
  getSensorHistory(limit?: number, sinceTimestamp?: number): Promise<SensorReading[]>;
  pruneSensorReadings(olderThanTimestamp: number): Promise<number>;

  // Alerts
  saveAlert(alert: Omit<Alert, 'id'> | Alert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null>;
  getActiveAlerts(): Promise<Alert[]>;
  getAllAlerts(limit?: number): Promise<Alert[]>;
  getAlertByType(type: string): Promise<Alert | null>;
  resolveAlert(id: string): Promise<Alert | null>;

  // Users
  saveUser(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Room occupancy
  getRoomOccupancy(roomId?: string): Promise<RoomOccupancy>;
  setRoomMember(roomId: string, userId: string, isPresent: boolean): Promise<RoomOccupancy>;
  clearRoomMembers(roomId: string): Promise<RoomOccupancy>;

  // Reset / Clear (useful for testing)
  clear(): Promise<void>;
}
