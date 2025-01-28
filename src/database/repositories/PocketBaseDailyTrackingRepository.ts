import type { DailyTracking } from '@/types';
import { PocketBaseRepository } from './PocketBaseRepository';
import type { BaseModel } from 'pocketbase';

interface PocketBaseDailyTracking extends BaseModel, Omit<DailyTracking, 'id'> {}

export class PocketBaseDailyTrackingRepository extends PocketBaseRepository<PocketBaseDailyTracking> {
  constructor() {
    super('dailyTracking');
  }

  async getByDate(date: string): Promise<PocketBaseDailyTracking | null> {
    try {
      const record = await this.getFirstListItem(`date = "${date}"`);
      return record;
    } catch (error) {
      console.error('Error fetching daily tracking by date:', error);
      return null;
    }
  }

  async getAllByDateRange(startDate: string, endDate: string): Promise<PocketBaseDailyTracking[]> {
    try {
      const records = await this.collection.getFullList({
        filter: `date >= "${startDate}" && date <= "${endDate}"`,
        sort: 'date',
      });
      return records.map(record => record as unknown as PocketBaseDailyTracking);
    } catch (error) {
      console.error('Error fetching daily tracking by date range:', error);
      return [];
    }
  }

  async deleteByDate(date: string): Promise<void> {
    try {
      const record = await this.getByDate(date);
      if (record) {
        await this.delete(record.id);
      }
    } catch (error) {
      console.error('Error deleting daily tracking by date:', error);
    }
  }
} 