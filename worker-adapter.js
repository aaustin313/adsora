import { handleDbTest, getUsers, createUser } from './api-functions.js';

// Export a function that wraps around the original worker fetch function
export function createWorkerAdapter(originalFetch) {
  return async function adaptedFetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle DB-related API requests directly
    if (url.pathname === '/api/db-test') {
      return handleDbTest(env);
    }
    
    if (url.pathname === '/api/users') {
      if (request.method === 'GET') {
        return getUsers(env);
      }
      
      if (request.method === 'POST') {
        return createUser(request, env);
      }
    }
    
    // Handle Slack settings endpoint
    if (url.pathname === '/api/slack/settings') {
      if (request.method === 'GET') {
        // In a real app, this would fetch from a database
        // For demo purposes, we're returning masked values
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Missing userId parameter'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          settings: {
            appId: 'A08PW7NLAHG',
            clientId: '5511322808822.8812260690594',
            appToken: 'xapp-1-******-******-******',
            verificationToken: '••••••••••',
            installUrl: `https://slack.com/oauth/v2/authorize?client_id=5511322808822.8812260690594&scope=channels:read,chat:write&user_scope=`
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For all other requests, use the original fetch handler
    return originalFetch(request, env, ctx);
  };
} 