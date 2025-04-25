// Database API functions

export async function handleDbTest(env) {
  try {
    // Test the D1 database connection
    const { results: tables } = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'D1 database connection successful',
      tables
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'D1 database connection failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getUsers(env) {
  try {
    // Get all users
    const { results: users } = await env.DB.prepare(
      "SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC"
    ).all();
    
    return new Response(JSON.stringify({
      success: true,
      users
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function createUser(request, env) {
  try {
    // Parse request body
    const data = await request.json();
    const { email, name } = data;
    
    if (!email || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate a unique ID
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the user
    await env.DB.prepare(
      "INSERT INTO users (id, email, name) VALUES (?, ?, ?)"
    ).bind(id, email, name).run();
    
    // Fetch the newly created user
    const { results } = await env.DB.prepare(
      "SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?"
    ).bind(id).all();
    
    const user = results[0];
    
    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      user
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for unique constraint violation
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email already in use',
        error: 'Email address must be unique'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create user',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// MCP functions
export async function createAgentSession(request, env) {
  try {
    // Parse request body
    const data = await request.json();
    const { userId } = data;
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate a unique session UUID
    const sessionUuid = crypto.randomUUID();
    
    // Create an MCP Runner instance via the Orchestrator
    const response = await fetch('https://mcp-orchestrator.passthru.ai/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ id: sessionUuid })
    });
    
    const mcpData = await response.json();
    
    if (!mcpData.url) {
      throw new Error('Failed to create MCP Runner instance');
    }
    
    // Generate a unique ID for the session
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the agent session
    await env.DB.prepare(
      "INSERT INTO agent_sessions (id, user_id, session_uuid, mcp_runner_url, status) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, userId, sessionUuid, mcpData.url, 'active').run();
    
    // Fetch the newly created session
    const { results } = await env.DB.prepare(
      "SELECT id, user_id, session_uuid, mcp_runner_url, status, created_at, updated_at FROM agent_sessions WHERE id = ?"
    ).bind(id).all();
    
    const session = results[0];
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Agent session created successfully',
      session
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating agent session:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create agent session',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getAgentSessions(request, env) {
  try {
    // Parse URL to get user ID from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get sessions for the user
    const { results: sessions } = await env.DB.prepare(
      "SELECT id, user_id, session_uuid, mcp_runner_url, status, created_at, updated_at FROM agent_sessions WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(userId).all();
    
    return new Response(JSON.stringify({
      success: true,
      sessions
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching agent sessions:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch agent sessions',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Campaign management functions
export async function createCampaign(request, env) {
  try {
    // Parse request body
    const data = await request.json();
    const { userId, name, metaCampaignId } = data;
    
    if (!userId || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID and campaign name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate a unique ID
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the campaign
    await env.DB.prepare(
      "INSERT INTO ad_campaigns (id, user_id, name, meta_campaign_id, status) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, userId, name, metaCampaignId || null, 'draft').run();
    
    // Fetch the newly created campaign
    const { results } = await env.DB.prepare(
      "SELECT id, user_id, name, meta_campaign_id, status, created_at, updated_at FROM ad_campaigns WHERE id = ?"
    ).bind(id).all();
    
    const campaign = results[0];
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Campaign created successfully',
      campaign
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getCampaigns(request, env) {
  try {
    // Parse URL to get user ID from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get campaigns for the user
    const { results: campaigns } = await env.DB.prepare(
      "SELECT id, user_id, name, meta_campaign_id, status, created_at, updated_at FROM ad_campaigns WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(userId).all();
    
    return new Response(JSON.stringify({
      success: true,
      campaigns
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function createAdSet(request, env) {
  try {
    // Parse request body
    const data = await request.json();
    const { campaignId, name, budget, startDate, endDate, targetingData } = data;
    
    if (!campaignId || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Campaign ID and ad set name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate a unique ID
    const id = `adset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the ad set
    await env.DB.prepare(
      "INSERT INTO ad_sets (id, campaign_id, name, budget, start_date, end_date, targeting_data, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, 
      campaignId, 
      name, 
      budget || null, 
      startDate || null, 
      endDate || null, 
      targetingData ? JSON.stringify(targetingData) : null, 
      'draft'
    ).run();
    
    // Fetch the newly created ad set
    const { results } = await env.DB.prepare(
      "SELECT id, campaign_id, name, budget, start_date, end_date, targeting_data, status, created_at, updated_at FROM ad_sets WHERE id = ?"
    ).bind(id).all();
    
    const adSet = results[0];
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Ad set created successfully',
      adSet
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating ad set:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create ad set',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function createAdCreative(request, env) {
  try {
    // Parse request body
    const data = await request.json();
    const { adsetId, name, driveFileId, fileUrl, headline, description } = data;
    
    if (!adsetId || !name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ad set ID and creative name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate a unique ID
    const id = `creative_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the ad creative
    await env.DB.prepare(
      "INSERT INTO ad_creatives (id, adset_id, name, drive_file_id, file_url, headline, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, 
      adsetId, 
      name, 
      driveFileId || null, 
      fileUrl || null, 
      headline || null, 
      description || null, 
      'draft'
    ).run();
    
    // Fetch the newly created ad creative
    const { results } = await env.DB.prepare(
      "SELECT id, adset_id, name, drive_file_id, file_url, headline, description, status, created_at, updated_at FROM ad_creatives WHERE id = ?"
    ).bind(id).all();
    
    const adCreative = results[0];
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Ad creative created successfully',
      adCreative
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating ad creative:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create ad creative',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function for interacting with a specific MCP Runner
export async function callMcpTool(runnerUrl, toolName, params) {
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