import type { Measurements } from '@/types';
import { PocketBaseRepository } from './PocketBaseRepository';
import type { BaseModel } from 'pocketbase';

interface PocketBaseMeasurements extends BaseModel, Omit<Measurements, 'id'> {}

export class PocketBaseMeasurementsRepository extends PocketBaseRepository<PocketBaseMeasurements> {
  constructor() {
    super('measurements');
  }

  async getByDate(date: string): Promise<PocketBaseMeasurements | null> {
    try {
      const record = await this.getFirstListItem(`date = "${date}"`);
      return record;
    } catch (error) {
      console.error('Error fetching measurements by date:', error);
      return null;
    }
  }

  async getAllByUserId(userId: string): Promise<PocketBaseMeasurements[]> {
    try {
      const records = await this.collection.getFullList({
        filter: `userId = "${userId}"`,
        sort: '-date',
      });
      return records.map(record => record as unknown as PocketBaseMeasurements);
    } catch (error) {
      console.error('Error fetching measurements by user ID:', error);
      return [];
    }
  }

  async getLatest(userId: string): Promise<PocketBaseMeasurements | null> {
    try {
      const records = await this.collection.getList(1, 1, {
        filter: `userId = "${userId}"`,
        sort: '-date',
      });
      return records.items.length > 0 ? (records.items[0] as unknown as PocketBaseMeasurements) : null;
    } catch (error) {
      console.error('Error fetching latest measurements:', error);
      return null;
    }
  }
} 