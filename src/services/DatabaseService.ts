import type { UserProfile, DailyTracking, WeeklySummary, Measurements } from '@/types';
import { PocketBaseUserProfileRepository } from '@/database/repositories/PocketBaseUserProfileRepository';
import { PocketBaseDailyTrackingRepository } from '@/database/repositories/PocketBaseDailyTrackingRepository';
import { PocketBaseWeeklySummaryRepository } from '@/database/repositories/PocketBaseWeeklySummaryRepository';
import { PocketBaseMeasurementsRepository } from '@/database/repositories/PocketBaseMeasurementsRepository';
import { pocketBaseService } from './PocketBaseService';

class DatabaseService {
  private userProfileRepo: PocketBaseUserProfileRepository;
  private dailyTrackingRepo: PocketBaseDailyTrackingRepository;
  private weeklySummaryRepo: PocketBaseWeeklySummaryRepository;
  private measurementsRepo: PocketBaseMeasurementsRepository;

  constructor() {
    this.userProfileRepo = new PocketBaseUserProfileRepository();
    this.dailyTrackingRepo = new PocketBaseDailyTrackingRepository();
    this.weeklySummaryRepo = new PocketBaseWeeklySummaryRepository();
    this.measurementsRepo = new PocketBaseMeasurementsRepository();
  }

  // Migration
  async initializeDatabase() {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated with PocketBase');
    }
    return { success: true, message: 'Database initialized' };
  }

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.userProfileRepo.getCurrentProfile();
  }

  async createUserProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.userProfileRepo.createProfile(profile);
  }

  // User Goals Methods
  async getUserGoals(): Promise<{ sleepHours: number; waterOz: number; steps: number }> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const profile = await this.getUserProfile();
    if (!profile) {
      // Create a default profile if none exists
      const defaultProfile = await this.createUserProfile({
        sleepHours: 8,
        waterOz: 64,
        steps: 10000,
        name: '',
        email: '',
      });

      if (!defaultProfile) {
        return {
          sleepHours: 8,
          waterOz: 64,
          steps: 10000,
        };
      }

      return {
        sleepHours: defaultProfile.sleepHours,
        waterOz: defaultProfile.waterOz,
        steps: defaultProfile.steps,
      };
    }

    return {
      sleepHours: profile.sleepHours,
      waterOz: profile.waterOz,
      steps: profile.steps,
    };
  }

  async setUserGoals(goals: { sleepHours: number; waterOz: number; steps: number }): Promise<void> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const profile = await this.getUserProfile();
    if (profile) {
      await this.userProfileRepo.saveGoals(profile.id, goals);
    } else {
      await this.createUserProfile({
        ...goals,
        name: '',
        email: '',
      });
    }
  }

  // Daily Tracking Methods
  async getDailyTracking(date: string): Promise<DailyTracking | undefined> {
    const tracking = await this.dailyTrackingRepo.getByDate(date);
    return tracking || undefined;
  }

  async setDailyTracking(tracking: DailyTracking): Promise<string> {
    const result = await this.dailyTrackingRepo.create(tracking);
    return result?.id || '';
  }

  async getDailyTrackingHistory(): Promise<Record<string, DailyTracking>> {
    const trackings = await this.dailyTrackingRepo.getAll();
    return trackings.reduce((acc, tracking) => {
      acc[tracking.date] = tracking;
      return acc;
    }, {} as Record<string, DailyTracking>);
  }

  async deleteDailyTracking(id: string): Promise<void> {
    await this.dailyTrackingRepo.delete(id);
  }

  async deleteByDate(date: string): Promise<void> {
    await this.dailyTrackingRepo.deleteByDate(date);
  }

  // Weekly Summary Methods
  async getWeeklySummary(weekNumber: number): Promise<WeeklySummary | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.weeklySummaryRepo.getByWeekNumber(weekNumber.toString());
  }

  async getAllWeeklySummaries(): Promise<WeeklySummary[]> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.weeklySummaryRepo.getAll();
  }

  async createWeeklySummary(summary: Omit<WeeklySummary, 'id'>): Promise<WeeklySummary | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.weeklySummaryRepo.create({
      ...summary,
      userId: pocketBaseService.userId
    });
  }

  async updateWeeklySummary(id: string, summary: Partial<WeeklySummary>): Promise<WeeklySummary | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.weeklySummaryRepo.update(id, summary);
  }

  async deleteWeeklySummary(weekNumber: number): Promise<void> {
    const summary = await this.weeklySummaryRepo.getByWeekNumber(weekNumber.toString());
    if (summary) {
      await this.weeklySummaryRepo.delete(summary.id);
    }
  }

  // Measurements Methods
  async getMeasurements(date: string): Promise<Measurements | undefined> {
    const measurements = await this.measurementsRepo.getByDate(date);
    return measurements || undefined;
  }

  async setMeasurements(measurements: Measurements): Promise<string> {
    const result = await this.measurementsRepo.create(measurements);
    return result?.id || '';
  }

  async getAllMeasurements(): Promise<Measurements[]> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.measurementsRepo.getAllByUserId(pocketBaseService.userId);
  }

  async createMeasurements(measurements: Omit<Measurements, 'id'>): Promise<Measurements | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.measurementsRepo.create({
      ...measurements,
      userId: pocketBaseService.userId
    });
  }

  async updateMeasurements(id: string, measurements: Partial<Measurements>): Promise<Measurements | null> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return await this.measurementsRepo.update(id, measurements);
  }

  async deleteMeasurements(id: string): Promise<void> {
    await this.measurementsRepo.delete(id);
  }

  async getLatestMeasurements(): Promise<Measurements | undefined> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) return undefined;

    const measurements = await this.measurementsRepo.getLatest(userProfile.id);
    return measurements || undefined;
  }

  // Export functionality
  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private createCSVContent(content: string[][]): string {
    return content.map(row => 
      row.map(cell => {
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  }

  async exportToCSV(type: 'daily' | 'weekly' | 'measurements'): Promise<string> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) {
      throw new Error('No user profile found');
    }

    let content: string[][] = [];

    switch (type) {
      case 'daily': {
        const trackings = await this.getDailyTrackingHistory();
        if (!trackings || typeof trackings !== 'object') {
          throw new Error('No daily tracking data found');
        }

        content = [
          ['Date', 'Sleep Hours', 'Water (oz)', 'Steps', 'Meals Within Schedule', 'No Snacking', 'Mindful Eating', 'Hunger Awareness', 'Slow Eating', 'Treat Awareness', 'Treat Count', 'Daily Win', 'Notes']
        ];

        const dates = Object.keys(trackings).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        for (const date of dates) {
          const tracking = trackings[date];
          if (!tracking) continue;

          content.push([
            this.formatDate(date),
            tracking.dailies.sleepHours.toString(),
            tracking.dailies.waterOz.toString(),
            tracking.dailies.steps.toString(),
            tracking.habits.mealsWithinSchedule ? 'Yes' : 'No',
            tracking.habits.noSnacking ? 'Yes' : 'No',
            tracking.habits.mindfulEating ? 'Yes' : 'No',
            tracking.habits.hungerAwareness ? 'Yes' : 'No',
            tracking.habits.slowEating ? 'Yes' : 'No',
            tracking.habits.treatAwareness ? 'Yes' : 'No',
            tracking.treats.count.toString(),
            tracking.dailyWin || '',
            tracking.notes || ''
          ]);
        }
        break;
      }

      case 'weekly': {
        const weeklySummaries = await this.getAllWeeklySummaries();
        if (!weeklySummaries || typeof weeklySummaries !== 'object') {
          throw new Error('No weekly summaries found');
        }

        const weeks = Object.keys(weeklySummaries).sort((a, b) => parseInt(b) - parseInt(a));
        const phase = weeks.length > 0 ? Math.ceil(parseInt(weeks[0]) / 3) : 1;

        content = [
          ['', '', '', '', '', '', '', '', '', '', '', 'Name:', userProfile.name || ''],
          ['', '9 WEEKS TO SUSTAINABLE FAT LOSS', '', '', '', '', '', '', '', '', '', 'Birthdate:', userProfile.birthdate || ''],
          ['', 'Tell me your why: Why are you here?', '', '', '', '', '', '', '', '', '', 'Age:', userProfile.age?.toString() || ''],
          ['', userProfile.whyStatement || '', '', '', '', '', '', '', '', '', '', 'Height:', userProfile.height || ''],
          ['', '', '', '', '', '', '', '', '', '', '', 'Location:', userProfile.location || ''],
          [''],
          ['HABIT TRACKING CHART'],
          [''],
          [`Weeks ${(phase - 1) * 3 + 1}-${phase * 3}`],
          [''],
          ['WEEKLY REVIEW'],
          [''],
          [
            'Week',
            'Start Date',
            'End Date',
            'What Went Well',
            'Areas for Improvement',
            'Notes',
            'Next Week Primary Goal',
            'Action Steps',
            'Anticipated Challenges',
            'Habit Compliance'
          ]
        ];

        for (const weekKey of weeks) {
          const summary = weeklySummaries[parseInt(weekKey)];
          if (!summary) continue;

          content.push([
            summary.weekNumber.toString(),
            summary.startDate || '',
            summary.endDate || '',
            summary.review.wentWell || '',
            summary.review.improvements || '',
            summary.notes || '',
            summary.nextWeekGoals.primary || '',
            summary.nextWeekGoals.actionSteps || '',
            summary.nextWeekGoals.challenges || '',
            ((Object.values(summary.habitCompliance || {}).reduce((acc, val) => acc + val, 0) / 
              Object.keys(summary.habitCompliance || {}).length) || 0).toString()
          ]);
        }
        break;
      }

      case 'measurements': {
        const measurements = await this.getAllMeasurements();
        if (!measurements || typeof measurements !== 'object') {
          throw new Error('No measurements found');
        }

        content = [
          ['Date', 'Weight', 'Hips', 'Waist', 'Chest', 'Chest 2', 'Right Thigh', 'Right Arm', 'Notes']
        ];

        const dates = Object.keys(measurements).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        for (const date of dates) {
          const measurement = measurements[date];
          if (!measurement) continue;

          content.push([
            this.formatDate(date),
            measurement.weight?.toString() || '',
            measurement.hips?.toString() || '',
            measurement.waist?.toString() || '',
            measurement.chest?.toString() || '',
            measurement.chest2?.toString() || '',
            measurement.rightThigh?.toString() || '',
            measurement.rightArm?.toString() || '',
            measurement.notes || ''
          ]);
        }
        break;
      }
    }

    return this.createCSVContent(content);
  }

  async testStorage(): Promise<void> {
    if (!pocketBaseService.isAuthenticated) {
      throw new Error('Not authenticated with PocketBase');
    }
  }
}

export const databaseService = new DatabaseService(); 