import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const bank = searchParams.get("bank");

    // Build the query dynamically
    const queryParts = [
      `SELECT t.*, 
       t.friend_name AS friend_name
       FROM transactions t
       WHERE 1=1`,
    ];

    if (month && month !== "all" && year) {
      queryParts.push(`AND EXTRACT(MONTH FROM t.transaction_date) = '${month}'
                      AND EXTRACT(YEAR FROM t.transaction_date) = '${year}'`);
    } else if (month && month !== "all") {
      queryParts.push(
        `AND EXTRACT(MONTH FROM t.transaction_date) = '${month}'`
      );
    } else if (year) {
      queryParts.push(`AND EXTRACT(YEAR FROM t.transaction_date) = '${year}'`);
    }

    if (category && category !== "all") {
      queryParts.push(`AND t.transaction_category = '${category}'`);
    }

    if (bank && bank !== "all") {
      queryParts.push(`AND t.bank_name = '${bank}'`);
    }

    queryParts.push(`ORDER BY t.transaction_date DESC`);

    const query = queryParts.join(" ");
    const transactions = await sql([query] as any);

    // Calculate current balance
    const balanceResult = await sql`
      SELECT SUM(
        CASE 
          WHEN transaction_type = 'deposit' THEN amount 
          WHEN transaction_type IN ('withdrawal', 'charges', 'mutual_funds') THEN -amount
          ELSE 0
        END
      ) as balance
      FROM transactions
    `;

    const balance = balanceResult[0]?.balance || 0;

    // Get distinct bank names for filtering
    const banks = await sql`
      SELECT DISTINCT bank_name FROM transactions WHERE bank_name IS NOT NULL ORDER BY bank_name
    `;

    return NextResponse.json({
      transactions,
      balance,
      banks,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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
