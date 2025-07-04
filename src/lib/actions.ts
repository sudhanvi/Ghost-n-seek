'use server';

import {
  generateClueCardSuggestions,
  GenerateClueCardSuggestionsOutput,
} from '@/ai/flows/generate-clue-card-suggestions';
import {
  generateCluesFromChat,
  GenerateCluesFromChatOutput,
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

const topicSchema = z
  .object({
    topic: z
      .string()
      .min(3, 'Topic must be at least 3 characters long.')
      .max(50, "Topic can't be more than 50 characters."),
  });

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

export async function generateSuggestions(
  prevState: (GenerateClueCardSuggestionsOutput & {error?: string}) | null,
  formData: FormData
): Promise<(GenerateClueCardSuggestionsOutput & {error?: string}) | null> {
  const validatedFields = topicSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      suggestions: [],
      error: validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }

  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const result = await generateClueCardSuggestions({
      topic: validatedFields.data.topic,
      currentDate,
    });
    return result;
  } catch (error) {
    return {
      suggestions: [],
      error: 'Could not generate suggestions. Please try again.',
    };
  }
}

export async function generateCluesFromChatAction(
  chatHistory: Message[]
): Promise<GenerateCluesFromChatOutput & {error?: string}> {
  if (!chatHistory || chatHistory.length === 0) {
    return {
      suggestions: [],
      error: 'No chat history found to generate clues from.',
    };
  }

  try {
    const result = await generateCluesFromChat({
      chatHistory: chatHistory.map(({id, ...rest}) => rest),
    });
    return result;
  } catch (error) {
    console.error('Clue from chat generation error:', error);
    return {
      suggestions: [],
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
