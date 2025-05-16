// Run migration to add friend_name column to the transactions table
const { sql } = require("@/lib/db");

async function runMigration() {
  console.log("Running migration: add_friend_name_to_transactions");

  try {
    // Check if the column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name = 'friend_name'
    `;

    if (checkColumn.length === 0) {
      // Column doesn't exist, add it
      await sql`
        ALTER TABLE transactions
        ADD COLUMN friend_name TEXT DEFAULT NULL
      `;
      console.log(
        "Migration successful: friend_name column added to transactions table"
      );
    } else {
      console.log("Migration skipped: friend_name column already exists");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Execute the migration
console.log("Starting migration...");
runMigration();
