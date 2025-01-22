import { db } from './FatLossDB';
import type { UserProfile, DailyTracking, WeeklySummary, Measurements } from '@/types';

export async function migrateFromLocalStorage() {
  try {
    // Migrate user profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      const profile: UserProfile = JSON.parse(storedProfile);
      await db.userProfiles.put(profile);
      localStorage.removeItem('user_profile');
    }

    // Migrate daily tracking
    const storedTracking = localStorage.getItem('daily_tracking');
    if (storedTracking) {
      const tracking: Record<string, DailyTracking> = JSON.parse(storedTracking);
      await db.dailyTracking.bulkPut(Object.values(tracking));
      localStorage.removeItem('daily_tracking');
    }

    // Migrate weekly summaries
    const storedSummaries = localStorage.getItem('weekly_summaries');
    if (storedSummaries) {
      const summaries: Record<number, WeeklySummary> = JSON.parse(storedSummaries);
      await db.weeklySummaries.bulkPut(Object.values(summaries));
      localStorage.removeItem('weekly_summaries');
    }

    // Migrate measurements
    const storedMeasurements = localStorage.getItem('measurements');
    if (storedMeasurements) {
      const measurements: Record<string, Measurements> = JSON.parse(storedMeasurements);
      await db.measurements.bulkPut(Object.values(measurements));
      localStorage.removeItem('measurements');
    }

    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during migration' 
    };
  }
}

export async function checkMigrationNeeded(): Promise<boolean> {
  // Check if any data exists in localStorage
  return !!(
    localStorage.getItem('user_profile') ||
    localStorage.getItem('daily_tracking') ||
    localStorage.getItem('weekly_summaries') ||
    localStorage.getItem('measurements')
  );
}

export async function verifyMigration() {
  const counts = {
    userProfiles: await db.userProfiles.count(),
    dailyTracking: await db.dailyTracking.count(),
    weeklySummaries: await db.weeklySummaries.count(),
    measurements: await db.measurements.count()
  };

  return {
    success: Object.values(counts).some(count => count > 0),
    counts
  };
} 