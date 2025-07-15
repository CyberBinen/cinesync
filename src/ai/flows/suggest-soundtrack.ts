'use server';
/**
 * @fileOverview An AI agent for suggesting soundtracks.
 *
 * - suggestSoundtrack - A function that suggests songs based on a mood or theme.
 * - SuggestSoundtrackInput - The input type for the function.
 * - SuggestSoundtrackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSoundtrackInputSchema = z.object({
  description: z.string().describe('The user description of the desired mood, theme, or scenario for the music.'),
});
export type SuggestSoundtrackInput = z.infer<typeof SuggestSoundtrackInputSchema>;

const SuggestSoundtrackOutputSchema = z.object({
  songs: z.array(z.object({
    title: z.string().describe("The title of the suggested song."),
    artist: z.string().describe("The artist of the suggested song."),
  })).describe('A list of 5 song suggestions.'),
});
export type SuggestSoundtrackOutput = z.infer<typeof SuggestSoundtrackOutputSchema>;

export async function suggestSoundtrack(input: SuggestSoundtrackInput): Promise<SuggestSoundtrackOutput> {
  return suggestSoundtrackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSoundtrackPrompt',
  input: {schema: SuggestSoundtrackInputSchema},
  output: {schema: SuggestSoundtrackOutputSchema},
  prompt: `You are a music expert and DJ. A user wants song recommendations for a specific vibe.
Based on their description, suggest a list of 5 songs including the title and artist.

User's Description: "{{description}}"

Song Suggestions:`,
});

const suggestSoundtrackFlow = ai.defineFlow(
  {
    name: 'suggestSoundtrackFlow',
    inputSchema: SuggestSoundtrackInputSchema,
    outputSchema: SuggestSoundtrackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
