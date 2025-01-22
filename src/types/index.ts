export interface UserProfile {
  id: string;
  name: string;
  birthdate: string;
  age: number;
  height: string;
  location: string;
  whyStatement: string;
  startDate: string;
  currentPhase: number; // 1-3
  currentWeek: number; // 1-9
  avatarUrl?: string; // Optional profile picture URL
}

export interface Measurements {
  id: string;
  userId: string;
  date: string;
  weight: number;
  chest: number;
  chest2?: number; // Second chest measurement at fullest part
  waist: number;
  hips: number;
  rightArm: number;
  leftArm: number;
  rightThigh: number;
  leftThigh: number;
  rightCalf: number;
  leftCalf: number;
  notes?: string;
}

export interface MealEntry {
  time: string;
  hungerLevel: number;
  fullnessLevel: number;
  mindfulnessScore: number;
  hungerDuration: number; // Minutes hungry before meal
  slowEatingScore: number; // Score for eating slowly
  notes: string;
  reason?: string; // For snacks only
}

export interface DailyTracking {
  id: string;
  userId: string;
  date: string;
  dailies: {
    sleepHours: number;
    waterOz: number;
    steps: number;
  };
  meals: {
    breakfast: MealEntry;
    lunch: MealEntry;
    dinner: MealEntry;
    snacks: MealEntry[];
  };
  habits: {
    mealsWithinSchedule: boolean;
    noSnacking: boolean;
    mindfulEating: boolean;
    hungerAwareness: boolean;
    slowEating: boolean;
    treatAwareness: boolean;
  };
  treats: {
    count: number;
    categories: string[];
    notes: string;
  };
  dailyWin: string;
  notes: string;
}

export interface WeeklySummary {
  weekNumber: number;
  userId: string;
  startDate: string;
  endDate: string;
  measurements: Measurements;
  habitCompliance: Record<string, number>;
  review: {
    wentWell: string;
    improvements: string;
    notes: string;
  };
  nextWeekGoals: {
    primary: string;
    actionSteps: string;
    challenges: string;
  };
  notes: string;
} 