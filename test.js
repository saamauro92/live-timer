const { createClient } = require('redis');

async function testRedis() {
  const client = createClient({
    url: 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('✅ Redis connected successfully!');
    
    // Test set/get
    await client.set('test', 'Hello Redis!');
    const value = await client.get('test');
    console.log('✅ Redis test value:', value);
    
    await client.quit();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
}

testRedis();