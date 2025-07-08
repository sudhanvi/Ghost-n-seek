// src/ai/flows/moderate-chat-message.ts

'use server';
/**
 * @fileOverview A chat moderation AI agent.
 *
 * - moderateChatMessage - A function that handles chat message moderation.
 * - ModerateChatMessageInput - The input type for the moderateChatMessage function.
 * - ModerateChatMessageOutput - The return type for the moderateChatMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatMessageInputSchema = z.object({
  message: z.string().describe('The chat message to moderate.'),
});
export type ModerateChatMessageInput = z.infer<typeof ModerateChatMessageInputSchema>;

const ModerateChatMessageOutputSchema = z.object({
  moderatedMessage: z.string().describe('The moderated message. If moderation was applied, this will contain the placeholder text.'),
  isAppropriate: z.boolean().describe('Whether the original message was appropriate or not.'),
});
export type ModerateChatMessageOutput = z.infer<typeof ModerateChatMessageOutputSchema>;

export async function moderateChatMessage(input: ModerateChatMessageInput): Promise<ModerateChatMessageOutput> {
  return moderateChatMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateChatMessagePrompt',
  input: {schema: ModerateChatMessageInputSchema},
  output: {schema: ModerateChatMessageOutputSchema},
  prompt: `You are a chat moderator for an anonymous chat app called Ghost n seek. Your job is to protect users by filtering out harmful or identifying content.

Analyze the following message for any of the following violations:
- Profanity (use a standard English blacklist).
- Personally Identifiable Information (PII) like phone numbers, real names, or email addresses (use regex-style pattern matching).
- Social media handles (e.g., "@username", "snap:", "insta:").
- Predatory, hateful, or explicit language.
- URLs or attempts to direct users off-platform.

Message: {{{message}}}

If the message contains any violations, set 'isAppropriate' to false and set 'moderatedMessage' to '🌟 This message was ghosted!'.
If the message is clean, set 'isAppropriate' to true and return the original message in 'moderatedMessage'.
  `,
});

const moderateChatMessageFlow = ai.defineFlow(
  {
    name: 'moderateChatMessageFlow',
    inputSchema: ModerateChatMessageInputSchema,
    outputSchema: ModerateChatMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);