import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service.js';

export class RoomController {
  constructor(private roomService: RoomService) {}

  getOccupancy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = (req.query.roomId as string) || 'default';
      const occupancy = await this.roomService.getOccupancy(roomId);
      const members = await this.roomService.getOccupantDetails(roomId);

      res.json({
        success: true,
        data: {
          ...occupancy,
          occupantDetails: members,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  togglePresence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, roomId } = req.body;
      const result = await this.roomService.toggleUserPresence(userId, roomId || 'default');
      res.json({
        success: true,
        message: result.isPresent ? 'User entered room' : 'User exited room',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  setPresence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, isPresent, roomId } = req.body;
      const occupancy = await this.roomService.setUserPresence(
        userId,
        Boolean(isPresent),
        roomId || 'default'
      );
      res.json({
        success: true,
        message: isPresent ? 'Presence recorded: inside' : 'Presence recorded: outside',
        data: occupancy,
      });
    } catch (error) {
      next(error);
    }
  };
}
