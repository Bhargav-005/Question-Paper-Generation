/**
 * Run migration: fix_course_context_paper_id_uuid.sql
 * Fixes "invalid input syntax for type integer" when saving Course Context.
 */
import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function run() {
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }
  const sqlPath = join(__dirname, '..', 'migrations', 'fix_course_context_paper_id_uuid.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Running migration: fix_course_context_paper_id_uuid.sql');
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();