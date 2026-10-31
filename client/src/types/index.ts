export type AlertType = 'FIRE_ALERT' | 'INTRUDER_ALERT' | 'POWER_ALERT';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  status: AlertStatus;
  metadata?: {
    sensorValues?: {
      temp?: number;
      humidity?: number;
      light?: number;
      motion?: boolean;
    };
    durationMs?: number;
    roomOccupied?: boolean;
  };
  resolvedAt?: number;
}

export interface SensorReading {
  id?: string;
  temp: number;
  humidity: number;
  light: number;
  motion: boolean;
  outDoorMotion?: boolean;
  ax?: number | null;
  ay?: number | null;
  az?: number | null;
  latestMovement: number;
  timestamp: number;
}

export interface User {
  id: string; // OTRK
  name: string;
  email: string;
  contact: string;
  gender?: string;
  dob?: string;
  profession?: string;
  ssn?: string;
  deviceToken?: string | null;
  createdAt: number;
}

export interface RoomOccupancy {
  roomId: string;
  members: string[];
  isOccupied: boolean;
  lastChanged: number;
  occupantDetails?: User[];
}

export interface SystemOverview {
  latestSensorReading: SensorReading | null;
  activeAlerts: Alert[];
  roomOccupancy: RoomOccupancy;
  totalUsers: number;
  serverUptime: number;
}

export type ActiveTab = 'dashboard' | 'sensors' | 'alerts' | 'room' | 'profile' | 'simulator';
