import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, AppConfig } from './config/index.js';
import { InMemoryStore } from './storage/in-memory-store.js';
import { IDataStore } from './storage/data-store.interface.js';
import { AnomalyDetector } from './services/anomaly-detector.js';
import { NotificationService } from './services/notification.service.js';
import { SensorService } from './services/sensor.service.js';
import { UserService } from './services/user.service.js';
import { RoomService } from './services/room.service.js';
import { SensorController } from './controllers/sensor.controller.js';
import { AlertController } from './controllers/alert.controller.js';
import { UserController } from './controllers/user.controller.js';
import { RoomController } from './controllers/room.controller.js';
import { LegacyController } from './controllers/legacy.controller.js';
import { createApiRouter } from './routes/api.routes.js';
import { createLegacyRouter } from './routes/legacy.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export interface AppContext {
  app: Express;
  dataStore: IDataStore;
  sensorService: SensorService;
  userService: UserService;
  roomService: RoomService;
  anomalyDetector: AnomalyDetector;
}

export function createApp(customConfig: Partial<AppConfig> = {}, customStore?: IDataStore): AppContext {
  const mergedConfig = { ...config, ...customConfig };
  const dataStore = customStore || new InMemoryStore();

  const notificationService = new NotificationService();
  const anomalyDetector = new AnomalyDetector(dataStore, mergedConfig.thresholds);
  const sensorService = new SensorService(
    dataStore,
    anomalyDetector,
    notificationService,
    mergedConfig.thresholds
  );
  const userService = new UserService(dataStore, notificationService);
  const roomService = new RoomService(dataStore);

  const sensorController = new SensorController(sensorService);
  const alertController = new AlertController(dataStore);
  const userController = new UserController(userService);
  const roomController = new RoomController(roomService);
  const legacyController = new LegacyController(sensorService, userService, dataStore);

  const app = express();

  // Security & standard middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: mergedConfig.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (mergedConfig.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: Date.now(),
      service: 'smart-home-iot-backend',
      version: '2.0.0',
    });
  });

  // Modern REST API
  app.use('/api/v1', createApiRouter(
    sensorController,
    alertController,
    userController,
    roomController,
    legacyController
  ));

  // Backward compatible legacy routes (/u/users, /u/state, /u/device)
  app.use('/u', createLegacyRouter(legacyController));

  // Serve static client build if present (for single-server fullstack deployment)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.resolve(__dirname, '../../client/dist');

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/u') ||
        req.path.startsWith('/health')
      ) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    dataStore,
    sensorService,
    userService,
    roomService,
    anomalyDetector,
  };
}
