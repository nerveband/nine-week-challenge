import type { DailyTracking } from '@/types';
import { db } from '../FatLossDB';

export class DailyTrackingRepository {
  async get(id: string): Promise<DailyTracking | undefined> {
    return db.dailyTracking.get(id);
  }

  async getByDate(date: string): Promise<DailyTracking | undefined> {
    return db.dailyTracking.where('date').equals(date).first();
  }

  async save(tracking: DailyTracking): Promise<string> {
    await db.dailyTracking.put(tracking);
    return tracking.id;
  }

  async delete(id: string): Promise<void> {
    await db.dailyTracking.delete(id);
  }

  async getAllByDateRange(startDate: string, endDate: string): Promise<DailyTracking[]> {
    return db.dailyTracking
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getAll(): Promise<DailyTracking[]> {
    return db.dailyTracking.toArray();
  }

  async deleteByDate(date: string): Promise<void> {
    await db.dailyTracking.where('date').equals(date).delete();
  }

  async clear(): Promise<void> {
    await db.dailyTracking.clear();
  }
} 