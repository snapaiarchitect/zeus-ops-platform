import { User } from '../models/index.js';

/**
 * Creates the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD, but only when the database
 * has no admin yet. Registration only ever creates `client` users, so without this a fresh
 * production database has nobody who can sign in to /admin. Remove ADMIN_PASSWORD from the
 * environment once you have logged in.
 */
export async function bootstrapAdmin(): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return false;
  if (await User.count({ where: { role: 'admin' } })) return false;
  if (password.length < 12) {
    console.error('⚠️  ADMIN_PASSWORD must be at least 12 characters; admin not created');
    return false;
  }
  await User.create({
    email: email.toLowerCase(),
    password, // hashed by the model hook
    role: 'admin',
    firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME || 'User',
    company: 'ZEUS OPS',
    isActive: true,
  });
  console.log(`👤 Bootstrap admin created: ${email}`);
  return true;
}
