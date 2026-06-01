'use server';
/**
 * @fileOverview A Genkit flow for generating specialized workout plans based on user requests.
 *
 * - generateSpecializedWorkoutPlan - A function that generates a personalized, specialized workout plan.
 * - GenerateSpecializedWorkoutPlanInput - The input type for the generateSpecializedWorkoutPlan function.
 * - GenerateSpecializedWorkoutPlanOutput - The return type for the generateSpecializedWorkoutPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpecializedWorkoutPlanInputSchema = z.object({
  fitnessGoal: z.string().describe("The user's primary fitness goal (e.g., 'lose weight', 'build muscle', 'improve endurance')."),
  bmiLevel: z.enum(['underweight', 'normal', 'overweight', 'obese']).describe("The user's BMI category."),
  availableEquipment: z.array(z.string()).describe("List of available workout equipment (e.g., 'dumbbells', 'resistance bands', 'pull-up bar', 'gym access', 'no equipment')."),
  specializationRequest: z.string().describe("User's specific request for specialized training (e.g., 'focus on lower back strength', 'HIIT for fat loss', 'increase bicep mass', 'yoga for flexibility')."),
});
export type GenerateSpecializedWorkoutPlanInput = z.infer<typeof GenerateSpecializedWorkoutPlanInputSchema>;

const GenerateSpecializedWorkoutPlanOutputSchema = z.object({
  planTitle: z.string().describe("A concise and descriptive title for the specialized workout plan."),
  planDescription: z.string().describe("A brief overview of the specialized workout plan."),
  dailyWorkouts: z.array(z.object({
    dayName: z.string().describe("Name of the workout day (e.g., 'Day 1', 'Monday - Back & Biceps')."),
    focus: z.string().describe("Primary focus of this day's workout (e.g., 'Back Strength', 'HIIT Cardio', 'Bicep Hypertrophy')."),
    exercises: z.array(z.object({
        name: z.string().describe("Name of the exercise."),
        sets: z.number().int().positive().describe("Number of sets for the exercise."),
        repsOrDuration: z.string().describe("Number of repetitions (e.g., '8-12 reps') or duration (e.g., '30 seconds') or distance (e.g., '1 mile')."),
        trainingMethod: z.string().describe("Specific training method for this exercise (e.g., 'Standard', 'Superset with Exercise B', 'Drop Set', 'Pyramid', 'AMRAP')."),
        instructions: z.string().describe("Brief instructions on how to perform the exercise, including form tips and rest times."),
    })).describe("List of exercises for the day."),
  })).describe("An array of daily workout routines for the specialized plan, typically for one week."),
});
export type GenerateSpecializedWorkoutPlanOutput = z.infer<typeof GenerateSpecializedWorkoutPlanOutputSchema>;

export async function generateSpecializedWorkoutPlan(input: GenerateSpecializedWorkoutPlanInput): Promise<GenerateSpecializedWorkoutPlanOutput> {
  return generateSpecializedWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpecializedWorkoutPlanPrompt',
  input: {schema: GenerateSpecializedWorkoutPlanInputSchema},
  output: {schema: GenerateSpecializedWorkoutPlanOutputSchema},
  prompt: `You are an expert fitness coach creating a personalized and specialized workout plan.
The user wants a specialized workout plan based on the following information:

Fitness Goal: {{{fitnessGoal}}}
BMI Level: {{{bmiLevel}}}
Available Equipment: {{#each availableEquipment}}- {{{this}}}{{/each}}
Specialization Request: "{{{specializationRequest}}}"

Create a detailed, weekly workout plan (e.g., 5-7 days) that specifically caters to the user's 'Specialization Request', while also considering their 'Fitness Goal', 'BMI Level', and 'Available Equipment'.
Each day should have a clear focus and a list of exercises. For each exercise, provide the name, number of sets, repetitions or duration, the specific training method to use, and brief instructions including form tips and recommended rest times.
Ensure the plan is realistic and effective given the user's constraints and goals. Prioritize the specialization request heavily.`,
});

const generateSpecializedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generateSpecializedWorkoutPlanFlow',
    inputSchema: GenerateSpecializedWorkoutPlanInputSchema,
    outputSchema: GenerateSpecializedWorkoutPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate specialized workout plan.');
    }
    return output;
  }
);
