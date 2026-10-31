import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const IngestSensorSchema = z.object({
  temp: z.coerce.number().min(-100).max(300),
  humidity: z.coerce.number().min(0).max(100),
  light: z.coerce.number().min(0).max(5000),
  motion: z.coerce.boolean().optional(),
  inDoorMotion: z.union([z.boolean(), z.string()]).optional(),
  outDoorMotion: z.union([z.boolean(), z.string()]).optional(),
  ax: z.coerce.number().nullable().optional(),
  ay: z.coerce.number().nullable().optional(),
  az: z.coerce.number().nullable().optional(),
  timestamp: z.coerce.number().optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(5, 'Contact must be at least 5 digits'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  profession: z.string().optional(),
  ssn: z.string().optional(),
  id: z.string().optional(),
});

export const RegisterDeviceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token: z.string().min(1, 'Device FCM token is required'),
});

export const RoomPresenceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  isPresent: z.boolean().optional(),
  roomId: z.string().optional(),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Query parameter validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
