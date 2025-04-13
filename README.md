# MCP Tool Agent

**MCP Tool Agent** est un plugin TypeScript permettant d'exécuter dynamiquement des outils exposés par un  
serveur [MCP (Model Context Protocol)](https://modelcontextprotocol.io) à partir d'une requête utilisateur.  
Il est idéal pour intégrer des agents LangChain ou des chatbots avec des fonctionnalités étendues, pilotées par un LLM.

---

## ✨ Fonctionnalités

- Découverte automatique des outils MCP disponibles
- Intégration avec LangChain (`DynamicStructuredTool`)
- Agent simplifié utilisant `RunnableSequence` (LLM + outil)
- Validation des entrées avec `zod`
- Facile à intégrer dans vos assistants ou serveurs LLM
- **Nouveau** : Support pour différents modèles LLM (OpenAI, Anthropic, Ollama)

---

## 🚀 Utilisation

**Exemple simple :**

```ts
import { handleMcpQuery } from 'mcp-tool-agent';

const response = await handleMcpQuery("Peux-tu utiliser l'outil getWeather pour connaître la météo à Paris ?");
console.log(response);
```

**Avec configuration de LLM personnalisée :**

```ts
import { handleMcpQuery } from 'mcp-tool-agent';

// Avec Anthropic Claude
const response = await handleMcpQuery("Peux-tu utiliser l'outil getWeather pour connaître la météo à Paris ?", {
  provider: 'anthropic',
  modelName: 'claude-3-sonnet-20240229',
  apiKey: 'votre-clé-api-anthropic',
  temperature: 0.1
});

// Avec Ollama en local
const response = await handleMcpQuery("Peux-tu utiliser l'outil getWeather pour connaître la météo à Paris ?", {
  provider: 'ollama',
  modelName: 'llama3',
  baseUrl: 'http://localhost:11434/v1',
  temperature: 0
});

console.log(response);
```

Ce code :

- détecte les outils MCP disponibles
- utilise le LLM spécifié (ou GPT-4 par défaut)
- sélectionne le bon outil via le raisonnement du LLM
- exécute l'outil et formate la réponse

---

## 📦 Requirements

- Node.js v18+
- MCP CLI installé :
  ```bash
  npm install -g @modelcontextprotocol/cli
  ```
- Accès à une API du LLM choisi :
  - OpenAI (par défaut)
  - Anthropic (pour Claude)
  - Ollama (pour les modèles en local)

---

## 🧪 Tests et développement local

```bash
npm run build
```

**Exemple de test :**

```ts
import { handleMcpQuery } from './dist/index.js';

const run = async () => {
  const res = await handleMcpQuery("Utilise l'outil 'hello' pour me saluer.");
  console.log(res);
};

run();
```

Consultez le dossier `examples` pour des exemples de configurations avec différents LLMs.

---

## 🤝 Contribuer

1. Fork ce repo
2. Crée une branche
   ```bash
   git checkout -b feat/ma-fonction
   ```
3. Commit tes modifs
   ```bash
   git commit -am 'feat: ma fonction'
   ```
4. Push la branche
   ```bash
   git push origin feat/ma-fonction
   ```
5. Ouvre une Pull Request 🚀

---

## 📝 Licence

MIT © mtetaud

---

## 🔗 Liens utiles

- 🌐 Site MCP : [modelcontextprotocol.io](https://modelcontextprotocol.io)
- 📦 LangChain : [langchainjs.dev](https://www.langchainjs.dev)
- 💬 GPT via LangChain : [`@langchain/openai`](https://www.npmjs.com/package/@langchain/openai)
- 🤖 Claude via LangChain : [`@langchain/anthropic`](https://www.npmjs.com/package/@langchain/anthropic)
- 🦙 Ollama : [ollama.ai](https://ollama.ai)
