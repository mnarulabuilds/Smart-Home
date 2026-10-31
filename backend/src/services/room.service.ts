import { IDataStore } from '../storage/data-store.interface.js';
import { RoomOccupancy, User } from '../types/index.js';

export class RoomService {
  constructor(private dataStore: IDataStore) {}

  async getOccupancy(roomId: string = 'default'): Promise<RoomOccupancy> {
    return this.dataStore.getRoomOccupancy(roomId);
  }

  async toggleUserPresence(
    userId: string,
    roomId: string = 'default'
  ): Promise<{ occupancy: RoomOccupancy; isPresent: boolean }> {
    const current = await this.dataStore.getRoomOccupancy(roomId);
    const isCurrentlyPresent = current.members.includes(userId);
    const newPresence = !isCurrentlyPresent;

    const updated = await this.dataStore.setRoomMember(roomId, userId, newPresence);
    return { occupancy: updated, isPresent: newPresence };
  }

  async setUserPresence(
    userId: string,
    isPresent: boolean,
    roomId: string = 'default'
  ): Promise<RoomOccupancy> {
    return this.dataStore.setRoomMember(roomId, userId, isPresent);
  }

  async getOccupantDetails(roomId: string = 'default'): Promise<User[]> {
    const occupancy = await this.dataStore.getRoomOccupancy(roomId);
    const users: User[] = [];

    for (const userId of occupancy.members) {
      const u = await this.dataStore.getUserById(userId);
      if (u) {
        users.push(u);
      }
    }

    return users;
  }
}
