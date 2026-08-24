import { GoogleGenAI } from '@google/genai';

export function getApiKey(): string | null {
  const customKey =
    process.env.CUSTOM_AI_API_KEY ||
    process.env.ECO_AI_API_KEY ||
    process.env.BUMIKITA_AI_API_KEY ||
    process.env.AI_API_KEY;

  if (!customKey || customKey === 'MY_GEMINI_API_KEY' || customKey.trim().length === 0) {
    return null;
  }
  return customKey.trim();
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

