import { Router } from 'express';
import { LegacyController } from '../controllers/legacy.controller.js';

export function createLegacyRouter(legacyController: LegacyController): Router {
  const router = Router();

  // Legacy endpoints for backward compatibility with 2017 clients & firmware
  router.get('/users', legacyController.handleLegacyUser);
  router.get('/state', legacyController.handleLegacyState);
  router.get('/device', legacyController.handleLegacyDevice);

  return router;
}
