import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create funds table
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

    // Create/update transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        transaction_type TEXT NOT NULL,
        transaction_category TEXT,
        bank_name TEXT,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add columns to transactions table if they don't exist
    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_category TEXT;
    `;

    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_name TEXT;
    `;

    // Create contributions table
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

    // Ensure the contributions table doesn't have a fund_id column
    await sql`
      ALTER TABLE contributions DROP COLUMN IF EXISTS fund_id CASCADE;
    `;

    // Make sure the contribution_date column exists
    await sql`
      ALTER TABLE contributions ADD COLUMN IF NOT EXISTS contribution_date DATE;
    `;

    // If the date column exists, migrate data to contribution_date and then drop date column
    try {
      // Check if the date column exists
      const checkColumn = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'contributions' 
        AND column_name = 'date'
      `;

      if (checkColumn.length > 0) {
        // Update contribution_date with date values where contribution_date is null
        await sql`
          UPDATE contributions 
          SET contribution_date = date 
          WHERE contribution_date IS NULL AND date IS NOT NULL
        `;

        // Drop the date column
        await sql`
          ALTER TABLE contributions DROP COLUMN IF EXISTS date CASCADE;
        `;
      }
    } catch (error) {
      console.error("Error migrating date column:", error);
      // Continue with setup even if this fails
    }

    // Create friends table
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Database tables created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting up database:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error setting up database",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
