import { UserProfile, Measurements, DailyTracking, WeeklySummary } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_GOALS: 'user_goals',
  MEASUREMENTS: 'measurements',
  DAILY_TRACKING: 'daily_tracking',
  WEEKLY_SUMMARIES: 'weekly_summaries',
};

interface UserGoals {
  sleepHours: number;
  waterOz: number;
  steps: number;
}

export const StorageService = {
  // User Profile
  getUserProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  setUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // User Goals
  getUserGoals(): UserGoals {
    const data = localStorage.getItem(STORAGE_KEYS.USER_GOALS);
    return data ? JSON.parse(data) : {
      sleepHours: 8,
      waterOz: 64,
      steps: 10000,
    };
  },

  setUserGoals(goals: UserGoals): void {
    localStorage.setItem(STORAGE_KEYS.USER_GOALS, JSON.stringify(goals));
  },

  // Measurements
  getMeasurements(): Record<string, Measurements> {
    const data = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    return data ? JSON.parse(data) : {};
  },

  setMeasurement(measurement: Measurements): void {
    const measurements = this.getMeasurements();
    measurements[measurement.date] = measurement;
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  },

  // Daily Tracking
  getDailyTracking(date: string): DailyTracking | null {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_TRACKING);
    const trackingData = data ? JSON.parse(data) : {};
    return trackingData[date] || null;
  },

  getDailyTrackingHistory(): Record<string, DailyTracking> {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_TRACKING);
    return data ? JSON.parse(data) : {};
  },

  setDailyTracking(tracking: DailyTracking): void {
    const trackingData = this.getDailyTrackingHistory();
    trackingData[tracking.date] = tracking;
    localStorage.setItem(STORAGE_KEYS.DAILY_TRACKING, JSON.stringify(trackingData));
  },

  // Weekly Summaries
  getWeeklySummary(weekNumber: number): WeeklySummary | null {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_SUMMARIES);
    const summaries = data ? JSON.parse(data) : {};
    return summaries[weekNumber] || null;
  },

  getAllWeeklySummaries(): Record<number, WeeklySummary> {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_SUMMARIES);
    return data ? JSON.parse(data) : {};
  },

  setWeeklySummary(summary: WeeklySummary): void {
    const summaries = this.getAllWeeklySummaries();
    summaries[summary.weekNumber] = summary;
    localStorage.setItem(STORAGE_KEYS.WEEKLY_SUMMARIES, JSON.stringify(summaries));
  },

  // Data Export
  exportData(): string {
    const data = {
      userProfile: this.getUserProfile(),
      userGoals: this.getUserGoals(),
      measurements: this.getMeasurements(),
      dailyTracking: this.getDailyTrackingHistory(),
      weeklySummaries: this.getAllWeeklySummaries(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Data Import
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.userProfile) {
        this.setUserProfile(data.userProfile);
      }
      if (data.userGoals) {
        this.setUserGoals(data.userGoals);
      }
      if (data.measurements) {
        localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(data.measurements));
      }
      if (data.dailyTracking) {
        localStorage.setItem(STORAGE_KEYS.DAILY_TRACKING, JSON.stringify(data.dailyTracking));
      }
      if (data.weeklySummaries) {
        localStorage.setItem(STORAGE_KEYS.WEEKLY_SUMMARIES, JSON.stringify(data.weeklySummaries));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  },
}; 