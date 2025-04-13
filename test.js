import { handleMcpQuery } from './dist/index.js';

async function test() {
  try {
    const result = await handleMcpQuery('Tell me about the weather in New York');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
