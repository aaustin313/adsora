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

// Slack API Functions
export async function getSlackSettings(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing userId parameter' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // In a real application, you would fetch these settings from a database
    // For security, we're using masked values
    return new Response(JSON.stringify({
      success: true,
      settings: {
        appId: 'A08PW7NLAHG',
        clientId: '5511322808822.8812260690594',
        installUrl: `https://slack.com/oauth/v2/authorize?client_id=5511322808822.8812260690594&scope=channels:read,chat:write&user_scope=`
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching Slack settings:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to fetch Slack settings' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function getSlackChannels(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing userId parameter' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Query the database for user's slack channels
    const { results: channels } = await env.DB.prepare(
      "SELECT * FROM slack_channels WHERE user_id = ?"
    ).bind(userId).all();
    
    return new Response(JSON.stringify({
      success: true,
      channels: channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        metaAdAccountId: channel.meta_ad_account_id,
        metaCampaignId: channel.meta_campaign_id,
        metaAdSetId: channel.meta_ad_set_id
      }))
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to fetch Slack channels' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function createSlackChannel(request, env) {
  try {
    const data = await request.json();
    const { userId, channelName, metaAdAccountId, metaCampaignId, metaAdSetId } = data;

    if (!userId || !channelName || !metaAdAccountId || !metaCampaignId || !metaAdSetId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required parameters' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generate a unique ID for the channel
    const channelId = `C${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insert the new channel
    await env.DB.prepare(
      `INSERT INTO slack_channels (id, user_id, name, meta_ad_account_id, meta_campaign_id, meta_ad_set_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(channelId, userId, channelName, metaAdAccountId, metaCampaignId, metaAdSetId).run();
    
    return new Response(JSON.stringify({
      success: true,
      channel: {
        id: channelId,
        name: channelName,
        metaAdAccountId,
        metaCampaignId,
        metaAdSetId
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating Slack channel:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to create Slack channel' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

// Slack OAuth Functions
export async function handleSlackOAuthCallback(request, env) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    // Debug response to see all parameters
    if (url.searchParams.toString()) {
      console.log('DEBUG: OAuth callback params:', url.searchParams.toString());
    }
    
    // Handle errors
    if (error) {
      console.error('Slack OAuth error:', error);
      // Return detailed error page instead of redirect for debugging
      return new Response(`
        <html>
          <head><title>OAuth Debug - Error</title></head>
          <body>
            <h1>OAuth Error Occurred</h1>
            <p>Error: ${error}</p>
            <p>Full URL: ${request.url}</p>
            <p><a href="/">Return Home</a></p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Missing auth code
    if (!code) {
      console.error('Missing authorization code');
      // Return detailed error page for debugging
      return new Response(`
        <html>
          <head><title>OAuth Debug - No Code</title></head>
          <body>
            <h1>Missing Authorization Code</h1>
            <p>The authorization code was not provided in the callback.</p>
            <p>Full URL: ${request.url}</p>
            <p>Parameters: ${url.searchParams.toString()}</p>
            <p><a href="/">Return Home</a></p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // In production, these would be environment variables
    const SLACK_CLIENT_ID = '5511322808822.8812260690594';
    // IMPORTANT: Do not hardcode secrets in production code
    // This is a placeholder that should be replaced with environment variables
    const SLACK_CLIENT_SECRET = 'your_client_secret_here';
    
    console.log('DEBUG: Attempting token exchange with code:', code);
    
    // Exchange code for access token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
      }),
    });
    
    const data = await response.json();
    
    // Log response for debugging (careful not to log full tokens in production)
    console.log('DEBUG: Slack API response status:', data.ok);
    if (!data.ok) {
      console.error('DEBUG: Error details:', data.error);
    }
    
    // Check if the request was successful
    if (!data.ok) {
      // Return detailed error page for debugging
      return new Response(`
        <html>
          <head><title>OAuth Debug - API Error</title></head>
          <body>
            <h1>Slack API Error</h1>
            <p>Error: ${data.error || 'Unknown error'}</p>
            <p>The token exchange with Slack API failed.</p>
            <p><a href="/">Return Home</a></p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // In a real application, you would:
    // 1. Store the access token in your database for the current user
    // 2. Save the workspace ID, team name, etc.
    
    // Return success page with details for debugging
    return new Response(`
      <html>
        <head>
          <title>OAuth Success</title>
          <script>
            // Redirect to home page with success parameter after showing debug info
            setTimeout(() => {
              window.location.href = '/?slack_connected=true&debug=true';
            }, 5000);
          </script>
        </head>
        <body>
          <h1>Slack Integration Successful!</h1>
          <p>Your Slack workspace was successfully connected.</p>
          <p>Team: ${data.team?.name || 'Unknown'}</p>
          <p>You will be redirected to the home page in 5 seconds.</p>
          <p><a href="/?slack_connected=true">Return Home Now</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Error handling Slack OAuth callback:', error);
    // Return detailed error page for debugging
    return new Response(`
      <html>
        <head><title>OAuth Debug - Exception</title></head>
        <body>
          <h1>Integration Error</h1>
          <p>An error occurred during the OAuth process:</p>
          <p>${error.message}</p>
          <p><a href="/">Return Home</a></p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
} 