import { Table } from 'dexie';

export class BaseRepository<T> {
  protected table: Table<T>;

  constructor(table: Table<T>) {
    this.table = table;
  }

  async get(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async save(data: T): Promise<void> {
    await this.table.put(data);
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }
} 