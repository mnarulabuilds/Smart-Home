import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Express } from 'express';

describe('HTTP API Endpoints', () => {
  let app: Express;

  beforeEach(() => {
    const context = createApp({ nodeEnv: 'test' });
    app = context.app;
  });

  it('GET /health returns 200 and UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('smart-home-iot-backend');
  });

  describe('Sensors API', () => {
    it('POST /api/v1/sensors/reading accepts valid sensor data', async () => {
      const res = await request(app)
        .post('/api/v1/sensors/reading')
        .send({
          temp: 72,
          humidity: 40,
          light: 250,
          motion: false,
          ax: 0.1,
          ay: -0.1,
          az: 9.8,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.temp).toBe(72);
      expect(res.body.data.humidity).toBe(40);
    });

    it('POST /api/v1/sensors/reading rejects invalid sensor data (400)', async () => {
      const res = await request(app)
        .post('/api/v1/sensors/reading')
        .send({
          temp: 'not-a-number',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });

    it('GET /api/v1/sensors/latest returns current reading', async () => {
      await request(app)
        .post('/api/v1/sensors/reading')
        .send({ temp: 68, humidity: 45, light: 180, motion: false });

      const res = await request(app).get('/api/v1/sensors/latest');
      expect(res.status).toBe(200);
      expect(res.body.data.temp).toBe(68);
    });

    it('POST /api/v1/sensors/simulate triggers specific scenario', async () => {
      const res = await request(app)
        .post('/api/v1/sensors/simulate')
        .send({ scenario: 'FIRE' });

      expect(res.status).toBe(201);
      expect(res.body.scenario).toBe('FIRE');
      expect(res.body.data.temp).toBe(135);
      expect(res.body.alertsTriggered.length).toBeGreaterThan(0);
      expect(res.body.alertsTriggered[0].type).toBe('FIRE_ALERT');
    });
  });

  describe('Alerts API', () => {
    it('GET /api/v1/alerts returns triggered alerts and POST /resolve works', async () => {
      // Trigger fire alert
      const simRes = await request(app)
        .post('/api/v1/sensors/simulate')
        .send({ scenario: 'FIRE' });

      const alertId = simRes.body.alertsTriggered[0].id;

      const alertsRes = await request(app).get('/api/v1/alerts');
      expect(alertsRes.status).toBe(200);
      expect(alertsRes.body.count).toBeGreaterThan(0);

      // Resolve alert
      const resolveRes = await request(app).post(`/api/v1/alerts/${alertId}/resolve`);
      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.status).toBe('RESOLVED');

      // Now active alerts count should decrease
      const activeAfter = await request(app).get('/api/v1/alerts');
      expect(activeAfter.body.data.find((a: any) => a.id === alertId)).toBeUndefined();
    });
  });

  describe('Users API', () => {
    it('POST /api/v1/users registers user with validation', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@resistance.org',
          contact: '555-0144',
          profession: 'Security Specialist',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('Sarah Connor');
    });

    it('POST /api/v1/users/device registers FCM token', async () => {
      const userRes = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'John Connor',
          email: 'john@resistance.org',
          contact: '555-0145',
        });

      const userId = userRes.body.data.id;

      const devRes = await request(app)
        .post('/api/v1/users/device')
        .send({
          userId,
          token: 'FCM_MOCK_TOKEN_999',
        });

      expect(devRes.status).toBe(200);
      expect(devRes.body.data.deviceToken).toBe('FCM_MOCK_TOKEN_999');
    });
  });

  describe('Room Presence API', () => {
    it('POST /api/v1/room/toggle toggles occupancy', async () => {
      const res = await request(app)
        .post('/api/v1/room/toggle')
        .send({ userId: 'USER_KYLE' });

      expect(res.status).toBe(200);
      expect(res.body.data.isPresent).toBe(true);
      expect(res.body.data.occupancy.isOccupied).toBe(true);

      const res2 = await request(app)
        .post('/api/v1/room/toggle')
        .send({ userId: 'USER_KYLE' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.isPresent).toBe(false);
      expect(res2.body.data.occupancy.isOccupied).toBe(false);
    });
  });

  describe('Legacy Endpoints Backward Compatibility', () => {
    it('GET /u/users creates user from query params', async () => {
      const res = await request(app).get(
        '/u/users?name=LegacyUser&email=legacy@user.com&contact=1234567890'
      );
      expect(res.status).toBe(200);
      expect(res.text).toContain('Smart Home IoT Admin created User');
    });

    it('GET /u/state ingests sensor data from query params', async () => {
      const res = await request(app).get(
        '/u/state?temp=75&humidity=45&light=200&inDoorMotion=false'
      );
      expect(res.status).toBe(200);
      expect(res.text).toContain('Data saved successfully');
    });

    it('GET /u/device registers device token from query params', async () => {
      // First create user
      const userRes = await request(app)
        .post('/api/v1/users')
        .send({ name: 'DevUser', email: 'dev@user.com', contact: '12345' });

      const otrId = userRes.body.data.id;

      const res = await request(app).get(
        `/u/device?fcm_token=TEST_FCM_TOKEN&id_otr=${otrId}`
      );
      expect(res.status).toBe(200);
      expect(res.text).toContain('Registration End Point: OK');
    });
  });

  describe('System Overview API', () => {
    it('GET /api/v1/system/overview aggregates complete system snapshot', async () => {
      const res = await request(app).get('/api/v1/system/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomOccupancy).toBeDefined();
      expect(res.body.data.serverUptime).toBeGreaterThanOrEqual(0);
    });
  });
});
