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