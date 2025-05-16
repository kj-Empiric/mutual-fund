// Run migration to add friend_name column to transactions table
import { runMigration } from "./lib/db/migrations/add_friend_name_to_transactions";

// Execute the migration
console.log("Starting migration...");
runMigration()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
