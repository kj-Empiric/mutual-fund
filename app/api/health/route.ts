import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateDatabase } from "@/lib/db-validator";

export async function GET() {
  try {
    // Test database connection
    const pingResult = await sql`SELECT 1 as ping`;
    const dbConnected = pingResult && pingResult[0]?.ping === 1;

    // Get table statistics
    const stats = {
      funds: 0,
      transactions: 0,
      contributions: 0,
      friends: 0,
      users: 0,
    };

    if (dbConnected) {
      try {
        const fundCount = await sql`SELECT COUNT(*) as count FROM funds`;
        stats.funds = fundCount[0]?.count || 0;
      } catch (error) {
        console.warn("Error counting funds:", error);
      }

      try {
        const transactionCount =
          await sql`SELECT COUNT(*) as count FROM transactions`;
        stats.transactions = transactionCount[0]?.count || 0;
      } catch (error) {
        console.warn("Error counting transactions:", error);
      }

      try {
        const contributionCount =
          await sql`SELECT COUNT(*) as count FROM contributions`;
        stats.contributions = contributionCount[0]?.count || 0;
      } catch (error) {
        console.warn("Error counting contributions:", error);
      }

      try {
        const friendCount = await sql`SELECT COUNT(*) as count FROM friends`;
        stats.friends = friendCount[0]?.count || 0;
      } catch (error) {
        console.warn("Error counting friends:", error);
      }

      try {
        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        stats.users = userCount[0]?.count || 0;
      } catch (error) {
        console.warn("Error counting users:", error);
      }
    }

    // Run schema validation
    const validation = await validateDatabase();

    return NextResponse.json({
      status: dbConnected ? "healthy" : "disconnected",
      database: {
        connected: dbConnected,
        stats,
      },
      schema: validation,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
