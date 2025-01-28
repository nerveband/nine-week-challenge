import { db } from '../FatLossDB';
import { pocketBaseService } from '@/services/PocketBaseService';
import type { UserProfile, DailyTracking, WeeklySummary, Measurements } from '@/types';

export async function migrateToNewDatabase() {
  if (!pocketBaseService.isAuthenticated) {
    throw new Error('Not authenticated with PocketBase');
  }

  try {
    // Create a user first
    const user = await pocketBaseService.client.collection('users').create({
      email: process.env.POCKETBASE_EMAIL,
      password: process.env.POCKETBASE_PASSWORD,
      passwordConfirm: process.env.POCKETBASE_PASSWORD,
      name: 'Admin User'
    });

    // Migrate User Profiles
    const userProfiles = await db.userProfiles.toArray();
    for (const profile of userProfiles) {
      await pocketBaseService.client.collection('userProfiles').create({
        ...profile,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Daily Tracking
    const dailyTracking = await db.dailyTracking.toArray();
    for (const tracking of dailyTracking) {
      await pocketBaseService.client.collection('dailyTracking').create({
        ...tracking,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Weekly Summaries
    const weeklySummaries = await db.weeklySummaries.toArray();
    for (const summary of weeklySummaries) {
      await pocketBaseService.client.collection('weeklySummaries').create({
        ...summary,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Measurements
    const measurements = await db.measurements.toArray();
    for (const measurement of measurements) {
      await pocketBaseService.client.collection('measurements').create({
        ...measurement,
        id: undefined,
        user: user.id
      });
    }

    // Migrate User Goals
    const userGoals = await db.userGoals.toArray();
    for (const goals of userGoals) {
      await pocketBaseService.client.collection('userGoals').create({
        ...goals,
        id: undefined,
        user: user.id
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}

export async function verifyPocketBaseMigration() {
  if (!pocketBaseService.isAuthenticated) {
    throw new Error('Not authenticated with PocketBase');
  }

  try {
    // Get the user
    const users = await pocketBaseService.client.collection('users').getFullList();
    if (users.length === 0) {
      throw new Error('No users found');
    }
    const userId = users[0].id;

    // Verify User Profiles
    const oldUserProfiles = await db.userProfiles.toArray();
    const newUserProfiles = await pocketBaseService.client.collection('userProfiles').getFullList({
      filter: `user = "${userId}"`
    });
    if (oldUserProfiles.length !== newUserProfiles.length) {
      throw new Error('User profiles count mismatch');
    }

    // Verify Daily Tracking
    const oldDailyTracking = await db.dailyTracking.toArray();
    const newDailyTracking = await pocketBaseService.client.collection('dailyTracking').getFullList({
      filter: `user = "${userId}"`
    });
    if (oldDailyTracking.length !== newDailyTracking.length) {
      throw new Error('Daily tracking count mismatch');
    }

    // Verify Weekly Summaries
    const oldWeeklySummaries = await db.weeklySummaries.toArray();
    const newWeeklySummaries = await pocketBaseService.client.collection('weeklySummaries').getFullList({
      filter: `user = "${userId}"`
    });
    if (oldWeeklySummaries.length !== newWeeklySummaries.length) {
      throw new Error('Weekly summaries count mismatch');
    }

    // Verify Measurements
    const oldMeasurements = await db.measurements.toArray();
    const newMeasurements = await pocketBaseService.client.collection('measurements').getFullList({
      filter: `user = "${userId}"`
    });
    if (oldMeasurements.length !== newMeasurements.length) {
      throw new Error('Measurements count mismatch');
    }

    // Verify User Goals
    const oldUserGoals = await db.userGoals.toArray();
    const newUserGoals = await pocketBaseService.client.collection('userGoals').getFullList({
      filter: `user = "${userId}"`
    });
    if (oldUserGoals.length !== newUserGoals.length) {
      throw new Error('User goals count mismatch');
    }

    return { success: true };
  } catch (error) {
    console.error('Migration verification failed:', error);
    return { success: false, error };
  }
}

export async function clearPocketBaseData() {
  if (!pocketBaseService.isAuthenticated) {
    throw new Error('Not authenticated with PocketBase');
  }

  try {
    const collections = [
      'userGoals',
      'measurements',
      'weeklySummaries',
      'dailyTracking',
      'userProfiles',
      'users'
    ];

    for (const collection of collections) {
      const records = await pocketBaseService.client.collection(collection).getFullList();
      await Promise.all(records.map(record => 
        pocketBaseService.client.collection(collection).delete(record.id)
      ));
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to clear PocketBase data:', error);
    return { success: false, error };
  }
} 