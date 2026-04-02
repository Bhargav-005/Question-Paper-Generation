
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

async function checkTables() {
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('Tables in database:');
    if (res.rows.length === 0) {
      console.log('No tables found.');
    } else {
      res.rows.forEach((row) => console.log(`- ${row.table_name}`));
    }

    await client.end();
  } catch (err) {
    console.error('❌ Error checking tables:', err.message);
  }
}

checkTables();