import { pocketBaseService } from '../../services/PocketBaseService';
import type { ListResult } from 'pocketbase';
import type { RecordModel } from 'pocketbase';

export class BaseRepository<T extends RecordModel> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async get(id: string): Promise<T | null> {
    try {
      const record = await pocketBaseService.client.collection(this.collectionName).getOne(id);
      return record as T;
    } catch (error) {
      console.error(`Failed to get ${this.collectionName}:`, error);
      return null;
    }
  }

  async save(data: Partial<T>): Promise<T | null> {
    try {
      if ('id' in data && data.id) {
        const record = await pocketBaseService.client.collection(this.collectionName).update(data.id, data);
        return record as T;
      } else {
        const record = await pocketBaseService.client.collection(this.collectionName).create(data);
        return record as T;
      }
    } catch (error) {
      console.error(`Failed to save ${this.collectionName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await pocketBaseService.client.collection(this.collectionName).delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete ${this.collectionName}:`, error);
      return false;
    }
  }

  async getAll(page: number = 1, perPage: number = 50): Promise<ListResult<T>> {
    try {
      return await pocketBaseService.client.collection(this.collectionName).getList(page, perPage) as ListResult<T>;
    } catch (error) {
      console.error(`Failed to get all ${this.collectionName}:`, error);
      return {
        page: page,
        perPage: perPage,
        totalItems: 0,
        totalPages: 0,
        items: []
      };
    }
  }

  async clear(): Promise<boolean> {
    try {
      const records = await this.getAll(1, 100);
      const deletePromises = records.items.map(record => this.delete(record.id));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error(`Failed to clear ${this.collectionName}:`, error);
      return false;
    }
  }
} 