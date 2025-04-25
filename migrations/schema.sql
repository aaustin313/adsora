-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create ad_campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  meta_campaign_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create ad_sets table
CREATE TABLE IF NOT EXISTS ad_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  meta_adset_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  budget REAL,
  start_date DATE,
  end_date DATE,
  targeting_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
);

-- Create ad_creatives table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  adset_id TEXT NOT NULL,
  meta_creative_id TEXT,
  drive_file_id TEXT,
  file_url TEXT,
  headline TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adset_id) REFERENCES ad_sets(id)
);

-- Create slack_connections table
CREATE TABLE IF NOT EXISTS slack_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create agent_sessions table
CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_uuid TEXT NOT NULL,
  mcp_runner_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_id ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign_id ON ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_adset_id ON ad_creatives(adset_id);
CREATE INDEX IF NOT EXISTS idx_slack_connections_user_id ON slack_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id); 