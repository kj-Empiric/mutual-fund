import { sql } from "@/lib/db";

let migrationRun = false;

/**
 * Ensures all database tables have the required structure
 * This runs once per server session to fix any missing columns
 */
export async function runDatabaseMigrations() {
  // Only run migrations once per server session
  if (migrationRun) return;

  console.log("Running database structure checks...");

  try {
    // 1. Ensure all required tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS funds (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(10, 2),
        fund_type TEXT,
        description TEXT,
        purchase_date DATE,
        last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        transaction_type TEXT NOT NULL,
        transaction_category TEXT,
        bank_name TEXT,
        friend_name TEXT,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS contributions (
        id SERIAL PRIMARY KEY,
        friend_id INTEGER,
        amount NUMERIC(10, 2) NOT NULL,
        notes TEXT,
        contribution_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Ensure all required columns exist
    // For friends table
    await sql`
      ALTER TABLE friends ADD COLUMN IF NOT EXISTS phone TEXT;
    `;

    // For transactions table
    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_category TEXT;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_name TEXT;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS friend_name TEXT;
    `;

    // For funds table
    await sql`
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS fund_type TEXT;
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS purchase_date DATE;
      ALTER TABLE funds ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
    `;

    // For contributions table
    await sql`
      ALTER TABLE contributions ADD COLUMN IF NOT EXISTS contribution_date DATE;
    `;

    console.log("Database structure check complete");
    migrationRun = true;
    return true;
  } catch (error) {
    console.error("Error running database migrations:", error);
    return false;
  }
}
