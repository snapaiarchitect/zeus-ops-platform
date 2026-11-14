import { sequelize } from './index.js';
import '../models/index.js';

// Creates / updates all tables from the Sequelize models.
const force = process.argv.includes('--force');

try {
  await sequelize.authenticate();
  await sequelize.sync({ force, alter: !force });
  console.log(`✅ Migration complete${force ? ' (tables recreated)' : ''}`);
  process.exit(0);
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
}
