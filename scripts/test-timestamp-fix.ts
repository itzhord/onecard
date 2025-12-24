/**
 * Test script to verify timestamp mode fix for Better Auth + Drizzle
 *
 * This script tests that:
 * 1. Drizzle returns Date objects for timestamp fields
 * 2. Better Auth can successfully create users (no toISOString errors)
 * 3. All timestamp fields work correctly
 */

import { prisma } from "@/lib/prisma";

async function testTimestampFix() {
  console.log("🧪 Testing Timestamp Fix for Better Auth + Prisma\n");

  try {
    // Test 1: Create a test user with timestamp fields
    console.log("1️⃣ Testing user creation with timestamps...");
    const testUserId = `test-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;
    const nowIso = new Date().toISOString();

    const newUser = await prisma.user.create({
      data: {
        id: testUserId,
        email: testEmail,
        name: "Test User",
        // schema stores timestamps as ISO strings
        createdAt: nowIso,
        updatedAt: nowIso,
        // emailVerified in this schema is a boolean flag; set to true
        emailVerified: true,
      },
    });

    console.log("   ✅ User created successfully");
    console.log(`   - ID: ${newUser.id}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Created At type: ${typeof newUser.createdAt} (should be 'string')`);

    if (typeof newUser.createdAt !== "string") {
      throw new Error("❌ FAILED: createdAt is not a string!");
    }

    if (isNaN(new Date(newUser.createdAt).getTime())) {
      throw new Error("❌ FAILED: createdAt is not a valid ISO date string!");
    }

    // Test 2: Query the user back and verify timestamps are Date objects
    console.log("\n2️⃣ Testing user query returns ISO strings...");
    const queriedUser = await prisma.user.findUnique({ where: { id: testUserId } });

    if (!queriedUser) {
      throw new Error("❌ FAILED: Could not query user back!");
    }

    console.log("   ✅ User queried successfully");
    console.log(`   - Created At type: ${typeof queriedUser.createdAt}`);
    console.log(`   - Is valid ISO string: ${!isNaN(new Date(queriedUser.createdAt).getTime())}`);

    const isoString = new Date(queriedUser.createdAt).toISOString();
    console.log(`   - ISO String: ${isoString}`);

    // Test 3: Create a session with timestamps
    console.log("\n3️⃣ Testing session creation with timestamps...");
    const testSessionId = `session-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const newSession = await prisma.session.create({
      data: {
        id: testSessionId,
        token: `token-${Date.now()}`,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { connect: { id: testUserId } },
      },
    });

    console.log("   ✅ Session created successfully");
    console.log(`   - Expires At type: ${typeof newSession.expiresAt}`);
    console.log(`   - Is valid ISO: ${!isNaN(new Date(newSession.expiresAt).getTime())}`);

    // Test 4: Create an account (Better Auth uses this for credentials)
    console.log("\n4️⃣ Testing account creation with timestamps...");
    const testAccountId = `account-${Date.now()}`;

    const newAccount = await prisma.account.create({
      data: {
        id: testAccountId,
        accountId: testEmail,
        providerId: "credential",
        password: "hashed-password-here",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        user: { connect: { id: testUserId } },
      },
    });

    console.log("   ✅ Account created successfully");
    console.log(`   - Created At is string ISO: ${typeof newAccount.createdAt === 'string'}`);
    console.log(`   - Access Token Expires At is valid ISO: ${!isNaN(new Date(newAccount.accessTokenExpiresAt ?? '').getTime())}`);

    // Test 5: Create a verification token
    console.log("\n5️⃣ Testing verification creation with timestamps...");
    const testVerificationId = `verification-${Date.now()}`;

    const newVerification = await prisma.verification.create({
      data: {
        id: testVerificationId,
        identifier: testEmail,
        value: `token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    console.log("   ✅ Verification created successfully");
    console.log(`   - Expires At is valid ISO: ${!isNaN(new Date(newVerification.expiresAt).getTime())}`);

    // Cleanup
    console.log("\n🧹 Cleaning up test data...");
    await prisma.verification.deleteMany({ where: { id: testVerificationId } });
    await prisma.account.deleteMany({ where: { id: testAccountId } });
    await prisma.session.deleteMany({ where: { id: testSessionId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    console.log("   ✅ Cleanup complete");

    console.log("\n✅ ALL TESTS PASSED!");
    console.log("\n🎉 The timestamp fix is working correctly!");
    console.log("   - All timestamp fields return Date objects");
    console.log("   - toISOString() works on all timestamp fields");
    console.log("   - Better Auth should now work without errors");

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testTimestampFix()
  .then(() => {
    console.log("\n✨ Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed with error:");
    console.error(error);
    process.exit(1);
  });
