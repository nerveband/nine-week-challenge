import { pocketBaseService } from '@/services/PocketBaseService';
import type { BaseModel, RecordModel } from 'pocketbase';

export class PocketBaseRepository<T extends BaseModel> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return pocketBaseService.client.collection(this.collectionName);
  }

  protected get isUserCollection(): boolean {
    return ['userProfiles', 'users'].includes(this.collectionName);
  }

  protected getUserFilter(): string {
    const userId = pocketBaseService.userId;
    return this.isUserCollection ? `id = "${userId}"` : `userId = "${userId}"`;
  }

  async get(id: string): Promise<T | null> {
    try {
      const record = await this.collection.getOne(id);
      return record ? (record as unknown as T) : null;
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      return null;
    }
  }

  async create(data: Partial<T>): Promise<T | null> {
    try {
      const record = await pocketBaseService.createRecord(this.collectionName, data);
      return record ? (record as unknown as T) : null;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return null;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const record = await pocketBaseService.updateRecord(this.collectionName, id, data);
      return record ? (record as unknown as T) : null;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return false;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      if (!pocketBaseService.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const records = await this.collection.getFullList({
        filter: this.isUserCollection ? undefined : this.getUserFilter(),
        sort: '-created',
      });
      return records.map(record => record as unknown as T);
    } catch (error) {
      console.error(`Error fetching all ${this.collectionName}:`, error);
      return [];
    }
  }

  async getFirstListItem(filter: string): Promise<T | null> {
    try {
      if (!pocketBaseService.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const userFilter = this.isUserCollection ? undefined : this.getUserFilter();
      const combinedFilter = userFilter ? `${userFilter} && ${filter}` : filter;
      
      const record = await this.collection.getFirstListItem(combinedFilter);
      return record ? (record as unknown as T) : null;
    } catch (error) {
      console.error(`Error fetching first ${this.collectionName}:`, error);
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      const records = await this.getAll();
      await Promise.all(records.map(record => this.delete(record.id)));
    } catch (error) {
      console.error(`Error clearing ${this.collectionName}:`, error);
    }
  }
}