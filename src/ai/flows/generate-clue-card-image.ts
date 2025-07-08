// src/ai/flows/generate-clue-card-image.ts

'use server';
/**
 * @fileOverview Generates a custom image for a clue card.
 *
 * - generateClueCardImage - A function that handles the image generation.
 * - GenerateClueCardImageInput - The input type for the function.
 * - GenerateClueCardImageOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClueCardImageInputSchema = z.object({
  clues: z.array(z.string()).describe('A list of clues to inspire the artwork.'),
  colorPreference: z.string().describe('The user\'s preferred color theme (e.g., "Indigo", "Lavender", "Purple").'),
});
export type GenerateClueCardImageInput = z.infer<typeof GenerateClueCardImageInputSchema>;

const GenerateClueCardImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateClueCardImageOutput = z.infer<typeof GenerateClueCardImageOutputSchema>;

export async function generateClueCardImage(input: GenerateClueCardImageInput): Promise<GenerateClueCardImageOutput> {
  return generateClueCardImageFlow(input);
}

const generateClueCardImageFlow = ai.defineFlow(
  {
    name: 'generateClueCardImageFlow',
    inputSchema: GenerateClueCardImageInputSchema,
    outputSchema: GenerateClueCardImageOutputSchema,
  },
  async ({clues, colorPreference}) => {
    const prompt = `You are an AI artist creating a digital memento that represents a meaningful conversation. Your task is to generate a beautiful, whimsical, Ghibli-inspired digital illustration that symbolically combines all of the following concepts: ${clues.join(", ")}.

Create a single, cohesive, and memorable scene. Think of it as a still from an animated film. The elements should be integrated naturally into the environment, creating a piece of art that evokes a feeling of wonder and nostalgia.

For example, if the concepts are "Joker," "white wine," and "Iceland," you could create an image of a character with a subtle, mischievous smile (reminiscent of the Joker, but not a direct copy) enjoying a glass of white wine while overlooking a fantastical, Ghibli-esque Icelandic landscape with glowing moss and gentle spirits.

The final artwork should be aesthetically pleasing, with a 9:16 aspect ratio, and should not contain any text. The overall color palette and mood should be influenced by the color theme of ${colorPreference}.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const media = response.media;

    if (!media || !media.url) {
      console.error("Image generation failed.");
      
      const errorMessage = 'Image generation failed. The model did not return an image. Please try again.';

      throw new Error(errorMessage);
    }

    return {imageUrl: media.url};
  }
);