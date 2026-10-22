import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_QcBjGEO7il5p@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function migrate() {
  console.log('Migrating Neon database columns...');

  await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_api_key TEXT');
  await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-2.5-flash'");
  await sql.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
  console.log('✓ Users columns updated');

  await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE');
  await sql.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quadrant VARCHAR(32) DEFAULT 'SCHEDULE'");
  await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30');
  await sql.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb");
  await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 50');
  await sql.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
  console.log('✓ Tasks columns updated');

  try {
    await sql.query('UPDATE tasks SET is_completed = completed WHERE is_completed IS NULL AND completed IS NOT NULL');
    await sql.query('UPDATE tasks SET ai_score = priority_score WHERE ai_score IS NULL AND priority_score IS NOT NULL');
    await sql.query('UPDATE tasks SET quadrant = eisenhower_quadrant WHERE quadrant IS NULL AND eisenhower_quadrant IS NOT NULL');
  } catch (e) {
    console.log('Sync note:', e.message);
  }

  console.log('✓ Migration completed!');
}

migrate().catch(console.error);
