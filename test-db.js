const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const rooms = await prisma.room.findMany();
    console.log('✅ Database query successful!', rooms);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabase();