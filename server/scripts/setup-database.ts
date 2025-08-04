#!/usr/bin/env tsx

import { initializeDatabase, insertSampleData, dropAllTables } from '../database/init.js';

async function setupDatabase() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Ecko Streetwear - Database Setup');
  console.log('=====================================');

  try {
    switch (command) {
      case 'init':
        console.log('📊 Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialization completed');
        break;

      case 'seed':
        console.log('🌱 Seeding database with sample data...');
        await insertSampleData();
        console.log('✅ Sample data inserted successfully');
        break;

      case 'reset':
        console.log('🔄 Resetting database...');
        await dropAllTables();
        await initializeDatabase();
        await insertSampleData();
        console.log('✅ Database reset completed');
        break;

      case 'drop':
        console.log('🗑️  Dropping all tables...');
        await dropAllTables();
        console.log('✅ All tables dropped');
        break;

      default:
        console.log('Usage: tsx setup-database.ts <command>');
        console.log('');
        console.log('Available commands:');
        console.log('  init   - Create all database tables');
        console.log('  seed   - Insert sample data');
        console.log('  reset  - Drop and recreate all tables with sample data');
        console.log('  drop   - Drop all tables');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupDatabase();
