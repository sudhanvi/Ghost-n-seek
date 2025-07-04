"use server";

import {
  analyzeIdentifyingInformation,
  AnalyzeIdentifyingInformationOutput,
} from "@/ai/flows/analyze-identifying-information";
import {
  generateClueCardSuggestions,
  GenerateClueCardSuggestionsOutput,
} from "@/ai/flows/generate-clue-card-suggestions";
import { moderateChatMessage, ModerateChatMessageOutput } from "@/ai/flows/moderate-chat-message";
import { generateEmojiDna, GenerateEmojiDnaOutput } from "@/ai/flows/generate-emoji-dna";
import { generateClueCardImage, GenerateClueCardImageOutput } from "@/ai/flows/generate-clue-card-image";
import { z } from "zod";

const clueSchema = z.object({
  clue: z.string().min(10, "Clue must be at least 10 characters long.").max(280, "Clue can't be more than 280 characters."),
});

const topicSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long.").max(50, "Topic can't be more than 50 characters."),
});


// Chat moderation
export async function moderateMessage(message: string): Promise<ModerateChatMessageOutput> {
  if (!message.trim()) return { isAppropriate: true, moderatedMessage: message };
  try {
    return await moderateChatMessage({ message });
  } catch (error) {
    console.error("Moderation error:", error);
    return { isAppropriate: false, moderatedMessage: '🌟 This message was ghosted!' };
  }
}

// Emoji DNA for custom clues
export async function getEmojiDna(clue: string): Promise<GenerateEmojiDnaOutput> {
    try {
        return await generateEmojiDna({ clue });
    } catch (error) {
        console.error("Emoji DNA generation error:", error);
        return { emojis: '✨' }; // Fallback emoji
    }
}

// Clue Card Image Generation
export async function generateCardImage(clues: string[], colorPreference: string): Promise<(GenerateClueCardImageOutput & { error?: string })> {
    if (!clues || clues.length === 0) {
        return { imageUrl: '', error: 'Please add at least one clue to generate an image.' };
    }
    try {
        return await generateClueCardImage({ clues, colorPreference });
    } catch (error) {
        console.error("Card image generation error:", error);
        return { imageUrl: '', error: 'Could not generate card image. Please try again later.' };
    }
}

export async function analyzeClue(
  prevState: AnalyzeIdentifyingInformationOutput | null,
  formData: FormData
): Promise<AnalyzeIdentifyingInformationOutput | null> {
  const validatedFields = clueSchema.safeParse({
    clue: formData.get("clue"),
  });

  if (!validatedFields.success) {
    return {
      hasIdentifyingInformation: true,
      explanation: validatedFields.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const result = await analyzeIdentifyingInformation({
      clueCardContent: validatedFields.data.clue,
    });
    return result;
  } catch (error) {
    return {
      hasIdentifyingInformation: true,
      explanation: "Could not analyze clue. Please try again.",
    };
  }
}

export async function generateSuggestions(
  prevState: (GenerateClueCardSuggestionsOutput & {error?: string}) | null,
  formData: FormData
): Promise<(GenerateClueCardSuggestionsOutput & {error?: string}) | null> {
    const validatedFields = topicSchema.safeParse({
        topic: formData.get('topic'),
    });

    if (!validatedFields.success) {
        return {
            suggestions: [],
            error: validatedFields.error.errors.map(e => e.message).join(', ')
        }
    }

    try {
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const result = await generateClueCardSuggestions({ topic: validatedFields.data.topic, currentDate });
        return result;
    } catch (error) {
        return {
            suggestions: [],
            error: 'Could not generate suggestions. Please try again.'
        }
    }
}
