import { Op, Sequelize, WhereOptions } from 'sequelize';
import { sequelize } from './index.js';

/** Helpers that keep queries portable between SQLite (sandbox) and PostgreSQL (production). */
export const isSqlite = sequelize.getDialect() === 'sqlite';

/** Case-insensitive LIKE. SQLite's LIKE is already case-insensitive for ASCII. */
export const likeOp: symbol = isSqlite ? Op.like : Op.iLike;

const UNITS = ['day', 'week', 'month'] as const;
type Unit = (typeof UNITS)[number];
const toUnit = (u: unknown): Unit => (UNITS.includes(u as Unit) ? (u as Unit) : 'day');

/** DATE_TRUNC equivalent for a camelCase column. */
export const truncDate = (unit: unknown, column: string) => {
  const u = toUnit(unit);
  const c = `"${column}"`;
  if (!isSqlite) return Sequelize.literal(`DATE_TRUNC('${u}', ${c})`);
  if (u === 'day') return Sequelize.literal(`date(${c})`);
  if (u === 'week') return Sequelize.literal(`date(${c}, 'weekday 0', '-6 days')`);
  return Sequelize.literal(`strftime('%Y-%m-01', ${c})`);
};

/** Average of (updatedAt - createdAt) in hours, as a SQL expression. */
export const hoursBetweenExpr = isSqlite
  ? `(julianday("updatedAt") - julianday("createdAt")) * 24`
  : `EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600`;

/** Age of createdAt in days, as a SQL expression. */
export const ageDaysExpr = isSqlite
  ? `julianday('now') - julianday("createdAt")`
  : `EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 86400`;

/** Match records whose JSON `tags` column contains any of the given tags (works on JSON text). */
export const tagsAny = (tags: string[]): WhereOptions => ({
  [Op.and]: [{
    [Op.or]: tags.map(t =>
      Sequelize.where(Sequelize.cast(Sequelize.col('tags'), 'text'), Op.like, `%${JSON.stringify(String(t)).replace(/[%_]/g, '')}%`)
    ),
  }],
});
