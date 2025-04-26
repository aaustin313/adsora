import { NextResponse } from 'next/server';

// In a real application, these would be loaded from environment variables
// and stored in a database associated with the user
const SLACK_APP_ID = 'A08PW7NLAHG';
const SLACK_CLIENT_ID = '5511322808822.8812260690594';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing userId parameter' 
      }, { status: 400 });
    }

    // In a real application, you would fetch these settings from a database
    // based on the userId
    return NextResponse.json({
      success: true,
      settings: {
        appId: SLACK_APP_ID,
        clientId: SLACK_CLIENT_ID,
        installUrl: `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=channels:read,chat:write&user_scope=`
      }
    });
  } catch (error) {
    console.error('Error fetching Slack settings:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch Slack settings' 
    }, { status: 500 });
  }
} 