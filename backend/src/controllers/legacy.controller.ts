import { Request, Response, NextFunction } from 'express';
import { SensorService } from '../services/sensor.service.js';
import { UserService } from '../services/user.service.js';
import { IDataStore } from '../storage/data-store.interface.js';
import { SystemOverview } from '../types/index.js';

export class LegacyController {
  private startTime = Date.now();

  constructor(
    private sensorService: SensorService,
    private userService: UserService,
    private dataStore: IDataStore
  ) {}

  /**
   * Legacy GET /u/users
   * Fixes: No duplicate child_added listeners attached per request!
   */
  handleLegacyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query;
      const hasParams = q.name && q.email && q.contact;

      if (!hasParams) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send('No user specified or missing required parameters (name, email, contact)\n');
        return;
      }

      const user = await this.userService.registerUser({
        name: String(q.name),
        email: String(q.email),
        contact: String(q.contact),
        gender: q.gender ? String(q.gender) : undefined,
        dob: q.dob ? String(q.dob) : undefined,
        profession: q.profession ? String(q.profession) : undefined,
        ssn: q.ssn ? String(q.ssn) : undefined,
      });

      if (req.headers.accept?.includes('application/json')) {
        res.status(200).json({
          success: true,
          message: 'Smart Home IoT Admin created User',
          user,
        });
        return;
      }

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(`Smart Home IoT Admin created User\nToken: ${user.id}\n`);
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Legacy GET /u/state
   * Fixes: No nested child_added and value event listeners attached per request!
   */
  handleLegacyState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query;
      const hasSensorData = q.temp !== undefined || q.humidity !== undefined || q.light !== undefined;

      if (!hasSensorData) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send('Smart Home IoT Sensor Data push endpoint (idle)\n');
        return;
      }

      const result = await this.sensorService.ingestReading({
        temp: parseFloat(String(q.temp || '0')),
        humidity: parseFloat(String(q.humidity || '0')),
        light: parseFloat(String(q.light || '0')),
        inDoorMotion: q.inDoorMotion as any,
        outDoorMotion: q.outDoorMotion as any,
        ax: q.ax !== undefined ? parseFloat(String(q.ax)) : null,
        ay: q.ay !== undefined ? parseFloat(String(q.ay)) : null,
        az: q.az !== undefined ? parseFloat(String(q.az)) : null,
      });

      if (req.headers.accept?.includes('application/json')) {
        res.status(200).json({
          success: true,
          message: 'Sensor data saved',
          reading: result.reading,
          alerts: result.alerts,
        });
        return;
      }

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send('Smart Home IoT Sensor Data push endpoint\nData saved successfully.\n');
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Legacy GET /u/device
   * Accepts: ?fcm_token=...&id_otr=...
   */
  handleLegacyDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query;
      const fcmToken = q.fcm_token ? String(q.fcm_token) : undefined;
      const idOtr = q.id_otr ? String(q.id_otr) : undefined;

      if (!fcmToken || !idOtr) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(400).send('Missing fcm_token or id_otr\n');
        return;
      }

      await this.userService.registerDeviceToken(idOtr, fcmToken);

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send('Smart Home Device Registration End Point: OK\n');
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * GET /api/v1/system/overview
   */
  getSystemOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const latestReading = await this.sensorService.getLatest();
      const activeAlerts = await this.dataStore.getActiveAlerts();
      const roomOccupancy = await this.dataStore.getRoomOccupancy('default');
      const allUsers = await this.dataStore.getAllUsers();

      const overview: SystemOverview = {
        latestSensorReading: latestReading,
        activeAlerts,
        roomOccupancy,
        totalUsers: allUsers.length,
        serverUptime: Math.floor((Date.now() - this.startTime) / 1000),
      };

      res.json({
        success: true,
        data: overview,
      });
    } catch (error: any) {
      next(error);
    }
  };
}
