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

    // Build the WHERE clause conditions
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (month && month !== "all") {
      const monthInt = parseInt(month, 10);
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${paramIndex}`);
      values.push(monthInt);
      paramIndex++;
      console.log("Adding month filter:", monthInt);
    }

    if (year && year !== "all") {
      const yearInt = parseInt(year, 10);
      conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${paramIndex}`);
      values.push(yearInt);
      paramIndex++;
      console.log("Adding year filter:", yearInt);
    }

    if (category && category !== "all") {
      conditions.push(`transaction_category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
      console.log("Adding category filter:", category);
    }

    if (bank && bank !== "all") {
      conditions.push(`bank_name = $${paramIndex}`);
      values.push(bank);
      paramIndex++;
      console.log("Adding bank filter:", bank);
    }

    // Build the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Execute the transactions query
    try {
      let transactions;
      let balanceResult;

      if (conditions.length === 0) {
        // No filters - use simple queries
        transactions = await sql`
          SELECT * FROM transactions ORDER BY transaction_date DESC
        `;
        
        balanceResult = await sql`
          SELECT SUM(
            CASE 
              WHEN transaction_type = 'deposit' THEN amount 
              WHEN transaction_type = 'withdrawal' THEN -amount
              ELSE 0
            END
          ) as balance
          FROM transactions
        `;
      } else {
        // Build dynamic queries with proper parameter binding
        const whereClause = `WHERE ${conditions.join(" AND ")}`;
        
        // For transactions query
        if (conditions.length === 1) {
          if (month && month !== "all") {
            const monthInt = parseInt(month, 10);
            transactions = await sql`
              SELECT * FROM transactions 
              WHERE EXTRACT(MONTH FROM transaction_date) = ${monthInt}
              ORDER BY transaction_date DESC
            `;
          } else if (year && year !== "all") {
            const yearInt = parseInt(year, 10);
            transactions = await sql`
              SELECT * FROM transactions 
              WHERE EXTRACT(YEAR FROM transaction_date) = ${yearInt}
              ORDER BY transaction_date DESC
            `;
                   } else if (category && category !== "all") {
           transactions = await sql`
             SELECT * FROM transactions 
             WHERE transaction_category = ${category}
             ORDER BY transaction_date DESC
           `;
         } else if (bank && bank !== "all") {
           transactions = await sql`
             SELECT * FROM transactions 
             WHERE bank_name = ${bank}
             ORDER BY transaction_date DESC
           `;
         } else {
           // Fallback for any unhandled single filter case
           transactions = await sql`
             SELECT * FROM transactions ORDER BY transaction_date DESC
           `;
         }
       } else {
         // Multiple filters - build query dynamically
         console.log("Multiple filters detected, using fallback query");
         
         // For now, use a simple query and apply filters in memory
         // This is a temporary solution until we implement proper dynamic SQL
         transactions = await sql`
           SELECT * FROM transactions ORDER BY transaction_date DESC
         `;
         
         // Apply filters in memory as a temporary solution
         if (month && month !== "all") {
           const monthInt = parseInt(month, 10);
           transactions = transactions.filter(t => 
             new Date(t.transaction_date).getMonth() + 1 === monthInt
           );
         }
         if (year && year !== "all") {
           const yearInt = parseInt(year, 10);
           transactions = transactions.filter(t => 
             new Date(t.transaction_date).getFullYear() === yearInt
           );
         }
         if (category && category !== "all") {
           transactions = transactions.filter(t => t.transaction_category === category);
         }
         if (bank && bank !== "all") {
           transactions = transactions.filter(t => t.bank_name === bank);
         }
       }

                 // Balance query with same filters
         if (conditions.length === 1) {
           // Single filter - use SQL
           if (month && month !== "all" && year && year !== "all") {
             const monthInt = parseInt(month, 10);
             const yearInt = parseInt(year, 10);
             balanceResult = await sql`
               SELECT SUM(
                 CASE 
                   WHEN transaction_type = 'deposit' THEN amount 
                   WHEN transaction_type = 'withdrawal' THEN -amount
                   ELSE 0
                 END
               ) as balance
               FROM transactions 
               WHERE EXTRACT(MONTH FROM transaction_date) = ${monthInt}
                 AND EXTRACT(YEAR FROM transaction_date) = ${yearInt}
             `;
           } else {
             balanceResult = await sql`
               SELECT SUM(
                 CASE 
                   WHEN transaction_type = 'deposit' THEN amount 
                   WHEN transaction_type = 'withdrawal' THEN -amount
                   ELSE 0
                 END
               ) as balance
               FROM transactions
             `;
           }
         } else {
           // Multiple filters - calculate balance from filtered transactions
           balanceResult = [{
             balance: transactions.reduce((sum, t) => {
               if (t.transaction_type === 'deposit') return sum + parseFloat(t.amount);
               if (t.transaction_type === 'withdrawal') return sum - parseFloat(t.amount);
               return sum;
             }, 0)
           }];
         }
      }

      console.log(`Successfully fetched ${transactions?.length || 0} transactions`);
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
