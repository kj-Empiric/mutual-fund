import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Fund contributions API called with URL:", request.url);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log("Filter params:", { month, year });

    // First, ensure the fund_contributions table exists
    try {
      // Check if fund_contributions table exists
      const contributionsCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'fund_contributions'
        ) as exists
      `;

      if (!contributionsCheck[0]?.exists) {
        console.log("Fund contributions table does not exist, creating it...");
        await sql`
          CREATE TABLE IF NOT EXISTS fund_contributions (
            id SERIAL PRIMARY KEY,
            amount NUMERIC(10, 2) NOT NULL,
            contribution_date DATE NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `;
        console.log("Fund contributions table created successfully");
      } else {
        console.log("Fund contributions table exists");
      }
    } catch (alterError) {
      console.error("Error checking/altering tables:", alterError);
      throw alterError;
    }

    let query = sql`
      SELECT c.*
      FROM fund_contributions c
      WHERE 1=1
    `;

    // Handle month and year filtering
    if (month && month !== "all" && year && year !== "all") {
      const monthInt = parseInt(month, 10);
      const yearInt = parseInt(year, 10);
      console.log("Adding month and year filter:", { monthInt, yearInt });
      query = sql`${query} AND EXTRACT(MONTH FROM c.contribution_date) = ${monthInt}
                AND EXTRACT(YEAR FROM c.contribution_date) = ${yearInt}`;
    } else if (month && month !== "all") {
      const monthInt = parseInt(month, 10);
      console.log("Adding month filter:", monthInt);
      query = sql`${query} AND EXTRACT(MONTH FROM c.contribution_date) = ${monthInt}`;
    } else if (year && year !== "all") {
      const yearInt = parseInt(year, 10);
      console.log("Adding year filter:", yearInt);
      query = sql`${query} AND EXTRACT(YEAR FROM c.contribution_date) = ${yearInt}`;
    }

    // Add order by
    query = sql`${query} ORDER BY c.contribution_date ASC`;
    console.log("Final query built with filters");

    // Execute the query
    const contributions = await query;
    console.log(
      "Query executed successfully, returned",
      contributions.length,
      "results"
    );

    // Calculate cumulative totals
    let cumulativeTotal = 0;
    const contributionsWithCumulativeTotal = contributions.map(
      (contribution: any) => {
        cumulativeTotal += parseFloat(contribution.amount);
        return {
          ...contribution,
          cumulative_total: cumulativeTotal.toFixed(2),
        };
      }
    );

    return NextResponse.json(contributionsWithCumulativeTotal);
  } catch (error) {
    console.error("Error fetching fund contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund contributions", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { amount, contribution_date } = await request.json();

    const result = await sql`
      INSERT INTO fund_contributions (amount, contribution_date)
      VALUES (${amount}, ${contribution_date})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating fund contribution:", error);
    return NextResponse.json(
      { error: "Failed to create fund contribution" },
      { status: 500 }
    );
  }
}
