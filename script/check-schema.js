import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
async function checkSchema() {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'course_context'
    `);
  console.log('Schema for course_context:');
  res.rows.forEach((row) => console.log(`${row.column_name}: ${row.data_type}`));

  const res2 = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'paper_outcomes'
    `);
  console.log('\nSchema for paper_outcomes:');
  res2.rows.forEach((row) => console.log(`${row.column_name}: ${row.data_type}`));

  await client.end();
}
checkSchema();