import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    const friendId = params.friendId;
    console.log("Fetching contributions for friend ID:", friendId);

    if (!friendId || isNaN(parseInt(friendId, 10))) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    const friendIdInt = parseInt(friendId, 10);

    // Query to get contributions for a specific friend
    const contributions = await sql`
      SELECT c.*, f.name as friend_name
      FROM contributions c
      LEFT JOIN friends f ON c.friend_id = f.id
      WHERE c.friend_id = ${friendIdInt}
      ORDER BY c.contribution_date DESC
    `;

    console.log(
      `Found ${contributions.length} contributions for friend ID ${friendId}`
    );

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions by friend:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions", details: String(error) },
      { status: 500 }
    );
  }
}
