import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  constructor(private userService: UserService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.registerUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: `User with key '${id}' not found`,
        });
        return;
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  registerDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, token } = req.body;
      const updated = await this.userService.registerDeviceToken(userId, token);
      if (!updated) {
        res.status(404).json({
          success: false,
          error: `User '${userId}' not found`,
        });
        return;
      }
      res.json({
        success: true,
        message: 'Device token registered successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
