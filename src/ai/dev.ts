import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-identifying-information.ts';
import '@/ai/flows/generate-clue-card-suggestions.ts';
import '@/ai/flows/moderate-chat-message.ts';
import '@/ai/flows/generate-emoji-dna.ts';
import '@/ai/flows/generate-clue-card-image.ts';
import '@/ai/flows/generate-clues-from-chat.ts';
