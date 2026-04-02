import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function addColumn() {
  try {
    await pool.query(`
      ALTER TABLE papers 
      ADD COLUMN IF NOT EXISTS paper_content JSONB;
    `);
    console.log('Column paper_content added successfully (or already exists).');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await pool.end();
  }
}

addColumn();
