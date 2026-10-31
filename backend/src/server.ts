import { createApp } from './app.js';
import { config } from './config/index.js';

const context = createApp();
const { app, userService, sensorService, roomService } = context;

// Seed initial demo data for quick startup
async function seedInitialData() {
  try {
    const existingUsers = await userService.getAllUsers();
    if (existingUsers.length === 0) {
      const demoUser = await userService.registerUser({
        id: 'DEMO-OTRK-999',
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        contact: '+1-555-0199',
        profession: 'Software Engineer',
        gender: 'Non-binary',
        dob: '1992-04-15',
      });
      console.log(`[SEED] Created default user with OTRK token: ${demoUser.id}`);

      // Seed baseline normal sensor reading
      await sensorService.ingestReading({
        temp: 72.5,
        humidity: 42.0,
        light: 210,
        motion: false,
        ax: 0.02,
        ay: -0.01,
        az: 9.81,
      });
      console.log('[SEED] Baseline sensor telemetry ingested.');
    }
  } catch (error) {
    console.warn('[SEED] Notice during initial data seeding:', error);
  }
}

const server = app.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(` Smart Home IoT Backend running on port ${config.port}`);
  console.log(` Health Check: http://localhost:${config.port}/health`);
  console.log(` API Base:     http://localhost:${config.port}/api/v1`);
  console.log(` Legacy Base:  http://localhost:${config.port}/u`);
  console.log(`====================================================`);
  await seedInitialData();
});

export default server;
