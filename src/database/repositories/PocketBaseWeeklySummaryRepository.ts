import type { WeeklySummary } from '@/types';
import { PocketBaseRepository } from './PocketBaseRepository';
import type { BaseModel } from 'pocketbase';

interface PocketBaseWeeklySummary extends BaseModel, Omit<WeeklySummary, 'id'> {}

export class PocketBaseWeeklySummaryRepository extends PocketBaseRepository<PocketBaseWeeklySummary> {
  constructor() {
    super('weeklySummaries');
  }

  async getByWeekNumber(weekNumber: number): Promise<PocketBaseWeeklySummary | null> {
    try {
      const record = await this.getFirstListItem(`weekNumber = ${weekNumber}`);
      return record;
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      return null;
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<PocketBaseWeeklySummary[]> {
    try {
      const records = await this.collection.getFullList({
        filter: `startDate >= "${startDate}" && startDate <= "${endDate}"`,
        sort: 'weekNumber',
      });
      return records.map(record => record as unknown as PocketBaseWeeklySummary);
    } catch (error) {
      console.error('Error fetching weekly summaries by date range:', error);
      return [];
    }
  }

  async getCurrentWeekSummary(currentWeek: number): Promise<PocketBaseWeeklySummary | null> {
    return this.getByWeekNumber(currentWeek);
  }
} 