'use server';
/**
 * @fileOverview This flow generates a personalized daily workout plan.
 *
 * - generateWorkoutPlan - Generates a workout plan based on user profile.
 * - WorkoutProfileInput - The input type for the generateWorkoutPlan function.
 * - WorkoutProfileOutput - The return type for the generateWorkoutPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkoutProfileInputSchema = z.object({
  fitnessGoal: z.string().describe('The user\'s primary fitness goal (e.g., \'schlank werden\', \'muscle gain\').'),
  bmiLevel: z.enum(['underweight', 'normal', 'overweight']).describe('The user\'s BMI level.'),
  availableEquipment: z.array(z.string()).describe('A list of available training equipment (e.g., \'dumbbells\', \'treadmill\', \'none\').'),
  specialPreferences: z.string().optional().describe('Any special training preferences or needs (e.g., \'focus on back training\', \'avoid high impact exercises\').'),
});
export type WorkoutProfileInput = z.infer<typeof WorkoutProfileInputSchema>;

const WorkoutProfileOutputSchema = z.object({
  dailyPlan: z.object({
    day: z.string().describe('The day of the week (e.g., \'Monday\').'),
    exercises: z.array(
      z.object({
        name: z.string().describe('The name of the exercise.'),
        sets: z.number().describe('The number of sets for the exercise.'),
        reps: z.number().describe('The number of repetitions per set.'),
        method: z.string().describe('The training method or technique to use for the exercise.'),
      })
    ),
  }),
});
export type WorkoutProfileOutput = z.infer<typeof WorkoutProfileOutputSchema>;

export async function generateWorkoutPlan(input: WorkoutProfileInput): Promise<WorkoutProfileOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {
    schema: WorkoutProfileInputSchema,
  },
  output: {
    schema: WorkoutProfileOutputSchema,
  },
  prompt: `You are an expert fitness coach. Generate a daily workout plan based on the following user profile:\n\nFitness Goal: {{{fitnessGoal}}}
BMI Level: {{{bmiLevel}}}
Available Equipment: {{{availableEquipment.join(', ')}}}
Special Preferences: {{{specialPreferences}}}
\nProvide the plan for a single day, detailing exercises, sets, reps, and training methods. Ensure the plan aligns with the user's goal and preferences, and considers the available equipment. The output should strictly follow the WorkoutProfileOutputSchema structure.`,
});

const generateWorkoutPlanFlow = ai.defineFlow({
  name: 'generateWorkoutPlanFlow',
  inputSchema: WorkoutProfileInputSchema,
  outputSchema: WorkoutProfileOutputSchema,
}, async input => {
  const { output } = await prompt(input);
  return output!;
});
