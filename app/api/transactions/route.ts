import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Transactions API called with URL:", request.url);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const bank = searchParams.get("bank");

    console.log("Filtering transactions with params:", {
      month,
      year,
      category,
      bank,
    });

    // Start with a base query
    let query = sql`
      SELECT * 
      FROM transactions 
      WHERE 1=1
    `;

    // Add filters using parameter binding
    if (month && month !== "all") {
      const monthInt = parseInt(month, 10);
      console.log("Adding month filter:", monthInt);
      query = sql`${query} AND EXTRACT(MONTH FROM transaction_date) = ${monthInt}`;
    }

    if (year && year !== "all") {
      const yearInt = parseInt(year, 10);
      console.log("Adding year filter:", yearInt);
      query = sql`${query} AND EXTRACT(YEAR FROM transaction_date) = ${yearInt}`;
    }

    if (category && category !== "all") {
      console.log("Adding category filter:", category);
      query = sql`${query} AND transaction_category = ${category}`;
    }

    if (bank && bank !== "all") {
      console.log("Adding bank filter:", bank);
      query = sql`${query} AND bank_name = ${bank}`;
    }

    // Add the order by clause
    query = sql`${query} ORDER BY transaction_date DESC`;
    console.log("Final query built with filters");

    // Execute the query with better error handling
    try {
      const transactions = await query;
      console.log(
        `Successfully fetched ${transactions?.length || 0} transactions`
      );

      // Calculate balance with a similar approach
      let balanceQuery = sql`
        SELECT SUM(
          CASE 
            WHEN transaction_type = 'deposit' THEN amount 
            WHEN transaction_type = 'withdrawal' THEN -amount
            ELSE 0
          END
        ) as balance
        FROM transactions
        WHERE 1=1
      `;

      // Add the same filters to the balance query
      if (month && month !== "all") {
        const monthInt = parseInt(month, 10);
        balanceQuery = sql`${balanceQuery} AND EXTRACT(MONTH FROM transaction_date) = ${monthInt}`;
      }

      if (year && year !== "all") {
        const yearInt = parseInt(year, 10);
        balanceQuery = sql`${balanceQuery} AND EXTRACT(YEAR FROM transaction_date) = ${yearInt}`;
      }

      if (category && category !== "all") {
        balanceQuery = sql`${balanceQuery} AND transaction_category = ${category}`;
      }

      if (bank && bank !== "all") {
        balanceQuery = sql`${balanceQuery} AND bank_name = ${bank}`;
      }

      const balanceResult = await balanceQuery;
      const balance = balanceResult[0]?.balance || 0;
      console.log("Calculated balance:", balance);

      // Get distinct bank names for filtering
      const banks = await sql`
        SELECT DISTINCT bank_name FROM transactions WHERE bank_name IS NOT NULL ORDER BY bank_name
      `;

      return NextResponse.json({
        transactions,
        balance,
        banks,
      });
    } catch (queryError) {
      console.error("Error executing transaction queries:", queryError);
      if (queryError instanceof Error) {
        return NextResponse.json(
          { error: `Database query error: ${queryError.message}` },
          { status: 500 }
        );
      }
      throw queryError;
    }
  } catch (error) {
    console.error("Unhandled error in transactions API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack =
      error instanceof Error ? error.stack : "No stack trace available";

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      { error: "Failed to fetch transactions", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      amount,
      transaction_date,
      transaction_type,
      transaction_category,
      bank_name,
      friend_name,
      description,
    } = await request.json();

    console.log("Transaction data received:", {
      amount,
      transaction_date,
      transaction_type,
      transaction_category,
      bank_name,
      friend_name,
      description,
    });

    // First, try to add friend_name column if it doesn't exist
    try {
      await sql`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' AND column_name = 'friend_name'
          ) THEN
            ALTER TABLE transactions ADD COLUMN friend_name TEXT DEFAULT NULL;
          END IF;
        END $$;
      `;
      console.log("Checked and ensured friend_name column exists");
    } catch (error) {
      console.error("Error checking/creating friend_name column:", error);
      // Continue anyway, as we'll handle missing column below
    }

    // Try inserting with friend_name
    try {
      const result = await sql`
        INSERT INTO transactions (
          amount, 
          transaction_date, 
          transaction_type, 
          transaction_category,
          bank_name,
          friend_name,
          description
        )
        VALUES (
          ${amount}, 
          ${transaction_date}, 
          ${transaction_type}, 
          ${transaction_category},
          ${bank_name},
          ${friend_name || null},
          ${description || null}
        )
        RETURNING *
      `;

      return NextResponse.json(result[0]);
    } catch (error: any) {
      // If error mentions friend_name column, try without it
      if (error.message && error.message.includes("friend_name")) {
        console.log("Falling back to insert without friend_name column");
        const result = await sql`
          INSERT INTO transactions (
            amount, 
            transaction_date, 
            transaction_type, 
            transaction_category,
            bank_name,
            description
          )
          VALUES (
            ${amount}, 
            ${transaction_date}, 
            ${transaction_type}, 
            ${transaction_category},
            ${bank_name},
            ${description || null}
          )
          RETURNING *
        `;

        return NextResponse.json(result[0]);
      } else {
        // Re-throw if it's not a friend_name column issue
        throw error;
      }
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      {
        error: `Failed to create transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
