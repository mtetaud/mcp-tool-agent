import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { 
  LLMConfig,
  OpenAIConfig, 
  AnthropicConfig, 
  OllamaConfig 
} from '../types/llm-config.js';

/**
 * Creates a chat model instance based on the provided configuration
 */
export function createLLMFromConfig(config: LLMConfig): BaseChatModel {
  const temperature = config.temperature ?? 0;

  switch (config.provider) {
    case 'openai':
      return createOpenAIModel(config, temperature);
    case 'anthropic':
      return createAnthropicModel(config, temperature);
    case 'ollama':
      return createOllamaModel(config, temperature);
    default:
      throw new Error(`Unsupported LLM provider: ${(config as any).provider}`);
  }
}

function createOpenAIModel(config: OpenAIConfig, temperature: number): ChatOpenAI {
  return new ChatOpenAI({
    model: config.modelName,
    temperature,
    openAIApiKey: config.apiKey,
  });
}

function createAnthropicModel(config: AnthropicConfig, temperature: number): ChatAnthropic {
  return new ChatAnthropic({
    model: config.modelName,
    temperature,
    anthropicApiKey: config.apiKey,
  });
}

function createOllamaModel(config: OllamaConfig, temperature: number): ChatOpenAI {
  // Ollama uses the OpenAI-compatible API
  return new ChatOpenAI({
    model: config.modelName,
    temperature,
    configuration: {
      baseURL: config.baseUrl,
    },
  });
}

/**
 * Creates a default OpenAI GPT-4 configuration
 */
export function getDefaultLLMConfig(): OpenAIConfig {
  return {
    provider: 'openai',
    modelName: 'gpt-4',
    temperature: 0,
  };
}
