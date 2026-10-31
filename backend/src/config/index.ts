import dotenv from 'dotenv';
import { AnomalyThresholds } from '../types/index.js';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  databaseType: 'memory' | 'firebase';
  firebaseDatabaseUrl?: string;
  firebaseServiceAccount?: string;
  thresholds: AnomalyThresholds;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseType: (process.env.DATABASE_TYPE as 'memory' | 'firebase') || 'memory',
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
  thresholds: {
    tempThreshold: parseFloat(process.env.TEMP_THRESH || '125'),
    humThreshold: parseFloat(process.env.HUM_THRESH || '30'),
    lightThreshold: parseFloat(process.env.LIGHT_THRESH || '375'),
    powerWasteMinReadings: parseInt(process.env.POWER_WASTE_MIN_READINGS || '10', 10),
    retentionWindowMs: parseInt(process.env.RETENTION_WINDOW_MS || String(30 * 60 * 1000), 10),
  },
};
