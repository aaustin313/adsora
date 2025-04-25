import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  try {
    // Try to get bindings from the context or environment
    const env = context?.env || {};
    
    if (!env.DB) {
      return NextResponse.json({
        success: false,
        message: 'D1 database binding not available.',
        note: 'Make sure your wrangler.jsonc file has the correct D1 binding configuration.'
      }, { status: 500 });
    }
    
    // Run a simple query to test the connection
    const { results: tables } = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    
    return NextResponse.json({
      success: true,
      message: 'D1 database connection successful',
      tables
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      message: 'D1 database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 