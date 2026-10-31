import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../src/services/user.service.js';
import { NotificationService } from '../src/services/notification.service.js';
import { InMemoryStore } from '../src/storage/in-memory-store.js';

describe('UserService', () => {
  let store: InMemoryStore;
  let notifier: NotificationService;
  let userService: UserService;

  beforeEach(() => {
    store = new InMemoryStore();
    notifier = new NotificationService();
    userService = new UserService(store, notifier, 3); // Cap at 3 for test
  });

  it('should register a new user with generated OTRK token', async () => {
    const user = await userService.registerUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      contact: '1234567890',
      profession: 'Engineer',
    });

    expect(user.id).toBeDefined();
    expect(user.id.startsWith('OTRK_')).toBe(true);
    expect(user.name).toBe('Jane Doe');
    expect(user.email).toBe('jane@example.com');

    const fetched = await userService.getUserById(user.id);
    expect(fetched?.name).toBe('Jane Doe');
  });

  it('should allow custom OTRK token if supplied', async () => {
    const user = await userService.registerUser({
      id: 'CUSTOM_KEY_123',
      name: 'Bob Smith',
      email: 'bob@example.com',
      contact: '9876543210',
    });

    expect(user.id).toBe('CUSTOM_KEY_123');
  });

  it('should register device token for user', async () => {
    const user = await userService.registerUser({
      name: 'Alice',
      email: 'alice@example.com',
      contact: '1122334455',
    });

    const updated = await userService.registerDeviceToken(user.id, 'FCM_SAMPLE_TOKEN_XYZ');
    expect(updated?.deviceToken).toBe('FCM_SAMPLE_TOKEN_XYZ');

    const check = await userService.getUserById(user.id);
    expect(check?.deviceToken).toBe('FCM_SAMPLE_TOKEN_XYZ');
  });

  it('should enforce maximum user limit', async () => {
    await userService.registerUser({ name: 'U1', email: 'u1@ex.com', contact: '111' });
    await userService.registerUser({ name: 'U2', email: 'u2@ex.com', contact: '222' });
    await userService.registerUser({ name: 'U3', email: 'u3@ex.com', contact: '333' });

    // 4th user should fail
    await expect(
      userService.registerUser({ name: 'U4', email: 'u4@ex.com', contact: '444' })
    ).rejects.toThrow(/User registration limit/);
  });
});
