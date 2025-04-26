'use client';

/**
 * Development mode utilities to mock MCP functionality
 */

// Mock MCP session data for development mode
export function createMockMcpSession(userId: string) {
  const sessionUuid = Math.random().toString(36).substring(2, 15);
  const mockUrl = `https://dev-mock-mcp-${sessionUuid}.local`;
  
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: userId,
    session_uuid: sessionUuid,
    mcp_runner_url: mockUrl,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Mock MCP configuration response
export async function mockConfigureMcpServers() {
  return {
    mcpServers: {
      "sequential-thinking": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
      },
      "fetch": {
        "command": "uvx",
        "args": ["mcp-server-fetch"]
      },
      "time": {
        "command": "uvx",
        "args": ["mcp-server-time"]
      }
    }
  };
}

// Mock MCP tool call response
export async function mockMcpToolCall(toolName: string, params: any) {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (toolName === 'sequential-thinking') {
    const query = params.query || '';
    
    // Simple keyword-based responses
    if (query.toLowerCase().includes('meta') || query.toLowerCase().includes('ad')) {
      return {
        response: "I can help you create Meta ads! In the Campaign Management tab, you can create campaigns and ad sets. For this MVP, we're simulating the integration with Meta's advertising platform."
      };
    }
    
    if (query.toLowerCase().includes('slack')) {
      return {
        response: "You can integrate with Slack by going to the Settings tab and connecting your Slack workspace. This feature is coming soon in the next update."
      };
    }
    
    if (query.toLowerCase().includes('drive') || query.toLowerCase().includes('file')) {
      return {
        response: "You can upload files from Google Drive for your ad creatives. This feature will be available in the Ad Creatives section coming in the next update."
      };
    }
    
    // Default response
    return {
      response: "I'm your AdSora assistant for the MVP demo. I can help with Meta ads, Slack integration, and file uploads. What would you like to know about creating ads?"
    };
  }
  
  // Default fallback
  return {
    response: "I'm not sure how to handle that right now. The MVP is limited to basic conversation."
  };
}

// Check if we're in development mode
export function isDevelopmentMode() {
  return process.env.NODE_ENV === 'development';
} 