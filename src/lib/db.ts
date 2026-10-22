import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_QcBjGEO7il5p@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(databaseUrl);

let tablesInitialized = false;

/**
 * Ensure database schema exists on Neon and has all needed columns
 */
export async function ensureDatabaseSchema() {
  if (tablesInitialized) return;

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        gemini_api_key TEXT,
        gemini_model VARCHAR(64) DEFAULT 'gemini-2.5-flash',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Ensure columns exist if table was created previously
    await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_api_key TEXT');
    await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_model VARCHAR(64) DEFAULT 'gemini-2.5-flash'");
    await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

    await sql.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date VARCHAR(64),
        is_completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(32) DEFAULT 'MEDIUM',
        quadrant VARCHAR(32) DEFAULT 'SCHEDULE',
        estimated_minutes INTEGER DEFAULT 30,
        tags JSONB DEFAULT '[]'::jsonb,
        subtasks JSONB DEFAULT '[]'::jsonb,
        ai_score INTEGER DEFAULT 50,
        ai_reasoning TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Ensure columns exist on tasks
    await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE');
    await sql.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quadrant VARCHAR(32) DEFAULT 'SCHEDULE'");
    await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30');
    await sql.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb");
    await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 50');
    await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

    await sql.query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)');
    await sql.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    tablesInitialized = true;
  } catch (error) {
    console.error('Error ensuring database schema:', error);
  }
}
