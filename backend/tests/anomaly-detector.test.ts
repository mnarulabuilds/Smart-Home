import { describe, it, expect, beforeEach } from 'vitest';
import { AnomalyDetector } from '../src/services/anomaly-detector.js';
import { InMemoryStore } from '../src/storage/in-memory-store.js';
import { AnomalyThresholds, RoomOccupancy, SensorReading } from '../src/types/index.js';

describe('AnomalyDetector Service', () => {
  let store: InMemoryStore;
  let detector: AnomalyDetector;
  const thresholds: AnomalyThresholds = {
    tempThreshold: 125,
    humThreshold: 30,
    lightThreshold: 375,
    powerWasteMinReadings: 3,
    retentionWindowMs: 1800000,
  };

  const emptyRoom: RoomOccupancy = {
    roomId: 'default',
    members: [],
    isOccupied: false,
    lastChanged: Date.now(),
  };

  const occupiedRoom: RoomOccupancy = {
    roomId: 'default',
    members: ['USER_123'],
    isOccupied: true,
    lastChanged: Date.now(),
  };

  beforeEach(async () => {
    store = new InMemoryStore();
    detector = new AnomalyDetector(store, thresholds);
  });

  describe('Fire Alert Detection', () => {
    it('should trigger FIRE_ALERT when temp >= 125 and humidity <= 30', async () => {
      const reading: SensorReading = {
        temp: 130,
        humidity: 20,
        light: 200,
        motion: false,
        latestMovement: 0,
        timestamp: Date.now(),
      };

      const alerts = await detector.detect(reading, emptyRoom);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('FIRE_ALERT');
      expect(alerts[0].severity).toBe('CRITICAL');
      expect(alerts[0].title).toBe('FIRE IN ROOM');
    });

    it('should NOT trigger FIRE_ALERT if temperature is high but humidity is normal', async () => {
      const reading: SensorReading = {
        temp: 130,
        humidity: 50, // Humidity above 30
        light: 200,
        motion: false,
        latestMovement: 0,
        timestamp: Date.now(),
      };

      const alerts = await detector.detect(reading, emptyRoom);
      expect(alerts.find((a) => a.type === 'FIRE_ALERT')).toBeUndefined();
    });

    it('should NOT trigger FIRE_ALERT if humidity is low but temperature is normal', async () => {
      const reading: SensorReading = {
        temp: 72,
        humidity: 15,
        light: 200,
        motion: false,
        latestMovement: 0,
        timestamp: Date.now(),
      };

      const alerts = await detector.detect(reading, emptyRoom);
      expect(alerts.find((a) => a.type === 'FIRE_ALERT')).toBeUndefined();
    });
  });

  describe('Intruder Alert Detection', () => {
    it('should trigger INTRUDER_ALERT when motion is detected in an EMPTY room', async () => {
      const reading: SensorReading = {
        temp: 70,
        humidity: 45,
        light: 100,
        motion: true, // Motion detected
        latestMovement: Date.now(),
        timestamp: Date.now(),
      };

      const alerts = await detector.detect(reading, emptyRoom);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('INTRUDER_ALERT');
      expect(alerts[0].severity).toBe('CRITICAL');
    });

    it('should NOT trigger INTRUDER_ALERT when motion is detected in an OCCUPIED room', async () => {
      const reading: SensorReading = {
        temp: 70,
        humidity: 45,
        light: 100,
        motion: true,
        latestMovement: Date.now(),
        timestamp: Date.now(),
      };

      const alerts = await detector.detect(reading, occupiedRoom);
      expect(alerts.find((a) => a.type === 'INTRUDER_ALERT')).toBeUndefined();
    });
  });

  describe('Power Waste Alert Detection', () => {
    it('should trigger POWER_ALERT when light is sustained >= 375 in an empty room', async () => {
      const now = Date.now();
      // Pre-populate history with 3 readings with light >= 375
      for (let i = 0; i < 3; i++) {
        await store.saveSensorReading({
          temp: 70,
          humidity: 40,
          light: 400,
          motion: false,
          latestMovement: 0,
          timestamp: now - (3 - i) * 1000,
        });
      }

      const currentReading: SensorReading = {
        temp: 70,
        humidity: 40,
        light: 420,
        motion: false,
        latestMovement: 0,
        timestamp: now,
      };

      const alerts = await detector.detect(currentReading, emptyRoom);
      expect(alerts.some((a) => a.type === 'POWER_ALERT')).toBe(true);
    });

    it('should NOT trigger POWER_ALERT if room is occupied', async () => {
      const now = Date.now();
      for (let i = 0; i < 3; i++) {
        await store.saveSensorReading({
          temp: 70,
          humidity: 40,
          light: 400,
          motion: false,
          latestMovement: 0,
          timestamp: now - (3 - i) * 1000,
        });
      }

      const currentReading: SensorReading = {
        temp: 70,
        humidity: 40,
        light: 420,
        motion: false,
        latestMovement: 0,
        timestamp: now,
      };

      const alerts = await detector.detect(currentReading, occupiedRoom);
      expect(alerts.find((a) => a.type === 'POWER_ALERT')).toBeUndefined();
    });
  });

  describe('Alert Upsert & Deduplication', () => {
    it('should update existing active alert rather than creating a duplicate', async () => {
      const reading1: SensorReading = {
        temp: 130,
        humidity: 20,
        light: 200,
        motion: false,
        latestMovement: 0,
        timestamp: 1000,
      };

      const alerts1 = await detector.detect(reading1, emptyRoom);
      expect(alerts1).toHaveLength(1);
      const alertId = alerts1[0].id;

      const reading2: SensorReading = {
        temp: 135,
        humidity: 15,
        light: 200,
        motion: false,
        latestMovement: 0,
        timestamp: 2000,
      };

      const alerts2 = await detector.detect(reading2, emptyRoom);
      expect(alerts2).toHaveLength(1);
      expect(alerts2[0].id).toBe(alertId); // Reused same alert id
      expect(alerts2[0].timestamp).toBe(2000);

      const active = await store.getActiveAlerts();
      expect(active).toHaveLength(1);
    });
  });
});
