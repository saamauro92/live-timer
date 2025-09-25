const { Client } = require('pg');
require('dotenv').config();

// Override with correct password
process.env.DATABASE_URL = 'postgresql://postgres:Belgrano949@localhost:5432/live_timer';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    console.log('Testing connection with:', process.env.DATABASE_URL);
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query result:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
