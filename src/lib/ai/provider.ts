import OpenAI from 'openai';
import { AIProvider } from '@/types';

export const providers: Record<string, AIProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: {
      main: 'gpt-4o',
      vision: 'gpt-4o',
    },
  },
  deepseek: {
    id: 'deepseek',
    name: 'Deepseek',
    models: {
      main: 'deepseek-chat',
      vision: 'deepseek-chat',
    },
  },
  mimo: {
    id: 'mimo',
    name: 'Xiaomi Mimo',
    models: {
      main: 'mimo-auto',
      vision: 'mimo-auto',
    },
  },
};

export function getAIClient(
  providerId: string,
  customApiKey?: string
): OpenAI {
  const provider = providers[providerId] || providers.openai;

  let apiKey: string;
  let baseURL: string;

  if (customApiKey) {
    apiKey = customApiKey;
    baseURL = providerId === 'deepseek'
      ? 'https://api.deepseek.com/v1'
      : providerId === 'mimo'
        ? (process.env.MIMO_BASE_URL || 'https://api.mimo.com/v1')
        : 'https://api.openai.com/v1';
  } else {
    apiKey = process.env.OPENAI_API_KEY || '';
    baseURL = 'https://api.openai.com/v1';
  }

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

export function getProviderModel(
  providerId: string,
  type: 'main' | 'vision' = 'main'
): string {
  const provider = providers[providerId] || providers.openai;
  return provider.models[type];
}
