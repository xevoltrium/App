'use server';
/**
 * @fileOverview A Genkit flow for admins to review and edit AI-generated workout plans.
 *
 * - editAiGeneratedPlan - A function to edit AI-generated workout plans.
 * - EditAiGeneratedPlanInput - The input type for the editAiGeneratedPlan function.
 * - EditAiGeneratedPlanOutput - The return type for the editAiGeneratedPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditAiGeneratedPlanInputSchema = z.object({
  planId: z.string().describe('The ID of the AI-generated workout plan to edit.'),
  editedPlan: z.any().describe('The edited workout plan content.'),
  reasoning: z.string().describe('The reasoning behind the edits made.'),
});

export type EditAiGeneratedPlanInput = z.infer<typeof EditAiGeneratedPlanInputSchema>;

const EditAiGeneratedPlanOutputSchema = z.object({
  success: z.boolean().describe('Indicates if the plan editing was successful.'),
  message: z.string().describe('A message detailing the outcome of the editing process.'),
});

export type EditAiGeneratedPlanOutput = z.infer<typeof EditAiGeneratedPlanOutputSchema>;

async function editAiGeneratedPlan(input: EditAiGeneratedPlanInput): Promise<EditAiGeneratedPlanOutput> {
  return editAiGeneratedPlanFlow(input);
}

const editAiGeneratedPlanPrompt = ai.definePrompt({
  name: 'editAiGeneratedPlanPrompt',
  input: {
    schema: z.object({
      planId: z.string(),
      editedPlan: z.any(),
      reasoning: z.string(),
    }),
  },
  output: {
    schema: EditAiGeneratedPlanOutputSchema,
  },
  prompt: `You are an AI assistant tasked with helping administrators review and edit AI-generated workout plans. 

A plan with ID '{{planId}}' has been provided for editing.

Reasoning for edits: '{{reasoning}}'

Here is the edited plan content: {{editedPlan}}

Please review these edits and confirm if they are acceptable and if the plan is ready for user presentation. Respond with a JSON object containing 'success' (boolean) and 'message' (string) fields.

Example of expected output:
{
  "success": true,
  "message": "Plan edited successfully and adheres to standards."
}

Or:

{
  "success": false,
  "message": "Edits require further review due to potential issues with exercise C."
}
`,
});

const editAiGeneratedPlanFlow = ai.defineFlow<EditAiGeneratedPlanInput, EditAiGeneratedPlanOutput>({
  name: 'editAiGeneratedPlanFlow',
  inputSchema: EditAiGeneratedPlanInputSchema,
  outputSchema: EditAiGeneratedPlanOutputSchema,
}, async input => {
  const {output} = await editAiGeneratedPlanPrompt(input);
  return output!;
});

export { editAiGeneratedPlan };
