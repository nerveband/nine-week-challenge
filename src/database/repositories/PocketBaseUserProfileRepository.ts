import type { UserProfile } from '@/types';
import { PocketBaseRepository } from './PocketBaseRepository';
import type { BaseModel } from 'pocketbase';
import { pocketBaseService } from '@/services/PocketBaseService';

interface PocketBaseUserProfile extends BaseModel, Omit<UserProfile, 'id'> {}

export class PocketBaseUserProfileRepository extends PocketBaseRepository<PocketBaseUserProfile> {
  constructor() {
    super('userProfiles');
  }

  async getCurrentProfile(): Promise<PocketBaseUserProfile | null> {
    try {
      const record = await this.collection.getFirstListItem(`id = "${pocketBaseService.userId}"`);
      return record ? (record as unknown as PocketBaseUserProfile) : null;
    } catch (error) {
      console.error('Error fetching current profile:', error);
      return null;
    }
  }

  async getGoals(userId: string): Promise<{ sleepHours: number; waterOz: number; steps: number } | null> {
    try {
      const record = await this.collection.getOne(userId);
      if (!record) return null;

      return {
        sleepHours: record.sleepHours || 8,
        waterOz: record.waterOz || 64,
        steps: record.steps || 10000,
      };
    } catch (error) {
      console.error('Error fetching user goals:', error);
      return null;
    }
  }

  async saveGoals(userId: string, goals: { sleepHours: number; waterOz: number; steps: number }): Promise<void> {
    try {
      await this.update(userId, goals);
    } catch (error) {
      console.error('Error saving user goals:', error);
    }
  }

  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<PocketBaseUserProfile | null> {
    try {
      const record = await this.collection.create({
        ...profile,
        id: pocketBaseService.userId // Use the auth user ID as the profile ID
      });
      return record ? (record as unknown as PocketBaseUserProfile) : null;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }
}