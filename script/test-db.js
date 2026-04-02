
import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', databaseUrl ? 'Defined' : 'Not defined');

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to the database!');

    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error('Error details:', err.message);
    process.exit(1);
  }
}

testConnection();