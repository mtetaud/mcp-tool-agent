export type LLMProviderType = 'openai' | 'anthropic' | 'ollama';

export interface BaseLLMConfig {
  provider: LLMProviderType;
  temperature?: number;
}

export interface OpenAIConfig extends BaseLLMConfig {
  provider: 'openai';
  modelName: string;
  apiKey?: string;
}

export interface AnthropicConfig extends BaseLLMConfig {
  provider: 'anthropic';
  modelName: string;
  apiKey: string;
}

export interface OllamaConfig extends BaseLLMConfig {
  provider: 'ollama';
  modelName: string;
  baseUrl: string;
}

export type LLMConfig = OpenAIConfig | AnthropicConfig | OllamaConfig;
