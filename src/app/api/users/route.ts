import { NextRequest, NextResponse } from 'next/server';

// Get all users
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
    
    const { results: users } = await env.DB.prepare(
      "SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC"
    ).all();
    
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Create a new user
export async function POST(request: NextRequest, context: any) {
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
    
    const body = await request.json() as { email: string; name: string };
    const { email, name } = body;
    
    // Validate input
    if (!email || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email and name are required'
      }, { status: 400 });
    }
    
    // Generate a unique ID (using timestamp + random string)
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
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({
        success: false,
        message: 'Email already in use',
        error: 'Email address must be unique'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 