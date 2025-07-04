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
    const prompt = `You are an AI artist creating a digital memento that represents a meaningful conversation. Your task is to generate a beautiful, abstract piece of art that symbolically combines all of the following concepts: ${clues.join(", ")}.

Instead of a literal scene or characters, create a dreamlike and artistic composition. Think of it as a digital painting or a sophisticated collage. The elements should flow into each other seamlessly, creating a single, cohesive image that evokes a feeling or a memory of the conversation.

For example, if the concepts are "Joker," "white wine," and "Iceland," you could create an image with swirling, abstract shapes in deep purples and blues reminiscent of the Northern Lights, with hints of a playing card's diamond pattern, and a splash of golden-white color flowing through the scene like wine.

The final artwork should be aesthetically pleasing, with a 9:16 aspect ratio, and should not contain any text or recognizable human/mascot figures. The overall style should be influenced by the color theme of ${colorPreference}.`;

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
