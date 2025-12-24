/**
 * Quick Timestamp Parser Verification
 *
 * This script verifies that the pg type parser configuration is working correctly.
 * It imports the drizzle configuration to ensure type parsers are loaded.
 *
 * Run: npx tsx scripts/check-timestamp-parsers.ts
 */

// Import drizzle to load type parser configuration
import "../src/lib/drizzle";
import { types } from "pg";

console.log("🔍 Checking pg Type Parser Configuration\n");
console.log("📦 Loaded drizzle configuration with type parsers\n");

// Check if type parsers are configured
const timestamptzParser = types.getTypeParser(types.builtins.TIMESTAMPTZ);
const timestampParser = types.getTypeParser(types.builtins.TIMESTAMP);
const dateParser = types.getTypeParser(types.builtins.DATE);

console.log("📋 Type Parser Tests:\n");

// Test TIMESTAMPTZ parser
console.log("1️⃣  TIMESTAMPTZ (OID 1184):");
try {
  const testValue = "2025-11-13T16:00:00.000Z";
  const parsed = timestamptzParser(testValue);
  const isDate = parsed instanceof Date;
  const canCallToISOString = typeof parsed?.toISOString === "function";

  console.log(`   Input: "${testValue}"`);
  console.log(`   Output: ${parsed}`);
  console.log(`   Type: ${typeof parsed}`);
  console.log(`   Is Date: ${isDate ? "✅" : "❌"}`);
  console.log(`   Has toISOString: ${canCallToISOString ? "✅" : "❌"}`);

  if (isDate && canCallToISOString) {
    const isoString = parsed.toISOString();
    console.log(`   toISOString(): ${isoString}`);
    console.log(`   ✅ WORKING CORRECTLY\n`);
  } else {
    console.log(`   ❌ NOT CONFIGURED PROPERLY\n`);
  }
} catch (error) {
  console.log(`   ❌ ERROR: ${error}\n`);
}

// Test TIMESTAMP parser
console.log("2️⃣  TIMESTAMP (OID 1114):");
try {
  const testValue = "2025-11-13 16:00:00";
  const parsed = timestampParser(testValue);
  const isDate = parsed instanceof Date;
  const canCallToISOString = typeof parsed?.toISOString === "function";

  console.log(`   Input: "${testValue}"`);
  console.log(`   Output: ${parsed}`);
  console.log(`   Type: ${typeof parsed}`);
  console.log(`   Is Date: ${isDate ? "✅" : "❌"}`);
  console.log(`   Has toISOString: ${canCallToISOString ? "✅" : "❌"}`);

  if (isDate && canCallToISOString) {
    const isoString = parsed.toISOString();
    console.log(`   toISOString(): ${isoString}`);
    console.log(`   ✅ WORKING CORRECTLY\n`);
  } else {
    console.log(`   ❌ NOT CONFIGURED PROPERLY\n`);
  }
} catch (error) {
  console.log(`   ❌ ERROR: ${error}\n`);
}

// Test DATE parser
console.log("3️⃣  DATE (OID 1082):");
try {
  const testValue = "2025-11-13";
  const parsed = dateParser(testValue);
  const isDate = parsed instanceof Date;
  const canCallToISOString = typeof parsed?.toISOString === "function";

  console.log(`   Input: "${testValue}"`);
  console.log(`   Output: ${parsed}`);
  console.log(`   Type: ${typeof parsed}`);
  console.log(`   Is Date: ${isDate ? "✅" : "❌"}`);
  console.log(`   Has toISOString: ${canCallToISOString ? "✅" : "❌"}`);

  if (isDate && canCallToISOString) {
    const isoString = parsed.toISOString();
    console.log(`   toISOString(): ${isoString}`);
    console.log(`   ✅ WORKING CORRECTLY\n`);
  } else {
    console.log(`   ❌ NOT CONFIGURED PROPERLY\n`);
  }
} catch (error) {
  console.log(`   ❌ ERROR: ${error}\n`);
}

// Summary
console.log("═".repeat(60));
console.log("\n📊 SUMMARY\n");

const allParsers = [
  {
    name: "TIMESTAMPTZ",
    parser: timestamptzParser,
    testVal: "2025-11-13T16:00:00.000Z",
  },
  {
    name: "TIMESTAMP",
    parser: timestampParser,
    testVal: "2025-11-13 16:00:00",
  },
  { name: "DATE", parser: dateParser, testVal: "2025-11-13" },
];

let allWorking = true;
const results: Array<{ name: string; working: boolean }> = [];

for (const { name, parser, testVal } of allParsers) {
  try {
    const result = parser(testVal);
    const working =
      result instanceof Date && typeof result.toISOString === "function";
    results.push({ name, working });
    console.log(
      `${working ? "✅" : "❌"} ${name}: ${working ? "Configured correctly" : "Not configured"}`,
    );
    if (!working) allWorking = false;
  } catch (error) {
    results.push({ name, working: false });
    console.log(`❌ ${name}: Error - ${error}`);
    allWorking = false;
  }
}

console.log("");

if (allWorking) {
  console.log("🎉 SUCCESS! All type parsers are configured correctly!\n");
  console.log("✨ What this means:");
  console.log("   • PostgreSQL timestamps will be returned as Date objects");
  console.log("   • Better Auth can call .toISOString() without errors");
  console.log(
    "   • User signup, sessions, and auth flows will work correctly\n",
  );
  console.log("🚀 Ready to test user signup!\n");
  console.log("📝 Next steps:");
  console.log("   1. Make sure your dev server is running: npm run dev");
  console.log("   2. Navigate to your signup page");
  console.log("   3. Create a new account");
  console.log("   4. Verify no toISOString errors\n");
  process.exit(0);
} else {
  console.log("⚠️  SOME TYPE PARSERS NOT CONFIGURED!\n");

  const failedParsers = results.filter((r) => !r.working);
  console.log("❌ Failed parsers:");
  failedParsers.forEach((p) => {
    console.log(`   • ${p.name}`);
  });
  console.log("");

  console.log("🔧 Troubleshooting:");
  console.log("   1. Check src/lib/drizzle.ts has type parser configuration");
  console.log("   2. Verify the configuration is BEFORE creating the Pool");
  console.log(
    "   3. Check for any TypeScript errors: npx tsc --noEmit src/lib/drizzle.ts",
  );
  console.log("   4. If dev server is running, restart it completely\n");
  console.log("📖 See docs/TIMESTAMP_FIX.md for detailed troubleshooting\n");
  process.exit(1);
}
