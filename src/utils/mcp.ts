'use client';

/**
 * Configure MCP servers for different agent capabilities
 */
export async function configureMetaAdMcp(runnerUrl: string, metaAccessToken?: string) {
  try {
    const configResponse = await fetch(`${runnerUrl}/config/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        'meta-ad-server': {
          command: 'npx',
          args: ['@passthru/cli', 'run', '@passthru/meta-ads'],
          env: {
            META_ACCESS_TOKEN: metaAccessToken || 'YOUR_META_ACCESS_TOKEN',
          }
        }
      })
    });
    
    return await configResponse.json();
  } catch (error) {
    console.error('Error configuring Meta Ad MCP:', error);
    throw error;
  }
}

export async function configureSlackMcp(runnerUrl: string, slackAccessToken?: string) {
  try {
    const configResponse = await fetch(`${runnerUrl}/config/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        'slack-server': {
          command: 'npx',
          args: ['@passthru/cli', 'run', '@passthru/slack'],
          env: {
            SLACK_BOT_TOKEN: slackAccessToken || 'YOUR_SLACK_TOKEN',
          }
        }
      })
    });
    
    return await configResponse.json();
  } catch (error) {
    console.error('Error configuring Slack MCP:', error);
    throw error;
  }
}

export async function configureGDriveMcp(runnerUrl: string, googleCredentials?: string) {
  try {
    const configResponse = await fetch(`${runnerUrl}/config/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        'gdrive-server': {
          command: 'npx',
          args: ['@passthru/cli', 'run', '@passthru/gdrive'],
          env: {
            GOOGLE_APPLICATION_CREDENTIALS: googleCredentials || 'YOUR_GOOGLE_CREDENTIALS_JSON',
          }
        }
      })
    });
    
    return await configResponse.json();
  } catch (error) {
    console.error('Error configuring Google Drive MCP:', error);
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