import type { UserProfile } from '@/types';
import { db } from '../FatLossDB';

interface UserGoals {
  sleepHours: number;
  waterOz: number;
  steps: number;
}

export class UserProfileRepository {
  async get(id: string): Promise<UserProfile | undefined> {
    return db.userProfiles.get(id);
  }

  async save(profile: UserProfile): Promise<string> {
    await db.userProfiles.put(profile);
    return profile.id;
  }

  async delete(id: string): Promise<void> {
    await db.userProfiles.delete(id);
  }

  async getCurrentProfile(): Promise<UserProfile | undefined> {
    // For now, we'll just get the first profile as we only support single user
    return db.userProfiles.toCollection().first();
  }

  async getGoals(userId: string): Promise<UserGoals | undefined> {
    const profile = await this.get(userId);
    if (!profile) return undefined;

    const goals = await db.table('userGoals').get(userId);
    return goals || {
      sleepHours: 8,
      waterOz: 64,
      steps: 10000,
    };
  }

  async saveGoals(userId: string, goals: UserGoals): Promise<void> {
    await db.table('userGoals').put({ ...goals, id: userId });
  }

  async clear(): Promise<void> {
    await db.userProfiles.clear();
    await db.table('userGoals').clear();
  }

  async testStorage(): Promise<void> {
    try {
      const testProfile: UserProfile = {
        id: 'test-storage',
        name: 'Test User',
        birthdate: new Date().toISOString().split('T')[0],
        age: 0,
        height: '',
        location: '',
        whyStatement: '',
        startDate: new Date().toISOString().split('T')[0],
        currentPhase: 1,
        currentWeek: 1
      };
      
      // Try to write and delete test data
      await db.userProfiles.put(testProfile);
      await db.userProfiles.delete(testProfile.id);
    } catch (error) {
      throw new Error('Storage is not available');
    }
  }
} 