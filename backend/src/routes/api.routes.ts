import { Router } from 'express';
import { SensorController } from '../controllers/sensor.controller.js';
import { AlertController } from '../controllers/alert.controller.js';
import { UserController } from '../controllers/user.controller.js';
import { RoomController } from '../controllers/room.controller.js';
import { LegacyController } from '../controllers/legacy.controller.js';
import {
  validateBody,
  IngestSensorSchema,
  CreateUserSchema,
  RegisterDeviceSchema,
  RoomPresenceSchema,
} from '../middleware/validator.js';

export function createApiRouter(
  sensorController: SensorController,
  alertController: AlertController,
  userController: UserController,
  roomController: RoomController,
  legacyController: LegacyController
): Router {
  const router = Router();

  // Sensors
  router.post('/sensors/reading', validateBody(IngestSensorSchema), sensorController.ingest);
  router.get('/sensors/latest', sensorController.getLatest);
  router.get('/sensors/history', sensorController.getHistory);
  router.get('/sensors/stats', sensorController.getStats);
  router.post('/sensors/simulate', sensorController.simulate);

  // Alerts
  router.get('/alerts', alertController.getActive);
  router.get('/alerts/all', alertController.getAll);
  router.post('/alerts/:id/resolve', alertController.resolve);
  router.post('/alerts/:id/acknowledge', alertController.acknowledge);

  // Users
  router.post('/users', validateBody(CreateUserSchema), userController.register);
  router.get('/users', userController.getAll);
  router.get('/users/:id', userController.getById);
  router.post('/users/device', validateBody(RegisterDeviceSchema), userController.registerDevice);

  // Room presence & occupancy
  router.get('/room', roomController.getOccupancy);
  router.post('/room/toggle', roomController.togglePresence);
  router.post('/room/presence', validateBody(RoomPresenceSchema), roomController.setPresence);

  // System
  router.get('/system/overview', legacyController.getSystemOverview);

  return router;
}
