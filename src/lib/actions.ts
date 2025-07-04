"use server";

import {
  analyzeIdentifyingInformation,
  AnalyzeIdentifyingInformationOutput,
} from "@/ai/flows/analyze-identifying-information";
import {
  generateClueCardSuggestions,
  GenerateClueCardSuggestionsOutput,
} from "@/ai/flows/generate-clue-card-suggestions";
import { z } from "zod";

const clueSchema = z.object({
  clue: z.string().min(10, "Clue must be at least 10 characters long.").max(280, "Clue can't be more than 280 characters."),
});

const topicSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long.").max(50, "Topic can't be more than 50 characters."),
});

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
        const result = await generateClueCardSuggestions({ topic: validatedFields.data.topic });
        return result;
    } catch (error) {
        return {
            suggestions: [],
            error: 'Could not generate suggestions. Please try again.'
        }
    }
}
