import { sequelize } from './index.js';

/**
 * Supabase exposes every table in the `public` schema through its auto-generated Data API
 * (PostgREST, using the public anon key). This backend connects as the database owner, which
 * bypasses row-level security, so enabling RLS with NO policies locks the Data API out
 * without affecting the app. Idempotent; a no-op on non-Postgres databases.
 */
export async function enableRowLevelSecurity(): Promise<string[]> {
  if (sequelize.getDialect() !== 'postgres') return [];
  const tables = Object.values(sequelize.models).map((m) => m.getTableName() as string);
  for (const t of tables) {
    await sequelize.query(`ALTER TABLE "public"."${t.replace(/"/g, '""')}" ENABLE ROW LEVEL SECURITY`);
  }
  return tables;
}
