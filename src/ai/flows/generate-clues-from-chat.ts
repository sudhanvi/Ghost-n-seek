'use server';
/**
 * @fileOverview Generates clue card suggestions based on a chat history.
 *
 * - generateCluesFromChat - A function that handles clue generation from chat.
 * - GenerateCluesFromChatInput - The input type for the function.
 * - GenerateCluesFromChatOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  sender: z.enum(['me', 'them']),
  text: z.string(),
});

const GenerateCluesFromChatInputSchema = z.object({
  chatHistory: z.array(MessageSchema).describe("The full transcript of the chat conversation."),
});
export type GenerateCluesFromChatInput = z.infer<typeof GenerateCluesFromChatInputSchema>;

const SuggestionSchema = z.object({
    clue: z.string().describe('The suggested clue text.'),
    emojis: z.string().describe('A unique string of 3-5 emojis that represents the clue.')
});

const GenerateCluesFromChatOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of clue suggestions derived from the chat, each with text and an emoji DNA string.'),
});
export type GenerateCluesFromChatOutput = z.infer<typeof GenerateCluesFromChatOutputSchema>;

export async function generateCluesFromChat(input: GenerateCluesFromChatInput): Promise<GenerateCluesFromChatOutput> {
  return generateCluesFromChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCluesFromChatPrompt',
  input: {schema: GenerateCluesFromChatInputSchema},
  output: {schema: GenerateCluesFromChatOutputSchema},
  prompt: `You are an expert NLP analyst and a creative clue-smith for a social deduction game called Ghost n seek. Your task is to analyze a chat transcript and generate compelling, non-identifying clues based on the user's (sender: "me") messages.

**Analysis Process:**
1.  **Entity and Keyword Extraction:** First, read the user's messages and perform entity recognition. Identify key nouns, verbs, and concepts. Extract keywords and topics of conversation. Ignore common filler words (e.g., "the", "a", "is", "I think").
2.  **Topic Clustering:** Group the extracted keywords and entities into 3-5 distinct, high-level topics. A topic should represent a unique interest, opinion, or experience. For example, keywords like "hike", "mountain", "trail" could be clustered under the topic "Hiking".
3.  **Clue Synthesis:** For each clustered topic, synthesize a short, intriguing clue. The clue should be a punchy phrase that captures the essence of the topic, making it sound unique and personal (e.g., "Thinks mint chocolate is evil," or "Loves biking through Amsterdam"). These clues must have a high "rarity score" - meaning they are specific, not generic like "likes food".
4.  **Context Preservation:** It is crucial to preserve the original context of the conversation. Do not generalize specific references. For example, if the user talks about "The Dark Knight's Joker", the clue should refer to that specific character, not a generic "chaotic clown" which could be misinterpreted as being about something else, like Stephen King's IT.
5.  **Emoji DNA:** For each synthesized clue, create a unique and abstract "Emoji DNA" string (3-5 emojis) that symbolically represents it.
6.  **Safety First:** Absolutely do not extract any Personally Identifiable Information (PII) like names, specific locations (unless it's a very famous public place like "Eiffel Tower"), contact details, etc.

**Chat History:**
{{#each chatHistory}}
{{sender}}: {{text}}
{{/each}}

Based on your multi-step analysis, generate the clue suggestions.
  `,
});

const generateCluesFromChatFlow = ai.defineFlow(
  {
    name: 'generateCluesFromChatFlow',
    inputSchema: GenerateCluesFromChatInputSchema,
    outputSchema: GenerateCluesFromChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
