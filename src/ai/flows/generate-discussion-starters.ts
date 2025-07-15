'use server';
/**
 * @fileOverview An AI agent for generating post-movie discussion questions.
 *
 * - generateDiscussionStarters - A function that creates conversation prompts about a film.
 * - GenerateDiscussionStartersInput - The input type for the function.
 * - GenerateDiscussionStartersOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiscussionStartersInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie.'),
});
export type GenerateDiscussionStartersInput = z.infer<typeof GenerateDiscussionStartersInputSchema>;

const GenerateDiscussionStartersOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of 3 open-ended discussion questions about the movie.'),
});
export type GenerateDiscussionStartersOutput = z.infer<typeof GenerateDiscussionStartersOutputSchema>;

export async function generateDiscussionStarters(input: GenerateDiscussionStartersInput): Promise<GenerateDiscussionStartersOutput> {
  return generateDiscussionStartersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiscussionStartersPrompt',
  input: {schema: GenerateDiscussionStartersInputSchema},
  output: {schema: GenerateDiscussionStartersOutputSchema},
  prompt: `You are a film club moderator. The group just finished watching "{{movieTitle}}".
Your task is to generate 3 insightful, open-ended discussion questions to get the conversation started.
Avoid simple yes/no questions.

Discussion Questions:`,
});

const generateDiscussionStartersFlow = ai.defineFlow(
  {
    name: 'generateDiscussionStartersFlow',
    inputSchema: GenerateDiscussionStartersInputSchema,
    outputSchema: GenerateDiscussionStartersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
