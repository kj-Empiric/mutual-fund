import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get fund totals
    const fundTotals = await sql`
      SELECT f.id, f.name
      FROM funds f
      ORDER BY f.name
    `;

    // Get friend totals
    const friendTotals = await sql`
      SELECT fr.id, fr.name, SUM(c.amount) as total_amount
      FROM friends fr
      LEFT JOIN contributions c ON fr.id = c.friend_id
      GROUP BY fr.id, fr.name
      ORDER BY total_amount DESC NULLS LAST
    `;

    // Get total contributions
    const totalContributions = await sql`
      SELECT SUM(amount) as total FROM contributions
    `;

    // Get current balance
    const currentBalance = await sql`
      SELECT SUM(
        CASE 
          WHEN transaction_type = 'deposit' THEN amount 
          WHEN transaction_type IN ('withdrawal', 'charges', 'mutual_funds') THEN -amount
          ELSE 0
        END
      ) as balance
      FROM transactions
    `;

    // Get recent contributions
    const recentContributions = await sql`
      SELECT c.*, fr.name as friend_name
      FROM contributions c
      JOIN friends fr ON c.friend_id = fr.id
      ORDER BY c.contribution_date DESC
      LIMIT 5
    `;

    // Get recent transactions
    const recentTransactions = await sql`
      SELECT *
      FROM transactions
      ORDER BY transaction_date DESC
      LIMIT 5
    `;

    return NextResponse.json({
      fundTotals,
      friendTotals,
      totalContributions: totalContributions[0]?.total || 0,
      currentBalance: currentBalance[0]?.balance || 0,
      recentContributions,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
