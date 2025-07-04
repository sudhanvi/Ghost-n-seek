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
  prompt: `You are a master clue-smith for a social deduction game called Ghost n seek. Your primary goal is to analyze a chat transcript and identify **unique topics of conversation** from the user (sender: "me") that can be turned into compelling, non-identifying clues.

A "unique topic" is something that reveals personality, a unique opinion, a specific interest, a memorable experience, or a niche piece of knowledge. Your generated clues should be based *directly* on these topics.

**Your Task:**
1.  Read the entire chat history provided below.
2.  Identify 3 to 5 **unique topics** or statements from the user ("me").
3.  For each topic, summarize it as a short, punchy phrase (e.g., "Biking in Amsterdam", "Mint chocolate is evil"). The clue must be interesting and have a high "rarity score" – it should be specific, not generic.
4.  For each clue, generate a creative and abstract "Emoji DNA" string (3-5 emojis) that symbolically represents it.
5.  **Crucially, do not extract any potentially identifying information** (names, locations, contact info, etc.).

**Chat History:**
{{#each chatHistory}}
{{sender}}: {{text}}
{{/each}}

Based on your analysis, generate the clue suggestions.
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
