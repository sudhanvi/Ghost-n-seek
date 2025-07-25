// src/lib/actions.ts
'use server';

import {
  generateCluesFromChat,
  type Suggestion,
} from '@/ai/flows/generate-clues-from-chat';
import {
  moderateChatMessage,
  ModerateChatMessageOutput,
} from '@/ai/flows/moderate-chat-message';
import {
  generateClueCardImage,
  GenerateClueCardImageInput,
  GenerateClueCardImageOutput,
} from '@/ai/flows/generate-clue-card-image';
import {z} from 'zod';

type Message = {
  id: number;
  sender: 'me' | 'them';
  text: string;
};

// Chat moderation
export async function moderateMessage(
  message: string
): Promise<ModerateChatMessageOutput> {
  if (!message.trim())
    return {isAppropriate: true, moderatedMessage: message};
  try {
    return await moderateChatMessage({message});
  } catch (error) {
    console.error('Moderation error:', error);
    return {
      isAppropriate: false,
      moderatedMessage: '🌟 This message was ghosted!',
    };
  }
}

export async function generateCluesFromChatAction(chatHistory: Message[]): Promise<{
  userSuggestions: Suggestion[];
  partnerSuggestions: Suggestion[];
  error?: string;
}> {
  if (!chatHistory || chatHistory.length === 0) {
    return {
      userSuggestions: [],
      partnerSuggestions: [],
      error: 'No chat history found to generate clues from.',
    };
  }

  const chatHistoryWithoutId = chatHistory.map(({id, ...rest}) => rest);

  try {
    const [userResult, partnerResult] = await Promise.all([
      generateCluesFromChat({
        chatHistory: chatHistoryWithoutId,
        targetSender: 'me',
      }),
      generateCluesFromChat({
        chatHistory: chatHistoryWithoutId,
        targetSender: 'them',
      }),
    ]);

    return {
      userSuggestions: userResult.suggestions,
      partnerSuggestions: partnerResult.suggestions,
    };
  } catch (error: any) {
    console.error('Clue from chat generation error:', error);
    return {
      userSuggestions: [],
      partnerSuggestions: [],
      error: 'Could not generate clues from chat. Please try again.',
    };
  }
}

export async function generateImageForCard(
  input: GenerateClueCardImageInput
): Promise<GenerateClueCardImageOutput & {error?: string}> {
  if (!input.clues || input.clues.some(c => !c.trim())) {
    return {
      imageUrl: '',
      error: 'Valid clues are required to generate an image.',
    };
  }

  try {
    const result = await generateClueCardImage(input);
    return result;
  } catch (error: any) {
    console.error('Image generation action error:', error);
    return {
      imageUrl: '',
      error:
        error.message ||
        'Could not generate card image. The prompt may have been blocked by safety filters.',
    };
  }
}