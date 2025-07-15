'use server';

/**
 * @fileOverview AI chat bot for movie trivia.
 *
 * - chatBot - A function that answers questions about a movie.
 * - ChatBotInput - The input type for the chatBot function.
 * - ChatBotOutput - The return type for the chatBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatBotInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie being discussed.'),
  question: z.string().describe('The user question about the movie.'),
});
export type ChatBotInput = z.infer<typeof ChatBotInputSchema>;

const ChatBotOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type ChatBotOutput = z.infer<typeof ChatBotOutputSchema>;

export async function chatBot(input: ChatBotInput): Promise<ChatBotOutput> {
  return chatBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatBotPrompt',
  input: {schema: ChatBotInputSchema},
  output: {schema: ChatBotOutputSchema},
  prompt: `You are a movie trivia expert integrated into a watch party chat.
The users are currently watching "{{movieTitle}}".
A user has asked the following question: "{{question}}"

Provide a concise and friendly answer to their question.

Answer:`,
});

const chatBotFlow = ai.defineFlow(
  {
    name: 'chatBotFlow',
    inputSchema: ChatBotInputSchema,
    outputSchema: ChatBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
