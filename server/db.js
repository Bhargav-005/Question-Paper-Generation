
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = {
  query: (text, params) => pool.query(text, params),
  pool
};



export const from = (table) => {
  return {
    select: (columns = '*') => {
      const builder = {
        eq: (col, val) => {
          const eqBuilder = {
            order: (orderCol, { ascending = true } = {}) => {
              const sql = `SELECT ${columns} FROM ${table} WHERE ${col} = $1 ORDER BY ${orderCol} ${ascending ? 'ASC' : 'DESC'}`;
              return pool.query(sql, [val]).
              then((res) => ({ data: res.rows, error: null })).
              catch((error) => ({ data: null, error }));
            },
            single: () => {
              const sql = `SELECT ${columns} FROM ${table} WHERE ${col} = $1 LIMIT 1`;
              return pool.query(sql, [val]).
              then((res) => ({ data: res.rows[0] || null, error: null })).
              catch((error) => ({ data: null, error }));
            },
            then: (resolve, reject) => {
              const sql = `SELECT ${columns} FROM ${table} WHERE ${col} = $1`;
              pool.query(sql, [val]).
              then((res) => resolve({ data: res.rows, error: null })).
              catch((error) => resolve({ data: null, error }));
            }
          };
          return eqBuilder;
        },
        then: (resolve, reject) => {
          const sql = `SELECT ${columns} FROM ${table}`;
          pool.query(sql).
          then((res) => resolve({ data: res.rows, error: null })).
          catch((error) => resolve({ data: null, error }));
        }
      };
      return builder;
    },
    insert: (data) => ({
      then: (resolve, reject) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        pool.query(sql, values).
        then((res) => resolve({ data: res.rows[0], error: null })).
        catch((error) => resolve({ data: null, error }));
      }
    }),
    update: (data) => ({
      eq: (col, val) => ({
        then: (resolve, reject) => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
          const sql = `UPDATE ${table} SET ${setClause} WHERE ${col} = $${keys.length + 1} RETURNING *`;
          pool.query(sql, [...values, val]).
          then((res) => resolve({ data: res.rows[0], error: null })).
          catch((error) => resolve({ data: null, error }));
        }
      })
    }),
    delete: () => ({
      eq: (col, val) => ({
        then: (resolve, reject) => {
          const sql = `DELETE FROM ${table} WHERE ${col} = $1`;
          pool.query(sql, [val]).
          then(() => resolve({ error: null })).
          catch((error) => resolve({ error }));
        }
      })
    })
  };
};