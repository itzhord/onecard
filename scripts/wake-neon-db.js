/**
 * Wake up Neon database by attempting a simple connection
 * This is useful for Neon free tier which auto-pauses after inactivity
 * 
 * Run with: node scripts/wake-neon-db.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function wakeUpDatabase() {
  console.log('🔄 Attempting to wake up Neon database...\n');
  console.log('This may take 10-30 seconds if the database is suspended.\n');
  
  const startTime = Date.now();
  let attempt = 0;
  const maxAttempts = 3;
  
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Attempt ${attempt}/${maxAttempts}...`);
    
    try {
      // Try to connect and run a simple query
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n✅ Success! Database is now active.');
      console.log(`⏱️  Connection established in ${duration} seconds\n`);
      
      // Get some basic stats
      const userCount = await prisma.user.count();
      const cardCount = await prisma.card.count();
      
      console.log('📊 Database Stats:');
      console.log(`   Users: ${userCount}`);
      console.log(`   Cards: ${cardCount}\n`);
      
      console.log('✅ Database is ready for use!');
      console.log('You can now start your development server:\n');
      console.log('   npm run dev\n');
      
      await prisma.$disconnect();
      return true;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      
      if (attempt < maxAttempts) {
        console.log('   Retrying in 5 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  console.log('\n❌ Could not connect to database after multiple attempts.\n');
  console.log('Possible solutions:\n');
  console.log('1. Check if your Neon database is active:');
  console.log('   → Go to https://console.neon.tech/');
  console.log('   → Find your project');
  console.log('   → Click "Resume" if database is suspended\n');
  
  console.log('2. Verify your DATABASE_URL in .env file');
  console.log('   → Get connection string from Neon Console');
  console.log('   → Update .env with correct credentials\n');
  
  console.log('3. Check for network issues:');
  console.log('   → Disable VPN if active');
  console.log('   → Check firewall settings');
  console.log('   → Verify internet connection\n');
  
  console.log('4. Check Neon service status:');
  console.log('   → Visit https://neonstatus.com/\n');
  
  await prisma.$disconnect();
  return false;
}

wakeUpDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });
