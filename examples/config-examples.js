// Exemple d'utilisation des différentes configurations de LLM
import { handleMcpQuery } from '../dist/index.js';

// Utilisation par défaut (OpenAI GPT-4)
async function defaultExample() {
  const result = await handleMcpQuery('Quelles sont les commandes git les plus utilisées?');
  console.log('Résultat avec GPT-4 par défaut:', result);
}

// Utilisation avec OpenAI et une clé API personnalisée
async function openaiExample() {
  const result = await handleMcpQuery('Quelles sont les commandes git les plus utilisées?', {
    provider: 'openai',
    modelName: 'gpt-3.5-turbo',
    apiKey: 'votre-clé-api-openai',
    temperature: 0.2
  });
  console.log('Résultat avec GPT-3.5 Turbo:', result);
}

// Utilisation avec Anthropic Claude
async function anthropicExample() {
  const result = await handleMcpQuery('Quelles sont les commandes git les plus utilisées?', {
    provider: 'anthropic',
    modelName: 'claude-3-sonnet-20240229',
    apiKey: 'votre-clé-api-anthropic',
    temperature: 0.1
  });
  console.log('Résultat avec Claude:', result);
}

// Utilisation avec Ollama en local
async function ollamaExample() {
  const result = await handleMcpQuery('Quelles sont les commandes git les plus utilisées?', {
    provider: 'ollama',
    modelName: 'llama3', // ou n'importe quel modèle disponible localement
    baseUrl: 'http://localhost:11434/v1',
    temperature: 0
  });
  console.log('Résultat avec Ollama:', result);
}

// Exécutez l'exemple souhaité
defaultExample();
// openaiExample();
// anthropicExample();
// ollamaExample();
