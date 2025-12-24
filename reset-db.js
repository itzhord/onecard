const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
  try {
    console.log("Connecting to database...");

    // Drop all tables in reverse order to handle dependencies
    const tables = [
      "profile_views",
      "team_members",
      "teams",
      "email_opt_outs",
      "email_preferences",
      "email_logs",
      "subscriptions",
      "payments",
      "cards",
      "profiles",
      "verifications",
      "accounts",
      "sessions",
      "users",
    ];

    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
      console.log(`✓ Dropped table: ${table}`);
    }

    console.log("✅ All tables dropped successfully");
    console.log("Now you can run: npm run migrate:setup");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

resetDatabase();
