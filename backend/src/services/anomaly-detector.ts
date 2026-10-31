import { Alert, AnomalyThresholds, RoomOccupancy, SensorReading } from '../types/index.js';
import { IDataStore } from '../storage/data-store.interface.js';

export class AnomalyDetector {
  constructor(
    private dataStore: IDataStore,
    private thresholds: AnomalyThresholds
  ) {}

  /**
   * Analyzes the latest sensor reading in the context of recent history
   * and room occupancy to detect anomalies.
   */
  async detect(
    currentReading: SensorReading,
    roomOccupancy: RoomOccupancy
  ): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];

    // 1. FIRE ALERT DETECTION
    // High temperature combined with low humidity
    if (
      currentReading.temp >= this.thresholds.tempThreshold &&
      currentReading.humidity <= this.thresholds.humThreshold
    ) {
      const alert = await this.upsertAlert({
        type: 'FIRE_ALERT',
        severity: 'CRITICAL',
        title: 'FIRE IN ROOM',
        message: `Dangerous temperature (${currentReading.temp}°) and low humidity (${currentReading.humidity}%) detected. Activate sprinkler system if available!`,
        timestamp: currentReading.timestamp,
        status: 'ACTIVE',
        metadata: {
          sensorValues: {
            temp: currentReading.temp,
            humidity: currentReading.humidity,
          },
          roomOccupied: roomOccupancy.isOccupied,
        },
      });
      triggeredAlerts.push(alert);
    }

    // 2. INTRUDER ALERT DETECTION
    // Motion detected when room is empty (no authorized members registered as inside)
    if (currentReading.motion) {
      if (!roomOccupancy.isOccupied) {
        const alert = await this.upsertAlert({
          type: 'INTRUDER_ALERT',
          severity: 'CRITICAL',
          title: 'INTRUDER IN ROOM',
          message: 'Indoor motion detected while room is empty. Activate security system if available.',
          timestamp: currentReading.timestamp,
          status: 'ACTIVE',
          metadata: {
            sensorValues: {
              motion: true,
            },
            roomOccupied: false,
          },
        });
        triggeredAlerts.push(alert);
      }
    }

    // 3. POWER ALERT (ENERGY WASTE) DETECTION
    // High ambient light while room is empty over consecutive readings
    if (currentReading.light >= this.thresholds.lightThreshold) {
      // Fetch recent history
      const history = await this.dataStore.getSensorHistory(this.thresholds.powerWasteMinReadings * 2);
      
      if (!roomOccupancy.isOccupied && history.length >= this.thresholds.powerWasteMinReadings) {
        // Inspect the most recent N readings
        const recentSamples = history.slice(-this.thresholds.powerWasteMinReadings);
        const sustainedHighLight = recentSamples.every(
          (s) => s.light >= this.thresholds.lightThreshold
        );

        if (sustainedHighLight) {
          const alert = await this.upsertAlert({
            type: 'POWER_ALERT',
            severity: 'WARNING',
            title: 'POWER WASTE',
            message: `High light intensity (${currentReading.light} lux) sustained with no members in room. Activate Power Management System.`,
            timestamp: currentReading.timestamp,
            status: 'ACTIVE',
            metadata: {
              sensorValues: {
                light: currentReading.light,
              },
              roomOccupied: false,
              durationMs: currentReading.timestamp - recentSamples[0].timestamp,
            },
          });
          triggeredAlerts.push(alert);
        }
      }
    }

    return triggeredAlerts;
  }

  /**
   * Helper to update an existing active alert of the same type, or create a new one.
   * Prevents spamming duplicate active alerts.
   */
  private async upsertAlert(alertData: Omit<Alert, 'id'>): Promise<Alert> {
    const existingActive = await this.dataStore.getAlertByType(alertData.type);
    if (existingActive) {
      const updated = await this.dataStore.updateAlert(existingActive.id, {
        timestamp: alertData.timestamp,
        message: alertData.message,
        metadata: alertData.metadata,
      });
      return updated || existingActive;
    }

    return this.dataStore.saveAlert(alertData);
  }
}
