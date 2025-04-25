'use client';

/**
 * Configure MCP servers for different agent capabilities
 */
export async function configureMcpServers(runnerUrl: string, braveApiKey?: string) {
  try {
    // Define the server config type
    type McpServerConfig = {
      command: string;
      args: string[];
      env?: Record<string, string>;
    };
    
    // Start with basic thinking capabilities
    const basicConfig: Record<string, McpServerConfig> = {
      "sequential-thinking": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-sequential-thinking"
        ]
      },
      "fetch": {
        "command": "uvx",
        "args": [
          "mcp-server-fetch"
        ]
      },
      "time": {
        "command": "uvx",
        "args": [
          "mcp-server-time"
        ]
      }
    };
    
    // Add Brave search if API key is provided
    if (braveApiKey) {
      basicConfig["brave-search"] = {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-brave-search"
        ],
        "env": {
          "BRAVE_API_KEY": braveApiKey
        }
      };
    }
    
    const configResponse = await fetch(`${runnerUrl}/config/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        mcpServers: basicConfig
      })
    });
    
    return await configResponse.json();
  } catch (error) {
    console.error('Error configuring MCP servers:', error);
    throw error;
  }
}

/**
 * Get available tools from an MCP Runner
 */
export async function getMcpTools(runnerUrl: string) {
  try {
    const response = await fetch(`${runnerUrl}/tools/list`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
    throw error;
  }
}

/**
 * Call a specific tool on an MCP Runner with parameters
 */
export async function callMcpTool(runnerUrl: string, toolName: string, params: any) {
  try {
    const response = await fetch(`${runnerUrl}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: toolName,
        params: params
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling MCP tool ${toolName}:`, error);
    throw error;
  }
} 