import { storage } from './storage';

async function seed() {
  try {
    await storage.initializeData();
    console.log('Demo tournaments seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo tournaments:', error);
    process.exit(1);
  }
}

seed();
