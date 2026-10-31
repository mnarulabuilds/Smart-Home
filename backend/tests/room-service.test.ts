import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService } from '../src/services/room.service.js';
import { InMemoryStore } from '../src/storage/in-memory-store.js';

describe('RoomService', () => {
  let store: InMemoryStore;
  let roomService: RoomService;

  beforeEach(() => {
    store = new InMemoryStore();
    roomService = new RoomService(store);
  });

  it('should start with empty room', async () => {
    const occupancy = await roomService.getOccupancy('default');
    expect(occupancy.isOccupied).toBe(false);
    expect(occupancy.members).toHaveLength(0);
  });

  it('should toggle presence when user enters and exits', async () => {
    const userId = 'USER_MAYANK';

    // Enter
    const enterResult = await roomService.toggleUserPresence(userId, 'default');
    expect(enterResult.isPresent).toBe(true);
    expect(enterResult.occupancy.isOccupied).toBe(true);
    expect(enterResult.occupancy.members).toContain(userId);

    // Exit
    const exitResult = await roomService.toggleUserPresence(userId, 'default');
    expect(exitResult.isPresent).toBe(false);
    expect(exitResult.occupancy.isOccupied).toBe(false);
    expect(exitResult.occupancy.members).not.toContain(userId);
  });

  it('should track multiple members accurately', async () => {
    await roomService.setUserPresence('USER_1', true, 'default');
    await roomService.setUserPresence('USER_2', true, 'default');

    let occupancy = await roomService.getOccupancy('default');
    expect(occupancy.members).toHaveLength(2);
    expect(occupancy.isOccupied).toBe(true);

    // One leaves
    await roomService.setUserPresence('USER_1', false, 'default');
    occupancy = await roomService.getOccupancy('default');
    expect(occupancy.members).toHaveLength(1);
    expect(occupancy.isOccupied).toBe(true);

    // Second leaves
    await roomService.setUserPresence('USER_2', false, 'default');
    occupancy = await roomService.getOccupancy('default');
    expect(occupancy.members).toHaveLength(0);
    expect(occupancy.isOccupied).toBe(false);
  });
});
