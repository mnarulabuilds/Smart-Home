import { Alert, User } from '../types/index.js';

export interface INotificationService {
  sendAlertNotification(alert: Alert, targetUsers?: User[]): Promise<void>;
  sendRegistrationWelcome(user: User, otrkToken: string): Promise<void>;
}

export class NotificationService implements INotificationService {
  async sendAlertNotification(alert: Alert, targetUsers: User[] = []): Promise<void> {
    const formattedTime = new Date(alert.timestamp).toISOString();
    console.log(`[ALERT NOTIFICATION] [${alert.severity}] ${alert.title}: ${alert.message} (Time: ${formattedTime})`);

    for (const user of targetUsers) {
      if (user.deviceToken) {
        console.log(`[FCM PUSH] Dispatching push notification to device token: ${user.deviceToken.substring(0, 10)}... for user ${user.name}`);
      }
    }
  }

  async sendRegistrationWelcome(user: User, otrkToken: string): Promise<void> {
    console.log(`[EMAIL DISPATCH] To: ${user.email} | Subject: APP REGISTRATION SUCCESSFUL`);
    console.log(`[EMAIL BODY] Dear ${user.name}, your Smart Home One-Time Registration Key is: ${otrkToken}`);
  }
}
