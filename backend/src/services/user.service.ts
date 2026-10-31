import { IDataStore } from '../storage/data-store.interface.js';
import { INotificationService } from './notification.service.js';
import { User } from '../types/index.js';

export interface CreateUserInput {
  name: string;
  email: string;
  contact: string;
  gender?: string;
  dob?: string;
  profession?: string;
  ssn?: string;
  id?: string; // Optional custom OTRK
}

export class UserService {
  constructor(
    private dataStore: IDataStore,
    private notificationService: INotificationService,
    private maxUsers: number = 25
  ) {}

  async registerUser(input: CreateUserInput): Promise<User> {
    const existingUsers = await this.dataStore.getAllUsers();
    if (existingUsers.length >= this.maxUsers) {
      throw new Error(`User registration limit (${this.maxUsers}) reached.`);
    }

    // Generate unique OTRK (One Time Registration Key)
    const otrk = input.id || `OTRK_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const user: User = {
      id: otrk,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      contact: input.contact.trim(),
      gender: input.gender,
      dob: input.dob,
      profession: input.profession,
      ssn: input.ssn,
      createdAt: Date.now(),
    };

    const savedUser = await this.dataStore.saveUser(user);

    // Send welcome / key email
    await this.notificationService.sendRegistrationWelcome(savedUser, otrk);

    return savedUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.dataStore.getUserById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.dataStore.getAllUsers();
  }

  async registerDeviceToken(userId: string, token: string): Promise<User | null> {
    const user = await this.dataStore.getUserById(userId);
    if (!user) {
      return null;
    }
    return this.dataStore.updateUser(userId, { deviceToken: token });
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.dataStore.deleteUser(id);
  }
}
