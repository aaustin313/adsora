import { 
  handleDbTest, 
  getUsers, 
  createUser, 
  getSlackSettings,
  getSlackChannels,
  createSlackChannel,
  handleSlackOAuthCallback
} from './api-functions.js';

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
        return getSlackSettings(request, env);
      }
    }
    
    // Handle Slack OAuth callback
    if (url.pathname === '/api/slack/oauth/callback') {
      return handleSlackOAuthCallback(request, env);
    }
    
    // Handle Slack channels endpoints
    if (url.pathname === '/api/slack/channels') {
      if (request.method === 'GET') {
        return getSlackChannels(request, env);
      }
      
      if (request.method === 'POST') {
        return createSlackChannel(request, env);
      }
    }
    
    // For all other requests, use the original fetch handler
    return originalFetch(request, env, ctx);
  };
} 