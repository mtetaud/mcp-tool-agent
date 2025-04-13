import {z} from 'zod';
import {DynamicStructuredTool} from '@langchain/core/tools';
import {ChatOpenAI} from '@langchain/openai';
import {RunnableSequence} from '@langchain/core/runnables';

export async function handleMcpQuery(userQuery: string): Promise<string> {
    try {
        // Dynamically import the SDK components
        const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
        const {StdioClientTransport} = await import('@modelcontextprotocol/sdk/client/stdio.js');
        const {CallToolResultSchema} = await import('@modelcontextprotocol/sdk/types.js');

        // Create the transport
        const transport = new StdioClientTransport({
            command: 'mcp',
            args: [],
            env: process.env as Record<string, string>,
        });

        // Create the client
        const client = new Client(
            {name: 'ToolAgent', version: '1.0.0'},
            {capabilities: {tools: {}}},
        );

        await client.connect(transport);

        // Get tools
        const toolList = await client.listTools();
        const tools = Array.isArray(toolList)
            ? toolList
            : Array.isArray(toolList?.tools)
                ? toolList.tools
                : Object.values(toolList?.tools || {});

        // Convert to LangChain tools
        const structuredTools = tools.map((tool: any) => {
            const schema = tool.inputSchema?.properties
                ? z.object(
                    Object.entries(tool.inputSchema.properties).reduce((acc: Record<string, z.ZodType>, [key, prop]) => {
                        let type: z.ZodType;
                        const typedProp = prop as { type?: string };

                        switch (typedProp.type) {
                            case 'string':
                                type = z.string();
                                break;
                            case 'number':
                                type = z.number();
                                break;
                            case 'integer':
                                type = z.number().int();
                                break;
                            case 'boolean':
                                type = z.boolean();
                                break;
                            case 'array':
                                type = z.array(z.any());
                                break;
                            case 'object':
                                type = z.record(z.string(), z.any());
                                break;
                            default:
                                type = z.any();
                        }

                        if (!tool.inputSchema?.required?.includes(key)) {
                            type = type.optional();
                        }

                        acc[key] = type;
                        return acc;
                    }, {}),
                )
                : z.object({});

            return new DynamicStructuredTool({
                name: tool.name,
                description: tool.description || `Tool: ${tool.name}`,
                schema,
                func: async (params) => {
                    const result = await client.callTool(
                        {name: tool.name, arguments: params},
                        CallToolResultSchema,
                    );
                    return typeof result === 'object' ? JSON.stringify(result) : String(result);
                },
            });
        });

        // Initialize the language model
        const llm = new ChatOpenAI({
            modelName: 'gpt-4',
            temperature: 0,
        });

        // Since AgentExecutor isn't available as expected, let's create a simple agent using RunnableSequence
        const chain = RunnableSequence.from([
            {
                tools: async () => {
                    // Return tools formatted in a way the LLM can understand
                    return structuredTools.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                    }));
                },
                query: (input: string) => input
            },
            // Format the tools information and user query for the LLM
            async ({tools, query}) => {
                const toolsStr = tools.map((t: any) => `${t.name}: ${t.description}`).join('\n');
                return `
You have access to the following tools:
${toolsStr}

User Query: ${query}

To use a tool, please respond in the following format:
THOUGHT: Your reasoning about what tool to use
ACTION: tool_name
ACTION_INPUT: {"param1": "value1", "param2": "value2"}

If no tool is needed to answer the query, just provide your response directly.

Begin now:
`;
            },
            // Ask the LLM
            llm,
            // Process the LLM output and potentially use tools
            async (llmOutput) => {
                const content = llmOutput.content.toString();

                // Check if the LLM wants to use a tool
                const actionMatch = content.match(/ACTION: (\w+)/);
                const actionInputMatch = content.match(/ACTION_INPUT: ({.*})/s);

                if (actionMatch && actionInputMatch) {
                    const toolName = actionMatch[1];
                    try {
                        const toolInput = JSON.parse(actionInputMatch[1]);

                        // Find the right tool
                        const selectedTool = structuredTools.find(t => t.name === toolName);
                        if (selectedTool) {
                            // Execute the tool
                            const toolResult = await selectedTool.invoke(toolInput);
                            return `I used the ${toolName} tool to answer your question.

Tool Result: ${toolResult}

Based on this information: ${content.split('THOUGHT:')[1]?.split('ACTION:')[0] || ''}`;
                        }
                    } catch (e) {
                        return `I tried to use a tool but encountered an error: ${e}`;
                    }
                }

                // If no tool was used or tool specification was incorrect, return the LLM response
                return content;
            }
        ]);

        // Run the chain
        const result = await chain.invoke(userQuery);
        return result;
    } catch (error: unknown) {
        // Check if the error is related to missing MCP CLI
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (
            errorMsg.includes('mcp') && errorMsg.includes('not recognized') ||
            errorMsg.includes('Connection closed') ||
            errorMsg.includes('n\'est pas reconnu')
        ) {
            return `Error: The MCP CLI tool is not installed or not in your PATH. Please install the Model Context Protocol CLI.
      
For more information, visit: https://modelcontextprotocol.io/`;
        }
        // Other errors
        return `Error processing your query: ${errorMsg}`;
    }
}
