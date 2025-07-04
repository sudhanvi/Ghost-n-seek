import { config } from 'dotenv';
config();

import '@/ai/flows/generate-clue-card-suggestions.ts';
import '@/ai/flows/moderate-chat-message.ts';
import '@/ai/flows/generate-clues-from-chat.ts';
