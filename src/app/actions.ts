'use server';

import { recommendFilm, RecommendFilmInput, RecommendFilmOutput } from "@/ai/flows/recommend-film";
import { searchFilm, SearchFilmInput, SearchFilmOutput } from "@/ai/flows/search-film";
import { summarizeChat, SummarizeChatInput, SummarizeChatOutput } from "@/ai/flows/summarize-chat";
import { chatBot, ChatBotInput, ChatBotOutput } from "@/ai/flows/chat-bot";
import { generateDiscussionStarters, GenerateDiscussionStartersInput, GenerateDiscussionStartersOutput } from "@/ai/flows/generate-discussion-starters";
import { suggestSoundtrack, SuggestSoundtrackInput, SuggestSoundtrackOutput } from "@/ai/flows/suggest-soundtrack";
import { generatePosterForGame, GeneratePosterForGameInput, GeneratePosterForGameOutput } from "@/ai/flows/generate-poster-for-game";

import { z } from "zod";

const recommendFilmActionSchema = z.object({
    viewingHistory: z.string().min(10, "Please describe your viewing history in a bit more detail."),
    preferences: z.string().min(5, "Please describe your preferences."),
});

const searchFilmActionSchema = z.object({
    movieTitle: z.string().min(2, "Please enter a movie title."),
});

const summarizeChatActionSchema = z.object({
    chatHistory: z.string().min(1, "Chat history cannot be empty."),
});

const chatBotActionSchema = z.object({
    movieTitle: z.string(),
    question: z.string().min(1, "Question cannot be empty."),
});

const discussionStartersActionSchema = z.object({
    movieTitle: z.string(),
});

const suggestSoundtrackActionSchema = z.object({
    description: z.string().min(5, "Please describe the mood or theme."),
});

const generatePosterForGameActionSchema = z.object({
    movieTitle: z.string().min(2, "Please enter a movie title."),
});


export async function getFilmRecommendation(
  prevState: any,
  formData: FormData
): Promise<{
  message: string;
  recommendation?: RecommendFilmOutput;
  error?: any;
}> {
  const validatedFields = recommendFilmActionSchema.safeParse({
    viewingHistory: formData.get('viewingHistory'),
    preferences: formData.get('preferences'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await recommendFilm(validatedFields.data as RecommendFilmInput);
    return { message: "success", recommendation: result };
  } catch (e) {
    console.error(e);
    return { message: "error", error: "Something went wrong with the AI. Please try again." };
  }
}


export async function searchForFilm(
  prevState: any,
  formData: FormData
): Promise<{
    message: string;
    recommendation?: SearchFilmOutput;
    error?: any;
}> {
    const validatedFields = searchFilmActionSchema.safeParse({
        movieTitle: formData.get('movieTitle') as string
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed",
            error: validatedFields.error.flatten().fieldErrors
        };
    }

    try {
        const result = await searchFilm({ title: validatedFields.data.movieTitle });
        return { message: "success", recommendation: result };
    } catch(e) {
        console.error(e);
        return { message: "error", error: "Something went wrong with the AI. Please try again." };
    }
}

export async function getChatSummary(
    prevState: any,
    formData: FormData
): Promise<{
    summary?: string;
    error?: string;
}> {
    const validatedFields = summarizeChatActionSchema.safeParse({
        chatHistory: formData.get('chatHistory')
    });

    if (!validatedFields.success) {
        return { error: "Validation failed" };
    }

    try {
        const result = await summarizeChat(validatedFields.data);
        return { summary: result.summary };
    } catch(e) {
        return { error: "Something went wrong with the AI. Please try again." };
    }
}

export async function getTriviaAnswer(
    prevState: any,
    formData: FormData
): Promise<{
    answer?: string;
    error?: string;
}> {
     const validatedFields = chatBotActionSchema.safeParse({
        movieTitle: formData.get('movieTitle'),
        question: formData.get('question'),
    });

    if (!validatedFields.success) {
        return { error: "Validation failed" };
    }

     try {
        const result = await chatBot(validatedFields.data);
        return { answer: result.answer };
    } catch(e) {
        return { error: "Something went wrong with the AI. Please try again." };
    }
}

export async function getDiscussionStarters(
  input: GenerateDiscussionStartersInput
): Promise<{
    questions?: string[];
    error?: string;
}> {
    const validatedFields = discussionStartersActionSchema.safeParse(input);

    if (!validatedFields.success) {
        return { error: "Validation failed" };
    }

    try {
        const result = await generateDiscussionStarters(validatedFields.data);
        return { questions: result.questions };
    } catch(e) {
        return { error: "Something went wrong with the AI. Please try again." };
    }
}

export async function getSoundtrackSuggestion(
    prevState: any,
    formData: FormData
): Promise<{
    message: string;
    suggestions?: SuggestSoundtrackOutput;
    error?: any;
}> {
    const validatedFields = suggestSoundtrackActionSchema.safeParse({
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed",
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const result = await suggestSoundtrack(validatedFields.data as SuggestSoundtrackInput);
        return { message: "success", suggestions: result };
    } catch (e) {
        console.error(e);
        return { message: "error", error: "Something went wrong with the AI. Please try again." };
    }
}

export async function getGamePoster(
  prevState: any,
  formData: FormData
): Promise<{
    message: string;
    poster?: GeneratePosterForGameOutput;
    error?: any;
}> {
  const validatedFields = generatePosterForGameActionSchema.safeParse({
    movieTitle: formData.get('movieTitle'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generatePosterForGame(validatedFields.data as GeneratePosterForGameInput);
    return { message: "success", poster: result };
  } catch (e) {
    console.error(e);
    return { message: "error", error: "Something went wrong with the AI. Please try again." };
  }
}