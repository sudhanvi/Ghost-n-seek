'use server';
/**
 * @fileOverview Converts a text phrase into a unique emoji combination.
 *
 * - generateEmojiDna - A function that generates the emoji string.
 * - GenerateEmojiDnaInput - The input type for the function.
 * - GenerateEmojiDnaOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmojiDnaInputSchema = z.object({
  clue: z.string().describe('The clue to convert into an emoji DNA string.'),
});
export type GenerateEmojiDnaInput = z.infer<typeof GenerateEmojiDnaInputSchema>;

const GenerateEmojiDnaOutputSchema = z.object({
  emojis: z.string().describe('A unique string of 3-5 emojis that represents the clue.'),
});
export type GenerateEmojiDnaOutput = z.infer<typeof GenerateEmojiDnaOutputSchema>;

export async function generateEmojiDna(input: GenerateEmojiDnaInput): Promise<GenerateEmojiDnaOutput> {
  return generateEmojiDnaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmojiDnaPrompt',
  input: {schema: GenerateEmojiDnaInputSchema},
  output: {schema: GenerateEmojiDnaOutputSchema},
  prompt: `You are an expert at creating "Emoji DNA". Your task is to convert a given phrase into a unique, symbolic combination of 3 to 5 emojis. The combination should be creative and abstract, not literal.

  Phrase: {{{clue}}}

  Generate the Emoji DNA. Do not repeat common combinations. Make it unique every time.
  `,
});

const generateEmojiDnaFlow = ai.defineFlow(
  {
    name: 'generateEmojiDnaFlow',
    inputSchema: GenerateEmojiDnaInputSchema,
    outputSchema: GenerateEmojiDnaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
