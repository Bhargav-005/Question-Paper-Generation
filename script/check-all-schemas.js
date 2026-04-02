import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
async function checkSchema() {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  const tables = ['papers', 'course_context', 'paper_outcomes', 'syllabus_units', 'syllabus_topics', 'users'];
  for (const table of tables) {
    const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [table]);
    console.log(`\nSchema for ${table}:`);
    res.rows.forEach((row) => console.log(`${row.column_name}: ${row.data_type}`));
  }

  await client.end();
}
checkSchema();