import 'dotenv/config';
import 'fake-indexeddb/auto';
import { migrateToPocketBase } from '../src/database/migration/index.js';

async function main() {
  const email = process.env.POCKETBASE_EMAIL;
  const password = process.env.POCKETBASE_PASSWORD;

  if (!email || !password) {
    console.error('Please set POCKETBASE_EMAIL and POCKETBASE_PASSWORD environment variables');
    process.exit(1);
  }

  try {
    const result = await migrateToPocketBase(email, password);
    if (result.success) {
      console.log('Migration completed successfully');
      if (result.user) {
        console.log('\nCreated user credentials:');
        console.log('Email:', result.user.email);
        console.log('Password:', result.user.password);
        console.log('\nPlease save these credentials to log in to the application.');
      }
      process.exit(0);
    } else {
      console.error('Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  }
}

main(); 