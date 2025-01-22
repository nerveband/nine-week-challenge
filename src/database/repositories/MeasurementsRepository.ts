import type { Measurements } from '@/types';
import { db } from '../FatLossDB';

export class MeasurementsRepository {
  async get(id: string): Promise<Measurements | undefined> {
    return db.measurements.get(id);
  }

  async save(measurements: Measurements): Promise<string> {
    await db.measurements.put(measurements);
    return measurements.id;
  }

  async delete(id: string): Promise<void> {
    await db.measurements.delete(id);
  }

  async getByDate(date: string): Promise<Measurements | undefined> {
    return db.measurements.where('date').equals(date).first();
  }

  async getAllByUserId(userId: string): Promise<Measurements[]> {
    return db.measurements
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('date');
  }

  async getLatest(userId: string): Promise<Measurements | undefined> {
    return db.measurements
      .where('userId')
      .equals(userId)
      .reverse()
      .first();
  }

  async clear(): Promise<void> {
    await db.measurements.clear();
  }
} 