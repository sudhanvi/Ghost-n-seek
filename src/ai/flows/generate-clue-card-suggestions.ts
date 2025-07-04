'use server';
/**
 * @fileOverview Provides suggested clues for users to populate their clue cards.
 *
 * - generateClueCardSuggestions - A function that generates clue suggestions.
 * - GenerateClueCardSuggestionsInput - The input type for the generateClueCardSuggestions function.
 * - GenerateClueCardSuggestionsOutput - The return type for the generateClueCardSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClueCardSuggestionsInputSchema = z.object({
  topic: z.string().describe('The general topic to generate clues for.'),
  currentDate: z.string().describe('The current date to provide temporal context for suggestions.'),
});
export type GenerateClueCardSuggestionsInput = z.infer<typeof GenerateClueCardSuggestionsInputSchema>;

const SuggestionSchema = z.object({
    clue: z.string().describe('The suggested clue text.'),
    emojis: z.string().describe('A unique string of 3-5 emojis that represents the clue.')
});

const GenerateClueCardSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of clue suggestions, each with text and an emoji DNA string.'),
});
export type GenerateClueCardSuggestionsOutput = z.infer<typeof GenerateClueCardSuggestionsOutputSchema>;

export async function generateClueCardSuggestions(input: GenerateClueCardSuggestionsInput): Promise<GenerateClueCardSuggestionsOutput> {
  return generateClueCardSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClueCardSuggestionsPrompt',
  input: {schema: GenerateClueCardSuggestionsInputSchema},
  output: {schema: GenerateClueCardSuggestionsOutputSchema},
  prompt: `You are a creative assistant helping users generate clues about themselves for a social game called Ghost n seek. The clues should have a high "rarity score" - meaning they are unique and specific, not generic.

  The user is looking for clues related to the following topic: {{{topic}}}.
  The current date is {{{currentDate}}}, use this for temporal context if relevant (e.g., recent events, holidays).

  Generate five unique and interesting clue suggestions.
  For each clue, also generate a creative and abstract "Emoji DNA" string (3-5 emojis) that symbolically represents the clue.

  Example for topic "Music":
  - Clue: "I think the ending of the new sci-fi blockbuster was brilliant." (Temporal Context) -> Emojis: "🎬🤖🤔"
  - Clue: "My go-to karaoke song is a power ballad from the 80s." (High Rarity) -> Emojis: "🎤👩‍🎤✨"

  Focus on rarity and context. Avoid common, low-score clues like "I like pizza".
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateClueCardSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateClueCardSuggestionsFlow',
    inputSchema: GenerateClueCardSuggestionsInputSchema,
    outputSchema: GenerateClueCardSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
