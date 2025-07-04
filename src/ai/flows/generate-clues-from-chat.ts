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
  prompt: `You are a creative assistant for a social game called Ghost n seek. Your task is to analyze a chat conversation and extract interesting, unique, and non-identifying clues about the user (sender: "me").

  The clues should have a high "rarity score" - meaning they are specific and not generic. They should be phrased from the user's perspective (e.g., "I enjoy...").
  Focus on hobbies, opinions, unique experiences, and tastes mentioned by the user. Ignore generic conversational filler. Do not extract any potentially identifying information.

  For each clue you generate, also create a creative and abstract "Emoji DNA" string (3-5 emojis) that symbolically represents it.

  Here is the chat history:
  {{#each chatHistory}}
  {{sender}}: {{text}}
  {{/each}}

  Generate 3 to 5 clue suggestions based on the user's (me) messages.
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
