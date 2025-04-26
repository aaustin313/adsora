import { NextResponse } from 'next/server';

// Placeholder secrets - in production, use environment variables
// DO NOT hard-code these values in your code
const SLACK_CLIENT_ID = '5511322808822.8812260690594';
const SLACK_CLIENT_SECRET = 'your_client_secret_here';

// Define types for the Slack OAuth response
interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    access_token?: string;
    token_type?: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Handle errors
    if (error) {
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=slack_auth_denied', request.url));
    }
    
    // Missing auth code
    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(new URL('/?error=missing_code', request.url));
    }
    
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
    
    const data = await response.json() as SlackOAuthResponse;
    
    // Check if the request was successful
    if (!data.ok) {
      console.error('Error exchanging code for token:', data.error);
      return NextResponse.redirect(new URL(`/?error=${data.error || 'unknown_error'}`, request.url));
    }
    
    // In a real application, you would:
    // 1. Store the access token in your database for the current user
    // 2. Save the workspace ID, team name, etc.
    // const { access_token, team, authed_user } = data;
    
    // Here we'll just simulate success and redirect back to home page
    return NextResponse.redirect(new URL('/?slack_connected=true', request.url));
  } catch (error) {
    console.error('Error handling Slack OAuth callback:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
} 