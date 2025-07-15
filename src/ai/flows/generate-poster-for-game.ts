'use server';
/**
 * @fileOverview An AI agent for generating movie posters for a guessing game.
 *
 * - generatePosterForGame - A function that creates a movie poster image for a guessing game.
 * - GeneratePosterForGameInput - The input type for the function.
 * - GeneratePosterForGameOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePosterForGameInputSchema = z.object({
    movieTitle: z.string().describe("A well-known movie title."),
});
export type GeneratePosterForGameInput = z.infer<typeof GeneratePosterForGameInputSchema>;

const GeneratePosterForGameOutputSchema = z.object({
    posterDataUri: z.string().describe("The generated movie poster as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    movieTitle: z.string().describe("The original movie title provided as input.")
});
export type GeneratePosterForGameOutput = z.infer<typeof GeneratePosterForGameOutputSchema>;

export async function generatePosterForGame(input: GeneratePosterForGameInput): Promise<GeneratePosterForGameOutput> {
    return generatePosterForGameFlow(input);
}

const generatePosterForGameFlow = ai.defineFlow({
    name: 'generatePosterForGameFlow',
    inputSchema: GeneratePosterForGameInputSchema,
    outputSchema: GeneratePosterForGameOutputSchema,
}, async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Create a movie poster for the film "${input.movieTitle}". The poster should be visually representative of the movie's theme, characters, and setting, but MUST NOT include the movie title or any text at all. The goal is for someone to guess the movie just by looking at the poster.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!media.url) {
        throw new Error("Image generation failed.");
    }

    return { posterDataUri: media.url, movieTitle: input.movieTitle };
});
