import { Request, Response, NextFunction } from 'express';
import { SensorService } from '../services/sensor.service.js';

export class SensorController {
  constructor(private sensorService: SensorService) {}

  ingest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.sensorService.ingestReading(req.body);
      res.status(201).json({
        success: true,
        data: result.reading,
        alertsTriggered: result.alerts,
      });
    } catch (error) {
      next(error);
    }
  };

  getLatest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reading = await this.sensorService.getLatest();
      res.json({
        success: true,
        data: reading,
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const since = req.query.since ? parseInt(req.query.since as string, 10) : undefined;
      const history = await this.sensorService.getHistory(limit, since);
      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hours = parseInt(req.query.hours as string, 10) || 1;
      const stats = await this.sensorService.getSensorStats(hours);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  simulate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scenario } = req.body;
      let simulatedReading;

      switch (scenario) {
        case 'FIRE':
          simulatedReading = {
            temp: 135,
            humidity: 18,
            light: 220,
            motion: false,
            ax: 0.1,
            ay: 0.2,
            az: 9.8,
          };
          break;
        case 'INTRUDER':
          simulatedReading = {
            temp: 72,
            humidity: 45,
            light: 150,
            motion: true,
            ax: 1.4,
            ay: 2.1,
            az: 9.4,
          };
          break;
        case 'POWER_WASTE':
          simulatedReading = {
            temp: 74,
            humidity: 48,
            light: 480,
            motion: false,
            ax: 0,
            ay: 0,
            az: 9.8,
          };
          break;
        case 'NORMAL':
        default:
          simulatedReading = {
            temp: 70 + Math.round((Math.random() * 8 - 4) * 10) / 10,
            humidity: 45 + Math.round((Math.random() * 10 - 5) * 10) / 10,
            light: 220 + Math.round(Math.random() * 60 - 30),
            motion: Math.random() > 0.7,
            ax: Math.round((Math.random() * 0.4 - 0.2) * 100) / 100,
            ay: Math.round((Math.random() * 0.4 - 0.2) * 100) / 100,
            az: 9.8 + Math.round((Math.random() * 0.2 - 0.1) * 100) / 100,
          };
          break;
      }

      const result = await this.sensorService.ingestReading(simulatedReading);
      res.status(201).json({
        success: true,
        scenario: scenario || 'NORMAL',
        data: result.reading,
        alertsTriggered: result.alerts,
      });
    } catch (error) {
      next(error);
    }
  };
}
