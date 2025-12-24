/**
 * Test script to verify card operations and database connectivity
 * Run with: node scripts/test-card-operations.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testCardOperations() {
  console.log('\n🔍 Testing card operations...');
  
  try {
    // Test 1: Count existing cards
    const cardCount = await prisma.card.count();
    console.log(`✅ Found ${cardCount} existing cards in database`);
    
    // Test 2: Fetch all cards
    const cards = await prisma.card.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Successfully fetched ${cards.length} cards`);
    
    if (cards.length > 0) {
      console.log('\nSample card data:');
      console.log({
        id: cards[0].id,
        cardId: cards[0].cardId,
        cardName: cards[0].cardName,
        templateId: cards[0].templateId,
        isActive: cards[0].isActive,
        hasFormData: !!cards[0].formData
      });
    }
    
    // Test 3: Check for users
    const userCount = await prisma.user.count();
    console.log(`\n✅ Found ${userCount} users in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Card operations test failed:', error.message);
    return false;
  }
}

async function testCardSchema() {
  console.log('\n🔍 Verifying card schema...');
  
  try {
    // Get a sample card to verify schema
    const sampleCard = await prisma.card.findFirst();
    
    if (sampleCard) {
      const requiredFields = ['id', 'userId', 'cardId', 'cardName', 'createdAt', 'updatedAt'];
      const missingFields = requiredFields.filter(field => !(field in sampleCard));
      
      if (missingFields.length === 0) {
        console.log('✅ Card schema is correct - all required fields present');
      } else {
        console.error('❌ Missing fields in card schema:', missingFields);
        return false;
      }
    } else {
      console.log('⚠️  No cards in database to verify schema');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Card Operations Test Suite\n');
  console.log('=' .repeat(50));
  
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed - database connection failed');
    console.log('\nPlease check:');
    console.log('1. DATABASE_URL is set in .env file');
    console.log('2. PostgreSQL server is running');
    console.log('3. Database credentials are correct');
    process.exit(1);
  }
  
  const schemaValid = await testCardSchema();
  const operationsWork = await testCardOperations();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Schema Validation: ${schemaValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Card Operations: ${operationsWork ? '✅ PASS' : '❌ FAIL'}`);
  
  if (dbConnected && schemaValid && operationsWork) {
    console.log('\n✅ All tests passed! Card operations should work correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please review the errors above.');
  }
  
  await prisma.$disconnect();
}

runTests().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
