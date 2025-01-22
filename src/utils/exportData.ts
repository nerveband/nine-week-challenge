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

// Helper to create CSV content
function createCSVContent(content: string[][]): string {
  return content.map(row => 
    row.map(cell => {
      // If cell contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
      if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

export async function exportToCSV(type: 'daily' | 'weekly' | 'measurements'): Promise<void> {
  let headers: string[] = [];
  let rows: string[][] = [];

  switch (type) {
    case 'daily': {
      headers = [
        'Date',
        'Sleep Hours',
        'Water (oz)',
        'Steps',
        'Breakfast Time',
        'Breakfast Hunger',
        'Breakfast Fullness',
        'Breakfast Notes',
        'Lunch Time',
        'Lunch Hunger',
        'Lunch Fullness',
        'Lunch Notes',
        'Dinner Time',
        'Dinner Hunger',
        'Dinner Fullness',
        'Dinner Notes',
        'Snacks',
        'Habits',
        'Treats',
        'Daily Win',
        'Notes'
      ];

      const dailyData = await databaseService.getDailyTrackingHistory();
      if (dailyData && Array.isArray(dailyData)) {
        rows = dailyData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(daily => {
            const habits = Object.entries(daily.habits)
              .map(([habit, done]) => `${habit}: ${done ? 'Yes' : 'No'}`)
              .join('; ');

            const snacks = Array.isArray(daily.meals.snacks) 
              ? daily.meals.snacks
                .map((snack: MealEntry) => `${snack.time} (Hunger: ${snack.hungerLevel}, Fullness: ${snack.fullnessLevel})`)
                .join('; ')
              : '';

            return [
              formatDate(daily.date),
              daily.dailies.sleepHours.toString(),
              daily.dailies.waterOz.toString(),
              daily.dailies.steps.toString(),
              daily.meals.breakfast.time,
              daily.meals.breakfast.hungerLevel.toString(),
              daily.meals.breakfast.fullnessLevel.toString(),
              daily.meals.breakfast.notes,
              daily.meals.lunch.time,
              daily.meals.lunch.hungerLevel.toString(),
              daily.meals.lunch.fullnessLevel.toString(),
              daily.meals.lunch.notes,
              daily.meals.dinner.time,
              daily.meals.dinner.hungerLevel.toString(),
              daily.meals.dinner.fullnessLevel.toString(),
              daily.meals.dinner.notes,
              snacks,
              habits,
              `Count: ${daily.treats.count}, Categories: ${daily.treats.categories.join(', ')}, Notes: ${daily.treats.notes}`,
              daily.dailyWin,
              daily.notes
            ];
          });
      }
      break;
    }
    case 'weekly': {
      const headers = [
        'Week',
        'Start Date',
        'End Date',
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
        'Measurement Notes',
        'What Went Well',
        'Areas for Improvement',
        'Review Notes',
        'Primary Goal',
        'Action Steps',
        'Anticipated Challenges',
        'Habit Compliance',
        'Notes'
      ];

      const weeklyData = await databaseService.getAllWeeklySummaries();
      if (weeklyData) {
        const rows = Object.entries(weeklyData)
          .sort(([weekA], [weekB]) => parseInt(weekB) - parseInt(weekA))
          .map(([_, summary]) => {
            const { measurements, review, nextWeekGoals, habitCompliance } = summary;
            const habitComplianceStr = Object.entries(habitCompliance || {})
              .map(([habit, percentage]) => `${habit}: ${percentage}%`)
              .join('; ');

            return [
              summary.weekNumber.toString(),
              formatDate(summary.startDate),
              formatDate(summary.endDate),
              measurements?.weight?.toString() || '',
              measurements?.chest?.toString() || '',
              measurements?.waist?.toString() || '',
              measurements?.hips?.toString() || '',
              measurements?.rightArm?.toString() || '',
              measurements?.leftArm?.toString() || '',
              measurements?.rightThigh?.toString() || '',
              measurements?.leftThigh?.toString() || '',
              measurements?.rightCalf?.toString() || '',
              measurements?.leftCalf?.toString() || '',
              measurements?.notes || '',
              review?.wentWell || '',
              review?.improvements || '',
              review?.notes || '',
              nextWeekGoals?.primary || '',
              nextWeekGoals?.actionSteps || '',
              nextWeekGoals?.challenges || '',
              habitComplianceStr,
              summary.notes || ''
            ];
          });

        const csvContent = createCSVContent([headers, ...rows]);
        downloadCSV(csvContent, `weekly-tracking.csv`);
      }
      break;
    }
    case 'measurements': {
      headers = [
        'Date',
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
        'Notes'
      ];

      const measurementsData = await databaseService.getMeasurements();
      if (measurementsData && Array.isArray(measurementsData)) {
        rows = measurementsData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(measurement => [
            formatDate(measurement.date),
            measurement.weight.toString(),
            measurement.chest.toString(),
            measurement.waist.toString(),
            measurement.hips.toString(),
            measurement.rightArm.toString(),
            measurement.leftArm.toString(),
            measurement.rightThigh.toString(),
            measurement.leftThigh.toString(),
            measurement.rightCalf.toString(),
            measurement.leftCalf.toString(),
            measurement.notes || ''
          ]);
      }
      break;
    }
  }

  const content: string[][] = [headers].concat(rows);
  const csvContent = createCSVContent(content);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${type}_tracking.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
          return databaseService.setWeeklySummary(Number(obj.week), summary);
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
        measurement?.measurements?.chest || '',
        measurement?.measurements?.waist || '',
        measurement?.measurements?.hips || '',
        measurement?.measurements?.rightArm || '',
        measurement?.measurements?.leftArm || '',
        measurement?.measurements?.rightThigh || '',
        measurement?.measurements?.leftThigh || '',
        measurement?.measurements?.rightCalf || '',
        measurement?.measurements?.leftCalf || '',
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
  const csvContent = createCSVContent([headers, ...rows]);
  
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