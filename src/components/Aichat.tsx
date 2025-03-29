
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  ChatSession,
  GenerateContentResult,
} from '@google/generative-ai';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

import '../App.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat-bubble';

// --- Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MCP_SSE_URL = 'http://localhost:3001/sse';
const MCP_POST_URL_BASE = 'http://localhost:3001/messages';
const MCP_TOOL_NAME = 'query';

// --- Interfaces ---
interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
  isError?: boolean;
}

interface McpToolCall {
  tool_call: {
    name: string;
    arguments: {
      sql: string;
    };
  };
}

interface Tool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, unknown>;
  };
}

// MCP Resource Interfaces
interface McpResource {
  uri: string;
  name: string;
  mimeType: string;
}

interface McpListResourceInfo {
  resources: McpResource[];
}

interface McpResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

interface McpReadResourceInfo {
  contents: McpResourceContent[];
}

// MCP Prompt Interfaces
interface McpPromptArgument {
  name: string;
  description: string;
  type: string;
}

interface McpPrompt {
  name: string;
  description: string;
  arguments: McpPromptArgument[];
}

interface McpListPromptInfo {
  prompts: McpPrompt[];
}

interface McpPromptMessage {
  role: string;
  content: {
    type: string;
    text: string;
  };
}

interface McpReadPromptInfo {
  description: string;
  messages: McpPromptMessage[];
}




// Type guard for MCP tool call responses
// Update the isMcpToolCall function to handle both "query" and "querry"
function isMcpToolCall(response: unknown): response is McpToolCall {
  if (typeof response !== 'object' || response === null) return false;

  const resObj = response as { tool_call?: unknown };
  const toolCall = resObj.tool_call;
  if (typeof toolCall !== 'object' || toolCall === null) return false;

  const { name, arguments: args } = toolCall as { name?: unknown; arguments?: unknown };
  // Accept both "query" and "querry" as valid tool names
  const validToolNames = ['query', 'querry'];
  if (!validToolNames.includes(name as string)) return false;
  if (typeof args !== 'object' || args === null) return false;

  const { sql } = args as { sql?: unknown };
  return typeof sql === 'string';
}





function Aichat() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your EV assistant. Ask me about electric vehicles or specific US EV stats!" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mcpClient, setMcpClient] = useState<McpClient | null>(null);
  const [geminiChat, setGeminiChat] = useState<ChatSession | null>(null);
  
  // Add new state variables for MCP resources and prompts
  const [varGetResource, setVarGetResource] = useState<string>('');
  const [varGetPrompt, setVarGetPrompt] = useState<string>('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    if (!GEMINI_API_KEY) {
      setError('Error: GEMINI API KEY environment variable not set.');
      console.error('Error: VITE_GEMINI_API_KEY environment variable not set. Create a .env file with VITE_GEMINI_API_KEY=YOUR_API_KEY');
      return;
    }

    let isMounted = true;
    let mcpTransport: SSEClientTransport | null = null;

    async function initialize() {
      setIsLoading(true);
      setError(null);
      console.log('Initializing...');

      try {
        // 1. Initialize Gemini
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const generationConfig = {
          temperature: 0.8,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        };

        const safetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const mcpQueryTool = {
          name: MCP_TOOL_NAME,
          description: `Executes a read-only SQL query against a database containing US EV registration data. Use this tool only when the user asks for specific statistical data (counts, averages, lists, rankings) about EV registrations, sales, makes, models, or locations within the US or specific US states. The database schema includes tables like 'vehicles' with columns such as 'vin', 'county', 'city', 'state', 'postal_code', 'model_year', 'make', 'model', 'electric_vehicle_type', 'electric_range', 'base_msrp'. Formulate a valid SQL query based on the user's request. Do NOT use INSERT, UPDATE, DELETE, or other modifying statements.`,
          parameters: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'The read-only SQL query to execute.',
              },
            },
            required: ['sql'],
          },
        };

        

        // 2. Initialize MCP Client via SSE
        console.log(`Attempting to connect MCP Client via SSE to ${MCP_SSE_URL}...`);
        // Pass the URL instance as the first argument.
        mcpTransport = new SSEClientTransport(new URL(MCP_SSE_URL), {
          // Add retry options to handle connection issues
          // retryOptions: {
          //   maxRetries: 3,
          //   initialDelayMs: 1000,
          //   maxDelayMs: 5000,
          // }
        });
        
        const client = new McpClient(
          { name: 'ev-chatbot-client', version: '1.0.0' },
          { 
            capabilities: { tools: {} },
            
          }
        );
        
        try {
          await client.connect(mcpTransport);
          console.log('MCP Client connected successfully via SSE.');
        } catch (connectionError) {
          console.error('Failed to connect to MCP server:', connectionError);
          throw new Error(`MCP connection failed: ${
            connectionError instanceof Error ? connectionError.message : String(connectionError)
          }`);
        }
        // 3. Fetch MCP resources
        console.log('Fetching MCP resources...');
        let combinedResourceContent = '';
        try {
          const resourcesList = await client.listResources() as McpListResourceInfo;
         

          // Fetch content for each resource
          for (const resource of resourcesList.resources) {
            try {
              const resourceContent = await client.readResource({
                uri: resource.uri,
                _meta: { progressToken: Date.now() }
              }) as McpReadResourceInfo;
              
              if (resourceContent && 
                  resourceContent.contents && 
                  resourceContent.contents.length > 0 && 
                  typeof resourceContent.contents[0].text === 'string') {
                combinedResourceContent += `Resource: ${resource.name}\n${resourceContent.contents[0].text}\n\n`;
                console.log(`Resource content fetched for ${resource.name}`);
              }
            } catch (readError) {
              console.error(`Error reading resource ${resource.uri}:`, readError);
            }
          }

          if (isMounted) {
            setVarGetResource(combinedResourceContent);
            console.log('Resources fetched and stored successfully:', combinedResourceContent);
          }
        } catch (resourceError) {
          console.error('Error fetching resources:', resourceError);
        }

        // 4. Fetch MCP Prompts
        console.log('Fetching MCP prompts...');
        // let combinedPromptContent = '';
        try {
          const promptsList = await client.listPrompts();
          let combinedPromptContent = '';

          // Fetch content for each prompt
          for (const prompt of promptsList.prompts) {
            try {
              const promptContent = await client.getPrompt({
                name: prompt.name,
                _meta: { progressToken: Date.now() }
              }) as McpReadPromptInfo; // Add type assertion here
              
              // Extract the text content from the prompt response
              if (promptContent && 
                  promptContent.messages && 
                  promptContent.messages[0] && 
                  promptContent.messages[0].content && 
                  typeof promptContent.messages[0].content.text === 'string') {
                combinedPromptContent = promptContent.messages[0].content.text;
                console.log('Prompt content fetched:', combinedPromptContent);
              }
            } catch (readError) {
              console.error(`Error reading prompt ${prompt.name}:`, readError);
            }
          }

          if (isMounted) {
            setVarGetPrompt(combinedPromptContent);
            console.log('Prompts fetched and stored successfully');
          }

          // Move chat initialization after prompt is set
          const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: [
              {
                role: 'user', // Changed from 'user' to 'system'
                parts: [
                  {
                    text: `System prompt: ${combinedPromptContent} and MCPResource is : ${combinedResourceContent}`, // Use the content directly
                  },
                ],
              },
            ],
          });
          
          if (isMounted) setGeminiChat(chat);
          console.log('Gemini initialized with prompt: ', chat);
        } catch (promptError) {
          console.error('Error fetching prompts:', promptError);
        }


        

        
        // 5. Verify connection and available tools
        try {
          const tools = await client.listTools();
          console.log('Available MCP Tools:', tools);
          const availableTools = tools.tools as unknown as Tool[];
          if (!availableTools.some((t) => t.name === MCP_TOOL_NAME)) {
            throw new Error(`MCP Server connected, but required tool "${MCP_TOOL_NAME}" not found.`);
          }
        } catch (mcpError) {
          console.error('Error during MCP post-connection check:', mcpError);
          throw new Error(`Failed to verify connection with MCP server: ${
            mcpError instanceof Error ? mcpError.message : String(mcpError)
          }`);
        }

        if (isMounted) setMcpClient(client);
        console.log('MCP Client connected successfully.');
      } catch (err) {
        console.error('Initialization failed:', err);
        if (isMounted)
          setError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initialize();

    // Cleanup function
    return () => {
      isMounted = false;
      console.log('Cleaning up...');
      // SSE connection will be automatically closed when the component unmounts.
    };
  }, []);

  // --- Message Handling ---
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
  
    if (!geminiChat || !mcpClient) {
      setError('Error: AI or MCP connection not initialized.');
      setIsLoading(false);
      return;
    }
  
    try {
      console.log('Sending to Gemini:', userMessage.text);
      const result: GenerateContentResult = await geminiChat.sendMessage(userMessage.text);
      const response = result.response;
      const responseText = response.text();
      console.log('Gemini Raw Response:', responseText);
  
      let aiResponseText = '';
      let requiresMcpCall = false;
      let sqlQuery = '';
  
      // Improved JSON detection - handle markdown code blocks
      try {
        // Check if response is wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        
        // If we found a JSON code block, parse its contents
        if (jsonMatch && jsonMatch[1]) {
          const jsonContent = jsonMatch[1].trim();
          const potentialJson = JSON.parse(jsonContent);
          
          if (isMcpToolCall(potentialJson)) {
            console.log('Detected MCP Tool Call instruction from Gemini (in code block).');
            requiresMcpCall = true;
            sqlQuery = potentialJson.tool_call.arguments.sql;
            aiResponseText = `Okay, I need to fetch that data. Running the query: \`${sqlQuery}\``;
          } else {
            aiResponseText = responseText;
          }
        } else {
          // Try direct JSON parsing as fallback
          const potentialJson = JSON.parse(responseText);
          if (isMcpToolCall(potentialJson)) {
            console.log('Detected MCP Tool Call instruction from Gemini (direct JSON).');
            requiresMcpCall = true;
            sqlQuery = potentialJson.tool_call.arguments.sql;
            aiResponseText = `Okay, I need to fetch that data. Running the query: \`${sqlQuery}\``;
          } else {
            aiResponseText = responseText;
          }
        }
      } catch (e) {
        console.log('Gemini response is not valid JSON, treating as text.');
        aiResponseText = responseText;
      }
  
      setMessages((prev) => [...prev, { sender: 'ai', text: aiResponseText }]);
  
      if (requiresMcpCall && sqlQuery) {
        console.log(`Calling MCP tool '${MCP_TOOL_NAME}' with SQL: ${sqlQuery}`);
        try {
          const mcpResult = await mcpClient.callTool({
            name: MCP_TOOL_NAME, // This will always use "query"
            arguments: { sql: sqlQuery },
          });
          console.log('MCP Tool Result:', mcpResult);
        

          let mcpDataText = '';
          if (mcpResult.isError) {
            console.error('MCP Tool Error:', mcpResult.content);
            const errorContent =
              Array.isArray(mcpResult.content) && mcpResult.content.length > 0 && mcpResult.content[0].text
                ? mcpResult.content[0].text
                : 'Unknown error executing query.';
            mcpDataText = `Error fetching data from the database: ${errorContent}`;
            setMessages((prev) => [...prev, { sender: 'ai', text: mcpDataText, isError: true }]);
          } else if (
            mcpResult.content &&
            Array.isArray(mcpResult.content) &&
            mcpResult.content.length > 0 &&
            mcpResult.content[0].text
          ) {
            try {
              const data = JSON.parse(mcpResult.content[0].text);
              const displayLimit = 10;
              const truncatedData = Array.isArray(data) ? data.slice(0, displayLimit) : data;
              let formattedData = JSON.stringify(truncatedData, null, 2);

              if (Array.isArray(data) && data.length > displayLimit) {
                formattedData += `\n\n...(truncated, ${data.length - displayLimit} more rows)`;
              }

              mcpDataText = `Here is the data I found:\n\`\`\`json\n${formattedData}\n\`\`\``;
            } catch (parseError) {
              console.warn('Could not parse MCP result JSON, showing raw text.');
              mcpDataText = `Here is the data I found:\n${mcpResult.content[0].text}`;
            }
            setMessages((prev) => [...prev, { sender: 'ai', text: mcpDataText }]);
          } else {
            mcpDataText = "The query ran successfully, but returned no data or content.";
            setMessages((prev) => [...prev, { sender: 'ai', text: mcpDataText }]);
          }
          
        } catch (mcpError) {
          console.error('Failed to call MCP tool:', mcpError);
          const errorMessage = `Error communicating with the data server: ${
            mcpError instanceof Error ? mcpError.message : String(mcpError)
          }`;
          setMessages((prev) => [...prev, { sender: 'ai', text: errorMessage, isError: true }]);
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
      const errorMessage = `AI Error: ${err instanceof Error ? err.message : String(err)}`;
      setMessages((prev) => [...prev, { sender: 'ai', text: errorMessage, isError: true }]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, geminiChat, mcpClient]);

  // Auto scroll when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-primary/10 font-medium">
        EV Assistant
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {error && (
          <div className="bg-destructive/20 text-destructive p-3 rounded-md">
            {error}
          </div>
        )}
        {!GEMINI_API_KEY && (
          <div className="bg-destructive/20 text-destructive p-3 rounded-md">
            GEMINI API KEY MISSING! Set VITE_GEMINI_API_KEY in .env
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div 
              className={`max-w-[80%] p-2 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              } ${msg.isError ? 'bg-destructive/20 text-destructive' : ''}`}
            >
              {msg.text.split('```').map((part, i) =>
                i % 2 === 1 ? (
                  <pre key={i} className="bg-background/50 p-2 rounded text-xs overflow-x-auto my-1">
                    <code>{part}</code>
                  </pre>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="max-w-[80%] p-2 rounded-lg bg-muted">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={(!mcpClient || !geminiChat) && !error ? "Initializing..." : "Ask about EVs..."}
            disabled={isLoading || !mcpClient || !geminiChat || !!error}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || !mcpClient || !geminiChat || !!error}
          >
            {isLoading ? '...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Aichat;
