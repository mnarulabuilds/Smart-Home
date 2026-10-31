import { IDataStore } from '../storage/data-store.interface.js';
import { AnomalyDetector } from './anomaly-detector.js';
import { INotificationService } from './notification.service.js';
import { Alert, AnomalyThresholds, SensorReading } from '../types/index.js';

export interface IngestSensorInput {
  temp: number;
  humidity: number;
  light: number;
  motion?: boolean;
  inDoorMotion?: boolean | string;
  outDoorMotion?: boolean | string;
  ax?: number | null;
  ay?: number | null;
  az?: number | null;
  timestamp?: number;
}

export class SensorService {
  constructor(
    private dataStore: IDataStore,
    private anomalyDetector: AnomalyDetector,
    private notificationService: INotificationService,
    private thresholds: AnomalyThresholds
  ) {}

  /**
   * Normalize, validate, and store a new sensor reading,
   * trigger anomaly analysis, and prune expired readings.
   */
  async ingestReading(input: IngestSensorInput, roomId: string = 'default'): Promise<{
    reading: SensorReading;
    alerts: Alert[];
  }> {
    const now = input.timestamp || Date.now();

    // Normalize motion (handling legacy boolean strings if present)
    let isMotion = false;
    if (typeof input.motion === 'boolean') {
      isMotion = input.motion;
    } else if (typeof input.inDoorMotion === 'boolean') {
      isMotion = input.inDoorMotion;
    } else if (typeof input.inDoorMotion === 'string') {
      isMotion = input.inDoorMotion.toLowerCase() === 'true';
    }

    // Determine latest movement timestamp
    const latestSensor = await this.dataStore.getLatestSensorReading();
    let lim = 0;
    if (isMotion) {
      lim = now;
    } else if (latestSensor) {
      lim = latestSensor.latestMovement;
    }

    const reading: SensorReading = {
      temp: Number(input.temp),
      humidity: Number(input.humidity),
      light: Number(input.light),
      motion: isMotion,
      outDoorMotion:
        typeof input.outDoorMotion === 'boolean'
          ? input.outDoorMotion
          : typeof input.outDoorMotion === 'string'
          ? input.outDoorMotion.toLowerCase() === 'true'
          : undefined,
      ax: input.ax !== undefined && input.ax !== null ? Number(input.ax) : null,
      ay: input.ay !== undefined && input.ay !== null ? Number(input.ay) : null,
      az: input.az !== undefined && input.az !== null ? Number(input.az) : null,
      latestMovement: lim,
      timestamp: now,
    };

    // Save reading
    const savedReading = await this.dataStore.saveSensorReading(reading);

    // Prune stale data beyond retention window
    const pruneCutoff = now - this.thresholds.retentionWindowMs;
    await this.dataStore.pruneSensorReadings(pruneCutoff);

    // Get current room occupancy to evaluate anomaly context
    const roomOccupancy = await this.dataStore.getRoomOccupancy(roomId);

    // Run anomaly detection
    const alerts = await this.anomalyDetector.detect(savedReading, roomOccupancy);

    // Notify on newly triggered/updated alerts
    if (alerts.length > 0) {
      const allUsers = await this.dataStore.getAllUsers();
      for (const alert of alerts) {
        await this.notificationService.sendAlertNotification(alert, allUsers);
      }
    }

    return {
      reading: savedReading,
      alerts,
    };
  }

  async getLatest(): Promise<SensorReading | null> {
    return this.dataStore.getLatestSensorReading();
  }

  async getHistory(limit: number = 50, since?: number): Promise<SensorReading[]> {
    return this.dataStore.getSensorHistory(limit, since);
  }

  async getSensorStats(hours: number = 1): Promise<{
    sampleCount: number;
    temp: { min: number; max: number; avg: number };
    humidity: { min: number; max: number; avg: number };
    light: { min: number; max: number; avg: number };
  } | null> {
    const since = Date.now() - hours * 60 * 60 * 1000;
    const history = await this.dataStore.getSensorHistory(1000, since);

    if (history.length === 0) return null;

    let minT = Infinity, maxT = -Infinity, sumT = 0;
    let minH = Infinity, maxH = -Infinity, sumH = 0;
    let minL = Infinity, maxL = -Infinity, sumL = 0;

    for (const r of history) {
      minT = Math.min(minT, r.temp);
      maxT = Math.max(maxT, r.temp);
      sumT += r.temp;

      minH = Math.min(minH, r.humidity);
      maxH = Math.max(maxH, r.humidity);
      sumH += r.humidity;

      minL = Math.min(minL, r.light);
      maxL = Math.max(maxL, r.light);
      sumL += r.light;
    }

    const n = history.length;
    return {
      sampleCount: n,
      temp: { min: round(minT), max: round(maxT), avg: round(sumT / n) },
      humidity: { min: round(minH), max: round(maxH), avg: round(sumH / n) },
      light: { min: round(minL), max: round(maxL), avg: round(sumL / n) },
    };
  }
}

function round(val: number): number {
  return Math.round(val * 10) / 10;
}
