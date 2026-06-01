'use server';
/**
 * @fileOverview Genkit flow for chatting with a personal trainer AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithTrainerInputSchema = z.object({
  message: z.string().describe('The user\'s question or message.'),
  userProfile: z.object({
    fitnessGoal: z.string(),
    bmiLevel: z.string(),
  }).optional(),
});

const ChatWithTrainerOutputSchema = z.object({
  response: z.string().describe('The AI trainer\'s helpful response.'),
});

export async function chatWithTrainer(input: z.infer<typeof ChatWithTrainerInputSchema>) {
  return chatWithTrainerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithTrainerPrompt',
  input: { schema: ChatWithTrainerInputSchema },
  output: { schema: ChatWithTrainerOutputSchema },
  prompt: `You are an encouraging and knowledgeable AI Fitness Trainer.
The user is asking: "{{{message}}}"

{{#if userProfile}}
Context about the user:
- Goal: {{{userProfile.fitnessGoal}}}
- BMI: {{{userProfile.bmiLevel}}}
{{/if}}

Provide a concise, motivating, and helpful answer in German. Focus on practical advice.`,
});

const chatWithTrainerFlow = ai.defineFlow({
  name: 'chatWithTrainerFlow',
  inputSchema: ChatWithTrainerInputSchema,
  outputSchema: ChatWithTrainerOutputSchema,
}, async (input) => {
  const { output } = await prompt(input);
  if (!output) throw new Error('No response from AI');
  return output;
});
