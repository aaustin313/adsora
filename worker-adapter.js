import { 
  handleDbTest, 
  getUsers, 
  createUser, 
  createAgentSession,
  getAgentSessions,
  createCampaign,
  getCampaigns,
  createAdSet,
  createAdCreative
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
    
    // Handle agent session endpoints
    if (url.pathname === '/api/agent-sessions') {
      if (request.method === 'GET') {
        return getAgentSessions(request, env);
      }
      
      if (request.method === 'POST') {
        return createAgentSession(request, env);
      }
    }
    
    // Handle campaign management endpoints
    if (url.pathname === '/api/campaigns') {
      if (request.method === 'GET') {
        return getCampaigns(request, env);
      }
      
      if (request.method === 'POST') {
        return createCampaign(request, env);
      }
    }
    
    if (url.pathname === '/api/ad-sets') {
      if (request.method === 'POST') {
        return createAdSet(request, env);
      }
    }
    
    if (url.pathname === '/api/ad-creatives') {
      if (request.method === 'POST') {
        return createAdCreative(request, env);
      }
    }
    
    // For all other requests, use the original fetch handler
    return originalFetch(request, env, ctx);
  };
} 