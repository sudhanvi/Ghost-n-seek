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
});
export type GenerateClueCardSuggestionsInput = z.infer<typeof GenerateClueCardSuggestionsInputSchema>;

const GenerateClueCardSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of clue suggestions.'),
});
export type GenerateClueCardSuggestionsOutput = z.infer<typeof GenerateClueCardSuggestionsOutputSchema>;

export async function generateClueCardSuggestions(input: GenerateClueCardSuggestionsInput): Promise<GenerateClueCardSuggestionsOutput> {
  return generateClueCardSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClueCardSuggestionsPrompt',
  input: {schema: GenerateClueCardSuggestionsInputSchema},
  output: {schema: GenerateClueCardSuggestionsOutputSchema},
  prompt: `You are a creative assistant helping users generate clues about themselves for a social game.

  The user is looking for clues related to the following topic: {{{topic}}}.

  Generate five unique and interesting clue suggestions related to the topic. The clues should be short and engaging to pique interest without revealing too much personal information.

  Format the output as a JSON array of strings.
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
