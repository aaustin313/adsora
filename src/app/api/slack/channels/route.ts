import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Define types for the database
interface SlackChannel {
  id: string;
  name: string;
  meta_ad_account_id: string;
  meta_campaign_id: string;
  meta_ad_set_id: string;
  user_id: string;
}

interface SlackChannelRequest {
  userId: string;
  channelName: string;
  metaAdAccountId: string;
  metaCampaignId: string;
  metaAdSetId: string;
}

// Define a minimal D1Database interface
interface D1Database {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      all: () => Promise<{ results: any[] }>;
      run: () => Promise<any>;
    };
  };
}

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

    // @ts-ignore - D1 database is injected at runtime
    const db: D1Database = process.env.DB;
    
    const channels = await db
      .prepare(
        `SELECT * FROM slack_channels WHERE user_id = ?`
      )
      .bind(userId)
      .all();
    
    return NextResponse.json({
      success: true,
      channels: channels.results.map((channel: SlackChannel) => ({
        id: channel.id,
        name: channel.name,
        metaAdAccountId: channel.meta_ad_account_id,
        metaCampaignId: channel.meta_campaign_id,
        metaAdSetId: channel.meta_ad_set_id
      }))
    });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch Slack channels' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as SlackChannelRequest;
    const { userId, channelName, metaAdAccountId, metaCampaignId, metaAdSetId } = body;

    if (!userId || !channelName || !metaAdAccountId || !metaCampaignId || !metaAdSetId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, { status: 400 });
    }

    // @ts-ignore - D1 database is injected at runtime
    const db: D1Database = process.env.DB;
    const channelId = `C${uuidv4().replace(/-/g, '').substring(0, 10)}`;
    
    await db
      .prepare(
        `INSERT INTO slack_channels (id, user_id, name, meta_ad_account_id, meta_campaign_id, meta_ad_set_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(channelId, userId, channelName, metaAdAccountId, metaCampaignId, metaAdSetId)
      .run();
    
    return NextResponse.json({
      success: true,
      channel: {
        id: channelId,
        name: channelName,
        metaAdAccountId,
        metaCampaignId,
        metaAdSetId
      }
    });
  } catch (error) {
    console.error('Error adding Slack channel:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add Slack channel' 
    }, { status: 500 });
  }
} 