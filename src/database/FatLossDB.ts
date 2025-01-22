import Dexie, { Table } from 'dexie';
import type { UserProfile, DailyTracking, WeeklySummary, Measurements } from '@/types';

interface UserGoals {
  id: string;
  sleepHours: number;
  waterOz: number;
  steps: number;
}

export class FatLossDB extends Dexie {
  userProfiles!: Table<UserProfile>;
  dailyTracking!: Table<DailyTracking>;
  weeklySummaries!: Table<WeeklySummary>;
  measurements!: Table<Measurements>;
  userGoals!: Table<UserGoals>;

  constructor() {
    super('FatLossDB');
    
    this.version(1).stores({
      userProfiles: 'id, name, currentPhase, currentWeek',
      dailyTracking: 'id, userId, date',
      weeklySummaries: 'weekNumber, userId',
      measurements: 'id, userId, date',
      userGoals: 'id'
    });
  }
}

export const db = new FatLossDB(); 