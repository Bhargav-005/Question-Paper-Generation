# Database Connection Documentation

This document provides technical details on how the **Q-Gen Institutional** application connects to its PostgreSQL database.

## 🔗 Connection Parameters

The application uses a centralized environment-based connection strategy. All connection details are stored in the `.env` file at the root of the project.

### Environment Variable
*   **Variable Name**: `DATABASE_URL`
*   **Format**: `postgresql://[user]:[password]@[host]:[port]/[database_name]`
*   **Default (Dev)**: `postgresql://postgres@localhost:5432/qpaper`

---

## 🏗️ Backend Connection Logic (`server/db.ts`)

The primary database connection is established in `server/db.ts` using the `pg` (node-postgres) library.

### Implementation Details:
1.  **Connection Pool**: The app uses a `Pool` instance to manage multiple concurrent connections efficiently.
2.  **Singleton Pattern**: The `pool` is exported as a singleton to be shared across all API routes and services.
3.  **Query Helper**: A `db` object is exported with a `.query()` method for standard SQL execution.
4.  **Query Builder**: A custom `from()` helper provides a Supabase-like syntax (e.g., `db('profiles').select('*').eq('id', 1)`) for easier CRUD operations.

```typescript
// server/db.ts excerpt
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
    pool,
};
```

---

## 🔨 Schema Initialization (`script/init-db.ts`)

For database setup and migrations, a dedicated script is used that connects directly to the database to perform administrative tasks.

### Key Actions:
*   **Connection**: Uses a single `pg.Client` for sequential DDL operations.
*   **Cleanup**: Drops existing tables to ensure a clean schema (Controlled environment only).
*   **Extensions**: Enables `pgcrypto` for UUID generation.
*   **DDL**: Creates the full relational schema (`profiles`, `users`, `courses`, `syllabus_topics`, etc.).
*   **Seeding**: Inserts default system administrator records.

To run the initialization:
```bash
npm run init-db
```

---

## 🛠️ Internal Data Flow

1.  **Server Start**: `server/index.ts` boots up and imports `server/db.ts`.
2.  **Requests**: When an API request hits a route (e.g., `/api/admin/faculty`), the controller calls `db.query()` or uses the `from()` helper.
3.  **Pool Management**: The `Pool` automatically dispenses a connection, executes the SQL, and returns the connection to the pool.
4.  **Error Handling**: If `DATABASE_URL` is missing or the database is down, the server will log an error and fail to start or return 500 status codes.

---
**Note**: Ensure the PostgreSQL service is running on your local machine or the specified host before starting the server.
