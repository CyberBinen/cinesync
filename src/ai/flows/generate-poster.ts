'use server';
/**
 * @fileOverview An AI agent for generating movie posters.
 *
 * - generatePoster - A function that creates a movie poster image.
 * - GeneratePosterInput - The input type for the function.
 * - GeneratePosterOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePosterInputSchema = z.object({
    title: z.string().describe("The title of the film."),
    shortDescription: z.string().describe("A short description of the film.")
});
export type GeneratePosterInput = z.infer<typeof GeneratePosterInputSchema>;

const GeneratePosterOutputSchema = z.object({
    posterDataUri: z.string().describe("The generated movie poster as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GeneratePosterOutput = z.infer<typeof GeneratePosterOutputSchema>;

export async function generatePoster(input: GeneratePosterInput): Promise<GeneratePosterOutput> {
    return generatePosterFlow(input);
}

const generatePosterFlow = ai.defineFlow({
    name: 'generatePosterFlow',
    inputSchema: GeneratePosterInputSchema,
    outputSchema: GeneratePosterOutputSchema,
}, async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate an artistic, high-quality movie poster for a film titled "${input.title}". The film is about: "${input.shortDescription}". The poster should be visually striking and capture the mood of the film. Do not include any text in the image.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!media.url) {
        throw new Error("Image generation failed.");
    }

    return { posterDataUri: media.url };
});
