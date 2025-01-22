import { UserProfileRepository } from '@/database/repositories/UserProfileRepository';
import { DailyTrackingRepository } from '@/database/repositories/DailyTrackingRepository';
import { WeeklySummaryRepository } from '@/database/repositories/WeeklySummaryRepository';
import { MeasurementsRepository } from '@/database/repositories/MeasurementsRepository';
import { migrateFromLocalStorage, checkMigrationNeeded, verifyMigration } from '@/database/migration';
import type { UserProfile, DailyTracking, WeeklySummary, Measurements } from '@/types';

class DatabaseService {
  private userProfileRepo: UserProfileRepository;
  private dailyTrackingRepo: DailyTrackingRepository;
  private weeklySummaryRepo: WeeklySummaryRepository;
  private measurementsRepo: MeasurementsRepository;

  constructor() {
    this.userProfileRepo = new UserProfileRepository();
    this.dailyTrackingRepo = new DailyTrackingRepository();
    this.weeklySummaryRepo = new WeeklySummaryRepository();
    this.measurementsRepo = new MeasurementsRepository();
  }

  // Migration
  async initializeDatabase() {
    if (await checkMigrationNeeded()) {
      const result = await migrateFromLocalStorage();
      if (!result.success) {
        console.error('Migration failed:', result.error);
      }
      return await verifyMigration();
    }
    return { success: true, message: 'No migration needed' };
  }

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | undefined> {
    return this.userProfileRepo.getCurrentProfile();
  }

  async setUserProfile(profile: UserProfile): Promise<string> {
    return this.userProfileRepo.save(profile);
  }

  // User Goals Methods
  async getUserGoals(): Promise<{ sleepHours: number; waterOz: number; steps: number }> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) {
      return {
        sleepHours: 8,
        waterOz: 64,
        steps: 10000,
      };
    }

    const goals = await this.userProfileRepo.getGoals(userProfile.id);
    return goals || {
      sleepHours: 8,
      waterOz: 64,
      steps: 10000,
    };
  }

  async setUserGoals(goals: { sleepHours: number; waterOz: number; steps: number }): Promise<void> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) return;

    await this.userProfileRepo.saveGoals(userProfile.id, goals);
  }

  // Daily Tracking Methods
  async getDailyTracking(date: string): Promise<DailyTracking | undefined> {
    return this.dailyTrackingRepo.getByDate(date);
  }

  async setDailyTracking(tracking: DailyTracking): Promise<string> {
    return this.dailyTrackingRepo.save(tracking);
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
  async getWeeklySummary(weekNumber: number): Promise<WeeklySummary | undefined> {
    return this.weeklySummaryRepo.get(weekNumber);
  }

  async setWeeklySummary(summary: WeeklySummary): Promise<number> {
    return this.weeklySummaryRepo.save(summary);
  }

  async deleteWeeklySummary(weekNumber: number): Promise<void> {
    return this.weeklySummaryRepo.delete(weekNumber);
  }

  async getAllWeeklySummaries(): Promise<Record<number, WeeklySummary>> {
    const summaries = await this.weeklySummaryRepo.getAll();
    return summaries.reduce((acc, summary) => {
      acc[summary.weekNumber] = summary;
      return acc;
    }, {} as Record<number, WeeklySummary>);
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      this.userProfileRepo.clear(),
      this.dailyTrackingRepo.clear(),
      this.weeklySummaryRepo.clear(),
      this.measurementsRepo.clear()
    ]);
  }

  // Measurements Methods
  async getMeasurements(date: string): Promise<Measurements | undefined> {
    return this.measurementsRepo.getByDate(date);
  }

  async setMeasurements(measurements: Measurements): Promise<string> {
    return this.measurementsRepo.save(measurements);
  }

  async deleteMeasurements(id: string): Promise<void> {
    return this.measurementsRepo.delete(id);
  }

  async getAllMeasurements(): Promise<Record<string, Measurements>> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) return {};

    const measurements = await this.measurementsRepo.getAllByUserId(userProfile.id);
    return measurements.reduce((acc, measurement) => {
      acc[measurement.date] = measurement;
      return acc;
    }, {} as Record<string, Measurements>);
  }

  async getLatestMeasurements(): Promise<Measurements | undefined> {
    const userProfile = await this.getUserProfile();
    if (!userProfile) return undefined;

    return this.measurementsRepo.getLatest(userProfile.id);
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
    if (!userProfile) throw new Error('No user profile found');

    let content: string[][] = [];

    switch (type) {
      case 'daily': {
        const dailyData = await this.getDailyTrackingHistory();
        if (!dailyData || typeof dailyData !== 'object') {
          throw new Error('No daily tracking data found');
        }

        const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        // Header with user info
        content = [
          ['', '', '', '', '', '', '', '', '', '', '', 'Name:', userProfile.name || ''],
          ['', '9 WEEKS TO SUSTAINABLE FAT LOSS', '', '', '', '', '', '', '', '', '', 'Birthdate:', userProfile.birthdate || ''],
          ['', 'Tell me your why: Why are you here?', '', '', '', '', '', '', '', '', '', 'Age:', userProfile.age?.toString() || ''],
          ['', userProfile.whyStatement || '', '', '', '', '', '', '', '', '', '', 'Height:', userProfile.height || ''],
          ['', '', '', '', '', '', '', '', '', '', '', 'Location:', userProfile.location || ''],
          [''],
          ['DAILY TRACKING'],
          [''],
          [
            'Date',
            'Sleep Hours',
            'Water (oz)',
            'Steps',
            'MEAL 1',
            '',
            '',
            'MEAL 2',
            '',
            '',
            'MEAL 3',
            '',
            '',
            'SNACKS',
            'TREATS',
            'HABITS',
            'DAILY WIN',
            'NOTES'
          ],
          [
            '',
            '',
            '',
            '',
            'Time',
            'Hunger (1-10)',
            'Fullness (1-10)',
            'Time',
            'Hunger (1-10)',
            'Fullness (1-10)',
            'Time',
            'Hunger (1-10)',
            'Fullness (1-10)',
            'Time & Reason',
            'Count & Categories',
            'Completed',
            '',
            ''
          ]
        ];

        for (const date of sortedDates) {
          const tracking = dailyData[date];
          if (!tracking) continue;

          const habits = Object.entries(tracking.habits || {})
            .map(([habit, done]) => `${habit}: ${done ? 'Yes' : 'No'}`)
            .join('\n');

          const snacks = Array.isArray(tracking.meals?.snacks) 
            ? tracking.meals.snacks
                .map(snack => `${snack.time} - ${snack.reason || 'No reason given'} (Hunger: ${snack.hungerLevel})`)
                .join('\n')
            : '';

          content.push([
            this.formatDate(date),
            tracking.dailies?.sleepHours?.toString() || '',
            tracking.dailies?.waterOz?.toString() || '',
            tracking.dailies?.steps?.toString() || '',
            tracking.meals?.breakfast?.time || '',
            tracking.meals?.breakfast?.hungerLevel?.toString() || '',
            tracking.meals?.breakfast?.fullnessLevel?.toString() || '',
            tracking.meals?.lunch?.time || '',
            tracking.meals?.lunch?.hungerLevel?.toString() || '',
            tracking.meals?.lunch?.fullnessLevel?.toString() || '',
            tracking.meals?.dinner?.time || '',
            tracking.meals?.dinner?.hungerLevel?.toString() || '',
            tracking.meals?.dinner?.fullnessLevel?.toString() || '',
            snacks,
            `Count: ${tracking.treats?.count || 0}\nCategories: ${tracking.treats?.categories?.join(', ') || ''}\nNotes: ${tracking.treats?.notes || ''}`,
            habits,
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

        for (const week of weeks) {
          const summary = weeklySummaries[parseInt(week)];
          if (!summary) continue;

          const habitComplianceStr = Object.entries(summary.habitCompliance || {})
            .map(([habit, percentage]) => `${habit}: ${Math.round(percentage * 100)}%`)
            .join('\n');

          content.push([
            summary.weekNumber?.toString() || '',
            this.formatDate(summary.startDate),
            this.formatDate(summary.endDate),
            summary.review?.wentWell || '',
            summary.review?.improvements || '',
            summary.review?.notes || '',
            summary.nextWeekGoals?.primary || '',
            summary.nextWeekGoals?.actionSteps || '',
            summary.nextWeekGoals?.challenges || '',
            habitComplianceStr
          ]);
        }
        break;
      }

      case 'measurements': {
        const measurements = await this.getAllMeasurements();
        if (!measurements || typeof measurements !== 'object') {
          throw new Error('No measurements found');
        }

        const dates = Object.keys(measurements).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        content = [
          ['NOTES:'],
          ['- Measure 3 times and take the average. Consistency of placement is key.'],
          ['- Always use a cloth measuring tape, not a metal one, as it\'s much more accurate.'],
          ['- Do your measurements in the nude or limited clothing first thing in the morning.'],
          ['- Breathe normally and don\'t \'suck in\' to get a better number.'],
          ['- Measure in front of a mirror, to ensure that your tape is straight.'],
          ['- Remember to write them down to track progress over time.'],
          ['- Pull the tape so that it is snug but not too tight.'],
          ['- Be consistent with your measuring.'],
          [''],
          [
            'Date',
            'Weight',
            'Hip (biggest point around butt)',
            'Waist (belly button)',
            'Chest (bra line)',
            'Chest 2 (fullest part)',
            'Thigh (fullest part)',
            'Bicep (biggest part)',
            'Notes'
          ]
        ];

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
    try {
      await this.userProfileRepo.testStorage();
    } catch (error) {
      throw new Error('Storage is not available');
    }
  }
}

export const databaseService = new DatabaseService(); 