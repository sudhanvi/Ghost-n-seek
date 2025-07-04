// src/ai/flows/analyze-identifying-information.ts
'use server';

/**
 * @fileOverview Analyzes clue card content for potentially identifying information.
 *
 * - analyzeIdentifyingInformation - A function that analyzes the clue card content.
 * - AnalyzeIdentifyingInformationInput - The input type for the analyzeIdentifyingInformation function.
 * - AnalyzeIdentifyingInformationOutput - The return type for the analyzeIdentifyingInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIdentifyingInformationInputSchema = z.object({
  clueCardContent: z.string().describe('The content of the clue card to analyze.'),
});
export type AnalyzeIdentifyingInformationInput = z.infer<typeof AnalyzeIdentifyingInformationInputSchema>;

const AnalyzeIdentifyingInformationOutputSchema = z.object({
  hasIdentifyingInformation: z.boolean().describe('Whether the clue card content contains potentially identifying information.'),
  explanation: z.string().describe('Explanation of why the content is potentially identifying.'),
});
export type AnalyzeIdentifyingInformationOutput = z.infer<typeof AnalyzeIdentifyingInformationOutputSchema>;

export async function analyzeIdentifyingInformation(input: AnalyzeIdentifyingInformationInput): Promise<AnalyzeIdentifyingInformationOutput> {
  return analyzeIdentifyingInformationFlow(input);
}

const analyzeIdentifyingInformationPrompt = ai.definePrompt({
  name: 'analyzeIdentifyingInformationPrompt',
  input: {schema: AnalyzeIdentifyingInformationInputSchema},
  output: {schema: AnalyzeIdentifyingInformationOutputSchema},
  prompt: `You are an expert in online anonymity and privacy.

  Analyze the following clue card content and determine if it contains any potentially identifying information that could deanonymize the user.

  Clue Card Content: {{{clueCardContent}}}

  Respond with a boolean value for 'hasIdentifyingInformation'. If true, also provide a detailed explanation in the 'explanation' field as to why the content could be identifying.
  If false, the explanation should be empty.
  `,
});

const analyzeIdentifyingInformationFlow = ai.defineFlow(
  {
    name: 'analyzeIdentifyingInformationFlow',
    inputSchema: AnalyzeIdentifyingInformationInputSchema,
    outputSchema: AnalyzeIdentifyingInformationOutputSchema,
  },
  async input => {
    const {output} = await analyzeIdentifyingInformationPrompt(input);
    return output!;
  }
);
