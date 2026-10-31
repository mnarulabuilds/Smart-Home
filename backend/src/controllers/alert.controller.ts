import { Request, Response, NextFunction } from 'express';
import { IDataStore } from '../storage/data-store.interface.js';

export class AlertController {
  constructor(private dataStore: IDataStore) {}

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.dataStore.getActiveAlerts();
      res.json({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const alerts = await this.dataStore.getAllAlerts(limit);
      res.json({
        success: true,
        count: alerts.length,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  };

  resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resolved = await this.dataStore.resolveAlert(id);
      if (!resolved) {
        res.status(404).json({
          success: false,
          error: `Alert with id '${id}' not found`,
        });
        return;
      }
      res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: resolved,
      });
    } catch (error) {
      next(error);
    }
  };

  acknowledge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.dataStore.updateAlert(id, { status: 'ACKNOWLEDGED' });
      if (!updated) {
        res.status(404).json({
          success: false,
          error: `Alert with id '${id}' not found`,
        });
        return;
      }
      res.json({
        success: true,
        message: 'Alert acknowledged',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
