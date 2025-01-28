import PocketBase from 'pocketbase';
import type { BaseAuthStore } from 'pocketbase';

type AuthModel = BaseAuthStore['model'];

class PocketBaseService {
  private pb: PocketBase;
  private static instance: PocketBaseService;

  private constructor() {
    // For Node.js scripts, use process.env, for browser use import.meta.env
    const url = typeof process !== 'undefined' && process.env.VITE_POCKETBASE_URL 
      ? process.env.VITE_POCKETBASE_URL 
      : import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

    this.pb = new PocketBase(url);
    
    // Disable auto-cancellation to prevent request cancellation errors
    this.pb.autoCancellation(false);
    
    // Load auth store from localStorage and setup auto-refresh
    this.pb.authStore.onChange((token, model) => {
      console.log('Auth state changed:', this.pb.authStore.isValid);
      if (this.pb.authStore.isValid && token) {
        // Ensure token is refreshed before it expires
        const tokenData = this.pb.authStore.exportToCookie();
        const expirationTime = new Date(tokenData.split(';')[1].split('=')[1]).getTime();
        const currentTime = new Date().getTime();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh token 5 minutes before it expires
        if (timeUntilExpiration > 0 && timeUntilExpiration < 300000) {
          this.pb.collection('users').authRefresh();
        }
      }
    });
  }

  public static getInstance(): PocketBaseService {
    if (!PocketBaseService.instance) {
      PocketBaseService.instance = new PocketBaseService();
    }
    return PocketBaseService.instance;
  }

  public get client(): PocketBase {
    return this.pb;
  }

  public get isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  public get currentUser(): AuthModel {
    return this.pb.authStore.model;
  }

  public get userId(): string {
    return this.pb.authStore.model?.id || '';
  }

  public async loginAdmin(email: string, password: string) {
    return await this.pb.admins.authWithPassword(email, password);
  }

  public async login(email: string, password: string) {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async logout() {
    this.pb.authStore.clear();
  }

  public async createRecord(collection: string, data: Record<string, any>) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated');
      }
      return await this.pb.collection(collection).create(data);
    } catch (error) {
      console.error(`Error creating record in ${collection}:`, error);
      throw error;
    }
  }

  public async updateRecord(collection: string, id: string, data: Record<string, any>) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated');
      }
      return await this.pb.collection(collection).update(id, data);
    } catch (error) {
      console.error(`Error updating record in ${collection}:`, error);
      throw error;
    }
  }

  public async deleteRecord(collection: string, id: string) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated');
      }
      return await this.pb.collection(collection).delete(id);
    } catch (error) {
      console.error(`Error deleting record in ${collection}:`, error);
      throw error;
    }
  }

  public async refreshAuth() {
    try {
      if (this.isAuthenticated) {
        await this.pb.collection('users').authRefresh();
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      this.pb.authStore.clear();
    }
  }
}

export const pocketBaseService = PocketBaseService.getInstance();