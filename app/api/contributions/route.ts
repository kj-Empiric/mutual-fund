import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get("friendId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // First, ensure the contributions table has proper columns
    await sql`
      ALTER TABLE contributions DROP COLUMN IF EXISTS fund_id CASCADE;
    `;

    // Build the query dynamically
    const queryParts = [
      `SELECT c.*, f.name as friend_name
       FROM contributions c
       JOIN friends f ON c.friend_id = f.id
       WHERE 1=1`,
    ];

    const params: any[] = [];

    if (friendId && friendId !== "all") {
      queryParts.push(`AND c.friend_id = ${friendId}`);
    }

    if (month && month !== "all" && year) {
      queryParts.push(`AND EXTRACT(MONTH FROM c.contribution_date) = ${month}
                      AND EXTRACT(YEAR FROM c.contribution_date) = ${year}`);
    } else if (month && month !== "all") {
      queryParts.push(`AND EXTRACT(MONTH FROM c.contribution_date) = ${month}`);
    } else if (year) {
      queryParts.push(`AND EXTRACT(YEAR FROM c.contribution_date) = ${year}`);
    }

    queryParts.push(`ORDER BY c.contribution_date DESC`);

    const query = queryParts.join(" ");
    const contributions = await sql([query] as any);

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { friend_id, amount, contribution_date, notes } =
      await request.json();

    const result = await sql`
      INSERT INTO contributions (friend_id, amount, contribution_date, notes)
      VALUES (${friend_id}, ${amount}, ${contribution_date}, ${notes})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }
}
