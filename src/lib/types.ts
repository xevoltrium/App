export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface UserProfile {
  name: string;
  fitnessGoal: string;
  bmiLevel: BMICategory;
  availableEquipment: string[];
  specialPreferences?: string;
  isBoarded: boolean;
  role: 'user' | 'admin';
  geminiApiKey?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  repsOrDuration: string;
  trainingMethod: string;
  instructions: string;
}

export interface DailyWorkout {
  dayName: string;
  focus: string;
  exercises: WorkoutExercise[];
  isCompleted?: boolean;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  dailyWorkouts: DailyWorkout[];
  userId: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}
