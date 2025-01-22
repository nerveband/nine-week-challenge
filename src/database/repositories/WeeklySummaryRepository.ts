import type { WeeklySummary } from '@/types';
import { db } from '../FatLossDB';

export class WeeklySummaryRepository {
  async get(weekNumber: number): Promise<WeeklySummary | undefined> {
    return db.weeklySummaries.get(weekNumber);
  }

  async save(summary: WeeklySummary): Promise<number> {
    await db.weeklySummaries.put(summary);
    return summary.weekNumber;
  }

  async delete(weekNumber: number): Promise<void> {
    await db.weeklySummaries.delete(weekNumber);
  }

  async getAll(): Promise<WeeklySummary[]> {
    return db.weeklySummaries.toArray();
  }

  async getByDateRange(startDate: string, endDate: string): Promise<WeeklySummary[]> {
    return db.weeklySummaries
      .where('startDate')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getCurrentWeekSummary(currentWeek: number): Promise<WeeklySummary | undefined> {
    return this.get(currentWeek);
  }

  async clear(): Promise<void> {
    await db.weeklySummaries.clear();
  }
} 