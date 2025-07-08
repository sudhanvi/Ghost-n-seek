// src/ai/dev.ts

import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-chat-message.ts';
import '@/ai/flows/generate-clues-from-chat.ts';
import '@/ai/flows/generate-clue-card-image.ts';