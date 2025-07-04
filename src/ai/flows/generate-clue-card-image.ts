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
    const prompt = `Generate a visually unique, abstract, and artistic illustration for a social deduction game's clue card. The style should be mysterious and ghostly, using a primary color theme of ${colorPreference}. The illustration should be inspired by the following concepts without being literal: ${clues.join(", ")}. The final image should have an aspect ratio of 9:16 and look like a digital art piece, not a photo.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const media = response.media;

    if (!media || !media.url) {
      const finishReason = response.candidates[0]?.finishReason;
      console.error("Image generation failed.", { finishReason, safetyRatings: response.candidates[0]?.safetyRatings });

      let errorMessage = 'Image generation failed.';
      if (finishReason === 'SAFETY') {
        errorMessage = 'Image could not be generated due to safety policies. Please try different clues.';
      } else if (finishReason) {
        errorMessage = `Image generation failed. Reason: ${finishReason}`;
      } else {
        errorMessage = 'The model did not return an image. Please try again.';
      }

      throw new Error(errorMessage);
    }

    return {imageUrl: media.url};
  }
);
