import type { DailyTracking, MealEntry } from '@/types';
import { databaseService } from '@/services/DatabaseService';
import type { WeeklySummary, UserProfile, Measurements } from '@/types';

const formatMeal = (meal: MealEntry): string => {
  return `${meal.time},${meal.hungerDuration},${meal.hungerLevel},${meal.fullnessLevel},${meal.slowEatingScore},${meal.mindfulnessScore},"${meal.notes.replace(/"/g, '""')}"`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to convert object to CSV string
function objectToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  data.forEach(item => {
    const values = headers.map(header => {
      const value = item[header];
      // Handle nested objects by stringifying them
      const cellValue = typeof value === 'object' ? JSON.stringify(value) : value;
      // Escape commas and quotes
      return `"${String(cellValue).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Helper to parse CSV string back to objects
function csvToObjects(csv: string): any[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const obj: any = {};
    const currentLine = lines[i].split(',').map(cell => {
      // Remove quotes and unescape
      const cleaned = cell.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
      // Try to parse JSON for nested objects
      try {
        return JSON.parse(cleaned);
      } catch {
        return cleaned;
      }
    });
    
    headers.forEach((header, index) => {
      obj[header] = currentLine[index];
    });
    
    result.push(obj);
  }
  
  return result;
}

// Export all data to a single JSON file
export async function exportAllData(): Promise<string> {
  try {
    const [
      profile,
      dailyTracking,
      weeklySummaries,
      measurements
    ] = await Promise.all([
      databaseService.getUserProfile(),
      databaseService.getDailyTrackingHistory(),
      databaseService.getAllWeeklySummaries(),
      databaseService.getAllMeasurements()
    ]);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        profile,
        dailyTracking,
        weeklySummaries,
        measurements
      }
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// Import data from JSON file
export async function importAllData(jsonString: string): Promise<void> {
  try {
    const importData = JSON.parse(jsonString);
    
    // Validate version and structure
    if (!importData.version || !importData.data) {
      throw new Error('Invalid import file format');
    }

    const { profile, dailyTracking, weeklySummaries, measurements } = importData.data;

    // Clear existing data first
    await databaseService.clearAllData();

    // Import all data
    await Promise.all([
      profile && databaseService.setUserProfile(profile),
      Object.entries(dailyTracking || {}).map(([date, tracking]) => 
        databaseService.setDailyTracking(tracking as DailyTracking)
      ),
      Object.entries(weeklySummaries || {}).map(([week, summary]) => {
        const weeklySum = summary as WeeklySummary;
        weeklySum.weekNumber = Number(week);
        return databaseService.setWeeklySummary(weeklySum);
      }),
      Object.entries(measurements || {}).map(([id, measurement]) =>
        databaseService.setMeasurements(measurement as Measurements)
      )
    ]);
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
}

function createCSVContent(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map(row =>
      row.map(cell => {
        const str = cell?.toString() || '';
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
    .join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToCSV(type: 'daily' | 'weekly' | 'measurements'): Promise<void> {
  try {
    switch (type) {
      case 'daily': {
        const dailyTracking = await databaseService.getDailyTrackingHistory();
        const userProfile = await databaseService.getUserProfile();
        
        if (!dailyTracking || !userProfile) {
          throw new Error('No data to export');
        }

        const headers = [
          'Date',
          'Sleep Hours',
          'Water (oz)',
          'Steps',
          'Breakfast Time',
          'Breakfast Hunger',
          'Breakfast Fullness',
          'Lunch Time',
          'Lunch Hunger',
          'Lunch Fullness',
          'Dinner Time',
          'Dinner Hunger',
          'Dinner Fullness',
          'Snacks',
          'Habits',
          'Treats',
          'Daily Win',
          'Notes'
        ] as const;

        const rows = Object.entries(dailyTracking).map(([date, tracking]) => [
          date,
          tracking.dailies.sleepHours,
          tracking.dailies.waterOz,
          tracking.dailies.steps,
          tracking.meals.breakfast.time,
          tracking.meals.breakfast.hungerLevel,
          tracking.meals.breakfast.fullnessLevel,
          tracking.meals.lunch.time,
          tracking.meals.lunch.hungerLevel,
          tracking.meals.lunch.fullnessLevel,
          tracking.meals.dinner.time,
          tracking.meals.dinner.hungerLevel,
          tracking.meals.dinner.fullnessLevel,
          tracking.meals.snacks.map(s => `${s.time}: ${s.reason}`).join('; '),
          Object.entries(tracking.habits)
            .map(([habit, done]) => `${habit}: ${done ? 'Yes' : 'No'}`)
            .join('; '),
          `Count: ${tracking.treats.count}, Categories: ${tracking.treats.categories.join(', ')}`,
          tracking.dailyWin,
          tracking.notes
        ]);

        const csvContent = createCSVContent([headers as unknown as (string | number)[], ...rows]);
        downloadCSV(csvContent, 'daily-tracking.csv');
        break;
      }

      case 'weekly': {
        const weeklySummaries = await databaseService.getAllWeeklySummaries();
        
        if (!weeklySummaries) {
          throw new Error('No data to export');
        }

        const headers = [
          'Week',
          'Start Date',
          'End Date',
          'What Went Well',
          'Areas for Improvement',
          'Review Notes',
          'Primary Goal',
          'Action Steps',
          'Anticipated Challenges',
          'Habit Compliance',
          'Notes'
        ] as const;

        const rows = Object.entries(weeklySummaries).map(([_, summary]) => [
          summary.weekNumber,
          summary.startDate,
          summary.endDate,
          summary.review.wentWell,
          summary.review.improvements,
          summary.review.notes,
          summary.nextWeekGoals.primary,
          summary.nextWeekGoals.actionSteps,
          summary.nextWeekGoals.challenges,
          Object.entries(summary.habitCompliance)
            .map(([habit, percentage]) => `${habit}: ${percentage}%`)
            .join('; '),
          summary.notes
        ]);

        const csvContent = createCSVContent([headers as unknown as (string | number)[], ...rows]);
        downloadCSV(csvContent, 'weekly-tracking.csv');
        break;
      }

      case 'measurements': {
        const measurements = await databaseService.getAllMeasurements();
        
        if (!measurements) {
          throw new Error('No data to export');
        }

        const headers = [
          'Date',
          'Weight',
          'Chest',
          'Chest 2',
          'Waist',
          'Hips',
          'Right Arm',
          'Left Arm',
          'Right Thigh',
          'Left Thigh',
          'Right Calf',
          'Left Calf',
          'Notes'
        ] as const;

        const rows = Object.entries(measurements).map(([_, measurement]) => [
          measurement.date,
          measurement.weight,
          measurement?.chest || '',
          measurement?.chest2 || '',
          measurement?.waist || '',
          measurement?.hips || '',
          measurement?.rightArm || '',
          measurement?.leftArm || '',
          measurement?.rightThigh || '',
          measurement?.leftThigh || '',
          measurement?.rightCalf || '',
          measurement?.leftCalf || '',
          measurement.notes
        ]);

        const csvContent = createCSVContent([headers as unknown as (string | number)[], ...rows]);
        downloadCSV(csvContent, 'measurements.csv');
        break;
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// Import CSV data
export async function importFromCSV(csv: string, type: 'daily' | 'weekly' | 'measurements'): Promise<void> {
  try {
    const objects = csvToObjects(csv);

    switch (type) {
      case 'daily':
        await Promise.all(objects.map(obj => {
          const tracking: DailyTracking = {
            ...obj,
            treats: JSON.parse(obj.treats),
            meals: JSON.parse(obj.meals),
            habits: JSON.parse(obj.habits)
          };
          return databaseService.setDailyTracking(tracking);
        }));
        break;

      case 'weekly':
        await Promise.all(objects.map(obj => {
          const summary: WeeklySummary = {
            ...obj,
            measurements: JSON.parse(obj.measurements),
            review: JSON.parse(obj.review),
            nextWeekGoals: JSON.parse(obj.nextWeekGoals),
            habitCompliance: JSON.parse(obj.habitCompliance)
          };
          return databaseService.setWeeklySummary({
            ...summary,
            weekNumber: Number(obj.week)
          });
        }));
        break;

      case 'measurements':
        await Promise.all(objects.map(obj => {
          const measurement: Measurements = {
            ...obj
          };
          return databaseService.setMeasurements(measurement);
        }));
        break;
    }
  } catch (error) {
    console.error('Error importing CSV data:', error);
    throw new Error('Failed to import CSV data');
  }
}

// Helper to download a file
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportTrackingToCSV = async () => {
  const trackingHistory = await databaseService.getDailyTrackingHistory();
  const userProfile = await databaseService.getUserProfile();
  const weeklySummaries = await databaseService.getAllWeeklySummaries();
  const measurements = await databaseService.getAllMeasurements();

  // CSV Headers
  const headers = [
    // Profile Info
    'Date',
    'Week',
    'Phase',
    // Dailies
    'Sleep (hrs)',
    'Water (oz)',
    'Steps',
    // Weekly Measurements
    'Weight',
    'Chest',
    'Waist',
    'Hips',
    'Right Arm',
    'Left Arm',
    'Right Thigh',
    'Left Thigh',
    'Right Calf',
    'Left Calf',
    'Weekly Notes',
    // Weekly Habit Compliance
    'Meals Schedule Compliance %',
    'No Snacking Compliance %',
    'Mindful Eating Compliance %',
    'Hunger Awareness Compliance %',
    'Slow Eating Compliance %',
    'Treat Awareness Compliance %',
    // Breakfast
    'Breakfast Time',
    'Pre-Breakfast Hunger Duration (min)',
    'Pre-Breakfast Hunger (1-10)',
    'Post-Breakfast Fullness (1-10)',
    'Breakfast Eating Speed (1-5)',
    'Breakfast Mindfulness (1-5)',
    'Breakfast Notes',
    // Lunch
    'Lunch Time',
    'Pre-Lunch Hunger Duration (min)',
    'Pre-Lunch Hunger (1-10)',
    'Post-Lunch Fullness (1-10)',
    'Lunch Eating Speed (1-5)',
    'Lunch Mindfulness (1-5)',
    'Lunch Notes',
    // Dinner
    'Dinner Time',
    'Pre-Dinner Hunger Duration (min)',
    'Pre-Dinner Hunger (1-10)',
    'Post-Dinner Fullness (1-10)',
    'Dinner Eating Speed (1-5)',
    'Dinner Mindfulness (1-5)',
    'Dinner Notes',
    // Snacks
    'Number of Snacks',
    'Snack 1 Time',
    'Snack 1 Reason',
    'Snack 1 Hunger Level',
    'Snack 1 Notes',
    'Snack 2 Time',
    'Snack 2 Reason',
    'Snack 2 Hunger Level',
    'Snack 2 Notes',
    'Snack 3 Time',
    'Snack 3 Reason',
    'Snack 3 Hunger Level',
    'Snack 3 Notes',
    // Habits
    'Meals Within Schedule',
    'No Unplanned Snacking',
    'Mindful Eating',
    'Hunger Awareness',
    'Slow Eating',
    'Treat Awareness',
    // Treats
    'Number of Treats',
    'Treat Categories',
    'Treat Notes',
    // Daily Win and Notes
    'Daily Win',
    'Daily Notes'
  ].join(',');

  // Convert tracking data to CSV rows
  const rows = Object.entries(trackingHistory)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, tracking]) => {
      const startDate = new Date(userProfile?.startDate || date);
      const currentDate = new Date(date);
      const weekDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const phase = Math.floor((weekDiff - 1) / 3) + 1;

      // Get weekly data if available
      const weekSummary = weeklySummaries[weekDiff] || {};
      const measurement = measurements[date];

      // Format snacks data (up to 3 snacks)
      const snacks = tracking.meals.snacks.slice(0, 3);
      const snackData = Array(3).fill(null).map((_, i) => {
        const snack = snacks[i];
        return snack ? 
          `${snack.time},"${snack.reason || ''}",${snack.hungerLevel},"${snack.notes.replace(/"/g, '""')}"` :
          ',,,';
      }).join(',');

      return [
        // Basic Info
        formatDate(date),
        weekDiff,
        phase,
        // Dailies
        tracking.dailies.sleepHours,
        tracking.dailies.waterOz,
        tracking.dailies.steps,
        // Weekly Measurements
        measurement?.weight || '',
        measurement?.chest || '',
        measurement?.waist || '',
        measurement?.hips || '',
        measurement?.rightArm || '',
        measurement?.leftArm || '',
        measurement?.rightThigh || '',
        measurement?.leftThigh || '',
        measurement?.rightCalf || '',
        measurement?.leftCalf || '',
        `"${weekSummary.notes || ''}"`,
        // Weekly Habit Compliance
        Math.round((weekSummary.habitCompliance?.mealsWithinSchedule || 0) * 100),
        Math.round((weekSummary.habitCompliance?.noSnacking || 0) * 100),
        Math.round((weekSummary.habitCompliance?.mindfulEating || 0) * 100),
        Math.round((weekSummary.habitCompliance?.hungerAwareness || 0) * 100),
        Math.round((weekSummary.habitCompliance?.slowEating || 0) * 100),
        Math.round((weekSummary.habitCompliance?.treatAwareness || 0) * 100),
        // Meals
        formatMeal(tracking.meals.breakfast),
        formatMeal(tracking.meals.lunch),
        formatMeal(tracking.meals.dinner),
        // Snacks
        tracking.meals.snacks.length,
        snackData,
        // Habits
        tracking.habits.mealsWithinSchedule ? 1 : 0,
        tracking.habits.noSnacking ? 1 : 0,
        tracking.habits.mindfulEating ? 1 : 0,
        tracking.habits.hungerAwareness ? 1 : 0,
        tracking.habits.slowEating ? 1 : 0,
        tracking.habits.treatAwareness ? 1 : 0,
        // Treats
        tracking.treats.count,
        `"${tracking.treats.categories.join('; ')}"`,
        `"${tracking.treats.notes.replace(/"/g, '""')}"`,
        // Daily Win and Notes
        `"${tracking.dailyWin.replace(/"/g, '""')}"`,
        `"${tracking.notes.replace(/"/g, '""')}"`
      ].join(',');
    });

  // Combine headers and rows
  const typedHeaders = Array.isArray(headers) ? headers : [headers];
  const typedRows = rows.map(row => Array.isArray(row) ? row : [row]);
  const csvContent = createCSVContent([typedHeaders, ...typedRows]);
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `nine-week-challenge_${formatDate(new Date().toISOString())}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 