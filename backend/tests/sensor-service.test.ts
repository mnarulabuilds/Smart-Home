import { describe, it, expect, beforeEach } from 'vitest';
import { SensorService } from '../src/services/sensor.service.js';
import { AnomalyDetector } from '../src/services/anomaly-detector.js';
import { NotificationService } from '../src/services/notification.service.js';
import { InMemoryStore } from '../src/storage/in-memory-store.js';

describe('SensorService', () => {
  let store: InMemoryStore;
  let detector: AnomalyDetector;
  let notifier: NotificationService;
  let sensorService: SensorService;

  beforeEach(() => {
    store = new InMemoryStore();
    detector = new AnomalyDetector(store, {
      tempThreshold: 125,
      humThreshold: 30,
      lightThreshold: 375,
      powerWasteMinReadings: 3,
      retentionWindowMs: 60000, // 60 seconds for test
    });
    notifier = new NotificationService();
    sensorService = new SensorService(
      store,
      detector,
      notifier,
      {
        tempThreshold: 125,
        humThreshold: 30,
        lightThreshold: 375,
        powerWasteMinReadings: 3,
        retentionWindowMs: 60000,
      }
    );
  });

  it('should ingest and store sensor readings with proper types', async () => {
    const result = await sensorService.ingestReading({
      temp: 72.4,
      humidity: 45.2,
      light: 300,
      motion: true,
      ax: 0.1,
      ay: 0.2,
      az: 9.8,
    });

    expect(result.reading).toBeDefined();
    expect(result.reading.temp).toBe(72.4);
    expect(result.reading.humidity).toBe(45.2);
    expect(result.reading.light).toBe(300);
    expect(result.reading.motion).toBe(true);
    expect(result.reading.latestMovement).toBeGreaterThan(0);

    const latest = await sensorService.getLatest();
    expect(latest?.temp).toBe(72.4);
  });

  it('should handle legacy string booleans ("true"/"false")', async () => {
    const result = await sensorService.ingestReading({
      temp: 70,
      humidity: 50,
      light: 200,
      inDoorMotion: 'true' as any,
    });

    expect(result.reading.motion).toBe(true);
  });

  it('should compute statistical aggregations correctly', async () => {
    const now = Date.now();
    await store.saveSensorReading({
      temp: 60,
      humidity: 30,
      light: 100,
      motion: false,
      latestMovement: 0,
      timestamp: now - 3000,
    });
    await store.saveSensorReading({
      temp: 80,
      humidity: 50,
      light: 300,
      motion: false,
      latestMovement: 0,
      timestamp: now - 1000,
    });

    const stats = await sensorService.getSensorStats(1);
    expect(stats).toBeDefined();
    expect(stats?.sampleCount).toBe(2);
    expect(stats?.temp.min).toBe(60);
    expect(stats?.temp.max).toBe(80);
    expect(stats?.temp.avg).toBe(70);
    expect(stats?.humidity.avg).toBe(40);
    expect(stats?.light.avg).toBe(200);
  });

  it('should prune data older than retention window', async () => {
    const now = Date.now();
    // Add old reading (older than 60s)
    await store.saveSensorReading({
      temp: 50,
      humidity: 50,
      light: 50,
      motion: false,
      latestMovement: 0,
      timestamp: now - 120000, // 2 minutes ago
    });

    // Ingest new reading at `now`
    await sensorService.ingestReading({
      temp: 72,
      humidity: 45,
      light: 200,
      timestamp: now,
    });

    const history = await sensorService.getHistory(100);
    // Old reading should be pruned
    expect(history.find((r) => r.timestamp === now - 120000)).toBeUndefined();
    expect(history).toHaveLength(1);
  });
});
