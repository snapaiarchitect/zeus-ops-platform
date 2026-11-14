import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.DATABASE_URL) {
  // Never fall back to a local SQLite file in production: the filesystem is ephemeral.
  throw new Error('DATABASE_URL is required in production');
}
const useSQLite = !isProd && (process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL);

export const sequelize = useSQLite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    })
  : new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/zeusops', {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL !== 'false' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    });

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

export default sequelize;
