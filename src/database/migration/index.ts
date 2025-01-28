import { migrateToNewDatabase, verifyPocketBaseMigration, clearPocketBaseData } from './pocketbaseMigration';
import { pocketBaseService } from '../../services/PocketBaseService';
import { db } from '../FatLossDB';

export { migrateToNewDatabase, verifyPocketBaseMigration, clearPocketBaseData };

export async function migrateToPocketBase(email: string, password: string) {
  try {
    // Login as admin first
    await pocketBaseService.loginAdmin(email, password);

    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated with PocketBase');
    }

    // Create a regular user with a different email
    const userEmail = 'user@example.com';
    const userPassword = 'userpassword123';
    
    let user;
    try {
      // Try to create a new user
      user = await pocketBaseService.client.collection('users').create({
        email: userEmail,
        password: userPassword,
        passwordConfirm: userPassword,
        name: 'Regular User'
      });
      console.log('Created new regular user:', user);
    } catch (error) {
      // If user exists, try to authenticate with it
      try {
        const authData = await pocketBaseService.client.collection('users').authWithPassword(userEmail, userPassword);
        user = authData.record;
        console.log('Using existing user:', user);
      } catch (authError) {
        throw new Error('Failed to create or authenticate user');
      }
    }

    // Clear existing data for this user
    try {
      const collections = ['userProfiles', 'dailyTracking', 'weeklySummaries', 'measurements'];
      for (const collection of collections) {
        const records = await pocketBaseService.client.collection(collection).getFullList({ filter: `user = "${user.id}"` });
        for (const record of records) {
          await pocketBaseService.client.collection(collection).delete(record.id);
        }
      }
      console.log('Cleared existing data for user');
    } catch (error) {
      console.log('No existing data to clear');
    }

    // Migrate User Profiles
    const userProfiles = await db.userProfiles.toArray();
    console.log('Migrating user profiles:', userProfiles.length);
    
    for (const profile of userProfiles) {
      await pocketBaseService.client.collection('userProfiles').create({
        ...profile,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Daily Tracking
    const dailyTracking = await db.dailyTracking.toArray();
    console.log('Migrating daily tracking:', dailyTracking.length);
    
    for (const tracking of dailyTracking) {
      await pocketBaseService.client.collection('dailyTracking').create({
        ...tracking,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Weekly Summaries
    const weeklySummaries = await db.weeklySummaries.toArray();
    console.log('Migrating weekly summaries:', weeklySummaries.length);
    
    for (const summary of weeklySummaries) {
      await pocketBaseService.client.collection('weeklySummaries').create({
        ...summary,
        id: undefined,
        user: user.id
      });
    }

    // Migrate Measurements
    const measurements = await db.measurements.toArray();
    console.log('Migrating measurements:', measurements.length);
    
    for (const measurement of measurements) {
      await pocketBaseService.client.collection('measurements').create({
        ...measurement,
        id: undefined,
        user: user.id
      });
    }

    // Migrate User Goals
    const userGoals = await db.userGoals.toArray();
    console.log('Migrating user goals:', userGoals.length);
    
    for (const goals of userGoals) {
      await pocketBaseService.client.collection('userGoals').create({
        ...goals,
        id: undefined,
        user: user.id
      });
    }

    console.log('Migration completed successfully');
    return { success: true, user: { email: userEmail, password: userPassword } };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
} 