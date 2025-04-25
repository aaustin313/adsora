import { createAgentSession, getAgentSessions } from '../../../../api-functions';

export async function GET(request: Request) {
  return getAgentSessions(request, process.env);
}

export async function POST(request: Request) {
  return createAgentSession(request, process.env);
} 