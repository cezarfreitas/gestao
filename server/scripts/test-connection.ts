#!/usr/bin/env tsx

import { testConnection } from '../database/connection.js';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📍 Host: server.idenegociosdigitais.com.br:3459');
  console.log('👤 User: leads');
  console.log('🗄️  Database: leads');
  console.log('');

  try {
    const isConnected = await testConnection(8000); // 8 second timeout
    
    if (isConnected) {
      console.log('✅ Connection successful!');
      process.exit(0);
    } else {
      console.log('❌ Connection failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
