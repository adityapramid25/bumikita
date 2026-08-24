import { GoogleGenAI } from '@google/genai';

export function getApiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.CUSTOM_AI_API_KEY ||
    process.env.ECO_AI_API_KEY ||
    process.env.BUMIKITA_AI_API_KEY ||
    process.env.AI_API_KEY;

  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim().length === 0) {
    return null;
  }
  return key.trim();
}

export function hasGeminiKey(): boolean {
  return getApiKey() !== null;
}

export function getGeminiClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Default instance for server-side usage
export const ai = new GoogleGenAI({
  apiKey: getApiKey() || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

