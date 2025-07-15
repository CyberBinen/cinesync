'use server';

/**
 * @fileOverview AI film recommendation agent.
 *
 * - recommendFilm - A function that recommends films based on user preferences.
 * - RecommendFilmInput - The input type for the recommendFilm function.
 * - RecommendFilmOutput - The return type for the recommendFilm function.
 */

import {ai} from '@/ai/genkit';
import { generatePoster } from '@/ai/flows/generate-poster';
import {z} from 'genkit';

const RecommendFilmInputSchema = z.object({
  viewingHistory: z
    .string()
    .describe(
      'A description of the user historical preferences in films, including genres, actors, and directors.'
    ),
  preferences: z
    .string()
    .describe('The user current preferences, including desired mood or theme.'),
});
export type RecommendFilmInput = z.infer<typeof RecommendFilmInputSchema>;

const RecommendFilmOutputSchema = z.object({
  title: z.string().describe('The title of the recommended film.'),
  genre: z.string().describe('The genre of the recommended film.'),
  streamingService: z.string().describe('The streaming service where the film is available.'),
  shortDescription: z.string().describe('A short description of the film.'),
  posterDataUri: z.string().describe("The generated movie poster as a data URI.")
});
export type RecommendFilmOutput = z.infer<typeof RecommendFilmOutputSchema>;

export async function recommendFilm(input: RecommendFilmInput): Promise<RecommendFilmOutput> {
  return recommendFilmFlow(input);
}

const filmDetailsPrompt = ai.definePrompt({
  name: 'recommendFilmDetailsPrompt',
  input: {schema: RecommendFilmInputSchema},
  output: {schema: z.object({
    title: z.string().describe('The title of the recommended film.'),
    genre: z.string().describe('The genre of the recommended film.'),
    streamingService: z.string().describe('The streaming service where the film is available.'),
    shortDescription: z.string().describe('A short description of the film.'),
  })},
  prompt: `You are a film expert. Given a user's viewing history and current
preferences, you will recommend a film that they might enjoy watching.

Viewing History: {{{viewingHistory}}}
Preferences: {{{preferences}}}

Film Recommendation:`,
});

const recommendFilmFlow = ai.defineFlow(
  {
    name: 'recommendFilmFlow',
    inputSchema: RecommendFilmInputSchema,
    outputSchema: RecommendFilmOutputSchema,
  },
  async input => {
    const { output: filmDetails } = await filmDetailsPrompt(input);
    if (!filmDetails) {
      throw new Error("Failed to get film details.");
    }
    
    const { posterDataUri } = await generatePoster(filmDetails);

    return {
      ...filmDetails,
      posterDataUri,
    };
  }
);
