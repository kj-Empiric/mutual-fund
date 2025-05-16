// Direct migration script to add friend_name column to transactions table
// Run with: node scripts/db-migration.mjs

import { getClient } from "../lib/db.js";

async function runMigration() {
  console.log("Running migration: add_friend_name_to_transactions");

  const client = getClient();

  try {
    // Check if the column already exists
    const checkColumnResult = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name = 'friend_name'
    `;

    if (checkColumnResult.length === 0) {
      // Column doesn't exist, add it
      await client`
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
